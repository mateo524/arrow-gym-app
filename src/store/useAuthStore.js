import { create } from "zustand";
import { supabase } from "../lib/supabase.js";
import { setAuthUserId, setAuthProfile } from "../lib/authBridge.js";

// Try to read cached session synchronously so the app renders immediately
// without a loading flash – critical for iPhone PWA "resume after switch"
function getCachedSession() {
  try {
    const raw = localStorage.getItem("arrow-gym-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Supabase stores the session under the storageKey directly
    const session = parsed?.currentSession ?? parsed?.session ?? parsed;
    if (!session?.access_token) return null;
    // Check if the token is expired
    const exp = session.expires_at ?? session.user?.exp;
    if (exp && Date.now() / 1000 > exp) return null;
    return session;
  } catch {
    return null;
  }
}

const cachedSession = getCachedSession();

const useAuthStore = create((set, get) => ({
  // If we have a valid cached session, start "authenticated" immediately –
  // the profile will load in the background without blocking the UI
  user: cachedSession?.user ?? null,
  profile: null,
  // loading=false when we have a cached session so the app shows instantly
  loading: !cachedSession,
  authError: null,

  init: async () => {
    // Always call getSession to validate / refresh the token
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      setAuthUserId(session.user.id);
      set({ user: session.user, loading: false });
      get().fetchProfile(session.user);
    } else {
      setAuthUserId(null);
      set({ user: null, profile: null, loading: false });
    }

    // Subscribe to future auth changes (login from another tab, token refresh, etc.)
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUserId(session.user.id);
        set({ user: session.user });
        get().fetchProfile(session.user);
      } else {
        setAuthUserId(null);
        set({ user: null, profile: null });
      }
    });
  },

  fetchProfile: async (user) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profile) {
      set({ profile });
      setAuthProfile(profile);
      // Pull workouts from DB and merge with local data (background, non-blocking)
      try {
        const { default: useStore } = await import("./useStore.js");
        useStore.getState().syncWorkoutsFromDB(user.id);
      } catch {}
    }
  },

  login: async (email, password) => {
    set({ authError: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ authError: error.message });
      return false;
    }
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    setAuthUserId(null);
    setAuthProfile(null);
    set({ user: null, profile: null });
  },
}));

export default useAuthStore;
