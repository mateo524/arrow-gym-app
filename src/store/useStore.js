import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXERCISE_DATABASE, findExerciseMeta, resolveExerciseGroup, resolveExerciseMuscle } from "../data/exerciseDatabase.js";
import { ROUTINES } from "../data/seedData.js";
import { buildCoachReport, hydrateSet, getExerciseStats as getAnalyticsExerciseStats } from "../lib/analytics.js";
import { buildGlobalCoachReport } from "../lib/coachEngine.js";
import { loadInitialWorkouts, loadInitialBodyMetrics, normalizeSet } from "../lib/storageMigration.js";

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

function getExerciseStatsForPrefill(workouts, exercise) {
  return getAnalyticsExerciseStats(workouts, exercise);
}

function makeSet(exercise, weight = "", reps = "", workouts = []) {
  const meta = findExerciseMeta(exercise) || {};
  const stats = getExerciseStatsForPrefill(workouts, exercise);
  return {
    id: uid("set"),
    exercise,
    weight,
    reps,
    rpe: "",
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
  const stats = getExerciseStatsForPrefill(workouts, exercise);
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
      customRoutines: [],
      bodyMetrics: loadInitialBodyMetrics(),
      globalCoachReport: null,
      showCompleteCoach: false,
      showMoreMenu: false,

      setPage: (page) => set({ currentPage: page, showMoreMenu: false }),
      toggleMoreMenu: () => set((state) => ({ showMoreMenu: !state.showMoreMenu })),
      setShowCompleteCoach: (val) => set({ showCompleteCoach: val }),
      openWorkout: (id) => set({ selectedWorkoutId: id, currentPage: "workoutDetail" }),

      getCatalog: () => {
        const map = new Map(EXERCISE_DATABASE.map((exercise) => [exercise.name.toLowerCase(), exercise]));
        (get().customExercises || []).forEach((exercise) => map.set(exercise.name.toLowerCase(), exercise));
        return Array.from(map.values());
      },

      getExerciseStats: (exercise) => getAnalyticsExerciseStats(get().workouts, exercise),

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

      startWorkoutFromRoutine: (routineId) => {
        const state = get();
        const routine = state.customRoutines.find((r) => r.id === routineId);
        if (!routine) return;
        const workouts = state.workouts || [];
        set({
          activeWorkout: {
            id: uid("workout"),
            type: routine.name,
            date: today(),
            sets: routine.exercises.map((ex) => makePrefilledSet(ex.name, workouts)),
          },
          currentPage: "workout",
        });
      },

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
        set((state) => {
          const newWorkouts = [clean, ...state.workouts.filter((item) => item.id !== clean.id)];
          const globalReport = buildGlobalCoachReport({
            workouts: newWorkouts,
            bodyMetrics: state.bodyMetrics,
            customRoutines: state.customRoutines,
            currentWorkout: clean,
            latestWorkout: clean,
          });
          return {
            workouts: newWorkouts,
            coachReports: [report, ...state.coachReports.filter((item) => item.workoutId !== clean.id)],
            globalCoachReport: globalReport,
            selectedWorkoutId: clean.id,
            activeWorkout: null,
            currentPage: "coach",
            showCompleteCoach: false,
          };
        });
      },

      cancelWorkout: () => set({ activeWorkout: null, currentPage: "home" }),

      refreshGlobalCoach: () => {
        const state = get();
        const report = buildGlobalCoachReport({
          workouts: state.workouts,
          bodyMetrics: state.bodyMetrics,
          customRoutines: state.customRoutines,
          latestWorkout: state.workouts[0],
        });
        set({ globalCoachReport: report });
      },

      addBodyMetric: (payload) => {
        const NUM = ["bodyWeight","waist","chest","rightArm","leftArm","rightLeg","leftLeg","hips","shoulders","neck"];
        const metric = { id: uid("bm"), date: payload.date || today(), createdAt: new Date().toISOString(), notes: payload.notes || "" };
        NUM.forEach((k) => { if (payload[k] != null && payload[k] !== "") metric[k] = Number(String(payload[k]).replace(",", ".")); });
        set((state) => ({ bodyMetrics: [metric, ...state.bodyMetrics] }));
        get().refreshGlobalCoach();
      },

      updateBodyMetric: (id, patch) => set((state) => {
        const NUM = ["bodyWeight","waist","chest","rightArm","leftArm","rightLeg","leftLeg","hips","shoulders","neck"];
        const clean = {};
        Object.entries(patch).forEach(([k,v]) => {
          if (NUM.includes(k)) { if (v != null && v !== "") clean[k] = Number(String(v).replace(",", ".")); }
          else clean[k] = v;
        });
        return { bodyMetrics: state.bodyMetrics.map((m) => m.id === id ? { ...m, ...clean } : m) };
      }),

      deleteBodyMetric: (id) => set((state) => ({
        bodyMetrics: state.bodyMetrics.filter((m) => m.id !== id),
      })),

      createRoutine: (payload) => {
        const routine = {
          id: uid("routine"),
          name: payload.name,
          description: payload.description || "",
          focus: payload.focus || "Full Body",
          exercises: payload.exercises || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          custom: true,
        };
        set((state) => ({ customRoutines: [routine, ...state.customRoutines] }));
        return routine;
      },

      updateRoutine: (id, patch) => set((state) => ({
        customRoutines: state.customRoutines.map((r) => r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r),
      })),

      deleteRoutine: (id) => set((state) => ({
        customRoutines: state.customRoutines.filter((r) => r.id !== id),
      })),

      duplicateRoutine: (id) => set((state) => {
        const original = state.customRoutines.find((r) => r.id === id);
        if (!original) return state;
        const copy = { ...JSON.parse(JSON.stringify(original)), id: uid("routine"), name: `${original.name} (copia)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        return { customRoutines: [copy, ...state.customRoutines] };
      }),

      addExerciseToRoutine: (routineId, exercise) => set((state) => ({
        customRoutines: state.customRoutines.map((r) => {
          if (r.id !== routineId) return r;
          const item = {
            id: uid("ritem"),
            exerciseId: exercise.id || exercise.exerciseId || `${exercise.name}`,
            name: exercise.name,
            group: exercise.group || "Core",
            muscle: exercise.muscle || "General",
            equipment: exercise.equipment || "",
            targetSets: exercise.targetSets || 3,
            targetReps: exercise.targetReps || "10-12",
            notes: "",
          };
          return { ...r, exercises: [...r.exercises, item], updatedAt: new Date().toISOString() };
        }),
      })),

      removeExerciseFromRoutine: (routineId, exerciseItemId) => set((state) => ({
        customRoutines: state.customRoutines.map((r) => r.id !== routineId ? r : { ...r, exercises: r.exercises.filter((e) => e.id !== exerciseItemId), updatedAt: new Date().toISOString() }),
      })),

      updateRoutineExercise: (routineId, exerciseItemId, patch) => set((state) => ({
        customRoutines: state.customRoutines.map((r) => r.id !== routineId ? r : {
          ...r,
          exercises: r.exercises.map((e) => e.id === exerciseItemId ? { ...e, ...patch } : e),
          updatedAt: new Date().toISOString(),
        }),
      })),

      reorderRoutineExercise: (routineId, fromIndex, toIndex) => set((state) => {
        const routine = state.customRoutines.find((r) => r.id === routineId);
        if (!routine) return state;
        const exercises = [...routine.exercises];
        const [moved] = exercises.splice(fromIndex, 1);
        exercises.splice(toIndex, 0, moved);
        return {
          customRoutines: state.customRoutines.map((r) => r.id !== routineId ? r : { ...r, exercises, updatedAt: new Date().toISOString() }),
        };
      }),

      importBackup: (data) => set((state) => {
        const workoutsMap = new Map(state.workouts.map((w) => [w.id, w]));
        (data.workouts || []).forEach((w) => { if (!workoutsMap.has(w.id)) workoutsMap.set(w.id, w); });
        const bmMap = new Map(state.bodyMetrics.map((m) => [m.id, m]));
        (data.bodyMetrics || []).forEach((m) => { if (!bmMap.has(m.id)) bmMap.set(m.id, m); });
        const crMap = new Map(state.customRoutines.map((r) => [r.id, r]));
        (data.customRoutines || []).forEach((r) => { if (!crMap.has(r.id)) crMap.set(r.id, r); });
        const ceMap = new Map(state.customExercises.map((e) => [e.id, e]));
        (data.customExercises || []).forEach((e) => { if (!ceMap.has(e.id)) ceMap.set(e.id, e); });
        return {
          workouts: Array.from(workoutsMap.values()).sort((a, b) => String(b.date).localeCompare(String(a.date))),
          bodyMetrics: Array.from(bmMap.values()),
          customRoutines: Array.from(crMap.values()),
          customExercises: Array.from(ceMap.values()),
        };
      }),
    }),
    {
      name: "arrow-gym-v4",
      version: 4,
      migrate: (persisted, version) => {
        const base = { ...persisted };
        if (!base.bodyMetrics) base.bodyMetrics = [];
        if (!base.customRoutines) base.customRoutines = [];
        if (!base.globalCoachReport) base.globalCoachReport = null;
        return base;
      },
      partialize: (state) => {
        try {
          JSON.stringify({
            workouts: state.workouts,
            coachReports: state.coachReports,
            customExercises: state.customExercises,
            customRoutines: state.customRoutines,
            bodyMetrics: state.bodyMetrics,
          });
          return {
            workouts: state.workouts,
            coachReports: state.coachReports,
            customExercises: state.customExercises,
            customRoutines: state.customRoutines,
            bodyMetrics: state.bodyMetrics,
          };
        } catch (e) {
          console.error("Arrow Gym: localStorage write failed — data NOT saved!", e);
          return {
            workouts: state.workouts,
            coachReports: state.coachReports,
            customExercises: state.customExercises,
            customRoutines: state.customRoutines,
            bodyMetrics: state.bodyMetrics,
          };
        }
      },
    }
  )
);

export default useStore;
export { ROUTINES };
