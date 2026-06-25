import { useMemo, useState, useEffect } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import Icon from "../components/Icon.jsx";
import { shareWorkout } from "../lib/shareWorkout.js";
import { buildCoachReport, formatDate, getPeriodizationPhase, getWeeklyFatigueScore, getWeightPrescriptions, getSkippedGroups, getOneRMHistory, getCycleComparison, getMuscleBalance, getWeekComparison, getWorkoutVolume, VOLUME_LANDMARKS } from "../lib/analytics.js";
function MuscleRadarChart({ data }) {
  const cx = 95, cy = 95, r = 62;
  const n = data.length;
  const max = Math.max(...data.map(d => d.value), 1);
  const angle = (i) => (Math.PI * 2 * i / n) - Math.PI / 2;
  const point = (i, ratio) => {
    const a = angle(i);
    return [cx + r * ratio * Math.cos(a), cy + r * ratio * Math.sin(a)];
  };
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const COLORS = ["#a855f7","#38bdf8","#a78bfa","#fb923c","#f472b6","#facc15"];
  const dataPoints = data.map((d,i) => point(i, d.value / max));
  const polyline = [...dataPoints, dataPoints[0]].map(p => p.join(",")).join(" ");

  return (
    <svg width={190} height={190} viewBox="0 0 190 190" style={{ display:"block", overflow:"hidden" }}>
      {gridLevels.map(l => {
        const pts = data.map((_,i) => point(i, l).join(",")).join(" ");
        return <polygon key={l} points={pts} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={1} />;
      })}
      {data.map((_,i) => {
        const [x,y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,.1)" strokeWidth={1} />;
      })}
      <polygon points={polyline} fill="rgba(168,85,247,.18)" stroke="#a855f7" strokeWidth={2} />
      {data.map((d,i) => {
        const [px,py] = point(i, 1.22);
        const [dx,dy] = dataPoints[i];
        return (
          <g key={i}>
            <circle cx={dx} cy={dy} r={3.5} fill={COLORS[i % COLORS.length]} />
            <text x={px} y={py} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,.7)" fontSize={9} fontWeight={600}>{d.name}</text>
            {d.value > 0 && (
              <text x={dx} y={dy - 8} textAnchor="middle" fill={COLORS[i % COLORS.length]}
                fontSize={8} fontWeight={700}>{d.pct}%</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function CoachPage() {
  const reports = useStore((state) => state.coachReports) ?? [];
  const workouts = useStore((state) => state.workouts) ?? [];
  const prs = useStore((state) => state.prs) ?? [];
  const setPage = useStore((state) => state.setPage);
  const weeklyChallenge = useStore(s => s.weeklyChallenge);
  const generateWeeklyChallenge = useStore(s => s.generateWeeklyChallenge);
  const activePlanAdjustment = useStore(s => s.activePlanAdjustment);
  const acceptPlanRecommendation = useStore(s => s.acceptPlanRecommendation);
  const clearPlanAdjustment = useStore(s => s.clearPlanAdjustment);
  const [declinedAlert, setDeclinedAlert] = useState(null); // track declined types this session
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const userAge = profile?.age ? Number(profile.age) : null;
  const weightLog = useStore((state) => state.weightLog) || [];
  const userGoal = useStore((state) => state.userGoal) || "mantenimiento";
  const sortedWeightLog = [...weightLog].sort((a,b) => String(b.date||'').localeCompare(String(a.date||'')));
  const bodyWeight = Number(sortedWeightLog[0]?.kg) || null;

  // Body fat estimation from skinfolds (Durnin-Womersley)
  const hasSkinfolds = profile?.triceps_mm && profile?.subscapular_mm && profile?.biceps_mm && profile?.iliac_crest_mm;
  const bodyFatPct = hasSkinfolds ? (() => {
    const sum4 = Number(profile.triceps_mm) + Number(profile.subscapular_mm) + Number(profile.biceps_mm) + Number(profile.iliac_crest_mm);
    if (sum4 <= 0) return null;
    const logSum = Math.log10(sum4);
    const age = userAge || 28;
    const density = age >= 30 ? 1.1581 - 0.0720 * logSum : 1.1620 - 0.0630 * logSum;
    return Math.max(3, Math.min(50, ((4.95 / density) - 4.5) * 100));
  })() : null;
  const lbm = bodyFatPct !== null && bodyWeight ? bodyWeight * (1 - bodyFatPct / 100) : null;

  const sleepLog   = useStore(s => s.sleepLog)   || [];
  const waterLog   = useStore(s => s.waterLog)   || [];
  const waterGoal  = useStore(s => s.waterGoal)  || 8;

  const [tab, setTab] = useState("resumen");
  const [planSubTab, setPlanSubTab] = useState("rendimiento"); // "rendimiento" | "nutricion"
  const [muscleRange, setMuscleRange] = useState("1m"); // "1w","1m","3m","6m","1y","all"
  const [sharing, setSharing] = useState(false);
  const [showProgresoAdvanced, setShowProgresoAdvanced] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [macroDay, setMacroDay] = useState("entreno"); // "entreno" | "descanso"

  useEffect(() => {
    // Always call — it auto-rotates weekly and refreshes doneCount
    generateWeeklyChallenge();
  }, [workouts.length]);

  const computed = reports.length ? reports : workouts.slice(0, 12).flatMap((workout) => {
    try { return [buildCoachReport(workout, workouts)]; } catch { return []; }
  });
  const latest = computed[0];
  const latestPrs = latest ? prs.filter((p) => p.date === latest.date) : [];

  // Trend-based smart alerts
  const smartAlerts = useMemo(() => {
    const alerts = [];
    if (!workouts || workouts.length < 2) return alerts;

    // 1. Stagnation: per exercise, track MAX weight per session over last 6 sessions
    // Stall = max weight hasn't increased in last 4+ sessions
    const exerciseSessions = {};
    const sortedW = [...workouts].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    sortedW.slice(0, 20).forEach((w) => {
      const sessionMaxes = {};
      (w.sets || []).forEach((s) => {
        if (!s.exercise || !Number(s.weight)) return;
        const cur = sessionMaxes[s.exercise] || 0;
        if (Number(s.weight) > cur) sessionMaxes[s.exercise] = Number(s.weight);
      });
      Object.entries(sessionMaxes).forEach(([ex, maxW]) => {
        if (!exerciseSessions[ex]) exerciseSessions[ex] = [];
        exerciseSessions[ex].push({ weight: maxW, date: w.date });
      });
    });
    Object.entries(exerciseSessions).forEach(([exName, sessions]) => {
      if (sessions.length < 3) return;
      const recent = sessions.slice(0, 8);
      const maxW = Math.max(...recent.map(s => s.weight));
      const minW = Math.min(...recent.map(s => s.weight));
      // Check if date range spans >= 21 days (3 weeks)
      const oldestDate = recent[recent.length - 1]?.date;
      const newestDate = recent[0]?.date;
      const daySpan = oldestDate && newestDate
        ? Math.floor((new Date(newestDate + "T12:00:00") - new Date(oldestDate + "T12:00:00")) / 86400000)
        : 0;
      const noProgress = maxW === minW && recent.length >= 3 && daySpan >= 21;
      if (noProgress) {
        const weeks = Math.round(daySpan / 7);
        alerts.push({ type: "stall", msg: `Sin progresión en ${exName} hace ${weeks} semanas (${maxW}kg). Probá aumentar 2.5kg la próxima sesión o cambiar el rango de repeticiones.` });
      }
    });

    // 2. Volume drop: last 2 weeks vs previous 2 weeks
    const now = new Date();
    const msPerDay = 86400000;
    const twoWeeksAgo = new Date(now - 14 * msPerDay);
    const fourWeeksAgo = new Date(now - 28 * msPerDay);
    const getVol = (w) => (w.sets || []).reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
    const recent2w = workouts.filter((w) => w.date && new Date(w.date) >= twoWeeksAgo);
    const prev2w = workouts.filter((w) => w.date && new Date(w.date) >= fourWeeksAgo && new Date(w.date) < twoWeeksAgo);
    if (recent2w.length >= 2 && prev2w.length >= 2) {
      const recentVol = recent2w.reduce((s, w) => s + getVol(w), 0);
      const prevVol = prev2w.reduce((s, w) => s + getVol(w), 0);
      if (prevVol > 0 && recentVol < prevVol * 0.8) {
        alerts.push({ type: "volume", msg: "Tu volumen bajó esta semana — ¿estás descansando bien? Revisá sueño y nutrición." });
      }
    }

    // 3. Push/Pull imbalance: count sets per group in last 4 weeks
    const fourWeeksAgoDate = new Date(now - 28 * msPerDay);
    const recentWorkouts = workouts.filter((w) => w.date && new Date(w.date) >= fourWeeksAgoDate);
    let pushSets = 0, pullSets = 0;
    recentWorkouts.forEach((w) => {
      (w.sets || []).forEach((s) => {
        const g = (s.group || "").toLowerCase();
        const ex = (s.exercise || "").toLowerCase();
        const isPush = g === "pecho" || g === "hombros" || ex.includes("press") || ex.includes("pecho") || ex.includes("fondos") || ex.includes("aperturas");
        const isPull = g === "espalda" || ex.includes("espalda") || ex.includes("dominadas") || ex.includes("remo") || ex.includes("jalón") || ex.includes("pull");
        if (isPush) pushSets++;
        if (isPull) pullSets++;
      });
    });
    if (pushSets >= 10 && pullSets > 0 && pushSets >= pullSets * 1.6) {
      const ratio = (pushSets / pullSets).toFixed(1);
      alerts.push({ type: "imbalance", msg: `Relación empuje/tirón desequilibrada (${ratio}:1) en las últimas 4 semanas: ${pushSets} series de empuje vs ${pullSets} de tirón. Lo ideal es 1:1. Agregá más espalda/remo/dominadas.` });
    } else if (pullSets >= 10 && pushSets > 0 && pullSets >= pushSets * 1.6) {
      const ratio = (pullSets / pushSets).toFixed(1);
      alerts.push({ type: "imbalance", msg: `Más tirón que empuje (${ratio}:1): ${pullSets} series de espalda vs ${pushSets} de pecho/hombros. Revisá si es intencional.` });
    }

    return alerts;
  }, [workouts]);

  const periodization = useMemo(() => getPeriodizationPhase(workouts), [workouts]);
  const fatigueScore  = useMemo(() => getWeeklyFatigueScore(workouts), [workouts]);
  const prescriptions = useMemo(() => getWeightPrescriptions(workouts), [workouts]);
  const skippedGroups = useMemo(() => getSkippedGroups(workouts), [workouts]);
  const cycleComparison = useMemo(() => getCycleComparison(workouts), [workouts]);
  const muscleBalance = useMemo(() => getMuscleBalance(workouts, 7), [workouts]);
  const weekComparison = useMemo(() => getWeekComparison(workouts), [workouts]);

  const topExercises = useMemo(() => {
    const seen = new Set();
    const result = [];
    (workouts || []).slice(0, 5).forEach(w => {
      (w.sets || []).forEach(s => {
        if (!s.exercise || seen.has(s.exercise)) return;
        seen.add(s.exercise);
        result.push(s.exercise);
      });
    });
    return result.slice(0, 4);
  }, [workouts]);

  const progression = useMemo(() => {
    const types = {};
    (workouts || []).forEach((w) => {
      if (!types[w.type]) types[w.type] = [];
      types[w.type].push(w);
    });
    return Object.entries(types).map(([type, ws]) => {
      const sorted = ws.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const last = sorted[0];
      if (!last) return null;
      const lastWithData = (last.sets || []).filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
      if (!lastWithData.length) return null;
      const exercises = {};
      lastWithData.forEach((set) => {
        if (exercises[set.exercise]) return;
        const prev = sorted.slice(1).find((w) => (w.sets || []).some((s) => s.exercise === set.exercise && Number(s.weight) > 0 && Number(s.reps) > 0));
        const prevSets = prev ? prev.sets.filter((s) => s.exercise === set.exercise && Number(s.weight) > 0 && Number(s.reps) > 0) : [];
        const prevBest = prevSets.length
          ? prevSets.reduce((max, s) => (Number(s.weight) * Number(s.reps) > Number(max.weight) * Number(max.reps) ? s : max))
          : null;
        exercises[set.exercise] = {
          current: { weight: Number(set.weight), reps: Number(set.reps) },
          prev: prevBest ? { weight: Number(prevBest.weight), reps: Number(prevBest.reps) } : null,
        };
      });
      const entries = Object.entries(exercises);
      if (!entries.length) return null;
      return { type, date: formatDate(last.date), exercises: entries.slice(0, 6) };
    }).filter(Boolean);
  }, [workouts]);

  const TABS = [
    { id: "resumen",  label: "Resumen"    },
    { id: "plan",     label: "Plan"       },
    { id: "progreso", label: "Progresión" },
    { id: "alertas",  label: "Alertas"    },
  ];

  const PLAN_SUB_TABS = [
    { id: "rendimiento", label: "Rendimiento" },
    { id: "nutricion",   label: "Nutrición"   },
  ];

  const MUSCLE_RANGE_LABELS = [
    { key:"1w", label:"1 sem" },
    { key:"1m", label:"1 mes" },
    { key:"3m", label:"3 meses" },
    { key:"6m", label:"6 meses" },
    { key:"1y", label:"1 año" },
    { key:"all", label:"Inicio" },
  ];

  const mealLog = useStore((s) => s.mealLog) || [];

  // ── Muscle freshness / recovery tracker ─────────────────────────────────────
  const muscleRecovery = useMemo(() => {
    const GROUPS = [
      { name: "Piernas",  recDays: 3 },
      { name: "Espalda",  recDays: 2 },
      { name: "Pecho",    recDays: 2 },
      { name: "Hombros",  recDays: 2 },
      { name: "Brazos",   recDays: 1 },
      { name: "Core",     recDays: 1 },
    ];
    const now = new Date();
    return GROUPS.map(({ name, recDays }) => {
      const lastW = [...(workouts || [])].find((w) => (w.sets || []).some((s) => s.group === name));
      if (!lastW) return { name, recDays, daysSince: null, status: "sin datos" };
      const daysSince = Math.floor((now - new Date(lastW.date + "T12:00:00")) / 86400000);
      const vol = (lastW.sets || []).filter((s) => s.group === name).length;
      const effRec = vol >= 6 ? recDays + 1 : vol >= 3 ? recDays : recDays - 1;
      const status = daysSince >= effRec ? "listo" : daysSince >= Math.ceil(effRec * 0.6) ? "recuperando" : "pronto";
      return { name, recDays: effRec, daysSince, status };
    });
  }, [workouts]);

  // ── Today's macro totals from food log ──────────────────────────────────────
  const todayMacros = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayMeals = mealLog.filter((m) => m.date === todayStr);
    return {
      kcal:    todayMeals.reduce((s, m) => s + (Number(m.kcal)    || 0), 0),
      protein: todayMeals.reduce((s, m) => s + (Number(m.protein) || 0), 0),
      carbs:   todayMeals.reduce((s, m) => s + (Number(m.carbs)   || 0), 0),
      fat:     todayMeals.reduce((s, m) => s + (Number(m.fat)     || 0), 0),
    };
  }, [mealLog]);

  // ── Adaptive TDEE — EMA weight trend vs goal ────────────────────────────────
  const adaptiveTDEE = useMemo(() => {
    const sorted = [...weightLog]
      .filter(e => e.date && Number(e.kg) > 0)
      .sort((a, b) => String(a.date).localeCompare(String(b.date))); // oldest first for EMA
    if (sorted.length < 3) return null;
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    const spanDays = Math.max(1, Math.floor((new Date(newest.date) - new Date(oldest.date)) / 86400000));
    if (spanDays < 7) return null; // need at least 1 week of data

    // EMA with α=0.3 over all entries — smooths out daily fluctuation noise
    const α = 0.3;
    let ema = sorted[0].kg;
    for (let i = 1; i < sorted.length; i++) {
      ema = α * sorted[i].kg + (1 - α) * ema;
    }
    // Weekly trend: (EMA_last - first) / span_weeks
    const weeklyChange = ((ema - sorted[0].kg) / spanDays) * 7;
    const targetWeekly = userGoal === "volumen" ? 0.25 : userGoal === "definicion" ? -0.5 : 0;
    const diff = weeklyChange - targetWeekly;
    if (Math.abs(diff) < 0.08) return null; // within ±80g/wk is on track
    const calAdj = Math.round(-diff * 7700 / 7);
    const clamped = Math.max(-400, Math.min(400, calAdj));
    // Adjust targets based on body fat: higher BF → more conservative surplus, more aggressive deficit
    const bfAdjustment = bodyFatPct !== null ? (bodyFatPct > 25 ? 1.2 : bodyFatPct > 18 ? 1.0 : 0.85) : 1.0;
    const adjusted = Math.round(clamped * bfAdjustment);
    return { weeklyChange: weeklyChange.toFixed(2), targetWeekly, suggestion: adjusted, entries: sorted.length, bodyFat: bodyFatPct, lbm };
  }, [weightLog, userGoal, bodyFatPct, lbm]);

  // ── Weekly caloric balance ────────────────────────────────────────────────────
  const weeklyBalance = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const weekMeals = mealLog.filter((m) => m.date && new Date(m.date + "T12:00:00") >= monday);
    return weekMeals.reduce((s, m) => s + (Number(m.kcal) || 0), 0);
  }, [mealLog]);

  // ── RPE fatigue detection ────────────────────────────────────────────────────
  const rpeFatigueAlerts = useMemo(() => {
    const alerts = [];
    const exMap = {};
    const sorted = [...(workouts || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    sorted.slice(0, 10).forEach((w) => {
      (w.sets || []).forEach((s) => {
        if (!s.exercise || !s.rpe) return;
        if (!exMap[s.exercise]) exMap[s.exercise] = [];
        exMap[s.exercise].push({ rpe: Number(s.rpe), weight: Number(s.weight) || 0, date: w.date });
      });
    });
    Object.entries(exMap).forEach(([ex, entries]) => {
      if (entries.length < 3) return;
      const recent = entries.slice(0, 6);
      const highRPE = recent.filter((e) => e.rpe >= 9).length;
      const weights = recent.map((e) => e.weight);
      const maxW = Math.max(...weights);
      const minW = Math.min(...weights);
      // Signal 1: consistently high RPE with no weight gain = stuck at ceiling
      if (highRPE >= 3 && maxW === minW) {
        alerts.push({ exercise: ex, rpe: recent[0].rpe, msg: `⚡ ${ex}: RPE 9+ en ${highRPE} sesiones sin subir peso (${maxW}kg). Considerá una semana de menor intensidad antes de progresar.` });
      }
      // Signal 2: RPE trending up while weight constant or only slightly up — efficiency declining
      if (recent.length >= 4) {
        const earlyRPE = recent.slice(Math.floor(recent.length / 2)).reduce((s, e) => s + e.rpe, 0) / Math.floor(recent.length / 2);
        const lateRPE  = recent.slice(0, Math.floor(recent.length / 2)).reduce((s, e) => s + e.rpe, 0) / Math.floor(recent.length / 2);
        const earlyW   = recent.slice(Math.floor(recent.length / 2)).reduce((s, e) => s + e.weight, 0) / Math.floor(recent.length / 2);
        const lateW    = recent.slice(0, Math.floor(recent.length / 2)).reduce((s, e) => s + e.weight, 0) / Math.floor(recent.length / 2);
        const rpeRise  = lateRPE - earlyRPE;
        const weightRise = lateW - earlyW;
        // RPE went up >=1.5 points but weight barely moved (<5% increase)
        if (rpeRise >= 1.5 && weightRise < earlyW * 0.05 && lateRPE >= 8) {
          alerts.push({ exercise: ex, rpe: Math.round(lateRPE * 10) / 10, msg: `📈 ${ex}: RPE subió ${rpeRise.toFixed(1)} puntos sin ganancia de carga (${earlyW.toFixed(1)}→${lateW.toFixed(1)}kg). Tu eficiencia bajó — es señal de fatiga acumulada.` });
        }
      }
    });
    return alerts;
  }, [workouts]);

  // ── Readiness score ──────────────────────────────────────────────────────────
  const readiness = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySleep = sleepLog.find(s => s.date === todayStr) || sleepLog[0];
    const todayWater = waterLog.find(w => w.date === todayStr);

    let score = 50; // base
    // Sleep factor (0-35)
    if (todaySleep?.hours) {
      const h = todaySleep.hours;
      score += h >= 7 && h <= 9 ? 35 : h >= 6 ? 20 : h >= 5 ? 5 : -5;
    }
    // Hydration factor (0-25)
    if (todayWater?.glasses && waterGoal > 0) {
      const pct = Math.min(1, todayWater.glasses / waterGoal);
      score += Math.round(pct * 25);
    }
    // Rest since last workout (0-20)
    const lastWDate = workouts[0]?.date;
    if (lastWDate) {
      const daysSince = Math.floor((Date.now() - new Date(lastWDate + "T12:00:00")) / 86400000);
      score += daysSince === 1 ? 20 : daysSince === 2 ? 15 : daysSince >= 3 ? 8 : 12;
    } else {
      score += 20; // no workouts yet → fresh
    }
    score = Math.max(10, Math.min(100, score));
    const label = score >= 80 ? "Óptimo" : score >= 60 ? "Bueno" : score >= 40 ? "Moderado" : "Recuperate";
    const color = score >= 80 ? "#22c55e" : score >= 60 ? "#a855f7" : score >= 40 ? "#f59e0b" : "#ef4444";
    const tip   = score >= 80 ? "Ideal para entrenar fuerte hoy." : score >= 60 ? "Buen estado — entrenamiento normal." : score >= 40 ? "Reducí el volumen un 15-20% hoy." : "Priorizá recuperación — descanso activo o día libre.";
    return { score, label, color, tip };
  }, [sleepLog, waterLog, waterGoal, workouts]);

  const muscleData = useMemo(() => {
    const cutoff = muscleRange === "all" ? null : (() => {
      const d = new Date();
      if (muscleRange === "1w") d.setDate(d.getDate() - 7);
      else if (muscleRange === "1m") d.setMonth(d.getMonth() - 1);
      else if (muscleRange === "3m") d.setMonth(d.getMonth() - 3);
      else if (muscleRange === "6m") d.setMonth(d.getMonth() - 6);
      else if (muscleRange === "1y") d.setFullYear(d.getFullYear() - 1);
      return d.toISOString().slice(0,10);
    })();
    const filtered = cutoff ? workouts.filter(w => w.date >= cutoff) : workouts;
    const groups = { Pecho:0, Espalda:0, Hombros:0, Brazos:0, Piernas:0, Core:0 };
    filtered.forEach(w => {
      (w.sets||[]).forEach(s => {
        const g = s.group;
        if (g && groups.hasOwnProperty(g)) groups[g]++;
      });
    });
    const total = Object.values(groups).reduce((a,b) => a+b, 0) || 1;
    return Object.entries(groups).map(([name, count]) => ({ name, value: count, pct: Math.round(count/total*100) }));
  }, [workouts, muscleRange]);

  return (
    <section className="page coach-page">
      <div className="top-row">
        <div>
          <p className="eyebrow">Análisis post-entreno</p>
          <h1>Coach</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {workouts.length > 0 && (
            <button
              onClick={async () => { setSharing(true); try { await shareWorkout(workouts[0]); } finally { setSharing(false); } }}
              disabled={sharing}
              style={{ background: "rgba(168,85,247,.15)", border: "1px solid rgba(168,85,247,.4)", borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: "var(--green)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}
            >
              <Icon name="Share2" size={15} /> {sharing ? "…" : "Compartir"}
            </button>
          )}
          <button className="back-btn" onClick={() => setPage("home")} aria-label="Back">
            <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:4, background:"var(--panel)", borderRadius:14, padding:4, marginBottom:16 }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, padding:"8px 4px", fontSize:12, fontWeight:600, borderRadius:10,
            border:"none", cursor:"pointer", transition:"all .15s",
            background: tab === id ? "var(--green)" : "transparent",
            color: tab === id ? "#fff" : "var(--muted)",
          }}>{label}</button>
        ))}
      </div>

      {/* ── TAB: RESUMEN ────────────────────────────────────── */}
      {tab === "resumen" && (
        <div>
          {/* ── Medidas ── */}
          <div style={{ background:"var(--panel)", borderRadius:16, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:"var(--text)" }}>📏 Medidas</p>
              <button className="ghost" style={{ fontSize:11, color:"var(--green)", fontWeight:600, padding:"2px 8px" }} onClick={() => setPage("measurements")}>
                Ver todo →
              </button>
            </div>
            <div style={{ display:"flex", gap:8, overflow:"auto", flexWrap:"nowrap" }}>
              {bodyWeight && (
                <div style={{ flex:"0 0 auto", minWidth:80, background:"rgba(34,197,94,.07)", border:"1px solid rgba(34,197,94,.2)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                  <p style={{ margin:"0 0 1px", fontSize:10, color:"var(--green)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>Peso</p>
                  <p style={{ margin:0, fontSize:16, fontWeight:900, color:"var(--text)" }}>{bodyWeight}<span style={{ fontSize:10, fontWeight:400, color:"var(--muted)" }}>kg</span></p>
                </div>
              )}
              {bodyFatPct !== null && (
                <div style={{ flex:"0 0 auto", minWidth:80, background:"rgba(168,85,247,.07)", border:"1px solid rgba(168,85,247,.2)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                  <p style={{ margin:"0 0 1px", fontSize:10, color:"var(--green)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>Grasa</p>
                  <p style={{ margin:0, fontSize:16, fontWeight:900, color:"var(--text)" }}>{bodyFatPct.toFixed(1)}<span style={{ fontSize:10, fontWeight:400, color:"var(--muted)" }}>%</span></p>
                </div>
              )}
              {lbm !== null && (
                <div style={{ flex:"0 0 auto", minWidth:80, background:"rgba(96,165,250,.07)", border:"1px solid rgba(96,165,250,.2)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                  <p style={{ margin:"0 0 1px", fontSize:10, color:"var(--green)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>Masa magra</p>
                  <p style={{ margin:0, fontSize:16, fontWeight:900, color:"var(--text)" }}>{lbm.toFixed(1)}<span style={{ fontSize:10, fontWeight:400, color:"var(--muted)" }}>kg</span></p>
                </div>
              )}
              {!bodyWeight && (
                <p style={{ margin:0, fontSize:12, color:"var(--muted)" }}>Sin datos. <button className="ghost" style={{ fontSize:12, color:"var(--green)", padding:0 }} onClick={() => setPage("measurements")}>Agregar</button></p>
              )}
            </div>
          </div>

          {/* Readiness score */}
          <div style={{ background: "var(--panel)", borderRadius: 16, padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
              <svg width={56} height={56} viewBox="0 0 56 56">
                <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={5} />
                <circle cx={28} cy={28} r={22} fill="none" stroke={readiness.color} strokeWidth={5}
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - readiness.score / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 28 28)" />
              </svg>
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: readiness.color }}>{readiness.score}</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>Preparación</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: readiness.color, background: `${readiness.color}22`, padding: "2px 8px", borderRadius: 6 }}>{readiness.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{readiness.tip}</p>
            </div>
          </div>

          {/* Muscle freshness tracker */}
          <div className="card" style={{ marginBottom: 14 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 14 }}>Frescura muscular</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {muscleRecovery.map(({ name, daysSince, recDays, status }) => {
                const color = status === "listo" ? "#22c55e" : status === "recuperando" ? "#f59e0b" : status === "pronto" ? "#ef4444" : "rgba(255,255,255,.25)";
                const icon  = status === "listo" ? "✓" : status === "recuperando" ? "↻" : status === "pronto" ? "✕" : "—";
                return (
                  <div key={name} style={{ background: "var(--panel2)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${color}22`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 13, color }}>{icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{name}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>
                      {daysSince === null ? "Sin datos" : daysSince === 0 ? "Hoy" : `Hace ${daysSince}d`}
                    </div>
                    <div style={{ fontSize: 9, color, fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>{status}</div>
                  </div>
                );
              })}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 10, color: "var(--muted)" }}>
              Basado en volumen de última sesión y tiempo de recuperación recomendado por grupo.
            </p>
          </div>

          {workouts.length === 0 ? (
            <div className="notice"><b>Sin entrenamientos</b><p>Completá tu primer entrenamiento para activar el Coach.</p></div>
          ) : (
            <HolisticSummary workouts={workouts} prs={prs} userAge={userAge} bodyWeight={bodyWeight} bodyFatPct={bodyFatPct} lbm={lbm} userGoal={userGoal} />
          )}

          {weeklyChallenge && (
            <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"14px", marginBottom:14, marginTop:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:700 }}>Desafío de la semana</p>
                <button onClick={generateWeeklyChallenge} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--muted)" }}>↻ nuevo</button>
              </div>
              <p style={{ margin:"0 0 8px", fontSize:13, color:"var(--text)", lineHeight:1.4 }}>{weeklyChallenge.text}</p>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:11, color:"var(--muted)" }}>{weeklyChallenge.doneCount}/{weeklyChallenge.targetCount}</span>
                <span style={{ fontSize:11, color: weeklyChallenge.doneCount >= weeklyChallenge.targetCount ? "var(--green)" : "var(--muted)" }}>
                  {weeklyChallenge.doneCount >= weeklyChallenge.targetCount ? "✓ Completado" : "En progreso"}
                </span>
              </div>
              <div style={{ background:"var(--panel2)", borderRadius:6, height:8, overflow:"hidden" }}>
                <div style={{ background:"var(--green)", height:"100%", borderRadius:6, width:`${Math.min(100, weeklyChallenge.targetCount > 0 ? (weeklyChallenge.doneCount/weeklyChallenge.targetCount)*100 : 0)}%`, transition:"width .3s" }} />
              </div>
            </div>
          )}

          {/* ▼ Análisis avanzado (colapsable) */}
          <button onClick={() => setShowAdvanced(s => !s)}
            style={{ width:"100%", padding:"8px", borderRadius:10, border:"1px solid var(--line)", background:"var(--panel)", cursor:"pointer", fontSize:12, fontWeight:600, color:"var(--muted)", marginBottom:12 }}>
            {showAdvanced ? "▲ Ocultar análisis avanzado" : "▼ Ver análisis avanzado"}
          </button>

          {showAdvanced && (<>
          {/* Distribución muscular */}
          <div className="card" style={{ marginTop:0 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <h2 style={{ margin:0, fontSize:16 }}>Distribución muscular</h2>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
              {MUSCLE_RANGE_LABELS.map(({key, label}) => (
                <button key={key} onClick={() => setMuscleRange(key)} style={{
                  padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                  border: muscleRange===key ? "2px solid var(--green)" : "2px solid var(--line)",
                  background: muscleRange===key ? "rgba(168,85,247,.15)" : "var(--panel2)",
                  color: muscleRange===key ? "var(--green)" : "var(--muted)",
                  cursor:"pointer",
                }}>{label}</button>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <MuscleRadarChart data={muscleData} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:8 }}>
              {muscleData.filter(d => d.value > 0).map((d,i) => (
                <div key={d.name} style={{ textAlign:"center", background:"var(--panel2)", borderRadius:10, padding:"8px 4px" }}>
                  <div style={{ fontSize:14, fontWeight:800, color:"var(--green)" }}>{d.pct}%</div>
                  <div style={{ fontSize:10, color:"var(--muted)" }}>{d.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 1RM Predictor */}
          {workouts.length > 0 && (() => {
            const exMap = {};
            workouts.slice(0,20).forEach(w => (w.sets||[]).forEach(s => {
              if (!s.exercise || !Number(s.weight) || !Number(s.reps)) return;
              if (!exMap[s.exercise]) exMap[s.exercise] = [];
              exMap[s.exercise].push({ w: Number(s.weight), r: Number(s.reps) });
            }));
            const top = Object.entries(exMap).sort((a,b)=>b[1].length-a[1].length).slice(0,5);
            if (!top.length) return null;
            return (
              <div className="card" style={{ marginBottom:14 }}>
                <h2 style={{ marginBottom:12 }}>1RM estimado</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {top.map(([name, sets]) => {
                    const best = sets.reduce((b,s) => {
                      const rm = s.w * (1 + s.r/30);
                      return rm > b.rm ? { rm, w:s.w, r:s.r } : b;
                    }, { rm:0, w:0, r:0 });
                    return (
                      <div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700 }}>{name}</div>
                          <div style={{ fontSize:11, color:"var(--muted)" }}>{best.w}kg × {best.r} reps</div>
                        </div>
                        <div style={{ fontSize:18, fontWeight:900, color:"var(--green)" }}>{Math.round(best.rm)}kg</div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ margin:"8px 0 0", fontSize:10, color:"var(--muted)" }}>Fórmula Epley · Estimación, no reemplaza test real</p>
              </div>
            );
          })()}

          {/* Año en números */}
          {workouts.length >= 10 && (() => {
            const year = new Date().getFullYear();
            const yearWorkouts = workouts.filter(w => (w.date||"").startsWith(String(year)));
            const totalVol = yearWorkouts.reduce((sum,w) => sum+(w.sets||[]).reduce((s2,s)=>s2+(Number(s.weight)||0)*(Number(s.reps)||0),0),0);
            const exCount = {};
            yearWorkouts.forEach(w=>(w.sets||[]).forEach(s=>{if(s.exercise)exCount[s.exercise]=(exCount[s.exercise]||0)+1;}));
            const topEx = Object.entries(exCount).sort((a,b)=>b[1]-a[1])[0];
            return (
              <div className="card" style={{ marginBottom:14 }}>
                <h2 style={{ marginBottom:12 }}>🎉 Tu {year} en Loop</h2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { label:"Entrenamientos", val: yearWorkouts.length, unit:"" },
                    { label:"Volumen total", val: totalVol >= 1000000 ? (totalVol/1000000).toFixed(1)+"M" : totalVol >= 1000 ? (totalVol/1000).toFixed(0)+"k" : totalVol, unit:"kg" },
                    { label:"Ejercicio fav.", val: topEx?.[0] || "–", unit:"" },
                    { label:"PRs del año", val: (prs||[]).filter(p=>(p.date||"").startsWith(String(year))).length, unit:"" },
                  ].map(item=>(
                    <div key={item.label} style={{ background:"var(--panel2)", borderRadius:12, padding:"12px", textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:900, color:"var(--green)" }}>{item.val}<span style={{ fontSize:12, fontWeight:400 }}>{item.unit}</span></div>
                      <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          </>)}
        </div>
      )}

      {/* ── TAB: PLAN ───────────────────────────────────────── */}
      {tab === "plan" && (
        <div>
          {/* Sub-tab bar: Rendimiento | Nutrición */}
          <div style={{ display:"flex", gap:4, background:"var(--panel)", borderRadius:14, padding:4, marginBottom:16 }}>
            {PLAN_SUB_TABS.map(({ id, label }) => (
              <button key={id} onClick={() => setPlanSubTab(id)} style={{
                flex:1, padding:"8px 4px", fontSize:12, fontWeight:600, borderRadius:10,
                border:"none", cursor:"pointer", transition:"all .15s",
                background: planSubTab === id ? "var(--green)" : "transparent",
                color: planSubTab === id ? "#fff" : "var(--muted)",
              }}>{label}</button>
            ))}
          </div>

          {planSubTab === "nutricion" ? (
            <MacroCalculator profile={profile} workouts={workouts} userGoal={userGoal} macroDay={macroDay} setMacroDay={setMacroDay} adaptiveTDEE={adaptiveTDEE} weeklyBalance={weeklyBalance} />
          ) : (
          workouts.length < 3 ? (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
              <h3 style={{ margin:"0 0 8px", fontSize:17 }}>Plan en construcción</h3>
              <p style={{ color:"var(--muted)", fontSize:13, lineHeight:1.5, margin:0 }}>Completá al menos 3 entrenamientos para que el coach genere tu plan personalizado.</p>
            </div>
          ) : (
            <>
              {/* ── Fase de periodización ── */}
              {periodization.phase !== "unknown" && (() => {
                const isDeload = periodization.needsDeload || periodization.phase === "deload";
                const isAccum  = periodization.phase === "accumulation";
                const accent   = isDeload ? "#ef4444" : isAccum ? "var(--green)" : "var(--cyan)";
                const bg       = isDeload ? "rgba(239,68,68,.07)" : isAccum ? "rgba(168,85,247,.07)" : "rgba(117,217,255,.07)";
                const border   = isDeload ? "rgba(239,68,68,.25)" : isAccum ? "rgba(168,85,247,.2)" : "rgba(117,217,255,.2)";
                const icon     = isDeload ? "🔄" : isAccum ? "📈" : "⚡";
                const label    = periodization.needsDeload ? "Deload recomendado" : isAccum ? "Fase de acumulación" : periodization.phase === "deload" ? "Fase de descarga" : "Fase de intensificación";
                const desc     = periodization.needsDeload
                  ? "Llevas 3+ semanas subiendo volumen. Esta semana bajá el peso al 60% y aumentá las repeticiones (12-20 reps por serie) para que el cuerpo se recupere sin perder calidad."
                  : isAccum ? "Volumen en alza — buena señal. Priorizá técnica perfecta antes de seguir subiendo cargas."
                  : periodization.phase === "deload" ? "Volumen bajando. Si es planificado, perfecto. Si no, revisá fatiga o motivación."
                  : "Volumen estable — momento ideal para subir la intensidad (más kg, mismas series).";
                return (
                  <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:18, padding:"16px", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                      <span style={{ fontSize:28 }}>{icon}</span>
                      <div>
                        <p style={{ margin:0, fontSize:11, color:accent, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em" }}>Fase actual</p>
                        <p style={{ margin:0, fontSize:16, fontWeight:900, color:"var(--text)" }}>{label}</p>
                      </div>
                    </div>
                    <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.55, marginBottom:12 }}>{desc}</p>
                    {/* Active adjustment banner */}
                    {activePlanAdjustment && activePlanAdjustment.type === (isDeload ? "deload" : isAccum ? "volume_up" : "intensity_up") ? (
                      <div style={{ background:"rgba(168,85,247,.1)", border:"1px solid rgba(168,85,247,.3)", borderRadius:10, padding:"8px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span style={{ fontSize:12, color:"var(--green)", fontWeight:700 }}>✓ Ajuste activo hasta {activePlanAdjustment.expiresAt}</span>
                        <button onClick={clearPlanAdjustment} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:11, cursor:"pointer" }}>Cancelar</button>
                      </div>
                    ) : declinedAlert !== (isDeload ? "deload" : isAccum ? "volume_up" : "intensity_up") ? (
                      <div style={{ display:"flex", gap:8 }}>
                        <button
                          onClick={() => acceptPlanRecommendation(isDeload ? "deload" : isAccum ? "volume_up" : "intensity_up", isDeload ? 0.6 : 1)}
                          style={{ flex:1, background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.3)", borderRadius:10, padding:"9px", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--green)" }}>
                          ✓ Aceptar
                        </button>
                        <button
                          onClick={() => setDeclinedAlert(isDeload ? "deload" : isAccum ? "volume_up" : "intensity_up")}
                          style={{ flex:1, background:"rgba(255,255,255,.04)", border:"1px solid var(--line)", borderRadius:10, padding:"9px", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--muted)" }}>
                          ✗ Declinar
                        </button>
                      </div>
                    ) : (
                      <p style={{ margin:0, fontSize:12, color:"var(--muted)" }}>Recomendación declinada para esta semana.</p>
                    )}
                  </div>
                );
              })()}

              {/* ── Carga semanal ── */}
              {fatigueScore.thisWeek > 0 && (
                <div style={{ background:"var(--panel)", border:`1px solid ${fatigueScore.overreaching ? "rgba(239,68,68,.3)" : "var(--line)"}`, borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <p style={{ margin:"0 0 1px", fontSize:11, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Carga semanal</p>
                      <p style={{ margin:0, fontSize:22, fontWeight:900, color: fatigueScore.overreaching ? "var(--danger)" : "var(--text)" }}>
                        {fatigueScore.thisWeek >= 1000 ? (fatigueScore.thisWeek/1000).toFixed(1) + "k" : fatigueScore.thisWeek}<span style={{ fontSize:13, fontWeight:400, color:"var(--muted)", marginLeft:3 }}>kg</span>
                      </p>
                    </div>
                    <span style={{
                      padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:800,
                      background: fatigueScore.overreaching ? "rgba(239,68,68,.12)" : fatigueScore.pctChange > 0 ? "rgba(168,85,247,.12)" : "rgba(255,255,255,.05)",
                      color: fatigueScore.overreaching ? "var(--danger)" : fatigueScore.pctChange > 0 ? "var(--green)" : "var(--muted)",
                      border: `1px solid ${fatigueScore.overreaching ? "rgba(239,68,68,.25)" : fatigueScore.pctChange > 0 ? "rgba(168,85,247,.2)" : "var(--line)"}`,
                    }}>
                      {fatigueScore.pctChange > 0 ? "↑" : fatigueScore.pctChange < 0 ? "↓" : "="} {Math.abs(fatigueScore.pctChange)}%
                    </span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={{ background:"var(--panel2)", borderRadius:12, padding:"8px 10px" }}>
                      <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Esta semana</p>
                      <b style={{ fontSize:14 }}>{fatigueScore.thisWeek >= 1000 ? (fatigueScore.thisWeek/1000).toFixed(1) + "k" : fatigueScore.thisWeek}kg</b>
                    </div>
                    <div style={{ background:"var(--panel2)", borderRadius:12, padding:"8px 10px" }}>
                      <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Semana anterior</p>
                      <b style={{ fontSize:14 }}>{fatigueScore.lastWeek >= 1000 ? (fatigueScore.lastWeek/1000).toFixed(1) + "k" : fatigueScore.lastWeek}kg</b>
                    </div>
                  </div>
                  {fatigueScore.overreaching && (
                    <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(239,68,68,.2)", display:"flex", gap:8, alignItems:"flex-start" }}>
                      <p style={{ margin:0, fontSize:12, color:"var(--danger)", lineHeight:1.5 }}>
                        Subida de +{fatigueScore.pctChange}% en una semana. Riesgo de sobreentrenamiento — priorizá sueño y descanso activo.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Prescripción ── */}
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name="Target" size={14} style={{ color:"var(--green)" }} />
                  </div>
                  <p style={{ margin:0, fontSize:14, fontWeight:800 }}>Cargas para el próximo entreno</p>
                </div>
                {prescriptions.length > 0 ? prescriptions.map(({ exercise, suggestedWeight, lastWeight, lastReps, reason }) => (
                  <div key={exercise} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14,
                    padding:"12px 14px", marginBottom:6,
                    borderLeft:"3px solid var(--green)",
                  }}>
                    <div style={{ minWidth:0, flex:1 }}>
                      <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:800 }}>{exercise}</p>
                      <p style={{ margin:0, fontSize:11, color:"var(--muted)" }}>{reason}</p>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                      <p style={{ margin:"0 0 1px", fontSize:22, fontWeight:900, color:"var(--green)", lineHeight:1 }}>{suggestedWeight}<span style={{ fontSize:12, fontWeight:600 }}>kg</span></p>
                      <p style={{ margin:0, fontSize:10, color:"var(--muted)" }}>ant. {lastWeight}kg×{lastReps}</p>
                    </div>
                  </div>
                )) : (
                  <p style={{ fontSize:13, color:"var(--muted)", padding:"10px 0" }}>Necesitás al menos 2 entrenamientos del mismo tipo para ver prescripciones.</p>
                )}
              </div>

              {/* ── Adherencia últimas 4 semanas ── */}
              {(() => {
                const now = new Date();
                const weeks = [0,1,2,3].map(i => {
                  const end = new Date(now); end.setDate(now.getDate() - i*7);
                  const start = new Date(end); start.setDate(end.getDate() - 6);
                  const count = workouts.filter(w => {
                    const d = w.date ? new Date(w.date) : null;
                    return d && d >= start && d <= end;
                  }).length;
                  return { label: i === 0 ? "Esta semana" : i === 1 ? "Semana -1" : i === 2 ? "Semana -2" : "Semana -3", count };
                }).reverse();
                const goal = 4;
                const avgAdherence = Math.round(weeks.reduce((s, w) => s + Math.min(1, w.count / goal), 0) / weeks.length * 100);
                const color = avgAdherence >= 80 ? "var(--green)" : avgAdherence >= 50 ? "#f59e0b" : "#ef4444";
                return (
                  <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:800 }}>📅 Adherencia al plan</p>
                      <span style={{ fontSize:20, fontWeight:900, color }}>{avgAdherence}%</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                      {weeks.map(w => {
                        const pct = Math.min(1, w.count / goal);
                        const wColor = pct >= 1 ? "var(--green)" : pct >= 0.5 ? "#f59e0b" : pct > 0 ? "#ef4444" : "var(--panel2)";
                        return (
                          <div key={w.label} style={{ textAlign:"center" }}>
                            <div style={{ height:48, background:"var(--panel2)", borderRadius:8, overflow:"hidden", display:"flex", alignItems:"flex-end" }}>
                              <div style={{ width:"100%", height:`${Math.max(8, pct*100)}%`, background:wColor, borderRadius:8, transition:"height .4s" }} />
                            </div>
                            <div style={{ fontSize:10, color:"var(--muted)", marginTop:4 }}>{w.label}</div>
                            <div style={{ fontSize:12, fontWeight:800, color:wColor }}>{w.count}/{goal}</div>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ margin:"10px 0 0", fontSize:12, color:"var(--muted)" }}>
                      {avgAdherence >= 80 ? "Excelente consistencia. Seguí así." : avgAdherence >= 50 ? "Hay margen para mejorar la consistencia." : "Adherencia baja — priorizá la constancia sobre la intensidad."}
                    </p>
                  </div>
                );
              })()}

              {/* ── Grupos sin entrenar ── */}
              {skippedGroups.length > 0 && (
                <div style={{ background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.2)", borderRadius:14, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:20 }}>👀</span>
                    <p style={{ margin:0, fontSize:14, fontWeight:800 }}>Grupos sin entrenar (últimas 4 semanas)</p>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {skippedGroups.map(g => (
                      <span key={g} style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:700, color:"#ef4444" }}>{g}</span>
                    ))}
                  </div>
                  <p style={{ margin:"8px 0 0", fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>Tu programa está desequilibrado. Agregá estos grupos en el próximo ciclo.</p>
                </div>
              )}

              {/* Ejercicios sugeridos para grupos débiles */}
              {skippedGroups && skippedGroups.length > 0 && (
                <div className="card" style={{ marginBottom:14, marginTop:12 }}>
                  <h2 style={{ marginBottom:10 }}>💡 Ejercicios sugeridos</h2>
                  {skippedGroups.slice(0,3).map(g => {
                    const suggestions = {
                      "Espalda": ["Dominadas", "Remo con barra", "Jalón al pecho"],
                      "Piernas": ["Sentadilla", "Peso muerto rumano", "Prensa de piernas"],
                      "Hombros": ["Press militar", "Elevaciones laterales", "Face pull"],
                      "Pecho": ["Press banca", "Aperturas con mancuernas", "Fondos"],
                      "Bíceps": ["Curl con barra", "Curl martillo", "Curl concentrado"],
                      "Tríceps": ["Press francés", "Extensión en polea", "Fondos"],
                      "Core": ["Plancha", "Crunch en polea", "Rueda abdominal"],
                    }[g] || ["Consultar con entrenador"];
                    return (
                      <div key={g} style={{ marginBottom:10 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"var(--danger)", marginBottom:4 }}>{g} — sin trabajar</div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {suggestions.map(ex => (
                            <span key={ex} style={{ background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:8, padding:"5px 10px", fontSize:12 }}>{ex}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ))}
        </div>
      )}

      {/* ── TAB: PROGRESIÓN ─────────────────────────────────── */}
      {tab === "progreso" && (
        <div>
          {!progression.length && !topExercises.length && !prs.length ? (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📊</div>
              <h3 style={{ margin:"0 0 8px", fontSize:17 }}>Sin datos aún</h3>
              <p style={{ color:"var(--muted)", fontSize:13, lineHeight:1.5, margin:0 }}>Completá más entrenamientos para ver tu progresión por ejercicio y grupo muscular.</p>
            </div>
          ) : (
            <>
              {/* ── Header: grupos activos + sparkline ── */}
              {(() => {
                const activeGroups = Object.entries(muscleBalance).filter(([,v]) => v.sets > 0).length;
                const totalGroups = Object.keys(muscleBalance).length;
                // Weekly volumes for sparkline
                const now = new Date();
                const volSpark = [6,5,4,3,2,1,0].map(i => {
                  const start = new Date(now); start.setDate(start.getDate() - start.getDay() - i*7 + 1);
                  const end = new Date(start); end.setDate(end.getDate() + 6);
                  return workouts.filter(w => w.date && w.date >= start.toISOString().slice(0,10) && w.date <= end.toISOString().slice(0,10))
                    .reduce((s,w) => s + getWorkoutVolume(w), 0);
                });
                const maxV = Math.max(...volSpark, 1);
                const SPW = 200, SPH = 32;
                return (
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14, background:"var(--panel)", borderRadius:14, padding:"10px 14px" }}>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontSize:15, fontWeight:900, color:"var(--text)" }}>
                        {activeGroups}/{totalGroups} grupos activos
                      </p>
                      <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--muted)" }}>
                        {volSpark[volSpark.length-1] >= 1000 ? (volSpark[volSpark.length-1]/1000).toFixed(1) + "k" : Math.round(volSpark[volSpark.length-1])}kg esta semana
                      </p>
                    </div>
                    <svg width={SPW} height={SPH} viewBox={`0 0 ${SPW} ${SPH}`} style={{ flexShrink:0 }}>
                      {volSpark.map((v,i) => {
                        const x = (i / (volSpark.length-1)) * SPW;
                        const y = SPH - (v / maxV) * (SPH - 4) - 2;
                        return <circle key={i} cx={x} cy={y} r={2.5} fill={i === volSpark.length-1 ? "var(--green)" : "rgba(168,85,247,.5)"} />;
                      })}
                      {volSpark.length > 1 && (
                        <polyline points={volSpark.map((v,i) => `${(i/(volSpark.length-1))*SPW},${SPH - (v/maxV)*(SPH-4)-2}`).join(" ")}
                          fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" />
                      )}
                    </svg>
                  </div>
                );
              })()}

              {/* ── Coach insights adaptativos ── */}
              {(() => {
                const hoy = new Date().toISOString().slice(0, 10);
                const wDates = [...new Set((workouts||[]).map(w => w.date?.slice(0,10)).filter(Boolean))].sort().reverse();
                // Streak
                let racha = 0;
                const d = new Date();
                while (true) {
                  const iso = d.toISOString().slice(0, 10);
                  if (wDates.includes(iso)) { racha++; d.setDate(d.getDate() - 1); }
                  else break;
                }
                // Week days
                const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
                const monStr = mon.toISOString().slice(0, 10);
                const semana = wDates.filter(x => x >= monStr && x <= hoy).length;
                // Avg days last 4 weeks
                let totalD = 0, wkCnt = 0;
                for (let w = 1; w <= 4; w++) {
                  const end = new Date(mon); end.setDate(end.getDate() - w * 7);
                  const start = new Date(end); start.setDate(start.getDate() - 6);
                  const days = wDates.filter(x => x >= start.toISOString().slice(0,10) && x <= end.toISOString().slice(0,10)).length;
                  totalD += days; if (days > 0) wkCnt++;
                }
                const avgSem = wkCnt > 0 ? (totalD / wkCnt).toFixed(1) : "—";
                // Weight trend (last 30 days)
                const weightEntries = [...(weightLog||[])].sort((a,b) => String(a.date).localeCompare(b.date));
                const recentWeight = weightEntries.filter(e => e.date >= monStr);
                const lastMonthWeight = weightEntries.filter(e => {
                  const m = new Date(); m.setDate(m.getDate() - 30);
                  return e.date >= m.toISOString().slice(0, 10);
                });
                const wTrend = lastMonthWeight.length >= 2
                  ? (Number(lastMonthWeight[lastMonthWeight.length-1].kg) - Number(lastMonthWeight[0].kg)).toFixed(1)
                  : null;
                // Sleep avg (last 7 days)
                const sleepWeek = [...(sleepLog||[])].filter(e => e.date >= monStr);
                const sleepAvg = sleepWeek.length > 0
                  ? (sleepWeek.reduce((s, e) => s + Number(e.hours), 0) / sleepWeek.length).toFixed(1)
                  : null;
                // Volume trend this week vs last
                const lastWeekStart = new Date(mon); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
                const lastWeekEnd = new Date(mon); lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
                const volThis = (workouts||[]).filter(w => w.date >= monStr && w.date <= hoy).reduce((s, w) => s + getWorkoutVolume(w), 0);
                const volLast = (workouts||[]).filter(w => w.date >= lastWeekStart.toISOString().slice(0,10) && w.date <= lastWeekEnd.toISOString().slice(0,10)).reduce((s, w) => s + getWorkoutVolume(w), 0);
                const volTrend = volLast > 0 ? Math.round((volThis - volLast) / volLast * 100) : null;
                // Water compliance
                const waterWeek = [...(waterLog||[])].filter(e => e.date >= monStr);
                const waterAvg = waterWeek.length > 0
                  ? (waterWeek.reduce((s, e) => s + Number(e.glasses), 0) / waterWeek.length)
                  : null;

                const insights = [];
                // Consistency
                if (racha >= 3) insights.push({ icon:"🔥", text:`Racha de ${racha} días entrenando`, color:"var(--green)" });
                else if (semana > 0) insights.push({ icon:"💪", text:`${semana} días esta semana (prom. ${avgSem}/sem)`, color:"var(--text)" });
                else insights.push({ icon:"⏳", text:"Sin entrenos esta semana", color:"var(--muted)" });

                // Weight trend vs goal
                if (wTrend !== null && Math.abs(Number(wTrend)) >= 0.3) {
                  const dir = Number(wTrend) > 0 ? "subiste" : "bajaste";
                  const emoji = userGoal === "definicion" && Number(wTrend) < 0 ? "✅" :
                    userGoal === "volumen" && Number(wTrend) > 0 ? "✅" : "⚠️";
                  insights.push({ icon:emoji, text:`${dir} ${Math.abs(Number(wTrend))}kg en 30 días`, color:emoji === "✅" ? "var(--green)" : "#f59e0b" });
                }
                // Sleep
                if (sleepAvg !== null) {
                  const ok = Number(sleepAvg) >= 7;
                  insights.push({ icon:ok ? "😴" : "🌙", text:`Sueño: ${sleepAvg}h promedio${ok ? " — óptimo" : " — ideal ≥7h"}`, color:ok ? "var(--green)" : "#f59e0b" });
                }
                // Volume trend
                if (volTrend !== null) {
                  const dir = volTrend > 0 ? "↑" : "↓";
                  insights.push({ icon:"📦", text:`Volumen ${dir} ${Math.abs(volTrend)}% vs semana pasada`, color:volTrend > 0 ? "var(--green)" : "var(--muted)" });
                }
                // Water
                if (waterAvg !== null && waterGoal) {
                  const ok = waterAvg >= waterGoal;
                  insights.push({ icon:"💧", text:`Agua: ${waterAvg.toFixed(0)}/${waterGoal} vasos${ok ? " ✓" : ""}`, color:ok ? "var(--green)" : "#f59e0b" });
                }
                // Body composition
                if (bodyFatPct !== null && lbm !== null) {
                  insights.push({ icon:"📐", text:`Grasa: ${bodyFatPct.toFixed(1)}% · Masa magra: ${lbm.toFixed(1)}kg`, color:"var(--text)" });
                }

                return (
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12 }}>
                    {insights.slice(0, 5).map((ins, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:"var(--panel)", borderRadius:10, padding:"7px 10px" }}>
                        <span style={{ fontSize:16, flexShrink:0 }}>{ins.icon}</span>
                        <span style={{ fontSize:12, color:ins.color, lineHeight:1.4 }}>{ins.text}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ── Top cards: PRs + grupo + medidas ── */}
              <div style={{ display:"flex", gap:8, marginBottom:14, overflow:"auto", flexWrap:"nowrap" }}>
                {/* Top 3 PRs */}
                {prs.slice(0,3).map((pr,i) => (
                  <div key={i} style={{ flex:"0 0 auto", minWidth:120, background:"rgba(232,247,119,.07)", border:"1px solid rgba(232,247,119,.15)", borderRadius:12, padding:"8px 10px" }}>
                    <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--yellow)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>PR #{i+1}</p>
                    <p style={{ margin:0, fontSize:13, fontWeight:800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{pr.exercise}</p>
                    <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--text)" }}>{pr.weight}kg × {pr.reps}</p>
                  </div>
                ))}
                {/* Grupo más trabajado */}
                {(() => {
                  const topGroup = Object.entries(muscleBalance).sort((a,b) => b[1].sets - a[1].sets)[0];
                  if (!topGroup || !topGroup[1].sets) return null;
                  const prevSets = 0; // simplified: show current sets only
                  return (
                    <div style={{ flex:"0 0 auto", minWidth:100, background:"rgba(168,85,247,.07)", border:"1px solid rgba(168,85,247,.2)", borderRadius:12, padding:"8px 10px" }}>
                      <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--green)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Mejor grupo</p>
                      <p style={{ margin:0, fontSize:13, fontWeight:800 }}>{topGroup[0]}</p>
                      <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--muted)" }}>{topGroup[1].sets} series/sem</p>
                    </div>
                  );
                })()}
                {/* Medidas link */}
                <div style={{ flex:"0 0 auto", minWidth:100, background:"rgba(34,197,94,.07)", border:"1px solid rgba(34,197,94,.2)", borderRadius:12, padding:"8px 10px", cursor:"pointer" }} onClick={() => setPage("measurements")}>
                  <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--green)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Medidas</p>
                  <p style={{ margin:0, fontSize:13, fontWeight:800 }}>{bodyWeight ? `${bodyWeight}kg` : "—"}</p>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--muted)" }}>Ver todo →</p>
                </div>
              </div>

              {/* ── Análisis completo ── */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, cursor:"pointer" }} onClick={() => setShowProgresoAdvanced(s => !s)}>
                <div style={{ flex:1, height:1, background:"var(--line)" }} />
                <span style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>
                  {showProgresoAdvanced ? "▲ Menos detalle" : "▼ Más análisis"}
                </span>
                <div style={{ flex:1, height:1, background:"var(--line)" }} />
              </div>

              {showProgresoAdvanced && (<>
              {/* ── 1RM por ejercicio ── */}
              {topExercises.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon name="TrendingUp" size={14} style={{ color:"var(--green)" }} />
                    </div>
                    <p style={{ margin:0, fontSize:14, fontWeight:800 }}>1RM estimado</p>
                  </div>
                  {topExercises.map((exercise, i) => {
                    const pts = getOneRMHistory(workouts, exercise);
                    if (pts.length < 2) return null;
                    const vals = pts.map(p => p.orm);
                    const minV = Math.min(...vals), maxV = Math.max(...vals);
                    const range = maxV - minV || 1;
                    const W = 260, H = 52;
                    const polyPts = pts.map((p, i) => {
                      const x = pts.length > 1 ? (i / (pts.length - 1)) * W : W / 2;
                      const y = H - ((p.orm - minV) / range) * (H - 8) - 4;
                      return `${x},${y}`;
                    }).join(" ");
                    const last = vals[vals.length - 1];
                    const diff = last - vals[0];
                    const trend = diff > 0 ? "var(--green)" : diff < 0 ? "var(--danger)" : "var(--muted)";
                    return (
                      <div key={exercise} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"14px", marginBottom:8, overflow:"hidden" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                          <div>
                            <p style={{ margin:"0 0 2px", fontSize:14, fontWeight:800 }}>{exercise}</p>
                            <p style={{ margin:0, fontSize:11, color:"var(--muted)" }}>{pts.length} sesiones registradas</p>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <p style={{ margin:"0 0 1px", fontSize:22, fontWeight:900, color:trend, lineHeight:1 }}>
                              {last}<span style={{ fontSize:12, fontWeight:500, color:"var(--muted)", marginLeft:2 }}>kg</span>
                            </p>
                            {diff !== 0 && (
                              <p style={{ margin:0, fontSize:11, fontWeight:700, color:trend }}>
                                {diff > 0 ? "+" : ""}{diff}kg desde el inicio
                              </p>
                            )}
                          </div>
                        </div>
                        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display:"block", overflow:"visible" }}>
                          <defs>
                            <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--green)" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {pts.length > 1 && (
                            <polyline
                              points={[`0,${H}`, ...pts.map((p, i) => {
                                const x = (i / (pts.length - 1)) * W;
                                const y = H - ((p.orm - minV) / range) * (H - 8) - 4;
                                return `${x},${y}`;
                              }), `${W},${H}`].join(" ")}
                              fill={`url(#grad-${i})`} stroke="none"
                            />
                          )}
                          <polyline points={polyPts} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          {pts.map((p, i) => {
                            const x = pts.length > 1 ? (i / (pts.length - 1)) * W : W / 2;
                            const y = H - ((p.orm - minV) / range) * (H - 8) - 4;
                            const isLast = i === pts.length - 1;
                            return <circle key={i} cx={x} cy={y} r={isLast ? 4 : 3} fill={isLast ? "var(--green)" : "rgba(168,85,247,.5)"} />;
                          })}
                        </svg>
                        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                          <span style={{ fontSize:10, color:"var(--muted)" }}>{pts[0]?.date}</span>
                          <span style={{ fontSize:10, color:"var(--muted)" }}>{pts[pts.length-1]?.date}</span>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}

              {/* ── Proyección ── */}
              {topExercises.length > 0 && (() => {
                const projections = topExercises.map(exercise => {
                  const pts = getOneRMHistory(workouts, exercise);
                  if (pts.length < 3) return null;
                  const n = pts.length, xMean = (n - 1) / 2;
                  const yMean = pts.reduce((s, p) => s + p.orm, 0) / n;
                  let num = 0, den = 0;
                  pts.forEach((p, i) => { num += (i - xMean) * (p.orm - yMean); den += (i - xMean) ** 2; });
                  const slope = den ? num / den : 0;
                  if (slope <= 0) return null;
                  const lastOrm = pts[pts.length - 1].orm;
                  const targetOrm = Math.ceil(lastOrm / 5) * 5 + 5;
                  const weeksToGoal = Math.round((targetOrm - lastOrm) / (slope * (workouts.length > 4 ? 1 : 2)));
                  if (weeksToGoal <= 0 || weeksToGoal > 52) return null;
                  const pct = Math.round(((targetOrm - lastOrm) / lastOrm) * 100);
                  return { exercise, currentOrm: lastOrm, targetOrm, weeksToGoal, pct };
                }).filter(Boolean);
                if (!projections.length) return null;
                return (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Icon name="Zap" size={14} style={{ color:"#f59e0b" }} />
                      </div>
                      <p style={{ margin:0, fontSize:14, fontWeight:800 }}>Proyección de progreso</p>
                    </div>
                    {projections.map(({ exercise, currentOrm, targetOrm, weeksToGoal, pct }) => (
                      <div key={exercise} style={{ background:"var(--panel)", border:"1px solid rgba(245,158,11,.2)", borderRadius:16, padding:"14px", marginBottom:8 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <div>
                            <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:800 }}>{exercise}</p>
                            <p style={{ margin:0, fontSize:11, color:"var(--muted)" }}>1RM actual: <b style={{ color:"var(--text)" }}>{currentOrm}kg</b></p>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <p style={{ margin:"0 0 1px", fontSize:20, fontWeight:900, color:"#f59e0b", lineHeight:1 }}>{targetOrm}<span style={{ fontSize:11, fontWeight:500, color:"var(--muted)", marginLeft:2 }}>kg</span></p>
                            <p style={{ margin:0, fontSize:11, color:"var(--muted)" }}>en ~{weeksToGoal} sem.</p>
                          </div>
                        </div>
                        <div style={{ background:"var(--panel2)", borderRadius:8, height:6, overflow:"hidden" }}>
                          <div style={{ background:"linear-gradient(90deg, #f59e0b, #fcd34d)", height:"100%", borderRadius:8, width:`${Math.min(95, Math.round((currentOrm / targetOrm) * 100))}%`, transition:"width .5s" }} />
                        </div>
                        <p style={{ margin:"5px 0 0", fontSize:10, color:"var(--muted)", textAlign:"right" }}>+{pct}% hasta el próximo hito</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ── Volumen por grupo muscular (últimas 8 semanas) ── */}
              {workouts.length >= 2 && (() => {
                const GROUPS = [
                  { name:"Piernas", color:"#a855f7" },
                  { name:"Espalda", color:"#60a5fa" },
                  { name:"Pecho",   color:"#f472b6" },
                  { name:"Hombros", color:"#fb923c" },
                  { name:"Brazos",  color:"#34d399" },
                ];
                const weeks = [];
                for (let i = 7; i >= 0; i--) {
                  const d = new Date();
                  d.setDate(d.getDate() - ((d.getDay()+6)%7) - i*7);
                  const mon = d.toISOString().slice(0,10);
                  const sun = new Date(d); sun.setDate(d.getDate()+6);
                  const sunStr = sun.toISOString().slice(0,10);
                  const label = i === 0 ? "Esta" : `-${i}`;
                  const vols = {};
                  GROUPS.forEach(g => { vols[g.name] = 0; });
                  workouts.forEach(w => {
                    if (!w.date || w.date < mon || w.date > sunStr) return;
                    (w.sets||[]).forEach(s => {
                      if (vols[s.group] !== undefined) vols[s.group] += (Number(s.weight)||0)*(Number(s.reps)||0);
                    });
                  });
                  weeks.push({ label, mon, vols });
                }
                const maxVol = Math.max(...weeks.flatMap(w => GROUPS.map(g => w.vols[g.name])), 1);
                const W = 280, H = 80, BAR_W = Math.floor(W / weeks.length) - 2;
                return (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Icon name="BarChart2" size={14} style={{ color:"#a855f7" }} />
                      </div>
                      <p style={{ margin:0, fontSize:14, fontWeight:800 }}>Volumen por grupo muscular</p>
                    </div>
                    <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"14px", overflow:"hidden" }}>
                      <svg width="100%" viewBox={`0 0 ${W} ${H+20}`} style={{ display:"block", overflow:"hidden", aspectRatio:`${W}/${H+20}` }}>
                        {weeks.map((wk, wi) => {
                          const x = wi * (W / weeks.length);
                          let stackY = H;
                          return (
                            <g key={wi}>
                              {GROUPS.map(g => {
                                const vol = wk.vols[g.name];
                                const bh = Math.round((vol / maxVol) * (H - 8));
                                if (!bh) return null;
                                stackY -= bh;
                                return <rect key={g.name} x={x+2} y={stackY} width={BAR_W} height={bh} rx={2} fill={g.color} opacity={0.85} />;
                              })}
                              <text x={x + BAR_W/2 + 2} y={H+14} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,.3)">{wk.label}</text>
                            </g>
                          );
                        })}
                      </svg>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 10px", marginTop:4 }}>
                        {GROUPS.map(g => (
                          <span key={g.name} style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:"var(--muted)" }}>
                            <span style={{ width:8, height:8, borderRadius:2, background:g.color, display:"inline-block" }} />
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Ciclo 4 semanas ── */}
              {cycleComparison && Object.keys(cycleComparison).length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"rgba(117,217,255,.1)", border:"1px solid rgba(117,217,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon name="BarChart2" size={14} style={{ color:"var(--cyan)" }} />
                    </div>
                    <p style={{ margin:0, fontSize:14, fontWeight:800 }}>Ciclo actual vs anterior</p>
                  </div>
                  {Object.entries(cycleComparison).map(([type, { curVol, prevVol, curCount, prevCount, pct }]) => {
                    const isUp = pct > 5, isDown = pct < -5;
                    return (
                      <div key={type} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"12px 14px", marginBottom:6 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:800 }}>{type}</p>
                          <span style={{
                            padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:800,
                            background: isUp ? "rgba(168,85,247,.1)" : isDown ? "rgba(239,68,68,.1)" : "rgba(255,255,255,.05)",
                            color: isUp ? "var(--green)" : isDown ? "var(--danger)" : "var(--muted)",
                          }}>
                            {pct !== null ? `${pct > 0 ? "+" : ""}${pct}%` : "Nuevo"}
                          </span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                          <div style={{ background:"rgba(168,85,247,.06)", borderRadius:10, padding:"8px 10px" }}>
                            <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--green)", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700 }}>Este ciclo</p>
                            <b style={{ fontSize:14 }}>{curVol >= 1000 ? (curVol/1000).toFixed(1) + "k" : curVol}kg</b>
                            <span style={{ fontSize:11, color:"var(--muted)", marginLeft:5 }}>{curCount}x</span>
                          </div>
                          <div style={{ background:"var(--panel2)", borderRadius:10, padding:"8px 10px" }}>
                            <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700 }}>Ciclo anterior</p>
                            <b style={{ fontSize:14 }}>{prevVol >= 1000 ? (prevVol/1000).toFixed(1) + "k" : prevVol}kg</b>
                            <span style={{ fontSize:11, color:"var(--muted)", marginLeft:5 }}>{prevCount}x</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── PRs completo ── */}
              {prs.length > 0 && (
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"rgba(232,247,119,.1)", border:"1px solid rgba(232,247,119,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon name="Star" size={14} style={{ color:"var(--yellow)" }} />
                    </div>
                    <p style={{ margin:0, fontSize:14, fontWeight:800 }}>Todos los récords</p>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {prs.map((pr, i) => (
                      <div key={i} style={{ background:"rgba(232,247,119,.07)", border:"1px solid rgba(232,247,119,.15)", borderRadius:10, padding:"6px 10px" }}>
                        <p style={{ margin:"0 0 1px", fontSize:12, fontWeight:700 }}>{pr.exercise}</p>
                        <p style={{ margin:0, fontSize:11, color:"var(--yellow)" }}>{pr.weight}kg × {pr.reps}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </>)}
            </>
          )}
        </div>
      )}

      {/* ── TAB: ALERTAS ────────────────────────────────────── */}
      {tab === "alertas" && (
        <div>
          {smartAlerts.length === 0 && skippedGroups.length === 0 && !fatigueScore.overreaching && workouts.length >= 2 && (
            <div style={{ display:"flex", gap:10, alignItems:"flex-start", background:"rgba(168,85,247,.07)", border:"1px solid rgba(168,85,247,.2)", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
              <span style={{ fontSize:20, flexShrink:0 }}>—</span>
              <div>
                <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"var(--text)" }}>Todo bien por ahora</p>
                <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>No se detectan alertas activas. Seguí entrenando con consistencia.</p>
              </div>
            </div>
          )}
          {workouts.length < 2 && (
            <div className="notice"><b>Pocos datos</b><p>Registrá al menos 2 entrenamientos para activar el sistema de alertas.</p></div>
          )}

          {/* Overreaching alert */}
          {fatigueScore.overreaching && (
            <div style={{ display:"flex", gap:10, alignItems:"flex-start", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.3)", borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
              <div>
                <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"var(--text)" }}>Sobrecarga detectada</p>
                <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>
                  Tu volumen subió un {fatigueScore.pctChange}% de golpe. Riesgo de sobreentrenamiento — priorizá descanso esta semana.
                </p>
              </div>
            </div>
          )}

          {/* Smart alerts */}
          {smartAlerts.map((alert, i) => (
            <div key={i} style={{
              display:"flex", gap:10, alignItems:"flex-start",
              background: alert.type === "imbalance" ? "rgba(239,68,68,.07)" : alert.type === "stall" ? "rgba(96,165,250,.08)" : "rgba(245,158,11,.08)",
              border:`1px solid ${alert.type === "imbalance" ? "rgba(239,68,68,.25)" : alert.type === "stall" ? "rgba(96,165,250,.3)" : "rgba(245,158,11,.25)"}`,
              borderRadius:14, padding:"14px 16px", marginBottom:10
            }}>
              <span style={{ fontSize:20, flexShrink:0 }}>
                {alert.type === "stall" ? "🔄" : alert.type === "volume" ? "📉" : "⚖️"}
              </span>
              <div>
                <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"var(--text)" }}>
                  {alert.type === "stall" ? "Estancamiento de peso" : alert.type === "volume" ? "Caída de volumen" : "Desbalance muscular"}
                </p>
                <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>{alert.msg}</p>
              </div>
            </div>
          ))}

          {/* RPE fatigue alerts */}
          {rpeFatigueAlerts.map((alert, i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", background:"rgba(168,85,247,.07)", border:"1px solid rgba(168,85,247,.25)", borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
              <span style={{ fontSize:20, flexShrink:0 }}>⚡</span>
              <div>
                <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"var(--text)" }}>Fatiga acumulada por RPE</p>
                <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>{alert.msg}</p>
              </div>
            </div>
          ))}

          {/* Skipped muscle groups */}
          {skippedGroups.length > 0 && (
            <div style={{ display:"flex", gap:10, alignItems:"flex-start", background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.25)", borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
              <span style={{ fontSize:20, flexShrink:0 }}>👀</span>
              <div>
                <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"var(--text)" }}>Grupos sin entrenar</p>
                <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>
                  No entrenaste <b style={{ color:"var(--danger)" }}>{skippedGroups.join(", ")}</b> en las últimas 4 semanas. Tu programa está desequilibrado.
                </p>
              </div>
            </div>
          )}

          {/* Weekly volume per muscle group */}
          {workouts.length >= 1 && (() => {
            const entries = Object.entries(VOLUME_LANDMARKS).map(([group, { mev, mav, mrv }]) => {
              const sets = muscleBalance[group]?.sets || 0;
              const status = muscleBalance[group]?.status || "untouched";
              return { group, sets, mev, mav, mrv, status };
            });
            const active = entries.filter(e => e.sets > 0 || e.status !== "untouched");
            const inactive = entries.filter(e => e.sets === 0);
            return (
              <div style={{ background:"var(--panel)", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
                <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  Volumen semanal por músculo (esta semana)
                </p>
                {entries.map(({ group, sets, mev, mav, mrv, status }) => {
                  const barPct = Math.min(1, sets / mrv);
                  const mevPct = mev / mrv;
                  const mavPct = mav / mrv;
                  const barColor = status === "overtrained" ? "#f87171" : status === "optimal" ? "#a855f7" : status === "undertrained" ? "#f59e0b" : "rgba(255,255,255,.15)";
                  return (
                    <div key={group} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, alignItems:"center" }}>
                        <span style={{ fontSize:12, fontWeight:600 }}>{group}</span>
                        <span style={{ fontSize:11, color: barColor, fontWeight:700 }}>
                          {sets} series · {status === "overtrained" ? "⚠ Exceso" : status === "optimal" ? "✓ Óptimo" : status === "undertrained" ? "↑ Bajo" : "Sin entrenar"}
                        </span>
                      </div>
                      <div style={{ position:"relative", height:6, background:"var(--panel2)", borderRadius:3, overflow:"visible" }}>
                        <div style={{ height:"100%", width:`${barPct*100}%`, background:barColor, borderRadius:3, transition:"width 0.4s" }} />
                        {/* MEV marker */}
                        <div style={{ position:"absolute", top:-2, left:`${mevPct*100}%`, width:1, height:10, background:"rgba(255,255,255,.3)" }} title={`MEV ${mev}`} />
                        {/* MAV marker */}
                        <div style={{ position:"absolute", top:-2, left:`${mavPct*100}%`, width:1, height:10, background:"rgba(255,255,255,.5)" }} title={`MAV ${mav}`} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ display:"flex", gap:12, marginTop:8, fontSize:10, color:"var(--muted)", flexWrap:"wrap" }}>
                  <span>│ = MEV (mínimo efectivo)</span>
                  <span>│ = MAV (óptimo)</span>
                  <span style={{ color:"var(--danger)" }}>Rojo = excede MRV</span>
                </div>
              </div>
            );
          })()}

          {/* Deload alert from periodization */}
          {periodization.needsDeload && (
            <div style={{ background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.25)", borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"var(--text)" }}>Deload recomendado</p>
                  <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>
                    Llevás 3+ semanas aumentando volumen. Esta semana bajá el peso al 60% y aumentá las repeticiones (12-20 reps por serie) — tu cuerpo lo necesita para recuperarse y seguir progresando.
                  </p>
                </div>
              </div>
              {activePlanAdjustment?.type === "deload" ? (
                <div style={{ background:"rgba(168,85,247,.1)", border:"1px solid rgba(168,85,247,.3)", borderRadius:10, padding:"8px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, color:"var(--green)", fontWeight:700 }}>✓ Deload activo — pesos reducidos al 60% hasta {activePlanAdjustment.expiresAt}</span>
                  <button onClick={clearPlanAdjustment} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:11, cursor:"pointer" }}>Cancelar</button>
                </div>
              ) : declinedAlert !== "deload" ? (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => acceptPlanRecommendation("deload", 0.6)}
                    style={{ flex:1, background:"rgba(245,158,11,.15)", border:"1px solid rgba(245,158,11,.4)", borderRadius:10, padding:"9px", cursor:"pointer", fontSize:13, fontWeight:700, color:"#f59e0b" }}>
                    ✓ Aceptar deload (60% peso, 12-20 reps)
                  </button>
                  <button onClick={() => setDeclinedAlert("deload")}
                    style={{ flex:1, background:"rgba(255,255,255,.04)", border:"1px solid var(--line)", borderRadius:10, padding:"9px", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--muted)" }}>
                    ✗ Declinar
                  </button>
                </div>
              ) : (
                <p style={{ margin:0, fontSize:12, color:"var(--muted)" }}>Deload declinado esta semana.</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Per-100g nutritional data. Mixed meals are per 100g of full dish.
const CATS = [
  { id:"",            label:"Todo"       },
  { id:"desayuno",    label:"Desayuno"   },
  { id:"colacion",    label:"Colación"   },
  { id:"merienda",    label:"Merienda"   },
  { id:"entrada",     label:"Entrada"    },
  { id:"principal",   label:"Principal"  },
  { id:"postre",      label:"Postre"     },
  { id:"fruta",       label:"Fruta"      },
  { id:"verdura",     label:"Verdura"    },
  { id:"proteina",    label:"Proteína"   },
  { id:"carbohidrato",label:"Carbs"      },
  { id:"lacteo",      label:"Lácteo"     },
  { id:"legumbre",    label:"Legumbre"   },
  { id:"grasa",       label:"Grasas"     },
  { id:"bebida",      label:"Bebida"     },
  { id:"suplemento",  label:"Suplemento" },
  { id:"rapida",      label:"Rápida"     },
];

const FOOD_DB = [
  // ── Proteínas ────────────────────────────────────────────────
  { cat:"proteina", name:"Pechuga de pollo",          kcal:165, protein:31,  carbs:0,   fat:3.6  },
  { cat:"proteina", name:"Muslo de pollo s/piel",     kcal:177, protein:24,  carbs:0,   fat:8.5  },
  { cat:"proteina", name:"Pollo entero asado",        kcal:239, protein:27,  carbs:0,   fat:14   },
  { cat:"proteina", name:"Pollo desmechado",          kcal:152, protein:29,  carbs:0,   fat:3.7  },
  { cat:"proteina", name:"Carne molida magra",        kcal:215, protein:26,  carbs:0,   fat:12   },
  { cat:"proteina", name:"Carne molida regular",      kcal:254, protein:24,  carbs:0,   fat:17   },
  { cat:"proteina", name:"Bife de lomo",              kcal:207, protein:26,  carbs:0,   fat:11   },
  { cat:"proteina", name:"Bife de chorizo",           kcal:289, protein:25,  carbs:0,   fat:20   },
  { cat:"proteina", name:"Cuadril",                   kcal:175, protein:28,  carbs:0,   fat:6.5  },
  { cat:"proteina", name:"Nalga",                     kcal:160, protein:28,  carbs:0,   fat:5    },
  { cat:"proteina", name:"Tapa de asado",             kcal:310, protein:23,  carbs:0,   fat:24   },
  { cat:"proteina", name:"Vacío",                     kcal:190, protein:27,  carbs:0,   fat:9    },
  { cat:"proteina", name:"Entraña",                   kcal:230, protein:24,  carbs:0,   fat:14   },
  { cat:"proteina", name:"Carne vacuna (asado)",      kcal:245, protein:22,  carbs:0,   fat:17   },
  { cat:"proteina", name:"Costillas de cerdo",        kcal:275, protein:24,  carbs:0,   fat:19   },
  { cat:"proteina", name:"Lomo de cerdo",             kcal:143, protein:26,  carbs:0,   fat:4    },
  { cat:"proteina", name:"Atún en lata (agua)",       kcal:116, protein:26,  carbs:0,   fat:1    },
  { cat:"proteina", name:"Atún en lata (aceite)",     kcal:198, protein:25,  carbs:0,   fat:11   },
  { cat:"proteina", name:"Salmón",                    kcal:208, protein:20,  carbs:0,   fat:13   },
  { cat:"proteina", name:"Merluza",                   kcal:82,  protein:17,  carbs:0,   fat:1    },
  { cat:"proteina", name:"Trucha",                    kcal:148, protein:21,  carbs:0,   fat:6.6  },
  { cat:"proteina", name:"Bacalao",                   kcal:105, protein:23,  carbs:0,   fat:0.9  },
  { cat:"proteina", name:"Pez espada",                kcal:121, protein:20,  carbs:0,   fat:4    },
  { cat:"proteina", name:"Sardinas en lata",          kcal:208, protein:25,  carbs:0,   fat:11   },
  { cat:"proteina", name:"Surimi / palitos de mar",   kcal:99,  protein:15,  carbs:4,   fat:2.5  },
  { cat:"proteina", name:"Langostinos",               kcal:99,  protein:24,  carbs:0,   fat:0.3  },
  { cat:"proteina", name:"Calamar",                   kcal:92,  protein:16,  carbs:3,   fat:1.4  },
  { cat:"proteina", name:"Huevo entero",              kcal:155, protein:13,  carbs:1,   fat:11,  unit:true, unitWeight:55 },
  { cat:"proteina", name:"Clara de huevo",            kcal:52,  protein:11,  carbs:0,   fat:0.2, unit:true, unitWeight:35 },
  { cat:"proteina", name:"Pechuga de pavo",           kcal:135, protein:30,  carbs:0,   fat:1    },
  { cat:"proteina", name:"Jamón cocido (feta)",       kcal:42,  protein:7,   carbs:0.5, fat:1.3  },
  { cat:"proteina", name:"Jamón serrano (feta)",      kcal:60,  protein:8,   carbs:0,   fat:3    },
  { cat:"proteina", name:"Salame (feta)",             kcal:90,  protein:5,   carbs:0.5, fat:7.5  },
  // ── Lácteos ──────────────────────────────────────────────────
  { cat:"lacteo", name:"Queso cottage",             kcal:98,  protein:11,  carbs:3,   fat:4.5  },
  { cat:"lacteo", name:"Yogur griego (0%)",         kcal:59,  protein:10,  carbs:4,   fat:0.4  },
  { cat:"lacteo", name:"Yogur griego (entero)",     kcal:97,  protein:9,   carbs:4,   fat:5    },
  { cat:"lacteo", name:"Yogur natural descremado",  kcal:56,  protein:5,   carbs:7,   fat:0.3  },
  { cat:"lacteo", name:"Yogur bebible (125ml)",     kcal:70,  protein:3,   carbs:12,  fat:1.2  },
  { cat:"lacteo", name:"Queso descremado",          kcal:102, protein:14,  carbs:1,   fat:5    },
  { cat:"lacteo", name:"Queso port salut",          kcal:291, protein:22,  carbs:1,   fat:22   },
  { cat:"lacteo", name:"Queso mozzarella",          kcal:280, protein:22,  carbs:2,   fat:20   },
  { cat:"lacteo", name:"Queso brie",                kcal:334, protein:21,  carbs:0.5, fat:28   },
  { cat:"lacteo", name:"Queso cheddar",             kcal:402, protein:25,  carbs:1.3, fat:33   },
  { cat:"lacteo", name:"Queso parmesano",           kcal:431, protein:38,  carbs:3,   fat:29   },
  { cat:"lacteo", name:"Queso crema",               kcal:342, protein:6,   carbs:4,   fat:34   },
  { cat:"lacteo", name:"Ricota",                    kcal:174, protein:11,  carbs:3,   fat:13   },
  { cat:"lacteo", name:"Leche descremada (250ml)",  kcal:85,  protein:8.5, carbs:12.5,fat:0.3  },
  { cat:"lacteo", name:"Leche entera (250ml)",      kcal:153, protein:8,   carbs:12,  fat:8    },
  { cat:"lacteo", name:"Leche de avena (250ml)",    kcal:120, protein:3,   carbs:20,  fat:3    },
  { cat:"lacteo", name:"Leche de almendra (250ml)", kcal:60,  protein:1,   carbs:8,   fat:2.5  },
  { cat:"lacteo", name:"Crema de leche",            kcal:340, protein:2,   carbs:3,   fat:36   },
  { cat:"lacteo", name:"Manteca",                   kcal:717, protein:0.9, carbs:0.1, fat:81   },
  // ── Carbohidratos ────────────────────────────────────────────
  { cat:"carbohidrato", name:"Arroz blanco cocido",     kcal:130, protein:2.7, carbs:28,  fat:0.3  },
  { cat:"carbohidrato", name:"Arroz integral cocido",   kcal:122, protein:2.5, carbs:25,  fat:1    },
  { cat:"carbohidrato", name:"Arroz yamani",            kcal:118, protein:2.8, carbs:24,  fat:0.8  },
  { cat:"carbohidrato", name:"Avena seca",              kcal:389, protein:17,  carbs:66,  fat:7    },
  { cat:"carbohidrato", name:"Avena cocida",            kcal:71,  protein:2.5, carbs:12,  fat:1.5  },
  { cat:"carbohidrato", name:"Pan integral (rebanada)", kcal:247, protein:9,   carbs:46,  fat:3.4  },
  { cat:"carbohidrato", name:"Pan blanco (rebanada)",   kcal:265, protein:9,   carbs:49,  fat:3.2  },
  { cat:"carbohidrato", name:"Pan árabe/pita",          kcal:275, protein:9,   carbs:56,  fat:1.2  },
  { cat:"carbohidrato", name:"Pan de molde (rebanada)", kcal:79,  protein:2.7, carbs:15,  fat:0.9  },
  { cat:"carbohidrato", name:"Pan lactal integral",     kcal:240, protein:9,   carbs:44,  fat:3    },
  { cat:"carbohidrato", name:"Tostada integral",        kcal:325, protein:10,  carbs:56,  fat:5    },
  { cat:"carbohidrato", name:"Papa hervida",            kcal:87,  protein:1.9, carbs:20,  fat:0.1  },
  { cat:"carbohidrato", name:"Papa al horno",           kcal:93,  protein:2.5, carbs:21,  fat:0.1  },
  { cat:"carbohidrato", name:"Papas fritas caseras",    kcal:312, protein:3.4, carbs:41,  fat:15   },
  { cat:"carbohidrato", name:"Batata/boniato",          kcal:86,  protein:1.6, carbs:20,  fat:0.1  },
  { cat:"carbohidrato", name:"Pasta cocida",            kcal:131, protein:5,   carbs:25,  fat:1.1  },
  { cat:"carbohidrato", name:"Pasta integral cocida",   kcal:124, protein:5.3, carbs:24,  fat:1.1  },
  { cat:"carbohidrato", name:"Fideos de arroz cocidos", kcal:109, protein:0.9, carbs:25,  fat:0.2  },
  { cat:"carbohidrato", name:"Tallarines cocidos",      kcal:138, protein:5.4, carbs:27,  fat:1.4  },
  { cat:"carbohidrato", name:"Ñoquis cocidos",          kcal:130, protein:3.5, carbs:27,  fat:1    },
  { cat:"carbohidrato", name:"Quinoa cocida",           kcal:120, protein:4.4, carbs:21,  fat:1.9  },
  { cat:"carbohidrato", name:"Polenta cocida",          kcal:70,  protein:1.6, carbs:15,  fat:0.3  },
  { cat:"carbohidrato", name:"Cuscús cocido",           kcal:112, protein:3.8, carbs:23,  fat:0.2  },
  { cat:"carbohidrato", name:"Mijo cocido",             kcal:119, protein:3.5, carbs:23,  fat:1    },
  { cat:"carbohidrato", name:"Chipa (c/u)",             kcal:100, protein:3,   carbs:13,  fat:4,   unit:true, unitWeight:40 },
  { cat:"carbohidrato", name:"Maíz cocido",             kcal:108, protein:3.4, carbs:23,  fat:1.3  },
  { cat:"carbohidrato", name:"Miel (1 cda)",            kcal:64,  protein:0.1, carbs:17,  fat:0    },
  { cat:"carbohidrato", name:"Mermelada (1 cda)",       kcal:49,  protein:0.1, carbs:13,  fat:0    },
  { cat:"carbohidrato", name:"Dulce de leche (1 cda)",  kcal:70,  protein:1.5, carbs:13,  fat:1.5  },
  // ── Grasas saludables ────────────────────────────────────────
  { cat:"grasa", name:"Palta/aguacate",          kcal:160, protein:2,   carbs:9,   fat:15   },
  { cat:"grasa", name:"Almendras",               kcal:579, protein:21,  carbs:22,  fat:50   },
  { cat:"grasa", name:"Nueces",                  kcal:654, protein:15,  carbs:14,  fat:65   },
  { cat:"grasa", name:"Castañas de cajú",        kcal:553, protein:18,  carbs:30,  fat:44   },
  { cat:"grasa", name:"Maní tostado",            kcal:585, protein:24,  carbs:16,  fat:50   },
  { cat:"grasa", name:"Mantequilla de maní",     kcal:588, protein:25,  carbs:20,  fat:50   },
  { cat:"grasa", name:"Pasta de almendras",      kcal:614, protein:21,  carbs:19,  fat:56   },
  { cat:"grasa", name:"Aceite de oliva",         kcal:884, protein:0,   carbs:0,   fat:100  },
  { cat:"grasa", name:"Aceite de coco",          kcal:862, protein:0,   carbs:0,   fat:100  },
  { cat:"grasa", name:"Aceite de girasol",       kcal:884, protein:0,   carbs:0,   fat:100  },
  { cat:"grasa", name:"Semillas de chía",        kcal:486, protein:17,  carbs:42,  fat:31   },
  { cat:"grasa", name:"Semillas de lino",        kcal:534, protein:18,  carbs:29,  fat:42   },
  { cat:"grasa", name:"Semillas de girasol",     kcal:584, protein:21,  carbs:20,  fat:51   },
  { cat:"grasa", name:"Semillas de calabaza",    kcal:559, protein:30,  carbs:11,  fat:49   },
  { cat:"grasa", name:"Pistacho (30g)",          kcal:173, protein:6,   carbs:9,   fat:14   },
  { cat:"grasa", name:"Aceitunas (10 unid)",     kcal:59,  protein:0.4, carbs:1.6, fat:6    },
  // ── Legumbres ────────────────────────────────────────────────
  { cat:"legumbre", name:"Lentejas cocidas",        kcal:116, protein:9,   carbs:20,  fat:0.4  },
  { cat:"legumbre", name:"Garbanzos cocidos",       kcal:164, protein:8.9, carbs:27,  fat:2.6  },
  { cat:"legumbre", name:"Porotos negros cocidos",  kcal:132, protein:8.9, carbs:24,  fat:0.5  },
  { cat:"legumbre", name:"Porotos blancos cocidos", kcal:139, protein:9.7, carbs:25,  fat:0.5  },
  { cat:"legumbre", name:"Porotos colorados",       kcal:127, protein:8.7, carbs:23,  fat:0.5  },
  { cat:"legumbre", name:"Edamame",                 kcal:122, protein:11,  carbs:10,  fat:5    },
  { cat:"legumbre", name:"Arvejas cocidas",         kcal:81,  protein:5.4, carbs:14,  fat:0.4  },
  { cat:"legumbre", name:"Soja cocida",             kcal:173, protein:17,  carbs:10,  fat:9    },
  { cat:"legumbre", name:"Hummus (100g)",           kcal:177, protein:8,   carbs:20,  fat:8    },
  // ── Frutas ───────────────────────────────────────────────────
  { cat:"fruta", name:"Banana",           kcal:89,  protein:1.1, carbs:23,  fat:0.3, unit:true, unitWeight:120 },
  { cat:"fruta", name:"Manzana",          kcal:52,  protein:0.3, carbs:14,  fat:0.2, unit:true, unitWeight:150 },
  { cat:"fruta", name:"Naranja",          kcal:47,  protein:0.9, carbs:12,  fat:0.1, unit:true, unitWeight:180 },
  { cat:"fruta", name:"Pera",             kcal:57,  protein:0.4, carbs:15,  fat:0.1, unit:true, unitWeight:160 },
  { cat:"fruta", name:"Mandarina",        kcal:53,  protein:0.8, carbs:13,  fat:0.3, unit:true, unitWeight:100 },
  { cat:"fruta", name:"Pomelo",           kcal:42,  protein:0.8, carbs:11,  fat:0.1, unit:true, unitWeight:250 },
  { cat:"fruta", name:"Limón",            kcal:29,  protein:1.1, carbs:9,   fat:0.3, unit:true, unitWeight:80  },
  { cat:"fruta", name:"Uvas",             kcal:69,  protein:0.7, carbs:18,  fat:0.2  },
  { cat:"fruta", name:"Sandía",           kcal:30,  protein:0.6, carbs:8,   fat:0.2  },
  { cat:"fruta", name:"Melón",            kcal:34,  protein:0.8, carbs:8,   fat:0.2  },
  { cat:"fruta", name:"Durazno",          kcal:39,  protein:0.9, carbs:10,  fat:0.3, unit:true, unitWeight:130 },
  { cat:"fruta", name:"Kiwi",             kcal:61,  protein:1.1, carbs:15,  fat:0.5, unit:true, unitWeight:90  },
  { cat:"fruta", name:"Frutillas",        kcal:32,  protein:0.7, carbs:8,   fat:0.3  },
  { cat:"fruta", name:"Arándanos",        kcal:57,  protein:0.7, carbs:14,  fat:0.3  },
  { cat:"fruta", name:"Frambuesas",       kcal:52,  protein:1.2, carbs:12,  fat:0.7  },
  { cat:"fruta", name:"Ciruela",          kcal:46,  protein:0.7, carbs:11,  fat:0.3, unit:true, unitWeight:65  },
  { cat:"fruta", name:"Cereza",           kcal:63,  protein:1.1, carbs:16,  fat:0.2  },
  { cat:"fruta", name:"Ananá/Piña",       kcal:50,  protein:0.5, carbs:13,  fat:0.1  },
  { cat:"fruta", name:"Mango",            kcal:60,  protein:0.8, carbs:15,  fat:0.4  },
  { cat:"fruta", name:"Papaya",           kcal:43,  protein:0.5, carbs:11,  fat:0.3  },
  { cat:"fruta", name:"Higo",             kcal:74,  protein:0.8, carbs:19,  fat:0.3, unit:true, unitWeight:50  },
  { cat:"fruta", name:"Maracuyá",         kcal:97,  protein:2.2, carbs:23,  fat:0.7  },
  { cat:"fruta", name:"Uva pasa (30g)",   kcal:85,  protein:0.9, carbs:22,  fat:0.1  },
  { cat:"fruta", name:"Coco rallado (30g)",kcal:100, protein:1,  carbs:4,   fat:9    },
  // ── Verduras ─────────────────────────────────────────────────
  { cat:"verdura", name:"Brócoli",              kcal:34,  protein:2.8, carbs:7,   fat:0.4  },
  { cat:"verdura", name:"Espinaca",             kcal:23,  protein:2.9, carbs:3.6, fat:0.4  },
  { cat:"verdura", name:"Kale",                 kcal:49,  protein:4.3, carbs:9,   fat:0.9  },
  { cat:"verdura", name:"Rúcula",               kcal:25,  protein:2.6, carbs:3.7, fat:0.7  },
  { cat:"verdura", name:"Lechuga",              kcal:15,  protein:1.4, carbs:2.9, fat:0.2  },
  { cat:"verdura", name:"Acelga",               kcal:19,  protein:1.8, carbs:3.7, fat:0.2  },
  { cat:"verdura", name:"Tomate",               kcal:18,  protein:0.9, carbs:3.9, fat:0.2  },
  { cat:"verdura", name:"Tomate cherry",        kcal:18,  protein:0.9, carbs:3.9, fat:0.2  },
  { cat:"verdura", name:"Pepino",               kcal:16,  protein:0.7, carbs:3.6, fat:0.1  },
  { cat:"verdura", name:"Zanahoria",            kcal:41,  protein:0.9, carbs:10,  fat:0.2  },
  { cat:"verdura", name:"Remolacha",            kcal:43,  protein:1.6, carbs:10,  fat:0.2  },
  { cat:"verdura", name:"Cebolla",              kcal:40,  protein:1.1, carbs:9,   fat:0.1  },
  { cat:"verdura", name:"Puerro",               kcal:61,  protein:1.5, carbs:14,  fat:0.3  },
  { cat:"verdura", name:"Ajo",                  kcal:149, protein:6.4, carbs:33,  fat:0.5  },
  { cat:"verdura", name:"Pimiento rojo",        kcal:31,  protein:1,   carbs:6,   fat:0.3  },
  { cat:"verdura", name:"Pimiento verde",       kcal:20,  protein:0.9, carbs:4.6, fat:0.2  },
  { cat:"verdura", name:"Berenjena",            kcal:25,  protein:1,   carbs:6,   fat:0.2  },
  { cat:"verdura", name:"Zucchini",             kcal:17,  protein:1.2, carbs:3.1, fat:0.3  },
  { cat:"verdura", name:"Zapallo",              kcal:26,  protein:1,   carbs:6.5, fat:0.1  },
  { cat:"verdura", name:"Cabutia/Zapallo anco", kcal:40,  protein:1,   carbs:10,  fat:0.1  },
  { cat:"verdura", name:"Zapallo tronco",       kcal:22,  protein:0.8, carbs:5.5, fat:0.1  },
  { cat:"verdura", name:"Zapallito de tronco",  kcal:17,  protein:1.2, carbs:3.1, fat:0.3  },
  { cat:"verdura", name:"Coliflor",             kcal:25,  protein:1.9, carbs:5,   fat:0.3  },
  { cat:"verdura", name:"Repollo",              kcal:25,  protein:1.3, carbs:5.8, fat:0.1  },
  { cat:"verdura", name:"Apio",                 kcal:16,  protein:0.7, carbs:3,   fat:0.2  },
  { cat:"verdura", name:"Champiñón",            kcal:22,  protein:3.1, carbs:3.3, fat:0.3  },
  { cat:"verdura", name:"Chaucha (poroto verde)",kcal:31, protein:1.8, carbs:7,   fat:0.2  },
  { cat:"verdura", name:"Arvejas frescas",      kcal:81,  protein:5.4, carbs:14,  fat:0.4  },
  { cat:"verdura", name:"Choclo desgranado",    kcal:96,  protein:3.4, carbs:21,  fat:1.5  },
  { cat:"verdura", name:"Espárrago",            kcal:20,  protein:2.2, carbs:3.9, fat:0.1  },
  { cat:"verdura", name:"Alcaucil",             kcal:47,  protein:3.3, carbs:11,  fat:0.2  },
  { cat:"verdura", name:"Palmito",              kcal:20,  protein:2,   carbs:3,   fat:0.2  },
  { cat:"verdura", name:"Rábano",               kcal:16,  protein:0.7, carbs:3.4, fat:0.1  },
  // ── Desayunos ────────────────────────────────────────────────
  { cat:"desayuno", name:"Medialunas (c/u)",            kcal:160, protein:3.5, carbs:22,  fat:6.5, unit:true, unitWeight:50  },
  { cat:"desayuno", name:"Medialunas de manteca (x2)",  kcal:320, protein:7,   carbs:44,  fat:13,  unit:true, unitWeight:100 },
  { cat:"desayuno", name:"Tostadas con mermelada",      kcal:195, protein:3.5, carbs:38,  fat:2    },
  { cat:"desayuno", name:"Tostadas con manteca",        kcal:220, protein:4,   carbs:30,  fat:9    },
  { cat:"desayuno", name:"Tostada con palta",           kcal:210, protein:4.5, carbs:22,  fat:11   },
  { cat:"desayuno", name:"Tostada proteica (pan+huevo+queso)",kcal:280,protein:18,carbs:28,fat:10  },
  { cat:"desayuno", name:"Avena con frutas y miel",     kcal:130, protein:4.5, carbs:24,  fat:2.5  },
  { cat:"desayuno", name:"Avena overnight (150g)",      kcal:200, protein:9,   carbs:32,  fat:5    },
  { cat:"desayuno", name:"Yogur con granola",            kcal:230, protein:8,   carbs:32,  fat:8    },
  { cat:"desayuno", name:"Yogur griego con granola",     kcal:240, protein:11,  carbs:28,  fat:9    },
  { cat:"desayuno", name:"Yogur con granola y frutas",   kcal:270, protein:9,   carbs:38,  fat:8    },
  { cat:"desayuno", name:"Granola con yogur",            kcal:280, protein:8,   carbs:38,  fat:10   },
  { cat:"desayuno", name:"Granola (30g)",               kcal:132, protein:3,   carbs:20,  fat:5    },
  { cat:"desayuno", name:"Desayuno completo (avena+leche+banana)",kcal:350,protein:14,carbs:62,fat:5 },
  { cat:"desayuno", name:"Licuado de proteínas",        kcal:250, protein:28,  carbs:20,  fat:4    },
  { cat:"desayuno", name:"Licuado de banana y leche",   kcal:220, protein:7,   carbs:38,  fat:4    },
  { cat:"desayuno", name:"Omelette (2 huevos+queso)",   kcal:220, protein:18,  carbs:2,   fat:15   },
  { cat:"desayuno", name:"Revuelto de huevos (2)",      kcal:185, protein:14,  carbs:1.5, fat:14   },
  { cat:"desayuno", name:"Huevos revueltos con verduras",kcal:170,protein:13,  carbs:4,   fat:11   },
  { cat:"desayuno", name:"Panqueques (x2)",             kcal:280, protein:9,   carbs:40,  fat:9,   unit:true, unitWeight:100 },
  { cat:"desayuno", name:"Panqueques proteicos (x2)",   kcal:240, protein:16,  carbs:28,  fat:8,   unit:true, unitWeight:100 },
  { cat:"desayuno", name:"French toast (x2 rebanadas)", kcal:320, protein:12,  carbs:42,  fat:11   },
  { cat:"desayuno", name:"Muffin proteico",             kcal:210, protein:15,  carbs:22,  fat:7,   unit:true, unitWeight:80  },
  { cat:"desayuno", name:"Bowl de fruta con yogur",     kcal:140, protein:7,   carbs:24,  fat:2    },
  { cat:"desayuno", name:"Chia pudding (150g)",         kcal:210, protein:7,   carbs:18,  fat:13   },
  { cat:"desayuno", name:"Smoothie verde (espinaca+banana)",kcal:180,protein:6,carbs:32,  fat:3    },
  { cat:"desayuno", name:"Café con leche (200ml)",      kcal:64,  protein:4,   carbs:6,   fat:2    },
  { cat:"desayuno", name:"Mate cocido con leche",       kcal:55,  protein:3.5, carbs:5.5, fat:2    },
  // ── Meriendas ────────────────────────────────────────────────
  { cat:"merienda", name:"Facturas dulces (c/u)",       kcal:180, protein:3,   carbs:25,  fat:8,   unit:true, unitWeight:60  },
  { cat:"merienda", name:"Alfajor de chocolate",        kcal:350, protein:4,   carbs:50,  fat:14,  unit:true, unitWeight:50  },
  { cat:"merienda", name:"Alfajor triple",              kcal:380, protein:5,   carbs:54,  fat:15,  unit:true, unitWeight:65  },
  { cat:"merienda", name:"Alfajor de maicena",          kcal:220, protein:3,   carbs:38,  fat:6,   unit:true, unitWeight:45  },
  { cat:"merienda", name:"Galletitas de agua (c/u)",    kcal:21,  protein:0.5, carbs:3.5, fat:0.5, unit:true, unitWeight:8   },
  { cat:"merienda", name:"Galletitas dulces (c/u)",     kcal:45,  protein:0.6, carbs:6.5, fat:1.8, unit:true, unitWeight:12  },
  { cat:"merienda", name:"Galletitas de arroz (c/u)",   kcal:35,  protein:0.7, carbs:7.5, fat:0.3, unit:true, unitWeight:10  },
  { cat:"merienda", name:"Budín (porción 60g)",         kcal:220, protein:3.5, carbs:32,  fat:9    },
  { cat:"merienda", name:"Bizcochuelo (porción)",       kcal:230, protein:4,   carbs:34,  fat:9    },
  { cat:"merienda", name:"Muffin (c/u)",                kcal:270, protein:4,   carbs:38,  fat:11,  unit:true, unitWeight:80  },
  { cat:"merienda", name:"Bizcochitos de grasa",        kcal:450, protein:9,   carbs:60,  fat:20   },
  { cat:"merienda", name:"Barritas de cereal",          kcal:120, protein:2,   carbs:22,  fat:3,   unit:true, unitWeight:28  },
  { cat:"merienda", name:"Barra de proteínas",          kcal:200, protein:20,  carbs:18,  fat:6,   unit:true, unitWeight:60  },
  { cat:"merienda", name:"Tostado de jamón y queso",    kcal:340, protein:16,  carbs:32,  fat:14,  unit:true, unitWeight:140 },
  { cat:"merienda", name:"Turrón (30g)",                kcal:130, protein:3,   carbs:19,  fat:5    },
  { cat:"merienda", name:"Facturas de hojaldre (c/u)",  kcal:200, protein:3,   carbs:24,  fat:10,  unit:true, unitWeight:65  },
  { cat:"merienda", name:"Torta casera (porción)",      kcal:300, protein:4,   carbs:42,  fat:13   },
  { cat:"merienda", name:"Yogur con frutas",            kcal:120, protein:5,   carbs:20,  fat:2    },
  { cat:"merienda", name:"Fruta con queso (porción)",   kcal:130, protein:7,   carbs:16,  fat:4    },
  // ── Colaciones ───────────────────────────────────────────────
  { cat:"colacion", name:"Huevo duro",                  kcal:85,  protein:7,   carbs:0.5, fat:6,   unit:true, unitWeight:55  },
  { cat:"colacion", name:"Yogur griego + 1 fruta",      kcal:130, protein:10,  carbs:18,  fat:1    },
  { cat:"colacion", name:"Maní tostado (30g)",          kcal:176, protein:7,   carbs:5,   fat:15   },
  { cat:"colacion", name:"Mix de frutas secas (30g)",   kcal:175, protein:5,   carbs:8,   fat:14   },
  { cat:"colacion", name:"Pistacho (30g)",              kcal:173, protein:6,   carbs:9,   fat:14   },
  { cat:"colacion", name:"Hummus con verduras crudas",  kcal:120, protein:5,   carbs:14,  fat:5    },
  { cat:"colacion", name:"Hummus con pita",             kcal:220, protein:7,   carbs:32,  fat:8    },
  { cat:"colacion", name:"Queso cottage (150g)",        kcal:147, protein:17,  carbs:5,   fat:7    },
  { cat:"colacion", name:"Edamame (100g)",              kcal:122, protein:11,  carbs:10,  fat:5    },
  { cat:"colacion", name:"Fruta + mantequilla de maní", kcal:185, protein:5,   carbs:22,  fat:9    },
  { cat:"colacion", name:"Palta con limón (½)",         kcal:120, protein:1.5, carbs:6,   fat:11   },
  { cat:"colacion", name:"Arroz con leche (150g)",      kcal:185, protein:5,   carbs:34,  fat:3.5  },
  { cat:"colacion", name:"Chocolate amargo (20g)",      kcal:114, protein:1.8, carbs:9,   fat:8    },
  { cat:"colacion", name:"Chips de papa (30g)",         kcal:160, protein:2,   carbs:15,  fat:10   },
  { cat:"colacion", name:"Palomitas/pochoclos (30g)",   kcal:110, protein:3,   carbs:19,  fat:3    },
  { cat:"colacion", name:"Dátiles (3 unid)",            kcal:66,  protein:0.5, carbs:18,  fat:0.1  },
  { cat:"colacion", name:"Pepino con hummus",           kcal:65,  protein:3,   carbs:9,   fat:2.5  },
  { cat:"colacion", name:"Chips de arroz (15g)",        kcal:57,  protein:1,   carbs:12,  fat:0.4  },
  { cat:"colacion", name:"Chocolate con leche (20g)",   kcal:107, protein:1.5, carbs:12,  fat:6    },
  // ── Entradas ─────────────────────────────────────────────────
  { cat:"entrada", name:"Ensalada mixta c/huevo",      kcal:85,  protein:7,   carbs:5,   fat:4    },
  { cat:"entrada", name:"Ensalada César (sin pollo)",  kcal:140, protein:5,   carbs:10,  fat:9    },
  { cat:"entrada", name:"Ensalada caprese",            kcal:180, protein:10,  carbs:5,   fat:13   },
  { cat:"entrada", name:"Tabla de fiambres",           kcal:280, protein:16,  carbs:2,   fat:24   },
  { cat:"entrada", name:"Bruschetta (2 piezas)",       kcal:180, protein:5,   carbs:28,  fat:5    },
  { cat:"entrada", name:"Empanada de carne",           kcal:290, protein:12,  carbs:28,  fat:14,  unit:true, unitWeight:110 },
  { cat:"entrada", name:"Empanada de jamón y queso",   kcal:310, protein:14,  carbs:30,  fat:14,  unit:true, unitWeight:110 },
  { cat:"entrada", name:"Empanada de verdura",         kcal:250, protein:7,   carbs:30,  fat:11,  unit:true, unitWeight:100 },
  { cat:"entrada", name:"Empanada de humita",          kcal:240, protein:6,   carbs:34,  fat:9,   unit:true, unitWeight:100 },
  { cat:"entrada", name:"Provoleta (100g)",            kcal:320, protein:22,  carbs:1,   fat:26   },
  { cat:"entrada", name:"Tabla de quesos",             kcal:350, protein:20,  carbs:3,   fat:29   },
  { cat:"entrada", name:"Sopa de verduras",            kcal:45,  protein:2,   carbs:8,   fat:0.5  },
  { cat:"entrada", name:"Caldo de pollo (250ml)",      kcal:30,  protein:3,   carbs:2,   fat:1    },
  { cat:"entrada", name:"Sopa de tomate (200ml)",      kcal:70,  protein:2,   carbs:12,  fat:1.5  },
  { cat:"entrada", name:"Sopa de lentejas (200ml)",    kcal:130, protein:8,   carbs:18,  fat:2    },
  { cat:"entrada", name:"Gazpacho (200ml)",            kcal:50,  protein:1.5, carbs:10,  fat:0.5  },
  { cat:"entrada", name:"Ceviche (150g)",              kcal:100, protein:14,  carbs:8,   fat:1    },
  { cat:"entrada", name:"Croquetas de papa (x3)",      kcal:210, protein:4,   carbs:28,  fat:9    },
  { cat:"entrada", name:"Sopa paraguaya (porción)",    kcal:280, protein:8,   carbs:32,  fat:13   },
  { cat:"entrada", name:"Tabla de verduras asadas",    kcal:90,  protein:2.5, carbs:15,  fat:3    },
  { cat:"entrada", name:"Canelones de ricota",         kcal:210, protein:9,   carbs:22,  fat:9    },
  // ── Platos principales ───────────────────────────────────────
  { cat:"principal", name:"Milanesa de carne (200g)",    kcal:500, protein:40,  carbs:24,  fat:24   },
  { cat:"principal", name:"Milanesa de pollo (200g)",    kcal:466, protein:44,  carbs:22,  fat:20   },
  { cat:"principal", name:"Milanesa napolitana",         kcal:310, protein:20,  carbs:14,  fat:18   },
  { cat:"principal", name:"Milanesa con papas fritas",   kcal:290, protein:16,  carbs:22,  fat:15   },
  { cat:"principal", name:"Milanesa de berenjena",       kcal:220, protein:6,   carbs:24,  fat:11   },
  { cat:"principal", name:"Asado (costilla, 200g)",      kcal:620, protein:46,  carbs:0,   fat:48   },
  { cat:"principal", name:"Arroz con pollo",             kcal:152, protein:12,  carbs:18,  fat:3    },
  { cat:"principal", name:"Arroz con carne molida",      kcal:165, protein:13,  carbs:19,  fat:5    },
  { cat:"principal", name:"Arroz con verduras",          kcal:135, protein:4,   carbs:25,  fat:2    },
  { cat:"principal", name:"Pollo al horno con papa",     kcal:155, protein:14,  carbs:14,  fat:4.5  },
  { cat:"principal", name:"Pollo al verdeo",             kcal:190, protein:20,  carbs:4,   fat:10   },
  { cat:"principal", name:"Pollo a la cacerola",         kcal:175, protein:18,  carbs:6,   fat:8    },
  { cat:"principal", name:"Pollo al limón",              kcal:160, protein:20,  carbs:3,   fat:7    },
  { cat:"principal", name:"Pollo teriyaki con arroz",    kcal:210, protein:18,  carbs:25,  fat:4    },
  { cat:"principal", name:"Fideos con salsa bolognesa",  kcal:180, protein:10,  carbs:22,  fat:5    },
  { cat:"principal", name:"Fideos con manteca",          kcal:200, protein:6,   carbs:28,  fat:7    },
  { cat:"principal", name:"Tallarines con pesto",        kcal:210, protein:7,   carbs:26,  fat:9    },
  { cat:"principal", name:"Ñoquis con salsa",            kcal:190, protein:6,   carbs:30,  fat:5    },
  { cat:"principal", name:"Ravioles de carne",           kcal:220, protein:11,  carbs:26,  fat:7    },
  { cat:"principal", name:"Canelones de carne",          kcal:230, protein:14,  carbs:20,  fat:9    },
  { cat:"principal", name:"Lasaña de carne",             kcal:250, protein:15,  carbs:22,  fat:11   },
  { cat:"principal", name:"Pizza mozzarella (porción)",  kcal:272, protein:12,  carbs:32,  fat:10   },
  { cat:"principal", name:"Hamburguesa casera s/pan",    kcal:290, protein:26,  carbs:0,   fat:20,  unit:true, unitWeight:120 },
  { cat:"principal", name:"Hamburguesa completa",        kcal:550, protein:28,  carbs:40,  fat:28,  unit:true, unitWeight:200 },
  { cat:"principal", name:"Sándwich de milanesa",        kcal:420, protein:28,  carbs:38,  fat:14,  unit:true, unitWeight:220 },
  { cat:"principal", name:"Sándwich de pollo y lechuga", kcal:280, protein:22,  carbs:28,  fat:8,   unit:true, unitWeight:160 },
  { cat:"principal", name:"Sándwich de jamón y queso",   kcal:310, protein:18,  carbs:30,  fat:12,  unit:true, unitWeight:150 },
  { cat:"principal", name:"Sándwich de atún",            kcal:265, protein:20,  carbs:28,  fat:7,   unit:true, unitWeight:150 },
  { cat:"principal", name:"Tarta de verduras (porción)", kcal:220, protein:7,   carbs:20,  fat:12,  unit:true, unitWeight:150 },
  { cat:"principal", name:"Tarta de jamón y queso",      kcal:280, protein:12,  carbs:22,  fat:16,  unit:true, unitWeight:170 },
  { cat:"principal", name:"Tarta de pollo (porción)",    kcal:260, protein:14,  carbs:20,  fat:13,  unit:true, unitWeight:160 },
  { cat:"principal", name:"Tarta de atún",               kcal:245, protein:15,  carbs:20,  fat:11,  unit:true, unitWeight:155 },
  { cat:"principal", name:"Tarta de zapallitos",         kcal:195, protein:7,   carbs:18,  fat:10,  unit:true, unitWeight:145 },
  { cat:"principal", name:"Tarta de acelga",             kcal:200, protein:8,   carbs:19,  fat:10,  unit:true, unitWeight:150 },
  { cat:"principal", name:"Pizza mozzarella (porción)",  kcal:272, protein:12,  carbs:32,  fat:10,  unit:true, unitWeight:120 },
  { cat:"principal", name:"Pizza de jamón y morrón",     kcal:290, protein:13,  carbs:33,  fat:11,  unit:true, unitWeight:125 },
  { cat:"principal", name:"Pizza fugazzeta (porción)",   kcal:300, protein:11,  carbs:35,  fat:12,  unit:true, unitWeight:130 },
  { cat:"principal", name:"Pizza de calabresa",          kcal:285, protein:12,  carbs:32,  fat:12,  unit:true, unitWeight:125 },
  { cat:"principal", name:"Choripán",                    kcal:480, protein:18,  carbs:36,  fat:28,  unit:true, unitWeight:180 },
  { cat:"principal", name:"Pebete de jamón",             kcal:300, protein:14,  carbs:34,  fat:11,  unit:true, unitWeight:140 },
  { cat:"principal", name:"Tortilla de papas (porción)", kcal:195, protein:9,   carbs:18,  fat:9,   unit:true, unitWeight:130 },
  { cat:"principal", name:"Sándwich de lomito",          kcal:480, protein:30,  carbs:40,  fat:20,  unit:true, unitWeight:230 },
  { cat:"principal", name:"Sándwich club",               kcal:420, protein:25,  carbs:36,  fat:18,  unit:true, unitWeight:200 },
  { cat:"principal", name:"Sándwich de pavita",          kcal:270, protein:20,  carbs:28,  fat:8,   unit:true, unitWeight:155 },
  { cat:"principal", name:"Sándwich de roast beef",      kcal:380, protein:28,  carbs:32,  fat:14,  unit:true, unitWeight:190 },
  { cat:"principal", name:"Sándwich de queso y tomate",  kcal:240, protein:10,  carbs:30,  fat:9,   unit:true, unitWeight:140 },
  { cat:"principal", name:"Locro (plato 300g)",          kcal:270, protein:14,  carbs:30,  fat:9    },
  { cat:"principal", name:"Guiso de lentejas",           kcal:130, protein:8,   carbs:18,  fat:3    },
  { cat:"principal", name:"Guiso de arroz con pollo",    kcal:155, protein:12,  carbs:20,  fat:4    },
  { cat:"principal", name:"Estofado de res",             kcal:195, protein:18,  carbs:12,  fat:8    },
  { cat:"principal", name:"Curry de pollo",              kcal:185, protein:17,  carbs:10,  fat:8    },
  { cat:"principal", name:"Carbonada",                   kcal:170, protein:10,  carbs:20,  fat:6    },
  { cat:"principal", name:"Cazuela de mariscos",         kcal:145, protein:14,  carbs:10,  fat:5    },
  { cat:"principal", name:"Salmón al horno (200g)",      kcal:416, protein:40,  carbs:0,   fat:26   },
  { cat:"principal", name:"Pescado a la plancha (200g)", kcal:164, protein:34,  carbs:0,   fat:2    },
  { cat:"principal", name:"Puré de papas (con leche)",   kcal:104, protein:2.5, carbs:19,  fat:2.5  },
  { cat:"principal", name:"Bowl de arroz y atún",        kcal:148, protein:15,  carbs:18,  fat:1.5  },
  { cat:"principal", name:"Bowl proteico (arroz+pollo+verdura)", kcal:185, protein:22, carbs:20, fat:3 },
  { cat:"principal", name:"Ensalada de pollo",           kcal:135, protein:15,  carbs:6,   fat:5    },
  { cat:"principal", name:"Wok de verduras con pollo",   kcal:118, protein:13,  carbs:8,   fat:3.5  },
  { cat:"principal", name:"Wrap de pollo",               kcal:230, protein:18,  carbs:24,  fat:6,   unit:true, unitWeight:180 },
  { cat:"principal", name:"Shawarma/wrap árabe",         kcal:420, protein:22,  carbs:42,  fat:16,  unit:true, unitWeight:250 },
  { cat:"principal", name:"Burrito",                     kcal:490, protein:22,  carbs:60,  fat:16,  unit:true, unitWeight:280 },
  { cat:"principal", name:"Sushi (6 piezas)",            kcal:250, protein:12,  carbs:45,  fat:2    },
  { cat:"principal", name:"Risotto de champiñones",      kcal:180, protein:5,   carbs:28,  fat:6    },
  { cat:"principal", name:"Paella de mariscos",          kcal:165, protein:12,  carbs:22,  fat:4    },
  { cat:"principal", name:"Arroz con pollo y verduras",  kcal:148, protein:13,  carbs:17,  fat:3    },
  { cat:"principal", name:"Arroz con zapallo",           kcal:120, protein:2.5, carbs:26,  fat:0.5  },
  { cat:"principal", name:"Arroz con atún y maíz",       kcal:145, protein:13,  carbs:20,  fat:2    },
  { cat:"principal", name:"Fideos con salsa de tomate",  kcal:155, protein:5.5, carbs:28,  fat:2    },
  { cat:"principal", name:"Cazuela de pollo con verduras",kcal:160, protein:16,  carbs:12,  fat:5    },
  { cat:"principal", name:"Medallón de pollo (c/u)",     kcal:190, protein:20,  carbs:10,  fat:7,   unit:true, unitWeight:100 },
  { cat:"principal", name:"Nuggets de pollo (x6)",       kcal:290, protein:18,  carbs:22,  fat:14   },
  { cat:"principal", name:"Suprema a la Maryland",       kcal:380, protein:35,  carbs:20,  fat:16,  unit:true, unitWeight:200 },
  // ── Postres ──────────────────────────────────────────────────
  { cat:"postre", name:"Flan casero (porción)",        kcal:150, protein:5,   carbs:24,  fat:4    },
  { cat:"postre", name:"Flan con dulce de leche",      kcal:220, protein:5,   carbs:38,  fat:5    },
  { cat:"postre", name:"Mousse de chocolate",          kcal:260, protein:4,   carbs:28,  fat:15   },
  { cat:"postre", name:"Torta de chocolate (porción)", kcal:380, protein:5,   carbs:50,  fat:18   },
  { cat:"postre", name:"Torta de queso (porción)",     kcal:320, protein:6,   carbs:30,  fat:20   },
  { cat:"postre", name:"Torta de manzana (porción)",   kcal:280, protein:3,   carbs:42,  fat:11   },
  { cat:"postre", name:"Helado de crema (2 bochas)",   kcal:260, protein:4,   carbs:32,  fat:13   },
  { cat:"postre", name:"Helado de agua (palito)",      kcal:80,  protein:0,   carbs:20,  fat:0    },
  { cat:"postre", name:"Tiramisu (porción)",           kcal:330, protein:6,   carbs:36,  fat:18   },
  { cat:"postre", name:"Cheesecake (porción)",         kcal:350, protein:6,   carbs:32,  fat:23   },
  { cat:"postre", name:"Brownie (porción 50g)",        kcal:220, protein:3,   carbs:28,  fat:11   },
  { cat:"postre", name:"Muffin de chocolate",          kcal:280, protein:4,   carbs:38,  fat:12,  unit:true, unitWeight:80  },
  { cat:"postre", name:"Churros (3 unid)",             kcal:240, protein:4,   carbs:34,  fat:10   },
  { cat:"postre", name:"Palitos de dulce de leche (c/u)",kcal:70,protein:1,   carbs:11,  fat:2.5, unit:true, unitWeight:20  },
  { cat:"postre", name:"Arroz con leche (150g)",       kcal:185, protein:5,   carbs:34,  fat:3.5  },
  { cat:"postre", name:"Budín de pan (porción)",       kcal:230, protein:6,   carbs:38,  fat:7    },
  { cat:"postre", name:"Panqueques con dulce de leche",kcal:380, protein:9,   carbs:58,  fat:12   },
  { cat:"postre", name:"Ensalada de frutas (200g)",    kcal:100, protein:1.5, carbs:25,  fat:0.5  },
  { cat:"postre", name:"Dulce de membrillo (30g)",     kcal:78,  protein:0.2, carbs:20,  fat:0    },
  // ── Bebidas ──────────────────────────────────────────────────
  { cat:"bebida", name:"Café con leche (200ml)",       kcal:64,  protein:4,   carbs:6,   fat:2    },
  { cat:"bebida", name:"Mate cocido con leche",        kcal:55,  protein:3.5, carbs:5.5, fat:2    },
  { cat:"bebida", name:"Jugo de naranja natural",      kcal:45,  protein:0.7, carbs:10,  fat:0.2  },
  { cat:"bebida", name:"Jugo de manzana (200ml)",      kcal:90,  protein:0.2, carbs:23,  fat:0.2  },
  { cat:"bebida", name:"Jugo de mango (200ml)",        kcal:110, protein:0.8, carbs:26,  fat:0.4  },
  { cat:"bebida", name:"Leche chocolatada (250ml)",    kcal:160, protein:6,   carbs:27,  fat:3    },
  { cat:"bebida", name:"Batido de frutas (300ml)",     kcal:130, protein:2,   carbs:30,  fat:0.5  },
  { cat:"bebida", name:"Licuado de banana y leche",    kcal:220, protein:7,   carbs:38,  fat:4    },
  { cat:"bebida", name:"Gatorade/isotónica (500ml)",   kcal:140, protein:0,   carbs:35,  fat:0    },
  { cat:"bebida", name:"Agua con gas (500ml)",         kcal:0,   protein:0,   carbs:0,   fat:0    },
  { cat:"bebida", name:"Coca-Cola (350ml)",            kcal:140, protein:0,   carbs:39,  fat:0    },
  { cat:"bebida", name:"Coca-Cola Zero (350ml)",       kcal:1,   protein:0,   carbs:0,   fat:0    },
  { cat:"bebida", name:"Cerveza (330ml)",              kcal:155, protein:1.6, carbs:13,  fat:0    },
  { cat:"bebida", name:"Vino tinto (150ml)",           kcal:125, protein:0.1, carbs:4,   fat:0    },
  { cat:"bebida", name:"Vino blanco (150ml)",          kcal:121, protein:0.1, carbs:3.8, fat:0    },
  { cat:"bebida", name:"Té frío (500ml)",              kcal:60,  protein:0,   carbs:15,  fat:0    },
  // ── Suplementos ──────────────────────────────────────────────
  { cat:"suplemento", name:"Whey protein (scoop 30g)", kcal:120, protein:24,  carbs:3,   fat:2    },
  { cat:"suplemento", name:"Creatina (5g)",             kcal:0,   protein:0,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"BCAA (10g)",                kcal:40,  protein:9,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"Caseína (30g)",             kcal:110, protein:22,  carbs:4,   fat:1    },
  { cat:"suplemento", name:"Mass gainer (100g)",        kcal:380, protein:25,  carbs:60,  fat:4    },
  // ── Comidas rápidas ──────────────────────────────────────────
  { cat:"rapida", name:"Papas fritas (porción)",       kcal:320, protein:4,   carbs:40,  fat:16   },
  { cat:"rapida", name:"Pancho/hot dog",               kcal:310, protein:12,  carbs:28,  fat:17,  unit:true, unitWeight:120 },
  { cat:"rapida", name:"Taco",                         kcal:210, protein:10,  carbs:22,  fat:9,   unit:true, unitWeight:100 },
  { cat:"rapida", name:"Sándwich vegetal",             kcal:220, protein:8,   carbs:32,  fat:6,   unit:true, unitWeight:160 },
  { cat:"rapida", name:"Empanada frita (c/u)",         kcal:330, protein:11,  carbs:28,  fat:19,  unit:true, unitWeight:115 },
  { cat:"rapida", name:"Medialunas fritas (c/u)",      kcal:170, protein:3,   carbs:20,  fat:8.5, unit:true, unitWeight:55  },
  { cat:"rapida", name:"Sorrentinos de ricota (x4)",   kcal:280, protein:11,  carbs:36,  fat:9    },
  { cat:"rapida", name:"Porciones de pizza al corte",  kcal:270, protein:11,  carbs:33,  fat:10,  unit:true, unitWeight:120 },
  { cat:"rapida", name:"Hamburguesa doble (fast food)",kcal:590, protein:30,  carbs:44,  fat:30,  unit:true, unitWeight:230 },
  { cat:"rapida", name:"Pollo frito (presa c/u)",      kcal:290, protein:22,  carbs:12,  fat:17,  unit:true, unitWeight:130 },
  { cat:"rapida", name:"Papas en bastón al horno",     kcal:160, protein:2.5, carbs:26,  fat:5    },
  // ── Desayunos adicionales ─────────────────────────────────────
  { cat:"desayuno", name:"Bizcochos de grasa (c/u)",   kcal:130, protein:2.5, carbs:18,  fat:5.5, unit:true, unitWeight:45  },
  { cat:"desayuno", name:"Medialunas de grasa (c/u)",  kcal:145, protein:3,   carbs:19,  fat:6,   unit:true, unitWeight:45  },
  { cat:"desayuno", name:"Tostadas con ricota",        kcal:170, protein:8,   carbs:22,  fat:5    },
  { cat:"desayuno", name:"Tostadas con queso",         kcal:200, protein:9,   carbs:22,  fat:8    },
  { cat:"desayuno", name:"Bowl de yogur con granola",  kcal:260, protein:9,   carbs:36,  fat:8    },
  { cat:"desayuno", name:"Mate con galletas (3 unid)", kcal:90,  protein:1.5, carbs:14,  fat:3    },
  { cat:"desayuno", name:"Facturas surtidas (x2)",     kcal:360, protein:6,   carbs:50,  fat:16,  unit:true, unitWeight:120 },
  { cat:"desayuno", name:"Pan con dulce de leche",     kcal:210, protein:4,   carbs:38,  fat:4    },
  { cat:"desayuno", name:"Croissant (c/u)",            kcal:230, protein:4.5, carbs:26,  fat:12,  unit:true, unitWeight:80  },
  { cat:"desayuno", name:"Waffles (x2)",               kcal:310, protein:8,   carbs:42,  fat:12,  unit:true, unitWeight:130 },
  // ── Colaciones adicionales ─────────────────────────────────────
  { cat:"colacion", name:"Frutas secas mix (20g)",     kcal:114, protein:3,   carbs:6,   fat:9    },
  { cat:"colacion", name:"Barra de cereal y maní",     kcal:135, protein:3.5, carbs:20,  fat:5,   unit:true, unitWeight:35  },
  { cat:"colacion", name:"Galleta de arroz con maní",  kcal:95,  protein:3,   carbs:13,  fat:4    },
  { cat:"colacion", name:"Yogur bebible (200ml)",      kcal:120, protein:4.5, carbs:19,  fat:2    },
  { cat:"colacion", name:"Rollitos de pavo con queso", kcal:80,  protein:9,   carbs:1,   fat:4.5  },
  { cat:"colacion", name:"Manzana con manteca de maní",kcal:170, protein:3.5, carbs:22,  fat:8    },
  { cat:"colacion", name:"Aceitunas + queso (colación)",kcal:120, protein:5,   carbs:2,   fat:10   },
  { cat:"colacion", name:"Quesillo (50g)",             kcal:70,  protein:6.5, carbs:1,   fat:4.5  },
  { cat:"colacion", name:"Gelatina light (150g)",      kcal:15,  protein:3,   carbs:0.5, fat:0    },
  { cat:"colacion", name:"Palomitas sin sal (25g)",    kcal:95,  protein:2.5, carbs:17,  fat:2.5  },
  // ── Entradas adicionales ─────────────────────────────────────
  { cat:"entrada", name:"Empanada de espinaca y ricota",kcal:255, protein:8,  carbs:28,  fat:12,  unit:true, unitWeight:100 },
  { cat:"entrada", name:"Empanada caprese",            kcal:265, protein:9,   carbs:27,  fat:13,  unit:true, unitWeight:100 },
  { cat:"entrada", name:"Pasteles de carne (c/u)",     kcal:310, protein:12,  carbs:30,  fat:15,  unit:true, unitWeight:115 },
  { cat:"entrada", name:"Suprema napolitana s/pan",    kcal:340, protein:32,  carbs:10,  fat:18,  unit:true, unitWeight:180 },
  { cat:"entrada", name:"Ensalada de lentejas",        kcal:140, protein:8,   carbs:20,  fat:3    },
  { cat:"entrada", name:"Ensalada griega",             kcal:150, protein:5,   carbs:8,   fat:11   },
  { cat:"entrada", name:"Sopa de arvejas",             kcal:110, protein:6,   carbs:18,  fat:1.5  },
  { cat:"entrada", name:"Tortilla española (porción)", kcal:190, protein:8,   carbs:15,  fat:10,  unit:true, unitWeight:130 },
  // ── Postres adicionales ───────────────────────────────────────
  { cat:"postre", name:"Facturas de crema (c/u)",      kcal:220, protein:3.5, carbs:28,  fat:10,  unit:true, unitWeight:70  },
  { cat:"postre", name:"Medialunas rellenas (c/u)",    kcal:195, protein:4,   carbs:26,  fat:8,   unit:true, unitWeight:65  },
  { cat:"postre", name:"Vigilante (queso+dulce membrillo)",kcal:210,protein:8, carbs:24,  fat:9    },
  { cat:"postre", name:"Pastafrola (porción)",         kcal:280, protein:4,   carbs:40,  fat:12,  unit:true, unitWeight:100 },
  { cat:"postre", name:"Facturas de hojaldre+crema",   kcal:240, protein:3.5, carbs:26,  fat:14,  unit:true, unitWeight:80  },
  { cat:"postre", name:"Copa de helado (3 bochas)",    kcal:380, protein:6,   carbs:48,  fat:18   },
  { cat:"postre", name:"Profiterol (x3)",              kcal:270, protein:5,   carbs:28,  fat:15   },
  { cat:"postre", name:"Lemon pie (porción)",          kcal:320, protein:4,   carbs:46,  fat:13,  unit:true, unitWeight:120 },
  { cat:"postre", name:"Rogel (porción)",              kcal:350, protein:4.5, carbs:48,  fat:16,  unit:true, unitWeight:100 },
  { cat:"postre", name:"Chocotorta (porción)",         kcal:390, protein:5,   carbs:52,  fat:18,  unit:true, unitWeight:120 },
  { cat:"postre", name:"Budín de banana (porción)",    kcal:240, protein:3.5, carbs:36,  fat:9,   unit:true, unitWeight:90  },
  { cat:"postre", name:"Petit four / bombón (c/u)",    kcal:65,  protein:0.8, carbs:8,   fat:3.5, unit:true, unitWeight:18  },
  // ── Meriendas adicionales ─────────────────────────────────────
  { cat:"merienda", name:"Tostado de pavita",          kcal:310, protein:17,  carbs:30,  fat:12,  unit:true, unitWeight:140 },
  { cat:"merienda", name:"Tostado vegetal",            kcal:270, protein:10,  carbs:30,  fat:11,  unit:true, unitWeight:130 },
  { cat:"merienda", name:"Budín de naranja (porción)", kcal:240, protein:3.5, carbs:35,  fat:10   },
  { cat:"merienda", name:"Scone (c/u)",                kcal:210, protein:4,   carbs:28,  fat:9,   unit:true, unitWeight:70  },
  { cat:"merienda", name:"Bizcochitos de queso (x5)",  kcal:165, protein:4.5, carbs:20,  fat:7.5  },
  { cat:"merienda", name:"Wrap de queso y verdura",    kcal:200, protein:8,   carbs:24,  fat:7,   unit:true, unitWeight:130 },
  // ── Bebidas adicionales ───────────────────────────────────────
  { cat:"bebida", name:"Licuado verde (kale+pepino+manzana)",kcal:90,protein:2,carbs:20,  fat:0.5  },
  { cat:"bebida", name:"Smoothie de frutilla (300ml)", kcal:120, protein:2,   carbs:27,  fat:0.5  },
  { cat:"bebida", name:"Leche de avena+cacao (250ml)", kcal:145, protein:3.5, carbs:25,  fat:4    },
  { cat:"bebida", name:"Agua de coco (250ml)",         kcal:45,  protein:0.5, carbs:11,  fat:0.5  },
  { cat:"bebida", name:"Jugo de pomelo natural",       kcal:38,  protein:0.5, carbs:9,   fat:0.1  },
  { cat:"bebida", name:"Mate (sin azúcar)",            kcal:4,   protein:0.3, carbs:0.5, fat:0    },
  { cat:"bebida", name:"Té (sin azúcar)",              kcal:2,   protein:0,   carbs:0.4, fat:0    },
  { cat:"bebida", name:"Sprite/Fanta (350ml)",         kcal:142, protein:0,   carbs:38,  fat:0    },
  { cat:"bebida", name:"Jugo en caja (200ml)",         kcal:90,  protein:0.3, carbs:22,  fat:0    },
  // ── Suplementos adicionales ───────────────────────────────────
  { cat:"suplemento", name:"Colágeno hidrolizado (10g)",kcal:38, protein:9,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"Pre-entreno (1 scoop)",    kcal:20,  protein:2,   carbs:3,   fat:0    },
  { cat:"suplemento", name:"Glutamina (5g)",           kcal:20,  protein:5,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"Omega 3 (1g cápsula)",     kcal:9,   protein:0,   carbs:0,   fat:1    },
  { cat:"suplemento", name:"Proteína de arroz (30g)",  kcal:113, protein:22,  carbs:3,   fat:2    },
  { cat:"suplemento", name:"Proteína de guisante (30g)",kcal:110,protein:21,  carbs:4,   fat:1.5  },
];

// ─── Plan de alimentación generator ────────────────────────────────────────
const DAY_NAMES_PLAN = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const SLOT_DEFS = {
  3: [
    { id:"desayuno", label:"Desayuno", factor:0.30, cats:["desayuno","lacteo","fruta"] },
    { id:"almuerzo", label:"Almuerzo", factor:0.40, cats:["principal","proteina","carbohidrato","legumbre"] },
    { id:"cena",     label:"Cena",     factor:0.30, cats:["principal","proteina","verdura","legumbre"] },
  ],
  4: [
    { id:"desayuno", label:"Desayuno", factor:0.25, cats:["desayuno","lacteo","fruta"] },
    { id:"almuerzo", label:"Almuerzo", factor:0.35, cats:["principal","proteina","carbohidrato","legumbre"] },
    { id:"merienda", label:"Merienda",  factor:0.15, cats:["merienda","colacion","fruta","lacteo"] },
    { id:"cena",     label:"Cena",     factor:0.25, cats:["principal","proteina","verdura","legumbre"] },
  ],
  5: [
    { id:"desayuno", label:"Desayuno",  factor:0.20, cats:["desayuno","lacteo","fruta"] },
    { id:"almuerzo", label:"Almuerzo",  factor:0.30, cats:["principal","proteina","carbohidrato","legumbre"] },
    { id:"colacion", label:"Colación",  factor:0.12, cats:["colacion","fruta","lacteo"] },
    { id:"merienda", label:"Merienda",  factor:0.13, cats:["merienda","colacion","fruta"] },
    { id:"cena",     label:"Cena",      factor:0.25, cats:["principal","proteina","verdura","legumbre"] },
  ],
  6: [
    { id:"desayuno", label:"Desayuno",    factor:0.18, cats:["desayuno","lacteo","fruta"] },
    { id:"colacion1",label:"Colación AM", factor:0.10, cats:["colacion","fruta"] },
    { id:"almuerzo", label:"Almuerzo",    factor:0.28, cats:["principal","proteina","carbohidrato"] },
    { id:"merienda", label:"Merienda",     factor:0.12, cats:["merienda","colacion","fruta","lacteo"] },
    { id:"colacion2",label:"Colación PM", factor:0.10, cats:["colacion","proteina"] },
    { id:"cena",     label:"Cena",        factor:0.22, cats:["principal","proteina","verdura","legumbre"] },
  ],
};

function cleanFoodName(name) {
  // Strip trailing parenthetical quantities: "(200g)", "(x2 rebanadas)", "(porción)", etc.
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function generateNutritionPlan(config, tdee, targetCal, proteinG, carbG, fatG) {
  const { days, mealsPerDay, goal, restrictions, likedCats, allergies, cuisine, seed } = config;
  const slots = SLOT_DEFS[mealsPerDay] || SLOT_DEFS[4];

  const MEAT_KEYWORDS = ["pollo","carne","pavo","cerdo","jamón","salame","vacío","entraña","asado","bife","lomo","cuadril","nalga","tapa","costilla","chorizo","lomito","roast beef"];
  const GLUTEN_KEYWORDS = ["pan","pasta","fideos","tallarines","ñoquis","ravioles","canelones","lasaña","tostada","alfajor","galletita","medialunas","bizcochuelo","pizza","empanada","galleta","galletón","cracker","pancho","panecillo","panqueque","panqueque","panque", "sémola", "cuscús", "trigo", "cebada", "centeno", "avena", "espelta"];
  const ALLERGEN_KEYWORDS = {
    frutos_secos: ["nuez","almendra","cacahuate","maní","mani","castaña","avellana","pistacho","pecán","pecan","macadamia","nueces","nueces de","crema de maní","crema de cacahuate","manteca de maní","crema de almendras","pasta de maní"],
    huevo: ["huevo","huevos","omelette","tortilla","mayonesa","mayonesa","merengue","flan","budín","budin","crema pastelera","crema de huevo","clara de huevo","yema"],
    pescado: ["pescado","pescados","merluza","salmón","atún","caballa","jurel","corvina","lenguado","brótola","trucha","abadejo","bacalao","rape","pejerrey"],
    mariscos: ["camarón","camarones","langostino","langosta","cangrejo","mejillón","mejillones","almeja","almejas","pulpo","calamar","chipirones","vieira","ostra","ostras","berberecho"],
    soja: ["tofu","soja","soya","edamame","miso","tempeh","salsa de soja","sillao","shoyu","proteína de soja","leche de soja","yogur de soja"],
    mani: ["maní","mani","cacahuate","manteca de maní","crema de cacahuate","pasta de maní","cacahuetes"],
  };

  function foodAllowed(f) {
    if (["rapida","suplemento","bebida"].includes(f.cat)) return false;
    if (restrictions.includes("vegano") && ["proteina","lacteo"].includes(f.cat)) return false;
    if (restrictions.includes("vegetariano") && f.cat === "proteina") {
      if (MEAT_KEYWORDS.some(k => f.name.toLowerCase().includes(k))) return false;
    }
    if (restrictions.includes("sin_lacteos") && f.cat === "lacteo") return false;
    if (restrictions.includes("sin_gluten") && GLUTEN_KEYWORDS.some(k => f.name.toLowerCase().includes(k))) return false;
    if (allergies && allergies.length > 0) {
      for (const a of allergies) {
        const keywords = ALLERGEN_KEYWORDS[a];
        if (keywords && keywords.some(k => f.name.toLowerCase().includes(k))) return false;
      }
    }
    return true;
  }

  function scaleFood(f, targetKcal) {
    if (f.unit) {
      const kcalPerUnit = f.kcal * (f.unitWeight || 100) / 100;
      const qty = Math.max(1, Math.round(targetKcal / kcalPerUnit));
      const factor = qty * (f.unitWeight || 100) / 100;
      return { name:cleanFoodName(f.name), qty, unit:true,
        kcal:Math.round(f.kcal*factor), protein:Math.round(f.protein*factor*10)/10,
        carbs:Math.round(f.carbs*factor*10)/10, fat:Math.round(f.fat*factor*10)/10 };
    } else {
      const grams = Math.max(40, Math.min(400, Math.round(targetKcal * 100 / f.kcal)));
      const factor = grams / 100;
      return { name:cleanFoodName(f.name), grams,
        kcal:Math.round(f.kcal*factor), protein:Math.round(f.protein*factor*10)/10,
        carbs:Math.round(f.carbs*factor*10)/10, fat:Math.round(f.fat*factor*10)/10 };
    }
  }

  // Seeded PRNG — includes random seed so each generation produces unique plans
  let rngSeed = days * 31 + mealsPerDay * 7 + (cuisine ? cuisine.charCodeAt(0) : 0) + (seed || 0);
  function rng() { rngSeed = (rngSeed * 16807 + 0) % 2147483647; return (rngSeed - 1) / 2147483646; }

  function pickForSlot(slot, dayIdx, slotIdx) {
    const targetKcal = Math.round(targetCal * slot.factor);
    // Map user-friendly wizard labels to actual db category values
    const CAT_LABEL_MAP = { principales:"principal", desayunos:"desayuno", legumbres:"legumbre", pescados:"proteina", carnes:"proteina", verduras:"verdura", huevos:"proteina", pastas:"carbohidrato", frutas:"fruta", lácteos:"lacteo", colaciones:"colacion" };
    const mappedLiked = likedCats.map(c => CAT_LABEL_MAP[c] || c);
    const allowedCats = mappedLiked.length > 0
      ? slot.cats.filter(c => mappedLiked.includes(c))
      : slot.cats;
    const cats = allowedCats.length > 0 ? allowedCats : slot.cats;

    let pool = FOOD_DB.filter(f => cats.includes(f.cat) && foodAllowed(f));
    // Cuisine preference: if set, prefer items matching cuisine keywords
    if (cuisine && pool.length > 0) {
      const cuisinePool = pool.filter(f => f.name.toLowerCase().includes(cuisine));
      if (cuisinePool.length > 0) pool = cuisinePool;
    }
    if (pool.length === 0) return [];

    // True randomness per pick (not deterministic per dayIdx/slotIdx)
    // But shuffle deterministically per config so same config = same plan
    const shuffled = [...pool].sort((a, b) => {
      const sa = ((pool.indexOf(a) + 1) * rng()) % 1;
      const sb = ((pool.indexOf(b) + 1) * rng()) % 1;
      return sa - sb;
    });
    const main = shuffled[0];
    const sidePool = shuffled.filter(f => f.cat !== main.cat);
    const side = sidePool.length > 0 ? sidePool[0] : null;

    const items = [scaleFood(main, side ? Math.round(targetKcal * 0.65) : targetKcal)];
    if (side) items.push(scaleFood(side, Math.round(targetKcal * 0.35)));
    return items;
  }

  return {
    config,
    dailyKcal: targetCal,
    dailyProtein: proteinG,
    dailyCarbs: carbG,
    dailyFat: fatG,
    generatedAt: new Date().toISOString(),
    days: Array.from({ length: days }, (_, dayIdx) => {
      const meals = slots.map((slot, slotIdx) => {
        const items = pickForSlot(slot, dayIdx, slotIdx);
        const tot = items.reduce((a,i) => ({ kcal:a.kcal+i.kcal, protein:a.protein+i.protein, carbs:a.carbs+i.carbs, fat:a.fat+i.fat }), {kcal:0,protein:0,carbs:0,fat:0});
        return { slot:slot.id, label:slot.label, items, ...tot };
      });
      const dayTot = meals.reduce((a,m) => ({ kcal:a.kcal+m.kcal, protein:a.protein+m.protein, carbs:a.carbs+m.carbs, fat:a.fat+m.fat }), {kcal:0,protein:0,carbs:0,fat:0});
      return { dayIdx, dayName:DAY_NAMES_PLAN[dayIdx % 7], meals, ...dayTot };
    }),
  };
}

function MacroCalculator({ profile, workouts, userGoal, macroDay, setMacroDay, adaptiveTDEE, weeklyBalance }) {
  const activityLevel = useStore(s => s.activityLevel) || "moderado";
  const setActivityLevel = useStore(s => s.setActivityLevel);
  const [showDiary, setShowDiary] = useState(true);
  const [newMeal, setNewMeal] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "", grams: "", qty: "1" });
  const [foodQuery, setFoodQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const [barcodeError, setBarcodeError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const mealLog = useStore(s => s.mealLog) || [];
  const logMeal = useStore(s => s.logMeal);
  const deleteMeal = useStore(s => s.deleteMeal);
  const savedMealCombos = useStore(s => s.savedMealCombos) || [];
  const saveMealCombo = useStore(s => s.saveMealCombo);
  const deleteMealCombo = useStore(s => s.deleteMealCombo);
  const logMealCombo = useStore(s => s.logMealCombo);
  const [showSaveCombo, setShowSaveCombo] = useState(false);
  const [comboName, setComboName] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [buildPlate, setBuildPlate] = useState(false);
  const [plateParts, setPlateParts] = useState([]);
  const [plateName, setPlateName] = useState("");
  const [diaryDate, setDiaryDate] = useState(() => new Date().toISOString().slice(0, 10));
  // Sub-page navigation
  const [subPage, setSubPage] = useState(null); // null | "diary" | "plan" | "wizard"
  const [expandedPlanDay, setExpandedPlanDay] = useState(null);
  // Wizard state
  const [wizStep, setWizStep] = useState(0);
  const [wizDays, setWizDays] = useState(7); // default 7 días
  const [wizMeals, setWizMeals] = useState(4);
  const [wizGoal, setWizGoal] = useState("mantener");
  const [wizRestrictions, setWizRestrictions] = useState([]);
  const [wizLikedCats, setWizLikedCats] = useState([]);
  const [wizAllergies, setWizAllergies] = useState([]);
  const [wizCuisine, setWizCuisine] = useState("");
  // Nutrition plan from store
  const nutritionPlan = useStore(s => s.nutritionPlan);
  const saveNutritionPlan = useStore(s => s.saveNutritionPlan);
  const clearNutritionPlan = useStore(s => s.clearNutritionPlan);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = diaryDate === todayStr;
  const todayMeals = mealLog.filter(m => m.date === diaryDate);
  const todayOnlyMeals = mealLog.filter(m => m.date === todayStr);
  const todayMacros = {
    kcal:    todayOnlyMeals.reduce((s,m) => s + (Number(m.kcal)    || 0), 0),
    protein: todayOnlyMeals.reduce((s,m) => s + (Number(m.protein) || 0), 0),
    carbs:   todayOnlyMeals.reduce((s,m) => s + (Number(m.carbs)   || 0), 0),
    fat:     todayOnlyMeals.reduce((s,m) => s + (Number(m.fat)     || 0), 0),
  };

  function shiftDay(delta) {
    const d = new Date(diaryDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    const next = d.toISOString().slice(0, 10);
    if (next <= todayStr) setDiaryDate(next);
  }

  // Weekly macro chart data (last 7 days)
  const weeklyMacroData = (() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayMeals = mealLog.filter(m => m.date === dateStr);
      result.push({
        date: dateStr,
        label: ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()],
        kcal: dayMeals.reduce((s,m) => s + Number(m.kcal||0), 0),
        protein: dayMeals.reduce((s,m) => s + Number(m.protein||0), 0),
        isToday: dateStr === todayStr,
      });
    }
    return result;
  })();

  // Food search suggestions (filtered by category if one is active)
  const foodSuggestions = foodQuery.length >= 2
    ? FOOD_DB.filter(f =>
        f.name.toLowerCase().includes(foodQuery.toLowerCase()) &&
        (!catFilter || f.cat === catFilter)
      ).slice(0, 8)
    : (catFilter && showSuggestions)
      ? FOOD_DB.filter(f => f.cat === catFilter).slice(0, 8)
      : [];

  function selectFoodSuggestion(food) {
    setSelectedFood(food);
    setFoodQuery(food.name);
    setShowSuggestions(false);
    if (food.unit) {
      // Unit-based food: default to qty=1
      const factor = (1 * (food.unitWeight || 100)) / 100;
      setNewMeal(m => ({
        ...m,
        name: food.name,
        qty: "1",
        grams: "",
        kcal:    String(Math.round(food.kcal    * factor)),
        protein: String(Math.round(food.protein * factor * 10) / 10),
        carbs:   String(Math.round(food.carbs   * factor * 10) / 10),
        fat:     String(Math.round(food.fat     * factor * 10) / 10),
      }));
    } else {
      setNewMeal(m => ({ ...m, name: food.name, grams: "100", qty: "1" }));
      applyGrams(food, 100);
    }
  }

  function applyGrams(food, grams) {
    if (food.unit) {
      // Should not normally be called for unit foods, but handle gracefully
      const factor = (Number(grams)) / 100;
      setNewMeal(m => ({
        ...m,
        grams: String(grams),
        kcal:    String(Math.round(food.kcal    * factor)),
        protein: String(Math.round(food.protein * factor * 10) / 10),
        carbs:   String(Math.round(food.carbs   * factor * 10) / 10),
        fat:     String(Math.round(food.fat     * factor * 10) / 10),
      }));
    } else {
      const ratio = Number(grams) / 100;
      setNewMeal(m => ({
        ...m,
        grams: String(grams),
        kcal:    String(Math.round(food.kcal    * ratio)),
        protein: String(Math.round(food.protein * ratio)),
        carbs:   String(Math.round(food.carbs   * ratio)),
        fat:     String(Math.round(food.fat     * ratio)),
      }));
    }
  }
  async function scanBarcode() {
    setBarcodeError("");
    setBarcodeScanning(true);
    try {
      if (!("BarcodeDetector" in window)) {
        setBarcodeError("Tu navegador no soporta escaneo de código de barras. Probá Chrome o Samsung Browser.");
        setBarcodeScanning(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      await video.play();
      const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
      let found = false;
      for (let i = 0; i < 40 && !found; i++) {
        await new Promise(r => setTimeout(r, 150));
        const barcodes = await detector.detect(video);
        if (barcodes.length > 0) {
          found = true;
          const code = barcodes[0].rawValue;
          stream.getTracks().forEach(t => t.stop());
          // Query Open Food Facts
          const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
          const data = await res.json();
          if (data.status === 1 && data.product) {
            const p = data.product;
            const n = p.nutriments || {};
            const name = p.product_name_es || p.product_name || p.abbreviated_product_name || code;
            setFoodQuery(name);
            setSelectedFood(null);
            setNewMeal(m => ({
              ...m,
              name,
              grams: "100",
              kcal: String(Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0)),
              protein: String(Math.round((n.proteins_100g || 0) * 10) / 10),
              carbs: String(Math.round((n.carbohydrates_100g || 0) * 10) / 10),
              fat: String(Math.round((n.fat_100g || 0) * 10) / 10),
            }));
          } else {
            setBarcodeError("Producto no encontrado. Completá los datos manualmente.");
          }
        }
      }
      stream.getTracks().forEach(t => t.stop());
      if (!found) setBarcodeError("No se detectó código. Intentá de nuevo con más luz.");
    } catch (err) {
      setBarcodeError("Error al acceder a la cámara: " + (err.message || "permiso denegado"));
    }
    setBarcodeScanning(false);
  }

  const weight = Number(profile?.weight_kg) || 75;
  const height = Number(profile?.height_cm) || 175;
  const dob   = profile?.date_of_birth;
  const sex   = profile?.sex || "M";
  const age   = dob ? Math.floor((Date.now() - new Date(dob + "T12:00:00")) / (365.25 * 86400000)) : 28;

  // Estimar % grasa desde pliegues (Durnin-Womersley) si están disponibles
  const hasSkinfolds = profile?.triceps_mm && profile?.subscapular_mm && profile?.biceps_mm && profile?.iliac_crest_mm;
  const bodyFatPct = hasSkinfolds ? (() => {
    const sum4 = Number(profile.triceps_mm) + Number(profile.subscapular_mm) + Number(profile.biceps_mm) + Number(profile.iliac_crest_mm);
    if (sum4 <= 0) return null;
    const logSum = Math.log10(sum4);
    const density = (age && age >= 30)
      ? 1.1581 - 0.0720 * logSum
      : 1.1620 - 0.0630 * logSum;
    const pct = ((4.95 / density) - 4.5) * 100;
    return Math.max(3, Math.min(50, pct)); // clamp a rango fisiológico
  })() : null;

  const lbm = bodyFatPct !== null ? weight * (1 - bodyFatPct / 100) : null;

  // BMR: Katch-McArdle (más precisa para atletas) si hay LBM; si no, Mifflin-St Jeor
  const bmr = lbm !== null
    ? Math.round(370 + 21.6 * lbm)   // Katch-McArdle
    : sex === "F"
      ? Math.round(10 * weight + 6.25 * height - 5 * age - 161)  // Mifflin-St Jeor ♀
      : Math.round(10 * weight + 6.25 * height - 5 * age + 5);   // Mifflin-St Jeor ♂

  const ACTIVITY = {
    sedentario:  { label: "Sedentario",        factor: 1.2   },
    ligero:      { label: "Ligero (1-2x/sem)", factor: 1.375 },
    moderado:    { label: "Moderado (3-5x)",   factor: 1.55  },
    activo:      { label: "Activo (6-7x)",     factor: 1.725 },
    muy_activo:  { label: "Muy activo (2x/día)",factor: 1.9  },
  };
  const tdee = Math.round(bmr * (ACTIVITY[activityLevel]?.factor ?? ACTIVITY.moderado.factor));

  // Ajuste por objetivo — superávit y déficit basados en % del TDEE, no en valores fijos
  // Volumen: +8% TDEE (suficiente para masa sin acumular grasa en exceso)
  // Definición: déficit del 15-20% del TDEE pero nunca más de 500 kcal
  const surplusTarget  = Math.round(tdee * 0.08);
  const deficitTarget  = Math.min(500, Math.round(tdee * 0.18));
  const baseAdj = userGoal === "volumen" ? surplusTarget : userGoal === "definicion" ? -deficitTarget : 0;
  // Día de entreno: +100 kcal extra (en carbs); descanso: -100 kcal
  const dayAdj  = macroDay === "entreno" ? 100 : -100;
  const targetCal = Math.max(1200, tdee + baseAdj + dayAdj); // nunca menos de 1200 kcal

  // Proteína: si hay LBM, calcular sobre masa magra (más preciso)
  // En corte se usa 3.1g/LBM (preservar músculo); en volumen 2.4g; mantenimiento 2.2g
  const proteinBase = lbm !== null ? lbm : weight;
  const proteinFactor = userGoal === "definicion" ? 3.1 : userGoal === "volumen" ? 2.4 : 2.2;
  const proteinG = Math.round(proteinBase * proteinFactor);

  // Grasa: mínimo 20% de calorías para función hormonal; máximo 35%
  const fatMinG  = Math.round((targetCal * 0.20) / 9);
  const fatTargG = Math.round((targetCal * 0.25) / 9);
  const fatG     = Math.max(fatMinG, fatTargG);

  // Carbohidratos: el resto de las calorías
  const carbG = Math.max(0, Math.round((targetCal - proteinG * 4 - fatG * 9) / 4));

  // Fibra objetivo: 14g por cada 1000 kcal (Academy of Nutrition and Dietetics)
  const fiberG = Math.round(targetCal / 1000 * 14);

  // Nutrient timing targets
  const postWorkoutProtein = Math.round(proteinG * 0.25); // ~25% of daily protein post-workout
  const preWorkoutCarbs    = Math.round(carbG * 0.20);   // ~20% of carbs pre-workout

  const hasMeasurements = profile?.weight_kg && profile?.height_cm;

  // Caloric semaphore
  const caloricSemaphore = (() => {
    if (!todayMacros.kcal) return null;
    const pct = todayMacros.kcal / targetCal;
    const diff = todayMacros.kcal - targetCal;
    if (pct >= 0.90 && pct <= 1.10) return { color:"#22c55e", label:"En objetivo", icon:"🟢", tip:"Perfecto, seguí así.", diff };
    if (pct < 0.90 && pct >= 0.70)  return { color:"#f59e0b", label:"Por debajo", icon:"🟡", tip:`Faltan ~${Math.round(targetCal - todayMacros.kcal)} kcal para el objetivo de hoy.`, diff };
    if (pct > 1.10 && pct <= 1.25)  return { color:"#f59e0b", label:"Levemente alto", icon:"🟡", tip:`Superaste el objetivo por ${Math.round(todayMacros.kcal - targetCal)} kcal.`, diff };
    if (pct < 0.70) return { color:"#ef4444", label:"Muy bajo", icon:"🔴", tip:`Consumiste solo el ${Math.round(pct*100)}% del objetivo. Riesgo de déficit excesivo.`, diff };
    return { color:"#ef4444", label:"Excedido", icon:"🔴", tip:`Superaste el objetivo por ${Math.round(todayMacros.kcal - targetCal)} kcal.`, diff };
  })();

  // Wizard: generate plan on last step submit
  function handleWizardFinish() {
    const plan = generateNutritionPlan(
      { days: wizDays, mealsPerDay: wizMeals, goal: wizGoal, restrictions: wizRestrictions, likedCats: wizLikedCats, allergies: wizAllergies, cuisine: wizCuisine, seed: Math.floor(Math.random() * 999983) },
      tdee, targetCal, proteinG, carbG, fatG
    );
    plan.planStartDate = new Date().toISOString().slice(0, 10);
    saveNutritionPlan(plan);
    setSubPage("plan");
    setWizStep(0);
    if (window.__showToast) window.__showToast("✓ Plan generado");
  }

  /* ── current day index for plan ────────────────────────── */
  const currentPlanDayIdx = useMemo(() => {
    if (!nutritionPlan?.planStartDate || !nutritionPlan?.days?.length) return null;
    const start = new Date(nutritionPlan.planStartDate + "T12:00:00");
    const today = new Date(); today.setHours(12,0,0,0);
    const diffDays = Math.floor((today - start) / 86400000);
    return Math.min(diffDays, nutritionPlan.days.length - 1);
  }, [nutritionPlan?.planStartDate, nutritionPlan?.days?.length]);

  // Auto-expand current plan day when plan changes
  useEffect(() => {
    if (currentPlanDayIdx != null) {
      setExpandedPlanDay(currentPlanDayIdx);
    }
  }, [currentPlanDayIdx]);

  // Midnight listener to update current day index
  useEffect(() => {
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime() - now.getTime();
    const timeout = setTimeout(() => {
      // Trigger re-render — useStore re-sub will pick up new date
      setExpandedPlanDay(null);
      if (nutritionPlan?.planStartDate) {
        const start = new Date(nutritionPlan.planStartDate + "T12:00:00");
        const today2 = new Date(); today2.setHours(12,0,0,0);
        const diff = Math.floor((today2 - start) / 86400000);
        setExpandedPlanDay(Math.min(diff, (nutritionPlan.days?.length || 1) - 1));
      }
    }, msToMidnight + 1000);
    return () => clearTimeout(timeout);
  }, [nutritionPlan?.planStartDate, nutritionPlan?.days?.length]);

  const MACRO_TABS = [
    { id: null,     label: "Resumen"  },
    { id: "diary",  label: "Diario"   },
    { id: "plan",   label: "Plan"     },
  ];

  return (
    <div>
      {/* ── Tab bar (estilo Coach) ───────────────────────────── */}
      <div style={{ display:"flex", gap:4, background:"var(--panel)", borderRadius:14, padding:4, marginBottom:16 }}>
        {MACRO_TABS.map(({ id, label }) => (
          <button key={String(id)} onClick={() => setSubPage(id)} style={{
            flex:1, padding:"8px 4px", fontSize:12, fontWeight:600, borderRadius:10,
            border:"none", cursor:"pointer", transition:"all .15s",
            background: subPage === id ? "var(--green)" : "transparent",
            color: subPage === id ? "#fff" : "var(--muted)",
          }}>{label}</button>
        ))}
      </div>

      {/* ── TAB: RESUMEN ────────────────────────────────────── */}
      {subPage === null && (<div>

      {!hasMeasurements && (
        <div style={{ background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.3)", borderRadius:14, padding:"14px 16px", marginBottom:16 }}>
          <p style={{ margin:0, fontSize:13, color:"#f59e0b" }}>
            ⚠ Para cálculos precisos, agregá tu peso y altura en <b>Mediciones</b>.
          </p>
        </div>
      )}

      {/* ── Semáforo calórico ────────────────────────────────── */}
      {caloricSemaphore && (
        <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--panel)", borderRadius:14, padding:"12px 14px", marginBottom:14, border:`1px solid ${caloricSemaphore.color}44` }}>
          <span style={{ fontSize:28, lineHeight:1 }}>{caloricSemaphore.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <p style={{ margin:0, fontSize:14, fontWeight:800, color:caloricSemaphore.color }}>{caloricSemaphore.label}</p>
              <p style={{ margin:0, fontSize:18, fontWeight:900, color:caloricSemaphore.color, lineHeight:1 }}>
                {Math.round(todayMacros.kcal)}<span style={{ fontSize:11, fontWeight:500, color:"var(--muted)", marginLeft:2 }}>kcal</span>
              </p>
            </div>
            <p style={{ margin:"3px 0 0", fontSize:12, color:"var(--muted)", lineHeight:1.4 }}>{caloricSemaphore.tip}</p>
          </div>
        </div>
      )}

      {/* ── Daily macro rings ─────────────────────────────────── */}
      {(todayMacros.kcal > 0 || todayMacros.protein > 0) && (() => {
        const rings = [
          { label:"Proteína", val: todayMacros.protein, target: proteinG, color:"#a855f7", unit:"g" },
          { label:"Kcal",     val: todayMacros.kcal,    target: targetCal, color:"#f59e0b", unit:"" },
          { label:"Carbs",    val: todayMacros.carbs,   target: carbG,    color:"#60a5fa", unit:"g" },
          { label:"Grasas",   val: todayMacros.fat,     target: fatG,     color:"#fb923c", unit:"g" },
        ];
        const R = 22, CIRC = 2 * Math.PI * R;
        return (
          <div style={{ background:"var(--panel)", borderRadius:16, padding:"16px", marginBottom:14 }}>
            <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Hoy — progreso</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {rings.map(({ label, val, target, color, unit }) => {
                const pct = Math.min(1, target > 0 ? val / target : 0);
                const over = val > target * 1.05;
                return (
                  <div key={label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <svg width={54} height={54} viewBox="0 0 54 54">
                      <circle cx={27} cy={27} r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={4} />
                      <circle cx={27} cy={27} r={R} fill="none" stroke={over ? "#ef4444" : color}
                        strokeWidth={4} strokeLinecap="round"
                        strokeDasharray={CIRC}
                        strokeDashoffset={CIRC * (1 - pct)}
                        transform="rotate(-90 27 27)" />
                      <text x={27} y={27} textAnchor="middle" dominantBaseline="central"
                        fill={over ? "#ef4444" : color} fontSize={9} fontWeight={900}>
                        {val >= 1000 ? `${(val/1000).toFixed(1)}k` : Math.round(val)}{unit}
                      </text>
                    </svg>
                    <span style={{ fontSize:9, color:"var(--muted)", fontWeight:600, textAlign:"center" }}>{label}</span>
                    <span style={{ fontSize:9, color:"rgba(255,255,255,.3)" }}>{Math.round(pct*100)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Hoy en el plan ──────────────────────────────────── */}
      {nutritionPlan && currentPlanDayIdx != null && nutritionPlan.days?.[currentPlanDayIdx] && (
        <div style={{ background:"rgba(34,197,94,.07)", border:"1px solid rgba(34,197,94,.3)", borderRadius:16, padding:"14px 16px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:700, color:"var(--green)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
              Hoy — {nutritionPlan.days[currentPlanDayIdx].dayName}
            </span>
            <span style={{ fontSize:13, fontWeight:900, color:"var(--text)" }}>
              {Math.round(nutritionPlan.days[currentPlanDayIdx].kcal)} kcal
            </span>
          </div>
          <div style={{ display:"flex", gap:4, marginBottom:10 }}>
            {[
              { label:"P", val:nutritionPlan.days[currentPlanDayIdx].protein, target:nutritionPlan.dailyProtein, color:"#a855f7" },
              { label:"C", val:nutritionPlan.days[currentPlanDayIdx].carbs,   target:nutritionPlan.dailyCarbs,    color:"#60a5fa" },
              { label:"G", val:nutritionPlan.days[currentPlanDayIdx].fat,     target:nutritionPlan.dailyFat,      color:"#f59e0b" },
            ].map(m => {
              const pct = Math.min(1, m.val / (m.target || 1));
              return (
                <div key={m.label} style={{ flex:1, background:"rgba(0,0,0,.2)", borderRadius:8, padding:"6px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:9, color:"var(--muted)", fontWeight:700, marginBottom:1 }}>{m.label}</div>
                  <div style={{ fontSize:14, fontWeight:900, color:m.color }}>{Math.round(m.val)}g</div>
                  <div style={{ height:3, background:"var(--panel2)", borderRadius:2, marginTop:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct*100}%`, background:m.color, borderRadius:2 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {nutritionPlan.days[currentPlanDayIdx].meals?.map(meal => (
              <button key={meal.slot} onClick={() => { logMeal({ name: meal.items.map(i=>i.name).join(" + "), kcal: Math.round(meal.kcal), protein: Math.round(meal.protein), carbs: Math.round(meal.carbs), fat: Math.round(meal.fat) }); if (window.__showToast) window.__showToast("✓ Comida registrada"); }}
                style={{ background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.25)", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:11, color:"var(--text)" }}>
                Añadir {meal.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Adaptive TDEE suggestion ─────────────────────────── */}
      {adaptiveTDEE && (
        <div style={{ background:"rgba(96,165,250,.07)", border:"1px solid rgba(96,165,250,.25)", borderRadius:14, padding:"12px 14px", marginBottom:14 }}>
          <p style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:"var(--text)" }}>
            {adaptiveTDEE.suggestion > 0 ? "⬆ Subí tus calorías" : "⬇ Bajá tus calorías"}
          </p>
          <p style={{ margin:"0 0 6px", fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
            Tus últimas semanas muestran {adaptiveTDEE.weeklyChange > 0 ? "+" : ""}{adaptiveTDEE.weeklyChange}kg/sem
            (objetivo: {adaptiveTDEE.targetWeekly > 0 ? "+" : ""}{adaptiveTDEE.targetWeekly}kg/sem).
            Ajustá en aprox. <b style={{ color:"#60a5fa" }}>{adaptiveTDEE.suggestion > 0 ? "+" : ""}{adaptiveTDEE.suggestion} kcal/día</b>.
          </p>
        </div>
      )}

      {/* ── Weekly caloric balance ───────────────────────────── */}
      {weeklyBalance > 0 && (() => {
        const daysLogged = [...new Set(mealLog.filter(m => {
          const d = new Date(); const mon = new Date(d); mon.setDate(d.getDate()-((d.getDay()+6)%7)); mon.setHours(0,0,0,0);
          return m.date && new Date(m.date+"T12:00:00") >= mon;
        }).map(m => m.date))].length;
        const weekTarget = targetCal * daysLogged;
        const balance = weeklyBalance - weekTarget;
        const color = Math.abs(balance) < weekTarget * 0.05 ? "#22c55e" : balance > 0 ? (userGoal === "volumen" ? "#a855f7" : "#ef4444") : (userGoal === "definicion" ? "#a855f7" : "#f59e0b");
        return (
          <div style={{ background:"var(--panel)", borderRadius:14, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color:"var(--muted)", fontWeight:600 }}>Balance semanal ({daysLogged} días)</span>
              <span style={{ fontSize:18, fontWeight:900, color }}>{balance > 0 ? "+" : ""}{Math.round(balance)} kcal</span>
            </div>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>
              Consumido: {Math.round(weeklyBalance)} · Objetivo: {Math.round(weekTarget)}
            </div>
            <div style={{ height:4, background:"var(--panel2)", borderRadius:2, marginTop:8, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${Math.min(100, (weeklyBalance/weekTarget)*100)}%`, background:color, borderRadius:2, transition:"width .3s" }} />
            </div>
          </div>
        );
      })()}

      {/* Training day / rest day toggle */}
      <div style={{ display:"flex", gap:4, background:"var(--panel)", borderRadius:14, padding:4, marginBottom:14 }}>
        {[{id:"entreno", label:"Día de entreno"}, {id:"descanso", label:"Día de descanso"}].map(({id, label}) => (
          <button key={id} onClick={() => setMacroDay(id)} style={{
            flex:1, padding:"9px 6px", fontSize:12, fontWeight:700, borderRadius:10, border:"none", cursor:"pointer",
            background: macroDay === id ? "var(--green)" : "transparent",
            color: macroDay === id ? "#fff" : "var(--muted)",
          }}>{label}</button>
        ))}
      </div>

      {/* Nutrient timing card */}
      <div style={{ background:"rgba(168,85,247,.07)", border:"1px solid rgba(168,85,247,.2)", borderRadius:14, padding:"12px 14px", marginBottom:14 }}>
        <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Timing de nutrición</p>
        {macroDay === "entreno" ? (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:"var(--text)" }}>Pre-entreno <small style={{ color:"var(--muted)" }}>(1-2h antes)</small></span>
              <span style={{ fontSize:12, fontWeight:800, color:"#60a5fa" }}>{preWorkoutCarbs}g carbs</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:"var(--text)" }}>Post-entreno <small style={{ color:"var(--muted)" }}>(dentro de 2h)</small></span>
              <span style={{ fontSize:12, fontWeight:800, color:"#a855f7" }}>{postWorkoutProtein}g proteína</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:"var(--text)" }}>Durante el día</span>
              <span style={{ fontSize:12, fontWeight:800, color:"var(--text)" }}>{proteinG - postWorkoutProtein}g proteína restante</span>
            </div>
          </div>
        ) : (
          <p style={{ margin:0, fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
            Día de descanso: priorizá proteína distribuida en 3-4 comidas y carbohidratos complejos.
            Reducís {150} kcal vs día de entreno.
          </p>
        )}
      </div>

      {/* TDEE card */}
      <div style={{ background:"var(--panel)", borderRadius:16, padding:"16px", marginBottom:12 }}>
        <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
          Nivel de actividad
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
          {Object.entries(ACTIVITY).map(([id, a]) => (
            <button key={id} onClick={() => setActivityLevel(id)}
              style={{
                background: activityLevel === id ? "rgba(168,85,247,.1)" : "var(--panel2)",
                border: `1.5px solid ${activityLevel === id ? "var(--green)" : "var(--border)"}`,
                borderRadius:10, padding:"8px 12px", cursor:"pointer", textAlign:"left",
                color: activityLevel === id ? "var(--green)" : "var(--text)", fontSize:13, fontWeight:600,
              }}>
              {a.label}
            </button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <div style={{ background:"var(--panel2)", borderRadius:12, padding:"12px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>TDEE (mantenimiento)</div>
            <div style={{ fontSize:28, fontWeight:900, color:"var(--green)", margin:"4px 0 2px" }}>{tdee}</div>
            <div style={{ fontSize:10, color:"var(--muted)" }}>kcal/día</div>
          </div>
          <div style={{ background:"var(--panel2)", borderRadius:12, padding:"12px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
              Objetivo {userGoal === "volumen" ? `(+${surplusTarget})` : userGoal === "definicion" ? `(-${deficitTarget})` : "(=)"}
            </div>
            <div style={{ fontSize:28, fontWeight:900, color: userGoal === "definicion" ? "#f87171" : userGoal === "volumen" ? "#a855f7" : "var(--text)", margin:"4px 0 2px" }}>{targetCal}</div>
            <div style={{ fontSize:10, color:"var(--muted)" }}>kcal/día</div>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div style={{ background:"var(--panel)", borderRadius:16, padding:"16px", marginBottom:12 }}>
        <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
          Macronutrientes diarios
        </p>
        {[
          { label:"Proteína",      g:proteinG, cal:proteinG*4, color:"#a855f7",  pct:Math.round(proteinG*4/targetCal*100), desc:"Músculo y recuperación" },
          { label:"Carbohidratos", g:carbG,    cal:carbG*4,    color:"#60a5fa",  pct:Math.round(carbG*4/targetCal*100),    desc:"Energía y rendimiento" },
          { label:"Grasas",        g:fatG,     cal:fatG*9,     color:"#f59e0b",  pct:Math.round(fatG*9/targetCal*100),     desc:"Hormonas y recuperación" },
        ].map(m => (
          <div key={m.label} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <div>
                <span style={{ fontSize:13, fontWeight:800, color:"var(--text)" }}>{m.label}</span>
                <span style={{ fontSize:11, color:"var(--muted)", marginLeft:8 }}>{m.desc}</span>
              </div>
              <div style={{ textAlign:"right" }}>
                <span style={{ fontSize:16, fontWeight:900, color:m.color }}>{m.g}g</span>
                <span style={{ fontSize:11, color:"var(--muted)", marginLeft:6 }}>{m.cal} kcal</span>
              </div>
            </div>
            <div style={{ height:6, background:"var(--panel2)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${m.pct}%`, background:m.color, borderRadius:4 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Fiber target */}
      <div style={{ background:"var(--panel)", borderRadius:12, padding:"12px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <span style={{ fontSize:13, fontWeight:800, color:"var(--text)" }}>Fibra</span>
          <span style={{ fontSize:11, color:"var(--muted)", marginLeft:8 }}>Digestión y saciedad</span>
        </div>
        <span style={{ fontSize:16, fontWeight:900, color:"#4ade80" }}>{fiberG}g</span>
      </div>

      <div style={{ background:"rgba(168,85,247,.06)", border:"1px solid rgba(168,85,247,.2)", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
        <p style={{ margin:0, fontSize:12, color:"var(--muted)", lineHeight:1.6 }}>
          {lbm !== null ? `Katch-McArdle · LBM ${Math.round(lbm)}kg (${Math.round(bodyFatPct)}% grasa)` : "Mifflin-St Jeor"} · {weight}kg · {height}cm · {age} años · {sex === "M" ? "Masculino" : "Femenino"}<br/>
          Para mayor precisión actualizá tu peso en <b>Mediciones</b> regularmente.
        </p>
      </div>

      {/* ── Protein distribution guide ────────────────────────── */}
      <div style={{ background:"var(--panel)", borderRadius:16, padding:"16px", marginBottom:12 }}>
        <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Distribución de proteína · 4 comidas</p>
        {(() => {
          const perMeal = Math.round(proteinG / 4);
          const leucineThreshold = 3; // grams of leucine to trigger MPS (≈ ~30g protein)
          const mealsOk = perMeal >= 30;
          const meals = [
            { time: "Desayuno", pct: 25, tip: "Huevos, yogur griego, queso cottage" },
            { time: macroDay === "entreno" ? "Pre-entreno (2h)" : "Almuerzo", pct: 20, tip: macroDay === "entreno" ? "Pollo, arroz integral" : "Carne, verduras, legumbres" },
            { time: macroDay === "entreno" ? "Post-entreno (1h)" : "Merienda", pct: 30, tip: macroDay === "entreno" ? "Proteína whey + fruta" : "Atún, yogur" },
            { time: "Cena", pct: 25, tip: "Carne, salmón, tofu, legumbres" },
          ];
          return (
            <div>
              {meals.map(({ time, pct, tip }) => {
                const g = Math.round(proteinG * pct / 100);
                return (
                  <div key={time} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                    <div style={{ width:42, height:42, flexShrink:0, background:"rgba(168,85,247,.1)", borderRadius:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:14, fontWeight:900, color:"#a855f7" }}>{g}g</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"var(--text)" }}>{time}</div>
                      <div style={{ fontSize:11, color:"var(--muted)" }}>{tip}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ background:"rgba(168,85,247,.06)", borderRadius:10, padding:"8px 10px", marginTop:4, display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:12, flexShrink:0 }}>💡</span>
                <p style={{ margin:0, fontSize:11, color:"var(--muted)", lineHeight:1.5 }}>
                  Umbral de leucina: necesitás ≥{leucineThreshold}g leucina por comida (~{mealsOk ? "✓ alcanzado" : `⚠ ${perMeal}g es bajo — apuntá a 30g+`}) para activar la síntesis proteica muscular.
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── Supplement protocol ──────────────────────────────── */}
      <div style={{ background:"var(--panel)", borderRadius:16, padding:"16px", marginBottom:12 }}>
        <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Suplementación recomendada</p>
        {[
          { name:"Creatina monohidrato", dose:"5g/día", timing:"Cualquier momento (con consistencia)", benefit:"Fuerza +5-15%, volumen muscular, recuperación", all:true },
          { name:"Proteína whey", dose:`${Math.round(postWorkoutProtein)}g post-entreno`, timing:"Dentro de 2h post-entreno", benefit:"Completar proteína diaria cuando la comida no alcanza", all:true },
          ...(userGoal === "definicion" ? [{ name:"Cafeína", dose:"200-400mg", timing:"30-60 min pre-entreno", benefit:"Rendimiento +3-5%, quema de grasa como combustible", all:false }] : []),
          ...(userGoal === "volumen" ? [{ name:"Beta-alanina", dose:"3-6g/día", timing:"Pre-entreno (repartido)", benefit:"Resistencia muscular, retrasa la fatiga en series 8-15 reps", all:false }] : []),
          { name:"Vitamina D3 + K2", dose:"2000-4000 UI/día", timing:"Con comida grasa (almuerzo/cena)", benefit:"Testosterona, huesos, inmunidad", all:true },
          { name:"Magnesio glicinato", dose:"300-400mg/día", timing:"Antes de dormir", benefit:"Calidad del sueño, reducción de calambres, recuperación", all:true },
        ].map(({ name, dose, timing, benefit }) => (
          <div key={name} style={{ marginBottom:10, paddingBottom:10, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
              <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{name}</span>
              <span style={{ fontSize:12, fontWeight:800, color:"#a855f7", flexShrink:0 }}>{dose}</span>
            </div>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>⏱ {timing}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.45)", marginTop:1 }}>→ {benefit}</div>
          </div>
        ))}
      </div>

      {/* ── Weekly macro chart ── */}
      {weeklyMacroData.some(d => d.kcal > 0) && (() => {
        const maxKcal = Math.max(...weeklyMacroData.map(d => d.kcal), 1);
        return (
          <div style={{ background:"var(--panel)", borderRadius:16, padding:"16px", marginBottom:12 }}>
            <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Calorías — últimos 7 días</p>
            <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:64 }}>
              {weeklyMacroData.map(d => (
                <div key={d.date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                  {d.kcal > 0 && <span style={{ fontSize:8, color:"var(--muted)", fontWeight:700 }}>{d.kcal >= 1000 ? `${(d.kcal/1000).toFixed(1)}k` : d.kcal}</span>}
                  <div style={{ width:"100%", borderRadius:"4px 4px 0 0", background: d.isToday ? "#f59e0b" : d.kcal > 0 ? "rgba(245,158,11,.45)" : "rgba(255,255,255,.06)",
                    height: d.kcal > 0 ? `${Math.max(4, (d.kcal/maxKcal)*52)}px` : "4px", transition:"height .4s ease" }} />
                  <span style={{ fontSize:9, color: d.isToday ? "var(--text)" : "var(--muted)", fontWeight: d.isToday ? 800 : 400 }}>{d.label}</span>
                </div>
              ))}
            </div>
            {/* Protein row */}
            <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:32, marginTop:8 }}>
              {weeklyMacroData.map(d => {
                const maxP = Math.max(...weeklyMacroData.map(x => x.protein), 1);
                return (
                  <div key={d.date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <div style={{ width:"100%", borderRadius:"3px 3px 0 0", background: d.protein > 0 ? "rgba(168,85,247,.5)" : "rgba(255,255,255,.04)",
                      height: d.protein > 0 ? `${Math.max(3, (d.protein/maxP)*26)}px` : "3px" }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:12, marginTop:6, fontSize:10, color:"var(--muted)" }}>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:8, height:8, borderRadius:2, background:"#f59e0b", display:"inline-block" }}/>Kcal</span>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:8, height:8, borderRadius:2, background:"rgba(168,85,247,.7)", display:"inline-block" }}/>Proteína</span>
            </div>
          </div>
        );
      })()}

      </div>)} {/* end TAB: RESUMEN */}

      {/* ── TAB: DIARIO ─────────────────────────────────────── */}
      {subPage === "diary" && (
      <div>
      <button onClick={() => setShowDiary(d => !d)}
        style={{
          width:"100%", background:"var(--panel)", border:"1.5px solid var(--border)",
          borderRadius:14, padding:"14px 16px", cursor:"pointer", marginBottom:12,
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🍽️</span>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>{isToday ? "Diario de hoy" : diaryDate}</div>
            <div style={{ fontSize:11, color:"var(--muted)" }}>
              {todayMeals.reduce((s,m)=>s+Number(m.kcal||0),0)} {isToday ? `/ ${targetCal}` : ""} kcal
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => shiftDay(-1)} style={{ background:"none", border:"1px solid var(--line)", borderRadius:8, width:28, height:28, cursor:"pointer", color:"var(--muted)", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
          <button onClick={() => shiftDay(1)} disabled={isToday} style={{ background:"none", border:"1px solid var(--line)", borderRadius:8, width:28, height:28, cursor:"pointer", color: isToday ? "rgba(255,255,255,.15)" : "var(--muted)", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
          <span style={{ color:"var(--muted)", fontSize:14, marginLeft:4 }}>{showDiary ? "▲" : "▼"}</span>
        </div>
      </button>

      {showDiary && (
        <div style={{ marginBottom:16 }}>
          {/* Progress bars: kcal + per-macro */}
          {(() => {
            const consumed = todayMeals.reduce((s,m)=>s+Number(m.kcal||0),0);
            const consumedP = Math.round(todayMeals.reduce((s,m)=>s+Number(m.protein||0),0));
            const consumedC = Math.round(todayMeals.reduce((s,m)=>s+Number(m.carbs||0),0));
            const consumedF = Math.round(todayMeals.reduce((s,m)=>s+Number(m.fat||0),0));
            const pct = Math.min(1, consumed / targetCal);
            const over = consumed > targetCal;
            return (
              <div style={{ background:"var(--panel)", borderRadius:14, padding:"14px 16px", marginBottom:12 }}>
                {/* Calories */}
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:700 }}>Calorías</span>
                  <span style={{ fontSize:13, fontWeight:900, color: over ? "#f87171" : "var(--green)" }}>{consumed} / {targetCal} kcal</span>
                </div>
                <div style={{ height:8, background:"var(--panel2)", borderRadius:4, overflow:"hidden", marginBottom:14 }}>
                  <div style={{ height:"100%", width:`${pct*100}%`, background: over ? "#f87171" : "var(--green)", borderRadius:4, transition:"width 0.4s" }} />
                </div>
                {/* Per-macro progress bars */}
                {[
                  { label:"Proteína",      consumed:consumedP, target:proteinG, color:"#a855f7" },
                  { label:"Carbohidratos", consumed:consumedC, target:carbG,    color:"#60a5fa" },
                  { label:"Grasas",        consumed:consumedF, target:fatG,     color:"#f59e0b" },
                ].map(mac => {
                  const mpct = Math.min(1, mac.consumed / (mac.target || 1));
                  const mover = mac.consumed > mac.target;
                  return (
                    <div key={mac.label} style={{ marginBottom:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize:11, color:"var(--muted)" }}>{mac.label}</span>
                        <span style={{ fontSize:11, fontWeight:700, color: mover ? "#f87171" : mac.color }}>{mac.consumed}g / {mac.target}g</span>
                      </div>
                      <div style={{ height:5, background:"var(--panel2)", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${mpct*100}%`, background: mover ? "#f87171" : mac.color, borderRadius:3, transition:"width 0.4s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Today's meals */}
          {todayMeals.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
              {todayMeals.map(m => (
                <div key={m.id} style={{ background:"var(--panel)", borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700 }}>{m.name}</div>
                    <div style={{ fontSize:11, color:"var(--muted)" }}>
                      {m.kcal} kcal
                      {m.protein ? ` · P: ${m.protein}g` : ""}
                      {m.carbs ? ` · C: ${m.carbs}g` : ""}
                      {m.fat ? ` · G: ${m.fat}g` : ""}
                    </div>
                  </div>
                  <button onClick={() => deleteMeal(m.id)}
                    style={{ background:"none", border:"none", color:"var(--muted)", fontSize:16, cursor:"pointer", padding:4 }}>
                    ✕
                  </button>
                </div>
              ))}
              {/* Save as combo */}
              {!showSaveCombo ? (
                <button onClick={() => { setShowSaveCombo(true); setComboName(""); }}
                  style={{ background:"rgba(168,85,247,.06)", border:"1px dashed rgba(168,85,247,.3)", borderRadius:12, padding:"9px 14px", cursor:"pointer", fontSize:12, color:"var(--green)", fontWeight:700, textAlign:"left" }}>
                  + Guardar estas comidas como combo
                </button>
              ) : (
                <div style={{ background:"var(--panel)", borderRadius:12, padding:"12px 14px", display:"flex", gap:8, alignItems:"center" }}>
                  <input
                    autoFocus
                    value={comboName}
                    onChange={e => setComboName(e.target.value)}
                    placeholder="Nombre del combo (ej: Desayuno habitual)"
                    style={{ flex:1, background:"var(--panel2)", border:"1.5px solid var(--green)", borderRadius:10, padding:"8px 12px", color:"var(--text)", fontSize:13 }}
                    onKeyDown={e => {
                      if (e.key === "Enter" && comboName.trim()) {
                        saveMealCombo(comboName, todayMeals.map(({ name, kcal, protein, carbs, fat }) => ({ name, kcal, protein, carbs, fat })));
                        setShowSaveCombo(false);
                      }
                    }}
                  />
                  <button className="primary" style={{ padding:"8px 14px", fontSize:13 }}
                    disabled={!comboName.trim()}
                    onClick={() => {
                      saveMealCombo(comboName, todayMeals.map(({ name, kcal, protein, carbs, fat }) => ({ name, kcal, protein, carbs, fat })));
                      setShowSaveCombo(false);
                    }}>Guardar</button>
                  <button className="ghost" style={{ padding:"8px 10px" }} onClick={() => setShowSaveCombo(false)}>✕</button>
                </div>
              )}
            </div>
          )}

          {/* Mis combos */}
          {savedMealCombos.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Mis combos</p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {savedMealCombos.map(combo => {
                  const totalKcal = combo.meals.reduce((s,m) => s + Number(m.kcal||0), 0);
                  const totalP = combo.meals.reduce((s,m) => s + Number(m.protein||0), 0);
                  return (
                    <div key={combo.id} style={{ background:"var(--panel)", borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700 }}>{combo.name}</div>
                        <div style={{ fontSize:11, color:"var(--muted)" }}>
                          {combo.meals.length} ítems · {totalKcal} kcal · P: {Math.round(totalP)}g
                        </div>
                      </div>
                      <button
                        onClick={() => logMealCombo(combo.id)}
                        style={{ background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.3)", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12, fontWeight:700, color:"var(--green)" }}>
                        Cargar
                      </button>
                      <button onClick={() => deleteMealCombo(combo.id)}
                        style={{ background:"none", border:"none", color:"var(--muted)", fontSize:16, cursor:"pointer", padding:4 }}>
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Protein insufficient alert */}
          {(() => {
            const todayP = todayMeals.reduce((s,m)=>s+Number(m.protein||0),0);
            const weightKg = Number(profile?.weight_kg) || null;
            const targetP = weightKg ? Math.round(weightKg * (userGoal==="definicion"?2.6:userGoal==="volumen"?2.2:1.8)) : null;
            if (!targetP || todayP === 0) return null;
            const pct = todayP / targetP;
            const isToday2 = diaryDate === new Date().toISOString().slice(0,10);
            if (!isToday2 || pct >= 0.8) return null;
            return (
              <div style={{ background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.25)", borderRadius:12, padding:"10px 14px", marginBottom:10, fontSize:13 }}>
                <b style={{ color:"var(--danger)" }}>⚠ Poco proteína hoy</b>
                <p style={{ margin:"4px 0 0", color:"var(--muted)" }}>
                  {todayP}g de {targetP}g meta ({Math.round(pct*100)}%). Agregá {targetP-todayP}g más hoy.
                </p>
              </div>
            );
          })()}

          {/* Add meal form — only for today */}
          {isToday && <div style={{ background:"var(--panel)", borderRadius:14, padding:"14px 16px" }}>
            {/* Mode selector */}
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>
              <button
                onClick={() => { setBuildPlate(false); setPlateParts([]); setPlateName(""); setSelectedFood(null); setFoodQuery(""); setShowSuggestions(true); }}
                style={{ flex:1, padding:"8px 0", borderRadius:10, border:"1.5px solid", cursor:"pointer", fontSize:12, fontWeight:700,
                  borderColor: !buildPlate ? "var(--green)" : "var(--border)",
                  background: !buildPlate ? "rgba(168,85,247,.12)" : "var(--panel2)",
                  color: !buildPlate ? "var(--green)" : "var(--muted)" }}>
                + Alimento solo
              </button>
              <button
                onClick={() => { setBuildPlate(true); setPlateParts([]); setPlateName(""); setSelectedFood(null); setFoodQuery(""); setShowSuggestions(true); }}
                style={{ flex:1, padding:"8px 0", borderRadius:10, border:"1.5px solid", cursor:"pointer", fontSize:12, fontWeight:700,
                  borderColor: buildPlate ? "var(--green)" : "var(--border)",
                  background: buildPlate ? "rgba(168,85,247,.12)" : "var(--panel2)",
                  color: buildPlate ? "var(--green)" : "var(--muted)" }}>
                🍽 Combinar ingredientes
              </button>
            </div>
            {buildPlate && plateParts.length === 0 && (
              <div style={{ background:"rgba(168,85,247,.07)", border:"1px dashed rgba(168,85,247,.3)", borderRadius:10, padding:"10px 12px", marginBottom:10, textAlign:"center" }}>
                <p style={{ margin:0, fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
                  Buscá cada ingrediente y agregalo al plato.<br/>
                  <span style={{ color:"var(--text)", fontStyle:"italic" }}>Ej: arroz + pollo + cabutia → "Arroz con pollo"</span>
                </p>
              </div>
            )}

            {/* Category filter chips */}
            <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:6, marginBottom:8, scrollbarWidth:"none" }}>
              {CATS.map(c => (
                <button key={c.id}
                  onClick={() => { setCatFilter(c.id); setShowSuggestions(true); setFoodQuery(""); setSelectedFood(null); }}
                  style={{ flexShrink:0, padding:"4px 10px", borderRadius:20, border:"1.5px solid", fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
                    borderColor: catFilter === c.id ? "var(--green)" : "var(--border)",
                    background: catFilter === c.id ? "rgba(168,85,247,.12)" : "var(--panel2)",
                    color: catFilter === c.id ? "var(--green)" : "var(--muted)" }}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Build-plate parts list */}
            {buildPlate && plateParts.length > 0 && (
              <div style={{ background:"rgba(168,85,247,.06)", border:"1px solid rgba(168,85,247,.2)", borderRadius:12, padding:"10px 12px", marginBottom:10 }}>
                <p style={{ margin:"0 0 6px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Tu plato</p>
                {plateParts.map((part, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:3 }}>{part.name}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0.5"
                          step={part.unit ? "0.5" : "10"}
                          value={part.unit ? part.qty : part.grams}
                          onChange={e => {
                            const val = e.target.value;
                            setPlateParts(ps => ps.map((p, j) => {
                              if (j !== i) return p;
                              const f = p._food;
                              if (!f) return p;
                              const factor = part.unit
                                ? (Number(val) * (f.unitWeight || 100)) / 100
                                : Number(val) / 100;
                              return {
                                ...p,
                                qty: part.unit ? val : undefined,
                                grams: part.unit ? undefined : val,
                                kcal:    Math.round(f.kcal    * factor),
                                protein: Math.round(f.protein * factor * 10) / 10,
                                carbs:   Math.round(f.carbs   * factor * 10) / 10,
                                fat:     Math.round(f.fat     * factor * 10) / 10,
                              };
                            }));
                          }}
                          style={{ width:56, background:"var(--panel)", border:"1px solid var(--border)", borderRadius:7, padding:"3px 8px", color:"var(--text)", fontSize:12 }}
                        />
                        <span style={{ fontSize:11, color:"var(--muted)" }}>{part.unit ? `unid.` : "g"}</span>
                        <span style={{ fontSize:11, color:"var(--muted)" }}>{part.kcal} kcal · P{part.protein}g</span>
                      </div>
                    </div>
                    <button onClick={() => setPlateParts(ps => ps.filter((_,j)=>j!==i))}
                      style={{ background:"none", border:"none", color:"var(--muted)", fontSize:14, cursor:"pointer", padding:2 }}>✕</button>
                  </div>
                ))}
                {(() => {
                  const t = plateParts.reduce((a,p)=>({kcal:a.kcal+p.kcal, protein:a.protein+p.protein, carbs:a.carbs+p.carbs, fat:a.fat+p.fat}), {kcal:0,protein:0,carbs:0,fat:0});
                  return (
                    <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:8, marginTop:4 }}>
                      <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:8 }}>
                        {[{l:"Kcal",v:Math.round(t.kcal),c:"var(--text)"},{l:"Prot.",v:Math.round(t.protein)+"g",c:"#a855f7"},{l:"Carbos",v:Math.round(t.carbs)+"g",c:"#60a5fa"},{l:"Grasas",v:Math.round(t.fat)+"g",c:"#f59e0b"}].map(m=>(
                          <div key={m.l} style={{ textAlign:"center" }}>
                            <div style={{ fontSize:14, fontWeight:900, color:m.c }}>{m.v}</div>
                            <div style={{ fontSize:9, color:"var(--muted)" }}>{m.l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <input value={plateName} onChange={e=>setPlateName(e.target.value)}
                          placeholder="Nombre del plato (ej: Arroz con pollo)"
                          style={{ flex:1, background:"var(--panel)", border:"1.5px solid var(--green)", borderRadius:10, padding:"8px 12px", color:"var(--text)", fontSize:13 }} />
                        <button className="primary" style={{ padding:"8px 14px", fontSize:13, flexShrink:0 }}
                          disabled={!plateName.trim()}
                          onClick={() => {
                            logMeal({ name:plateName.trim(), kcal:Math.round(t.kcal), protein:Math.round(t.protein), carbs:Math.round(t.carbs), fat:Math.round(t.fat) });
                            setPlateParts([]); setPlateName(""); setBuildPlate(false);
                            setFoodQuery(""); setSelectedFood(null); setShowSuggestions(true);
                          }}>+ Registrar</button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Search or type food name */}
            <div style={{ position:"relative", marginBottom: foodSuggestions.length > 0 ? 0 : 8, display:"flex", gap:8 }}>
              <input
                value={foodQuery}
                onChange={e => {
                  setFoodQuery(e.target.value);
                  setSelectedFood(null);
                  setShowSuggestions(true);
                  if (!buildPlate) setNewMeal(m => ({ ...m, name: e.target.value }));
                }}
                placeholder={buildPlate ? "Buscar ingrediente para el plato..." : "Buscar alimento o escribir nombre..."}
                style={{ flex:1, background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"10px 12px", color:"var(--text)", fontSize:14 }}
              />
              {!buildPlate && (
                <button
                  onClick={scanBarcode}
                  disabled={barcodeScanning}
                  title="Escanear código de barras"
                  style={{ background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"10px 12px", cursor:"pointer", color:"var(--text)", fontSize:18, flexShrink:0 }}>
                  {barcodeScanning ? "⏳" : "📷"}
                </button>
              )}
            </div>
            {barcodeError && <p style={{ fontSize:12, color:"var(--danger)", margin:"4px 0 8px" }}>{barcodeError}</p>}

            {/* Suggestions dropdown */}
            {foodSuggestions.length > 0 && showSuggestions && (
              <div style={{ background:"var(--panel2)", border:"1px solid var(--border)", borderRadius:10, marginBottom:8, overflow:"hidden" }}>
                {foodSuggestions.map(f => (
                  <button key={f.name} onClick={() => {
                    if (buildPlate) {
                      const factor = f.unit ? ((f.unitWeight||100)/100) : 1;
                      setPlateParts(ps => [...ps, {
                        name:f.name, unit:f.unit, qty:f.unit?1:undefined, grams:f.unit?undefined:100,
                        kcal:Math.round(f.kcal*factor), protein:Math.round(f.protein*factor*10)/10,
                        carbs:Math.round(f.carbs*factor*10)/10, fat:Math.round(f.fat*factor*10)/10,
                        _food:f,
                      }]);
                      setFoodQuery(""); setShowSuggestions(catFilter !== "");
                    } else {
                      selectFoodSuggestion(f);
                    }
                  }}
                    style={{ width:"100%", padding:"9px 12px", background:"none", border:"none", borderBottom:"1px solid var(--line)", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:13, color:"var(--text)", fontWeight:600 }}>{cleanFoodName(f.name)}</span>
                    <span style={{ fontSize:11, color:"var(--muted)" }}>
                      {f.unit
                        ? `${Math.round(f.kcal*(f.unitWeight||100)/100)} kcal/u · P${Math.round(f.protein*(f.unitWeight||100)/100)}g`
                        : `${f.kcal} kcal/100g · P${f.protein}g`}
                    </span>
                  </button>
                ))}
                {!buildPlate && (
                  <button
                    onClick={() => setShowSuggestions(false)}
                    style={{ width:"100%", padding:"8px 12px", background:"rgba(255,255,255,.04)", border:"none", cursor:"pointer", textAlign:"left", fontSize:12, color:"var(--muted)" }}>
                    ✏️ Ingresar macros manualmente →
                  </button>
                )}
              </div>
            )}

            {/* If food selected from DB: show quantity/grams input + auto-calculated preview */}
            {!buildPlate && selectedFood && (
              <div style={{ background:"rgba(168,85,247,.06)", border:"1px solid rgba(168,85,247,.2)", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                {selectedFood.unit ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:12, color:"var(--muted)" }}>Cantidad:</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0.5"
                      step="0.5"
                      value={newMeal.qty || "1"}
                      onChange={e => {
                        const qty = e.target.value;
                        if (qty) {
                          const factor = (Number(qty) * (selectedFood.unitWeight || 100)) / 100;
                          setNewMeal(m => ({
                            ...m,
                            qty,
                            kcal:    String(Math.round(selectedFood.kcal    * factor)),
                            protein: String(Math.round(selectedFood.protein * factor * 10) / 10),
                            carbs:   String(Math.round(selectedFood.carbs   * factor * 10) / 10),
                            fat:     String(Math.round(selectedFood.fat     * factor * 10) / 10),
                          }));
                        } else {
                          setNewMeal(m => ({ ...m, qty, kcal:'', protein:'', carbs:'', fat:'' }));
                        }
                      }}
                      style={{ width:70, background:"var(--panel)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 10px", color:"var(--text)", fontSize:14 }}
                    />
                    <span style={{ fontSize:12, color:"var(--muted)" }}>unidad{newMeal.qty !== "1" ? "es" : ""}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginLeft:4 }}>(~{Math.round((Number(newMeal.qty)||1)*(selectedFood.unitWeight||100))}g)</span>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:"var(--green)", flexShrink:0 }}>Cantidad (g)</label>
                    <input type="number" inputMode="numeric" value={newMeal.grams}
                      onChange={e => {
                        setNewMeal(m => ({ ...m, grams: e.target.value }));
                        if (e.target.value) applyGrams(selectedFood, e.target.value);
                        else setNewMeal(m => ({ ...m, kcal:'', protein:'', carbs:'', fat:'' }));
                      }}
                      placeholder="100"
                      style={{ flex:1, background:"var(--panel)", border:"1px solid var(--green)", borderRadius:8, padding:"6px 10px", color:"var(--text)", fontSize:15, fontWeight:700 }} />
                  </div>
                )}
                {newMeal.kcal && (
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                    {[
                      { label:"Kcal",    val:newMeal.kcal,    color:"var(--text)" },
                      { label:"Prot.",   val:newMeal.protein+"g", color:"#a855f7" },
                      { label:"Carbos",  val:newMeal.carbs+"g",   color:"#60a5fa" },
                      { label:"Grasas",  val:newMeal.fat+"g",     color:"#f59e0b" },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:14, fontWeight:900, color:m.color }}>{m.val}</div>
                        <div style={{ fontSize:10, color:"var(--muted)" }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manual mode: show macro fields if no food selected */}
            {!buildPlate && !selectedFood && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                  <input type="number" inputMode="numeric" value={newMeal.kcal}
                    onChange={e => setNewMeal(m => ({ ...m, kcal: e.target.value }))}
                    placeholder="Kcal *"
                    style={{ background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"10px 12px", color:"var(--text)", fontSize:14 }} />
                  <input type="number" inputMode="numeric" value={newMeal.protein}
                    onChange={e => setNewMeal(m => ({ ...m, protein: e.target.value }))}
                    placeholder="Proteína (g)"
                    style={{ background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"10px 12px", color:"var(--text)", fontSize:14 }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                  <input type="number" inputMode="numeric" value={newMeal.carbs}
                    onChange={e => setNewMeal(m => ({ ...m, carbs: e.target.value }))}
                    placeholder="Carbos (g)"
                    style={{ background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"10px 12px", color:"var(--text)", fontSize:14 }} />
                  <input type="number" inputMode="numeric" value={newMeal.fat}
                    onChange={e => setNewMeal(m => ({ ...m, fat: e.target.value }))}
                    placeholder="Grasas (g)"
                    style={{ background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"10px 12px", color:"var(--text)", fontSize:14 }} />
                </div>
              </>
            )}

            {!buildPlate && (
              <button className="primary" style={{ width:"100%", marginTop:4 }}
                disabled={!foodQuery.trim() || !newMeal.kcal}
                onClick={() => {
                  logMeal({ name: (newMeal.name || foodQuery).trim(), kcal: Number(newMeal.kcal), protein: Number(newMeal.protein||0), carbs: Number(newMeal.carbs||0), fat: Number(newMeal.fat||0) });
                  setNewMeal({ name:"", kcal:"", protein:"", carbs:"", fat:"", grams:"", qty:"1" });
                  setFoodQuery(""); setSelectedFood(null); setShowSuggestions(true);
                }}>
                + Agregar
              </button>
            )}
          </div>}
        </div>
      )}
      </div>
      )}

      {/* ── Plan alimenticio (sub-page) ───────────────────────── */}
      {subPage === "plan" && (
        <div>
          {!nutritionPlan ? (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <p style={{ color:"var(--muted)", fontSize:14, marginBottom:20 }}>No tenés un plan todavía.</p>
              <button className="primary" onClick={() => setSubPage("wizard")}>Crear mi plan</button>
            </div>
          ) : (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:"var(--text)" }}>
                    {nutritionPlan.config?.days} días · {nutritionPlan.config?.mealsPerDay} comidas/día
                  </div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>
                    ~{Math.round(nutritionPlan.dailyKcal)} kcal · {Math.round(nutritionPlan.dailyProtein)}g prot
                  </div>
                </div>
                <button onClick={() => { clearNutritionPlan(); }}
                  style={{ background:"none", border:"1px solid var(--line)", borderRadius:8, padding:"6px 10px", color:"var(--muted)", fontSize:12, cursor:"pointer" }}>
                  Regenerar
                </button>
              </div>
              {nutritionPlan.days?.map(day => {
                const isToday = currentPlanDayIdx != null && day.dayIdx === currentPlanDayIdx;
                return (
                <div key={day.dayIdx} style={{ marginBottom:8 }}>
                  <button onClick={() => setExpandedPlanDay(expandedPlanDay === day.dayIdx ? null : day.dayIdx)}
                    style={{ width:"100%", background: isToday ? "rgba(34,197,94,.08)" : "var(--panel)", border: isToday ? "1px solid rgba(34,197,94,.4)" : "1px solid var(--border)", borderRadius:14, padding:"12px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:14, fontWeight:800, color: isToday ? "var(--green)" : "var(--text)" }}>{isToday ? "Hoy — " : ""}{day.dayName}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:12, color:"var(--muted)" }}>{Math.round(day.kcal)} kcal</span>
                      <span style={{ color:"var(--muted)" }}>{expandedPlanDay === day.dayIdx ? "▲" : "▼"}</span>
                    </div>
                  </button>
                  {expandedPlanDay === day.dayIdx && (
                    <div style={{ background:"var(--panel)", borderRadius:"0 0 14px 14px", padding:"0 14px 14px", borderTop:"none", border:"1px solid var(--border)", borderTopWidth:0, marginTop:-4 }}>
                      {day.meals?.map(meal => (
                        <div key={meal.slot} style={{ paddingTop:12, borderTop:"1px solid rgba(255,255,255,.06)" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:"var(--muted)" }}>{meal.label}</span>
                            <button onClick={() => { logMeal({ name: meal.items.map(i=>i.name).join(" + "), kcal: Math.round(meal.kcal), protein: Math.round(meal.protein), carbs: Math.round(meal.carbs), fat: Math.round(meal.fat) }); if (window.__showToast) window.__showToast("✓ Comida registrada"); }}
                              style={{ background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.25)", borderRadius:6, padding:"2px 8px", cursor:"pointer", fontSize:10, color:"var(--green)", fontWeight:700 }}>
                              Añadir
                            </button>
                          </div>
                          {meal.items?.map((item, i) => (
                            <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                              <span style={{ fontSize:13, color:"var(--text)" }}>{item.name}</span>
                              <span style={{ fontSize:11, color:"var(--muted)" }}>
                                {item.qty}{item.unit ? (item.unitLabel || " u") : "g"} · {Math.round(item.kcal)} kcal
                              </span>
                            </div>
                          ))}
                          <div style={{ fontSize:11, color:"#f59e0b", marginTop:4 }}>
                            {Math.round(meal.kcal)} kcal · P{Math.round(meal.protein)}g · C{Math.round(meal.carbs)}g · G{Math.round(meal.fat)}g
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Wizard: crear plan (sub-page) ────────────────────── */}
      {subPage === "wizard" && (
        <div>
          {wizStep === 0 && (
            <div>
              <p style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>¿Cuántos días querés planificar?</p>
              <p style={{ fontSize:12, color:"var(--muted)", marginBottom:16 }}>Elegí la duración del plan.</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                {[7,15,30,60].map(d => (
                  <button key={d} onClick={() => setWizDays(d)}
                    style={{ padding:"10px 18px", borderRadius:10, border:"1.5px solid", fontWeight:800, fontSize:15, cursor:"pointer",
                      borderColor: wizDays === d ? "var(--green)" : "var(--border)",
                      background: wizDays === d ? "rgba(34,197,94,.1)" : "var(--panel)",
                      color: wizDays === d ? "var(--green)" : "var(--text)" }}>
                    {d}
                  </button>
                ))}
              </div>
              <button className="primary" style={{ width:"100%" }} onClick={() => setWizStep(1)}>Siguiente →</button>
            </div>
          )}
          {wizStep === 1 && (
            <div>
              <p style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>¿Cuántas comidas por día?</p>
              <p style={{ fontSize:12, color:"var(--muted)", marginBottom:16 }}>Incluye desayuno, almuerzo, merienda, cena y colaciones.</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                {[{v:3,l:"3 comidas"},{v:4,l:"4 comidas"},{v:5,l:"5 comidas"},{v:6,l:"6 comidas"}].map(({v,l}) => (
                  <button key={v} onClick={() => setWizMeals(v)}
                    style={{ flex:1, minWidth:120, padding:"12px 10px", borderRadius:10, border:"1.5px solid", fontWeight:700, fontSize:13, cursor:"pointer",
                      borderColor: wizMeals === v ? "var(--green)" : "var(--border)",
                      background: wizMeals === v ? "rgba(34,197,94,.1)" : "var(--panel)",
                      color: wizMeals === v ? "var(--green)" : "var(--text)" }}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ flex:1, padding:"12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--panel)", color:"var(--muted)", cursor:"pointer" }} onClick={() => setWizStep(0)}>← Atrás</button>
                <button className="primary" style={{ flex:2 }} onClick={() => setWizStep(2)}>Siguiente →</button>
              </div>
            </div>
          )}
          {wizStep === 2 && (
            <div>
              <p style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>¿Cuál es tu objetivo?</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                {[{v:"definicion",l:"🔥 Definición",d:"Déficit calórico, mantener músculo"},{v:"mantener",l:"⚖️ Mantenimiento",d:"Calorías de mantenimiento"},{v:"volumen",l:"💪 Volumen",d:"Superávit para ganar músculo"}].map(({v,l,d}) => (
                  <button key={v} onClick={() => setWizGoal(v)}
                    style={{ padding:"12px 14px", borderRadius:10, border:"1.5px solid", cursor:"pointer", textAlign:"left",
                      borderColor: wizGoal === v ? "var(--green)" : "var(--border)",
                      background: wizGoal === v ? "rgba(34,197,94,.08)" : "var(--panel)" }}>
                    <div style={{ fontSize:14, fontWeight:800, color: wizGoal === v ? "var(--green)" : "var(--text)" }}>{l}</div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{d}</div>
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ flex:1, padding:"12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--panel)", color:"var(--muted)", cursor:"pointer" }} onClick={() => setWizStep(1)}>← Atrás</button>
                <button className="primary" style={{ flex:2 }} onClick={() => setWizStep(3)}>Siguiente →</button>
              </div>
            </div>
          )}
          {wizStep === 3 && (
            <div>
              <p style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>¿Tenés restricciones alimentarias?</p>
              <p style={{ fontSize:12, color:"var(--muted)", marginBottom:16 }}>Opcional. Seleccioná todas las que apliquen.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                {[{v:"vegano",l:"🌱 Vegano"},{v:"vegetariano",l:"🥦 Vegetariano"},{v:"sin_lacteos",l:"🥛 Sin lácteos"},{v:"sin_gluten",l:"🌾 Sin gluten"}].map(({v,l}) => {
                  const on = wizRestrictions.includes(v);
                  return (
                    <button key={v} onClick={() => setWizRestrictions(r => on ? r.filter(x=>x!==v) : [...r,v])}
                      style={{ padding:"12px 14px", borderRadius:10, border:"1.5px solid", cursor:"pointer", textAlign:"left",
                        borderColor: on ? "var(--green)" : "var(--border)",
                        background: on ? "rgba(34,197,94,.08)" : "var(--panel)",
                        color: on ? "var(--green)" : "var(--text)", fontWeight:700, fontSize:14 }}>
                      {l} {on ? "✓" : ""}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Alergias o intolerancias</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:24 }}>
                {[
                  {v:"frutos_secos",l:"🥜 Frutos secos"},
                  {v:"huevo",l:"🥚 Huevo"},
                  {v:"pescado",l:"🐟 Pescado"},
                  {v:"mariscos",l:"🦐 Mariscos"},
                  {v:"soja",l:"🫘 Soja"},
                  {v:"mani",l:"🥜 Maní"},
                ].map(({v,l}) => {
                  const on = wizAllergies.includes(v);
                  return (
                    <button key={v} onClick={() => setWizAllergies(r => on ? r.filter(x=>x!==v) : [...r,v])}
                      style={{ padding:"6px 12px", borderRadius:20, border:"1.5px solid", cursor:"pointer", fontSize:12, fontWeight:700,
                        borderColor: on ? "#ef4444" : "var(--border)",
                        background: on ? "rgba(239,68,68,.1)" : "var(--panel)",
                        color: on ? "#ef4444" : "var(--text)" }}>
                      {l} {on ? "✕" : ""}
                    </button>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ flex:1, padding:"12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--panel)", color:"var(--muted)", cursor:"pointer" }} onClick={() => setWizStep(2)}>← Atrás</button>
                <button className="primary" style={{ flex:2 }} onClick={() => setWizStep(4)}>Siguiente →</button>
              </div>
            </div>
          )}
          {wizStep === 4 && (
            <div>
              <p style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>¿Qué tipo de comidas preferís?</p>
              <p style={{ fontSize:12, color:"var(--muted)", marginBottom:16 }}>Opcional. El plan priorizará estas categorías.</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
                {[
                  {v:"principal",l:"🍽 Principales"},{v:"desayuno",l:"☕ Desayunos"},
                  {v:"proteina",l:"🥩 Proteínas"},{v:"legumbre",l:"🫘 Legumbres"},
                  {v:"verdura",l:"🥦 Verduras"},{v:"fruta",l:"🍎 Frutas"},
                  {v:"lacteo",l:"🥛 Lácteos"},{v:"carbohidrato",l:"🍞 Carbohidratos"},
                  {v:"colacion",l:"🥜 Colaciones"},{v:"merienda",l:"🍪 Meriendas"},
                ].map(({v,l}) => {
                  const on = wizLikedCats.includes(v);
                  return (
                    <button key={v} onClick={() => setWizLikedCats(r => on ? r.filter(x=>x!==v) : [...r,v])}
                      style={{ padding:"8px 14px", borderRadius:20, border:"1.5px solid", cursor:"pointer", fontSize:13, fontWeight:700,
                        borderColor: on ? "var(--green)" : "var(--border)",
                        background: on ? "rgba(34,197,94,.1)" : "var(--panel)",
                        color: on ? "var(--green)" : "var(--text)" }}>
                      {l}
                    </button>
                  );
                })}
              </div>
              <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)", borderRadius:12, padding:"12px 14px", marginBottom:20, fontSize:12, color:"var(--muted)" }}>
                <b style={{ color:"var(--text)", display:"block", marginBottom:4 }}>Resumen del plan</b>
                {wizDays} días · {wizMeals} comidas/día · ~{Math.round(targetCal)} kcal/día · {Math.round(proteinG)}g proteína
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ flex:1, padding:"12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--panel)", color:"var(--muted)", cursor:"pointer" }} onClick={() => setWizStep(3)}>← Atrás</button>
                <button className="primary" style={{ flex:2 }} onClick={() => setWizStep(5)}>Siguiente →</button>
              </div>
            </div>
          )}
          {wizStep === 5 && (
            <div>
              <p style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>Preferencias de cocina</p>
              <p style={{ fontSize:12, color:"var(--muted)", marginBottom:16 }}>Opcional. Elegí un estilo de cocina para el plan.</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
                {[{v:"",l:"Sin preferencia"},{v:"italiana",l:"🍝 Italiana"},{v:"mexicana",l:"🌮 Mexicana"},{v:"japonesa",l:"🍣 Japonesa"},{v:"mediterránea",l:"🥗 Mediterránea"},{v:"argentina",l:"🥩 Argentina"},{v:"vegetal",l:"🥬 Vegetal"},{v:"asiática",l:"🥢 Asiática"}].map(({v,l}) => (
                  <button key={v} onClick={() => setWizCuisine(v)}
                    style={{ padding:"8px 14px", borderRadius:20, border:"1.5px solid", cursor:"pointer", fontSize:13, fontWeight:700,
                      borderColor: wizCuisine === v ? "var(--green)" : "var(--border)",
                      background: wizCuisine === v ? "rgba(34,197,94,.1)" : "var(--panel)",
                      color: wizCuisine === v ? "var(--green)" : "var(--text)" }}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)", borderRadius:12, padding:"12px 14px", marginBottom:20, fontSize:12, color:"var(--muted)" }}>
                <b style={{ color:"var(--text)", display:"block", marginBottom:4 }}>Resumen del plan</b>
                {wizDays} días · {wizMeals} comidas/día · ~{Math.round(targetCal)} kcal/día · {Math.round(proteinG)}g proteína
                {wizRestrictions.length > 0 && <span> · {wizRestrictions.length} restricción(es)</span>}
                {wizCuisine && <span> · Cocina {wizCuisine}</span>}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ flex:1, padding:"12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--panel)", color:"var(--muted)", cursor:"pointer" }} onClick={() => setWizStep(4)}>← Atrás</button>
                <button className="primary" style={{ flex:2 }} onClick={handleWizardFinish}>✨ Generar plan</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HolisticSummary({ workouts, prs, userAge, bodyWeight, bodyFatPct, lbm, userGoal }) {
  const totalVolume = workouts.reduce((sum, w) =>
    sum + (w.sets || []).reduce((s2, s) => s2 + (Number(s.weight)||0) * (Number(s.reps)||0), 0), 0);
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets||[]).length, 0);

  // Last 4 weeks volume by week
  const now = new Date();
  const weeklyVols = [0,1,2,3].map(i => {
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - (i+1)*7);
    const weekEnd   = new Date(now); weekEnd.setDate(now.getDate() - i*7);
    return workouts.filter(w => {
      const d = w.date ? new Date(w.date) : null;
      return d && d >= weekStart && d < weekEnd;
    }).reduce((s, w) => s + (w.sets||[]).reduce((s2, s2s) => s2 + (Number(s2s.weight)||0)*(Number(s2s.reps)||0), 0), 0);
  }).reverse();
  const maxVol = Math.max(...weeklyVols, 1);

  // Avg workouts per week (last 4 weeks)
  const last4wWorkouts = workouts.filter(w => {
    const d = w.date ? new Date(w.date) : null;
    return d && (now - d) / 86400000 <= 28;
  });
  const avgPerWeek = (last4wWorkouts.length / 4).toFixed(1);

  // Consistency score 0-100 (workouts in last 28 days, goal 4/wk = 16)
  const consistency = Math.min(100, Math.round((last4wWorkouts.length / 16) * 100));

  // Best muscle group by volume
  const muscleVol = {};
  workouts.slice(0,20).forEach(w => {
    (w.sets||[]).forEach(s => {
      if (!s.exercise) return;
      const m = s.muscleGroup || w.type || "General";
      muscleVol[m] = (muscleVol[m]||0) + (Number(s.weight)||0)*(Number(s.reps)||0);
    });
  });
  const topMuscle = Object.entries(muscleVol).sort((a,b) => b[1]-a[1])[0];

  return (
    <div>
      {/* Score circle + stats */}
      <div style={{ display:"flex", gap:12, alignItems:"center", background:"var(--panel)", border:"1px solid var(--line)", borderRadius:18, padding:"16px", marginBottom:14 }}>
        {/* Consistency circle */}
        {(() => {
          const R=32, C=2*Math.PI*R;
          return (
            <svg width={80} height={80} viewBox="0 0 80 80" style={{ flexShrink:0 }}>
              <circle cx={40} cy={40} r={R} fill="none" stroke="rgba(168,85,247,.12)" strokeWidth={7} />
              <circle cx={40} cy={40} r={R} fill="none" stroke="var(--green)" strokeWidth={7}
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-consistency/100)}
                transform="rotate(-90 40 40)" />
              <text x={40} y={38} textAnchor="middle" fill="var(--text)" fontSize={16} fontWeight={900}>{consistency}</text>
              <text x={40} y={52} textAnchor="middle" fill="var(--muted)" fontSize={9}>/100</text>
            </svg>
          );
        })()}
        <div style={{ flex:1 }}>
          <p style={{ margin:"0 0 4px", fontSize:15, fontWeight:800, color:"var(--text)" }}>Score de consistencia</p>
          <p style={{ margin:"0 0 8px", fontSize:12, color:"var(--muted)" }}>
            {consistency >= 80 ? "Excelente — seguí así." : consistency >= 50 ? "Buena base — intentá sumar un día más/semana." : "Falta constancia — la clave es la frecuencia."}
          </p>
          <div style={{ display:"flex", gap:14 }}>
            <div><span style={{ fontSize:11, color:"var(--muted)" }}>Promedio/semana</span><b style={{ display:"block", fontSize:16, color:"var(--green)" }}>{avgPerWeek}x</b></div>
            <div><span style={{ fontSize:11, color:"var(--muted)" }}>Total entrenos</span><b style={{ display:"block", fontSize:16, color:"var(--green)" }}>{workouts.length}</b></div>
            <div><span style={{ fontSize:11, color:"var(--muted)" }}>PRs totales</span><b style={{ display:"block", fontSize:16, color:"var(--green)" }}>{prs.length}</b></div>
          </div>
        </div>
      </div>

      {/* Volumen 4 semanas */}
      <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"14px 14px 10px", marginBottom:14 }}>
        <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:700 }}>📊 Volumen últimas 4 semanas</p>
        <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:52 }}>
          {weeklyVols.map((v, i) => {
            const h = Math.max(4, (v / maxVol) * 44);
            const isLast = i === 3;
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:9, color:"var(--muted)" }}>{v > 0 ? `${(v/1000).toFixed(1)}t` : ""}</span>
                <div style={{ width:"100%", height:h, borderRadius:"6px 6px 3px 3px", background: isLast ? "var(--green)" : "rgba(168,85,247,.3)", transition:"height .3s" }} />
                <span style={{ fontSize:9, color: isLast ? "var(--green)" : "var(--muted)" }}>
                  {["S-3","S-2","S-1","Esta"][i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Perfil + recomendaciones */}
      {(userAge || bodyWeight) && (
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"12px 14px", marginBottom:12 }}>
          <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700 }}>👤 Tu perfil de entrenamiento</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {userAge && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>Edad · </span><b>{userAge} años</b></div>}
            {bodyWeight && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>Peso · </span><b>{bodyWeight}kg</b></div>}
            {bodyFatPct !== null && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>Grasa · </span><b>{bodyFatPct.toFixed(1)}%</b></div>}
            {lbm !== null && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>LBM · </span><b>{lbm.toFixed(1)}kg</b></div>}
            {bodyWeight && (
              <div style={{ background:"rgba(168,85,247,.07)", borderRadius:10, padding:"6px 12px", fontSize:12, border:"1px solid rgba(168,85,247,.15)" }}>
                <span style={{ color:"var(--muted)" }}>Proteína · </span>
                <b style={{ color:"var(--green)" }}>{Math.round(bodyWeight*(userGoal==="definicion"?2.4:userGoal==="volumen"?2.0:1.8))}–{Math.round(bodyWeight*(userGoal==="definicion"?2.8:userGoal==="volumen"?2.4:2.2))}g/día</b>
              </div>
            )}
            {topMuscle && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>Grupo favorito · </span><b>{topMuscle[0]}</b></div>}
          </div>
          {userAge && (
            <p style={{ margin:"10px 0 0", fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
              {userAge >= 50 ? "⭐ A los 50+ el foco debe ser técnica perfecta, recuperación y proteína alta. Deload cada 4 semanas."
                : userAge >= 40 ? "⭐ La recuperación entre sesiones es clave. Proteína elevada y deload cada 5–6 semanas."
                : userAge >= 30 ? "⭐ Momento óptimo para volumen progresivo. Deload cada 6–8 semanas."
                : "🚀 Pico anabólico — priorizá volumen progresivo y suma cargas semana a semana."}
            </p>
          )}
        </div>
      )}

      {/* Resumen total */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:4 }}>
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"12px 14px" }}>
          <span style={{ fontSize:11, color:"var(--muted)", fontWeight:700, textTransform:"uppercase" }}>Volumen total</span>
          <b style={{ display:"block", fontSize:22, color:"var(--green)", marginTop:2 }}>{(totalVolume/1000).toFixed(1)}t</b>
        </div>
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"12px 14px" }}>
          <span style={{ fontSize:11, color:"var(--muted)", fontWeight:700, textTransform:"uppercase" }}>Series totales</span>
          <b style={{ display:"block", fontSize:22, color:"var(--green)", marginTop:2 }}>{totalSets}</b>
        </div>
      </div>
    </div>
  );
}

function FeaturedReport({ report, prs = [] }) {
  const alerts = report.alerts || (report.alert ? [{ msg: report.alert }] : []);
  const recommendations = report.recommendations || (report.recommendation ? [{ type: "maintain", msg: report.recommendation }] : []);
  return (
    <div className="coach-feature">
      <div className="coach-feature-head">
        <div className="arrow-logo"><Icon name="ArrowRight" size={24} strokeWidth={3} /></div>
        <div>
          <small>{report.sessionType || report.title} · {formatDate(report.date)}</small>
          <h2>{report.title || "Último análisis"}</h2>
        </div>
      </div>

      {prs.length > 0 && (
        <div className="coach-prs">
          <span>Nuevos PRs</span>
          <div className="coach-pr-list">
            {prs.map((pr, i) => (
              <span key={i} className="coach-pr-badge">
                <Icon name="TrendingUp" size={12} /> {pr.exercise}: {pr.weight}kg × {pr.reps}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="coach-status">
        <span>Estado general</span>
        <p>{report.status}</p>
      </div>

      {alerts.length > 0 && (
        <div className="coach-block warn">
          <span><Icon name="AlertTriangle" size={14} /> Alertas</span>
          {alerts.slice(0, 3).map((alert, index) => <p key={index}>{alert.msg || alert}</p>)}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="coach-block rec">
          <span><Icon name="Lightbulb" size={14} /> Recomendaciones</span>
          {recommendations.slice(0, 4).map((rec, index) => (
            <p key={index}>
              {rec.type === "increase" ? <Icon name="TrendingUp" size={14} /> : rec.type === "stabilize" ? <Icon name="Minus" size={14} /> : <Icon name="Check" size={14} />}
              {" "}{rec.msg || rec}
            </p>
          ))}
        </div>
      )}

      <div className="coach-mini-stats">
        <MiniStat label="Volumen" value={`${report.totalVolume || 0} kg`} />
        <MiniStat label="Tipo" value={report.sessionType || "Workout"} />
        <MiniStat label="Fecha" value={formatDate(report.date)} />
      </div>

      <div className="notice compact">
        <b>Recordatorio</b>
        <p>El peso corporal no define todo: mirá fuerza, cintura, volumen y constancia semanal.</p>
      </div>
    </div>
  );
}

function CoachReportCard({ report }) {
  const alerts = report.alerts || (report.alert ? [{ msg: report.alert }] : []);
  const recommendations = report.recommendations || (report.recommendation ? [{ msg: report.recommendation }] : []);
  return (
    <div className="coach-card">
      <small>{formatDate(report.date)}</small>
      <h2>{report.title}</h2>
      <p>{report.status}</p>
      {alerts[0] && <p className="alert">{alerts[0].msg}</p>}
      {recommendations[0] && <strong>{recommendations[0].msg}</strong>}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

