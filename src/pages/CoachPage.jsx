import { useMemo } from "react";
import { motion } from "framer-motion";
import useStore from "../store/useStore.js";
import Icon from "../components/Icon.jsx";
import { buildCoachReport, formatDate } from "../lib/analytics.js";

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: .25, ease: "easeOut" } }),
};

export default function CoachPage() {
  const reports = useStore((state) => state.coachReports);
  const workouts = useStore((state) => state.workouts);
  const prs = useStore((state) => state.prs);
  const setPage = useStore((state) => state.setPage);
  const computed = reports.length ? reports : workouts.slice(0, 12).map((workout) => buildCoachReport(workout, workouts));
  const latest = computed[0];
  const latestPrs = latest ? prs.filter((p) => p.date === latest.date) : [];

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
        const prev = sorted.slice(1).find((w) => (w.sets || []).some((s) => s.exercise === set.exercise && Number(s.weight) > 0 && Number(s.reps) > 0));
        const prevSets = prev ? prev.sets.filter((s) => s.exercise === set.exercise && Number(s.weight) > 0 && Number(s.reps) > 0) : [];
        const prevBest = prevSets.length
          ? prevSets.reduce((max, s) => (Number(s.weight) * Number(s.reps) > Number(max.weight) * Number(max.reps) ? s : max))
          : null;
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

  return (
    <section className="page coach-page">
      <div className="top-row">
        <div>
          <p className="eyebrow">Análisis post-entreno</p>
          <h1>Coach</h1>
        </div>
        <button className="back-btn" onClick={() => setPage("home")} aria-label="Back">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
      </div>

      {latest ? (
        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .3, ease: "easeOut" }}>
          <FeaturedReport report={latest} prs={latestPrs} />
        </motion.div>
      ) : (
        <div className="notice">
          <b>Sin reportes</b>
          <p>Completá un entrenamiento para ver el análisis del coach.</p>
        </div>
      )}

      {progression.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Progresión por grupo</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
            Último entrenamiento de cada grupo vs. sesión anterior del mismo grupo
          </p>
          {progression.map(({ type, date, exercises }) => (
            <div className="progression-card" key={type}>
              <h3>
                <Icon name="TrendingUp" size={16} strokeWidth={2.5} /> {type}
                <small style={{ color: "var(--muted)", fontSize: 11, fontWeight: 400 }}>{date}</small>
              </h3>
              {exercises.map(([name, { current, prev }]) => {
                const curVol = Number(current.weight) * Number(current.reps);
                const prevVol = prev ? Number(prev.weight) * Number(prev.reps) : 0;
                const diff = prev ? ((curVol - prevVol) / (prevVol || 1)) * 100 : null;
                return (
                  <div className="progression-exercise" key={name}>
                    <span className="ex-name">{name}</span>
                    <span className="entry"><b>{current.weight}kg</b> × {current.reps} reps</span>
                    {prev && (
                      <span className={`entry ${diff > 5 ? "up" : diff < -5 ? "down" : "same"}`}>
                        {diff > 5 ? <Icon name="TrendingUp" size={10} /> : diff < -5 ? <Icon name="TrendingDown" size={10} /> : <Icon name="Minus" size={10} />}
                        anterior: {prev.weight}kg × {prev.reps}
                      </span>
                    )}
                    {!prev && <span className="entry same">Primera vez</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {prs.length > 0 && (
        <div className="progression-card" style={{ marginTop: 16 }}>
          <h3><Icon name="Star" size={16} strokeWidth={2.5} /> Todos los récords</h3>
          <div className="records-list">
            {prs.map((pr, i) => (
              <span key={i} className="record-badge">
                <Icon name="TrendingUp" size={12} /> {pr.exercise}: {pr.weight}kg × {pr.reps} · {formatDate(pr.date)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="coach-list">
        {computed.map((report, i) => (
          <motion.div key={report.id} custom={i} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <CoachReportCard report={report} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeaturedReport({ report, prs = [] }) {
  const alerts = report.alerts || (report.alert ? [{ msg: report.alert }] : []);
  const recommendations = report.recommendations || (report.recommendation ? [{ type: "maintain", msg: report.recommendation }] : []);
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
          {alerts.slice(0, 3).map((alert, index) => <p key={index}>{alert.msg || alert}</p>)}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="coach-block rec">
          <span><Icon name="Lightbulb" size={14} /> Recomendaciones</span>
          {recommendations.slice(0, 4).map((rec, index) => (
            <p key={index}>
              {rec.type === "increase" ? <Icon name="TrendingUp" size={14} /> : rec.type === "stabilize" ? <Icon name="Minus" size={14} /> : <Icon name="Check" size={14} />}
              {" "}{rec.msg || rec}
            </p>
          ))}
        </div>
      )}

      <div className="coach-mini-stats">
        <MiniStat label="Volumen" value={`${report.totalVolume || 0} kg`} />
        <MiniStat label="Tipo" value={report.sessionType || "Workout"} />
        <MiniStat label="Fecha" value={formatDate(report.date)} />
      </div>

      <div className="notice compact">
        <b>Recordatorio</b>
        <p>El peso corporal no define todo: mirá fuerza, cintura, volumen y constancia semanal.</p>
      </div>
    </div>
  );
}

function CoachReportCard({ report }) {
  const alerts = report.alerts || (report.alert ? [{ msg: report.alert }] : []);
  const recommendations = report.recommendations || (report.recommendation ? [{ msg: report.recommendation }] : []);
  return (
    <div className="coach-card">
      <small>{formatDate(report.date)}</small>
      <h2>{report.title}</h2>
      <p>{report.status}</p>
      {alerts[0] && <p className="alert">{alerts[0].msg}</p>}
      {recommendations[0] && <strong>{recommendations[0].msg}</strong>}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
