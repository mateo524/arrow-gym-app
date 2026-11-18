// Antropometría: cálculos del informe (perfil restringido ISAK + somatotipo Heath-Carter).
// Funciones puras, sin React ni Supabase. Pliegues en mm, perímetros y diámetros en cm, peso en kg, talla en cm.
//
// Fuentes de las fórmulas:
//  - Durnin & Womersley (1974): densidad corporal con la suma de 4 pliegues (tríceps, bíceps, subescapular, cresta ilíaca),
//    coeficientes por sexo y franja de edad; % grasa con Siri (495/D - 450).
//  - Faulkner (1968): % grasa = 0,153 x (tríceps + subescapular + supraespinal + abdominal) + 5,783.
//  - Heath & Carter (1990), Manual de instrucciones del somatotipo antropométrico.
//  - Yuhasz (1974): % grasa con la suma de 6 pliegues, ecuaciones por sexo (versión estándar publicada por topendsports.com).
//  - Lee et al. (2000), Am J Clin Nutr 72:796-803: masa muscular esquelética con perímetros corregidos por pliegue.
//  - ISAK: suma de 6 pliegues (tríceps, subescapular, supraespinal, abdominal, muslo frontal, pantorrilla medial).
//  - OMS: IMC e índice cintura-cadera. ACE: categorías de % grasa.

export const SKINFOLD_FIELDS = [
  { key: "triceps_mm", label: "Tríceps" },
  { key: "subscapular_mm", label: "Subescapular" },
  { key: "biceps_mm", label: "Bíceps" },
  { key: "iliac_crest_mm", label: "Cresta ilíaca" },
  { key: "supraspinal_mm", label: "Supraespinal" },
  { key: "abdominal_mm", label: "Abdominal" },
  { key: "front_thigh_mm", label: "Muslo frontal" },
  { key: "medial_calf_mm", label: "Pantorrilla medial" },
];

export const GIRTH_FIELDS = [
  { key: "arm_relaxed_cm", label: "Brazo relajado" },
  { key: "arm_flexed_cm", label: "Brazo flexionado y contraído" },
  { key: "waist_cm", label: "Cintura" },
  { key: "hip_cm", label: "Cadera" },
  { key: "thigh_cm", label: "Muslo medio" },
  { key: "calf_cm", label: "Pantorrilla (máximo)" },
];

export const BREADTH_FIELDS = [
  { key: "humerus_cm", label: "Diámetro del húmero (biepicondíleo)" },
  { key: "femur_cm", label: "Diámetro del fémur (biepicondíleo)" },
];

const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;
const num = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Edad en años cumplidos a partir de "YYYY-MM-DD" (fecha local, sin corrimiento por UTC). */
export function ageFromDob(dob, today = new Date()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dob || ""));
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
  let age = today.getFullYear() - y;
  if (today.getMonth() < mo || (today.getMonth() === mo && today.getDate() < d)) age--;
  return age >= 0 && age < 120 ? age : null;
}

/** Qué falta para armar la antropometría. Devuelve { complete, missing: [etiquetas] }. */
export function missingForAnthropometry(profile, weightKg) {
  const p = profile || {};
  const missing = [];
  if (!num(weightKg ?? p.weight_kg)) missing.push("Peso");
  if (!num(p.height_cm)) missing.push("Talla");
  if (p.sex !== "M" && p.sex !== "F") missing.push("Sexo");
  if (ageFromDob(p.date_of_birth) === null) missing.push("Fecha de nacimiento");
  for (const f of [...SKINFOLD_FIELDS, ...GIRTH_FIELDS, ...BREADTH_FIELDS]) {
    if (!num(p[f.key])) missing.push(f.label);
  }
  return { complete: missing.length === 0, missing };
}

// Coeficientes de Durnin & Womersley: [c, m] por franja de edad.
const DW = {
  M: [[19, 1.162, 0.063], [29, 1.1631, 0.0632], [39, 1.1422, 0.0544], [49, 1.162, 0.07], [Infinity, 1.1715, 0.0779]],
  F: [[19, 1.1549, 0.0678], [29, 1.1599, 0.0717], [39, 1.1423, 0.0632], [49, 1.1333, 0.0612], [Infinity, 1.1339, 0.0645]],
};

export function durninWomersley({ triceps, biceps, subscapular, iliacCrest, sex, age }) {
  const sum4 = triceps + biceps + subscapular + iliacCrest;
  const row = DW[sex === "F" ? "F" : "M"].find(([max]) => age <= max);
  const density = row[1] - row[2] * Math.log10(sum4);
  const pct = 495 / density - 450; // Siri
  return { pct: r1(pct), sum4: r1(sum4), density: Math.round(density * 10000) / 10000 };
}

