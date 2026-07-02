import { findExerciseMeta, resolveExerciseGroup, resolveExerciseMuscle } from "../data/exerciseDatabase.js";

function uid() {
  return `imp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (!lines.length) return [];
  const headers = splitCSVRow(lines[0]);
  return lines.slice(1).filter(l => l.trim()).map(l => {
    const vals = splitCSVRow(l);
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] || "").trim()]));
  });
}

function splitCSVRow(row) {
  const result = [];
  let cur = "", inQuote = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuote && row[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      result.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// ── Format detection ──────────────────────────────────────────────────────────
function detectFormat(headers) {
  const hs = headers.map(h => h.toLowerCase());
  if (hs.includes("workout name") && hs.includes("exercise name") && hs.includes("set order")) return "strong";
  if (hs.includes("exercise_title") && hs.includes("set_index") && hs.includes("weight_kg")) return "hevy";
  return "unknown";
}

// ── Exercise name normalization ───────────────────────────────────────────────
// Fuzzy match: strip parentheses qualifiers like "(Barbell)", "(Dumbbell)", etc.
function normalizeExerciseName(raw) {
  if (!raw) return "Ejercicio";
  // Remove parenthetical suffixes like "(Barbell)", "(Machine)", etc.
  return raw.replace(/\s*\([^)]*\)\s*$/, "").trim() || raw.trim();
}

function hydrateExercise(name) {
  const meta = findExerciseMeta(name) || {};
  return {
    group: meta.group || resolveExerciseGroup(name, "General"),
    muscle: meta.muscle || resolveExerciseMuscle(name, "General"),
    equipment: meta.equipment || "",
  };
}

// ── Workout type inference ────────────────────────────────────────────────────
const TYPE_PATTERNS = [
  { rx: /push|pecho|press|pectoral/i, type: "Push" },
  { rx: /pull|espalda|remo|jalón|jalon|dorsal/i, type: "Pull" },
  { rx: /leg|pierna|squat|sentadilla|cuad|isquio|glute/i, type: "Legs" },
  { rx: /upper|superior/i, type: "Upper" },
  { rx: /lower|inferior/i, type: "Lower" },
  { rx: /full.?body|full body|cuerpo completo/i, type: "Full Body" },
  { rx: /arm|braz|bicep|tricep|b[ií]cep|tr[ií]cep/i, type: "Arms" },
];

function inferWorkoutType(name) {
  for (const { rx, type } of TYPE_PATTERNS) if (rx.test(name)) return type;
  return "Full Body";
}

// ── Strong parser ─────────────────────────────────────────────────────────────
// Headers: Date, Workout Name, Duration, Exercise Name, Set Order, Weight, Reps, Distance, Duration, Notes
function parseStrong(rows) {
  const bySession = new Map();
  for (const row of rows) {
    const dateRaw = row["Date"] || row["date"] || "";
    const date = dateRaw.split(" ")[0] || dateRaw.split("T")[0]; // "2023-01-15"
    if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) continue;
    const workoutName = row["Workout Name"] || row["workout name"] || "Workout";
    const key = `${date}_${workoutName}`;
    const exerciseName = normalizeExerciseName(row["Exercise Name"] || row["exercise name"] || "Ejercicio");
    const weight = parseFloat(row["Weight"] || row["weight"] || "0") || 0;
    const reps   = parseInt(row["Reps"]   || row["reps"]   || "0", 10) || 0;
    if (!exerciseName || (!weight && !reps)) continue;
    if (!bySession.has(key)) bySession.set(key, { date, name: workoutName, sets: [] });
    const { group, muscle, equipment } = hydrateExercise(exerciseName);
    bySession.get(key).sets.push({ id: uid(), exercise: exerciseName, weight: String(weight), reps: String(reps), group, muscle, equipment });
  }
  return Array.from(bySession.values()).map(s => ({
    id: uid(),
    date: s.date,
    type: inferWorkoutType(s.name),
    sets: s.sets,
    source: "strong",
  }));
}

// ── Hevy parser ───────────────────────────────────────────────────────────────
// Headers: title, start_time, end_time, description, exercise_title, superset_id, exercise_notes, set_index, set_type, weight_kg, reps, ...
function parseHevy(rows) {
  const bySession = new Map();
  for (const row of rows) {
    const startRaw = row["start_time"] || "";
    const date = startRaw.split("T")[0] || startRaw.split(" ")[0];
    if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) continue;
    const workoutName = row["title"] || "Workout";
    const key = `${date}_${workoutName}`;
    const exerciseName = normalizeExerciseName(row["exercise_title"] || "Ejercicio");
    const weight = parseFloat(row["weight_kg"] || "0") || 0;
    const reps   = parseInt(row["reps"] || "0", 10) || 0;
    if (!exerciseName || (!weight && !reps)) continue;
    if (!bySession.has(key)) bySession.set(key, { date, name: workoutName, sets: [] });
    const { group, muscle, equipment } = hydrateExercise(exerciseName);
    bySession.get(key).sets.push({ id: uid(), exercise: exerciseName, weight: String(weight), reps: String(reps), group, muscle, equipment });
  }
  return Array.from(bySession.values()).map(s => ({
    id: uid(),
    date: s.date,
    type: inferWorkoutType(s.name),
    sets: s.sets,
    source: "hevy",
  }));
}

// ── Public API ────────────────────────────────────────────────────────────────
export function parseImportFile(text) {
  const rows = parseCSV(text);
  if (!rows.length) return { error: "El archivo está vacío o no tiene el formato correcto." };
  const format = detectFormat(Object.keys(rows[0]));
  if (format === "unknown") return { error: "Formato no reconocido. Exportá el CSV desde Strong (Settings → Export Data) o Hevy." };
  const workouts = format === "strong" ? parseStrong(rows) : parseHevy(rows);
  if (!workouts.length) return { error: "No se encontraron entrenamientos válidos en el archivo." };
  const totalSets = workouts.reduce((s, w) => s + w.sets.length, 0);
  const exercises = new Set(workouts.flatMap(w => w.sets.map(s => s.exercise)));
  return { workouts, format, totalWorkouts: workouts.length, totalSets, totalExercises: exercises.size };
}
