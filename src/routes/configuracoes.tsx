import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellOff, Image as ImageIcon, Lock, Trash2, Info, ChevronRight } from "lucide-react";
import { useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Código Violeta" }] }),
  component: Configuracoes,
});

function Configuracoes() {
  const [discreto, setDiscreto] = useState(true);
  const navigate = useNavigate();

  return (
    <PhoneShell title="Configurações" showBack>
      <div className="bg-card border border-border rounded-xl divide-y divide-border shadow-sm">
        <Row
          icon={BellOff}
          title="Modo discreto"
          sub="Oculta notificações e ícone do app"
          right={
            <button
              onClick={() => setDiscreto((v) => !v)}
              aria-label="Alternar modo discreto"
              className={`w-11 h-6 rounded-full transition-colors ${
                discreto ? "bg-primary" : "bg-muted-foreground/30"
              } relative`}
            >
              <span
                className={`absolute top-0.5 ${
                  discreto ? "left-5" : "left-0.5"
                } w-5 h-5 rounded-full bg-white transition-all`}
              />
            </button>
          }
        />
        <Row icon={ImageIcon} title="Trocar ícone do app" sub="Ícone discreto" />
        <Row icon={Lock} title="PIN de segurança" sub="Ativar bloqueio do app" />
        <Row icon={Trash2} title="Excluir meus dados" sub="Apaga todas as suas informações" />
        <Row icon={Info} title="Sobre o app" sub="Versão 1.0.0" />
      </div>

      <button
        onClick={() => navigate({ to: "/" })}
        className="mt-10 w-full border-2 border-primary text-primary font-semibold py-3.5 rounded-full"
      >
        SAIR DO APP
      </button>
    </PhoneShell>
  );
}

function Row({
  icon: Icon,
  title,
  sub,
  right,
}: {
  icon: typeof BellOff;
  title: string;
  sub: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="text-primary" size={20} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      {right ?? <ChevronRight className="text-muted-foreground" size={18} />}
    </div>
  );
}
