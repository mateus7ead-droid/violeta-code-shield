import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { UIMessage } from "ai";

const threadInput = z.object({ threadId: z.string().uuid() });

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("ai_threads").select("id,title,updated_at").eq("user_id", context.userId).order("updated_at", { ascending: false });
    if (error) throw new Error("Não foi possível carregar suas conversas.");
    return data;
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("ai_threads").insert({ user_id: context.userId }).select("id").single();
    if (error) throw new Error("Não foi possível iniciar a conversa.");
    return data;
  });

export const loadThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth]).inputValidator(threadInput)
  .handler(async ({ data: input, context }) => {
    const thread = await context.supabase.from("ai_threads").select("id,title").eq("id", input.threadId).eq("user_id", context.userId).single();
    if (thread.error) throw new Error("Conversa não encontrada.");
    const rows = []; let offset = 0;
    while (true) {
      const { data, error } = await context.supabase.from("ai_messages").select("message").eq("thread_id", input.threadId).eq("user_id", context.userId).order("created_at").order("id").range(offset, offset + 499);
      if (error) throw new Error("Não foi possível carregar as mensagens.");
      rows.push(...data);
      if (data.length < 500) break;
      offset += 500;
    }
    return { thread: thread.data, messages: rows.map(row => row.message as unknown as UIMessage) };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator(threadInput)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("ai_threads").delete().eq("id", data.threadId).eq("user_id", context.userId);
    if (error) throw new Error("Não foi possível excluir a conversa.");
    return { ok: true };
  });