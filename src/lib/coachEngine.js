import { getGroupTotals, getWorkoutVolume, hydrateSet, getSetVolume } from "./analytics.js";

function getLatestBodyMetric(bodyMetrics) {
  if (!bodyMetrics || bodyMetrics.length === 0) return null;
  return [...bodyMetrics].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
}

function getBodyMetricTrend(bodyMetrics, field, range = 30) {
  const sorted = [...bodyMetrics]
    .filter((m) => m[field] != null)
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
  const recent = range ? sorted.slice(-range) : sorted;
  if (recent.length < 2) return { values: recent, direction: "stable", change: 0, first: recent[0]?.[field] ?? 0, last: recent[recent.length - 1]?.[field] ?? 0 };
  const firstVal = recent[0][field];
  const lastVal = recent[recent.length - 1][field];
  const change = lastVal - firstVal;
  return { values: recent, direction: change > 0.5 ? "up" : change < -0.5 ? "down" : "stable", change: Math.abs(change), first: firstVal, last: lastVal };
}

function analyzeBodyMetrics(bodyMetrics, latestWorkout, workouts) {
  const insights = [];
  if (!bodyMetrics || bodyMetrics.length === 0) {
    insights.push("Todavía no cargaste mediciones corporales. Empezá registrando peso y cintura.");
    return insights;
  }
  const latest = getLatestBodyMetric(bodyMetrics);
  if (!latest) return insights;
  const wt = getBodyMetricTrend(bodyMetrics, "bodyWeight");
  const wa = getBodyMetricTrend(bodyMetrics, "waist");
  const hasStrengthData = latestWorkout && latestWorkout.sets && latestWorkout.sets.length > 0;
  const strengthUp = hasStrengthData && latestWorkout.sets.some((s) => Number(s.weight) > 0);

  if (wt.direction === "stable" && wa.direction === "down") {
    insights.push("Peso estable y cintura bajando: posible recomposición positiva. Seguí así.");
  } else if (wt.direction === "stable" && strengthUp) {
    insights.push("Peso estable pero fuerza subiendo: progreso posible. No te guíes solo por la balanza.");
  } else if (wt.direction === "up" && (wa.direction === "stable" || wa.direction === "down")) {
    insights.push("Subió peso pero cintura no aumentó: posible ganancia muscular.");
  } else if (wt.direction === "down" && wt.change > 3 && bodyMetrics.length >= 3) {
    insights.push("El peso bajó más de 3kg en poco tiempo. Revisá que no sea un déficit agresivo que comprometa músculo.");
  } else if (wa.direction === "up" && bodyMetrics.filter((m) => m.waist != null).length >= 3) {
    insights.push("Cintura subiendo en las últimas mediciones. Revisá pasos diarios, sueño, estrés y consistencia nutricional.");
  }
  if (wa.direction === "down" && strengthUp) {
    insights.push("Cintura bajando y fuerza subiendo: progreso excelente. Esto es mucho más importante que el peso.");
  }
  if (latest.rightArm != null && latest.leftArm != null) {
    const diff = Math.abs(latest.rightArm - latest.leftArm);
    if (diff > 1.5) {
      insights.push(`Diferencia de ${diff.toFixed(1)}cm entre brazos. Sumá trabajo unilateral controlado unos minutos al final.`);
    }
  }
  if (latest.rightLeg != null && latest.leftLeg != null) {
    const diff = Math.abs(latest.rightLeg - latest.leftLeg);
    if (diff > 1.5) {
      insights.push(`Diferencia de ${diff.toFixed(1)}cm entre piernas. Priorizá trabajo unilateral en la pierna más débil.`);
    }
  }
  return insights;
}

