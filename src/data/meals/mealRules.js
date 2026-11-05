import { FOOD_DB } from "../foodDatabase.js";
import { normalizeText } from "../../lib/nutrition.js";

/**
 * Criterio del armador de comidas. Cada comida del catálogo (meals-*.js) se valida contra estas reglas:
 *  - estructura por momento del día (desayuno ≠ almuerzo),
 *  - combinaciones prohibidas (queso duro con galleta de arroz, pescado con lácteo, dos hidratos densos...),
 *  - porciones y calorías razonables,
 *  - etiquetas de dieta y alérgenos que coincidan con los ingredientes reales.
 * Basado en las guías argentinas (GAPA), la costumbre alimentaria local y la práctica de las apps de planes (ver planner-research).
 */

const BY_NAME = new Map(FOOD_DB.map((f) => [normalizeText(f.name), f]));
export const foodByName = (name) => BY_NAME.get(normalizeText(name)) || null;

const n = (f) => normalizeText(f?.name || "");
const any = (text, words) => words.some((w) => text.includes(normalizeText(w)));

// ── Clasificación de alimentos ─────────────────────────────────────────────
const PASTA = ["fideo", "pasta", "espagueti", "tallarin", "ñoqui", "noqui", "raviol", "canelon", "lasaña", "lasagna", "sorrentino", "macarron", "fusilli", "penne", "capeletini", "cuscus"];
const HARD_CHEESE = ["cheddar", "provolone", "parmesano", "reggianito", "sardo", "gruyere", "pategras", "gouda", "holando", "romano", "emmental", "fontina", "queso duro", "queso de maquina"];
const SWEET_SPREAD = ["dulce de leche", "mermelada", "miel", "membrillo", "nutella", "dulce de batata", "dulce de membrillo", "chocolate"];
const SWEET_ITEMS = ["alfajor", "factura", "medialuna", "chocolate", "helado", "torta", "budin", "bizcocho", "bizcochuelo", "brownie", "flan", "churro", "gomita", "caramelo"];
const COLD_CUTS_HEAVY = ["salame", "mortadela", "salchicha", "chorizo", "morcilla", "panceta", "bondiola", "longaniza"];
const FRUIT_OK_IN_SAVORY = ["palta", "aguacate", "tomate", "aceituna", "limon"];

export function isDairy(f) { const t = n(f); return f?.cat === "Lácteos" || any(t, ["leche", "yogur", "queso", "crema", "ricota", "manteca", "kefir", "dulce de leche"]); }
export function isMilkLike(f) { return any(n(f), ["leche", "yogur", "kefir", "crema de leche"]) && !any(n(f), ["leche de almendra", "leche de soja", "leche de avena", "leche de coco", "leche de arroz", "leche vegetal"]); }
export function isHardCheese(f) { return any(n(f), HARD_CHEESE); }
export function isRiceCake(f) { return any(n(f), ["galleta de arroz", "galletas de arroz", "tortita de arroz", "tortitas de arroz", "galletitas de arroz", "arroz inflado"]); }
export function isSweetSpread(f) { return any(n(f), SWEET_SPREAD); }
export function isSweetItem(f) { return any(n(f), SWEET_ITEMS); }
export function isPasta(f) { return any(n(f), PASTA); }
export function isRice(f) { const t = n(f); return /\barroz\b/.test(t) && !isRiceCake(f) && !any(t, ["leche de arroz"]); }
export function isPotato(f) { const t = n(f); return /\b(papa|papas|puré de papa|pure de papa)\b/.test(t) && !any(t, ["batata", "camote", "papa frita", "papas fritas"]) || any(t, ["papas fritas", "papa frita"]); }
export function isSweetPotato(f) { return any(n(f), ["batata", "camote"]) && !any(n(f), ["dulce de batata"]); }
export function isBread(f) { return f?.cat === "Pan" || any(n(f), ["pan ", "tostada", "tostadas", "sandwich", "wrap", "tortilla de trigo", "pan de"]) && f?.cat !== "Snacks" && !isRiceCake(f); }
export function isLegume(f) { return f?.cat === "Legumbres"; }
export function isEgg(f) { return f?.cat === "Huevos" || any(n(f), ["huevo", "omelette", "clara"]); }
export function isFruit(f) { return f?.cat === "Frutas" && !any(n(f), FRUIT_OK_IN_SAVORY); }
/** Verduras con almidón (papa, batata, choclo, mandioca, zapallo): son hidratos y sí se pueden estirar para cerrar calorías. */
export function isStarchy(f) { return f?.cat === "Verduras" && any(n(f), ["papa", "batata", "camote", "choclo", "mandioca", "puré", "pure", "humita"]); }
/** Verduras y frutas que NO se estiran para cerrar macros. */
export function isFixedProduce(f) { return (f?.cat === "Verduras" && !isStarchy(f)) || f?.cat === "Frutas"; }
export function isVeg(f) { return f?.cat === "Verduras" || any(n(f), ["ensalada", "verdura", "zapallito", "espinaca", "acelga", "brocoli", "zanahoria", "tomate", "lechuga"]); }

