import { describe, it, expect, vi, afterEach } from "vitest";
import { normalizeSet, normalizeWorkout } from "./storageMigration.js";

afterEach(() => vi.useRealTimers());

describe("normalizeSet", () => {
  it("mapea alias legacy de nombre, peso y series", () => {
    const s = normalizeSet({ name: "Press banca", kg: 80, reps: 8, setNumber: 2 });
    expect(s.exercise).toBe("Press banca");
    expect(s.weight).toBe(80);
    expect(s.reps).toBe(8);
    expect(s.set).toBe(2);
  });

  it("usa 'Ejercicio' y strings vacíos por defecto, y genera id", () => {
    const s = normalizeSet({});
    expect(s.exercise).toBe("Ejercicio");
    expect(s.weight).toBe("");
    expect(s.reps).toBe("");
    expect(s.id).toMatch(/^set-/);
  });

  it("conserva el id existente", () => {
    expect(normalizeSet({ id: "abc", exercise: "X" }).id).toBe("abc");
  });

  it("convierte grupo legacy a canónico", () => {
    expect(normalizeSet({ exercise: "Zzz inexistente", group: "hombro" }).group).toBe("Hombros");
    expect(normalizeSet({ exercise: "Zzz inexistente", group: "Tríceps" }).group).toBe("Brazos");
    expect(normalizeSet({ exercise: "Zzz inexistente", muscle: "Pecho" }).group).toBe("Pecho");
  });

  it("acepta grupo canónico tal cual", () => {
    expect(normalizeSet({ exercise: "Zzz", group: "Core" }).group).toBe("Core");
  });

  it("músculo legacy que era un grupo devuelve un string", () => {
    const s = normalizeSet({ exercise: "Zzz inexistente", muscle: "Pecho" });
    expect(typeof s.muscle).toBe("string");
  });

  it("preserva rir, rpe, notes, superset, dropset y planReps", () => {
    const s = normalizeSet({ exercise: "X", rir: 2, rpe: 8, notes: "n", supersetGroup: "A", isDropset: true, planReps: "8-10" });
    expect(s).toMatchObject({ rir: 2, rpe: 8, notes: "n", supersetGroup: "A", isDropset: true, planReps: "8-10" });
  });

  it("preserva rir=0 pero descarta rir/rpe vacíos", () => {
    expect(normalizeSet({ exercise: "X", rir: 0 }).rir).toBe(0);
    const s = normalizeSet({ exercise: "X", rir: "", rpe: null });
    expect("rir" in s).toBe(false);
    expect("rpe" in s).toBe(false);
  });
});

describe("normalizeWorkout", () => {
  it("normaliza cada set de un workout", () => {
    const w = normalizeWorkout({ id: "w1", date: "2026-02-03", type: "Push", sets: [{ name: "A", kg: 10, reps: 5 }] });
    expect(w).toMatchObject({ id: "w1", date: "2026-02-03", type: "Push", migrated: false });
    expect(w.sets[0].exercise).toBe("A");
    expect(w.sets[0].weight).toBe(10);
  });

  it("usa alias session_type / sessionType", () => {
    expect(normalizeWorkout({ session_type: "Pull", sets: [] }).type).toBe("Pull");
    expect(normalizeWorkout({ sessionType: "Legs", sets: [] }).type).toBe("Legs");
  });

  it("type por defecto 'Workout', id generado y fecha de hoy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 9, 12, 0, 0));
    const w = normalizeWorkout({ sets: [] });
    expect(w.type).toBe("Workout");
    expect(w.id).toMatch(/^workout-/);
    expect(w.date).toBe("2026-05-09");
  });

  it("workout plano legacy (sin sets) se convierte en un único set", () => {
    const w = normalizeWorkout({ id: "w", date: "2026-01-01", name: "Sentadilla", kg: 100, reps: 5 });
    expect(w.sets).toHaveLength(1);
    expect(w.sets[0].exercise).toBe("Sentadilla");
  });

  it("migrated se coacciona a boolean", () => {
    expect(normalizeWorkout({ sets: [], migrated: 1 }).migrated).toBe(true);
  });
});
