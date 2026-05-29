import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellOff, Image as ImageIcon, Lock, Trash2, Info, ChevronRight, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Código Violeta" }] }),
  component: Configuracoes,
});

const ICON_OPTIONS: { id: string; label: string; emoji?: string; img?: string; bg: string }[] = [
  { id: "violeta", label: "Código Violeta", img: logo, bg: "bg-primary-soft" },
  { id: "calc", label: "Calculadora", emoji: "🧮", bg: "bg-slate-700" },
  { id: "notas", label: "Notas", emoji: "📝", bg: "bg-amber-500" },
  { id: "clima", label: "Clima", emoji: "☀️", bg: "bg-sky-500" },
  { id: "relogio", label: "Relógio", emoji: "⏰", bg: "bg-zinc-800" },
  { id: "musica", label: "Música", emoji: "🎵", bg: "bg-pink-500" },
  { id: "fotos", label: "Fotos", emoji: "🖼️", bg: "bg-emerald-500" },
  { id: "saude", label: "Saúde", emoji: "❤️", bg: "bg-rose-500" },
];
  { id: "calc", label: "Calculadora", emoji: "🧮", bg: "bg-slate-700" },
  { id: "notas", label: "Notas", emoji: "📝", bg: "bg-amber-500" },
  { id: "clima", label: "Clima", emoji: "☀️", bg: "bg-sky-500" },
  { id: "relogio", label: "Relógio", emoji: "⏰", bg: "bg-zinc-800" },
  { id: "musica", label: "Música", emoji: "🎵", bg: "bg-pink-500" },
  { id: "fotos", label: "Fotos", emoji: "🖼️", bg: "bg-emerald-500" },
  { id: "saude", label: "Saúde", emoji: "❤️", bg: "bg-rose-500" },
];

function Configuracoes() {
  const [discreto, setDiscreto] = useState(true);
  const [iconOpen, setIconOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("violeta");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("cv:appIcon");
    if (saved) setSelectedIcon(saved);
  }, []);

  const pickIcon = (id: string) => {
    setSelectedIcon(id);
    localStorage.setItem("cv:appIcon", id);
    setIconOpen(false);
  };

  const currentIcon = ICON_OPTIONS.find((i) => i.id === selectedIcon) ?? ICON_OPTIONS[0];

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
        <button onClick={() => setIconOpen(true)} className="w-full text-left">
          <Row
            icon={ImageIcon}
            title="Trocar ícone do app"
            sub={`Atual: ${currentIcon.label}`}
            right={
              <div className={`w-8 h-8 rounded-lg ${currentIcon.bg} flex items-center justify-center text-base`}>
                {currentIcon.emoji}
              </div>
            }
          />
        </button>
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

      <Dialog open={iconOpen} onOpenChange={setIconOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Escolher ícone do app</DialogTitle>
            <DialogDescription>
              Selecione um ícone discreto para disfarçar o app na sua tela inicial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 pt-2">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => pickIcon(opt.id)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`relative w-14 h-14 rounded-2xl ${opt.bg} flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-105 ${
                    selectedIcon === opt.id ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                >
                  {opt.emoji}
                  {selectedIcon === opt.id && (
                    <span className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                      <Check size={12} className="text-primary-foreground" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-center text-foreground/80 leading-tight">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
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
