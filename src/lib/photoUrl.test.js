import { describe, it, expect, vi } from "vitest";

vi.mock("./supabase.js", () => ({ supabase: { storage: { from: () => ({ createSignedUrl: vi.fn() }) } } }));

import { photoPathFromUrl, storedPhotoRef, cachedPhotoSrc } from "./photoUrl.js";

describe("photoPathFromUrl", () => {
  it("lee la ruta de una referencia nueva", () => {
    expect(photoPathFromUrl("storage:progress-photos/u1/progress/1.jpg")).toBe("u1/progress/1.jpg");
    expect(photoPathFromUrl(storedPhotoRef("u1/progress/2.png"))).toBe("u1/progress/2.png");
  });
  it("lee la ruta de una URL pública vieja", () => {
    const url = "https://x.supabase.co/storage/v1/object/public/progress-photos/u1/progress/3.jpg";
    expect(photoPathFromUrl(url)).toBe("u1/progress/3.jpg");
  });
  it("devuelve null si no es una foto del bucket", () => {
    expect(photoPathFromUrl("https://example.com/a.jpg")).toBeNull();
    expect(photoPathFromUrl("")).toBeNull();
    expect(photoPathFromUrl(undefined)).toBeNull();
  });
});

describe("cachedPhotoSrc", () => {
  it("usa el dataUrl local si existe", () => {
    expect(cachedPhotoSrc({ dataUrl: "data:image/png;base64,AA" })).toBe("data:image/png;base64,AA");
  });
  it("una URL externa se devuelve tal cual", () => {
    expect(cachedPhotoSrc({ url: "https://example.com/a.jpg" })).toBe("https://example.com/a.jpg");
  });
  it("una foto del bucket sin firmar todavía devuelve vacío", () => {
    expect(cachedPhotoSrc({ url: "storage:progress-photos/u9/progress/9.jpg" })).toBe("");
  });
});
