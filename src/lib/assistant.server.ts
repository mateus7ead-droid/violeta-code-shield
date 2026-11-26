import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";
import type { Database, Json } from "@/integrations/supabase/types";
import { createResponsesCall } from "./ai/responses.ts";
import { withLovableAiGatewayRunIdHeader } from "./ai/run-id.ts";

const instructions = `Você é Maria da Penha, assistente de IA do Código Violeta. Seu nome homenageia a luta contra a violência doméstica; você não é a pessoa real Maria da Penha, nem fala em nome dela. Responda em português brasileiro, com acolhimento, clareza, sem culpar a vítima e sem julgamentos. Ajude com dúvidas sobre violência doméstica, feminicídio, Lei Maria da Penha, medidas protetivas e rede de apoio brasileira. Não é Dola nem se apresenta como pessoa humana. Não substitui profissionais, polícia, atendimento jurídico ou psicológico.
Se houver risco imediato, priorize orientações curtas: buscar um local seguro se possível, não confrontar o agressor e ligar 190 (Polícia Militar). Ligue 192 para emergência médica. O Ligue 180 orienta e recebe denúncias de violência contra mulheres; não substitui 190 em emergências. Não afirme que SMS para 190 funciona ou que o aplicativo enviou alertas, chamou polícia, compartilhou localização ou garantiu proteção. Não tem acesso a localização, contatos nem capacidade de enviar mensagens.
Ofereça plano de segurança adaptado, sem pressionar a pessoa a sair ou denunciar e sem prometer sigilo absoluto. Não solicite nome completo, endereço, CPF ou detalhes identificadores desnecessários. Diga que conversas são guardadas na conta e podem ficar visíveis a quem acessa esse aparelho. Não invente serviços, números, endereços, leis ou garantias jurídicas; reconheça incertezas e recomende confirmar canais oficiais. Para Sergipe, oriente a buscar a rede oficial de atendimento e o 180, sem inventar contatos locais. Responda com parágrafos curtos e listas úteis. Não reproduza detalhes gráficos desnecessários. Se a pergunta for fora do assunto, acolha e redirecione para segurança, direitos e apoio.`;

