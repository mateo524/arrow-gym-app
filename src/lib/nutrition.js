// Funciones puras de nutrición (sin React ni base de alimentos: liviano para importar en cualquier lado).

const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

// ── TDEE ────────────────────────────────────────────────────────────────────
const MULTIPLIERS = { mantenimiento: 1.55, volumen: 1.65, definicion: 1.5, rendimiento: 1.7 };

// Calorías diarias estimadas. null si no hay peso.
// Mifflin-St Jeor con altura, edad y sexo; si falta algo, fallback kg * 22.
// Menores de 18 no hacen déficit; déficit máx. 25 % (20 % si <21 años); piso 1500 H / 1200 M.
export function calcTdee({ bodyWeight, height, sex, age, goal } = {}) {
  const bw = Number(bodyWeight);
  if (!(bw > 0)) return null;
  const h = Number(height);
  const a = age === null || age === undefined || age === "" || Number.isNaN(Number(age)) ? null : Number(age);
  const rmr = h > 0 && a !== null && (sex === "M" || sex === "F")
    ? 10 * bw + 6.25 * h - 5 * a + (sex === "M" ? 5 : -161)
    : bw * 22;
  const isMinor = a !== null && a < 18;
  const safeGoal = isMinor && goal === "definicion" ? "mantenimiento" : goal;
  const tdeeRaw = Math.round(rmr * (MULTIPLIERS[safeGoal] ?? 1.55));
  const maintenance = Math.round(rmr * 1.55);
  const maxDeficit = a !== null && a < 21 ? 0.8 : 0.75;
  const floor = sex === "M" ? 1500 : 1200;
  const t = safeGoal === "definicion" ? Math.max(tdeeRaw, Math.round(maintenance * maxDeficit)) : tdeeRaw;
  return Math.max(t, floor);
}

// ── Macros ──────────────────────────────────────────────────────────────────
const ZERO = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

// Escala macros por 100 g a una cantidad de gramos. g inválido o <= 0 da ceros.
export function scaleMacros(base100, grams) {
  const g = Number(grams);
  if (!base100 || !(g > 0)) return { ...ZERO };
  const f = g / 100;
  return {
    kcal: round1(base100.kcal * f),
    protein: round1(base100.protein * f),
    carbs: round1(base100.carbs * f),
    fat: round1(base100.fat * f),
  };
}

// Lleva un alimento (valores de su porción `grams`) a valores por 100 g.
export function normalizePer100(food) {
  if (!food) return { ...ZERO };
  const g = Number(food.grams);
  if (g > 0 && g !== 100) {
    return {
      kcal: Math.round((Number(food.kcal) || 0) / g * 100),
      protein: round1((Number(food.protein) || 0) / g * 100),
      carbs: round1((Number(food.carbs) || 0) / g * 100),
      fat: round1((Number(food.fat) || 0) / g * 100),
    };
  }
  return {
    kcal: Number(food.kcal) || 0,
    protein: Number(food.protein) || 0,
    carbs: Number(food.carbs) || 0,
    fat: Number(food.fat) || 0,
  };
}

