import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";

export default function ExerciseHistoryPage({ exerciseName, onClose }) {
  const workouts = useStore(s => s.workouts) || [];
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tab, setTab] = useState("peso"); // "peso" | "volumen" | "orm"

  const history = useMemo(() => {
    const entries = [];
    const sorted = [...workouts].sort((a,b) => String(a.date).localeCompare(String(b.date)));
    sorted.forEach(w => {
      const exSets = (w.sets || []).filter(s => s.exercise === exerciseName && Number(s.weight) > 0 && Number(s.reps) > 0);
      if (!exSets.length) return;
      const bestSet = exSets.reduce((max, s) => Number(s.weight) > Number(max.weight) ? s : max);
      const volume = exSets.reduce((sum, s) => sum + (Number(s.weight)||0)*(Number(s.reps)||0), 0);
      const orm = Math.round(Number(bestSet.weight) * (1 + Number(bestSet.reps) / 30));
      entries.push({ date: w.date, bestWeight: Number(bestSet.weight), bestReps: Number(bestSet.reps), volume: Math.round(volume), orm, sets: exSets.length });
    });
    return entries;
  }, [workouts, exerciseName]);

  const chartValues = history.map(h => tab === "peso" ? h.bestWeight : tab === "volumen" ? h.volume : h.orm);
  const minV = chartValues.length ? Math.min(...chartValues) : 0;
  const maxV = chartValues.length ? Math.max(...chartValues) : 1;
  const range = maxV - minV || 1;
  const W = 300, H = 90, PAD = 8;

  const pts = history.map((_, i) => {
    const x = history.length > 1 ? PAD + (i / (history.length - 1)) * (W - PAD*2) : W/2;
    const y = H - PAD - ((chartValues[i] - minV) / range) * (H - PAD*2);
    return [x, y];
  });

  const linePath = pts.map((p,i) => (i===0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const areaPath = pts.length ? `${linePath} L${pts[pts.length-1][0]},${H} L${pts[0][0]},${H} Z` : "";

  const first = history[0];
  const last  = history[history.length - 1];
  const pctChange = first && last && first.bestWeight > 0
    ? Math.round(((last.bestWeight - first.bestWeight) / first.bestWeight) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, maxHeight: "82vh", overflowY: "auto", padding: "20px 18px" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <h2 style={{ margin:"0 0 2px", fontSize:18 }}>{exerciseName}</h2>
            <span style={{ fontSize:12, color:"var(--muted)" }}>{history.length} sesiones registradas</span>
          </div>
          <button className="ghost" onClick={onClose} style={{ padding:"6px 10px", fontSize:16 }}>✕</button>
        </div>

        {history.length === 0 ? (
          <p style={{ color:"var(--muted)", textAlign:"center", padding:"30px 0" }}>Sin historial registrado</p>
        ) : (
          <>
            {/* KPI cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
              {[
                { label:"Mejor peso", value: `${Math.max(...history.map(h=>h.bestWeight))}kg`, color:"var(--green)" },
                { label:"Último",     value: `${last.bestWeight}kg`, color:"var(--text)" },
                { label:"Progreso",   value: pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`, color: pctChange >= 0 ? "var(--green)" : "#f87171" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background:"var(--panel2)", borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:18, fontWeight:900, color }}>{value}</div>
                  <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Tab selector */}
            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
              {[["peso","Peso máx."],["volumen","Volumen"],["orm","1RM est."]].map(([key,label]) => (
                <button key={key} onClick={() => setTab(key)} style={{
                  flex:1, padding:"5px 0", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                  background: tab===key ? "var(--green)" : "var(--panel2)",
                  color: tab===key ? "#fff" : "var(--muted)", border:"none"
                }}>{label}</button>
              ))}
            </div>

            {/* Area chart */}
            {history.length >= 2 ? (
              <div style={{ position:"relative", marginBottom:14 }}>
                <svg width="100%" viewBox={`0 0 ${W} ${H+10}`} style={{ display:"block", overflow:"visible" }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--green)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity="0.02" />
                    </linearGradient>
                    <style>{`
                      @keyframes drawLine {
                        from { stroke-dashoffset: 1200; }
                        to   { stroke-dashoffset: 0; }
                      }
                      .chart-line { stroke-dasharray: 1200; animation: drawLine 1.2s ease forwards; }
                    `}</style>
                  </defs>
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75, 1].map(f => {
                    const gy = PAD + (1 - f) * (H - PAD*2);
                    return (
                      <g key={f}>
                        <line x1={PAD} y1={gy} x2={W-PAD} y2={gy} stroke="rgba(255,255,255,.05)" strokeWidth={1} />
                        <text x={PAD-2} y={gy+4} textAnchor="end" fill="rgba(255,255,255,.3)" fontSize={8}>
                          {Math.round(minV + f * range)}{tab==="peso"||tab==="orm" ? "kg" : ""}
                        </text>
                      </g>
                    );
                  })}
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#areaGrad)" />
                  {/* Line */}
                  <path d={linePath} fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />
                  {/* Data points */}
                  {pts.map(([x, y], i) => (
                    <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                      <circle cx={x} cy={y} r={hoveredIdx===i ? 6 : 3.5} fill={hoveredIdx===i ? "#fff" : "var(--green)"} stroke="var(--green)" strokeWidth={1.5} style={{ cursor:"pointer", transition:"r .15s" }} />
                      {hoveredIdx === i && (
                        <g>
                          <rect x={x-28} y={y-28} width={56} height={20} rx={6} fill="var(--panel)" stroke="var(--green)" strokeWidth={1} />
                          <text x={x} y={y-14} textAnchor="middle" fill="var(--text)" fontSize={10} fontWeight="bold">
                            {chartValues[i]}{tab==="peso"||tab==="orm" ? "kg" : ""}
                          </text>
                        </g>
                      )}
                    </g>
                  ))}
                </svg>
                {/* Date labels */}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                  <span style={{ fontSize:9, color:"var(--muted)" }}>{first.date?.slice(5)}</span>
                  <span style={{ fontSize:9, color:"var(--muted)" }}>{last.date?.slice(5)}</span>
                </div>
              </div>
            ) : (
              <p style={{ color:"var(--muted)", fontSize:12, textAlign:"center", padding:"12px 0" }}>Necesitás al menos 2 sesiones para ver el gráfico</p>
            )}

            {/* Session list */}
            <p style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Historial</p>
            {[...history].reverse().slice(0, 12).map((h, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                <span style={{ fontSize:12, color:"var(--muted)" }}>{h.date?.slice(5)}/{h.date?.slice(0,4)}</span>
                <div style={{ display:"flex", gap:12 }}>
                  <span style={{ fontSize:12, color:"var(--text)", fontWeight:700 }}>{h.bestWeight}kg × {h.bestReps}</span>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>{h.sets} series</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

