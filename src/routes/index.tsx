import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo-codigo-violeta.png.asset.json";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/lib/auth-context";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/")({
  head: () => pageHead("Código Violeta", "Um toque pode salvar vidas."),
  component: Splash,
});

function Splash() {
  const { session, ready } = useAppAuth();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (ready && session) void navigate({ to: "/inicio", replace: true });
  }, [ready, session, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-white text-center"
      style={{ background: "linear-gradient(145deg, #250044 0%, #4b087c 48%, #7625a5 100%)" }}>
      <div className="w-full max-w-sm">
        <img src={logo.url} alt="Símbolo do Código Violeta" className="mx-auto size-36 object-contain drop-shadow-xl" />
        <h1 className="mt-5 text-3xl font-extrabold tracking-[0.12em]">CÓDIGO VIOLETA</h1>
        <p className="mt-3 text-base text-white/90">Um toque pode salvar vidas.</p>

        {!started ? (
          <div className="mt-12 space-y-4">
            <Button onClick={() => setStarted(true)}
              className="w-full h-14 rounded-full bg-white text-purple-900 text-lg font-bold hover:bg-white/90">
              Começar
            </Button>
            <Button asChild variant="outline" className="w-full h-12 rounded-full border-white/60 bg-white/10 text-white hover:bg-white/20">
              <Link to="/sos">SOS — Emergência</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-9 rounded-2xl bg-white p-5 text-left text-slate-900 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-purple-950">Conectar sua conta</h2>
              <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>Voltar</Button>
            </div>
            {!ready ? <p className="text-center text-sm">Carregando…</p> : <LoginForm />}
            <Button asChild variant="destructive" className="mt-5 w-full">
              <Link to="/sos">SOS — Emergência</Link>
            </Button>
          </div>
        )}
        <p className="mt-8 text-xs text-white/70">Apoio, informação e segurança.</p>
      </div>
    </div>
  );
}
