import useStore, { ROUTINES } from "../store/useStore.js";
import Icon from "../components/Icon.jsx";

export default function StartWorkoutPage() {
  const startWorkout = useStore((state) => state.startWorkout);
  const startEmptyWorkout = useStore((state) => state.startEmptyWorkout);
  const setPage = useStore((state) => state.setPage);
  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("home")} aria-label="Back">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
        <div className="page-head-titles">
          <p className="eyebrow">Start Workout</p>
          <h1>Elegí rutina</h1>
        </div>
      </div>
      <div className="routine-grid">
        {Object.entries(ROUTINES).map(([name, exercises]) => (
          <button key={name} className="routine-card" onClick={() => startWorkout(name)}>
            <span>START</span>
            <b>{name}</b>
            <small>{exercises.length} ejercicios base</small>
          </button>
        ))}
        <button className="routine-card free" onClick={startEmptyWorkout}>
          <span>START</span>
          <b>Libre</b>
          <small>Armalo desde cero</small>
        </button>
      </div>
    </section>
  );
}
