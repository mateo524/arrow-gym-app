import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import { hasData, getExerciseProgression, getRadarData, filterByRange, RANGE_OPTIONS } from "../lib/analytics.js";
import RadarChart from "../components/RadarChart.jsx";
import MicroLineChart from "../components/MicroLineChart.jsx";
import MuscleMap from "../components/MuscleMap.jsx";
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
  const [tab, setTab]   = useState("stats");
  const [search, setSearch] = useState("");
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [radarRange, setRadarRange] = useState("4w");

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

  /* ── weekly muscle coverage ──────────────────────────── */
  const weeklyMuscles = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const wkStr = weekAgo.toISOString().slice(0, 10);
    const muscles = new Set(), groups = new Set();
    for (const w of workouts || []) {
      if (w.date < wkStr) continue;
      for (const s of (w.sets || [])) {
        if (s.muscle) muscles.add(s.muscle);
        if (s.group)  groups.add(s.group);
      }
    }
    return { muscles: [...muscles], groups: [...groups] };
  }, [workouts]);

  const TABS = [{ id: "stats", label: "Estadísticas" }, { id: "prs", label: "Récords" }];

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
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--line)", marginBottom:16, gap:0 }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, padding:"10px 4px", background:"none", border:"none",
            borderBottom: tab === id ? "2px solid var(--green)" : "2px solid transparent",
            color: tab === id ? "var(--green)" : "var(--muted)",
            fontSize:13, fontWeight:700, cursor:"pointer",
          }}>{label}</button>
        ))}
      </div>

      {/* ── STATS TAB ─────────────────────────────────────── */}
      {tab === "stats" && (
        <>
          {/* Radar chart — MAIN FEATURE */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <h2 style={{ margin:0, fontSize:15, fontWeight:800 }}>Cobertura muscular</h2>
              <div style={{ display:"flex", gap:4 }}>
                {RADAR_RANGES.map(r => (
                  <button key={r.id} onClick={() => setRadarRange(r.id)} style={{
                    padding:"4px 10px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
                    background: radarRange === r.id ? "var(--green)" : "var(--panel2)",
                    color: radarRange === r.id ? "#000" : "var(--muted)",
                  }}>{r.label}</button>
                ))}
              </div>
            </div>
            {radarWorkouts.length === 0 ? (
              <p style={{ fontSize:12, color:"var(--muted)", textAlign:"center", padding:"20px 0" }}>
                Sin datos para este período.
              </p>
            ) : (
              <div style={{ height:220 }}>
                <RadarChart data={radarData} />
              </div>
            )}
          </div>

          {/* Big lifetime stats */}
          <div className="progress-stats-grid">
            <div className="progress-stat-card" style={{ gridColumn:"span 2" }}>
              <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>
                Volumen total levantado
              </div>
              <div style={{ fontSize:40, fontWeight:900, color:"var(--green)", lineHeight:1 }}>
                {fmtVol(Math.round(totals.volume))}<span style={{ fontSize:20, fontWeight:600 }}> kg</span>
              </div>
            </div>
            {[
              { label:"Entrenamientos", value: totals.workouts, icon:"Dumbbell" },
              { label:"Series totales",  value: fmtVol(totals.sets),  icon:"List" },
              { label:"Repeticiones",   value: fmtVol(totals.reps),  icon:"RotateCcw" },
              { label:"Récords (1RM)",  value: prs.length,           icon:"Trophy" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="progress-stat-card">
                <Icon name={icon} size={18} strokeWidth={1.8} style={{ color:"var(--muted)", marginBottom:6 }} />
                <div style={{ fontSize:24, fontWeight:900, color:"var(--green)" }}>{value}</div>
                <div style={{ fontSize:11, color:"var(--muted)", fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Weekly muscle map */}
          <div className="card" style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <h2 style={{ margin:0, fontSize:14 }}>Músculos trabajados esta semana</h2>
              <span style={{ fontSize:20, fontWeight:900, color:"var(--cyan)" }}>
                {weeklyMuscles.groups.length > 0 ? Math.min(100, Math.round(weeklyMuscles.groups.length * 100 / 7)) + "%" : "0%"}
              </span>
            </div>
            {weeklyMuscles.muscles.length === 0 ? (
              <p style={{ fontSize:12, color:"var(--muted)", margin:"8px 0 0" }}>
                No registraste entrenamientos esta semana.
              </p>
            ) : (
              <MuscleMap muscles={weeklyMuscles.muscles} groups={weeklyMuscles.groups} height={180} color="var(--cyan)" />
            )}
          </div>

          {/* Navigation cards */}
          {[
            { label:"Historial de entrenamientos", icon:"Clock",      page:"history" },
            { label:"Distribución muscular",        icon:"Activity",   page:null,     action:() => setTab("prs") },
            { label:"Mediciones corporales",        icon:"Ruler",      page:"profile" },
            { label:"Coach & Análisis",             icon:"BrainCircuit", page:"coach" },
          ].map(({ label, icon, page, action }) => (
            <button key={label} className="progress-nav-item" onClick={() => action ? action() : page && setPage(page)}>
              <span style={{ width:36, height:36, borderRadius:10, background:"rgba(168,85,247,.1)", display:"grid", placeItems:"center", flexShrink:0 }}>
                <Icon name={icon} size={18} strokeWidth={2} style={{ color:"var(--green)" }} />
              </span>
              <span style={{ flex:1, fontSize:14, fontWeight:600 }}>{label}</span>
              <Icon name="ChevronRight" size={18} strokeWidth={2} style={{ color:"var(--muted)" }} />
            </button>
          ))}
        </>
      )}

      {/* ── PRS TAB ───────────────────────────────────────── */}
      {tab === "prs" && (
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
      )}
    </section>
  );
}

