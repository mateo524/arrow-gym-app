import { useMemo, useState, useCallback, useEffect } from "react";
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

function ProgressiveOverloadChip({ sets, lastWeight }) {
  const bestWeight = Math.max(...sets.map((s) => Number(s.weight || 0)));
  if (!bestWeight || !lastWeight) return null;

  const diff = bestWeight - Number(lastWeight);
  let label, color, bg;
  if (diff > 0) {
    label = `↑ +${diff}kg vs anterior`;
    color = "#16a34a";
    bg = "#dcfce7";
  } else if (diff < 0) {
    label = `↓ ${diff}kg`;
    color = "#dc2626";
    bg = "#fee2e2";
  } else {
    label = "= mismo peso";
    color = "var(--muted)";
    bg = "var(--card-bg, #f1f5f9)";
  }

  return (
    <span style={{
      fontSize: 11,
      padding: "2px 8px",
      borderRadius: 10,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      backgroundColor: bg,
      color,
      marginTop: 4,
    }}>
      {label}
    </span>
  );
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
  const [elapsed, setElapsed] = useState(0);
  const [sessionNotes, setSessionNotes] = useState("");
  // Feature 2: showRpe state — Map of exercise name -> bool
  const [showRpeMap, setShowRpeMap] = useState(new Map());

  useEffect(() => {
    if (!active) return;
    const start = Date.now() - (active.elapsedMs || 0);
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [active?.id]);

  const handleSetComplete = useCallback((exercise) => {
    // Feature 3: haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);
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
    // Feature 3: haptic feedback on finish
    if (navigator.vibrate) navigator.vibrate(20);
    if (emptySetsCount > 0) {
      setShowFinishConfirm(true);
    } else {
      finish(sessionNotes);
    }
  }

  // Feature 5: timer color based on elapsed
  const elapsedMinutes = Math.floor(elapsed / 60);
  let timerColor;
  if (elapsedMinutes < 30) {
    timerColor = "var(--green)";
  } else if (elapsedMinutes < 60) {
    timerColor = "#f59e0b";
  } else {
    timerColor = "var(--danger)";
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
          {/* Feature 5: dynamic timer color and prominent styling */}
          <span className="workout-timer" style={{ color: timerColor, fontSize: 18, fontWeight: 700 }}>
            {String(Math.floor(elapsed/60)).padStart(2,"0")}:{String(elapsed%60).padStart(2,"0")}
          </span>
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

        {groupedExercises.map(({ exercise, sets }, groupIndex) => {
          const first = sets[0];
          const volumeHistory = getVolumeHistory(workouts, exercise);
          const rpeVisible = showRpeMap.get(exercise) || false;

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

                  {/* Feature 1: Progressive overload chip */}
                  {first?.lastWeight && (
                    <div>
                      <ProgressiveOverloadChip sets={sets} lastWeight={first.lastWeight} />
                    </div>
                  )}

                  {/* Feature 4: Warmup hint for heavy first exercise */}
                  {groupIndex === 0 && Number(first?.lastWeight || 0) >= 60 && (
                    <span style={{ fontSize: 11, color: "#f59e0b", marginTop: 4, display: "block" }}>
                      💡 Hacé 1-2 series de entrada antes de tu peso de trabajo
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <button className="secondary small" onClick={() => addSeriesToExercise(exercise, true)} aria-label="Agregar serie">+ Serie</button>
                  {/* Feature 2: RPE toggle button */}
                  <button
                    className="ghost small"
                    style={{ fontSize: 11, padding: "2px 8px" }}
                    onClick={() => {
                      setShowRpeMap((prev) => {
                        const next = new Map(prev);
                        next.set(exercise, !prev.get(exercise));
                        return next;
                      });
                    }}
                  >
                    RPE {rpeVisible ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {sets.map((setItem, index) => (
                <div key={setItem.id}>
                  <WorkoutSetCard
                    index={index + 1}
                    setItem={setItem}
                    onUpdate={(patch) => update(setItem.id, patch)}
                    onRepeat={() => repeat(setItem.id)}
                    onRemove={() => remove(setItem.id)}
                    onStartRest={() => handleSetComplete(exercise)}
                    onOpenCalc={(w) => { setCalcTarget(w); setCalcSetId(setItem.id); }}
                  />
                  {/* Feature 2: RPE row per set */}
                  {rpeVisible && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", padding: "4px 8px 8px", marginTop: -4 }}>
                      {[1,2,3,4,5,6,7,8,9,10].map((val) => (
                        <button
                          key={val}
                          onClick={() => update(setItem.id, { rpe: val })}
                          style={{
                            fontSize: 11,
                            padding: "2px 7px",
                            borderRadius: 8,
                            border: "1px solid var(--border, #e2e8f0)",
                            background: setItem.rpe === val ? "var(--green)" : "transparent",
                            color: setItem.rpe === val ? "#fff" : "inherit",
                            cursor: "pointer",
                            fontWeight: setItem.rpe === val ? 700 : 400,
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <textarea
        className="session-notes"
        placeholder="Notas de sesión… (opcional)"
        value={sessionNotes}
        onChange={(e) => setSessionNotes(e.target.value)}
        rows={2}
      />
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
                <button className="primary" style={{ flex: 1 }} onClick={() => { setShowFinishConfirm(false); finish(sessionNotes); }}>
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
