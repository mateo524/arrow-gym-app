import { useState, useRef, useEffect } from "react";
import useStore from "../store/useStore.js";
import ExercisePicker from "../components/ExercisePicker.jsx";
import WorkoutSetCard from "../components/WorkoutSetCard.jsx";
import RestTimer from "../components/RestTimer.jsx";
import { useSuperset } from "../lib/hooks/useSuperset.js";

const MAX_VISIBLE_SETS = 3;

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

  const {
    groupedExercises,
    linkTarget,
    startLink,
    unlinkAll,
    isInSuperset,
    getNextExerciseForSuperset,
  } = useSuperset(active?.sets);

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

  function addSeriesToSuperset(members) {
    const next = getNextExerciseForSuperset(members);
    if (next) addSeriesToExercise(next, true);
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
    <section className="page workout-page" role="main" aria-label="Entrenamiento activo">
      <div className="top-row">
        <div>
          <p className="eyebrow">Entrenando</p>
          <h1>{active.type}</h1>
          <small>{active.date}</small>
        </div>
        <button className="ghost" onClick={() => { if (window.confirm("¿Cancelar el entrenamiento? Se perderán los datos no guardados.")) cancel(); }}>Cancelar</button>
      </div>

      <div className="sets-list" role="list" aria-label="Ejercicios y series">
        {groupedExercises.length === 0 && (
          <div className="notice" role="status">
            <b>Entrenamiento libre</b>
            <p>Agregá un ejercicio desde el banco.</p>
          </div>
        )}

        {groupedExercises.map(({ exercise, sets, supersetMembers, isSuperset }) => {
          const first = sets[0];
          const hidden = collapseAll(sets);
          const visible = hidden ? sets.slice(-MAX_VISIBLE_SETS) : sets;
          return (
            <div className={`exercise-block ${isSuperset ? "superset-block" : ""}`} key={exercise} role="listitem" aria-label={exercise}>
              <div className="exercise-block-head">
                <div>
                  <b aria-live="polite">{isSuperset ? exercise.split(" + ").map((name, i) => <span key={name}>{i > 0 && " + "}{name}</span>) : exercise}</b>
                  {!isSuperset && (
                    <>
                      <small>{first.group} · {first.muscle}</small>
                      <span className="last-line">
                        Último: {first.lastWeight || "—"} kg · {first.lastReps || "—"} reps · {first.lastSets || 0} series
                        {first.lastDate ? ` · ${first.lastDate}` : ""}
                      </span>
                    </>
                  )}
                </div>
                <div className="block-actions">
                  {!isSuperset && !isInSuperset(exercise) && (
                    <button className={`secondary small ${linkTarget === exercise ? "linking" : ""}`} onClick={() => startLink(exercise)} aria-label={linkTarget === exercise ? "Cancelar vínculo" : "Vincular en superserie"} aria-pressed={linkTarget === exercise}>
                      {linkTarget === exercise ? "Cancelar" : "🔗"}
                    </button>
                  )}
                  {isSuperset && (
                    <button className="secondary small" onClick={() => supersetMembers.forEach(unlinkAll)} aria-label="Desvincular superserie">✕</button>
                  )}
                  {linkTarget && linkTarget !== exercise && !isInSuperset(exercise) && (
                    <span className="link-hint" onClick={() => startLink(exercise)} role="button" tabIndex={0} aria-label={`Vincular ${exercise}`}>+ Vincular</span>
                  )}
                  {isSuperset
                    ? <button className="secondary small" onClick={() => addSeriesToSuperset(supersetMembers)} aria-label="Agregar serie a la superserie">+ Serie</button>
                    : <button className="secondary small" onClick={() => addSeriesToExercise(exercise, true)} aria-label={`Agregar serie a ${exercise}`}>+ Serie</button>
                  }
                </div>
              </div>

              {hidden && (
                <button className="collapsed-bar" onClick={() => {
                  const lastId = hidden[hidden.length - 1]?.id;
                  setCollapsed((c) => ({ ...c, [lastId]: true }));
                }} aria-label={`Mostrar ${hidden.length} series anteriores`}>
                  {hidden.length} serie{hidden.length > 1 ? "s" : ""} anteriores — mostrar
                </button>
              )}

              {visible.map((setItem) => {
                const isSupersetItem = isSuperset && setItem._supersetExercise;
                return (
                  <div className={isSupersetItem ? "superset-set-row" : ""} key={setItem.id}>
                    {isSupersetItem && <span className="superset-label" aria-hidden="true">{setItem._supersetExercise}</span>}
                    <WorkoutSetCard
                      setItem={setItem}
                      index={sets.indexOf(setItem) + 1}
                      onUpdate={(patch) => update(setItem.id, patch)}
                      onRepeat={() => repeat(setItem.id)}
                      onRemove={() => remove(setItem.id)}
                      onStartTimer={() => setShowTimer(true)}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <button className="secondary full" onClick={() => setShowPicker(!showPicker)} aria-expanded={showPicker} aria-controls="exercise-picker">
        {showPicker ? "Cerrar banco" : "+ Agregar ejercicio"}
      </button>

      {showPicker && (
        <div className="card" id="exercise-picker" role="dialog" aria-label="Banco de ejercicios">
          <ExercisePicker compact onPick={(exercise) => { addExercise(exercise); setShowPicker(false); }} />
        </div>
      )}

      <button className="finish-button" onClick={finish} aria-label="Finalizar entrenamiento">Finalizar entrenamiento</button>

      {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
    </section>
  );
}
