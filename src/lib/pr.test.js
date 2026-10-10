import { describe, it, expect } from "vitest";
import { isNewPR } from "./pr.js";

describe("isNewPR", () => {
  it("peso 0 o vacío nunca es récord", () => {
    expect(isNewPR(0, 0, [])).toBe(false);
    expect(isNewPR("", 0, [])).toBe(false);
    expect(isNewPR(null, 50, [])).toBe(false);
  });
  it("un empate no es récord", () => {
    expect(isNewPR(60, 60, [])).toBe(false);
    expect(isNewPR(60, 50, [60])).toBe(false);
  });
  it("primera vez con peso > 0 es récord", () => {
    expect(isNewPR(20, 0, [])).toBe(true);
    expect(isNewPR(20, undefined, undefined)).toBe(true);
  });
  it("supera histórico y series previas de la sesión", () => {
    expect(isNewPR(62.5, 60, [55, 60])).toBe(true);
    expect(isNewPR(60, 50, [65])).toBe(false);
  });
  it("acepta strings", () => {
    expect(isNewPR("80", "70", ["75", ""])).toBe(true);
    expect(isNewPR("70", "70", [])).toBe(false);
  });
});
