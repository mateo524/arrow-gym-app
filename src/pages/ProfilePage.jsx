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

  const name = profile?.name || profile?.email?.split("@")[0] || "Atleta";
  const initial = name[0].toUpperCase();
  const role = profile?.role;

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
        <div>
          <strong>{name}</strong>
          <small>{profile?.email}</small>
          <span className="role-badge">{role}</span>
        </div>
      </div>

      {/* Body stats if user role */}
      {profile?.weight_kg && (
        <div className="card" style={{ marginBottom: 14 }}>
          <h2>Datos corporales</h2>
          <div className="stats-grid" style={{ marginTop: 8 }}>
            {profile.weight_kg && <div><b>{profile.weight_kg}</b><span>kg</span></div>}
            {profile.height_cm && <div><b>{profile.height_cm}</b><span>cm</span></div>}
            {profile.age && <div><b>{profile.age}</b><span>años</span></div>}
          </div>
        </div>
      )}

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
