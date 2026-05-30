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

function getInsertionOrder(set) {
  const ts = set.id?.split("-")[1];
  return ts ? Number(ts) : 0;
}

function mergeSupersetBlocks(groups, supersetGroups) {
  if (!supersetGroups.length) return groups;
  const used = new Set();
  const blocks = [];
  const groupMap = new Map(groups.map((g) => [g.exercise, g]));
  supersetGroups.forEach((sg) => {
    const members = sg.filter((name) => groupMap.has(name));
    if (members.length < 2) {
      members.forEach((m) => { if (!used.has(m)) { used.add(m); blocks.push(groupMap.get(m)); } });
      return;
    }
    const merged = members.flatMap((name) => {
      used.add(name);
      return (groupMap.get(name)?.sets || []).map((s) => ({ ...s, _supersetExercise: name }));
    });
    merged.sort((a, b) => getInsertionOrder(a) - getInsertionOrder(b));
    blocks.push({ exercise: members.join(" + "), sets: merged, supersetMembers: members, isSuperset: true });
  });
  groups.forEach((g) => { if (!used.has(g.exercise)) blocks.push(g); });
  return blocks;
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
  const [supersetGroups, setSupersetGroups] = useState([]);
  const [linkTarget, setLinkTarget] = useState(null);

  const groupedExercises = useMemo(() => {
    const groups = groupSetsByExercise(active?.sets || []);
    return mergeSupersetBlocks(groups, supersetGroups);
  }, [active?.sets, supersetGroups]);

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

  function startLink(exercise) {
    if (linkTarget === exercise) { setLinkTarget(null); return; }
    if (!linkTarget) { setLinkTarget(exercise); return; }
    if (linkTarget === exercise) { setLinkTarget(null); return; }
    const exists = supersetGroups.find((sg) => sg.includes(linkTarget) && sg.includes(exercise));
    if (exists) { setLinkTarget(null); return; }
    const merged = [...supersetGroups];
    const idxA = merged.findIndex((sg) => sg.includes(linkTarget));
    const idxB = merged.findIndex((sg) => sg.includes(exercise));
    if (idxA >= 0 && idxB >= 0) {
      const combined = [...merged[idxA], ...merged[idxB]];
      merged.splice(Math.max(idxA, idxB), 1);
      merged.splice(Math.min(idxA, idxB), 1, combined);
    } else if (idxA >= 0) {
      merged[idxA] = [...merged[idxA], exercise];
    } else if (idxB >= 0) {
      merged[idxB] = [...merged[idxB], linkTarget];
    } else {
      merged.push([linkTarget, exercise]);
    }
    setSupersetGroups(merged);
    setLinkTarget(null);
  }

  function unlinkAll(exercise) {
    setSupersetGroups((prev) => prev.filter((sg) => !sg.includes(exercise)));
  }

  function isInSuperset(exercise) {
    return supersetGroups.some((sg) => sg.includes(exercise));
  }

  function addSeriesToSuperset(members) {
    if (!members || members.length === 0) return;
    const counts = members.map((name) => ({
      name,
      count: (active?.sets || []).filter((s) => s.exercise === name).length,
    }));
    counts.sort((a, b) => a.count - b.count);
    addSeriesToExercise(counts[0].name, true);
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

      <div className="sets-list">
        {groupedExercises.length === 0 && (
          <div className="notice">
            <b>Entrenamiento libre</b>
            <p>Agregá un ejercicio desde el banco.</p>
          </div>
        )}

        {groupedExercises.map(({ exercise, sets, supersetMembers, isSuperset }) => {
          const first = sets[0];
          const hidden = collapseAll(sets);
          const visible = hidden ? sets.slice(-MAX_VISIBLE_SETS) : sets;
          return (
            <div className={`exercise-block ${isSuperset ? "superset-block" : ""}`} key={exercise}>
              <div className="exercise-block-head">
                <div>
                  <b>{isSuperset ? exercise.split(" + ").map((name, i) => <span key={name}>{i > 0 && " + "}{name}</span>) : exercise}</b>
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
                    <button className={`secondary small ${linkTarget === exercise ? "linking" : ""}`} onClick={() => startLink(exercise)}>
                      {linkTarget === exercise ? "Cancelar" : "🔗"}
                    </button>
                  )}
                  {isSuperset && (
                    <button className="secondary small" onClick={() => supersetMembers.forEach(unlinkAll)}>✕</button>
                  )}
                  {linkTarget && linkTarget !== exercise && !isInSuperset(exercise) && (
                    <span className="link-hint" onClick={() => startLink(exercise)}>+ Vincular</span>
                  )}
                  {isSuperset
                    ? <button className="secondary small" onClick={() => addSeriesToSuperset(supersetMembers)}>+ Serie</button>
                    : <button className="secondary small" onClick={() => addSeriesToExercise(exercise, true)}>+ Serie</button>
                  }
                </div>
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
                const isSupersetItem = isSuperset && setItem._supersetExercise;
                return (
                  <div className={isSupersetItem ? "superset-set-row" : ""} key={setItem.id}>
                    {isSupersetItem && <span className="superset-label">{setItem._supersetExercise}</span>}
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
