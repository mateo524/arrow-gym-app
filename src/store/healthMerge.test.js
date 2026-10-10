import { describe, it, expect } from "vitest";
import { mergeCollection, mergeScalar, mergeTombstones, addTombstone, mergeHealthData, LOG_LIMIT } from "./healthMerge.js";

describe("mergeCollection", () => {
  it("union por id; local gana empates; remoto más nuevo gana", () => {
    const l = [{ id: "a", v: 1, updatedAt: 5 }];
    const r = [{ id: "a", v: 2, updatedAt: 5 }, { id: "b", v: 3 }];
    expect(mergeCollection(l, r).map((x) => x.v)).toEqual([1, 3]);
    expect(mergeCollection(l, [{ id: "a", v: 9, updatedAt: 6 }])[0].v).toBe(9);
  });
  it("tombstone evita que lo borrado reviva", () => {
    const r = [{ id: "a" }, { id: "b" }];
    expect(mergeCollection([], r, { "id:a": 100 }).map((x) => x.id)).toEqual(["b"]);
  });
  it("una entrada más nueva que el tombstone sobrevive", () => {
    expect(mergeCollection([{ id: "a", updatedAt: 200 }], [], { "id:a": 100 })).toHaveLength(1);
  });
  it("ordena por fecha desc y recorta a 90 tras la unión", () => {
    const mk = (n, off) => Array.from({ length: n }, (_, i) => ({ date: `2026-${String(1 + ((i + off) % 12)).padStart(2, "0")}-${String(1 + (i + off) % 28).padStart(2, "0")}-${i + off}` }));
    const out = mergeCollection(mk(60, 0), mk(60, 1000), {}, { sortByDate: true, limit: LOG_LIMIT });
    expect(out).toHaveLength(90);
    const dates = out.map((x) => x.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });
});

describe("tombstones", () => {
  it("unión con máximo y descarte de viejos", () => {
    const now = 1e13;
    const m = mergeTombstones({ a: 5e12, b: now - 10 }, { b: now - 5 }, now);
    expect(m).toEqual({ b: now - 5 });
  });
  it("addTombstone", () => { expect(addTombstone({}, "id:x", 7)).toEqual({ "id:x": 7 }); });
});

describe("mergeScalar", () => {
  it("limpiar (null) más nuevo no resucita", () => {
    expect(mergeScalar({ k: 1 }, 10, null, 20).value).toBeNull();
    expect(mergeScalar(null, 30, { k: 1 }, 20).value).toBeNull();
  });
  it("legacy: local si existe, si no remoto", () => {
    expect(mergeScalar(null, 0, "r", 0).value).toBe("r");
    expect(mergeScalar("l", 0, "r", 0).value).toBe("l");
  });
});

describe("mergeHealthData", () => {
  it("meal borrado localmente no vuelve desde remoto", () => {
    const local = { mealLog: [], healthTombstones: { mealLog: { "id:m1": Date.now() } } };
    const out = mergeHealthData(local, { meal_log: [{ id: "m1" }, { id: "m2" }] });
    expect(out.mealLog.map((m) => m.id)).toEqual(["m2"]);
  });
  it("plan limpiado localmente no resucita; competition igual", () => {
    const local = { nutritionPlan: null, nutritionPlanUpdatedAt: 50, competitionDate: null, competitionName: "", competitionUpdatedAt: 50 };
    const hd = { nutrition_plan: { kcal: 1 }, nutrition_plan_updated_at: 10, competition_date: "2026-12-01", competition_name: "X", competition_updated_at: 10 };
    const out = mergeHealthData(local, hd);
    expect(out.nutritionPlan).toBeNull();
    expect(out.competitionDate).toBeNull();
  });
  it("tombstone remoto elimina entrada local", () => {
    const out = mergeHealthData({ cardioHistory: [{ id: "c1" }] }, { tombstones: { cardioHistory: { "id:c1": Date.now() } } });
    expect(out.cardioHistory).toEqual([]);
  });
});
