import { SEED_WORKOUTS, SEED_BODY_METRICS } from "../data/seedData.js";
import { resolveExerciseGroup, resolveExerciseMuscle, findExerciseMeta } from "../data/exerciseDatabase.js";

// Incluye las keys de todas las versiones anteriores, incluida la app original.
const OLD_KEYS = [
  "arrow-gym-v3",
  "arrow-gym-v2",
  "arrow-gym-v1",
  "arrow_gym_v2",
  "arrow_gym_v1",
  "arrow_gym_store",
  "arrow-gym",
];

const GROUP_ALIASES = {
  hombro: "Hombros",
  hombros: "Hombros",
  pecho: "Pecho",
  espalda: "Espalda",
  biceps: "Brazos",
  bíceps: "Brazos",
  triceps: "Brazos",
  tríceps: "Brazos",
  brazos: "Brazos",
  cuadriceps: "Piernas",
  cuádriceps: "Piernas",
  isquios: "Piernas",
  gemelos: "Piernas",
  gluteos: "Piernas",
  glúteos: "Piernas",
  piernas: "Piernas",
  core: "Core",
};

const MUSCLE_ALIASES = {
  biceps: "Bíceps",
  triceps: "Tríceps",
  cuadriceps: "Cuádriceps",
  gluteos: "Glúteos",
  hombro: null,
  hombros: null,
  pecho: null,
  espalda: null,
  brazos: null,
  piernas: null,
  core: null,
};

function cleanKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function extractWorkouts(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.workouts)) return payload.workouts;
  if (payload.state && Array.isArray(payload.state.workouts)) return payload.state.workouts;
  return [];
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveLegacyGroup(rawSet, exercise) {
  const explicit = rawSet.group || rawSet.bodyPart || rawSet.category;
  if (explicit && GROUP_ALIASES[cleanKey(explicit)]) return GROUP_ALIASES[cleanKey(explicit)];
  if (explicit && ["Hombros", "Pecho", "Espalda", "Brazos", "Piernas", "Core"].includes(explicit)) return explicit;

  const legacyMuscle = rawSet.muscle;
  if (legacyMuscle && GROUP_ALIASES[cleanKey(legacyMuscle)]) return GROUP_ALIASES[cleanKey(legacyMuscle)];

  const meta = findExerciseMeta(exercise);
  return meta?.group || resolveExerciseGroup(exercise, "Core");
}

function resolveLegacyMuscle(rawSet, exercise, group) {
  const raw = rawSet.muscle;
  const key = cleanKey(raw);
  const meta = findExerciseMeta(exercise);

  // En la app original "Hombro", "Pecho", "Espalda" eran grupos, no músculos específicos.
  // Para el mapa nuevo los convertimos al músculo real usando el nombre del ejercicio.
  if (key in MUSCLE_ALIASES) {
    return MUSCLE_ALIASES[key] || meta?.muscle || resolveExerciseMuscle(exercise, group);
  }

  if (raw && !GROUP_ALIASES[key]) return raw;
  return meta?.muscle || resolveExerciseMuscle(exercise, group);
}

export function normalizeSet(set) {
  const exercise = set.exercise || set.name || set.exerciseName || "Ejercicio";
  const group = resolveLegacyGroup(set, exercise);
  const muscle = resolveLegacyMuscle(set, exercise, group);
  return {
    id: set.id || uid("set"),
    exercise,
    set: set.set ?? set.setNumber ?? undefined,
    weight: set.weight ?? set.kg ?? "",
    reps: set.reps ?? "",
    group,
    muscle,
    equipment: set.equipment || findExerciseMeta(exercise)?.equipment || "",
  };
}

export function normalizeWorkout(workout) {
  const sets = Array.isArray(workout.sets)
    ? workout.sets.map(normalizeSet)
    : [normalizeSet(workout)];

  return {
    id: workout.id || uid("workout"),
    date: workout.date || new Date().toISOString().slice(0, 10),
    type: workout.type || workout.session_type || workout.sessionType || "Workout",
    sets,
    migrated: Boolean(workout.migrated),
  };
}

export function loadInitialWorkouts() {
  if (typeof localStorage === "undefined") return SEED_WORKOUTS.map(normalizeWorkout);

  const found = [];
  OLD_KEYS.forEach((key) => extractWorkouts(readJSON(key)).forEach((workout) => found.push(normalizeWorkout(workout))));

  // Primero datos reales guardados, después seed original como respaldo.
  // Deduplicamos por id y, si no hay id confiable, por fecha+tipo+cantidad de series.
  const byKey = new Map();
  [...found, ...SEED_WORKOUTS.map(normalizeWorkout)].forEach((workout) => {
    const key = workout.id || `${workout.date}-${workout.type}-${workout.sets?.length || 0}`;
    if (!byKey.has(key)) byKey.set(key, workout);
  });

  return Array.from(byKey.values()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function loadInitialBodyMetrics() {
  if (typeof localStorage === "undefined") return SEED_BODY_METRICS;
  try {
    const own = readJSON("arrow-gym-v4");
    if (own?.state?.bodyMetrics) return own.state.bodyMetrics;
    if (own?.state?.workouts && own.state.workouts.length > 0) return [];
  } catch {}
  return SEED_BODY_METRICS;
}
