import { useState, useMemo } from "react";
import useStore, { ROUTINES } from "../store/useStore.js";
import { EXERCISE_DATABASE } from "../data/exerciseDatabase.js";
import Icon from "../components/Icon.jsx";

export default function StartWorkoutPage() {
  const startWorkout = useStore((state) => state.startWorkout);
  const startEmptyWorkout = useStore((state) => state.startEmptyWorkout);
  const setPage = useStore((state) => state.setPage);
  const workouts = useStore((state) => state.workouts);
  const [editRoutine, setEditRoutine] = useState(null);
  const [editExercises, setEditExercises] = useState([]);

  const historyTypes = useMemo(() => {
    const types = {};
    (workouts || []).forEach((w) => {
      if (!types[w.type]) { types[w.type] = { count: 0, exercises: [] }; }
      types[w.type].count++;
      (w.sets || []).forEach((s) => {
        if (!types[w.type].exercises.includes(s.exercise)) types[w.type].exercises.push(s.exercise);
      });
    });
    return types;
  }, [workouts]);

  const allRoutines = useMemo(() => {
    const merged = { ...ROUTINES };
    Object.entries(historyTypes).forEach(([type, data]) => {
      if (!merged[type] && data.count >= 1) {
        merged[type] = data.exercises;
      }
    });
    return merged;
  }, [historyTypes]);

  function handleStart(name) {
    if (editRoutine === name) {
      const finalExercises = editExercises.filter(Boolean);
      useStore.setState((s) => ({
        activeWorkout: {
          id: `workout-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: name,
          date: new Date().toISOString().slice(0, 10),
          sets: finalExercises.map((ex) => {
            const meta = EXERCISE_DATABASE.find((e) => e.name === ex) || {};
            return {
              id: `set-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              exercise: ex,
              weight: "", reps: "",
              group: meta.group || "Core",
              muscle: meta.muscle || "General",
              equipment: meta.equipment || "",
              lastWeight: "", lastReps: "", lastSets: 0, lastDate: null,
            };
          }),
        },
        currentPage: "workout",
      }));
      return;
    }
    startWorkout(name);
  }

  function startEdit(name) {
    const exercises = allRoutines[name] || [];
    setEditRoutine(name);
    setEditExercises([...exercises]);
  }

  function cancelEdit() {
    setEditRoutine(null);
    setEditExercises([]);
  }

  const catalogNames = useMemo(() => EXERCISE_DATABASE.map((e) => e.name), []);

  function addEx() { setEditExercises((prev) => [...prev, ""]); }

  function updateEx(i, val) {
    const next = [...editExercises];
    next[i] = val;
    setEditExercises(next);
  }

  function removeEx(i) {
    setEditExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("home")} aria-label="Back">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
        <div className="page-head-titles">
          <p className="eyebrow">Start Workout</p>
          <h1>Elegí rutina</h1>
        </div>
      </div>

      <div className="routine-grid">
        {Object.entries(allRoutines).map(([name, exercises]) => (
          <div key={name}>
            <button className="routine-card" onClick={() => handleStart(name)}>
              <span>START</span>
              <b>{name}</b>
              <small>{exercises.length} ejercicios</small>
            </button>
            {editRoutine === name ? (
              <div className="card" style={{ marginTop: 6 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {editExercises.map((ex, i) => (
                    <div key={i} style={{ display: "flex", gap: 4, width: "100%", marginBottom: 4 }}>
                      <input
                        list="ex-suggestions"
                        value={ex}
                        onChange={(e) => updateEx(i, e.target.value)}
                        placeholder="Ejercicio..."
                        style={{
                          flex: 1,
                          background: "#0b1518",
                          border: "1px solid #1b2d31",
                          borderRadius: 12,
                          padding: "8px 10px",
                          color: "var(--text)",
                          fontSize: 13,
                          minHeight: 36,
                        }}
                      />
                      <button className="danger" style={{ padding: "8px 10px", borderRadius: 10 }} onClick={() => removeEx(i)} aria-label="Remove">✕</button>
                    </div>
                  ))}
                </div>
                <datalist id="ex-suggestions">
                  {catalogNames.map((n) => <option key={n} value={n} />)}
                </datalist>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="ghost" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={addEx}>+ Agregar</button>
                  <button className="primary" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => handleStart(name)}>Iniciar</button>
                  <button className="ghost" style={{ padding: "8px", fontSize: 12 }} onClick={cancelEdit}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button className="ghost" style={{ width: "100%", marginTop: 4, padding: "8px", fontSize: 12 }} onClick={() => startEdit(name)}>
                Editar ejercicios
              </button>
            )}
          </div>
        ))}
        <button className="routine-card free" onClick={startEmptyWorkout}>
          <span>START</span>
          <b>Libre</b>
          <small>Armalo desde cero</small>
        </button>
      </div>
    </section>
  );
}
