import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { AssistantThreads } from "@/components/AssistantThreads";
import { AssistantChat } from "@/components/AssistantChat";
import { loadThread } from "@/lib/assistant.functions";
import { pageHead } from "@/lib/page-head";
import type { UIMessage } from "ai";
export const Route = createFileRoute("/assistente/$threadId")({ head: () => pageHead("Conversa com Maria da Penha", "Converse com a assistente de IA do Código Violeta sobre segurança, direitos e apoio."), component: ThreadPage });
function ThreadPage() {
  const { threadId } = Route.useParams();
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["assistant-thread", threadId], queryFn: () => loadThread({ data: { threadId } }) }));
  return <div className="mx-auto flex w-full max-w-2xl min-h-[75dvh] flex-1 flex-col gap-3"><AssistantThreads activeId={threadId} /><div className="border-t border-border" /><AssistantChat key={threadId} threadId={threadId} initialMessages={JSON.parse(data.messagesJson) as UIMessage[]} /></div>;
}