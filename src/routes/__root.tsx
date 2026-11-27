import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/lib/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { applyAppIcon, applyDiscreetMode, getSavedAppIcon } from "@/lib/appIcon";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Código Violeta" },
      { name: "description", content: "Apoio, informação e segurança para mulheres." },
      { property: "og:title", content: "Código Violeta" },
      { property: "og:description", content: "Apoio, informação e segurança para mulheres." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [auth, setAuth] = useState<{ session: Session | null; ready: boolean }>({ session: null, ready: false });

  useEffect(() => {
    let active = true;
    let revision = 0;
    let identity: string | null | undefined;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      revision += 1;
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") sessionStorage.setItem("cv:passwordRecovery", "true");
      setAuth({ session, ready: true });
      const nextIdentity = session?.user.id ?? null;
      const changed = identity !== undefined && identity !== nextIdentity;
      identity = nextIdentity;
      if (changed || event === "USER_UPDATED") {
        void router.invalidate();
        if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
      }
    });
    const initialRevision = revision;
    void supabase.auth.getUser().then(async ({ data: user, error }) => {
      if (!active || revision !== initialRevision) return;
      if (error || !user.user) { setAuth({ session: null, ready: true }); return; }
      const { data: current } = await supabase.auth.getSession();
      if (active && revision === initialRevision) setAuth({ session: current.session, ready: true });
    }).catch(() => { if (active) setAuth({ session: null, ready: true }); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [queryClient, router]);

  useEffect(() => {
    // Ícone instalado sem cache offline ou registro de service worker.
    applyAppIcon(getSavedAppIcon());
    applyDiscreetMode(localStorage.getItem("cv:discreet") === "true");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

