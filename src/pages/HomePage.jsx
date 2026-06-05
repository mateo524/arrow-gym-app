import useStore from "../store/useStore.js";
import { getWorkoutVolume } from "../lib/analytics.js";
import Icon from "../components/Icon.jsx";

export default function HomePage() {
  const workouts = useStore((state) => state.workouts);
  const setPage = useStore((state) => state.setPage);
  const activeWorkout = useStore((state) => state.activeWorkout);
  const amoled = useStore((state) => state.amoled);
  const soundEnabled = useStore((state) => state.soundEnabled);
  const toggleAmoled = useStore((state) => state.toggleAmoled);
  const toggleSound = useStore((state) => state.toggleSound);
  const last = workouts[0];
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
  return (
    <section className="page">
      <div className="hero">
        <p className="eyebrow">Arrow Gym V4</p>
        <h1>Entrená rápido. Medí cada músculo.</h1>
        <p>Mapa muscular avanzado, radar por grupos y registro sin fricción durante el gym.</p>
        <button className="primary big" onClick={() => setPage(activeWorkout ? "workout" : "start")}>
          {activeWorkout ? "Continuar entrenamiento" : "Empezar entrenamiento"}
        </button>
      </div>

      <div className="stats-grid">
        <div><b>{workouts.length}</b><span>entrenamientos</span></div>
        <div><b>{totalSets}</b><span>series</span></div>
        <div><b>{last ? Math.round(getWorkoutVolume(last)) : 0}</b><span>kg último</span></div>
      </div>

      {last && (
        <button className="card as-button" onClick={() => useStore.getState().openWorkout(last.id)}>
          <h2>Último entrenamiento</h2>
          <p>{last.type} · {last.date}</p>
          <strong>{last.sets.length} series · {Math.round(getWorkoutVolume(last))} kg</strong>
        </button>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Configuración</h2>

        <div className="settings-row">
          <div>
            <label>Modo AMOLED</label>
            <small>Fondo negro puro para pantallas OLED</small>
          </div>
          <button className={`toggle${amoled ? " on" : ""}`} onClick={toggleAmoled} aria-label="Toggle AMOLED mode" aria-pressed={amoled} />
        </div>

        <div className="settings-row">
          <div>
            <label>Sonido descanso</label>
            <small>Beep al terminar el temporizador</small>
          </div>
          <button className={`toggle${soundEnabled ? " on" : ""}`} onClick={toggleSound} aria-label="Toggle sound" aria-pressed={soundEnabled} />
        </div>
      </div>

      <div className="notice" style={{ marginTop: 14 }}>
        <b>Datos anteriores</b>
        <p>La app intenta migrar entrenamientos viejos del mismo dominio/localStorage. Si cambiaste de URL, Safari no puede compartir esos datos automáticamente.</p>
      </div>
    </section>
  );
}
