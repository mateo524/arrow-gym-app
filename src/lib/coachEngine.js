import { getWorkoutVolume, hydrateSet, getExerciseStats } from "./analytics.js";

function getLatestBodyMetric(bodyMetrics) {
  if (!bodyMetrics || bodyMetrics.length === 0) return null;
  return [...bodyMetrics].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
}

function getBodyMetricTrend(bodyMetrics, field, range = 30) {
  const sorted = [...bodyMetrics].filter((m) => m[field] != null).sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
  const recent = range ? sorted.slice(-range) : sorted;
  if (recent.length < 2) return { values: recent, direction: "stable", change: 0, first: recent[0]?.[field] ?? 0, last: recent[recent.length - 1]?.[field] ?? 0 };
  const firstVal = recent[0][field];
  const lastVal = recent[recent.length - 1][field];
  const change = lastVal - firstVal;
  return { values: recent, direction: change > 0.5 ? "up" : change < -0.5 ? "down" : "stable", change: Math.abs(change), first: firstVal, last: lastVal };
}

function analyzeBodyMetrics(bodyMetrics, latestWorkout) {
  const insights = [];
  if (!bodyMetrics || bodyMetrics.length === 0) return insights;
  const latest = getLatestBodyMetric(bodyMetrics);
  if (!latest) return insights;
  const wt = getBodyMetricTrend(bodyMetrics, "bodyWeight");
  const wa = getBodyMetricTrend(bodyMetrics, "waist");
  const chest = getBodyMetricTrend(bodyMetrics, "chest");
  const rArm = getBodyMetricTrend(bodyMetrics, "rightArm");
  const lArm = getBodyMetricTrend(bodyMetrics, "leftArm");
  const hasStrengthData = latestWorkout && latestWorkout.sets && latestWorkout.sets.length > 0;
  const strengthUp = hasStrengthData && latestWorkout.sets.some((s) => Number(s.weight) > 0);

  if (wt.direction === "stable" && wa.direction === "down") insights.push("Peso estable y cintura bajando: posible recomposición positiva. Seguí así.");
  else if (wt.direction === "stable" && strengthUp) insights.push("Peso estable pero fuerza subiendo: progreso posible. No te guíes solo por la balanza.");
  else if (wt.direction === "up" && (wa.direction === "stable" || wa.direction === "down")) insights.push("Subió peso pero cintura no aumentó: posible ganancia muscular.");
  else if (wt.direction === "down" && wt.change > 3 && bodyMetrics.length >= 3) insights.push("El peso bajó más de 3kg en poco tiempo. Revisá que no sea un déficit agresivo que comprometa músculo.");
  else if (wa.direction === "up" && bodyMetrics.filter((m) => m.waist != null).length >= 3) insights.push("Cintura subiendo en las últimas mediciones. Revisá pasos diarios, sueño, estrés y consistencia nutricional.");
  if (wa.direction === "down" && strengthUp) insights.push("Cintura bajando y fuerza subiendo: progreso excelente. Esto es mucho más importante que el peso.");

  if (chest.direction === "up" && chest.change > 1) insights.push(`Pecho en crecimiento (${chest.change.toFixed(1)}cm). Buen indicador de desarrollo de torso.`);
  if (rArm.direction === "up" && lArm.direction === "up") insights.push("Ambos brazos creciendo. Mantené el trabajo unilateral.");
  if (rArm.direction === "up" && lArm.direction === "stable") insights.push("Brazo derecho creciendo pero izquierdo estable. Priorizá más trabajo unilateral del lado rezagado.");

  if (latest.rightArm != null && latest.leftArm != null) {
    const diff = Math.abs(latest.rightArm - latest.leftArm);
    if (diff > 1.5) insights.push(`Diferencia de ${diff.toFixed(1)}cm entre brazos. Sumá trabajo unilateral controlado unos minutos al final.`);
  }
  if (latest.rightLeg != null && latest.leftLeg != null) {
    const diff = Math.abs(latest.rightLeg - latest.leftLeg);
    if (diff > 1.5) insights.push(`Diferencia de ${diff.toFixed(1)}cm entre piernas. Priorizá trabajo unilateral en la pierna más débil.`);
  }
  return insights;
}

function isStrengthWorkout(w) {
  return !["Bicicleta", "Boxeo", "Cardio"].includes(w.type) && (w.sets || []).some((s) => Number(s.weight) > 0 || Number(s.reps) > 0);
}

