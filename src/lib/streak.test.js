import { describe, it, expect } from "vitest";
import { weekStartKey, workoutsByWeek, getWeeklyStreak, getLatestPR, getWeightTrend, suggestFirstRoutines, isOnVacation, idleDaysExcludingVacation, mergeVacationPeriods, vacationLength } from "./streak.js";

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

describe("modo vacaciones", () => {
  const prev = [w("2026-09-21"), w("2026-09-22"), w("2026-09-23")];
  it("una semana entera de vacaciones no corta la racha", () => {
    const vac = [{ start: "2026-09-28", end: "2026-10-04" }];
    expect(getWeeklyStreak(prev, 3, TODAY).streak).toBe(0);
    expect(getWeeklyStreak(prev, 3, TODAY, vac).streak).toBe(1);
  });
  it("la semana pausada no suma a la racha", () => {
    const vac = [{ start: "2026-09-28", end: "2026-10-04" }];
    const r = getWeeklyStreak([...prev, w("2026-09-30")], 3, TODAY, vac);
    expect(r.streak).toBe(1);
  });
  it("la semana en curso queda en pausa si arrancó con 4+ días de vacaciones", () => {
    const r = getWeeklyStreak(prev, 3, "2026-10-08", [{ start: "2026-10-05", end: null }]);
    expect(r).toMatchObject({ paused: true, goalReached: false, remaining: 0 });
  });
  it("con pocos días de vacaciones se prorratea el objetivo", () => {
    // 3 días de vacaciones de 7: objetivo 4 -> ceil(4*4/7) = 3
    const vac = [{ start: "2026-10-05", end: "2026-10-07" }];
    const r = getWeeklyStreak([], 4, "2026-10-10", vac);
    expect(r.goal).toBe(3);
    expect(r.paused).toBe(false);
  });
  it("sin vacaciones todo queda igual", () => {
    expect(getWeeklyStreak(prev, 3, TODAY, [])).toMatchObject({ paused: false, goal: 3 });
  });
});

describe("utilidades de vacaciones", () => {
  it("isOnVacation respeta períodos abiertos y cerrados", () => {
    const p = [{ start: "2026-10-01", end: "2026-10-03" }, { start: "2026-10-08", end: null }];
    expect(isOnVacation(p, "2026-10-02")).toBe(true);
    expect(isOnVacation(p, "2026-10-05")).toBe(false);
    expect(isOnVacation(p, "2026-12-01")).toBe(true);
  });
  it("idleDaysExcludingVacation no cuenta los días de vacaciones", () => {
    expect(idleDaysExcludingVacation([], "2026-10-01", "2026-10-09")).toBe(8);
    expect(idleDaysExcludingVacation([{ start: "2026-10-03", end: "2026-10-08" }], "2026-10-01", "2026-10-09")).toBe(2);
  });
  it("mergeVacationPeriods prefiere el período cerrado", () => {
    const m = mergeVacationPeriods([{ start: "2026-10-01", end: null }], [{ start: "2026-10-01", end: "2026-10-05" }]);
    expect(m).toEqual([{ start: "2026-10-01", end: "2026-10-05" }]);
  });
  it("vacationLength cuenta días inclusive", () => {
    expect(vacationLength({ start: "2026-10-01", end: "2026-10-03" })).toBe(3);
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
