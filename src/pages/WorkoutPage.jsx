import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { hasData, formatDate, buildLiveCoachHints, getLiveVolumeStatus, getPostWorkoutSummary } from "../lib/analytics.js";
import LiveCoachPanel from "../components/LiveCoachPanel.jsx";
import ExercisePicker from "../components/ExercisePicker.jsx";
import WorkoutSetCard from "../components/WorkoutSetCard.jsx";
import RestTimer from "../components/RestTimer.jsx";
import VolumeSparkline from "../components/VolumeSparkline.jsx";
import Icon from "../components/Icon.jsx";

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

function getExerciseSessionHistory(workouts, exercise) {
  return (workouts || [])
    .filter(w => (w.sets||[]).some(s => s.exercise === exercise))
    .slice(0, 5)
    .map(w => ({
      date: w.date,
      sets: (w.sets||[]).filter(s => s.exercise === exercise && (s.weight || s.reps)),
    }));
}

function getExercisePR(workouts, exercise) {
  let bestWeight = 0, bestVolume = 0, bestReps = 0, bestRepsWeight = 0, lastDate = null;
  for (const w of workouts || []) {
    const exSets = (w.sets || []).filter((s) => s.exercise === exercise && hasData(s));
    for (const s of exSets) {
      const w_ = Number(s.weight), r = Number(s.reps), v = w_ * r;
      if (w_ > bestWeight) bestWeight = w_;
      if (v  > bestVolume) bestVolume = v;
      if (r  > bestReps) { bestReps = r; bestRepsWeight = w_; }
      if (!lastDate || w.date > lastDate) lastDate = w.date;
    }
  }
  return { bestWeight, bestVolume: Math.round(bestVolume), bestReps, bestRepsWeight, lastDate };
}

function ProgressiveOverloadChip({ sets, lastWeight }) {
  const bestWeight = Math.max(0, ...sets.map((s) => Number(s.weight || 0)).filter(v => v > 0));
  if (!bestWeight || !lastWeight) return null;
  const diff = bestWeight - Number(lastWeight);
  let label, color, bg;
  if (diff > 0) { label = `↑ +${diff}kg vs anterior`; color = "#16a34a"; bg = "rgba(168,85,247,.12)"; }
  else if (diff < 0) { label = `↓ ${diff}kg`; color = "#dc2626"; bg = "rgba(248,113,113,.12)"; }
  else { label = "= mismo peso"; color = "var(--muted)"; bg = "var(--panel2)"; }
  return (
    <span style={{ fontSize:11, padding:"2px 8px", borderRadius:10, display:"inline-flex", alignItems:"center", gap:4, backgroundColor:bg, color, marginTop:4 }}>
      {label}
    </span>
  );
}

const EXERCISE_TIPS = {
  "Chest Press Machine": "Sentate erguido, espalda pegada al respaldo. Agarre ancho, empujá hacia adelante exhalando. Bajá lento (2-3 seg) para maximizar el estiramiento.",
  "Incline Chest Press Machine": "Ajustá el asiento para que las manijas queden a altura de pecho. Empujá en diagonal hacia arriba. Controlá el retorno para trabajar el pectoral superior.",
  "Landmine Shoulder Press": "Parado con stance angosto, el extremo de la barra en la mano a altura de hombro. Empujá en arco diagonal hacia arriba. Activá el core durante todo el movimiento.",
  "Cable Lateral Raise": "De pie lateral a la polea baja. Llevá el brazo en arco hacia el costado hasta altura del hombro. Codo ligeramente flexionado, no uses impulso.",
  "Triceps Pushdown": "Codos pegados al cuerpo, sin moverlos. Empujá hacia abajo hasta bloquear el codo. Subí lentamente controlando el tríceps.",
  "Cable Lat Pulldown": "Agarre más ancho que los hombros. Inclinate levemente atrás, bajá la barra al pecho tirando con los codos hacia abajo. Apretá los dorsales al final.",
  "Lat Pullover": "Acostado en banco, mancuerna sobre la cabeza con codos semi-flexionados. Llevá en arco hasta la cadera. Sentí el estiramiento en los dorsales.",
  "Close Grip Lat Pulldown": "Agarre neutro más cerrado. Mantené el torso recto. Bajá la barra al pecho, codos hacia el piso. Más aislamiento en el dorsal.",
  "Dumbbell Row": "Apoyá una rodilla y mano en el banco. Espalda paralela al piso. Jalá la mancuerna hacia la cadera, codo pegado al cuerpo.",
  "Cable Face Pull": "Polea alta, agarre de cuerda. Jalá hacia tu cara separando las manos al final. Codos al nivel de los hombros o más arriba. Activa el deltoide posterior.",
  "Cable Biceps Curl": "Codos fijos al costado del cuerpo. Curlá hasta máxima flexión apretando el bíceps. Bajá lento para mayor tensión.",
  "Hammer Curl": "Agarre neutro (pulgares arriba). Curlá sin girar la muñeca. Trabaja el braquial y el bíceps. Alternado o simultáneo.",
  "High Row Machine": "Agarre neutro, jalá hacia la cadera. Codos hacia atrás y abajo. Apretá las escápulas al final del movimiento.",
  "Leg Extension": "Sentado, ajustá el rodillo sobre los tobillos. Extendé completamente y apretá el cuádriceps arriba. Bajá lento para mayor trabajo.",
  "Leg Curl": "Boca abajo o sentado según la máquina. Curlá los talones hasta los glúteos. Bajá lento controlando los isquios.",
  "Bulgarian Split Squat": "Pie trasero elevado en banco. Bajá la rodilla delantera sin sobrepasar la punta del pie. Torso recto. Excelente para glúteo y cuádriceps.",
  "Press de banca plano": "Espalda arqueada natural, pies en el piso. Baja la barra al pecho tocando levemente. Empujá explosivamente.",
  "Sentadilla": "Pies al ancho de hombros, puntas levemente hacia afuera. Bajá como si te sentaras, rodillas alineadas con pies. Espalda recta.",
  "Peso muerto": "Barra sobre la mitad del pie. Doblá las rodillas, agarra la barra, activá el core. Empujá el piso con los pies para subir. Espalda recta.",
  "Press banca": "Escápulas retraídas y deprimidas en el banco. Arco natural en la espalda baja. Grip ligeramente más ancho que los hombros. Bajar la barra al esternón bajo. Empujar 'abriendo' la barra, no hacia arriba. Evitá rebotar la barra en el pecho y levantar los glúteos del banco.",
  "Dominadas": "Agarre supino = más bíceps; prono = más espalda. Iniciá el movimiento retraendo escápulas. Llevá el pecho a la barra. Bajá completamente sin balancear. Core activado durante todo el movimiento.",
  "Press militar": "Core muy activado para proteger la lumbar. Empujá verticalmente sobre la cabeza. Llevá la cabeza 'hacia atrás' para que la barra pase. Bajá hasta la clavícula. No arquees la espalda baja.",
};

