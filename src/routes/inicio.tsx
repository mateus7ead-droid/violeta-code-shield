import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Users, MapPin, BookOpen, Clock, BookHeart } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/page-head";
import logo from "@/assets/logo-codigo-violeta.png.asset.json";


export const Route = createFileRoute("/inicio")({
  head: () => pageHead("Início", "Acesse o SOS, seus contatos, diário e a assistente Maria da Penha."),
  component: Inicio,
});

function Inicio() {
  const navigate = useNavigate();
  const tiles = [
    { to: "/contatos", icon: Users, label: "Contatos de\nConfiança" },
    { to: "/localizacao", icon: MapPin, label: "Localização\nem tempo real" },
    { to: "/informacoes", icon: BookOpen, label: "Informações\ne Ajuda" },
    { to: "/historico", icon: Clock, label: "Histórico\nde Alertas" },
    { to: "/diario", icon: BookHeart, label: "Meu Diário\nde Desabafo" },
  ] as const;

  const handleSos = () => {
    navigate({ to: "/sos" });
  };

  return (
    <PhoneShell title="Início" showMenu showBell>
      <div className="text-center mt-2">
        <h2 className="text-lg font-bold text-foreground">Olá, você está segura?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Se precisar de ajuda, acione o botão abaixo.
        </p>
      </div>

      <div className="flex justify-center my-8">
        <button
          onClick={handleSos}
          aria-label="Acionar SOS"
          className="relative flex items-center justify-center w-56 h-56 rounded-full bg-sos text-sos-foreground shadow-[0_15px_40px_-10px_oklch(0.62_0.23_12/0.6)] active:scale-95 transition-transform"
        >
          <span className="absolute inset-0 rounded-full ring-8 ring-sos/20 animate-pulse" />
          <div className="text-center">
            <div className="text-5xl font-extrabold tracking-wider">SOS</div>
            <div className="text-xs mt-2 font-semibold tracking-wide">
              TOQUE PARA
              <br />
              PEDIR AJUDA
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:bg-primary-soft transition-colors min-h-24 ${
              to === "/diario" ? "col-span-2" : ""
            }`}
          >
            <Icon className="text-primary" size={26} />
            <span className="text-xs font-semibold text-center text-foreground whitespace-pre-line leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
      <section className="mt-6 border-t border-border pt-5">
        <div className="flex items-center gap-3">
          <img src={logo.url} alt="" className="size-12 object-contain" />
          <div><h2 className="font-bold text-primary">Maria da Penha</h2><p className="text-xs text-muted-foreground">Assistente de inteligência artificial</p></div>
        </div>
        <p className="mt-3 text-sm text-foreground">Um espaço de acolhimento para suas dúvidas sobre violência, direitos e proteção.</p>
        <Button asChild className="mt-4 w-full"><Link to="/assistente">Conversar com a assistente</Link></Button>
      </section>
    </PhoneShell>
  );
}
