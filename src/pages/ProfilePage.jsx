import { useState } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import { todayLocal } from "../lib/dates.js";
import Icon from "../components/Icon.jsx";

const GOALS = [
  { id: "volumen",       label: "Ganar músculo",  icon: "💪" },
  { id: "definicion",    label: "Definición",     icon: "🔥" },
  { id: "mantenimiento", label: "Mantenimiento",  icon: "⚖" },
  { id: "rendimiento",   label: "Rendimiento",    icon: "⚡" },
];
const LEVELS = [
  { id: "principiante", label: "Principiante",  icon: "🌱" },
  { id: "intermedio",   label: "Intermedio",    icon: "💪" },
  { id: "avanzado",     label: "Avanzado",      icon: "🏆" },
];

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
  const autoDarkMode = useStore((s) => s.autoDarkMode) || false;
  const setAutoDarkMode = useStore((s) => s.setAutoDarkMode);
  const competitionDate = useStore(s => s.competitionDate);
  const competitionName = useStore(s => s.competitionName);
  const setCompetitionMode = useStore(s => s.setCompetitionMode);
  const clearCompetitionMode = useStore(s => s.clearCompetitionMode);
  const [showCompForm, setShowCompForm] = useState(false);
  const [compDate, setCompDate] = useState("");
  const [compName, setCompName] = useState("");

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
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
    if (newPwd.length < 6) { setPwdMsg("Mínimo 6 caracteres."); return; }
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
            <span className="role-badge">{role}</span>
          </div>
        </div>

        {/* Settings */}
        <div className="card">
          <h2>Configuración</h2>

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

          <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <div><label>Objetivo</label><small>Define cómo el coach adapta sus consejos</small></div>
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
                  }}>{g.label}</button>
              ))}
            </div>
          </div>

          <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <div><label>Actividad diaria</label><small>Pasos, deporte, trabajo físico</small></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setActivityLevel(l.id)}
                  style={{
                    padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:12,
                    background: activityLevel === l.id ? "var(--green)" : "var(--panel2,rgba(255,255,255,.06))",
                    color: activityLevel === l.id ? "#fff" : "var(--muted)",
                  }}>{l.label}</button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div><label>Modo oscuro automático</label><small>Sigue el tema del sistema</small></div>
            <button className={`toggle${autoDarkMode ? " on" : ""}`} onClick={() => setAutoDarkMode(!autoDarkMode)} aria-pressed={autoDarkMode} />
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
            <div><label>🎯 Retos de 30 días</label><small>Desafíos para mantener el hábito</small></div>
            <button className="ghost" style={{ padding:"8px 14px", fontSize:13 }} onClick={() => setPage("challenges")}>Ver retos</button>
          </div>

          <div className="settings-row">
            <div><label>📏 Mediciones corporales</label><small>Peso, pliegues, perímetros y más</small></div>
            <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => setPage("measurements")}>
              Ver
            </button>
          </div>

          <div className="settings-row">
            <div><label>💪 Sincronizar con app de salud</label><small>Apple Health, Google Fit, Samsung Health, Mi Fitness</small></div>
            <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => setPage("healthsync")}>
              Conectar
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
                  placeholder="Mínimo 6 caracteres" autoComplete="new-password" required minLength={6} />
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

        {/* Logout */}
        <button className="ghost danger-btn" style={{ width: "100%", marginTop: 14 }}
          onClick={() => setShowLogoutConfirm(true)}>
          <Icon name="LogOut" size={16} /> Cerrar sesión
        </button>
      </section>

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

