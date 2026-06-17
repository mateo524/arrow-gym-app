import { useState, useMemo } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { getWorkoutVolume, formatDate, getMuscleIntensity, filterCurrentWeek, getMuscleGroupFatigue, getNextWorkoutSuggestion, getDeloadSuggestion } from "../lib/analytics.js";
import AdvancedMuscleDiagram from "../components/AdvancedMuscleDiagram.jsx";
import Icon from "../components/Icon.jsx";
import { BODY_GROUPS } from "../data/exerciseDatabase.js";

const ACH_DEFS = {
  first_workout: { label: "Primera vez", icon: "🏋️" },
  workouts_10: { label: "10 entrenos", icon: "💪" },
  workouts_25: { label: "25 entrenos", icon: "🔥" },
  workouts_50: { label: "50 entrenos", icon: "⚡" },
  workouts_100: { label: "100 entrenos", icon: "🏆" },
  first_pr: { label: "Primer récord", icon: "🥇" },
  prs_10: { label: "10 récords", icon: "🎯" },
  streak_3: { label: "Racha 3 días", icon: "🔥" },
  streak_7: { label: "Semana completa", icon: "🌟" },
};

function computeStreak(workouts) {
  if (!workouts?.length) return 0;
  const dates = [...new Set(
    [...workouts].sort((a,b) => b.date.localeCompare(a.date))
      .map(w => w.date?.slice(0,10)).filter(Boolean)
  )];
  const today = new Date().toISOString().slice(0,10);
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 0, prev = null;
  for (const d of dates) {
    if (!prev) { streak=1; prev=d; continue; }
    const diff = Math.round((new Date(prev)-new Date(d))/86400000);
    if (diff === 1) { streak++; prev=d; } else break;
  }
  return streak;
}

export default function HomePage() {
  const workouts = useStore((s) => s.workouts);
  const setPage = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const profile = useAuthStore((s) => s.profile);
  const achievements = useStore((s) => s.achievements);
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
  const streak = computeStreak(workouts);

  const fatigue = useMemo(() => getMuscleGroupFatigue(workouts), [workouts]);
  const nextWorkout = useMemo(() => getNextWorkoutSuggestion(workouts), [workouts]);
  const deload = useMemo(() => getDeloadSuggestion(workouts), [workouts]);

  const monthDays = useMemo(() => {
    const prefix = new Date().toISOString().slice(0,7);
    return new Set(workouts.filter(w => w.date?.startsWith(prefix)).map(w => w.date?.slice(0,10))).size;
  }, [workouts]);

  const recentAch = useMemo(() => (achievements || []).filter(a => {
    const d = new Date();
    const u = new Date(a.unlockedAt + "T00:00:00");
    return (d - u) / 86400000 <= 30;
  }), [achievements]);

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
            {streak >= 2 && (
              <div className="streak-badge">🔥 {streak} días seguidos</div>
            )}
            {nextWorkout && (
              <div style={{ fontSize:12, color:"var(--muted)", marginBottom:8 }}>
                Recomendado hoy: <b style={{ color:"var(--green)" }}>{nextWorkout}</b>
              </div>
            )}
            {deload && (
              <div style={{ background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.3)", borderRadius:12, padding:"10px 12px", fontSize:13, marginBottom:10 }}>
                ⚠️ <b>Semana de descarga sugerida</b> — tu volumen lleva 3+ sesiones estancado. Bajá intensidad 40%.
              </div>
            )}
            <button className="primary big" onClick={() => setPage(activeWorkout ? "workout" : "start")}>
              {activeWorkout ? "Continuar entrenamiento" : "Empezar entrenamiento"}
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div><b>{workouts.length}</b><span>entrenos</span></div>
            <div><b>{totalSets}</b><span>series totales</span></div>
            <div><b>{last ? Math.round(getWorkoutVolume(last)) : 0}</b><span>kg último</span></div>
            <div><b>{monthDays}</b><span>días este mes</span></div>
          </div>

          {/* Logros recientes */}
          {recentAch.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <p className="section-label">Logros recientes</p>
              <div style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none" }}>
                {recentAch.map(a => {
                  const def = ACH_DEFS[a.id];
                  if (!def) return null;
                  return (
                    <div key={a.id} style={{ flexShrink:0, background:"var(--panel)", border:"1px solid rgba(34,211,120,.25)", borderRadius:14, padding:"10px 14px", textAlign:"center", minWidth:80 }}>
                      <div style={{ fontSize:24 }}>{def.icon}</div>
                      <div style={{ fontSize:11, color:"var(--text)", fontWeight:600, marginTop:4 }}>{def.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fatiga por grupo muscular */}
          {workouts.length > 0 && fatigue && (
            <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:12, scrollbarWidth:"none" }}>
              {BODY_GROUPS.map(group => {
                const f = fatigue[group];
                if (!f) return null;
                const color = f.fatigue === 3 ? "#ef4444" : f.fatigue === 2 ? "#f59e0b" : f.fatigue === 1 ? "#22d37a" : "var(--muted)";
                const label = f.daysSince >= 999 ? "sin datos" : f.daysSince === 0 ? "hoy" : `${f.daysSince}d`;
                return (
                  <div key={group} style={{ flexShrink:0, background:"var(--panel)", border:`1px solid ${color}33`, borderRadius:20, padding:"4px 10px", fontSize:11, display:"flex", gap:4, alignItems:"center" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:color, display:"inline-block" }} />
                    <span style={{ color:"var(--text)" }}>{group}</span>
                    <span style={{ color:"var(--muted)" }}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}

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
