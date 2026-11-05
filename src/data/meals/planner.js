import { ALL_MEALS } from "./index.js";
import { foodByName, proteinFamily, isFixedProduce } from "./mealRules.js";

/**
 * Armador de planes de comidas con criterio.
 *  1. Cada momento del día (desayuno, colación, almuerzo, merienda, cena) solo usa comidas curadas para ese momento,
 *     así no aparece pechuga en el desayuno ni mezclas raras (ver mealRules.js).
 *  2. Filtros duros de dieta y alergias sobre cada comida; presupuesto y tiempo de preparación como preferencia.
 *  3. Variedad: no se repite un plato en varios días, se rota la proteína.
 *  4. Se escala el plato completo y se ajusta un ingrediente flexible (hidrato, proteína o grasa) para llegar a las calorías
 *     y a la proteína del momento. Verduras y frutas no se estiran para cerrar macros.
 * Mantiene la forma del plan anterior para que la pantalla de Comidas lo siga mostrando igual.
 */

export const DAY_NAMES_PLAN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Reparto calórico por cantidad de comidas (guías argentinas y práctica de apps de planes).
export const PLAN_SLOTS = {
  3: [
    { id: "desayuno", type: "desayuno", label: "Desayuno", factor: 0.25 },
    { id: "almuerzo", type: "almuerzo", label: "Almuerzo", factor: 0.40 },
    { id: "cena", type: "cena", label: "Cena", factor: 0.35 },
  ],
  4: [
    { id: "desayuno", type: "desayuno", label: "Desayuno", factor: 0.25 },
    { id: "almuerzo", type: "almuerzo", label: "Almuerzo", factor: 0.35 },
    { id: "merienda", type: "merienda", label: "Merienda", factor: 0.15 },
    { id: "cena", type: "cena", label: "Cena", factor: 0.25 },
  ],
  5: [
    { id: "desayuno", type: "desayuno", label: "Desayuno", factor: 0.20 },
    { id: "colacion", type: "colacion", label: "Colación", factor: 0.10 },
    { id: "almuerzo", type: "almuerzo", label: "Almuerzo", factor: 0.30 },
    { id: "merienda", type: "merienda", label: "Merienda", factor: 0.15 },
    { id: "cena", type: "cena", label: "Cena", factor: 0.25 },
  ],
  6: [
    { id: "desayuno", type: "desayuno", label: "Desayuno", factor: 0.18 },
    { id: "colacion1", type: "colacion", label: "Colación AM", factor: 0.10 },
    { id: "almuerzo", type: "almuerzo", label: "Almuerzo", factor: 0.27 },
    { id: "merienda", type: "merienda", label: "Merienda", factor: 0.13 },
    { id: "colacion2", type: "colacion", label: "Colación PM", factor: 0.08 },
    { id: "cena", type: "cena", label: "Cena", factor: 0.24 },
  ],
};

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const r1 = (x) => Math.round(x * 10) / 10;

// Una ingesta de "1 unidad / 1 rebanada / 1 feta…" se redondea a unidades enteras; el resto a múltiplos de 5 g (10 ml).
const UNIT_SERVING = /^\s*\d*\s*(unidad|rebanada|feta|lata|clara|yema|huevo|pote|barra|alfajor|galletita|loncha|rodaja|puñado|cda|cucharada|tostada|scoop|medida)/i;

function roundAmount(food, g, min, max) {
  const liquid = food.unit === "ml";
  let out;
  if (UNIT_SERVING.test(String(food.serving)) && food.grams >= 8 && food.grams <= 250) {
    const units = Math.max(1, Math.round(g / food.grams));
    out = units * food.grams;
    if (out > max) out = Math.max(1, Math.floor(max / food.grams)) * food.grams;
  } else {
    const step = liquid ? (g >= 100 ? 10 : 5) : g >= 20 ? 5 : 1;
    out = Math.max(step, Math.round(g / step) * step);
  }
  return clamp(out, Math.min(min, out), Math.max(max, food.grams && out > max ? out : max));
}

