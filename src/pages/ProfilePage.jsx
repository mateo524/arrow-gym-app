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

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
            <span className="role-badge">{role}</span>
          </div>
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

