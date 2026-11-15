import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, LogOut } from "lucide-react";
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
  return <section className="space-y-3">
    <div className="flex items-center justify-between gap-2">
      <Button disabled={busy} onClick={async () => {
        setBusy(true); setError("");
        try { const thread = await create(); await cache.invalidateQueries({ queryKey: threadsOptions.queryKey }); await navigate({ to: "/assistente/$threadId", params: { threadId: thread.id } }); }
        catch { setError("Não foi possível iniciar uma conversa."); } finally { setBusy(false); }
      }}><Plus size={16} />Nova conversa</Button>
      <Button variant="ghost" size="icon" title="Sair da conta" aria-label="Sair da conta" onClick={async () => { await supabase.auth.signOut(); cache.removeQueries({ queryKey: threadsOptions.queryKey }); cache.removeQueries({ queryKey: ["assistant-thread"] }); }}><LogOut size={18} /></Button>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="max-h-40 overflow-y-auto space-y-1">
      {threads.map(thread => <div key={thread.id} className={`flex items-center gap-1 rounded-lg ${activeId === thread.id ? "bg-primary-soft" : ""}`}>
        <Button variant="ghost" asChild className="flex-1 min-w-0 justify-start"><Link to="/assistente/$threadId" params={{ threadId: thread.id }}><span className="truncate">{thread.title}</span></Link></Button>
        <Button variant="ghost" size="icon" aria-label={`Excluir conversa ${thread.title}`} title="Excluir conversa" onClick={async () => {
          if (!window.confirm("Excluir esta conversa e todas as mensagens?")) return;
          try { await remove({ data: { threadId: thread.id } }); await cache.invalidateQueries({ queryKey: threadsOptions.queryKey }); cache.removeQueries({ queryKey: ["assistant-thread", thread.id] }); if (activeId === thread.id) await navigate({ to: "/assistente" }); }
          catch { setError("Não foi possível excluir esta conversa."); }
        }}><Trash2 size={16} /></Button>
      </div>)}
    </div>
  </section>;
}