function analyzeTraining(workouts, latestWorkout) {
  const insights = [];
  if (!workouts || workouts.length === 0) return insights;
  const recents = workouts.slice(0, 10);
  const pushCount = recents.filter((w) => ["Push", "Full Body"].includes(w.type)).length;
  const pullCount = recents.filter((w) => ["Pull", "Full Body"].includes(w.type)).length;
  const legCount = recents.filter((w) => w.type === "Legs").length;
  const coreCount = recents.filter((w) => {
    if (w.type === "Full Body") return true;
    return (w.sets || []).some((s) => {
      const h = hydrateSet(s);
      return h.group === "Core";
    });
  }).length;

  if (pushCount > pullCount + 2) {
    insights.push("Hay más sesiones de empuje que de tirón. Priorizá espalda y Face Pull la próxima semana.");
  }
  if (pullCount > pushCount + 2) {
    insights.push("Hay más tirón que empuje. No descuides el trabajo de pecho y hombro anterior.");
  }
  if (legCount < 1 && workouts.length > 3) {
    insights.push("No se detectan sesiones de piernas recientes. Incluí al menos un día de piernas por semana.");
  }
  if (coreCount < 2 && workouts.length > 3) {
    insights.push("El core parece infrecuente. Un par de ejercicios al final de cada sesión pueden ayudar.");
  }
  return insights;
}

function analyzeProgression(workouts) {
  const insights = [];
  if (!workouts || workouts.length < 2) return insights;
  const byExercise = {};
  workouts.forEach((w) => {
    (w.sets || []).forEach((s) => {
      if (!byExercise[s.exercise]) byExercise[s.exercise] = [];
      byExercise[s.exercise].push({ date: w.date, weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 });
    });
  });
  Object.entries(byExercise).forEach(([exercise, data]) => {
    if (data.length < 3) return;
    const sorted = data.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const recent = sorted.slice(-3);
    const avgWeight = recent.reduce((s, r) => s + r.weight, 0) / recent.length;
    const avgReps = recent.reduce((s, r) => s + r.reps, 0) / recent.length;
    const first3 = sorted.slice(0, 3);
    const earlyAvgWeight = first3.reduce((s, r) => s + r.weight, 0) / first3.length;
    if (avgWeight > earlyAvgWeight + 2 && avgReps >= 10) {
      insights.push(`${exercise}: la carga subió y mantenés reps. Buen progreso.`);
    }
    if (recent.length >= 3 && recent.every((r) => r.weight === recent[0].weight && r.reps === recent[0].reps)) {
      insights.push(`${exercise}: mismo peso y reps 3 sesiones. Probá subir carga o sumar repeticiones.`);
    }
  });
  if (insights.length > 4) return insights.slice(0, 4);
  return insights;
}

function analyzeShoulder(workouts) {
  const warnings = [];
  if (!workouts || workouts.length === 0) return warnings;
  const recent = workouts.slice(0, 5);
  let pushSets = 0;
  let pullSets = 0;
  let shoulderSets = 0;
  let facePullSets = 0;
  recent.forEach((w) => {
    (w.sets || []).forEach((s) => {
      const h = hydrateSet(s);
      if (h.exercise.toLowerCase().includes("chest") || h.exercise.toLowerCase().includes("press") && h.group === "Hombros") pushSets++;
      if (h.group === "Hombros") shoulderSets++;
      if (h.exercise.toLowerCase().includes("face pull") || h.exercise.toLowerCase().includes("rear delt")) { facePullSets++; pullSets++; }
      if (h.group === "Espalda") pullSets++;
    });
  });
  if (pushSets > pullSets + 6) {
    warnings.push("Hay mucho más empuje que tirón en las últimas sesiones. Agregá más trabajo de espalda y deltoide posterior.");
  }
  if (shoulderSets > 15 && facePullSets < 4) {
    warnings.push("Volumen alto de hombros sin suficiente deltoide posterior. Incluí Face Pull o Rear Delt Fly.");
  }
  const hasLandmine = recent.some((w) => (w.sets || []).some((s) => s.exercise === "Landmine Shoulder Press" && Number(s.weight) >= 30));
  if (hasLandmine) {
    warnings.push("Landmine Shoulder Press cerca del límite. Mantené 30kg o menos y priorizá control.");
  }
  return warnings;
}

