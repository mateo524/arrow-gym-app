import useStore from "../store/useStore.js";
import { getWorkoutVolume, formatDate } from "../lib/analytics.js";

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_LABELS = ["L","M","X","J","V","S","D"];

function buildMonthCalendar(workouts) {
  const dateMap = {};
  for (const w of workouts) {
    if (!w.date) continue;
    dateMap[w.date] = (dateMap[w.date] || 0) + (w.sets?.length || 0);
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = today.toISOString().slice(0, 10);
  const monthPrefix = todayIso.slice(0, 7);

  // Offset so week starts Monday (0=Mon … 6=Sun)
  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const count = dateMap[iso] || 0;
    let level = 0;
    if (count > 0 && count <= 5) level = 1;
    else if (count > 5 && count <= 15) level = 2;
    else if (count > 15) level = 3;
    cells.push({ iso, count, level, day: d, isToday: iso === todayIso });
  }

  // Count workouts this month
  const monthCount = workouts.filter(w => w.date?.startsWith(monthPrefix)).length;

  return { cells, year, month, monthCount };
}

function CalendarMonth({ workouts }) {
  const { cells, year, month, monthCount } = buildMonthCalendar(workouts);

  // Split into rows of 7
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
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
              <div
                key={ci}
                className={`cal-day cal-day-${cell.level}${cell.isToday ? " cal-day-today" : ""}`}
                title={`${cell.iso}: ${cell.count} series`}
              >
                <span className="cal-day-num">{cell.day}</span>
              </div>
            ) : (
              <div key={ci} className="cal-day cal-day-empty" />
            )
          )}
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const workouts = useStore((state) => state.workouts);
  const openWorkout = useStore((state) => state.openWorkout);

  return (
    <section className="page">
      <p className="eyebrow">Historial</p>
      <h1>Entrenamientos</h1>

      <CalendarMonth workouts={workouts} />

      {workouts.length === 0 ? (
        <div className="notice">
          <b>Sin entrenamientos</b>
          <p>Empezá tu primer entrenamiento desde la sección Start.</p>
        </div>
      ) : (
        <div className="history-list">
          {workouts.map((workout) => (
            <button key={workout.id} className="history-card" onClick={() => openWorkout(workout.id)}>
              <div>
                <b>{workout.type}</b>
                <small>{formatDate(workout.date)}</small>
              </div>
              <span>{workout.sets?.length ?? 0} series</span>
              <strong>{Math.round(getWorkoutVolume(workout))} kg</strong>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
