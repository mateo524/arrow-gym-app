import { supabase } from "./supabase.js";
import { serverTerms, filterFoodsByQuery } from "./nutrition.js";

// Catálogo compartido: los alimentos que crea un usuario quedan disponibles para todos.
// Todo se guarda por 100 g. Si la tabla no existe o no hay red, falla en silencio
// y la app sigue usando la base local.

const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

function toFood(row) {
  return {
    id: `shared-${row.id}`,
    name: row.name,
    cat: "Creado por usuarios",
    serving: "100g",
    grams: 100,
    kcal: round1(row.kcal),
    protein: round1(row.protein),
    carbs: round1(row.carbs),
    fat: round1(row.fat),
  };
}

export async function searchSharedFoods(query, limit = 10) {
  const q = String(query || "").trim().replace(/[%_,()]/g, " ");
  if (q.length < 2) return [];
  try {
    // El servidor no normaliza acentos ni alias: pide candidatos por prefijo (frutilla -> "fru"/"fre")
    // y el orden fino se hace acá con la misma lógica que la base local.
    const terms = serverTerms(q);
    let req = supabase
      .from("shared_foods")
      .select("id,name,kcal,protein,carbs,fat");
    req = terms.length > 1
      ? req.or(terms.map((t) => `name.ilike.%${t}%`).join(","))
      : req.ilike("name", `%${terms[0] || q}%`);
    const { data, error } = await req.order("name").limit(terms.length ? limit * 3 : limit);
    if (error || !data) return [];
    const foods = data.map(toFood);
    return terms.length ? filterFoodsByQuery(foods, q, limit) : foods;
  } catch {
    return [];
  }
}

// `food` trae los valores de la porción cargada (grams). Se normaliza a 100 g.
export async function publishSharedFood({ name, grams, kcal, protein, carbs, fat }) {
  const g = Number(grams) > 0 ? Number(grams) : 100;
  const per100 = (v) => round1((Number(v) || 0) / g * 100);
  const row = {
    name: String(name || "").trim(),
    kcal: per100(kcal),
    protein: per100(protein),
    carbs: per100(carbs),
    fat: per100(fat),
  };
  if (row.name.length < 2 || row.name.length > 80 || row.kcal <= 0 || row.kcal > 900) return { ok: false, duplicate: false };
  if (row.protein + row.carbs + row.fat > 100) return { ok: false, duplicate: false };
  try {
    const { error } = await supabase.from("shared_foods").insert(row);
    // 23505 = ya existe con ese nombre: ya está disponible para todos (no es un alta nueva)
    if (error?.code === "23505") return { ok: true, duplicate: true };
    return { ok: !error, duplicate: false };
  } catch {
    return { ok: false, duplicate: false };
  }
}

// Reporta un alimento del catálogo compartido. `id` puede venir como "shared-<uuid>".
export async function reportSharedFood(id, motivo) {
  const foodId = String(id || "").replace(/^shared-/, "");
  const reason = String(motivo || "").trim().slice(0, 300);
  if (!foodId || reason.length < 3) return false;
  try {
    const { error } = await supabase.from("food_reports").insert({ food_id: foodId, reason });
    // 23505 = ya lo habías reportado: está bien
    return !error || error.code === "23505";
  } catch {
    return false;
  }
}
