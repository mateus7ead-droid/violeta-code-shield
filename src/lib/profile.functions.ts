import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contactsSchema, profileSchema } from "./profile-schema";

export const getProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("profiles").select("name, contacts").eq("id", context.userId).maybeSingle();
  if (error) throw new Error("Não foi possível carregar seu perfil.");
  return { name: data?.name ?? "", contacts: contactsSchema.parse(data?.contacts ?? []) };
});
export const saveProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => profileSchema.parse(input)).handler(async ({ context, data }) => {
  const { error } = await context.supabase.from("profiles").upsert({ id: context.userId, ...data });
  if (error) throw new Error("Não foi possível salvar seu perfil.");
  return data;
});
export const saveContacts = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => contactsSchema.parse(input)).handler(async ({ context, data }) => {
  const { error } = await context.supabase.from("profiles").upsert({ id: context.userId, contacts: data });
  if (error) throw new Error("Não foi possível salvar seus contatos.");
  return data;
});