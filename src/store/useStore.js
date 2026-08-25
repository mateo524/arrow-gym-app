import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// One-time cleanup: the pre-createJSONStorage bug stored "[object Object]" literally.
// Clear it so Zustand starts clean instead of falling back to defaults silently.
(function () {
  try {
    const raw = localStorage.getItem("loop-gym-v4");
    if (raw && !raw.trim().startsWith("{")) {
      localStorage.removeItem("loop-gym-v4");
    }
  } catch {}
})();
import { createWorkoutSlice, ROUTINES } from "./slices/workoutSlice.js";
import { createSettingsSlice } from "./slices/settingsSlice.js";
import { createHealthSlice } from "./slices/healthSlice.js";
import { createExerciseSlice } from "./slices/exerciseSlice.js";
import { createCoachSlice } from "./slices/coachSlice.js";
import { createNotificationSlice } from "./slices/notificationSlice.js";

// localStorage quota guard: free space incrementally when storage is full.
// safeSetItem receives a JSON string (createJSONStorage serializes before calling).
// IMPORTANT: never delete the store key — partial data beats total data loss.
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e.name !== "QuotaExceededError" && e.code !== 22) return;
    let saved = false;
    try {
      const parsed = JSON.parse(value);
      const st = parsed?.state;
      if (st) {
        // Strategy 1: drop the 20 oldest workouts
        if (Array.isArray(st.workouts) && st.workouts.length > 20) {
          st.workouts = st.workouts.slice(0, st.workouts.length - 20);
        }
        // Strategy 2: keep only the 5 most recent coach reports
        if (Array.isArray(st.coachReports) && st.coachReports.length > 5) {
          st.coachReports = st.coachReports.slice(0, 5);
        }
        // Strategy 3: cap custom foods at 50
        if (Array.isArray(st.customFoods) && st.customFoods.length > 50) {
          st.customFoods = st.customFoods.slice(0, 50);
        }
        try {
          localStorage.setItem(key, JSON.stringify(parsed));
          saved = true;
        } catch {}
      }
    } catch {}
    if (!saved) {
      // Could not free enough space — log the error clearly so it surfaces in the console.
      // Do NOT remove the key: stale data is better than no data.
      console.error("[loop-gym] QuotaExceededError: could not free enough localStorage space. Data was NOT removed. Check storage usage.");
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
      ...createCoachSlice(...a.slice(0, 2)),
      ...createNotificationSlice(...a),
    }),
    {
      name: "loop-gym-v4",
      version: 4,
      storage: quotaStorage,
      partialize: (state) => {
        const { currentPage, selectedWorkoutId, currentPRCard, _rehydrated, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (state) state._rehydrated = true;
      },
    }
  )
);

export default useStore;
export { ROUTINES };
