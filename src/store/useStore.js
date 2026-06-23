import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createWorkoutSlice, ROUTINES } from "./slices/workoutSlice.js";
import { createSettingsSlice } from "./slices/settingsSlice.js";
import { createHealthSlice } from "./slices/healthSlice.js";
import { createExerciseSlice } from "./slices/exerciseSlice.js";

const useStore = create(
  persist(
    (...a) => ({
      ...createWorkoutSlice(...a),
      ...createSettingsSlice(...a),
      ...createHealthSlice(...a),
      ...createExerciseSlice(...a),
    }),
    {
      name: "loop-gym-v4",
      version: 4,
      partialize: (state) => {
        const { currentPage, selectedWorkoutId, ...rest } = state;
        return rest;
      },
    }
  )
);

export default useStore;
export { ROUTINES };
