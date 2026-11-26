import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2, LogOut, MessageCirclePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createThread, deleteThread, listThreads } from "@/lib/assistant.functions";
import { Button } from "@/components/ui/button";

export const threadsOptions = queryOptions({ queryKey: ["assistant-threads"], queryFn: () => listThreads() });

export function AssistantThreads({ activeId }: { activeId?: string }) {
  const { data: threads } = useSuspenseQuery(threadsOptions);
  const create = useServerFn(createThread);
  const remove = useServerFn(deleteThread);
  const navigate = useNavigate();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const startConversation = async () => {
    setBusy(true); setError("");
    try {
      const thread = await create();
      await cache.invalidateQueries({ queryKey: threadsOptions.queryKey });
      await navigate({ to: "/assistente/$threadId", params: { threadId: thread.id } });
    } catch {
      setError("Não foi possível iniciar uma conversa.");
    } finally {
      setBusy(false);
    }
  };

  return <section className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-semibold">Histórico de conversas</p>
      <Button variant="ghost" size="icon" title="Sair da conta" aria-label="Sair da conta" onClick={async () => {
        await cache.cancelQueries(); cache.clear();
        const { error } = await supabase.auth.signOut();
        if (!error) await navigate({ to: "/", replace: true });
      }}><LogOut size={18} /></Button>
    </div>
    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
      {threads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Você ainda não tem conversas. Inicie uma nova conversa abaixo.
        </p>
      ) : threads.map(thread => (
        <div key={thread.id} className={`flex items-center gap-1 rounded-xl border p-2 ${activeId === thread.id ? "border-primary bg-primary-soft" : "border-border"}`}>
          <Button variant="ghost" asChild className="h-auto min-h-12 flex-1 min-w-0 justify-start px-2 py-2">
            <Link to="/assistente/$threadId" params={{ threadId: thread.id }}>
              <span className="min-w-0 text-left">
                <span className="block truncate font-medium">{thread.title || "Nova conversa"}</span>
                <span className="block text-xs text-muted-foreground">{new Date(thread.updated_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
              </span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Excluir conversa ${thread.title}`} title="Excluir conversa" onClick={async () => {
            if (!window.confirm("Excluir esta conversa e todas as mensagens?")) return;
            try {
              await remove({ data: { threadId: thread.id } });
              await cache.invalidateQueries({ queryKey: threadsOptions.queryKey });
              cache.removeQueries({ queryKey: ["assistant-thread", thread.id] });
              if (activeId === thread.id) await navigate({ to: "/assistente" });
            } catch { setError("Não foi possível excluir a conversa."); }
          }}><Trash2 size={16} /></Button>
        </div>
      ))}
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button disabled={busy} onClick={startConversation}
      className="mt-2 h-14 w-full rounded-xl text-base font-bold shadow-md">
      <MessageCirclePlus size={23} /> {busy ? "Iniciando conversa…" : "INICIAR NOVA CONVERSA"}
    </Button>
  </section>;
}
