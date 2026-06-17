import { useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useStore from "../store/useStore.js";
import { getWorkoutVolume, hasData, formatDate, buildLiveCoachHints } from "../lib/analytics.js";
import ExercisePicker from "../components/ExercisePicker.jsx";
import WorkoutSetCard from "../components/WorkoutSetCard.jsx";
import RestTimer from "../components/RestTimer.jsx";
import VolumeSparkline from "../components/VolumeSparkline.jsx";
import PlateCalculator from "../components/PlateCalculator.jsx";

function groupSetsByExercise(sets) {
  const map = new Map();
  (sets || []).forEach((set) => {
    const key = set.exercise;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(set);
  });
  return Array.from(map.entries()).map(([exercise, exerciseSets]) => ({ exercise, sets: exerciseSets }));
}

function getVolumeHistory(workouts, exercise) {
  const volumes = [];
  for (const w of workouts || []) {
    const exSets = (w.sets || []).filter((s) => s.exercise === exercise && hasData(s));
    if (exSets.length) {
      volumes.push(exSets.reduce((sum, s) => sum + Number(s.weight || 0) * Number(s.reps || 0), 0));
    }
    if (volumes.length >= 5) break;
  }
  return volumes.reverse();
}

export default function WorkoutPage() {
  const active = useStore((state) => state.activeWorkout);
  const workouts = useStore((state) => state.workouts);
  const update = useStore((state) => state.updateActiveSet);
  const repeat = useStore((state) => state.repeatSet);
  const remove = useStore((state) => state.removeActiveSet);
  const addExercise = useStore((state) => state.addExerciseToActiveWorkout);
  const addSeriesToExercise = useStore((state) => state.addSeriesToExercise);
  const finish = useStore((state) => state.finishWorkout);
  const cancel = useStore((state) => state.cancelWorkout);
  const setPage = useStore((state) => state.setPage);
  const soundEnabled = useStore((state) => state.soundEnabled);

  const [showPicker, setShowPicker] = useState(false);
  const [restExercise, setRestExercise] = useState(null);
  const [restKey, setRestKey] = useState(0);
  const [calcTarget, setCalcTarget] = useState(null);
  const [calcSetId, setCalcSetId] = useState(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const handleSetComplete = useCallback((exercise) => {
    setRestExercise(exercise);
    setRestKey((k) => k + 1);
  }, []);

  const handleSkipRest = useCallback(() => {
    setRestExercise(null);
  }, []);

  const groupedExercises = useMemo(() => groupSetsByExercise(active?.sets || []), [active?.sets]);

  const emptySetsCount = useMemo(() => {
    return (active?.sets || []).filter((s) => !s.weight || !s.reps).length;
  }, [active?.sets]);

  const liveHints = useMemo(() => {
    try { return buildLiveCoachHints(active, workouts); } catch { return []; }
  }, [active?.sets, workouts]);

  function handleFinishClick() {
    if (emptySetsCount > 0) {
      setShowFinishConfirm(true);
    } else {
      finish();
    }
  }

  if (!active) {
    return (
      <section className="page">
        <h1>No hay entrenamiento activo</h1>
        <button className="primary" onClick={() => setPage("start")}>Empezar uno</button>
      </section>
    );
  }

  // Find next exercise label for rest timer
  const restExerciseIndex = groupedExercises.findIndex((g) => g.exercise === restExercise);
  const nextExercise = restExercise
    ? groupedExercises[restExerciseIndex]?.sets?.length > 0
      ? `Serie ${groupedExercises[restExerciseIndex].sets.length + 1} · ${restExercise}`
      : null
    : null;

  return (
    <section className="page workout-page">
      <div className="top-row">
        <div>
          <p className="eyebrow">Entrenando</p>
          <h1>{active.type}</h1>
          <small>{formatDate(active.date)}</small>
        </div>
        <button className="ghost" onClick={cancel}>Cancelar</button>
      </div>

      {/* Live coach hints */}
      {liveHints.length > 0 && (
        <div className="live-hints">
          {liveHints.map((hint, i) => (
            <div key={i} className={`live-hint live-hint-${hint.type}`}>{hint.msg}</div>
          ))}
        </div>
      )}

      <div className="sets-list">
        {groupedExercises.length === 0 && (
          <div className="notice">
            <b>Entrenamiento libre</b>
            <p>Agregá un ejercicio desde el banco.</p>
          </div>
        )}

        {groupedExercises.map(({ exercise, sets }) => {
          const first = sets[0];
          const volumeHistory = getVolumeHistory(workouts, exercise);
          return (
            <div className="exercise-block" key={exercise}>
              <div className="exercise-block-head">
                <div>
                  <div className="exercise-block-title">
                    <b>{exercise}</b>
                    <VolumeSparkline data={volumeHistory} />
                  </div>
                  <small>{first?.group} · {first?.muscle}</small>
                  <span className="last-line">
                    Último: {first?.lastWeight || "—"} kg · {first?.lastReps || "—"} reps · {first?.lastSets || 0} series
                    {first?.lastDate ? ` · ${first.lastDate}` : ""}
                  </span>
                </div>
                <button className="secondary small" onClick={() => addSeriesToExercise(exercise, true)} aria-label="Agregar serie">+ Serie</button>
              </div>

              {sets.map((setItem, index) => (
                <WorkoutSetCard
                  key={setItem.id}
                  index={index + 1}
                  setItem={setItem}
                  onUpdate={(patch) => update(setItem.id, patch)}
                  onRepeat={() => repeat(setItem.id)}
                  onRemove={() => remove(setItem.id)}
                  onStartRest={() => handleSetComplete(exercise)}
                  onOpenCalc={(w) => { setCalcTarget(w); setCalcSetId(setItem.id); }}
                />
              ))}
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

      <button className="finish-button" onClick={handleFinishClick}>
        {emptySetsCount > 0 ? `Finalizar (${emptySetsCount} vacías)` : "Finalizar entrenamiento"}
      </button>

      {/* Fixed rest timer overlay */}
      <AnimatePresence>
        {restExercise && (
          <motion.div
            className="rest-overlay"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="rest-overlay-label">
              <small>Descansando — {restExercise}</small>
            </div>
            <RestTimer
              key={restKey}
              active
              duration={90}
              soundEnabled={soundEnabled}
              onSkip={handleSkipRest}
              onComplete={handleSkipRest}
              nextLabel={nextExercise}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish confirmation modal */}
      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFinishConfirm(false)}
          >
            <motion.div
              className="modal-card confirm-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 8px" }}>¿Finalizar entrenamiento?</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 16px" }}>
                Tenés <b>{emptySetsCount} {emptySetsCount === 1 ? "serie" : "series"}</b> sin peso ni reps. No se van a guardar.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="ghost" style={{ flex: 1 }} onClick={() => setShowFinishConfirm(false)}>
                  Seguir
                </button>
                <button className="primary" style={{ flex: 1 }} onClick={() => { setShowFinishConfirm(false); finish(); }}>
                  Finalizar igual
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {calcTarget !== null && (
          <PlateCalculator
            target={calcTarget}
            onSelect={(w) => { if (calcSetId) update(calcSetId, { weight: String(w) }); }}
            onClose={() => { setCalcTarget(null); setCalcSetId(null); }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
