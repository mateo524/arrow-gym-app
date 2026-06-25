import { useState, useMemo } from "react";
import useStore from "../store/useStore.js";
import { todayLocal } from "../lib/dates.js";
import { getWorkoutVolume, formatDate } from "../lib/analytics.js";
import ExerciseProgressChart from "../components/ExerciseProgressChart.jsx";
import Icon from "../components/Icon.jsx";


const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_LABELS = ["L","M","X","J","V","S","D"];

function buildMonthCalendar(workouts, year, month) {
  const dateMap = {};
  for (const w of workouts) {
    if (!w.date) continue;
    const key = w.date.slice(0, 10);
    if (!dateMap[key]) dateMap[key] = [];
    dateMap[key].push(w);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = todayLocal();
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayWorkouts = dateMap[iso] || [];
    const count = dayWorkouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
    let level = 0;
    if (count > 0 && count <= 5) level = 1;
    else if (count > 5 && count <= 15) level = 2;
    else if (count > 15) level = 3;
    cells.push({ iso, count, level, day: d, isToday: iso === todayIso, workouts: dayWorkouts });
  }

  const monthCount = workouts.filter(w => w.date?.startsWith(monthPrefix)).length;
  return { cells, monthCount };
}

function CalendarMonth({ workouts, year, month, onDayClick, selectedDate }) {
  const { cells, monthCount } = useMemo(() => buildMonthCalendar(workouts, year, month), [workouts, year, month]);

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    const row = cells.slice(i, i + 7);
    while (row.length < 7) row.push(null);
    rows.push(row);
  }

  return (
    <div className="cal-heatmap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <b style={{ fontSize: 15 }}>{MONTH_NAMES[month]} {year}</b>
        <small style={{ color: "var(--muted)", fontSize: 12 }}>{monthCount} entrenamiento{monthCount !== 1 ? "s" : ""}</small>
      </div>
      <div className="cal-week-labels">
        {DAY_LABELS.map((d) => <span key={d}>{d}</span>)}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="cal-grid" style={{ marginBottom: 3 }}>
          {row.map((cell, ci) =>
            cell ? (
              <button
                key={ci}
                className={`cal-day cal-day-${cell.level}${cell.isToday ? " cal-day-today" : ""}${selectedDate === cell.iso ? " cal-day-selected" : ""}`}
                onClick={() => cell.workouts.length > 0 ? onDayClick(cell.iso, cell.workouts) : null}
                title={`${cell.iso}: ${cell.count} series`}
                style={{ cursor: cell.workouts.length > 0 ? "pointer" : "default", border: "none", padding: 0 }}
              >
                <span className="cal-day-num">{cell.day}</span>
              </button>
            ) : (
              <div key={ci} className="cal-day cal-day-empty" />
            )
          )}
        </div>
      ))}
    </div>
  );
}

function getBestSet(workout) {
  const sets = (workout.sets || []).filter(s => Number(s.weight) > 0 && Number(s.reps) > 0);
  if (!sets.length) return null;
  return sets.reduce((best, s) => (Number(s.weight) * Number(s.reps) > Number(best.weight) * Number(best.reps) ? s : best));
}

function getUniqueExercises(workout) {
  const seen = new Set();
  const exercises = [];
  for (const s of (workout.sets || [])) {
    if (s.exercise && !seen.has(s.exercise)) {
      seen.add(s.exercise);
      exercises.push(s.exercise);
    }
  }
  return exercises;
}

