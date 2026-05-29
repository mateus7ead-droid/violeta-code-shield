import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, MapPin, Users, BookOpen } from "lucide-react";
import shield from "@/assets/logo.png";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [{ title: "Sobre — Código Violeta" }],
  }),
  component: Sobre,
});

function Sobre() {
  const items = [
    { icon: Shield, label: "PROTEÇÃO" },
    { icon: MapPin, label: "LOCALIZAÇÃO" },
    { icon: Users, label: "CONFIANÇA" },
    { icon: BookOpen, label: "INFORMAÇÃO" },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <div className="flex items-center gap-3">
        <img src={shield} alt="" width={72} height={72} loading="lazy" />
        <div>
          <h1 className="text-2xl font-extrabold text-primary leading-none">CÓDIGO</h1>
          <h1 className="text-2xl font-extrabold text-primary leading-none">VIOLETA</h1>
        </div>
      </div>
      <p className="mt-6 text-primary font-medium">
        Tecnologia que protege.
        <br />
        Você não está sozinha.
      </p>
      <hr className="my-6 border-border" />
      <h2 className="text-primary font-semibold">Sobre o app</h2>
      <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
        O Código Violeta foi criado para proteger mulheres em situação de risco. Com um toque, você
        pode pedir ajuda de forma rápida, discreta e segura.
      </p>

      <div className="mt-auto pt-10">
        <Link
          to="/inicio"
          className="block w-full text-center bg-primary text-primary-foreground font-semibold py-3 rounded-full mb-6"
        >
          Entrar
        </Link>
        <div className="grid grid-cols-4 gap-2">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-primary">
              <Icon size={28} strokeWidth={2} />
              <span className="text-[10px] font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
