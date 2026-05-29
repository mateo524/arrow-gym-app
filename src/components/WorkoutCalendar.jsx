import { useMemo } from "react";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getMonthData(year, month) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let i = 0; i < first; i++) {
    cells.push({ day: daysInPrev - first + i + 1, date: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(daysInPrev - first + i + 1).padStart(2, "0")}`, other: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, other: false });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, date: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, other: true });
  }
  return cells;
}

export default function WorkoutCalendar({ workouts }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const trainedDates = useMemo(() => {
    const set = new Set();
    (workouts || []).forEach((w) => { if (w.date) set.add(w.date); });
    return set;
  }, [workouts]);

  const cells = useMemo(() => getMonthData(year, month), [year, month]);
  const todayStr = now.toISOString().slice(0, 10);

  return (
    <div className="card">
      <h2>{now.toLocaleDateString("es", { month: "long", year: "numeric" })}</h2>
      <div className="calendar-grid">
        {DAYS.map((d) => <div key={d} className="calendar-header">{d}</div>)}
        {cells.map((cell, i) => {
          const trained = trainedDates.has(cell.date);
          const isToday = cell.date === todayStr;
          return (
            <div
              key={i}
              className={`calendar-day${trained ? " trained" : ""}${isToday ? " today" : ""}${cell.other ? " other-month" : ""}`}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