export async function handleAssistant(request: Request) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const aiKey = process.env["LOVABLE_API_KEY"];
  if (!url || !key || !aiKey) return Response.json({ error: "A assistente está sem configuração. Tente mais tarde." }, { status: 503 });
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return Response.json({ error: "Entre na sua conta para conversar." }, { status: 401 });
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => {
    const headers = new Headers(init?.headers); headers.set("apikey", key);
    if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    return fetch(input, { ...init, headers });
  } } });
  const { data: auth, error: authError } = await client.auth.getUser(token);
  if (authError || !auth.user) return Response.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  const userId = auth.user.id;
  let threadId: string; let incoming: UIMessage[];
  try {
    const body = z.object({ threadId: z.string().uuid(), messages: z.array(z.unknown()).min(1) }).parse(await request.json());
    threadId = body.threadId;
    // O chat pode devolver partes auxiliares do SDK (reasoning/step metadata).
    // Para esta assistente, persistimos e processamos apenas texto, evitando
    // rejeitar a segunda pergunta por causa de partes não textuais do histórico.
    const parsed = z.array(z.object({
      id: z.string(),
      role: z.enum(["user", "assistant"]),
      parts: z.array(z.unknown()),
    })).safeParse(body.messages);
    if (!parsed.success) throw new Error("Invalid message shape");
    incoming = parsed.data.map((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts.flatMap((part) => {
        const textPart = z.object({ type: z.literal("text"), text: z.string() }).safeParse(part);
        return textPart.success ? [{ type: "text" as const, text: textPart.data.text }] : [];
      }),
    })).filter((message) => message.parts.length > 0) as UIMessage[];
  } catch { return Response.json({ error: "Mensagem inválida. Escreva sua pergunta novamente." }, { status: 400 }); }
  const thread = await client.from("ai_threads").select("id,title").eq("id", threadId).eq("user_id", userId).single();
  if (thread.error) return Response.json({ error: "Conversa não encontrada." }, { status: 404 });
  const blocked = await client.from("ai_access_state").select("reason,status").eq("user_id", userId).maybeSingle();
  if (blocked.error) return Response.json({ error: "Não foi possível verificar o acesso à assistente." }, { status: 503 });
  if (blocked.data) return Response.json({ error: blocked.data.reason }, { status: blocked.data.status });
  const latest = incoming.at(-1);
  if (!latest || latest.role !== "user") return Response.json({ error: "Escreva uma nova pergunta." }, { status: 400 });
  const stored: UIMessage[] = []; let offset = 0;
  while (true) {
    const rows = await client.from("ai_messages").select("message").eq("thread_id", threadId).eq("user_id", userId).order("created_at").order("id").range(offset, offset + 499);
    if (rows.error) return Response.json({ error: "Não foi possível carregar a conversa." }, { status: 503 });
    stored.push(...rows.data.map(r => r.message as unknown as UIMessage));
    if (rows.data.length < 500) break; offset += 500;
  }
  const messages = [...stored.filter(m => m.id !== latest.id), latest];
  const saved = await client.from("ai_messages").upsert({ user_id: userId, thread_id: threadId, sdk_id: latest.id, message: latest as unknown as Json }, { onConflict: "thread_id,sdk_id" });
  if (saved.error) return Response.json({ error: "Sua pergunta não pôde ser guardada. Tente novamente." }, { status: 503 });
  const title = latest.parts.filter(p => p.type === "text").map(p => p.text).join(" ").slice(0, 70);
  const updated = await client.from("ai_threads").update({ updated_at: new Date().toISOString(), ...(thread.data.title === "Nova conversa" ? { title } : {}) }).eq("id", threadId).eq("user_id", userId);
  if (updated.error) return Response.json({ error: "Não foi possível atualizar a conversa." }, { status: 503 });
  try {
    // Intercept upstream errors before returning streaming headers, preserving safe reasons and status.
    let upstreamFailure: { status: number; reason: string } | undefined;
    // The incoming body was already consumed by request.json(). Only headers and
    // the abort signal are needed by the gateway; copying its body throws.
    const monitoredRequest = new Request(request.url, { headers: request.headers, signal: request.signal });
    const call = createResponsesCall(monitoredRequest, { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: aiKey, model: "openai/gpt-6-astra" }, await convertToModelMessages(messages.map(m => ({ ...m, parts: m.parts.filter(p => p.type === "text") }))), instructions);
    const iterator = call.result.fullStream[Symbol.asyncIterator]();
    // Wait only for the first upstream event, never the completed answer.
    const first = await iterator.next();
    if (first.value?.type === "error") {
      const e = first.value.error as { statusCode?: number; responseBody?: string; message?: string };
      let reason = "A assistente não conseguiu responder. Tente mais tarde.";
      try { const body = JSON.parse(e.responseBody ?? "{}"); reason = body.message ?? body.error?.message ?? reason; } catch { /* safe fallback */ }
      upstreamFailure = { status: e.statusCode ?? 503, reason };
    }
    // stream-start can precede upstream HTTP, so inspect until the first provider event/error.
    while (!upstreamFailure && first.value?.type === "start") {
      const next = await iterator.next();
      if (next.done) break;
      if (next.value.type === "error") {
        const e = next.value.error as { statusCode?: number; responseBody?: string };
        let reason = "A assistente não conseguiu responder. Tente mais tarde.";
        try { const body = JSON.parse(e.responseBody ?? "{}"); reason = body.message ?? body.error?.message ?? reason; } catch { /* safe fallback */ }
        upstreamFailure = { status: e.statusCode ?? 503, reason }; break;
      }
      if (!["start-step"].includes(next.value.type)) break;
    }
    if (upstreamFailure) {
      if (upstreamFailure.status === 403 || upstreamFailure.status === 402) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const pause = await supabaseAdmin.from("ai_access_state").upsert({ user_id: userId, ...{ reason: upstreamFailure.reason, status: upstreamFailure.status } });
        if (pause.error) console.error("Could not persist AI access block");
      }
      return Response.json({ error: upstreamFailure.reason }, { status: upstreamFailure.status });
    }
    return withLovableAiGatewayRunIdHeader(call.result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: true,
      onError: () => "A resposta foi interrompida. Tente novamente mais tarde.",
      onFinish: async ({ responseMessage, isAborted }) => {
        if (isAborted && responseMessage.parts.length === 0) return;
        const result = await client.from("ai_messages").upsert({ user_id: userId, thread_id: threadId, sdk_id: responseMessage.id, message: responseMessage as unknown as Json }, { onConflict: "thread_id,sdk_id" });
        if (result.error) throw new Error("A resposta não pôde ser guardada. Não feche esta conversa antes de copiar o que precisar.");
      },
    }), call.gateway, { "Cache-Control": "no-store" });
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    console.error("Assistant request failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "Não foi possível responder agora. Tente mais tarde." }, { status: 503 });
  }
}