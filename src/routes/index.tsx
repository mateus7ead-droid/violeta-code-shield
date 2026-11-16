import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import logo from "@/assets/logo-codigo-violeta.png.asset.json";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/lib/auth-context";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/")({
  head: () => pageHead("Entrar", "Acesse sua conta no Código Violeta. Apoio e informação contra a violência doméstica, com SOS acessível sem login."),
  component: Splash,
});

function Splash() {
  const { session, ready } = useAppAuth();
  const navigate = useNavigate();
  useEffect(() => { if (ready && session) void navigate({ to: "/inicio", replace: true }); }, [ready, session, navigate]);
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary-dark text-primary-foreground px-6 py-7 text-center"><img src={logo.url} alt="" className="mx-auto size-24 object-contain" /><h1 className="mt-3 text-3xl font-bold">CÓDIGO VIOLETA</h1><p className="mt-2 text-sm">Um toque pode salvar vidas.</p></header>
      <main className="mx-auto max-w-sm px-5 py-6">{!ready || session ? <p role="status" className="text-center">Carregando sua conta…</p> : <LoginForm />}
        <div className="mt-6 border-t border-border pt-5 space-y-2"><Button asChild variant="destructive" className="w-full"><Link to="/sos">SOS — Emergência</Link></Button><Button asChild variant="ghost" className="w-full"><Link to="/inicio">Continuar sem conta</Link></Button></div>
        <Button asChild variant="link" className="mt-2 w-full"><Link to="/sobre">Sobre o Código Violeta</Link></Button>
      </main>
    </div>
  );
}
