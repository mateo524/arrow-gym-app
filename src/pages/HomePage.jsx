import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { getWorkoutVolume, formatDate } from "../lib/analytics.js";
import Icon from "../components/Icon.jsx";

export default function HomePage() {
  const workouts = useStore((s) => s.workouts);
  const setPage = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const amoled = useStore((s) => s.amoled);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const toggleAmoled = useStore((s) => s.toggleAmoled);
  const toggleSound = useStore((s) => s.toggleSound);
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);

  const last = workouts[0];
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);

  const role = profile?.role;
  const isAdmin = role === "superadmin" || role === "admin";
  const name = profile?.name || profile?.email?.split("@")[0] || "Atleta";
  const initial = name[0].toUpperCase();

  return (
    <section className="page">
      {/* Profile header */}
      <div className="home-header">
        <div>
          <p className="eyebrow">Arrow Gym</p>
          <h1 style={{ margin: 0 }}>Hola, {name.split(" ")[0]} 👋</h1>
        </div>
        <div className="profile-avatar">{initial}</div>
      </div>

      <div className="hero" style={{ marginTop: 16 }}>
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
          <p>{last.type} · {formatDate(last.date)}</p>
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

        {/* Logout button — always visible */}
        <div className="settings-row" style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 12 }}>
          <div>
            <label>Sesión</label>
            <small>{profile?.email}</small>
          </div>
          <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={logout}>
            Salir
          </button>
        </div>
      </div>

      {/* Only show for admins — regular users don't see this */}
      {isAdmin && (
        <div className="notice" style={{ marginTop: 14 }}>
          <b>Panel Admin activo</b>
          <p>Tenés acceso completo. Tus datos de entrenamiento se guardan en la nube y en este dispositivo.</p>
        </div>
      )}
    </section>
  );
}
