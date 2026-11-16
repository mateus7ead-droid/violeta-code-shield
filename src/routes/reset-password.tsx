import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAppAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageHead } from "@/lib/page-head";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/reset-password")({ head: () => pageHead("Redefinir senha", "Defina uma nova senha para sua conta no Código Violeta."), component: ResetPassword });
function ResetPassword() {
  const { session, ready } = useAppAuth();
  const navigate = useNavigate();
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { setRecovery(new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery" || sessionStorage.getItem("cv:passwordRecovery") === "true"); }, []);
  return <PhoneShell title="Redefinir senha"><div className="mx-auto max-w-sm py-6">{!ready ? <p>Verificando seu link…</p> : !recovery || !session ? <><p>Abra o link de recuperação enviado ao seu e-mail. Se ele expirou, solicite outro.</p><Button asChild className="mt-4"><Link to="/">Voltar ao login</Link></Button></> : done ? <><p role="status">Senha atualizada com sucesso.</p><Button className="mt-4" onClick={() => navigate({ to: "/inicio", replace: true })}>Continuar</Button></> : <form className="space-y-4" onSubmit={async e => {
    e.preventDefault(); setNotice(""); if (password !== confirm) { setNotice("As senhas não coincidem."); return; } setBusy(true);
    try { const { error } = await supabase.auth.updateUser({ password }); if (error) setNotice("Não foi possível atualizar a senha. Use uma senha diferente com pelo menos 8 caracteres ou solicite um novo link."); else { sessionStorage.removeItem("cv:passwordRecovery"); setDone(true); } }
    catch { setNotice("Não foi possível conectar. Tente novamente."); } finally { setBusy(false); }
  }}><label className="block text-sm">Nova senha<Input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label><label className="block text-sm">Confirmar nova senha<Input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} /></label><Button className="w-full" disabled={busy}>{busy ? "Aguarde…" : "Salvar nova senha"}</Button>{notice && <p role="alert" className="text-sm text-destructive">{notice}</p>}</form>}</div></PhoneShell>;
}