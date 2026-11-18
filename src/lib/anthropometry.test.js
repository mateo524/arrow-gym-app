import { describe, it, expect } from "vitest";
import {
  ageFromDob, missingForAnthropometry, durninWomersley, faulkner, somatotype, somatotypeLabel,
  computeAnthropometry, fatCategory, bmiCategory, yuhasz, leeMuscleMass,
} from "./anthropometry.js";

const FULL = {
  name: "Mateo", sex: "M", date_of_birth: "2000-06-15", height_cm: 175, weight_kg: 70,
  triceps_mm: 8, subscapular_mm: 10, biceps_mm: 4, iliac_crest_mm: 12, supraspinal_mm: 6, abdominal_mm: 14,
  front_thigh_mm: 12, medial_calf_mm: 6,
  arm_relaxed_cm: 30, arm_flexed_cm: 33, waist_cm: 80, hip_cm: 96, thigh_cm: 55, calf_cm: 37, humerus_cm: 6.8, femur_cm: 9.5,
};

describe("antropometría", () => {
  it("edad: no se corre por UTC y respeta el cumpleaños", () => {
    expect(ageFromDob("2000-11-05", new Date(2026, 10, 5))).toBe(26);
    expect(ageFromDob("2000-11-06", new Date(2026, 10, 5))).toBe(25);
    expect(ageFromDob("", new Date())).toBeNull();
  });

  it("detecta qué falta", () => {
    expect(missingForAnthropometry(FULL, 70).complete).toBe(true);
    const r = missingForAnthropometry({ ...FULL, femur_cm: "", sex: null, thigh_cm: "" }, 70);
    expect(r.complete).toBe(false);
    expect(r.missing).toEqual(expect.arrayContaining(["Sexo", "Diámetro del fémur (biepicondíleo)", "Muslo medio"]));
  });

  it("Durnin-Womersley: hombre de 25 años con 40 mm de suma da cerca de 16 %", () => {
    const r = durninWomersley({ triceps: 10, biceps: 6, subscapular: 12, iliacCrest: 12, sex: "M", age: 25 });
    expect(r.sum4).toBe(40);
    expect(r.pct).toBeGreaterThan(15.5);
    expect(r.pct).toBeLessThan(17);
  });

  it("Durnin-Womersley: a igual suma, una mujer tiene más % grasa que un hombre", () => {
    const base = { triceps: 10, biceps: 6, subscapular: 12, iliacCrest: 12, age: 25 };
    expect(durninWomersley({ ...base, sex: "F" }).pct).toBeGreaterThan(durninWomersley({ ...base, sex: "M" }).pct);
  });

  it("Faulkner", () => {
    expect(faulkner({ triceps: 10, subscapular: 12, supraspinal: 8, abdominal: 14 })).toBeCloseTo(12.5, 1);
  });

  it("Yuhasz: ecuaciones por sexo", () => {
    expect(yuhasz(56, "M")).toBeCloseTo(8.5, 1);  // 0,1051 x 56 + 2,585
    expect(yuhasz(56, "F")).toBeCloseTo(12.2, 1); // 0,1548 x 56 + 3,580
    expect(yuhasz(80, "F")).toBeGreaterThan(yuhasz(80, "M"));
  });

  it("Lee 2000: masa muscular en un rango plausible y cambia con sexo y edad", () => {
    const base = { height: 175, age: 26, sex: "M", armRelaxed: 30, triceps: 8, thigh: 55, frontThigh: 12, calf: 37, medialCalf: 6 };
    const m = leeMuscleMass(base);
    expect(m.cag).toBeCloseTo(27.5, 1);
    expect(m.ctg).toBeCloseTo(51.2, 1);
    expect(m.kg).toBeGreaterThan(28); expect(m.kg).toBeLessThan(38);
    expect(Math.abs(leeMuscleMass({ ...base, sex: "F" }).kg - (m.kg - 2.4))).toBeLessThan(0.11);
    expect(Math.abs(leeMuscleMass({ ...base, age: 46 }).kg - (m.kg - 0.96))).toBeLessThan(0.11);
  });

  it("somatotipo: caso típico queda en rangos razonables", () => {
    const s = somatotype({ height: 175, weight: 70, triceps: 8, subscapular: 10, supraspinal: 6, medialCalf: 6, armFlexed: 33, calf: 37, humerus: 6.8, femur: 9.5 });
    expect(s.endo).toBeGreaterThan(1.5); expect(s.endo).toBeLessThan(3.5);
    expect(s.meso).toBeGreaterThan(4); expect(s.meso).toBeLessThan(6);
    expect(s.ecto).toBeGreaterThan(1.5); expect(s.ecto).toBeLessThan(3.5);
    expect(s.x).toBeCloseTo(s.ecto - s.endo, 1);
    expect(s.y).toBeCloseTo(2 * s.meso - (s.endo + s.ecto), 1);
  });

  it("somatotipo: ninguna componente baja de 0,1 y la ectomorfia mínima vale 0,1", () => {
    const s = somatotype({ height: 160, weight: 120, triceps: 1, subscapular: 1, supraspinal: 1, medialCalf: 1, armFlexed: 20, calf: 20, humerus: 5, femur: 7 });
    expect(Math.min(s.endo, s.meso, s.ecto)).toBeGreaterThanOrEqual(0.1);
  });

  it("clasificación del somatotipo", () => {
    expect(somatotypeLabel({ endo: 4, meso: 4, ecto: 4 })).toMatch(/Central/);
    expect(somatotypeLabel({ endo: 2, meso: 6, ecto: 2 })).toBe("Mesomorfo balanceado");
    expect(somatotypeLabel({ endo: 5, meso: 5, ecto: 1.5 })).toBe("Endomorfo-mesomorfo");
  });

  it("informe completo y categorías", () => {
    const r = computeAnthropometry(FULL, 70, new Date(2026, 10, 18));
    expect(r.complete).toBe(true);
    expect(r.sum6).toBe(56);
    expect(r.sum8).toBe(72);
    expect(r.bmi).toBeCloseTo(22.9, 1);
    expect(r.waistHip).toBeCloseTo(0.83, 2);
    expect(r.fatMassKg + r.leanMassKg).toBeCloseTo(70, 1);
    expect(r.fatYuhasz).toBeCloseTo(8.5, 1);
    expect(r.fatAvg).toBeGreaterThan(8); expect(r.fatAvg).toBeLessThan(16);
    expect(r.muscle.pct).toBeGreaterThan(40); expect(r.muscle.pct).toBeLessThan(55);
    expect(r.girths).toHaveLength(6);
    expect(r.skinfolds).toHaveLength(8);
    expect(computeAnthropometry({ ...FULL, hip_cm: "" }, 70).complete).toBe(false);
    expect(fatCategory(15, "M")).toBe("Fitness");
    expect(bmiCategory(27)).toBe("Sobrepeso");
  });
});
