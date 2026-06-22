import { EXERCISE_DATABASE, findExerciseMeta, resolveExerciseGroup, resolveExerciseMuscle } from "../../data/exerciseDatabase.js";

export const createExerciseSlice = (set, get) => ({
  customExercises: [],
  recentExercises: [],
  favoriteExercises: [],
  favorites: [],
  exerciseNotes: {},

  getCatalog: () => {
    const map = new Map(EXERCISE_DATABASE.map((e) => [e.name.toLowerCase(), e]));
    (get().customExercises || []).forEach((e) => map.set(e.name.toLowerCase(), e));
    return Array.from(map.values());
  },

  trackExercisePick: (exerciseName) => {
    set((s) => ({
      recentExercises: [exerciseName, ...(s.recentExercises || []).filter((e) => e !== exerciseName)].slice(0, 5),
    }));
  },

  toggleFavorite: (exerciseName) => {
    set((s) => {
      const exists = (s.favoriteExercises || []).includes(exerciseName);
      return { favoriteExercises: exists ? s.favoriteExercises.filter((e) => e !== exerciseName) : [...(s.favoriteExercises || []), exerciseName] };
    });
  },

  toggleFavoriteExercise: (name) => set((s) => ({
    favorites: (s.favorites || []).includes(name)
      ? (s.favorites || []).filter((f) => f !== name)
      : [...(s.favorites || []), name],
  })),

  setExerciseNote: (name, note) => set((s) => ({
    exerciseNotes: { ...(s.exerciseNotes || {}), [name]: note },
  })),

  addCustomExercise: (payload) => {
    const name = String(payload.name || "").trim();
    if (!name) return;
    const exercise = {
      id: `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      group: payload.group || "Core",
      muscle: payload.muscle || payload.group || "General",
      equipment: payload.equipment || "Custom",
      pattern: payload.pattern || "custom",
      builtin: false,
    };
    set((s) => ({ customExercises: [exercise, ...(s.customExercises || []).filter((item) => item.name.toLowerCase() !== name.toLowerCase())] }));
  },
});
