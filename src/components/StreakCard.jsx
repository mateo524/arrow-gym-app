import { useMemo } from "react";
import { ROUTINES } from "../data/seedData.js";
import { getWeeklyStreak, getLatestPR, getWeightTrend, suggestFirstRoutines } from "../lib/streak.js";

const card = { background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, padding: "14px 16px", marginBottom: 14 };
const label = { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 };

/** Racha semanal + progreso visible (último récord y tendencia de peso de 30 días). */
export default function StreakCard({ workouts, prs, weightLog, goal }) {
  const week = useMemo(() => getWeeklyStreak(workouts, goal), [workouts, goal]);
  const pr = useMemo(() => getLatestPR(prs), [prs]);
  const trend = useMemo(() => getWeightTrend(weightLog), [weightLog]);
  const pct = Math.min(100, Math.round((week.thisWeek / week.goal) * 100));

  return (
    <div style={card} aria-label="Racha semanal">
      <div style={label}>Racha semanal</div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <div>
          <span style={{ fontSize: 28, fontWeight: 900, color: week.streak > 0 ? "#f97316" : "var(--muted)", lineHeight: 1 }}>{week.streak}</span>
          <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>{week.streak === 1 ? "semana seguida" : "semanas seguidas"}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{week.thisWeek}/{week.goal} esta semana</div>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 4, overflow: "hidden", margin: "10px 0 6px" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--green)", borderRadius: 4, transition: "width .6s ease" }} />
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>
        {week.goalReached
          ? "Objetivo cumplido, tu racha sigue viva."
          : week.streak > 0
            ? `Te ${week.remaining === 1 ? "falta 1 entreno" : `faltan ${week.remaining} entrenos`} para sostener la racha.`
            : `${week.remaining === 1 ? "Un entreno" : `${week.remaining} entrenos`} para arrancar una racha.`}
      </div>

      {(pr || trend) && (
        <div style={{ display: "grid", gridTemplateColumns: pr && trend ? "minmax(0,1fr) minmax(0,1fr)" : "1fr", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          {pr && (
            <div>
              <div style={label}>Último récord</div>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.exercise}</div>
              <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>
                {pr.weight ? `${pr.weight} kg` : ""}{pr.reps ? ` x ${pr.reps}` : ""}
              </div>
            </div>
          )}
          {trend && (
            <div>
              <div style={label}>Peso, 30 días</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{trend.from} → {trend.to} kg</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {trend.direction === "flat" ? "Sin cambios" : `${trend.delta > 0 ? "+" : ""}${trend.delta} kg`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** CTA de primer entrenamiento guiado: 3 rutinas sugeridas, arranque en un toque. */
export function FirstWorkoutCta({ goal, level, onStart }) {
  const names = useMemo(() => suggestFirstRoutines(goal, level, Object.keys(ROUTINES)), [goal, level]);
  if (!names.length) return null;
  return (
    <div style={{ ...card, border: "1px solid rgba(34,211,120,.35)", background: "linear-gradient(135deg, rgba(34,211,120,.10), transparent 70%)" }}>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Empezá tu primer entrenamiento</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
        Elegimos estas rutinas para tu objetivo. Tocá una y arrancás.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {names.map((name, i) => (
          <button
            key={name}
            className={i === 0 ? "primary" : "ghost"}
            onClick={() => onStart(name)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 14px", textAlign: "left", width: "100%" }}
          >
            <span style={{ fontWeight: 700 }}>{name}{i === 0 ? " (recomendada)" : ""}</span>
            <span style={{ fontSize: 12, opacity: 0.8 }}>{ROUTINES[name].length} ejercicios · Empezar</span>
          </button>
        ))}
      </div>
    </div>
  );
}
