import { useMemo, useState, useEffect } from "react";
import useStore from "../store/useStore.js";
import Icon from "../components/Icon.jsx";
import { buildCoachReport, formatDate, getDeloadSuggestion } from "../lib/analytics.js";

const TAB_STYLE = {
  tabBar: { display:"flex", flexDirection:"row", width:"100%", gap:0, borderBottom:"1px solid var(--line)", marginBottom:16 },
  tab: { flex:1, padding:"10px 4px", background:"none", border:"none", borderBottom:"2px solid transparent", color:"var(--muted)", fontSize:12, fontWeight:600, cursor:"pointer" },
  activeTab: { flex:1, padding:"10px 4px", background:"none", border:"none", borderBottom:"2px solid var(--green)", color:"var(--green)", fontSize:12, fontWeight:600, cursor:"pointer" },
};

function Confetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => i);
  const colors = ["#22d37a","#06b6d4","#f59e0b","#ef4444","#8b5cf6"];
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, height:0, zIndex:200, pointerEvents:"none", overflow:"visible" }}>
      {pieces.map(i => (
        <div key={i} style={{
          position:"absolute", left:`${5 + (i * 4.7) % 95}%`, top:`-10px`,
          width: i % 3 === 0 ? 8 : 5, height: i % 3 === 0 ? 8 : 12,
          borderRadius: i % 2 === 0 ? "50%" : 2,
          background: colors[i % colors.length],
          animation: `confettiFall ${1.2 + (i % 8) * 0.15}s ${(i % 6) * 0.1}s ease-in forwards`,
          opacity: 0.9,
        }} />
      ))}
    </div>
  );
}

