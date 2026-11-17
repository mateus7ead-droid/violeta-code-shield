import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import { useTrustedContacts } from "@/lib/use-trusted-contacts";

export const Route = createFileRoute("/contatos")({
  head: () => pageHead("Contatos de Confiança", "Gerencie seus contatos de confiança no Código Violeta."),
  component: Contatos,
});

function Contatos() {
  const { contacts: contatos, save, loading, error } = useTrustedContacts();
  const [notice, setNotice] = useState("");
  const remove = async (i: number) => {
    try { await save(contatos.filter((_, idx) => idx !== i)); }
    catch { setNotice("Não foi possível excluir o contato."); }
  };

  return (
    <PhoneShell title="Contatos de Confiança" showBack>
      <p className="text-sm text-foreground/80 mb-4">
          Adicione pessoas de confiança para compartilhar seu pedido de ajuda.
      </p>
      <Button asChild variant="outline" className="mb-4 w-full"><Link to="/perfil">Editar contatos no meu perfil</Link></Button>
      {loading && <p role="status">Carregando contatos…</p>}
      {(error || notice) && <p role="alert">{notice || "Não foi possível carregar seus contatos."}</p>}
      <ul className="space-y-3">
        {contatos.map((c, i) => (
          <li
            key={`${c.name}-${i}`}
            className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground truncate">{c.phone}</p>
            </div>
            <a href={`tel:${c.phone}`} aria-label="Ligar" className="text-primary p-2">
              <Phone size={20} />
            </a>
            <a href={`sms:${c.phone}`} aria-label="Mensagem" className="text-primary p-2">
              <MessageCircle size={20} />
            </a>
            <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => void remove(i)} className="text-sos">
              <Trash2 size={18} />
            </Button>
          </li>
        ))}
        {contatos.length === 0 && (
          <li className="text-center text-sm text-muted-foreground py-8">
            Nenhum contato. Toque em + para adicionar.
          </li>
        )}
      </ul>

      <div className="flex justify-center mt-5">
        <Link
          to="/contato-novo"
          aria-label="Adicionar contato"
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus size={30} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="text-primary mt-0.5" size={20} />
        <p className="text-xs text-foreground/80">
          No SOS, você pode abrir uma mensagem com sua localização para estes contatos.
        </p>
      </div>
    </PhoneShell>
  );
}
