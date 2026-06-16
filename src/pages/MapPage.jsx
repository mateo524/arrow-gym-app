import { useMemo, useState, useRef } from "react";
import useStore from "../store/useStore.js";
import RadarChart from "../components/RadarChart.jsx";
import AdvancedMuscleDiagram from "../components/AdvancedMuscleDiagram.jsx";
import Icon from "../components/Icon.jsx";
import { RANGE_OPTIONS, filterByRange, filterCurrentWeek, getGroupTotals, getMuscleIntensity, getRadarData } from "../lib/analytics.js";

export default function MapPage() {
  const workouts = useStore((state) => state.workouts);
  const [range, setRange] = useState("7d");
  const [activeMuscle, setActiveMuscle] = useState(null);
  const mapRef = useRef(null);
  const rangeWorkouts = useMemo(() => filterByRange(workouts, range), [workouts, range]);
  const weeklyWorkouts = useMemo(() => filterCurrentWeek(workouts), [workouts]);
  const radar = useMemo(() => getRadarData(rangeWorkouts), [rangeWorkouts]);
  const intensity = useMemo(() => getMuscleIntensity(weeklyWorkouts), [weeklyWorkouts]);
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

      <div className="notice" style={{ marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 13 }}>Los colores en el mapa muestran el nivel de estímulo semanal: a más series, más intenso el color.</p>
      </div>

      {workouts.length > 0 && (
        <AdvancedMuscleDiagram
          intensity={intensity}
          onMuscleClick={(muscle) => setActiveMuscle(activeMuscle === muscle ? null : muscle)}
          activeMuscle={activeMuscle}
          ref={mapRef}
        />
      )}

      {activeMuscle && intensity[activeMuscle] && (
        <div className="mini-card" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className={`legend-dot level-${intensity[activeMuscle].level}`} style={{ flexShrink: 0 }} />
            <div>
              <b>{activeMuscle}</b>
              <span>{intensity[activeMuscle].count} series esta semana</span>
            </div>
          </div>
          <small style={{ display: "block", marginTop: 6, color: "var(--muted)" }}>
            {intensity[activeMuscle].level === 0 && "Sin estímulo — no se registraron series"}
            {intensity[activeMuscle].level === 1 && "Estímulo ligero — 1 a 3 series"}
            {intensity[activeMuscle].level === 2 && "Estímulo moderado — 3 a 6 series"}
            {intensity[activeMuscle].level === 3 && "Estímulo alto — 6 a 10 series"}
            {intensity[activeMuscle].level === 4 && "Estímulo máximo — más de 10 series"}
          </small>
        </div>
      )}

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
