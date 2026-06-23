import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import { hasData, getExerciseProgression } from "../lib/analytics.js";
import MicroLineChart from "../components/MicroLineChart.jsx";
import Icon from "../components/Icon.jsx";

const PR_PAGE_SIZE = 8;

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

function getPrevBest(workouts, exercise) {
  let bestWeight = 0, bestReps = 0;
  for (const w of workouts || []) {
    for (const s of (w.sets || []).filter(hasData)) {
      if (s.exercise !== exercise) continue;
      const wgt = Number(s.weight) || 0;
      const rps = Number(s.reps) || 0;
      if (wgt > bestWeight || (wgt === bestWeight && rps > bestReps)) {
        bestWeight = wgt;
        bestReps = rps;
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

  const visible = showAll ? filtered : filtered.slice(0, PR_PAGE_SIZE);

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

  const METRICS = [
    { label: "PRs", val: prs.length, color: "#fbbf24", icon: "Award" },
    { label: "Vol", val: fmtVol(Math.round(totals.volume)) + "kg", color: "#a855f7", icon: "Package" },
    { label: "Sets", val: fmtVol(totals.sets), color: "#60a5fa", icon: "List" },
    { label: "Ent", val: totals.workouts, color: "#22c55e", icon: "Calendar" },
  ];

  const prevBests = useMemo(() => {
    if (!workouts) return {};
    const map = {};
    prs.forEach(p => { map[p.exercise] = getPrevBest(workouts, p.exercise); });
    return map;
  }, [workouts, prs]);

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
        <button onClick={() => setShowSearch(s => !s)}
          style={{ background: showSearch ? "rgba(168,85,247,.15)" : "var(--panel2)", border:"1px solid var(--line)", borderRadius:10, padding:"6px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:5, color: "var(--muted)", fontSize:12, fontWeight:700 }}>
          <Icon name="Search" size={15} strokeWidth={2} />
        </button>
      </div>

      {/* ── Metric strip ─────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:6, marginBottom:14 }}>
        {METRICS.map(m => (
          <div key={m.label} style={{ background:"var(--panel)", borderRadius:12, padding:"10px 6px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", marginBottom:2 }}>{m.label}</div>
            <div style={{ fontSize:22, fontWeight:900, color:m.color, lineHeight:1.2 }}>{m.val}</div>
          </div>
        ))}
      </div>

      {prs.length === 0 ? (
        <div className="notice" style={{ textAlign:"center", padding:"40px 20px", marginTop:20 }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(251,191,36,.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
            <Icon name="Award" size={28} style={{ color:"#fbbf24" }} />
          </div>
          <b style={{ fontSize:15 }}>Sin records todavia</b>
          <p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>Completa entrenamientos con peso y reps para ver tus PRs aca.</p>
        </div>
      ) : (
        <>
          {/* ── Group filter chips ──────────────────────────── */}
          {groups.length > 1 && (
            <div style={{ display:"flex", gap:5, overflowX:"auto", marginBottom:14, paddingBottom:4, scrollbarWidth:"none" }}>
              {["", ...groups].map(g => (
                <button key={g || "all"} onClick={() => { setGroupFilter(g); setShowAll(false); }}
                  style={{ flexShrink:0, padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, whiteSpace:"nowrap",
                    background: groupFilter === g ? "var(--green)" : "var(--panel2)",
                    color: groupFilter === g ? "#000" : "var(--muted)",
                  }}>
                  {g || "Todos"}
                </button>
              ))}
            </div>
          )}

          {/* ── Search (toggle) ─────────────────────────────── */}
          {showSearch && (
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ejercicio..."
              autoFocus style={{ width:"100%", background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:12, padding:"10px 12px", color:"var(--text)", fontSize:14, marginBottom:12, boxSizing:"border-box" }} />
          )}

          {/* ── PR list ──────────────────────────────────────── */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {visible.map((pr, i) => {
              const isExpanded = expandedExercise === pr.exercise;
              const progression = isExpanded ? getExerciseProgression(workouts, pr.exercise) : [];
              const prevBest = prevBests[pr.exercise];
              const delta = prevBest ? fmtDelta(pr, prevBest) : null;
              return (
                <div key={pr.exercise} style={{ borderRadius:14, overflow:"hidden", background:"var(--panel)", border: i === 0 ? "1px solid rgba(251,191,36,.4)" : "1px solid var(--line)" }}>
                  <button onClick={() => setExpandedExercise(prev => (prev === pr.exercise ? null : pr.exercise))}
                    style={{ width:"100%", display:"flex", alignItems:"center", padding:0, background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                    <div className="pr-row" style={{ flex:1, margin:0, borderRadius:0, border:"none", background:"none" }}>
                      <div className="pr-rank" style={{ fontSize:11, fontWeight:800, color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#d97706" : "var(--muted)", minWidth:28, textAlign:"center" }}>
                        {i === 0 ? <Icon name="Trophy" size={16} style={{ color:"#fbbf24" }} /> : i === 1 ? <Icon name="Award" size={14} style={{ color:"#94a3b8" }} /> : `#${i + 1}`}
                      </div>
                      <div className="pr-info">
                        <b style={{ fontSize:14 }}>{pr.exercise}</b>
                        <small style={{ fontSize:10, color:"var(--muted)", display:"block", marginTop:1 }}>{pr.group}</small>
                      </div>
                      <div className="pr-stats" style={{ textAlign:"right" }}>
                        <span className="pr-main" style={{ fontSize:15 }}>{pr.weight}kg × {pr.reps}</span>
                        <small style={{ fontSize:10, display:"block", color:"var(--muted)" }}>1RM ~{pr.oneRM}kg</small>
                        {delta && (
                          <small style={{ fontSize:10, fontWeight:700, color:"#22c55e", display:"block" }}>
                            ↑ {delta.kg > 0 ? `+${delta.kg}kg` : ""} ({delta.pct}%)
                          </small>
                        )}
                      </div>
                    </div>
                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:28, flexShrink:0, color:"var(--muted)", fontSize:16, transform: isExpanded ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}>›</span>
                  </button>
                  <div style={{ overflow:"hidden", maxHeight: isExpanded && progression.length >= 2 ? "180px" : "0px", transition:"max-height 0.22s ease-in-out" }}>
                    {isExpanded && progression.length >= 2 && (
                      <div style={{ padding:"10px 14px 12px", background:"var(--panel2)", borderTop:"1px solid var(--line)" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                          <small style={{ color:"var(--muted)", fontSize:10 }}>1RM · {progression.length} sesiones</small>
                          <small style={{ color:"var(--green)", fontWeight:700, fontSize:12 }}>{progression[progression.length - 1]?.best1RM}kg</small>
                        </div>
                        <MicroLineChart data={progression.map(p => ({ value: p.best1RM }))} width={280} height={44} color="var(--green)" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Show more / less ────────────────────────────── */}
          {filtered.length > PR_PAGE_SIZE && (
            <button onClick={() => setShowAll(s => !s)}
              style={{ width:"100%", marginTop:10, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"10px", cursor:"pointer", color:"var(--green)", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Icon name={showAll ? "ChevronUp" : "ChevronDown"} size={14} />
              {showAll ? "Mostrar menos" : `Ver los ${filtered.length} PRs`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
