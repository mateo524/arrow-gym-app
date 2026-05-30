import useStore from "../store/useStore.js";
import { getWorkoutVolume, hydrateSet } from "../lib/analytics.js";

export default function WorkoutDetailPage() {
  const id = useStore((state) => state.selectedWorkoutId);
  const workouts = useStore((state) => state.workouts);
  const workout = workouts.find((item) => item.id === id) || workouts[0];
  if (!workout) return <section className="page"><h1>Sin entrenamiento</h1></section>;
  return (
    <section className="page">
      <p className="eyebrow">Detalle</p>
      <h1>{workout.type}</h1>
      <p className="muted">{workout.date} · {workout.sets.length} series · {Math.round(getWorkoutVolume(workout))} kg</p>
      <div className="sets-list">
        {workout.sets.map((raw) => {
          const set = hydrateSet(raw);
          return (
            <div className="detail-row" key={set.id}>
              <div>
                <b>{set.exercise}</b>
                <small>{set.group} · {set.muscle}</small>
              </div>
              <span>{set.weight || 0}kg × {set.reps || 0}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
