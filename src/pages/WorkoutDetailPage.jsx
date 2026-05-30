import useStore from "../store/useStore.js";
import { getWorkoutVolume, hydrateSet } from "../lib/analytics.js";

function computeDeltas(current, previous) {
  if (!previous) return [];
  return (current?.sets || []).map((raw) => {
    const set = hydrateSet(raw);
    const prevSets = (previous.sets || []).filter((ps) => String(ps.exercise || "").trim().toLowerCase() === String(set.exercise || "").trim().toLowerCase());
    if (!prevSets.length) return { exercise: set.exercise, current: set, previous: null, delta: null };
    const prev = prevSets[prevSets.length - 1];
    const pw = Number(prev.weight) || 0;
    const pr = Number(prev.reps) || 0;
    const cw = Number(set.weight) || 0;
    const cr = Number(set.reps) || 0;
    const deltaWeight = cw - pw;
    const deltaVolume = (cw * cr) - (pw * pr);
    return { exercise: set.exercise, current: set, previous: prev, delta: { weight: deltaWeight, volume: deltaVolume } };
  });
}

export default function WorkoutDetailPage() {
  const id = useStore((state) => state.selectedWorkoutId);
  const workouts = useStore((state) => state.workouts);
  const setPage = useStore((state) => state.setPage);
  const workout = workouts.find((item) => item.id === id) || workouts[0];
  if (!workout) return <section className="page"><h1>Sin entrenamiento</h1></section>;

  const previous = workout.prevWorkoutId ? workouts.find((w) => w.id === workout.prevWorkoutId) : null;
  const deltas = computeDeltas(workout, previous);

  return (
    <section className="page">
      <div className="top-row">
        <div>
          <p className="eyebrow">Detalle</p>
          <h1>{workout.type}</h1>
        </div>
        <button className="ghost" onClick={() => setPage("coach")}>Coach</button>
      </div>
      <p className="muted">{workout.date} · {workout.sets.length} series · {Math.round(getWorkoutVolume(workout))} kg</p>
      {workout.tags?.length > 0 && (
        <div className="workout-tags">{workout.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      )}

      {previous && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-head-row"><span style={{ fontSize: 12, fontWeight: 700 }}>vs {previous.date}</span></div>
          {deltas.filter((d) => d.delta).map((d) => {
            const dir = d.delta.weight > 0 ? "up" : d.delta.weight < 0 ? "down" : "same";
            const volDir = d.delta.volume > 0 ? "up" : d.delta.volume < 0 ? "down" : "same";
            return (
              <div className="delta-row" key={d.exercise}>
                <b>{d.exercise}</b>
                <span className={`delta ${dir}`}>
                  {d.delta.weight > 0 ? "+" : ""}{d.delta.weight} kg
                </span>
                <span className={`delta ${volDir}`}>
                  {d.delta.volume > 0 ? "+" : ""}{Math.round(d.delta.volume)} vol
                </span>
              </div>
            );
          })}
        </div>
      )}

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
