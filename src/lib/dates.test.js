import { describe, it, expect, vi, afterEach } from "vitest";
import { todayLocal, dateToLocal, isoToLocalDate } from "./dates.js";

afterEach(() => vi.useRealTimers());

describe("todayLocal", () => {
  it("formatea YYYY-MM-DD con padding usando la fecha local", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 23, 59, 0));
    expect(todayLocal()).toBe("2026-01-05");
  });
  it("fin de año", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 31, 0, 0, 1));
    expect(todayLocal()).toBe("2026-12-31");
  });
});

describe("dateToLocal", () => {
  it("acepta Date", () => {
    expect(dateToLocal(new Date(2024, 1, 29, 10))).toBe("2024-02-29");
  });
  it("acepta timestamp numérico", () => {
    expect(dateToLocal(new Date(2025, 8, 9).getTime())).toBe("2025-09-09");
  });
  it("devuelve '' si es inválida", () => {
    expect(dateToLocal("no-fecha")).toBe("");
    expect(dateToLocal(new Date("x"))).toBe("");
  });
});

describe("isoToLocalDate", () => {
  it("vacío para falsy", () => {
    expect(isoToLocalDate("")).toBe("");
    expect(isoToLocalDate(null)).toBe("");
  });
  it("devuelve el string original si es inválido", () => {
    expect(isoToLocalDate("basura")).toBe("basura");
  });
  it("convierte ISO con hora a fecha local", () => {
    const d = new Date(2026, 2, 7, 15, 30);
    expect(isoToLocalDate(d.toISOString())).toBe("2026-03-07");
  });
});
