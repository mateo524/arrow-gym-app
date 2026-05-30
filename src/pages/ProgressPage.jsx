import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import { getFrequencyRanking, getGroupTotals, filterByRange, RANGE_OPTIONS, hydrateSet } from "../lib/analytics.js";
import RadarChart from "../components/RadarChart.jsx";

function est1RM(weight, reps) {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return null;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30));
}

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

export default function ProgressPage() {
  const workouts = useStore((state) => state.workouts);
  const [range, setRange] = useState("30d");
  const rangeWorkouts = useMemo(() => filterByRange(workouts, range), [workouts, range]);

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

  const rmData = useMemo(() => {
    const byExercise = {};
    rangeWorkouts.forEach((wo) => {
      (wo.sets || []).forEach((raw) => {
        const set = hydrateSet(raw);
        const weight = Number(set.weight) || 0;
        const reps = Number(set.reps) || 0;
        if (weight > 0 && reps > 0) {
          const rm = est1RM(weight, reps);
          if (rm) {
            if (!byExercise[set.exercise]) byExercise[set.exercise] = { name: set.exercise, bestRM: 0, bestSet: null, sets: [] };
            if (rm > byExercise[set.exercise].bestRM) {
              byExercise[set.exercise].bestRM = rm;
              byExercise[set.exercise].bestSet = { weight, reps, date: wo.date };
            }
            byExercise[set.exercise].sets.push({ weight, reps, rm, date: wo.date });
          }
        }
      });
    });
    return Object.values(byExercise).sort((a, b) => b.bestRM - a.bestRM).slice(0, 8);
  }, [rangeWorkouts]);

  const pbData = useMemo(() => {
    const byExercise = {};
    rangeWorkouts.forEach((wo) => {
      (wo.sets || []).forEach((raw) => {
        const set = hydrateSet(raw);
        const weight = Number(set.weight) || 0;
        if (weight > 0) {
          if (!byExercise[set.exercise]) byExercise[set.exercise] = { name: set.exercise, bestWeight: 0, bestWeightDate: null };
          if (weight > byExercise[set.exercise].bestWeight) {
            byExercise[set.exercise].bestWeight = weight;
            byExercise[set.exercise].bestWeightDate = wo.date;
          }
        }
      });
    });
    return Object.values(byExercise).sort((a, b) => b.bestWeight - a.bestWeight).slice(0, 8);
  }, [rangeWorkouts]);

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

      <h2>Distribución por grupo</h2>
      <div className="progress-groups">
        {Object.entries(totals).map(([group, data]) => (
          <MiniBar key={group} label={group} value={data.sets} max={Math.max(1, ...Object.values(totals).map((t) => t.sets))} sub={`${data.exercises.slice(0, 3).join(", ")}`} />
        ))}
      </div>

      {rmData.length > 0 && (
        <>
          <h2>1RM estimado por ejercicio</h2>
          <div className="rm-list">
            {rmData.map((item) => (
              <div className="rm-item" key={item.name}>
                <div className="rm-info">
                  <b>{item.name}</b>
                  <small>{item.bestSet.weight}kg × {item.bestSet.reps} reps</small>
                </div>
                <span className="rm-value">{item.bestRM} kg</span>
              </div>
            ))}
          </div>
        </>
      )}

      {pbData.length > 0 && (
        <>
          <h2>Mejores marcas personales</h2>
          <div className="ranking-list">
            {pbData.map((item, i) => (
              <div className="ranking-item" key={item.name}>
                <span className="rank-num">#{i + 1}</span>
                <div className="rank-info">
                  <b>{item.name}</b>
                  <small>{item.bestWeight} kg{/*item.bestWeightDate ? ` · ${item.bestWeightDate}` : ""*/}</small>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
