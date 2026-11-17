import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2, UserRound, Users } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppAuth } from "@/lib/auth-context";
import { getProfile, saveProfile } from "@/lib/profile.functions";
import { contactsSchema, formatContactPhone, profileSchema, type TrustedContact } from "@/lib/profile-schema";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => pageHead("Meu Perfil", "Edite seu nome e contatos de confiança na sua conta do Código Violeta."),
  component: Profile,
});
function Profile() {
  const { session, ready } = useAppAuth();
  const load = useServerFn(getProfile);
  const save = useServerFn(saveProfile);
  const cache = useQueryClient();
  const key = ["profile", session?.user.id];
  const query = useQuery({ queryKey: key, queryFn: () => load(), enabled: ready && !!session });
  const [name, setName] = useState("");
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (query.data && !dirty) { setName(query.data.name); setContacts(query.data.contacts); } }, [query.data, dirty]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setNotice("");
    const result = profileSchema.safeParse({ name, contacts });
    if (!result.success) { setNotice(result.error.issues[0]?.message ?? "Confira os dados."); return; }
    setBusy(true);
    try { const profile = await save({ data: result.data }); cache.setQueryData(key, profile); setDirty(false); setNotice("Perfil salvo com sucesso."); }
    catch { setNotice("Não foi possível salvar. Tente novamente."); }
    finally { setBusy(false); }
  };
  const update = (index: number, field: keyof TrustedContact, value: string) => { setDirty(true); setContacts(current => current.map((contact, i) => i === index ? { ...contact, [field]: value } : contact)); };
  return <PhoneShell title="Meu Perfil" showBack><div className="mx-auto max-w-lg">
    <div className="flex items-center gap-4 border-b border-border pb-5 mb-6"><span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={32} /></span><div className="min-w-0"><h2 className="font-bold text-xl">Minha conta</h2><p className="text-sm text-muted-foreground break-all">{session?.user.email}</p></div></div>
    {query.isPending ? <p role="status">Carregando seu perfil…</p> : query.isError ? <div><p role="alert">Não foi possível carregar seu perfil.</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button></div> : <form onSubmit={submit} className="space-y-6">
      <div><label htmlFor="profile-name" className="block mb-2 font-semibold text-sm">Meu nome</label><Input id="profile-name" autoComplete="name" value={name} required onChange={event => { setName(event.target.value); setDirty(true); }} placeholder="Digite seu nome" className="h-12" /></div>
      <section className="space-y-4"><h2 className="flex items-center gap-2 font-semibold"><Users size={20} className="text-primary" />Contatos de confiança</h2>
        {contacts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum contato salvo na conta.</p>}
        {contacts.map((contact, index) => <div key={index} className="border-b border-border pb-4 space-y-2"><div className="flex items-center justify-between"><span className="text-sm font-semibold">Contato {index + 1}</span><Button type="button" variant="ghost" size="icon" aria-label={`Excluir contato ${index + 1}`} onClick={() => { setContacts(current => current.filter((_, i) => i !== index)); setDirty(true); }}><Trash2 className="text-sos" /></Button></div><label htmlFor={`contact-name-${index}`} className="block text-sm">Nome do contato</label><Input id={`contact-name-${index}`} value={contact.name} required onChange={event => update(index, "name", event.target.value)} /><label htmlFor={`contact-phone-${index}`} className="block text-sm">Telefone com DDD</label><Input id={`contact-phone-${index}`} type="tel" value={contact.phone} required onChange={event => update(index, "phone", formatContactPhone(event.target.value))} /></div>)}
        <Button type="button" variant="outline" className="w-full" onClick={() => { setContacts(current => [...current, { name: "", phone: "(79) " }]); setDirty(true); }}><Plus />Adicionar contato</Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => { try { const previous = contactsSchema.parse(JSON.parse(localStorage.getItem("cv:contatos") ?? "[]")); setContacts(current => [...current, ...previous]); setDirty(true); setNotice(previous.length ? "Contatos importados. Salve o perfil para guardar na conta." : "Nenhum contato salvo neste aparelho."); } catch { setNotice("Não foi possível importar os contatos."); } }}>Importar contatos deste aparelho</Button>
      </section>
      {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
      <Button type="submit" disabled={busy} className="w-full h-12"><Save />{busy ? "Salvando…" : "Salvar perfil"}</Button>
    </form>}
  </div></PhoneShell>;
}