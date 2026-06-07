import useStore from "../store/useStore.js";
import { getWorkoutVolume, formatDate } from "../lib/analytics.js";

export default function HistoryPage() {
  const workouts = useStore((state) => state.workouts);
  const openWorkout = useStore((state) => state.openWorkout);

  return (
    <section className="page">
      <p className="eyebrow">Historial</p>
      <h1>Entrenamientos</h1>

      {workouts.length === 0 ? (
        <div className="notice">
          <b>Sin entrenamientos</b>
          <p>Empezá tu primer entrenamiento desde la sección Start.</p>
        </div>
      ) : (
        <div className="history-list">
          {workouts.map((workout) => (
            <button key={workout.id} className="history-card" onClick={() => openWorkout(workout.id)}>
              <div>
                <b>{workout.type}</b>
                <small>{formatDate(workout.date)}</small>
              </div>
              <span>{workout.sets.length} series</span>
              <strong>{Math.round(getWorkoutVolume(workout))} kg</strong>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
