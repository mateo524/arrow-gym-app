import { useState, useMemo } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { getWorkoutVolume, formatDate, getMuscleIntensity, filterCurrentWeek } from "../lib/analytics.js";
import AdvancedMuscleDiagram from "../components/AdvancedMuscleDiagram.jsx";
import Icon from "../components/Icon.jsx";

export default function HomePage() {
  const workouts = useStore((s) => s.workouts);
  const setPage = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const profile = useAuthStore((s) => s.profile);
  const [activeMuscle, setActiveMuscle] = useState(null);

  const last = workouts[0];
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
  const intensity = useMemo(() => getMuscleIntensity(filterCurrentWeek(workouts)), [workouts]);
  const name = profile?.name || profile?.email?.split("@")[0] || "Atleta";
  const initial = name[0].toUpperCase();
  const role = profile?.role;
  const isAdmin = role === "superadmin" || role === "admin";
  const isTrainer = role === "trainer";
  const isEmpty = workouts.length === 0;

  return (
    <section className="page">
      {/* Header */}
      <div className="home-header">
        <div style={{ flex: 1 }}>
          <p className="eyebrow">Pulse</p>
          <h1 style={{ margin: 0 }}>Hola, {name.split(" ")[0]}</h1>
        </div>
        <button className="profile-avatar" onClick={() => setPage("profile")} aria-label="Mi perfil">
          {initial}
        </button>
      </div>

      {/* Onboarding vacío */}
      {isEmpty ? (
        <div className="hero" style={{ marginTop: 16 }}>
          <p className="eyebrow" style={{ marginBottom: 4 }}>Bienvenido</p>
          <h2 style={{ margin: "0 0 12px" }}>Empezá en 3 pasos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {[
              { n: 1, text: "Elegí una rutina o entrenamiento libre" },
              { n: 2, text: "Cargá peso y repeticiones por serie" },
              { n: 3, text: "Finalizá y mirá tu mapa muscular" },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--green)", color: "#041009", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>{n}</div>
                <span style={{ fontSize: 14, color: "var(--text)" }}>{text}</span>
              </div>
            ))}
          </div>
          <button className="primary big" onClick={() => setPage("start")}>
            Empezar primer entrenamiento
          </button>
        </div>
      ) : (
        <>
          {/* Hero normal */}
          <div className="hero" style={{ marginTop: 16 }}>
            <h1>Entrená rápido. Medí cada músculo.</h1>
            <button className="primary big" onClick={() => setPage(activeWorkout ? "workout" : "start")}>
              {activeWorkout ? "Continuar entrenamiento" : "Empezar entrenamiento"}
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div><b>{workouts.length}</b><span>entrenos</span></div>
            <div><b>{totalSets}</b><span>series totales</span></div>
            <div><b>{last ? Math.round(getWorkoutVolume(last)) : 0}</b><span>kg último</span></div>
          </div>

          {/* Mapa muscular semanal */}
          <div style={{ marginTop: 14 }}>
            <p className="section-label">Mapa muscular — esta semana</p>
            <AdvancedMuscleDiagram
              intensity={intensity}
              onMuscleClick={(muscle) => setActiveMuscle(activeMuscle === muscle ? null : muscle)}
              activeMuscle={activeMuscle}
            />
            {activeMuscle && intensity[activeMuscle] && (
              <div className="mini-card" style={{ marginTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <i className={`legend-dot level-${intensity[activeMuscle].level}`} style={{ flexShrink: 0 }} />
                  <div>
                    <b>{activeMuscle}</b>
                    <span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>
                      {intensity[activeMuscle].count} series esta semana
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Último entrenamiento */}
          {last && (
            <button className="card as-button" onClick={() => useStore.getState().openWorkout(last.id)}>
              <h2>Último entrenamiento</h2>
              <p>{last.type} · {formatDate(last.date)}</p>
              <strong>{last.sets?.length ?? 0} series · {Math.round(getWorkoutVolume(last))} kg</strong>
            </button>
          )}
        </>
      )}

      {/* Acceso rápido admin/trainer */}
      {(isAdmin || isTrainer) && (
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {(isTrainer || isAdmin) && (
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
          )}
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
