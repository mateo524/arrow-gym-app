import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./supabase.js", () => ({ supabase: { from: vi.fn() } }));

import { supabase } from "./supabase.js";
import { searchSharedFoods, publishSharedFood } from "./sharedFoods.js";

const chain = {};
let result;
beforeEach(() => {
  result = { data: [], error: null };
  chain.select = vi.fn(() => chain);
  chain.ilike = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.limit = vi.fn(() => Promise.resolve(result));
  chain.insert = vi.fn(() => Promise.resolve(result));
  supabase.from.mockReset();
  supabase.from.mockReturnValue(chain);
});

describe("searchSharedFoods", () => {
  it("no consulta con menos de 2 caracteres", async () => {
    expect(await searchSharedFoods("a")).toEqual([]);
    expect(await searchSharedFoods("  ")).toEqual([]);
    expect(await searchSharedFoods(null)).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("mapea filas a alimentos por 100 g con redondeo", async () => {
    result = { data: [{ id: 7, name: "Queso", kcal: 300.26, protein: 20.04, carbs: "1.55", fat: 25 }], error: null };
    const r = await searchSharedFoods("que", 5);
    expect(supabase.from).toHaveBeenCalledWith("shared_foods");
    expect(chain.limit).toHaveBeenCalledWith(15);
    expect(r).toEqual([{
      id: "shared-7", name: "Queso", cat: "Creado por usuarios", serving: "100g", grams: 100,
      kcal: 300.3, protein: 20, carbs: 1.6, fat: 25,
    }]);
  });

  it("sanitiza caracteres especiales del patrón ilike", async () => {
    await searchSharedFoods("a%b_c,(d)");
    const pattern = chain.ilike.mock.calls[0][1];
    const inner = pattern.slice(1, -1);
    expect(inner).not.toMatch(/[%_,()]/);
  });

  it("devuelve [] ante error, data nula o excepción", async () => {
    result = { data: null, error: { message: "x" } };
    expect(await searchSharedFoods("pan")).toEqual([]);
    chain.limit = vi.fn(() => Promise.reject(new Error("red")));
    expect(await searchSharedFoods("pan")).toEqual([]);
    supabase.from.mockImplementation(() => { throw new Error("sin tabla"); });
    expect(await searchSharedFoods("pan")).toEqual([]);
  });
});

describe("publishSharedFood", () => {
  const ok = { name: "Yogur", grams: 200, kcal: 120, protein: 10, carbs: 14, fat: 3 };

  it("normaliza a 100 g e inserta", async () => {
    expect(await publishSharedFood(ok)).toEqual({ ok: true, duplicate: false });
    expect(chain.insert).toHaveBeenCalledWith({ name: "Yogur", kcal: 60, protein: 5, carbs: 7, fat: 1.5 });
  });

  it("grams inválido usa 100", async () => {
    await publishSharedFood({ ...ok, grams: 0 });
    expect(chain.insert.mock.calls[0][0].kcal).toBe(120);
  });

  it("recorta el nombre y rechaza nombres inválidos", async () => {
    expect((await publishSharedFood({ ...ok, name: "  " })).ok).toBe(false);
    expect((await publishSharedFood({ ...ok, name: "a" })).ok).toBe(false);
    expect((await publishSharedFood({ ...ok, name: "x".repeat(81) })).ok).toBe(false);
    expect(chain.insert).not.toHaveBeenCalled();
  });

  it("rechaza kcal fuera de rango y macros > 100 g", async () => {
    expect((await publishSharedFood({ ...ok, kcal: 0 })).ok).toBe(false);
    expect((await publishSharedFood({ ...ok, kcal: 2000, grams: 100 })).ok).toBe(false);
    expect((await publishSharedFood({ ...ok, grams: 100, protein: 60, carbs: 50, fat: 0, kcal: 400 })).ok).toBe(false);
    expect(chain.insert).not.toHaveBeenCalled();
  });

  it("error 23505 (duplicado) se informa como duplicado; otros errores fallan", async () => {
    result = { data: null, error: { code: "23505" } };
    expect(await publishSharedFood(ok)).toEqual({ ok: true, duplicate: true });
    result = { data: null, error: { code: "42P01" } };
    expect(await publishSharedFood(ok)).toEqual({ ok: false, duplicate: false });
  });

  it("devuelve ok:false si insert lanza", async () => {
    chain.insert = vi.fn(() => Promise.reject(new Error("red")));
    expect(await publishSharedFood(ok)).toEqual({ ok: false, duplicate: false });
  });
});
