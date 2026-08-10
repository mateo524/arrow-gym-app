import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import useAuthStore from "../store/useAuthStore.js";
import useStore from "../store/useStore.js";
import { EXERCISE_DATABASE } from "../data/exerciseDatabase.js";
import Icon from "../components/Icon.jsx";
import AssignRoutineModal from "../components/AssignRoutineModal.jsx";
import { getGroupTotals, filterCurrentWeek } from "../lib/analytics.js";

/*
  SQL para crear la tabla invite_codes (ejecutar en Supabase SQL editor):

  CREATE TABLE invite_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id UUID REFERENCES auth.users(id),
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Trainers can manage their own codes" ON invite_codes FOR ALL USING (trainer_id = auth.uid());
  CREATE POLICY "Anyone can read codes" ON invite_codes FOR SELECT USING (true);
*/

/** Genera un código alfanumérico de 8 caracteres */
function generateShortCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Detecta ejercicios en plateau (sin mejora en las últimas 3 sesiones) */
function detectPlateaus(workouts) {
  const exerciseSessions = {};
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  sorted.forEach((w) => {
    (w.sets || []).forEach((s) => {
      if (!s.exercise || !Number(s.weight) || !Number(s.reps)) return;
      if (!exerciseSessions[s.exercise]) exerciseSessions[s.exercise] = [];
      exerciseSessions[s.exercise].push({ weight: Number(s.weight), reps: Number(s.reps), date: w.date });
    });
  });
  const plateaus = [];
  Object.entries(exerciseSessions).forEach(([exercise, sets]) => {
    const byDate = {};
    sets.forEach((s) => {
      if (!byDate[s.date] || s.weight > byDate[s.date].weight) byDate[s.date] = s;
    });
    const sessions = Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    if (sessions.length < 3) return;
    const maxWeights = sessions.map((s) => s.weight);
    const allSame = maxWeights.slice(0, 3).every((w) => Math.abs(w - maxWeights[0]) / Math.max(1, maxWeights[0]) < 0.03);
    if (allSame) plateaus.push({ exercise, weight: maxWeights[0], sessions: sessions.length });
  });
  return plateaus;
}

