import { BODY_GROUPS, MUSCLES_BY_GROUP, resolveExerciseGroup, resolveExerciseMuscle, findExerciseMeta } from "../data/exerciseDatabase.js";

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
  return (workout.sets || []).reduce((sum, set) => sum + getSetVolume(set), 0);
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
  workouts.forEach((workout) => (workout.sets || []).forEach((raw) => {
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
  workouts.forEach((workout) => (workout.sets || []).forEach((raw) => {
    const set = hydrateSet(raw);
    out[set.muscle] = (out[set.muscle] || 0) + 1;
    out[set.group] = (out[set.group] || 0) + 1;
  }));
  const max = Math.max(1, ...Object.values(out));
  return Object.fromEntries(Object.entries(out).map(([muscle, count]) => [muscle, { count, level: Math.min(4, Math.max(1, Math.ceil((count / max) * 4))) }]));
}

function previousSetsForExercise(exercise, history) {
  for (let i = 0; i < history.length; i++) {
    const found = (history[i].sets || []).filter((s) => s.exercise === exercise);
    if (found.length > 0) return found.map(hydrateSet);
  }
  return [];
}

export function buildCoachReport(workout, allWorkouts = []) {
  const hydratedWorkout = { ...workout, sets: (workout.sets || []).map(hydrateSet) };
  const isCardio = ["Bicicleta", "Boxeo", "Cardio"].includes(workout.type) || hydratedWorkout.sets.every((s) => s.group === "Cardio");
  const history = (allWorkouts || []).filter((item) => item.id !== workout.id);
  const totals = getGroupTotals([hydratedWorkout]);
  const totalVolume = Math.round(getWorkoutVolume(hydratedWorkout));
  const totalMinutes = hydratedWorkout.sets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0);

  const alerts = [];
  const recommendations = [];

  if (isCardio) {
    const status = totalMinutes > 0
      ? `${workout.type}: ${totalMinutes} min total · ${hydratedWorkout.sets.length} fases.`
      : `${workout.type}: sesión completada.`;
    for (const set of hydratedWorkout.sets) {
      const mins = Number(set.reps) || 0;
      const intensity = Number(set.weight) || 0;
      if (mins >= 35) recommendations.push({ exercise: set.exercise, type: "cardio-endurance", msg: `${set.exercise}: sesión larga (${mins} min). Mantené hidratación.` });
      else if (mins >= 20) recommendations.push({ exercise: set.exercise, type: "cardio-maintain", msg: `${set.exercise}: ${mins} min de buena duración.` });
      else recommendations.push({ exercise: set.exercise, type: "cardio-build", msg: `${set.exercise}: podés aumentar 5 min la próxima vez.` });
      if (workout.type === "Boxeo" && set.exercise === "Boxeo - Bolsa" && intensity >= 4) {
        alerts.push({ type: "boxing-intensity", msg: "Boxeo Bolsa a intensidad alta. Cuidá muñecas; usá vendajes si es necesario." });
      }
    }
    if (workout.type === "Boxeo" && totalMinutes < 45) alerts.push({ type: "boxing-duration", msg: "Sesión de boxeo menor a 45 min. Ideal llegar a 60 min combinando HIIT y bolsa." });
    return {
      id: `coach-${workout.id || Date.now()}`,
      workoutId: workout.id,
      date: workout.date,
      title: `${workout.type} · ${workout.date}`,
      status,
      alerts: alerts.slice(0, 3),
      recommendations: recommendations.slice(0, 4),
      alert: alerts[0]?.msg || "Sesión de cardio registrada.",
      recommendation: recommendations[0]?.msg || "Buen trabajo cardio.",
      totalVolume: totalMinutes,
      sessionType: workout.type,
      createdAt: new Date().toISOString(),
    };
  }

  const pushCount = history.filter((w) => ["Push", "Full Body"].includes(w.type)).length;
  const pullCount = history.filter((w) => ["Pull", "Full Body"].includes(w.type)).length;
  const pushSets = (totals.Pecho?.sets || 0) + (totals.Hombros?.sets || 0) + (totals.Brazos?.sets || 0);
  const pullSets = totals.Espalda?.sets || 0;

  const byExercise = {};
  hydratedWorkout.sets.forEach((set) => {
    if (!byExercise[set.exercise]) byExercise[set.exercise] = [];
    byExercise[set.exercise].push(set);
  });

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
    if (exercise === "Landmine Shoulder Press" && maxWeight >= 30) {
      alerts.push({ exercise, type: "shoulder", msg: "Landmine Shoulder Press: no superar 30kg hasta julio 2026 por hombro post-op." });
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

export function getExerciseStats(workouts, exercise) {
  const matchedWorkouts = (workouts || []).filter((workout) => (workout.sets || []).some((set) => String(set.exercise || "").trim().toLowerCase() === String(exercise || "").trim().toLowerCase()));
  const lastWorkout = [...matchedWorkouts].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
  const lastSets = (lastWorkout?.sets || []).filter((set) => String(set.exercise || "").trim().toLowerCase() === String(exercise || "").trim().toLowerCase());
  const allSets = [];
  matchedWorkouts.forEach((w) => {
    (w.sets || []).filter((set) => String(set.exercise || "").trim().toLowerCase() === String(exercise || "").trim().toLowerCase()).forEach((s) => allSets.push({ ...s, date: w.date }));
  });
  const bestByVolume = [...allSets].sort((a, b) => (Number(b.weight) || 0) * (Number(b.reps) || 0) - (Number(a.weight) || 0) * (Number(a.reps) || 0))[0];
  const bestByWeight = [...allSets].sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0))[0];
  const totalVolume = allSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
  const totalSessions = matchedWorkouts.length;

  const lastCompleted = [...allSets].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];

  return {
    lastWeight: lastCompleted?.weight ?? "",
    lastReps: lastCompleted?.reps ?? "",
    lastSets: lastSets.length || 0,
    lastDate: lastWorkout?.date || null,
    bestWeight: bestByWeight?.weight ?? "",
    bestReps: bestByWeight?.reps ?? "",
    bestVolume: bestByVolume ? (Number(bestByVolume.weight) || 0) * (Number(bestByVolume.reps) || 0) : 0,
    totalVolume: Math.round(totalVolume),
    totalSessions,
    allSets,
  };
}

