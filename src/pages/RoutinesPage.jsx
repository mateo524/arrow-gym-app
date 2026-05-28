import { useState, useMemo } from "react";
import useStore from "../store/useStore.js";
import ExercisePicker from "../components/ExercisePicker.jsx";

const FOCUS_OPTIONS = ["Full Body", "Hombros", "Pecho", "Espalda", "Brazos", "Piernas", "Core"];

export default function RoutinesPage() {
  const customRoutines = useStore((state) => state.customRoutines);
  const createRoutine = useStore((state) => state.createRoutine);
  const updateRoutine = useStore((state) => state.updateRoutine);
  const deleteRoutine = useStore((state) => state.deleteRoutine);
  const duplicateRoutine = useStore((state) => state.duplicateRoutine);
  const addExerciseToRoutine = useStore((state) => state.addExerciseToRoutine);
  const removeExerciseFromRoutine = useStore((state) => state.removeExerciseFromRoutine);
  const reorderRoutineExercise = useStore((state) => state.reorderRoutineExercise);
  const startWorkoutFromRoutine = useStore((state) => state.startWorkoutFromRoutine);

  const [editingId, setEditingId] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", focus: "Full Body" });
  const [addingToRoutine, setAddingToRoutine] = useState(null);

  const allRoutines = useMemo(() => {
    const builtIn = Object.entries(useStore.getState().getCatalog ? {} : {}).length > 0 ? [] : [];
    return [...customRoutines].sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
  }, [customRoutines]);

  function handleCreate() {
    if (!form.name.trim()) return;
    if (editingId) {
      updateRoutine(editingId, { name: form.name, description: form.description, focus: form.focus });
      setEditingId(null);
    } else {
      createRoutine(form);
    }
    setForm({ name: "", description: "", focus: "Full Body" });
    setShowCreator(false);
  }

  function handleEdit(routine) {
    setForm({ name: routine.name, description: routine.description || "", focus: routine.focus || "Full Body" });
    setEditingId(routine.id);
    setShowCreator(true);
  }

  function handleDelete(id) {
    if (window.confirm("¿Borrar esta rutina?")) {
      deleteRoutine(id);
    }
  }

  function handleReorder(routineId, fromIdx, toIdx) {
    if (toIdx < 0 || toIdx >= (customRoutines.find((r) => r.id === routineId)?.exercises.length || 0)) return;
    reorderRoutineExercise(routineId, fromIdx, toIdx);
  }

  return (
    <section className="page">
      <p className="eyebrow">Rutinas personalizadas</p>
      <h1>Rutinas</h1>

      {!showCreator && (
        <button className="primary big" onClick={() => { setForm({ name: "", description: "", focus: "Full Body" }); setEditingId(null); setShowCreator(true); }}>
          + Crear rutina
        </button>
      )}

      {showCreator && (
        <div className="card">
          <h2>{editingId ? "Editar rutina" : "Nueva rutina"}</h2>
          <input placeholder="Nombre de la rutina" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Descripción (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })}>
            {FOCUS_OPTIONS.map((f) => <option key={f}>{f}</option>)}
          </select>
          <div className="metric-actions">
            <button className="primary" onClick={handleCreate}>{editingId ? "Actualizar" : "Crear rutina"}</button>
            <button className="ghost" onClick={() => { setShowCreator(false); setEditingId(null); }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="routine-list">
        {allRoutines.length === 0 && <p className="muted">No hay rutinas personalizadas todavía. ¡Creá una!</p>}
        {allRoutines.map((routine) => (
          <div className="routine-card-full" key={routine.id}>
            <div className="routine-card-head">
              <div>
                <b>{routine.name}</b>
                <small>{routine.focus} · {routine.exercises.length} ejercicios</small>
                {routine.description && <p className="routine-desc">{routine.description}</p>}
              </div>
              <div className="routine-card-actions">
                <button className="primary small" onClick={() => startWorkoutFromRoutine(routine.id)}>Empezar</button>
              </div>
            </div>

            <div className="routine-exercises">
              {routine.exercises.map((ex, idx) => (
                <div className="routine-ex-item" key={ex.id}>
                  <div className="routine-ex-order">
                    <button className="ghost tiny" onClick={() => handleReorder(routine.id, idx, idx - 1)} disabled={idx === 0}>↑</button>
                    <span>{idx + 1}</span>
                    <button className="ghost tiny" onClick={() => handleReorder(routine.id, idx, idx + 1)} disabled={idx === routine.exercises.length - 1}>↓</button>
                  </div>
                  <div className="routine-ex-info">
                    <b>{ex.name}</b>
                    <small>{ex.targetSets}×{ex.targetReps} · {ex.group}</small>
                  </div>
                  <button className="danger small" onClick={() => removeExerciseFromRoutine(routine.id, ex.id)}>×</button>
                </div>
              ))}
            </div>

            {addingToRoutine === routine.id && (
              <div className="card" style={{ marginTop: 10 }}>
                <ExercisePicker
                  compact
                  onPick={(exercise) => {
                    addExerciseToRoutine(routine.id, exercise);
                    setAddingToRoutine(null);
                  }}
                />
                <button className="ghost" style={{ marginTop: 8 }} onClick={() => setAddingToRoutine(null)}>Cerrar</button>
              </div>
            )}

            <div className="routine-card-footer">
              <button className="secondary small" onClick={() => setAddingToRoutine(addingToRoutine === routine.id ? null : routine.id)}>
                {addingToRoutine === routine.id ? "Cerrar banco" : "+ Agregar ejercicio"}
              </button>
              <div className="routine-footer-actions">
                <button className="ghost tiny" onClick={() => handleEdit(routine)}>Editar</button>
                <button className="ghost tiny" onClick={() => duplicateRoutine(routine.id)}>Duplicar</button>
                <button className="danger small" onClick={() => handleDelete(routine.id)}>Borrar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
