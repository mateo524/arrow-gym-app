import { useMemo, useState, useEffect } from "react";
import MuscleRadarChart from "../components/MuscleRadarChart.jsx";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import Icon from "../components/Icon.jsx";
import { supabase } from "../lib/supabase.js";
import { shareWorkout } from "../lib/shareWorkout.js";
import { todayLocal, dateToLocal } from "../lib/dates.js";
import { buildCoachReport, formatDate, getPeriodizationPhase, getWeeklyFatigueScore, getWeightPrescriptions, getSkippedGroups, getOneRMHistory, getCycleComparison, getMuscleBalance, getWeekComparison, getWorkoutVolume, VOLUME_LANDMARKS, getStagnantExercises, getWeeklyActionableFeedback, calcWorkoutCalories } from "../lib/analytics.js";
import { features } from "../config/features.js";
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
  const declinePlanRecommendation = useStore(s => s.declinePlanRecommendation);
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);

  // Subscription gate — trainers and admins always have access
  const isSubscribed = profile?.subscription_status === "active" || ["trainer","admin","superadmin"].includes(profile?.role);
  if (profile && !isSubscribed) {
    return (
      <section className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "48px 24px" }}>
        <Icon name="Lock" size={48} style={{ display:'block', margin:'0 auto 16px' }} />
        <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Coach IA</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28, maxWidth: 280 }}>
          Analizá tu progreso, recibí recomendaciones personalizadas y optimizá tu entrenamiento con inteligencia artificial.
        </p>
        <button
          className="primary"
          style={{ padding: "13px 28px", borderRadius: 14, fontSize: 14, fontWeight: 700 }}
          onClick={async () => {
            try {
              const { supabase } = await import("../lib/supabase.js");
              const { data, error } = await supabase.functions.invoke("mp-create-subscription");
              if (data?.already_active) { window.__showToast?.("Ya tenés una suscripción activa.", "info"); return; }
              if (!error && data?.init_point) window.location.href = data.init_point;
              else window.__showToast?.("No se pudo iniciar el pago. Intentá de nuevo.", "error");
            } catch { window.__showToast?.("Error de conexión.", "error"); }
          }}
        >
          Suscribirme — $10.000/mes
        </button>
        <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 12 }}>Renovación automática — cancelá cuando quieras</p>
      </section>
    );
  }
  const f = features(profile);

  // Coach toggle — max priority (overrides ui_mode)
  if (profile && (profile.coach_enabled === false)) {
    return (
      <section className="page" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"48px 24px" }}>
        <span style={{ fontSize:56, marginBottom:16 }}>⏸️</span>
        <h2 style={{ margin:"0 0 8px", fontSize:22 }}>Coach pausado</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginBottom:28, maxWidth:280 }}>
          Las sugerencias del coach están desactivadas. Activalas desde Configuración cuando quieras.
        </p>
        <button className="primary" style={{ padding:"12px 24px", fontSize:14 }} onClick={() => useStore.getState().setPage("profile")}>
          Ir a Configuración
        </button>
      </section>
    );
  }

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
  // Proactive coach notifications from daily cron
  const [coachNotif, setCoachNotif] = useState(null); // latest unread coach_insight notif

  // Liga: top preview
  const [leaguePreview, setLeaguePreview] = useState(null); // { rank, total, topName }
  const [wrappedShared, setWrappedShared] = useState(false);
  const [muscleRange, setMuscleRange] = useState("1m"); // "1w","1m","3m","6m","1y","all"
  const [sharing, setSharing] = useState(false);
  const [showProgresoAdvanced, setShowProgresoAdvanced] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  useEffect(() => {
    // Always call — it auto-rotates weekly and refreshes doneCount
    generateWeeklyChallenge();
  }, [workouts.length]);

  useEffect(() => {
    if (!user?.id || profile?.role !== "user") return;
    supabase.rpc("get_my_league").then(({ data }) => {
      if (!data?.length) return;
      const rank = data.findIndex((r) => r.user_id === user.id);
      if (rank === -1) return;
      setLeaguePreview({
        rank: rank + 1,
        total: data.length,
        topName: data[0]?.display_name?.split(" ")[0] || "",
        myWorkouts: data[rank]?.workouts_this_week ?? 0,
      });
    }).catch(() => {});
  }, [user?.id, profile?.role]);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("notifications")
      .select("id, title, body, created_at")
      .eq("user_id", user.id)
      .eq("type", "coach_insight")
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setCoachNotif(data); });
  }, [user?.id]);

  const computed = useMemo(
    () => reports.length ? reports : workouts.slice(0, 12).flatMap((workout) => {
      try { return [buildCoachReport(workout, workouts)]; } catch { return []; }
    }),
    [reports, workouts]
  );
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

    // 4. No rest days: 5+ consecutive training days
    if (workouts.length >= 5) {
      const sortedDates = [...new Set(sortedW.slice(0, 10).map(w => w.date?.slice(0,10)).filter(Boolean))].sort().reverse();
      let consecutive = 0;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const d1 = new Date(sortedDates[i] + "T12:00:00");
        const d2 = new Date(sortedDates[i+1] + "T12:00:00");
        const diff = Math.round((d1 - d2) / 86400000);
        if (diff === 1) { consecutive++; } else { break; }
      }
      if (consecutive >= 4) {
        alerts.push({ type: "rest", msg: `${consecutive + 1} días seguidos entrenando sin descanso. Tu cuerpo necesita al menos 1 día de recuperación por semana para supercompensar.` });
      }
    }

    // 5. Neglected legs: no leg training in 10+ days with 5+ total workouts
    if (workouts.length >= 5) {
      const legWords = ["sentadilla", "pierna", "femoral", "glúteo", "peso muerto", "estocada", "leg press", "hack squat", "hip thrust", "nordico", "pantorrilla"];
      const lastLeg = sortedW.find(w => (w.sets || []).some(s => {
        const g = (s.group || "").toLowerCase();
        const ex = (s.exercise || "").toLowerCase();
        return g === "piernas" || legWords.some(k => ex.includes(k));
      }));
      const daysSinceLeg = lastLeg
        ? Math.floor((now - new Date(lastLeg.date + "T12:00:00")) / 86400000)
        : null;
      if (daysSinceLeg !== null && daysSinceLeg >= 10) {
        alerts.push({ type: "neglect", msg: `Sin entrenamiento de piernas hace ${daysSinceLeg} días. Las piernas son el grupo más grande — no entrenarlas afecta tu hormona de crecimiento y fuerza general.` });
      }
    }

    // 6. Low frequency: < 2 workouts/week average over last 4 weeks
    if (workouts.length >= 3) {
      const fourWAgo = new Date(now - 28 * msPerDay);
      const last4w = workouts.filter(w => w.date && new Date(w.date) >= fourWAgo);
      const avgPerWeek = last4w.length / 4;
      if (avgPerWeek < 2 && avgPerWeek > 0) {
        alerts.push({ type: "frequency", msg: `Promedio de ${avgPerWeek.toFixed(1)} entrenos/semana en las últimas 4 semanas. Para progresar se recomiendan al menos 3 sesiones semanales.` });
      }
    }

    // 7. Body composition alerts — umbrales según Gallagher et al. 2000, Friedl et al. 1994
    if (bodyFatPct !== null) {
      // Umbrales según sexo (Gallagher et al. 2000)
      const sexFlag = profile?.sex || "M";
      const bfHighThresh  = sexFlag === "F" ? 32 : 25;  // obeso: >32% mujeres, >25% hombres
      const bfModThresh   = sexFlag === "F" ? 25 : 20;  // exceso: >25% / >20%
      const bfLowRisk     = sexFlag === "F" ? 14 : 8;   // riesgo bajo: <14% mujeres, <8% hombres
      const bfEssential   = sexFlag === "F" ? 10 : 5;   // grasa esencial — riesgo hormonal severo

      if (bodyFatPct > bfHighThresh) {
        alerts.push({ type: "bodyfat_high", msg: `% grasa elevado (${bodyFatPct.toFixed(1)}%). Gallagher et al. (2000): >25% en hombres / >32% en mujeres se asocia a mayor riesgo metabólico. Objetivo: déficit 300-500 kcal/día ? pérdida de 0.5-1% peso/semana (ISSN 2017). Cardio aeróbico 2-3x/semana complementa el déficit sin comprometer el másculo.` });
      } else if (bodyFatPct > bfModThresh) {
        alerts.push({ type: "bodyfat_mod", msg: `% grasa moderadamente elevado (${bodyFatPct.toFixed(1)}%). Considerá una fase de definición con déficit conservador (300 kcal/día) para llegar al rango óptimo (15-20% hombres, 22-28% mujeres) antes de un ciclo de volumen.` });
      } else if (bodyFatPct < bfEssential) {
        alerts.push({ type: "bodyfat_critical", msg: `⚠️ % grasa crítico (${bodyFatPct.toFixed(1)}%). Por debajo de la grasa esencial (5% hombres, 10% mujeres). Riesgo serio de disfunción hormonal, amenorrea e inmunodepresión (Friedl et al. 1994). Aumentá calorías de inmediato.` });
      } else if (bodyFatPct < bfLowRisk) {
        alerts.push({ type: "bodyfat_low", msg: `% grasa muy bajo (${bodyFatPct.toFixed(1)}%). Valores <8% en hombres (<14% mujeres) pueden comprometer testosterona y rendimiento (Friedl et al. 1994). Priorizar calorías suficientes y proteína =2g/kg.` });
      }
    }

    return alerts;
  }, [workouts, bodyFatPct, profile]);

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
    { id: "resumen",    label: "Resumen"    },
    { id: "plan",       label: "Plan"       },
    { id: "progreso",   label: "Progresión" },
    { id: "alertas",    label: "Alertas"    },
  ];

  // Sub-tabs de plan eliminados — nutrición está en su propia pestaña de la nav

  const MUSCLE_RANGE_LABELS = [
    { key:"1w", label:"1 sem" },
    { key:"1m", label:"1 mes" },
    { key:"3m", label:"3 meses" },
    { key:"6m", label:"6 meses" },
    { key:"1y", label:"1 año" },
    { key:"all", label:"Inicio" },
  ];

  const mealLog = useStore((s) => s.mealLog) || [];

  // -- Muscle freshness / recovery tracker -------------------------------------
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

  // -- Today's macro totals from food log --------------------------------------
  const todayMacros = useMemo(() => {
    const todayStr = todayLocal();
    const todayMeals = mealLog.filter((m) => m.date === todayStr);
    return {
      kcal:    todayMeals.reduce((s, m) => s + (Number(m.kcal)    || 0), 0),
      protein: todayMeals.reduce((s, m) => s + (Number(m.protein) || 0), 0),
      carbs:   todayMeals.reduce((s, m) => s + (Number(m.carbs)   || 0), 0),
      fat:     todayMeals.reduce((s, m) => s + (Number(m.fat)     || 0), 0),
    };
  }, [mealLog]);

  // -- RPE fatigue detection ----------------------------------------------------
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
        alerts.push({ exercise: ex, rpe: recent[0].rpe, msg: `📉 ${ex}: RPE 9+ en ${highRPE} sesiones sin subir peso (${maxW}kg). Considerá una semana de menor intensidad antes de progresar.` });
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
          alerts.push({ exercise: ex, rpe: Math.round(lateRPE * 10) / 10, msg: `⚠️ ${ex}: RPE subió ${rpeRise.toFixed(1)} puntos sin ganancia de carga (${earlyW.toFixed(1)}→${lateW.toFixed(1)}kg). Tu eficiencia bajó — es señal de fatiga acumulada.` });
        }
      }
    });
    return alerts;
  }, [workouts]);

  // -- Stagnant exercises -------------------------------------------------------
  const stagnantExercises = useMemo(() => getStagnantExercises(workouts), [workouts]);

  // -- Weekly actionable feedback -----------------------------------------------
  const weeklyFeedback = useMemo(() => getWeeklyActionableFeedback(workouts), [workouts]);

  // -- Readiness score ----------------------------------------------------------
  const readiness = useMemo(() => {
    const todayStr = todayLocal();
    const todaySleep = sleepLog.find(s => s.date === todayStr) || sleepLog[0];
    const todayWater = waterLog.find(w => w.date === todayStr);

    let score = 50; // base
    // Sleep factor (0-35)
    // Evidencia: <6h sueño ? cortisol +21%, testosterona -24%, síntesis proteica -18% (PMC12610528, 2024)
    // 7-9h = óptimo (NSF, AASM); <5h = riesgo de catabolismo y lesión
    if (todaySleep?.hours) {
      const h = todaySleep.hours;
      score += h >= 7 && h <= 9 ? 35 : h >= 6 ? 15 : h >= 5 ? 0 : -10;
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
      score += 20; // no workouts yet ? fresh
    }
    score = Math.max(10, Math.min(100, score));
    const label = score >= 80 ? "óptimo" : score >= 60 ? "Bueno" : score >= 40 ? "Moderado" : "Recuperate";
    const color = score >= 80 ? "#22c55e" : score >= 60 ? "#a855f7" : score >= 40 ? "#f59e0b" : "#ef4444";
    // Tip mejorado con datos de sueño
    const sleepHours = todaySleep?.hours || 0;
    const sleepTip = sleepHours > 0 && sleepHours < 6
      ? ` 😴 Dormiste ${sleepHours}h — síntesis proteica reducida ~18% (PMC12610528). Bajá el RPE objetivo 1-2 puntos.`
      : sleepHours >= 6 && sleepHours < 7 ? " Dormiste algo menos de lo ideal (7-9h recomendadas)." : "";
    const tip   = (score >= 80 ? "Ideal para entrenar fuerte hoy." : score >= 60 ? "Buen estado — entrenamiento normal." : score >= 40 ? "Reducé el volumen un 15-20% hoy." : "Priorizá recuperación — descanso activo o día libre.") + sleepTip;
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
      return dateToLocal(d);
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
              <Icon name="Share2" size={15} /> {sharing ? <Icon name="Clock" size={14} style={{display:'inline-block',verticalAlign:'middle'}} /> : "Compartir"}
            </button>
          )}
          <button className="back-btn" onClick={() => setPage("home")} aria-label="Back">
            <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* -- Tab bar ------------------------------------------- */}
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

      {/* -- TAB: RESUMEN -------------------------------------- */}
      {tab === "resumen" && (
        <div>
          {/* -- Medidas -- */}
          <div style={{ background:"var(--panel)", borderRadius:16, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:"var(--text)" }}><Icon name="Ruler" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Medidas</p>
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
              {profile?.height_cm && (
                <div style={{ flex:"0 0 auto", minWidth:72, background:"rgba(245,158,11,.07)", border:"1px solid rgba(245,158,11,.2)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                  <p style={{ margin:"0 0 1px", fontSize:10, color:"#f59e0b", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>Talla</p>
                  <p style={{ margin:0, fontSize:16, fontWeight:900, color:"var(--text)" }}>{profile.height_cm}<span style={{ fontSize:10, fontWeight:400, color:"var(--muted)" }}>cm</span></p>
                </div>
              )}
              {profile?.waist_cm && (
                <div style={{ flex:"0 0 auto", minWidth:72, background:"rgba(248,113,113,.07)", border:"1px solid rgba(248,113,113,.2)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                  <p style={{ margin:"0 0 1px", fontSize:10, color:"#f87171", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>Cintura</p>
                  <p style={{ margin:0, fontSize:16, fontWeight:900, color:"var(--text)" }}>{profile.waist_cm}<span style={{ fontSize:10, fontWeight:400, color:"var(--muted)" }}>cm</span></p>
                </div>
              )}
              {profile?.arm_flexed_cm && (
                <div style={{ flex:"0 0 auto", minWidth:72, background:"rgba(52,211,153,.07)", border:"1px solid rgba(52,211,153,.2)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                  <p style={{ margin:"0 0 1px", fontSize:10, color:"#34d399", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>Brazo</p>
                  <p style={{ margin:0, fontSize:16, fontWeight:900, color:"var(--text)" }}>{profile.arm_flexed_cm}<span style={{ fontSize:10, fontWeight:400, color:"var(--muted)" }}>cm</span></p>
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
                const iconName  = status === "listo" ? "CheckCircle" : status === "recuperando" ? null : status === "pronto" ? null : null;
                return (
                  <div key={name} style={{ background: "var(--panel2)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${color}22`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 13, color }}>{iconName ? <Icon name={iconName} size={13} style={{display:'inline-block',verticalAlign:'middle'}} /> : "●"}</div>
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
                <button onClick={generateWeeklyChallenge} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--muted)" }}>? nuevo</button>
              </div>
              <p style={{ margin:"0 0 8px", fontSize:13, color:"var(--text)", lineHeight:1.4 }}>{weeklyChallenge.text}</p>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:11, color:"var(--muted)" }}>{weeklyChallenge.doneCount}/{weeklyChallenge.targetCount}</span>
                <span style={{ fontSize:11, color: weeklyChallenge.doneCount >= weeklyChallenge.targetCount ? "var(--green)" : "var(--muted)" }}>
                  {weeklyChallenge.doneCount >= weeklyChallenge.targetCount ? <><Icon name="CheckCircle" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Completado</> : "En progreso"}
                </span>
              </div>
              <div style={{ background:"var(--panel2)", borderRadius:6, height:8, overflow:"hidden" }}>
                <div style={{ background:"var(--green)", height:"100%", borderRadius:6, width:`${Math.min(100, weeklyChallenge.targetCount > 0 ? (weeklyChallenge.doneCount/weeklyChallenge.targetCount)*100 : 0)}%`, transition:"width .3s" }} />
              </div>
            </div>
          )}

          {/* 📊 Análisis avanzado (colapsable) */}
          <button onClick={() => setShowAdvanced(s => !s)}
            style={{ width:"100%", padding:"8px", borderRadius:10, border:"1px solid var(--line)", background:"var(--panel)", cursor:"pointer", fontSize:12, fontWeight:600, color:"var(--muted)", marginBottom:12 }}>
            {showAdvanced ? <><Icon name="ChevronUp" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Ocultar análisis avanzado</> : <><Icon name="ChevronDown" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Ver análisis avanzado</>}
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
                          <div style={{ fontSize:11, color:"var(--muted)" }}>{best.w}kg — {best.r} reps</div>
                        </div>
                        <div style={{ fontSize:18, fontWeight:900, color:"var(--green)" }}>{Math.round(best.rm)}kg</div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ margin:"8px 0 0", fontSize:10, color:"var(--muted)" }}>Fórmula Epley — Estimación, no reemplaza test real</p>
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
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <h2 style={{ margin:0 }}><Icon name="Trophy" size={16} style={{display:'inline-block',verticalAlign:'middle',marginRight:6}} /> Tu {year} en Loop</h2>
                  <button
                    className="ghost"
                    style={{ fontSize:12, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}
                    onClick={async () => {
                      const volStr = totalVol >= 1000000 ? (totalVol/1000000).toFixed(1)+"M" : totalVol >= 1000 ? (totalVol/1000).toFixed(0)+"k" : String(totalVol);
                      const prsCount = (prs||[]).filter(p=>(p.date||"").startsWith(String(year))).length;
                      const text = `🏆 Mi ${year} en Loop Gym:\n💪 ${yearWorkouts.length} entrenamientos\n🥇 ${prsCount} PRs nuevos\n📊 ${volStr}kg de volumen\n🔥 Ejercicio favorito: ${topEx?.[0] || "–"}\n\nDescargá Loop Gym 🏋️ loop-gym.vercel.app`;
                      try {
                        if (navigator.share) {
                          await navigator.share({ text });
                        } else {
                          await navigator.clipboard.writeText(text);
                          setWrappedShared(true);
                          setTimeout(() => setWrappedShared(false), 2500);
                        }
                      } catch {}
                    }}
                  >
                    <Icon name={wrappedShared ? "Check" : "Share2"} size={13} />
                    {wrappedShared ? "Copiado" : "Compartir"}
                  </button>
                </div>
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

          {/* -- Liga del gimnasio preview ---------------------- */}
          {leaguePreview && (
            <button
              onClick={() => setPage("league")}
              style={{
                width: "100%", textAlign: "left", cursor: "pointer",
                background: "var(--panel)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "12px 14px", marginBottom: 14,
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(168,85,247,.2), rgba(251,191,36,.15))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="Award" size={22} style={{display:'inline-block'}} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Liga del Gimnasio</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Posición {leaguePreview.rank}/{leaguePreview.total} esta semana —{" "}
                  {leaguePreview.myWorkouts} entreno{leaguePreview.myWorkouts !== 1 ? "s" : ""}
                  {leaguePreview.rank === 1 ? <> <Icon name="Trophy" size={13} style={{display:'inline-block',verticalAlign:'middle',color:'#f59e0b'}} /></> : leaguePreview.rank === 2 ? <> <Icon name="Trophy" size={13} style={{display:'inline-block',verticalAlign:'middle',color:'#94a3b8'}} /></> : leaguePreview.rank === 3 ? <> <Icon name="Trophy" size={13} style={{display:'inline-block',verticalAlign:'middle',color:'#b45309'}} /></> : ""}
                </p>
              </div>
              <Icon name="ChevronRight" size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
            </button>
          )}

          {/* -- Proactive coach notification (from daily cron) --- */}
          {coachNotif && (
            <div style={{
              background: "linear-gradient(135deg, rgba(168,85,247,.14) 0%, rgba(124,58,237,.08) 100%)",
              border: "1px solid rgba(168,85,247,.28)",
              borderRadius: 14,
              padding: "12px 14px",
              marginBottom: 14,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}>
              <Icon name="BrainCircuit" size={20} style={{flexShrink:0, marginTop:1}} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13, color: "var(--accent, #a855f7)" }}>
                  {coachNotif.title || "Coach IA"}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                  {coachNotif.body}
                </p>
              </div>
              <button
                className="ghost icon-btn"
                style={{ flexShrink: 0, padding: 2, marginTop: -2 }}
                onClick={() => {
                  setCoachNotif(null);
                  supabase.from("notifications").update({ read: true }).eq("id", coachNotif.id);
                }}
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          )}

        </div>
      )}

      {/* -- TAB: PLAN ----------------------------------------- */}
      {tab === "plan" && (
        <div>
          {workouts.length < 3 ? (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ marginBottom:12, display:'flex', justifyContent:'center' }}><Icon name="Layers" size={48} /></div>
              <h3 style={{ margin:"0 0 8px", fontSize:17 }}>Plan en construcción</h3>
              <p style={{ color:"var(--muted)", fontSize:13, lineHeight:1.5, margin:0 }}>Completá al menos 3 entrenamientos para que el coach genere tu plan personalizado.</p>
            </div>
          ) : (
            <>
              {/* -- Fase de periodización -- */}
              {periodization.phase !== "unknown" && (() => {
                const isDeload = periodization.needsDeload || periodization.phase === "deload";
                const isAccum  = periodization.phase === "accumulation";
                const planType = isDeload ? "deload" : isAccum ? "volume_up" : "intensity_up";
                const isDeclined = activePlanAdjustment?.type === planType && activePlanAdjustment?.declined;
                if (isDeclined) return null;
                const isActive = activePlanAdjustment?.type === planType && !activePlanAdjustment?.declined && (activePlanAdjustment?.expiresAt == null || new Date(activePlanAdjustment?.expiresAt) >= new Date());
                const accent   = isDeload ? "#ef4444" : isAccum ? "var(--green)" : "var(--cyan)";
                const bg       = isDeload ? "rgba(239,68,68,.07)" : isAccum ? "rgba(168,85,247,.07)" : "rgba(117,217,255,.07)";
                const border   = isDeload ? "rgba(239,68,68,.25)" : isAccum ? "rgba(168,85,247,.2)" : "rgba(117,217,255,.2)";
                const icon     = isDeload ? "RotateCcw" : isAccum ? "TrendingUp" : "Dumbbell";
                const label    = periodization.needsDeload ? "Deload recomendado" : isAccum ? "Fase de acumulación" : periodization.phase === "deload" ? "Fase de descarga" : "Fase de intensificación";
                const desc     = periodization.needsDeload
                  ? "Llevas 3+ semanas subiendo volumen. Esta semana bajá el peso al 60% y aumentá las repeticiones (12-20 reps por serie) para que el cuerpo se recupere sin perder calidad."
                  : isAccum ? "Volumen en alza — buena señal. Priorizá técnica perfecta antes de seguir subiendo cargas."
                  : periodization.phase === "deload" ? "Volumen bajando. Si es planificado, perfecto. Si no, revisá fatiga o motivación."
                  : "Volumen estable — momento ideal para subir la intensidad (más kg, mismas series).";
                return (
                  <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:18, padding:"16px", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                      <Icon name={icon} size={28} style={{display:'inline-block',verticalAlign:'middle'}} />
                      <div>
                        <p style={{ margin:0, fontSize:11, color:accent, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em" }}>Fase actual</p>
                        <p style={{ margin:0, fontSize:16, fontWeight:900, color:"var(--text)" }}>{label}</p>
                      </div>
                    </div>
                    <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.55, marginBottom:12 }}>{desc}</p>
                    {isActive ? (
                      <div style={{ background:"rgba(168,85,247,.1)", border:"1px solid rgba(168,85,247,.3)", borderRadius:10, padding:"8px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span style={{ fontSize:12, color:"var(--green)", fontWeight:700 }}><Icon name="CheckCircle" size={12} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Ajuste activo hasta {activePlanAdjustment.expiresAt}</span>
                        <button onClick={clearPlanAdjustment} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:11, cursor:"pointer" }}>Cancelar</button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", gap:8 }}>
                        <button
                          onClick={() => acceptPlanRecommendation(planType, isDeload ? 0.6 : 1)}
                          style={{ flex:1, background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.3)", borderRadius:10, padding:"9px", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--green)" }}>
                          <Icon name="CheckCircle" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Aceptar
                        </button>
                        <button
                          onClick={() => declinePlanRecommendation(planType)}
                          style={{ flex:1, background:"rgba(255,255,255,.04)", border:"1px solid var(--line)", borderRadius:10, padding:"9px", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--muted)" }}>
                          <Icon name="X" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> No ahora
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* -- Carga semanal -- */}
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
                      {fatigueScore.pctChange > 0 ? "↑" : fatigueScore.pctChange < 0 ? "↓" : "="} {Math.abs(fatigueScore.pctChange || 0)}%
                    </span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={{ background:"var(--panel2)", borderRadius:12, padding:"8px 10px" }}>
                      <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Esta semana</p>
                      <b style={{ fontSize:14 }}>{fatigueScore.thisWeek >= 1000 ? (fatigueScore.thisWeek/1000).toFixed(1) + "k" : fatigueScore.thisWeek} kg</b>
                    </div>
                    <div style={{ background:"var(--panel2)", borderRadius:12, padding:"8px 10px" }}>
                      <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Semana ant. (mismo período)</p>
                      <b style={{ fontSize:14 }}>{fatigueScore.lastWeek >= 1000 ? (fatigueScore.lastWeek/1000).toFixed(1) + "k" : fatigueScore.lastWeek} kg</b>
                    </div>
                  </div>
                  {fatigueScore.overreaching && (
                    <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(239,68,68,.2)", display:"flex", gap:8, alignItems:"flex-start" }}>
                      <p style={{ margin:0, fontSize:12, color:"var(--danger)", lineHeight:1.5 }}>
                        Subida de +{fatigueScore.pctChange || 0}% en una semana. Riesgo de sobreentrenamiento — priorizá sueño y descanso activo.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* -- Prescripción -- */}
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
                      <p style={{ margin:0, fontSize:10, color:"var(--muted)" }}>ant. {lastWeight}kg–{lastReps}</p>
                    </div>
                  </div>
                )) : (
                  <p style={{ fontSize:13, color:"var(--muted)", padding:"10px 0" }}>Necesitás al menos 2 entrenamientos del mismo tipo para ver prescripciones.</p>
                )}
              </div>

              {/* -- Adherencia últimas 4 semanas -- */}
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
                      <p style={{ margin:0, fontSize:14, fontWeight:800 }}><Icon name="Target" size={14} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Adherencia al plan</p>
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

              {/* -- Días desde último entreno -- */}
              {workouts.length >= 1 && (() => {
                const last = workouts[0];
                const daysSince = last?.date
                  ? Math.floor((new Date() - new Date(last.date + "T12:00:00")) / 86400000)
                  : null;
                if (daysSince === null) return null;
                const color = daysSince === 0 ? "var(--green)" : daysSince <= 2 ? "#60a5fa" : daysSince <= 4 ? "#f59e0b" : "#ef4444";
                const msg = daysSince === 0 ? <><span>Entrenaste hoy</span> <Icon name="Sparkles" size={13} style={{display:'inline-block',verticalAlign:'middle'}} /></> : daysSince === 1 ? "Ayer fue el último entreno" : `Hace ${daysSince} días sin entrenar`;
                return (
                  <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--panel)", border:`1px solid ${color}33`, borderRadius:14, padding:"12px 14px", marginBottom:12 }}>
                    <span style={{ fontSize:24 }}>{daysSince === 0 ? <Icon name="Flame" size={24} style={{display:'inline-block',verticalAlign:'middle'}} /> : daysSince <= 2 ? <Icon name="CheckCircle" size={24} style={{display:'inline-block',verticalAlign:'middle'}} /> : daysSince <= 4 ? <Icon name="AlertTriangle" size={24} style={{display:'inline-block',verticalAlign:'middle'}} /> : <Icon name="XCircle" size={24} style={{display:'inline-block',verticalAlign:'middle'}} />}</span>
                    <div>
                      <p style={{ margin:"0 0 2px", fontSize:14, fontWeight:800, color }}>{msg}</p>
                      {last?.type && <p style={{ margin:0, fontSize:12, color:"var(--muted)" }}>último: {last.type}</p>}
                    </div>
                  </div>
                );
              })()}

              {/* -- Mejor sesión de la semana -- */}
              {workouts.length >= 1 && (() => {
                const now = new Date();
                const weekStart = new Date(now); weekStart.setDate(now.getDate() - ((now.getDay()+6)%7)); weekStart.setHours(0,0,0,0);
                const thisWeek = workouts.filter(w => w.date && new Date(w.date + "T12:00:00") >= weekStart);
                if (!thisWeek.length) return (
                  <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"12px 14px", marginBottom:12 }}>
                    <p style={{ margin:0, fontSize:13, color:"var(--muted)" }}>Sin entrenamientos esta semana todavía.</p>
                  </div>
                );
                const best = thisWeek.reduce((a, b) => {
                  const va = (a.sets||[]).reduce((s,set) => s + (Number(set.weight)||0)*(Number(set.reps)||0), 0);
                  const vb = (b.sets||[]).reduce((s,set) => s + (Number(set.weight)||0)*(Number(set.reps)||0), 0);
                  return vb > va ? b : a;
                });
                const totalVol = (best.sets||[]).reduce((s,set) => s + (Number(set.weight)||0)*(Number(set.reps)||0), 0);
                const totalSets = (best.sets||[]).length;
                const exercises = [...new Set((best.sets||[]).map(s => s.exercise).filter(Boolean))];
                const groups = [...new Set((best.sets||[]).map(s => s.group).filter(Boolean))];
                return (
                  <div style={{ background:"var(--panel)", border:"1px solid rgba(96,165,250,.3)", borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <Icon name="Trophy" size={20} style={{display:'inline-block',verticalAlign:'middle'}} />
                      <p style={{ margin:0, fontSize:14, fontWeight:800 }}>Mejor sesión esta semana</p>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{best.type || "Entrenamiento"}</span>
                      <span style={{ fontSize:11, color:"var(--muted)" }}>{best.date?.slice(5).replace("-","/")||""}</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:8 }}>
                      {[
                        { label:"Volumen", val: totalVol >= 1000 ? (totalVol/1000).toFixed(1)+"k" : totalVol+"", unit:"kg" },
                        { label:"Series", val: String(totalSets), unit:"sets" },
                        { label:"Ejercicios", val: String(exercises.length), unit:"ex." },
                      ].map(s => (
                        <div key={s.label} style={{ background:"var(--panel2)", borderRadius:10, padding:"8px", textAlign:"center" }}>
                          <div style={{ fontSize:11, color:"var(--muted)", marginBottom:2 }}>{s.label}</div>
                          <div style={{ fontSize:18, fontWeight:900, color:"#60a5fa" }}>{s.val}</div>
                          <div style={{ fontSize:10, color:"var(--muted)" }}>{s.unit}</div>
                        </div>
                      ))}
                    </div>
                    {groups.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                        {groups.map(g => <span key={g} style={{ fontSize:11, background:"rgba(96,165,250,.1)", border:"1px solid rgba(96,165,250,.2)", borderRadius:6, padding:"2px 8px", color:"#60a5fa" }}>{g}</span>)}
                      </div>
                    )}
                    {thisWeek.length > 1 && <p style={{ margin:"8px 0 0", fontSize:11, color:"var(--muted)" }}>{thisWeek.length} sesiones esta semana en total</p>}
                  </div>
                );
              })()}

              {/* -- Historial de las últimas 4 semanas -- */}
              {workouts.length >= 2 && (() => {
                const now = new Date();
                const weeks = [0,1,2,3].map(i => {
                  const end = new Date(now); end.setDate(now.getDate() - i*7);
                  const start = new Date(end); start.setDate(end.getDate() - 6);
                  const ws = workouts.filter(w => {
                    if (!w.date) return false;
                    const d = new Date(w.date + "T12:00:00");
                    return d >= start && d <= end;
                  });
                  const vol = ws.reduce((s,w) => s + (w.sets||[]).reduce((ss,set) => ss + (Number(set.weight)||0)*(Number(set.reps)||0), 0), 0);
                  return { label: i === 0 ? "Esta semana" : `-${i}sem`, count: ws.length, vol: Math.round(vol) };
                }).reverse();
                return (
                  <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                    <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:800 }}><Icon name="Calendar" size={14} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> últimas 4 semanas</p>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                      {weeks.map(w => (
                        <div key={w.label} style={{ background:"var(--panel2)", borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                          <div style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>{w.label}</div>
                          <div style={{ fontSize:20, fontWeight:900, color: w.count >= 3 ? "var(--green)" : w.count >= 1 ? "#f59e0b" : "var(--muted)" }}>{w.count}</div>
                          <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>sesiones</div>
                          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", marginTop:4 }}>
                            {w.vol >= 1000 ? (w.vol/1000).toFixed(1)+"k" : w.vol} kg
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* -- Grupos sin entrenar -- */}
              {skippedGroups.length > 0 && (
                <div style={{ background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.2)", borderRadius:14, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <Icon name="AlertTriangle" size={20} style={{display:'inline-block',verticalAlign:'middle'}} />
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
                  <h2 style={{ marginBottom:10 }}><Icon name="Lightbulb" size={16} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Ejercicios sugeridos</h2>
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
          )}
        </div>
      )}

      {/* -- TAB: PROGRESIÓN ----------------------------------- */}
      {tab === "progreso" && (
        <div>
          {!progression.length && !topExercises.length && !prs.length ? (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ marginBottom:12, display:'flex', justifyContent:'center' }}><Icon name="BarChart2" size={48} /></div>
              <h3 style={{ margin:"0 0 8px", fontSize:17 }}>Sin datos aún</h3>
              <p style={{ color:"var(--muted)", fontSize:13, lineHeight:1.5, margin:0 }}>Completá más entrenamientos para ver tu progresión por ejercicio y grupo muscular.</p>
            </div>
          ) : (
            <>
              {/* -- Header: grupos activos + sparkline -- */}
              {(() => {
                const activeGroups = Object.entries(muscleBalance).filter(([,v]) => v.sets > 0).length;
                const totalGroups = Object.keys(muscleBalance).length;
                // Weekly volumes for sparkline
                const now = new Date();
                const volSpark = [6,5,4,3,2,1,0].map(i => {
                  const start = new Date(now); start.setDate(start.getDate() - start.getDay() - i*7 + 1);
                  const end = new Date(start); end.setDate(end.getDate() + 6);
                  return workouts.filter(w => w.date && w.date >= dateToLocal(start) && w.date <= dateToLocal(end))
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
                        {volSpark[volSpark.length-1] >= 1000 ? (volSpark[volSpark.length-1]/1000).toFixed(1) + "k" : Math.round(volSpark[volSpark.length-1])} kg esta semana
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

              {/* -- Coach insights adaptativos -- */}
              {f.coach_insights && (() => {
                const hoy = todayLocal();
                const wDates = [...new Set((workouts||[]).map(w => w.date?.slice(0,10)).filter(Boolean))].sort().reverse();
                // Streak
                let racha = 0;
                const d = new Date();
                while (true) {
                  const iso = dateToLocal(d);
                  if (wDates.includes(iso)) { racha++; d.setDate(d.getDate() - 1); }
                  else break;
                }
                // Week days
                const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
                const monStr = dateToLocal(mon);
                const semana = wDates.filter(x => x >= monStr && x <= hoy).length;
                // Avg days last 4 weeks
                let totalD = 0, wkCnt = 0;
                for (let w = 1; w <= 4; w++) {
                  const end = new Date(mon); end.setDate(end.getDate() - w * 7);
                  const start = new Date(end); start.setDate(start.getDate() - 6);
                  const days = wDates.filter(x => x >= dateToLocal(start) && x <= dateToLocal(end)).length;
                  totalD += days; if (days > 0) wkCnt++;
                }
                const avgSem = wkCnt > 0 ? (totalD / wkCnt).toFixed(1) : "–";
                // Weight trend (last 30 days)
                const weightEntries = [...(weightLog||[])].sort((a,b) => String(a.date).localeCompare(b.date));
                const recentWeight = weightEntries.filter(e => e.date >= monStr);
                const lastMonthWeight = weightEntries.filter(e => {
                  const m = new Date(); m.setDate(m.getDate() - 30);
                  return e.date >= dateToLocal(m);
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
                const volLast = (workouts||[]).filter(w => w.date >= dateToLocal(lastWeekStart) && w.date <= dateToLocal(lastWeekEnd)).reduce((s, w) => s + getWorkoutVolume(w), 0);
                const volTrend = volLast > 0 ? Math.round((volThis - volLast) / volLast * 100) : null;
                // Water compliance
                const waterWeek = [...(waterLog||[])].filter(e => e.date >= monStr);
                const waterAvg = waterWeek.length > 0
                  ? (waterWeek.reduce((s, e) => s + Number(e.glasses), 0) / waterWeek.length)
                  : null;

                const insights = [];
                // Consistency
                if (racha >= 3) insights.push({ icon:"Flame", text:`Racha de ${racha} días entrenando`, color:"var(--green)" });
                else if (semana > 0) insights.push({ icon:"Calendar", text:`${semana} días esta semana (prom. ${avgSem}/sem)`, color:"var(--text)" });
                else insights.push({ icon:"XCircle", text:"Sin entrenos esta semana", color:"var(--muted)" });

                // Weight trend vs goal
                if (wTrend !== null && Math.abs(Number(wTrend)) >= 0.3) {
                  const dir = Number(wTrend) > 0 ? "subiste" : "bajaste";
                  const iconKey = userGoal === "definicion" && Number(wTrend) < 0 ? "CheckCircle" :
                    userGoal === "volumen" && Number(wTrend) > 0 ? "CheckCircle" : "AlertTriangle";
                  insights.push({ icon:iconKey, text:`${dir} ${Math.abs(Number(wTrend))}kg en 30 días`, color:iconKey === "CheckCircle" ? "var(--green)" : "#f59e0b" });
                }
                // Sleep
                if (sleepAvg !== null) {
                  const ok = Number(sleepAvg) >= 7;
                  insights.push({ icon:"Moon", text:`Sueño: ${sleepAvg}h promedio${ok ? " — óptimo" : " — ideal =7h"}`, color:ok ? "var(--green)" : "#f59e0b" });
                }
                // Volume trend
                if (volTrend !== null && !isNaN(volTrend)) {
                  const dir = volTrend > 0 ? "↑" : "↓";
                  insights.push({ icon:"TrendingUp", text:`Volumen ${dir} ${Math.abs(volTrend)}% vs semana pasada`, color:volTrend > 0 ? "var(--green)" : "var(--muted)" });
                }
                // Water
                if (waterAvg !== null && waterGoal) {
                  const ok = waterAvg >= waterGoal;
                  insights.push({ icon:"Droplet", text:`Agua: ${waterAvg.toFixed(0)}/${waterGoal} vasos${ok ? " ✓" : ""}`, color:ok ? "var(--green)" : "#f59e0b" });
                }
                // Body composition
                if (bodyFatPct !== null && lbm !== null) {
                  insights.push({ icon:"Scale", text:`Grasa: ${bodyFatPct.toFixed(1)}% — Masa magra: ${lbm.toFixed(1)}kg`, color:"var(--text)" });
                }

                return (
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12 }}>
                    {insights.slice(0, 5).map((ins, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:"var(--panel)", borderRadius:10, padding:"7px 10px" }}>
                        <Icon name={ins.icon} size={16} style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}} />
                        <span style={{ fontSize:12, color:ins.color, lineHeight:1.4 }}>{ins.text}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* -- Top cards: PRs + grupo + medidas -- */}
              <div style={{ display:"flex", gap:8, marginBottom:14, overflow:"auto", flexWrap:"nowrap" }}>
                {/* Top 3 PRs */}
                {prs.slice(0,3).map((pr,i) => (
                  <div key={i} style={{ flex:"0 0 auto", minWidth:120, background:"rgba(232,247,119,.07)", border:"1px solid rgba(232,247,119,.15)", borderRadius:12, padding:"8px 10px" }}>
                    <p style={{ margin:"0 0 2px", fontSize:10, color:"var(--yellow)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>PR #{i+1}</p>
                    <p style={{ margin:0, fontSize:13, fontWeight:800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{pr.exercise}</p>
                    <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--text)" }}>{pr.weight}kg — {pr.reps}</p>
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
                  <p style={{ margin:0, fontSize:13, fontWeight:800 }}>{bodyWeight ? `${bodyWeight}kg` : "–"}</p>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--muted)" }}>Ver todo →</p>
                </div>
              </div>

              {/* -- Análisis detallado -- */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ flex:1, height:1, background:"var(--line)" }} />
                <span style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>Análisis detallado</span>
                <div style={{ flex:1, height:1, background:"var(--line)" }} />
              </div>

              <>
              {/* -- Racha semanal -- */}
              {workouts.length >= 2 && (() => {
                // Count consecutive weeks (Mon-Sun) with =2 sessions
                const now = new Date();
                let streak = 0;
                for (let i = 0; i < 52; i++) {
                  const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay()+6)%7) - i*7); mon.setHours(0,0,0,0);
                  const sun = new Date(mon); sun.setDate(mon.getDate()+6); sun.setHours(23,59,59,999);
                  const count = workouts.filter(w => {
                    const d = w.date ? new Date(w.date + "T12:00:00") : null;
                    return d && d >= mon && d <= sun;
                  }).length;
                  if (count >= 2) streak++;
                  else if (i > 0) break; // break only after checking at least current week
                  else if (i === 0) {} // skip current week if not enough yet
                }
                // Also compute avg days between sessions
                const dates = workouts.filter(w => w.date).map(w => new Date(w.date + "T12:00:00")).sort((a,b) => b-a);
                let avgGap = null;
                if (dates.length >= 2) {
                  let totalGap = 0;
                  for (let i = 0; i < Math.min(dates.length-1, 8); i++) {
                    totalGap += Math.abs(dates[i] - dates[i+1]) / 86400000;
                  }
                  avgGap = (totalGap / Math.min(dates.length-1, 8)).toFixed(1);
                }
                return (
                  <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                    <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:800 }}><Icon name="Calendar" size={14} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Consistencia</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <div style={{ background:"var(--panel2)", borderRadius:12, padding:"12px", textAlign:"center" }}>
                        <div style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>Racha semanal</div>
                        <div style={{ fontSize:28, fontWeight:900, color: streak >= 4 ? "var(--green)" : streak >= 2 ? "#f59e0b" : "var(--muted)" }}>{streak}</div>
                        <div style={{ fontSize:11, color:"var(--muted)" }}>semanas seguidas</div>
                      </div>
                      <div style={{ background:"var(--panel2)", borderRadius:12, padding:"12px", textAlign:"center" }}>
                        <div style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>Cadencia</div>
                        <div style={{ fontSize:28, fontWeight:900, color: avgGap <= 2.5 ? "var(--green)" : avgGap <= 4 ? "#f59e0b" : "#ef4444" }}>{avgGap ?? "–"}</div>
                        <div style={{ fontSize:11, color:"var(--muted)" }}>días entre sesiones</div>
                      </div>
                    </div>
                    <p style={{ margin:"10px 0 0", fontSize:12, color:"var(--muted)" }}>
                      {avgGap <= 2.5 ? "Frecuencia excelente. Estás entrenando de forma muy regular." : avgGap <= 4 ? "Buena frecuencia. Intentá reducir el tiempo entre sesiones." : "Hay brechas largas entre entrenamientos. La consistencia supera a la intensidad."}
                    </p>
                  </div>
                );
              })()}

              {/* -- Series por grupo este mes -- */}
              {workouts.length >= 1 && (() => {
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const GROUPS = ["Piernas","Espalda","Pecho","Hombros","Brazos","Core"];
                const COLORS = { Piernas:"#a855f7", Espalda:"#60a5fa", Pecho:"#f472b6", Hombros:"#fb923c", Brazos:"#34d399", Core:"#facc15" };
                const sets = {};
                GROUPS.forEach(g => { sets[g] = 0; });
                workouts.filter(w => w.date && new Date(w.date + "T12:00:00") >= monthStart).forEach(w => {
                  (w.sets||[]).forEach(s => { if (sets[s.group] !== undefined) sets[s.group]++; });
                });
                const total = Object.values(sets).reduce((a,b) => a+b, 0);
                if (!total) return null;
                const maxSets = Math.max(...Object.values(sets), 1);
                const sorted = GROUPS.filter(g => sets[g] > 0).sort((a,b) => sets[b]-sets[a]);
                return (
                  <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:800 }}><Icon name="Dumbbell" size={14} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Series por grupo este mes</p>
                      <span style={{ fontSize:12, color:"var(--muted)" }}>{total} series total</span>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      {sorted.map(g => {
                        const pct = Math.round((sets[g] / maxSets) * 100);
                        return (
                          <div key={g}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                              <span style={{ fontSize:12, fontWeight:600 }}>{g}</span>
                              <span style={{ fontSize:12, fontWeight:700, color:COLORS[g] }}>{sets[g]}</span>
                            </div>
                            <div style={{ height:7, background:"var(--panel2)", borderRadius:4, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pct}%`, background:COLORS[g], borderRadius:4, transition:"width .4s" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* -- Día de la semana más activo -- */}
              {workouts.length >= 3 && (() => {
                const DAY_NAMES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
                const counts = Array(7).fill(0);
                workouts.slice(0, 40).forEach(w => {
                  if (!w.date) return;
                  const d = new Date(w.date + "T12:00:00");
                  counts[d.getDay()]++;
                });
                const maxCount = Math.max(...counts, 1);
                const favDay = counts.indexOf(Math.max(...counts));
                return (
                  <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                    <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:800 }}><Icon name="Calendar" size={14} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Días más activos</p>
                    <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:52 }}>
                      {DAY_NAMES.map((day, i) => {
                        const h = Math.max(8, Math.round((counts[i] / maxCount) * 44));
                        const isFav = i === favDay && counts[i] > 0;
                        return (
                          <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                            <div style={{ width:"100%", height:h, background: isFav ? "var(--green)" : counts[i] ? "rgba(168,85,247,.5)" : "var(--panel2)", borderRadius:4, transition:"height .4s" }} />
                            <span style={{ fontSize:9, color: isFav ? "var(--green)" : "var(--muted)", fontWeight: isFav ? 800 : 400 }}>{day}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ margin:"8px 0 0", fontSize:12, color:"var(--muted)" }}>
                      Tu día favorito es el <b style={{ color:"var(--green)" }}>{DAY_NAMES[favDay]}</b> ({counts[favDay]} sesiones en el historial).
                    </p>
                  </div>
                );
              })()}

              {/* -- Tendencia de peso -- */}
              {weightLog.length >= 2 && (() => {
                const pts = [...weightLog]
                  .filter(e => e.date && e.kg)
                  .sort((a, b) => String(a.date).localeCompare(String(b.date)))
                  .slice(-12);
                if (pts.length < 2) return null;
                const weights = pts.map(e => Number(e.kg));
                const minW = Math.min(...weights);
                const maxW = Math.max(...weights);
                const range = maxW - minW || 1;
                const W = 280; const H = 56;
                const px = (i) => Math.round((i / (pts.length - 1)) * W);
                const py = (v) => Math.round(H - ((v - minW) / range) * (H - 8) - 4);
                const points = pts.map((e, i) => `${px(i)},${py(Number(e.kg))}`).join(" ");
                const first = weights[0]; const last = weights[weights.length - 1];
                const diff = last - first;
                const trendColor = diff < -0.5 ? "#60a5fa" : diff > 0.5 ? "#f87171" : "var(--green)";
                return (
                  <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:800 }}>
                        <Icon name="TrendingUp" size={14} style={{ display:"inline-block", verticalAlign:"middle", marginRight:4 }} /> Tendencia de peso
                      </p>
                      <span style={{ fontSize:13, fontWeight:800, color: trendColor }}>
                        {diff >= 0 ? "+" : ""}{diff.toFixed(1)} kg
                      </span>
                    </div>
                    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block", overflow:"visible" }}>
                      <polyline points={points} fill="none" stroke={trendColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                      {pts.map((e, i) => (
                        <circle key={i} cx={px(i)} cy={py(Number(e.kg))} r="3" fill={trendColor} />
                      ))}
                    </svg>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10, color:"var(--muted)" }}>
                      <span>{pts[0].date}</span>
                      <span>{pts[pts.length-1].date}</span>
                    </div>
                  </div>
                );
              })()}

              {/* -- Frecuencia por músculo -- */}
              {workouts.length >= 2 && (() => {
                const freq = {};
                workouts.slice(0, 30).forEach(w => {
                  const seen = new Set();
                  (w.sets || []).forEach(s => {
                    const m = s.muscleGroup || w.type || "General";
                    if (!seen.has(m)) { freq[m] = (freq[m] || 0) + 1; seen.add(m); }
                  });
                });
                const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 7);
                if (!sorted.length) return null;
                const maxF = sorted[0][1];
                const MUSCLE_COLOR = { Pecho:"#60a5fa", Espalda:"#a855f7", Piernas:"#f59e0b", Hombros:"#34d399", Bíceps:"#f87171", Tríceps:"#fb923c", Core:"#e879f9", General:"var(--muted)" };
                return (
                  <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                    <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:800 }}>
                      <Icon name="BarChart2" size={14} style={{ display:"inline-block", verticalAlign:"middle", marginRight:4 }} /> Frecuencia por músculo
                    </p>
                    {sorted.map(([muscle, count]) => {
                      const pct = Math.round((count / maxF) * 100);
                      const color = MUSCLE_COLOR[muscle] || "var(--green)";
                      return (
                        <div key={muscle} style={{ marginBottom:8 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:3 }}>
                            <span style={{ fontWeight:700 }}>{muscle}</span>
                            <span style={{ color:"var(--muted)" }}>{count} sesiones</span>
                          </div>
                          <div style={{ height:6, background:"rgba(255,255,255,.07)", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:3, transition:"width .4s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              </>
            </>
          )}
        </div>
      )}

      {/* -- TAB: ALERTAS -------------------------------------- */}
      {tab === "alertas" && (
        <div>
          {smartAlerts.length === 0 && skippedGroups.length === 0 && !fatigueScore.overreaching && workouts.length >= 2 && (
            <div style={{ display:"flex", gap:10, alignItems:"flex-start", background:"rgba(168,85,247,.07)", border:"1px solid rgba(168,85,247,.2)", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
              <Icon name="Sparkles" size={20} style={{flexShrink:0}} />
              <div>
                <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"var(--text)" }}>Todo bien por ahora</p>
                <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>No se detectan alertas activas. Seguí entrenando con consistencia.</p>
              </div>
            </div>
          )}
          {workouts.length < 2 && (
            <div className="notice"><b>Pocos datos</b><p>Registrá al menos 2 entrenamientos para activar el sistema de alertas.</p></div>
          )}

          {/* All alerts — collapsible when > 3 */}
          {(() => {
            const allAlerts = [
              ...(fatigueScore.overreaching ? [{
                key: "overreaching",
                bg: "rgba(239,68,68,.08)", border: "rgba(239,68,68,.3)",
                icon: "AlertTriangle", title: "Sobrecarga detectada",
                msg: `Tu volumen subió un ${fatigueScore.pctChange || 0}% de golpe. Riesgo de sobreentrenamiento — priorizá descanso esta semana.`
              }] : []),
              ...smartAlerts.map((a, i) => ({
                key: `smart-${i}`,
                bg: a.type === "imbalance" || a.type === "bodyfat_high" ? "rgba(239,68,68,.07)" : a.type === "bodyfat_low" ? "rgba(96,165,250,.08)" : a.type === "stall" ? "rgba(96,165,250,.08)" : "rgba(245,158,11,.08)",
                border: a.type === "imbalance" || a.type === "bodyfat_high" ? "rgba(239,68,68,.25)" : a.type === "bodyfat_low" ? "rgba(96,165,250,.3)" : a.type === "stall" ? "rgba(96,165,250,.3)" : "rgba(245,158,11,.3)",
                icon: a.type === "stall" ? "TrendingDown" : a.type === "volume" ? "BarChart2" : a.type === "rest" ? "Moon" : a.type === "neglect" ? "Activity" : a.type === "frequency" ? "Calendar" : "AlertTriangle",
                title: a.type === "stall" ? "Estancamiento de peso" : a.type === "volume" ? "Caída de volumen" : a.type === "rest" ? "Sin días de descanso" : a.type === "neglect" ? "Piernas abandonadas" : a.type === "frequency" ? "Frecuencia baja" : a.type === "bodyfat_high" ? "% Grasa elevado" : a.type === "bodyfat_low" ? "% Grasa muy bajo" : "Desbalance muscular",
                msg: a.msg
              })),
              ...stagnantExercises.map((item, i) => ({
                key: `stagnant-${i}`,
                bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.3)",
                icon: "TrendingDown",
                title: `Estancamiento: ${item.exercise}`,
                msg: `${item.weeks} sem. sin progreso — Mejor: ${item.bestWeight}kg — ${item.suggestion}`
              })),
              ...weeklyFeedback.map((msg, i) => ({
                key: `feedback-${i}`,
                bg: "rgba(168,85,247,.07)", border: "rgba(168,85,247,.25)",
                icon: "Heart", title: null, msg
              })),
              ...rpeFatigueAlerts.map((a, i) => ({
                key: `rpe-${i}`,
                bg: "rgba(168,85,247,.07)", border: "rgba(168,85,247,.25)",
                icon: "Zap", title: "Fatiga acumulada por RPE", msg: a.msg
              })),
              ...(skippedGroups.length > 0 ? [{
                key: "skipped",
                bg: "rgba(239,68,68,.07)", border: "rgba(239,68,68,.25)",
                icon: "AlertTriangle", title: "Grupos sin entrenar",
                msg: `No entrenaste ${skippedGroups.join(", ")} en las últimas 4 semanas. Tu programa está desequilibrado.`
              }] : []),
            ];
            const LIMIT = 3;
            const visible = showAllAlerts ? allAlerts : allAlerts.slice(0, LIMIT);
            const hidden = allAlerts.length - LIMIT;
            return (
              <>
                {visible.map(a => (
                  <div key={a.key} style={{ display:"flex", gap:10, alignItems:"flex-start", background:a.bg, border:`1px solid ${a.border}`, borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
                    <Icon name={a.icon} size={20} style={{flexShrink:0}} />
                    <div>
                      {a.title && <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"var(--text)" }}>{a.title}</p>}
                      <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>{a.msg}</p>
                    </div>
                  </div>
                ))}
                {allAlerts.length > LIMIT && (
                  <button onClick={() => setShowAllAlerts(p => !p)} style={{ width:"100%", background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer", color:"var(--muted)", marginBottom:10 }}>
                    {showAllAlerts ? <><Icon name="ChevronUp" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Mostrar menos</> : <><Icon name="ChevronDown" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Ver {hidden} alerta{hidden !== 1 ? "s" : ""} más</>}
                  </button>
                )}
              </>
            );
          })()}

          {/* Disclaimer */}
          <p style={{ fontSize: 10, color: 'var(--muted)', margin: '0 0 12px', opacity: 0.7, textAlign: 'center' }}>
            Las sugerencias son orientativas. Consultá un profesional de salud ante cualquier dolor o lesión.
          </p>

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
                  Volumen semanal por másculo (esta semana)
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
                          {sets} series — {status === "overtrained" ? <><Icon name="AlertTriangle" size={11} style={{display:'inline-block',verticalAlign:'middle',marginRight:2}} /> Exceso</> : status === "optimal" ? <><Icon name="CheckCircle" size={11} style={{display:'inline-block',verticalAlign:'middle',marginRight:2}} /> óptimo</> : status === "undertrained" ? <><Icon name="TrendingDown" size={11} style={{display:'inline-block',verticalAlign:'middle',marginRight:2}} /> Bajo</> : "Sin entrenar"}
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
                  <span>• = MEV (mínimo efectivo)</span>
                  <span>• = MAV (óptimo)</span>
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
                    Llevás 3+ semanas aumentando volumen. Esta semana bajó el peso al 60% y aumentá las repeticiones (12-20 reps por serie) — tu cuerpo lo necesita para recuperarse y seguir progresando.
                  </p>
                </div>
              </div>
              {activePlanAdjustment?.type === "deload" && !activePlanAdjustment?.declined && new Date(activePlanAdjustment?.expiresAt) >= new Date() ? (
                <div style={{ background:"rgba(168,85,247,.1)", border:"1px solid rgba(168,85,247,.3)", borderRadius:10, padding:"8px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, color:"var(--green)", fontWeight:700 }}><Icon name="CheckCircle" size={12} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Deload activo — pesos reducidos al 60% hasta {activePlanAdjustment.expiresAt}</span>
                  <button onClick={clearPlanAdjustment} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:11, cursor:"pointer" }}>Cancelar</button>
                </div>
              ) : activePlanAdjustment?.type === "deload" && activePlanAdjustment?.declined ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <p style={{ margin:0, fontSize:12, color:"var(--muted)" }}>Deload declinado.</p>
                  <button onClick={clearPlanAdjustment} style={{ background:"none", border:"none", color:"rgba(245,158,11,.8)", fontSize:11, cursor:"pointer", textDecoration:"underline" }}>Reactivar</button>
                </div>
              ) : (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => acceptPlanRecommendation("deload", 0.6)}
                    style={{ flex:1, background:"rgba(245,158,11,.15)", border:"1px solid rgba(245,158,11,.4)", borderRadius:10, padding:"9px", cursor:"pointer", fontSize:13, fontWeight:700, color:"#f59e0b" }}>
                    <Icon name="CheckCircle" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Aceptar deload (60% peso, 12-20 reps)
                  </button>
                  <button onClick={() => declinePlanRecommendation("deload")}
                    style={{ flex:1, background:"rgba(255,255,255,.04)", border:"1px solid var(--line)", borderRadius:10, padding:"9px", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--muted)" }}>
                    <Icon name="X" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Declinar
                  </button>
                </div>
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
  // -- Proteínas ------------------------------------------------
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
  // -- Lácteos --------------------------------------------------
  { cat:"lacteo", name:"Queso cottage",             kcal:98,  protein:11,  carbs:3,   fat:4.5  },
  { cat:"lacteo", name:"Yogur griego (0%)",         kcal:59,  protein:10,  carbs:4,   fat:0.4  },
  { cat:"lacteo", name:"Yogur griego (entero)",     kcal:97,  protein:9,   carbs:4,   fat:5    },
  { cat:"lacteo", name:"Yogur natural descremado",  kcal:56,  protein:5,   carbs:7,   fat:0.3  },
  { cat:"lacteo", name:"Yogur bebible (125ml)",     kcal:70,  protein:3,   carbs:12,  fat:1.2, drink:true },
  { cat:"lacteo", name:"Queso descremado",          kcal:102, protein:14,  carbs:1,   fat:5    },
  { cat:"lacteo", name:"Queso port salut",          kcal:291, protein:22,  carbs:1,   fat:22   },
  { cat:"lacteo", name:"Queso mozzarella",          kcal:280, protein:22,  carbs:2,   fat:20   },
  { cat:"lacteo", name:"Queso brie",                kcal:334, protein:21,  carbs:0.5, fat:28   },
  { cat:"lacteo", name:"Queso cheddar",             kcal:402, protein:25,  carbs:1.3, fat:33   },
  { cat:"lacteo", name:"Queso parmesano",           kcal:431, protein:38,  carbs:3,   fat:29   },
  { cat:"lacteo", name:"Queso crema",               kcal:342, protein:6,   carbs:4,   fat:34   },
  { cat:"lacteo", name:"Ricota",                    kcal:174, protein:11,  carbs:3,   fat:13   },
  { cat:"lacteo", name:"Leche descremada (250ml)",  kcal:85,  protein:8.5, carbs:12.5,fat:0.3, drink:true },
  { cat:"lacteo", name:"Leche entera (250ml)",      kcal:153, protein:8,   carbs:12,  fat:8,   drink:true },
  { cat:"lacteo", name:"Leche de avena (250ml)",    kcal:120, protein:3,   carbs:20,  fat:3,   drink:true },
  { cat:"lacteo", name:"Leche de almendra (250ml)", kcal:60,  protein:1,   carbs:8,   fat:2.5, drink:true },
  { cat:"lacteo", name:"Crema de leche",            kcal:340, protein:2,   carbs:3,   fat:36   },
  { cat:"lacteo", name:"Manteca",                   kcal:717, protein:0.9, carbs:0.1, fat:81   },
  { cat:"lacteo", name:"Kéfir natural",             kcal:61,  protein:3.4, carbs:4.5, fat:3.3, drink:true },
  // -- Bebidas --------------------------------------------------
  { cat:"bebida", name:"Agua",                      kcal:0,   protein:0,   carbs:0,   fat:0,   drink:true },
  { cat:"bebida", name:"Jugo de naranja natural",   kcal:45,  protein:0.7, carbs:10.4,fat:0.2, drink:true },
  { cat:"bebida", name:"Leche entera",              kcal:61,  protein:3.2, carbs:4.8, fat:3.3, drink:true },
  { cat:"bebida", name:"Leche descremada",          kcal:34,  protein:3.4, carbs:5,   fat:0.1, drink:true },
  { cat:"bebida", name:"Kéfir natural",             kcal:61,  protein:3.4, carbs:4.5, fat:3.3, drink:true },
  { cat:"bebida", name:"Té verde",                  kcal:2,   protein:0,   carbs:0.4, fat:0,   drink:true },
  { cat:"bebida", name:"Café negro",                kcal:2,   protein:0.3, carbs:0,   fat:0,   drink:true },
  { cat:"bebida", name:"Jugo de manzana natural",   kcal:46,  protein:0.1, carbs:11,  fat:0.1, drink:true },
  // -- Carbohidratos --------------------------------------------
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
  { cat:"carbohidrato", name:"ñoquis cocidos",          kcal:130, protein:3.5, carbs:27,  fat:1    },
  { cat:"carbohidrato", name:"Quinoa cocida",           kcal:120, protein:4.4, carbs:21,  fat:1.9  },
  { cat:"carbohidrato", name:"Polenta cocida",          kcal:70,  protein:1.6, carbs:15,  fat:0.3  },
  { cat:"carbohidrato", name:"Cuscús cocido",           kcal:112, protein:3.8, carbs:23,  fat:0.2  },
  { cat:"carbohidrato", name:"Mijo cocido",             kcal:119, protein:3.5, carbs:23,  fat:1    },
  { cat:"carbohidrato", name:"Chipa (c/u)",             kcal:100, protein:3,   carbs:13,  fat:4,   unit:true, unitWeight:40 },
  { cat:"carbohidrato", name:"Maíz cocido",             kcal:108, protein:3.4, carbs:23,  fat:1.3  },
  { cat:"carbohidrato", name:"Miel (1 cda)",            kcal:64,  protein:0.1, carbs:17,  fat:0    },
  { cat:"carbohidrato", name:"Mermelada (1 cda)",       kcal:49,  protein:0.1, carbs:13,  fat:0    },
  { cat:"carbohidrato", name:"Dulce de leche (1 cda)",  kcal:70,  protein:1.5, carbs:13,  fat:1.5  },
  // -- Grasas saludables ----------------------------------------
  { cat:"grasa", name:"Palta/aguacate",          kcal:160, protein:2,   carbs:9,   fat:15   },
  { cat:"grasa", name:"Almendras",               kcal:579, protein:21,  carbs:22,  fat:50   },
  { cat:"grasa", name:"Nueces",                  kcal:654, protein:15,  carbs:14,  fat:65   },
  { cat:"grasa", name:"Castañas de cajú",        kcal:553, protein:18,  carbs:30,  fat:44   },
  { cat:"grasa", name:"Maní tostado",            kcal:585, protein:24,  carbs:16,  fat:50   },
  { cat:"grasa", name:"Manteca de maní",          kcal:588, protein:25,  carbs:20,  fat:50   },
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
  // -- Legumbres ------------------------------------------------
  { cat:"legumbre", name:"Lentejas cocidas",        kcal:116, protein:9,   carbs:20,  fat:0.4  },
  { cat:"legumbre", name:"Garbanzos cocidos",       kcal:164, protein:8.9, carbs:27,  fat:2.6  },
  { cat:"legumbre", name:"Porotos negros cocidos",  kcal:132, protein:8.9, carbs:24,  fat:0.5  },
  { cat:"legumbre", name:"Porotos blancos cocidos", kcal:139, protein:9.7, carbs:25,  fat:0.5  },
  { cat:"legumbre", name:"Porotos colorados",       kcal:127, protein:8.7, carbs:23,  fat:0.5  },
  { cat:"legumbre", name:"Edamame",                 kcal:122, protein:11,  carbs:10,  fat:5    },
  { cat:"legumbre", name:"Arvejas cocidas",         kcal:81,  protein:5.4, carbs:14,  fat:0.4  },
  { cat:"legumbre", name:"Soja cocida",             kcal:173, protein:17,  carbs:10,  fat:9    },
  { cat:"legumbre", name:"Hummus (100g)",           kcal:177, protein:8,   carbs:20,  fat:8    },
  // -- Frutas ---------------------------------------------------
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
  { cat:"fruta", name:"Ananás/Piña",       kcal:50,  protein:0.5, carbs:13,  fat:0.1  },
  { cat:"fruta", name:"Mango",            kcal:60,  protein:0.8, carbs:15,  fat:0.4  },
  { cat:"fruta", name:"Papaya",           kcal:43,  protein:0.5, carbs:11,  fat:0.3  },
  { cat:"fruta", name:"Higo",             kcal:74,  protein:0.8, carbs:19,  fat:0.3, unit:true, unitWeight:50  },
  { cat:"fruta", name:"Maracuyá",         kcal:97,  protein:2.2, carbs:23,  fat:0.7  },
  { cat:"fruta", name:"Uva pasa (30g)",   kcal:85,  protein:0.9, carbs:22,  fat:0.1  },
  { cat:"fruta", name:"Coco rallado (30g)",kcal:100, protein:1,  carbs:4,   fat:9    },
  // -- Verduras -------------------------------------------------
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
  // -- Desayunos ------------------------------------------------
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
  { cat:"desayuno", name:"Café con leche (200ml)",      kcal:64,  protein:4,   carbs:6,   fat:2,   drink:true },
  { cat:"desayuno", name:"Mate cocido con leche",       kcal:55,  protein:3.5, carbs:5.5, fat:2,   drink:true },
  // -- Meriendas ------------------------------------------------
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
  // -- Colaciones -----------------------------------------------
  { cat:"colacion", name:"Huevo duro",                  kcal:85,  protein:7,   carbs:0.5, fat:6,   unit:true, unitWeight:55  },
  { cat:"colacion", name:"Yogur griego + 1 fruta",      kcal:130, protein:10,  carbs:18,  fat:1    },
  { cat:"colacion", name:"Maní tostado (30g)",          kcal:176, protein:7,   carbs:5,   fat:15   },
  { cat:"colacion", name:"Mix de frutas secas (30g)",   kcal:175, protein:5,   carbs:8,   fat:14   },
  { cat:"colacion", name:"Pistacho (30g)",              kcal:173, protein:6,   carbs:9,   fat:14   },
  { cat:"colacion", name:"Hummus con verduras crudas",  kcal:120, protein:5,   carbs:14,  fat:5    },
  { cat:"colacion", name:"Hummus con pita",             kcal:220, protein:7,   carbs:32,  fat:8    },
  { cat:"colacion", name:"Queso cottage (150g)",        kcal:147, protein:17,  carbs:5,   fat:7    },
  { cat:"colacion", name:"Edamame (100g)",              kcal:122, protein:11,  carbs:10,  fat:5    },
  { cat:"colacion", name:"Fruta + manteca de maní",     kcal:185, protein:5,   carbs:22,  fat:9    },
  { cat:"colacion", name:"Palta con limón (½)",         kcal:120, protein:1.5, carbs:6,   fat:11   },
  { cat:"colacion", name:"Arroz con leche (150g)",      kcal:185, protein:5,   carbs:34,  fat:3.5  },
  { cat:"colacion", name:"Chocolate amargo (20g)",      kcal:114, protein:1.8, carbs:9,   fat:8    },
  { cat:"colacion", name:"Chips de papa (30g)",         kcal:160, protein:2,   carbs:15,  fat:10   },
  { cat:"colacion", name:"Palomitas/pochoclos (30g)",   kcal:110, protein:3,   carbs:19,  fat:3    },
  { cat:"colacion", name:"Dátiles (3 unid)",            kcal:66,  protein:0.5, carbs:18,  fat:0.1  },
  { cat:"colacion", name:"Pepino con hummus",           kcal:65,  protein:3,   carbs:9,   fat:2.5  },
  { cat:"colacion", name:"Chips de arroz (15g)",        kcal:57,  protein:1,   carbs:12,  fat:0.4  },
  { cat:"colacion", name:"Chocolate con leche (20g)",   kcal:107, protein:1.5, carbs:12,  fat:6    },
  // -- Entradas -------------------------------------------------
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
  // -- Platos principales ---------------------------------------
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
  { cat:"principal", name:"ñoquis con salsa",            kcal:190, protein:6,   carbs:30,  fat:5    },
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
  // -- Postres --------------------------------------------------
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
  // -- Bebidas --------------------------------------------------
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
  // -- Suplementos ----------------------------------------------
  { cat:"suplemento", name:"Whey protein (scoop 30g)", kcal:120, protein:24,  carbs:3,   fat:2    },
  { cat:"suplemento", name:"Creatina (5g)",             kcal:0,   protein:0,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"BCAA (10g)",                kcal:40,  protein:9,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"Caseína (30g)",             kcal:110, protein:22,  carbs:4,   fat:1    },
  { cat:"suplemento", name:"Mass gainer (100g)",        kcal:380, protein:25,  carbs:60,  fat:4    },
  // -- Comidas rápidas ------------------------------------------
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
  // -- Desayunos adicionales -------------------------------------
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
  // -- Colaciones adicionales -------------------------------------
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
  // -- Entradas adicionales -------------------------------------
  { cat:"entrada", name:"Empanada de espinaca y ricota",kcal:255, protein:8,  carbs:28,  fat:12,  unit:true, unitWeight:100 },
  { cat:"entrada", name:"Empanada caprese",            kcal:265, protein:9,   carbs:27,  fat:13,  unit:true, unitWeight:100 },
  { cat:"entrada", name:"Pasteles de carne (c/u)",     kcal:310, protein:12,  carbs:30,  fat:15,  unit:true, unitWeight:115 },
  { cat:"entrada", name:"Suprema napolitana s/pan",    kcal:340, protein:32,  carbs:10,  fat:18,  unit:true, unitWeight:180 },
  { cat:"entrada", name:"Ensalada de lentejas",        kcal:140, protein:8,   carbs:20,  fat:3    },
  { cat:"entrada", name:"Ensalada griega",             kcal:150, protein:5,   carbs:8,   fat:11   },
  { cat:"entrada", name:"Sopa de arvejas",             kcal:110, protein:6,   carbs:18,  fat:1.5  },
  { cat:"entrada", name:"Tortilla española (porción)", kcal:190, protein:8,   carbs:15,  fat:10,  unit:true, unitWeight:130 },
  // -- Postres adicionales ---------------------------------------
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
  // -- Meriendas adicionales -------------------------------------
  { cat:"merienda", name:"Tostado de pavita",          kcal:310, protein:17,  carbs:30,  fat:12,  unit:true, unitWeight:140 },
  { cat:"merienda", name:"Tostado vegetal",            kcal:270, protein:10,  carbs:30,  fat:11,  unit:true, unitWeight:130 },
  { cat:"merienda", name:"Budín de naranja (porción)", kcal:240, protein:3.5, carbs:35,  fat:10   },
  { cat:"merienda", name:"Scone (c/u)",                kcal:210, protein:4,   carbs:28,  fat:9,   unit:true, unitWeight:70  },
  { cat:"merienda", name:"Bizcochitos de queso (x5)",  kcal:165, protein:4.5, carbs:20,  fat:7.5  },
  { cat:"merienda", name:"Wrap de queso y verdura",    kcal:200, protein:8,   carbs:24,  fat:7,   unit:true, unitWeight:130 },
  // -- Bebidas adicionales ---------------------------------------
  { cat:"bebida", name:"Licuado verde (kale+pepino+manzana)",kcal:90,protein:2,carbs:20,  fat:0.5  },
  { cat:"bebida", name:"Smoothie de frutilla (300ml)", kcal:120, protein:2,   carbs:27,  fat:0.5  },
  { cat:"bebida", name:"Leche de avena+cacao (250ml)", kcal:145, protein:3.5, carbs:25,  fat:4    },
  { cat:"bebida", name:"Agua de coco (250ml)",         kcal:45,  protein:0.5, carbs:11,  fat:0.5  },
  { cat:"bebida", name:"Jugo de pomelo natural",       kcal:38,  protein:0.5, carbs:9,   fat:0.1  },
  { cat:"bebida", name:"Mate (sin azúcar)",            kcal:4,   protein:0.3, carbs:0.5, fat:0    },
  { cat:"bebida", name:"Té (sin azúcar)",              kcal:2,   protein:0,   carbs:0.4, fat:0    },
  { cat:"bebida", name:"Sprite/Fanta (350ml)",         kcal:142, protein:0,   carbs:38,  fat:0    },
  { cat:"bebida", name:"Jugo en caja (200ml)",         kcal:90,  protein:0.3, carbs:22,  fat:0    },
  // -- Suplementos adicionales -----------------------------------
  { cat:"suplemento", name:"Colágeno hidrolizado (10g)",kcal:38, protein:9,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"Pre-entreno (1 scoop)",    kcal:20,  protein:2,   carbs:3,   fat:0    },
  { cat:"suplemento", name:"Glutamina (5g)",           kcal:20,  protein:5,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"Omega 3 (1g cápsula)",     kcal:9,   protein:0,   carbs:0,   fat:1    },
  { cat:"suplemento", name:"Proteína de arroz (30g)",  kcal:113, protein:22,  carbs:3,   fat:2    },
  { cat:"suplemento", name:"Proteína de guisante (30g)",kcal:110,protein:21,  carbs:4,   fat:1.5  },
  // -- Clásicos argentinos -----------------------------------
  { cat:"principal", name:"Matambre arrollado (100g)",    kcal:185, protein:20,  carbs:2,   fat:11   },
  { cat:"principal", name:"Revuelto gramajo",             kcal:210, protein:14,  carbs:18,  fat:9    },
  { cat:"principal", name:"Mondongo guisado (300g)",      kcal:220, protein:18,  carbs:14,  fat:9    },
  { cat:"principal", name:"Cazuela de vacuno",            kcal:175, protein:16,  carbs:14,  fat:6    },
  { cat:"principal", name:"Carne al horno con papas",     kcal:200, protein:20,  carbs:16,  fat:7    },
  { cat:"principal", name:"Puchero (plato 400g)",         kcal:240, protein:18,  carbs:22,  fat:8    },
  { cat:"principal", name:"Pollo al disco",               kcal:220, protein:22,  carbs:10,  fat:10   },
  { cat:"principal", name:"Churrasco a la plancha",       kcal:215, protein:30,  carbs:0,   fat:10,  unit:true, unitWeight:180 },
  { cat:"principal", name:"Bifecito de paleta",           kcal:170, protein:26,  carbs:0,   fat:7,   unit:true, unitWeight:150 },
  { cat:"principal", name:"Matambre a la pizza",          kcal:280, protein:24,  carbs:6,   fat:18   },
  { cat:"principal", name:"Tarta pascualina (porción)",   kcal:230, protein:9,   carbs:22,  fat:12,  unit:true, unitWeight:160 },
  { cat:"principal", name:"Humitas (c/u)",                kcal:190, protein:5,   carbs:30,  fat:6,   unit:true, unitWeight:130 },
  { cat:"principal", name:"Tamales (c/u)",                kcal:220, protein:8,   carbs:28,  fat:9,   unit:true, unitWeight:140 },
  { cat:"principal", name:"Sopa de cebolla gratinada",    kcal:180, protein:8,   carbs:18,  fat:8    },
  { cat:"principal", name:"Carne guisada con verduras",   kcal:190, protein:18,  carbs:14,  fat:7    },
  { cat:"principal", name:"Milanese de soja",             kcal:280, protein:16,  carbs:28,  fat:10,  unit:true, unitWeight:110 },
  { cat:"entrada",   name:"Picada variada",               kcal:280, protein:13,  carbs:12,  fat:22   },
  { cat:"entrada",   name:"Matambre con chimichurri",     kcal:220, protein:22,  carbs:2,   fat:14   },
  { cat:"entrada",   name:"Ensalada rusa (150g)",         kcal:160, protein:3,   carbs:18,  fat:9    },
  { cat:"postre",    name:"Pionono relleno (porción)",    kcal:300, protein:5,   carbs:40,  fat:13,  unit:true, unitWeight:110 },
  { cat:"colacion",  name:"Maní con pasas de uva (30g)",  kcal:155, protein:4.5, carbs:16,  fat:8    },
  { cat:"colacion",  name:"Quesillo con miel (porción)",  kcal:130, protein:8,   carbs:12,  fat:6    },
  { cat:"bebida",    name:"Tereré (500ml)",               kcal:5,   protein:0.3, carbs:1,   fat:0,   drink:true },
  { cat:"bebida",    name:"Mate con azúcar",              kcal:20,  protein:0.3, carbs:5,   fat:0,   drink:true },
  { cat:"bebida",    name:"Licuado de durazno (300ml)",   kcal:135, protein:3.5, carbs:26,  fat:2    },
  { cat:"carbohidrato", name:"Chipa guazú (porción)",     kcal:220, protein:7,   carbs:24,  fat:10   },
  { cat:"carbohidrato", name:"Pan casero (rebanada)",     kcal:200, protein:5,   carbs:38,  fat:3    },
  { cat:"carbohidrato", name:"Tortilla de campo (c/u)",   kcal:190, protein:5,   carbs:32,  fat:5,   unit:true, unitWeight:80  },
  { cat:"proteina",  name:"Asado de tira (100g)",         kcal:280, protein:23,  carbs:0,   fat:20   },
  { cat:"proteina",  name:"Morcilla (100g)",              kcal:355, protein:15,  carbs:2,   fat:32   },
  { cat:"proteina",  name:"Chorizo parrillero (c/u)",     kcal:290, protein:13,  carbs:2,   fat:25,  unit:true, unitWeight:100 },
  { cat:"proteina",  name:"Cordero patagónico (100g)",    kcal:258, protein:25,  carbs:0,   fat:17   },
  { cat:"proteina",  name:"Chinchulines (100g)",          kcal:230, protein:16,  carbs:0,   fat:18   },
  { cat:"proteina",  name:"Molleja (100g)",               kcal:250, protein:18,  carbs:0,   fat:19   },
];

// --- Plan de alimentación generator ----------------------------------------
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
  // Only strip if parenthetical contains digits or quantity units
  return name.replace(/\s*\(\s*[^)]*\d[^)]*\)\s*$/i, '').trim();
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
        <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:700 }}><Icon name="BarChart2" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Volumen últimas 4 semanas</p>
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
          <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700 }}><Icon name="Dumbbell" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:4}} /> Tu perfil de entrenamiento</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {userAge && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>Edad — </span><b>{userAge} años</b></div>}
            {bodyWeight && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>Peso — </span><b>{bodyWeight}kg</b></div>}
            {bodyFatPct !== null && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>Grasa — </span><b>{bodyFatPct.toFixed(1)}%</b></div>}
            {lbm !== null && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>LBM — </span><b>{lbm.toFixed(1)}kg</b></div>}
            {bodyWeight && (
              <div style={{ background:"rgba(168,85,247,.07)", borderRadius:10, padding:"6px 12px", fontSize:12, border:"1px solid rgba(168,85,247,.15)" }}>
                <span style={{ color:"var(--muted)" }}>Proteína — </span>
                <b style={{ color:"var(--green)" }}>{Math.round(bodyWeight*(userGoal==="definicion"?2.4:userGoal==="volumen"?2.0:1.8))}–{Math.round(bodyWeight*(userGoal==="definicion"?2.8:userGoal==="volumen"?2.4:2.2))}g/día</b>
              </div>
            )}
            {topMuscle && <div style={{ background:"var(--panel2)", borderRadius:10, padding:"6px 12px", fontSize:12 }}><span style={{ color:"var(--muted)" }}>Grupo favorito — </span><b>{topMuscle[0]}</b></div>}
          </div>
          {userAge && (
            <p style={{ margin:"10px 0 0", fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
              {userAge >= 50 ? <><Icon name="BrainCircuit" size={12} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> A los 50+ el foco debe ser técnica perfecta, recuperación y proteína alta. Deload cada 4 semanas.</>
                : userAge >= 40 ? <><Icon name="Timer" size={12} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> La recuperación entre sesiones es clave. Proteína elevada y deload cada 5–6 semanas.</>
                : userAge >= 30 ? <><Icon name="TrendingUp" size={12} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Momento óptimo para volumen progresivo. Deload cada 6–8 semanas.</>
                : <><Icon name="Zap" size={12} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Pico anabólico — priorizá volumen progresivo y suma cargas semana a semana.</>}
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
          <small>{report.sessionType || report.title} — {formatDate(report.date)}</small>
          <h2>{report.title || "último análisis"}</h2>
        </div>
      </div>

      {prs.length > 0 && (
        <div className="coach-prs">
          <span>Nuevos PRs</span>
          <div className="coach-pr-list">
            {prs.map((pr, i) => (
              <span key={i} className="coach-pr-badge">
                <Icon name="TrendingUp" size={12} /> {pr.exercise}: {pr.weight}kg — {pr.reps}
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