function totalsOf(items) {
  return items.reduce((a, it) => {
    const f = it.food, k = it.g / f.grams;
    return { kcal: a.kcal + f.kcal * k, protein: a.protein + f.protein * k, carbs: a.carbs + f.carbs * k, fat: a.fat + f.fat * k };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

/** Escala una comida del catálogo a las calorías (K) y proteína (P) objetivo. */
function scaleMeal(meal, K, P, maxScale = 1.6, minScale = 0.6, limitMult = 1) {
  const items = meal.items.map((it) => ({ ...it, food: foodByName(it.food), base: it.g }));
  if (items.some((it) => !it.food)) return null;
  const base = totalsOf(items.map((it) => ({ ...it, g: it.g })));
  const s0 = clamp(K / Math.max(base.kcal, 1), minScale, maxScale);
  for (const it of items) {
    const fixed = isFixedProduce(it.food);
    const s = fixed ? 1 + (s0 - 1) * 0.4 : s0;
    it.g = clamp(it.base * s, it.min * (limitMult < 1 ? limitMult : 1), it.max * limitMult);
  }
  const perG = (it, key) => it.food[key] / it.food.grams;
  for (let iter = 0; iter < 8; iter++) {
    const pf = items.find((it) => it.flex === "protein");
    const cf = items.find((it) => it.flex === "carb");
    const ff = items.find((it) => it.flex === "fat");
    let tot = totalsOf(items);
    if (pf && P > 0) {
      const dP = perG(pf, "protein");
      if (dP > 0.01) pf.g = clamp(pf.g + ((P - tot.protein) / dP) * 0.85, pf.min * Math.min(1, limitMult), pf.max * limitMult);
      tot = totalsOf(items);
    }
    for (const it of [cf, ff, pf]) {
      if (!it) continue;
      const kp = perG(it, "kcal");
      if (kp < 0.05) continue;
      const gap = K - tot.kcal;
      if (Math.abs(gap) < K * 0.01) break;
      // la proteína flexible solo ayuda con calorías si no se pasa de su objetivo
      if (it === pf && tot.protein > P * 1.15 && gap > 0) continue;
      it.g = clamp(it.g + gap / kp, it.min * Math.min(1, limitMult), it.max * limitMult);
      tot = totalsOf(items);
    }
  }
  for (const it of items) it.g = roundAmount(it.food, it.g, it.min * Math.min(1, limitMult), it.max * limitMult);
  const t = totalsOf(items);
  const kcalErr = Math.abs(t.kcal - K) / Math.max(K, 1);
  const protErr = P > 0 ? Math.max(0, (P - t.protein) / P) : 0;
  const protOver = P > 0 ? Math.max(0, (t.protein - P * 1.25) / P) : 0;
  return { items, totals: t, kcalErr, protErr, protOver };
}

const cleanName = (name) => String(name).replace(/\s*\(\s*[^)]*\d[^)]*\)\s*$/i, "").trim();

function allowedByDiet(meal, restrictions, allergies) {
  const diet = meal.diet || [];
  for (const r of restrictions || []) if (["vegano", "vegetariano", "sin_lacteos", "sin_gluten"].includes(r) && !diet.includes(r)) {
    // vegano implica vegetariano y sin lácteos
    if (r === "vegetariano" && diet.includes("vegano")) continue;
    if (r === "sin_lacteos" && diet.includes("vegano")) continue;
    return false;
  }
  for (const a of allergies || []) if ((meal.contains || []).includes(a)) return false;
  return true;
}

export function generateNutritionPlan(config, tdee, targetCal, proteinG, carbG, fatG) {
  const { days, mealsPerDay, restrictions = [], allergies = [], budget, prepTime, seed } = config;
  const slots = PLAN_SLOTS[mealsPerDay] || PLAN_SLOTS[4];

  let rngSeed = (days * 31 + mealsPerDay * 7 + (seed || 0) + 12345) % 2147483647 || 1;
  const rng = () => { rngSeed = (rngSeed * 16807) % 2147483647; return (rngSeed - 1) / 2147483646; };

  const economico = budget === "economico";
  const result = [];
  const history = []; // por día: { slotId: { id, family } }

  for (let dayIdx = 0; dayIdx < days; dayIdx++) {
    let remK = targetCal, remP = proteinG, remF = 1;
    const usedToday = new Set();
    const dayFamilies = new Set();
    const meals = slots.map((slot) => {
      const sumF = slots.slice(slots.indexOf(slot)).reduce((a, s) => a + s.factor, 0);
      const K = remK * (slot.factor / sumF);
      const P = remP * (slot.factor / sumF);

      let pool = ALL_MEALS.filter((m) => m.slots.includes(slot.type) && allowedByDiet(m, restrictions, allergies));
      if (!pool.length) return { slot: slot.id, label: slot.label, dish: "", items: [], kcal: 0, protein: 0, carbs: 0, fat: 0, note: "Sin opciones para tus restricciones en este momento del día" };
      if (economico) { const cheap = pool.filter((m) => m.cost !== "alto"); if (cheap.length >= 3) pool = cheap; }

      const recent = history.slice(-4);
      let best = null;
      for (const meal of pool) {
        const sc = scaleMeal(meal, K, P);
        if (!sc) continue;
        const fam = meal.items.map((it) => proteinFamily(foodByName(it.food))).find(Boolean) || null;
        let score = sc.kcalErr * 3 + sc.protErr * 2 + sc.protOver * 1.5 + rng() * 0.25;
        if (usedToday.has(meal.id)) score += 5;
        recent.forEach((day, i) => {
          const hit = day[slot.id];
          if (hit?.id === meal.id) score += 3 - i * 0.2;
          if (fam && hit?.family === fam) score += 0.45;
        });
        if (fam && dayFamilies.has(fam)) score += 0.6;
        if (economico && meal.cost === "medio") score += 0.25;
        if (/15|20|30/.test(String(prepTime)) && meal.prep === "largo" && ["desayuno", "merienda", "colacion"].includes(slot.type)) score += 0.4;
        if (!best || score < best.score) best = { meal, sc, score, fam };
      }
      if (!best) return { slot: slot.id, label: slot.label, dish: "", items: [], kcal: 0, protein: 0, carbs: 0, fat: 0 };
      // si no se llega con la escala normal (objetivos muy altos o bajos), se permite estirar más
      if (best.sc.kcalErr > 0.12) {
        const wide = scaleMeal(best.meal, K, P, 2.4, 0.45, K > best.sc.totals.kcal ? 1.5 : 0.75);
        if (wide && wide.kcalErr < best.sc.kcalErr) best.sc = wide;
      }
      usedToday.add(best.meal.id);
      if (best.fam) dayFamilies.add(best.fam);
      remK -= best.sc.totals.kcal; remP -= best.sc.totals.protein;
      const items = best.sc.items.map((it) => {
        const k = it.g / it.food.grams;
        return {
          name: cleanName(it.food.name), grams: Math.round(it.g * 10) / 10,
          ...(it.food.unit === "ml" ? { unit: "ml" } : {}),
          kcal: Math.round(it.food.kcal * k), protein: r1(it.food.protein * k), carbs: r1(it.food.carbs * k), fat: r1(it.food.fat * k),
        };
      });
      const tot = items.reduce((a, i) => ({ kcal: a.kcal + i.kcal, protein: a.protein + i.protein, carbs: a.carbs + i.carbs, fat: a.fat + i.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
      return { slot: slot.id, label: slot.label, dish: best.meal.name, mealId: best.meal.id, items, kcal: tot.kcal, protein: r1(tot.protein), carbs: r1(tot.carbs), fat: r1(tot.fat), _fam: best.fam };
    });
    history.push(Object.fromEntries(meals.filter((m) => m.mealId).map((m) => [m.slot, { id: m.mealId, family: m._fam }])));
    const clean = meals.map(({ _fam, ...m }) => m);
    const dayTot = clean.reduce((a, m) => ({ kcal: a.kcal + m.kcal, protein: a.protein + m.protein, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    result.push({ dayIdx, dayName: DAY_NAMES_PLAN[dayIdx % 7], meals: clean, kcal: dayTot.kcal, protein: r1(dayTot.protein), carbs: r1(dayTot.carbs), fat: r1(dayTot.fat) });
  }

  return {
    config,
    dailyKcal: targetCal,
    dailyProtein: proteinG,
    dailyCarbs: carbG,
    dailyFat: fatG,
    generatedAt: new Date().toISOString(),
    planner: 2,
    days: result,
  };
}
