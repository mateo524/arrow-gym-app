import { useState, useMemo } from "react";
import useStore from "../store/useStore";
import { todayLocal } from "../lib/dates.js";

// ─── helpers ────────────────────────────────────────────────────────────────

function isoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildCalendarWeeks(year, month) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday = 0, …, Sunday = 6
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days = [];
  // padding before month start
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  // pad to complete last week
  while (days.length % 7 !== 0) days.push(null);

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

function totalVolume(sets) {
  return sets.reduce((acc, s) => {
    const w = parseFloat(s.weight) || 0;
    const r = parseFloat(s.reps) || 0;
    return acc + w * r;
  }, 0);
}

function uniqueExercises(sets) {
  return [...new Set(sets.map((s) => s.exercise).filter(Boolean))];
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ─── component ──────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const workouts = useStore((s) => s.workouts);
  const setPage = useStore((s) => s.setPage);

  const todayStr = todayLocal();
  const todayDate = new Date();

  const [year, setYear] = useState(todayDate.getFullYear());
  const [month, setMonth] = useState(todayDate.getMonth());
  const [selected, setSelected] = useState(null); // { date, workouts[] }

  // Build a map: dateStr -> workouts[]
  const workoutsByDate = useMemo(() => {
    const map = {};
    (workouts || []).forEach((w) => {
      if (!w.date) return;
      if (!map[w.date]) map[w.date] = [];
      map[w.date].push(w);
    });
    return map;
  }, [workouts]);

  const weeks = useMemo(() => buildCalendarWeeks(year, month), [year, month]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  function handleDayClick(day) {
    if (!day) return;
    const dateStr = isoDate(year, month, day);
    const dayWorkouts = workoutsByDate[dateStr];
    if (!dayWorkouts?.length) return;
    if (selected?.date === dateStr) { setSelected(null); return; }
    setSelected({ date: dateStr, workouts: dayWorkouts });
  }

  return (
    <div className="page" style={{ padding: "0 0 32px" }}>
      {/* ── header ── */}
      <div className="page-head" style={styles.head}>
        <button onClick={() => setPage("home")} style={styles.backBtn} aria-label="Volver">
          &#8592;
        </button>
        <div>
          <p style={styles.eyebrow}>Historial</p>
          <h1 style={styles.h1}>Calendario</h1>
        </div>
      </div>

      {/* ── month nav ── */}
      <div style={styles.monthNav}>
        <button onClick={prevMonth} style={styles.navBtn} aria-label="Mes anterior">&#8249;</button>
        <span style={styles.monthLabel}>{MONTH_NAMES[month]} {year}</span>
        <button onClick={nextMonth} style={styles.navBtn} aria-label="Mes siguiente">&#8250;</button>
      </div>

      {/* ── grid ── */}
      <div style={styles.grid}>
        {/* day-of-week headers */}
        {DAY_LABELS.map((lbl) => (
          <div key={lbl} style={styles.dayHeader}>{lbl}</div>
        ))}

        {/* day cells */}
        {weeks.flat().map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} style={styles.emptyCell} />;
          }
          const dateStr = isoDate(year, month, day);
          const hasWorkout = Boolean(workoutsByDate[dateStr]?.length);
          const isToday = dateStr === todayStr;
          const isSelected = selected?.date === dateStr;

          return (
            <div
              key={dateStr}
              onClick={() => handleDayClick(day)}
              style={{
                ...styles.cell,
                ...(isToday ? styles.cellToday : {}),
                ...(isSelected ? styles.cellSelected : {}),
                cursor: hasWorkout ? "pointer" : "default",
              }}
              aria-label={`${dateStr}${hasWorkout ? " — tiene entrenamientos" : ""}`}
            >
              <span style={styles.dayNum}>{day}</span>
              {hasWorkout && (
                <span
                  style={{
                    ...styles.dot,
                    ...(isToday || isSelected ? styles.dotLight : {}),
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── summary panel ── */}
      {selected && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelDate}>{formatDate(selected.date)}</span>
            <button onClick={() => setSelected(null)} style={styles.closeBtn} aria-label="Cerrar">✕</button>
          </div>

          {selected.workouts.map((w, i) => {
            const exercises = uniqueExercises(w.sets || []);
            const vol = totalVolume(w.sets || []);
            const totalSets = (w.sets || []).length;

            return (
              <div key={w.id || i} style={styles.workoutCard}>
                <p style={styles.workoutType}>{w.type || "Entrenamiento"}</p>
                <div style={styles.statsRow}>
                  <Stat label="Series" value={totalSets} />
                  <Stat label="Ejercicios" value={exercises.length} />
                  {vol > 0 && <Stat label="Volumen" value={`${vol.toLocaleString("es-AR")} kg`} />}
                </div>
                {exercises.length > 0 && (
                  <ul style={styles.exerciseList}>
                    {exercises.map((ex) => {
                      const exSets = (w.sets || []).filter((s) => s.exercise === ex);
                      return (
                        <li key={ex} style={styles.exerciseItem}>
                          <span style={styles.exName}>{ex}</span>
                          <span style={styles.exMeta}>
                            {exSets.length} serie{exSets.length !== 1 ? "s" : ""}
                            {exSets[0]?.weight ? ` · ${exSets[0].weight} kg` : ""}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const names = ["1 ene", "1 feb"]; // unused, just formatting inline
  const months = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre",
  ];
  return `${d} de ${months[m - 1]} de ${y}`;
}

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = {
  head: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 16px 8px",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "var(--text, #fff)",
    padding: "4px 8px",
    lineHeight: 1,
  },
  eyebrow: {
    margin: 0,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--text-muted, #888)",
  },
  h1: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text, #fff)",
  },
  monthNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 16px 12px",
  },
  navBtn: {
    background: "none",
    border: "none",
    fontSize: 28,
    cursor: "pointer",
    color: "var(--text, #fff)",
    padding: "0 8px",
    lineHeight: 1,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text, #fff)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 2,
    padding: "0 8px",
  },
  dayHeader: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-muted, #888)",
    padding: "4px 0 6px",
    textTransform: "uppercase",
  },
  emptyCell: {
    minHeight: 44,
  },
  cell: {
    minHeight: 44,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    userSelect: "none",
  },
  cellToday: {
    background: "var(--accent, #22c55e)",
    borderRadius: 8,
  },
  cellSelected: {
    background: "var(--accent-dim, rgba(34,197,94,0.25))",
    outline: "2px solid var(--accent, #22c55e)",
    borderRadius: 8,
  },
  dayNum: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text, #fff)",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "var(--accent, #22c55e)",
  },
  dotLight: {
    background: "#fff",
  },
  panel: {
    margin: "16px 8px 0",
    background: "var(--surface, #1e1e1e)",
    borderRadius: 12,
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border, #2a2a2a)",
  },
  panelDate: {
    fontWeight: 600,
    fontSize: 14,
    color: "var(--text, #fff)",
    textTransform: "capitalize",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted, #888)",
    fontSize: 16,
    padding: "0 4px",
  },
  workoutCard: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border, #2a2a2a)",
  },
  workoutType: {
    margin: "0 0 8px",
    fontWeight: 700,
    fontSize: 15,
    color: "var(--text, #fff)",
  },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 10,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--accent, #22c55e)",
  },
  statLabel: {
    fontSize: 10,
    color: "var(--text-muted, #888)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  exerciseList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  exerciseItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exName: {
    fontSize: 13,
    color: "var(--text, #fff)",
  },
  exMeta: {
    fontSize: 12,
    color: "var(--text-muted, #888)",
  },
};
