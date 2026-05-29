import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserPlus, Save } from "lucide-react";
import { useState, FormEvent } from "react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/contatos/novo")({
  head: () => ({ meta: [{ title: "Novo Contato — Código Violeta" }] }),
  component: NovoContato,
});

function NovoContato() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    let list: { name: string; phone: string }[] = [];
    try {
      const raw = localStorage.getItem("cv:contatos");
      list = raw
        ? JSON.parse(raw)
        : [
            { name: "Mãe", phone: "(11) 99999-1111" },
            { name: "Melhor amiga", phone: "(11) 98888-2222" },
            { name: "Irmã", phone: "(11) 97777-3333" },
            { name: "Primo João", phone: "(11) 96666-4444" },
          ];
    } catch {}
    list.push({ name: name.trim(), phone: phone.trim() });
    localStorage.setItem("cv:contatos", JSON.stringify(list));
    navigate({ to: "/contatos" });
  };

  return (
    <PhoneShell title="Novo Contato" showBack>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center mb-3">
          <UserPlus className="text-primary" size={36} />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Adicionar contato de confiança
        </h2>
        <p className="text-xs text-muted-foreground mt-1 px-4">
          Essa pessoa receberá seu alerta e localização em uma emergência.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
            Nome
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Mãe, Amiga..."
            required
            className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-0000"
            required
            className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow hover:bg-primary/90 transition-colors"
        >
          <Save size={18} />
          Salvar contato
        </button>
      </form>

      <p className="text-[11px] text-muted-foreground text-center mt-6 px-4">
        Seus dados ficam armazenados apenas no seu dispositivo.
      </p>
    </PhoneShell>
  );
}
