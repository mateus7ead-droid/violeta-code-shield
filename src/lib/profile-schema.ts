import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do contato."),
  phone: z.string().trim().refine(value => /^\d{10,11}$/.test(value.replace(/\D/g, "")), "Informe um telefone com DDD."),
});
export const contactsSchema = z.array(contactSchema);
export const profileSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  address: z.string().trim().max(300, "Endereço muito longo.").default(""),
  contacts: contactsSchema,
});
export type TrustedContact = z.infer<typeof contactSchema>;
export function formatContactPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  const split = digits.length > 10 ? 7 : 6;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, split)}${digits.length > split ? `-${digits.slice(split)}` : ""}`;
}