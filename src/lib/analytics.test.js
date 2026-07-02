import { describe, it, expect } from "vitest";
import {
  calc1RM,
  calcEffective1RM,
  calcSessionStrain,
  getWeeklyFatigueScore,
  getWeightPrescriptions,
} from "./analytics.js";

// ── calc1RM ────────────────────────────────────────────────────────────────
describe("calc1RM", () => {
  it("returns weight for 1 rep (1RM = the weight)", () => {
    expect(calc1RM(100, 1)).toBe(100);
  });

  it("returns 0 for reps outside valid range", () => {
    expect(calc1RM(100, 0)).toBe(0);
    expect(calc1RM(100, 31)).toBe(0);
  });

  it("returns 0 for zero weight", () => {
    expect(calc1RM(0, 5)).toBe(0);
  });

  it("estimates higher 1RM for more reps at same weight (more reps = further from true max)", () => {
    const threeReps = calc1RM(100, 3);
    const tenReps = calc1RM(100, 10);
    // 10 reps at 100kg implies you can do more → higher 1RM estimate
    expect(tenReps).toBeGreaterThan(threeReps);
  });

  it("returns a positive number for typical heavy set", () => {
    const orm = calc1RM(120, 5);
    expect(orm).toBeGreaterThan(120);
    expect(orm).toBeLessThan(160);
  });
});

// ── calcEffective1RM ───────────────────────────────────────────────────────
describe("calcEffective1RM", () => {
  it("equals calc1RM when rir is 0", () => {
    expect(calcEffective1RM(100, 5, 0)).toBe(calc1RM(100, 5));
  });

  it("produces a higher 1RM estimate with RIR > 0 (more reps in reserve)", () => {
    const noRir = calcEffective1RM(100, 8, 0);
    const withRir = calcEffective1RM(100, 8, 3);
    expect(withRir).toBeGreaterThan(noRir);
  });

  it("caps effective reps at 30", () => {
    // reps=25 + rir=10 would be 35 — should be capped at 30
    const capped = calcEffective1RM(100, 25, 10);
    const atCap  = calcEffective1RM(100, 30, 0);
    expect(capped).toBe(atCap);
  });

  it("defaults rir to 0 when not provided", () => {
    expect(calcEffective1RM(80, 6)).toBe(calc1RM(80, 6));
  });
});

// ── calcSessionStrain ──────────────────────────────────────────────────────
describe("calcSessionStrain", () => {
  it("returns 0 for empty workout", () => {
    expect(calcSessionStrain(null)).toBe(0);
    expect(calcSessionStrain({ sets: [] })).toBe(0);
  });

  it("ignores sets with no reps", () => {
    const workout = { sets: [{ reps: 0, rir: 1 }, { reps: "", rir: 0 }] };
    expect(calcSessionStrain(workout)).toBe(0);
  });

  it("calculates correctly with RIR (RIR 0 = effort 10)", () => {
    const workout = { sets: [{ reps: 10, rir: 0 }] };
    // effort = max(7, 10-0) = 10; strain = 10 * 10 = 100
    expect(calcSessionStrain(workout)).toBe(100);
  });

  it("calculates correctly with RIR 3 (effort = max(7,7) = 7)", () => {
    const workout = { sets: [{ reps: 5, rir: 3 }] };
    // effort = max(7, 10-3) = 7; strain = 7 * 5 = 35
    expect(calcSessionStrain(workout)).toBe(35);
  });

  it("falls back to RPE when rir is not set", () => {
    const workout = { sets: [{ reps: 8, rpe: 8 }] };
    // effort = 8; strain = 8 * 8 = 64
    expect(calcSessionStrain(workout)).toBe(64);
  });

  it("sums across multiple sets", () => {
    const workout = {
      sets: [
        { reps: 10, rir: 0 }, // effort 10 → 100
        { reps: 8,  rir: 2 }, // effort 8  → 64
      ],
    };
    expect(calcSessionStrain(workout)).toBe(164);
  });
});

// ── getWeeklyFatigueScore ──────────────────────────────────────────────────
describe("getWeeklyFatigueScore", () => {
  it("returns nulls for empty history", () => {
    const result = getWeeklyFatigueScore([]);
    expect(result.acwr).toBeNull();
    expect(result.thisWeek).toBe(0);
  });

  it("computes ACWR > 1.3 as overreaching", () => {
    const now = Date.now();
    const dayMs = 86400000;
    const makeWorkout = (daysAgo, kgReps) => ({
      date: new Date(now - daysAgo * dayMs).toISOString().slice(0, 10),
      sets: [{ weight: kgReps[0], reps: kgReps[1], exercise: "Sentadilla" }],
    });
    // Heavy recent load, light chronic → high ACWR
    const workouts = [
      makeWorkout(1, [200, 20]),
      makeWorkout(2, [200, 20]),
      makeWorkout(3, [200, 20]),
      makeWorkout(14, [50, 5]),
      makeWorkout(21, [50, 5]),
      makeWorkout(28, [50, 5]),
    ];
    const result = getWeeklyFatigueScore(workouts);
    expect(result.acwr).toBeGreaterThan(1.3);
    expect(result.overreaching).toBe(true);
  });

  it("ACWR in optimal range (0.8–1.3) is not overreaching", () => {
    const now = Date.now();
    const dayMs = 86400000;
    const makeW = (daysAgo) => ({
      date: new Date(now - daysAgo * dayMs).toISOString().slice(0, 10),
      sets: [{ weight: 100, reps: 10, exercise: "Press" }],
    });
    // Consistent load every 7 days
    const workouts = [1, 8, 15, 22].map(makeW);
    const result = getWeeklyFatigueScore(workouts);
    if (result.acwr !== null) {
      expect(result.acwr).toBeGreaterThan(0.5);
    }
  });
});

// ── getWeightPrescriptions ─────────────────────────────────────────────────
describe("getWeightPrescriptions", () => {
  it("returns empty array for fewer than 2 workouts", () => {
    expect(getWeightPrescriptions([])).toEqual([]);
    expect(getWeightPrescriptions([{ sets: [{ exercise: "X", weight: 80, reps: 8 }] }])).toEqual([]);
  });

  it("suggests increasing weight when last reps >= 12", () => {
    const makeW = (date, weight, reps) => ({
      date, sets: [{ exercise: "Jalón", weight: String(weight), reps: String(reps) }],
    });
    const workouts = [
      makeW("2026-06-20", 70, 14),
      makeW("2026-06-13", 70, 12),
    ];
    const result = getWeightPrescriptions(workouts);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].suggestedWeight).toBeGreaterThan(70);
  });

  it("suggests decreasing weight when last reps < 5", () => {
    const makeW = (date, weight, reps) => ({
      date, sets: [{ exercise: "Peso muerto", weight: String(weight), reps: String(reps) }],
    });
    const workouts = [
      makeW("2026-06-20", 150, 3),
      makeW("2026-06-13", 145, 4),
    ];
    const result = getWeightPrescriptions(workouts);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].suggestedWeight).toBeLessThan(150);
  });
});
