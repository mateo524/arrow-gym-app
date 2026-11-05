import { describe, it, expect, vi } from "vitest";

// supabase.js necesita window/localStorage: en el test de nodo se reemplaza por un stub
vi.mock("../lib/supabase.js", () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) }, from: () => ({}) },
}));

import { expandRoutineExercise } from "./slices/workoutSlice.js";
import { EXERCISES_BY_SPLIT, coachSetScheme, buildCoachPlan } from "../pages/StartWorkoutPage.jsx";
import { EXERCISE_DATABASE } from "../data/exerciseDatabase.js";
import { hasData, isWarmup, getSetVolume, getWorkoutVolume } from "../lib/analytics.js";

describe("expandRoutineExercise", () => {
  it("string (rutinas viejas) = 1 serie sin plan", () => {
    expect(expandRoutineExercise("Press de banca plano")).toEqual({ name: "Press de banca plano", plan: [{}] });
    expect(expandRoutineExercise("  ")).toBeNull();
  });
  it("{name} sin sets (rutinas viejas de StartWorkoutPage) = 1 serie", () => {
    expect(expandRoutineExercise({ name: "Remo con barra" }).plan).toHaveLength(1);
  });
  it("sets array de RoutinesPage: una serie por entrada, con reps y peso objetivo", () => {
    const r = expandRoutineExercise({ name: "Sentadilla libre", sets: [{ reps: "5", weight: "100" }, { reps: "5", weight: "100" }, { reps: "8", weight: "" }] });
    expect(r.plan).toEqual([{ reps: "5", weight: "100" }, { reps: "5", weight: "100" }, { reps: "8", weight: "" }]);
  });
  it("sets numérico + reps", () => {
    const r = expandRoutineExercise({ name: "Curl martillo", sets: 3, reps: "10-12" });
    expect(r.plan).toHaveLength(3);
    expect(r.plan[0].reps).toBe("10-12");
  });
  it("limita la cantidad de series", () => {
    expect(expandRoutineExercise({ name: "X", sets: 99 }).plan.length).toBeLessThanOrEqual(12);
  });
});

describe("coach generador", () => {
  const dbNames = new Set(EXERCISE_DATABASE.map((e) => e.name));
  it("todos los ejercicios de EXERCISES_BY_SPLIT existen con nombre exacto", () => {
    const missing = Object.values(EXERCISES_BY_SPLIT).flat().filter((n) => !dbNames.has(n));
    expect(missing).toEqual([]);
  });
  it("legs/lower incluyen glúteo y gemelos; pull incluye remo con barra", () => {
    expect(EXERCISES_BY_SPLIT.legs).toContain("Hip thrust con barra");
    expect(EXERCISES_BY_SPLIT.lower).toContain("Elevación de pantorrillas en prensa");
    expect(EXERCISES_BY_SPLIT.pull).toContain("Remo con barra");
  });
  it("series y reps según el objetivo", () => {
    expect(coachSetScheme("fuerza", "Sentadilla libre", 0)).toEqual({ sets: 4, reps: "5" });
    expect(coachSetScheme("hipertrofia", "Sentadilla libre", 0).sets).toBeGreaterThanOrEqual(3);
    expect(coachSetScheme("resistencia", "Curl martillo", 5)).toEqual({ sets: 2, reps: "20" });
    const plan = buildCoachPlan("fuerza", ["Press de banca plano"]);
    expect(plan["Press de banca plano"]).toEqual({ sets: 4, reps: "5" });
  });
});

describe("series de calentamiento", () => {
  it("no cuentan como datos (volumen / PR / 1RM)", () => {
    expect(isWarmup({ setType: "warmup" })).toBe(true);
    expect(isWarmup({ setType: "drop" })).toBe(false);
    expect(isWarmup({})).toBe(false);
    expect(hasData({ weight: 40, reps: 10, setType: "warmup" })).toBe(false);
    expect(hasData({ weight: 100, reps: 5 })).toBe(true);
    const w = { sets: [{ weight: 40, reps: 10, setType: "warmup" }, { weight: 100, reps: 5 }] };
    expect(getWorkoutVolume(w)).toBe(getSetVolume(w.sets[1]));
  });
});

describe("finishWorkout / deleteWorkout (PR)", () => {
  it("guarda la mejor serie por e1RM de la sesión (una sola vez) y deleteWorkout quita ese PR", async () => {
    vi.resetModules();
    const { createWorkoutSlice } = await import("./slices/workoutSlice.js");
    let state = {};
    const set = (p) => { state = { ...state, ...(typeof p === "function" ? p(state) : p) }; };
    const get = () => state;
    state = { ...createWorkoutSlice(set, get), workouts: [], prs: [], syncGymStateToDB: async () => {}, setSyncStatus: () => {} };
    state.activeWorkout = {
      id: "w1", type: "Libre", date: "2026-01-10", startedAt: Date.now() - 600000,
      sets: [
        { id: "a", exercise: "Press de banca plano", weight: "60", reps: "10", setType: "warmup", equipment: "Barra" },
        { id: "b", exercise: "Press de banca plano", weight: "80", reps: "5", equipment: "Barra" },
        { id: "c", exercise: "Press de banca plano", weight: "80", reps: "8", equipment: "Barra" },
        { id: "d", exercise: "Press de banca plano", weight: "70", reps: "6", equipment: "Barra" },
      ],
    };
    await state.finishWorkout("", "");
    const prs = state.prs.filter((p) => p.exercise === "Press de banca plano");
    expect(prs).toHaveLength(1);
    expect(prs[0].weight).toBe(80);
    expect(prs[0].reps).toBe(8); // la mejor serie, no la primera
    expect(state.workouts[0].sets.some((s) => s.setType === "warmup")).toBe(true); // setType se conserva
    state.deleteWorkout("w1");
    expect(state.prs.filter((p) => p.exercise === "Press de banca plano")).toHaveLength(0);
  });
});