/** Familia de proteína animal de un plato fuerte (para no mezclar dos distintas). */
export function proteinFamily(f) {
  if (!f) return null;
  const t = n(f);
  if (f.cat === "Pescados" || any(t, ["atun", "merluza", "salmon", "trucha", "abadejo", "lenguado", "caballa", "sardina", "pescado", "camaron", "langostino", "mejillon", "calamar", "pulpo", "rabas"])) return "pescado";
  if (f.cat === "Carnes" || any(t, ["milanesa", "bife", "asado", "carne", "hamburguesa", "pollo", "pavo", "cerdo", "bondiola", "cordero", "conejo", "higado", "matambre", "vacio", "cuadril", "nalga", "peceto", "entrana", "chorizo", "costilla", "suprema"])) {
    if (any(t, ["pollo", "pavo", "suprema", "pechuga", "muslo", "pata"])) return "ave";
    if (any(t, ["cerdo", "bondiola", "panceta", "lomo de cerdo", "costeleta", "carré", "carre"])) return "cerdo";
    if (any(t, ["cordero", "conejo"])) return "otra";
    return "vaca";
  }
  return null;
}

const PROTEIN_NAMES = ["queso", "tofu", "soja", "seitan", "ricota", "huevo", "tarta", "empanada", "milanesa", "tortilla", "omelette", "hamburguesa", "lenteja", "garbanzo", "poroto", "pizza", "atun", "jamon", "pavita", "yogur", "whey", "proteina"];
export function isProteinMain(f) {
  if (!f) return false;
  if (["Carnes", "Pescados", "Huevos", "Legumbres"].includes(f.cat)) return true;
  if (["Tartas", "Comidas ARG", "Comidas básicas"].includes(f.cat) && f.protein >= 10) return true;
  return any(n(f), PROTEIN_NAMES) && f.protein >= 8;
}
export function isDenseCarb(f) { return isRice(f) || isPasta(f) || isPotato(f) || isSweetPotato(f) || isBread(f) || any(n(f), ["polenta", "quinoa", "cuscus", "mandioca", "lenteja", "choclo"]) && false; }

// ── Reglas por momento ─────────────────────────────────────────────────────
const BREAKFAST_LIKE = new Set(["desayuno", "merienda", "colacion"]);
const MAIN_SLOTS = new Set(["almuerzo", "cena"]);
const KCAL_RANGE = { desayuno: [200, 680], merienda: [120, 600], colacion: [70, 420], almuerzo: [380, 1000], cena: [280, 850] };
const PROTEIN_MIN = { desayuno: 8, merienda: 6, colacion: 4, almuerzo: 20, cena: 18 };

export function baseMacros(meal) {
  const out = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const it of meal.items) {
    const f = foodByName(it.food);
    if (!f || !(f.grams > 0)) continue;
    const k = it.g / f.grams;
    out.kcal += f.kcal * k; out.protein += f.protein * k; out.carbs += f.carbs * k; out.fat += f.fat * k;
  }
  return out;
}

