import { useMemo } from "react";
import { todayLocal } from "../lib/dates.js";
import { weekStartKey, workoutsByWeek } from "../lib/streak.js";

const card = { background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, padding: "16px", marginBottom: 14 };

function daysBetween(fromKey, toKey) {
  const a = new Date(`${fromKey}T12:00:00`);
  const b = new Date(`${toKey}T12:00:00`);
  return Math.round((b - a) / 86400000);
}

/** Resumen del Coach para la vista Básica: tu semana, tu último entrenamiento y un consejo en palabras simples. */
export default function BasicCoachSummary({ workouts, goal, quiet, onStart }) {
  const today = todayLocal();
  const data = useMemo(() => {
    const byWeek = workoutsByWeek(workouts);
    const thisWeek = byWeek[weekStartKey(today)] || 0;
    const last = (workouts || []).find((w) => w?.date);
    const days = last ? daysBetween(String(last.date).slice(0, 10), today) : null;
    return { thisWeek, last, days };
  }, [workouts, today]);

  const remaining = Math.max(0, goal - data.thisWeek);
  const tip = quiet
    ? "Estás en pausa: descansá tranquilo. Cuando vuelvas, empezá suave."
    : data.days === null ? "Cuando entrenes por primera vez, acá vas a ver cómo te va."
    : data.days === 0 ? "Entrenaste hoy. Ahora a descansar, tomar agua y comer bien."
    : data.days <= 2 ? "Vas bien. Entrená de nuevo cuando sientas que descansaste."
    : "Pasaron unos días. Un entrenamiento cortito hoy ya cuenta y te ayuda a retomar.";

  return (
    <>
      <div style={card}>
        <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Tu semana</p>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "var(--green)", lineHeight: 1.1 }}>
          {data.thisWeek} <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>de {goal} entrenamientos</span>
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted)" }}>
          {remaining === 0 ? "¡Cumpliste tu meta de la semana!" : `Te ${remaining === 1 ? "falta 1" : `faltan ${remaining}`} para tu meta.`}
        </p>
      </div>

      {data.last && (
        <div style={card}>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Tu último entrenamiento</p>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{data.last.type || "Entrenamiento"}</p>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--muted)" }}>
            {data.days === 0 ? "Hoy" : data.days === 1 ? "Ayer" : `Hace ${data.days} días`} · {(data.last.sets || []).filter((s) => Number(s.reps) > 0).length} series
          </p>
        </div>
      )}

      <div style={{ ...card, border: "1px solid rgba(168,85,247,.3)", background: "rgba(168,85,247,.06)" }}>
        <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Consejo de hoy</p>
        <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.5 }}>{tip}</p>
        {!quiet && <button className="primary" style={{ width: "100%", padding: "12px", fontSize: 15 }} onClick={onStart}>Empezar entrenamiento</button>}
      </div>
    </>
  );
}