export default function HistoryPage() {
  const workouts = useStore((state) => state.workouts);
  const restDays = useStore(s => s.restDays) || [];
  const prs = useStore((state) => state.prs) ?? [];
  const cardioHistory = useStore(s => s.cardioHistory) || [];
  const setPage = useStore((state) => state.setPage);
  const openWorkout = useStore((state) => state.openWorkout);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const [historyPage, setHistoryPage] = useState(30);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    const now = today;
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
  }

  function handleDayClick(iso, dayWorkouts) {
    if (selectedDate === iso) {
      setSelectedDate(null);
      setSelectedWorkouts([]);
    } else {
      setSelectedDate(iso);
      setSelectedWorkouts(dayWorkouts);
    }
  }

  function handleWorkoutItemClick(workoutId) {
    setExpandedWorkoutId(prev => prev === workoutId ? null : workoutId);
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const prDates = new Set(prs.map(p => p.date));

  const allEntries = useMemo(() => {
    const entries = [
      ...(workouts || []).map(w => ({ ...w, _type: 'workout' })),
      ...(restDays || []).map(r => ({ id: 'rest-' + r.date, date: r.date, _type: 'rest' })),
      ...(cardioHistory || []).map(c => ({ ...c, _type: 'cardio' })),
    ];
    return entries.sort((a,b) => String(b.date).localeCompare(String(a.date)));
  }, [workouts, restDays, cardioHistory]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return allEntries;
    const q = searchQuery.trim().toLowerCase();
    return allEntries.filter(entry => {
      if (entry._type === 'rest') return false;
      return (entry.sets || []).some(s => s.exercise && s.exercise.toLowerCase().includes(q));
    });
  }, [allEntries, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("home")} aria-label="Volver">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
        <div className="page-head-titles">
          <p className="eyebrow">Historial</p>
          <h1>Entrenamientos</h1>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 14 }}>
        <input
          type="text"
          placeholder="Buscar por ejercicio..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "var(--panel)",
            color: "var(--text)",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Calendar and month nav — hidden when searching */}
      {!isSearching && (
        <>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <button className="ghost" style={{ padding: "8px 14px", fontSize: 18 }} onClick={prevMonth}>‹</button>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button className="ghost" style={{ padding: "8px 14px", fontSize: 18, opacity: isCurrentMonth ? 0.3 : 1 }} onClick={nextMonth} disabled={isCurrentMonth}>›</button>
            <button
              className="ghost"
              style={{ padding:"6px 12px", fontSize:12, color: compareMode ? "var(--green)" : "var(--muted)", border: compareMode ? "1px solid var(--green)" : "1px solid var(--line)", borderRadius:10 }}
              onClick={() => { setCompareMode(m => !m); setCompareIds([]); }}
            >
              {compareMode ? "Cancelar" : "Comparar"}
            </button>
          </div>

          <CalendarMonth
            workouts={workouts}
            year={viewYear}
            month={viewMonth}
            onDayClick={handleDayClick}
            selectedDate={selectedDate}
          />

          {/* Day detail popup */}
          {selectedDate && selectedWorkouts.length > 0 && (
            <div className="card" style={{ marginBottom: 14 }}>
              <p className="eyebrow" style={{ marginBottom: 6 }}>{selectedDate}</p>
              {selectedWorkouts.map(w => {
                const best = getBestSet(w);
                return (
                  <button key={w.id} className="history-card" onClick={() => openWorkout(w.id)}>
                    <div>
                      <b>{w.type}</b>
                      <small>{w.sets?.length ?? 0} series</small>
                    </div>
                    {best && <span style={{ fontSize: 12 }}>{best.exercise} {best.weight}kg×{best.reps}</span>}
                    <strong>{Math.round(getWorkoutVolume(w))} kg</strong>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {workouts.length === 0 ? (
        <div className="notice" style={{ textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
          <b>Sin entrenamientos todavía</b>
          <p>Registrá tu primera sesión y empezá a ver tu progreso acá.</p>
          <button className="primary" style={{ marginTop: 8 }} onClick={() => useStore.getState().setPage("start")}>
            Empezar ahora
          </button>
        </div>
      ) : (
        <div className="history-list">
          {/* Search results */}
          {isSearching && (() => {
            if (filteredEntries.length === 0) {
              return (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)", fontSize: 14 }}>
                  No se encontraron entrenamientos con ese ejercicio.
                </div>
              );
            }
            return filteredEntries.map(entry => {
              if (entry._type !== 'workout') return null;
              const workout = entry;
              const best = getBestSet(workout);
              const hasPr = prDates.has(workout.date);
              const isExpanded = expandedWorkoutId === workout.id;
              const uniqueExercises = getUniqueExercises(workout);
              return (
                <div key={workout.id} style={{ marginBottom: 8 }}>
                  <button
                    className="history-card"
                    style={{ flex: 1, width: "100%" }}
                    onClick={() => handleWorkoutItemClick(workout.id)}
                  >
                    <div>
                      <b>{workout.type}</b>
                      <small>{formatDate(workout.date)}</small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {best && <small style={{ display: "block", color: "var(--muted)", fontSize: 11 }}>{best.exercise} {best.weight}kg</small>}
                      {hasPr && <span style={{ color: "var(--yellow)", fontSize: 10, fontWeight: 700 }}>⭐ PR</span>}
                    </div>
                    <strong>{workout.sets?.length ?? 0} series</strong>
                  </button>
                  {isExpanded && uniqueExercises.length > 0 && (
                    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12, padding: 12, marginTop: 4 }}>
                      {uniqueExercises.map(exercise => (
                        <ExerciseProgressChart key={exercise} exerciseName={exercise} workouts={workouts} />
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()}

          {/* Full history list (no search active) */}
          {!isSearching && !selectedDate && (() => {
            let lastMonth = null;
            const items = [];
            const visibleEntries = allEntries.slice(0, historyPage);
            for (const entry of visibleEntries) {
              const entryMonth = entry.date ? String(entry.date).slice(0, 7) : null;
              if (entryMonth && entryMonth !== lastMonth) {
                lastMonth = entryMonth;
                const [y, m] = entryMonth.split("-");
                const monthLabel = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
                const workoutsInMonth = (workouts || []).filter(w => w.date?.startsWith(entryMonth));
                const monthVolume = workoutsInMonth.reduce((sum, w) => sum + (w.sets||[]).reduce((s2, s) => s2 + (Number(s.weight)||0)*(Number(s.reps)||0), 0), 0);
                const monthWorkoutCount = workoutsInMonth.length;
                items.push(
                  <div key={`month-${entryMonth}`} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 2px 4px", marginTop:12 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.5px" }}>{monthLabel}</span>
                    <span style={{ fontSize:12, color:"var(--muted)" }}>{monthVolume >= 1000 ? (monthVolume/1000).toFixed(1) + "k" : monthVolume}kg · {monthWorkoutCount} entrenos</span>
                  </div>
                );
              }

              if (entry._type === 'rest') {
                items.push(
                  <div key={entry.id} style={{ display:"flex", alignItems:"center", gap:10, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"10px 14px", marginBottom:6, opacity:0.7 }}>
                    <span style={{ fontSize:18 }}>🌙</span>
                    <div>
                      <p style={{ margin:0, fontSize:13, fontWeight:600, color:"var(--text)" }}>Día de descanso</p>
                      <small style={{ color:"var(--muted)" }}>{formatDate(entry.date)}</small>
                    </div>
                  </div>
                );
              } else if (entry._type === 'cardio') {
                const mins = entry.duration ? Math.round(entry.duration / 60) : null;
                items.push(
                  <div key={entry.id || `cardio-${entry.date}-${entry.sport}`} style={{ display:"flex", alignItems:"center", gap:10, background:"var(--panel)", border:"1px solid rgba(117,217,255,.2)", borderRadius:12, padding:"10px 14px", marginBottom:6 }}>
                    <span style={{ fontSize:20 }}>{entry.icon || "🏃"}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:"var(--text)" }}>{entry.sportName || entry.sport || "Cardio"}</p>
                      <small style={{ color:"var(--muted)" }}>
                        {formatDate(entry.date)}
                        {mins ? ` · ${mins} min` : ""}
                        {entry.distance ? ` · ${entry.distance} km` : ""}
                        {entry.kcal ? ` · ${entry.kcal} kcal` : ""}
                      </small>
                    </div>
                  </div>
                );
              } else {
                const workout = entry;
                const best = getBestSet(workout);
                const hasPr = prDates.has(workout.date);
                const isExpanded = expandedWorkoutId === workout.id;
                const uniqueExercises = getUniqueExercises(workout);
                items.push(
                  <div key={workout.id} style={{ marginBottom: 6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {compareMode && (
                        <div
                          style={{ width:20, height:20, borderRadius:6, border:`2px solid ${compareIds.includes(workout.id) ? "var(--green)" : "var(--line)"}`, background: compareIds.includes(workout.id) ? "var(--green)" : "transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompareIds(prev => prev.includes(workout.id) ? prev.filter(id => id !== workout.id) : prev.length < 2 ? [...prev, workout.id] : prev);
                          }}
                        >
                          {compareIds.includes(workout.id) && <span style={{ color:"#fff", fontSize:12, fontWeight:900 }}>✓</span>}
                        </div>
                      )}
                      <button
                        className="history-card"
                        style={{ flex:1 }}
                        onClick={() => compareMode ? openWorkout(workout.id) : handleWorkoutItemClick(workout.id)}
                      >
                        <div>
                          <b>{workout.type}</b>
                          <small>{formatDate(workout.date)}</small>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          {best && <small style={{ display: "block", color: "var(--muted)", fontSize: 11 }}>{best.exercise} {best.weight}kg</small>}
                          {hasPr && <span style={{ color: "var(--yellow)", fontSize: 10, fontWeight: 700 }}>⭐ PR</span>}
                        </div>
                        <strong>{workout.sets?.length ?? 0} series</strong>
                      </button>
                    </div>
                    {isExpanded && !compareMode && uniqueExercises.length > 0 && (
                      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12, padding: 12, marginTop: 4 }}>
                        {uniqueExercises.map(exercise => (
                          <ExerciseProgressChart key={exercise} exerciseName={exercise} workouts={workouts} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            }
            if (allEntries.length > historyPage) {
              items.push(
                <button key="load-more" className="ghost" style={{ width:"100%", marginTop:8, fontSize:13 }}
                  onClick={() => setHistoryPage(p => p + 30)}>
                  Cargar más ({allEntries.length - historyPage} restantes)
                </button>
              );
            }
            return items;
          })()}
        </div>
      )}

      {/* ── Cardio history ── */}
      {!isSearching && cardioHistory.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize:13, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 8px" }}>Cardio</p>
          {cardioHistory.slice(0, 10).map(c => (
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"8px 12px", marginBottom:4 }}>
              <span style={{ fontSize:20 }}>{c.sportIcon || "🏃"}</span>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:600 }}>{c.sportName || c.sport}</p>
                <p style={{ margin:0, fontSize:11, color:"var(--muted)" }}>
                  {c.duration ? `${Math.floor(c.duration/60)}min` : ""}
                  {c.calories ? ` · ${Math.round(c.calories)} kcal` : ""}
                  {c.distance ? ` · ${c.distance} km` : ""}
                </p>
              </div>
              <small style={{ color:"var(--muted)", fontSize:10 }}>{formatDate(c.date)}</small>
            </div>
          ))}
        </div>
      )}

      {compareMode && compareIds.length === 2 && (() => {
        const [a, b] = compareIds.map(id => workouts.find(w => w.id === id));
        if (!a || !b) return null;
        const volA = Math.round(getWorkoutVolume(a));
        const volB = Math.round(getWorkoutVolume(b));
        return (
          <div style={{ position:"fixed", bottom:80, left:0, right:0, zIndex:50, padding:"0 12px" }}>
            <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:20, padding:16, boxShadow:"0 8px 32px rgba(0,0,0,.5)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <b style={{ fontSize:14 }}>Comparación</b>
                <button className="ghost" style={{ padding:"4px 10px", fontSize:12 }} onClick={() => setCompareIds([])}>✕</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"start" }}>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--green)" }}>{a.type}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>{a.date}</div>
                  <div style={{ fontSize:20, fontWeight:800, marginTop:4 }}>{volA}<span style={{ fontSize:11, fontWeight:400 }}>kg</span></div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>{a.sets?.length} series</div>
                </div>
                <div style={{ textAlign:"center", color:"var(--muted)", fontSize:12, paddingTop:16 }}>VS</div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--cyan)" }}>{b.type}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>{b.date}</div>
                  <div style={{ fontSize:20, fontWeight:800, marginTop:4 }}>{volB}<span style={{ fontSize:11, fontWeight:400 }}>kg</span></div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>{b.sets?.length} series</div>
                </div>
              </div>
              <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid var(--line)", fontSize:12, textAlign:"center", color: volA > volB ? "var(--green)" : "var(--muted)" }}>
                {volA !== volB ? `${volA > volB ? a.type : b.type} tuvo ${Math.abs(volA-volB)}kg más de volumen` : "Volumen igual"}
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}

