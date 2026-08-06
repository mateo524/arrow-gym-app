import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createWorkoutSlice, ROUTINES } from "./slices/workoutSlice.js";
import { createSettingsSlice } from "./slices/settingsSlice.js";
import { createHealthSlice } from "./slices/healthSlice.js";
import { createExerciseSlice } from "./slices/exerciseSlice.js";
import { createCoachSlice } from "./slices/coachSlice.js";

// localStorage quota guard: drop oldest workouts if storage is full.
// safeSetItem receives a JSON string (createJSONStorage serializes before calling).
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
      try {
        const parsed = JSON.parse(value);
        if (parsed?.state?.workouts?.length > 20) {
          parsed.state.workouts = parsed.state.workouts.slice(0, parsed.state.workouts.length - 20);
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  }
}

const quotaStorage = createJSONStorage(() => ({
  getItem: (key) => localStorage.getItem(key),
  setItem: safeSetItem,
  removeItem: (key) => localStorage.removeItem(key),
}));

const useStore = create(
  persist(
    (...a) => ({
      ...createWorkoutSlice(...a),
      ...createSettingsSlice(...a),
      ...createHealthSlice(...a),
      ...createExerciseSlice(...a),
      ...createCoachSlice(...a),
    }),
    {
      name: "loop-gym-v4",
      version: 4,
      storage: quotaStorage,
      partialize: (state) => {
        const { currentPage, selectedWorkoutId, progressPhotos, currentPRCard, ...rest } = state;
        return rest;
      },
    }
  )
);

export default useStore;
export { ROUTINES };
