import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { addAlert } from "./alerts";

export type SosTrigger = "off" | "power" | "volup" | "voldown";

export const SOS_TRIGGER_KEY = "cv:sosTrigger";

const KEY_MAP: Record<Exclude<SosTrigger, "off">, string[]> = {
  power: ["Power"],
  volup: ["AudioVolumeUp", "VolumeUp"],
  voldown: ["AudioVolumeDown", "VolumeDown"],
};

const WINDOW_MS = 2000;

export function useDiscreetSos() {
  const navigate = useNavigate();

  useEffect(() => {
    let presses: number[] = [];

    const getTrigger = (): SosTrigger =>
      (localStorage.getItem(SOS_TRIGGER_KEY) as SosTrigger) || "off";

    const onKey = (e: KeyboardEvent) => {
      const trigger = getTrigger();
      if (trigger === "off") return;
      const keys = KEY_MAP[trigger];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const now = Date.now();
      presses = presses.filter((t) => now - t < WINDOW_MS);
      presses.push(now);
      if (presses.length >= 3) {
        presses = [];
        addAlert();
        navigate({ to: "/sos" });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);
}
