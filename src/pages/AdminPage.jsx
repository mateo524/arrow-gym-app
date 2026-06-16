import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import Icon from "../components/Icon.jsx";

const EMPTY_FORM = { name: "", email: "", password: "", trainer_id: "", weight_kg: "", height_cm: "", age: "", shoulder_alert: false };

export default function AdminPage() {
  const [tab, setTab] = useState("clients");
  const [trainers, setTrainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [createRole, setCreateRole] = useState("user");
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "trainer").order("name"),
      supabase.from("profiles").select("*, trainer:trainer_id(name)").eq("role", "user").order("name"),
    ]);
    setTrainers(t || []);
    setClients(c || []);
    setLoading(false);
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    // Body stats are mandatory for regular users
    if (createRole === "user") {
      if (!form.weight_kg || !form.height_cm || !form.age) {
        setCreateError("El peso, altura y edad son obligatorios para crear un cliente.");
        return;
      }
    }
    setCreating(true);
    setCreateError("");
    setCreateSuccess("");

    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, role: createRole } },
    });

    if (signupError) {
      setCreateError(signupError.message);
      setCreating(false);
      return;
    }

    const userId = authData.user?.id;
    if (userId) {
      const profileData = {
        id: userId,
        name: form.name,
        email: form.email,
        role: createRole,
        trainer_id: createRole === "user" && form.trainer_id ? form.trainer_id : null,
        weight_kg: createRole === "user" ? (Number(form.weight_kg) || null) : null,
        height_cm: createRole === "user" ? (Number(form.height_cm) || null) : null,
        age: createRole === "user" ? (Number(form.age) || null) : null,
        shoulder_alert: createRole === "user" ? !!form.shoulder_alert : false,
      };
      const { error: profileError } = await supabase.from("profiles").upsert(profileData);
      if (profileError) {
        setCreateError(profileError.message);
        setCreating(false);
        return;
      }
    }

    setCreateSuccess(`✓ ${createRole === "trainer" ? "Entrenador" : "Cliente"} creado: ${form.email}`);
    setForm(EMPTY_FORM);
    setCreating(false);
    await loadData();
  }

  async function handleDeleteUser(userId, userName) {
    if (!confirm(`¿Eliminar a ${userName}? Esta acción no se puede deshacer.`)) return;
    await supabase.from("profiles").delete().eq("id", userId);
    await loadData();
  }

  const displayList = tab === "trainers" ? trainers : clients;

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
      </div>

      <button className="primary" style={{ width: "100%", marginBottom: 16 }} onClick={() => {
        setShowCreate(true);
        setCreateRole(tab === "trainers" ? "trainer" : "user");
        setCreateError("");
        setCreateSuccess("");
        setForm(EMPTY_FORM);
      }}>
        <Icon name="Plus" size={16} /> Crear {tab === "trainers" ? "entrenador" : "cliente"}
      </button>

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
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@email.com" required />
              </div>
              <div className="field-group">
                <label>Contraseña temporal</label>
                <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" required minLength={6} />
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
                    <span>Datos corporales <span className="required-badge">Obligatorio para el Coach</span></span>
                  </div>
                  <div className="field-row-3">
                    <div className="field-group">
                      <label>Peso (kg)</label>
                      <input type="number" min={30} max={200} step={0.5} value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} placeholder="75" required={createRole === "user"} inputMode="decimal" />
                    </div>
                    <div className="field-group">
                      <label>Altura (cm)</label>
                      <input type="number" min={100} max={220} value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} placeholder="175" required={createRole === "user"} inputMode="numeric" />
                    </div>
                    <div className="field-group">
                      <label>Edad</label>
                      <input type="number" min={10} max={100} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="28" required={createRole === "user"} inputMode="numeric" />
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
              <button className="ghost icon-btn danger-hover" onClick={() => handleDeleteUser(u.id, u.name || u.email)}>
                <Icon name="Trash2" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