export function getWeeklyVolume(workouts) {
  const weeks = {};
  (workouts || []).forEach((w) => {
    const d = parseDate(w.date);
    const weekStart = getStartOfWeek(d);
    const key = weekStart.toISOString().slice(0, 10);
    if (!weeks[key]) weeks[key] = { week: key, volume: 0, sets: 0, workouts: 0 };
    weeks[key].volume += getWorkoutVolume(w);
    weeks[key].sets += (w.sets || []).length;
    weeks[key].workouts += 1;
  });
  return Object.values(weeks).sort((a, b) => String(a.week).localeCompare(String(b.week)));
}

export function getFrequencyRanking(workouts) {
  const counts = {};
  (workouts || []).forEach((w) => {
    (w.sets || []).forEach((s) => {
      if (!counts[s.exercise]) counts[s.exercise] = { name: s.exercise, sets: 0, sessions: new Set(), totalVolume: 0 };
      counts[s.exercise].sets += 1;
      counts[s.exercise].sessions.add(w.id);
      counts[s.exercise].totalVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
    });
  });
  return Object.values(counts)
    .map((c) => ({ ...c, sessions: c.sessions.size }))
    .sort((a, b) => b.sets - a.sets);
}

export function getGroupTrends(workouts) {
  const weeks = {};
  (workouts || []).forEach((w) => {
    const d = parseDate(w.date);
    const weekStart = getStartOfWeek(d).toISOString().slice(0, 10);
    if (!weeks[weekStart]) weeks[weekStart] = {};
    (w.sets || []).forEach((raw) => {
      const set = hydrateSet(raw);
      if (!weeks[weekStart][set.group]) weeks[weekStart][set.group] = { sets: 0, volume: 0 };
      weeks[weekStart][set.group].sets += 1;
      weeks[weekStart][set.group].volume += getSetVolume(set);
    });
  });
  const groups = {};
  Object.entries(weeks).forEach(([week, data]) => {
    Object.entries(data).forEach(([group, stats]) => {
      if (!groups[group]) groups[group] = [];
      groups[group].push({ week, ...stats });
    });
  });
  return groups;
}

export function getBodyMetricTrendData(bodyMetrics, field) {
  return [...(bodyMetrics || [])]
    .filter((m) => m[field] != null)
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
    .map((m) => ({ date: m.date, value: m[field] }));
}
