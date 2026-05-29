import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bell, Menu } from "lucide-react";
import { ReactNode } from "react";

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
            <button
              onClick={() => router.history.back()}
              aria-label="Voltar"
              className="p-1 -ml-1"
            >
              <ArrowLeft size={22} />
            </button>
          )}
          {showMenu && (
            <Link to="/configuracoes" aria-label="Menu" className="p-1 -ml-1">
              <Menu size={22} />
            </Link>
          )}
          <h1 className="flex-1 text-center font-semibold text-lg">{title}</h1>
          {showBell ? (
            <Link to="/historico" aria-label="Alertas" className="p-1 -mr-1">
              <Bell size={22} />
            </Link>
          ) : (
            <div className="w-6">{rightSlot}</div>
          )}
        </header>
      )}
      <main className={`flex-1 ${contentClassName ?? "p-5"}`}>{children}</main>
    </div>
  );
}
