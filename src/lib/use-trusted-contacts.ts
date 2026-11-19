import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAppAuth } from "./auth-context";
import { getProfile, saveContacts } from "./profile.functions";
import { contactsSchema, type TrustedContact } from "./profile-schema";

export function useTrustedContacts() {
  const { session, ready } = useAppAuth();
  const [local, setLocal] = useState<TrustedContact[]>([]);
  const cache = useQueryClient();
  const load = useServerFn(getProfile);
  const save = useServerFn(saveContacts);
  const key = ["profile", session?.user.id];
  const query = useQuery({ queryKey: key, queryFn: () => load(), enabled: ready && !!session });
  useEffect(() => {
    try {
      setLocal(contactsSchema.parse(JSON.parse(localStorage.getItem("cv:contatos") ?? "[]")));
    } catch {
      setLocal([]);
    }
  }, []);
  return {
    contacts: session ? (query.data?.contacts ?? []) : local,
    loading: !ready || (!!session && query.isPending),
    error: query.error,
    save: async (contacts: TrustedContact[]) => {
      const validated = contactsSchema.parse(contacts);
      if (session) {
        const saved = await save({ data: validated });
        cache.setQueryData(
          key,
          (previous: { name: string; contacts: TrustedContact[] } | undefined) =>
            previous ? { ...previous, contacts: saved } : undefined,
        );
        await cache.invalidateQueries({ queryKey: key });
      } else {
        localStorage.setItem("cv:contatos", JSON.stringify(validated));
        setLocal(validated);
      }
    },
  };
}
