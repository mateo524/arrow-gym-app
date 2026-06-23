import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder",
  {
    auth: {
      persistSession: true,       // Session survives page reloads, phone off, etc.
      autoRefreshToken: true,     // Silently refreshes the JWT before it expires
      storageKey: "loop-gym-auth", // localStorage key for the session
      storage: window.localStorage,
    },
  }
);
