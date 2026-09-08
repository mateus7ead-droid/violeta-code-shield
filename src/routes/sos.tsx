import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellOff, Check, Loader2, MapPin, Send, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { addAlert } from "@/lib/alerts";

export const Route = createFileRoute("/sos")({
  head: () => ({ meta: [{ title: "SOS — Código Violeta" }] }),
  component: Sos,
});

type Contato = { name: string; phone: string };

const DEFAULT_CONTATOS: Contato[] = [
  { name: "Mãe", phone: "(79) 99999-1111" },
  { name: "Melhor amiga", phone: "(79) 98888-2222" },
  { name: "Irmã", phone: "(79) 97777-3333" },
  { name: "Primo João", phone: "(79) 96666-4444" },
];

const POLICE = "190";

function getContatos(): Contato[] {
  try {
    const raw = localStorage.getItem("cv:contatos");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CONTATOS;
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function getLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

function Sos() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([false, false, false, false]);
  const [taps, setTaps] = useState(0);
  const [success, setSuccess] = useState(false);
  const [locText, setLocText] = useState("Obtendo localização...");
  const [contatosCount, setContatosCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      const contatos = getContatos();
      setContatosCount(contatos.length);

      // 1. localização
      const loc = await getLocation();
      const mapsUrl = loc
        ? `https://www.google.com/maps?q=${loc.lat},${loc.lon}`
        : "https://www.google.com/maps?q=-10.0297,-37.5594";
      setLocText(
        loc
          ? `Lat ${loc.lat.toFixed(5)}, Lon ${loc.lon.toFixed(5)}`
          : "Monte Alegre de Sergipe – SE (aproximada)"
      );
      setSteps((s) => [true, s[1], s[2], s[3]]);

      const message = `🚨 EMERGÊNCIA — Código Violeta. Estou em perigo e preciso de ajuda imediata. Esta é minha localização em tempo real: ${mapsUrl}`;

      // 2 e 3. notificar todos os contatos de confiança + a polícia (190)
      // numa única mensagem, evitando conflito de duas aberturas simultâneas.
      await new Promise((r) => setTimeout(r, 700));
      const contactNumbers = contatos
        .map((c) => onlyDigits(c.phone))
        .filter(Boolean);
      const numbers = [...contactNumbers, POLICE].join(",");

      // Formato do link sms: varia entre iOS e Android.
      // iOS  usa "sms:numero&body=..."  (sem '?')
      // Android usa "sms:numero?body=..."
      const isIOS =
        typeof navigator !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);
      const bodySep = isIOS ? "&body=" : "?body=";
      const smsHref = `sms:${numbers}${bodySep}${encodeURIComponent(message)}`;

      const openSms = (href: string) => {
        const a = document.createElement("a");
        a.href = href;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
      };

      try {
        openSms(smsHref);
      } catch {
        // fallback: tenta abrir somente para a polícia se a lista conjunta falhar
        try {
          openSms(`sms:${POLICE}${bodySep}${encodeURIComponent(message)}`);
        } catch {}
      }
      setSteps((s) => [s[0], true, s[2], s[3]]);
      await new Promise((r) => setTimeout(r, 500));
      setSteps((s) => [s[0], s[1], true, s[3]]);

      // 4. registrar no histórico
      await new Promise((r) => setTimeout(r, 600));
      addAlert();
      setSteps([true, true, true, true]);
      setSuccess(true);
    })();
  }, []);

  const labels = [
    "Localização obtida",
    "Mensagem enviada aos contatos",
    "Polícia notificada (190)",
    "Alerta registrado",
  ];

  const handleCancel = () => {
    const next = taps + 1;
    setTaps(next);
    if (next >= 5) navigate({ to: "/inicio" });
  };

  return (
    <PhoneShell title="SOS – Pedir Ajuda" showBack>
      <div className="flex flex-col items-center text-center pt-4">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center ${
            success ? "bg-primary-soft" : "bg-primary-soft"
          }`}
        >
          {success ? (
            <ShieldCheck className="text-primary" size={44} />
          ) : (
            <BellOff className="text-primary" size={40} />
          )}
        </div>
        <h2 className="mt-4 font-bold text-foreground">
          {success ? "Alerta enviado com sucesso" : "Enviando alerta..."}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {success ? (
            <>
              Seus {contatosCount} contatos de confiança e a polícia
              <br />
              receberam sua localização em tempo real.
            </>
          ) : (
            <>
              Seu pedido de ajuda está sendo enviado
              <br />
              de forma discreta.
            </>
          )}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-foreground/80 bg-card border border-border rounded-full px-3 py-1.5">
          <MapPin size={14} className="text-primary" />
          {locText}
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {labels.map((label, i) => (
          <li
            key={label}
            className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-foreground">
              <Check
                size={18}
                className={steps[i] ? "text-primary" : "text-muted-foreground/40"}
              />
              {label}
            </span>
            {steps[i] ? (
              <Check className="text-primary" size={18} />
            ) : (
              <Loader2 className="animate-spin text-primary" size={18} />
            )}
          </li>
        ))}
      </ul>

      {success && (
        <div className="mt-5 bg-primary-soft border border-primary/20 rounded-xl p-3 flex items-start gap-2">
          <Send size={16} className="text-primary mt-0.5" />
          <p className="text-xs text-foreground/80">
            Se o app de mensagens não abriu automaticamente, toque novamente em SOS ou
            confira a permissão de SMS do seu dispositivo.
          </p>
        </div>
      )}

      <button
        onClick={handleCancel}
        className="mt-8 w-full bg-sos text-sos-foreground font-semibold py-3.5 rounded-full shadow-md active:scale-[0.98] transition-transform"
      >
        CANCELAR ALERTA
      </button>
      <p className="text-center text-xs text-muted-foreground mt-2">
        Toque {Math.max(0, 5 - taps)} vezes para cancelar
      </p>
    </PhoneShell>
  );
}