/** Etiquetas de dieta y alérgenos que realmente cumplen los ingredientes. */
export function deriveFlags(foods) {
  const contains = new Set();
  const notDiet = new Set();
  for (const f of foods) {
    const t = n(f).replace(/\bsin (manteca|lacteos|gluten|azucar|tacc|sal|aceite|grasa)\b/g, " ");
    if (["Carnes", "Pescados", "Fiambres"].includes(f.cat) || proteinFamily(f) || any(t, ["gelatina", "jamon", "pavita", "atun", "hamburguesa", "milanesa de carne", "salchicha", "tocino"])) {
      if (!any(t, ["milanesa de soja", "hamburguesa de lenteja", "hamburguesa de garbanzo", "hamburguesa vegetal", "hamburguesa de soja", "milanesa de berenjena"])) { notDiet.add("vegetariano"); notDiet.add("vegano"); }
    }
    if (f.cat === "Pescados" || any(t, ["pescado", "merluza", "salmon", "atun", "trucha", "abadejo", "caballa", "sardina", "lenguado"])) contains.add("pescado");
    if (any(t, ["camaron", "langostino", "mejillon", "calamar", "pulpo", "rabas", "almeja", "cangrejo", "marisco"])) contains.add("mariscos");
    if ((isDairy(f) && !any(t, ["leche de almendra", "leche de soja", "leche de avena", "leche de coco", "leche de arroz", "leche vegetal", "yogur de soja", "yogur vegetal", "queso vegano", "mantequilla de mani", "manteca de mani", "manteca de almendra", "manteca de cacao"])) || any(t, ["crema de leche", "ricota", "mozzarella", "muzzarella"])) {
      contains.add("lacteos"); notDiet.add("sin_lacteos"); notDiet.add("vegano");
    }
    if (isEgg(f) || any(t, ["tortilla de papa", "tortilla de verdura", "mayonesa", "flan", "budin", "panqueque", "merengue", "ñoqui", "noqui", "raviol", "tarta", "milanesa", "empanada", "pasta fresca", "fideos al huevo", "masa"])) {
      if (!any(t, ["clara en polvo"])) { contains.add("huevo"); notDiet.add("vegano"); }
    }
    if (any(t, ["miel"])) notDiet.add("vegano");
    if (any(t, ["pan", "tostada", "fideo", "pasta", "espagueti", "tallarin", "ñoqui", "noqui", "raviol", "canelon", "lasaña", "tarta", "milanesa", "empanada", "pizza", "avena", "galletita", "galleta", "harina", "trigo", "cebada", "centeno", "cereal", "granola", "muesli", "budin", "factura", "medialuna", "sandwich", "wrap", "cuscus", "salvado", "bizcocho", "alfajor", "rebozad", "empanad", "tapa"]) && !isRiceCake(f) && !any(t, ["sin tacc", "sin gluten", "harina de arroz", "harina de maiz", "pan de arroz", "pan sin"])) {
      contains.add("gluten"); notDiet.add("sin_gluten");
    }
    if (any(t, ["nuez", "nueces", "almendra", "castaña", "avellana", "pistacho", "pecan", "macadamia", "caju", "mix de frutos secos", "frutos secos", "granola"])) contains.add("frutos_secos");
    if (any(t, ["mani", "cacahuate"])) { contains.add("mani"); contains.add("frutos_secos"); }
    if (any(t, ["tofu", "soja", "edamame", "tempeh", "miso"]) && !any(t, ["salsa de soja"]) ) contains.add("soja");
    if (any(t, ["salsa de soja"])) contains.add("soja");
  }
  return { contains, notDiet };
}

