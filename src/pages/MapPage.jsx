import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import RadarChart from "../components/RadarChart.jsx";
import { RANGE_OPTIONS, filterByRange, getGroupTotals, getRadarData } from "../lib/analytics.js";

export default function MapPage() {
  const workouts = useStore((state) => state.workouts);
  const [range, setRange] = useState("7d");
  const rangeWorkouts = useMemo(() => filterByRange(workouts, range), [workouts, range]);
  const radar = useMemo(() => getRadarData(rangeWorkouts), [rangeWorkouts]);
  const totals = useMemo(() => getGroupTotals(rangeWorkouts), [rangeWorkouts]);

  return (
    <section className="page">
      <p className="eyebrow">Pulse</p>
      <h1>Mapa muscular</h1>

      {workouts.length === 0 && (
        <div className="notice">
          <b>Sin datos</b>
          <p>Registrá entrenamientos para ver tu mapa muscular y radar de grupos.</p>
        </div>
      )}

      <div className="range-tabs">
        {RANGE_OPTIONS.map(option => (
          <button key={option.id} className={range === option.id ? "active" : ""} onClick={() => setRange(option.id)}>
            {option.label}
          </button>
        ))}
      </div>

      {workouts.length > 0 && <RadarChart data={radar} />}

      <div className="grid-list">
        {Object.entries(totals).map(([group, total]) => (
          <div className="mini-card" key={group}>
            <b>{group}</b>
            <span>{total.sets} series</span>
            <small>{total.exercises.slice(0, 4).join(", ") || "Sin datos"}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
