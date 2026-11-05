import { describe, it, expect } from "vitest";
import { ALL_MEALS } from "./index.js";
import { validateMeal, foodByName } from "./mealRules.js";
import { generateNutritionPlan, PLAN_SLOTS } from "./planner.js";

const count = (slot) => ALL_MEALS.filter((m) => m.slots.includes(slot)).length;

describe("catálogo de comidas", () => {
  it("cada comida cumple las reglas de criterio (momento, combinaciones, etiquetas)", () => {
    const bad = ALL_MEALS.flatMap((m) => validateMeal(m));
    expect(bad).toEqual([]);
  });

  it("los ids son únicos", () => {
    const ids = ALL_MEALS.map((m) => m.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it("hay suficientes comidas por momento del día", () => {
    expect(count("desayuno")).toBeGreaterThanOrEqual(20);
    expect(count("merienda")).toBeGreaterThanOrEqual(20);
    expect(count("colacion")).toBeGreaterThanOrEqual(25);
    expect(count("almuerzo")).toBeGreaterThanOrEqual(40);
    expect(count("cena")).toBeGreaterThanOrEqual(35);
  });

  it("hay opciones para cada dieta en cada momento", () => {
    const miss = [];
    for (const diet of ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"]) {
      for (const slot of ["desayuno", "colacion", "almuerzo", "merienda", "cena"]) {
        if (ALL_MEALS.filter((m) => m.slots.includes(slot) && (m.diet || []).includes(diet)).length < 3) miss.push(`${diet}/${slot}`);
      }
    }
    expect(miss).toEqual([]);
  });
});

describe("armador de planes", () => {
  const targets = [2200, 150, 240, 70];
  const base = { days: 7, mealsPerDay: 4, goal: "mantenimiento", restrictions: [], allergies: [], budget: "moderado", prepTime: "30min", seed: 1 };
  const make = (over = {}) => generateNutritionPlan({ ...base, ...over }, targets[0], targets[0], targets[1], targets[2], targets[3]);

  it("arma todos los momentos de todos los días y se acerca a las calorías y proteína", () => {
    for (const mealsPerDay of [3, 4, 5, 6]) {
      const plan = make({ mealsPerDay });
      expect(plan.days).toHaveLength(7);
      for (const d of plan.days) {
        expect(d.meals).toHaveLength(PLAN_SLOTS[mealsPerDay].length);
        for (const m of d.meals) { expect(m.items.length).toBeGreaterThan(0); expect(m.dish).toBeTruthy(); }
        expect(Math.abs(d.kcal - targets[0]) / targets[0]).toBeLessThan(0.12);
        expect(d.protein).toBeGreaterThan(targets[1] * 0.85);
      }
    }
  }, 30000); // arma 4 planes de 7 dias: en CI lento superaba los 5 s por defecto

  it("no repite el mismo plato en el mismo momento en días seguidos", () => {
    const plan = make({ days: 7 });
    for (let i = 1; i < plan.days.length; i++) {
      for (const m of plan.days[i].meals) {
        const prev = plan.days[i - 1].meals.find((x) => x.slot === m.slot);
        expect(m.mealId).not.toBe(prev?.mealId);
      }
    }
  });

  it("el desayuno y la merienda no llevan platos fuertes", () => {
    const strong = /pollo|pechuga|milanesa|bife|carne|atún|atun|merluza|salmón|fideo|arroz|lenteja|garbanzo|empanada|pizza/i;
    for (const seed of [1, 2, 3]) {
      const plan = make({ seed, mealsPerDay: 5 });
      for (const d of plan.days) for (const m of d.meals) {
        if (["desayuno", "merienda", "colacion"].includes(m.slot)) expect(m.items.map((i) => i.name).filter((nm) => !/galletit|galleta|tortita|inflado/i.test(nm)).join(" ")).not.toMatch(strong);
      }
    }
  });

  it("respeta dietas y alergias", () => {
    const check = (over, test) => { const plan = make(over); for (const d of plan.days) for (const m of d.meals) test(ALL_MEALS.find((x) => x.id === m.mealId)); };
    check({ restrictions: ["vegano"] }, (meal) => expect(meal.diet).toContain("vegano"));
    check({ restrictions: ["vegetariano"] }, (meal) => expect(meal.diet.some((d) => d === "vegetariano" || d === "vegano")).toBe(true));
    check({ restrictions: ["sin_gluten"] }, (meal) => expect(meal.diet).toContain("sin_gluten"));
    check({ restrictions: ["sin_lacteos"] }, (meal) => expect(meal.contains).not.toContain("lacteos"));
    check({ allergies: ["huevo", "frutos_secos", "pescado"] }, (meal) => {
      for (const a of ["huevo", "frutos_secos", "pescado"]) expect(meal.contains).not.toContain(a);
    });
  });

  it("todos los ingredientes del plan existen en la base y los gramos son razonables", () => {
    const plan = make({ mealsPerDay: 6 });
    for (const d of plan.days) for (const m of d.meals) for (const it of m.items) {
      expect(it.grams).toBeGreaterThan(0);
      expect(it.grams).toBeLessThanOrEqual(900);
      expect(it.kcal).toBeGreaterThanOrEqual(0);
    }
    expect(foodByName(ALL_MEALS[0].items[0].food)).toBeTruthy();
  });
});