export function faulkner({ triceps, subscapular, supraspinal, abdominal }) {
  return r1(0.153 * (triceps + subscapular + supraspinal + abdominal) + 5.783);
}

/** Yuhasz: pliegues de tríceps, subescapular, supraespinal, abdominal, muslo frontal y pantorrilla medial (mm). */
export function yuhasz(sum6, sex) {
  return r1(sex === "F" ? 0.1548 * sum6 + 3.58 : 0.1051 * sum6 + 2.585);
}

/**
 * Masa muscular esquelética (Lee et al. 2000): SM = altura(m) x (0,00744 CAG^2 + 0,00088 CTG^2 + 0,00441 CCG^2) + 2,4 x sexo - 0,048 x edad + 7,8
 * sexo: 1 = hombre, 0 = mujer. Perímetros corregidos (cm) = perímetro - pi x pliegue (cm): brazo relajado, muslo medio y pantorrilla.
 * La ecuación original suma además un ajuste por etnia (asiáticos y afrodescendientes); la app no lo pide y se aplica 0.
 */
export function leeMuscleMass({ height, age, sex, armRelaxed, triceps, thigh, frontThigh, calf, medialCalf }) {
  const cag = armRelaxed - (Math.PI * triceps) / 10;
  const ctg = thigh - (Math.PI * frontThigh) / 10;
  const ccg = calf - (Math.PI * medialCalf) / 10;
  const kg = (height / 100) * (0.00744 * cag ** 2 + 0.00088 * ctg ** 2 + 0.00441 * ccg ** 2) + 2.4 * (sex === "M" ? 1 : 0) - 0.048 * age + 7.8;
  return { kg: r1(kg), cag: r1(cag), ctg: r1(ctg), ccg: r1(ccg) };
}

/** Somatotipo Heath-Carter antropométrico. Devuelve endomorfia, mesomorfia, ectomorfia y coordenadas de la somatocarta. */
export function somatotype({ height, weight, triceps, subscapular, supraspinal, medialCalf, armFlexed, calf, humerus, femur }) {
  // Endomorfia: suma de 3 pliegues corregida por talla (170,18 cm de referencia)
  const x = (triceps + subscapular + supraspinal) * (170.18 / height);
  const endo = -0.7182 + 0.1451 * x - 0.00068 * x ** 2 + 0.0000014 * x ** 3;
  // Mesomorfia: diámetros óseos y perímetros corregidos por pliegue (el pliegue en mm pasa a cm)
  const armCorr = armFlexed - triceps / 10;
  const calfCorr = calf - medialCalf / 10;
  const meso = 0.858 * humerus + 0.601 * femur + 0.188 * armCorr + 0.161 * calfCorr - 0.131 * height + 4.5;
  // Ectomorfia: índice altura-peso (HWR)
  const hwr = height / Math.cbrt(weight);
  const ecto = hwr >= 40.75 ? 0.732 * hwr - 28.58 : hwr > 38.25 ? 0.463 * hwr - 17.63 : 0.1;
  const e = Math.max(0.1, endo), m = Math.max(0.1, meso), c = Math.max(0.1, ecto);
  return {
    endo: r1(e), meso: r1(m), ecto: r1(c),
    x: r1(c - e), y: r1(2 * m - (e + c)),
    hwr: r2(hwr), armCorr: r1(armCorr), calfCorr: r1(calfCorr),
  };
}

const COMP = { endo: "endomorfo", meso: "mesomorfo", ecto: "ectomorfo" };

/** Clasificación orientativa del somatotipo (simplificación de las 13 categorías de Carter). */
export function somatotypeLabel({ endo, meso, ecto }) {
  const arr = [["endo", endo], ["meso", meso], ["ecto", ecto]].sort((a, b) => b[1] - a[1]);
  const [[k1, v1], [k2, v2], [, v3]] = arr;
  if (v1 - v3 < 1.5) return "Central (sin componente dominante)";
  if (v1 - v2 <= 0.5) return `${COMP[k1]}-${COMP[k2]}`.replace(/^./, (s) => s.toUpperCase());
  const base = `${COMP[k1]}`.replace(/^./, (s) => s.toUpperCase());
  if (v1 - v2 >= 1 && v2 - v3 < 0.5) return `${base} balanceado`;
  return `${base} con tendencia ${COMP[k2]}`;
}

export function bmiCategory(bmi) {
  return bmi < 18.5 ? "Bajo peso" : bmi < 25 ? "Normal" : bmi < 30 ? "Sobrepeso" : "Obesidad";
}

/** Categorías de % de grasa (ACE). */
export function fatCategory(pct, sex) {
  const t = sex === "F" ? [13, 20, 24, 31] : [5, 13, 17, 24];
  return pct <= t[0] ? "Grasa esencial" : pct <= t[1] ? "Deportista" : pct <= t[2] ? "Fitness" : pct <= t[3] ? "Promedio" : "Por encima del promedio";
}

