import { useState, useMemo } from "react";
import useStore from "../store/useStore.js";
import { getWorkoutVolume, formatDate } from "../lib/analytics.js";

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
  const todayIso = new Date().toISOString().slice(0, 10);
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

export default function HistoryPage() {
  const workouts = useStore((state) => state.workouts);
  const prs = useStore((state) => state.prs) ?? [];
  const openWorkout = useStore((state) => state.openWorkout);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);

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

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const prDates = new Set(prs.map(p => p.date));

  return (
    <section className="page">
      <p className="eyebrow">Historial</p>
      <h1>Entrenamientos</h1>

      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <button className="ghost" style={{ padding: "8px 14px", fontSize: 18 }} onClick={prevMonth}>‹</button>
        <span style={{ fontSize: 14, color: "var(--muted)" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button className="ghost" style={{ padding: "8px 14px", fontSize: 18, opacity: isCurrentMonth ? 0.3 : 1 }} onClick={nextMonth} disabled={isCurrentMonth}>›</button>
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
          {workouts
            .filter(w => {
              const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
              return !selectedDate && w.date?.startsWith(prefix);
            })
            .concat(selectedDate ? [] : workouts.filter(w => {
              const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
              return !w.date?.startsWith(prefix);
            }).slice(0, 0))
            .length === 0
              ? workouts.slice(0, 30)
              : workouts.filter(w => {
                  const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
                  return w.date?.startsWith(prefix);
                })
          }
          {/* Simplified: show all workouts, sorted */}
          {!selectedDate && workouts.map((workout) => {
            const best = getBestSet(workout);
            const hasPr = prDates.has(workout.date);
            return (
              <button key={workout.id} className="history-card" onClick={() => openWorkout(workout.id)}>
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
            );
          })}
        </div>
      )}
    </section>
  );
}