// ── Búsqueda de texto (compartida por base, alimentos propios, compartidos y combos) ──
export function normalizeText(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Grupos de sinónimos (ya normalizados, sin acentos). Rioplatense <-> otros.
const ALIAS_GROUPS = [
  ["frutilla", "fresa"],
  ["durazno", "melocoton"],
  ["choclo", "maiz", "elote"],
  ["palta", "aguacate"],
  ["zapallito", "zucchini", "calabacin"],
  ["batata", "boniato", "camote"],
  ["papa", "patata"],
  ["manteca", "mantequilla"],
  ["anana", "pina"],
  ["mani", "cacahuete"],
  ["porotos", "frijoles", "judias"],
  ["arvejas", "guisantes"],
  ["chaucha", "ejotes"],
  ["pochoclo", "palomitas"],
  ["jugo", "zumo"],
  ["gaseosa", "refresco"],
  ["cerdo", "chancho"],
  ["medialuna", "croissant"],
  ["bizcochuelo", "bizcocho"],
  ["arandano", "blueberry"],
  ["lomo", "solomillo"],
  ["pancho", "hot dog"],
  ["sandwich", "emparedado"],
];

// Stem simple: plural -s/-es.
function stem(w) {
  if (w.length > 4 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s")) return w.slice(0, -1);
  return w;
}

const ALIAS_MAP = (() => {
  const m = new Map();
  for (const group of ALIAS_GROUPS) {
    const stems = group.map((g) => stem(normalizeText(g)));
    for (const s of stems) m.set(s, stems);
  }
  return m;
})();

function variantsOf(word) {
  const s = stem(word);
  return ALIAS_MAP.get(s) || [s];
}

// Puntaje de relevancia de `name` (y opcionalmente `cat`) contra `query`. 0 = sin match.
// Cada palabra de la búsqueda suma una sola vez, sin importar el orden.
export function matchScore(name, query, cat = "") {
  const q = normalizeText(query);
  if (q.length < 2) return 0;
  const n = normalizeText(name);
  const c = normalizeText(cat);
  const nTokens = n.split(" ").map(stem);
  // Palabras únicas (un solo representante por grupo de sinónimos): no se suma dos veces lo mismo
  const words = [];
  const seenKeys = new Set();
  for (const w of q.split(" ").filter(Boolean)) {
    const key = variantsOf(w)[0];
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    words.push(w);
  }

  let score = 0;
  if (n.startsWith(q)) score += 10;
  else if (n.includes(q)) score += 6;

  let matched = 0;
  for (const w of words) {
    const vs = variantsOf(w);
    let pts = 0;
    for (const v of vs) {
      if (nTokens.some((t) => t === v)) { pts = Math.max(pts, 4); }
      else if (nTokens.some((t) => t.startsWith(v))) { pts = Math.max(pts, 3); }
      else if (v.length >= 3 && n.includes(v)) { pts = Math.max(pts, 2); }
    }
    if (pts === 0 && c && vs.some((v) => c.includes(v))) pts = 1;
    if (pts > 0) { matched += 1; score += pts; }
  }
  if (matched === words.length) return score + 2;
  // Match parcial: sólo si es de una palabra o la mayoría; así "pollo arroz" no trae todo lo de pollo arriba
  return matched > 0 && !score ? 0 : matched > 0 ? Math.max(1, Math.floor(score / 3)) : 0;
}

// Prefijos de 3 letras (sin acentos) de la palabra más larga de la búsqueda y sus sinónimos.
// Sirven para pedirle candidatos a una base remota que no normaliza acentos ni alias.
export function serverTerms(query) {
  const words = normalizeText(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a));
  const out = new Set(variantsOf(longest).map((v) => v.slice(0, 3)));
  return [...out].filter((t) => t.length >= 2);
}

// Filtra y ordena una lista de alimentos ({name, cat}) por relevancia.
export function filterFoodsByQuery(list, query, limit = 20) {
  if (!Array.isArray(list)) return [];
  return list
    .map((f) => ({ f, s: matchScore(f?.name, query, f?.cat) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.f);
}

// ── Registros de comidas ────────────────────────────────────────────────────
const NAME_GRAMS_RE = /\((\d+(?:[.,]\d+)?)\s*g\)/i;

// Gramos conocidos de un registro: campo `grams`, o "(150g)" en el nombre. null si no hay dato.
export function mealGrams(meal) {
  const g = Number(meal?.grams);
  if (g > 0) return g;
  const m = NAME_GRAMS_RE.exec(String(meal?.name || ""));
  return m ? Number(m[1].replace(",", ".")) : null;
}

// Valores por 100 g de un registro, o null si no se puede saber (registros viejos sin gramos).
export function mealPer100(meal) {
  if (!meal) return null;
  if (meal.base && meal.base.kcal !== undefined) {
    return {
      kcal: Number(meal.base.kcal) || 0,
      protein: Number(meal.base.protein) || 0,
      carbs: Number(meal.base.carbs) || 0,
      fat: Number(meal.base.fat) || 0,
    };
  }
  const g = mealGrams(meal);
  return g ? normalizePer100({ ...meal, grams: g }) : null;
}

// Recalcula los macros de un registro: por gramos nuevos (si hay base) o por un multiplicador.
export function rescaleMeal(meal, { grams, factor } = {}) {
  const per100 = mealPer100(meal);
  if (per100 && Number(grams) > 0) return { ...scaleMacros(per100, grams), grams: Number(grams) };
  const f = Number(factor);
  if (f > 0) {
    const g0 = mealGrams(meal);
    return {
      kcal: round1((Number(meal.kcal) || 0) * f),
      protein: round1((Number(meal.protein) || 0) * f),
      carbs: round1((Number(meal.carbs) || 0) * f),
      fat: round1((Number(meal.fat) || 0) * f),
      ...(g0 ? { grams: round1(g0 * f) } : {}),
    };
  }
  return null;
}

// Últimas `n` comidas distintas (por nombre) del usuario, más recientes primero.
export function recentMeals(mealLog, userId, n = 8) {
  const list = (Array.isArray(mealLog) ? mealLog : [])
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m && m.name && (!userId || m.user_id === userId))
    .sort((a, b) => String(b.m.date || "").localeCompare(String(a.m.date || "")) || a.i - b.i);
  const seen = new Set();
  const out = [];
  for (const { m } of list) {
    const k = normalizeText(m.name);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(m);
    if (out.length >= n) break;
  }
  return out;
}

// Copia los campos de un registro que valen al repetirlo (sin id, fecha ni usuario).
export function mealCopy(meal, overrides = {}) {
  const c = {
    type: meal.type, name: meal.name,
    kcal: round1(meal.kcal), protein: round1(meal.protein), carbs: round1(meal.carbs), fat: round1(meal.fat),
  };
  if (Number(meal.grams) > 0) c.grams = Number(meal.grams);
  if (meal.base) c.base = meal.base;
  if (meal.alcohol) c.alcohol = true;
  return { ...c, ...overrides };
}

export const _r1 = round1;
