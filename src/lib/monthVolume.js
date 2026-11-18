// Volumen del mes hasta hoy, comparado con el mes anterior hasta el MISMO día del mes.
// Fechas de los entrenamientos: "YYYY-MM-DD" en hora local (sin pasar por UTC).
const pad = (n) => String(n).padStart(2, "0");

export function setsVolume(workout) {
  return (workout.sets || []).reduce((s, set) => s + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0);
}

/** { current, prev, day, prevLabelDay }: current = del día 1 a hoy; prev = del día 1 al mismo día del mes anterior. */
export function monthToDateVolumes(workouts, today = new Date()) {
  const y = today.getFullYear(), m = today.getMonth(), day = today.getDate();
  const curPrefix = `${y}-${pad(m + 1)}`;
  const prevDate = new Date(y, m - 1, 1);
  const prevPrefix = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}`;
  const prevLastDay = new Date(y, m, 0).getDate();
  const prevDay = Math.min(day, prevLastDay); // el 31 de un mes sin día 31 compara con el último día del anterior
  const inRange = (date, prefix, maxDay) => {
    if (!String(date || "").startsWith(prefix + "-")) return false;
    const d = Number(String(date).slice(8, 10));
    return d >= 1 && d <= maxDay;
  };
  let current = 0, prev = 0;
  for (const w of workouts || []) {
    if (inRange(w.date, curPrefix, day)) current += setsVolume(w);
    else if (inRange(w.date, prevPrefix, prevDay)) prev += setsVolume(w);
  }
  return { current, prev, day, prevDay };
}

export function formatVolume(kg) {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1).replace(".", ",")} k` : `${Math.round(kg).toLocaleString("es-AR")} kg`;
}
