import { todayLocal } from "../../lib/dates.js";
import { supabase } from "../../lib/supabase.js";
import { getAuthUserId } from "../../lib/authBridge.js";
import { addTombstone, mergeHealthData, entryKey } from "../healthMerge.js";

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function today() {
  return todayLocal();
}

function buildHealthPayload(state) {
  return {
    weight_log: state.weightLog || [],
    meal_log: state.mealLog || [],
    sleep_log: state.sleepLog || [],
    water_log: state.waterLog || [],
    water_goal: state.waterGoal || 8,
    rest_days: state.restDays || [],
    cardio_history: state.cardioHistory || [],
    saved_meal_combos: state.savedMealCombos || [],
    nutrition_plan: state.nutritionPlan,
    active_challenges: state.activeChallenges || [],
    // Only sync photos that have a real storage URL. Base64 dataUrls can be
    // several MB each and blow the JSONB payload limit, causing the update to
    // fail silently and wipe the photos on the next session load from Supabase.
    progress_photos: (state.progressPhotos || [])
      .filter(p => p.url)
      .map(({ id, date, url, note }) => ({ id, date, url, note })),
    competition_date: state.competitionDate,
    competition_name: state.competitionName,
    // Merge metadata: tombstones (deleted entries) and clear-timestamps for scalar groups
    tombstones: state.healthTombstones || {},
    nutrition_plan_updated_at: state.nutritionPlanUpdatedAt || 0,
    competition_updated_at: state.competitionUpdatedAt || 0,
    // Settings that live in settingsSlice — included so they survive localStorage wipes
    user_goal: state.userGoal || "mantenimiento",
    custom_kcal: state.customKcal || "",
    activity_level: state.activityLevel || "moderado",
    weekly_goal: state.weeklyGoal || 4,
  };
}

// Guard against concurrent in-flight health syncs (navigator.onLine can lie on
// dead gym WiFi — the request hangs indefinitely).
let healthSyncRunning = false;
let healthSyncRetry = false;
const withTimeout = (promise, ms = 8000) => {
  let timer;
  const t = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), ms); });
  return Promise.race([promise, t]).finally(() => clearTimeout(timer));
};

// Returns true only when the update really reached the DB.
async function syncHealthToDB(get, set) {
  if (healthSyncRunning) {
    healthSyncRetry = true; // re-run with the latest state once the in-flight one ends
    return false;
  }
  healthSyncRunning = true;
  let ok = false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return false;
    const { error: healthError } = await withTimeout(supabase.from("profiles").update({ health_data: buildHealthPayload(get()) }).eq("id", session.user.id));
    if (healthError) throw healthError;
    ok = true;
    // The snapshot reached the DB: any queued health snapshot is now stale.
    if ((get().pendingSyncs || []).some((p) => p.type === "health")) {
      set?.((s) => ({ pendingSyncs: (s.pendingSyncs || []).filter((p) => p.type !== "health") }));
    }
  } catch (e) {
    // Silently fail — table or column may not exist yet (includes timeout on dead WiFi)
  } finally {
    healthSyncRunning = false;
  }
  if (healthSyncRetry) {
    healthSyncRetry = false;
    return syncHealthToDB(get, set);
  }
  return ok;
}

let healthSyncQueued = false;
function queueHealthSync(get, set) {
  if (healthSyncQueued) return;
  healthSyncQueued = true;
  setTimeout(async () => {
    healthSyncQueued = false;
    const state = get();
    if (!navigator.onLine) {
      state.queueSync("health", buildHealthPayload(state));
      return;
    }
    // Online but the upload failed / timed out: keep the snapshot for the next flush.
    const ok = await syncHealthToDB(get, set);
    if (!ok) get().queueSync("health", buildHealthPayload(get()));
  }, 200);
}

// Record a deletion so the entry does not come back from another device.
function tomb(s, collection, id) {
  const tombs = s.healthTombstones || {};
  return { healthTombstones: { ...tombs, [collection]: addTombstone(tombs[collection], entryKey({ id })) } };
}

