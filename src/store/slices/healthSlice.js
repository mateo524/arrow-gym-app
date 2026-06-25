import { todayLocal } from "../../lib/dates.js";
import { supabase } from "../../lib/supabase.js";

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function today() {
  return todayLocal();
}

let syncTimer = null;
function debouncedSync(getState) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    const s = getState();
    const userId = supabase?.auth?.getSession()?.then?.() || null;
    // We can't easily get userId here, so we use a different approach
  }, 1000);
}

async function syncHealthToDB(state) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const payload = {
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
    };
    await supabase.from("profiles").update({ health_data: payload }).eq("id", session.user.id);
  } catch (e) {
    // Silently fail — table or column may not exist yet
  }
}

let healthSyncQueued = false;
function queueHealthSync(getState) {
  if (healthSyncQueued) return;
  healthSyncQueued = true;
  setTimeout(() => {
    healthSyncQueued = false;
    syncHealthToDB(getState());
  }, 800);
}

export const createHealthSlice = (set, get) => ({
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

  loadHealthFromDB: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const { data } = await supabase.from("profiles").select("health_data").eq("id", session.user.id).single();
      if (data?.health_data) {
        const hd = data.health_data;
        set({
          weightLog: hd.weight_log || [],
          mealLog: hd.meal_log || [],
          sleepLog: hd.sleep_log || [],
          waterLog: hd.water_log || [],
          waterGoal: hd.water_goal || 8,
          restDays: hd.rest_days || [],
          cardioHistory: hd.cardio_history || [],
          savedMealCombos: hd.saved_meal_combos || [],
          nutritionPlan: hd.nutrition_plan || null,
          activeChallenges: hd.active_challenges || [],
          progressPhotos: hd.progress_photos || [],
          competitionDate: hd.competition_date || null,
          competitionName: hd.competition_name || "",
        });
      }
    } catch (e) { /* column may not exist */ }
  },

  logWeight: (kg) => {
    const entry = { date: today(), kg: Number(kg) };
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
