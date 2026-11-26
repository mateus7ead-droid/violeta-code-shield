import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const signup = mode === "signup";
  const changeMode = (next: typeof mode) => { setMode(next); setNotice(""); setPassword(""); setConfirm(""); };
  const social = async (provider: "google" | "lovable") => {
    setBusy(true); setNotice("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/inicio` });
      if (result.error) setNotice("Não foi possível entrar. Tente novamente.");
      else if (!result.redirected) await navigate({ to: "/inicio", replace: true });
    } catch { setNotice("Não foi possível conectar. Tente novamente."); }
    finally { setBusy(false); }
  };
  return <div className="w-full">
    <h2 className="text-center text-xl font-bold">{signup ? "Criar sua conta" : mode === "forgot" ? "Recuperar senha" : "Entrar na sua conta"}</h2>
    <form className="mt-5 space-y-4" onSubmit={async event => {
      event.preventDefault(); setNotice("");
      if (signup && password !== confirm) { setNotice("As senhas não coincidem."); return; }
      setBusy(true);
      try {
        if (mode === "forgot") {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
          setNotice(error ? "Não foi possível enviar o e-mail. Tente novamente." : "Se houver uma conta com esse e-mail, você receberá um link para redefinir a senha.");
        } else {
          const result = signup
            ? await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { emailRedirectTo: `${window.location.origin}/inicio` } })
            : await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
          if (result.error) {
            const code = result.error.code;
            if (code === "email_not_confirmed") setNotice("Sua conta ainda não foi confirmada. Abra o link enviado ao seu e-mail.");
            else if (code === "email_exists" || code === "user_already_exists") setNotice("Este e-mail já possui cadastro. Entre na sua conta ou recupere a senha.");
            else if (code === "invalid_credentials") setNotice("E-mail ou senha incorretos.");
            else if (code === "weak_password") setNotice("A senha precisa ter pelo menos 8 caracteres e atender aos critérios de segurança.");
            else setNotice(`Não foi possível concluir. ${result.error.message}`);
          } else if (signup && !result.data.session) {
            setNotice("Cadastro recebido! Verifique sua caixa de entrada e o spam para confirmar seu e-mail. O link abrirá o aplicativo.");
          } else if (signup) {
            setNotice("Conta criada e acesso liberado com sucesso!");
            await navigate({ to: "/inicio", replace: true });
          } else {
            setNotice("Login realizado com sucesso!");
            await navigate({ to: "/inicio", replace: true });
          }
        }
      } catch { setNotice("Não foi possível conectar. Tente mais tarde."); }
      finally { setBusy(false); }
    }}>
      <label className="block text-sm font-medium">E-mail<Input className="mt-1" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} /></label>
      {mode !== "forgot" && <label className="block text-sm font-medium">Senha<Input className="mt-1" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /></label>}
      {signup && <label className="block text-sm font-medium">Confirmar senha<Input className="mt-1" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} disabled={busy} /></label>}
      <Button className="w-full" disabled={busy}>{busy ? "Aguarde…" : signup ? "Criar conta" : mode === "forgot" ? "Enviar link de recuperação" : "Entrar"}</Button>
    </form>
    {notice && <p role="status" className="mt-4 text-sm text-primary">{notice}</p>}
    <div className="mt-2 flex flex-wrap justify-center">
      <Button variant="link" disabled={busy} onClick={() => changeMode(signup || mode === "forgot" ? "login" : "signup")}>{signup || mode === "forgot" ? "Já tenho conta" : "Criar uma conta"}</Button>
      {mode === "login" && <Button variant="link" disabled={busy} onClick={() => changeMode("forgot")}>Esqueci minha senha</Button>}
    </div>
    {mode !== "forgot" && <div className="mt-3 grid gap-2"><Button variant="outline" disabled={busy} onClick={() => social("google")}>Entrar com Google</Button><Button variant="outline" disabled={busy} onClick={() => social("lovable")}>Entrar com Lovable</Button></div>}
    <p className="mt-5 text-xs text-muted-foreground">Suas conversas ficam na sua conta. Quem acessar sua conta neste aparelho poderá vê-las.</p>
  </div>;
}