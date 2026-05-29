import { createFileRoute } from "@tanstack/react-router";
import {
  User,
  Scale,
  HandHelping,
  MapPin,
  Phone,
  HelpCircle,
  ChevronRight,
  Heart,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/informacoes")({
  head: () => ({ meta: [{ title: "Informações e Ajuda — Código Violeta" }] }),
  component: Informacoes,
});

const items = [
  { icon: User, label: "O que é violência doméstica?" },
  { icon: Scale, label: "Seus direitos" },
  { icon: HandHelping, label: "Como pedir ajuda" },
  { icon: MapPin, label: "Onde buscar ajuda" },
  { icon: Phone, label: "Canais oficiais de denúncia" },
  { icon: HelpCircle, label: "Perguntas frequentes" },
];

function Informacoes() {
  return (
    <PhoneShell title="Informações e Ajuda" showBack>
      <ul className="space-y-3">
        {items.map(({ icon: Icon, label }) => (
          <li key={label}>
            <button className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:bg-primary-soft transition-colors">
              <Icon className="text-primary" size={20} />
              <span className="flex-1 text-left text-sm font-medium text-foreground">{label}</span>
              <ChevronRight className="text-muted-foreground" size={18} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <Heart className="text-primary fill-primary/30" size={22} />
        <p className="text-xs text-foreground/80">
          Você não está sozinha.
          <br />
          Peça ajuda. Ligue 180.
        </p>
      </div>
    </PhoneShell>
  );
}
