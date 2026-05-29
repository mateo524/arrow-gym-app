import { useEffect } from "react";
import useStore from "../store/useStore.js";
import { buildCoachReport } from "../lib/analytics.js";

export default function CoachPage() {
  const reports = useStore((state) => state.coachReports);
  const workouts = useStore((state) => state.workouts);
  const bodyMetrics = useStore((state) => state.bodyMetrics);
  const globalCoachReport = useStore((state) => state.globalCoachReport);
  const refreshGlobalCoach = useStore((state) => state.refreshGlobalCoach);
  const setPage = useStore((state) => state.setPage);
  const showCompleteCoach = useStore((state) => state.showCompleteCoach);
  const setShowCompleteCoach = useStore((state) => state.setShowCompleteCoach);

  useEffect(() => {
    refreshGlobalCoach();
  }, []);

  const computed = reports.length ? reports : workouts.slice(0, 12).map((workout) => buildCoachReport(workout, workouts));
  const latest = computed[0];
  const coach = globalCoachReport;

  if (!coach) {
    return (
      <section className="page coach-page">
        <div className="top-row">
          <div>
            <p className="eyebrow">Análisis global</p>
            <h1>Coach</h1>
          </div>
          <button className="ghost" onClick={() => setPage("home")}>Inicio</button>
        </div>
        <p>Cargando análisis...</p>
      </section>
    );
  }

  return (
    <section className="page coach-page">
      <div className="top-row">
        <div>
          <p className="eyebrow">Análisis global</p>
          <h1>Coach</h1>
        </div>
        <button className="ghost" onClick={() => setPage("home")}>Inicio</button>
      </div>

      <div className="coach-feature">
        <div className="coach-feature-head">
          <div className="arrow-logo">→</div>
          <div>
            <small>{workouts.length} entrenamientos · {bodyMetrics.length} mediciones</small>
            <h2>Estado general</h2>
          </div>
        </div>

        <div className="coach-status">
          <span>Resumen</span>
          <p>{coach.summary}</p>
        </div>

        {!showCompleteCoach && (
          <>
            {coach.alerts.length > 0 && (
              <div className="coach-block warn">
                <span>Alerta principal</span>
                <p>⚠️ {coach.alerts[0].msg}</p>
              </div>
            )}

            {coach.nextActions.length > 0 && (
              <div className="coach-block rec">
                <span>Próxima acción</span>
                <p>→ {coach.nextActions[0]}</p>
              </div>
            )}

            <button className="secondary full" onClick={() => setShowCompleteCoach(true)}>
              Ver análisis completo
            </button>
          </>
        )}

        {showCompleteCoach && (
          <>
            {coach.nextActions.length > 0 && (
              <div className="coach-block rec">
                <span>Próximas acciones</span>
                {coach.nextActions.map((a, i) => <p key={i}>→ {a}</p>)}
              </div>
            )}

            {coach.alerts.length > 0 && (
              <div className="coach-block warn">
                <span>Alertas ({coach.alerts.length})</span>
                {coach.alerts.map((a, i) => <p key={i}>⚠️ {a.msg}</p>)}
              </div>
            )}

            <div className="coach-block">
              <span>Entrenamiento</span>
              {coach.trainingInsights.length > 0
                ? coach.trainingInsights.map((t, i) => <p key={i}>✓ {t}</p>)
                : <p>Sin datos de entrenamiento suficientes.</p>}
            </div>

            <div className="coach-block">
              <span>Mediciones corporales</span>
              <p><b>Última:</b> {coach.metricSummary}</p>
              {coach.bodyInsights.length > 0
                ? coach.bodyInsights.map((b, i) => <p key={i}>✓ {b}</p>)
                : <p>Cargá mediciones para obtener análisis.</p>}
            </div>

            {coach.progressionInsights.length > 0 && (
              <div className="coach-block">
                <span>Progresión de fuerza</span>
                {coach.progressionInsights.map((p, i) => <p key={i}>↑ {p}</p>)}
              </div>
            )}

            {coach.shoulderWarnings.length > 0 && (
              <div className="coach-block warn">
                <span>Hombro</span>
                {coach.shoulderWarnings.map((s, i) => <p key={i}>⚠️ {s}</p>)}
              </div>
            )}

            <div className="recommendations-list">
              <span>Recomendaciones</span>
              {coach.recommendations.map((r, i) => (
                <div className="rec-item" key={i}>
                  <span className="rec-icon">{r.type === "progression" ? "↑" : r.type === "pr" ? "🏆" : r.type === "deload" ? "💤" : r.type === "training" ? "✓" : "●"}</span>
                  <p>{r.msg}</p>
                </div>
              ))}
            </div>

            <button className="ghost full" onClick={() => setShowCompleteCoach(false)}>
              Mostrar resumen
            </button>
          </>
        )}
      </div>

      {latest && !showCompleteCoach && (
        <div className="coach-list">
          {computed.slice(0, 5).map((report) => (
            <CoachReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </section>
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
      {alerts[0] && <p className="alert">⚠️ {alerts[0].msg}</p>}
      {recommendations[0] && <strong>{recommendations[0].msg}</strong>}
    </div>
  );
}
