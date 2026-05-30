import { useMemo, useState, useRef, useEffect } from "react";
import useStore from "../store/useStore.js";
import ExercisePicker from "../components/ExercisePicker.jsx";
import WorkoutSetCard from "../components/WorkoutSetCard.jsx";
import RestTimer from "../components/RestTimer.jsx";

const MAX_VISIBLE_SETS = 3;

function groupSetsByExercise(sets) {
  const map = new Map();
  (sets || []).forEach((set) => {
    const key = set.exercise;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(set);
  });
  return Array.from(map.entries()).map(([exercise, exerciseSets]) => ({ exercise, sets: exerciseSets }));
}

export default function WorkoutPage() {
  const active = useStore((state) => state.activeWorkout);
  const update = useStore((state) => state.updateActiveSet);
  const repeat = useStore((state) => state.repeatSet);
  const remove = useStore((state) => state.removeActiveSet);
  const addExercise = useStore((state) => state.addExerciseToActiveWorkout);
  const addSeriesToExercise = useStore((state) => state.addSeriesToExercise);
  const finish = useStore((state) => state.finishWorkout);
  const cancel = useStore((state) => state.cancelWorkout);
  const setPage = useStore((state) => state.setPage);
  const [showPicker, setShowPicker] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const listRef = useRef(null);

  const groupedExercises = useMemo(() => groupSetsByExercise(active?.sets || []), [active?.sets]);

  const lastCountRef = useRef(active?.sets?.length || 0);
  useEffect(() => {
    lastCountRef.current = active?.sets?.length || 0;
  }, [active?.sets?.length]);

  function collapseAll(sets) {
    if (sets.length <= MAX_VISIBLE_SETS) return null;
    const hidden = sets.slice(0, -MAX_VISIBLE_SETS);
    const lastId = hidden[hidden.length - 1]?.id;
    if (collapsed[lastId]) return null;
    return hidden;
  }

  if (!active) {
    return (
      <section className="page">
        <h1>No hay entrenamiento activo</h1>
        <button className="primary" onClick={() => setPage("start")}>Empezar uno</button>
      </section>
    );
  }

  return (
    <section className="page workout-page">
      <div className="top-row">
        <div>
          <p className="eyebrow">Entrenando</p>
          <h1>{active.type}</h1>
          <small>{active.date}</small>
        </div>
        <button className="ghost" onClick={() => { if (window.confirm("¿Cancelar el entrenamiento? Se perderán los datos no guardados.")) cancel(); }}>Cancelar</button>
      </div>

      <div className="sets-list" ref={listRef}>
        {groupedExercises.length === 0 && (
          <div className="notice">
            <b>Entrenamiento libre</b>
            <p>Agregá un ejercicio desde el banco.</p>
          </div>
        )}

        {groupedExercises.map(({ exercise, sets }) => {
          const first = sets[0];
          const hidden = collapseAll(sets);
          const visible = hidden ? sets.slice(-MAX_VISIBLE_SETS) : sets;
          return (
            <div className="exercise-block" key={exercise}>
              <div className="exercise-block-head">
                <div>
                  <b>{exercise}</b>
                  <small>{first.group} · {first.muscle}</small>
                  <span className="last-line">
                    Último: {first.lastWeight || "—"} kg · {first.lastReps || "—"} reps · {first.lastSets || 0} series
                    {first.lastDate ? ` · ${first.lastDate}` : ""}
                  </span>
                </div>
                <button className="secondary small" onClick={() => addSeriesToExercise(exercise, true)}>+ Serie</button>
              </div>

              {hidden && (
                <button className="collapsed-bar" onClick={() => {
                  const lastId = hidden[hidden.length - 1]?.id;
                  setCollapsed((c) => ({ ...c, [lastId]: true }));
                }}>
                  {hidden.length} serie{hidden.length > 1 ? "s" : ""} anteriores — mostrar
                </button>
              )}

              {visible.map((setItem) => {
                const globalIndex = sets.indexOf(setItem);
                return (
                  <WorkoutSetCard
                    key={setItem.id}
                    index={globalIndex + 1}
                    setItem={setItem}
                    onUpdate={(patch) => update(setItem.id, patch)}
                    onRepeat={() => repeat(setItem.id)}
                    onRemove={() => remove(setItem.id)}
                    onStartTimer={() => setShowTimer(true)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <button className="secondary full" onClick={() => setShowPicker(!showPicker)}>
        {showPicker ? "Cerrar banco" : "+ Agregar ejercicio"}
      </button>

      {showPicker && (
        <div className="card">
          <ExercisePicker compact onPick={(exercise) => { addExercise(exercise); setShowPicker(false); }} />
        </div>
      )}

      <button className="finish-button" onClick={finish}>Finalizar entrenamiento</button>

      {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
    </section>
  );
}
