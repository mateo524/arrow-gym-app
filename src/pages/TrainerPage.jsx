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
  // Filtro del banner de churn: mostrar sólo alumnos en riesgo/inactivos
  const [showChurnOnly, setShowChurnOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

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

  // Nudge: generate WhatsApp message per student
  const [nudgeLoading, setNudgeLoading] = useState({});
  const [nudgeModal, setNudgeModal] = useState(null); // { name, message }
  const [nudgeCopied, setNudgeCopied] = useState(false);

  const catalogNames = EXERCISE_DATABASE.map((e) => e.name);

  useEffect(() => {
    loadClients();
    loadInviteCode();
  }, []);

  async function generateNudge(client, e) {
    e.stopPropagation();
    const status = adherenceStatus(client.id);
    const days = daysSinceLast(client.id);
    const trainerName = profile?.name?.split(" ")[0] || "tu coach";
    const studentName = client.name?.split(" ")[0] || "el/la alumno/a";

    setNudgeLoading((prev) => ({ ...prev, [client.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          mode: "nudge",
          student_name: studentName,
          days_since_last: days,
          trainer_name: trainerName,
          adherence_level: status.level,
        },
      });
      if (data?.message) {
        setNudgeModal({ name: client.name || studentName, message: data.message });
        setNudgeCopied(false);
      }
    } catch (err) {
      console.error("nudge error", err);
    }
    setNudgeLoading((prev) => ({ ...prev, [client.id]: false }));
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
      .select("user_id, date")
      .in("user_id", clientIds)
      .order("date", { ascending: false });

    if (allError) {
      console.warn("last-workout query failed:", allError.message);
      return;
    }

    const lastMap = {};
    (allData || []).forEach(({ user_id, date }) => {
      const d = date?.slice(0, 10);
      if (!d) return;
      // Los resultados vienen ordenados desc, así que el primero es el más reciente
      if (!lastMap[user_id]) lastMap[user_id] = d;
    });
    setLastWorkoutMap(lastMap);
  }

  // Días transcurridos desde el último entrenamiento (histórico). null si nunca entrenó.
  function daysSinceLast(userId) {
    const last = lastWorkoutMap[userId];
    if (!last) return null;
    return Math.floor((new Date() - new Date(last + "T12:00:00")) / (1000 * 60 * 60 * 24));
  }

  // Semáforo de adherencia: verde ≤4d, amarillo 5-7d, rojo >7d (o nunca entrenó)
  function adherenceStatus(userId) {
    const days = daysSinceLast(userId);
    if (days === null) {
      return { level: "red", emoji: "🔴", chip: "Inactivo", color: "#f87171", bg: "rgba(220,38,38,.18)", days: null };
    }
    if (days <= 4) {
      return { level: "green", emoji: "🟢", chip: "Activo", color: "#4ade80", bg: "rgba(34,197,94,.18)", days };
    }
    if (days <= 7) {
      return { level: "yellow", emoji: "🟡", chip: "En riesgo", color: "#fbbf24", bg: "rgba(234,179,8,.18)", days };
    }
    return { level: "red", emoji: "🔴", chip: "Inactivo", color: "#f87171", bg: "rgba(220,38,38,.18)", days };
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
  const MONTHLY_FEE_ARS = 25000;
  function businessMetrics() {
    const total = clients.length;
    const trainedThisWeek = clients.filter((c) => (adherenceMap[c.id]?.size || 0) > 0).length;
    const adherencePct = total > 0 ? Math.round((trainedThisWeek / total) * 100) : 0;
    const atRisk = clients.filter((c) => adherenceStatus(c.id).level === "red").length;
    const revenue = total * MONTHLY_FEE_ARS;
    return { total, adherencePct, atRisk, revenue, trainedThisWeek };
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
  }

  function openEditRoutine(routine) {
    setEditingRoutine(routine.id);
    setRoutineName(routine.name);
    setRoutineDayIndex(routine.day_index != null ? String(routine.day_index) : "");
    setRoutineNotes(routine.notes || "");
    const grp = (routine.notes || "").match(/^\[GRUPO: (.+?)\]/);
    setRoutineGroupName(grp ? grp[1] : "");
    setExercises(routine.exercises || []);
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

      {!selectedClient ? (
        <>
          {/* ── Mi negocio: alerta de churn + métricas ── */}
          {!loading && clients.length > 0 && (() => {
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
                      {m.atRisk} {m.atRisk === 1 ? "alumno" : "alumnos"} sin entrenar hace más de 7 días
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

          {/* ── Invite section ── */}
          <div className="card" style={{ marginBottom: 16, padding: "14px 16px" }}>
            <p className="section-label" style={{ marginBottom: 10 }}>Invitar alumnos</p>
            {inviteCode ? (
              <div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                  Compartí este link con tus alumnos para que se registren y queden vinculados a vos:
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0b1518", border: "1px solid #1b2d31", borderRadius: 10, padding: "8px 12px", marginBottom: 8 }}>
                  <code style={{ flex: 1, fontSize: 12, color: "var(--cyan, #22d3ee)", wordBreak: "break-all" }}>
                    https://loop.app/join/{inviteCode}
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
              </div>
            ) : (
              <button className="ghost" style={{ width: "100%" }} disabled={inviteLoading} onClick={generateInviteCode}>
                <Icon name="Link" size={14} /> {inviteLoading ? "Generando…" : "Generar link de invitación"}
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-state"><Icon name="Loader" size={24} className="spin" /><p>Cargando…</p></div>
          ) : clients.length === 0 ? (
            <div className="empty-state">
              <Icon name="Users" size={40} />
              <p>No tenés clientes asignados aún.{isAdmin ? " Creá uno desde el panel Admin." : " Pedile al admin que te asigne clientes."}</p>
            </div>
          ) : (
            <div className="user-list">
              {clients
                .filter((c) => !showChurnOnly || adherenceStatus(c.id).level === "red")
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
                  <button
                    onClick={(e) => generateNudge(c, e)}
                    disabled={nudgeLoading[c.id]}
                    title="Generar mensaje de WhatsApp"
                    style={{
                      padding: "5px 7px",
                      borderRadius: 8,
                      background: "rgba(168,85,247,.12)",
                      border: "1px solid rgba(168,85,247,.22)",
                      color: "var(--accent, #a855f7)",
                      cursor: "pointer",
                      flexShrink: 0,
                      fontSize: 14,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {nudgeLoading[c.id]
                      ? <Icon name="Loader" size={13} className="spin" />
                      : "💬"}
                  </button>
                  <Icon name="ChevronRight" size={18} />
                </button>
                );
              })}
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

  {/* Nudge modal */}
  {nudgeModal && (
    <div className="modal-overlay" onClick={() => setNudgeModal(null)}>
      <div className="modal-box" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontSize: 20 }}>💬</span>
          <h3>Mensaje para {nudgeModal.name}</h3>
        </div>
        <div style={{
          background: "var(--panel2)",
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 14,
          fontSize: 14,
          lineHeight: 1.65,
          color: "var(--text)",
          whiteSpace: "pre-wrap",
        }}>
          {nudgeModal.message}
        </div>
        <div className="modal-actions">
          <button className="ghost" onClick={() => setNudgeModal(null)}>Cerrar</button>
          <button className="btn-primary" onClick={async () => {
            try { await navigator.clipboard.writeText(nudgeModal.message); } catch {}
            setNudgeCopied(true);
            setTimeout(() => setNudgeCopied(false), 2500);
          }}>
            <Icon name={nudgeCopied ? "Check" : "Copy"} size={14} />
            {nudgeCopied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  )}
</>);
}