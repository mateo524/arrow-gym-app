import useStore from "../store/useStore.js";
import { getWorkoutVolume, filterCurrentWeek, getMuscleIntensity } from "../lib/analytics.js";
import AdvancedMuscleDiagram from "../components/AdvancedMuscleDiagram.jsx";
import WorkoutCalendar from "../components/WorkoutCalendar.jsx";
import { useStreak, getWeekKey, getLastWeekWorkouts } from "../lib/hooks/useStreak.js";

export default function HomePage() {
  const workouts = useStore((state) => state.workouts);
  const setPage = useStore((state) => state.setPage);
  const activeWorkout = useStore((state) => state.activeWorkout);
  const globalReport = useStore((state) => state.globalCoachReport);
  const last = workouts[0];
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
  const totalCardioMin = workouts.filter((w) => ["Bicicleta", "Boxeo", "Cardio"].includes(w.type)).reduce((sum, w) => sum + (w.sets || []).reduce((s, set) => s + (Number(set.reps) || 0), 0), 0);
  const isStrength = (w) => !["Bicicleta", "Boxeo", "Cardio"].includes(w.type) && (w.sets || []).some((s) => Number(s.weight) > 0);
  const isCardio = (w) => ["Bicicleta", "Boxeo", "Cardio"].includes(w.type);
  const weekKey = getWeekKey(new Date().toISOString().slice(0, 10));
  const weekWorkouts = workouts.filter((w) => getWeekKey(w.date) === weekKey);
  const weekStrength = weekWorkouts.filter(isStrength).length;
  const weekCardio = weekWorkouts.filter(isCardio).length;
  const weekMin = weekWorkouts.reduce((sum, w) => sum + (w.sets || []).reduce((s, set) => s + (Number(set.reps) || 0), 0), 0);
  const weekDays = [...new Set(weekWorkouts.map((w) => w.date))].length;
  const intensity = getMuscleIntensity(filterCurrentWeek(workouts));
  const streak = useStreak(workouts);
  const lastWeek = getLastWeekWorkouts(workouts);
  const lastWeekDays = [...new Set(lastWeek.map((w) => w.date))].length;
  const lastWeekVolume = lastWeek.reduce((s, w) => s + getWorkoutVolume(w), 0);
  const thisWeekVolume = weekWorkouts.reduce((s, w) => s + getWorkoutVolume(w), 0);

  return (
    <section className="page" role="main" aria-label="Inicio">
      <div className="hero">
        <p className="eyebrow">Arrow Gym</p>
        <h1>Entrená rápido. Medí cada músculo.</h1>
        <p>Mapa muscular, radar por grupos y registro sin fricción.</p>
        <button className="primary big" onClick={() => setPage(activeWorkout ? "workout" : "start")} aria-label={activeWorkout ? "Continuar entrenamiento" : "Empezar entrenamiento"}>
          {activeWorkout ? "Continuar entrenamiento" : "Empezar entrenamiento"}
        </button>
      </div>

      <div className="stats-grid" role="list" aria-label="Estadísticas generales">
        <div role="listitem"><b>{workouts.length}</b><span>entrenos</span></div>
        <div role="listitem"><b>{totalSets}</b><span>series</span></div>
        <div role="listitem"><b>{streak > 0 ? `🔥${streak}` : totalCardioMin}</b><span>{streak > 0 ? "días seguidos" : "min cardio"}</span></div>
      </div>

      <div className="card" role="region" aria-label="Resumen semanal">
        <div className="card-head-row">
          <h2>Esta semana</h2>
          {lastWeekDays > 0 && (
            <small className={weekDays >= lastWeekDays ? "vs-up" : "vs-down"} aria-live="polite">
              {weekDays >= lastWeekDays ? "↑" : "↓"} {lastWeekDays} ant.
            </small>
          )}
        </div>
        {weekWorkouts.length > 0 ? (
          <>
            <div className="stats-grid" style={{ marginBottom: 0 }} role="list">
              <div role="listitem"><b>{weekStrength}</b><span>fuerza</span></div>
              <div role="listitem"><b>{weekCardio}</b><span>cardio</span></div>
              <div role="listitem"><b>{weekMin}</b><span>min</span></div>
              <div role="listitem"><b>{weekDays}</b><span>días</span></div>
            </div>
            <div className="week-goal-bar" role="progressbar" aria-valuenow={weekDays} aria-valuemin={0} aria-valuemax={5} aria-label={`${weekDays} de 5 días`}>
              <div className="week-goal-label">
                <span>Meta semanal</span>
                <b>{weekDays}/5 días</b>
              </div>
              <div className="week-goal-track">
                <div className="week-goal-fill" style={{ width: `${Math.min(100, (weekDays / 5) * 100)}%` }} />
              </div>
            </div>
            {lastWeekDays > 0 && (
              <div className="week-compare">
                <span>Volumen: {Math.round(thisWeekVolume / 100) / 10}k kg vs {Math.round(lastWeekVolume / 100) / 10}k kg la semana pasada</span>
              </div>
            )}
          </>
        ) : (
          <p>No hay entrenamientos esta semana todavía.</p>
        )}
        {globalReport?.weekBoxing > 0 && <p>🥊 {globalReport.weekBoxing}x boxeo</p>}
        {globalReport?.weekBike > 0 && <p>🚴 {globalReport.weekBike}x bici</p>}
      </div>

      <AdvancedMuscleDiagram intensity={intensity} />

      {last && (
        <button className="card as-button" onClick={() => useStore.getState().openWorkout(last.id)} aria-label={`Último entrenamiento: ${last.type}`}>
          <h2>Último entrenamiento</h2>
          <p>{last.type} · {last.date}</p>
          <strong>{last.sets.length} series · {Math.round(getWorkoutVolume(last))} kg</strong>
        </button>
      )}

      {globalReport?.alerts?.length > 0 && (
        <div className="notice" style={{ borderLeft: "3px solid #f59e0b" }} role="alert">
          <b>Coach dice</b>
          <p>{globalReport.alerts[0].msg}</p>
        </div>
      )}

      <WorkoutCalendar workouts={workouts} />
    </section>
  );
}