function isCardioWorkout(w) {
  return ["Bicicleta", "Boxeo", "Cardio"].includes(w.type) || (w.sets || []).every((s) => {
    const h = hydrateSet(s);
    return h.group === "Cardio" || Number(s.weight) === 0;
  });
}

function getCardioMinutes(w) {
  return (w.sets || []).reduce((sum, s) => sum + (Number(s.reps) || 0), 0);
}

function getWeekKey(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function analyzeTraining(workouts) {
  const insights = [];
  if (!workouts || workouts.length === 0) return insights;
  const recents = workouts.slice(0, 20);
  const strengthCount = recents.filter(isStrengthWorkout).length;
  const cardioCount = recents.filter(isCardioWorkout).length;
  const boxingCount = recents.filter((w) => w.type === "Boxeo").length;
  const bikeCount = recents.filter((w) => w.type === "Bicicleta" || (w.sets || []).some((s) => String(s.exercise || "").toLowerCase().includes("bicicleta"))).length;
  const legCount = recents.filter((w) => w.type === "Legs").length;

  let pushSets = 0, pullSets = 0;
  recents.filter(isStrengthWorkout).forEach((w) => {
    (w.sets || []).forEach((s) => {
      const h = hydrateSet(s);
      if (h.group === "Pecho" || h.group === "Hombros" || (h.group === "Brazos" && h.muscle === "Tríceps")) pushSets++;
      if (h.group === "Espalda" || (h.group === "Brazos" && h.muscle === "Bíceps")) pullSets++;
    });
  });
  const ratio = pullSets > 0 ? (pushSets / pullSets).toFixed(1) : "—";

  if (boxingCount > 0) {
    const boxingDays = recents.filter((w) => w.type === "Boxeo").map((w) => {
      const d = new Date(w.date + "T12:00:00");
      return d.toLocaleDateString("es", { weekday: "long" });
    });
    const uniqueDays = [...new Set(boxingDays)];
    const avgMin = Math.round(getCardioMinutes(recents.filter((w) => w.type === "Boxeo")) / boxingCount);
    insights.push(`Boxeo: ${boxingCount} sesiones recientes (${avgMin} min c/u). Días: ${uniqueDays.join(", ")} o similares.`);
    if (boxingCount >= 2 && cardioCount >= 4) {
      insights.push("Buena combinación de boxeo y gym. Mantené 2 sesiones de boxeo por semana para cardio y coordinación.");
    }
  }
  if (bikeCount > 0) {
    const bikeDays = recents.filter((w) => w.type === "Bicicleta").length;
    const bikeMin = recents.filter((w) => w.type === "Bicicleta").reduce((sum, w) => sum + getCardioMinutes(w), 0);
    insights.push(`Bicicleta: ${bikeDays} sesiones · ${bikeMin} min acumulados en bici fija Technogym.`);
    if (bikeDays > 3 && strengthCount > 3) {
      insights.push("Mucha bici + gym. Asegurate de comer suficiente para recuperarte.");
    }
  }

  if (pushSets > 0 || pullSets > 0) {
    if (pushSets > pullSets * 1.5) insights.push(`Empuje vs tirón: ${pushSets}/${pullSets} series (${ratio}:1). Priorizá espalda y Face Pull.`);
    else if (pullSets > pushSets * 1.5) insights.push(`Tirón vs empuje: ${pullSets}/${pushSets} series. No descuides pecho y hombro anterior.`);
    else insights.push(`Balance empuje/tirón equilibrado (${pushSets}/${pullSets} series, ratio ${ratio}:1). Bien.`);
  }

  if (legCount < 1 && strengthCount > 3) {
    insights.push("No se detectan sesiones de piernas recientes. Incluí al menos un día de piernas por semana.");
  }

  const weeksMap = {};
  recents.forEach((w) => {
    const wk = getWeekKey(w.date);
    if (!weeksMap[wk]) weeksMap[wk] = { strength: 0, cardio: 0, boxing: 0, bike: 0, totalMin: 0, days: new Set(), volume: 0 };
    weeksMap[wk].days.add(w.date);
    weeksMap[wk].totalMin += getCardioMinutes(w);
    weeksMap[wk].volume += getWorkoutVolume(w);
    if (isStrengthWorkout(w)) weeksMap[wk].strength++;
    if (isCardioWorkout(w)) weeksMap[wk].cardio++;
    if (w.type === "Boxeo") weeksMap[wk].boxing++;
    if (w.type === "Bicicleta") weeksMap[wk].bike++;
  });
  const weeks = Object.values(weeksMap).slice(-4);
  if (weeks.length >= 2) {
    const avgStrength = Math.round(weeks.reduce((s, wk) => s + wk.strength, 0) / weeks.length);
    const avgCardio = Math.round(weeks.reduce((s, wk) => s + wk.cardio, 0) / weeks.length);
    const avgDays = Math.round(weeks.reduce((s, wk) => s + wk.days.size, 0) / weeks.length);
    insights.push(`Promedio semanal: ${avgStrength} sesiones de fuerza · ${avgCardio} cardio · ${avgDays} días de entrenamiento.`);
    if (avgDays <= 3) insights.push("Entrenás 3 días o menos por semana. Podés sumar un día extra si la recuperación lo permite.");
    if (avgDays >= 6) insights.push("Entrenás casi todos los días. Asegurá al menos 1 día de descanso completo por semana.");

    const volumes = weeks.map((wk) => wk.volume);
    const midIdx = Math.floor(volumes.length / 2);
    const firstHalf = volumes.slice(0, midIdx).reduce((s, v) => s + v, 0) / midIdx;
    const secondHalf = volumes.slice(midIdx).reduce((s, v) => s + v, 0) / (volumes.length - midIdx);
    const volChange = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf * 100).toFixed(0) : 0;
    if (Math.abs(volChange) > 15) {
      if (volChange > 0) insights.push(`Volumen semanal en ascenso (${volChange}%). Buen progreso — monitoreá recuperación.`);
      else insights.push(`Volumen semanal en descenso (${volChange}%). Podría ser fatiga acumulada o falta de tiempo.`);
    }
  }

  const consecutiveWeeks = getConsecutiveTrainingStreak(workouts);
  if (consecutiveWeeks >= 4) insights.push(`Llevás ${consecutiveWeeks} semanas consecutivas entrenando. Buena consistencia.`);
  if (consecutiveWeeks >= 8) insights.push(`${consecutiveWeeks} semanas sin pausa. Considerá una semana de descarga si sentís fatiga.`);

  return insights;
}

