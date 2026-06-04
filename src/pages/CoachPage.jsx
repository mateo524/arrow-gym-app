import { motion } from "framer-motion";
import useStore from "../store/useStore.js";
import Icon from "../components/Icon.jsx";
import { buildCoachReport } from "../lib/analytics.js";

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

  return (
    <section className="page coach-page">
      <div className="top-row">
        <div>
          <p className="eyebrow">Análisis post-entreno</p>
          <h1>Coach</h1>
        </div>
        <button className="ghost" onClick={() => setPage("home")}>Inicio</button>
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
          <small>{report.sessionType || report.title} · {report.date}</small>
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
        <MiniStat label="Fecha" value={String(report.date || "").slice(5)} />
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
      <small>{report.date}</small>
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
