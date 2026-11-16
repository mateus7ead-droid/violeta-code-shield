import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

export const AuthContext = createContext<{ session: Session | null; ready: boolean }>({ session: null, ready: false });
export const useAppAuth = () => useContext(AuthContext);