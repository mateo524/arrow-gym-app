import { describe, it, expect } from "vitest";
import { formatDMY, formatDM } from "./dates.js";

describe("formatDMY / formatDM", () => {
  it("muestra siempre día primero y mes después", () => {
    expect(formatDMY("2025-11-10")).toBe("10/11/2025");
    expect(formatDM("2025-11-10")).toBe("10/11");
  });
  it("acepta fechas ISO con hora", () => {
    expect(formatDMY("2025-03-05T14:30:00.000Z")).toBe("05/03/2025");
  });
  it("devuelve vacío o el texto original si no es una fecha", () => {
    expect(formatDMY("")).toBe("");
    expect(formatDMY(undefined)).toBe("");
    expect(formatDMY("sin fecha")).toBe("sin fecha");
  });
});
