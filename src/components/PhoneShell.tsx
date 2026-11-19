import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bell, Menu } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface PhoneShellProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showBell?: boolean;
  rightSlot?: ReactNode;
  children: ReactNode;
  noHeader?: boolean;
  contentClassName?: string;
}

export function PhoneShell({
  title,
  showBack,
  showMenu,
  showBell,
  rightSlot,
  children,
  noHeader,
  contentClassName,
}: PhoneShellProps) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!noHeader && (
        <header className="bg-primary text-primary-foreground px-4 pt-6 pb-5 flex items-center gap-3 sticky top-0 z-10">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (router.history.canGoBack()) router.history.back();
                else void router.navigate({ to: "/inicio" });
              }}
              aria-label="Voltar"
              className="shrink-0 -ml-1 hover:bg-primary-dark hover:text-primary-foreground"
            >
              <ArrowLeft size={22} />
            </Button>
          )}
          {showMenu && (
            <Link to="/configuracoes" aria-label="Menu" className="p-1 -ml-1">
              <Menu size={22} />
            </Link>
          )}
          <h1 className="min-w-0 flex-1 text-center font-semibold text-lg break-words">{title}</h1>
          {showBell ? (
            <Link to="/historico" aria-label="Alertas" className="p-1 -mr-1">
              <Bell size={22} />
            </Link>
          ) : (
            <div className="w-6">{rightSlot}</div>
          )}
        </header>
      )}
      <main className={`mx-auto w-full max-w-2xl flex-1 ${contentClassName ?? "p-5"}`}>
        {children}
      </main>
    </div>
  );
}
