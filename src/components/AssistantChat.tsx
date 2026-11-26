import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { suggestedQuestions } from "@/lib/assistant";

export function AssistantChat({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[];
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const cache = useQueryClient();
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          const headers = new Headers();
          if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
          return headers;
        },
        fetch: async (url, init) => {
          const response = await fetch(url, init);
          if (!response.ok) {
            const body = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(body?.error ?? "Não foi possível conectar à assistente.");
          }
          return response;
        },
      }),
    [threadId],
  );
  const { messages, status, sendMessage, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => setError(e.message),
    onFinish: () => {
      void cache.invalidateQueries({ queryKey: ["assistant-threads"] });
      void cache.invalidateQueries({ queryKey: ["assistant-thread", threadId] });
    },
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus({ preventScroll: true });
  }, [threadId]);
  const send = (value: string) => {
    if (!value.trim() || busy) return;
    setError("");
    setText("");
    void sendMessage({ text: value.trim() });
    input.current?.focus();
  };
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-64 flex-1">
        <ConversationContent className="px-0 py-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">O que você gostaria de conversar?</h2>
              <div className="grid gap-2">
                {suggestedQuestions.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    className="h-auto whitespace-normal justify-start py-3 text-left"
                    onClick={() => send(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent
                className={
                  message.role === "user"
                    ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                    : ""
                }
              >
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <MessageResponse key={index}>{part.text}</MessageResponse>
                  ) : part.type === "reasoning" && part.text ? (
                    <Reasoning
                      key={index}
                      defaultOpen={false}
                      isStreaming={busy && message.id === messages.at(-1)?.id}
                    >
                      <ReasoningTrigger>Reflexão</ReasoningTrigger>
                      <ReasoningContent>{part.text}</ReasoningContent>
                    </Reasoning>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer>Preparando uma resposta…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {error && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <PromptInput onSubmit={({ text: value }) => send(value)}>
        <PromptInputTextarea
          ref={input}
          aria-label="Sua pergunta"
          placeholder="Escreva sua pergunta…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-24"
        />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit
            aria-label={busy ? "Parar resposta" : "Enviar pergunta"}
            status={status}
            onStop={stop}
            disabled={!busy && !text.trim()}
            className="size-9"
          />
        </PromptInputFooter>
      </PromptInput>
      <p className="mt-2 text-xs text-muted-foreground">
        Você pode enviar várias mensagens e continuar nesta mesma conversa; o histórico fica salvo na sua conta.\n        Sou uma IA, não a pessoa real Maria da Penha. Posso errar e não substituo atendimento\n        profissional. Em risco imediato, ligue 190.
      </p>
    </div>
  );
}
