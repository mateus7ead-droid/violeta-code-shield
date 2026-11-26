import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Phone, Send, ShieldAlert, Check, Loader2, History, Users, BellOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import { addAlert, cancelAlert } from "@/lib/alerts";
import { pageHead } from "@/lib/page-head";
import { useTrustedContacts } from "@/lib/use-trusted-contacts";

export const Route = createFileRoute("/sos")({ head: () => pageHead("SOS", "Acesso emergencial do Código Violeta. Em risco imediato, ligue 190."), component: Sos });
function Sos() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const { contacts, loading: contactsLoading, error: contactsError } = useTrustedContacts();
  const phones = contacts.map(contact => contact.phone.replace(/\D/g, "")).filter(phone => phone.length >= 10);
  const [taps, setTaps] = useState(0);
  const navigate = useNavigate();
  const alertId = useRef<string | null>(null);
  const [notice, setNotice] = useState("");
  const started = useRef(false);
  const smsOpened = useRef(false);
  useEffect(() => {
    let active = true;
    if (!started.current) { started.current = true; alertId.current = addAlert().id; }
    if (!navigator.geolocation) { setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(pos => { if (active) { setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLoading(false); } }, () => { if (active) setLoading(false); }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
    return () => { active = false; };
  }, []);
  const message = `EMERGÊNCIA — Código Violeta. Estou em perigo e preciso de ajuda imediata.${location ? ` Minha localização obtida agora: https://www.google.com/maps?q=${location.lat},${location.lon}` : " Não consegui obter minha localização."}`;
  const openEmergencySms = () => {
    if (phones.length === 0) {
      setNotice("Não há contatos de confiança com telefone válido. Cadastre um contato para enviar o alerta.");
      return;
    }
    const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?";
    const recipients = phones.join(/iPad|iPhone|iPod/.test(navigator.userAgent) ? ";" : ",");
    window.location.href = `sms:${recipients}${separator}body=${encodeURIComponent(message)}`;
    setNotice("O aplicativo de mensagens foi aberto com o alerta e a localização. Revise e toque em Enviar. O Código Violeta não consegue confirmar a entrega.");
  };

  useEffect(() => {
    if (loading || contactsLoading || contactsError || phones.length === 0 || smsOpened.current) return;
    smsOpened.current = true;
    openEmergencySms();
  }, [loading, contactsLoading, contactsError, phones.join(",")]);
  return <PhoneShell title="SOS — Pedir Ajuda" showBack><div className="mx-auto max-w-lg py-4">
    <div className="text-center"><div className="mx-auto size-24 rounded-full bg-primary-soft flex items-center justify-center"><ShieldAlert className="text-primary" size={44} /></div><h2 className="mt-4 text-lg font-bold">{loading ? "Preparando seu pedido de ajuda…" : "SOS acionado"}</h2><p className="mt-2 text-sm text-muted-foreground">Em perigo imediato, ligue 190.</p><p className="mt-3 inline-flex items-center gap-2 text-xs"><MapPin size={16} className="text-primary" />{loading ? "Obtendo localização…" : location ? `Lat ${location.lat.toFixed(5)}, Lon ${location.lon.toFixed(5)}` : "Localização indisponível"}</p></div>
    <ul className="mt-6 space-y-3">
      <li className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 text-sm"><MapPin className="text-primary shrink-0" size={20} /><span className="flex-1">{loading ? "Obtendo localização" : location ? "Localização obtida" : "Não foi possível obter localização"}</span>{loading ? <Loader2 className="animate-spin motion-reduce:animate-none text-primary" size={18} /> : location ? <Check className="text-primary" size={18} /> : null}</li>
      <li className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 text-sm"><Users className="text-primary shrink-0" size={20} /><span className="flex-1">{contactsLoading ? "Carregando contatos" : contactsError ? "Contatos indisponíveis" : `${phones.length} contatos de confiança`}</span>{contactsLoading ? <Loader2 className="animate-spin motion-reduce:animate-none text-primary" size={18} /> : <Check className="text-primary" size={18} />}</li>
      <li className="bg-card border border-border rounded-lg p-4"><Button asChild variant="destructive" className="w-full"><a href="tel:190"><Phone />Ligar para a polícia — 190</a></Button></li>
      <li className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 text-sm"><History className="text-primary" size={20} /><span className="flex-1">Acionamento registrado no histórico</span><Check className="text-primary" size={18} /></li>
    </ul>
    <Button disabled={contactsLoading || !!contactsError || phones.length === 0} className="mt-5 w-full h-12" onClick={openEmergencySms}><Send />Abrir alerta novamente</Button>
    {!contactsLoading && phones.length === 0 && <p className="mt-3 text-sm text-center text-muted-foreground">Nenhum contato salvo. Cadastre seus contatos de confiança.</p>}
    {notice && <p role="status" className="mt-4 text-sm text-primary">{notice}</p>}
    <p className="mt-4 text-xs text-muted-foreground text-center">O alerta é preparado automaticamente no aplicativo de mensagens quando os contatos e a localização estiverem carregados. Você precisa confirmar o envio. O Código Violeta não envia SMS em segundo plano nem confirma a entrega. O link mostra a localização obtida naquele momento.</p>
    <Button variant="destructive" className="mt-7 w-full h-12 rounded-full" onClick={() => { const next = taps + 1; setTaps(next); if (next >= 5) { if (alertId.current) cancelAlert(alertId.current); void navigate({ to: "/inicio" }); } }}><BellOff />CANCELAR ALERTA</Button><p className="mt-2 text-center text-xs text-muted-foreground">Toque {Math.max(0, 5 - taps)} vezes para cancelar. Mensagens já enviadas não são desfeitas.</p>
  </div></PhoneShell>;
}