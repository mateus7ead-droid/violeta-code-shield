import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Plus, ShieldCheck } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/contatos")({
  head: () => ({ meta: [{ title: "Contatos de Confiança — Código Violeta" }] }),
  component: Contatos,
});

const contatos = [
  { name: "Mãe", phone: "(11) 99999-1111", initial: "M" },
  { name: "Melhor amiga", phone: "(11) 98888-2222", initial: "A" },
  { name: "Irmã", phone: "(11) 97777-3333", initial: "I" },
  { name: "Primo João", phone: "(11) 96666-4444", initial: "J" },
];

function Contatos() {
  return (
    <PhoneShell
      title="Contatos de Confiança"
      showBack
      rightSlot={
        <button aria-label="Adicionar" className="text-primary-foreground">
          <Plus size={22} />
        </button>
      }
    >
      <p className="text-sm text-foreground/80 mb-4">
        Adicione pessoas de confiança que receberão seu alerta.
      </p>
      <ul className="space-y-3">
        {contatos.map((c) => (
          <li
            key={c.name}
            className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold">
              {c.initial}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.phone}</p>
            </div>
            <button aria-label="Ligar" className="text-primary p-2">
              <Phone size={20} />
            </button>
            <button aria-label="Mensagem" className="text-primary p-2">
              <MessageCircle size={20} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="text-primary mt-0.5" size={20} />
        <p className="text-xs text-foreground/80">
          Seus contatos receberão sua localização e uma mensagem de alerta.
        </p>
      </div>
    </PhoneShell>
  );
}
