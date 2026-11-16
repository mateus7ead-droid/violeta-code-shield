import { type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Link } from "@tanstack/react-router";
import { useAppAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function AssistantAuth({ children }: { children: (session: Session) => ReactNode }) {
  const { session, ready } = useAppAuth();
  if (!ready) return <p className="p-6 text-muted-foreground">Carregando sua conta…</p>;
  if (session) return children(session);
  return <div className="mx-auto max-w-sm py-8 text-center"><p className="mb-4">Entre na sua conta para conversar com Maria da Penha.</p><Button asChild><Link to="/">Entrar na conta</Link></Button><Button asChild variant="outline" className="ml-2"><Link to="/sos">SOS</Link></Button></div>;
}