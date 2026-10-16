import { describe, it, expect } from "vitest";
import { applySavedOrder, orderFromSets } from "./exerciseOrder.js";

describe("applySavedOrder", () => {
  it("respeta el orden guardado", () => {
    expect(applySavedOrder(["A", "B", "C"], ["C", "A", "B"])).toEqual(["C", "A", "B"]);
  });
  it("los ejercicios nuevos van al final y los borrados se ignoran", () => {
    expect(applySavedOrder(["A", "B", "D"], ["C", "B", "A"])).toEqual(["B", "A", "D"]);
  });
  it("sin orden guardado no cambia nada", () => {
    const l = ["A", "B"];
    expect(applySavedOrder(l, [])).toBe(l);
    expect(applySavedOrder(l, undefined)).toBe(l);
  });
  it("funciona con objetos y sin importar mayúsculas", () => {
    const r = applySavedOrder([{ name: "Press Banca" }, { name: "Remo" }], ["remo", "PRESS BANCA"]);
    expect(r.map((x) => x.name)).toEqual(["Remo", "Press Banca"]);
  });
});

describe("orderFromSets", () => {
  it("devuelve nombres únicos en orden de aparición", () => {
    expect(orderFromSets([{ exercise: "B" }, { exercise: "A" }, { exercise: "B" }])).toEqual(["B", "A"]);
  });
});
