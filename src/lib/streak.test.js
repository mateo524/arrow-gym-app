import { describe, it, expect } from "vitest";
import { weekStartKey, workoutsByWeek, getWeeklyStreak, getLatestPR, getWeightTrend, suggestFirstRoutines } from "./streak.js";

// 2026-10-10 es sábado; su semana arranca el lunes 2026-10-05.
const TODAY = "2026-10-10";
const w = (date) => ({ date });

describe("weekStartKey", () => {
  it("devuelve el lunes de la semana", () => {
    expect(weekStartKey("2026-10-10")).toBe("2026-10-05");
    expect(weekStartKey("2026-10-05")).toBe("2026-10-05");
    expect(weekStartKey("2026-10-11")).toBe("2026-10-05"); // domingo
  });
});

describe("workoutsByWeek", () => {
  it("cuenta días distintos, no entrenos duplicados", () => {
    expect(workoutsByWeek([w("2026-10-05"), w("2026-10-05"), w("2026-10-07")])).toEqual({ "2026-10-05": 2 });
  });
});

describe("getWeeklyStreak", () => {
  it("sin entrenos", () => {
    expect(getWeeklyStreak([], 3, TODAY)).toMatchObject({ thisWeek: 0, streak: 0, remaining: 3 });
  });
  it("semana en curso sin cumplir no corta la racha", () => {
    const ws = [w("2026-09-28"), w("2026-09-29"), w("2026-09-30"), w("2026-09-21"), w("2026-09-22"), w("2026-09-23"), w("2026-10-06")];
    const r = getWeeklyStreak(ws, 3, TODAY);
    expect(r.streak).toBe(2);
    expect(r.thisWeek).toBe(1);
    expect(r.goalReached).toBe(false);
  });
  it("semana en curso cumplida suma", () => {
    const ws = [w("2026-10-05"), w("2026-10-06"), w("2026-10-07"), w("2026-09-28"), w("2026-09-29"), w("2026-09-30")];
    expect(getWeeklyStreak(ws, 3, TODAY).streak).toBe(2);
  });
  it("una semana sin cumplir corta la racha", () => {
    const ws = [w("2026-09-28"), w("2026-09-29"), w("2026-09-30"), w("2026-09-21")];
    expect(getWeeklyStreak(ws, 3, TODAY).streak).toBe(1);
  });
});

describe("getLatestPR", () => {
  it("null si no hay", () => expect(getLatestPR([])).toBeNull());
  it("devuelve el más reciente", () => {
    const r = getLatestPR([{ exercise: "A", date: "2026-01-01" }, { exercise: "B", date: "2026-03-01" }]);
    expect(r.exercise).toBe("B");
  });
});

describe("getWeightTrend", () => {
  it("null con menos de 2 registros en la ventana", () => {
    expect(getWeightTrend([{ date: "2026-10-01", kg: 80 }], TODAY)).toBeNull();
    expect(getWeightTrend([{ date: "2026-01-01", kg: 80 }, { date: "2026-10-01", kg: 79 }], TODAY)).toBeNull();
  });
  it("calcula la variación", () => {
    const t = getWeightTrend([{ date: "2026-10-08", kg: 78.5 }, { date: "2026-09-20", kg: 80 }], TODAY);
    expect(t).toMatchObject({ from: 80, to: 78.5, delta: -1.5, direction: "down" });
  });
});

describe("suggestFirstRoutines", () => {
  it("principiante arranca con Full Body", () => {
    expect(suggestFirstRoutines("hipertrofia", "principiante")[0]).toBe("Full Body");
  });
  it("devuelve 3 y respeta las disponibles", () => {
    expect(suggestFirstRoutines("fuerza", "avanzado")).toHaveLength(3);
    expect(suggestFirstRoutines("fuerza", "avanzado", ["Push"])).toEqual(["Push"]);
  });
});
