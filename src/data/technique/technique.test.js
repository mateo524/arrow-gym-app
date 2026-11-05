import { describe, it, expect } from "vitest";
import { EXERCISE_DATABASE } from "../exerciseDatabase.js";
import { techniqueFor } from "./index.js";

describe("técnica escrita", () => {
  it("las entradas existentes están completas", () => {
    const bad = [];
    for (const e of EXERCISE_DATABASE) {
      const t = techniqueFor(e.name);
      if (!t) continue;
      if (typeof t.setup !== "string" || t.setup.length < 25) bad.push(e.name + ": setup");
      if (!Array.isArray(t.steps) || t.steps.length < 3 || t.steps.length > 6 || t.steps.some((s) => typeof s !== "string" || s.length < 10)) bad.push(e.name + ": steps");
      if (typeof t.breath !== "string" || t.breath.length < 10) bad.push(e.name + ": breath");
      if (!Array.isArray(t.mistakes) || t.mistakes.length < 2 || t.mistakes.length > 4 || t.mistakes.some((s) => typeof s !== "string" || s.length < 10)) bad.push(e.name + ": mistakes");
    }
    expect(bad).toEqual([]);
  });

  it("los 298 ejercicios tienen técnica escrita", () => {
    const missing = EXERCISE_DATABASE.filter((e) => !techniqueFor(e.name)).map((e) => e.name);
    expect(missing.slice(0, 10)).toEqual([]);
  });
});
