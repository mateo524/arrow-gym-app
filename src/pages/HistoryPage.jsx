// CSS classes needed (add to styles.css):
// .cal-heatmap, .cal-week-labels, .cal-grid, .cal-day,
// .cal-day-1, .cal-day-2, .cal-day-3, .cal-month-label
// (these are already handled in styles.css via the styles added in this sprint)

import useStore from "../store/useStore.js";
import { getWorkoutVolume, formatDate } from "../lib/analytics.js";

function buildCalendarData(workouts) {
  // Build a map of date -> sets count
  const dateMap = {};
  for (const w of workouts) {
    if (!w.date) continue;
    dateMap[w.date] = (dateMap[w.date] || 0) + (w.sets?.length || 0);
  }

  // Build last 12 weeks (84 days), starting from the Monday 11 weeks ago
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  // Shift so week starts on Monday (0=Mon...6=Sun)
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - mondayOffset - 11 * 7);

  const cells = [];
  for (let i = 0; i < 84; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const count = dateMap[iso] || 0;
    let level = 0;
    if (count > 0 && count <= 5) level = 1;
    else if (count > 5 && count <= 15) level = 2;
    else if (count > 15) level = 3;
    cells.push({ date: iso, count, level, month: d.getMonth(), day: d.getDate() });
  }
  return cells;
}

function CalendarHeatmap({ workouts }) {
  const cells = buildCalendarData(workouts);

  // Build month labels (one per row of 7, show month name when month changes)
  const weeks = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  // Determine which week rows start a new month for labeling
  const weekMonthLabels = weeks.map((week) => {
    const firstDay = week[0];
    if (firstDay.day <= 7) return monthNames[firstDay.month];
    return null;
  });

  return (
    <div className="cal-heatmap">
      <div className="cal-week-labels">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 3 }}>
            {weekMonthLabels[wi] && (
              <span className="cal-month-label">{weekMonthLabels[wi]}</span>
            )}
            <div className="cal-grid" style={{ flex: 1 }}>
              {week.map((cell) => (
                <div
                  key={cell.date}
                  className={`cal-day cal-day-${cell.level}`}
                  title={`${cell.date}: ${cell.count} series`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
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

      <CalendarHeatmap workouts={workouts} />

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
              <span>{workout.sets.length} series</span>
              <strong>{Math.round(getWorkoutVolume(workout))} kg</strong>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