export default function CoachPage() {
  const [tab, setTab] = useState("resumen");
  const [showConfetti, setShowConfetti] = useState(false);
  const reports = useStore((state) => state.coachReports) ?? [];
  const workouts = useStore((state) => state.workouts) ?? [];
  const prs = useStore((state) => state.prs) ?? [];

  const computed = reports.length ? reports : workouts.slice(0, 12).flatMap((workout) => {
    try { return [buildCoachReport(workout, workouts)]; } catch { return []; }
  });
  const latest = computed[0];
  const latestPrs = latest ? prs.filter((p) => p.date === latest.date) : [];

  useEffect(() => {
    if (latestPrs.length > 0 && tab === "resumen") {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [latestPrs.length, tab]);

  const progression = useMemo(() => {
    const types = {};
    (workouts || []).forEach((w) => {
      if (!types[w.type]) types[w.type] = [];
      types[w.type].push(w);
    });
    return Object.entries(types).map(([type, ws]) => {
      const sorted = ws.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const last = sorted[0];
      if (!last) return null;
      const lastWithData = (last.sets || []).filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
      if (!lastWithData.length) return null;
      const exercises = {};
      lastWithData.forEach((set) => {
        if (exercises[set.exercise]) return;
        const prev = sorted.slice(1).find((w) => (w.sets || []).some((s) => s.exercise === set.exercise && Number(s.weight) > 0));
        const prevSets = prev ? prev.sets.filter((s) => s.exercise === set.exercise && Number(s.weight) > 0) : [];
        const prevBest = prevSets.length ? prevSets.reduce((max, s) => (Number(s.weight) * Number(s.reps) > Number(max.weight) * Number(max.reps) ? s : max)) : null;
        exercises[set.exercise] = {
          current: { weight: Number(set.weight), reps: Number(set.reps) },
          prev: prevBest ? { weight: Number(prevBest.weight), reps: Number(prevBest.reps) } : null,
        };
      });
      const entries = Object.entries(exercises);
      if (!entries.length) return null;
      return { type, date: formatDate(last.date), exercises: entries.slice(0, 6) };
    }).filter(Boolean);
  }, [workouts]);

  const allAlerts = useMemo(() => {
    const list = [];
    if (getDeloadSuggestion(workouts)) {
      list.push({ type:"warning", msg:"Semana de descarga sugerida — bajá intensidad 40% para recuperarte." });
    }
    computed.slice(0, 8).forEach((r) => {
      const alerts = r.alerts || (r.alert ? [{ msg: r.alert }] : []);
      alerts.forEach((a) => list.push({ type:"alert", date: r.date, msg: a.msg || a }));
    });
    return list;
  }, [computed, workouts]);

  const tabs = [
    { id:"resumen", label:"Resumen" },
    { id:"entrenamiento", label:"Entrenamiento" },
    { id:"progresion", label:"Progresión" },
    { id:"alertas", label:"Alertas" },
  ];

  return (
    <section className="page coach-page">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {showConfetti && <Confetti />}

      <div className="top-row">
        <div>
          <p className="eyebrow">Análisis post-entreno</p>
          <h1>Coach</h1>
        </div>
      </div>

      <div style={TAB_STYLE.tabBar}>
        {tabs.map(({ id, label }) => (
          <button key={id} style={tab === id ? TAB_STYLE.activeTab : TAB_STYLE.tab} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "resumen" && (
        <>
          {latest ? (
            <FeaturedReport report={latest} prs={latestPrs} />
          ) : (
            <div className="notice">
              <b>Sin reportes</b>
              <p>Completá un entrenamiento para ver el análisis del coach.</p>
            </div>
          )}
        </>
      )}

      {tab === "entrenamiento" && (
        <div>
          {computed.length > 0 ? computed.slice(0, 8).map((report, i) => (
            <div key={report.id || i} className="coach-card" style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <small style={{ color:"var(--muted)" }}>{formatDate(report.date)}</small>
                <span style={{ fontSize:11, background:"var(--panel2)", borderRadius:8, padding:"2px 8px", color:"var(--green)" }}>
                  {report.sessionType || report.type || "Workout"}
                </span>
              </div>
              <h3 style={{ margin:"0 0 6px", fontSize:15 }}>{report.title || "Sesión"}</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:8 }}>
                {[
                  { label:"Volumen", value:`${report.totalVolume || 0}kg` },
                  { label:"Series", value:String(report.totalSets || 0) },
                  { label:"PRs", value:String(report.prs?.length || 0) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background:"var(--panel2)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:"var(--green)" }}>{value}</div>
                    <div style={{ fontSize:10, color:"var(--muted)" }}>{label}</div>
                  </div>
                ))}
              </div>
              {report.status && <p style={{ margin:0, fontSize:13, color:"var(--muted)" }}>{report.status}</p>}
            </div>
          )) : (
            <div className="notice">
              <b>Sin historial</b>
              <p>Completá entrenamientos para ver el historial.</p>
            </div>
          )}
        </div>
      )}

      {tab === "progresion" && (
        <div>
          <p style={{ fontSize:13, color:"var(--muted)", marginBottom:12 }}>
            Último entrenamiento de cada grupo vs. sesión anterior
          </p>
          {progression.length > 0 ? progression.map(({ type, date, exercises }) => (
            <div className="progression-card" key={type}>
              <h3>
                <Icon name="TrendingUp" size={16} strokeWidth={2.5} /> {type}
                <small style={{ color:"var(--muted)", fontSize:11, fontWeight:400 }}> · {date}</small>
              </h3>
              {exercises.map(([name, { current, prev }]) => {
                const curVol = current.weight * current.reps;
                const prevVol = prev ? prev.weight * prev.reps : 0;
                const diff = prev ? ((curVol - prevVol) / (prevVol || 1)) * 100 : null;
                return (
                  <div className="progression-exercise" key={name}>
                    <span className="ex-name">{name}</span>
                    <span className="entry"><b>{current.weight}kg</b> × {current.reps}</span>
                    {prev ? (
                      <span className={`entry ${diff > 5 ? "up" : diff < -5 ? "down" : "same"}`}>
                        {diff > 5 ? "↑" : diff < -5 ? "↓" : "="} ant: {prev.weight}kg×{prev.reps}
                      </span>
                    ) : (
                      <span className="entry same">Primera vez</span>
                    )}
                  </div>
                );
              })}
            </div>
          )) : (
            <div className="notice">
              <b>Sin datos de progresión</b>
              <p>Completá más entrenamientos para ver comparaciones.</p>
            </div>
          )}
        </div>
      )}

      {tab === "alertas" && (
        <div>
          {allAlerts.length > 0 ? allAlerts.map((alert, i) => (
            <div key={i} style={{
              background: alert.type === "warning" ? "rgba(245,158,11,.08)" : "rgba(239,68,68,.08)",
              border: `1px solid ${alert.type === "warning" ? "rgba(245,158,11,.3)" : "rgba(239,68,68,.3)"}`,
              borderRadius:14, padding:"12px 14px", marginBottom:10, display:"flex", gap:10, alignItems:"flex-start",
            }}>
              <span style={{ fontSize:18 }}>{alert.type === "warning" ? "⚠️" : "🔴"}</span>
              <div>
                {alert.date && <small style={{ color:"var(--muted)", fontSize:11, display:"block", marginBottom:2 }}>{formatDate(alert.date)}</small>}
                <p style={{ margin:0, fontSize:13 }}>{alert.msg}</p>
              </div>
            </div>
          )) : (
            <div className="notice">
              <b>Sin alertas</b>
              <p>Tu entrenamiento se ve bien. ¡Seguí así!</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function FeaturedReport({ report, prs = [] }) {
  const alerts = report.alerts || (report.alert ? [{ msg: report.alert }] : []);
  const recommendations = report.recommendations || (report.recommendation ? [{ type:"maintain", msg: report.recommendation }] : []);
  return (
    <div className="coach-feature">
      <div className="coach-feature-head">
        <div className="arrow-logo"><Icon name="ArrowRight" size={24} strokeWidth={3} /></div>
        <div>
          <small>{report.sessionType || report.title} · {formatDate(report.date)}</small>
          <h2>{report.title || "Último análisis"}</h2>
        </div>
      </div>

      {prs.length > 0 && (
        <div className="coach-prs">
          <span>Nuevos PRs</span>
          <div className="coach-pr-list">
            {prs.map((pr, i) => (
              <span key={i} className="coach-pr-badge">
                <Icon name="TrendingUp" size={12} /> {pr.exercise}: {pr.weight}kg × {pr.reps}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="coach-status">
        <span>Estado general</span>
        <p>{report.status}</p>
      </div>

      {alerts.length > 0 && (
        <div className="coach-block warn">
          <span><Icon name="AlertTriangle" size={14} /> Alertas</span>
          {alerts.slice(0, 3).map((alert, i) => <p key={i}>{alert.msg || alert}</p>)}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="coach-block rec">
          <span><Icon name="Lightbulb" size={14} /> Recomendaciones</span>
          {recommendations.slice(0, 4).map((rec, i) => (
            <p key={i}>
              {rec.type === "increase" ? <Icon name="TrendingUp" size={14} /> : rec.type === "stabilize" ? <Icon name="Minus" size={14} /> : <Icon name="Check" size={14} />}
              {" "}{rec.msg || rec}
            </p>
          ))}
        </div>
      )}

      {report.totalVolume > 0 && (
        <div style={{ marginTop:12, padding:"10px 12px", background:"var(--panel2)", borderRadius:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ fontSize:12, color:"var(--muted)" }}>Resumen de sesión</span>
            {report.volumeDelta !== null && report.volumeDelta !== undefined && (
              <span style={{ fontSize:12, fontWeight:700, color: report.volumeDelta > 0 ? "var(--green)" : report.volumeDelta < 0 ? "var(--danger)" : "var(--muted)" }}>
                {report.volumeDelta > 0 ? "↑" : report.volumeDelta < 0 ? "↓" : "="} {Math.abs(report.volumeDelta)}% vs promedio
              </span>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { label:"Volumen total", value:`${report.totalVolume}kg`, color:"var(--green)" },
              { label:"Series completadas", value:String(report.totalSets || 0), color:"var(--cyan)" },
              { label:"Tipo", value:report.sessionType || "Workout", color:"var(--muted)" },
              { label:"PRs en sesión", value:String(report.prs?.length || 0), color:"#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background:"var(--panel)", borderRadius:10, padding:"8px 10px" }}>
                <div style={{ fontSize:18, fontWeight:800, color }}>{value}</div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
