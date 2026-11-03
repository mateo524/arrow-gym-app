import { describe, it, expect } from "vitest";
import { compareExerciseVolume } from "./volumeCompare.js";

const s = (weight, reps, extraWeight) => ({ weight, reps, extraWeight });

describe("compareExerciseVolume", () => {
  it("sin datos devuelve null", () => {
    expect(compareExerciseVolume([], [s(15, 10)])).toBeNull();
    expect(compareExerciseVolume([s(15, 10)], [])).toBeNull();
  });
  it("compara solo las primeras N series (a mitad de entreno no parece una caída)", () => {
    // Última vez 15x10, 15x8, 15x8; hoy solo la primera: 15x10
    const r = compareExerciseVolume([s(15, 10)], [s(15, 10), s(15, 8), s(15, 8)]);
    expect(r).toMatchObject({ n: 1, today: 150, last: 150, status: "same" });
  });
  it("bajar el peso pero hacer más reps cuenta como progreso", () => {
    const r = compareExerciseVolume([s(12, 15), s(12, 15)], [s(15, 10), s(15, 8)]);
    expect(r.status).toBe("up");
    expect(r.weightDown).toBe(true);
    expect(r.message).toMatch(/más volumen/);
  });
  it("menos volumen se marca como down", () => {
    const r = compareExerciseVolume([s(10, 5)], [s(15, 10)]);
    expect(r).toMatchObject({ status: "down", pct: -67 });
  });
  it("peso corporal suma el peso extra", () => {
    const r = compareExerciseVolume([s(70, 10, 5)], [s(70, 10, 0)]);
    expect(r.status).toBe("up");
  });
});
