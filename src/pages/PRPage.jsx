import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import { hasData, getExerciseProgression } from "../lib/analytics.js";
import MicroLineChart from "../components/MicroLineChart.jsx";

function getAllTimePRs(workouts) {
  const prMap = {};
  const sorted = [...(workouts || [])].sort((a,b) => a.date.localeCompare(b.date));
  for (const w of sorted) {
    for (const s of (w.sets || []).filter(hasData)) {
      const oneRM = Math.round(Number(s.weight) * (1 + Number(s.reps) / 30));
      const prev = prMap[s.exercise];
      if (!prev || oneRM > prev.oneRM) {
        prMap[s.exercise] = {
          exercise: s.exercise, weight: Number(s.weight), reps: Number(s.reps),
          oneRM, date: w.date, group: s.group || s.muscle || "",
        };
      }
    }
  }
  return Object.values(prMap).sort((a,b) => b.oneRM - a.oneRM);
}

export default function PRPage() {
  const workouts = useStore((s) => s.workouts);
  const [search, setSearch] = useState("");
  const [expandedExercise, setExpandedExercise] = useState(null);
  const prs = useMemo(() => getAllTimePRs(workouts), [workouts]);
  const filtered = search ? prs.filter((p) => p.exercise.toLowerCase().includes(search.toLowerCase())) : prs;

  return (
    <section className="page">
      <p className="eyebrow">Récords</p>
      <h1>Personales</h1>

      {prs.length === 0 ? (
        <div className="notice" style={{ textAlign:"center", padding:"32px 20px", marginTop:20 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🏆</div>
          <b>Sin récords todavía</b>
          <p>Completá entrenamientos con peso y reps para ver tus PRs acá.</p>
        </div>
      ) : (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicio…"
            style={{ width:"100%", background:"#0b1518", border:"1px solid #1b2d31", borderRadius:14, padding:"12px 14px", color:"var(--text)", fontSize:15, marginBottom:14 }}
          />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map((pr, i) => {
              const isExpanded = expandedExercise === pr.exercise;
              const progression = isExpanded ? getExerciseProgression(workouts, pr.exercise) : [];

              return (
                <div key={pr.exercise} style={{ borderRadius:14, overflow:"hidden", background:"var(--panel)", border: i === 0 ? "1px solid var(--gold, #c9a84c)" : "1px solid var(--line)" }}>
                  <button
                    onClick={() => setExpandedExercise((prev) => (prev === pr.exercise ? null : pr.exercise))}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:0, padding:0, background:"none", border:"none", cursor:"pointer", textAlign:"left" }}
                  >
                    <div className={`pr-row${i === 0 ? " pr-row-gold" : ""}`} style={{ flex:1, margin:0, borderRadius:0, border:"none", background:"none" }}>
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
                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, flexShrink:0, color:"var(--muted)", fontSize:18, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition:"transform 0.2s ease", paddingRight:4 }}>
                      ›
                    </span>
                  </button>

                  <div style={{ overflow:"hidden", maxHeight: isExpanded && progression.length >= 2 ? "200px" : "0px", transition:"max-height 0.22s ease-in-out" }}>
                    {isExpanded && progression.length >= 2 && (
                      <div style={{ padding:"12px 14px 14px", background:"var(--panel2)", borderTop:"1px solid var(--line)" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                          <small style={{ color:"var(--muted)", fontSize:11 }}>1RM estimado · últimas {progression.length} sesiones</small>
                          <small style={{ color:"var(--green)", fontWeight:700, fontSize:13 }}>
                            {progression[progression.length - 1]?.best1RM}kg
                          </small>
                        </div>
                        <MicroLineChart data={progression.map(p => ({ value: p.best1RM }))} width={280} height={52} color="var(--green)" />
                        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                          <small style={{ color:"var(--muted)", fontSize:10 }}>{progression[0]?.date}</small>
                          <small style={{ color:"var(--muted)", fontSize:10 }}>{progression[progression.length - 1]?.date}</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
