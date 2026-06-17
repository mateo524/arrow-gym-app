import { useState } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import Icon from "../components/Icon.jsx";

export default function ProfilePage() {
  const setPage = useStore((s) => s.setPage);
  const amoled = useStore((s) => s.amoled);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const toggleAmoled = useStore((s) => s.toggleAmoled);
  const toggleSound = useStore((s) => s.toggleSound);
  const profile = useAuthStore((s) => s.profile);
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
  const [editMeasures, setEditMeasures] = useState(false);
  const [measWeight, setMeasWeight] = useState("");
  const [measHeight, setMeasHeight] = useState("");
  const [measAge, setMeasAge] = useState("");
  const [measMsg, setMeasMsg] = useState("");

  const name = profile?.name || profile?.email?.split("@")[0] || "Atleta";
  const initial = name[0].toUpperCase();
  const role = profile?.role;

  async function saveName(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const { error } = await supabase.from("profiles").update({ name: trimmed }).eq("id", profile.id);
    if (error) {
      setNameMsg("Error: " + error.message);
    } else {
      useAuthStore.setState({ profile: { ...profile, name: trimmed } });
      setNameMsg("✓ Nombre actualizado");
      setTimeout(() => { setEditName(false); setNameMsg(""); }, 1200);
    }
  }

  function openMeasures() {
    setMeasWeight(String(profile?.weight_kg || ""));
    setMeasHeight(String(profile?.height_cm || ""));
    setMeasAge(String(profile?.age || ""));
    setMeasMsg("");
    setEditMeasures(true);
  }

  async function saveMeasures(e) {
    e.preventDefault();
    const payload = {};
    if (measWeight) payload.weight_kg = Number(measWeight);
    if (measHeight) payload.height_cm = Number(measHeight);
    if (measAge) payload.age = Number(measAge);
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    if (error) {
      setMeasMsg("Error al guardar: " + error.message);
    } else {
      useAuthStore.setState({ profile: { ...profile, ...payload } });
      setMeasMsg("✓ Medidas guardadas");
      setTimeout(() => { setEditMeasures(false); setMeasMsg(""); }, 1200);
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

      {/* Body measurements */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Medidas corporales</h2>
          {!editMeasures && (
            <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={openMeasures}>
              {profile?.weight_kg ? "Editar" : "Agregar"}
            </button>
          )}
        </div>
        {!editMeasures ? (
          profile?.weight_kg || profile?.height_cm || profile?.age ? (
            <div className="stats-grid" style={{ marginTop: 8 }}>
              {profile.weight_kg && <div><b>{profile.weight_kg}</b><span>kg</span></div>}
              {profile.height_cm && <div><b>{profile.height_cm}</b><span>cm</span></div>}
              {profile.age && <div><b>{profile.age}</b><span>años</span></div>}
            </div>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
              Aún no cargaste tus medidas. Usá el botón "Agregar" para registrarlas.
            </p>
          )
        ) : (
          <form onSubmit={saveMeasures} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="quick-grid">
              <label className="field-group">
                Peso (kg)
                <input inputMode="decimal" value={measWeight} onChange={(e) => setMeasWeight(e.target.value)} placeholder="ej: 75" />
              </label>
              <label className="field-group">
                Altura (cm)
                <input inputMode="decimal" value={measHeight} onChange={(e) => setMeasHeight(e.target.value)} placeholder="ej: 175" />
              </label>
            </div>
            <label className="field-group">
              Edad
              <input inputMode="numeric" value={measAge} onChange={(e) => setMeasAge(e.target.value)} placeholder="ej: 25" />
            </label>
            {measMsg && (
              <div className={measMsg.startsWith("✓") ? "success-msg" : "login-error"}>
                <Icon name={measMsg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                <span>{measMsg}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setEditMeasures(false)}>Cancelar</button>
              <button type="submit" className="primary" style={{ flex: 1 }}>Guardar</button>
            </div>
          </form>
        )}
      </div>

      {/* Settings */}
      <div className="card">
        <h2>Configuración</h2>

        <div className="settings-row">
          <div><label>Modo AMOLED</label><small>Fondo negro puro para pantallas OLED</small></div>
          <button className={`toggle${amoled ? " on" : ""}`} onClick={toggleAmoled} aria-pressed={amoled} />
        </div>

        <div className="settings-row">
          <div><label>Sonido descanso</label><small>Beep al terminar el temporizador</small></div>
          <button className={`toggle${soundEnabled ? " on" : ""}`} onClick={toggleSound} aria-pressed={soundEnabled} />
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

      {/* Logout */}
      <button className="ghost danger-btn" style={{ width: "100%", marginTop: 14 }}
        onClick={() => setShowLogoutConfirm(true)}>
        <Icon name="LogOut" size={16} /> Cerrar sesión
      </button>

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
    </section>
  );
}
