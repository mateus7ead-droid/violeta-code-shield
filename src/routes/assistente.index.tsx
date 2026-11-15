import { createFileRoute } from "@tanstack/react-router";
import { AssistantThreads } from "@/components/AssistantThreads";
import { pageHead } from "@/lib/page-head";
import logo from "@/assets/logo-codigo-violeta.png.asset.json";
export const Route = createFileRoute("/assistente/")({ head: () => pageHead("Maria da Penha", "Suas conversas com a assistente de IA sobre direitos, segurança e violência doméstica."), component: AssistantHome });
function AssistantHome() { return <div className="mx-auto w-full max-w-2xl"><div className="mb-6 flex items-center gap-3"><img src={logo.url} alt="" className="size-14 object-contain" /><div><h2 className="font-bold text-lg">Suas conversas</h2><p className="text-sm text-muted-foreground">Acolhimento, informação e apoio.</p></div></div><AssistantThreads /><p className="mt-6 text-xs text-muted-foreground">As conversas são guardadas na sua conta. Quem acessar sua conta neste aparelho poderá vê-las.</p></div>; }