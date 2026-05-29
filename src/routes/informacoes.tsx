import { createFileRoute } from "@tanstack/react-router";
import {
  User,
  Scale,
  HandHelping,
  MapPin,
  Phone,
  HelpCircle,
  Heart,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/informacoes")({
  head: () => ({ meta: [{ title: "Informações e Ajuda — Código Violeta" }] }),
  component: Informacoes,
});

const items = [
  {
    id: "vd",
    icon: User,
    label: "O que é violência doméstica?",
    content: (
      <div className="space-y-2 text-sm text-foreground/80">
        <p>
          Violência doméstica é qualquer ação ou omissão baseada no gênero que cause
          morte, lesão, sofrimento físico, sexual, psicológico, dano moral ou
          patrimonial a uma mulher, no ambiente familiar ou de convivência.
        </p>
        <p className="font-semibold text-foreground">Principais tipos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Física — empurrões, tapas, socos, queimaduras.</li>
          <li>Psicológica — humilhações, ameaças, controle, isolamento.</li>
          <li>Sexual — qualquer ato sexual sem consentimento.</li>
          <li>Patrimonial — destruição de bens, controle do dinheiro.</li>
          <li>Moral — calúnia, difamação e injúria.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "direitos",
    icon: Scale,
    label: "Seus direitos",
    content: (
      <div className="space-y-2 text-sm text-foreground/80">
        <p>
          A <strong>Lei Maria da Penha (11.340/2006)</strong> garante proteção
          integral à mulher em situação de violência.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Solicitar medidas protetivas de urgência.</li>
          <li>Afastamento do agressor do lar.</li>
          <li>Proibição de contato e aproximação do agressor.</li>
          <li>Atendimento policial e jurídico gratuito.</li>
          <li>Acolhimento em casas-abrigo, quando necessário.</li>
          <li>Sigilo e proteção da identidade.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "pedir",
    icon: HandHelping,
    label: "Como pedir ajuda",
    content: (
      <div className="space-y-2 text-sm text-foreground/80">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Em emergência, ligue para a <strong>Polícia Militar — 190</strong>.</li>
          <li>
            Disque <strong>180</strong> (Central de Atendimento à Mulher),
            disponível 24h, gratuito e sigiloso.
          </li>
          <li>
            Use o botão <strong>SOS</strong> do app para alertar contatos de
            confiança com sua localização.
          </li>
          <li>Procure uma Delegacia da Mulher (DEAM) mais próxima.</li>
          <li>Guarde provas: mensagens, fotos, áudios e laudos médicos.</li>
        </ol>
      </div>
    ),
  },
  {
    id: "onde",
    icon: MapPin,
    label: "Onde buscar ajuda",
    content: (
      <div className="space-y-2 text-sm text-foreground/80">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>DEAM</strong> — Delegacias Especializadas de Atendimento à Mulher.</li>
          <li><strong>Casa da Mulher Brasileira</strong> — atendimento integrado.</li>
          <li><strong>CREAS</strong> — Centro de Referência Especializado de Assistência Social.</li>
          <li><strong>Defensoria Pública</strong> — assistência jurídica gratuita.</li>
          <li><strong>Casas-abrigo</strong> — acolhimento sigiloso em casos de risco.</li>
          <li><strong>UBS e hospitais</strong> — atendimento médico e psicológico.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "canais",
    icon: Phone,
    label: "Canais oficiais de denúncia",
    content: (
      <div className="space-y-2 text-sm text-foreground/80">
        <ul className="space-y-1.5">
          <li><strong>180</strong> — Central de Atendimento à Mulher.</li>
          <li><strong>190</strong> — Polícia Militar (emergências).</li>
          <li><strong>100</strong> — Direitos Humanos.</li>
          <li><strong>197</strong> — Polícia Civil.</li>
          <li>
            <strong>Delegacia Online</strong> — disponível no site da Polícia
            Civil do seu estado.
          </li>
        </ul>
        <p className="text-xs text-muted-foreground pt-1">
          Todas as ligações são gratuitas e podem ser feitas em sigilo.
        </p>
      </div>
    ),
  },
  {
    id: "faq",
    icon: HelpCircle,
    label: "Perguntas frequentes",
    content: (
      <div className="space-y-3 text-sm text-foreground/80">
        <div>
          <p className="font-semibold text-foreground">Preciso de provas para denunciar?</p>
          <p>Não. Sua palavra basta para iniciar o atendimento e a investigação.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Posso denunciar por outra pessoa?</p>
          <p>Sim. Qualquer pessoa pode denunciar pelo 180 ou 190, inclusive de forma anônima.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">A medida protetiva demora?</p>
          <p>O juiz tem até 48 horas para decidir após o pedido.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">O app envia minha localização?</p>
          <p>Apenas quando você aciona o SOS — e somente aos contatos de confiança.</p>
        </div>
      </div>
    ),
  },
];

function Informacoes() {
  return (
    <PhoneShell title="Informações e Ajuda" showBack>
      <Accordion type="single" collapsible className="space-y-3">
        {items.map(({ id, icon: Icon, label, content }) => (
          <AccordionItem
            key={id}
            value={id}
            className="bg-card border border-border rounded-xl px-4 shadow-sm"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="flex items-center gap-3 flex-1">
                <Icon className="text-primary" size={20} />
                <span className="text-sm font-medium text-foreground text-left">
                  {label}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">{content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <Heart className="text-primary fill-primary/30" size={22} />
        <p className="text-xs text-foreground/80">
          Você não está sozinha.
          <br />
          Peça ajuda. Ligue 180.
        </p>
      </div>
    </PhoneShell>
  );
}
