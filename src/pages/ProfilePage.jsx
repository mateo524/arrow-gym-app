import { useState, useRef, useEffect } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import { todayLocal } from "../lib/dates.js";
import Icon from "../components/Icon.jsx";
import { parseImportFile } from "../lib/importCSV.js";
import { subscribeToPush, requestPushPermission, isPushSupported, isIosNotInstalled } from "../lib/pushNotifications.js";

const GOALS = [
  { id: "volumen",       label: "Ganar músculo",  icon: "💪" },
  { id: "definicion",    label: "Definición",     icon: "🔥" },
  { id: "mantenimiento", label: "Salud general",  icon: "⚖" },
  { id: "rendimiento",   label: "Fuerza",         icon: "⚡" },
];
const LEVELS = [
  { id: "principiante", label: "Principiante",  icon: "🌱" },
  { id: "intermedio",   label: "Intermedio",    icon: "💪" },
  { id: "avanzado",     label: "Avanzado",      icon: "🏆" },
];

function BodyWeightChart({ data }) {
  const weights = data.map(d => d.weight);
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  const w = 280, h = 60;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.weight - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height:"auto" }}>
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((d.weight - min) / (max - min)) * h;
        return <circle key={i} cx={x} cy={y} r={3} fill="var(--accent)" />;
      })}
    </svg>
  );
}

