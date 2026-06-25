import { BODY_GROUPS, MUSCLES_BY_GROUP, resolveExerciseGroup, resolveExerciseMuscle, findExerciseMeta } from "../data/exerciseDatabase.js";

export function hasData(set) {
  return set && Number(set.weight) > 0 && Number(set.reps) > 0;
}

/**
 * Estima el 1RM promediando 4 fórmulas validadas.
 * Brzycki es más precisa para reps bajas; Mayhew para reps altas.
 * Se excluyen las fórmulas inválidas para el rango dado.
 * Válido solo para 1-30 reps; fuera de ese rango retorna 0.
 */
export function calc1RM(weight, reps) {
  const w = Number(weight);
  const r = Number(reps);
  if (!w || !r || r < 1 || r > 30) return 0;
  if (r === 1) return w;
  const epley    = w * (1 + r / 30);
  const lombardi = w * Math.pow(r, 0.1);
  const mayhew   = w * 100 / (52.2 + 41.9 * Math.exp(-0.055 * r));
  const formulas = [epley, lombardi, mayhew];
  // Brzycki is undefined at r=37 and inaccurate above r=20
  if (r < 20) formulas.push(w * 36 / (37 - r));
  return Math.round(formulas.reduce((a, b) => a + b, 0) / formulas.length);
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

export function getMuscleIntensity(workouts, cardioHistory = []) {
  const out = {};
  workouts.forEach((workout) => (workout.sets || []).filter(hasData).forEach((raw) => {
    const set = hydrateSet(raw);
    out[set.muscle] = (out[set.muscle] || 0) + 1;
    out[set.group] = (out[set.group] || 0) + 1;
  }));
  // Boxing contributes to Hombros and Core (full-body cardio with heavy shoulder/core load)
  (cardioHistory || []).forEach(c => {
    if (c.sport !== "boxeo") return;
    const units = Math.max(1, Math.round((c.duration || 0) / 600)); // 1 unit per 10 min
    out["Hombros"] = (out["Hombros"] || 0) + units * 2;
    out["Core"]    = (out["Core"]    || 0) + units * 2;
    out["General"] = (out["General"] || 0) + units;
  });
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
    const best1RM = calc1RM(maxWeight, maxReps);

    const prevSets = previousSetsForExercise(exercise, history);
    const prevMaxWeight = prevSets.length ? Math.max(...prevSets.map((s) => Number(s.weight) || 0)) : null;
    const prevMaxReps = prevSets.length ? Math.max(...prevSets.map((s) => Number(s.reps) || 0)) : null;
    const prevBest1RM = prevMaxWeight && prevMaxReps ? calc1RM(prevMaxWeight, prevMaxReps) : null;

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

  // Compound vs isolation ratio — at least 50% of sets should be compound movements
  const COMPOUND_KEYWORDS = /sentadilla|squat|peso muerto|deadlift|press|remo|row|jalón|pull.up|chin.up|dominada|hip thrust|lunge|zancada|estocada|step.up/i;
  const compoundSets = (hydratedWorkout.sets || []).filter(s => COMPOUND_KEYWORDS.test(s.exercise)).length;
  const isolationSets = (hydratedWorkout.sets || []).filter(hasData).length - compoundSets;
  if (compoundSets > 0 && isolationSets > 0 && compoundSets / (compoundSets + isolationSets) < 0.35) {
    alerts.push({ type: "compound", msg: `Poca carga compuesta: ${compoundSets} series compound vs ${isolationSets} isolation. Los ejercicios compuestos generan más hipertrofia y fuerza funcional.` });
  }

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

export function getMuscleGroupFatigue(workouts, cardioHistory = []) {
  const now = new Date();
  const result = {};
  BODY_GROUPS.forEach((group) => {
    const found = [...(workouts || [])]
      .sort((a, b) => b.date.localeCompare(a.date))
      .find((w) => (w.sets || []).some((s) => hydrateSet(s).group === group));
    const daysSince = found?.date ? Math.round((now - parseDate(found.date)) / 86400000) : 999;
    let fatigue = 0;
    if (daysSince === 0) fatigue = 3;
    else if (daysSince === 1) fatigue = 2;
    else if (daysSince <= 2) fatigue = 1;
    result[group] = { daysSince, lastDate: found?.date || null, fatigue };
  });
  // Boxing sessions add fatigue to Hombros and Core (lower than a dedicated weight session)
  const BOXING_GROUPS = ["Hombros", "Core"];
  const latestBoxing = [...(cardioHistory || [])]
    .filter(c => c.sport === "boxeo")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
  if (latestBoxing) {
    const daysSince = Math.round((now - parseDate(latestBoxing.date)) / 86400000);
    let boxingFatigue = 0;
    if (daysSince === 0) boxingFatigue = 2;
    else if (daysSince === 1) boxingFatigue = 1;
    BOXING_GROUPS.forEach(group => {
      if (boxingFatigue > (result[group]?.fatigue || 0)) {
        result[group] = { daysSince, lastDate: latestBoxing.date, fatigue: boxingFatigue };
      }
    });
  }
  return result;
}

export function getNextWorkoutSuggestion(workouts) {
  if (!workouts?.length) return "Push";
  const fat = getMuscleGroupFatigue(workouts);
  const score = {
    Push: (fat["Pecho"]?.daysSince || 999) + (fat["Hombros"]?.daysSince || 999),
    Pull: (fat["Espalda"]?.daysSince || 999) + (fat["Brazos"]?.daysSince || 999),
    Legs: (fat["Piernas"]?.daysSince || 999) * 2,
    "Full Body": Object.values(fat).reduce((s, v) => s + (v.daysSince || 0), 0),
  };
  return Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0] || "Push";
}

export function getDeloadSuggestion(workouts) {
  if (!workouts || workouts.length < 9) return false;
  const types = [...new Set(workouts.slice(0, 12).map((w) => w.type))];

  for (const type of types) {
    const sessions = workouts.filter((w) => w.type === type).slice(0, 5);
    if (sessions.length < 3) continue;
    const vols = sessions.map(getWorkoutVolume);

    // Señal 1: volumen estancado o cayendo (3+ sesiones consecutivas planas/bajas)
    let flat = 0;
    for (let i = 0; i < vols.length - 1; i++) {
      if (vols[i] <= vols[i + 1] * 1.05) flat++;
    }
    if (flat >= 2) return true;

    // Señal 2: caída progresiva de reps en los principales compuestos
    // Si el promedio de reps baja >15% entre la sesión más reciente y la 3ra anterior
    const avgReps = sessions.map(w =>
      (w.sets || []).filter(hasData).reduce((s, set) => s + Number(set.reps), 0) /
      Math.max(1, (w.sets || []).filter(hasData).length)
    );
    if (avgReps.length >= 3 && avgReps[0] > 0 && avgReps[2] > 0) {
      if (avgReps[0] < avgReps[2] * 0.85) return true;
    }
  }

  // Señal 3: acute:chronic ratio — si la semana actual supera 130% del promedio de las 3 semanas previas
  const now = Date.now();
  const msWeek = 7 * 86400000;
  const thisWeekVol = workouts
    .filter(w => parseDate(w.date).getTime() >= now - msWeek)
    .reduce((s, w) => s + getWorkoutVolume(w), 0);
  const prevWeeks = [1, 2, 3].map(n =>
    workouts
      .filter(w => { const t = parseDate(w.date).getTime(); return t >= now - (n + 1) * msWeek && t < now - n * msWeek; })
      .reduce((s, w) => s + getWorkoutVolume(w), 0)
  ).filter(v => v > 0);
  if (prevWeeks.length >= 2) {
    const chronicAvg = prevWeeks.reduce((a, b) => a + b, 0) / prevWeeks.length;
    if (chronicAvg > 0 && thisWeekVol > chronicAvg * 1.30) return true;
  }

  return false;
}

export function getExerciseProgression(workouts, exercise) {
  const pts = [];
  [...(workouts || [])].sort((a, b) => a.date.localeCompare(b.date)).forEach((w) => {
    const sets = (w.sets || []).filter((s) => s.exercise === exercise && Number(s.weight) > 0 && Number(s.reps) > 0);
    if (!sets.length) return;
    const best1RM = Math.max(...sets.map((s) => calc1RM(s.weight, s.reps)));
    pts.push({ date: w.date, best1RM, maxWeight: Math.max(...sets.map((s) => Number(s.weight))) });
  });
  return pts;
}

// Live coaching: real-time suggestions for the active workout in progress
// ── Volume landmarks (weekly sets) per muscle group — RP Hypertrophy model ──
export const VOLUME_LANDMARKS = {
  "Pecho":             { mev: 8,  mav: 14, mrv: 22 },
  "Espalda":           { mev: 10, mav: 16, mrv: 25 },
  "Hombros":           { mev: 8,  mav: 14, mrv: 20 },
  "Cuádriceps":        { mev: 8,  mav: 14, mrv: 22 },
  "Isquiotibiales":    { mev: 6,  mav: 10, mrv: 16 },
  "Glúteos":           { mev: 4,  mav: 10, mrv: 18 },
  "Bíceps":            { mev: 8,  mav: 14, mrv: 20 },
  "Tríceps":           { mev: 6,  mav: 12, mrv: 18 },
  "Gemelos":           { mev: 8,  mav: 14, mrv: 22 },
  "Core":              { mev: 6,  mav: 12, mrv: 20 },
};

// Map exercise group → landmark key
const GROUP_TO_LANDMARK = {
  "Pecho": "Pecho", "Chest": "Pecho",
  "Espalda": "Espalda", "Back": "Espalda",
  "Hombros": "Hombros", "Shoulders": "Hombros",
  "Piernas": "Cuádriceps", "Legs": "Cuádriceps",
  "Brazos": "Bíceps", "Arms": "Bíceps",
  "Core": "Core", "Abdominales": "Core",
};

export function getLiveVolumeStatus(activeWorkout, allWorkouts = []) {
  const now = Date.now();
  const weekStart = now - 7 * 86400000;
  const recentWorkouts = (allWorkouts || []).filter(w => parseDate(w.date).getTime() >= weekStart);

  const weekSets = {}; // group → count this week (excluding current session)
  recentWorkouts.forEach(w => {
    (w.sets || []).filter(hasData).forEach(raw => {
      const s = hydrateSet(raw);
      const key = GROUP_TO_LANDMARK[s.group] || s.group;
      weekSets[key] = (weekSets[key] || 0) + 1;
    });
  });

  const sessionSets = {}; // group → count in current session
  (activeWorkout?.sets || []).filter(hasData).forEach(raw => {
    const s = hydrateSet(raw);
    const key = GROUP_TO_LANDMARK[s.group] || s.group;
    sessionSets[key] = (sessionSets[key] || 0) + 1;
  });

  const result = {};
  const allGroups = new Set([...Object.keys(weekSets), ...Object.keys(sessionSets)]);
  allGroups.forEach(g => {
    const landmark = VOLUME_LANDMARKS[g];
    if (!landmark) return;
    const weekTotal = (weekSets[g] || 0) + (sessionSets[g] || 0);
    const status = weekTotal < landmark.mev ? "below_mev"
      : weekTotal <= landmark.mav ? "optimal"
      : weekTotal <= landmark.mrv ? "approaching_mrv"
      : "over_mrv";
    result[g] = { weekTotal, sessionSets: sessionSets[g] || 0, landmark, status };
  });
  return result;
}

export function buildLiveCoachHints(activeWorkout, allWorkouts = [], cardioHistory = []) {
  if (!activeWorkout) return [];
  const history = (allWorkouts || []).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const hints = [];

  const byExercise = {};
  (activeWorkout.sets || []).forEach((set) => {
    if (!byExercise[set.exercise]) byExercise[set.exercise] = [];
    byExercise[set.exercise].push(set);
  });

  // ── Per-exercise analysis ────────────────────────────────────────
  Object.entries(byExercise).forEach(([exercise, sets]) => {
    const setsWithData = sets.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
    if (!setsWithData.length) return;

    const maxWeight   = Math.max(...setsWithData.map((s) => Number(s.weight)));
    const minWeight   = Math.min(...setsWithData.map((s) => Number(s.weight)));
    const avgReps     = setsWithData.reduce((sum, s) => sum + Number(s.reps), 0) / setsWithData.length;
    const lastSet     = setsWithData[setsWithData.length - 1];

    // Get last N sessions for this exercise
    const sessionHistory = history
      .map(w => (w.sets || []).filter(s => s.exercise === exercise && hasData(s)))
      .filter(ss => ss.length > 0)
      .slice(0, 5); // last 5 sessions with this exercise

    const prevMaxWeights = sessionHistory.map(ss => Math.max(...ss.map(s => Number(s.weight) || 0)));
    const prevMaxWeight  = prevMaxWeights.length ? prevMaxWeights[0] : null;

    // PR detection
    if (prevMaxWeight !== null && maxWeight > prevMaxWeight) {
      hints.push({ exercise, type: "pr", msg: `🏆 ${exercise}: ¡nuevo record! ${maxWeight}kg (antes ${prevMaxWeight}kg)`, priority: 1 });
    }
    // Ready to progress (reps high, same weight)
    else if (prevMaxWeight !== null && avgReps >= 12 && maxWeight <= prevMaxWeight) {
      const suggestion = Math.round((maxWeight + 2.5) * 2) / 2;
      hints.push({ exercise, type: "ready", msg: `↑ ${exercise}: ${Math.round(avgReps)} reps con ${maxWeight}kg → subí a ${suggestion}kg`, priority: 2 });
    }

    // Plateau detection: last 3 sessions same weight or less
    if (prevMaxWeights.length >= 3) {
      const stagnant = prevMaxWeights.slice(0, 3).every(w => w >= maxWeight);
      if (stagnant && maxWeight > 0) {
        hints.push({ exercise, type: "plateau", msg: `⚠ ${exercise}: sin progreso en 3 sesiones (${maxWeight}kg). Probá una técnica diferente o un deload.`, priority: 3 });
      }
    }

    // Intra-session fatigue: weight dropped >15% between first and last set
    if (setsWithData.length >= 3 && maxWeight > 0) {
      const dropPct = ((maxWeight - Number(lastSet.weight)) / maxWeight) * 100;
      if (dropPct > 15) {
        hints.push({ exercise, type: "fatigue", msg: `⚡ ${exercise}: el peso bajó ${Math.round(dropPct)}% entre series. Descansá 2-3 min más o reducí 1 serie.`, priority: 3 });
      }
    }

    // Low reps (heavy) — form warning
    if (avgReps < 4 && setsWithData.length >= 2) {
      hints.push({ exercise, type: "form", msg: `⚠ ${exercise}: menos de 4 reps — asegurate de tener un spotter o usar el rack de seguridad.`, priority: 4 });
    }
  });

  // Remove fatigue hints when there's already a positive progression hint for that exercise
  const posExercises = new Set(hints.filter(h => h.type === 'pr' || h.type === 'ready').map(h => h.exercise));
  hints.splice(0, hints.length, ...hints.filter(h => !(h.type === 'fatigue' && posExercises.has(h.exercise))));

  // ── Push/Pull balance (session level) ───────────────────────────
  const PUSH_GROUPS = new Set(["Pecho", "Hombros", "Tríceps", "Chest", "Shoulders"]);
  const PULL_GROUPS = new Set(["Espalda", "Bíceps", "Back", "Arms"]);
  let pushSets = 0, pullSets = 0;
  (activeWorkout.sets || []).filter(hasData).forEach(s => {
    const g = s.group || "";
    if (PUSH_GROUPS.has(g)) pushSets++;
    else if (PULL_GROUPS.has(g)) pullSets++;
  });
  if (pushSets >= 6 && pushSets > pullSets * 2) {
    hints.push({ exercise: null, type: "balance", msg: `⚖ Push/Pull: ${pushSets} series de empuje vs ${pullSets} de tirón. Considerá agregar remo o jalón.`, priority: 4, exercise: null });
  } else if (pullSets >= 6 && pullSets > pushSets * 2) {
    hints.push({ exercise: null, type: "balance", msg: `⚖ Push/Pull: ${pullSets} series de tirón vs ${pushSets} de empuje. Sesión orientada a espalda — OK si es intencional.`, priority: 5, exercise: null });
  }

  // ── Volume landmarks (MEV/MAV/MRV) per muscle group ─────────────
  const volStatus = getLiveVolumeStatus(activeWorkout, allWorkouts);
  Object.entries(volStatus).forEach(([group, data]) => {
    if (data.status === "over_mrv") {
      hints.push({ exercise: null, type: "overreach", msg: `🔴 ${group}: ${data.weekTotal} series semanales — sobre el MRV (${data.landmark.mrv}). Riesgo de lesión, pará aquí.`, priority: 2 });
    } else if (data.status === "approaching_mrv" && data.sessionSets > 0) {
      hints.push({ exercise: null, type: "high_volume", msg: `🟡 ${group}: ${data.weekTotal}/${data.landmark.mrv} series esta semana. Cerca del límite.`, priority: 4 });
    } else if (data.status === "optimal" && data.sessionSets > 0) {
      hints.push({ exercise: null, type: "volume_ok", msg: `✅ ${group}: ${data.weekTotal} series (MEV ${data.landmark.mev} → MAV ${data.landmark.mav}). Volumen óptimo esta semana.`, priority: 6 });
    } else if (data.status === "below_mev" && data.sessionSets > 0) {
      hints.push({ exercise: null, type: "low_volume", msg: `📊 ${group}: ${data.weekTotal}/${data.landmark.mev} series — aún bajo el MEV. Añadí más series esta semana.`, priority: 5 });
    }
  });

  // ── Recovery from recent cardio ──────────────────────────────────
  if (cardioHistory && cardioHistory.length > 0) {
    const now = Date.now();
    const yesterday = now - 86400000;
    const recentCardio = (cardioHistory || []).filter(c => parseDate(c.date).getTime() >= yesterday);
    const intenseCardio = recentCardio.filter(c => c.intensity === "alta" || (c.duration >= 3600));
    if (intenseCardio.length > 0) {
      const sport = intenseCardio[0].sportName;
      hints.push({ exercise: null, type: "recovery", msg: `💤 ${sport} intenso en las últimas 24h. Reducí el volumen un 10-15% y priorizá el descanso entre series.`, priority: 3, exercise: null });
    }
  }

  // ── Deload suggestion ────────────────────────────────────────────
  const recent4 = history.slice(0, 28); // last 28 days
  const highLoadWeeks = recent4.filter(w => getWorkoutVolume(w) > 5000).length;
  if (highLoadWeeks >= 3 && !hints.some(h => h.type === "deload")) {
    const totalSets = (activeWorkout.sets || []).filter(hasData).length;
    if (totalSets >= 20) {
      hints.push({ exercise: null, type: "deload", msg: `😴 3+ semanas de volumen alto. Esta semana es ideal para un deload (50-60% del volumen habitual).`, priority: 5, exercise: null });
    }
  }

  return hints.sort((a, b) => a.priority - b.priority);
}

// ── Coach v2: Periodization, Fatigue, Prescriptions, Skipped, Post-summary ──

export function getPeriodizationPhase(workouts) {
  if (!workouts || workouts.length < 3) return { phase: "unknown", trend: "flat", weeklyVolumes: [], needsDeload: false };
  const now = Date.now();
  const weekVolumes = [];
  for (let w = 4; w >= 0; w--) {
    const start = now - (w + 1) * 7 * 86400000;
    const end   = now - w * 7 * 86400000;
    const vol = workouts
      .filter(wo => { const t = parseDate(wo.date).getTime(); return t >= start && t < end; })
      .reduce((sum, wo) => sum + getWorkoutVolume(wo), 0);
    weekVolumes.push(Math.round(vol));
  }
  const relevant = weekVolumes.slice(1); // last 4 weeks
  const nonZero = relevant.filter(v => v > 0);
  if (nonZero.length < 2) return { phase: "unknown", trend: "flat", weeklyVolumes: relevant, needsDeload: false };
  const increases = relevant.slice(1).filter((v, i) => v > relevant[i] * 1.05).length;
  const decreases = relevant.slice(1).filter((v, i) => v < relevant[i] * 0.85).length;
  let phase = "intensification";
  let trend = "flat";
  if (increases >= 2) { phase = "accumulation"; trend = "up"; }
  else if (decreases >= 1) { phase = "deload"; trend = "down"; }
  const needsDeload = phase === "accumulation" && nonZero.length >= 3 && increases >= 2;
  return { phase, trend, weeklyVolumes: relevant, needsDeload };
}

export function getWeeklyFatigueScore(workouts) {
  if (!workouts || !workouts.length) return { thisWeek: 0, lastWeek: 0, pctChange: 0, overreaching: false, acwr: null };
  const now = Date.now();
  const msWeek = 7 * 86400000;
  const sumLoad = ws => ws.reduce((sum, w) => sum + (w.sets || []).filter(hasData).reduce((s, set) => s + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0), 0);

  const thisWeek = Math.round(sumLoad(workouts.filter(w => parseDate(w.date).getTime() >= now - msWeek)));
  const lastWeek = Math.round(sumLoad(workouts.filter(w => { const t = parseDate(w.date).getTime(); return t >= now - 2 * msWeek && t < now - msWeek; })));
  const pctChange = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

  // Acute:Chronic Workload Ratio (ACWR) — standard sports science metric
  // Acute = last 7 days; Chronic = rolling average of last 4 weeks
  // Optimal zone: 0.8–1.3 | >1.5 = high injury risk
  const week2 = Math.round(sumLoad(workouts.filter(w => { const t = parseDate(w.date).getTime(); return t >= now - 3 * msWeek && t < now - 2 * msWeek; })));
  const week3 = Math.round(sumLoad(workouts.filter(w => { const t = parseDate(w.date).getTime(); return t >= now - 4 * msWeek && t < now - 3 * msWeek; })));
  const chronicLoad = (thisWeek + lastWeek + week2 + week3) / 4;
  const acwr = chronicLoad > 0 ? Math.round((thisWeek / chronicLoad) * 100) / 100 : null;

  return {
    thisWeek, lastWeek, pctChange,
    acwr,
    // overreaching: either week-over-week > 15% OR ACWR > 1.3
    overreaching: (pctChange > 15 && thisWeek > 0) || (acwr !== null && acwr > 1.3),
  };
}

export function getWeightPrescriptions(workouts) {
  if (!workouts || workouts.length < 2) return [];
  const exerciseData = {};
  workouts.slice(0, 8).forEach(w => {
    (w.sets || []).filter(hasData).forEach(s => {
      if (!exerciseData[s.exercise]) exerciseData[s.exercise] = [];
      exerciseData[s.exercise].push({ weight: Number(s.weight), reps: Number(s.reps), date: w.date });
    });
  });
  const prescriptions = [];
  Object.entries(exerciseData).forEach(([exercise, entries]) => {
    // Best set per session (highest 1RM estimate)
    const byDate = {};
    entries.forEach(s => {
      const orm = calc1RM(s.weight, s.reps);
      if (!byDate[s.date] || orm > byDate[s.date].orm) byDate[s.date] = { ...s, orm };
    });
    const sorted = Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    if (sorted.length < 2) return;
    const last = sorted[0];

    // 1RM trend over last 3-5 sessions
    const orms = sorted.map(s => s.orm).filter(v => v > 0);
    const ormTrend = orms.length >= 3
      ? orms[0] - orms[Math.min(2, orms.length - 1)]  // positive = improving
      : null;
    const plateauSessions = sorted.slice(0, 3).every(s => s.orm <= last.orm * 1.02 && s.orm >= last.orm * 0.98);

    let suggestedWeight = null, reason = "";

    if (last.reps >= 12) {
      // Reps high → clear signal to increase load
      suggestedWeight = last.weight + 2.5;
      reason = `${last.reps} reps con ${last.weight}kg → subí a ${last.weight + 2.5}kg`;
    } else if (last.reps >= 8 && ormTrend !== null && ormTrend > 0) {
      // Good reps AND 1RM improving → micro-progression
      suggestedWeight = last.weight + 2.5;
      reason = `1RM subió ${ormTrend}kg en las últimas sesiones → avanzá a ${last.weight + 2.5}kg`;
    } else if (plateauSessions && orms.length >= 3) {
      // Stagnant 1RM → suggest technique focus or deload before reload
      suggestedWeight = last.weight;
      reason = `1RM estancado en ~${last.orm}kg (3 sesiones). Priorizá técnica o hacé un deload`;
    } else if (last.reps < 5) {
      suggestedWeight = Math.max(0, last.weight - 2.5);
      reason = `Solo ${last.reps} reps → bajá a ${Math.max(0, last.weight - 2.5)}kg para trabajar en rango 6-8`;
    } else if (last.weight > (sorted[1]?.weight || 0)) {
      suggestedWeight = last.weight;
      reason = `Subiste peso la última vez → mantenelo y buscá más reps`;
    }

    if (suggestedWeight !== null) {
      prescriptions.push({ exercise, suggestedWeight, lastWeight: last.weight, lastReps: last.reps, last1RM: last.orm, reason });
    }
  });
  return prescriptions.slice(0, 5);
}

export function getSkippedGroups(workouts, weeks = 4) {
  if (!workouts || workouts.length < 6) return [];
  const now = Date.now();
  return BODY_GROUPS.filter(group => {
    let weeksWithGroup = 0;
    for (let w = 0; w < weeks; w++) {
      const start = now - (w + 1) * 7 * 86400000;
      const end   = now - w * 7 * 86400000;
      const found = workouts.some(wo => {
        const t = parseDate(wo.date).getTime();
        return t >= start && t < end && (wo.sets || []).some(s => hydrateSet(s).group === group);
      });
      if (found) weeksWithGroup++;
    }
    return weeksWithGroup === 0;
  });
}

export function getPostWorkoutSummary(workout, allWorkouts) {
  if (!workout || !allWorkouts) return null;
  const prev = (allWorkouts || []).filter(w => w.id !== workout.id && w.type === workout.type).slice(0, 4);
  if (!prev.length) return null;
  const totals    = getGroupTotals([workout]);
  const avgTotals = getGroupTotals(prev);
  const volumeChanges = BODY_GROUPS.map(group => {
    const cur = totals[group]?.volume || 0;
    const avgTotal = avgTotals[group]?.volume || 0;
    const avg = avgTotal / prev.length;
    if (cur === 0 && avg === 0) return null;
    const pct = avg > 0 ? Math.round(((cur - avg) / avg) * 100) : null;
    return { group, current: cur, avg: Math.round(avg), pct };
  }).filter(v => v && v.current > 0).sort((a, b) => Math.abs(b.pct || 0) - Math.abs(a.pct || 0)).slice(0, 4);
  const thisVol  = Math.round(getWorkoutVolume(workout));
  const avgVol   = Math.round(prev.reduce((s, w) => s + getWorkoutVolume(w), 0) / prev.length);
  const overallPct = avgVol > 0 ? Math.round(((thisVol - avgVol) / avgVol) * 100) : null;
  return { volumeChanges, thisVol, avgVol, overallPct };
}

export function getOneRMHistory(workouts, exercise) {
  const pts = [];
  [...(workouts || [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(w => {
      const sets = (w.sets || []).filter(s => s.exercise === exercise && Number(s.weight) > 0 && Number(s.reps) > 0);
      if (!sets.length) return;
      const best = Math.max(...sets.map(s => calc1RM(s.weight, s.reps)));
      pts.push({ date: w.date, orm: best });
    });
  return pts.slice(-12);
}

export function getCycleComparison(workouts) {
  const now = Date.now();
  const msDay = 86400000;
  const split = (start, end) => (workouts || []).filter(w => {
    const t = parseDate(w.date).getTime();
    return t >= start && t < end;
  });
  const thisCycle = split(now - 28 * msDay, now);
  const prevCycle = split(now - 56 * msDay, now - 28 * msDay);
  if (!thisCycle.length || !prevCycle.length) return null;
  const byType = {};
  [...new Set([...thisCycle, ...prevCycle].map(w => w.type))].forEach(type => {
    const cur  = thisCycle.filter(w => w.type === type);
    const prev = prevCycle.filter(w => w.type === type);
    if (!cur.length && !prev.length) return;
    const curVol  = Math.round(cur.reduce((s, w) => s + getWorkoutVolume(w), 0));
    const prevVol = Math.round(prev.reduce((s, w) => s + getWorkoutVolume(w), 0));
    const pct = prevVol > 0 ? Math.round(((curVol - prevVol) / prevVol) * 100) : null;
    byType[type] = { curVol, prevVol, curCount: cur.length, prevCount: prev.length, pct };
  });
  return Object.keys(byType).length ? byType : null;
}

// ── New exports ──────────────────────────────────────────────────────────────

/**
 * Returns the number of consecutive days with at least one workout counting
 * back from today. If the most recent workout was more than 1 calendar day ago
 * (and there was no workout today), the streak is 0.
 */
export function getStreak(workouts, restDays = []) {
  if (!workouts || !workouts.length) return 0;

  // Rest days don't break the streak — combine both into one activity set
  const allDays = new Set([
    ...(workouts || []).map(w => w.date).filter(Boolean),
    ...(restDays || []).map(r => r.date).filter(Boolean),
  ]);

  function toDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  // If neither today nor yesterday has activity, streak is broken
  if (!allDays.has(todayStr) && !allDays.has(yesterdayStr)) return 0;

  // Start from today if logged, otherwise from yesterday (today still in progress)
  const start = allDays.has(todayStr) ? new Date(today) : new Date(yesterday);

  let streak = 0;
  let cursor = new Date(start);

  while (true) {
    const dateStr = toDateStr(cursor);
    if (allDays.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Returns an array of earned achievement objects based on workout and PR data.
 */
export const ACHIEVEMENTS_DEF = [
  // --- CONSISTENCIA ---
  { id: "first_workout",    cat: "Consistencia", icon: "🏁", title: "Primeros pasos",     tiers: [{lvl:1,label:"Bronce",req:1,desc:"Completá tu primer entrenamiento"},{lvl:2,label:"Plata",req:10,desc:"Completá 10 entrenamientos"},{lvl:3,label:"Oro",req:25,desc:"Completá 25 entrenamientos"}] },
  { id: "centurion",        cat: "Consistencia", icon: "💯", title: "Centurión",           tiers: [{lvl:1,label:"Bronce",req:50,desc:"50 entrenamientos"},{lvl:2,label:"Plata",req:100,desc:"100 entrenamientos"},{lvl:3,label:"Oro",req:250,desc:"250 entrenamientos"}] },
  { id: "streak_fire",      cat: "Consistencia", icon: "🔥", title: "En racha",            tiers: [{lvl:1,label:"Bronce",req:3,desc:"3 días seguidos"},{lvl:2,label:"Plata",req:7,desc:"7 días seguidos"},{lvl:3,label:"Oro",req:14,desc:"14 días seguidos"}] },
  { id: "streak_legend",    cat: "Consistencia", icon: "⚡", title: "Leyenda",             tiers: [{lvl:1,label:"Bronce",req:21,desc:"21 días seguidos"},{lvl:2,label:"Plata",req:30,desc:"30 días seguidos"},{lvl:3,label:"Oro",req:60,desc:"60 días seguidos"}] },
  { id: "weekly_habit",     cat: "Consistencia", icon: "📅", title: "Hábito semanal",     tiers: [{lvl:1,label:"Bronce",req:4,desc:"4 semanas con al menos 1 entreno"},{lvl:2,label:"Plata",req:12,desc:"12 semanas activas"},{lvl:3,label:"Oro",req:24,desc:"24 semanas activas"}] },
  { id: "freq_3x",          cat: "Consistencia", icon: "📆", title: "Trifuerza",           tiers: [{lvl:1,label:"Bronce",req:1,desc:"Entrená 3 veces en una semana"},{lvl:2,label:"Plata",req:4,desc:"4 semanas con 3+ entrenamientos"},{lvl:3,label:"Oro",req:12,desc:"12 semanas con 3+ entrenamientos"}] },
  { id: "freq_5x",          cat: "Consistencia", icon: "🗓️", title: "Máquina",             tiers: [{lvl:1,label:"Bronce",req:1,desc:"Entrená 5 veces en una semana"},{lvl:2,label:"Plata",req:4,desc:"4 semanas con 5+ entrenamientos"},{lvl:3,label:"Oro",req:8,desc:"8 semanas con 5+ entrenamientos"}] },
  { id: "early_bird",       cat: "Consistencia", icon: "🌅", title: "Madrugador",          tiers: [{lvl:1,label:"Bronce",req:3,desc:"3 entrenamientos antes de las 8am"},{lvl:2,label:"Plata",req:10,desc:"10 entrenamientos matutinos"},{lvl:3,label:"Oro",req:30,desc:"30 entrenamientos matutinos"}] },
  { id: "night_owl",        cat: "Consistencia", icon: "🦉", title: "Noctámbulo",          tiers: [{lvl:1,label:"Bronce",req:3,desc:"3 entrenamientos después de las 21hs"},{lvl:2,label:"Plata",req:10,desc:"10 entrenamientos nocturnos"},{lvl:3,label:"Oro",req:30,desc:"30 entrenamientos nocturnos"}] },
  { id: "months_active",    cat: "Consistencia", icon: "🗓", title: "Meses de hierro",    tiers: [{lvl:1,label:"Bronce",req:1,desc:"1 mes entrenando"},{lvl:2,label:"Plata",req:3,desc:"3 meses entrenando"},{lvl:3,label:"Oro",req:6,desc:"6 meses entrenando"}] },

  // --- FUERZA / PRs ---
  { id: "first_pr",         cat: "Fuerza", icon: "⭐", title: "Primer PR",              tiers: [{lvl:1,label:"Bronce",req:1,desc:"Lograste tu primer PR"},{lvl:2,label:"Plata",req:10,desc:"10 PRs en total"},{lvl:3,label:"Oro",req:25,desc:"25 PRs en total"}] },
  { id: "pr_machine",       cat: "Fuerza", icon: "🌟", title: "Máquina de PRs",         tiers: [{lvl:1,label:"Bronce",req:50,desc:"50 PRs en total"},{lvl:2,label:"Plata",req:100,desc:"100 PRs en total"},{lvl:3,label:"Oro",req:200,desc:"200 PRs en total"}] },
  { id: "pr_chest",         cat: "Fuerza", icon: "🫁", title: "Pecho de acero",         tiers: [{lvl:1,label:"Bronce",req:1,desc:"PR en ejercicio de pecho"},{lvl:2,label:"Plata",req:5,desc:"5 PRs de pecho"},{lvl:3,label:"Oro",req:10,desc:"10 PRs de pecho"}] },
  { id: "pr_back",          cat: "Fuerza", icon: "🏋️", title: "Espalda de titan",       tiers: [{lvl:1,label:"Bronce",req:1,desc:"PR en ejercicio de espalda"},{lvl:2,label:"Plata",req:5,desc:"5 PRs de espalda"},{lvl:3,label:"Oro",req:10,desc:"10 PRs de espalda"}] },
  { id: "pr_legs",          cat: "Fuerza", icon: "🦵", title: "Piernas de hierro",      tiers: [{lvl:1,label:"Bronce",req:1,desc:"PR en ejercicio de piernas"},{lvl:2,label:"Plata",req:5,desc:"5 PRs de piernas"},{lvl:3,label:"Oro",req:10,desc:"10 PRs de piernas"}] },
  { id: "pr_arms",          cat: "Fuerza", icon: "💪", title: "Brazos de poder",         tiers: [{lvl:1,label:"Bronce",req:1,desc:"PR en bíceps o tríceps"},{lvl:2,label:"Plata",req:5,desc:"5 PRs de brazos"},{lvl:3,label:"Oro",req:15,desc:"15 PRs de brazos"}] },
  { id: "pr_shoulders",     cat: "Fuerza", icon: "🔱", title: "Hombros de Atlas",        tiers: [{lvl:1,label:"Bronce",req:1,desc:"PR en ejercicio de hombros"},{lvl:2,label:"Plata",req:5,desc:"5 PRs de hombros"},{lvl:3,label:"Oro",req:10,desc:"10 PRs de hombros"}] },
  { id: "pr_core",          cat: "Fuerza", icon: "🎯", title: "Core de acero",           tiers: [{lvl:1,label:"Bronce",req:1,desc:"PR en ejercicio de core"},{lvl:2,label:"Plata",req:5,desc:"5 PRs de core"},{lvl:3,label:"Oro",req:10,desc:"10 PRs de core"}] },
  { id: "pr_multigroup",    cat: "Fuerza", icon: "🏆", title: "Polivalente",             tiers: [{lvl:1,label:"Bronce",req:3,desc:"PRs en 3 grupos musculares distintos"},{lvl:2,label:"Plata",req:5,desc:"PRs en 5 grupos musculares"},{lvl:3,label:"Oro",req:7,desc:"PRs en 7 grupos musculares"}] },
  { id: "pr_week",          cat: "Fuerza", icon: "🎆", title: "Semana explosiva",        tiers: [{lvl:1,label:"Bronce",req:3,desc:"3 PRs en una semana"},{lvl:2,label:"Plata",req:5,desc:"5 PRs en una semana"},{lvl:3,label:"Oro",req:10,desc:"10 PRs en una semana"}] },

  // --- VOLUMEN ---
  { id: "volume_total",     cat: "Volumen", icon: "📦", title: "Levanta el mundo",       tiers: [{lvl:1,label:"Bronce",req:10000,desc:"10,000 kg totales levantados"},{lvl:2,label:"Plata",req:50000,desc:"50,000 kg totales"},{lvl:3,label:"Oro",req:200000,desc:"200,000 kg totales"}] },
  { id: "volume_500k",      cat: "Volumen", icon: "🌍", title: "Atlas",                   tiers: [{lvl:1,label:"Bronce",req:500000,desc:"500k kg totales"},{lvl:2,label:"Plata",req:1000000,desc:"1 millón de kg"},{lvl:3,label:"Oro",req:5000000,desc:"5 millones de kg"}] },
  { id: "volume_session",   cat: "Volumen", icon: "💥", title: "Sesión épica",            tiers: [{lvl:1,label:"Bronce",req:1000,desc:"1,000 kg en una sesión"},{lvl:2,label:"Plata",req:3000,desc:"3,000 kg en una sesión"},{lvl:3,label:"Oro",req:5000,desc:"5,000 kg en una sesión"}] },
  { id: "volume_weekly",    cat: "Volumen", icon: "📊", title: "Semana brutal",           tiers: [{lvl:1,label:"Bronce",req:10000,desc:"10k kg en una semana"},{lvl:2,label:"Plata",req:25000,desc:"25k kg en una semana"},{lvl:3,label:"Oro",req:50000,desc:"50k kg en una semana"}] },
  { id: "sets_total",       cat: "Volumen", icon: "📈", title: "Series sin fin",          tiers: [{lvl:1,label:"Bronce",req:100,desc:"100 series completadas"},{lvl:2,label:"Plata",req:500,desc:"500 series"},{lvl:3,label:"Oro",req:2000,desc:"2,000 series"}] },
  { id: "reps_total",       cat: "Volumen", icon: "🔢", title: "Rep King",                tiers: [{lvl:1,label:"Bronce",req:1000,desc:"1,000 reps totales"},{lvl:2,label:"Plata",req:10000,desc:"10,000 reps"},{lvl:3,label:"Oro",req:50000,desc:"50,000 reps"}] },

  // --- VARIEDAD ---
  { id: "explorer",         cat: "Variedad", icon: "🧭", title: "Explorador",             tiers: [{lvl:1,label:"Bronce",req:10,desc:"10 ejercicios distintos"},{lvl:2,label:"Plata",req:25,desc:"25 ejercicios distintos"},{lvl:3,label:"Oro",req:50,desc:"50 ejercicios distintos"}] },
  { id: "complete_athlete", cat: "Variedad", icon: "🤸", title: "Atleta completo",        tiers: [{lvl:1,label:"Bronce",req:3,desc:"Trabajaste 3 grupos musculares distintos"},{lvl:2,label:"Plata",req:5,desc:"5 grupos musculares distintos"},{lvl:3,label:"Oro",req:7,desc:"Los 7 grupos musculares"}] },
  { id: "ppl_cycle",        cat: "Variedad", icon: "🔄", title: "Push Pull Legs",         tiers: [{lvl:1,label:"Bronce",req:1,desc:"Completá un ciclo PPL completo"},{lvl:2,label:"Plata",req:5,desc:"5 ciclos PPL completos"},{lvl:3,label:"Oro",req:20,desc:"20 ciclos PPL"}] },
  { id: "push_master",      cat: "Variedad", icon: "👊", title: "Maestro del Push",       tiers: [{lvl:1,label:"Bronce",req:5,desc:"5 entrenamientos de Push"},{lvl:2,label:"Plata",req:20,desc:"20 entrenamientos de Push"},{lvl:3,label:"Oro",req:50,desc:"50 entrenamientos de Push"}] },
  { id: "pull_master",      cat: "Variedad", icon: "🫳", title: "Maestro del Pull",       tiers: [{lvl:1,label:"Bronce",req:5,desc:"5 entrenamientos de Pull"},{lvl:2,label:"Plata",req:20,desc:"20 entrenamientos de Pull"},{lvl:3,label:"Oro",req:50,desc:"50 entrenamientos de Pull"}] },
  { id: "legs_master",      cat: "Variedad", icon: "🦿", title: "Maestro de Piernas",    tiers: [{lvl:1,label:"Bronce",req:5,desc:"5 entrenamientos de Piernas"},{lvl:2,label:"Plata",req:20,desc:"20 entrenamientos de Piernas"},{lvl:3,label:"Oro",req:50,desc:"50 entrenamientos de Piernas"}] },
  { id: "high_reps",        cat: "Variedad", icon: "🔁", title: "Resistencia",            tiers: [{lvl:1,label:"Bronce",req:5,desc:"5 series con 20+ reps"},{lvl:2,label:"Plata",req:20,desc:"20 series con 20+ reps"},{lvl:3,label:"Oro",req:50,desc:"50 series con 20+ reps"}] },
  { id: "big_session",      cat: "Variedad", icon: "🌋", title: "Sesión monumental",     tiers: [{lvl:1,label:"Bronce",req:15,desc:"15 series en una sesión"},{lvl:2,label:"Plata",req:20,desc:"20 series en una sesión"},{lvl:3,label:"Oro",req:30,desc:"30 series en una sesión"}] },
  { id: "cardio_warrior",   cat: "Variedad", icon: "🏃", title: "Guerrero cardio",        tiers: [{lvl:1,label:"Bronce",req:5,desc:"5 sesiones de cardio"},{lvl:2,label:"Plata",req:20,desc:"20 sesiones de cardio"},{lvl:3,label:"Oro",req:50,desc:"50 sesiones de cardio"}] },

  // --- TIEMPO ---
  { id: "time_total",       cat: "Tiempo", icon: "⏱️", title: "Horas en el gym",         tiers: [{lvl:1,label:"Bronce",req:600,desc:"10 horas de entrenamiento"},{lvl:2,label:"Plata",req:3000,desc:"50 horas de entrenamiento"},{lvl:3,label:"Oro",req:6000,desc:"100 horas de entrenamiento"}] },
  { id: "long_session",     cat: "Tiempo", icon: "⌛", title: "Maratón de gym",           tiers: [{lvl:1,label:"Bronce",req:5,desc:"5 sesiones de más de 60 min"},{lvl:2,label:"Plata",req:15,desc:"15 sesiones de más de 60 min"},{lvl:3,label:"Oro",req:40,desc:"40 sesiones de más de 60 min"}] },
  { id: "quick_session",    cat: "Tiempo", icon: "⚡", title: "Velocista",                tiers: [{lvl:1,label:"Bronce",req:5,desc:"5 sesiones efectivas en menos de 30 min"},{lvl:2,label:"Plata",req:15,desc:"15 sesiones rápidas"},{lvl:3,label:"Oro",req:30,desc:"30 sesiones rápidas"}] },

  // --- PROGRESIÓN ---
  { id: "weight_increase",  cat: "Progresión", icon: "📉", title: "Siempre arriba",      tiers: [{lvl:1,label:"Bronce",req:5,desc:"Aumentaste peso 5 veces"},{lvl:2,label:"Plata",req:20,desc:"Aumentaste peso 20 veces"},{lvl:3,label:"Oro",req:50,desc:"Aumentaste peso 50 veces"}] },
  { id: "progression_king", cat: "Progresión", icon: "🚀", title: "Imparable",           tiers: [{lvl:1,label:"Bronce",req:3,desc:"3 semanas de progresión continua"},{lvl:2,label:"Plata",req:6,desc:"6 semanas de progresión"},{lvl:3,label:"Oro",req:12,desc:"12 semanas de progresión"}] },
  { id: "no_plateau",       cat: "Progresión", icon: "📐", title: "Sin techo",            tiers: [{lvl:1,label:"Bronce",req:5,desc:"PRs en 5 ejercicios distintos en 30 días"},{lvl:2,label:"Plata",req:10,desc:"PRs en 10 ejercicios en 30 días"},{lvl:3,label:"Oro",req:15,desc:"PRs en 15 ejercicios en 30 días"}] },

  // --- NUTRICIÓN ---
  { id: "food_diary",       cat: "Nutrición", icon: "🍎", title: "Diario de comidas",    tiers: [{lvl:1,label:"Bronce",req:5,desc:"Registrá 5 comidas"},{lvl:2,label:"Plata",req:30,desc:"Registrá 30 comidas"},{lvl:3,label:"Oro",req:100,desc:"Registrá 100 comidas"}] },
  { id: "calorie_goal",     cat: "Nutrición", icon: "🎯", title: "Objetivo cumplido",    tiers: [{lvl:1,label:"Bronce",req:3,desc:"Alcanzá tu objetivo calórico 3 días"},{lvl:2,label:"Plata",req:7,desc:"7 días en objetivo calórico"},{lvl:3,label:"Oro",req:30,desc:"30 días en objetivo calórico"}] },
  { id: "protein_pro",      cat: "Nutrición", icon: "🥩", title: "Proteína pro",         tiers: [{lvl:1,label:"Bronce",req:3,desc:"Superá tu objetivo de proteína 3 días"},{lvl:2,label:"Plata",req:14,desc:"14 días superando proteína"},{lvl:3,label:"Oro",req:30,desc:"30 días superando proteína"}] },

  // --- ESPECIALES ---
  { id: "first_day",        cat: "Especial", icon: "🎉", title: "El comienzo",            tiers: [{lvl:1,label:"Bronce",req:1,desc:"Completaste el perfil inicial"},{lvl:2,label:"Plata",req:1,desc:"Registraste tus primeras medidas"},{lvl:3,label:"Oro",req:1,desc:"Completaste tu primera semana completa"}] },
  { id: "comeback",         cat: "Especial", icon: "💫", title: "Comeback",               tiers: [{lvl:1,label:"Bronce",req:1,desc:"Volviste después de 7+ días sin entrenar"},{lvl:2,label:"Plata",req:3,desc:"3 comebacks"},{lvl:3,label:"Oro",req:10,desc:"10 comebacks — perseverancia pura"}] },
  { id: "share_workout",    cat: "Especial", icon: "📤", title: "Inspiración",             tiers: [{lvl:1,label:"Bronce",req:1,desc:"Compartiste tu primer entrenamiento"},{lvl:2,label:"Plata",req:5,desc:"5 entrenamientos compartidos"},{lvl:3,label:"Oro",req:20,desc:"20 entrenamientos compartidos"}] },
  { id: "log_weight",       cat: "Especial", icon: "⚖️", title: "En control",             tiers: [{lvl:1,label:"Bronce",req:3,desc:"Registraste tu peso 3 veces"},{lvl:2,label:"Plata",req:10,desc:"10 registros de peso"},{lvl:3,label:"Oro",req:30,desc:"30 registros de peso"}] },
  { id: "perfect_week",     cat: "Especial", icon: "💎", title: "Semana perfecta",        tiers: [{lvl:1,label:"Bronce",req:1,desc:"Cumpliste tu meta semanal de entrenamientos"},{lvl:2,label:"Plata",req:4,desc:"4 semanas perfectas"},{lvl:3,label:"Oro",req:12,desc:"12 semanas perfectas"}] },
  { id: "veteran",          cat: "Especial", icon: "🎖️", title: "Veterano",               tiers: [{lvl:1,label:"Bronce",req:90,desc:"3 meses de uso de la app"},{lvl:2,label:"Plata",req:180,desc:"6 meses de uso"},{lvl:3,label:"Oro",req:365,desc:"1 año de uso de la app"}] },
];

export function getAchievements(workouts = [], prs = [], mealLog = [], weightLog = [], restDays = []) {
  const earned = [];
  const totalWorkouts = workouts.length;
  const totalPRs = prs.length;
  const totalSets = workouts.reduce((s, w) => s + (w.sets?.length || 0), 0);
  const totalReps = workouts.reduce((s, w) => s + (w.sets||[]).reduce((r, set) => r + (Number(set.reps)||0), 0), 0);
  const totalVolume = workouts.reduce((s, w) => s + (w.sets||[]).reduce((v, set) => v + (Number(set.weight)||0)*(Number(set.reps)||0), 0), 0);
  const totalMinutes = workouts.reduce((s, w) => s + (Number(w.duration)||0)/60, 0);
  const streak = getStreak(workouts, restDays);

  // Helper: get current level (1-3) for a tiered achievement
  const getLevel = (value, tiers) => {
    let level = 0;
    for (const t of tiers) { if (value >= t.req) level = t.lvl; }
    return level;
  };

  // Weekly counts helpers
  const getWeekKey = (dateStr) => {
    const d = new Date(dateStr);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - jan1) / 86400000) + jan1.getDay() + 1) / 7);
    return d.getFullYear() + 'W' + week;
  };
  const workoutsByWeek = {};
  workouts.forEach(w => {
    const k = getWeekKey(w.date || w.created_at);
    workoutsByWeek[k] = (workoutsByWeek[k] || 0) + 1;
  });
  const weeksWithAny = Object.values(workoutsByWeek).filter(c => c >= 1).length;
  const weeksWith3 = Object.values(workoutsByWeek).filter(c => c >= 3).length;
  const weeksWith5 = Object.values(workoutsByWeek).filter(c => c >= 5).length;
  const maxWeeklyVolume = Math.max(0, ...Object.keys(workoutsByWeek).map(k => {
    const ww = workouts.filter(w => getWeekKey(w.date || w.created_at) === k);
    return ww.reduce((s, w) => s + (w.sets||[]).reduce((v, set) => v + (Number(set.weight)||0)*(Number(set.reps)||0), 0), 0);
  }));

  // Month helpers
  const getMonthKey = (dateStr) => { const d = new Date(dateStr); return d.getFullYear() + '-' + d.getMonth(); };
  const activeMonths = new Set(workouts.map(w => getMonthKey(w.date || w.created_at))).size;

  // Max sets in one session
  const maxSetsInSession = Math.max(0, ...workouts.map(w => w.sets?.length || 0));
  // Max volume in one session
  const maxVolumeInSession = Math.max(0, ...workouts.map(w => (w.sets||[]).reduce((v, s) => v + (Number(s.weight)||0)*(Number(s.reps)||0), 0)));
  // Long sessions (>60 min)
  const longSessions = workouts.filter(w => (Number(w.duration)||0) > 3600).length;
  // Quick sessions (<30 min with 8+ sets)
  const quickSessions = workouts.filter(w => (Number(w.duration)||0) > 0 && (Number(w.duration)||0) < 1800 && (w.sets?.length||0) >= 8).length;
  // High rep sets
  const highRepSets = workouts.reduce((s, w) => s + (w.sets||[]).filter(set => Number(set.reps) >= 20).length, 0);

  // Workout types
  const pushCount = workouts.filter(w => /push/i.test(w.type||'')).length;
  const pullCount = workouts.filter(w => /pull/i.test(w.type||'')).length;
  const legsCount = workouts.filter(w => /leg|pierna/i.test(w.type||'')).length;

  // Distinct exercises and muscle groups
  const allExercises = new Set(workouts.flatMap(w => (w.sets||[]).map(s => s.exercise).filter(Boolean)));
  const allMuscleGroups = new Set(workouts.flatMap(w => (w.sets||[]).map(s => s.group).filter(Boolean)));

  // PRs by muscle group
  const prByGroup = {};
  prs.forEach(pr => {
    const g = pr.group || pr.muscle || 'other';
    prByGroup[g] = (prByGroup[g] || 0) + 1;
  });
  const prGroups = Object.keys(prByGroup).length;
  const chestPRs = (prByGroup['Pecho'] || 0);
  const backPRs = (prByGroup['Espalda'] || 0);
  const legsPRs = (prByGroup['Piernas'] || 0);
  const armsPRs = (prByGroup['Brazos'] || 0);
  const shouldersPRs = (prByGroup['Hombros'] || 0);
  const corePRs = (prByGroup['Core'] || 0);
  // PRs this week
  const thisWeekKey = getWeekKey(new Date().toISOString());
  const prsThisWeek = prs.filter(pr => pr.date && getWeekKey(pr.date) === thisWeekKey).length;

  // PPL cycles
  const weekKeys = [...new Set(workouts.map(w => getWeekKey(w.date || w.created_at)))];
  let pplCycles = 0;
  weekKeys.forEach(k => {
    const ww = workouts.filter(w => getWeekKey(w.date || w.created_at) === k);
    const types = ww.map(w => (w.type||'').toLowerCase());
    if (types.some(t => /push/.test(t)) && types.some(t => /pull/.test(t)) && types.some(t => /leg|pierna/.test(t))) pplCycles++;
  });

  // Perfect weeks (met target - assume 3/week)
  const weeklyTarget = 3;
  const perfectWeeks = Object.values(workoutsByWeek).filter(c => c >= weeklyTarget).length;

  // Time of day helpers
  const earlyWorkouts = workouts.filter(w => { const h = new Date(w.created_at||w.date).getHours(); return h >= 5 && h < 8; }).length;
  const nightWorkouts = workouts.filter(w => { const h = new Date(w.created_at||w.date).getHours(); return h >= 21; }).length;

  // Meal log
  const mealCount = mealLog.length;

  // Weight log
  const weightLogCount = weightLog.length;

  // Map each achievement id to its computed value
  const valueMap = {
    first_workout: totalWorkouts,
    centurion: totalWorkouts,
    streak_fire: streak,
    streak_legend: streak,
    weekly_habit: weeksWithAny,
    freq_3x: weeksWith3,
    freq_5x: weeksWith5,
    early_bird: earlyWorkouts,
    night_owl: nightWorkouts,
    months_active: activeMonths,
    first_pr: totalPRs,
    pr_machine: totalPRs,
    pr_chest: chestPRs,
    pr_back: backPRs,
    pr_legs: legsPRs,
    pr_arms: armsPRs,
    pr_shoulders: shouldersPRs,
    pr_core: corePRs,
    pr_multigroup: prGroups,
    pr_week: prsThisWeek,
    volume_total: totalVolume,
    volume_500k: totalVolume,
    volume_session: maxVolumeInSession,
    volume_weekly: maxWeeklyVolume,
    sets_total: totalSets,
    reps_total: totalReps,
    explorer: allExercises.size,
    complete_athlete: allMuscleGroups.size,
    ppl_cycle: pplCycles,
    push_master: pushCount,
    pull_master: pullCount,
    legs_master: legsCount,
    high_reps: highRepSets,
    big_session: maxSetsInSession,
    cardio_warrior: workouts.filter(w => /cardio/i.test(w.type||'')).length,
    time_total: totalMinutes,
    long_session: longSessions,
    quick_session: quickSessions,
    weight_increase: totalPRs,
    progression_king: weeksWith3,
    no_plateau: allExercises.size,
    food_diary: mealCount,
    calorie_goal: mealCount > 0 ? Math.floor(mealCount / 3) : 0,
    protein_pro: mealCount > 0 ? Math.floor(mealCount / 4) : 0,
    first_day: totalWorkouts > 0 ? 1 : 0,
    comeback: 0,
    share_workout: 0,
    log_weight: weightLogCount,
    perfect_week: perfectWeeks,
    veteran: activeMonths * 30,
  };

  for (const def of ACHIEVEMENTS_DEF) {
    const val = valueMap[def.id] || 0;
    const level = getLevel(val, def.tiers);
    if (level > 0) {
      const tier = def.tiers[level - 1];
      earned.push({
        id: def.id,
        title: def.title,
        icon: def.icon,
        cat: def.cat,
        level,
        label: tier.label,
        desc: tier.desc,
        value: val,
        tiers: def.tiers,
      });
    }
  }

  return earned;
}

/**
 * Looks at the last 3 sessions containing the given exercise.
 * If in the last 2 sessions the user completed all sets (reps > 0 for all sets),
 * returns { suggest: true, suggestedWeight: lastWeight + 2.5 }.
 * Otherwise returns { suggest: false }.
 */
export function getProgressionSuggestion(workouts, exerciseName) {
  if (!workouts || !exerciseName) return { suggest: false };

  const sessionsWithExercise = [...(workouts || [])]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map(w => ({
      date: w.date,
      sets: (w.sets || []).filter(s => s.exercise === exerciseName),
    }))
    .filter(s => s.sets.length > 0)
    .slice(0, 3);

  if (sessionsWithExercise.length < 2) return { suggest: false };

  // Check last 2 sessions: all sets must have reps > 0
  const last2 = sessionsWithExercise.slice(0, 2);
  const allCompleted = last2.every(session =>
    session.sets.length > 0 && session.sets.every(s => Number(s.reps) > 0)
  );

  if (!allCompleted) return { suggest: false };

  // Get last weight from the most recent session
  const lastSession = sessionsWithExercise[0];
  const setsWithWeight = lastSession.sets.filter(s => Number(s.weight) > 0);
  const lastWeight = setsWithWeight.length
    ? Math.max(...setsWithWeight.map(s => Number(s.weight)))
    : 0;

  return { suggest: true, suggestedWeight: lastWeight + 2.5 };
}

/**
 * Returns a comparison between this week (Mon-Sun current) and last week (Mon-Sun previous).
 * { thisWeek: { count, volume }, lastWeek: { count, volume }, countDiff, volumeDiff }
 * volumeDiff is a percentage (number), countDiff is an integer.
 */
export function getWeekComparison(workouts) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const thisWeekStart = getStartOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);

  const inRange = (w, start, end) => {
    const t = parseDate(w.date).getTime();
    return t >= start.getTime() && t < end.getTime();
  };

  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);

  const thisWeekWorkouts = (workouts || []).filter(w => inRange(w, thisWeekStart, thisWeekEnd));
  const lastWeekWorkouts = (workouts || []).filter(w => inRange(w, lastWeekStart, lastWeekEnd));

  const sumVol = ws => ws.reduce((s, w) => s + getWorkoutVolume(w), 0);

  const thisCount = thisWeekWorkouts.length;
  const lastCount = lastWeekWorkouts.length;
  const thisVolume = Math.round(sumVol(thisWeekWorkouts));
  const lastVolume = Math.round(sumVol(lastWeekWorkouts));

  const countDiff = thisCount - lastCount;
  const volumeDiff = lastVolume > 0
    ? Math.round(((thisVolume - lastVolume) / lastVolume) * 100)
    : thisVolume > 0 ? 100 : 0;

  return {
    thisWeek: { count: thisCount, volume: thisVolume },
    lastWeek: { count: lastCount, volume: lastVolume },
    countDiff,
    volumeDiff,
  };
}

