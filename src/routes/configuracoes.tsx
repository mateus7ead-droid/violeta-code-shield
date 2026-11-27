import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BellOff,
  Image as ImageIcon,
  Lock,
  Trash2,
  Info,
  ChevronRight,
  Check,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SOS_TRIGGER_KEY, type SosTrigger } from "@/lib/useDiscreetSos";
import {
  APP_ICON_KEY,
  APP_ICONS,
  applyAppIcon,
  applyDiscreetMode,
  getSavedAppIcon,
  type AppIconId,
} from "@/lib/appIcon";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTrustedContacts } from "@/lib/use-trusted-contacts";
import { useServerFn } from "@tanstack/react-start";
import { deleteAllThreads } from "@/lib/assistant.functions";

export const Route = createFileRoute("/configuracoes")({
  head: () =>
    pageHead("Configurações", "Gerencie sua conta, ícone e preferências do Código Violeta."),
  component: Configuracoes,
});

type IconOption = { id: AppIconId; label: string; img: string };

const ICON_OPTIONS: IconOption[] = (Object.keys(APP_ICONS) as AppIconId[]).map((id) => ({
  id,
  label: APP_ICONS[id].label,
  img: APP_ICONS[id].icon,
}));

function Configuracoes() {
  const [discreto, setDiscreto] = useState(true);
  const [iconOpen, setIconOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<AppIconId>("violeta");
  const [pinOpen, setPinOpen] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [sosOpen, setSosOpen] = useState(false);
  const [sosTrigger, setSosTrigger] = useState<SosTrigger>("off");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const navigate = useNavigate();
  const cache = useQueryClient();
  const {
    save: saveContacts,
    loading: contactsLoading,
  } = useTrustedContacts();
  const [deleting, setDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState("");
  const [deletingDiary, setDeletingDiary] = useState(false);
  const [deletingConversations, setDeletingConversations] = useState(false);
  const deleteConversations = useServerFn(deleteAllThreads);
  const deleteContacts = async () => {
    setDeleting(true);
    setDeleteNotice("");
    try {
      await saveContacts([]);
      localStorage.removeItem("cv:contatos");
      setDeleteNotice("Contatos excluídos.");
      return true;
    } catch {
      setDeleteNotice("Não foi possível excluir os contatos. Tente novamente.");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    setSelectedIcon(getSavedAppIcon());
    const discreetEnabled = localStorage.getItem("cv:discreet") === "true";
    setDiscreto(discreetEnabled);
    applyDiscreetMode(discreetEnabled);
    setHasPin(!!localStorage.getItem("cv:pin"));
    const t = (localStorage.getItem(SOS_TRIGGER_KEY) as SosTrigger) || "off";
    setSosTrigger(t);
  }, []);

  const saveSosTrigger = (t: SosTrigger) => {
    setSosTrigger(t);
    localStorage.setItem(SOS_TRIGGER_KEY, t);
    setSaveNotice("Preferência salva com sucesso.");
  };

  const pickIcon = (id: AppIconId) => {
    setSelectedIcon(id);
    localStorage.setItem(APP_ICON_KEY, id);
    applyAppIcon(id);
    setIconOpen(false);
    setSaveNotice("Ícone salvo com sucesso.");
  };

  const openPin = () => {
    setPin("");
    setPinConfirm("");
    setPinError("");
    setPinOpen(true);
  };

  const savePin = () => {
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError("O PIN deve ter de 4 a 6 dígitos.");
      return;
    }
    if (pin !== pinConfirm) {
      setPinError("Os PINs não coincidem.");
      return;
    }
    localStorage.setItem("cv:pin", pin);
    setHasPin(true);
    setPinOpen(false);
    setSaveNotice("PIN salvo com sucesso.");
  };

  const removePin = () => {
    localStorage.removeItem("cv:pin");
    setHasPin(false);
    setPinOpen(false);
    setSaveNotice("PIN removido com sucesso.");
  };

  const currentIcon = ICON_OPTIONS.find((i) => i.id === selectedIcon) ?? ICON_OPTIONS[0];

  return (
    <PhoneShell title="Configurações" showBack>
      {saveNotice && <p role="status" className="mb-4 flex items-center gap-2 text-sm font-semibold text-green-700"><Check size={17} /> {saveNotice}</p>}
      <div className="bg-card border border-border rounded-xl divide-y divide-border shadow-sm">
        <Row
          icon={BellOff}
          title="Modo discreto"
          sub="Disfarça o título e o ícone da aba do navegador"
          right={
            <button
              onClick={() => {
                const next = !discreto;
                setDiscreto(next);
                localStorage.setItem("cv:discreet", String(next));
                applyDiscreetMode(next);
                setSaveNotice(next
                  ? "Modo discreto ativado nesta aba. O ícone do app já instalado pode não mudar."
                  : "Modo discreto desativado.");
              }}
              aria-label="Alternar modo discreto"
              className={`w-11 h-6 rounded-full transition-colors ${
                discreto ? "bg-primary" : "bg-muted-foreground/30"
              } relative`}
            >
              <span
                className={`absolute top-0.5 ${
                  discreto ? "left-5" : "left-0.5"
                } w-5 h-5 rounded-full bg-white transition-all`}
              />
            </button>
          }
        />
        <button onClick={() => setIconOpen(true)} className="w-full text-left">
          <Row
            icon={ImageIcon}
            title="Trocar ícone do app"
            sub={`Atual: ${currentIcon.label}`}
            right={
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={currentIcon.img}
                  alt={currentIcon.label}
                  className="w-full h-full object-cover"
                />
              </div>
            }
          />
        </button>
        <button onClick={openPin} className="w-full text-left">
          <Row
            icon={Lock}
            title="PIN de segurança"
            sub={hasPin ? "PIN ativo — toque para alterar" : "Ativar bloqueio do app"}
          />
        </button>
        <button onClick={() => setSosOpen(true)} className="w-full text-left">
          <Row
            icon={Zap}
            title="Botão de SOS discreto"
            sub="Botões físicos de volume não são detectáveis de forma confiável na web"
          />
        </button>
        <button onClick={() => setDeleteOpen(true)} className="w-full text-left">
          <Row
            icon={Trash2}
            title="Excluir meus dados"
            sub="Gerenciar contatos e registros deste aparelho"
          />
        </button>
        <button onClick={() => setAboutOpen(true)} className="w-full text-left">
          <Row icon={Info} title="Sobre o app" sub="Versão 1.0.0" />
        </button>
      </div>

      <Button
        variant="outline"
        className="mt-10 w-full"
        onClick={async () => {
          await cache.cancelQueries();
          cache.clear();
          const { error } = await supabase.auth.signOut();
          if (!error) await navigate({ to: "/", replace: true });
        }}
      >
        Sair da conta
      </Button>

      <Dialog open={iconOpen} onOpenChange={setIconOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Escolher ícone do app</DialogTitle>
            <DialogDescription>
              Escolha um disfarce e depois toque em "Adicionar à tela inicial" no navegador — o app
              será instalado já com o ícone e nome disfarçados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => pickIcon(opt.id)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm transition-transform group-hover:scale-105 ${
                    selectedIcon === opt.id ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                >
                  <img src={opt.img} alt={opt.label} className="w-full h-full object-cover" />
                  {selectedIcon === opt.id && (
                    <span className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                      <Check size={12} className="text-primary-foreground" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-center text-foreground/80 leading-tight">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pinOpen} onOpenChange={setPinOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>PIN de segurança</DialogTitle>
            <DialogDescription>
              Defina um PIN de 4 a 6 dígitos para bloquear o acesso ao app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Novo PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Confirmar PIN"
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
            />
            {pinError && <p className="text-xs text-sos">{pinError}</p>}
          </div>
          <DialogFooter className="gap-2">
            {hasPin && (
              <Button variant="outline" onClick={removePin}>
                Remover PIN
              </Button>
            )}
            <Button onClick={savePin}>Salvar PIN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sosOpen} onOpenChange={setSosOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Botão de SOS discreto</DialogTitle>
            <DialogDescription>
              O navegador não oferece acesso confiável aos botões físicos de volume. Por segurança, esse atalho não pode ser garantido e não deve ser usado como único meio de pedir ajuda.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value="off" disabled className="pt-2">
            {(
              [
                ["off", "Desativado"],
                ["volup", "Botão Volume +"],
                ["voldown", "Botão Volume −"],
              ] as const
            ).map(([val, label]) => (
              <label
                key={val}
                className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-primary-soft"
              >
                <RadioGroupItem value={val} id={`sos-${val}`} />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </label>
            ))}
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Atalho por volume indisponível nesta versão web. Use o botão SOS na tela ou ligue diretamente para 190.
          </p>
          <DialogFooter>
            <Button onClick={() => setSosOpen(false)}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir meus dados</DialogTitle>
            <DialogDescription>
              Cada opção é independente. Excluir o diário não apaga suas conversas, e excluir as conversas não apaga o diário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Contatos de confiança</p>
                <p className="text-xs text-muted-foreground">Apaga os contatos vinculados à sua conta e salvos neste aparelho.</p>
              </div>
              <Button
                variant="ghost"
                className="h-8 shrink-0 px-2 text-xs text-sos"
                disabled={deleting || contactsLoading}
                onClick={() => {
                  if (!window.confirm("Excluir todos os contatos de confiança? Esta ação não pode ser desfeita.")) return;
                  void deleteContacts();
                }}
              >
                {deleting ? "Excluindo…" : "Excluir"}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Meu Diário de Desabafo</p>
                <p className="text-xs text-muted-foreground">Apaga textos e fotos salvos neste aparelho.</p>
              </div>
              <Button
                variant="ghost"
                className="h-8 shrink-0 px-2 text-xs text-sos"
                disabled={deletingDiary}
                onClick={() => {
                  if (!window.confirm("Excluir todos os desabafos e fotos do seu diário? Esta ação não pode ser desfeita.")) return;
                  setDeletingDiary(true);
                  setDeleteNotice("");
                  try {
                    localStorage.removeItem("cv:diario");
                    setDeleteNotice("Diário de Desabafo excluído com sucesso.");
                  } catch {
                    setDeleteNotice("Não foi possível excluir o diário.");
                  } finally {
                    setDeletingDiary(false);
                  }
                }}
              >
                {deletingDiary ? "Excluindo…" : "Excluir"}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Conversas com Maria da Penha</p>
                <p className="text-xs text-muted-foreground">Apaga todas as conversas e mensagens da sua conta.</p>
              </div>
              <Button
                variant="ghost"
                className="h-8 shrink-0 px-2 text-xs text-sos"
                disabled={deletingConversations}
                onClick={async () => {
                  if (!window.confirm("Excluir todas as conversas e mensagens com Maria da Penha da sua conta? Esta ação não pode ser desfeita.")) return;
                  setDeletingConversations(true);
                  setDeleteNotice("");
                  try {
                    await deleteConversations();
                    await cache.invalidateQueries({ queryKey: ["assistant-threads"] });
                    await cache.removeQueries({ queryKey: ["assistant-thread"] });
                    setDeleteNotice("Conversas com Maria da Penha excluídas com sucesso.");
                  } catch {
                    setDeleteNotice("Não foi possível excluir as conversas. Tente novamente.");
                  } finally {
                    setDeletingConversations(false);
                  }
                }}
              >
                {deletingConversations ? "Excluindo…" : "Excluir"}
              </Button>
            </div>
            <DataDeleteRow
              label="Histórico de alertas"
              description="Apaga os registros de acionamentos do SOS salvos neste aparelho."
              storageKey="cv:alerts"
              confirmMessage="Excluir todo o histórico de alertas? Esta ação não pode ser desfeita."
              onSaved={() => setDeleteNotice("Histórico de alertas excluído com sucesso.")}
            />
            <DataDeleteRow
              label="PIN de segurança"
              description="Remove o PIN de bloqueio salvo neste aparelho."
              storageKey="cv:pin"
              confirmMessage="Excluir o PIN de segurança salvo neste aparelho? Esta ação não pode ser desfeita."
              onAfter={() => setHasPin(false)}
              onSaved={() => setDeleteNotice("PIN de segurança excluído com sucesso.")}
            />
          </div>
          {deleteNotice && (
            <p role="status" className={`flex items-center gap-2 text-sm font-semibold ${deleteNotice.includes("sucesso") || deleteNotice.includes("excluídos") ? "text-green-700" : "text-destructive"}`}>
              {deleteNotice.includes("sucesso") || deleteNotice.includes("excluídos") ? <Check size={17} /> : null}
              {deleteNotice}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Fechar
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={logo} alt="Código Violeta" className="w-8 h-8" />
              Código Violeta
            </DialogTitle>
            <DialogDescription>Versão 1.0.0</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/85">
            <p>
              O <strong>Código Violeta</strong> é um aplicativo de proteção pessoal voltado a
              mulheres em situação de risco de violência doméstica.
            </p>
            <p>
              O SOS permite ligar para 190 e preparar uma mensagem com a localização para os
              contatos de confiança. É necessário confirmar o envio no aplicativo de mensagens.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-foreground/80">
              <li>Botão SOS rápido e discreto</li>
              <li>Compartilhamento de localização em tempo real</li>
              <li>Histórico de acionamentos do SOS</li>
              <li>Ícone disfarçado para instalação</li>
            </ul>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
              <ShieldCheck size={14} className="text-primary" />
              Nome, contatos e conversas ficam na conta quando você está conectada. Diário e
              histórico de SOS ficam neste aparelho.
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setAboutOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PhoneShell>
  );
}

const TRIGGER_LABEL: Record<Exclude<SosTrigger, "off">, string> = {
  volup: "Volume +",
  voldown: "Volume −",
};

function DataDeleteRow({
  label,
  description,
  storageKey,
  confirmMessage,
  onAfter,
  onSaved,
}: {
  label: string;
  description: string;
  storageKey: string;
  confirmMessage: string;
  onAfter?: () => void;
  onSaved?: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handle = () => {
    if (!window.confirm(confirmMessage)) return;
    setDeleting(true);
    setError("");
    try {
      localStorage.removeItem(storageKey);
      onAfter?.();
      onSaved?.();
    } catch {
      setError("Não foi possível excluir " + label.toLowerCase() + ". Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <button
          type="button"
          onClick={handle}
          disabled={deleting}
          className="h-8 shrink-0 px-2 text-xs text-sos font-semibold hover:underline disabled:opacity-50"
        >
          {deleting ? "Excluindo…" : "Excluir"}
        </button>
      </div>
      {error && <p role="alert" className="px-3 text-xs text-destructive">{error}</p>}
    </>
  );
}

function Row({
  icon: Icon,
  title,
  sub,
  right,
}: {
  icon: typeof BellOff;
  title: string;
  sub: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="text-primary" size={20} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      {right ?? <ChevronRight className="text-muted-foreground" size={18} />}
    </div>
  );
}