export default function ProfilePage() {
  const setPage = useStore((s) => s.setPage);
  const amoled = useStore((s) => s.amoled);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const userGoal = useStore((s) => s.userGoal);
  const activityLevel = useStore((s) => s.activityLevel);
  const toggleAmoled = useStore((s) => s.toggleAmoled);
  const toggleSound = useStore((s) => s.toggleSound);

  const reminderEnabled = useStore(s => s.reminderEnabled);
  const reminderTime = useStore(s => s.reminderTime);
  const setUserGoal = useStore((s) => s.setUserGoal);
  const setActivityLevel = useStore((s) => s.setActivityLevel);
  const weeklyGoal = useStore((s) => s.weeklyGoal) || 4;
  const setWeeklyGoal = useStore((s) => s.setWeeklyGoal);
  const fontScale = useStore((s) => s.fontScale) || 1;
  const setFontScale = useStore((s) => s.setFontScale);
  const mutedHintTypes = useStore((s) => s.mutedHintTypes || []);
  const toggleMutedHintType = useStore((s) => s.toggleMutedHintType);
  const autoDarkMode = useStore((s) => s.autoDarkMode) || false;
  const setAutoDarkMode = useStore((s) => s.setAutoDarkMode);
  const competitionDate = useStore(s => s.competitionDate);
  const competitionName = useStore(s => s.competitionName);
  const setCompetitionMode = useStore(s => s.setCompetitionMode);
  const clearCompetitionMode = useStore(s => s.clearCompetitionMode);
  const [showCompForm, setShowCompForm] = useState(false);
  const [compDate, setCompDate] = useState("");
  const [compName, setCompName] = useState("");

  const bodyMetrics = useStore(s => s.bodyMetrics || []);
  const addBodyMetric = useStore(s => s.addBodyMetric);
  const [weightInput, setWeightInput] = useState("");

  function handleAddWeight() {
    const val = parseFloat(String(weightInput).replace(/,/g, "."));
    if (!val || isNaN(val)) return;
    const today = todayLocal();
    addBodyMetric({ date: today, weight: val });
    setWeightInput("");
  }

  async function toggleReminder() {
    if (!reminderEnabled) {
      if (Notification.permission === "default") {
        const p = await Notification.requestPermission();
        if (p !== "granted") return;
      }
      if (Notification.permission === "granted") {
        useStore.setState({ reminderEnabled: true });
      }
    } else {
      useStore.setState({ reminderEnabled: false });
    }
  }
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setNotifEnabled(!!sub);
      });
    });
  }, []);

  async function toggleNotifications() {
    if (!isPushSupported()) return;
    setNotifLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        localStorage.removeItem("pushSubscription");
        const { data: { user: u } } = await supabase.auth.getUser();
        if (u) {
          await supabase.from("push_subscriptions").delete().eq("user_id", u.id);
        }
        setNotifEnabled(false);
      } else {
        const { permission, supported } = await requestPushPermission();
        if (!supported) {
          alert("Tu navegador no soporta notificaciones push.");
        } else if (permission === "granted") {
          const { data: { user: u } } = await supabase.auth.getUser();
          const sub = await subscribeToPush(u?.id, supabase);
          if (sub) {
            localStorage.setItem("pushSubscription", JSON.stringify(sub));
            setNotifEnabled(true);
          } else {
            alert("No se pudo activar. Verificá que la app esté instalada como PWA y volvé a intentar.");
          }
        } else if (permission === "denied") {
          alert("Notificaciones bloqueadas. Habilitá los permisos del navegador en Configuración del sistema.");
        } else {
          alert("Permiso no otorgado. Tocá Permitir cuando el navegador te lo solicite.");
        }
      }
    } catch (e) {
      console.error("Toggle notifications error:", e);
      alert("Error al activar notificaciones. Intentá de nuevo.");
    }
    setNotifLoading(false);
  }

  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Trainer invite state
  const [trainerInviteCode, setTrainerInviteCode] = useState(null);
  const [trainerInviteCopied, setTrainerInviteCopied] = useState(false);
  const [trainerInviteLoading, setTrainerInviteLoading] = useState(false);
  const [studentInviteCopied, setStudentInviteCopied] = useState(false);
  const [studentInviteCode, setStudentInviteCode] = useState(null);
  const [studentInviteLoading, setStudentInviteLoading] = useState(false);

  async function generateTrainerInvite() {
    if (trainerInviteLoading) return;
    setTrainerInviteLoading(true);
    // Reusar código existente no usado si hay uno vigente
    const { data: existing } = await supabase.from("trainer_invites")
      .select("code, expires_at")
      .eq("created_by", profile.id)
      .is("used_by", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    let code = existing?.code;
    if (!code) {
      code = Math.random().toString(36).slice(2, 10).toUpperCase();
      await supabase.from("trainer_invites").insert({ created_by: profile.id, code });
    }
    setTrainerInviteCode(code);
    setTrainerInviteLoading(false);
    const url = `${window.location.origin}/#/trainer-invite/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setTrainerInviteCopied(true);
      setTimeout(() => setTrainerInviteCopied(false), 3000);
    });
  }

  async function generateStudentInvite() {
    if (studentInviteLoading) return;
    setStudentInviteLoading(true);
    const { data: existing } = await supabase.from("invite_codes")
      .select("code")
      .eq("trainer_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    let code = existing?.code;
    if (!code) {
      code = Math.random().toString(36).slice(2, 10).toUpperCase();
      await supabase.from("invite_codes").insert({ trainer_id: profile.id, code });
    }
    setStudentInviteCode(code);
    setStudentInviteLoading(false);
    const url = `${window.location.origin}/#/join/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setStudentInviteCopied(true);
      setTimeout(() => setStudentInviteCopied(false), 3000);
    });
  }

  // Referral state
  const [referralCount, setReferralCount] = useState(null);
  const [referralCopied, setReferralCopied] = useState(false);
  useEffect(() => {
    if (!profile?.id) return;
    supabase.from("student_referrals").select("id, converted_at")
      .eq("referrer_id", profile.id)
      .then(({ data }) => setReferralCount(data || []));
  }, [profile?.id]);

  function copyReferralLink() {
    const code = profile?.referral_code;
    if (!code) return;
    const url = `${window.location.origin}/#/invite/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    });
  }

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Importer state
  const importWorkouts = useStore(s => s.importWorkouts);
  const fileInputRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null); // { workouts, format, totalWorkouts, totalSets, totalExercises }
  const [importError, setImportError] = useState("");
  const [importDone, setImportDone] = useState(null); // number of imported workouts

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(""); setImportPreview(null); setImportDone(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = parseImportFile(ev.target.result);
      if (result.error) { setImportError(result.error); return; }
      setImportPreview(result);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  function confirmImport() {
    if (!importPreview) return;
    const count = importWorkouts(importPreview.workouts);
    setImportDone(count);
    setImportPreview(null);
  }
  const [theme, setTheme] = useState(() => localStorage.getItem("loop-theme") || "dark");
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameMsg, setNameMsg] = useState("");
  const name = profile?.name || profile?.email?.split("@")[0] || "Atleta";
  const initial = name[0].toUpperCase();
  const role = profile?.role;

  async function saveName(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const uid = profile?.id || user?.id;
    if (!uid) { setNameMsg("Error: sesión no válida"); return; }
    const { error } = await supabase.from("profiles").update({ name: trimmed }).eq("id", uid);
    if (error) {
      setNameMsg("Error: " + error.message);
    } else {
      useAuthStore.setState(s => ({ profile: { ...(s.profile || { id: uid }), name: trimmed } }));
      setNameMsg("✓ Nombre actualizado");
      setTimeout(() => { setEditName(false); setNameMsg(""); }, 1200);
    }
  }

  async function handleChangePwd(e) {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdMsg("Las contraseñas no coinciden."); return; }
    if (newPwd.length < 8) { setPwdMsg("Mínimo 8 caracteres."); return; }
    setSavingPwd(true);
    setPwdMsg("");
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) {
      setPwdMsg("Error: " + error.message);
    } else {
      setPwdMsg("✓ Contraseña actualizada");
      setNewPwd(""); setConfirmPwd("");
      setTimeout(() => { setShowChangePwd(false); setPwdMsg(""); }, 1500);
    }
  }

  return (
    <>
      <section className="page">
        <div className="page-head">
          <button className="back-btn" onClick={() => setPage("home")} aria-label="Volver">
            <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
          </button>
          <div className="page-head-titles">
            <p className="eyebrow">Mi cuenta</p>
            <h1>Perfil</h1>
          </div>
        </div>

        {/* Avatar + info */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">{initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editName ? (
              <form onSubmit={saveName} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ flex: 1, background: "var(--panel2)", border: "1px solid var(--green)", borderRadius: 10, padding: "7px 10px", color: "var(--text)", fontSize: 14, minWidth: 0 }}
                  placeholder="Tu nombre"
                />
                <button type="submit" className="primary" style={{ padding: "8px 12px", fontSize: 13, borderRadius: 10 }}>✓</button>
                <button type="button" className="ghost" style={{ padding: "8px 12px", fontSize: 13, borderRadius: 10 }} onClick={() => setEditName(false)}>✕</button>
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 16 }}>{name}</strong>
                <button
                  className="ghost"
                  style={{ padding: "4px 8px", fontSize: 11, borderRadius: 8, color: "var(--muted)" }}
                  onClick={() => { setNewName(name); setEditName(true); setNameMsg(""); }}
                >Editar</button>
              </div>
            )}
            {nameMsg && <small style={{ color: nameMsg.startsWith("✓") ? "var(--green)" : "var(--danger)" }}>{nameMsg}</small>}
            <small>{profile?.email}</small>
          </div>
        </div>

        {/* Subscription / trial status — only for regular users */}
        {role === "user" && (() => {
          const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;
          const createdMs = profile?.created_at ? Date.now() - new Date(profile.created_at).getTime() : 0;
          const daysUsed = Math.floor(createdMs / (24*60*60*1000));
          const daysLeft = Math.max(0, 30 - daysUsed);
          const subStatus = profile?.subscription_status;
          const isActive = subStatus === "active" || subStatus === "trialing";
          const inTrial = !isActive && createdMs <= TRIAL_MS;
          const expired = !isActive && createdMs > TRIAL_MS;
          return (
            <div style={{ background: expired ? "rgba(239,68,68,.08)" : isActive ? "rgba(52,211,153,.08)" : "rgba(168,85,247,.06)", border: `1px solid ${expired ? "rgba(239,68,68,.25)" : isActive ? "rgba(52,211,153,.25)" : "rgba(168,85,247,.2)"}`, borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{expired ? "⛔" : isActive ? "✅" : "⏳"}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {expired ? "Suscripción vencida" : isActive ? "Suscripción activa" : `Trial activo — ${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {expired ? "Subscibite para seguir entrenando" : isActive ? "Plan mensual $25.000 ARS/mes" : "Después del trial: $25.000 ARS/mes"}
                  </div>
                </div>
              </div>
              {!isActive && (
                <button
                  className="primary"
                  style={{ width: "100%", padding: "11px", borderRadius: 12, fontSize: 13 }}
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke("mp-create-subscription");
                      if (!error && data?.init_point) window.open(data.init_point, "_blank");
                      else alert("No se pudo iniciar el pago. Intentá de nuevo.");
                    } catch { alert("Error de conexión. Verificá tu red."); }
                  }}
                >
                  {expired ? "Renovar suscripción" : "Suscribirse anticipado ($25.000/mes)"}
                </button>
              )}
            </div>
          );
        })()}

        {/* Referral card — only for students (not trainers/admins) */}
        {role === "user" && profile?.referral_code && (() => {
          const converted = (referralCount || []).filter(r => r.converted_at).length;
          const pending   = (referralCount || []).filter(r => !r.converted_at).length;
          const credits   = profile?.referral_credits || 0;
          const progress  = Math.min(converted % 5, 5);
          return (
            <div className="card" style={{ background: "linear-gradient(135deg, rgba(168,85,247,.1) 0%, rgba(52,211,153,.08) 100%)", border: "1px solid rgba(168,85,247,.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>🎁</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15 }}>Invitá amigos, ganá semanas gratis</h2>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Cada amigo que se suscribe = 1 semana gratis. 5 = mes gratis.</p>
                </div>
              </div>

              {/* Progress bar toward free month */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>
                  <span>{converted} amigo{converted !== 1 ? "s" : ""} se suscribieron</span>
                  <span style={{ color: "var(--green)", fontWeight: 700 }}>{progress}/5 para mes gratis</span>
                </div>
                <div style={{ height: 7, background: "var(--panel2)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(progress / 5) * 100}%`, background: "var(--green)", borderRadius: 4, transition: "width .4s ease" }} />
                </div>
              </div>

              {pending > 0 && (
                <p style={{ fontSize: 11, color: "#fbbf24", margin: "0 0 10px" }}>
                  ⏳ {pending} invitado{pending !== 1 ? "s" : ""} pendiente{pending !== 1 ? "s" : ""} de suscribirse
                </p>
              )}

              {credits > 0 && (
                <p style={{ fontSize: 12, color: "var(--green)", fontWeight: 700, margin: "0 0 10px" }}>
                  ✓ {credits} semana{credits !== 1 ? "s" : ""} gratis ganada{credits !== 1 ? "s" : ""}
                </p>
              )}

              <button
                onClick={copyReferralLink}
                style={{ width: "100%", padding: "12px", borderRadius: 12, background: referralCopied ? "rgba(52,211,153,.2)" : "rgba(168,85,247,.15)", border: `1px solid ${referralCopied ? "rgba(52,211,153,.5)" : "rgba(168,85,247,.4)"}`, color: referralCopied ? "#34d399" : "var(--green)", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {referralCopied ? "✓ Link copiado!" : "📋 Copiar mi link de invitación"}
              </button>
            </div>
          );
        })()}

        {/* Trainer invite panel — solo para trainers y admins */}
        {(role === "trainer" || role === "admin" || role === "superadmin") && (
          <div style={{ background:"var(--panel)", borderRadius:16, padding:"14px 16px", marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>🔗 Invitaciones</div>
            <p style={{ fontSize:12, color:"var(--muted)", marginBottom:12, lineHeight:1.5 }}>
              Generá links para incorporar alumnos o colegas entrenadores.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button
                onClick={generateStudentInvite}
                disabled={studentInviteLoading}
                style={{ padding:"11px 14px", borderRadius:12, background: studentInviteCopied ? "rgba(52,211,153,.2)" : "rgba(52,211,153,.1)", border:`1px solid ${studentInviteCopied ? "rgba(52,211,153,.6)" : "rgba(52,211,153,.3)"}`, color: studentInviteCopied ? "#34d399" : "#34d399", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {studentInviteLoading ? "Generando…" : studentInviteCopied ? "✓ Link de alumno copiado!" : "👤 Copiar link para alumno"}
              </button>
              <button
                onClick={generateTrainerInvite}
                disabled={trainerInviteLoading}
                style={{ padding:"11px 14px", borderRadius:12, background: trainerInviteCopied ? "rgba(168,85,247,.2)" : "rgba(168,85,247,.1)", border:`1px solid ${trainerInviteCopied ? "rgba(168,85,247,.6)" : "rgba(168,85,247,.3)"}`, color: trainerInviteCopied ? "#c084fc" : "#a855f7", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {trainerInviteLoading ? "Generando…" : trainerInviteCopied ? "✓ Link de entrenador copiado!" : "🏋️ Copiar link para entrenador colega"}
              </button>
            </div>
            {(trainerInviteCode || studentInviteCode) && (
              <p style={{ fontSize:11, color:"var(--muted)", marginTop:8, textAlign:"center" }}>
                Los links de entrenador expiran en 7 días y son de un solo uso.
              </p>
            )}
          </div>
        )}

        {/* Body Metrics */}
        <div style={{ background:"var(--panel)", borderRadius:16, padding:"14px 16px", marginBottom:12 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>📏 Mi progreso</div>

          {/* Input peso */}
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input
              type="number"
              placeholder="Peso (kg)"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              style={{ flex:1, padding:"8px 12px", borderRadius:8, border:"1px solid var(--line)", background:"var(--bg)", color:"var(--text)", fontSize:14 }}
            />
            <button onClick={handleAddWeight} style={{ background:"var(--accent)", color:"#fff", border:"none", borderRadius:8, padding:"8px 14px", fontWeight:600, cursor:"pointer" }}>
              Guardar
            </button>
          </div>

          {bodyMetrics.length >= 2 && (
            <BodyWeightChart data={bodyMetrics.slice(-8)} />
          )}

          {bodyMetrics.length > 0 && (
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:6 }}>
              Último registro: {bodyMetrics[bodyMetrics.length-1].weight}kg el {bodyMetrics[bodyMetrics.length-1].date}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="card">
          <h2>Configuración</h2>

          {/* Font size control */}
          <div className="settings-row" style={{ alignItems: "center" }}>
            <div><label>Tamaño de letra</label><small>Ajustá el zoom de toda la app</small></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => setFontScale(Math.max(0.8, Math.round((fontScale - 0.1) * 10) / 10))}
                style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--line)", background: "var(--panel2)", color: "var(--text)", fontSize: 18, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                aria-label="Reducir letra">−</button>
              <span style={{ fontSize: 13, color: "var(--muted)", minWidth: 36, textAlign: "center", fontWeight: 700 }}>{Math.round(fontScale * 100)}%</span>
              <button
                onClick={() => setFontScale(Math.min(2.0, Math.round((fontScale + 0.1) * 10) / 10))}
                style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--line)", background: "var(--panel2)", color: "var(--text)", fontSize: 18, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                aria-label="Aumentar letra">+</button>
            </div>
          </div>

          <div className="settings-row" style={{ flexDirection:"column", alignItems:"flex-start", gap:8 }}>
            <div><label>Objetivo semanal</label><small>Entrenos por semana que se muestra en el inicio</small></div>
            <div style={{ display:"flex", gap:6 }}>
              {[2,3,4,5,6].map(n => (
                <button key={n} onClick={() => setWeeklyGoal(n)}
                  style={{
                    width:36, height:36, borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:14,
                    background: weeklyGoal === n ? "var(--green)" : "var(--panel2,rgba(255,255,255,.06))",
                    color: weeklyGoal === n ? "#fff" : "var(--muted)",
                  }}>{n}</button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div><label>Modo AMOLED</label><small>Fondo negro puro para pantallas OLED</small></div>
            <button className={`toggle${amoled ? " on" : ""}`} onClick={toggleAmoled} aria-pressed={amoled} />
          </div>

          <div className="settings-row">
            <div><label>Sonido descanso</label><small>Beep al terminar el temporizador</small></div>
            <button className={`toggle${soundEnabled ? " on" : ""}`} onClick={toggleSound} aria-pressed={soundEnabled} />
          </div>

          {isPushSupported() && !isIosNotInstalled() && (
            <div className="settings-row">
              <div>
                <label>Notificaciones push</label>
                <small>{notifEnabled ? "Activas — te avisamos cuando termina el descanso" : "Desactivadas"}</small>
              </div>
              <button
                onClick={toggleNotifications}
                disabled={notifLoading}
                aria-pressed={notifEnabled}
                className={`toggle${notifEnabled ? " on" : ""}`}
                style={{ opacity: notifLoading ? 0.6 : 1 }}
              />
            </div>
          )}

          {isIosNotInstalled() && (
            <div className="settings-row">
              <div>
                <label>Notificaciones push</label>
                <small>Para activarlas en iOS, instalá la app: tocá Compartir → "Añadir a inicio"</small>
              </div>
            </div>
          )}

          {mutedHintTypes.length > 0 && (
            <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
              <div><label>Alertas silenciadas</label><small>Tocá para reactivar</small></div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {mutedHintTypes.map(type => (
                  <button key={type} onClick={() => toggleMutedHintType(type)}
                    style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid var(--line)", cursor: "pointer", fontSize: 12, background:"rgba(255,255,255,.04)", color:"var(--muted)", textDecoration:"line-through" }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <div><label>Objetivo</label><small>Define cómo el coach adapta sus consejos y rangos de repeticiones</small></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              { GOALS.map(g => (
                <button key={g.id} onClick={() => {
                  setUserGoal(g.id);
                  if (profile?.id) { supabase.from("profiles").update({ goal: g.id }).eq("id", profile.id).catch(() => {}); }
                }}
                  style={{
                    padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:12,
                    background: userGoal === g.id ? "var(--green)" : "var(--panel2,rgba(255,255,255,.06))",
                    color: userGoal === g.id ? "#fff" : "var(--muted)",
                  }}>{g.icon} {g.label}</button>
              ))}
            </div>
            {(() => {
              const repRanges = { volumen: "8-12 reps", definicion: "10-15 reps", mantenimiento: "8-15 reps", rendimiento: "1-6 reps" };
              const restTimes = { volumen: "90 seg", definicion: "45-60 seg", mantenimiento: "75 seg", rendimiento: "3-5 min" };
              const freqSugg = { volumen: "3-4 días/sem", definicion: "4-5 días/sem", mantenimiento: "3 días/sem", rendimiento: "3-4 días/sem" };
              return (
                <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--panel2)", borderRadius: 8, padding: "6px 10px", marginTop: 2 }}>
                  <b style={{ color: "var(--text)" }}>{GOALS.find(g => g.id === userGoal)?.label}:</b>{" "}
                  {repRanges[userGoal]} · descanso {restTimes[userGoal]} · {freqSugg[userGoal]}
                </div>
              );
            })()}
          </div>

          <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <div><label>Actividad diaria</label><small>Afecta la meta de entrenamientos semanales y el cálculo calórico</small></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setActivityLevel(l.id)}
                  style={{
                    padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:12,
                    background: activityLevel === l.id ? "var(--green)" : "var(--panel2,rgba(255,255,255,.06))",
                    color: activityLevel === l.id ? "#fff" : "var(--muted)",
                  }}>{l.icon} {l.label}</button>
              ))}
            </div>
            {(() => {
              const goalDefaults = {
                volumen:       { principiante: 3, intermedio: 4, avanzado: 5 },
                definicion:    { principiante: 3, intermedio: 4, avanzado: 5 },
                mantenimiento: { principiante: 2, intermedio: 3, avanzado: 3 },
                rendimiento:   { principiante: 3, intermedio: 4, avanzado: 5 },
              };
              const rec = goalDefaults[userGoal]?.[activityLevel] ?? 4;
              return (
                <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--panel2)", borderRadius: 8, padding: "6px 10px", marginTop: 2 }}>
                  Meta recomendada para vos: <b style={{ color: "var(--green)" }}>{rec} entrenamientos/semana</b>
                </div>
              );
            })()}
          </div>


          <div className="settings-row" style={{ flexDirection:"column", alignItems:"flex-start", gap:8 }}>
            <div>
              <label>🏆 Modo competencia</label>
              <small>Definí una fecha meta y el coach adapta tu plan</small>
            </div>
            {competitionDate ? (
              <div style={{ display:"flex", gap:8, alignItems:"center", width:"100%" }}>
                <div style={{ flex:1, background:"var(--panel2)", borderRadius:10, padding:"8px 12px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--green)" }}>{competitionName || "Meta"}</div>
                  <div style={{ fontSize:12, color:"var(--muted)" }}>{competitionDate} · {(() => { const d = Math.ceil((new Date(competitionDate)-new Date())/86400000); return d > 0 ? `${d} días` : d === 0 ? "¡Hoy!" : "Fecha pasada"; })()}</div>
                </div>
                <button onClick={clearCompetitionMode} className="ghost" style={{ padding:"8px 12px", fontSize:13 }}>✕</button>
              </div>
            ) : showCompForm ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8, width:"100%" }}>
                <input value={compName} onChange={e=>setCompName(e.target.value)} placeholder="Nombre (ej: Torneo, Viaje)" style={{ background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:10, padding:"8px 12px", color:"var(--text)", fontSize:13 }} />
                <input type="date" value={compDate} onChange={e=>setCompDate(e.target.value)} style={{ background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:10, padding:"8px 12px", color:"var(--text)", fontSize:13 }} />
                <div style={{ display:"flex", gap:8 }}>
                  <button className="primary" style={{ flex:1 }} disabled={!compDate} onClick={() => { setCompetitionMode(compDate, compName); setShowCompForm(false); }}>Guardar</button>
                  <button className="ghost" onClick={() => setShowCompForm(false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button className="ghost" style={{ padding:"8px 14px", fontSize:13 }} onClick={() => setShowCompForm(true)}>Configurar fecha meta</button>
            )}
          </div>

          <div className="settings-row">
            <div><label>📏 Mediciones corporales</label><small>Peso, pliegues, perímetros y más</small></div>
            <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => setPage("measurements")}>
              Ver
            </button>
          </div>

          <div className="settings-row">
            <div><label>Contraseña</label><small>Cambiá tu contraseña</small></div>
            <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }}
              onClick={() => { setShowChangePwd(!showChangePwd); setPwdMsg(""); }}>
              Cambiar
            </button>
          </div>

          {showChangePwd && (
            <form onSubmit={handleChangePwd} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              <div className="field-group">
                <label>Nueva contraseña</label>
                <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Mínimo 8 caracteres" autoComplete="new-password" required minLength={8} />
              </div>
              <div className="field-group">
                <label>Confirmar contraseña</label>
                <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Repetí la contraseña" autoComplete="new-password" required />
              </div>
              {pwdMsg && (
                <div className={pwdMsg.startsWith("✓") ? "success-msg" : "login-error"}>
                  <Icon name={pwdMsg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                  <span>{pwdMsg}</span>
                </div>
              )}
              <button type="submit" className="primary" style={{ width: "100%" }} disabled={savingPwd}>
                {savingPwd ? "Guardando…" : "Guardar contraseña"}
              </button>
            </form>
          )}
        </div>

        {/* Export data */}
        <div className="card" style={{ marginTop: 14 }}>
          <h2>Datos</h2>
          <div className="settings-row">
            <div><label>Exportar mis datos</label><small>Descargá todo tu historial en formato JSON</small></div>
            <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => {
              const state = useStore.getState();
              const data = {
                workouts: state.workouts || [],
                cardioHistory: state.cardioHistory || [],
                measurements: state.measurements || [],
                weightLog: state.weightLog || [],
                prs: state.prs || [],
                mealLog: state.mealLog || [],
                exportedAt: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `pulse-data-${todayLocal()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}>Exportar</button>
          </div>
        </div>

        {/* ── Importador CSV ─────────────────────────────────────────────── */}
        <div className="settings-section" style={{ marginTop: 20 }}>
          <p className="settings-label">Importar historial</p>
          <div style={{ background: "var(--panel2)", borderRadius: 14, padding: "14px 16px" }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              Traé tus entrenamientos desde <b style={{ color: "var(--text)" }}>Strong</b> o <b style={{ color: "var(--text)" }}>Hevy</b>.<br />
              Exportá el CSV desde la app y subilo acá.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportFile}
              style={{ display: "none" }}
            />
            <button
              className="ghost"
              style={{ width: "100%", padding: "11px", border: "1.5px dashed rgba(168,85,247,.4)", borderRadius: 12, color: "var(--green)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onClick={() => { setImportError(""); setImportPreview(null); setImportDone(null); fileInputRef.current?.click(); }}
            >
              <Icon name="Upload" size={16} /> Subir CSV
            </button>

            {importError && (
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--danger)" }}>{importError}</p>
            )}

            {importDone !== null && (
              <div style={{ marginTop: 10, background: "rgba(52,211,153,.1)", border: "1px solid rgba(52,211,153,.3)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#34d399", fontWeight: 700 }}>
                  ✓ {importDone === 0 ? "No había entrenamientos nuevos (ya estaban importados)" : `${importDone} entrenamientos importados`}
                </p>
              </div>
            )}

            {importPreview && (
              <div style={{ marginTop: 10, background: "rgba(168,85,247,.07)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 12, padding: "12px 14px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Vista previa · {importPreview.format === "strong" ? "Strong" : "Hevy"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, margin: "8px 0 12px" }}>
                  {[
                    { label: "Entrenamientos", value: importPreview.totalWorkouts },
                    { label: "Series", value: importPreview.totalSets },
                    { label: "Ejercicios", value: importPreview.totalExercises },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "var(--panel)", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)" }}>{value}</div>
                      <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "var(--muted)" }}>
                  Los entrenamientos que ya existían en Loop no se duplican.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="ghost" style={{ flex: 1, fontSize: 13, padding: "9px 0" }} onClick={() => setImportPreview(null)}>
                    Cancelar
                  </button>
                  <button className="primary" style={{ flex: 2, fontSize: 13, padding: "9px 0" }} onClick={confirmImport}>
                    Importar {importPreview.totalWorkouts} entrenamientos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <button className="ghost danger-btn" style={{ width: "100%", marginTop: 10 }}
          onClick={() => setShowLogoutConfirm(true)}>
          <Icon name="LogOut" size={16} /> Cerrar sesión
        </button>

        {/* Delete account */}
        <button
          className="ghost"
          style={{ width: "100%", marginTop: 8, color: "var(--muted)", fontSize: 12, opacity: 0.6 }}
          onClick={() => { setShowDeleteConfirm(true); setDeleteStep(1); setDeleteError(""); }}
        >
          Eliminar mi cuenta
        </button>
      </section>

      {/* Delete account modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => { if (!deleting) { setShowDeleteConfirm(false); setDeleteStep(1); }}}>
          <div className="modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
            {deleteStep === 1 ? (
              <>
                <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
                  <h2 style={{ margin: "0 0 6px", color: "var(--danger)" }}>Eliminar cuenta</h2>
                  <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                    Se borrarán permanentemente todos tus entrenamientos, mediciones, PRs y datos. <b style={{ color: "var(--text)" }}>Esta acción no se puede deshacer.</b>
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ghost" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>
                    Cancelar
                  </button>
                  <button
                    style={{ flex: 1, background: "var(--danger)", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                    onClick={() => setDeleteStep(2)}
                  >
                    Continuar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🗑️</div>
                  <h2 style={{ margin: "0 0 6px" }}>¿Estás seguro?</h2>
                  <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
                    No hay vuelta atrás. Tu historial de entrenamiento se perderá para siempre.
                  </p>
                </div>
                {deleteError && (
                  <p style={{ color: "var(--danger)", fontSize: 12, textAlign: "center", margin: "0 0 10px" }}>{deleteError}</p>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ghost" style={{ flex: 1 }} disabled={deleting} onClick={() => { setShowDeleteConfirm(false); setDeleteStep(1); }}>
                    Cancelar
                  </button>
                  <button
                    style={{ flex: 1, background: "var(--danger)", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: deleting ? 0.6 : 1 }}
                    disabled={deleting}
                    onClick={async () => {
                      setDeleting(true);
                      setDeleteError("");
                      try {
                        const { data, error } = await supabase.functions.invoke("delete-account");
                        if (error || data?.error) {
                          setDeleteError("Error al eliminar. Intentá de nuevo o contactá soporte.");
                          setDeleting(false);
                          return;
                        }
                        // Clear local state and log out
                        useStore.getState().clearAllData?.();
                        await supabase.auth.signOut();
                        useAuthStore.getState().logout();
                      } catch {
                        setDeleteError("Error de conexión. Intentá de nuevo.");
                        setDeleting(false);
                      }
                    }}
                  >
                    {deleting ? "Eliminando…" : "Sí, eliminar todo"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <Icon name="LogOut" size={32} style={{ color: "var(--danger)" }} />
              <h2 style={{ margin: "12px 0 6px" }}>¿Cerrar sesión?</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
                Vas a salir de tu cuenta en este dispositivo.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </button>
              <button className="primary" style={{ flex: 1, background: "var(--danger)", color: "#fff" }}
                onClick={logout}>
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