function computeNextActions(workouts, bodyMetrics) {
  const actions = [];
  if (!workouts || workouts.length === 0) {
    actions.push("Empezá un entrenamiento desde Inicio.");
    return actions;
  }
  const latest = workouts[0];
  if (!latest) {
    actions.push("Empezá un entrenamiento desde Inicio.");
    return actions;
  }
  const daysSince = Math.floor((Date.now() - new Date(latest.date + "T12:00:00").getTime()) / 86400000);
  if (daysSince > 3) {
    actions.push("Hacé un entrenamiento hoy para mantener consistencia.");
  } else {
    actions.push("Seguí con la siguiente sesión planificada.");
  }
  if (!bodyMetrics || bodyMetrics.length === 0 || daysSince > 7) {
    actions.push("Registrá mediciones corporales (peso y cintura al menos).");
  } else {
    const latestMetric = getLatestBodyMetric(bodyMetrics);
    if (latestMetric) {
      const daysMetric = Math.floor((Date.now() - new Date(latestMetric.date + "T12:00:00").getTime()) / 86400000);
      if (daysMetric > 7) actions.push("Actualizá tus mediciones corporales.");
    }
  }
  return actions;
}

export function buildGlobalCoachReport({ workouts, bodyMetrics, customRoutines, exerciseDatabase, currentWorkout, latestWorkout }) {
  const allWorkouts = workouts || [];
  const allMetrics = bodyMetrics || [];
  const latestW = latestWorkout || allWorkouts[0] || null;

  const bodyInsights = analyzeBodyMetrics(allMetrics, latestW, allWorkouts);
  const trainingInsights = analyzeTraining(allWorkouts, latestW);
  const progressionInsights = analyzeProgression(allWorkouts);
  const shoulderWarnings = analyzeShoulder(allWorkouts);
  const nextActions = computeNextActions(allWorkouts, allMetrics);

  const allAlerts = [];
  if (shoulderWarnings.length > 0) allAlerts.push(...shoulderWarnings.map((w) => ({ type: "shoulder", msg: w })));
  if (trainingInsights.length > 0) allAlerts.push(...trainingInsights.slice(0, 2).map((t) => ({ type: "training", msg: t })));
  if (bodyInsights.length > 0) {
    const criticalInsights = bodyInsights.filter((i) => i.includes("cintura subiendo") || i.includes("déficit agresivo") || i.includes("diferencia"));
    criticalInsights.forEach((i) => allAlerts.push({ type: "body", msg: i }));
  }

  const recommendations = [];
  progressionInsights.slice(0, 2).forEach((p) => recommendations.push({ type: "progression", msg: p }));
  trainingInsights.slice(0, 2).forEach((t) => recommendations.push({ type: "training", msg: t }));
  bodyInsights.slice(0, 2).forEach((b) => recommendations.push({ type: "body", msg: b }));

  const totalSets = allWorkouts.reduce((s, w) => s + (w.sets?.length || 0), 0);
  const totalVolume = allWorkouts.reduce((s, w) => s + getWorkoutVolume(w), 0);
  const lastDate = latestW?.date || "";
  const weeksActive = allWorkouts.length > 0 ? Math.max(1, Math.round((Date.now() - new Date((allWorkouts[allWorkouts.length - 1]?.date || Date.now()) + "T12:00:00").getTime()) / 604800000)) : 0;

  const summary = allWorkouts.length === 0
    ? "No hay datos todavía. Arrancá un entrenamiento."
    : `${allWorkouts.length} entrenamientos · ${totalSets} series · ${Math.round(totalVolume / 1000)}k kg acumulados. ${lastDate ? `Último: ${lastDate}.` : ""} ${weeksActive > 0 ? `${weeksActive} semanas activo.` : ""}`;

  const latestMetric = getLatestBodyMetric(allMetrics);
  const metricSummary = latestMetric
    ? `${latestMetric.bodyWeight ? latestMetric.bodyWeight + "kg" : "—"} · cintura ${latestMetric.waist ? latestMetric.waist + "cm" : "—"} · ${latestMetric.date}`
    : "Sin mediciones";

  return {
    summary,
    metricSummary,
    alerts: allAlerts.slice(0, 5),
    recommendations: recommendations.slice(0, 6),
    trainingInsights: trainingInsights.slice(0, 4),
    bodyInsights: bodyInsights.slice(0, 4),
    progressionInsights: progressionInsights.slice(0, 4),
    shoulderWarnings: shoulderWarnings.slice(0, 3),
    nextActions: nextActions.slice(0, 3),
    totalWorkouts: allWorkouts.length,
    totalSets,
    totalVolume: Math.round(totalVolume),
    lastDate,
    latestMetric,
    generatedAt: new Date().toISOString(),
  };
}
