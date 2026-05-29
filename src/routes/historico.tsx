import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, ChevronRight, ShieldCheck } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/historico")({
  head: () => ({ meta: [{ title: "Histórico de Alertas — Código Violeta" }] }),
  component: Historico,
});

const eventos = [
  { date: "12/05/2024 – 21:35", title: "Alerta enviado", sub: "Localização compartilhada", canceled: false },
  { date: "25/04/2024 – 18:12", title: "Alerta cancelado", sub: "Você cancelou o alerta", canceled: true },
  { date: "10/04/2024 – 09:47", title: "Alerta enviado", sub: "Localização compartilhada", canceled: false },
  { date: "01/04/2024 – 22:03", title: "Alerta enviado", sub: "Localização compartilhada", canceled: false },
];

function Historico() {
  return (
    <PhoneShell title="Histórico de Alertas" showBack>
      <ul className="space-y-3">
        {eventos.map((e, i) => (
          <li
            key={i}
            className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                e.canceled ? "bg-muted-foreground/70" : "bg-sos"
              } text-white`}
            >
              {e.canceled ? <BellOff size={18} /> : <Bell size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground">{e.date}</p>
              <p className="text-sm font-semibold text-foreground">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.sub}</p>
            </div>
            {!e.canceled && <ChevronRight className="text-muted-foreground" size={18} />}
          </li>
        ))}
      </ul>
      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck className="text-primary" size={22} />
        <p className="text-xs text-foreground/80">
          Seus dados ficam protegidos e não são compartilhados.
        </p>
      </div>
    </PhoneShell>
  );
}
