import { todayLocal } from "../../lib/dates.js";
import { supabase } from "../../lib/supabase.js";

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
    progress_photos: state.progressPhotos || [],
    competition_date: state.competitionDate,
    competition_name: state.competitionName,
    // Settings that live in settingsSlice — included so they survive localStorage wipes
    user_goal: state.userGoal || "mantenimiento",
    custom_kcal: state.customKcal || "",
    activity_level: state.activityLevel || "moderado",
    weekly_goal: state.weeklyGoal || 4,
  };
}

async function syncHealthToDB(state) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    await supabase.from("profiles").update({ health_data: buildHealthPayload(state) }).eq("id", session.user.id);
  } catch (e) {
    // Silently fail — table or column may not exist yet
  }
}

let healthSyncQueued = false;
function queueHealthSync(get) {
  if (healthSyncQueued) return;
  healthSyncQueued = true;
  setTimeout(() => {
    healthSyncQueued = false;
    const state = get();
    if (!navigator.onLine) {
      state.queueSync("health", buildHealthPayload(state));
    } else {
      syncHealthToDB(state);
    }
  }, 200);
}

export const createHealthSlice = (set, get) => ({
  bodyMetrics: [],
  addBodyMetric: (entry) => set(s => ({ bodyMetrics: [...(s.bodyMetrics || []), entry] })),

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

  queueSync: (type, payload) => {
    set(s => ({
      pendingSyncs: [...(s.pendingSyncs || []), { type, payload, timestamp: Date.now() }].slice(-50),
    }));
  },

  flushPendingSyncs: async () => {
    const pending = get().pendingSyncs || [];
    if (!pending.length || !navigator.onLine) return;
    const failed = [];
    for (const item of pending) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) { failed.push(item); continue; }
        if (item.type === "health") {
          await supabase.from("profiles").update({ health_data: item.payload }).eq("id", session.user.id);
        } else if (item.type === "gym") {
          await supabase.from("profiles").update({ gym_data: item.payload }).eq("id", session.user.id);
        }
      } catch {
        failed.push(item);
      }
    }
    set({ pendingSyncs: failed });
  },

  // Upload current local state to Supabase immediately (called on app open)
  syncHealthToDB: async () => {
    await syncHealthToDB(get());
  },

  loadHealthFromDB: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const { data } = await supabase.from("profiles").select("health_data").eq("id", session.user.id).single();
      if (data?.health_data) {
        const hd = data.health_data;
        // Merge arrays by id — never discard locally-stored entries.
        // Remote wins for scalar fields; for arrays we take the union.
        const mergeById = (local, remote) => {
          if (!remote?.length) return local || [];
          if (!local?.length) return remote;
          const seen = new Set(local.map(x => x.id));
          return [...local, ...remote.filter(x => !seen.has(x.id))];
        };
        const local = get();
        set({
          // Arrays: union of local + remote so no entry is ever lost
          weightLog:       mergeById(local.weightLog,       hd.weight_log),
          mealLog:         mergeById(local.mealLog,         hd.meal_log),
          sleepLog:        mergeById(local.sleepLog,        hd.sleep_log),
          waterLog:        mergeById(local.waterLog,        hd.water_log),
          restDays:        mergeById(local.restDays,        hd.rest_days),
          cardioHistory:   mergeById(local.cardioHistory,   hd.cardio_history),
          savedMealCombos: mergeById(local.savedMealCombos, hd.saved_meal_combos),
          activeChallenges:mergeById(local.activeChallenges,hd.active_challenges),
          progressPhotos:  mergeById(local.progressPhotos,  hd.progress_photos),
          // Scalars: local wins if it's non-default; otherwise fall back to remote
          waterGoal:       local.waterGoal       ?? hd.water_goal       ?? 8,
          nutritionPlan:   local.nutritionPlan   ?? hd.nutrition_plan   ?? null,
          competitionDate: local.competitionDate ?? hd.competition_date ?? null,
          competitionName: local.competitionName ?? hd.competition_name ?? "",
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
    const entry = { date: today(), kg: parsed };
    set((s) => ({
      weightLog: [entry, ...(s.weightLog || []).filter((e) => e.date !== entry.date)].slice(0, 90),
    }));
    queueHealthSync(get);
  },

  logRestDay: () => {
    const entry = { date: today() };
    set((s) => ({
      restDays: [entry, ...(s.restDays || []).filter((e) => e.date !== entry.date)].slice(0, 90),
    }));
    queueHealthSync(get);
  },

  logCardio: (session) => {
    const s = { id: uid("cardio"), date: today(), ...session };
    set((state) => ({ cardioHistory: [s, ...(state.cardioHistory || [])] }));
    queueHealthSync(get);
  },
  deleteCardio: (id) => {
    set((s) => ({ cardioHistory: (s.cardioHistory || []).filter((c) => c.id !== id) }));
    queueHealthSync(get);
  },

  logMeal: (meal) => {
    const m = { id: uid("meal"), date: today(), ...meal };
    set((s) => ({ mealLog: [m, ...(s.mealLog || [])] }));
    queueHealthSync(get);
  },
  deleteMeal: (id) => {
    set((s) => ({ mealLog: (s.mealLog || []).filter((m) => m.id !== id) }));
    queueHealthSync(get);
  },

  saveMealCombo: (name, meals) => {
    const combo = { id: uid("combo"), name: String(name).trim(), meals };
    set((s) => ({ savedMealCombos: [combo, ...(s.savedMealCombos || [])] }));
    queueHealthSync(get);
  },
  deleteMealCombo: (id) => {
    set((s) => ({ savedMealCombos: (s.savedMealCombos || []).filter((c) => c.id !== id) }));
    queueHealthSync(get);
  },
  saveNutritionPlan: (plan) => {
    set({ nutritionPlan: plan });
    queueHealthSync(get);
  },
  clearNutritionPlan: () => {
    set({ nutritionPlan: null });
    queueHealthSync(get);
  },

  logMealCombo: (comboId) => {
    const combo = (get().savedMealCombos || []).find((c) => c.id === comboId);
    if (!combo) return;
    const todayDate = today();
    const newMeals = combo.meals.map((m) => ({ id: uid("meal"), date: todayDate, ...m }));
    set((s) => ({ mealLog: [...newMeals, ...(s.mealLog || [])] }));
    queueHealthSync(get);
  },

  logSleep: (hours) => {
    const date = today();
    set((s) => ({ sleepLog: [{ date, hours: Number(hours) }, ...(s.sleepLog || []).filter((e) => e.date !== date)].slice(0, 90) }));
    queueHealthSync(get);
  },
  logWater: (glasses) => {
    const date = today();
    set((s) => ({ waterLog: [{ date, glasses: Number(glasses) }, ...(s.waterLog || []).filter((e) => e.date !== date)].slice(0, 90) }));
    queueHealthSync(get);
  },
  setWaterGoal: (goal) => {
    set({ waterGoal: Number(goal) });
    queueHealthSync(get);
  },

  setCompetitionMode: (date, name) => {
    set({ competitionDate: date, competitionName: name });
    queueHealthSync(get);
  },
  clearCompetitionMode: () => {
    set({ competitionDate: null, competitionName: "" });
    queueHealthSync(get);
  },

  start30DayChallenge: (exercise) => {
    const id = uid("ch");
    set((s) => ({ activeChallenges: [{ id, type: "30day", exercise, startDate: today(), targetDays: 30, completedDays: [] }, ...(s.activeChallenges || [])] }));
    queueHealthSync(get);
  },
  markChallengeDay: (id) => {
    const date = today();
    set((s) => ({ activeChallenges: (s.activeChallenges || []).map((c) => c.id === id && !c.completedDays.includes(date) ? { ...c, completedDays: [...c.completedDays, date] } : c) }));
    queueHealthSync(get);
  },
  deleteChallenge: (id) => {
    set((s) => ({ activeChallenges: (s.activeChallenges || []).filter((c) => c.id !== id) }));
    queueHealthSync(get);
  },

  addProgressPhoto: (dataUrl, note) => {
    const photo = { id: uid("photo"), date: today(), dataUrl, note: note || "" };
    set((s) => ({ progressPhotos: [photo, ...(s.progressPhotos || [])].slice(0, 50) }));
    queueHealthSync(get);
  },
  deleteProgressPhoto: (id) => {
    set((s) => ({ progressPhotos: (s.progressPhotos || []).filter((p) => p.id !== id) }));
    queueHealthSync(get);
  },
});