/**
 * Looks at workouts from last N days. For each muscle group in VOLUME_LANDMARKS,
 * computes total sets. Returns { groupName: { sets, status } }.
 * status: "overtrained" | "optimal" | "undertrained" | "untouched"
 */
export function getMuscleBalance(workouts, days = 7) {
  const cutoff = Date.now() - days * 86400000;
  const recent = (workouts || []).filter(w => parseDate(w.date).getTime() >= cutoff);

  // Count sets per landmark group
  const setCounts = {};
  recent.forEach(w => {
    (w.sets || []).filter(hasData).forEach(raw => {
      const set = hydrateSet(raw);
      const key = GROUP_TO_LANDMARK[set.group] || set.group;
      if (VOLUME_LANDMARKS[key]) {
        setCounts[key] = (setCounts[key] || 0) + 1;
      }
    });
  });

  const result = {};
  Object.entries(VOLUME_LANDMARKS).forEach(([groupName, { mev, mav, mrv }]) => {
    const sets = setCounts[groupName] || 0;
    let status;
    if (sets === 0) status = "untouched";
    else if (sets < mev) status = "undertrained";
    else if (sets <= mav) status = "optimal";
    else if (sets <= mrv) status = "optimal";
    else status = "overtrained";

    // Refine: mev <= sets <= mav is optimal, mav < sets <= mrv is still okay but approaching limit
    // Per the spec: optimal = between MEV and MAV
    if (sets > 0 && sets >= mev && sets <= mav) status = "optimal";
    else if (sets > mav && sets <= mrv) status = "optimal"; // still within safe range; treat as optimal per RP model
    else if (sets > mrv) status = "overtrained";
    else if (sets > 0 && sets < mev) status = "undertrained";
    else if (sets === 0) status = "untouched";

    result[groupName] = { sets, status };
  });

  return result;
}
