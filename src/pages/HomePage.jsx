import { useState, useMemo, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { todayLocal } from "../lib/dates.js";
import { getWorkoutVolume, formatDate, getMuscleIntensity, filterCurrentWeek, getNextWorkoutSuggestion, getDeloadSuggestion } from "../lib/analytics.js";
import AdvancedMuscleDiagram from "../components/AdvancedMuscleDiagram.jsx";
import Icon from "../components/Icon.jsx";

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

export default function HomePage() {
  const { workouts, restDays, setPage, activeWorkout, achievements, prs, cardioHistory, weeklyGoal } = useStore(
    useShallow(s => ({
      workouts: s.workouts,
      restDays: s.restDays || [],
      setPage: s.setPage,
      activeWorkout: s.activeWorkout,
      achievements: s.achievements,
      prs: s.prs || [],
      cardioHistory: s.cardioHistory || [],
      weeklyGoal: s.weeklyGoal || 4,
    }))
  );
  const profile = useAuthStore((s) => s.profile);
  const [activeMuscle, setActiveMuscle] = useState(null);
  const last = workouts[0];
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
  const intensity = useMemo(() => {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekCardio = cardioHistory.filter(c => (c.date || "") >= weekStartStr);
    return getMuscleIntensity(filterCurrentWeek(workouts), weekCardio);
  }, [workouts, cardioHistory]);
  const name = profile?.name || profile?.email?.split("@")[0] || "Atleta";
  const initial = name[0].toUpperCase();
  const role = profile?.role;
  const isAdmin = role === "superadmin" || role === "admin";
  const isTrainer = role === "trainer";
  const isEmpty = workouts.length === 0;

  const streak = useMemo(() => {
    const allDays = new Set([
      ...(workouts || []).map(w => w.date),
      ...(restDays || []).map(r => r.date),
    ]);
    let count = 0;
    const d = new Date();
    const todayStr = d.toISOString().slice(0,10);
    const yest = new Date(d); yest.setDate(yest.getDate()-1);
    const yesterdayStr = yest.toISOString().slice(0,10);
    if (!allDays.has(todayStr) && !allDays.has(yesterdayStr)) return 0;
    const start = allDays.has(todayStr) ? d : yest;
    const check = new Date(start);
    while (true) {
      const s = check.toISOString().slice(0,10);
      if (!allDays.has(s)) break;
      count++;
      check.setDate(check.getDate()-1);
    }
    return count;
  }, [workouts, restDays]);

  const nextWorkout = useMemo(() => getNextWorkoutSuggestion(workouts), [workouts]);
  const deload = useMemo(() => getDeloadSuggestion(workouts), [workouts]);

  // Weekly summary — last Mon→Sun
  const monthDays = useMemo(() => {
    const prefix = todayLocal().slice(0,7);
    return new Set(workouts.filter(w => w.date?.startsWith(prefix)).map(w => w.date?.slice(0,10))).size;
  }, [workouts]);

  const recentAch = useMemo(() => (achievements || []).filter(a => {
    if (!a.unlockedAt) return false;
    const d = new Date();
    const u = new Date(a.unlockedAt.slice(0, 10) + "T12:00:00");
    return (d - u) / 86400000 <= 30;
  }), [achievements]);

  const weekCalendar = useMemo(() => {
    const workoutDates = new Set((workouts || []).map(w => w.date?.slice(0,10)).filter(Boolean));
    const today = new Date();
    const todayStr = today.toISOString().slice(0,10);
    const DAY_NAMES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    // Always start on Monday of the current week (ISO week)
    const dayOfWeek = today.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + mondayOffset + i);
      const key = d.toISOString().slice(0,10);
      return { key, dayName: DAY_NAMES[d.getDay()], dayNum: d.getDate(), trained: workoutDates.has(key), isToday: key === todayStr };
    });
  }, [workouts]);

  return (
    <section className="page">
      {/* Header */}
      <div className="home-header">
        <div style={{ flex: 1 }}>
          <p className="eyebrow">Loop</p>
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
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>{n}</div>
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
          {/* ── Top metrics row: racha + objetivo semanal ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14, marginBottom:14 }}>
            {/* Racha */}
            {(() => {
              const isMilestone = streak > 0 && [3,7,14,21,30,60,90,100,365].includes(streak);
              const milestoneMsg = streak >= 365 ? "¡Leyenda! 🐐" : streak >= 100 ? "¡Centenario! 💎" : streak >= 60 ? "¡Imparable!" : streak >= 30 ? "¡Un mes! 🥇" : streak >= 21 ? "¡3 semanas!" : streak >= 14 ? "¡2 semanas!" : streak >= 7 ? "¡Una semana!" : "¡3 días! 💪";
              return (
                <div style={{ background: isMilestone ? "linear-gradient(135deg,rgba(245,158,11,.18),rgba(251,191,36,.08))" : "var(--panel)", border: isMilestone ? "1px solid rgba(245,158,11,.4)" : "1px solid var(--line)", borderRadius:16, padding:"14px 12px", display:"flex", alignItems:"center", gap:10, position:"relative", overflow:"hidden" }}>
                  {isMilestone && <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 30% 50%, rgba(245,158,11,.08), transparent 70%)", pointerEvents:"none" }} />}
                  <span style={{ fontSize: streak >= 7 ? 32 : 26, animation: isMilestone ? "pulse 1s ease-in-out 3" : "none" }}>
                    {streak === 0 ? "💤" : streak >= 30 ? "🔥" : streak >= 7 ? "🔥" : "🔥"}
                  </span>
                  <div>
                    <div style={{ fontSize: streak >= 7 ? 26 : 22, fontWeight:900, color:"#f59e0b", lineHeight:1 }}>{streak}</div>
                    <div style={{ fontSize:11, color: isMilestone ? "#f59e0b" : "var(--muted)", marginTop:2, fontWeight: isMilestone ? 700 : 400 }}>
                      {streak === 0 ? "sin racha" : isMilestone ? milestoneMsg : `día${streak !== 1 ? "s" : ""} de racha`}
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* Objetivo semanal */}
            {(() => {
              const goal = weeklyGoal;
              const done = weekCalendar.filter(d => d.trained).length;
              const pct = Math.min(1, done / goal);
              const R = 20, C = 2 * Math.PI * R;
              return (
                <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"14px 12px", display:"flex", alignItems:"center", gap:10 }}>
                  <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink:0 }}>
                    <circle cx={26} cy={26} r={R} fill="none" stroke="rgba(168,85,247,.12)" strokeWidth={5} />
                    <circle cx={26} cy={26} r={R} fill="none" stroke="var(--green)" strokeWidth={5}
                      strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
                      transform="rotate(-90 26 26)" />
                    <text x={26} y={30} textAnchor="middle" fill="var(--text)" fontSize={13} fontWeight={900}>{done}/{goal}</text>
                  </svg>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>Objetivo semanal</div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{goal - done > 0 ? `${goal - done} entrenos restantes` : "¡Meta cumplida! 🎉"}</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Próxima meta */}
          {(() => {
            if (!prs.length) return null;
            const latest = [...prs].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0];
            if (!latest) return null;
            const nextGoal = Math.ceil(Number(latest.weight) / 2.5) * 2.5 + 2.5;
            return (
              <div style={{ background:"rgba(168,85,247,.06)", border:"1px solid rgba(168,85,247,.2)", borderRadius:14, padding:"10px 14px", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:20 }}>🎯</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700 }}>Próxima meta</div>
                  <div style={{ fontSize:12, color:"var(--muted)" }}>{latest.exercise}: <b style={{ color:"var(--green)" }}>{nextGoal}kg</b></div>
                </div>
              </div>
            );
          })()}

          {/* CTA */}
          <div style={{ marginBottom:14 }}>
            {nextWorkout && (
              <div style={{ fontSize:12, color:"var(--muted)", marginBottom:8 }}>
                Recomendado hoy: <b style={{ color:"var(--green)" }}>{nextWorkout}</b>
              </div>
            )}
            {deload && (
              <div style={{ background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.3)", borderRadius:12, padding:"10px 12px", fontSize:13, marginBottom:10 }}>
                ⚠️ <b>Semana de descarga sugerida</b> — bajá los pesos al 60% esta semana.
              </div>
            )}
            <button className="primary big" onClick={() => setPage(activeWorkout ? "workout" : "start")}>
              {activeWorkout ? "▶ Continuar entrenamiento" : "▶ Empezar entrenamiento"}
            </button>
          </div>

          {/* Animated stats */}
          {(() => {
            const weekStart = new Date();
            const dow = weekStart.getDay(); const off = dow===0?-6:1-dow;
            weekStart.setDate(weekStart.getDate()+off); weekStart.setHours(0,0,0,0);
            const weekWorkouts = workouts.filter(w => w.date >= weekStart.toISOString().slice(0,10));
            const weekVolume = weekWorkouts.reduce((s,w) => s+(w.sets||[]).reduce((sv,set)=>sv+(Number(set.weight)||0)*(Number(set.reps)||0),0),0);
            const todayStr = todayLocal();
            const mealLog = useStore.getState().mealLog || [];
            const todayKcal = mealLog.filter(m=>m.date===todayStr).reduce((s,m)=>s+(Number(m.kcal)||0),0);
            const maxWeekVol = 50000;
            const pctVol = Math.min(100, (weekVolume/maxWeekVol)*100);
            return (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                {/* Weekly volume */}
                <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"14px 14px 12px" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Vol. semanal</div>
                  <div style={{ fontSize:20, fontWeight:900, color:"var(--green)", marginBottom:8, lineHeight:1 }}>
                    {weekVolume >= 1000 ? `${(weekVolume/1000).toFixed(1)}k` : weekVolume}<span style={{ fontSize:12, fontWeight:400, color:"var(--muted)", marginLeft:3 }}>kg</span>
                  </div>
                  <div style={{ height:5, background:"rgba(255,255,255,.08)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ width:`${pctVol}%`, height:"100%", background:"var(--green)", borderRadius:4, transition:"width 1s ease" }} />
                  </div>
                </div>
                {/* Daily calories */}
                <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"14px 14px 12px" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Calorías hoy</div>
                  <div style={{ fontSize:20, fontWeight:900, color:todayKcal>0?"#f59e0b":"var(--muted)", marginBottom:8, lineHeight:1 }}>
                    {todayKcal>0?todayKcal:"—"}{todayKcal>0&&<span style={{ fontSize:12, fontWeight:400, color:"var(--muted)", marginLeft:3 }}>kcal</span>}
                  </div>
                  {/* Mini weekly bars */}
                  <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:20 }}>
                    {weekCalendar.map(({ key, trained }) => {
                      const dayKcal = mealLog.filter(m=>m.date===key).reduce((s,m)=>s+(Number(m.kcal)||0),0);
                      const h = Math.min(20, Math.max(2, dayKcal>0?(dayKcal/3000)*20:trained?8:2));
                      return <div key={key} style={{ flex:1, height:h, borderRadius:2, background: dayKcal>0?"#f59e0b":trained?"rgba(168,85,247,.25)":"rgba(255,255,255,.08)", transition:"height .5s ease" }} />;
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Weekly calendar strip */}
          <div className="week-calendar">
            {weekCalendar.map(({ key, dayName, dayNum, trained, isToday }) => {
              const isRest = (restDays||[]).some(r => r.date === key);
              return (
              <div key={key} className={`week-cal-day${trained ? " trained" : ""}${isToday ? " today" : ""}${isRest && !trained ? " rest" : ""}`}
                style={isRest && !trained ? { background:"rgba(6,182,212,.15)", border:"1.5px solid rgba(6,182,212,.5)" } : {}}>
                <span className="week-cal-name" style={isRest&&!trained?{color:"#06b6d4"}:{}}>{dayName}</span>
                <span className="week-cal-num" style={isRest&&!trained?{color:"#06b6d4"}:{}}>{dayNum}</span>
                {isRest && !trained && <span style={{ fontSize:8, marginTop:1, color:"#06b6d4" }}>💤</span>}
                {trained && <span className="week-cal-dot" />}
              </div>
              );
            })}
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


          {/* Mapa muscular semanal */}
          <div style={{ marginTop: 14 }}>
            <p className="section-label">Mapa muscular — esta semana</p>
            <AdvancedMuscleDiagram
              workouts={workouts}
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
            <div>
              <p className="section-label">Último entrenamiento</p>
              <button className="card as-button" style={{ marginTop:0 }} onClick={() => useStore.getState().openWorkout(last.id)}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <h2 style={{ margin:"0 0 3px", fontSize:16 }}>{last.type}</h2>
                    <p style={{ margin:"0 0 4px", fontSize:12 }}>{formatDate(last.date)}</p>
                    <strong>{last.sets?.length ?? 0} series · {Math.round(getWorkoutVolume(last))} kg</strong>
                  </div>
                  <Icon name="ChevronRight" size={16} style={{ color:"var(--muted)", flexShrink:0, marginTop:2 }} />
                </div>
              </button>
              <button
                className="ghost"
                style={{ width:"100%", marginTop:8, fontSize:13 }}
                onClick={() => setPage("history")}
              >
                Ver todo el historial
              </button>
            </div>
          )}
        </>
      )}

      {/* Quick access grid */}
      {!isEmpty && (
        <div style={{ marginTop: 14, marginBottom: 4 }}>
          <p className="section-label">Accesos rápidos</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { id: "history",      icon: "BarChart2",     label: "Historial",  color: "var(--accent)" },
              { id: "routines",     icon: "ClipboardList", label: "Rutinas",    color: "#a78bfa" },
              { id: "calendar",     icon: "Calendar",      label: "Calendario", color: "var(--cyan)" },
              { id: "badges",       icon: "Trophy",        label: "Logros",     color: "#f59e0b" },
            ].map(({ id, icon, label, color }) => (
              <button key={id} onClick={() => setPage(id)} style={{
                background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14,
                padding: "12px 6px", display: "flex", flexDirection: "column", alignItems: "center",
                gap: 6, cursor: "pointer",
              }}>
                <Icon name={icon} size={20} style={{ color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
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

