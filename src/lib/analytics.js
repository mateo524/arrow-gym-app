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
  const history = (allWorkouts || []).filter((item) => item.id !== workout.id).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const totals = getGroupTotals([hydratedWorkout]);
  const totalVolume = Math.round(getWorkoutVolume(hydratedWorkout));

  // Weekly volume comparison (same type, last 4 weeks)
  const sameTypePrev = history.filter((w) => w.type === workout.type).slice(0, 4);
  const avgPrevVolume = sameTypePrev.length
    ? Math.round(sameTypePrev.reduce((sum, w) => sum + getWorkoutVolume(w), 0) / sameTypePrev.length)
    : null;
  const volumeDelta = avgPrevVolume ? Math.round(((totalVolume - avgPrevVolume) / Math.max(1, avgPrevVolume)) * 100) : null;

  // Push/pull balance
  const pushCount = history.slice(0, 14).filter((w) => ["Push", "Full Body"].includes(w.type)).length;
  const pullCount = history.slice(0, 14).filter((w) => ["Pull", "Full Body"].includes(w.type)).length;
  const pushSets = (totals.Pecho?.sets || 0) + (totals.Hombros?.sets || 0) + (totals.Brazos?.sets || 0);
  const pullSets = totals.Espalda?.sets || 0;

  // Frequency: days since last same-type session
  const lastSameType = sameTypePrev[0];
  const daysSinceLast = lastSameType?.date
    ? Math.round((new Date(workout.date) - new Date(lastSameType.date)) / 86400000)
    : null;

  const byExercise = {};
  hydratedWorkout.sets.forEach((set) => {
    if (!byExercise[set.exercise]) byExercise[set.exercise] = [];
    byExercise[set.exercise].push(set);
  });

  const alerts = [];
  const recommendations = [];
  const prs = [];

  Object.entries(byExercise).forEach(([exercise, sets]) => {
    const setsWithData = sets.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
    if (!setsWithData.length) return;

    const reps = setsWithData.map((s) => Number(s.reps));
    const weights = setsWithData.map((s) => Number(s.weight));
    const avgReps = reps.reduce((a, b) => a + b, 0) / reps.length;
    const maxWeight = Math.max(...weights);
    const maxReps = Math.max(...reps);
    const best1RM = Math.round(maxWeight * (1 + maxReps / 30)); // Epley formula

    const prevSets = previousSetsForExercise(exercise, history);
    const prevMaxWeight = prevSets.length ? Math.max(...prevSets.map((s) => Number(s.weight) || 0)) : null;
    const prevMaxReps = prevSets.length ? Math.max(...prevSets.map((s) => Number(s.reps) || 0)) : null;
    const prevBest1RM = prevMaxWeight && prevMaxReps ? Math.round(prevMaxWeight * (1 + prevMaxReps / 30)) : null;

    // PR detection
    if (prevMaxWeight !== null && maxWeight > prevMaxWeight) {
      prs.push({ exercise, type: "weight", value: `${maxWeight}kg`, prev: `${prevMaxWeight}kg` });
    } else if (prevMaxReps !== null && maxReps > prevMaxReps && maxWeight >= (prevMaxWeight || 0)) {
      prs.push({ exercise, type: "reps", value: `${maxReps} reps`, prev: `${prevMaxReps} reps` });
    }

    // 1RM progression
    if (prevBest1RM && best1RM > prevBest1RM) {
      recommendations.push({ exercise, type: "increase", msg: `${exercise}: 1RM estimado ${best1RM}kg (+${best1RM - prevBest1RM} vs anterior). Progresión confirmada.` });
    } else if (avgReps >= 12) {
      recommendations.push({ exercise, type: "increase", msg: `${exercise}: promedio ${Math.round(avgReps)} reps — probá +2.5kg en la próxima sesión.` });
    } else if (avgReps <= 5) {
      recommendations.push({ exercise, type: "stabilize", msg: `${exercise}: pocas reps (${Math.round(avgReps)} promedio) — verificá que la carga sea manejable para 6-8 reps.` });
    } else if (setsWithData.length >= 3 && avgReps >= 8) {
      recommendations.push({ exercise, type: "maintain", msg: `${exercise}: ${setsWithData.length} series × ~${Math.round(avgReps)} reps. Zona de hipertrofia óptima.` });
    }

    // Fatigue: weight dropping set-over-set
    if (setsWithData.length >= 3) {
      const firstHalf = weights.slice(0, Math.floor(weights.length / 2));
      const secondHalf = weights.slice(Math.floor(weights.length / 2));
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      if (avgFirst > 0 && (avgFirst - avgSecond) / avgFirst > 0.08) {
        alerts.push({ exercise, type: "fatigue", msg: `${exercise}: la carga cayó entre series (${Math.round(avgFirst)}→${Math.round(avgSecond)}kg). Considerá más descanso o bajar una serie.` });
      }
    }

    // Unstable load increase
    if (prevMaxWeight !== null && maxWeight > prevMaxWeight && prevMaxReps !== null && maxReps < prevMaxReps - 3) {
      alerts.push({ exercise, type: "unstable", msg: `${exercise}: subiste a ${maxWeight}kg pero las reps bajaron de ${prevMaxReps} a ${maxReps}. Estabilizá la carga.` });
    }

    // Shoulder alert
    if (userProfile?.shoulder_alert && exercise === "Landmine Shoulder Press" && maxWeight >= 30) {
      alerts.push({ exercise, type: "shoulder", msg: "Landmine Shoulder Press: no superar 30kg — límite por rehabilitación de hombro." });
    }
  });

  // Push/pull imbalance
  if (pushCount > pullCount + 2 || pushSets > pullSets + 6) {
    alerts.push({ type: "balance", msg: "Más empuje que tirón en las últimas semanas. Priorizá espalda, remo y jalones para proteger los hombros." });
  }

  // High shoulder volume
  if ((totals.Hombros?.sets || 0) >= 8) {
    alerts.push({ type: "shoulder-volume", msg: `Volumen alto de hombros (${totals.Hombros.sets} series). Monitoreá tensión en manguito rotador.` });
  }

  // Frequency alert
  if (daysSinceLast !== null && daysSinceLast <= 1) {
    alerts.push({ type: "frequency", msg: `Entrenaste ${workout.type} hace ${daysSinceLast === 0 ? "hoy" : "ayer"}. Asegurate de tener 48h de recuperación muscular.` });
  }

  const sorted = Object.entries(totals).sort((a, b) => b[1].sets - a[1].sets);
  const main = sorted[0]?.[0] || "General";
  const totalSets = (hydratedWorkout.sets || []).filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0).length;

  let volumeContext = "";
  if (volumeDelta !== null) {
    if (volumeDelta > 10) volumeContext = ` (+${volumeDelta}% vs promedio ${workout.type})`;
    else if (volumeDelta < -10) volumeContext = ` (-${Math.abs(volumeDelta)}% vs promedio ${workout.type})`;
  }

  const status = totalVolume > 0
    ? `${hydratedWorkout.type}: ${totalSets} series · ${totalVolume}kg${volumeContext}. Foco: ${main}.`
    : `${hydratedWorkout.type}: sesión completada.`;

  return {
    id: `coach-${workout.id || Date.now()}`,
    workoutId: workout.id,
    date: workout.date,
    title: `${workout.type} · ${workout.date}`,
    status,
    alerts: alerts.slice(0, 4),
    recommendations: recommendations.slice(0, 5),
    prs,
    alert: alerts[0]?.msg || "Sin alertas.",
    recommendation: recommendations[0]?.msg || "Registrá peso y reps para análisis de progresión.",
    totalVolume,
    totalSets,
    sessionType: workout.type,
    volumeDelta,
    daysSinceLast,
    createdAt: new Date().toISOString(),
  };
}

