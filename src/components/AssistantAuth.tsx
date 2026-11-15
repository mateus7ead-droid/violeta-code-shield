import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo-codigo-violeta.png.asset.json";

export function AssistantAuth({ children }: { children: (session: Session) => ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setReady(true); } });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setReady(true); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  if (!ready) return <p className="p-6 text-muted-foreground">Carregando sua conta…</p>;
  if (session) return children(session);
  const social = async (provider: "google" | "lovable") => {
    setBusy(true); setNotice("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/assistente` });
      if (result.error) setNotice("Não foi possível entrar. Tente novamente.");
    } catch { setNotice("Não foi possível entrar. Tente novamente."); }
    finally { setBusy(false); }
  };
  return <div className="mx-auto max-w-sm py-8">
    <img src={logo.url} alt="Código Violeta" className="mx-auto size-20 object-contain" />
    <h2 className="mt-4 text-center text-xl font-bold">Maria da Penha</h2>
    <p className="mt-2 text-center text-sm text-muted-foreground">Entre para guardar suas conversas na sua conta.</p>
    <form className="mt-6 space-y-4" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setNotice("");
      try {
        const result = signup ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/assistente` } }) : await supabase.auth.signInWithPassword({ email, password });
        if (result.error) setNotice(signup ? "Não foi possível criar a conta. Confira o e-mail e a senha." : "Não foi possível entrar. Confira seus dados e a confirmação do e-mail.");
        else if (signup && !result.data.session) setNotice("Confira seu e-mail para confirmar a conta antes de entrar.");
      } catch { setNotice("Não foi possível conectar. Tente mais tarde."); }
      finally { setBusy(false); }
    }}>
      <label className="block text-sm">E-mail<Input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1" /></label>
      <label className="block text-sm">Senha<Input type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} className="mt-1" /></label>
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Aguarde…" : signup ? "Criar conta" : "Entrar"}</Button>
    </form>
    <Button variant="link" className="w-full" onClick={() => { setSignup(!signup); setNotice(""); }}>{signup ? "Já tenho conta" : "Criar uma conta"}</Button>
    <div className="mt-2 grid gap-2"><Button variant="outline" disabled={busy} onClick={() => social("google")}>Entrar com Google</Button><Button variant="outline" disabled={busy} onClick={() => social("lovable")}>Entrar com Lovable</Button></div>
    {notice && <p role="status" className="mt-4 text-sm text-primary">{notice}</p>}
    <p className="mt-6 text-xs text-muted-foreground">Conversas ficam guardadas na sua conta e podem ser vistas por quem acessar este aparelho. Em emergência, ligue 190.</p>
  </div>;
}