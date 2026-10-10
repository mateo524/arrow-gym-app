import { describe, it, expect } from "vitest";
import {
  calcTdee, scaleMacros, normalizePer100, normalizeText, matchScore, filterFoodsByQuery,
  serverTerms, mealGrams, mealPer100, rescaleMeal, recentMeals, mealCopy,
} from "./nutrition.js";

describe("calcTdee", () => {
  it("null sin peso", () => {
    expect(calcTdee({ goal: "volumen" })).toBeNull();
    expect(calcTdee({ bodyWeight: 0 })).toBeNull();
  });
  it("fallback kg*22 sin altura/edad/sexo", () => {
    expect(calcTdee({ bodyWeight: 80, goal: "mantenimiento", sex: "M" })).toBe(Math.round(80 * 22 * 1.55));
  });
  it("Mifflin-St Jeor con datos completos", () => {
    const rmr = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
    expect(calcTdee({ bodyWeight: 80, height: 180, age: 30, sex: "M", goal: "volumen" })).toBe(Math.round(rmr * 1.65));
  });
  it("aplica pisos 1500 H / 1200 M", () => {
    expect(calcTdee({ bodyWeight: 30, goal: "definicion", sex: "M" })).toBe(1500);
    expect(calcTdee({ bodyWeight: 30, goal: "definicion", sex: "F" })).toBe(1200);
  });
  it("definición nunca baja del tope de déficit sobre mantenimiento", () => {
    const rmr = 100 * 22;
    const t = calcTdee({ bodyWeight: 100, goal: "definicion", sex: "M", age: 30 });
    expect(t).toBe(Math.round(rmr * 1.5));
    expect(t).toBeGreaterThanOrEqual(Math.round(rmr * 1.55 * 0.75));
  });
  it("menores de 18 no hacen déficit", () => {
    const joven = calcTdee({ bodyWeight: 70, height: 175, age: 16, sex: "M", goal: "definicion" });
    const mant = calcTdee({ bodyWeight: 70, height: 175, age: 16, sex: "M", goal: "mantenimiento" });
    expect(joven).toBe(mant);
  });
});

describe("scaleMacros / normalizePer100", () => {
  const b = { kcal: 200, protein: 10, carbs: 20, fat: 5 };
  it("escala por gramos", () => {
    expect(scaleMacros(b, 150)).toEqual({ kcal: 300, protein: 15, carbs: 30, fat: 7.5 });
  });
  it("gramos inválidos dan ceros", () => {
    expect(scaleMacros(b, 0)).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
    expect(scaleMacros(b, "abc").kcal).toBe(0);
    expect(scaleMacros(null, 100).kcal).toBe(0);
  });
  it("normaliza una porción a 100 g", () => {
    expect(normalizePer100({ grams: 250, kcal: 100, protein: 5, carbs: 10, fat: 2.5 }))
      .toEqual({ kcal: 40, protein: 2, carbs: 4, fat: 1 });
    expect(normalizePer100({ grams: 100, kcal: 90, protein: 1, carbs: 2, fat: 3 })).toEqual({ kcal: 90, protein: 1, carbs: 2, fat: 3 });
  });
});

describe("búsqueda", () => {
  it("normaliza acentos y símbolos", () => {
    expect(normalizeText("  Ñoquis / Piña!! ")).toBe("noquis pina");
    expect(normalizeText("Melocotón")).toBe("melocoton");
  });
  const foods = [
    { name: "Frutilla / Fresa", cat: "Frutas" },
    { name: "Durazno", cat: "Frutas" },
    { name: "Choclo cocido", cat: "Verduras" },
    { name: "Palta", cat: "Frutas" },
    { name: "Zapallitos rellenos", cat: "Verduras" },
    { name: "Batata asada", cat: "Verduras" },
    { name: "Papa hervida", cat: "Verduras" },
    { name: "Pechuga de pollo", cat: "Carnes" },
  ];
  it("alias argentinos", () => {
    expect(filterFoodsByQuery(foods, "fresa")[0].name).toMatch(/Frutilla/);
    expect(filterFoodsByQuery(foods, "melocotón")[0].name).toBe("Durazno");
    expect(filterFoodsByQuery(foods, "maíz")[0].name).toMatch(/Choclo/);
    expect(filterFoodsByQuery(foods, "aguacate")[0].name).toBe("Palta");
    expect(filterFoodsByQuery(foods, "zucchini")[0].name).toMatch(/Zapallitos/);
    expect(filterFoodsByQuery(foods, "boniato")[0].name).toMatch(/Batata/);
    expect(filterFoodsByQuery(foods, "patata")[0].name).toMatch(/Papa/);
  });
  it("sin importar el orden de las palabras", () => {
    expect(filterFoodsByQuery(foods, "pollo pechuga")[0].name).toBe("Pechuga de pollo");
  });
  it("no suma dos veces la misma palabra", () => {
    expect(matchScore("Pechuga de pollo", "pollo pollo pollo")).toBeLessThanOrEqual(matchScore("Pechuga de pollo", "pollo"));
    expect(matchScore("Frutilla / Fresa", "frutilla fresa")).toBe(matchScore("Frutilla / Fresa", "frutilla"));
  });
  it("sin coincidencia da 0 y consulta corta da 0", () => {
    expect(matchScore("Arroz", "xyz")).toBe(0);
    expect(matchScore("Arroz", "a")).toBe(0);
  });
  it("serverTerms da prefijos de la palabra más larga con alias", () => {
    expect(serverTerms("frutilla")).toEqual(expect.arrayContaining(["fru", "fre"]));
    expect(serverTerms("a")).toEqual([]);
  });
});

