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
  useNavigate,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { addAlert } from "@/lib/alerts";
import { applyAppIcon, getSavedAppIcon } from "@/lib/appIcon";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
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
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      revision += 1;
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") sessionStorage.setItem("cv:passwordRecovery", "true");
      setAuth({ session, ready: true });
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) {
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
      <DiscreetSosListener />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

function DiscreetSosListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const STORAGE_KEY = "cv:sosTrigger";
    const keyMap = {
      volup: ["AudioVolumeUp", "VolumeUp"],
      voldown: ["AudioVolumeDown", "VolumeDown"],
    } as const;

    let presses: number[] = [];

    const onKey = (event: KeyboardEvent) => {
      const trigger = localStorage.getItem(STORAGE_KEY) as keyof typeof keyMap | "off" | null;
      if (!trigger || trigger === "off") return;

      const validKeys = keyMap[trigger];
      if (!validKeys?.includes(event.key as never)) return;

      event.preventDefault();
      const now = Date.now();
      presses = presses.filter((time) => now - time < 2000);
      presses.push(now);

      if (presses.length >= 3) {
        presses = [];
        navigate({ to: "/sos" });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return null;
}
