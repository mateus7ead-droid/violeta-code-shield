import { createFileRoute } from "@tanstack/react-router";
import { MapPin, RefreshCw } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/localizacao")({
  head: () => ({ meta: [{ title: "Localização — Código Violeta" }] }),
  component: Localizacao,
});

function Localizacao() {
  return (
    <PhoneShell title="Localização em tempo real" showBack contentClassName="p-0 flex flex-col">
      <div className="relative flex-1 min-h-[55vh] bg-[linear-gradient(135deg,#e8f0e4_25%,transparent_25%),linear-gradient(225deg,#e8f0e4_25%,transparent_25%),linear-gradient(45deg,#e8f0e4_25%,transparent_25%),linear-gradient(315deg,#e8f0e4_25%,#f5f5ef_25%)] bg-[length:40px_40px] bg-[#f5f5ef]">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card shadow-md rounded-lg px-4 py-2 text-xs text-center text-foreground/80 w-64">
          Sua localização está sendo compartilhada
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full bg-primary/20 animate-pulse" />
          <div className="absolute w-20 h-20 rounded-full bg-primary/30" />
          <MapPin className="relative text-primary fill-primary" size={48} />
        </div>
      </div>
      <div className="bg-card p-5 rounded-t-2xl -mt-4 relative shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.1)]">
        <h3 className="font-bold text-foreground">Localização atual</h3>
        <p className="text-sm text-muted-foreground mt-1">Rua das Flores, 123</p>
        <p className="text-sm text-muted-foreground">Bairro Centro – São Paulo/SP</p>
        <button className="mt-4 w-full border border-primary text-primary font-semibold py-2.5 rounded-full flex items-center justify-center gap-2">
          ATUALIZAR LOCALIZAÇÃO <RefreshCw size={16} />
        </button>
      </div>
      <button className="bg-primary text-primary-foreground font-semibold py-4 m-5 rounded-xl shadow-md">
        COMPARTILHAR
      </button>
    </PhoneShell>
  );
}
