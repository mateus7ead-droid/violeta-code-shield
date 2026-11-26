import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserPlus, CheckCircle2, Lock, BookUser, Upload } from "lucide-react";
import { useRef, useState, FormEvent } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { useTrustedContacts } from "@/lib/use-trusted-contacts";

export const Route = createFileRoute("/contato-novo")({
  head: () => pageHead("Adicionar Contato", "Adicione uma pessoa de confiança pelo nome e telefone."),
  component: NovoContato,
});

function formatPhone(v: string) {
  const d = v.replace(/[^\d+]/g, "").slice(0, 13);
  const digits = d.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function parseVCard(raw: string): Array<{ name: string; phone: string }> {
  return raw.split(/BEGIN:VCARD/i).slice(1).map((card) => {
    const nameLine = card.match(/^FN(?:;[^:]*)?:(.*)$/im)?.[1]
      ?? card.match(/^N(?:;[^:]*)?:(.*)$/im)?.[1]?.replace(/;/g, " ");
    const phoneLine = card.match(/^TEL(?:;[^:]*)?:(.*)$/im)?.[1];
    const decode = (value: string) => value.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").trim();
    return { name: nameLine ? decode(nameLine) : "", phone: phoneLine ? decode(phoneLine) : "" };
  }).filter((contact) => contact.name || contact.phone);
}

function NovoContato() {
  const { contacts, save, loading, error } = useTrustedContacts();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("(79) ");
  const [pickerMsg, setPickerMsg] = useState<string | null>(null);
  const [imported, setImported] = useState<Array<{ name: string; phone: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFromContacts = async () => {
    setPickerMsg(null);
    const nav = navigator as Navigator & {
      contacts?: {
        select: (props: string[], opts?: { multiple?: boolean }) =>
          Promise<Array<{ name?: string[]; tel?: string[] }>>;
      };
    };
    if (!nav.contacts?.select) {
      setPickerMsg("Este navegador não oferece acesso direto à agenda. Você pode importar um arquivo de contatos (.vcf) exportado do aparelho.");
      fileRef.current?.click();
      return;
    }
    try {
      const result = await nav.contacts.select(["name", "tel"], { multiple: true });
      const selected = result.map((c) => ({ name: c.name?.[0] ?? "", phone: c.tel?.[0] ?? "" })).filter((c) => c.name || c.phone);
      if (!selected.length) return;
      if (selected.length === 1) {
        setName(selected[0].name);
        if (selected[0].phone) setPhone(formatPhone(selected[0].phone));
      } else {
        setImported(selected);
        setPickerMsg(`${selected.length} contatos selecionados da agenda. Escolha qual deseja adicionar.`);
      }
    } catch {
      setPickerMsg("A seleção foi cancelada ou não foi permitida. Tente importar um arquivo .vcf da agenda.");
    }
  };

  const importVCard = async (file?: File) => {
    if (!file) return;
    try {
      const contactsFromFile = parseVCard(await file.text());
      if (!contactsFromFile.length) {
        setPickerMsg("Não encontramos contatos nesse arquivo. Selecione um arquivo .vcf válido.");
        return;
      }
      setImported(contactsFromFile);
      setPickerMsg(`${contactsFromFile.length} contato(s) encontrado(s). Selecione um abaixo.`);
    } catch {
      setPickerMsg("Não foi possível ler o arquivo de contatos.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) return;
    setSaving(true);
    try {
      await save([...contacts, { name: name.trim(), phone: phone.trim() }]);
      await navigate({ to: "/contatos" });
    } catch {
      setPickerMsg("Não foi possível salvar o contato.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PhoneShell title="Adicionar Contato" showBack contentClassName="p-6">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <UserPlus className="text-primary-foreground" size={36} />
        </div>
      </div>
      <button type="button" onClick={pickFromContacts}
        className="w-full h-12 mb-3 rounded-xl bg-primary-soft border border-primary/30 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors">
        <BookUser size={20} /> Escolher da agenda de contatos
      </button>
      <input ref={fileRef} type="file" accept=".vcf,text/vcard,text/x-vcard" className="hidden"
        aria-label="Importar arquivo de contatos VCF" onChange={(e) => { void importVCard(e.target.files?.[0]); e.currentTarget.value = ""; }} />
      <button type="button" onClick={() => fileRef.current?.click()}
        className="w-full h-11 mb-4 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-2">
        <Upload size={17} /> Importar arquivo de contatos (.vcf)
      </button>
      {pickerMsg && <p role="status" className="text-xs text-muted-foreground mb-3 text-center">{pickerMsg}</p>}
      {imported.length > 0 && (
        <div className="mb-4 max-h-44 overflow-y-auto rounded-xl border border-border divide-y divide-border">
          {imported.map((contact, index) => (
            <button key={index} type="button" onClick={() => {
              setName(contact.name);
              setPhone(formatPhone(contact.phone));
              setImported([]);
              setPickerMsg("Contato selecionado. Confira os dados antes de salvar.");
            }} className="w-full p-3 text-left hover:bg-primary-soft">
              <span className="block text-sm font-semibold">{contact.name || "Sem nome"}</span>
              <span className="block text-xs text-muted-foreground">{contact.phone || "Sem telefone"}</span>
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">Nome do contato</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome" required
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">Número de telefone</label>
          <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(79) 00000-0000" required
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <button type="submit" disabled={loading || saving || !!error}
          className="w-full h-13 py-3.5 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow hover:bg-primary/90 transition-colors">
          Salvar Contato <CheckCircle2 size={20} />
        </button>
        <button type="button" onClick={() => navigate({ to: "/contatos" })}
          className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary-soft transition-colors">
          Cancelar
        </button>
      </form>
      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-3 flex items-center gap-3">
        <Lock className="text-primary shrink-0" size={18} />
        <p className="text-xs text-foreground/80">Seus contatos são armazenados de forma segura e sigilosa.</p>
      </div>
    </PhoneShell>
  );
}
