import useStore from "../store/useStore.js";
import { getWorkoutVolume } from "../lib/analytics.js";

export default function HistoryPage() {
  const workouts = useStore((state) => state.workouts);
  const openWorkout = useStore((state) => state.openWorkout);
  return (
    <section className="page">
      <p className="eyebrow">Historial</p>
      <h1>Entrenamientos</h1>
      <div className="history-list">
        {workouts.length === 0 ? (
          <p className="muted" style={{ marginTop: 20 }}>No hay entrenamientos registrados todavía.</p>
        ) : (
          workouts.map((workout) => (
            <button key={workout.id} className="history-card" onClick={() => openWorkout(workout.id)}>
              <div>
                <b>{workout.type}</b>
                <small>{workout.date}</small>
                {workout.tags?.length > 0 && <span className="tag-sm">{workout.tags[0]}</span>}
              </div>
              <span>{workout.sets.length} series</span>
              <strong>{Math.round(getWorkoutVolume(workout))} kg</strong>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
