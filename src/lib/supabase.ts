import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://prjsoviauzapqhqbnnuf.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "sb_publishable_MmUGk-1N2BtQSKM8FMPy9A_zw0doq9V";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    flowType: "implicit",
  },
});

export type AppRole = "admin" | "student";