// Live coaching: real-time suggestions for the active workout in progress
export function buildLiveCoachHints(activeWorkout, allWorkouts = []) {
  if (!activeWorkout) return [];
  const history = (allWorkouts || []).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const hints = [];

  const byExercise = {};
  (activeWorkout.sets || []).forEach((set) => {
    if (!byExercise[set.exercise]) byExercise[set.exercise] = [];
    byExercise[set.exercise].push(set);
  });

  Object.entries(byExercise).forEach(([exercise, sets]) => {
    const setsWithData = sets.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
    if (!setsWithData.length) return;

    const maxWeight = Math.max(...setsWithData.map((s) => Number(s.weight)));
    const avgReps = setsWithData.reduce((sum, s) => sum + Number(s.reps), 0) / setsWithData.length;
    const prevSets = previousSetsForExercise(exercise, history);
    const prevMaxWeight = prevSets.length ? Math.max(...prevSets.map((s) => Number(s.weight) || 0)) : null;
    const prevAvgReps = prevSets.length ? prevSets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0) / prevSets.length : null;

    if (prevMaxWeight !== null && maxWeight > prevMaxWeight) {
      hints.push({ exercise, type: "pr", msg: `🏆 ${exercise}: nuevo peso récord ${maxWeight}kg`, priority: 1 });
    } else if (prevAvgReps !== null && avgReps >= 12 && maxWeight <= (prevMaxWeight || 0)) {
      hints.push({ exercise, type: "ready", msg: `↑ ${exercise}: promedio ${Math.round(avgReps)} reps — probá subir 2.5kg`, priority: 2 });
    }
  });

  return hints.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