function getConsecutiveTrainingStreak(workouts) {
  if (!workouts || workouts.length === 0) return 0;
  const weeks = [...new Set(workouts.map((w) => getWeekKey(w.date)))].sort().reverse();
  let streak = 0;
  const now = getWeekKey(new Date().toISOString().slice(0, 10));
  for (let i = 0; i < weeks.length; i++) {
    const expected = new Date(now + "T12:00:00");
    expected.setDate(expected.getDate() - i * 7);
    const expectedKey = expected.toISOString().slice(0, 10);
    if (weeks[i] === expectedKey) streak++;
    else break;
  }
  return streak;
}

function analyzeProgression(workouts) {
  const insights = [];
  if (!workouts || workouts.length < 2) return insights;
  const strengthWorkouts = workouts.filter(isStrengthWorkout);
  const byExercise = {};
  strengthWorkouts.forEach((w) => {
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
    if (avgWeight > earlyAvgWeight + 2 && avgReps >= 10) insights.push(`${exercise}: la carga subió y mantenés reps. Buen progreso.`);
    if (recent.length >= 3 && recent.every((r) => r.weight === recent[0].weight && r.reps === recent[0].reps)) insights.push(`${exercise}: mismo peso y reps 3 sesiones. Probá subir carga o sumar repeticiones.`);
    if (sorted.length >= 4) {
      const last4 = sorted.slice(-4);
      if (last4.every((r) => r.weight === last4[0].weight && r.reps === last4[0].reps)) insights.push(`${exercise}: estancado 4 sesiones seguidas. Cambiá estímulo: más peso, más reps o variante.`);
    }
  });
  return insights.slice(0, 5);
}