export function waistHipRisk(ratio, sex) {
  const limit = sex === "F" ? 0.85 : 0.9;
  return ratio > limit ? `Por encima del límite OMS (${limit.toFixed(2)})` : `Dentro del límite OMS (${limit.toFixed(2)})`;
}

/** Valores fuera de lo fisiológicamente razonable: se avisan en el informe, no lo bloquean. */
export function plausibilityWarnings(p, weight) {
  const out = [];
  for (const f of SKINFOLD_FIELDS) if (num(p[f.key]) > 60) out.push(`${f.label}: ${p[f.key]} mm parece demasiado alto (revisá que esté en mm).`);
  for (const f of [...GIRTH_FIELDS]) if (num(p[f.key]) > 200) out.push(`${f.label}: ${p[f.key]} cm parece demasiado alto.`);
  for (const f of BREADTH_FIELDS) if (num(p[f.key]) > 20) out.push(`${f.label}: ${p[f.key]} cm parece demasiado alto (los diámetros óseos suelen ir de 5 a 12 cm).`);
  if (num(p.height_cm) && (num(p.height_cm) < 120 || num(p.height_cm) > 230)) out.push("La talla cargada está fuera de rango habitual.");
  if (num(weight) && (num(weight) < 30 || num(weight) > 250)) out.push("El peso cargado está fuera de rango habitual.");
  return out;
}

/** Arma todo el informe a partir del perfil. Devuelve null si faltan datos. */
export function computeAnthropometry(profile, weightKg, today = new Date()) {
  const p = profile || {};
  const weight = num(weightKg ?? p.weight_kg);
  const { complete, missing } = missingForAnthropometry(p, weight);
  if (!complete) return { complete: false, missing };

  const height = num(p.height_cm);
  const sex = p.sex;
  const age = ageFromDob(p.date_of_birth, today);
  const s = {
    triceps: num(p.triceps_mm), subscapular: num(p.subscapular_mm), biceps: num(p.biceps_mm), iliacCrest: num(p.iliac_crest_mm),
    supraspinal: num(p.supraspinal_mm), abdominal: num(p.abdominal_mm), frontThigh: num(p.front_thigh_mm), medialCalf: num(p.medial_calf_mm),
  };
  const sum6 = r1(s.triceps + s.subscapular + s.supraspinal + s.abdominal + s.frontThigh + s.medialCalf);
  const sum8 = r1(sum6 + s.biceps + s.iliacCrest);
  const bmi = r1(weight / (height / 100) ** 2);
  const waistHip = r2(num(p.waist_cm) / num(p.hip_cm));
  const dw = durninWomersley({ ...s, sex, age });
  const fa = faulkner(s);
  const yu = yuhasz(sum6, sex);
  const muscle = leeMuscleMass({
    height, age, sex, armRelaxed: num(p.arm_relaxed_cm), triceps: s.triceps, thigh: num(p.thigh_cm),
    frontThigh: s.frontThigh, calf: num(p.calf_cm), medialCalf: s.medialCalf,
  });
  const fatKg = r1((weight * dw.pct) / 100);
  const soma = somatotype({
    height, weight, triceps: s.triceps, subscapular: s.subscapular, supraspinal: s.supraspinal, medialCalf: s.medialCalf,
    armFlexed: num(p.arm_flexed_cm), calf: num(p.calf_cm), humerus: num(p.humerus_cm), femur: num(p.femur_cm),
  });

  return {
    complete: true,
    person: { name: p.name || "", sex, age, height, weight },
    skinfolds: SKINFOLD_FIELDS.map((f) => ({ label: f.label, value: num(p[f.key]) })),
    girths: GIRTH_FIELDS.map((f) => ({ label: f.label, value: num(p[f.key]) })),
    breadths: BREADTH_FIELDS.map((f) => ({ label: f.label, value: num(p[f.key]) })),
    sum6, sum8,
    bmi, bmiCategory: bmiCategory(bmi),
    waistHip, waistHipRisk: waistHipRisk(waistHip, sex),
    fatDW: dw.pct, fatDWCategory: fatCategory(dw.pct, sex), sum4DW: dw.sum4,
    fatFaulkner: fa,
    fatYuhasz: yu, fatYuhaszCategory: fatCategory(yu, sex),
    fatAvg: r1((dw.pct + fa + yu) / 3),
    muscle: { ...muscle, pct: r1((muscle.kg / weight) * 100) },
    fatMassKg: fatKg, leanMassKg: r1(weight - fatKg),
    somatotype: soma, somatotypeLabel: somatotypeLabel(soma),
    warnings: plausibilityWarnings(p, weight),
    date: today,
  };
}
