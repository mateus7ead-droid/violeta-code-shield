import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Send, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import { addAlert } from "@/lib/alerts";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/sos")({ head: () => pageHead("SOS", "Acesso emergencial do Código Violeta. Em risco imediato, ligue 190."), component: Sos });
function Sos() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [phones, setPhones] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const started = useRef(false);
  useEffect(() => {
    let active = true;
    if (!started.current) { started.current = true; addAlert(); }
    try {
      const contacts = JSON.parse(localStorage.getItem("cv:contatos") ?? "[]") as { phone?: string }[];
      setPhones(contacts.map(c => c.phone?.replace(/\D/g, "") ?? "").filter(p => p.length >= 10));
    } catch { setPhones([]); }
    if (!navigator.geolocation) { setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(pos => { if (active) { setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLoading(false); } }, () => { if (active) setLoading(false); }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
    return () => { active = false; };
  }, []);
  const message = `EMERGÊNCIA — Código Violeta. Estou em perigo e preciso de ajuda imediata.${location ? ` Minha localização obtida agora: https://www.google.com/maps?q=${location.lat},${location.lon}` : " Não consegui obter minha localização."}`;
  return <PhoneShell title="SOS — Pedir ajuda" showBack><div className="mx-auto max-w-lg text-center py-4">
    <ShieldAlert className="mx-auto size-16 text-sos" /><h2 className="mt-4 text-xl font-bold">Em perigo imediato, ligue 190</h2>
    <p className="mt-3 text-sm text-muted-foreground">O aplicativo não chama a polícia nem envia mensagens automaticamente. Abra a ligação ou confirme o envio no aplicativo de mensagens.</p>
    <Button asChild variant="destructive" className="mt-5 w-full"><a href="tel:190"><Phone size={18} />Ligar para a polícia — 190</a></Button>
    <p className="mt-5 flex items-center justify-center gap-2 text-sm"><MapPin size={18} />{loading ? "Obtendo localização…" : location ? "Localização obtida para a mensagem" : "Localização indisponível"}</p>
    <Button disabled={loading || phones.length === 0} className="mt-4 w-full" onClick={() => { const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&body=" : "?body="; window.location.href = `sms:${phones.join(",")}${separator}${encodeURIComponent(message)}`; setNotice("Mensagem preparada. Confirme o envio no aplicativo de mensagens; a entrega não pode ser verificada aqui."); }}><Send size={18} />Abrir mensagem para contatos</Button>
    {phones.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Nenhum contato salvo. Cadastre seus contatos de confiança.</p>}
    {notice && <p role="status" className="mt-4 text-sm text-primary">{notice}</p>}
    <p className="mt-5 text-xs text-muted-foreground">Acionamento registrado no histórico. O link mostra a posição obtida, não acompanha seus deslocamentos.</p>
  </div></PhoneShell>;
}