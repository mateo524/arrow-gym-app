import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import { hasData, getExerciseProgression, getRadarData } from "../lib/analytics.js";
import RadarChart from "../components/RadarChart.jsx";
import MicroLineChart from "../components/MicroLineChart.jsx";
import Icon from "../components/Icon.jsx";

function getAllTimePRs(workouts) {
  const prMap = {};
  const sorted = [...(workouts || [])].sort((a,b) => (a.date||"").localeCompare(b.date||""));
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

function fmtVol(kg) {
  if (kg >= 1_000_000) return (kg / 1_000_000).toFixed(1) + "M";
  if (kg >= 1_000) return Math.round(kg / 1000) + "k";
  return String(kg);
}

export default function PRPage() {
  const workouts        = useStore((s) => s.workouts);
  const setPage         = useStore((s) => s.setPage);
  const [search, setSearch] = useState("");
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [radarRange, setRadarRange] = useState("4w");
  const [showStats, setShowStats] = useState(false);

  const prs      = useMemo(() => getAllTimePRs(workouts), [workouts]);
  const filtered = search ? prs.filter((p) => p.exercise.toLowerCase().includes(search.toLowerCase())) : prs;

  /* ── radar data ──────────────────────────────────────── */
  const RADAR_RANGES = [
    { id: "7d",  label: "7d",   days: 7   },
    { id: "4w",  label: "1m",   days: 30  },
    { id: "3m",  label: "3m",   days: 90  },
    { id: "all", label: "Todo", days: null },
  ];
  const radarWorkouts = useMemo(() => {
    const opt = RADAR_RANGES.find(r => r.id === radarRange);
    if (!opt || !opt.days) return workouts || [];
    const min = Date.now() - opt.days * 86400000;
    return (workouts || []).filter(w => new Date(w.date + "T12:00:00").getTime() >= min);
  }, [workouts, radarRange]);
  const radarData = useMemo(() => getRadarData(radarWorkouts), [radarWorkouts]);

  /* ── lifetime totals ─────────────────────────────────── */
  const totals = useMemo(() => {
    let volume = 0, sets = 0, reps = 0;
    for (const w of workouts || []) {
      for (const s of (w.sets || []).filter(hasData)) {
        volume += Number(s.weight) * Number(s.reps);
        sets++;
        reps += Number(s.reps);
      }
    }
    return { volume, sets, reps, workouts: workouts?.length || 0 };
  }, [workouts]);

  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("coach")} aria-label="Volver">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
        <div className="page-head-titles">
          <p className="eyebrow">Coach</p>
          <h1>Progreso</h1>
        </div>
        <button onClick={() => setShowStats(s => !s)} style={{
          background: showStats ? "rgba(168,85,247,.15)" : "var(--panel2)",
          border: showStats ? "1px solid rgba(168,85,247,.4)" : "1px solid var(--line)",
          borderRadius:10, padding:"6px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:5,
          color: showStats ? "var(--green)" : "var(--muted)", fontSize:12, fontWeight:700,
        }}>
          <Icon name="BarChart2" size={15} strokeWidth={2} />
          Stats
        </button>
      </div>

      {/* ── STATS SECTION (collapsible) ─────────────────────── */}
      {showStats && (
        <div style={{ marginBottom:16 }}>
          <div className="card" style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <h2 style={{ margin:0, fontSize:14, fontWeight:800 }}>Cobertura muscular</h2>
              <div style={{ display:"flex", gap:4 }}>
                {RADAR_RANGES.map(r => (
                  <button key={r.id} onClick={() => setRadarRange(r.id)} style={{
                    padding:"3px 8px", borderRadius:20, border:"none", cursor:"pointer", fontSize:10, fontWeight:700,
                    background: radarRange === r.id ? "var(--green)" : "var(--panel2)",
                    color: radarRange === r.id ? "#000" : "var(--muted)",
                  }}>{r.label}</button>
                ))}
              </div>
            </div>
            {radarWorkouts.length === 0 ? (
              <p style={{ fontSize:12, color:"var(--muted)", textAlign:"center", padding:"12px 0" }}>Sin datos para este período.</p>
            ) : (
              <div style={{ height:180 }}><RadarChart data={radarData} /></div>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
            <div style={{ background:"var(--panel)", borderRadius:14, padding:"12px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", marginBottom:2 }}>Volumen</div>
              <div style={{ fontSize:28, fontWeight:900, color:"var(--green)" }}>{fmtVol(Math.round(totals.volume))}<span style={{ fontSize:14 }}> kg</span></div>
            </div>
            <div style={{ background:"var(--panel)", borderRadius:14, padding:"12px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", marginBottom:2 }}>Entrenos</div>
              <div style={{ fontSize:28, fontWeight:900, color:"var(--green)" }}>{totals.workouts}</div>
            </div>
            <div style={{ background:"var(--panel)", borderRadius:14, padding:"12px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", marginBottom:2 }}>Series</div>
              <div style={{ fontSize:28, fontWeight:900, color:"var(--green)" }}>{fmtVol(totals.sets)}</div>
            </div>
            <div style={{ background:"var(--panel)", borderRadius:14, padding:"12px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", marginBottom:2 }}>PRs</div>
              <div style={{ fontSize:28, fontWeight:900, color:"var(--green)" }}>{prs.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRS (always visible) ──────────────────────────── */}
        <>
          {prs.length === 0 ? (
            <div className="notice" style={{ textAlign:"center", padding:"32px 20px" }}>
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
                    <div key={pr.exercise} style={{ borderRadius:14, overflow:"hidden", background:"var(--panel)", border: i === 0 ? "1px solid rgba(201,168,76,.5)" : "1px solid var(--line)" }}>
                      <button
                        onClick={() => setExpandedExercise((prev) => (prev === pr.exercise ? null : pr.exercise))}
                        style={{ width:"100%", display:"flex", alignItems:"center", padding:0, background:"none", border:"none", cursor:"pointer", textAlign:"left" }}
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
                        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, flexShrink:0, color:"var(--muted)", fontSize:18, transform: isExpanded ? "rotate(90deg)" : "none", transition:"transform 0.2s", paddingRight:4 }}>›</span>
                      </button>
                      <div style={{ overflow:"hidden", maxHeight: isExpanded && progression.length >= 2 ? "200px" : "0px", transition:"max-height 0.22s ease-in-out" }}>
                        {isExpanded && progression.length >= 2 && (
                          <div style={{ padding:"12px 14px 14px", background:"var(--panel2)", borderTop:"1px solid var(--line)" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                              <small style={{ color:"var(--muted)", fontSize:11 }}>1RM estimado · {progression.length} sesiones</small>
                              <small style={{ color:"var(--green)", fontWeight:700, fontSize:13 }}>{progression[progression.length - 1]?.best1RM}kg</small>
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
          </>
    </section>
  );
}

