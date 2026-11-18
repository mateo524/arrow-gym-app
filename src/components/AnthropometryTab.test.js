import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";

vi.mock("../lib/supabase.js", () => ({ supabase: { from: () => ({ update: () => ({ eq: async () => ({ error: null }) }) }) } }));
vi.mock("../store/useAuthStore.js", () => ({ default: { getState: () => ({ profile: {}, cacheProfile() {} }), setState() {} } }));

import AnthropometryTab from "./AnthropometryTab.jsx";

const FULL = {
  id: "u1", name: "Mateo", sex: "M", date_of_birth: "2000-06-15", height_cm: 175, weight_kg: 70,
  triceps_mm: 8, subscapular_mm: 10, biceps_mm: 4, iliac_crest_mm: 12, supraspinal_mm: 6, abdominal_mm: 14,
  front_thigh_mm: 12, medial_calf_mm: 6,
  arm_relaxed_cm: 30, arm_flexed_cm: 33, waist_cm: 80, hip_cm: 96, calf_cm: 37, humerus_cm: 6.8, femur_cm: 9.5,
};

describe("pestaña Antropometría", () => {
  it("con datos incompletos muestra el avance y qué falta, sin botón de PDF", () => {
    const html = renderToStaticMarkup(h(AnthropometryTab, { profile: { ...FULL, abdominal_mm: "", femur_cm: "", sex: null }, weightKg: 70, onGoTab: () => {} }));
    expect(html).toContain("7/8");
    expect(html).toContain("1/2");
    expect(html).toContain("Abdominal");
    expect(html).toContain("Masculino"); // pide el sexo
    expect(html).not.toContain("Descargar informe en PDF");
  });

  it("con 8 pliegues y todo lo demás muestra resultados, somatocarta y el botón de PDF", () => {
    const html = renderToStaticMarkup(h(AnthropometryTab, { profile: FULL, weightKg: 70, onGoTab: () => {} }));
    expect(html).toContain("8/8");
    expect(html).toContain("Suma de 8 pliegues");
    expect(html).toContain("Suma de 6 pliegues");
    expect(html).toContain("Somatocarta");
    expect(html).toContain("Descargar informe en PDF");
  });
});
