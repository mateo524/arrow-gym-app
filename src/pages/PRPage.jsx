import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import { hasData } from "../lib/analytics.js";

function getAllTimePRs(workouts) {
  const prMap = {};
  const sorted = [...(workouts || [])].sort((a,b) => a.date.localeCompare(b.date));
  for (const w of sorted) {
    for (const s of (w.sets || []).filter(hasData)) {
      const oneRM = Math.round(Number(s.weight) * (1 + Number(s.reps) / 30));
      const prev = prMap[s.exercise];
      if (!prev || oneRM > prev.oneRM) {
        prMap[s.exercise] = {
          exercise: s.exercise,
          weight: Number(s.weight),
          reps: Number(s.reps),
          oneRM,
          date: w.date,
          group: s.group || s.muscle || "",
        };
      }
    }
  }
  return Object.values(prMap).sort((a,b) => b.oneRM - a.oneRM);
}

export default function PRPage() {
  const workouts = useStore((s) => s.workouts);
  const [search, setSearch] = useState("");
  const prs = useMemo(() => getAllTimePRs(workouts), [workouts]);
  const filtered = search
    ? prs.filter((p) => p.exercise.toLowerCase().includes(search.toLowerCase()))
    : prs;

  return (
    <section className="page">
      <p className="eyebrow">Récords</p>
      <h1>Personales</h1>

      {prs.length === 0 ? (
        <div className="notice" style={{ textAlign: "center", padding: "32px 20px", marginTop: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <b>Sin récords todavía</b>
          <p>Completá entrenamientos con peso y reps para ver tus PRs acá.</p>
        </div>
      ) : (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicio…"
            style={{
              width: "100%", background: "#0b1518", border: "1px solid #1b2d31",
              borderRadius: 14, padding: "12px 14px", color: "var(--text)",
              fontSize: 15, marginBottom: 14,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((pr, i) => (
              <div key={pr.exercise} className={`pr-row${i === 0 ? " pr-row-gold" : ""}`}>
                <div className="pr-rank">{i === 0 ? "🥇" : `#${i + 1}`}</div>
                <div className="pr-info">
                  <b>{pr.exercise}</b>
                  <small>{pr.group} · {pr.date}</small>
                </div>
                <div className="pr-stats">
                  <span className="pr-main">{pr.weight}kg × {pr.reps}</span>
                  <small>1RM ~{pr.oneRM}kg</small>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
