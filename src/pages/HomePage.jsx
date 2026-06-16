import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { getWorkoutVolume, formatDate, getMuscleIntensity, filterCurrentWeek } from "../lib/analytics.js";
import Icon from "../components/Icon.jsx";

export default function HomePage() {
  const workouts = useStore((s) => s.workouts);
  const setPage = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const profile = useAuthStore((s) => s.profile);

  const last = workouts[0];
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
  const topMuscles = Object.entries(getMuscleIntensity(filterCurrentWeek(workouts)))
    .filter(([, d]) => d.level > 0)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);
  const name = profile?.name || profile?.email?.split("@")[0] || "Atleta";
  const initial = name[0].toUpperCase();
  const role = profile?.role;
  const isAdmin = role === "superadmin" || role === "admin";
  const isTrainer = role === "trainer";

  return (
    <section className="page">
      {/* Header con avatar que lleva al perfil */}
      <div className="home-header">
        <div style={{ flex: 1 }}>
          <p className="eyebrow">Pulse</p>
          <h1 style={{ margin: 0 }}>Hola, {name.split(" ")[0]}</h1>
        </div>
        <button
          className="profile-avatar"
          onClick={() => setPage("profile")}
          aria-label="Mi perfil"
        >
          {initial}
        </button>
      </div>

      {/* Hero */}
      <div className="hero" style={{ marginTop: 16 }}>
        <h1>Entrená rápido. Medí cada músculo.</h1>
        <p>Mapa muscular avanzado, radar por grupos y registro sin fricción durante el gym.</p>
        <button className="primary big" onClick={() => setPage(activeWorkout ? "workout" : "start")}>
          {activeWorkout ? "Continuar entrenamiento" : "Empezar entrenamiento"}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div><b>{workouts.length}</b><span>entrenamientos</span></div>
        <div><b>{totalSets}</b><span>series</span></div>
        <div><b>{last ? Math.round(getWorkoutVolume(last)) : 0}</b><span>kg último</span></div>
      </div>

      {/* Esta semana - resumen muscular */}
      <div style={{ marginTop: 14 }}>
        <p className="section-label">Esta semana</p>
        <div className="muscle-week-grid">
          {topMuscles.map(([muscle, data]) => (
            <div key={muscle} className={`muscle-week-chip level-${data.level}`}>
              <span>{muscle}</span>
              <small>{data.count} series</small>
            </div>
          ))}
          {topMuscles.length === 0 && <p style={{ color: "var(--muted)", fontSize: 12 }}>Sin actividad esta semana</p>}
        </div>
      </div>

      {/* Último entrenamiento */}
      {last && (
        <button className="card as-button" onClick={() => useStore.getState().openWorkout(last.id)}>
          <h2>Último entrenamiento</h2>
          <p>{last.type} · {formatDate(last.date)}</p>
          <strong>{last.sets.length} series · {Math.round(getWorkoutVolume(last))} kg</strong>
        </button>
      )}

      {/* Acceso rápido a admin/trainer */}
      {(isAdmin || isTrainer) && (
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {isTrainer || isAdmin ? (
            <button className="card as-button" style={{ flex: 1, margin: 0 }} onClick={() => setPage("trainer")}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="Users" size={18} style={{ color: "var(--cyan)" }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 13 }}>Mis clientes</strong>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: 11 }}>Rutinas y seguimiento</p>
                </div>
                <Icon name="ChevronRight" size={14} style={{ color: "var(--muted)" }} />
              </div>
            </button>
          ) : null}
          {isAdmin && (
            <button className="card as-button" style={{ flex: 1, margin: 0 }} onClick={() => setPage("admin")}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="ShieldCheck" size={18} style={{ color: "var(--green)" }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 13 }}>Panel Admin</strong>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: 11 }}>Gestionar usuarios</p>
                </div>
                <Icon name="ChevronRight" size={14} style={{ color: "var(--muted)" }} />
              </div>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
