// Lógica pura de racha semanal, progreso y sugerencias de primer entrenamiento.
// Las fechas son strings "YYYY-MM-DD" (hora local); la semana arranca el lunes.

const DAY_MS = 86400000;

function pad(n) { return String(n).padStart(2, "0"); }

function toKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Parsea "YYYY-MM-DD" como mediodía UTC para evitar problemas de DST.
function parseKey(key) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(key || ""));
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
}

function utcKey(d) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Lunes (YYYY-MM-DD) de la semana que contiene a `dateKey`. */
export function weekStartKey(dateKey) {
  const d = parseKey(dateKey);
  if (!d) return "";
  const dow = d.getUTCDay(); // 0 = domingo
  d.setUTCDate(d.getUTCDate() - (dow === 0 ? 6 : dow - 1));
  return utcKey(d);
}

function shiftWeek(weekKey, weeks) {
  const d = parseKey(weekKey);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return utcKey(d);
}

/** Cantidad de días distintos con entreno por semana: { [lunes]: n }. */
export function workoutsByWeek(workouts) {
  const daysByWeek = {};
  (workouts || []).forEach((w) => {
    const day = String(w?.date || "").slice(0, 10);
    if (!parseKey(day)) return;
    const wk = weekStartKey(day);
    (daysByWeek[wk] ||= new Set()).add(day);
  });
  const out = {};
  Object.keys(daysByWeek).forEach((k) => { out[k] = daysByWeek[k].size; });
  return out;
}

/**
 * Racha semanal.
 * - thisWeek: entrenos (días) de la semana en curso
 * - goal: objetivo semanal
 * - streak: semanas consecutivas cumpliendo el objetivo. La semana en curso
 *   suma si ya se cumplió, pero si todavía no, no corta la racha.
 */
export function getWeeklyStreak(workouts, goal, today = toKey(new Date()), vacationPeriods = []) {
  const g = Math.max(1, Number(goal) || 1);
  const byWeek = workoutsByWeek(workouts);
  const current = weekStartKey(today);
  const thisWeek = byWeek[current] || 0;

  // Modo vacaciones: una semana con 4+ días de vacaciones se pausa (ni suma ni corta);
  // con menos, el objetivo se prorratea según los días que no estuvo de vacaciones.
  const goalFor = (wk) => {
    const vd = vacationDaysInWeek(vacationPeriods, wk, today);
    if (vd >= 4) return 0;
    return vd === 0 ? g : Math.max(1, Math.ceil((g * (7 - vd)) / 7));
  };

  const currentGoal = goalFor(current);
  const currentPaused = currentGoal === 0;
  let streak = !currentPaused && thisWeek >= currentGoal ? 1 : 0;
  let wk = shiftWeek(current, -1);
  for (let i = 0; i < 520; i++) {
    const wg = goalFor(wk);
    if (wg === 0) { wk = shiftWeek(wk, -1); continue; } // semana pausada: se salta
    if ((byWeek[wk] || 0) >= wg) { streak++; wk = shiftWeek(wk, -1); } else break;
  }
  const effGoal = currentPaused ? g : currentGoal;
  return {
    thisWeek, goal: effGoal, streak, paused: currentPaused,
    goalReached: !currentPaused && thisWeek >= effGoal,
    remaining: currentPaused ? 0 : Math.max(0, effGoal - thisWeek),
  };
}

/** ¿`dateKey` cae dentro de algún período de vacaciones? (end null = sigue activo) */
export function isOnVacation(periods, dateKey) {
  return (periods || []).some((p) => p && p.start && dateKey >= p.start && (!p.end || dateKey <= p.end));
}

/** Días de la semana (lunes `wk`) que estuvieron de vacaciones, sin contar el futuro (> today). */
export function vacationDaysInWeek(periods, wk, today) {
  if (!periods || !periods.length) return 0;
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = parseKey(wk);
    d.setUTCDate(d.getUTCDate() + i);
    const k = utcKey(d);
    if (k > today) break;
    if (isOnVacation(periods, k)) n++;
  }
  return n;
}

/** Días sin entrenar entre `fromKey` (último entreno) y `toKey`, sin contar los de vacaciones. */
export function idleDaysExcludingVacation(periods, fromKey, toKey) {
  const a = parseKey(fromKey);
  const b = parseKey(toKey);
  if (!a || !b) return 0;
  let n = 0;
  for (let t = a.getTime() + DAY_MS; t <= b.getTime(); t += DAY_MS) {
    if (!isOnVacation(periods, utcKey(new Date(t)))) n++;
  }
  return n;
}

/** Une períodos de dos dispositivos: mismo `start` → gana el cerrado (con end); orden por fecha. */
export function mergeVacationPeriods(a, b) {
  const map = new Map();
  [...(b || []), ...(a || [])].forEach((p) => {
    if (!p || !p.start) return;
    const ex = map.get(p.start);
    if (!ex || (!ex.end && p.end)) map.set(p.start, p);
  });
  return [...map.values()].sort((x, y) => x.start.localeCompare(y.start)).slice(-30);
}

/** Días de vacaciones de un período (inclusive). */
export function vacationLength(period, today = toKey(new Date())) {
  if (!period?.start) return 0;
  const a = parseKey(period.start);
  const b = parseKey(period.end || today);
  if (!a || !b) return 0;
  return Math.max(1, Math.round((b - a) / DAY_MS) + 1);
}

/** Récord más reciente (por fecha) o null. */
export function getLatestPR(prs) {
  const list = (prs || []).filter((p) => p && p.exercise);
  if (!list.length) return null;
  return [...list].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
}

/**
 * Tendencia de peso de los últimos `days` días (por defecto 30).
 * Requiere al menos 2 registros en la ventana. delta = último - primero (kg).
 */
export function getWeightTrend(weightLog, today = toKey(new Date()), days = 30) {
  const end = parseKey(today);
  if (!end) return null;
  const startKey = utcKey(new Date(end.getTime() - days * DAY_MS));
  const entries = (weightLog || [])
    .map((e) => ({ date: String(e?.date || "").slice(0, 10), kg: Number(e?.kg) }))
    .filter((e) => parseKey(e.date) && e.kg > 0 && e.date >= startKey && e.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (entries.length < 2) return null;
  const from = entries[0].kg;
  const to = entries[entries.length - 1].kg;
  const delta = Math.round((to - from) * 10) / 10;
  return { from, to, delta, direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat", days };
}

/**
 * Elige 3 rutinas (nombres de ROUTINES) según objetivo y nivel.
 * Sólo devuelve nombres presentes en `available`.
 */
export function suggestFirstRoutines(goal, level, available = ["Push", "Pull", "Legs", "Full Body"]) {
  const lvl = String(level || "").toLowerCase();
  const beginner = ["principiante", "sedentario", "ligero"].includes(lvl);
  let order;
  if (beginner) order = ["Full Body", "Push", "Legs", "Pull"];
  else if (goal === "fuerza") order = ["Legs", "Push", "Pull", "Full Body"];
  else if (goal === "definicion") order = ["Full Body", "Legs", "Push", "Pull"];
  else order = ["Push", "Pull", "Legs", "Full Body"];
  return order.filter((n) => available.includes(n)).slice(0, 3);
}
