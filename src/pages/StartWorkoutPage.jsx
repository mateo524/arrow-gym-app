import { useState, useEffect, useMemo } from "react";
import useStore, { ROUTINES } from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import { EXERCISE_DATABASE } from "../data/exerciseDatabase.js";
import Icon from "../components/Icon.jsx";

export default function StartWorkoutPage() {
  const startWorkout = useStore((s) => s.startWorkout);
  const startEmptyWorkout = useStore((s) => s.startEmptyWorkout);
  const setPage = useStore((s) => s.setPage);
  const workouts = useStore((s) => s.workouts);
  const profile = useAuthStore((s) => s.profile);

  const [editRoutine, setEditRoutine] = useState(null);
  const [editExercises, setEditExercises] = useState([]);
  const [assignedRoutines, setAssignedRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);

  const isUser = profile?.role === "user";

  useEffect(() => {
    if (isUser && profile?.id) {
      setLoadingRoutines(true);
      supabase
        .from("routines")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setAssignedRoutines(data || []);
          setLoadingRoutines(false);
        });
    }
  }, [isUser, profile?.id]);

  const historyTypes = useMemo(() => {
    const types = {};
    (workouts || []).forEach((w) => {
      if (!types[w.type]) types[w.type] = { count: 0, exercises: [] };
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
      if (!merged[type] && data.count >= 1) merged[type] = data.exercises;
    });
    return merged;
  }, [historyTypes]);

  function startAssignedRoutine(routine) {
    const exercises = (routine.exercises || []).map((ex) => ex.name || ex).filter(Boolean);
    useStore.setState((s) => ({
      activeWorkout: {
        id: `workout-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: routine.name,
        date: new Date().toISOString().slice(0, 10),
        sets: exercises.map((exName) => {
          const meta = EXERCISE_DATABASE.find((e) => e.name === exName) || {};
          return {
            id: `set-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            exercise: exName,
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
  }

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

  const catalogNames = useMemo(() => EXERCISE_DATABASE.map((e) => e.name), []);

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

      {/* Assigned routines (for regular clients) */}
      {isUser && (
        <div style={{ marginBottom: 20 }}>
          <p className="section-label">Tu rutina personalizada</p>
          {loadingRoutines ? (
            <div className="loading-state small"><Icon name="Loader" size={18} className="spin" /><span>Cargando…</span></div>
          ) : assignedRoutines.length === 0 ? (
            <div className="notice">
              <Icon name="Info" size={16} />
              <p>Tu entrenador aún no cargó tu rutina. Mientras tanto, podés usar las rutinas generales o entrenar libre.</p>
            </div>
          ) : (
            <div className="assigned-routines">
              {assignedRoutines.map((r) => (
                <div key={r.id} className="assigned-routine-card">
                  <div className="assigned-routine-info">
                    <strong>{r.name}</strong>
                    <small>{r.exercises?.length || 0} ejercicios</small>
                    <div className="routine-exercises-preview">
                      {(r.exercises || []).slice(0, 4).map((ex, i) => (
                        <span key={i} className="ex-chip">{ex.name || ex}</span>
                      ))}
                      {(r.exercises || []).length > 4 && (
                        <span className="ex-chip muted">+{r.exercises.length - 4} más</span>
                      )}
                    </div>
                  </div>
                  <button className="primary" onClick={() => startAssignedRoutine(r)}>
                    <Icon name="Play" size={14} /> Iniciar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generic routines (available to all roles) */}
      {!isUser && (
        <>
          <p className="section-label">Rutinas generales</p>
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
                    {editExercises.map((ex, i) => (
                      <div key={i} style={{ display: "flex", gap: 4, width: "100%", marginBottom: 4 }}>
                        <input
                          list="ex-suggestions"
                          value={ex}
                          onChange={(e) => {
                            const next = [...editExercises];
                            next[i] = e.target.value;
                            setEditExercises(next);
                          }}
                          placeholder="Ejercicio..."
                          style={{ flex: 1, background: "#0b1518", border: "1px solid #1b2d31", borderRadius: 12, padding: "8px 10px", color: "var(--text)", fontSize: 13 }}
                        />
                        <button className="danger" style={{ padding: "8px 10px", borderRadius: 10 }} onClick={() => setEditExercises((p) => p.filter((_, idx) => idx !== i))}>✕</button>
                      </div>
                    ))}
                    <datalist id="ex-suggestions">
                      {catalogNames.map((n) => <option key={n} value={n} />)}
                    </datalist>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="ghost" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => setEditExercises((p) => [...p, ""])}>+ Agregar</button>
                      <button className="primary" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => handleStart(name)}>Iniciar</button>
                      <button className="ghost" style={{ padding: "8px", fontSize: 12 }} onClick={() => setEditRoutine(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button className="ghost" style={{ width: "100%", marginTop: 4, padding: "8px", fontSize: 12 }} onClick={() => { setEditRoutine(name); setEditExercises([...exercises]); }}>
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
        </>
      )}

      {isUser && (
        <button className="ghost" style={{ width: "100%", marginTop: 8 }} onClick={startEmptyWorkout}>
          <Icon name="Plus" size={14} /> Entrenamiento libre
        </button>
      )}
    </section>
  );
}
