import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo-codigo-violeta.png.asset.json";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/")({
  head: () => pageHead("Código Violeta", "Um toque pode salvar vidas."),
  component: Splash,
});

function Splash() {
  const [started, setStarted] = useState(false);
  const [learnMore, setLearnMore] = useState(false);

  return (
    <main className="min-h-[100svh] flex flex-col items-center justify-center px-6 py-10 text-white text-center"
      style={{ background: "#351766" }}>
      <div className="w-full max-w-sm flex flex-col items-center">
        <img src={logo.url} alt="Símbolo do Código Violeta"
          className="w-44 h-44 object-contain drop-shadow-xl" />
        <h1 className="mt-12 text-[2.65rem] leading-[1.35] font-semibold tracking-[0.035em]">
          CÓDIGO<br />VIOLETA
        </h1>
        <p className="mt-8 text-xl text-white/85">Um toque pode salvar vidas.</p>

        {!started ? (
          <div className="mt-32 w-full">
            <Button onClick={() => setStarted(true)}
              className="w-full h-[5.25rem] rounded-full text-[1.65rem] font-medium tracking-wide text-white shadow-lg"
              style={{ background: "#6537b4" }}>
              COMEÇAR
            </Button>
            <button type="button" onClick={() => setLearnMore((value) => !value)}
              className="mt-10 text-lg text-white/90 underline underline-offset-4">
              Saiba mais
            </button>
            {learnMore && (
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                O Código Violeta é um espaço de informação, acolhimento e apoio para prevenção da violência doméstica e do feminicídio.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-12 w-full rounded-2xl bg-white p-5 text-left text-slate-900 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-purple-950">Conectar sua conta</h2>
              <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>Voltar</Button>
            </div>
            <LoginForm />
            <Button asChild variant="destructive" className="mt-5 w-full">
              <Link to="/sos">SOS — Emergência</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
