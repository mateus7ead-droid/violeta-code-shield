import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/contatos")({
  head: () => ({ meta: [{ title: "Contatos de Confiança — Código Violeta" }] }),
  component: Contatos,
});

type Contato = { name: string; phone: string };

const DEFAULTS: Contato[] = [
  { name: "Mãe", phone: "(79) 99999-1111" },
  { name: "Melhor amiga", phone: "(79) 98888-2222" },
  { name: "Irmã", phone: "(79) 97777-3333" },
  { name: "Primo João", phone: "(79) 96666-4444" },
];

function Contatos() {
  const [contatos, setContatos] = useState<Contato[]>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cv:contatos");
      if (raw) setContatos(JSON.parse(raw));
    } catch {}
  }, []);

  const remove = (i: number) => {
    const next = contatos.filter((_, idx) => idx !== i);
    setContatos(next);
    localStorage.setItem("cv:contatos", JSON.stringify(next));
  };

  return (
    <PhoneShell title="Contatos de Confiança" showBack>
      <p className="text-sm text-foreground/80 mb-4">
        Adicione pessoas de confiança que receberão seu alerta.
      </p>
      <ul className="space-y-3">
        {contatos.map((c, i) => (
          <li
            key={`${c.name}-${i}`}
            className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground truncate">{c.phone}</p>
            </div>
            <a href={`tel:${c.phone}`} aria-label="Ligar" className="text-primary p-2">
              <Phone size={20} />
            </a>
            <a href={`sms:${c.phone}`} aria-label="Mensagem" className="text-primary p-2">
              <MessageCircle size={20} />
            </a>
            <button aria-label="Remover" onClick={() => remove(i)} className="text-sos p-2">
              <Trash2 size={18} />
            </button>
          </li>
        ))}
        {contatos.length === 0 && (
          <li className="text-center text-sm text-muted-foreground py-8">
            Nenhum contato. Toque em + para adicionar.
          </li>
        )}
      </ul>

      <div className="flex justify-center mt-5">
        <Link
          to="/contato-novo"
          aria-label="Adicionar contato"
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus size={30} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="text-primary mt-0.5" size={20} />
        <p className="text-xs text-foreground/80">
          Seus contatos receberão sua localização e uma mensagem de alerta.
        </p>
      </div>
    </PhoneShell>
  );
}
