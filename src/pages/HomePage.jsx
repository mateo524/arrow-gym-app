import useStore from "../store/useStore.js";
import { getWorkoutVolume } from "../lib/analytics.js";

function getWeekKey(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function HomePage() {
  const workouts = useStore((state) => state.workouts);
  const setPage = useStore((state) => state.setPage);
  const activeWorkout = useStore((state) => state.activeWorkout);
  const globalReport = useStore((state) => state.globalCoachReport);
  const last = workouts[0];
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
  const totalCardioMin = workouts.reduce((sum, w) => sum + (w.sets || []).reduce((s, set) => s + (Number(set.reps) || 0), 0), 0);
  const isStrength = (w) => !["Bicicleta", "Boxeo", "Cardio"].includes(w.type) && (w.sets || []).some((s) => Number(s.weight) > 0);
  const isCardio = (w) => ["Bicicleta", "Boxeo", "Cardio"].includes(w.type);
  const weekKey = getWeekKey(new Date().toISOString().slice(0, 10));
  const weekWorkouts = workouts.filter((w) => getWeekKey(w.date) === weekKey);
  const weekStrength = weekWorkouts.filter(isStrength).length;
  const weekCardio = weekWorkouts.filter(isCardio).length;
  const weekMin = weekWorkouts.reduce((sum, w) => sum + (w.sets || []).reduce((s, set) => s + (Number(set.reps) || 0), 0), 0);
  const weekDays = [...new Set(weekWorkouts.map((w) => w.date))].length;

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
        <div><b>{totalCardioMin}</b><span>min cardio</span></div>
      </div>

      <div className="card">
        <h2>Esta semana</h2>
        {weekWorkouts.length > 0 ? (
          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div><b>{weekStrength}</b><span>fuerza</span></div>
            <div><b>{weekCardio}</b><span>cardio</span></div>
            <div><b>{weekMin}</b><span>min</span></div>
            <div><b>{weekDays}</b><span>días</span></div>
          </div>
        ) : (
          <p>No hay entrenamientos esta semana todavía.</p>
        )}
        {globalReport?.weekBoxing > 0 && <p>🥊 {globalReport.weekBoxing}x boxeo</p>}
        {globalReport?.weekBike > 0 && <p>🚴 {globalReport.weekBike}x bici</p>}
      </div>

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
    </section>
  );
}
