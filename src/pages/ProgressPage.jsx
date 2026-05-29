import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import { getWeeklyVolume, getFrequencyRanking, getGroupTotals, filterByRange, RANGE_OPTIONS } from "../lib/analytics.js";
import RadarChart from "../components/RadarChart.jsx";

function MiniBar({ value, max, label, sub }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mini-bar-row">
      <div className="mini-bar-label"><span>{label}</span><b>{value}</b></div>
      <div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: `${pct}%` }} /></div>
      {sub && <small>{sub}</small>}
    </div>
  );
}

function VolumeChart({ weeks }) {
  if (!weeks || weeks.length < 2) return null;
  const maxV = Math.max(...weeks.map((w) => w.volume));
  const h = 80;
  const barW = Math.max(8, Math.min(24, 200 / weeks.length));
  const w = weeks.length * (barW + 4);
  return (
    <div className="volume-chart">
      <small>Volumen semanal (kg)</small>
      <svg viewBox={`0 0 ${Math.max(w, 200)} ${h}`}>
        {weeks.map((wk, i) => {
          const bh = maxV > 0 ? (wk.volume / maxV) * (h - 12) : 0;
          const x = i * (barW + 4);
          const y = h - 6 - bh;
          return (
            <g key={wk.week}>
              <rect x={x} y={y} width={barW} height={bh} fill="#6df2a4" rx="2" />
              <text x={x + barW / 2} y={h - 1} textAnchor="middle" fill="#8ea0a0" fontSize="6">{wk.week.slice(5)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ProgressPage() {
  const workouts = useStore((state) => state.workouts);
  const [range, setRange] = useState("30d");
  const rangeWorkouts = useMemo(() => filterByRange(workouts, range), [workouts, range]);

  const weekly = useMemo(() => getWeeklyVolume(rangeWorkouts), [rangeWorkouts]);
  const ranking = useMemo(() => getFrequencyRanking(rangeWorkouts).slice(0, 10), [rangeWorkouts]);
  const totals = useMemo(() => getGroupTotals(rangeWorkouts), [rangeWorkouts]);
  const radarData = useMemo(() => {
    const maxSets = Math.max(1, ...Object.values(totals).map((t) => t.sets));
    return Object.entries(totals).map(([group, data]) => ({
      group,
      sets: data.sets,
      reps: data.reps,
      volume: data.volume,
      score: Math.round((data.sets / maxSets) * 100),
    }));
  }, [totals]);
  const totalVolume = rangeWorkouts.reduce((s, w) => s + (w.sets || []).reduce((s2, set) => s2 + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0), 0);
  const totalSets = rangeWorkouts.reduce((s, w) => s + (w.sets?.length || 0), 0);

  return (
    <section className="page">
      <p className="eyebrow">Progreso de entrenamiento</p>
      <h1>Progreso</h1>

      <div className="range-tabs">
        {RANGE_OPTIONS.map((option) => (
          <button key={option.id} className={range === option.id ? "active" : ""} onClick={() => setRange(option.id)}>{option.label}</button>
        ))}
      </div>

      <div className="stats-grid">
        <div><b>{rangeWorkouts.length}</b><span>entrenos</span></div>
        <div><b>{totalSets}</b><span>series</span></div>
        <div><b>{Math.round(totalVolume / 100) / 10}k</b><span>kg total</span></div>
      </div>

      <RadarChart data={radarData} />

      <VolumeChart weeks={weekly} />

      <h2>Distribución por grupo</h2>
      <div className="progress-groups">
        {Object.entries(totals).map(([group, data]) => (
          <MiniBar key={group} label={group} value={data.sets} max={Math.max(1, ...Object.values(totals).map((t) => t.sets))} sub={`${data.exercises.slice(0, 3).join(", ")}`} />
        ))}
      </div>

      <h2>Ejercicios más entrenados</h2>
      <div className="ranking-list">
        {ranking.slice(0, 8).map((item, i) => (
          <div className="ranking-item" key={item.name}>
            <span className="rank-num">#{i + 1}</span>
            <div className="rank-info">
              <b>{item.name}</b>
              <small>{item.sets} series · {item.sessions} sesiones</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
