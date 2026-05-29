export interface AlertEvent {
  id: string;
  date: string;
  title: string;
  sub: string;
  canceled: boolean;
}

const KEY = "cv:alerts";

export function getAlerts(): AlertEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addAlert(): AlertEvent {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} – ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const evt: AlertEvent = {
    id: `${now.getTime()}`,
    date,
    title: "Alerta enviado",
    sub: "Localização compartilhada",
    canceled: false,
  };
  const list = [evt, ...getAlerts()];
  localStorage.setItem(KEY, JSON.stringify(list));
  return evt;
}

export function deleteAlert(id: string) {
  const list = getAlerts().filter((a) => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}
