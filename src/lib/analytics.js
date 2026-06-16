import { BODY_GROUPS, MUSCLES_BY_GROUP, resolveExerciseGroup, resolveExerciseMuscle, findExerciseMeta } from "../data/exerciseDatabase.js";

export function hasData(set) {
  return set && Number(set.weight) > 0 && Number(set.reps) > 0;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

export const RANGE_OPTIONS = [
  { id: "7d", label: "Semana", days: 7 },
  { id: "30d", label: "1 mes", days: 30 },
  { id: "180d", label: "6 meses", days: 180 },
  { id: "365d", label: "1 año", days: 365 },
  { id: "all", label: "Inicio", days: null },
];

const GROUP_ALIASES = {
  Hombro: "Hombros",
  Hombros: "Hombros",
  Pecho: "Pecho",
  Espalda: "Espalda",
  Biceps: "Brazos",
  Bíceps: "Brazos",
  Triceps: "Brazos",
  Tríceps: "Brazos",
  Cuadriceps: "Piernas",
  Cuádriceps: "Piernas",
  Isquios: "Piernas",
  Gemelos: "Piernas",
  Glúteos: "Piernas",
  Core: "Core",
};

function clean(value) {
  return String(value || "").trim();
}

function groupFromLegacyMuscle(value) {
  return GROUP_ALIASES[clean(value)] || null;
}

export function parseDate(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function filterByRange(workouts, rangeId) {
  const range = RANGE_OPTIONS.find((item) => item.id === rangeId) || RANGE_OPTIONS[0];
  if (!range.days) return workouts;
  const min = Date.now() - range.days * 86400000;
  return workouts.filter((workout) => parseDate(workout.date).getTime() >= min);
}

export function filterCurrentWeek(workouts) {
  const min = getStartOfWeek().getTime();
  return workouts.filter((workout) => parseDate(workout.date).getTime() >= min);
}

export function getSetVolume(set) {
  return (Number(set.weight) || 0) * (Number(set.reps) || 0);
}

export function getWorkoutVolume(workout) {
  return (workout.sets || []).filter(hasData).reduce((sum, set) => sum + getSetVolume(set), 0);
}

export function hydrateSet(set) {
  const meta = findExerciseMeta(set.exercise) || {};
  const legacyGroup = groupFromLegacyMuscle(set.muscle);
  const group = set.group || legacyGroup || meta.group || resolveExerciseGroup(set.exercise, "Core");
  const muscle = legacyGroup
    ? meta.muscle || resolveExerciseMuscle(set.exercise, MUSCLES_BY_GROUP[group]?.[0] || "General")
    : set.muscle || meta.muscle || resolveExerciseMuscle(set.exercise, MUSCLES_BY_GROUP[group]?.[0] || "General");
  return { ...set, group, muscle };
}

export function getGroupTotals(workouts) {
  const totals = BODY_GROUPS.reduce((acc, group) => ({ ...acc, [group]: { sets: 0, reps: 0, volume: 0, exercises: new Set(), muscles: {} } }), {});
  workouts.forEach((workout) => (workout.sets || []).filter(hasData).forEach((raw) => {
    const set = hydrateSet(raw);
    if (!totals[set.group]) return;
    totals[set.group].sets += 1;
    totals[set.group].reps += Number(set.reps) || 0;
    totals[set.group].volume += getSetVolume(set);
    totals[set.group].exercises.add(set.exercise);
    totals[set.group].muscles[set.muscle] = (totals[set.group].muscles[set.muscle] || 0) + 1;
  }));
  return Object.fromEntries(Object.entries(totals).map(([group, value]) => [group, { ...value, volume: Math.round(value.volume), exercises: Array.from(value.exercises) }]));
}

export function getRadarData(workouts) {
  const totals = getGroupTotals(workouts);
  const max = Math.max(1, ...BODY_GROUPS.map((group) => totals[group].sets));
  return BODY_GROUPS.map((group) => ({
    group,
    sets: totals[group].sets,
    reps: totals[group].reps,
    volume: totals[group].volume,
    score: Math.round((totals[group].sets / max) * 100),
  }));
}

export function getMuscleIntensity(workouts) {
  const out = {};
  workouts.forEach((workout) => (workout.sets || []).filter(hasData).forEach((raw) => {
    const set = hydrateSet(raw);
    out[set.muscle] = (out[set.muscle] || 0) + 1;
    out[set.group] = (out[set.group] || 0) + 1;
  }));
  return Object.fromEntries(Object.entries(out).map(([muscle, count]) => {
    let level = 0;
    if (count >= 10) level = 4;
    else if (count >= 6) level = 3;
    else if (count >= 3) level = 2;
    else if (count >= 1) level = 1;
    return [muscle, { count, level }];
  }));
}

function previousSetsForExercise(exercise, history) {
  for (let i = 0; i < history.length; i++) {
    const found = (history[i].sets || []).filter((s) => s.exercise === exercise);
    if (found.length > 0) return found.map(hydrateSet);
  }
  return [];
}

// userProfile is optional – pass profile object to enable per-user alerts
export function buildCoachReport(workout, allWorkouts = [], userProfile = null) {
  const hydratedWorkout = { ...workout, sets: (workout.sets || []).map(hydrateSet) };
  const history = (allWorkouts || []).filter((item) => item.id !== workout.id);
  const totals = getGroupTotals([hydratedWorkout]);
  const totalVolume = Math.round(getWorkoutVolume(hydratedWorkout));

  const pushCount = history.filter((w) => ["Push", "Full Body"].includes(w.type)).length;
  const pullCount = history.filter((w) => ["Pull", "Full Body"].includes(w.type)).length;
  const pushSets = (totals.Pecho?.sets || 0) + (totals.Hombros?.sets || 0) + (totals.Brazos?.sets || 0);
  const pullSets = totals.Espalda?.sets || 0;

  const byExercise = {};
  hydratedWorkout.sets.forEach((set) => {
    if (!byExercise[set.exercise]) byExercise[set.exercise] = [];
    byExercise[set.exercise].push(set);
  });

  const alerts = [];
  const recommendations = [];

  Object.entries(byExercise).forEach(([exercise, sets]) => {
    const reps = sets.map((s) => Number(s.reps) || 0);
    const weights = sets.map((s) => Number(s.weight) || 0);
    const avgReps = reps.reduce((a, b) => a + b, 0) / Math.max(1, reps.length);
    const maxWeight = Math.max(...weights);
    const maxReps = Math.max(...reps);
    const prevSets = previousSetsForExercise(exercise, history);
    const prevMaxWeight = prevSets.length ? Math.max(...prevSets.map((s) => Number(s.weight) || 0)) : null;
    const prevMaxReps = prevSets.length ? Math.max(...prevSets.map((s) => Number(s.reps) || 0)) : null;

    if (avgReps >= 12) recommendations.push({ exercise, type: "increase", msg: `${exercise}: listo para probar +2.5kg si la técnica fue limpia.` });
    else if (avgReps <= 8) recommendations.push({ exercise, type: "stabilize", msg: `${exercise}: mantené o bajá carga hasta llegar a 9-10 reps sólidas.` });
    else recommendations.push({ exercise, type: "maintain", msg: `${exercise}: mantené carga y buscá sumar 1 rep.` });

    if (prevMaxWeight !== null && maxWeight > prevMaxWeight && prevMaxReps !== null && maxReps < prevMaxReps - 2) {
      alerts.push({ exercise, type: "unstable", msg: `${exercise}: subiste peso pero bajaron bastante las reps. Estabilizá la carga.` });
    }
    // Shoulder post-op alert: only fires when explicitly enabled for this user in their profile
    if (userProfile?.shoulder_alert && exercise === "Landmine Shoulder Press" && maxWeight >= 30) {
      alerts.push({ exercise, type: "shoulder", msg: "Landmine Shoulder Press: no superar 30kg – límite por rehabilitación de hombro." });
    }
  });

  if (pushCount > pullCount + 1 || pushSets > pullSets + 4) {
    alerts.push({ type: "balance", msg: "Hay más empuje que tirón. Priorizá espalda, Face Pull y control escapular." });
  }
  if ((totals.Hombros?.sets || 0) >= 8) {
    alerts.push({ type: "shoulder-volume", msg: "Volumen alto de hombros esta sesión. Cuidá dolor y rango de movimiento." });
  }

  const sorted = Object.entries(totals).sort((a, b) => b[1].sets - a[1].sets);
  const main = sorted[0]?.[0] || "General";
  const status = totalVolume > 0
    ? `${hydratedWorkout.type}: ${hydratedWorkout.sets.length} series · ${totalVolume} kg. Foco principal: ${main}.`
    : `${hydratedWorkout.type}: sesión completada.`;

  const firstAlert = alerts[0]?.msg || "Sin alertas fuertes.";
  const firstRecommendation = recommendations[0]?.msg || "Registrá peso y reps para que el coach sugiera progresión.";

  return {
    id: `coach-${workout.id || Date.now()}`,
    workoutId: workout.id,
    date: workout.date,
    title: `${workout.type} · ${workout.date}`,
    status,
    alerts: alerts.slice(0, 3),
    recommendations: recommendations.slice(0, 4),
    alert: firstAlert,
    recommendation: firstRecommendation,
    totalVolume,
    sessionType: workout.type,
    createdAt: new Date().toISOString(),
  };
}
