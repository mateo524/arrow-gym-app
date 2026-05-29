import { useState, useMemo } from "react";
import useStore from "../store/useStore.js";
import { BODY_GROUPS, MUSCLES_BY_GROUP } from "../data/exerciseDatabase.js";
import ExercisePicker from "../components/ExercisePicker.jsx";
import { getExerciseStats, getGroupTotals } from "../lib/analytics.js";

function ExerciseDetail({ exercise, onBack }) {
  const workouts = useStore((state) => state.workouts);
  const addExercise = useStore((state) => state.addExerciseToActiveWorkout);
  const setPage = useStore((state) => state.setPage);
  const activeWorkout = useStore((state) => state.activeWorkout);
  const stats = useMemo(() => getExerciseStats(workouts, exercise.name), [workouts, exercise.name]);

  const allSets = stats.allSets || [];
  const chartData = useMemo(() => {
    const byDate = {};
    allSets.forEach((s) => {
      if (!byDate[s.date]) byDate[s.date] = [];
      byDate[s.date].push(s);
    });
    return Object.entries(byDate).map(([date, sets]) => {
      const maxW = Math.max(...sets.map((s) => Number(s.weight) || 0));
      const avgR = sets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0) / sets.length;
      return { date, maxWeight: maxW, avgReps: Math.round(avgR * 10) / 10 };
    }).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [allSets]);

  const coachTip = useMemo(() => {
    if (stats.totalSessions === 0) return "Sin datos históricos todavía. Registrá este ejercicio en tu próximo entrenamiento.";
    const lastW = Number(stats.lastWeight) || 0;
    const lastR = Number(stats.lastReps) || 0;
    if (lastR >= 12) return `Mantené ${lastW}kg y buscá subir a ${lastW + 2.5}kg cuando tengas 12 reps limpias.`;
    if (lastR >= 9) return `Mantené ${lastW}kg y buscá llegar a 12 reps antes de subir carga.`;
    if (lastR > 0) return `Bajá un poco el peso si no llegás a 9 reps. Priorizá técnica y rango completo.`;
    return "Registrá peso y reps para recibir recomendaciones.";
  }, [stats]);

  return (
    <div className="exercise-detail">
      <button className="ghost" onClick={onBack}>← Volver al banco</button>
      <h1>{exercise.name}</h1>
      <p className="muted">{exercise.group} · {exercise.muscle} · {exercise.equipment}</p>

      {activeWorkout && (
        <button className="primary big" onClick={() => { addExercise(exercise); setPage("workout"); }}>
          Agregar a entrenamiento activo
        </button>
      )}

      <div className="stats-grid">
        <div><b>{stats.lastWeight || "—"}</b><span>último kg</span></div>
        <div><b>{stats.lastReps || "—"}</b><span>últimas reps</span></div>
        <div><b>{stats.lastDate || "—"}</b><span>última fecha</span></div>
        <div><b>{stats.bestWeight || "—"}</b><span>mejor peso</span></div>
        <div><b>{stats.totalSessions}</b><span>sesiones</span></div>
        <div><b>{Math.round(stats.totalVolume / 100) / 10}k</b><span>vol. total</span></div>
      </div>

      {chartData.length > 1 && (
        <div className="trend-chart">
          <small>Evolución de carga máxima</small>
          <svg viewBox="0 0 280 80" className="trend-svg">
            {(() => {
              const values = chartData.map((d) => d.maxWeight);
              const min = Math.min(...values);
              const max = Math.max(...values);
              const range = max - min || 1;
              const pts = chartData.map((d, i) => {
                const x = i * (260 / (chartData.length - 1)) + 10;
                const y = 70 - ((d.maxWeight - min) / range) * 60;
                return `${x},${y}`;
              });
              return (
                <>
                  <polyline points={pts.join(" ")} fill="none" stroke="#6df2a4" strokeWidth="2" />
                  {chartData.map((d, i) => {
                    const x = i * (260 / (chartData.length - 1)) + 10;
                    const y = 70 - ((d.maxWeight - min) / range) * 60;
                    return <circle key={i} cx={x} cy={y} r="3" fill="#6df2a4" />;
                  })}
                </>
              );
            })()}
          </svg>
          <div className="chart-labels">
            {chartData.filter((_, i) => i === 0 || i === chartData.length - 1).map((d) => (
              <small key={d.date}>{d.date.slice(5)}</small>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <span>Recomendación del coach</span>
        <p>{coachTip}</p>
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  const addCustomExercise = useStore((state) => state.addCustomExercise);
  const [form, setForm] = useState({ name: "", group: "Hombros", muscle: "Deltoide anterior", equipment: "Custom" });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [savedMsg, setSavedMsg] = useState(false);

  if (selectedExercise) {
    return (
      <section className="page">
        <ExerciseDetail exercise={selectedExercise} onBack={() => setSelectedExercise(null)} />
      </section>
    );
  }

  return (
    <section className="page">
      <p className="eyebrow">Banco de ejercicios</p>
      <h1>+1000 ejercicios filtrables</h1>
      <ExercisePicker onPick={(exercise) => setSelectedExercise(exercise)} />
      <div className="card">
        <h2>Crear ejercicio propio</h2>
        <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="filters">
          <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value, muscle: MUSCLES_BY_GROUP[e.target.value][0] })}>
            {BODY_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select value={form.muscle} onChange={(e) => setForm({ ...form, muscle: e.target.value })}>
            {MUSCLES_BY_GROUP[form.group].map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <button className="primary" onClick={() => {
          if (!form.name.trim()) return;
          addCustomExercise(form);
          setForm({ ...form, name: "" });
          setSavedMsg(true);
          setTimeout(() => setSavedMsg(false), 2000);
        }}>Guardar ejercicio</button>
        {savedMsg && <p style={{ color: "var(--green)", fontSize: 12, marginTop: 4 }}>✓ Ejercicio guardado</p>}
      </div>
    </section>
  );
}
