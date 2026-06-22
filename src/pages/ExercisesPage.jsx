import { useState, useEffect } from "react";
import useStore from "../store/useStore.js";
import { useDebounce } from "../lib/useDebounce.js";
import { BODY_GROUPS, MUSCLES_BY_GROUP } from "../data/exerciseDatabase.js";
import ExercisePicker from "../components/ExercisePicker.jsx";
import ExerciseHistoryPage from "./ExerciseHistoryPage.jsx";


function ExerciseSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: "var(--panel)", borderRadius: 14, padding: "14px 16px", opacity: 1 - i * 0.12 }}>
          <div style={{ height: 14, width: `${60 + (i % 3) * 15}%`, background: "var(--line)", borderRadius: 7, marginBottom: 8, animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ height: 10, width: "40%", background: "var(--line)", borderRadius: 5, opacity: 0.6 }} />
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
    </div>
  );
}

export default function ExercisesPage() {
  const addCustomExercise = useStore((state) => state.addCustomExercise);
  const [form, setForm] = useState({ name: "", group: "Hombros", muscle: "Deltoide anterior", equipment: "Custom" });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const isSearching = query !== debouncedQuery;
  const [historyExercise, setHistoryExercise] = useState(null);

  return (
    <section className="page">
      {!isOnline && (
        <div style={{ background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 12, padding: "8px 12px", marginBottom: 12, display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
          <span>📡</span>
          <span style={{ color: "var(--muted)" }}>Sin conexión — mostrando caché local</span>
        </div>
      )}
      <p className="eyebrow">Banco de ejercicios</p>
      <h1>+1000 ejercicios filtrables</h1>
      <p style={{ marginBottom: 14, fontSize: 14 }}>Buscá por nombre, grupo muscular o equipo. Usá los filtros para acotar resultados.</p>
      {isSearching ? (
        <ExerciseSkeleton />
      ) : (
        <ExercisePicker
          onPick={() => {}}
          query={debouncedQuery}
          onQueryChange={setQuery}
          onExerciseTap={setHistoryExercise}
        />
      )}
      {historyExercise && (
        <ExerciseHistoryPage exerciseName={historyExercise} onClose={() => setHistoryExercise(null)} />
      )}
      <div className="card" style={{ marginTop: 14 }}>
        <h2>Crear ejercicio propio</h2>
        <input
          placeholder="Nombre del ejercicio"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ background: "#0b1518", border: "1px solid #1b2d31", borderRadius: 14, padding: "12px 14px", color: "var(--text)", fontSize: 16, minHeight: 44, width: "100%", marginBottom: 10 }}
        />
        <div className="filters">
          <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value, muscle: MUSCLES_BY_GROUP[e.target.value][0] })}>
            {BODY_GROUPS.map(g => <option key={g}>{g}</option>)}
          </select>
          <select value={form.muscle} onChange={(e) => setForm({ ...form, muscle: e.target.value })}>
            {MUSCLES_BY_GROUP[form.group].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <button className="primary" onClick={() => { addCustomExercise(form); setForm({ ...form, name: "" }); }}>
          Guardar ejercicio
        </button>
      </div>
    </section>
  );
}
