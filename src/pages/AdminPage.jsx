import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import Icon from "../components/Icon.jsx";
import useAuthStore from "../store/useAuthStore.js";

const EMPTY_FORM = { name: "", email: "", password: "", trainer_id: "", weight_kg: "", height_cm: "", age: "", shoulder_alert: false };

export default function AdminPage() {
  const { profile } = useAuthStore();
  const [tab, setTab] = useState("clients");
  const [trainers, setTrainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [trainerRequests, setTrainerRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [createRole, setCreateRole] = useState("user");
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [deleteUserTarget, setDeleteUserTarget] = useState(null); // { id, email }
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: t }, { data: c }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "trainer").order("name"),
      supabase.from("profiles").select("*, trainer:trainer_id(name)").eq("role", "user").order("name"),
      supabase.from("trainer_role_requests").select("*, user:user_id(id, name, email)").eq("status", "pending").order("created_at"),
    ]);
    setTrainers(t || []);
    setClients(c || []);
    setTrainerRequests(r || []);
    setLoading(false);
  }

  async function handleApproveTrainer(userId) {
    try {
      const { error } = await supabase.rpc("approve_trainer_role", { p_user_id: userId });
      if (error) throw error;
      window.__showToast?.("Rol de entrenador activado.", "success");
      await loadData();
    } catch (e) {
      window.__showToast?.(e.message || "Error al aprobar.", "error");
    }
  }

  async function handleRejectTrainer(requestId) {
    const { error } = await supabase.from("trainer_role_requests").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", requestId);
    if (error) { window.__showToast?.(error.message, "error"); return; }
    window.__showToast?.("Solicitud rechazada.", "success");
    await loadData();
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    setCreateSuccess("");

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        name: form.name,
        role: createRole,
        trainer_id: form.trainer_id || null,
        weight_kg: form.weight_kg || null,
        height_cm: form.height_cm || null,
        age: form.age || null,
        shoulder_alert: form.shoulder_alert,
      }),
    });

    const result = await res.json();
    if (!res.ok || result.error) {
      setCreateError(result.error || "Error al crear el usuario.");
      setCreating(false);
      return;
    }

    setCreateSuccess(`✓ ${createRole === "trainer" ? "Entrenador" : "Cliente"} creado: ${form.email}`);
    setForm(EMPTY_FORM);
    setCreating(false);
    await loadData();
  }

  async function handleDeleteUser(id) {
    setDeleteError("");

    // 1. Delete profile from profiles table
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", id);
    if (profileError) {
      setDeleteError(profileError.message || "Error al eliminar el perfil.");
      return;
    }

    // 2. Delete the Supabase Auth user via Edge Function
    // NOTE: The Edge Function at create-user must support DELETE + { userId } in the body.
    // If it does not yet support DELETE, the profile is still removed above; the auth user
    // will remain active until the Edge Function is updated to handle deletion.
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        // Non-fatal: profile is already deleted; surface a warning but continue
        setDeleteError(result.error || "Perfil eliminado, pero no se pudo borrar el usuario de Auth.");
      }
    } catch {
      setDeleteError("Perfil eliminado, pero ocurrió un error al contactar el servidor de Auth.");
    }

    setDeleteUserTarget(null);
    await loadData();
  }

  const displayList = tab === "trainers" ? trainers : clients; // "requests" handled separately

  if (!["admin", "superadmin"].includes(profile?.role)) return null;

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Panel Admin</p>
        <h1>Gestión de usuarios</h1>
      </div>

      <div className="tab-row">
        <button className={`tab-btn${tab === "clients" ? " active" : ""}`} onClick={() => setTab("clients")}>
          Clientes <span className="tab-count">{clients.length}</span>
        </button>
        <button className={`tab-btn${tab === "trainers" ? " active" : ""}`} onClick={() => setTab("trainers")}>
          Entrenadores <span className="tab-count">{trainers.length}</span>
        </button>
        <button className={`tab-btn${tab === "requests" ? " active" : ""}`} onClick={() => setTab("requests")} style={{ position: "relative" }}>
          Solicitudes
          {trainerRequests.length > 0 && <span className="tab-count" style={{ background: "var(--red, #e05252)" }}>{trainerRequests.length}</span>}
        </button>
      </div>

      {tab !== "requests" && (
        <button className="primary" style={{ width: "100%", marginBottom: 16 }} onClick={() => {
          setShowCreate(true);
          setCreateRole(tab === "trainers" ? "trainer" : "user");
          setCreateError("");
          setCreateSuccess("");
          setForm(EMPTY_FORM);
        }}>
          <Icon name="Plus" size={16} /> Crear {tab === "trainers" ? "entrenador" : "cliente"}
        </button>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear {createRole === "trainer" ? "entrenador" : "cliente"}</h2>
              <button className="ghost icon-btn" onClick={() => setShowCreate(false)}>
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="create-form">
              {/* Basic info */}
              <div className="field-group">
                <label>Nombre completo</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Pérez" required />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@email.com" required maxLength={254} />
              </div>
              <div className="field-group">
                <label>Contraseña temporal</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" required minLength={6} />
              </div>

              {/* Trainer assignment (only for users) */}
              {createRole === "user" && trainers.length > 0 && (
                <div className="field-group">
                  <label>Entrenador asignado</label>
                  <select value={form.trainer_id} onChange={(e) => setForm({ ...form, trainer_id: e.target.value })}>
                    <option value="">— Sin entrenador —</option>
                    {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {/* Body stats – mandatory for users, hidden for trainers */}
              {createRole === "user" && (
                <>
                  <div className="section-divider">
                    <span>Datos corporales <span className="required-badge">Opcional — el usuario los completa al entrar</span></span>
                  </div>
                  <div className="field-row-3">
                    <div className="field-group">
                      <label>Peso (kg)</label>
                      <input type="number" min={30} max={200} step={0.5} value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} placeholder="75" required={false} inputMode="decimal" />
                    </div>
                    <div className="field-group">
                      <label>Altura (cm)</label>
                      <input type="number" min={100} max={220} value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} placeholder="175" required={false} inputMode="numeric" />
                    </div>
                    <div className="field-group">
                      <label>Edad</label>
                      <input type="number" min={10} max={100} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="28" required={false} inputMode="numeric" />
                    </div>
                  </div>

                  {/* Shoulder alert toggle – only enable if this user has shoulder issues */}
                  <div className="settings-row" style={{ padding: "10px 0", borderBottom: 0 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>Alerta hombro post-op</label>
                      <small style={{ color: "var(--muted)", fontSize: 11, display: "block" }}>Activar solo si el cliente está en rehabilitación de hombro</small>
                    </div>
                    <button
                      type="button"
                      className={`toggle${form.shoulder_alert ? " on" : ""}`}
                      onClick={() => setForm({ ...form, shoulder_alert: !form.shoulder_alert })}
                      aria-pressed={form.shoulder_alert}
                    />
                  </div>
                </>
              )}

              {createError && <div className="login-error"><Icon name="AlertCircle" size={14} /><span>{createError}</span></div>}
              {createSuccess && <div className="success-msg"><Icon name="CheckCircle" size={14} /><span>{createSuccess}</span></div>}

              <button type="submit" className="primary" style={{ width: "100%" }} disabled={creating}>
                {creating ? "Creando…" : "Crear cuenta"}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state"><Icon name="Loader" size={24} className="spin" /><p>Cargando…</p></div>
      ) : tab === "requests" ? (
        trainerRequests.length === 0 ? (
          <div className="empty-state">
            <Icon name="UserCheck" size={40} />
            <p>No hay solicitudes pendientes.</p>
          </div>
        ) : (
          <div className="user-list">
            {trainerRequests.map((req) => (
              <div key={req.id} className="user-row" style={{ alignItems: "flex-start", gap: 10 }}>
                <div className="user-avatar">{(req.user?.name || req.user?.email || "?")[0].toUpperCase()}</div>
                <div className="user-info" style={{ flex: 1 }}>
                  <strong>{req.user?.name || "—"}</strong>
                  <small>{req.user?.email}</small>
                  <small style={{ color: "var(--muted)" }}>Solicitado: {new Date(req.created_at).toLocaleDateString("es-AR")}</small>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="primary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => handleApproveTrainer(req.user_id)}>
                    Aprobar
                  </button>
                  <button className="ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => handleRejectTrainer(req.id)}>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : displayList.length === 0 ? (
        <div className="empty-state">
          <Icon name="Users" size={40} />
          <p>No hay {tab === "trainers" ? "entrenadores" : "clientes"} todavía.</p>
        </div>
      ) : (
        <div className="user-list">
          {displayList.map((u) => (
            <div key={u.id} className="user-row">
              <div className="user-avatar">{(u.name || u.email || "?")[0].toUpperCase()}</div>
              <div className="user-info">
                <strong>{u.name || "—"}</strong>
                <small>{u.email}</small>
                {tab === "clients" && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>
                    {u.trainer && <span className="tag-trainer">🏋 {u.trainer.name}</span>}
                    {u.weight_kg && <span className="tag-trainer" style={{ color: "var(--muted)", background: "rgba(255,255,255,.05)" }}>{u.weight_kg}kg · {u.height_cm}cm · {u.age}a</span>}
                    {u.shoulder_alert && <span className="tag-trainer" style={{ color: "var(--yellow)", background: "rgba(232,247,119,.1)" }}>⚠ hombro</span>}
                  </div>
                )}
              </div>
              <button className="ghost icon-btn danger-hover" onClick={() => { setDeleteError(""); setDeleteUserTarget({ id: u.id, email: u.name || u.email }); }}>
                <Icon name="Trash2" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteUserTarget && (
        <div className="modal-overlay" onClick={() => setDeleteUserTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Eliminar usuario</h2>
              <button className="ghost icon-btn" onClick={() => setDeleteUserTarget(null)}>
                <Icon name="X" size={20} />
              </button>
            </div>
            <p style={{ marginBottom: 16 }}>
              ¿Eliminar a <strong>{deleteUserTarget.email}</strong>? Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <div className="login-error" style={{ marginBottom: 12 }}>
                <Icon name="AlertCircle" size={14} /><span>{deleteError}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="ghost" onClick={() => setDeleteUserTarget(null)}>Cancelar</button>
              <button className="danger" onClick={() => handleDeleteUser(deleteUserTarget.id)}>
                <Icon name="Trash2" size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
