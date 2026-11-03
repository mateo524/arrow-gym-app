import { describe, it, expect } from "vitest";
import { exerciseVideoUrl } from "./exerciseVideo.js";

describe("exerciseVideoUrl", () => {
  it("arma una búsqueda de YouTube con el nombre codificado", () => {
    const u = exerciseVideoUrl("Press de banca plano");
    expect(u.startsWith("https://www.youtube.com/results?search_query=")).toBe(true);
    expect(decodeURIComponent(u.split("=")[1])).toBe("cómo hacer Press de banca plano técnica correcta");
  });
  it("no rompe con nombre vacío", () => {
    expect(exerciseVideoUrl("")).toContain("youtube.com");
  });
});
