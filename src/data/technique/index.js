import { TECH as chest } from "./tech-chest.js";
import { TECH as back } from "./tech-back.js";
import { TECH as shoulders } from "./tech-shoulders.js";
import { TECH as arms } from "./tech-arms.js";
import { TECH as legs } from "./tech-legs.js";
import { TECH as legs2 } from "./tech-legs2.js";
import { TECH as core } from "./tech-core.js";

/**
 * Técnica escrita por ejercicio. Cada archivo exporta TECH = { "Nombre exacto del ejercicio": {
 *   setup:    "Posición inicial y agarre (1-2 frases).",
 *   steps:    ["Paso 1 del movimiento", "Paso 2", "Paso 3"],   // 3 a 5 pasos, en orden
 *   breath:   "Cuándo inhalar y cuándo exhalar (1 frase).",
 *   mistakes: ["Error común y cómo corregirlo", "Otro error"],  // 2 a 3
 *   tip:      "Un consejo útil (opcional)."
 * } }.
 */
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const BY_NAME = new Map();
for (const group of [chest, back, shoulders, arms, legs, legs2, core]) {
  for (const [name, t] of Object.entries(group || {})) BY_NAME.set(norm(name), t);
}
export function techniqueFor(name) {
  return BY_NAME.get(norm(name)) || null;
}
export const TECHNIQUE_COUNT = BY_NAME.size;