export const createHealthSlice = (set, get) => ({
  bodyMetrics: [],
  addBodyMetric: (entry) => set(s => ({ bodyMetrics: [...(s.bodyMetrics || []), entry] })),

  measurementsHistory: [],
  saveMeasHistoryEntry: (entry) => {
    set(s => ({
      measurementsHistory: [entry, ...(s.measurementsHistory || []).filter(e => e.date !== entry.date)].slice(0, 60),
    }));
  },

  weightLog: [],
  restDays: [],
  cardioHistory: [],
  mealLog: [],
  savedMealCombos: [],
  nutritionPlan: null,
  sleepLog: [],
  waterLog: [],
  waterGoal: 8,
  progressPhotos: [],
  competitionDate: null,
  competitionName: "",
  activeChallenges: [],
  pendingSyncs: [],
  healthTombstones: {},
  nutritionPlanUpdatedAt: 0,
  competitionUpdatedAt: 0,

  queueSync: (type, payload) => {
    set(s => ({
      // Keep only the latest payload per type: each one is a full snapshot
      pendingSyncs: [...(s.pendingSyncs || []).filter((p) => p.type !== type), { type, payload, userId: getAuthUserId(), timestamp: Date.now() }].slice(-50),
    }));
  },

  flushPendingSyncs: async () => {
    if (!navigator.onLine) return;
    const uid = getAuthUserId();
    // Snapshots queued under another account (A -> B switch) must never be uploaded
    // under this session nor block the queue: drop them.
    const all = get().pendingSyncs || [];
    const mine = all.filter((p) => !p.userId || !uid || p.userId === uid);
    if (mine.length !== all.length) set({ pendingSyncs: mine });
    if (!mine.length) return;
    const done = [];
    for (const item of mine) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) continue;
        if (item.userId && item.userId !== session.user.id) { done.push(item); continue; }
        if (item.type === "health") {
          // Merge remote first and upload the fresh state, never the stale snapshot:
          // it could otherwise overwrite newer edits made on another device.
          await get().loadHealthFromDB();
          if (await syncHealthToDB(get, set)) done.push(item);
        } else if (item.type === "gym") {
          const { error: gymFlushError } = await withTimeout(supabase.from("profiles").update({ gym_data: item.payload }).eq("id", session.user.id));
          if (gymFlushError) throw gymFlushError;
          done.push(item);
        } else {
          done.push(item); // unknown type: drop so it cannot block
        }
      } catch {
        // keep for the next attempt
      }
    }
    // Remove only what we processed; items queued meanwhile survive.
    set((s) => ({ pendingSyncs: (s.pendingSyncs || []).filter((p) => !done.some((d) => d.type === p.type && d.timestamp === p.timestamp)) }));
  },

  // Upload current local state to Supabase immediately (called on app open)
  syncHealthToDB: async () => {
    get().setSyncStatus?.("saving");
    try {
      const ok = await syncHealthToDB(get, set);
      get().setSyncStatus?.(ok ? "saved" : "error");
    } catch {
      get().setSyncStatus?.("error");
    }
  },

  loadHealthFromDB: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const { data } = await supabase.from("profiles").select("health_data").eq("id", session.user.id).single();
      if (data?.health_data) {
        const hd = data.health_data;
        // Union by key with tombstones: deleted entries do not come back, the newer
        // updatedAt wins, cleared plan/competition do not resurrect (see healthMerge.js).
        const local = get();
        set({
          ...mergeHealthData(local, hd),
          // Scalars: local wins if it's non-default; otherwise fall back to remote
          waterGoal:       (local.waterGoal && local.waterGoal !== 8) ? local.waterGoal : (hd.water_goal || local.waterGoal || 8),
          // Settings synced via health_data — remote wins if local is still at default
          userGoal:      (local.userGoal && local.userGoal !== "mantenimiento")  ? local.userGoal      : (hd.user_goal      || local.userGoal      || "mantenimiento"),
          customKcal:    local.customKcal    || hd.custom_kcal    || "",
          activityLevel: (local.activityLevel && local.activityLevel !== "moderado") ? local.activityLevel : (hd.activity_level || local.activityLevel || "moderado"),
          weeklyGoal:    (local.weeklyGoal   && local.weeklyGoal   !== 4)            ? local.weeklyGoal    : (hd.weekly_goal   || local.weeklyGoal   || 4),
        });
      }
    } catch (e) { /* column may not exist */ }
  },

  logWeight: (kg) => {
    const parsed = Number(String(kg || "").replace(/,/g, "."));
    if (!parsed || isNaN(parsed)) return;
    const entry = { date: today(), kg: parsed, updatedAt: Date.now() };
    set((s) => ({
      weightLog: [entry, ...(s.weightLog || []).filter((e) => e.date !== entry.date)].slice(0, 90),
    }));
    queueHealthSync(get, set);
  },

  logRestDay: () => {
    const entry = { date: today(), updatedAt: Date.now() };
    set((s) => ({
      restDays: [entry, ...(s.restDays || []).filter((e) => e.date !== entry.date)].slice(0, 90),
    }));
    queueHealthSync(get, set);
  },

  logCardio: (session) => {
    const s = { id: uid("cardio"), date: today(), ...session, updatedAt: Date.now() };
    set((state) => ({ cardioHistory: [s, ...(state.cardioHistory || [])] }));
    queueHealthSync(get, set);
  },
  deleteCardio: (id) => {
    set((s) => ({ cardioHistory: (s.cardioHistory || []).filter((c) => c.id !== id), ...tomb(s, "cardioHistory", id) }));
    queueHealthSync(get, set);
  },

  logMeal: (meal) => {
    const m = { id: uid("meal"), date: today(), ...meal, user_id: getAuthUserId(), updatedAt: Date.now() };
    set((s) => ({ mealLog: [m, ...(s.mealLog || [])] }));
    queueHealthSync(get, set);
  },
  deleteMeal: (id) => {
    set((s) => ({ mealLog: (s.mealLog || []).filter((m) => m.id !== id), ...tomb(s, "mealLog", id) }));
    queueHealthSync(get, set);
  },

  saveMealCombo: (name, meals) => {
    const combo = { id: uid("combo"), name: String(name).trim(), meals, updatedAt: Date.now() };
    set((s) => ({ savedMealCombos: [combo, ...(s.savedMealCombos || [])] }));
    queueHealthSync(get, set);
  },
  deleteMealCombo: (id) => {
    set((s) => ({ savedMealCombos: (s.savedMealCombos || []).filter((c) => c.id !== id), ...tomb(s, "savedMealCombos", id) }));
    queueHealthSync(get, set);
  },
  saveNutritionPlan: (plan) => {
    set({ nutritionPlan: plan, nutritionPlanUpdatedAt: Date.now() });
    queueHealthSync(get, set);
  },
  clearNutritionPlan: () => {
    set({ nutritionPlan: null, nutritionPlanUpdatedAt: Date.now() });
    queueHealthSync(get, set);
  },

  logMealCombo: (comboId) => {
    const combo = (get().savedMealCombos || []).find((c) => c.id === comboId);
    if (!combo) return;
    const todayDate = today();
    const newMeals = combo.meals.map((m) => ({ id: uid("meal"), date: todayDate, ...m, user_id: getAuthUserId(), updatedAt: Date.now() }));
    set((s) => ({ mealLog: [...newMeals, ...(s.mealLog || [])] }));
    queueHealthSync(get, set);
  },

  logSleep: (hours) => {
    const date = today();
    set((s) => ({ sleepLog: [{ date, hours: Number(hours), updatedAt: Date.now() }, ...(s.sleepLog || []).filter((e) => e.date !== date)].slice(0, 90) }));
    queueHealthSync(get, set);
  },
  logWater: (glasses) => {
    const date = today();
    set((s) => ({ waterLog: [{ date, glasses: Number(glasses), updatedAt: Date.now() }, ...(s.waterLog || []).filter((e) => e.date !== date)].slice(0, 90) }));
    queueHealthSync(get, set);
  },
  setWaterGoal: (goal) => {
    set({ waterGoal: Number(goal) });
    queueHealthSync(get, set);
  },

  setCompetitionMode: (date, name) => {
    set({ competitionDate: date, competitionName: name, competitionUpdatedAt: Date.now() });
    queueHealthSync(get, set);
  },
  clearCompetitionMode: () => {
    set({ competitionDate: null, competitionName: "", competitionUpdatedAt: Date.now() });
    queueHealthSync(get, set);
  },

  start30DayChallenge: (exercise) => {
    const id = uid("ch");
    set((s) => ({ activeChallenges: [{ id, type: "30day", exercise, startDate: today(), targetDays: 30, completedDays: [], updatedAt: Date.now() }, ...(s.activeChallenges || [])] }));
    queueHealthSync(get, set);
  },
  markChallengeDay: (id) => {
    const date = today();
    set((s) => ({ activeChallenges: (s.activeChallenges || []).map((c) => c.id === id && !c.completedDays.includes(date) ? { ...c, completedDays: [...c.completedDays, date], updatedAt: Date.now() } : c) }));
    queueHealthSync(get, set);
  },
  deleteChallenge: (id) => {
    set((s) => ({ activeChallenges: (s.activeChallenges || []).filter((c) => c.id !== id), ...tomb(s, "activeChallenges", id) }));
    queueHealthSync(get, set);
  },

  addProgressPhoto: (photoSource, note) => {
    const isUrl = typeof photoSource === "string" && photoSource.startsWith("http");
    const photo = {
      id: uid("photo"),
      date: today(),
      dataUrl: isUrl ? null : photoSource,
      url: isUrl ? photoSource : null,
      note: note || "",
    };
    set((s) => ({ progressPhotos: [photo, ...(s.progressPhotos || [])].slice(0, 50) }));
    queueHealthSync(get, set);
  },
  deleteProgressPhoto: (id) => {
    set((s) => ({ progressPhotos: (s.progressPhotos || []).filter((p) => p.id !== id), ...tomb(s, "progressPhotos", id) }));
    queueHealthSync(get, set);
  },
  // Edita un registro de comida (gramos, tipo, macros). No cambia id, fecha ni usuario.
  updateMeal: (id, patch) => {
    const { id: _i, date: _d, user_id: _u, ...safe } = patch || {};
    set((s) => ({ mealLog: (s.mealLog || []).map((m) => (m.id === id ? { ...m, ...safe, updatedAt: Date.now() } : m)) }));
    queueHealthSync(get, set);
  },
});
