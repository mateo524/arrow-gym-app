import { ENTRIES as base } from "./base.jsx";
import { ENTRIES as chest } from "./group-chest.jsx";
import { ENTRIES as back } from "./group-back.jsx";
import { ENTRIES as shoulders } from "./group-shoulders.jsx";
import { ENTRIES as arms } from "./group-arms.jsx";
import { ENTRIES as legs } from "./group-legs.jsx";
import { ENTRIES as legs2 } from "./group-legs2.jsx";
import { ENTRIES as core } from "./group-core.jsx";

// Cada archivo exporta ENTRIES: { "Nombre exacto del ejercicio": def }. Los de grupos pisan a los de base.
// Si un ejercicio no está en ninguno, "Cómo se hace" muestra la ilustración anterior (ver ExerciseMotion.jsx).
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const BY_NAME = new Map();
for (const entries of [base, chest, back, shoulders, arms, legs, legs2, core]) {
  for (const [name, def] of Object.entries(entries || {})) BY_NAME.set(norm(name), def);
}

export function motionForName(name) {
  return BY_NAME.get(norm(name)) || null;
}
export const MOTION_COUNT = BY_NAME.size;
