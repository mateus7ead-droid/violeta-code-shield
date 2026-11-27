export const APP_ICON_KEY = "cv:appIcon";

export type AppIconId = "violeta" | "calc" | "clima" | "notas" | "relogio";

export const APP_ICONS: Record<
  AppIconId,
  { label: string; manifest: string; icon: string }
> = {
  violeta: { label: "Código Violeta", manifest: "/manifest-violeta.webmanifest", icon: "/icons/violeta-192.png" },
  calc: { label: "Calculadora", manifest: "/manifest-calc.webmanifest", icon: "/icons/calc-192.png" },
  clima: { label: "Clima", manifest: "/manifest-clima.webmanifest", icon: "/icons/clima-192.png" },
  notas: { label: "Notas", manifest: "/manifest-notas.webmanifest", icon: "/icons/notas-192.png" },
  relogio: { label: "Relógio", manifest: "/manifest-relogio.webmanifest", icon: "/icons/relogio-192.png" },
};

export function getSavedAppIcon(): AppIconId {
  try {
    const saved = localStorage.getItem(APP_ICON_KEY) as AppIconId | null;
    if (saved && saved in APP_ICONS) return saved;
  } catch {}
  return "violeta";
}

/** Troca o manifest (ícone/nome na tela inicial) e o favicon para o disfarce escolhido. */
export function applyAppIcon(id: AppIconId) {
  const conf = APP_ICONS[id] ?? APP_ICONS.violeta;

  let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!manifestLink) {
    manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    document.head.appendChild(manifestLink);
  }
  manifestLink.href = conf.manifest;

  const swap = (rel: string) => {
    const el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (el) el.href = conf.icon;
  };
  swap("icon");
  swap("apple-touch-icon");
}


/**
 * O modo discreto altera somente o título e o favicon da aba.
 * Navegadores não permitem trocar de forma confiável o ícone/nome
 * de um PWA que já foi instalado.
 */
export function applyDiscreetMode(enabled: boolean) {
  if (typeof document === "undefined") return;
  if (enabled) {
    document.title = "Calculadora";
    const icon = APP_ICONS.calc.icon;
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) favicon.href = icon;
    const appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (appleIcon) appleIcon.href = icon;
    const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (manifest) manifest.href = APP_ICONS.calc.manifest;
    return;
  }
  document.title = APP_ICONS[getSavedAppIcon()].label;
  applyAppIcon(getSavedAppIcon());
}
