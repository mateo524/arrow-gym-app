import { describe, it, expect, vi, afterEach } from "vitest";
import {
  hasData, formatDate, parseDate, getStartOfWeek, getSetVolume, getWorkoutVolume,
  getStreak, getGroupTotals, filterByRange, calcWorkoutCalories,
} from "./analytics.js";

afterEach(() => vi.useRealTimers());

const NOW = new Date(2026, 5, 17, 10, 0, 0); // miércoles
const ds = (offset) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const at = (fn) => { vi.useFakeTimers(); vi.setSystemTime(NOW); return fn(); };

describe("hasData", () => {
  it("requiere peso y reps > 0", () => {
    expect(hasData({ weight: 50, reps: 5 })).toBe(true);
    expect(hasData({ weight: "50", reps: "5" })).toBe(true);
    expect(hasData({ weight: 0, reps: 5 })).toBe(false);
    expect(hasData({ weight: 50, reps: "" })).toBe(false);
    expect(hasData(null)).toBeFalsy();
  });
});

describe("formatDate / parseDate", () => {
  it("formatDate invierte YYYY-MM-DD a DD/MM/YYYY", () => {
    expect(formatDate("2026-03-07")).toBe("07/03/2026");
    expect(formatDate("")).toBe("");
    expect(formatDate("raro")).toBe("raro");
  });
  it("parseDate devuelve Date o null", () => {
    expect(parseDate("2026-03-07").getDate()).toBe(7);
    expect(parseDate(null)).toBeNull();
    expect(parseDate("basura")).toBeNull();
  });
});

describe("getStartOfWeek", () => {
  it("lunes como inicio de semana", () => {
    const s = getStartOfWeek(new Date(2026, 5, 17));
    expect(s.getDay()).toBe(1);
    expect(s.getDate()).toBe(15);
    expect(s.getHours()).toBe(0);
  });
  it("domingo pertenece a la semana que empezó el lunes anterior", () => {
    expect(getStartOfWeek(new Date(2026, 5, 21)).getDate()).toBe(15);
  });
  it("no muta el argumento", () => {
    const d = new Date(2026, 5, 17, 15);
    getStartOfWeek(d);
    expect(d.getDate()).toBe(17);
  });
});

describe("getSetVolume / getWorkoutVolume", () => {
  it("peso x reps, y bodyweight usa extraWeight", () => {
    expect(getSetVolume({ weight: 50, reps: 10 })).toBe(500);
    expect(getSetVolume({ isBodyweight: true, extraWeight: 10, reps: 5, weight: 99 })).toBe(50);
    expect(getSetVolume({ isBodyweight: true, reps: 5 })).toBe(0);
    expect(getSetVolume({})).toBe(0);
  });
  it("suma solo sets con datos", () => {
    const w = { sets: [{ weight: 10, reps: 10 }, { weight: 0, reps: 10 }, { weight: 20, reps: 5 }] };
    expect(getWorkoutVolume(w)).toBe(200);
    expect(getWorkoutVolume({})).toBe(0);
  });
});

describe("getStreak", () => {
  it("0 sin workouts", () => {
    expect(getStreak([])).toBe(0);
    expect(getStreak(null)).toBe(0);
  });
  it("cuenta días consecutivos terminando hoy", () => {
    at(() => expect(getStreak([{ date: ds(0) }, { date: ds(-1) }, { date: ds(-2) }])).toBe(3));
  });
  it("si hoy no entrenó pero ayer sí, la racha sigue viva", () => {
    at(() => expect(getStreak([{ date: ds(-1) }, { date: ds(-2) }])).toBe(2));
  });
  it("se rompe si el último fue hace 2+ días", () => {
    at(() => expect(getStreak([{ date: ds(-2) }, { date: ds(-3) }])).toBe(0));
  });
  it("un hueco corta la racha", () => {
    at(() => expect(getStreak([{ date: ds(0) }, { date: ds(-2) }])).toBe(1));
  });
  it("días de descanso no rompen la racha", () => {
    at(() => expect(getStreak([{ date: ds(0) }, { date: ds(-2) }], [{ date: ds(-1) }])).toBe(3));
  });
  it("varios workouts el mismo día cuentan una vez", () => {
    at(() => expect(getStreak([{ date: ds(0) }, { date: ds(0) }])).toBe(1));
  });
  it("cruza fin de mes/año", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 9));
    expect(getStreak([{ date: "2026-01-01" }, { date: "2025-12-31" }, { date: "2025-12-30" }])).toBe(3);
  });
});

describe("getGroupTotals", () => {
  it("agrupa sets con datos por grupo y redondea volumen", () => {
    const t = getGroupTotals([{ sets: [
      { exercise: "X", group: "Pecho", muscle: "Pecho", weight: 10.4, reps: 10 },
      { exercise: "X", group: "Pecho", muscle: "Pecho", weight: 10, reps: 10 },
      { exercise: "Y", group: "Core", weight: 0, reps: 10 },
    ] }]);
    expect(t.Pecho.sets).toBe(2);
    expect(t.Pecho.reps).toBe(20);
    expect(t.Pecho.volume).toBe(204);
    expect(t.Pecho.exercises).toEqual(["X"]);
    expect(t.Core.sets).toBe(0);
  });
});

describe("filterByRange", () => {
  it("filtra por días desde hoy", () => {
    at(() => {
      const r = filterByRange([{ id: 1, date: ds(-2) }, { id: 2, date: ds(-30) }], "7d");
      expect(r.map((w) => w.id)).toEqual([1]);
    });
  });
  it("descarta fechas inválidas", () => {
    at(() => expect(filterByRange([{ id: 1, date: "x" }], "7d")).toEqual([]));
  });
});

describe("calcWorkoutCalories", () => {
  it("escala con duración y peso corporal", () => {
    const w = { durationMin: 60, sets: [{ weight: 50, reps: 8 }] };
    const a = calcWorkoutCalories(w, 70);
    expect(a).toBeGreaterThan(0);
    expect(calcWorkoutCalories({ ...w, durationMin: 30 }, 70)).toBeLessThan(a);
    expect(calcWorkoutCalories(w, 140)).toBeGreaterThan(a);
  });
  it("defaults: 45 min, 70 kg", () => {
    expect(calcWorkoutCalories({ sets: [] }, undefined)).toBe(calcWorkoutCalories({ durationMin: 45, sets: [] }, 70));
  });
});
