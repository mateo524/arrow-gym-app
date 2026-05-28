import { useState, useMemo } from "react";
import useStore from "../store/useStore.js";
import ExercisePicker from "../components/ExercisePicker.jsx";
import { BODY_GROUPS } from "../data/exerciseDatabase.js";

const FOCUS_OPTIONS = ["Full Body", "Hombros", "Pecho", "Espalda", "Brazos", "Piernas", "Core"];

const GROUP_ICONS = {
  Hombros: "🏋️", Pecho: "💪", Espalda: "🔙", Brazos: "💪", Piernas: "🦵", Core: "🔥"
};

const WIZARD_STEPS = [
  { id: "name", title: "Nombre" },
  { id: "groups", title: "Músculos" },
  { id: "exercises", title: "Ejercicios" },
  { id: "review", title: "Revisión" },
];

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
  const getCatalog = useStore((state) => state.getCatalog);

  const [editingId, setEditingId] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", focus: "Full Body" });
  const [addingToRoutine, setAddingToRoutine] = useState(null);
  const [wizard, setWizard] = useState(null);
  const [wStep, setWStep] = useState(0);
  const [wName, setWName] = useState("");
  const [wGroups, setWGroups] = useState([]);
  const [wExercises, setWExercises] = useState([]);
  const [wQuery, setWQuery] = useState("");
  const [wGroupFilter, setWGroupFilter] = useState("Todos");

  const allRoutines = useMemo(() => {
    return [...customRoutines].sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
  }, [customRoutines]);

  function resetWizard() {
    setWizard(null);
    setWStep(0);
    setWName("");
    setWGroups([]);
    setWExercises([]);
    setWQuery("");
    setWGroupFilter("Todos");
  }

  function startWizard() {
    resetWizard();
    setWizard(true);
  }

  function toggleGroup(group) {
    setWGroups((prev) => prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]);
  }

  const suggestedExercises = useMemo(() => {
    const catalog = getCatalog();
    if (wGroups.length === 0) return catalog.slice(0, 30);
    return catalog.filter((ex) => wGroups.includes(ex.group)).sort((a, b) => {
      const aSelected = wExercises.some((e) => e.name === a.name) ? 1 : 0;
      const bSelected = wExercises.some((e) => e.name === b.name) ? 1 : 0;
      return bSelected - aSelected;
    });
  }, [wGroups, wExercises, getCatalog]);

  const filteredSuggested = useMemo(() => {
    let list = suggestedExercises;
    if (wQuery) {
      const q = wQuery.toLowerCase();
      list = list.filter((ex) => ex.name.toLowerCase().includes(q));
    }
    if (wGroupFilter !== "Todos") {
      list = list.filter((ex) => ex.group === wGroupFilter);
    }
    return list;
  }, [suggestedExercises, wQuery, wGroupFilter]);

  function toggleExercise(ex) {
    setWExercises((prev) => {
      const exists = prev.find((e) => e.name === ex.name);
      if (exists) return prev.filter((e) => e.name !== ex.name);
      return [...prev, { name: ex.name, group: ex.group, muscle: ex.muscle, equipment: ex.equipment }];
    });
  }

  function finishWizard() {
    if (!wName.trim() || wExercises.length === 0) return;
    createRoutine({
      name: wName.trim(),
      description: `Creada con coach · ${wGroups.length > 0 ? wGroups.join(", ") : "Full Body"}`,
      focus: wGroups.length > 0 ? wGroups[0] : "Full Body",
      exercises: wExercises.map((ex, i) => ({
        id: `ritem-${Date.now()}-${i}`,
        exerciseId: ex.name.toLowerCase().replace(/\s+/g, "-"),
        name: ex.name,
        group: ex.group,
        muscle: ex.muscle,
        equipment: ex.equipment || "",
        targetSets: 3,
        targetReps: "10-12",
        notes: "",
      })),
    });
    resetWizard();
  }

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

  function renderWizardStep() {
    const step = WIZARD_STEPS[wStep];
    const canNext = {
      name: wName.trim().length > 0,
      groups: true,
      exercises: wExercises.length > 0,
      review: true,
    };

    return (
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.id} style={{
              flex: 1, height: 4, borderRadius: 4,
              background: i <= wStep ? "#6df2a4" : "#1c2c2e",
            }} />
          ))}
        </div>

        <p className="eyebrow" style={{ margin: 0 }}>
          {step.title} · Paso {wStep + 1} de {WIZARD_STEPS.length}
        </p>

        {step.id === "name" && (
          <div style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>¿Cómo se llama tu rutina?</h2>
            <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
              Elegí el nombre que quieras — puede ser por músculo, por día, o lo que se te ocurra.
            </p>
            <input
              placeholder="Ej: Full Body, Push Day, Lunes..."
              value={wName}
              onChange={(e) => setWName(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {step.id === "groups" && (
          <div style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>¿Qué grupos querés trabajar?</h2>
            <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
              Podés elegir varios. No hay límite ni estructura fija.
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {BODY_GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() => toggleGroup(group)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: wGroups.includes(group) ? "2px solid #6df2a4" : "1px solid #304548",
                    background: wGroups.includes(group) ? "#0a1d13" : "transparent",
                    color: "#f4fff8",
                    fontSize: 15,
                    fontWeight: 700,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{GROUP_ICONS[group]}</span>
                  <span>{group}</span>
                  {wGroups.includes(group) && <span style={{ marginLeft: "auto", color: "#6df2a4" }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step.id === "exercises" && (
          <div style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>Elegí tus ejercicios</h2>
            <p className="muted" style={{ marginBottom: 8, fontSize: 13 }}>
              {wExercises.length > 0
                ? `${wExercises.length} ejercicio${wExercises.length > 1 ? "s" : ""} seleccionado${wExercises.length > 1 ? "s" : ""}`
                : "Seleccioná al menos un ejercicio"}
            </p>
            <input
              placeholder="Buscar ejercicio..."
              value={wQuery}
              onChange={(e) => setWQuery(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
              <button
                className={wGroupFilter === "Todos" ? "primary" : "ghost"}
                style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999 }}
                onClick={() => setWGroupFilter("Todos")}
              >Todos</button>
              {BODY_GROUPS.map((g) => (
                <button
                  key={g}
                  className={wGroupFilter === g ? "primary" : "ghost"}
                  style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999 }}
                  onClick={() => setWGroupFilter(g)}
                >{g}</button>
              ))}
            </div>
            <div className="exercise-results" style={{ maxHeight: 360 }}>
              {filteredSuggested.slice(0, 40).map((ex) => {
                const selected = wExercises.some((e) => e.name === ex.name);
                return (
                  <button
                    key={ex.name}
                    onClick={() => toggleExercise(ex)}
                    style={{
                      background: selected ? "#0a1d13" : "#081011",
                      border: selected ? "1px solid #2d7650" : "1px solid #223234",
                      color: "#f4fff8",
                      borderRadius: 14,
                      padding: "10px 12px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <b>{ex.name}</b>
                        <small style={{ display: "block", color: "#8ea0a0" }}>{ex.group} · {ex.muscle} · {ex.equipment}</small>
                      </div>
                      {selected && <span style={{ color: "#6df2a4", fontSize: 18 }}>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step.id === "review" && (
          <div style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>Revisión final</h2>
            <div style={{ background: "#0a1d13", border: "1px solid #2d7650", borderRadius: 16, padding: 14, marginTop: 8 }}>
              <p className="eyebrow" style={{ margin: "0 0 4px" }}>Nombre</p>
              <b style={{ fontSize: 20 }}>{wName}</b>
              {wGroups.length > 0 && (
                <>
                  <p className="eyebrow" style={{ margin: "12px 0 4px" }}>Grupos musculares</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {wGroups.map((g) => (
                      <span key={g} style={{ background: "#13201b", padding: "4px 10px", borderRadius: 999, fontSize: 12, color: "#6df2a4" }}>
                        {GROUP_ICONS[g]} {g}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <p className="eyebrow" style={{ margin: "12px 0 4px" }}>Ejercicios ({wExercises.length})</p>
              <div style={{ display: "grid", gap: 4 }}>
                {wExercises.map((ex, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "rgba(0,0,0,.25)", borderRadius: 12, padding: "8px 10px",
                  }}>
                    <div>
                      <b style={{ fontSize: 13 }}>{ex.name}</b>
                      <small style={{ display: "block", fontSize: 10, color: "#8ea0a0" }}>{ex.group} · 3×10-12</small>
                    </div>
                    <button
                      className="danger small"
                      onClick={() => setWExercises((prev) => prev.filter((e) => e.name !== ex.name))}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {wStep > 0 ? (
            <button className="ghost" onClick={() => setWStep((s) => s - 1)} style={{ flex: 1 }}>
              Atrás
            </button>
          ) : (
            <button className="ghost" onClick={resetWizard} style={{ flex: 1 }}>
              Cancelar
            </button>
          )}
          {wStep < WIZARD_STEPS.length - 1 ? (
            <button
              className="primary"
              onClick={() => setWStep((s) => s + 1)}
              style={{ flex: 1 }}
              disabled={!canNext[step.id]}
            >
              Siguiente
            </button>
          ) : (
            <button
              className="primary"
              onClick={finishWizard}
              style={{ flex: 1 }}
              disabled={wExercises.length === 0}
            >
              Crear rutina
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="page">
      <p className="eyebrow">Rutinas personalizadas</p>
      <h1>Rutinas</h1>

      {!wizard && !showCreator && (
        <>
          <button className="primary big" onClick={startWizard}>
            + Crear rutina con coach
          </button>
          <button className="ghost full" onClick={() => { setForm({ name: "", description: "", focus: "Full Body" }); setEditingId(null); setShowCreator(true); }}>
            Crear rutina simple
          </button>
        </>
      )}

      {wizard && renderWizardStep()}

      {showCreator && (
        <div className="card" style={{ marginTop: 12 }}>
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
        {allRoutines.length === 0 && !wizard && !showCreator && <p className="muted" style={{ marginTop: 20 }}>No hay rutinas personalizadas todavía.</p>}
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
                <ExercisePicker compact onPick={(exercise) => { addExerciseToRoutine(routine.id, exercise); setAddingToRoutine(null); }} />
                <button className="ghost" style={{ marginTop: 8 }} onClick={() => setAddingToRoutine(null)}>Cerrar</button>
              </div>
            )}

            <div className="routine-card-footer">
              <button className="secondary small" onClick={() => setAddingToRoutine(addingToRoutine === routine.id ? null : routine.id)}>
                {addingToRoutine === routine.id ? "Cerrar" : "+ Agregar ejercicio"}
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
