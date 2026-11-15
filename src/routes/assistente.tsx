import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { AssistantAuth } from "@/components/AssistantAuth";

export const Route = createFileRoute("/assistente")({ component: AssistantLayout });
function AssistantLayout() {
  return <PhoneShell title="Maria da Penha" showBack contentClassName="p-5 flex flex-col"><AssistantAuth>{session => <Suspense key={session.user.id} fallback={<p className="text-muted-foreground">Carregando conversas…</p>}><Outlet /></Suspense>}</AssistantAuth></PhoneShell>;
}