import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellOff, Image as ImageIcon, Lock, Trash2, Info, ChevronRight, Check, Zap, ShieldCheck } from "lucide-react";
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
import { APP_ICON_KEY, APP_ICONS, applyAppIcon, getSavedAppIcon, type AppIconId } from "@/lib/appIcon";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/configuracoes")({
  head: () => pageHead("Configurações", "Gerencie sua conta, ícone e preferências do Código Violeta."),
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
  const navigate = useNavigate();
  const cache = useQueryClient();

  useEffect(() => {
    setSelectedIcon(getSavedAppIcon());
    setHasPin(!!localStorage.getItem("cv:pin"));
    const t = (localStorage.getItem(SOS_TRIGGER_KEY) as SosTrigger) || "off";
    setSosTrigger(t);
  }, []);

  const saveSosTrigger = (t: SosTrigger) => {
    setSosTrigger(t);
    localStorage.setItem(SOS_TRIGGER_KEY, t);
  };

  const pickIcon = (id: AppIconId) => {
    setSelectedIcon(id);
    localStorage.setItem(APP_ICON_KEY, id);
    applyAppIcon(id);
    setIconOpen(false);
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
  };

  const removePin = () => {
    localStorage.removeItem("cv:pin");
    setHasPin(false);
    setPinOpen(false);
  };

  const currentIcon = ICON_OPTIONS.find((i) => i.id === selectedIcon) ?? ICON_OPTIONS[0];

  return (
    <PhoneShell title="Configurações" showBack>
      <div className="bg-card border border-border rounded-xl divide-y divide-border shadow-sm">
        <Row
          icon={BellOff}
          title="Modo discreto"
          sub="Oculta notificações e ícone do app"
          right={
            <button
              onClick={() => setDiscreto((v) => !v)}
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
                <img src={currentIcon.img} alt={currentIcon.label} className="w-full h-full object-cover" />
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
            sub={
              sosTrigger === "off"
                ? "Desativado"
                : `Ativo: 3x ${TRIGGER_LABEL[sosTrigger]}`
            }
          />
        </button>
        <button onClick={() => setDeleteOpen(true)} className="w-full text-left">
          <Row icon={Trash2} title="Excluir meus dados" sub="Apaga todas as suas informações" />
        </button>
        <button onClick={() => setAboutOpen(true)} className="w-full text-left">
          <Row icon={Info} title="Sobre o app" sub="Versão 1.0.0" />
        </button>
      </div>

      <Button variant="outline" className="mt-10 w-full" onClick={async () => { await cache.cancelQueries(); cache.clear(); const { error } = await supabase.auth.signOut(); if (!error) await navigate({ to: "/", replace: true }); }}>Sair da conta</Button>

      <Dialog open={iconOpen} onOpenChange={setIconOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Escolher ícone do app</DialogTitle>
            <DialogDescription>
              Escolha um disfarce e depois toque em "Adicionar à tela inicial" no navegador — o app será instalado já com o ícone e nome disfarçados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 pt-2">
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
              Aperte 3 vezes seguidas o botão escolhido quando o aplicativo estiver aberto e o navegador permitir detectar esses botões.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup
            value={sosTrigger}
            onValueChange={(v) => saveSosTrigger(v as SosTrigger)}
            className="pt-2"
          >
            {([
              ["off", "Desativado"],
              ["volup", "Botão Volume +"],
              ["voldown", "Botão Volume −"],
            ] as const).map(([val, label]) => (
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
            Não funciona com o aplicativo fechado ou a tela bloqueada. O SOS abre as opções de ajuda; mensagens precisam de confirmação.
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
              Esta ação remove permanentemente os dados salvos neste aparelho.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-1">
            <DataDeleteRow
              label="Contatos de confiança"
              storageKey="cv:contatos"
            />
            <DataDeleteRow
              label="Histórico de alertas"
              storageKey="cv:alerts"
            />
            <DataDeleteRow
              label="PIN de segurança"
              storageKey="cv:pin"
              onAfter={() => setHasPin(false)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Fechar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem("cv:contatos");
                localStorage.removeItem("cv:alerts");
                localStorage.removeItem("cv:pin");
                setHasPin(false);
                setDeleteOpen(false);
              }}
            >
              Excluir tudo
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
              O <strong>Código Violeta</strong> é um aplicativo de proteção pessoal voltado a mulheres em situação de risco de violência doméstica.
            </p>
            <p>
              Com um único toque — ou pelo botão de SOS discreto — o app envia um alerta com a sua localização aos seus contatos de confiança.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-foreground/80">
              <li>Botão SOS rápido e discreto</li>
              <li>Compartilhamento de localização em tempo real</li>
              <li>Histórico de alertas enviados</li>
              <li>PIN de segurança e ícone disfarçado</li>
            </ul>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
              <ShieldCheck size={14} className="text-primary" />
              Contatos e diário ficam neste aparelho. Conversas com a assistente ficam na sua conta.
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
  storageKey,
  onAfter,
}: {
  label: string;
  storageKey: string;
  onAfter?: () => void;
}) {
  const handle = () => {
    localStorage.removeItem(storageKey);
    onAfter?.();
  };
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={handle}
        className="text-xs text-sos font-semibold hover:underline"
      >
        Excluir
      </button>
    </div>
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
