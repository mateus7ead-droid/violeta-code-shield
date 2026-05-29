import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { AlertEvent, deleteAlert, getAlerts } from "@/lib/alerts";

export const Route = createFileRoute("/historico")({
  head: () => ({ meta: [{ title: "Histórico de Alertas — Código Violeta" }] }),
  component: Historico,
});

function Historico() {
  const [eventos, setEventos] = useState<AlertEvent[]>([]);

  useEffect(() => {
    setEventos(getAlerts());
  }, []);

  const handleDelete = (id: string) => {
    deleteAlert(id);
    setEventos(getAlerts());
  };

  return (
    <PhoneShell title="Histórico de Alertas" showBack>
      {eventos.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground mt-10">
          Nenhum alerta registrado ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {eventos.map((e) => (
            <li
              key={e.id}
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
              <button
                onClick={() => handleDelete(e.id)}
                aria-label="Excluir alerta"
                className="p-2 text-muted-foreground hover:text-sos transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck className="text-primary" size={22} />
        <p className="text-xs text-foreground/80">
          Seus dados ficam protegidos e não são compartilhados.
        </p>
      </div>
    </PhoneShell>
  );
}