export default function TrainerPage() {
  const profile = useAuthStore((s) => s.profile);
  const setPage = useStore((s) => s.setPage);
  const isAdmin = profile?.role === "superadmin";

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientRoutines, setClientRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  // adherence: { [userId]: Set<'YYYY-MM-DD'> }
  const [adherenceMap, setAdherenceMap] = useState({});
  // lastWorkoutMap: { [userId]: 'YYYY-MM-DD' } — fecha del último entrenamiento (histórico)
  const [lastWorkoutMap, setLastWorkoutMap] = useState({});
  // lastMoodMap: { [userId]: 'tired'|'good'|'great' } — mood del último entrenamiento
  const [lastMoodMap, setLastMoodMap] = useState({});
  // Filtro del banner de churn: mostrar sólo alumnos en riesgo/inactivos
  const [showChurnOnly, setShowChurnOnly] = useState(false);
  // Tab principal: "alumnos" | "pagos"
  const [trainerTab, setTrainerTab] = useState("alumnos");
  const [saving, setSaving] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Pending student requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [respondingId, setRespondingId] = useState(null);

  // Invite code state
  const [inviteCode, setInviteCode] = useState(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Analytics state for selected client
  const [clientWorkouts, setClientWorkouts] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [deleteRoutineTarget, setDeleteRoutineTarget] = useState(null);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [routineName, setRoutineName] = useState("");
  const [routineDayIndex, setRoutineDayIndex] = useState("");
  const [routineNotes, setRoutineNotes] = useState("");
  const [routineGroupName, setRoutineGroupName] = useState("");
  const [exercises, setExercises] = useState([]);

  // Program Builder state
  const [templates, setTemplates] = useState([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [saveTemplateProgramName, setSaveTemplateProgramName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showApplyProgram, setShowApplyProgram] = useState(false); // { programName, client }
  const [applyingProgram, setApplyingProgram] = useState(false);
  const [showLoadTemplate, setShowLoadTemplate] = useState(false);

  const catalogNames = EXERCISE_DATABASE.map((e) => e.name);

  useEffect(() => {
    loadClients();
    loadInviteCode();
    loadTemplates();
    loadPendingRequests();
  }, []);

  async function loadPendingRequests() {
    if (!profile?.id) return;
    const { data } = await supabase
      .from("trainer_requests")
      .select("id, student_id, created_at, profiles:student_id(name, email)")
      .eq("trainer_id", profile.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setPendingRequests(data || []);
  }

  async function respondToRequest(requestId, newStatus) {
    setRespondingId(requestId);
    await supabase.rpc("respond_trainer_request", { request_id: requestId, new_status: newStatus });
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    if (newStatus === "accepted") loadClients();
    setRespondingId(null);
  }

  async function loadInviteCode() {
    if (!profile?.id) return;
    const { data } = await supabase
      .from("invite_codes")
      .select("code")
      .eq("trainer_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.code) setInviteCode(data.code);
  }

  async function generateInviteCode() {
    if (!profile?.id) return;
    setInviteLoading(true);
    const code = generateShortCode();
    const { error } = await supabase
      .from("invite_codes")
      .insert({ trainer_id: profile.id, code });
    if (!error) {
      setInviteCode(code);
    }
    setInviteLoading(false);
  }

  async function copyInviteLink() {
    if (!inviteCode) return;
    const link = `${window.location.origin}/#/join/${inviteCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    } catch {
      // fallback: select text manually
    }
  }

  async function loadClients() {
    if (!profile?.id) { setLoading(false); return; }
    setLoading(true);
    const query = isAdmin
      ? supabase.from("profiles").select("*").eq("role", "user")
      : supabase.from("profiles").select("*").eq("role", "user").eq("trainer_id", profile.id);
    const { data } = await query.order("name");
    const loadedClients = data || [];
    setClients(loadedClients);
    setLoading(false);
    if (loadedClients.length > 0) {
      await loadAdherence(loadedClients.map((c) => c.id));
    }
  }

  async function loadAdherence(clientIds) {
    if (!clientIds || clientIds.length === 0) return;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    // Query workouts logged by clients in the last 7 days
    // Adjust table/column names if your schema differs
    const { data, error } = await supabase
      .from("user_workouts")
      .select("user_id, date")
      .in("user_id", clientIds)
      .gte("date", sevenDaysAgoStr)
      .order("date", { ascending: false });

    if (error) {
      // Table might not exist yet — silently skip adherence display
      console.warn("adherence query failed:", error.message);
      return;
    }

    // Build map: { userId -> Set<'YYYY-MM-DD'> }
    const map = {};
    (data || []).forEach(({ user_id, date }) => {
      const d = date?.slice(0, 10);
      if (!d) return;
      if (!map[user_id]) map[user_id] = new Set();
      map[user_id].add(d);
    });
    setAdherenceMap(map);

    // Segunda query: último entrenamiento histórico por alumno (sin límite de fecha),
    // para calcular el semáforo de adherencia y detectar churn (>7 días).
    const { data: allData, error: allError } = await supabase
      .from("user_workouts")
      .select("user_id, date, mood")
      .in("user_id", clientIds)
      .order("date", { ascending: false })
      .limit(clientIds.length * 10);

    if (allError) {
      console.warn("last-workout query failed:", allError.message);
      return;
    }

    const lastMap = {};
    const moodMap = {};
    (allData || []).forEach(({ user_id, date, mood }) => {
      const d = date?.slice(0, 10);
      if (!d) return;
      // Los resultados vienen ordenados desc, así que el primero es el más reciente
      if (!lastMap[user_id]) {
        lastMap[user_id] = d;
        if (mood) moodMap[user_id] = mood;
      }
    });
    setLastWorkoutMap(lastMap);
    setLastMoodMap(moodMap);
  }

  // Días transcurridos desde el último entrenamiento (histórico). null si nunca entrenó.
  function daysSinceLast(userId) {
    const last = lastWorkoutMap[userId];
    if (!last) return null;
    return Math.floor((new Date() - new Date(last + "T12:00:00")) / (1000 * 60 * 60 * 24));
  }

  // Semáforo de adherencia: verde ≤3d, amarillo 4-5d, rojo >5d (o nunca entrenó)
  function adherenceStatus(userId) {
    const days = daysSinceLast(userId);
    if (days === null) {
      return { level: "red", emoji: "🔴", chip: "Inactivo", color: "#f87171", bg: "rgba(220,38,38,.18)", days: null };
    }
    if (days <= 3) {
      return { level: "green", emoji: "🟢", chip: "Activo", color: "#4ade80", bg: "rgba(34,197,94,.18)", days };
    }
    if (days <= 5) {
      return { level: "yellow", emoji: "🟡", chip: "En riesgo", color: "#fbbf24", bg: "rgba(234,179,8,.18)", days };
    }
    return { level: "red", emoji: "🔴", chip: "Inactivo", color: "#f87171", bg: "rgba(220,38,38,.18)", days };
  }

  // Payment helpers
  function clientPaymentStatus(client) {
    const sub = client.subscription_status;
    const createdMs = client.created_at ? Date.now() - new Date(client.created_at).getTime() : 0;
    const trialDaysLeft = Math.max(0, 30 - Math.floor(createdMs / (1000 * 60 * 60 * 24)));
    if (sub === "active") return { label: "Al día", color: "#4ade80", bg: "rgba(34,197,94,.15)", urgent: false, trialDaysLeft: null };
    if (!sub || sub === "trialing") {
      if (trialDaysLeft <= 3) return { label: `Trial: ${trialDaysLeft}d`, color: "#f87171", bg: "rgba(220,38,38,.15)", urgent: true, trialDaysLeft };
      if (trialDaysLeft <= 7) return { label: `Trial: ${trialDaysLeft}d`, color: "#fbbf24", bg: "rgba(234,179,8,.15)", urgent: false, trialDaysLeft };
      return { label: `Trial: ${trialDaysLeft}d`, color: "#60a5fa", bg: "rgba(96,165,250,.12)", urgent: false, trialDaysLeft };
    }
    return { label: "Vencido", color: "#f87171", bg: "rgba(220,38,38,.15)", urgent: true, trialDaysLeft: null };
  }

  function paymentReminderMsg(client) {
    const ps = clientPaymentStatus(client);
    const name = client.name?.split(" ")[0] || "hola";
    if (ps.label === "Vencido") return `Hola ${name}! 👋 Tu suscripción a Loop venció. Para seguir entrenando con tu rutina personalizada, renová acá: ${window.location.origin}/#/home`;
    if (ps.trialDaysLeft !== null && ps.trialDaysLeft <= 7) return `Hola ${name}! ⏳ Te quedan ${ps.trialDaysLeft} días de prueba gratuita en Loop. Para seguir sin interrupciones, suscribite acá: ${window.location.origin}/#/home`;
    return `Hola ${name}! Recordatorio de Loop: tu suscripción vence pronto. Renovala acá: ${window.location.origin}/#/home`;
  }

  // Etiqueta humana de tiempo desde último entrenamiento
  function lastWorkoutLabel(userId) {
    const days = daysSinceLast(userId);
    if (days === null) return "Sin registros";
    if (days === 0) return "hoy";
    if (days === 1) return "hace 1 día";
    if (days < 7) return `hace ${days} días`;
    if (days < 14) return "hace 1 semana";
    if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
    return `hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? "es" : ""}`;
  }

  // Métricas de negocio agregadas
  const MONTHLY_FEE_ARS = 10000;
  function businessMetrics() {
    const total = clients.length;
    const trainedThisWeek = clients.filter((c) => (adherenceMap[c.id]?.size || 0) > 0).length;
    const adherencePct = total > 0 ? Math.round((trainedThisWeek / total) * 100) : 0;
    const atRisk = clients.filter((c) => {
      const s = adherenceStatus(c.id);
      return s.level === "red" || s.level === "yellow";
    }).length;
    const activePaying = clients.filter((c) => c.subscription_status === "active").length;
    const revenue = activePaying * MONTHLY_FEE_ARS;
    const paymentUrgent = clients.filter((c) => clientPaymentStatus(c).urgent).length;
    return { total, adherencePct, atRisk, revenue, trainedThisWeek, paymentUrgent };
  }

  // Returns array of last 7 date strings ['YYYY-MM-DD', ...]
  function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  // Returns how many consecutive days (ending today) a client has NOT trained
  function daysSinceLastWorkout(userId) {
    const trained = adherenceMap[userId];
    if (!trained || trained.size === 0) return 7; // no data = assume 7
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (trained.has(d.toISOString().slice(0, 10))) break;
      streak++;
    }
    return streak;
  }

  async function selectClient(client) {
    setSelectedClient(client);
    setEditingRoutine(null);
    setClientWorkouts([]);

    const [routinesResult] = await Promise.all([
      supabase
        .from("routines")
        .select("*")
        .eq("user_id", client.id)
        .order("day_index", { ascending: true, nullsFirst: false }),
      loadClientWorkoutsForAnalytics(client.id),
    ]);
    setClientRoutines(routinesResult.data || []);
  }

  async function loadClientWorkoutsForAnalytics(clientId) {
    setAnalyticsLoading(true);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data, error } = await supabase
      .from("user_workouts")
      .select("id, date, type, sets")
      .eq("user_id", clientId)
      .gte("date", thirtyDaysAgo.toISOString().slice(0, 10))
      .order("date", { ascending: false });

    if (!error) setClientWorkouts(data || []);
    setAnalyticsLoading(false);
  }

  function openNewRoutine() {
    const nextDay = clientRoutines.length + 1;
    setEditingRoutine("new");
    setRoutineName("");
    setRoutineDayIndex(String(nextDay));
    setRoutineNotes("");
    setExercises([{ name: "", sets: 3, reps: "8-12", notes: "" }]);
    setShowSaveTemplate(false);
    setShowLoadTemplate(false);
    setSaveTemplateProgramName("");
  }

  function openEditRoutine(routine) {
    setEditingRoutine(routine.id);
    setRoutineName(routine.name);
    setRoutineDayIndex(routine.day_index != null ? String(routine.day_index) : "");
    setRoutineNotes(routine.notes || "");
    const grp = (routine.notes || "").match(/^\[GRUPO: (.+?)\]/);
    setRoutineGroupName(grp ? grp[1] : "");
    setExercises(routine.exercises || []);
    setShowSaveTemplate(false);
    setShowLoadTemplate(false);
    setSaveTemplateProgramName("");
  }

  async function saveRoutine() {
    if (!routineName.trim() || exercises.length === 0) return;
    setSaving(true);
    setSaveMsg("");
    const cleanExercises = exercises.filter((e) => e.name.trim());
    const isGroup = routineGroupName.trim().length > 0;
    const finalNotes = isGroup
      ? `[GRUPO: ${routineGroupName.trim()}] ${routineNotes.trim()}`
      : routineNotes.trim() || null;
    const payload = {
      user_id: isGroup ? profile.id : selectedClient.id,
      trainer_id: profile.id,
      name: routineName.trim(),
      exercises: cleanExercises,
      notes: finalNotes,
      day_index: routineDayIndex !== "" ? parseInt(routineDayIndex, 10) : null,
    };

    let error;
    if (editingRoutine === "new") {
      ({ error } = await supabase.from("routines").insert(payload));
    } else {
      ({ error } = await supabase.from("routines").update(payload).eq("id", editingRoutine));
    }

    if (error) {
      setSaveMsg("Error al guardar: " + error.message);
    } else {
      setSaveMsg("✓ Rutina guardada");
      await selectClient(selectedClient);
      setEditingRoutine(null);
    }
    setSaving(false);
  }

  async function confirmDeleteRoutine() {
    if (!deleteRoutineTarget) return;
    const { error } = await supabase.from("routines").delete().eq("id", deleteRoutineTarget.id);
    if (error) {
      setSaveMsg("Error al eliminar: " + error.message);
    } else {
      setSaveMsg("");
      await selectClient(selectedClient);
    }
    setDeleteRoutineTarget(null);
  }

  async function loadTemplates() {
    if (!profile?.id) return;
    const { data } = await supabase
      .from("routine_templates")
      .select("*")
      .eq("trainer_id", profile.id)
      .order("program_name")
      .order("day_index");
    setTemplates(data || []);
  }

  async function saveAsTemplate() {
    const cleanEx = exercises.filter((e) => e.name.trim());
    if (!routineName.trim() || cleanEx.length === 0) {
      setSaveMsg("Completá el nombre y al menos un ejercicio");
      return;
    }
    setSavingTemplate(true);
    const { error } = await supabase.from("routine_templates").insert({
      trainer_id: profile.id,
      program_name: saveTemplateProgramName.trim() || "Sin programa",
      name: routineName.trim(),
      exercises: cleanEx,
      day_index: routineDayIndex ? Number(routineDayIndex) : null,
      notes: routineNotes.trim() || null,
    });
    if (!error) {
      await loadTemplates();
      setShowSaveTemplate(false);
      setSaveTemplateProgramName("");
      setSaveMsg("✓ Guardada como plantilla");
    } else {
      setSaveMsg("Error al guardar plantilla");
    }
    setSavingTemplate(false);
  }

  async function applyProgram(programName, client) {
    setApplyingProgram(true);
    const programTemplates = templates.filter((t) => t.program_name === programName);
    if (programTemplates.length === 0) {
      setApplyingProgram(false);
      return;
    }
    const rows = programTemplates.map((t) => ({
      trainer_id: profile.id,
      user_id: client.id,
      name: t.name,
      exercises: t.exercises,
      day_index: t.day_index,
      notes: t.notes,
    }));
    const { error } = await supabase.from("routines").insert(rows);
    if (!error) {
      await supabase.from("notifications").insert({
        user_id: client.id,
        type: "coach_insight",
        title: "Nuevo programa asignado",
        body: `Tu entrenador te asigno el programa "${programName}" (${rows.length} rutinas).`,
        read: false,
      });
      setShowApplyProgram(false);
      if (selectedClient?.id === client.id) await selectClient(client);
    }
    setApplyingProgram(false);
  }

  function addExerciseRow() {
    setExercises([...exercises, { name: "", sets: 3, reps: "8-12", notes: "" }]);
  }

  function updateExercise(i, field, val) {
    const next = [...exercises];
    next[i] = { ...next[i], [field]: val };
    setExercises(next);
  }

  function removeExercise(i) {
    setExercises(exercises.filter((_, idx) => idx !== i));
  }

  function moveExercise(fromIdx, toIdx) {
    if (toIdx < 0 || toIdx >= exercises.length) return;
    const exs = [...exercises];
    const [moved] = exs.splice(fromIdx, 1);
    exs.splice(toIdx, 0, moved);
    setExercises(exs);
  }

  const trDragIdx = useRef(null);
  const trDragOverIdx = useRef(null);
  const trDragStartY = useRef(0);
  const trItemHeights = useRef([]);
  const trListRef = useRef(null);
  const [trDragActive, setTrDragActive] = useState(false);
  const [trDragPos, setTrDragPos] = useState(null);

  function onTrHandleTouchStart(e, idx) {
    e.stopPropagation();
    trDragIdx.current = idx;
    trDragOverIdx.current = idx;
    trDragStartY.current = e.touches[0].clientY;
    if (trListRef.current) {
      const items = trListRef.current.querySelectorAll("[data-ex-item]");
      trItemHeights.current = Array.from(items).map(el => el.getBoundingClientRect().height + 8);
    }
    setTrDragActive(true);
    setTrDragPos({ idx, y: 0 });
    navigator.vibrate?.(30);
  }

  function onTrHandleTouchMove(e) {
    if (trDragIdx.current === null) return;
    e.preventDefault();
    const dy = e.touches[0].clientY - trDragStartY.current;
    setTrDragPos({ idx: trDragIdx.current, y: dy });
    let accumulated = 0, newOver = trDragIdx.current;
    const heights = trItemHeights.current;
    for (let i = 0; i < heights.length; i++) {
      const mid = accumulated + heights[i] / 2;
      if (trDragStartY.current + dy - (trListRef.current?.getBoundingClientRect().top || 0) < mid) { newOver = i; break; }
      accumulated += heights[i];
      newOver = i + 1;
    }
    newOver = Math.max(0, Math.min(heights.length - 1, newOver));
    if (newOver !== trDragOverIdx.current) { trDragOverIdx.current = newOver; setTrDragPos(p => ({ ...p })); }
  }

  function onTrHandleTouchEnd() {
    if (trDragIdx.current !== null && trDragOverIdx.current !== null && trDragIdx.current !== trDragOverIdx.current) {
      moveExercise(trDragIdx.current, trDragOverIdx.current);
    }
    trDragIdx.current = null; trDragOverIdx.current = null;
    setTrDragActive(false); setTrDragPos(null);
  }

  if (!["trainer", "admin", "superadmin"].includes(profile?.role)) return null;

  return (<>
  <section className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p className="eyebrow">{isAdmin ? "Admin" : "Entrenador"}</p>
          <h1>Mis clientes</h1>
        </div>
        {!isAdmin && (
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <button className="ghost" onClick={() => setPage("referral")}
              style={{ fontSize: 13, gap: 6, display: "flex", alignItems: "center" }}>
              <Icon name="TrendingUp" size={14} /> Comisiones
            </button>
            <button className="ghost" onClick={() => setPage("testamento")}
              style={{ fontSize: 13, gap: 6, display: "flex", alignItems: "center" }}>
              <Icon name="BookOpen" size={14} /> Testamento
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs principales (solo en vista de lista, no en detalle de alumno) ── */}
      {!selectedClient && (
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "var(--panel)", borderRadius: 12, padding: 4 }}>
          {[
            { id: "alumnos", label: "Alumnos" },
            { id: "pagos",   label: "Pagos 💳" },
          ].map(t => (
            <button key={t.id} onClick={() => setTrainerTab(t.id)} style={{
              flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
              background: trainerTab === t.id ? "var(--green)" : "transparent",
              color: trainerTab === t.id ? "#000" : "var(--muted)",
              transition: "all .15s",
            }}>{t.label}</button>
          ))}
        </div>
      )}

      {!selectedClient ? (
        <>
          {/* ── Mi negocio: alerta de churn + métricas ── */}
          {!loading && clients.length > 0 && trainerTab === "alumnos" && (() => {
            const m = businessMetrics();
            return (
              <>
                {m.atRisk > 0 && (
                  <div className="card" style={{
                    marginBottom: 16, padding: "12px 14px",
                    background: "rgba(220,38,38,.10)", border: "1px solid rgba(220,38,38,.35)",
                    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                    <span style={{ flex: 1, minWidth: 160, fontSize: 13, color: "#fca5a5", fontWeight: 600 }}>
                      {m.atRisk} {m.atRisk === 1 ? "alumno" : "alumnos"} sin entrenar hace más de 4 días
                    </span>
                    <button className="ghost" onClick={() => setShowChurnOnly((v) => !v)}
                      style={{ fontSize: 12, flexShrink: 0, borderColor: "rgba(220,38,38,.45)", color: "#fca5a5" }}>
                      {showChurnOnly ? "Ver todos" : "Ver quiénes"}
                    </button>
                  </div>
                )}

                <p className="section-label" style={{ marginBottom: 8 }}>Mi negocio</p>
                <div className="card" style={{ marginBottom: 16, padding: "14px 16px", display: "flex", gap: 8, textAlign: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>{m.total}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, lineHeight: 1.2 }}>Alumnos activos</div>
                  </div>
                  <div style={{ width: 1, background: "#1b2d31" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: m.adherencePct >= 60 ? "#4ade80" : m.adherencePct >= 40 ? "#fbbf24" : "#f87171", lineHeight: 1.1 }}>{m.adherencePct}%</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, lineHeight: 1.2 }}>Adherencia semanal</div>
                  </div>
                  <div style={{ width: 1, background: "#1b2d31" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>
                      ${(m.revenue / 1000).toLocaleString("es-AR")}k
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, lineHeight: 1.2 }}>Ingresos/mes est. (ARS)</div>
                  </div>
                </div>
              </>
            );
          })()}

          {/* ── Esta semana ── */}
          {!loading && clients.length > 0 && trainerTab === "alumnos" && (() => {
            const m = businessMetrics();
            const trainedList = clients.filter((c) => (adherenceMap[c.id]?.size || 0) > 0);
            const notTrainedList = clients.filter((c) => daysSinceLastWorkout(c.id) >= 3);
            return (
              <div style={{ background: "var(--panel)", border: "1px solid var(--line, var(--border))", borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Esta semana</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--green)", marginBottom: 4, lineHeight: 1 }}>
                  {m.trainedThisWeek}/{m.total}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>alumnos entrenaron</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {trainedList.length > 0 && (
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", marginBottom: 6 }}>Entrenaron</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {trainedList.slice(0, 5).map((c) => (
                          <div key={c.id} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                            <span>✅</span>
                            <span style={{ color: "var(--text)" }}>{c.name || c.email}</span>
                          </div>
                        ))}
                        {trainedList.length > 5 && (
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>+{trainedList.length - 5} más</div>
                        )}
                      </div>
                    </div>
                  )}
                  {notTrainedList.length > 0 && (
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>No entrenaron</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {notTrainedList.slice(0, 5).map((c) => (
                          <div key={c.id} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                            <span>⚠️</span>
                            <span style={{ color: "var(--text)" }}>{c.name || c.email}</span>
                          </div>
                        ))}
                        {notTrainedList.length > 5 && (
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>+{notTrainedList.length - 5} más</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Mis Programas ── */}
          {trainerTab === "alumnos" && templates.length > 0 && (() => {
            // Group templates by program_name
            const groups = {};
            templates.forEach((t) => {
              if (!groups[t.program_name]) groups[t.program_name] = [];
              groups[t.program_name].push(t);
            });
            const programNames = Object.keys(groups);
            return (
              <div className="card" style={{ marginBottom: 16, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p className="section-label" style={{ margin: 0 }}>Mis programas</p>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{programNames.length} programa{programNames.length !== 1 ? "s" : ""}</span>
                </div>
                {programNames.map((pName) => (
                  <div key={pName} style={{ marginBottom: 10, background: "var(--panel2)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <strong style={{ fontSize: 14 }}>{pName}</strong>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{groups[pName].length} rutina{groups[pName].length !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                      {groups[pName].map((t) => (
                        <span key={t.id} style={{ fontSize: 11, background: "rgba(168,85,247,.12)", color: "var(--accent)", borderRadius: 6, padding: "2px 7px" }}>
                          {t.day_index != null ? `Día ${t.day_index}: ` : ""}{t.name}
                        </span>
                      ))}
                    </div>
                    <button className="ghost" style={{ fontSize: 12, color: "var(--green)", borderColor: "var(--green)", width: "100%" }}
                      onClick={() => setShowApplyProgram({ programName: pName })}>
                      <Icon name="UserPlus" size={12} /> Aplicar a cliente
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── Invite section ── */}
          {trainerTab === "alumnos" && <div className="card" style={{ marginBottom: 16, padding: "14px 16px" }}>
            <p className="section-label" style={{ marginBottom: 10 }}>Invitar alumnos</p>
            {inviteCode ? (
              <div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                  Compartí este link con tus alumnos para que se registren y queden vinculados a vos:
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0b1518", border: "1px solid #1b2d31", borderRadius: 10, padding: "8px 12px", marginBottom: 8 }}>
                  <code style={{ flex: 1, fontSize: 12, color: "var(--cyan, #22d3ee)", wordBreak: "break-all" }}>
                    {window.location.origin}/#/join/{inviteCode}
                  </code>
                  <button
                    className="ghost icon-btn"
                    title="Copiar link"
                    onClick={copyInviteLink}
                    style={{ flexShrink: 0 }}
                  >
                    <Icon name={inviteCopied ? "Check" : "Copy"} size={16} style={{ color: inviteCopied ? "var(--green)" : undefined }} />
                  </button>
                </div>
                {inviteCopied && <p style={{ fontSize: 11, color: "var(--green)", margin: 0 }}>Link copiado al portapapeles</p>}
                {/* Landing page link */}
                <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(168,85,247,.07)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 10 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--green)" }}>Tu página pública</p>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--muted)" }}>Compartí esta página para que tus potenciales alumnos vean tu perfil antes de registrarse.</p>
                  <button
                    className="ghost"
                    style={{ width: "100%", fontSize: 12, padding: "8px", borderColor: "rgba(168,85,247,.4)", color: "var(--green)" }}
                    onClick={() => {
                      const url = `${window.location.origin}/#/t/${inviteCode}`;
                      navigator.clipboard.writeText(url);
                      setInviteCopied(true);
                      setTimeout(() => setInviteCopied(false), 2000);
                    }}
                  >
                    📋 Copiar link de landing ({window.location.origin}/#/t/{inviteCode})
                  </button>
                </div>
              </div>
            ) : (
              <button className="ghost" style={{ width: "100%" }} disabled={inviteLoading} onClick={generateInviteCode}>
                <Icon name="Link" size={14} /> {inviteLoading ? "Generando…" : "Generar link de invitación"}
              </button>
            )}
          </div>}

          {/* Pending student requests */}
          {trainerTab === "alumnos" && pendingRequests.length > 0 && (
            <div style={{ background: "rgba(249,115,22,.08)", border: "1px solid rgba(249,115,22,.3)", borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🔔</span> {pendingRequests.length} solicitud{pendingRequests.length !== 1 ? "es" : ""} pendiente{pendingRequests.length !== 1 ? "s" : ""}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pendingRequests.map(req => {
                  const student = req.profiles;
                  const sName = student?.name || student?.email?.split("@")[0] || "Alumno";
                  const isResponding = respondingId === req.id;
                  return (
                    <div key={req.id} style={{ background: "var(--panel)", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                        {sName[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{sName}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{student?.email}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          disabled={isResponding}
                          onClick={() => respondToRequest(req.id, "accepted")}
                          style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(52,211,153,.2)", border: "1px solid rgba(52,211,153,.5)", color: "#34d399", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          ✓ Aceptar
                        </button>
                        <button
                          disabled={isResponding}
                          onClick={() => respondToRequest(req.id, "rejected")}
                          style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.35)", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {trainerTab === "alumnos" && (loading ? (
            <div className="loading-state"><Icon name="Loader" size={24} className="spin" /><p>Cargando…</p></div>
          ) : clients.length === 0 ? (
            <div className="empty-state">
              <Icon name="Users" size={40} />
              <p>No tenés clientes asignados aún.{isAdmin ? " Creá uno desde el panel Admin." : " Pedile al admin que te asigne clientes."}</p>
            </div>
          ) : (
            <div className="user-list">
              {clients
                .filter((c) => !showChurnOnly || ["red","yellow"].includes(adherenceStatus(c.id).level))
                .map((c) => {
                const last7 = getLast7Days();
                const trained = adherenceMap[c.id];
                const dayLabels = ["L","M","X","J","V","S","D"];
                const hasAdherence = trained !== undefined;
                const status = adherenceStatus(c.id);
                return (
                <button key={c.id} className="user-row as-button" onClick={() => selectClient(c)}>
                  <div className="user-avatar" style={{ position: "relative" }}>
                    {(c.name || c.email || "?")[0].toUpperCase()}
                    <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: 12, lineHeight: 1 }}>{status.emoji}</span>
                  </div>
                  <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <strong>{c.name || "—"}</strong>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: 20,
                        background: status.bg,
                        color: status.color,
                        whiteSpace: "nowrap",
                      }}>
                        {status.chip}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>
                        · {lastWorkoutLabel(c.id)}
                        {lastMoodMap[c.id] && (
                          <span style={{ marginLeft: 6, fontSize: 14 }}>
                            {lastMoodMap[c.id] === "tired" ? "😓" :
                             lastMoodMap[c.id] === "great" ? "🔥" : "💪"}
                          </span>
                        )}
                      </span>
                    </div>
                    <small>{c.email}</small>
                    {/* 7-day adherence circles */}
                    <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                      {last7.map((dateStr, idx) => {
                        const didTrain = trained?.has(dateStr);
                        // if no data at all, show grey
                        const color = !hasAdherence
                          ? "#2a3d42"
                          : didTrain
                            ? "#22c55e"
                            : "#2a3d42";
                        const border = !hasAdherence
                          ? "1px solid #374748"
                          : didTrain
                            ? "1px solid #16a34a"
                            : "1px solid #374748";
                        return (
                          <div key={dateStr} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <div style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: color,
                              border,
                            }} />
                            <span style={{ fontSize: 8, color: "var(--muted)", lineHeight: 1 }}>
                              {dayLabels[new Date(dateStr + "T12:00:00").getDay() === 0 ? 6 : new Date(dateStr + "T12:00:00").getDay() - 1]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={18} />
                </button>
                );
              })}
            </div>
          ))}

          {/* ── TAB PAGOS ── */}
          {trainerTab === "pagos" && (
            <div>
              {loading ? (
                <div className="loading-state"><Icon name="Loader" size={24} className="spin" /><p>Cargando…</p></div>
              ) : clients.length === 0 ? (
                <div className="empty-state"><Icon name="Users" size={40} /><p>No tenés alumnos aún.</p></div>
              ) : (() => {
                const urgent = clients.filter(c => clientPaymentStatus(c).urgent);
                const sorted = [...clients].sort((a, b) => {
                  const pa = clientPaymentStatus(a);
                  const pb = clientPaymentStatus(b);
                  if (pa.urgent && !pb.urgent) return -1;
                  if (!pa.urgent && pb.urgent) return 1;
                  if (pa.trialDaysLeft !== null && pb.trialDaysLeft !== null) return pa.trialDaysLeft - pb.trialDaysLeft;
                  return 0;
                });
                return (
                  <>
                    {urgent.length > 0 && (
                      <div style={{ background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>💳</span>
                        <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 700 }}>
                          {urgent.length} {urgent.length === 1 ? "alumno" : "alumnos"} con pago urgente
                        </span>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {sorted.map(c => {
                        const ps = clientPaymentStatus(c);
                        return (
                          <div key={c.id} style={{
                            display: "flex", alignItems: "center", gap: 12,
                            background: "var(--panel)", borderRadius: 14, padding: "12px 14px",
                            border: `1px solid ${ps.urgent ? "rgba(239,68,68,.3)" : "var(--border)"}`,
                          }}>
                            <div className="user-avatar" style={{ flexShrink: 0 }}>
                              {(c.name || c.email || "?")[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{c.name || "—"}</div>
                              <div style={{ fontSize: 11, color: "var(--muted)" }}>{c.email}</div>
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                              background: ps.bg, color: ps.color, whiteSpace: "nowrap", flexShrink: 0,
                            }}>{ps.label}</span>
                            <button
                              title="Mandar recordatorio por WhatsApp"
                              onClick={() => {
                                const msg = paymentReminderMsg(c);
                                if (navigator.share) navigator.share({ text: msg });
                                else { navigator.clipboard?.writeText(msg); setSaveMsg("Mensaje copiado"); setTimeout(() => setSaveMsg(""), 2000); }
                              }}
                              style={{
                                background: "rgba(37,211,102,.12)", border: "1px solid rgba(37,211,102,.25)",
                                color: "#25d366", borderRadius: 8, padding: "6px 8px", cursor: "pointer",
                                fontSize: 16, lineHeight: 1, flexShrink: 0,
                              }}
                            >💬</button>
                            <button
                              onClick={() => setPayModal(c)}
                              style={{ background:"var(--green)", color:"#fff", border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer" }}
                            >
                              ✓ Cobrado
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {saveMsg && <p style={{ textAlign: "center", fontSize: 12, color: "var(--green)", marginTop: 10 }}>{saveMsg}</p>}
                  </>
                );
              })()}
            </div>
          )}
        </>
      ) : (
        <>
          <button className="back-btn-inline" onClick={() => { setSelectedClient(null); setEditingRoutine(null); }}>
            <Icon name="ArrowLeft" size={16} /> Volver
          </button>

          <div className="client-header">
            <div className="user-avatar large">{(selectedClient.name || selectedClient.email || "?")[0].toUpperCase()}</div>
            <div>
              <h2>{selectedClient.name}</h2>
              <small>{selectedClient.email}</small>
            </div>
          </div>

          {editingRoutine ? (
            <div className="routine-editor card">
              <div className="editor-header">
                <h2>{editingRoutine === "new" ? "Nueva rutina" : "Editar rutina"}</h2>
                <button className="ghost icon-btn" onClick={() => setEditingRoutine(null)}>
                  <Icon name="X" size={20} />
                </button>
              </div>

              {/* Cargar desde plantilla — solo en modo nueva rutina */}
              {editingRoutine === "new" && templates.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {!showLoadTemplate ? (
                    <button className="ghost" style={{ width: "100%", fontSize: 13, color: "var(--accent)" }}
                      onClick={() => setShowLoadTemplate(true)}>
                      <Icon name="BookOpen" size={14} /> Cargar desde plantilla
                    </button>
                  ) : (
                    <div style={{ background: "var(--panel2)", border: "1px solid var(--border)", borderRadius: 12, padding: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>Seleccionar plantilla</p>
                        <button className="ghost icon-btn" onClick={() => setShowLoadTemplate(false)}><Icon name="X" size={14} /></button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
                        {templates.map((t) => (
                          <button key={t.id} className="ghost" style={{ justifyContent: "flex-start", fontSize: 13, padding: "6px 10px" }}
                            onClick={() => {
                              setRoutineName(t.name);
                              setRoutineDayIndex(t.day_index != null ? String(t.day_index) : "");
                              setRoutineNotes(t.notes || "");
                              setExercises(t.exercises || []);
                              setShowLoadTemplate(false);
                            }}>
                            <span style={{ color: "var(--muted)", marginRight: 6, fontSize: 11 }}>{t.program_name}</span>
                            {t.name}
                            {t.day_index != null && <span style={{ marginLeft: 6, color: "var(--muted)", fontSize: 11 }}>Día {t.day_index}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                <div className="field-group" style={{ flex:3 }}>
                  <label>Nombre de la rutina</label>
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    placeholder="Ej: Día 1 · Pecho y Hombros"
                  />
                </div>
                <div className="field-group" style={{ flex:1 }}>
                  <label>Día #</label>
                  <input
                    type="number"
                    min={1}
                    value={routineDayIndex}
                    onChange={(e) => setRoutineDayIndex(e.target.value)}
                    placeholder="1"
                    style={{ textAlign:"center" }}
                  />
                </div>
              </div>

              <div className="field-group" style={{ marginBottom:12 }}>
                <label>Notas para el cliente (opcional)</label>
                <textarea
                  value={routineNotes}
                  onChange={(e) => setRoutineNotes(e.target.value)}
                  placeholder="Indicaciones generales, objetivo de la sesión, etc."
                  rows={2}
                  style={{ width:"100%", background:"#0b1518", border:"1px solid #1b2d31", borderRadius:12, padding:"10px 12px", color:"var(--text)", fontSize:13, resize:"vertical" }}
                />
              </div>

              <div className="field-group" style={{ marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
                <input type="checkbox" id="grupChk" checked={routineGroupName.trim().length > 0}
                  onChange={(e) => setRoutineGroupName(e.target.checked ? "Grupo" : "")}
                  style={{ width:18, height:18 }} />
                <label htmlFor="grupChk" style={{ margin:0 }}>Rutina grupal (todos mis clientes)</label>
                {routineGroupName.trim().length > 0 && (
                  <input type="text" value={routineGroupName}
                    onChange={(e) => setRoutineGroupName(e.target.value)}
                    placeholder="Nombre del grupo"
                    style={{ flex:1, background:"#0b1518", border:"1px solid #1b2d31", borderRadius:8, padding:"6px 10px", color:"var(--text)", fontSize:12 }} />
                )}
              </div>

              <p className="section-label" style={{ marginBottom:8 }}>Ejercicios</p>
              <div
                className="exercise-list-editor"
                ref={trListRef}
                onTouchMove={trDragActive ? onTrHandleTouchMove : undefined}
                onTouchEnd={trDragActive ? onTrHandleTouchEnd : undefined}
                style={{ touchAction: trDragActive ? "none" : "auto" }}
              >
                {exercises.map((ex, i) => {
                  const isDragging = trDragActive && trDragPos?.idx === i;
                  const isPlaceholder = trDragActive && trDragOverIdx.current === i && trDragIdx.current !== i;
                  return (
                  <div
                    key={i}
                    data-ex-item
                    className="ex-row"
                    style={{
                      border: isPlaceholder ? "2px dashed var(--green)" : "2px solid transparent",
                      transform: isDragging ? `translateY(${trDragPos.y}px)` : "none",
                      zIndex: isDragging ? 10 : 1,
                      position: "relative",
                      boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,.4)" : "none",
                      transition: isDragging ? "none" : "transform .15s",
                      background: isDragging ? "var(--panel)" : undefined,
                    }}
                  >
                    <div className="ex-row-top">
                      {/* Drag handle */}
                      <div
                        onTouchStart={e => onTrHandleTouchStart(e, i)}
                        style={{ cursor:"grab", padding:"4px 8px 4px 0", touchAction:"none", userSelect:"none", display:"flex", flexDirection:"column", gap:3, flexShrink:0 }}
                      >
                        {[0,1,2].map(r => (
                          <div key={r} style={{ display:"flex", gap:3 }}>
                            <div style={{ width:3, height:3, borderRadius:"50%", background:"var(--muted)" }} />
                            <div style={{ width:3, height:3, borderRadius:"50%", background:"var(--muted)" }} />
                          </div>
                        ))}
                      </div>
                      <span className="ex-num">{i + 1}</span>
                      <div className="ex-name-wrap">
                        <input
                          type="text"
                          list={`ex-list-${i}`}
                          value={ex.name}
                          onChange={(e) => updateExercise(i, "name", e.target.value)}
                          placeholder="Ejercicio…"
                          className="ex-name-input"
                        />
                        <datalist id={`ex-list-${i}`}>
                          {catalogNames.map((n) => <option key={n} value={n} />)}
                        </datalist>
                      </div>
                      <button className="ghost icon-btn" onClick={() => removeExercise(i)}>✕</button>
                    </div>
                    <div className="ex-row-bottom">
                      <div className="field-mini">
                        <label>Series</label>
                        <input type="number" min={1} max={10} value={ex.sets} onChange={(e) => updateExercise(i, "sets", Number(e.target.value))} />
                      </div>
                      <div className="field-mini">
                        <label>Reps</label>
                        <input type="text" value={ex.reps} onChange={(e) => updateExercise(i, "reps", e.target.value)} placeholder="8-12" />
                      </div>
                      <div className="field-mini flex-2">
                        <label>Notas</label>
                        <input type="text" value={ex.notes || ""} onChange={(e) => updateExercise(i, "notes", e.target.value)} placeholder="Técnica, peso, etc." />
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <button className="ghost" style={{ width: "100%", marginTop: 8 }} onClick={addExerciseRow}>
                <Icon name="Plus" size={14} /> Agregar ejercicio
              </button>

              {saveMsg && <p className={saveMsg.startsWith("✓") ? "success-msg" : "login-error"}>{saveMsg}</p>}

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="primary" style={{ flex: 1 }} disabled={saving} onClick={saveRoutine}>
                  {saving ? "Guardando…" : "Guardar rutina"}
                </button>
                <button className="ghost" onClick={() => setEditingRoutine(null)}>Cancelar</button>
              </div>

              {/* Guardar como plantilla */}
              {!showSaveTemplate ? (
                <button className="ghost" style={{ width: "100%", marginTop: 8, fontSize: 13, color: "var(--accent)" }}
                  onClick={() => setShowSaveTemplate(true)}>
                  <Icon name="BookmarkPlus" size={14} /> Guardar como plantilla de programa
                </button>
              ) : (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--panel2)", borderRadius: 12, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Nombre del programa (o dejá en blanco)</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={saveTemplateProgramName}
                      onChange={(e) => setSaveTemplateProgramName(e.target.value)}
                      placeholder="Ej: Programa Verano, Full Body, etc."
                      style={{ flex: 1, background: "#0b1518", border: "1px solid #1b2d31", borderRadius: 8, padding: "7px 10px", color: "var(--text)", fontSize: 13 }}
                    />
                    <button className="primary" style={{ fontSize: 13 }} disabled={savingTemplate} onClick={saveAsTemplate}>
                      {savingTemplate ? "…" : "Guardar"}
                    </button>
                    <button className="ghost" style={{ fontSize: 13 }} onClick={() => setShowSaveTemplate(false)}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button className="primary" style={{ flex: 1 }} onClick={openNewRoutine}>
                  <Icon name="Plus" size={14} /> Nueva rutina
                </button>
                <button className="ghost" style={{ flex: 1, color: "var(--accent)", borderColor: "var(--accent)" }} onClick={() => setShowAssign(true)}>
                  <Icon name="Share2" size={14} /> Asignar plantilla
                </button>
              </div>

              {clientRoutines.length === 0 ? (
                <div className="empty-state">
                  <Icon name="Dumbbell" size={36} />
                  <p>Este cliente aún no tiene rutinas. Creá su primera.</p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize:12, color:"var(--muted)", marginBottom:10 }}>
                    Las rutinas se muestran al cliente en orden de Día #. La app detecta automáticamente cuál le toca hoy.
                  </p>
                  <div className="routine-list">
                    {clientRoutines.map((r) => (
                      <div key={r.id} className="routine-item card">
                        <div className="routine-item-header">
                          <div style={{ flex:1, minWidth:0 }}>
                            {r.day_index != null && (
                              <span className="day-badge">Día {r.day_index}</span>
                            )}
                            {(r.notes || "").startsWith("[GRUPO:") && (() => {
                              const g = (r.notes || "").match(/^\[GRUPO: (.+?)\]/);
                              return g ? <span className="day-badge" style={{ background:"rgba(168,85,247,.15)", color:"var(--green)", marginLeft:4 }}>👥 {g[1]}</span> : null;
                            })()}
                            <strong style={{ display:"block" }}>{r.name}</strong>
                            <small>{r.exercises?.length || 0} ejercicios</small>
                            {r.notes && <small style={{ color:"var(--muted)", display:"block", marginTop:2 }}>{r.notes.replace(/^\[GRUPO:.+?\]\s*/,"")}</small>}
                          </div>
                          <div className="routine-item-actions">
                            <button className="ghost icon-btn" onClick={() => openEditRoutine(r)}>
                              <Icon name="Edit2" size={16} />
                            </button>
                            <button className="ghost icon-btn" onClick={() => setDeleteRoutineTarget({ id: r.id })}><Icon name="Trash2" size={16} /></button>
                          </div>
                        </div>
                        <div className="routine-exercises-preview">
                          {(r.exercises || []).slice(0, 6).map((ex, i) => (
                            <span key={i} className="ex-chip">{ex.name}</span>
                          ))}
                          {(r.exercises || []).length > 6 && (
                            <span className="ex-chip muted">+{r.exercises.length - 6} más</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
    )}
  </section>
  {showAssign && selectedClient && (
    <AssignRoutineModal
      targetUser={selectedClient}
      onClose={() => setShowAssign(false)}
      onDone={() => selectClient(selectedClient)}
    />
  )}

  {deleteRoutineTarget && (
    <div className="modal-overlay" onClick={() => setDeleteRoutineTarget(null)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Icon name="Trash2" size={20} style={{ color: "var(--danger, #e05)" }} />
          <h3>Eliminar rutina</h3>
        </div>
        <p>¿Estás seguro de que querés eliminar esta rutina? Esta acción no se puede deshacer.</p>
        <div className="modal-actions">
          <button className="ghost" onClick={() => setDeleteRoutineTarget(null)}>Cancelar</button>
          <button className="danger" onClick={confirmDeleteRoutine}>Eliminar</button>
        </div>
      </div>
    </div>
  )}

  {/* Apply Program to Client modal */}
  {showApplyProgram && (
    <div className="modal-overlay" onClick={() => setShowApplyProgram(false)}>
      <div className="modal-box" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Icon name="BookOpen" size={20} style={{ color: "var(--accent)" }} />
          <h3>Aplicar "{showApplyProgram.programName}"</h3>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
          Seleccioná el cliente al que querés asignar este programa.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 260, overflowY: "auto" }}>
          {clients.map((c) => (
            <button key={c.id} className="ghost" style={{ justifyContent: "flex-start", padding: "8px 12px" }}
              disabled={applyingProgram}
              onClick={() => applyProgram(showApplyProgram.programName, c)}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginRight: 10, flexShrink: 0 }}>
                {(c.name || c.email || "?")[0].toUpperCase()}
              </div>
              {c.name || c.email}
            </button>
          ))}
        </div>
        <div className="modal-actions" style={{ marginTop: 12 }}>
          <button className="ghost" onClick={() => setShowApplyProgram(false)}>Cancelar</button>
        </div>
      </div>
    </div>
  )}

  {payModal && (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }} onClick={() => setPayModal(null)}>
      <div style={{ background:"var(--panel)", borderRadius:16, padding:24, width:"min(340px,90vw)" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Registrar cobro</div>
        <div style={{ fontSize:13, color:"var(--muted)", marginBottom:16 }}>{payModal.name || payModal.email}</div>
        <div style={{ fontSize:13, marginBottom:8 }}>Monto cobrado (ARS)</div>
        <input id="pay-amount" type="number" defaultValue={10000} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid var(--line)", background:"var(--bg)", color:"var(--text)", fontSize:14, marginBottom:16, boxSizing:"border-box" }} />
        <button onClick={async () => {
          const amount = document.getElementById("pay-amount").value;
          const today = new Date().toISOString().split("T")[0];
          const nextDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0];
          const { supabase } = await import("../lib/supabase.js");
          await supabase.from("profiles").update({ last_payment_date: today, next_payment_date: nextDate }).eq("id", payModal.id);
          setPayModal(null);
          // Refetch clients
          window.location.reload();
        }} style={{ width:"100%", background:"var(--accent)", color:"#fff", border:"none", borderRadius:10, padding:"12px", fontSize:15, fontWeight:700, cursor:"pointer" }}>
          Confirmar cobro
        </button>
      </div>
    </div>
  )}

</>);
}