/** Devuelve la lista de problemas de una comida (vacía = válida). */
export function validateMeal(meal) {
  const bad = [];
  const id = meal.id || meal.name;
  const slots = meal.slots || [];
  if (!meal.id || !meal.name) bad.push(`${id}: falta id o nombre`);
  if (!slots.length || slots.some((s) => !["desayuno", "colacion", "almuerzo", "merienda", "cena"].includes(s))) bad.push(`${id}: momentos inválidos`);
  if (!Array.isArray(meal.items) || meal.items.length < 2) { bad.push(`${id}: necesita al menos 2 ingredientes`); return bad; }

  const foods = [];
  for (const it of meal.items) {
    const f = foodByName(it.food);
    if (!f) { bad.push(`${id}: ingrediente inexistente "${it.food}"`); continue; }
    foods.push(f);
    if (!(it.g > 0) || !(it.min > 0) || !(it.max > 0) || it.min > it.g || it.g > it.max) bad.push(`${id}: porción inválida de "${it.food}" (min ≤ g ≤ max)`);
    if (it.flex && !["carb", "protein", "fat"].includes(it.flex)) bad.push(`${id}: flex inválido en "${it.food}"`);
    if (it.flex && isFixedProduce(f)) bad.push(`${id}: las verduras no feculentas y las frutas no llevan flex ("${it.food}")`);
  }
  if (foods.length !== meal.items.length) return bad;
  const flexes = meal.items.filter((i) => i.flex).map((i) => i.flex);
  if (!flexes.length) bad.push(`${id}: ningún ingrediente flexible`);
  if (new Set(flexes).size !== flexes.length) bad.push(`${id}: más de un flex del mismo rol`);

  const m = baseMacros(meal);
  const isBreakfastLike = slots.some((s) => BREAKFAST_LIKE.has(s));
  const isMain = slots.some((s) => MAIN_SLOTS.has(s));
  for (const s of slots) {
    const [lo, hi] = KCAL_RANGE[s];
    if (m.kcal < lo || m.kcal > hi) bad.push(`${id}: ${Math.round(m.kcal)} kcal fuera de rango para ${s} (${lo}-${hi})`);
    if (m.protein < PROTEIN_MIN[s]) bad.push(`${id}: ${Math.round(m.protein)} g de proteína, mínimo ${PROTEIN_MIN[s]} para ${s}`);
  }
  if (isBreakfastLike && isMain) bad.push(`${id}: no mezclar momentos de desayuno/colación con almuerzo/cena`);

  // ── Desayuno / merienda / colación ──
  if (isBreakfastLike) {
    for (const f of foods) {
      const t = n(f);
      if (["Carnes", "Pescados", "Legumbres"].includes(f.cat) || (f.cat !== "Fiambres" && proteinFamily(f))) bad.push(`${id}: proteína de plato fuerte en desayuno/merienda/colación ("${f.name}")`);
      if (isRice(f) || isPasta(f) || any(t, ["milanesa", "pechuga", "atun", "tuco", "empanada", "pizza", "guiso", "locro", "tarta", "hamburguesa", "choripan", "asado"])) bad.push(`${id}: "${f.name}" no va en desayuno/merienda/colación`);
      if (any(t, COLD_CUTS_HEAVY) && !slots.includes("colacion")) bad.push(`${id}: fiambre pesado en desayuno/merienda ("${f.name}")`);
      if (f.cat === "Verduras" && !any(t, ["tomate", "palta", "aguacate", "pepino", "zanahoria", "apio", "pimiento"]) && !slots.includes("colacion")) bad.push(`${id}: verdura cruda/cocida en desayuno/merienda ("${f.name}")`);
    }
  }

  // ── Almuerzo / cena ──
  if (isMain) {
    if (!foods.some(isProteinMain)) bad.push(`${id}: falta una proteína en almuerzo/cena`);
    if (!foods.some((f) => f.cat === "Verduras" || /verdura|espinaca|acelga|zapallo|berenjena|brocoli|calabaza/.test(n(f)))) bad.push(`${id}: falta verdura en almuerzo/cena`);
    if (slots.includes("almuerzo") && !foods.some((f) => isDenseCarb(f) || isLegume(f) || ["Tartas", "Comidas ARG", "Comidas básicas"].includes(f.cat) || any(n(f), ["polenta", "quinoa", "choclo", "mandioca"]))) bad.push(`${id}: el almuerzo necesita un hidrato o legumbre`);
    for (const f of foods) {
      if (isFruit(f)) bad.push(`${id}: fruta en plato salado ("${f.name}")`);
      if (isSweetItem(f) && f.cat !== "Comidas ARG" && f.cat !== "Tartas") bad.push(`${id}: postre/dulce como parte del almuerzo/cena ("${f.name}")`);
    }
  }

  // ── Combinaciones prohibidas (todos los momentos) ──
  const hasRiceCake = foods.some(isRiceCake);
  if (hasRiceCake && foods.some(isHardCheese)) bad.push(`${id}: queso duro con galleta de arroz`);
  if (foods.some(isHardCheese) && (foods.some((f) => f.cat === "Frutas") || foods.some(isSweetSpread))) bad.push(`${id}: queso duro con fruta o dulce`);
  if (foods.some(isSweetSpread) && foods.some((f) => ["Fiambres"].includes(f.cat) || any(n(f), ["jamon", "pavita", "atun", "pollo", "carne"]))) bad.push(`${id}: untable dulce con fiambre o proteína salada`);
  const fams = new Set(foods.filter((f) => ["Carnes", "Pescados"].includes(f.cat) || (isProteinMain(f) && proteinFamily(f))).map(proteinFamily).filter(Boolean));
  if (fams.size > 1) bad.push(`${id}: dos proteínas animales distintas (${[...fams].join(" + ")})`);
  if (fams.has("pescado") && foods.some((f) => (isMilkLike(f) || any(n(f), ["queso", "crema", "ricota"])) && !any(n(f), ["rallado", "limon"]))) bad.push(`${id}: pescado con lácteo`);
  if (fams.has("vaca") && foods.some(isMilkLike)) bad.push(`${id}: carne roja con leche o yogur`);
  const dense = foods.filter((f) => isRice(f) || isPasta(f) || isPotato(f) || isSweetPotato(f) || any(n(f), ["polenta", "cuscus", "quinoa", "mandioca"]));
  const kinds = new Set(dense.map((f) => (isRice(f) ? "arroz" : isPasta(f) ? "pasta" : isPotato(f) ? "papa" : isSweetPotato(f) ? "batata" : "otro")));
  if (kinds.size > 1 && isMain) bad.push(`${id}: dos hidratos densos juntos (${[...kinds].join(" + ")})`);
  if (isMain && foods.some(isPasta) && foods.some(isBread) && !/sandwich|pizza|tostado/.test(normalizeText(meal.name))) bad.push(`${id}: pasta con pan`);
  if (isMain && foods.some(isLegume) && foods.some(isPasta) && !/guiso|sopa|estofado|puchero/.test(normalizeText(meal.name))) bad.push(`${id}: legumbre con pasta (solo en guisos o sopas)`);
  if (foods.some(isEgg) && foods.some((f) => proteinFamily(f)) && !any(normalizeText(meal.name), ["milanesa", "napolitana", "hamburguesa", "sandwich", "tostado", "completo", "ensalada"])) bad.push(`${id}: huevo con carne en el mismo plato (solo sándwiches, milanesas o ensaladas)`);

  // ── Etiquetas correctas (alergias y dietas) ──
  const { contains, notDiet } = deriveFlags(foods);
  for (const c of contains) if (!(meal.contains || []).includes(c)) bad.push(`${id}: falta declarar contains "${c}"`);
  for (const d of meal.diet || []) {
    if (!["vegetariano", "vegano", "sin_lacteos", "sin_gluten"].includes(d)) bad.push(`${id}: etiqueta de dieta inválida "${d}"`);
    if (notDiet.has(d)) bad.push(`${id}: no cumple la dieta "${d}" por sus ingredientes`);
  }
  for (const c of meal.contains || []) if (!["gluten", "lacteos", "huevo", "frutos_secos", "mani", "pescado", "mariscos", "soja"].includes(c)) bad.push(`${id}: alérgeno inválido "${c}"`);
  if (!["rapido", "medio", "largo"].includes(meal.prep)) bad.push(`${id}: prep inválido`);
  if (!["bajo", "medio", "alto"].includes(meal.cost)) bad.push(`${id}: cost inválido`);
  return bad;
}
