import { it } from "node:test";
import assert from "node:assert/strict";
import { addAlert, cancelAlert, getAlerts } from "./alerts";

it("marks a canceled SOS without claiming delivery", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "window", { value: {}, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  try {
    const alert = addAlert();
    assert.equal(alert.canceled, false);
    cancelAlert(alert.id);
    assert.equal(getAlerts()[0]?.canceled, true);
  } finally {
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow); else Reflect.deleteProperty(globalThis, "window");
    if (oldStorage) Object.defineProperty(globalThis, "localStorage", oldStorage); else Reflect.deleteProperty(globalThis, "localStorage");
  }
});