function getTip(exerciseName) {
  if (!exerciseName) return null;
  const direct = EXERCISE_TIPS[exerciseName];
  if (direct) return direct;
  const name = exerciseName.toLowerCase();
  for (const [key, val] of Object.entries(EXERCISE_TIPS)) {
    if (name.includes(key.toLowerCase()) || key.toLowerCase().includes(name)) return val;
  }
  return "Ejecutá el movimiento en forma controlada. Concentrarte en el músculo objetivo, exhalá en el esfuerzo, inhalá en la fase excéntrica.";
}

export default function WorkoutPage() {
  const active = useStore((state) => state.activeWorkout);
  const workouts = useStore((state) => state.workouts);
  const update = useStore((state) => state.updateActiveSet);
  const repeat = useStore((state) => state.repeatSet);
  const remove = useStore((state) => state.removeActiveSet);
  const addExercise = useStore((state) => state.addExerciseToActiveWorkout);
  const addSeriesToExercise = useStore((state) => state.addSeriesToExercise);
  const linkSuperset = useStore((s) => s.linkSuperset);
  const addDropset   = useStore((s) => s.addDropset);
  const swapExercise = useStore((s) => s.swapExercise);
  const finish = useStore((state) => state.finishWorkout);
  const cancel = useStore((state) => state.cancelWorkout);
  const reorderActiveExercise = useStore(s => s.reorderActiveExercise);
  const exerciseRestTimes = useStore(s => s.exerciseRestTimes) || {};
  const setExerciseRestTime = useStore(s => s.setExerciseRestTime);
  const setPage = useStore((state) => state.setPage);
  const soundEnabled = useStore((state) => state.soundEnabled);
  const userGoal = useStore((state) => state.userGoal);
  const weightLog = useStore((state) => state.weightLog) || [];
  const profile = useAuthStore((state) => state.profile);
  const prs = useStore(s => s.prs) || [];
  const saveWorkoutDraft = useStore(s => s.saveWorkoutDraft);
  const clearWorkoutDraft = useStore(s => s.clearWorkoutDraft);
  const cardioHistory = useStore(s => s.cardioHistory) || [];
  const activePlanAdjustment = useStore(s => s.activePlanAdjustment);

  // Slider navigation
  const sliderRef = useRef(null);
  const [currentExIndex, setCurrentExIndex] = useState(0);

  // Modals & panels
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [swapTarget, setSwapTarget] = useState(null);
  const [supersetTarget, setSupersetTarget] = useState(null);
  const [restExercise, setRestExercise] = useState(null);
  const [restKey, setRestKey] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showRpe, setShowRpe] = useState(false);
  const [sessionRpe, setSessionRpe] = useState(null);
  const [postSummary, setPostSummary] = useState(null);
  const [flippedExercise, setFlippedExercise] = useState(null);
  const [tipExercise, setTipExercise] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessionNotes, setSessionNotes] = useState("");
  const [workoutRPE, setWorkoutRPE] = useState(null);
  const [historyExercise, setHistoryExercise] = useState(null);
  const [editRestExercise, setEditRestExercise] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [deletedSet, setDeletedSet] = useState(null);
  const [showSaveRoutine, setShowSaveRoutine] = useState(false);
  const [saveRoutineName, setSaveRoutineName] = useState("");
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [saveRoutineError, setSaveRoutineError] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const [prToast, setPrToast] = useState(null);
  const [restDone, setRestDone] = useState(false);
  const pendingFinishRef = useRef(null);
  const undoTimerRef = useRef(null);

  // Derived
  const groupedExercises = useMemo(() => groupSetsByExercise(active?.sets || []), [active?.sets]);
  const emptySetsCount = useMemo(() => (active?.sets || []).filter((s) => !s.weight || !s.reps).length, [active?.sets]);
  const liveHints = useMemo(() => { try { return buildLiveCoachHints(active, workouts, cardioHistory); } catch { return []; } }, [active?.sets, workouts, cardioHistory]);
  const volStatus  = useMemo(() => { try { return getLiveVolumeStatus(active, workouts); } catch { return {}; } }, [active?.sets, workouts]);

  const workoutTypeTheme = useMemo(() => {
    const t = (active?.type || "").toLowerCase();
    if (t.includes("push") || t.includes("pecho") || t.includes("hombro")) return { accent: "#60a5fa", glow: "rgba(96,165,250,.15)" };
    if (t.includes("pull") || t.includes("espalda") || t.includes("bícep") || t.includes("bicep")) return { accent: "#a78bfa", glow: "rgba(167,139,250,.15)" };
    if (t.includes("leg") || t.includes("pierna") || t.includes("cuád") || t.includes("cuad")) return { accent: "#f59e0b", glow: "rgba(245,158,11,.15)" };
    return { accent: "var(--green)", glow: "rgba(168,85,247,.1)" };
  }, [active?.type]);

  const prCache = useMemo(() => {
    const cache = {};
    groupedExercises.forEach(({ exercise }) => { cache[exercise] = getExercisePR(workouts, exercise); });
    return cache;
  }, [groupedExercises, workouts]);

  const elapsedMinutes = Math.floor(elapsed / 60);
  const timerColor = elapsedMinutes < 30 ? "var(--green)" : elapsedMinutes < 60 ? "#f59e0b" : "var(--danger)";

  // Elapsed timer — anchored to wall-clock startedAt so it survives backgrounding and navigation
  useEffect(() => {
    if (!active) return;
    const start = active.startedAt || (Date.now() - (active.elapsedMs || 0));
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active?.id]);

  // Auto-save draft
  useEffect(() => {
    const interval = setInterval(() => {
      if (active) saveWorkoutDraft({ sets: active.sets, type: active.type, savedAt: new Date().toISOString() });
    }, 30000);
    return () => clearInterval(interval);
  }, [active, saveWorkoutDraft]);

  // Detect new PR
  useEffect(() => {
    if (!active?.sets?.length) return;
    const sets = active.sets.filter(s => Number(s.weight) > 0 && Number(s.reps) > 0);
    for (const s of sets) {
      const exercisePRs = prs?.filter(p => p.exercise === s.exercise) || [];
      const maxPR = Math.max(0, ...exercisePRs.map(p => Number(p.weight)));
      if (Number(s.weight) > maxPR && maxPR > 0) {
        setPrToast(s.exercise);
        // Strong haptic pattern for PR
        if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 120]);
        const t = setTimeout(() => setPrToast(null), 3500);
        return () => clearTimeout(t);
      }
    }
  }, [active?.sets, prs]);

  // Scroll to new exercise when added
  const prevExCountRef = useRef(0);
  useEffect(() => {
    if (groupedExercises.length > prevExCountRef.current) {
      if (prevExCountRef.current === 0) {
        // Routine just loaded — go to first exercise
        setTimeout(() => scrollToExercise(0), 80);
        setCurrentExIndex(0);
      } else {
        // Single exercise added — go to it
        const newIdx = groupedExercises.length - 1;
        setTimeout(() => scrollToExercise(newIdx), 80);
        setCurrentExIndex(newIdx);
      }
    }
    prevExCountRef.current = groupedExercises.length;
  }, [groupedExercises.length]);

  // Slider
  function handleSliderScroll() {
    if (!sliderRef.current) return;
    const idx = Math.round(sliderRef.current.scrollLeft / sliderRef.current.clientWidth);
    setCurrentExIndex(idx);
  }

  function scrollToExercise(idx) {
    if (!sliderRef.current) return;
    sliderRef.current.scrollTo({ left: idx * sliderRef.current.clientWidth, behavior: "smooth" });
  }

  const handleSetComplete = useCallback((exercise) => {
    if (navigator.vibrate) navigator.vibrate([30, 20, 60]);
    setRestExercise(exercise);
    setRestKey((k) => k + 1);
    // Auto-navigate to superset partner
    const activeSets = useStore.getState().activeWorkout?.sets || [];
    const thisSet = activeSets.find(s => s.exercise === exercise);
    if (thisSet?.supersetGroup) {
      const partnerExercise = activeSets.find(s => s.supersetGroup === thisSet.supersetGroup && s.exercise !== exercise);
      if (partnerExercise) {
        const partnerIdx = groupedExercises.findIndex(g => g.exercise === partnerExercise.exercise);
        if (partnerIdx !== -1) setTimeout(() => scrollToExercise(partnerIdx), 600);
      }
    }
  }, [groupedExercises]);

  const handleSkipRest = useCallback(() => { setRestExercise(null); setRestDone(false); }, []);
  const handleRestComplete = useCallback(() => {
    setRestDone(true);
    setTimeout(() => { setRestDone(false); setRestExercise(null); }, 4000);
  }, []);

  function doFinish(notes, rpe) {
    const summary = getPostWorkoutSummary(active, workouts);
    const exerciseNames = (active?.sets || []).map(s => s.exercise).filter(Boolean);
    const uniqueExercises = [...new Set(exerciseNames)];
    pendingFinishRef.current = { notes, rpe, summary };
    const userId = profile?.id || useAuthStore.getState().profile?.id;
    if (!userId || uniqueExercises.length === 0) {
      _commitFinish(notes, rpe, summary);
      return;
    }
    const timeout = setTimeout(() => _commitFinish(notes, rpe, summary), 5000);
    import("../lib/supabase.js").then(({ supabase }) => {
      supabase.from("routines").select("id, exercises").eq("user_id", userId).then(({ data, error }) => {
        clearTimeout(timeout);
        if (error || !data) { _commitFinish(notes, rpe, summary); return; }
        const routines = data || [];
        const alreadySaved = routines.some(r => {
          const rNames = (r.exercises || []).map(e => e.name);
          const overlap = uniqueExercises.filter(n => rNames.includes(n)).length;
          return overlap >= Math.min(uniqueExercises.length, rNames.length) * 0.8;
        });
        if (!alreadySaved) {
          setSaveRoutineName("");
          setShowSaveRoutine(true);
        } else {
          _commitFinish(notes, rpe, summary);
        }
      }).catch(() => { clearTimeout(timeout); _commitFinish(notes, rpe, summary); });
    }).catch(() => { clearTimeout(timeout); _commitFinish(notes, rpe, summary); });
  }

  function _commitFinish(notes, rpe, summary) {
    finish(notes);
    clearWorkoutDraft();
    if (summary) setPostSummary({ ...summary, rpe });
    else setPage("home");
  }

  async function handleSaveRoutineAndFinish() {
    if (!saveRoutineName.trim()) {
      const { notes, rpe, summary } = pendingFinishRef.current || {};
      _commitFinish(notes, rpe, summary);
      return;
    }
    setSavingRoutine(true);
    setSaveRoutineError("");
    try {
      const { supabase } = await import("../lib/supabase.js");
      const exerciseNames = [...new Set((active?.sets || []).map(s => s.exercise).filter(Boolean))];
      const exercises = exerciseNames.map(name => ({
        exerciseId: null,
        name,
        sets: (active?.sets || []).filter(s => s.exercise === name).map(s => ({ reps: s.reps || "", weight: s.weight || "" })),
      }));
      const { error } = await supabase.from("routines").insert({ name: saveRoutineName.trim(), exercises, user_id: profile?.id, is_template: false });
      if (error) throw error;
      setSavingRoutine(false);
      setShowSaveRoutine(false);
      const { notes, rpe, summary } = pendingFinishRef.current || {};
      _commitFinish(notes, rpe, summary);
    } catch {
      setSaveRoutineError("No se pudo guardar la rutina. Intentá de nuevo.");
      setSavingRoutine(false);
    }
  }

  function handleFinishClick() {
    if (navigator.vibrate) navigator.vibrate(20);
    const allSets = active?.sets || [];
    const validSets = allSets.filter(s => s.weight && s.reps);
    setSummaryData({
      totalSets: validSets.length,
      totalVolume: validSets.reduce((sum, s) => sum + Number(s.weight||0)*Number(s.reps||0), 0),
      exercises: new Set(validSets.map(s => s.exercise)).size,
      newPRs: (() => {
        const seen = new Set();
        for (const s of validSets) {
          const best = prs.filter(p => p.exercise === s.exercise).reduce((max, p) => Math.max(max, Number(p.weight)||0), 0);
          if (Number(s.weight) > 0 && Number(s.weight) > best) seen.add(s.exercise);
        }
        return seen.size;
      })(),
    });
    setShowSummary(true);
  }

  if (!active) {
    return (
      <section className="page">
        <h1>No hay entrenamiento activo</h1>
        <button className="primary" onClick={() => setPage("start")}>Empezar uno</button>
      </section>
    );
  }

  const restExerciseIndex = groupedExercises.findIndex((g) => g.exercise === restExercise);
  const nextExercise = restExercise && groupedExercises[restExerciseIndex]?.sets?.length > 0
    ? `Serie ${groupedExercises[restExerciseIndex].sets.length + 1} · ${restExercise}`
    : null;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
    <section className="page" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden", position: "fixed", left: 0, right: 0, top: "max(env(safe-area-inset-top, 0px), 0px)", bottom: "calc(60px + 58px + env(safe-area-inset-bottom, 0px))" }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: "10px 14px 8px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: "1px solid rgba(255,255,255,.05)",
        background: workoutTypeTheme.glow,
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: workoutTypeTheme.accent, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Entrenando
          </p>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {active.type}
          </h2>
        </div>
        {/* Timer */}
        <div style={{ fontSize: 20, fontWeight: 900, color: timerColor, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
          {String(Math.floor(elapsed/60)).padStart(2,"0")}:{String(elapsed%60).padStart(2,"0")}
        </div>
        {/* Volume */}
        {(() => {
          const totalVol = (active?.sets || []).reduce((sum, s) => sum + (Number(s.weight)||0)*(Number(s.reps)||0), 0);
          if (!totalVol) return null;
          return (
            <span style={{ fontSize: 12, color: "var(--muted)", flexShrink: 0 }}>
              <b style={{ color: workoutTypeTheme.accent }}>{totalVol}kg</b>
            </span>
          );
        })()}
        {/* 3-dot menu */}
        <button onClick={() => setShowMenu(true)} style={{
          background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 10, cursor: "pointer",
          color: "var(--text)", padding: "6px 8px", display: "flex", alignItems: "center",
        }}>
          <Icon name="MoreVertical" size={22} strokeWidth={2.2} />
        </button>
      </div>

      {/* ── DELOAD / PLAN ADJUSTMENT BANNER ────────────────────────────────── */}
      {activePlanAdjustment && new Date(activePlanAdjustment.expiresAt) >= new Date() && (() => {
        const typeMap = {
          deload:       { icon: "🔄", msg: `Semana de deload — pesos al ${Math.round(activePlanAdjustment.factor * 100)}% del habitual` },
          volume_up:    { icon: "📈", msg: "Semana de volumen — series aumentadas según el plan" },
          intensity_up: { icon: "⚡", msg: "Semana de intensidad — pesos incrementados según el plan" },
        };
        const { icon, msg } = typeMap[activePlanAdjustment.type] || { icon: "🏋️", msg: "Ajuste del coach activo" };
        const expires = new Date(activePlanAdjustment.expiresAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
        return (
          <div style={{ background: "rgba(168,85,247,.12)", borderBottom: "1px solid rgba(168,85,247,.3)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text)" }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ flex: 1 }}><strong>{msg}</strong> · hasta el {expires}</span>
          </div>
        );
      })()}

      {/* ── HORIZONTAL EXERCISE SLIDER ──────────────────────────────────────── */}
      <div
        ref={sliderRef}
        onScroll={handleSliderScroll}
        style={{
          flex: 1,
          display: "flex",
          overflowX: "scroll",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Empty state */}
        {groupedExercises.length === 0 && (
          <div style={{
            flex: "0 0 100%", scrollSnapAlign: "start",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 24, textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
            <p style={{ color: "var(--text)", fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>Entrenamiento libre</p>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 20px" }}>Tocá ⋮ para agregar ejercicios</p>
            <button
              style={{ background: "rgba(168,85,247,.15)", border: "1px solid rgba(168,85,247,.4)", borderRadius: 14, padding: "12px 24px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--green)" }}
              onClick={() => setShowMenu(true)}>
              + Agregar ejercicio
            </button>
          </div>
        )}

        {groupedExercises.map(({ exercise, sets }, groupIndex) => {
          const prData = prCache[exercise] || {};
          const isFlipped = flippedExercise === exercise;
          const isHistory = historyExercise === exercise;
          const coachHint = liveHints.find(h => h.exercise === exercise || h.msg?.includes(exercise));
          const isSupersetted = sets.some(s => s.supersetGroup);
          const supersetGroupId = sets.find(s => s.supersetGroup)?.supersetGroup;
          const supersetPartner = supersetGroupId
            ? groupedExercises.find(g => g.exercise !== exercise && g.sets.some(s => s.supersetGroup === supersetGroupId))?.exercise
            : null;
          const first = sets[0];
          const volumeHistory = getVolumeHistory(workouts, exercise);
          const bestPR = prs.filter(p => p.exercise === exercise).reduce((max, p) => Math.max(max, Number(p.weight)||0), 0);

          return (
            <div key={exercise} style={{
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              position: "relative",
              overflowY: "hidden",
            }}>
              {/* Exercise header */}
              <div style={{ padding: "12px 16px 6px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 2 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{exercise}</h2>
                      {isSupersetted && (
                        <span
                          style={{ fontSize: 10, background: "rgba(167,139,250,.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,.3)", borderRadius: 6, padding: "1px 6px", fontWeight: 700, cursor: "pointer" }}
                          onClick={() => { const pi = groupedExercises.findIndex(g => g.exercise === supersetPartner); if (pi !== -1) scrollToExercise(pi); }}
                        >⇄ {supersetPartner ? supersetPartner.split(" ")[0] : "SS"}</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: workoutTypeTheme.accent }}>{first?.group} · {first?.muscle}</span>
                      <VolumeSparkline data={volumeHistory} />
                    </div>
                    {first?.lastWeight && (
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 3 }}>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          Último: <b style={{ color: "var(--text)" }}>{first.lastWeight}kg × {first.lastReps}</b>
                        </span>
                        <ProgressiveOverloadChip sets={sets} lastWeight={first.lastWeight} />
                      </div>
                    )}
                    {coachHint && (
                      <div style={{ marginTop: 6, display: "flex", alignItems: "flex-start", gap: 6, background: "rgba(245,158,11,.08)", borderRadius: 8, padding: "5px 10px", border: "1px solid rgba(245,158,11,.2)" }}>
                        <span style={{ fontSize: 11 }}>⚡</span>
                        <span style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.35 }}>{coachHint.msg}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sets area (scrollable) OR PR/History view */}
              <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 8px", WebkitOverflowScrolling: "touch" }}>
                {isFlipped ? (
                  /* PR STATS VIEW */
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: workoutTypeTheme.accent, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Récords — {exercise}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      {[
                        { label:"Mejor peso",  value: prData?.bestWeight  ? `${prData.bestWeight}kg` : "—" },
                        { label:"Mejor vol.",  value: prData?.bestVolume  ? `${prData.bestVolume}kg` : "—" },
                        { label:"Más reps",    value: prData?.bestReps    ? `${prData.bestReps}×${prData.bestRepsWeight}kg` : "—" },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: "var(--panel2)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                          <div style={{ fontSize: 15, fontWeight: 900, color: "var(--green)" }}>{value}</div>
                          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    {prData?.lastDate && (
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 12px", textAlign: "center" }}>
                        Última sesión: {prData.lastDate}
                      </p>
                    )}
                    <p style={{ fontSize: 12, fontWeight: 700, color: workoutTypeTheme.accent, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Últimas sesiones</p>
                    {getExerciseSessionHistory(workouts, exercise).length === 0 ? (
                      <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin historial aún.</p>
                    ) : (
                      getExerciseSessionHistory(workouts, exercise).map((session, si) => (
                        <div key={si} style={{ marginBottom: 8, padding: "8px 10px", background: "var(--panel2)", borderRadius: 10 }}>
                          <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, marginBottom: 4 }}>{session.date}</div>
                          {session.sets.map((s, idx) => (
                            <div key={idx} style={{ fontSize: 12, color: "var(--text)" }}>
                              Serie {idx+1}: <b>{s.weight||"—"}kg</b> × <b>{s.reps||"—"}</b> reps
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* SETS VIEW */
                  <div>
                    {sets.map((setItem, index) => {
                      const isNewPR = Number(setItem.weight) > 0 && Number(setItem.weight) > bestPR;
                      return (
                        <div key={setItem.id} style={{ position: "relative" }}>
                          {isNewPR && (
                            <span style={{ position: "absolute", top: 8, left: 8, zIndex: 2, background: "var(--green)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 6 }}>
                              PR 🔥
                            </span>
                          )}
                          {setItem.isDropset && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px 2px", color: "#f87171", fontSize: 11, fontWeight: 700 }}>
                              <span>💧</span> DROP SET — bajá el peso
                            </div>
                          )}
                          <WorkoutSetCard
                            index={index + 1}
                            setItem={setItem}
                            onUpdate={(patch) => {
                              try { navigator.vibrate?.([30]); } catch {}
                              update(setItem.id, patch);
                            }}
                            onRepeat={() => repeat(setItem.id)}
                            onRemove={() => {
                              remove(setItem.id);
                              setDeletedSet({ set: setItem, index, exerciseIndex: groupIndex });
                              clearTimeout(undoTimerRef.current);
                              undoTimerRef.current = setTimeout(() => setDeletedSet(null), 5000);
                            }}
                            onStartRest={() => handleSetComplete(exercise)}
                            prData={prData}
                            coachSuggestion={(() => {
                              const w = Number(setItem.weight);
                              const r = Number(setItem.reps);
                              if (!w || !r) return null;
                              const goal = (userGoal || profile?.goal || "").toLowerCase();
                              let lowThresh = 4, highThresh = 14;
                              if (goal.includes("fuerza")) { lowThresh = 2; highThresh = 7; }
                              else if (goal.includes("hipertrofia") || goal.includes("masa")) { lowThresh = 5; highThresh = 13; }
                              else if (goal.includes("resistencia") || goal.includes("definicion") || goal.includes("definición") || goal.includes("perder")) { lowThresh = 10; highThresh = 21; }
                              if (r >= highThresh) return { dir: "up", weight: Math.round((w + 2.5) * 2) / 2, reason: "Muchas reps — subí peso" };
                              if (r <= lowThresh)  return { dir: "down", weight: Math.max(Math.round((w - 2.5) * 2) / 2, 0), reason: "Pocas reps — bajá peso" };
                              return null;
                            })()}
                          />
                        </div>
                      );
                    })}

                    {/* Dropset / Superset */}
                    <div style={{ display: "flex", gap: 8, padding: "6px 0 4px" }}>
                      <button className="ghost" style={{ flex: 1, fontSize: 12, padding: "7px 0", color: "#f87171", border: "1px solid rgba(248,113,113,.3)", borderRadius: 10 }}
                        onClick={() => addDropset(exercise)}>Drop Set</button>
                      <button className="ghost" style={{ flex: 1, fontSize: 12, padding: "7px 0", color: "#a78bfa", border: "1px solid rgba(167,139,250,.3)", borderRadius: 10 }}
                        onClick={() => setSupersetTarget(exercise)}>⇄ Super Serie</button>
                    </div>

                    {/* Add set */}
                    <button
                      onClick={() => addSeriesToExercise(exercise, true)}
                      style={{
                        width: "100%", marginTop: 6, padding: "12px",
                        background: "rgba(168,85,247,.08)", border: "1px dashed rgba(168,85,247,.35)",
                        borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--green)",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                      + Agregar serie
                    </button>
                  </div>
                )}

                {/* Rest timer selector */}
                {editRestExercise === exercise && (
                  <div style={{ padding: "8px 0", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--muted)", width: "100%", marginBottom: 4 }}>Tiempo de descanso:</span>
                    {[30,45,60,90,120,150,180,240,300].map(s => (
                      <button key={s} onClick={() => { setExerciseRestTime(exercise, s); setEditRestExercise(null); }}
                        style={{ padding: "7px 12px", borderRadius: 10, border: `1.5px solid ${(exerciseRestTimes[exercise]||90)===s ? "var(--green)" : "var(--line)"}`, background: (exerciseRestTimes[exercise]||90)===s ? "rgba(168,85,247,.15)" : "var(--panel2)", color: (exerciseRestTimes[exercise]||90)===s ? "var(--green)" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
                        {s < 60 ? `${s}s` : `${s/60}min`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── EXERCISE BOTTOM BAR ──────────────────────────────────────────── */}
              <div style={{
                padding: "8px 16px 10px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderTop: "1px solid rgba(255,255,255,.06)",
                flexShrink: 0,
              }}>
                {/* Left actions */}
                <div style={{ display: "flex", gap: 4 }}>
                  {/* Tip */}
                  <button onClick={() => setTipExercise(tipExercise === exercise ? null : exercise)}
                    style={{ background: "var(--panel2)", border: "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                    <Icon name="HelpCircle" size={17} strokeWidth={1.8} />
                  </button>
            
                  {/* Swap exercise */}
                  <button onClick={() => setSwapTarget(exercise)}
                    style={{ background: "var(--panel2)", border: "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}
                    title="Cambiar ejercicio">
                    <Icon name="RefreshCw" size={16} strokeWidth={1.8} />
                  </button>
                </div>
                {/* Right: flip (2-cards = stats) */}
                <button onClick={() => { setFlippedExercise(isFlipped ? null : exercise); setHistoryExercise(null); }}
                  style={{ background: isFlipped ? "rgba(168,85,247,.15)" : "var(--panel2)", border: isFlipped ? "1px solid rgba(168,85,247,.4)" : "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isFlipped ? "var(--green)" : "var(--muted)" }}
                  title="Ver récords">
                  <Icon name="Layers" size={17} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          );
        })}

        {/* ── EXTRA EXERCISES SLIDE ────────────────────────────────────────── */}
        {groupedExercises.length > 0 && (
          <div style={{ flex: "0 0 100%", scrollSnapAlign: "start", display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>➕</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>Agregar más ejercicios</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.5 }}>Deslizaste hasta el final.<br/>¿Querés agregar ejercicios extra?</p>
              <button onClick={() => setShowPicker(true)} style={{ background: "rgba(168,85,247,.15)", border: "1px solid rgba(168,85,247,.4)", borderRadius: 14, padding: "14px 32px", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "var(--green)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                + Agregar ejercicio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── NAVIGATION DOTS ─────────────────────────────────────────────────── */}
      {groupedExercises.length > 0 && (
        <div style={{ padding: "8px 16px 10px", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {[...Array(groupedExercises.length + 1)].map((_, i) => (
            <button key={i} onClick={() => scrollToExercise(i)} style={{
              width: i === currentExIndex ? 20 : 7,
              height: 7,
              borderRadius: 4,
              background: i === currentExIndex ? "#fff" : i === groupedExercises.length ? "rgba(168,85,247,.4)" : "rgba(255,255,255,.2)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.25s ease",
              padding: 0,
              flexShrink: 0,
            }} />
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MENU (kept inside section — rendered in-page, not fixed)
      ════════════════════════════════════════════════════════════════════════ */}

      {/* ── ⋮ MENU (bottom sheet) ─────────────────────────────────────────── */}
      {showMenu && (
        <div className="modal-overlay" onClick={() => setShowMenu(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "var(--bg)", borderRadius: "20px 20px 0 0",
            padding: "20px 16px 28px", maxHeight: "85vh", overflowY: "auto",
          }}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: "rgba(255,255,255,.15)", borderRadius: 2, margin: "0 auto 18px" }} />

            {/* Live Coach */}
            <LiveCoachPanel hints={liveHints} volStatus={volStatus} />

            {/* Add exercise */}
            <button
              onClick={() => { setShowMenu(false); setShowPicker(true); }}
              style={{ width: "100%", background: "rgba(168,85,247,.08)", border: "1px dashed rgba(168,85,247,.35)", borderRadius: 12, padding: "13px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--green)", marginBottom: 10 }}>
              + Agregar ejercicio
            </button>

            {/* Reorder */}
            {groupedExercises.length > 1 && (
              <div style={{ background: "var(--panel)", borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Reordenar ejercicios</p>
                {groupedExercises.map(({ exercise }, i) => (
                  <div key={exercise} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < groupedExercises.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                    <span style={{ flex: 1, fontSize: 13 }}>{exercise}</span>
                    <button onClick={() => reorderActiveExercise(exercise, "up")} disabled={i === 0}
                      style={{ background: "var(--panel2)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14, color: i === 0 ? "rgba(255,255,255,.2)" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
                    <button onClick={() => reorderActiveExercise(exercise, "down")} disabled={i === groupedExercises.length - 1}
                      style={{ background: "var(--panel2)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14, color: i === groupedExercises.length - 1 ? "rgba(255,255,255,.2)" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>↓</button>
                  </div>
                ))}
              </div>
            )}

            {/* RPE */}
            <div style={{ background: "var(--panel)", borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Esfuerzo (RPE)</p>
              <div style={{ display: "flex", gap: 6 }}>
                {[6,7,8,9,10].map(v => (
                  <button key={v} onClick={() => setWorkoutRPE(v)} style={{
                    flex: 1, height: 40, borderRadius: 10, fontSize: 14, fontWeight: 800,
                    border: `2px solid ${workoutRPE===v ? "var(--green)" : "var(--line)"}`,
                    background: workoutRPE===v ? "rgba(168,85,247,.15)" : "var(--panel2)",
                    color: workoutRPE===v ? "var(--green)" : "var(--muted)", cursor: "pointer",
                  }}>{v}</button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <textarea
              className="session-notes"
              placeholder="Notas de sesión… (opcional)"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={2}
              style={{ marginBottom: 10 }}
            />

            {/* Cancel */}
            <button className="ghost" style={{ width: "100%", color: "var(--danger)", border: "1px solid rgba(248,113,113,.3)", marginBottom: 8 }}
              onClick={() => { setShowMenu(false); setShowCancelConfirm(true); }}>
              Cancelar entrenamiento
            </button>

            {/* Finish */}
            <button className="primary" style={{ width: "100%" }}
              onClick={() => { setShowMenu(false); handleFinishClick(); }}>
              {emptySetsCount > 0 ? `Guardar entrenamiento (${emptySetsCount} vacías)` : "Guardar entrenamiento"}
            </button>
          </div>
        </div>
      )}

      {/* ── ADD EXERCISE PICKER ───────────────────────────────────────────── */}
      {showPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", flexDirection: "column" }}>
          <div style={{ background: "var(--bg)", borderRadius: "20px 20px 0 0", marginTop: "auto", maxHeight: "85vh", overflow: "auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 17 }}>Agregar ejercicio</h2>
              <button className="ghost" onClick={() => setShowPicker(false)} style={{ padding: "6px 12px" }}>✕</button>
            </div>
            {/* Quick-add: last 5 unique exercises from recent workouts */}
            {(() => {
              const recent = [...new Set(
                workouts.flatMap(w => (w.sets || []).map(s => s.exercise)).filter(Boolean)
              )].slice(0, 5);
              if (!recent.length) return null;
              return (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 8px" }}>Recientes</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {recent.map(name => (
                      <button key={name} onClick={() => { addExercise(name); setShowPicker(false); }}
                        style={{ background: "var(--panel2)", border: "1px solid var(--line)", borderRadius: 20, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "var(--text)", cursor: "pointer", transition: "border-color .15s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--green)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = ""}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
            <ExercisePicker compact onPick={(exercise) => { addExercise(exercise); setShowPicker(false); }} />
          </div>
        </div>
      )}

      {/* ── SWAP EXERCISE ─────────────────────────────────────────────────── */}
      {swapTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", flexDirection: "column" }}>
          <div style={{ background: "var(--bg)", borderRadius: "20px 20px 0 0", marginTop: "auto", maxHeight: "85vh", overflow: "auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: workoutTypeTheme.accent, fontWeight: 700, textTransform: "uppercase" }}>Cambiar ejercicio</p>
                <h2 style={{ margin: 0, fontSize: 16 }}>Reemplazar: <span style={{ color: "var(--green)" }}>{swapTarget}</span></h2>
              </div>
              <button className="ghost" onClick={() => setSwapTarget(null)} style={{ padding: "6px 12px" }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>Elegí el ejercicio con el que vas a reemplazarlo. Se mantienen los pesos y reps.</p>
            <ExercisePicker compact onPick={(exercise) => {
              swapExercise(swapTarget, exercise.name || exercise);
              setSwapTarget(null);
            }} />
          </div>
        </div>
      )}

      {/* ── SUPERSET PICKER ───────────────────────────────────────────────── */}
      {supersetTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", flexDirection: "column" }}>
          <div style={{ background: "var(--bg)", borderRadius: "20px 20px 0 0", marginTop: "auto", maxHeight: "80vh", overflow: "auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase" }}>⇄ Superserie</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Elegí el segundo ejercicio</p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Parear con: <b style={{ color: "var(--green)" }}>{supersetTarget}</b></p>
              </div>
              <button className="ghost" onClick={() => setSupersetTarget(null)} style={{ padding: "6px 12px" }}>✕</button>
            </div>
            <ExercisePicker compact onPick={(exercise) => { linkSuperset(supersetTarget, exercise); setSupersetTarget(null); }} />
          </div>
        </div>
      )}


      {/* ── FINISH CONFIRM ────────────────────────────────────────────────── */}
      {showFinishConfirm && (
        <div className="modal-overlay" onClick={() => setShowFinishConfirm(false)}>
          <div className="modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 8px" }}>¿Finalizar entrenamiento?</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 16px" }}>
              Tenés <b>{emptySetsCount} {emptySetsCount === 1 ? "serie" : "series"}</b> sin peso ni reps. No se van a guardar.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => setShowFinishConfirm(false)}>Seguir</button>
              <button className="primary" style={{ flex: 1 }} onClick={() => { setShowFinishConfirm(false); setShowRpe(true); }}>Finalizar igual</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RPE MODAL ─────────────────────────────────────────────────────── */}
      {showRpe && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 340, width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>💪</div>
              <h2 style={{ margin: "0 0 4px" }}>¿Cómo te sentiste?</h2>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>Esfuerzo percibido (RPE 1-10)</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => setSessionRpe(n)}
                  style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${sessionRpe === n ? "var(--green)" : "var(--line)"}`,
                    background: sessionRpe === n ? "rgba(168,85,247,.15)" : "var(--panel2)",
                    color: sessionRpe === n ? "var(--green)" : "var(--text)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  {n}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", margin: "0 0 14px" }}>
              {!sessionRpe ? "1 = muy fácil · 10 = máximo esfuerzo" :
               sessionRpe <= 3 ? "Muy fácil — podés subir el peso la próxima" :
               sessionRpe <= 6 ? "Intensidad moderada" :
               sessionRpe <= 8 ? "Esfuerzo alto — sesión productiva" :
               "Esfuerzo máximo — descansá bien"}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => { setShowRpe(false); doFinish(sessionNotes, null); }}>Saltar</button>
              <button className="primary" style={{ flex: 1 }} disabled={!sessionRpe}
                onClick={() => { setShowRpe(false); doFinish(sessionNotes, sessionRpe); }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </section>

    {/* ── POST WORKOUT SUMMARY ──────────────────────────────────────────── */}
    {postSummary && (
      <div className="modal-overlay">
        <div className="modal-card" style={{ maxWidth: 360, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>🎯</div>
            <h2 style={{ margin: "0 0 4px" }}>Resumen del coach</h2>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
              {postSummary.overallPct !== null
                ? `${postSummary.thisVol}kg (${postSummary.overallPct > 0 ? "+" : ""}${postSummary.overallPct}% vs promedio)`
                : `Volumen total: ${postSummary.thisVol}kg`}
            </p>
          </div>
          {postSummary.volumeChanges.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {postSummary.volumeChanges.map(({ group, pct }) => (
                <div key={group} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel2)", borderRadius: 10, padding: "8px 12px" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{group}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: pct > 5 ? "var(--green)" : pct < -5 ? "var(--danger)" : "var(--muted)" }}>
                    {pct !== null ? `${pct > 0 ? "+" : ""}${pct}%` : "nuevo"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", margin: "0 0 14px", lineHeight: 1.5 }}>
            {postSummary.rpe >= 9 ? "RPE muy alto — tomá un día extra de descanso." :
             postSummary.rpe <= 3 ? "Sesión liviana — la próxima subí el peso o agregá series." :
             postSummary.overallPct > 10 ? "¡Gran sesión! Superaste tu promedio." :
             postSummary.overallPct < -10 ? "Volumen debajo del promedio — si fue intencional, perfecto." :
             "Sesión dentro de tu promedio. Constancia es la clave."}
          </p>
          <button className="primary" style={{ width: "100%" }} onClick={() => { setPostSummary(null); setPage("home"); if (window.__showToast) window.__showToast("✓ Entrenamiento guardado"); }}>
            Listo
          </button>
        </div>
      </div>
    )}

    {/* ── SAVE ROUTINE PROMPT ───────────────────────────────────────────── */}
    {showSaveRoutine && (
      <div className="modal-overlay">
        <div className="modal-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💾</div>
          <h2 style={{ margin: "0 0 6px" }}>¿Guardás esta rutina?</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 18px" }}>
            Este entrenamiento no coincide con ninguna rutina guardada.
          </p>
          <div className="field-group" style={{ marginBottom: 14, textAlign: "left" }}>
            <label>Nombre de la rutina</label>
            <input type="text" value={saveRoutineName} onChange={e => setSaveRoutineName(e.target.value)}
              placeholder="ej: Push A — Pecho/Hombros" autoFocus />
          </div>
          {saveRoutineError && (
            <p style={{ color: "var(--danger)", fontSize: 12, margin: "0 0 10px", textAlign: "center" }}>{saveRoutineError}</p>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="ghost" style={{ flex: 1 }} onClick={() => { setShowSaveRoutine(false); const { notes, rpe, summary } = pendingFinishRef.current || {}; _commitFinish(notes, rpe, summary); }}>
              No guardar
            </button>
            <button className="primary" style={{ flex: 2 }} disabled={savingRoutine || !saveRoutineName.trim()} onClick={handleSaveRoutineAndFinish}>
              {savingRoutine ? "Guardando…" : "Guardar y terminar"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── TECHNIQUE TIP MODAL ───────────────────────────────────────────── */}
    {tipExercise && (
      <div className="modal-overlay" onClick={() => setTipExercise(null)}>
        <div className="modal-card" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 style={{ fontSize: 16 }}>Técnica: {tipExercise}</h2>
            <button className="ghost icon-btn" onClick={() => setTipExercise(null)}><Icon name="X" size={18} /></button>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text)", margin: "8px 0 16px" }}>
            {getTip(tipExercise)}
          </p>
          <button className="primary" style={{ width: "100%" }} onClick={() => setTipExercise(null)}>Entendido</button>
        </div>
      </div>
    )}

    {/* ── PR TOAST + CONFETTI ───────────────────────────────────────────── */}
    {prToast && (
      <>
        <style>{`
          @keyframes pr-pop { 0%{transform:translateX(-50%) scale(.7);opacity:0} 60%{transform:translateX(-50%) scale(1.08)} 100%{transform:translateX(-50%) scale(1);opacity:1} }
          @keyframes confetti-fall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(90vh) rotate(720deg);opacity:0} }
          .pr-confetti-piece { position:fixed; top:60px; width:8px; height:8px; border-radius:2px; z-index:9998; pointer-events:none; animation:confetti-fall 1.8s ease-in forwards; }
        `}</style>
        {/* 32 confetti particles */}
        {Array.from({length:32}).map((_,i) => (
          <div key={i} className="pr-confetti-piece" style={{
            left: `${5 + (i * 2.9) % 90}%`,
            background: ["#a855f7","#c084fc","#f0abfc","#fff","#e879f9","#f59e0b","#34d399","#60a5fa"][i%8],
            animationDelay: `${i * 0.04}s`,
            animationDuration: `${1.2 + (i % 5) * 0.2}s`,
            width: i%4===0 ? 12 : i%3===0 ? 8 : 6,
            height: i%4===0 ? 7 : i%3===0 ? 5 : 9,
            borderRadius: i%5===0 ? "50%" : 2,
          }} />
        ))}
        <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:"linear-gradient(135deg,#a855f7,#c084fc)", color:"#fff", borderRadius:16, padding:"12px 22px", fontSize:15, fontWeight:900, boxShadow:"0 4px 24px rgba(168,85,247,.5)", whiteSpace:"nowrap", animation:"pr-pop .4s cubic-bezier(.34,1.56,.64,1) both"}}>
          🏆 ¡Nuevo PR en {prToast}!
        </div>
      </>
    )}

    {/* ── REST TIMER OVERLAY ────────────────────────────────────────────── */}
    {restExercise && (
      <div className="rest-overlay">
        <div className="rest-overlay-label">
          <small>Descansando — {restExercise}</small>
        </div>
        <RestTimer
          key={restKey}
          active
          duration={exerciseRestTimes[restExercise] || 90}
          soundEnabled={soundEnabled}
          onSkip={handleSkipRest}
          onComplete={handleRestComplete}
          onChangeDuration={(secs) => { if (restExercise) setExerciseRestTime(restExercise, secs); }}
          nextLabel={nextExercise}
        />
      </div>
    )}

    {/* ── REST DONE TOAST ───────────────────────────────────────────────── */}
    {restDone && (
      <div style={{
        position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
        background: "var(--green)", color: "#fff",
        borderRadius: 50, padding: "12px 24px",
        display: "flex", alignItems: "center", gap: 10,
        zIndex: 1100, boxShadow: "0 4px 24px rgba(168,85,247,.4)",
        fontSize: 14, fontWeight: 800, whiteSpace: "nowrap",
      }}>
        <span style={{ fontSize: 20 }}>✅</span>
        ¡Descanso terminado! Continuá
        <button onClick={handleSkipRest}
          style={{ background: "rgba(0,0,0,.2)", border: "none", borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}>
          OK
        </button>
      </div>
    )}

    {/* ── UNDO DELETE TOAST ─────────────────────────────────────────────── */}
    {deletedSet && (
      <div style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: "10px 16px", display: "flex", gap: 12, alignItems: "center", zIndex: 1000, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.4)" }}>
        <span style={{ fontSize: 13 }}>Serie eliminada</span>
        <button style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          onClick={() => {
            if (deletedSet) {
              useStore.setState((state) => {
                if (!state.activeWorkout) return state;
                const sets = [...state.activeWorkout.sets];
                const exerciseSets = sets.map((s, i) => ({ s, i })).filter(({ s }) => s.exercise === deletedSet.set.exercise);
                const insertAt = exerciseSets.length > 0
                  ? (exerciseSets[Math.min(deletedSet.index, exerciseSets.length - 1)]?.i ?? sets.length)
                  : sets.length;
                sets.splice(insertAt, 0, deletedSet.set);
                return { activeWorkout: { ...state.activeWorkout, sets } };
              });
            }
            setDeletedSet(null);
            clearTimeout(undoTimerRef.current);
          }}>
          Deshacer
        </button>
      </div>
    )}

    {/* ── FIXED BOTTOM ACTION BAR ─────────────────────────────────────────── */}
    <div style={{
      position: "fixed", bottom: "calc(60px + env(safe-area-inset-bottom, 0px))", left: 0, right: 0, zIndex: 150,
      padding: "10px 16px", background: "var(--bg)",
      borderTop: "1px solid rgba(255,255,255,.1)",
      display: "flex", gap: 8,
      boxShadow: "0 -4px 16px rgba(0,0,0,.4)",
    }}>
      <button className="ghost" style={{ flex: 1, color: "var(--danger)", border: "1px solid rgba(248,113,113,.3)", fontSize: 13 }}
        onClick={() => setShowCancelConfirm(true)}>
        Cancelar
      </button>
      <button className="primary" style={{ flex: 2, fontSize: 13 }} onClick={handleFinishClick}>
        {emptySetsCount > 0 ? `Guardar (${emptySetsCount} vacías)` : "Guardar entrenamiento"}
      </button>
    </div>

    {/* Cancel confirmation modal */}
    {showCancelConfirm && (
      <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
        <div className="modal-card confirm-modal" onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
            <h2 style={{ margin: "0 0 8px" }}>¿Cancelar entrenamiento?</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
              Perdés todo el progreso de esta sesión.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="ghost" style={{ flex: 1 }} onClick={() => setShowCancelConfirm(false)}>
              Seguir
            </button>
            <button className="primary" style={{ flex: 1, background: "var(--danger)", color: "#fff" }}
              onClick={() => { setShowCancelConfirm(false); cancel(); }}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── WORKOUT SUMMARY MODAL ─────────────────────────────────────────── */}
    {showSummary && summaryData && (
      <div className="modal-overlay" onClick={() => setShowSummary(false)}>
        <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 340 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>{summaryData.newPRs > 0 ? "🏆" : "💪"}</div>
            <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>
              {summaryData.newPRs > 0 ? `¡${summaryData.newPRs} récord${summaryData.newPRs > 1 ? "s" : ""}!` : "¡Entreno completado!"}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
              {String(Math.floor(elapsed/60)).padStart(2,"0")}:{String(elapsed%60).padStart(2,"0")} · {summaryData.exercises} ejercicio{summaryData.exercises !== 1 ? "s" : ""}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Series",     value: summaryData.totalSets,   color: "var(--green)" },
              { label: "Volumen",    value: `${summaryData.totalVolume}kg`, color: "var(--green)" },
              { label: "Ejercicios", value: summaryData.exercises,   color: "var(--green)" },
              { label: "PRs",        value: summaryData.newPRs,      color: summaryData.newPRs > 0 ? "#f59e0b" : "var(--muted)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--panel2)", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              </div>
            ))}
          </div>
          <button className="ghost" style={{ width: "100%", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onClick={() => {
              const mins = String(Math.floor(elapsed/60)).padStart(2,"0");
              const secs = String(elapsed%60).padStart(2,"0");
              const vol  = summaryData.totalVolume;
              const text = `💪 Entreno completado en Loop\n⏱ ${mins}:${secs} · 📦 ${vol}kg · 🔁 ${summaryData.totalSets} series${summaryData.newPRs > 0 ? ` · 🏆 ${summaryData.newPRs} PRs!` : ""}\n\nhttps://loop-gym.vercel.app`;
              if (navigator.share) navigator.share({ title: "Mi entrenamiento", text });
              else { navigator.clipboard?.writeText(text); setShareMsg("¡Copiado!"); setTimeout(() => setShareMsg(""), 2000); }
            }}>
            📤 Compartir resumen
          </button>
          {shareMsg && <div style={{ textAlign: "center", fontSize: 12, color: "var(--green)", marginBottom: 6, fontWeight: 700 }}>{shareMsg}</div>}
          <button className="primary" style={{ width: "100%" }} onClick={() => {
            setShowSummary(false);
            if (emptySetsCount > 0) setShowFinishConfirm(true);
            else doFinish(sessionNotes, workoutRPE);
          }}>
            Guardar y terminar
          </button>
        </div>
      </div>
    )}
    </>
  );
}

