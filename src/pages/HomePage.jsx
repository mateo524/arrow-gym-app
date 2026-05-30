import useStore from "../store/useStore.js";
import { getWorkoutVolume, filterCurrentWeek, getMuscleIntensity } from "../lib/analytics.js";
import AdvancedMuscleDiagram from "../components/AdvancedMuscleDiagram.jsx";
import WorkoutCalendar from "../components/WorkoutCalendar.jsx";

function getWeekKey(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function getConsecutiveDays(workouts) {
  if (!workouts || workouts.length === 0) return 0;
  const dates = [...new Set(workouts.map((w) => w.date))].sort().reverse();
  let streak = 1;
  const today = new Date().toISOString().slice(0, 10);
  if (dates[0] !== today && dates[0] !== yesterday()) return 0;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + "T12:00:00");
    const curr = new Date(dates[i] + "T12:00:00");
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getLastWeekWorkouts(workouts) {
  const now = new Date();
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekKey = getWeekKey(lastWeekStart.toISOString().slice(0, 10));
  return workouts.filter((w) => {
    const wk = getWeekKey(w.date);
    return wk === lastWeekKey;
  });
}

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
  const streak = getConsecutiveDays(workouts);
  const lastWeek = getLastWeekWorkouts(workouts);
  const lastWeekDays = [...new Set(lastWeek.map((w) => w.date))].length;
  const lastWeekVolume = lastWeek.reduce((s, w) => s + getWorkoutVolume(w), 0);
  const thisWeekVolume = weekWorkouts.reduce((s, w) => s + getWorkoutVolume(w), 0);

  return (
    <section className="page">
      <div className="hero">
        <p className="eyebrow">Arrow Gym</p>
        <h1>Entrená rápido. Medí cada músculo.</h1>
        <p>Mapa muscular, radar por grupos y registro sin fricción.</p>
        <button className="primary big" onClick={() => setPage(activeWorkout ? "workout" : "start")}>
          {activeWorkout ? "Continuar entrenamiento" : "Empezar entrenamiento"}
        </button>
      </div>

      <div className="stats-grid">
        <div><b>{workouts.length}</b><span>entrenos</span></div>
        <div><b>{totalSets}</b><span>series</span></div>
        <div><b>{streak > 0 ? `🔥${streak}` : totalCardioMin}</b><span>{streak > 0 ? "días seguidos" : "min cardio"}</span></div>
      </div>

      <div className="card">
        <div className="card-head-row">
          <h2>Esta semana</h2>
          {lastWeekDays > 0 && (
            <small className={weekDays >= lastWeekDays ? "vs-up" : "vs-down"}>
              {weekDays >= lastWeekDays ? "↑" : "↓"} {lastWeekDays} ant.
            </small>
          )}
        </div>
        {weekWorkouts.length > 0 ? (
          <>
            <div className="stats-grid" style={{ marginBottom: 0 }}>
              <div><b>{weekStrength}</b><span>fuerza</span></div>
              <div><b>{weekCardio}</b><span>cardio</span></div>
              <div><b>{weekMin}</b><span>min</span></div>
              <div><b>{weekDays}</b><span>días</span></div>
            </div>
            <div className="week-goal-bar">
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
        <button className="card as-button" onClick={() => useStore.getState().openWorkout(last.id)}>
          <h2>Último entrenamiento</h2>
          <p>{last.type} · {last.date}</p>
          <strong>{last.sets.length} series · {Math.round(getWorkoutVolume(last))} kg</strong>
        </button>
      )}

      {globalReport?.alerts?.length > 0 && (
        <div className="notice" style={{ borderLeft: "3px solid #f59e0b" }}>
          <b>Coach dice</b>
          <p>{globalReport.alerts[0].msg}</p>
        </div>
      )}

      <WorkoutCalendar workouts={workouts} />
    </section>
  );
}
