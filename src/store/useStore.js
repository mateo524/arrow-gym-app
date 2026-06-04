import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXERCISE_DATABASE, findExerciseMeta, resolveExerciseGroup, resolveExerciseMuscle } from "../data/exerciseDatabase.js";
import { ROUTINES } from "../data/seedData.js";
import { buildCoachReport, hydrateSet } from "../lib/analytics.js";
import { loadInitialWorkouts, normalizeSet } from "../lib/storageMigration.js";

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sameExercise(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

function getLastCompletedSet(workouts, exercise) {
  const ordered = [...(workouts || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  for (const workout of ordered) {
    const sets = [...(workout.sets || [])].reverse();
    const found = sets.find((set) => sameExercise(set.exercise, exercise) && (set.weight !== "" || set.reps !== ""));
    if (found) return found;
  }
  return null;
}

function getExerciseStats(workouts, exercise) {
  const matchedWorkouts = (workouts || []).filter((workout) => (workout.sets || []).some((set) => sameExercise(set.exercise, exercise)));
  const lastWorkout = [...matchedWorkouts].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
  const lastSets = (lastWorkout?.sets || []).filter((set) => sameExercise(set.exercise, exercise));
  const lastCompleted = getLastCompletedSet(workouts, exercise);

  return {
    lastWeight: lastCompleted?.weight ?? "",
    lastReps: lastCompleted?.reps ?? "",
    lastSets: lastSets.length || 0,
    lastDate: lastWorkout?.date || null,
  };
}

function makeSet(exercise, weight = "", reps = "", workouts = []) {
  const meta = findExerciseMeta(exercise) || {};
  const stats = getExerciseStats(workouts, exercise);
  return {
    id: uid("set"),
    exercise,
    weight,
    reps,
    group: meta.group || resolveExerciseGroup(exercise),
    muscle: meta.muscle || resolveExerciseMuscle(exercise),
    equipment: meta.equipment || "",
    lastWeight: stats.lastWeight,
    lastReps: stats.lastReps,
    lastSets: stats.lastSets,
    lastDate: stats.lastDate,
  };
}

function makePrefilledSet(exercise, workouts) {
  const stats = getExerciseStats(workouts, exercise);
  return makeSet(exercise, stats.lastWeight || "", stats.lastReps || "", workouts);
}

const useStore = create(
  persist(
    (set, get) => ({
      currentPage: "home",
      selectedWorkoutId: null,
      workouts: loadInitialWorkouts(),
      coachReports: [],
      activeWorkout: null,
      customExercises: [],
      recentExercises: [],
      favoriteExercises: [],

      coachBadge: false,

      clearCoachBadge: () => set({ coachBadge: false }),

      setPage: (page) => {
        const state = get();
        if (page === "coach") {
          set({ currentPage: page, coachBadge: false });
        } else {
          const hasReports = (state.coachReports?.length || 0) > 0;
          set({ currentPage: page, coachBadge: hasReports });
        }
      },
      openWorkout: (id) => set({ selectedWorkoutId: id, currentPage: "workoutDetail" }),

      getCatalog: () => {
        const map = new Map(EXERCISE_DATABASE.map((exercise) => [exercise.name.toLowerCase(), exercise]));
        (get().customExercises || []).forEach((exercise) => map.set(exercise.name.toLowerCase(), exercise));
        return Array.from(map.values());
      },

      getExerciseStats: (exercise) => getExerciseStats(get().workouts, exercise),

      trackExercisePick: (exerciseName) => {
        set((state) => {
          const recent = [exerciseName, ...state.recentExercises.filter((e) => e !== exerciseName)].slice(0, 5);
          return { recentExercises: recent };
        });
      },

      toggleFavorite: (exerciseName) => {
        set((state) => {
          const exists = state.favoriteExercises.includes(exerciseName);
          return { favoriteExercises: exists ? state.favoriteExercises.filter((e) => e !== exerciseName) : [...state.favoriteExercises, exerciseName] };
        });
      },

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
        set((state) => ({ customExercises: [exercise, ...state.customExercises.filter((item) => item.name.toLowerCase() !== name.toLowerCase())] }));
      },

      startWorkout: (type) => {
        const routine = ROUTINES[type] || [];
        const workouts = get().workouts || [];
        set({
          activeWorkout: {
            id: uid("workout"),
            type,
            date: today(),
            sets: routine.map((exercise) => makePrefilledSet(exercise, workouts)),
          },
          currentPage: "workout",
        });
      },

      startEmptyWorkout: () => set({ activeWorkout: { id: uid("workout"), type: "Libre", date: today(), sets: [] }, currentPage: "workout" }),

      addExerciseToActiveWorkout: (exercise) => {
        const name = typeof exercise === "string" ? exercise : exercise.name;
        const workouts = get().workouts || [];
        set((state) => ({
          activeWorkout: state.activeWorkout
            ? { ...state.activeWorkout, sets: [...state.activeWorkout.sets, makePrefilledSet(name, workouts)] }
            : state.activeWorkout,
        }));
      },

      addSeriesToExercise: (exercise, copyLast = true) => {
        const active = get().activeWorkout;
        if (!active) return;
        const sameExerciseSets = (active.sets || []).filter((setItem) => sameExercise(setItem.exercise, exercise));
        const source = sameExerciseSets[sameExerciseSets.length - 1];
        const workouts = get().workouts || [];
        const next = makeSet(
          exercise,
          copyLast && source ? source.weight : "",
          copyLast && source ? source.reps : "",
          workouts
        );
        set({ activeWorkout: { ...active, sets: [...active.sets, next] } });
      },

      updateActiveSet: (id, patch) => set((state) => ({
        activeWorkout: state.activeWorkout
          ? { ...state.activeWorkout, sets: state.activeWorkout.sets.map((setItem) => (setItem.id === id ? hydrateSet({ ...setItem, ...patch }) : setItem)) }
          : state.activeWorkout,
      })),

      repeatSet: (id) => {
        const active = get().activeWorkout;
        const found = active?.sets?.find((setItem) => setItem.id === id);
        if (!active || !found) return;
        set({ activeWorkout: { ...active, sets: [...active.sets, { ...found, id: uid("set") }] } });
      },

      removeActiveSet: (id) => set((state) => ({
        activeWorkout: state.activeWorkout
          ? { ...state.activeWorkout, sets: state.activeWorkout.sets.filter((setItem) => setItem.id !== id) }
          : state.activeWorkout,
      })),

      finishWorkout: () => {
        const active = get().activeWorkout;
        if (!active) return;
        const clean = {
          ...active,
          sets: active.sets
            .filter((setItem) => setItem.exercise && (setItem.weight !== "" || setItem.reps !== ""))
            .map(normalizeSet),
        };
        if (!clean.sets.length) return;
        const report = buildCoachReport(clean, get().workouts);
        const existingPrs = get().prs || [];
        const history = get().workouts || [];
        const prs = [];
        clean.sets.forEach((set) => {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          if (!w || !r) return;
          const prev = history.flatMap((w) => w.sets || []).filter((s) => s.exercise === set.exercise);
          const maxWeight = Math.max(...prev.map((s) => Number(s.weight) || 0), 0);
          const maxReps = Math.max(...prev.map((s) => Number(s.reps) || 0), 0);
          const isWeightPr = w > maxWeight;
          const isRepsPr = r > maxReps && w >= maxWeight;
          if (isWeightPr || isRepsPr) {
            prs.push({ exercise: set.exercise, weight: w, reps: r, type: isWeightPr ? "weight" : "reps", date: clean.date });
          }
        });
        const newPrs = [...prs, ...existingPrs].slice(0, 20);
        set((state) => ({
          workouts: [clean, ...state.workouts.filter((item) => item.id !== clean.id)],
          coachReports: [report, ...state.coachReports.filter((item) => item.workoutId !== clean.id)],
          selectedWorkoutId: clean.id,
          activeWorkout: null,
          currentPage: "coach",
          coachBadge: false,
          prs: newPrs,
        }));
      },

      cancelWorkout: () => set({ activeWorkout: null, currentPage: "home" }),
    }),
    { name: "arrow-gym-v4", version: 4 }
  )
);

export default useStore;
export { ROUTINES };
