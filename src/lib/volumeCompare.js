// Comparación de rendimiento de un ejercicio contra la última sesión, por volumen total (kg × reps)
// y no solo por peso: bajar un poco el peso y hacer más reps o series también puede ser progreso.

const num = (v) => Number(v) || 0;

function effWeight(s) {
  return num(s.weight) + num(s.extraWeight);
}

function setVolume(s) {
  const reps = num(s.reps);
  if (reps <= 0) return 0;
  const w = effWeight(s);
  return w > 0 ? w * reps : 0;
}

/**
 * Compara las series cargadas hoy con las mismas primeras N series de la última sesión
 * (así, a mitad de entrenamiento, no parece una caída por tener menos series hechas).
 * Devuelve null si no hay datos suficientes.
 */
export function compareExerciseVolume(todaySets, lastSets) {
  const today = (todaySets || []).filter((s) => num(s.reps) > 0 && effWeight(s) > 0);
  const last = (lastSets || []).filter((s) => num(s.reps) > 0 && effWeight(s) > 0);
  if (!today.length || !last.length) return null;

  const n = today.length;
  const lastSlice = last.slice(0, n);
  const todayVol = Math.round(today.reduce((a, s) => a + setVolume(s), 0));
  const lastVol = Math.round(lastSlice.reduce((a, s) => a + setVolume(s), 0));
  if (lastVol <= 0) return null;

  const pct = Math.round(((todayVol - lastVol) / lastVol) * 100);
  const status = pct > 3 ? "up" : pct < -3 ? "down" : "same";

  const bestToday = Math.max(...today.map(effWeight));
  const bestLast = Math.max(...lastSlice.map(effWeight));
  const weightDown = bestToday < bestLast;
  const totalReps = today.reduce((a, s) => a + num(s.reps), 0);
  const lastReps = lastSlice.reduce((a, s) => a + num(s.reps), 0);

  let message;
  if (status === "up") {
    message = weightDown
      ? "Bajaste el peso pero hiciste más volumen total: es progreso."
      : "Más volumen total que la última vez.";
  } else if (status === "same") {
    message = "Volumen parecido a la última vez.";
  } else {
    message = weightDown || totalReps >= lastReps
      ? "Menos volumen total que la última vez."
      : "Menos volumen total; probá sumar reps o una serie.";
  }
  return { n, today: todayVol, last: lastVol, pct, status, weightDown, message };
}
