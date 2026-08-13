import { create } from "zustand";
import { supabase } from "../lib/supabase.js";
import { setAuthUserId, setAuthProfile } from "../lib/authBridge.js";

const PROFILE_CACHE_KEY = "loop-gym-profile-v1";

function getCachedSession() {
  try {
    const raw = localStorage.getItem("loop-gym-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const session = parsed?.currentSession ?? parsed?.session ?? parsed;
    if (!session?.access_token) return null;
    const exp = session.expires_at ?? session.user?.exp;
    if (exp && Date.now() / 1000 > exp) return null;
    return session;
  } catch {
    return null;
  }
}

function getCachedProfile(userId) {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    // Only use cache if it belongs to the same user
    return (p?.id === userId) ? p : null;
  } catch {
    return null;
  }
}

function saveCachedProfile(profile) {
  try {
    if (profile?.id) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch {}
}

function clearCachedProfile() {
  try { localStorage.removeItem(PROFILE_CACHE_KEY); } catch {}
}

const cachedSession = getCachedSession();
// If session is valid, load cached profile immediately so the app never shows a black screen
const cachedProfile = cachedSession ? getCachedProfile(cachedSession.user?.id) : null;

const useAuthStore = create((set, get) => ({
  user: cachedSession?.user ?? null,
  profile: cachedProfile,
  // loading=false when we have a cached session so the app shows instantly
  loading: !cachedSession,
  authError: null,

  init: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setAuthUserId(session.user.id);
        set({ user: session.user, loading: false });
        get().fetchProfile(session.user);
      } else {
        setAuthUserId(null);
        set({ user: null, profile: null, loading: false });
      }
    } catch {
      setAuthUserId(null);
      set({ user: null, profile: null, loading: false });
    }

    // Guard: only register one listener per store lifetime
    if (get()._authSubscription) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUserId(session.user.id);
        set({ user: session.user });
        get().fetchProfile(session.user);
      } else {
        setAuthUserId(null);
        clearCachedProfile();
        set({ user: null, profile: null });
      }
    });
    set({ _authSubscription: subscription });
  },

  fetchProfile: async (user) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile && !error) {
        saveCachedProfile(profile);
        set({ profile });
        setAuthProfile(profile);
        try {
          const { default: useStore } = await import("./useStore.js");
          // MUST wait for rehydration FIRST — before reading any persisted value.
          // Without this, lastUserId and all scalars return their default initial
          // values (undefined / 8 / null) and resetUserData fires on every open,
          // wiping all local data.
          await new Promise(resolve => {
            if (useStore.getState()._rehydrated) { resolve(); return; }
            const unsub = useStore.subscribe(s => { if (s._rehydrated) { unsub(); resolve(); } });
            setTimeout(resolve, 1500);
          });
          const lastUserId = useStore.getState().lastUserId;
          if (lastUserId && lastUserId !== user.id) {
            // Only reset if we KNOW a different user was here before
            useStore.getState().resetUserData(user.id);
          } else {
            // Same user (or first time on this device) — just stamp the id
            useStore.getState().setLastUserId(user.id);
          }
          await useStore.getState().syncWorkoutsFromDB(user.id);
          // Load all remote state BEFORE starting any sync, so syncAllToSupabase
          // doesn't race against a loadGymStateFromDB that hasn't completed yet.
          try { await useStore.getState().loadHealthFromDB(); } catch {}
          try { await useStore.getState().loadGymStateFromDB(); } catch {}
          // After merge, push the combined result back to Supabase so it stays in sync
          try { await useStore.getState().syncHealthToDB(); } catch {}
          useStore.getState().syncAllToSupabase(user.id);
        } catch {}
      } else {
        // Supabase returned an error — fall back to cached profile so the app never hangs
        const cached = getCachedProfile(user.id);
        if (cached) {
          set({ profile: cached });
          setAuthProfile(cached);
        } else {
          // Absolute last resort: minimal profile so the UI unblocks
          const fallback = { id: user.id, email: user.email, role: "user", subscription_status: "unknown" };
          set({ profile: fallback });
        }
      }
    } catch {
      // Network error — fall back to cache
      const cached = getCachedProfile(user.id);
      if (cached) {
        set({ profile: cached });
        setAuthProfile(cached);
      } else {
        const fallback = { id: user.id, email: user.email, role: "user", subscription_status: "unknown" };
        set({ profile: fallback });
      }
    }
  },

  refreshProfile: () => {
    const user = get().user;
    if (user) get().fetchProfile(user);
  },

  login: async (email, password) => {
    set({ authError: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ authError: error.message });
      return false;
    }
    if (data?.session?.user) {
      setAuthUserId(data.session.user.id);
      set({ user: data.session.user, loading: false });
      get().fetchProfile(data.session.user);
    }
    return true;
  },

  logout: async () => {
    clearCachedProfile();
    try { await supabase.auth.signOut(); } catch {}
    setAuthUserId(null);
    setAuthProfile(null);
    set({ user: null, profile: null });
    try {
      const { default: useStore } = await import("./useStore.js");
      useStore.getState().clearActiveWorkout();
      useStore.getState().resetUserData(null);
    } catch {}
    sessionStorage.removeItem("loop-gym-active-workout");
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {}
  },
}));

export default useAuthStore;
