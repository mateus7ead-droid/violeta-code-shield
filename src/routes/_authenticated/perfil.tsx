import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Save, Trash2, UserRound, Users, Camera, CheckCircle2, X } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppAuth } from "@/lib/auth-context";
import { getProfile, saveProfile } from "@/lib/profile.functions";
import {
  contactsSchema,
  formatContactPhone,
  profileSchema,
  type TrustedContact,
} from "@/lib/profile-schema";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () =>
    pageHead(
      "Meu Perfil",
      "Edite seu nome e contatos de confiança na sua conta do Código Violeta.",
    ),
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
  const [savedName, setSavedName] = useState("");
  const [photoOpen, setPhotoOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [notice, setNotice] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarNotice, setAvatarNotice] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [locating, setLocating] = useState(false);
  const fillCurrentLocation = () => {
    if (!navigator.geolocation) {
      setNotice("Seu aparelho não permite obter a localização.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setAddress(
          `Localização atual: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (https://www.google.com/maps?q=${latitude},${longitude})`,
        );
        setDirty(true);
        setLocating(false);
        setNotice("Localização adicionada. Salve o perfil para guardar.");
      },
      () => {
        setLocating(false);
        setNotice("Não foi possível obter sua localização. Verifique a permissão do navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  useEffect(() => {
    if (session?.user.id) setAvatar(localStorage.getItem(`cv:profile-avatar:${session.user.id}`));
  }, [session?.user.id]);
  useEffect(() => {
    if (query.data && !dirty) {
      setName(query.data.name);
      setSavedName(query.data.name);
      setAddress(query.data.address);
      setContacts(query.data.contacts);
    }
  }, [query.data, dirty]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice("");
    const result = profileSchema.safeParse({ name, address, contacts });
    if (!result.success) {
      setNotice(result.error.issues[0]?.message ?? "Confira os dados.");
      return;
    }
    setBusy(true);
    try {
      const profile = await save({ data: result.data });
      cache.setQueryData(key, profile);
      setName(profile.name);
      setSavedName(profile.name);
      setDirty(false);
      setNotice("Perfil salvo com sucesso.");
    } catch {
      setNotice("Não foi possível salvar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };
  const update = (index: number, field: keyof TrustedContact, value: string) => {
    setDirty(true);
    setContacts((current) =>
      current.map((contact, i) => (i === index ? { ...contact, [field]: value } : contact)),
    );
  };
  return (
    <PhoneShell title="Meu Perfil" showBack>
      <div className="mx-auto max-w-lg">
      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="max-w-lg border-0 bg-black p-2 text-white">
          <div className="flex items-center justify-between px-2 py-1">
            <DialogTitle className="text-sm font-semibold text-white">Foto de perfil</DialogTitle>
            <button type="button" onClick={() => setPhotoOpen(false)} aria-label="Fechar visualização da foto" className="rounded-full p-2 hover:bg-white/10">
              <X size={20} />
            </button>
          </div>
          {avatar && (
            <img src={avatar} alt="Foto de perfil ampliada" className="mx-auto max-h-[75vh] w-full rounded-md object-contain" />
          )}
          <Button type="button" variant="secondary" className="w-full" onClick={() => { setPhotoOpen(false); avatarInput.current?.click(); }}>
            <Camera /> Alterar foto
          </Button>
        </DialogContent>
      </Dialog>
        <div className="flex items-center gap-4 border-b border-border pb-5 mb-6">
          <div className="relative shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => avatar ? setPhotoOpen(true) : avatarInput.current?.click()}
                aria-label={avatar ? "Visualizar foto de perfil em tamanho completo" : "Adicionar foto de perfil"}
                className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-primary-soft text-primary"
              >
                {avatar ? <img src={avatar} alt="Foto de perfil" className="h-full w-full object-cover" /> : <UserRound size={38} />}
              </button>
              <button
                type="button"
                onClick={() => avatarInput.current?.click()}
                aria-label="Alterar foto de perfil"
                className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow"
              >
                <Camera size={14} />
              </button>
            </div>
            <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              event.currentTarget.value = "";
              if (!file) return;
              if (!file.type.startsWith("image/")) { setAvatarNotice("Selecione um arquivo de imagem."); return; }
              if (file.size > 8 * 1024 * 1024) { setAvatarNotice("A imagem deve ter no máximo 8 MB."); return; }
              const reader = new FileReader();
              reader.onload = () => {
                const image = new Image();
                image.onload = () => {
                  const scale = Math.min(1, 600 / Math.max(image.width, image.height));
                  const canvas = document.createElement("canvas");
                  canvas.width = Math.max(1, Math.round(image.width * scale));
                  canvas.height = Math.max(1, Math.round(image.height * scale));
                  const ctx = canvas.getContext("2d");
                  if (!ctx) { setAvatarNotice("Não foi possível processar a imagem."); return; }
                  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                  const compressed = canvas.toDataURL("image/jpeg", 0.75);
                  try {
                    localStorage.setItem(`cv:profile-avatar:${session?.user.id}`, compressed);
                    setAvatar(compressed);
                    setAvatarNotice("Foto de perfil salva com sucesso!");
                  } catch { setAvatarNotice("Não há espaço suficiente neste aparelho para salvar a foto."); }
                };
                image.onerror = () => setAvatarNotice("Não foi possível abrir essa imagem.");
                image.src = String(reader.result);
              };
              reader.onerror = () => setAvatarNotice("Não foi possível ler a imagem.");
              reader.readAsDataURL(file);
            }} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-xl">{savedName.trim() || "Minha conta"}</h2>
            <p className="text-sm text-muted-foreground break-all">{session?.user.email}</p>
            <button type="button" onClick={() => avatarInput.current?.click()} className="mt-1 text-xs font-semibold text-primary underline">Adicionar ou alterar foto</button>
            {avatarNotice && <p role="status" className={`mt-1 text-xs font-semibold ${avatarNotice.includes("sucesso") ? "text-green-700" : "text-destructive"}`}>{avatarNotice}</p>}
          </div>
        </div>
        {query.isPending ? (
          <p role="status">Carregando seu perfil…</p>
        ) : query.isError ? (
          <div>
            <p role="alert">Não foi possível carregar seu perfil.</p>
            <Button onClick={() => void query.refetch()}>Tentar novamente</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <fieldset disabled={busy} className="space-y-6">
              <div>
                <label htmlFor="profile-name" className="block mb-2 font-semibold text-sm">
                  Meu nome
                </label>
                <Input
                  id="profile-name"
                  autoComplete="name"
                  value={name}
                  required
                  onChange={(event) => {
                    setName(event.target.value);
                    setDirty(true);
                  }}
                  placeholder="Digite seu nome"
                  className="h-12"
                />
              </div>
              <div>
                <label htmlFor="profile-address" className="block mb-2 font-semibold text-sm">
                  Endereço da minha residência
                </label>
                <Input
                  id="profile-address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(event) => {
                    setAddress(event.target.value);
                    setDirty(true);
                  }}
                  placeholder="Rua, número, bairro, cidade"
                  className="h-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 w-full"
                  disabled={locating}
                  onClick={fillCurrentLocation}
                >
                  <MapPin />
                  {locating ? "Obtendo localização…" : "Usar minha localização atual"}
                </Button>
              </div>
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Users size={20} className="text-primary" />
                  Contatos de confiança
                </h2>
                {contacts.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum contato salvo na conta.</p>
                )}
                {contacts.map((contact, index) => (
                  <div key={index} className="border-b border-border pb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Contato {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir contato ${index + 1}`}
                        onClick={() => {
                          setContacts((current) => current.filter((_, i) => i !== index));
                          setDirty(true);
                        }}
                      >
                        <Trash2 className="text-sos" />
                      </Button>
                    </div>
                    <label htmlFor={`contact-name-${index}`} className="block text-sm">
                      Nome do contato
                    </label>
                    <Input
                      id={`contact-name-${index}`}
                      value={contact.name}
                      required
                      onChange={(event) => update(index, "name", event.target.value)}
                    />
                    <label htmlFor={`contact-phone-${index}`} className="block text-sm">
                      Telefone com DDD
                    </label>
                    <Input
                      id={`contact-phone-${index}`}
                      type="tel"
                      value={contact.phone}
                      required
                      onChange={(event) =>
                        update(index, "phone", formatContactPhone(event.target.value))
                      }
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setContacts((current) => [...current, { name: "", phone: "(79) " }]);
                    setDirty(true);
                  }}
                >
                  <Plus />
                  Adicionar contato
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    try {
                      const previous = contactsSchema.parse(
                        JSON.parse(localStorage.getItem("cv:contatos") ?? "[]"),
                      );
                      setContacts((current) => [...current, ...previous]);
                      setDirty(true);
                      setNotice(
                        previous.length
                          ? "Contatos importados. Salve o perfil para guardar na conta."
                          : "Nenhum contato salvo neste aparelho.",
                      );
                    } catch {
                      setNotice("Não foi possível importar os contatos.");
                    }
                  }}
                >
                  Importar contatos deste aparelho
                </Button>
              </section>
              {notice && (
                <p role="status" className="text-sm text-primary">
                  {notice}
                </p>
              )}
              <Button type="submit" disabled={busy} className="w-full h-12">
                <Save />
                {busy ? "Salvando…" : "Salvar perfil"}
              </Button>
            </fieldset>
          </form>
        )}
      </div>
    </PhoneShell>
  );
}
