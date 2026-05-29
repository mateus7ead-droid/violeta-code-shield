import { createFileRoute } from "@tanstack/react-router";
import { MapPin, RefreshCw } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/localizacao")({
  head: () => ({ meta: [{ title: "Localização — Código Violeta" }] }),
  component: Localizacao,
});

function Localizacao() {
  // Monte Alegre de Sergipe — coordenadas aproximadas do centro
  const lat = -10.0297;
  const lon = -37.5594;
  const delta = 0.02;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <PhoneShell title="Localização em tempo real" showBack contentClassName="p-0 flex flex-col">
      <div className="relative flex-1 min-h-[55vh] bg-muted">
        <iframe
          title="Mapa - Monte Alegre de Sergipe"
          src={mapSrc}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
        />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card shadow-md rounded-lg px-4 py-2 text-xs text-center text-foreground/80 w-64 z-10">
          Sua localização está sendo compartilhada
        </div>
      </div>
      <div className="bg-card p-5 rounded-t-2xl -mt-4 relative shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.1)] z-10">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <MapPin size={18} className="text-primary" /> Localização atual
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Centro</p>
        <p className="text-sm text-muted-foreground">Monte Alegre de Sergipe – SE</p>
        <p className="text-xs text-muted-foreground/80 mt-1">Lat: {lat} · Lon: {lon}</p>
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
