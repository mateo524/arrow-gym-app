import useStore, { ROUTINES } from "../store/useStore.js";

const TYPE_ICONS = {
  Push: "💪", Pull: "🔙", Legs: "🦵", "Full Body": "🔥", Bicicleta: "🚴", Boxeo: "🥊", Libre: "⚡",
};

export default function StartWorkoutPage() {
  const startWorkout = useStore((state) => state.startWorkout);
  const startEmptyWorkout = useStore((state) => state.startEmptyWorkout);
  return (
    <section className="page">
      <p className="eyebrow">Start Workout</p>
      <h1>Elegí entrenamiento</h1>
      <div className="start-categories">
        <p className="eyebrow" style={{ marginTop: 16 }}>Gimnasio</p>
        <div className="routine-grid">
          {Object.entries(ROUTINES).filter(([k]) => !["Bicicleta", "Boxeo"].includes(k)).map(([name, exercises]) => (
            <button key={name} className="routine-card" onClick={() => startWorkout(name)}>
              <span>{TYPE_ICONS[name] || "START"}</span>
              <b>{name}</b>
              <small>{exercises.length} ejercicios</small>
            </button>
          ))}
        </div>
        <p className="eyebrow" style={{ marginTop: 16 }}>Cardio</p>
        <div className="routine-grid">
          {["Bicicleta", "Boxeo"].map((name) => {
            const exercises = ROUTINES[name];
            return (
              <button key={name} className="routine-card cardio" onClick={() => startWorkout(name)}>
                <span>{TYPE_ICONS[name]}</span>
                <b>{name}</b>
                <small>{exercises.length} fases · 25-60 min</small>
              </button>
            );
          })}
        </div>
        <button className="routine-card free" onClick={startEmptyWorkout} style={{ marginTop: 12 }}>
          <span>{TYPE_ICONS.Libre}</span>
          <b>Libre</b>
          <small>Elegí ejercicios sobre la marcha</small>
        </button>
      </div>
    </section>
  );
}
