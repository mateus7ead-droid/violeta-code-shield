import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, RefreshCw, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/localizacao")({
  head: () => pageHead("Localização", "Consulte sua localização e compartilhe um link com pessoas de confiança."),
  component: Localizacao,
});

// Monte Alegre de Sergipe — centro aproximado
const DEFAULT = { lat: -10.0297, lon: -37.5594, label: "Centro — Monte Alegre de Sergipe – SE" };

function Localizacao() {
  const [coords, setCoords] = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const delta = 0.02;
  const bbox = `${coords.lon - delta},${coords.lat - delta},${coords.lon + delta},${coords.lat + delta}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lon}`;

  const refresh = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("Geolocalização não suportada neste dispositivo.");
      return;
    }
    setLoading(true);
    setStatus(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
          label: "Sua localização atual",
        });
        setLoading(false);
      },
      (err) => {
        setStatus(err.message || "Não foi possível obter a localização.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const watchId = useRef<number | null>(null);
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("Geolocalização não suportada neste dispositivo.");
      return;
    }

    const stopWatching = () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };

    const startWatching = () => {
      stopWatching();
      if (document.visibilityState !== "visible") return;
      setLoading(true);
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lon: Number(pos.coords.longitude.toFixed(4)),
            label: "Última localização recebida enquanto o app estava aberto",
          });
          setLoading(false);
          setStatus(null);
        },
        (err) => {
          setStatus(err.message || "Não foi possível obter a localização.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopWatching();
        setStatus("Rastreamento pausado: o navegador suspende a localização em segundo plano. Ao voltar ao app, a atualização será retomada.");
        setLoading(false);
      } else {
        startWatching();
      }
    };

    startWatching();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopWatching();
    };
  }, []);

  const share = async () => {
    const text = `Preciso de ajuda. Minha localização: ${mapsUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Minha localização", text, url: mapsUrl });
        setStatus("Localização compartilhada.");
        return;
      }
      await navigator.clipboard.writeText(text);
      setStatus("Link copiado para a área de transferência.");
    } catch {
      setStatus("Compartilhamento cancelado.");
    }
  };

  return (
    <PhoneShell title="Localização em tempo real" showBack contentClassName="p-0 flex flex-col">
      <div className="relative flex-1 min-h-[55vh] bg-muted">
        <iframe
          title="Mapa"
          src={mapSrc}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
        />
      </div>
      <div className="bg-card p-5 rounded-t-2xl -mt-4 relative shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.1)] z-10">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <MapPin size={18} className="text-primary" /> Localização atual
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{coords.label}</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Lat: {coords.lat} · Lon: {coords.lon}
        </p>
        {status && <p className="text-xs text-primary mt-2">{status}</p>}
        <button
          onClick={refresh}
          disabled={loading}
          className="mt-4 w-full border border-primary text-primary font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? "OBTENDO LOCALIZAÇÃO..." : "ATUALIZAR LOCALIZAÇÃO"}
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <button
        onClick={share}
        className="bg-primary text-primary-foreground font-semibold py-4 m-5 rounded-xl shadow-md flex items-center justify-center gap-2"
      >
        <Share2 size={18} /> COMPARTILHAR
      </button>
    </PhoneShell>
  );
}
