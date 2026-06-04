import useStore, { ROUTINES } from "../store/useStore.js";

export default function StartWorkoutPage() {
  const startWorkout = useStore((state) => state.startWorkout);
  const startEmptyWorkout = useStore((state) => state.startEmptyWorkout);
  return <section className="page"><p className="eyebrow">Start Workout</p><h1>Elegí rutina</h1><div className="routine-grid">{Object.entries(ROUTINES).map(([name, exercises]) => <button key={name} className="routine-card" onClick={() => startWorkout(name)}><span>START</span><b>{name}</b><small>{exercises.length} ejercicios base</small></button>)}<button className="routine-card free" onClick={startEmptyWorkout}><span>START</span><b>Libre</b><small>Armalo desde cero</small></button></div></section>;
}