function analyzeShoulder(workouts) {
  const warnings = [];
  if (!workouts || workouts.length === 0) return warnings;
  const recent = workouts.slice(0, 5);
  let pushSets = 0, pullSets = 0, shoulderSets = 0, facePullSets = 0, landmineWeight = 0;
  recent.forEach((w) => {
    (w.sets || []).forEach((s) => {
      const h = hydrateSet(s);
      const ex = h.exercise.toLowerCase();
      if (ex.includes("chest") || (ex.includes("press") && h.group === "Hombros")) pushSets++;
      if (h.group === "Hombros") shoulderSets++;
      if (ex.includes("face pull") || ex.includes("rear delt")) { facePullSets++; pullSets++; }
      if (h.group === "Espalda") pullSets++;
      if (ex === "landmine shoulder press") landmineWeight = Math.max(landmineWeight, Number(s.weight) || 0);
    });
  });
  if (pushSets > pullSets + 6) warnings.push("Hay mucho más empuje que tirón en las últimas sesiones. Agregá más trabajo de espalda y deltoide posterior.");
  if (shoulderSets > 15 && facePullSets < 4) warnings.push("Volumen alto de hombros sin suficiente deltoide posterior. Incluí Face Pull o Rear Delt Fly.");
  if (landmineWeight >= 30) warnings.push("Landmine Shoulder Press cerca del límite. Mantené 30kg o menos y priorizá control.");
  return warnings;
}