describe("registros", () => {
  const m = { id: "1", name: "Arroz (200g)", type: "Almuerzo", kcal: 260, protein: 5, carbs: 56, fat: 0.5 };
  it("mealGrams lee el campo o el nombre", () => {
    expect(mealGrams({ grams: 120 })).toBe(120);
    expect(mealGrams(m)).toBe(200);
    expect(mealGrams({ name: "Pizza" })).toBeNull();
  });
  it("mealPer100 usa base, gramos o null", () => {
    expect(mealPer100({ base: { kcal: 130, protein: 2.5, carbs: 28, fat: 0.3 } }).kcal).toBe(130);
    expect(mealPer100(m).kcal).toBe(130);
    expect(mealPer100({ name: "Pizza", kcal: 300 })).toBeNull();
  });
  it("rescaleMeal por gramos o por factor", () => {
    expect(rescaleMeal(m, { grams: 100 }).kcal).toBe(130);
    expect(rescaleMeal({ name: "Pizza", kcal: 300, protein: 10, carbs: 30, fat: 10 }, { factor: 2 }).kcal).toBe(600);
    expect(rescaleMeal({ name: "Pizza", kcal: 300 }, { grams: 100 })).toBeNull();
  });
  it("recentMeals: 8 distintas, más nuevas primero, del usuario", () => {
    const log = [];
    for (let i = 0; i < 12; i++) {
      log.push({ id: `a${i}`, name: `Comida ${i % 10}`, date: `2026-10-${String(10 - Math.floor(i / 2)).padStart(2, "0")}`, user_id: "u" });
    }
    log.push({ id: "x", name: "Ajena", date: "2026-10-10", user_id: "otro" });
    const r = recentMeals(log, "u", 8);
    expect(r).toHaveLength(8);
    expect(new Set(r.map((x) => x.name)).size).toBe(8);
    expect(r.find((x) => x.name === "Ajena")).toBeUndefined();
  });
  it("mealCopy no arrastra id/fecha/usuario", () => {
    const c = mealCopy({ ...m, date: "2026-10-01", user_id: "u", grams: 200 }, { type: "Cena" });
    expect(c).not.toHaveProperty("id");
    expect(c).not.toHaveProperty("date");
    expect(c).not.toHaveProperty("user_id");
    expect(c.type).toBe("Cena");
    expect(c.grams).toBe(200);
  });
});

import { FOOD_DB, searchFoods } from "../data/foodDatabase.js";

describe("base de alimentos", () => {
  it("ids únicos y estables", () => {
    const ids = FOOD_DB.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(FOOD_DB.find((f) => f.id === "bv46")?.name).toBe("Cerveza");
  });
  it("sin nombres repetidos (normalizados)", () => {
    const names = FOOD_DB.map((f) => normalizeText(f.name));
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([]);
  });
  it("las bebidas alcohólicas llevan alcohol:true y las sin alcohol no", () => {
    for (const id of ["bv46", "bv48", "bv49", "bv50", "bv51"]) expect(FOOD_DB.find((f) => f.id === id).alcohol).toBe(true);
    expect(FOOD_DB.find((f) => f.id === "bv47").alcohol).toBeUndefined();
  });
  it("searchFoods encuentra con alias y sin acentos", () => {
    expect(searchFoods("fresa")[0].name).toMatch(/Frutilla/);
    expect(searchFoods("brocoli").some((f) => /Br.coli/.test(f.name))).toBe(true);
  });
});
