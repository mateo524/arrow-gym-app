import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import { hasData, getExerciseProgression } from "../lib/analytics.js";
import MicroLineChart from "../components/MicroLineChart.jsx";
import Icon from "../components/Icon.jsx";

const DASHBOARD_COUNT = 3;

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
          oneRM, date: w.date,
          group: s.group || s.muscle || "",
        };
      }
    }
  }
  return Object.values(prMap).sort((a,b) => b.oneRM - a.oneRM);
}

function getPrevBest(workouts, exercise) {
  let bestWeight = 0, bestReps = 0;
  for (const w of workouts || []) {
    for (const s of (w.sets || []).filter(hasData)) {
      if (s.exercise !== exercise) continue;
      const wgt = Number(s.weight) || 0;
      const rps = Number(s.reps) || 0;
      if (wgt > bestWeight || (wgt === bestWeight && rps > bestReps)) {
        bestWeight = wgt; bestReps = rps;
      }
    }
  }
  return bestWeight > 0 ? { weight: bestWeight, reps: bestReps } : null;
}

function fmtVol(kg) {
  if (kg >= 1_000_000) return (kg / 1_000_000).toFixed(1) + "M";
  if (kg >= 1_000) return Math.round(kg / 1000) + "k";
  return String(kg);
}

function fmtDelta(current, prev) {
  if (!prev || prev.oneRM >= current.oneRM) return null;
  const pct = Math.round(((current.oneRM - prev.oneRM) / prev.oneRM) * 100);
  return { kg: current.weight - prev.weight, pct };
}

