import { useMemo, useEffect } from "react";
import useStore from "../store/useStore.js";
import { buildCoachReport } from "../lib/analytics.js";

function computeComparison(current, workouts) {
  if (!current?.prevWorkoutId) return null;
  const prevWorkout = workouts.find((w) => w.id === current.prevWorkoutId);
  if (!prevWorkout) return null;
  const currentSets = (current.sets || []).filter((s) => Number(s.weight) > 0);
  if (!currentSets.length) return null;
  const exerciseMap = {};
  (prevWorkout.sets || []).forEach((s) => {
    const key = String(s.exercise || "").trim().toLowerCase();
    if (Number(s.weight) > 0) exerciseMap[key] = s;
  });
  const comparisons = [];
  currentSets.forEach((cs) => {
    const key = String(cs.exercise || "").trim().toLowerCase();
    const ps = exerciseMap[key];
    const cw = Number(cs.weight) || 0;
    const cr = Number(cs.reps) || 0;
    if (!ps) {
      comparisons.push({ exercise: cs.exercise, currentWeight: cw, currentReps: cr, prevWeight: null, delta: null });
      return;
    }
    const pw = Number(ps.weight) || 0;
    const pr = Number(ps.reps) || 0;
    comparisons.push({
      exercise: cs.exercise,
      currentWeight: cw,
      currentReps: cr,
      prevWeight: pw,
      prevReps: pr,
      delta: cw - pw,
      deltaVol: (cw * cr) - (pw * pr),
    });
  });
  return { prevDate: prevWorkout.date, comparisons };
}

export default function CoachPage() {
  const reports = useStore((state) => state.coachReports);
  const workouts = useStore((state) => state.workouts);
  const bodyMetrics = useStore((state) => state.bodyMetrics);
  const globalCoachReport = useStore((state) => state.globalCoachReport);
  const refreshGlobalCoach = useStore((state) => state.refreshGlobalCoach);
  const setPage = useStore((state) => state.setPage);
  const showCompleteCoach = useStore((state) => state.showCompleteCoach);
  const setShowCompleteCoach = useStore((state) => state.setShowCompleteCoach);
  const selectedWorkoutId = useStore((state) => state.selectedWorkoutId);

  useEffect(() => {
    refreshGlobalCoach();
  }, []);

  const computed = useMemo(() => reports.length ? reports : workouts.slice(0, 12).map((workout) => buildCoachReport(workout, workouts)), [reports, workouts]);
  const latest = computed[0];
  const coach = globalCoachReport;

  const currentWorkout = useMemo(() => {
    if (!selectedWorkoutId) return workouts[0];
    return workouts.find((w) => w.id === selectedWorkoutId);
  }, [selectedWorkoutId, workouts]);
  const comparison = useMemo(() => computeComparison(currentWorkout, workouts), [currentWorkout, workouts]);

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

        <div className="coach-mini-stats">
          <div>
            <b>{coach.recovery.score}</b>
            <span style={{ color: coach.recovery.color }}>{coach.recovery.label}</span>
          </div>
          <div>
            <b>{coach.weekDays}</b>
            <span>días/ sem</span>
          </div>
          <div>
            <b>{coach.totalWorkouts}</b>
            <span>total</span>
          </div>
        </div>

        <div className="recovery-bar-track">
          <div className="recovery-bar-fill" style={{ width: `${coach.recovery.score}%`, background: coach.recovery.color }} />
        </div>

        {coach.prs.length > 0 && (
          <div className="coach-block prs">
            <span>🏆 Récords ({coach.prs.length})</span>
            {coach.prs.map((p, i) => <p key={i}>{p.msg}</p>)}
          </div>
        )}

        {comparison && comparison.comparisons.length > 0 && (
          <div className="coach-block comparison">
            <span>📊 vs {comparison.prevDate}</span>
            {comparison.comparisons.map((c) => (
              <div className="cmp-row" key={c.exercise}>
                <b>{c.exercise}</b>
                {c.delta != null ? (
                  <>
                    <span className={`delta ${c.delta > 0 ? "up" : c.delta < 0 ? "down" : "same"}`}>
                      {c.delta > 0 ? "+" : ""}{c.delta} kg
                    </span>
                    <span className={`delta ${c.deltaVol > 0 ? "up" : c.deltaVol < 0 ? "down" : "same"}`}>
                      {c.deltaVol > 0 ? "+" : ""}{Math.round(c.deltaVol)} vol
                    </span>
                  </>
                ) : (
                  <span className="delta new">Nuevo</span>
                )}
                <small>{c.prevWeight != null ? `${c.prevWeight}kg → ${c.currentWeight}kg` : `${c.currentWeight}kg`}</small>
              </div>
            ))}
          </div>
        )}

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
            <div className="coach-sections">
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
                  ? coach.trainingInsights.map((t, i) => (
                      <p key={i} className={t.startsWith("Balance") || t.startsWith("Promedio") || t.startsWith("Llevás") ? "insight-positive" : t.startsWith("Volumen semanal en descenso") || t.includes("3 días o menos") ? "insight-warn" : ""}>
                        {(t.startsWith("Balance") || t.startsWith("Promedio") || t.includes("Buena consistencia") || t.includes("equilibrado") || t.includes("Bien.")) ? "✓ " : t.startsWith("Volumen") || t.includes("cuidado") || t.includes("No se detectan") ? "⚠ " : "• "}{t}
                      </p>
                    ))
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
                  {coach.progressionInsights.map((p, i) => (
                    <p key={i} className={p.includes("estancado") || p.includes("mismo peso") ? "insight-warn" : "insight-positive"}>
                      {p.includes("estancado") || p.includes("mismo peso") ? "⚠ " : "↑ "}{p}
                    </p>
                  ))}
                </div>
              )}

              {coach.shoulderWarnings.length > 0 && (
                <div className="coach-block warn">
                  <span>Hombro</span>
                  {coach.shoulderWarnings.map((s, i) => <p key={i}>⚠️ {s}</p>)}
                </div>
              )}
            </div>

            <div className="recommendations-list">
              <span>Recomendaciones</span>
              {coach.recommendations.map((r, i) => (
                <div className="rec-item" key={i}>
                  <span className="rec-icon">{r.type === "progression" ? "↑" : r.type === "pr" ? "🏆" : r.type === "deload" ? "💤" : r.type === "training" ? "✓" : r.type === "body" ? "📏" : "●"}</span>
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
