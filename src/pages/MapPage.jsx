import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import RadarChart from "../components/RadarChart.jsx";
import AdvancedMuscleDiagram from "../components/AdvancedMuscleDiagram.jsx";
import { RANGE_OPTIONS, filterByRange, filterCurrentWeek, getGroupTotals, getMuscleIntensity, getRadarData } from "../lib/analytics.js";

export default function MapPage() {
  const workouts = useStore((state) => state.workouts);
  const [range, setRange] = useState("7d");
  const rangeWorkouts = useMemo(() => filterByRange(workouts, range), [workouts, range]);
  const weeklyWorkouts = useMemo(() => filterCurrentWeek(workouts), [workouts]);
  const radar = useMemo(() => getRadarData(rangeWorkouts), [rangeWorkouts]);
  const intensity = useMemo(() => getMuscleIntensity(weeklyWorkouts), [weeklyWorkouts]);
  const totals = useMemo(() => getGroupTotals(rangeWorkouts), [rangeWorkouts]);
  return (
    <section className="page">
      <p className="eyebrow">Mapa muscular</p>
      <h1>Radar + diagrama avanzado</h1>
      <div className="range-tabs">
        {RANGE_OPTIONS.map((option) => (
          <button key={option.id} className={range === option.id ? "active" : ""} onClick={() => setRange(option.id)}>{option.label}</button>
        ))}
      </div>
      <RadarChart data={radar} />
      <AdvancedMuscleDiagram intensity={intensity} />
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
