import { ROUTINES } from "../../data/seedData.js";
import { buildCoachReport, hydrateSet } from "../../lib/analytics.js";
import { loadInitialWorkouts, normalizeSet } from "../../lib/storageMigration.js";
import { syncWorkoutUp, syncAllWorkoutsUp, fetchWorkoutsFromDB, mergeWorkouts } from "../../lib/workoutSync.js";
import { getAuthUserId, getAuthProfile } from "../../lib/authBridge.js";
import { EXERCISE_DATABASE, findExerciseMeta, resolveExerciseGroup, resolveExerciseMuscle } from "../../data/exerciseDatabase.js";
import { todayLocal } from "../../lib/dates.js";

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function today() {
  return todayLocal();
}
function sameExercise(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

function getExerciseStats(workouts, exercise) {
  const ordered = [...(workouts || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  let lastWeight = "", lastReps = "", lastSets = 0, lastDate = null;
  for (const workout of ordered) {
    const sets = [...(workout.sets || [])].filter((s) => sameExercise(s.exercise, exercise));
    if (sets.length) {
      const completed = sets.find((s) => s.weight !== "" || s.reps !== "");
      if (completed) { lastWeight = completed.weight ?? ""; lastReps = completed.reps ?? ""; }
      lastSets = sets.length;
      lastDate = workout.date;
      break;
    }
  }
  return { lastWeight, lastReps, lastSets, lastDate };
}

function makeSet(exercise, weight = "", reps = "", workouts = []) {
  const meta = findExerciseMeta(exercise) || {};
  const stats = getExerciseStats(workouts, exercise);
  return {
    id: uid("set"), exercise, weight, reps, rpe: "",
    group: meta.group || resolveExerciseGroup(exercise),
    muscle: meta.muscle || resolveExerciseMuscle(exercise),
    equipment: meta.equipment || "",
    lastWeight: stats.lastWeight, lastReps: stats.lastReps,
    lastSets: stats.lastSets, lastDate: stats.lastDate,
  };
}

function makePrefilledSet(exercise, workouts) {
  const stats = getExerciseStats(workouts, exercise);
  return makeSet(exercise, stats.lastWeight || "", stats.lastReps || "", workouts);
}

function scaleRepsForDeload(lastReps) {
  if (!lastReps) return "12-15";
  const n = Number(lastReps);
  if (isNaN(n)) return "12-15";
  if (n <= 3) return "12-15";
  if (n <= 6) return "15-20";
  if (n <= 10) return "18-25";
  return "20-30";
}

export const createWorkoutSlice = (set, get) => ({
  workouts: loadInitialWorkouts(),
  activeWorkout: null,
  coachReports: [],
  prs: [],
  achievements: [],
  achievementsSeen: [],
  newAchievements: [],
  workoutDraft: null,
  savedTemplates: [],
  weeklyChallenge: null,
  activePlanAdjustment: null,

  getExerciseStats: (exercise) => getExerciseStats(get().workouts, exercise),

  syncWorkoutsFromDB: async (userId) => {
    const remote = await fetchWorkoutsFromDB(userId);
    const local = get().workouts || [];
    const merged = mergeWorkouts(local, remote);
    const active = get().activeWorkout;
    let updatedActive = active;
    if (active?.sets?.length) {
      const updatedSets = active.sets.map((s) => {
        const stats = getExerciseStats(merged, s.exercise);
        return { ...s, lastWeight: stats.lastWeight || s.lastWeight || "", lastReps: stats.lastReps || s.lastReps || "", weight: s.weight || stats.lastWeight || "", reps: s.reps || stats.lastReps || "" };
      });
      updatedActive = { ...active, sets: updatedSets };
    }
    set({ workouts: merged, ...(updatedActive !== active ? { activeWorkout: updatedActive } : {}) });
  },

  syncAllToSupabase: async (userId) => {
    await syncAllWorkoutsUp(get().workouts || [], userId);
  },

  clearActiveWorkout: () => set({ activeWorkout: null }),

  setPage: (page) => {
    const state = get();
    if (page === "coach") set({ currentPage: page, coachBadge: false });
    else set({ currentPage: page, coachBadge: (state.coachReports?.length || 0) > 0 });
  },

  openWorkout: (id) => set({ selectedWorkoutId: id, currentPage: "workoutDetail" }),

  startWorkout: (type) => {
    const routine = ROUTINES[type] || [];
    const workouts = get().workouts || [];
    const adj = get().activePlanAdjustment;
    const factor = adj && new Date(adj.expiresAt) >= new Date() ? adj.factor : 1;
    set({
      activeWorkout: {
        id: uid("workout"), type, date: today(), startedAt: Date.now(),
        sets: routine.map((ex) => {
          const s = makePrefilledSet(ex, workouts);
          if (factor !== 1 && s.lastWeight) {
            const scaled = String(Math.max(0, Math.round(Number(s.lastWeight) * factor * 2) / 2) || s.lastWeight);
            return { ...s, weight: scaled, lastWeight: scaled, reps: scaleRepsForDeload(s.lastReps) };
          }
          return s;
        }),
      },
      currentPage: "workout",
    });
  },

  startRoutineWorkout: (name, exercises) => {
    const workouts = get().workouts || [];
    const adj = get().activePlanAdjustment;
    const factor = adj && new Date(adj.expiresAt) >= new Date() ? adj.factor : 1;
    set({
      activeWorkout: {
        id: uid("workout"), type: name, date: today(), startedAt: Date.now(),
        sets: exercises.map((ex) => {
          const s = makePrefilledSet(ex, workouts);
          if (factor !== 1 && s.lastWeight) {
            const scaled = String(Math.max(0, Math.round(Number(s.lastWeight) * factor * 2) / 2) || s.lastWeight);
            return { ...s, weight: scaled, lastWeight: scaled, reps: scaleRepsForDeload(s.lastReps) };
          }
          return s;
        }),
      },
      currentPage: "workout",
    });
  },

  startEmptyWorkout: () => set({ activeWorkout: { id: uid("workout"), type: "Libre", date: today(), startedAt: Date.now(), sets: [] }, currentPage: "workout" }),

  swapExercise: (oldName, newName) => {
    const active = get().activeWorkout;
    if (!active) return;
    const workouts = get().workouts || [];
    const newSets = active.sets.map((s) => {
      if (s.exercise !== oldName) return s;
      return { ...makeSet(newName, s.weight, s.reps, workouts), id: s.id };
    });
    set({ activeWorkout: { ...active, sets: newSets } });
  },

  addExerciseToActiveWorkout: (exercise) => {
    const raw = typeof exercise === "string" ? exercise : exercise.name;
    const name = raw.trim();
    const workouts = get().workouts || [];
    set((s) => ({
      activeWorkout: s.activeWorkout
        ? { ...s.activeWorkout, sets: [...s.activeWorkout.sets, makePrefilledSet(name, workouts)] }
        : s.activeWorkout,
    }));
  },

  addSeriesToExercise: (exercise, copyLast = true) => {
    const active = get().activeWorkout;
    if (!active) return;
    const same = (active.sets || []).filter((s) => sameExercise(s.exercise, exercise));
    const source = same[same.length - 1];
    const next = makeSet(exercise, copyLast && source ? source.weight : "", copyLast && source ? source.reps : "", get().workouts || []);
    set({ activeWorkout: { ...active, sets: [...active.sets, next] } });
  },

  updateActiveSet: (id, patch) => set((s) => ({
    activeWorkout: s.activeWorkout
      ? { ...s.activeWorkout, sets: s.activeWorkout.sets.map((setItem) => setItem.id === id ? hydrateSet({ ...setItem, ...patch }) : setItem) }
      : s.activeWorkout,
  })),

  repeatSet: (id) => {
    const active = get().activeWorkout;
    const found = active?.sets?.find((s) => s.id === id);
    if (!active || !found) return;
    set({ activeWorkout: { ...active, sets: [...active.sets, { ...found, id: uid("set") }] } });
  },

  removeActiveSet: (id) => set((s) => ({
    activeWorkout: s.activeWorkout
      ? { ...s.activeWorkout, sets: s.activeWorkout.sets.filter((setItem) => setItem.id !== id) }
      : s.activeWorkout,
  })),

  linkSuperset: (exerciseA, exerciseB) => {
    const active = get().activeWorkout;
    if (!active) return;
    const groupId = `ss-${Date.now()}`;
    const workouts = get().workouts || [];
    let sets = active.sets.map((s) => sameExercise(s.exercise, exerciseA) ? { ...s, supersetGroup: groupId } : s);
    const hasB = sets.some((s) => sameExercise(s.exercise, exerciseB));
    if (!hasB) sets = [...sets, { ...makeSet(exerciseB, "", "", workouts), supersetGroup: groupId }];
    else sets = sets.map((s) => sameExercise(s.exercise, exerciseB) ? { ...s, supersetGroup: groupId } : s);
    set({ activeWorkout: { ...active, sets } });
  },

  addDropset: (exercise) => {
    const active = get().activeWorkout;
    if (!active) return;
    const same = (active.sets || []).filter((s) => sameExercise(s.exercise, exercise));
    const source = same[same.length - 1];
    const dropWeight = source?.weight ? String(Math.max(0, Number(source.weight) - 5)) : "";
    const next = { ...makeSet(exercise, dropWeight, source?.reps || "", get().workouts || []), isDropset: true };
    set({ activeWorkout: { ...active, sets: [...active.sets, next] } });
  },

  reorderActiveExercise: (exerciseName, direction) => {
    const active = get().activeWorkout;
    if (!active) return;
    const order = [];
    const seen = new Set();
    for (const s of active.sets) { if (!seen.has(s.exercise)) { seen.add(s.exercise); order.push(s.exercise); } }
    const idx = order.indexOf(exerciseName);
    if (direction === "up" && idx <= 0) return;
    if (direction === "down" && idx >= order.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];
    const newSets = [];
    for (const ex of order) newSets.push(...active.sets.filter((s) => s.exercise === ex));
    set({ activeWorkout: { ...active, sets: newSets } });
  },

  finishWorkout: async (notes) => {
    const active = get().activeWorkout;
    if (!active) return;
    const clean = {
      ...active,
      notes: notes || "",
      sets: active.sets
        .filter((s) => s.exercise && (s.weight !== "" && s.weight !== null) && (s.reps !== "" && s.reps !== null) && Number(s.reps) > 0)
        .map(normalizeSet),
    };
    if (!clean.sets.length) return;
    const report = buildCoachReport(clean, get().workouts, getAuthProfile());
    const existingPrs = get().prs || [];
    const history = get().workouts || [];
    const newPrsList = [];
    clean.sets.forEach((s) => {
      const w = Number(s.weight) || 0, r = Number(s.reps) || 0;
      if (!w || !r) return;
      const prev = history.flatMap((wk) => wk.sets || []).filter((ps) => ps.exercise === s.exercise);
      const maxWeight = Math.max(...prev.map((ps) => Number(ps.weight) || 0), 0);
      const maxReps   = Math.max(...prev.map((ps) => Number(ps.reps)   || 0), 0);
      if (w > maxWeight || (r > maxReps && w >= maxWeight)) {
        newPrsList.push({ exercise: s.exercise, weight: w, reps: r, type: w > maxWeight ? "weight" : "reps", date: clean.date });
      }
    });
    set((state) => ({
      workouts: [clean, ...state.workouts.filter((item) => item.id !== clean.id)],
      coachReports: [report, ...state.coachReports.filter((item) => item.workoutId !== clean.id)],
      selectedWorkoutId: clean.id,
      activeWorkout: null,
      currentPage: "coach",
      coachBadge: true,
      prs: [...newPrsList, ...existingPrs].slice(0, 20),
    }));
    // Achievement check
    try {
      const { getAchievements } = await import("../../lib/analytics.js");
      const allWorkouts = get().workouts || [];
      const allPRs = get().prs || [];
      const earned = getAchievements(allWorkouts, allPRs, get().mealLog || [], get().weightLog || [], get().restDays || []);
      const current = get().achievements || [];
      for (const e of earned) {
        const existing = current.find((a) => a.id === e.id);
        if (!existing || existing.level < e.level) {
          get().unlockAchievement(e.id, e.level);
        }
      }
    } catch (err) { console.warn("achievement check failed", err); }
    const userId = getAuthUserId();
    if (userId) syncWorkoutUp(clean, userId);
  },

  cancelWorkout: () => set({ activeWorkout: null, currentPage: "start" }),

  saveTemplate: (name, exercises) => {
    const template = { id: uid("tpl"), name, exercises, createdAt: today() };
    set((s) => ({ savedTemplates: [template, ...(s.savedTemplates || [])] }));
  },
  deleteTemplate: (id) => set((s) => ({ savedTemplates: (s.savedTemplates || []).filter((t) => t.id !== id) })),
  useTemplate: (id) => {
    const state = get();
    const tpl = (state.savedTemplates || []).find((t) => t.id === id);
    if (!tpl) return;
    const adj = state.activePlanAdjustment;
    const factor = adj && new Date(adj.expiresAt) >= new Date() ? adj.factor : 1;
    set({
      activeWorkout: {
        id: uid("workout"), type: tpl.name, date: today(), startedAt: Date.now(),
        sets: tpl.exercises.map((e) => {
          const s = makePrefilledSet(e, state.workouts || []);
          if (factor !== 1 && s.lastWeight) {
            const scaled = String(Math.max(0, Math.round(Number(s.lastWeight) * factor * 2) / 2) || s.lastWeight);
            return { ...s, weight: scaled, lastWeight: scaled, reps: scaleRepsForDeload(s.lastReps) };
          }
          return s;
        }),
      },
      currentPage: "workout",
    });
  },

  markAchievementSeen: (id) => set((s) => {
    if ((s.achievementsSeen || []).includes(id)) return {};
    return { achievementsSeen: [...(s.achievementsSeen || []), id] };
  }),
  clearNewAchievements: () => set({ newAchievements: [] }),
  unlockAchievement: (id, level = 1) => set((s) => {
    const existing = (s.achievements || []).find((a) => a.id === id);
    if (existing && existing.level >= level) return {};
    const now = new Date().toISOString();
    if (existing) return { achievements: s.achievements.map((a) => a.id === id ? { ...a, level, unlockedAt: now } : a) };
    return { achievements: [...(s.achievements || []), { id, level, unlockedAt: now }] };
  }),

  saveWorkoutDraft: (draft) => set({ workoutDraft: draft }),
  clearWorkoutDraft: () => set({ workoutDraft: null }),

  acceptPlanRecommendation: (type, factor = 1) => {
    const accepted = today();
    const d = new Date(accepted); d.setDate(d.getDate() + 7);
    const planAdjustment = { type, factor, acceptedAt: accepted, expiresAt: d.toISOString().slice(0, 10) };
    set({ activePlanAdjustment: planAdjustment });
    const uid = getAuthUserId();
    if (uid) {
      import("../../lib/supabase.js").then(({ supabase }) => {
        supabase.from("profiles").update({ plan_adjustment: JSON.stringify(planAdjustment) }).eq("id", uid).catch(() => {});
      });
    }
  },
  declinePlanRecommendation: (type) => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    const planAdjustment = { type, declined: true, declinedAt: today(), expiresAt: d.toISOString().slice(0, 10) };
    set({ activePlanAdjustment: planAdjustment });
    const uid = getAuthUserId();
    if (uid) {
      import("../../lib/supabase.js").then(({ supabase }) => {
        supabase.from("profiles").update({ plan_adjustment: JSON.stringify(planAdjustment) }).eq("id", uid).catch(() => {});
      });
    }
  },
  clearPlanAdjustment: () => {
    set({ activePlanAdjustment: null });
    const uid = getAuthUserId();
    if (uid) {
      import("../../lib/supabase.js").then(({ supabase }) => {
        supabase.from("profiles").update({ plan_adjustment: null }).eq("id", uid).catch(() => {});
      });
    }
  },
  loadPlanAdjustmentFromDB: async (userId) => {
    try {
      const { supabase } = await import("../../lib/supabase.js");
      const { data, error } = await supabase.from("profiles").select("plan_adjustment").eq("id", userId).single();
      if (error || !data?.plan_adjustment) return;
      const parsed = typeof data.plan_adjustment === "string" ? JSON.parse(data.plan_adjustment) : data.plan_adjustment;
      if (parsed && parsed.expiresAt && new Date(parsed.expiresAt) >= new Date()) {
        set({ activePlanAdjustment: parsed });
      }
    } catch {}
  },

  generateWeeklyChallenge: (force = false) => {
    const { workouts } = get();
    const now = new Date();
    const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0);
    const existing = get().weeklyChallenge;
    if (!force && existing) {
      const thisWeek = (workouts || []).filter((w) => w.date && new Date(w.date) >= monday);
      set({ weeklyChallenge: { ...existing, doneCount: thisWeek.length } });
      return;
    }
    const thisWeek = (workouts || []).filter((w) => w.date && new Date(w.date) >= monday);
    const legW = thisWeek.filter((w) => (w.sets || []).some((s) => (s.group || "") === "Piernas"));
    const CHALLENGES = [
      { text: "Completá 4 entrenamientos esta semana", targetCount: 4, doneCount: thisWeek.length },
      { text: "Entrenás piernas 2 veces esta semana", targetCount: 2, doneCount: legW.length },
      { text: "Hacé 3 entrenamientos de 30+ minutos", targetCount: 3, doneCount: thisWeek.length },
      { text: "5 días activos esta semana (entreno o descanso activo)", targetCount: 5, doneCount: thisWeek.length },
      { text: "Alcanzá 10 series en grupos grandes (pecho/espalda/piernas)", targetCount: 10, doneCount: thisWeek.reduce((a, w) => a + (w.sets || []).filter((s) => ["Pecho", "Espalda", "Piernas"].includes(s.group)).length, 0) },
      { text: "Superá 5000 kg de volumen total esta semana", targetCount: 5000, doneCount: Math.round(thisWeek.reduce((a, w) => a + (w.sets || []).reduce((b, s) => b + ((s.weight || 0) * (s.reps || 0)), 0), 0)) },
    ];
    const pick = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    set({ weeklyChallenge: { ...pick, isoWeek: null } });
  },

  repeatLastWorkout: () => {
    const state = get();
    const last = (state.workouts || [])[0];
    if (!last) return;
    const exercises = [...new Set((last.sets || []).map((s) => s.exercise))];
    const workouts = state.workouts || [];
    const adj = state.activePlanAdjustment;
    const factor = adj && new Date(adj.expiresAt) >= new Date() ? adj.factor : 1;
    const newSets = exercises.flatMap((ex) =>
      (last.sets || []).filter((s) => s.exercise === ex).map(() => {
        const s = makeSet(ex, "", "", workouts);
        if (factor !== 1 && s.lastWeight) {
          const scaled = String(Math.max(0, Math.round(Number(s.lastWeight) * factor * 2) / 2) || s.lastWeight);
          return { ...s, weight: scaled, lastWeight: scaled, reps: scaleRepsForDeload(s.lastReps) };
        }
        return s;
      })
    );
    set({
      activeWorkout: { id: uid("workout"), type: last.type, date: today(), sets: newSets, startedAt: Date.now() },
      currentPage: "workout",
    });
  },
});

export { ROUTINES };
