import { todayLocal } from "../../lib/dates.js";

export function createCoachSlice(set) {
  return {
    // Pre-session readiness: { score: 1-5, date: "YYYY-MM-DD" } — resets each day
    readiness: null,

    // Hint auto-suppression: { [type]: { count, lastDismissed: ISO } }
    hintFeedback: {},

    // Per-exercise progression targets + loop closure:
    // { [exercise]: { targetWeight, lastSuggested: { weight, date }, lastActual: { weight, reps, date } } }
    progressionTargets: {},

    setReadiness: (score) => set({ readiness: { score: Number(score), date: todayLocal() } }),

    dismissHint: (type) => set(state => {
      const prev = state.hintFeedback[type] || { count: 0 };
      return {
        hintFeedback: {
          ...state.hintFeedback,
          [type]: { count: prev.count + 1, lastDismissed: new Date().toISOString() },
        },
      };
    }),

    recordSuggestion: (exercise, suggestedWeight) => set(state => ({
      progressionTargets: {
        ...state.progressionTargets,
        [exercise]: {
          ...(state.progressionTargets[exercise] || {}),
          lastSuggested: { weight: suggestedWeight, date: todayLocal() },
        },
      },
    })),

    recordActual: (exercise, weight, reps) => set(state => ({
      progressionTargets: {
        ...state.progressionTargets,
        [exercise]: {
          ...(state.progressionTargets[exercise] || {}),
          lastActual: { weight: Number(weight), reps: Number(reps), date: todayLocal() },
        },
      },
    })),
  };
}
