import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Users,
  MapPin,
  BookOpen,
  Clock,
  BookHeart,
  MessageCircle,
  LogOut,
  LogIn,
  UserRound,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/page-head";
import { useAppAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/inicio")({
  head: () =>
    pageHead("Início", "Acesse o SOS, seus contatos, diário e a assistente Maria da Penha."),
  component: Inicio,
});

function Inicio() {
  const navigate = useNavigate();
  const { session } = useAppAuth();
  const cache = useQueryClient();
  const tiles = [
    { to: "/contatos", icon: Users, label: "Contatos de\nConfiança" },
    { to: "/localizacao", icon: MapPin, label: "Localização\nem tempo real" },
    { to: "/informacoes", icon: BookOpen, label: "Informações\ne Ajuda" },
    { to: "/historico", icon: Clock, label: "Histórico\nde Alertas" },
    { to: "/diario", icon: BookHeart, label: "Meu Diário\nde Desabafo" },
    { to: "/assistente", icon: MessageCircle, label: "Maria da Penha\nAssistente de IA" },
  ] as const;

  const handleSos = () => {
    navigate({ to: "/sos" });
  };

  return (
    <PhoneShell title="Início" showMenu showBell>
      <div className="flex justify-end mb-3">
        <Button asChild variant="outline">
          <Link to="/perfil">
            <UserRound size={18} />
            Meu perfil
          </Link>
        </Button>
      </div>
      <div className="text-center mt-2">
        <h2 className="text-lg font-bold text-foreground">Olá, você está segura?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Se precisar de ajuda, acione o botão abaixo.
        </p>
      </div>

      <div className="flex justify-center my-8">
        <Button
          onClick={handleSos}
          aria-label="Acionar SOS"
          variant="destructive"
          className="relative flex items-center justify-center w-56 h-56 rounded-full bg-sos text-sos-foreground shadow-sos hover:bg-sos active:scale-95 transition-transform motion-reduce:transition-none"
        >
          <span className="absolute inset-0 rounded-full ring-8 ring-sos/20 animate-pulse motion-reduce:animate-none" />
          <div className="text-center">
            <div className="text-5xl font-extrabold tracking-wider">SOS</div>
            <div className="text-xs mt-2 font-semibold tracking-wide">
              TOQUE PARA
              <br />
              PEDIR AJUDA
            </div>
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:bg-primary-soft transition-colors min-h-24"
          >
            <Icon className="text-primary" size={26} />
            <span className="text-xs font-semibold text-center text-foreground whitespace-pre-line leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-6 border-t border-border pt-4">
        {session ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await cache.cancelQueries();
              cache.clear();
              const { error } = await supabase.auth.signOut();
              if (!error) await navigate({ to: "/", replace: true });
            }}
          >
            <LogOut size={18} />
            Sair da conta
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <LogIn size={18} />
              Entrar na conta
            </Link>
          </Button>
        )}
      </div>
    </PhoneShell>
  );
}
