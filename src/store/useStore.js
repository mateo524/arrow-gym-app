import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXERCISE_DATABASE, findExerciseMeta, resolveExerciseGroup, resolveExerciseMuscle } from "../data/exerciseDatabase.js";
import { ROUTINES } from "../data/seedData.js";
import { buildCoachReport, hydrateSet } from "../lib/analytics.js";
import { loadInitialWorkouts, normalizeSet } from "../lib/storageMigration.js";
import { syncWorkoutUp, syncAllWorkoutsUp, fetchWorkoutsFromDB, mergeWorkouts } from "../lib/workoutSync.js";
import { getAuthUserId, getAuthProfile } from "../lib/authBridge.js";

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

      prs: [],
      coachBadge: false,
      amoled: false,
      soundEnabled: true,
      weightLog: [],
      savedTemplates: [],
      achievements: [],

      // Pull workouts from Supabase and merge with local localStorage data.
      // Called once after login. userId comes from useAuthStore.
      syncWorkoutsFromDB: async (userId) => {
        const remote = await fetchWorkoutsFromDB(userId);
        const local = get().workouts || [];
        const merged = mergeWorkouts(local, remote);
        set({ workouts: merged });
      },

      syncAllToSupabase: async (userId) => {
        const workouts = get().workouts || [];
        await syncAllWorkoutsUp(workouts, userId);
      },

      toggleAmoled: () => set((s) => ({ amoled: !s.amoled })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

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

      finishWorkout: (notes) => {
        const active = get().activeWorkout;
        if (!active) return;
        const clean = {
          ...active,
          notes: notes || "",
          sets: active.sets
            .filter((setItem) => setItem.exercise && (setItem.weight !== "" || setItem.reps !== ""))
            .map(normalizeSet),
        };
        if (!clean.sets.length) return;
        const report = buildCoachReport(clean, get().workouts, getAuthProfile());
        const existingPrs = get().prs || [];
        const history = get().workouts || [];
        const prs = [];
        clean.sets.forEach((set) => {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          if (!w || !r) return;
          const prev = history.flatMap((workout) => workout.sets || []).filter((s) => s.exercise === set.exercise);
          const maxWeight = Math.max(...prev.map((s) => Number(s.weight) || 0), 0);
          const maxReps = Math.max(...prev.map((s) => Number(s.reps) || 0), 0);
          const isWeightPr = w > maxWeight;
          const isRepsPr = r > maxReps && w >= maxWeight;
          if (isWeightPr || isRepsPr) {
            prs.push({ exercise: set.exercise, weight: w, reps: r, type: isWeightPr ? "weight" : "reps", date: clean.date });
          }
        });
        const newPrs = [...prs, ...existingPrs].slice(0, 20);
        set((state) => {
          const newWorkoutCount = [clean, ...state.workouts.filter((item) => item.id !== clean.id)].length;
          const existingAch = state.achievements || [];
          const unlock = (id) => !existingAch.some((a) => a.id === id);
          const newAch = [
            unlock("first_workout") && { id: "first_workout", unlockedAt: today() },
            newWorkoutCount >= 10 && unlock("workouts_10") && { id: "workouts_10", unlockedAt: today() },
            newWorkoutCount >= 25 && unlock("workouts_25") && { id: "workouts_25", unlockedAt: today() },
            newWorkoutCount >= 50 && unlock("workouts_50") && { id: "workouts_50", unlockedAt: today() },
            newWorkoutCount >= 100 && unlock("workouts_100") && { id: "workouts_100", unlockedAt: today() },
            prs.length > 0 && unlock("first_pr") && { id: "first_pr", unlockedAt: today() },
            newPrs.length >= 10 && unlock("prs_10") && { id: "prs_10", unlockedAt: today() },
          ].filter(Boolean);
          return {
            workouts: [clean, ...state.workouts.filter((item) => item.id !== clean.id)],
            coachReports: [report, ...state.coachReports.filter((item) => item.workoutId !== clean.id)],
            selectedWorkoutId: clean.id,
            activeWorkout: null,
            currentPage: "coach",
            coachBadge: false,
            prs: newPrs,
            achievements: [...existingAch, ...newAch],
          };
        });

        // Background sync to Supabase
        const userId = getAuthUserId();
        if (userId) syncWorkoutUp(clean, userId);
      },

      cancelWorkout: () => set({ activeWorkout: null, currentPage: "home" }),

      saveTemplate: (name, exercises) => {
        const template = { id: uid("tpl"), name, exercises, createdAt: today() };
        set((s) => ({ savedTemplates: [template, ...(s.savedTemplates || [])] }));
      },

      deleteTemplate: (id) => {
        set((s) => ({ savedTemplates: (s.savedTemplates || []).filter((t) => t.id !== id) }));
      },

      useTemplate: (id) => {
        const state = get();
        const tpl = (state.savedTemplates || []).find((t) => t.id === id);
        if (!tpl) return;
        const workouts = state.workouts || [];
        set({
          activeWorkout: {
            id: uid("workout"),
            type: tpl.name,
            date: today(),
            sets: tpl.exercises.map((e) => makePrefilledSet(e, workouts)),
            startedAt: Date.now(),
          },
          currentPage: "workout",
        });
      },

      unlockAchievement: (id) => {
        set((s) => {
          if ((s.achievements || []).some((a) => a.id === id)) return {};
          return { achievements: [...(s.achievements || []), { id, unlockedAt: today() }] };
        });
      },

      logWeight: (kg) => {
        const entry = { date: new Date().toISOString().slice(0, 10), kg: Number(kg) };
        set((s) => ({
          weightLog: [entry, ...(s.weightLog || []).filter((e) => e.date !== entry.date)].slice(0, 90),
        }));
      },

      repeatLastWorkout: () => {
        const state = get();
        const last = (state.workouts || [])[0];
        if (!last) return;
        const exercises = [...new Set((last.sets || []).map((s) => s.exercise))];
        const workouts = state.workouts || [];
        const newSets = exercises.flatMap((exercise) => {
          const prevSets = (last.sets || []).filter((s) => s.exercise === exercise);
          return prevSets.map((s) => makeSet(exercise, "", "", workouts));
        });
        set({
          activeWorkout: {
            id: uid("workout"),
            type: last.type,
            date: today(),
            sets: newSets,
            startedAt: Date.now(),
          },
          currentPage: "workout",
        });
      },
    }),
    {
      name: "arrow-gym-v4",
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
