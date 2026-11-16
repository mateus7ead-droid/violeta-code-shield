import { afterEach, expect, test } from "bun:test";
import { addAlert, deleteAlert, getAlerts } from "./alerts";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
afterEach(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow); else Reflect.deleteProperty(globalThis, "window");
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage); else Reflect.deleteProperty(globalThis, "localStorage");
});
test("each SOS activation is stored and can be deleted individually", () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { value: {}, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => values.set(k, v) }, configurable: true });
  const event = addAlert();
  expect(getAlerts()).toHaveLength(1);
  expect(getAlerts()[0]?.id).toBe(event.id);
  deleteAlert(event.id);
  expect(getAlerts()).toHaveLength(0);
});