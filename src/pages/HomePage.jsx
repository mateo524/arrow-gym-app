import { useState } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import { getWorkoutVolume, formatDate } from "../lib/analytics.js";
import Icon from "../components/Icon.jsx";

export default function HomePage() {
  const workouts = useStore((s) => s.workouts);
  const setPage = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
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

  const last = workouts[0];
  const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
  const role = profile?.role;
  const isAdmin = role === "superadmin" || role === "admin";
  const name = profile?.name || profile?.email?.split("@")[0] || "Atleta";
  const initial = name[0].toUpperCase();

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
      <div className="home-header">
        <div style={{ flex: 1 }}>
          <p className="eyebrow">Pulse</p>
          <h1 style={{ margin: 0 }}>Hola, {name.split(" ")[0]} 👋</h1>
        </div>
        <div className="profile-avatar">{initial}</div>
      </div>

      <div className="hero" style={{ marginTop: 16 }}>
        <p className="eyebrow" style={{ color: "var(--green)" }}>Pulse</p>
        <h1>Entrená rápido. Medí cada músculo.</h1>
        <p>Mapa muscular avanzado, radar por grupos y registro sin fricción durante el gym.</p>
        <button className="primary big" onClick={() => setPage(activeWorkout ? "workout" : "start")}>
          {activeWorkout ? "Continuar entrenamiento" : "Empezar entrenamiento"}
        </button>
      </div>

      <div className="stats-grid">
        <div><b>{workouts.length}</b><span>entrenamientos</span></div>
        <div><b>{totalSets}</b><span>series</span></div>
        <div><b>{last ? Math.round(getWorkoutVolume(last)) : 0}</b><span>kg último</span></div>
      </div>

      {last && (
        <button className="card as-button" onClick={() => useStore.getState().openWorkout(last.id)}>
          <h2>Último entrenamiento</h2>
          <p>{last.type} · {formatDate(last.date)}</p>
          <strong>{last.sets.length} series · {Math.round(getWorkoutVolume(last))} kg</strong>
        </button>
      )}

      <div className="card" style={{ marginTop: 14 }}>
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

        <div className="settings-row" style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 12 }}>
          <div><label>Sesión</label><small>{profile?.email}</small></div>
          <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={logout}>
            Salir
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="notice" style={{ marginTop: 14 }}>
          <b>Panel Admin activo</b>
          <p>Tenés acceso completo. Tus datos se guardan en la nube y en este dispositivo.</p>
        </div>
      )}
    </section>
  );
}
