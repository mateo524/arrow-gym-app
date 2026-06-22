function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function today() {
  return new Date().toISOString().slice(0, 10);
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

  logWeight: (kg) => {
    const entry = { date: today(), kg: Number(kg) };
    set((s) => ({
      weightLog: [entry, ...(s.weightLog || []).filter((e) => e.date !== entry.date)].slice(0, 90),
    }));
  },

  logRestDay: () => {
    const entry = { date: today() };
    set((s) => ({
      restDays: [entry, ...(s.restDays || []).filter((e) => e.date !== entry.date)].slice(0, 90),
    }));
  },

  logCardio: (session) => {
    const s = { id: uid("cardio"), date: today(), ...session };
    set((state) => ({ cardioHistory: [s, ...(state.cardioHistory || [])] }));
  },
  deleteCardio: (id) => set((s) => ({ cardioHistory: (s.cardioHistory || []).filter((c) => c.id !== id) })),

  logMeal: (meal) => {
    const m = { id: uid("meal"), date: today(), ...meal };
    set((s) => ({ mealLog: [m, ...(s.mealLog || [])] }));
  },
  deleteMeal: (id) => set((s) => ({ mealLog: (s.mealLog || []).filter((m) => m.id !== id) })),

  saveMealCombo: (name, meals) => {
    const combo = { id: uid("combo"), name: String(name).trim(), meals };
    set((s) => ({ savedMealCombos: [combo, ...(s.savedMealCombos || [])] }));
  },
  deleteMealCombo: (id) => set((s) => ({ savedMealCombos: (s.savedMealCombos || []).filter((c) => c.id !== id) })),
  saveNutritionPlan: (plan) => set({ nutritionPlan: plan }),
  clearNutritionPlan: () => set({ nutritionPlan: null }),

  logMealCombo: (comboId) => {
    const combo = (get().savedMealCombos || []).find((c) => c.id === comboId);
    if (!combo) return;
    const todayDate = today();
    const newMeals = combo.meals.map((m) => ({ id: uid("meal"), date: todayDate, ...m }));
    set((s) => ({ mealLog: [...newMeals, ...(s.mealLog || [])] }));
  },

  logSleep: (hours) => {
    const date = today();
    set((s) => ({ sleepLog: [{ date, hours: Number(hours) }, ...(s.sleepLog || []).filter((e) => e.date !== date)].slice(0, 90) }));
  },
  logWater: (glasses) => {
    const date = today();
    set((s) => ({ waterLog: [{ date, glasses: Number(glasses) }, ...(s.waterLog || []).filter((e) => e.date !== date)].slice(0, 90) }));
  },
  setWaterGoal: (goal) => set({ waterGoal: Number(goal) }),

  setCompetitionMode: (date, name) => set({ competitionDate: date, competitionName: name }),
  clearCompetitionMode: () => set({ competitionDate: null, competitionName: "" }),

  start30DayChallenge: (exercise) => {
    const id = uid("ch");
    set((s) => ({ activeChallenges: [{ id, type: "30day", exercise, startDate: today(), targetDays: 30, completedDays: [] }, ...(s.activeChallenges || [])] }));
  },
  markChallengeDay: (id) => {
    const date = today();
    set((s) => ({ activeChallenges: (s.activeChallenges || []).map((c) => c.id === id && !c.completedDays.includes(date) ? { ...c, completedDays: [...c.completedDays, date] } : c) }));
  },
  deleteChallenge: (id) => set((s) => ({ activeChallenges: (s.activeChallenges || []).filter((c) => c.id !== id) })),

  addProgressPhoto: (dataUrl, note) => {
    const photo = { id: uid("photo"), date: today(), dataUrl, note: note || "" };
    set((s) => ({ progressPhotos: [photo, ...(s.progressPhotos || [])].slice(0, 50) }));
  },
  deleteProgressPhoto: (id) => set((s) => ({ progressPhotos: (s.progressPhotos || []).filter((p) => p.id !== id) })),
});
