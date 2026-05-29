import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserPlus, CheckCircle2, Lock } from "lucide-react";
import { useState, FormEvent } from "react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/contato-novo")({
  head: () => ({ meta: [{ title: "Adicionar Contato — Código Violeta" }] }),
  component: NovoContato,
});

const DEFAULTS = [
  { name: "Mãe", phone: "(79) 99999-1111" },
  { name: "Melhor amiga", phone: "(79) 98888-2222" },
  { name: "Irmã", phone: "(79) 97777-3333" },
  { name: "Primo João", phone: "(79) 96666-4444" },
];

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function NovoContato() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("(79) ");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) return;
    let list: { name: string; phone: string }[] = [];
    try {
      const raw = localStorage.getItem("cv:contatos");
      list = raw ? JSON.parse(raw) : DEFAULTS;
    } catch {
      list = DEFAULTS;
    }
    list.push({ name: name.trim(), phone: phone.trim() });
    localStorage.setItem("cv:contatos", JSON.stringify(list));
    navigate({ to: "/contatos" });
  };

  return (
    <PhoneShell title="Adicionar Contato" showBack contentClassName="p-6">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <UserPlus className="text-primary-foreground" size={36} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
            Nome do contato
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome"
            required
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
            Número de telefone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(79) 00000-0000"
            required
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full h-13 py-3.5 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow hover:bg-primary/90 transition-colors"
        >
          Salvar Contato
          <CheckCircle2 size={20} />
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/contatos" })}
          className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary-soft transition-colors"
        >
          Cancelar
        </button>
      </form>

      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-3 flex items-center gap-3">
        <Lock className="text-primary shrink-0" size={18} />
        <p className="text-xs text-foreground/80">
          Seus contatos são armazenados de forma segura e sigilosa.
        </p>
      </div>
    </PhoneShell>
  );
}
