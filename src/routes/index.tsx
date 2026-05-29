import { createFileRoute, Link } from "@tanstack/react-router";
import shield from "@/assets/shield.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Código Violeta — Tecnologia que protege" },
      {
        name: "description",
        content:
          "Código Violeta: tecnologia no combate à violência doméstica e prevenção do feminicídio. Um toque pode salvar vidas.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  return (
    <div className="min-h-screen bg-primary-dark text-primary-foreground flex flex-col items-center justify-between px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <img
          src={shield}
          alt="Código Violeta"
          width={180}
          height={180}
          className="drop-shadow-2xl"
        />
        <h1 className="text-4xl font-bold tracking-wide leading-tight">
          CÓDIGO
          <br />
          VIOLETA
        </h1>
        <p className="text-base opacity-90">Um toque pode salvar vidas.</p>
      </div>
      <div className="w-full flex flex-col items-center gap-4">
        <Link
          to="/inicio"
          className="w-full max-w-xs bg-primary hover:bg-primary/90 transition-colors text-primary-foreground font-semibold text-center py-4 rounded-full shadow-lg"
        >
          COMEÇAR
        </Link>
        <Link to="/sobre" className="text-sm underline opacity-90">
          Saiba mais
        </Link>
      </div>
    </div>
  );
}
