import { describe, it, expect } from "vitest";
import { monthToDateVolumes, formatVolume } from "./monthVolume.js";

const w = (date, weight, reps) => ({ date, sets: [{ weight, reps }] });

describe("volumen del mes vs mismo día del mes anterior", () => {
  const today = new Date(2026, 10, 18); // 18 de noviembre
  const workouts = [
    w("2026-11-03", 100, 10),  // 1000, este mes
    w("2026-11-18", 50, 10),   // 500, hoy cuenta
    w("2026-11-20", 999, 99),  // futuro: no debería existir, no cuenta
    w("2026-10-05", 80, 10),   // 800, mes pasado hasta el día 18
    w("2026-10-18", 20, 10),   // 200, justo el mismo día
    w("2026-10-19", 500, 10),  // 5000, después del día 18: no cuenta
    w("2026-09-10", 1, 1),     // dos meses atrás: no cuenta
  ];

  it("compara hasta el mismo día", () => {
    const r = monthToDateVolumes(workouts, today);
    expect(r.current).toBe(1500);
    expect(r.prev).toBe(1000);
    expect(r.day).toBe(18);
  });

  it("el 31 compara contra el último día del mes anterior más corto", () => {
    const r = monthToDateVolumes([w("2026-10-30", 10, 10), w("2026-11-30", 10, 10)], new Date(2026, 11, 31));
    expect(r.prevDay).toBe(30); // noviembre tiene 30 días
    expect(r.prev).toBe(100);
  });

  it("enero compara con diciembre del año anterior", () => {
    const r = monthToDateVolumes([w("2025-12-10", 10, 10), w("2026-01-05", 20, 10)], new Date(2026, 0, 15));
    expect(r.current).toBe(200);
    expect(r.prev).toBe(100);
  });

  it("formato", () => {
    expect(formatVolume(12345)).toBe("12,3 k");
    expect(formatVolume(850)).toBe("850 kg");
  });
});