function computeNextActions(workouts, bodyMetrics) {
  const actions = [];
  if (!workouts || workouts.length === 0) { actions.push("Empezá un entrenamiento desde Inicio."); return actions; }
  const latest = workouts[0];
  if (!latest) { actions.push("Empezá un entrenamiento desde Inicio."); return actions; }
  const daysSince = Math.floor((Date.now() - new Date(latest.date + "T12:00:00").getTime()) / 86400000);
  const today = new Date().toLocaleDateString("es", { weekday: "long" });
  if (today === "martes" || today === "jueves") {
    const hadBoxing = workouts.slice(0, 7).some((w) => w.type === "Boxeo" && w.date === new Date().toISOString().slice(0, 10));
    if (!hadBoxing) actions.push("Hoy es día de boxeo. No te saltees el entrenamiento de martes/jueves.");
  }
  if (daysSince > 3) {
    actions.push("Hacé un entrenamiento hoy para mantener consistencia.");
  } else {
    actions.push("Seguí con la siguiente sesión planificada.");
  }
  const weekWorkouts = workouts.filter((w) => {
    const wk = getWeekKey(w.date);
    return wk === getWeekKey(new Date().toISOString().slice(0, 10));
  });
  const strengthThisWeek = weekWorkouts.filter(isStrengthWorkout).length;
  const cardioThisWeek = weekWorkouts.filter(isCardioWorkout).length;
  if (strengthThisWeek < 2) actions.push("Sumá al menos una sesión de fuerza más esta semana.");
  if (cardioThisWeek < 2) actions.push("Tratá de hacer 2 sesiones de cardio (bici o boxeo) esta semana.");
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

function computeRecoveryScore(workouts, bodyMetrics) {
  if (!workouts || workouts.length < 3) return { score: 50, label: "Estimado", color: "#8ea0a0" };
  const recents = workouts.slice(0, 14);
  const weekWorkouts = recents.filter((w) => {
    const wk = getWeekKey(w.date);
    return wk === getWeekKey(new Date().toISOString().slice(0, 10));
  });
  const lastWeek = recents.filter((w) => {
    const d = new Date(w.date + "T12:00:00");
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const wk = getWeekKey(d.toISOString().slice(0, 10));
    const target = getWeekKey(lastWeekStart.toISOString().slice(0, 10));
    return wk === target;
  });

  const daysTrainedThisWeek = weekWorkouts.length;
  const volumeThisWeek = weekWorkouts.reduce((s, w) => s + getWorkoutVolume(w), 0);
  const volumeLastWeek = lastWeek.reduce((s, w) => s + getWorkoutVolume(w), 0);

  let score = 70;

  if (daysTrainedThisWeek >= 5) score -= 10;
  else if (daysTrainedThisWeek >= 4) score -= 5;
  else if (daysTrainedThisWeek <= 2) score += 10;

  if (volumeLastWeek > 0) {
    const volChange = ((volumeThisWeek - volumeLastWeek) / volumeLastWeek) * 100;
    if (volChange > 30) score -= 15;
    else if (volChange > 15) score -= 8;
    else if (volChange < -30) score += 5;
  }

  if (bodyMetrics && bodyMetrics.length > 2) {
    const wt = getBodyMetricTrend(bodyMetrics, "bodyWeight");
    if (wt.direction === "down" && wt.change > 2) score -= 10;
  }

  score = Math.max(10, Math.min(100, score));

  let label, color;
  if (score >= 80) { label = "Óptima"; color = "#6df2a4"; }
  else if (score >= 60) { label = "Buena"; color = "#75d9ff"; }
  else if (score >= 40) { label = "Moderada"; color = "#f59e0b"; }
  else { label = "Baja — considerá descanso"; color = "#ff6b6b"; }

  return { score, label, color };
}

function computePRs(workouts, currentWorkout) {
  const prs = [];
  if (!currentWorkout) return prs;
  (currentWorkout.sets || []).forEach((s) => {
    const stats = getExerciseStats(workouts.filter((w) => w.id !== currentWorkout.id), s.exercise);
    const currentVol = (Number(s.weight) || 0) * (Number(s.reps) || 0);
    if (currentVol > 0 && s.weight && s.reps) {
      const prevBestVol = stats.bestVolume || 0;
      const prevBestWeight = Number(stats.bestWeight) || 0;
      if (currentVol > prevBestVol && prevBestVol > 0) prs.push({ exercise: s.exercise, type: "volume", msg: `${s.exercise}: nuevo récord de volumen (${Math.round(currentVol)} kg).` });
      else if (Number(s.weight) > prevBestWeight && prevBestWeight > 0) prs.push({ exercise: s.exercise, type: "weight", msg: `${s.exercise}: nuevo récord de carga (${s.weight} kg).` });
    }
  });
  return prs;
}

function computeDeload(workouts) {
  let deloadSuggestion = null;
  const sortedWorkouts = [...workouts].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (sortedWorkouts.length >= 12) {
    const recent12 = sortedWorkouts.slice(-12);
    const weeksSet = new Set(recent12.map((w) => getWeekKey(w.date)));
    const totalWeeks = weeksSet.size;
    const strengthWeeks = new Set();
    recent12.filter(isStrengthWorkout).forEach((w) => strengthWeeks.add(getWeekKey(w.date)));
    if (totalWeeks >= 6 && strengthWeeks.size >= 6) {
      const lastWeeks = [...weeksSet].sort().slice(-4);
      const allTrained = lastWeeks.every((wk) => recent12.some((w) => getWeekKey(w.date) === wk && isStrengthWorkout(w)));

      const volumes = lastWeeks.map((wk) => {
        const weekWorkouts = recent12.filter((w) => getWeekKey(w.date) === wk);
        return weekWorkouts.reduce((s, w) => s + getWorkoutVolume(w), 0);
      });
      const volDeclining = volumes.length >= 3 && volumes[volumes.length - 1] < volumes[0] * 0.85;

      if (allTrained || volDeclining) {
        deloadSuggestion = allTrained
          ? "Entrenaste todas las semanas seguidas con fuerza. Considerá una semana de descarga (deload): reduce carga al 50-60% o tomá una semana liviana."
          : "El volumen viene bajando las últimas semanas. Podría ser fatiga acumulada. Probá una semana de descarga.";
      }
    }
  }
  return deloadSuggestion;
}

export function buildGlobalCoachReport({ workouts, bodyMetrics, currentWorkout, latestWorkout }) {
  const allWorkouts = workouts || [];
  const allMetrics = bodyMetrics || [];
  const latestW = latestWorkout || allWorkouts[0] || null;
  const bodyInsights = analyzeBodyMetrics(allMetrics, latestW);
  const trainingInsights = analyzeTraining(allWorkouts);
  const progressionInsights = analyzeProgression(allWorkouts);
  const shoulderWarnings = analyzeShoulder(allWorkouts);
  const nextActions = computeNextActions(allWorkouts, allMetrics);
  const recovery = computeRecoveryScore(allWorkouts, allMetrics);
  const prs = computePRs(allWorkouts, currentWorkout);
  const deloadSuggestion = computeDeload(allWorkouts);

  const allAlerts = [];
  if (shoulderWarnings.length > 0) allAlerts.push(...shoulderWarnings.map((w) => ({ type: "shoulder", msg: w })));
  if (trainingInsights.length > 0) allAlerts.push(...trainingInsights.slice(0, 2).map((t) => ({ type: "training", msg: t })));
  if (bodyInsights.length > 0) {
    const criticalInsights = bodyInsights.filter((i) => i.includes("cintura subiendo") || i.includes("déficit agresivo") || i.includes("diferencia"));
    criticalInsights.forEach((i) => allAlerts.push({ type: "body", msg: i }));
  }
  if (recovery.score < 40) allAlerts.push({ type: "recovery", msg: "Score de recuperación bajo. Priorizá sueño, alimentación y descanso." });

  const recommendations = [];
  progressionInsights.slice(0, 2).forEach((p) => recommendations.push({ type: "progression", msg: p }));
  trainingInsights.slice(0, 2).forEach((t) => recommendations.push({ type: "training", msg: t }));
  bodyInsights.slice(0, 2).forEach((b) => recommendations.push({ type: "body", msg: b }));

  if (prs.length > 0) {
    prs.slice(0, 2).forEach((p) => recommendations.push({ type: "pr", msg: p.msg }));
    allAlerts.push(...prs.slice(0, 1).map((p) => ({ type: "pr", msg: p.msg })));
  }
  if (deloadSuggestion) {
    recommendations.push({ type: "deload", msg: deloadSuggestion });
    allAlerts.push({ type: "deload", msg: deloadSuggestion });
  }

  const strengthWorkouts = allWorkouts.filter(isStrengthWorkout);
  const totalSets = allWorkouts.reduce((s, w) => s + (w.sets?.length || 0), 0);
  const totalStrengthVolume = strengthWorkouts.reduce((s, w) => s + getWorkoutVolume(w), 0);
  const totalCardioMin = allWorkouts.reduce((s, w) => s + getCardioMinutes(w), 0);
  const lastDate = latestW?.date || "";
  const weeksActive = allWorkouts.length > 0 ? Math.max(1, Math.round((Date.now() - new Date((allWorkouts[allWorkouts.length - 1]?.date || Date.now()) + "T12:00:00").getTime()) / 604800000)) : 0;

  const summary = allWorkouts.length === 0
    ? "No hay datos todavía. Arrancá un entrenamiento."
    : `${allWorkouts.length} entrenamientos · ${totalSets} series · ${Math.round(totalStrengthVolume / 1000)}k kg acumulados · ${totalCardioMin} min de cardio. ${lastDate ? `Último: ${lastDate}.` : ""} ${weeksActive > 0 ? `${weeksActive} semanas activo.` : ""}`;

  const latestMetric = getLatestBodyMetric(allMetrics);
  const metricSummary = latestMetric
    ? `${latestMetric.bodyWeight ? latestMetric.bodyWeight + "kg" : "—"} · cintura ${latestMetric.waist ? latestMetric.waist + "cm" : "—"} · ${latestMetric.date}`
    : "Sin mediciones";

  const weekWorkouts = allWorkouts.filter((w) => {
    const wk = getWeekKey(w.date);
    return wk === getWeekKey(new Date().toISOString().slice(0, 10));
  });
  const weekStrength = weekWorkouts.filter(isStrengthWorkout).length;
  const weekCardio = weekWorkouts.filter(isCardioWorkout).length;
  const weekBoxing = weekWorkouts.filter((w) => w.type === "Boxeo").length;
  const weekBike = weekWorkouts.filter((w) => w.type === "Bicicleta").length;
  const weekTotalMin = weekWorkouts.reduce((s, w) => s + getCardioMinutes(w), 0);
  const weekDays = [...new Set(weekWorkouts.map((w) => w.date))].length;

  return {
    summary,
    metricSummary,
    recovery,
    prs: prs.slice(0, 3),
    alerts: allAlerts.slice(0, 5),
    recommendations: recommendations.slice(0, 6),
    trainingInsights: trainingInsights.slice(0, 5),
    bodyInsights: bodyInsights.slice(0, 4),
    progressionInsights: progressionInsights.slice(0, 5),
    shoulderWarnings: shoulderWarnings.slice(0, 3),
    nextActions: nextActions.slice(0, 4),
    totalWorkouts: allWorkouts.length,
    totalSets,
    totalVolume: Math.round(totalStrengthVolume),
    totalCardioMinutes: totalCardioMin,
    lastDate,
    latestMetric,
    weekStrength,
    weekCardio,
    weekBoxing,
    weekBike,
    weekTotalMin,
    weekDays,
    generatedAt: new Date().toISOString(),
  };
}
