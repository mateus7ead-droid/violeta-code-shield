import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellOff, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/sos")({
  head: () => ({ meta: [{ title: "SOS — Código Violeta" }] }),
  component: Sos,
});

function Sos() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([false, false, false]);
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setSteps((s) => [true, s[1], s[2]]), 1200),
      setTimeout(() => setSteps((s) => [s[0], true, s[2]]), 2400),
      setTimeout(() => setSteps((s) => [s[0], s[1], true]), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const labels = [
    "Enviando localização...",
    "Notificando contatos...",
    "Alerta enviado para a polícia",
  ];

  const handleCancel = () => {
    const next = taps + 1;
    setTaps(next);
    if (next >= 5) navigate({ to: "/inicio" });
  };

  return (
    <PhoneShell title="SOS – Pedir Ajuda" showBack>
      <div className="flex flex-col items-center text-center pt-4">
        <div className="w-24 h-24 rounded-full bg-primary-soft flex items-center justify-center">
          <BellOff className="text-primary" size={40} />
        </div>
        <h2 className="mt-4 font-bold text-foreground">Alerta silencioso ativado</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Seu pedido de ajuda será enviado
          <br />
          de forma discreta.
        </p>
      </div>

      <ul className="mt-8 space-y-3">
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

      <button
        onClick={handleCancel}
        className="mt-10 w-full bg-sos text-sos-foreground font-semibold py-3.5 rounded-full shadow-md active:scale-[0.98] transition-transform"
      >
        CANCELAR ALERTA
      </button>
      <p className="text-center text-xs text-muted-foreground mt-2">
        Toque {Math.max(0, 5 - taps)} vezes para cancelar
      </p>
    </PhoneShell>
  );
}