function PRCard({ pr, rank, onToggle, isExpanded, progression, delta, compact }) {
  if (compact) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:"var(--panel2)", borderRadius:10, border:"1px solid var(--line)" }}>
        <span style={{ fontSize:10, fontWeight:800, color: rank === 0 ? "#fbbf24" : rank === 1 ? "#94a3b8" : rank === 2 ? "#d97706" : "var(--muted)", minWidth:20, textAlign:"center" }}>
          {rank === 0 ? <Icon name="Trophy" size={12} style={{ color:"#fbbf24" }} /> : rank === 1 ? <Icon name="Award" size={11} style={{ color:"#94a3b8" }} /> : `#${rank+1}`}
        </span>
        <span style={{ flex:1, fontSize:12, fontWeight:600 }}>{pr.exercise}</span>
        <span style={{ fontSize:12, fontWeight:800, color:"var(--cyan)" }}>{pr.weight}kg</span>
        {delta && (
          <span style={{ fontSize:9, fontWeight:700, color:"#22c55e" }}>+{delta.pct}%</span>
        )}
      </div>
    );
  }

  return (
    <div style={{ borderRadius:12, overflow:"hidden", background:"var(--panel)", border: rank === 0 ? "1px solid rgba(251,191,36,.4)" : "1px solid var(--line)" }}>
      <button onClick={onToggle}
        style={{ width:"100%", display:"flex", alignItems:"center", padding:0, background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"8px 10px" }}>
          <span style={{ fontSize:10, fontWeight:800, color: rank === 0 ? "#fbbf24" : rank === 1 ? "#94a3b8" : rank === 2 ? "#d97706" : "var(--muted)", minWidth:22, textAlign:"center" }}>
            {rank === 0 ? <Icon name="Trophy" size={14} style={{ color:"#fbbf24" }} /> : rank === 1 ? <Icon name="Award" size={12} style={{ color:"#94a3b8" }} /> : `#${rank+1}`}
          </span>
          <div style={{ flex:1, minWidth:0, lineHeight:1.3 }}>
            <span style={{ fontSize:13, fontWeight:700 }}>{pr.exercise}</span>
            {pr.group && <span style={{ fontSize:9, color:"var(--muted)", marginLeft:4 }}>{pr.group}</span>}
          </div>
          <div style={{ textAlign:"right", lineHeight:1.4 }}>
            <span style={{ fontSize:13, fontWeight:800, color:"var(--cyan)" }}>{pr.weight}kg × {pr.reps}</span>
            <span style={{ fontSize:9, color:"var(--muted)", marginLeft:4 }}>1RM ~{pr.oneRM}kg</span>
            {delta && (
              <span style={{ fontSize:9, fontWeight:700, color:"#22c55e", marginLeft:4 }}>↑ +{delta.kg}kg ({delta.pct}%)</span>
            )}
          </div>
        </div>
        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:20, flexShrink:0, color:"var(--muted)", fontSize:13, transform: isExpanded ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}>›</span>
      </button>
      <div style={{ overflow:"hidden", maxHeight: isExpanded && progression.length >= 2 ? "120px" : "0px", transition:"max-height 0.22s ease-in-out" }}>
        {isExpanded && progression.length >= 2 && (
          <div style={{ padding:"5px 10px 8px", background:"var(--panel2)", borderTop:"1px solid var(--line)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
              <span style={{ color:"var(--muted)", fontSize:9 }}>1RM · {progression.length} sesiones</span>
              <span style={{ color:"var(--green)", fontWeight:700, fontSize:10 }}>{progression[progression.length-1]?.best1RM}kg</span>
            </div>
            <MicroLineChart data={progression.map(p=>({value:p.best1RM}))} width={280} height={28} color="var(--green)" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function PRPage() {
  const workouts = useStore((s) => s.workouts);
  const setPage = useStore((s) => s.setPage);

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const prs = useMemo(() => getAllTimePRs(workouts), [workouts]);
  const groups = useMemo(() => {
    const gs = [...new Set(prs.map(p => p.group).filter(Boolean))];
    gs.sort();
    return gs;
  }, [prs]);

  const filtered = useMemo(() => {
    let list = prs;
    if (groupFilter) list = list.filter(p => p.group === groupFilter);
    if (search) list = list.filter(p => p.exercise.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [prs, groupFilter, search]);

  const totals = useMemo(() => {
    let volume = 0, sets = 0, reps = 0;
    for (const w of workouts || []) {
      for (const s of (w.sets || []).filter(hasData)) {
        volume += Number(s.weight) * Number(s.reps);
        sets++; reps += Number(s.reps);
      }
    }
    return { volume, sets, reps, workouts: workouts?.length || 0 };
  }, [workouts]);

  const METRICS = [
    { label: "PRs", val: prs.length, color:"#fbbf24" },
    { label: "Vol", val: fmtVol(Math.round(totals.volume))+"kg", color:"#a855f7" },
    { label: "Sets", val: fmtVol(totals.sets), color:"#60a5fa" },
    { label: "Ent", val: totals.workouts, color:"#22c55e" },
  ];

  const prevBests = useMemo(() => {
    if (!workouts) return {};
    const map = {};
    prs.forEach(p => { map[p.exercise] = getPrevBest(workouts, p.exercise); });
    return map;
  }, [workouts, prs]);

  const recentPRs = useMemo(() => {
    return [...prs].sort((a,b) => (b.date||"").localeCompare(a.date||"")).slice(0, DASHBOARD_COUNT);
  }, [prs]);

  const topPRs = useMemo(() => prs.slice(0, DASHBOARD_COUNT), [prs]);

  if (prs.length === 0) {
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
        <div className="notice" style={{ textAlign:"center", padding:"40px 20px", marginTop:20 }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(251,191,36,.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
            <Icon name="Award" size={28} style={{ color:"#fbbf24" }} />
          </div>
          <b style={{ fontSize:15 }}>Sin records todavia</b>
          <p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>Completa entrenamientos con peso y reps para ver tus PRs aca.</p>
        </div>
      </section>
    );
  }

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
        <button onClick={() => { setShowSearch(s => !s); setShowAll(true); }}
          style={{ background: showSearch ? "rgba(168,85,247,.15)" : "var(--panel2)", border:"1px solid var(--line)", borderRadius:10, padding:"5px 8px", cursor:"pointer", display:"flex", alignItems:"center", gap:4, color:"var(--muted)", fontSize:11, fontWeight:700 }}>
          <Icon name="Search" size={13} strokeWidth={2} />
        </button>
      </div>

      {/* ── Metric strip ─────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:4, marginBottom:10 }}>
        {METRICS.map(m => (
          <div key={m.label} style={{ background:"var(--panel)", borderRadius:9, padding:"5px 3px", textAlign:"center" }}>
            <div style={{ fontSize:8, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", marginBottom:1 }}>{m.label}</div>
            <div style={{ fontSize:16, fontWeight:900, color:m.color, lineHeight:1.2 }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* ── Compact dashboard (default view) ─────────────── */}
      {!showAll && (
        <>
          {/* Top PRs */}
          <div style={{ marginBottom:8 }}>
            <span style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4, display:"block" }}>
              Mejores PRs
            </span>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {topPRs.map((pr, i) => {
                const delta = prevBests[pr.exercise] ? fmtDelta(pr, prevBests[pr.exercise]) : null;
                return <PRCard key={pr.exercise} pr={pr} rank={i} delta={delta} compact />;
              })}
            </div>
          </div>

          {/* Recent PRs (if different from top) */}
          {recentPRs.some((pr, i) => topPRs[i]?.exercise !== pr.exercise) && (
            <div style={{ marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4, display:"block" }}>
                Ultimos PRs
              </span>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {recentPRs.map((pr, i) => {
                  const delta = prevBests[pr.exercise] ? fmtDelta(pr, prevBests[pr.exercise]) : null;
                  return <PRCard key={pr.exercise} pr={pr} rank={-1} delta={delta} compact />;
                })}
              </div>
            </div>
          )}

          <button onClick={() => { setShowAll(true); setGroupFilter(""); setSearch(""); }}
            style={{ width:"100%", background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, padding:"9px", cursor:"pointer", color:"var(--green)", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
            <Icon name="List" size={13} />
            Ver todos los PRs ({prs.length})
          </button>
        </>
      )}

      {/* ── Full list (expanded view) ─────────────────────── */}
      {showAll && (
        <>
          {/* Group filter chips */}
          {groups.length > 1 && (
            <div style={{ display:"flex", gap:4, overflowX:"auto", marginBottom:8, paddingBottom:2, scrollbarWidth:"none" }}>
              {["", ...groups].map(g => (
                <button key={g || "all"} onClick={() => { setGroupFilter(g); setSearch(""); }}
                  style={{ flexShrink:0, padding:"3px 10px", borderRadius:16, border:"none", cursor:"pointer", fontSize:10, fontWeight:700, whiteSpace:"nowrap",
                    background: groupFilter === g ? "var(--green)" : "var(--panel2)",
                    color: groupFilter === g ? "#000" : "var(--muted)" }}>
                  {g || "Todos"}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          {showSearch && (
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ejercicio..."
              autoFocus style={{ width:"100%", background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:10, padding:"7px 10px", color:"var(--text)", fontSize:13, marginBottom:8, boxSizing:"border-box" }} />
          )}

          {/* PR list */}
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {filtered.map((pr, i) => {
              const isExpanded = expandedExercise === pr.exercise;
              const progression = isExpanded ? getExerciseProgression(workouts, pr.exercise) : [];
              const delta = prevBests[pr.exercise] ? fmtDelta(pr, prevBests[pr.exercise]) : null;
              return (
                <PRCard key={pr.exercise} pr={pr} rank={i}
                  onToggle={() => setExpandedExercise(prev => (prev === pr.exercise ? null : pr.exercise))}
                  isExpanded={isExpanded} progression={progression} delta={delta} />
              );
            })}
          </div>

          {prs.length > DASHBOARD_COUNT && (
            <button onClick={() => { setShowAll(false); setExpandedExercise(null); }}
              style={{ width:"100%", marginTop:8, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, padding:"8px", cursor:"pointer", color:"var(--muted)", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
              <Icon name="ChevronUp" size={13} />
              Mostrar menos
            </button>
          )}
        </>
      )}
    </section>
  );
}
