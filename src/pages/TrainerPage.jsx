import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import useAuthStore from "../store/useAuthStore.js";
import { EXERCISE_DATABASE } from "../data/exerciseDatabase.js";
import Icon from "../components/Icon.jsx";

const BODY_GROUPS = ["Hombros", "Pecho", "Espalda", "Brazos", "Piernas", "Core"];

export default function TrainerPage() {
  const profile = useAuthStore((s) => s.profile);
  const isAdmin = profile?.role === "superadmin";

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientRoutines, setClientRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Routine editor state
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [routineName, setRoutineName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [exSearch, setExSearch] = useState("");

  const catalogNames = EXERCISE_DATABASE.map((e) => e.name);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    const query = supabase.from("profiles").select("*").eq("role", "user");
    if (!isAdmin) query.eq("trainer_id", profile.id);
    const { data } = await query.order("name");
    setClients(data || []);
    setLoading(false);
  }

  async function selectClient(client) {
    setSelectedClient(client);
    setEditingRoutine(null);
    const { data } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", client.id)
      .order("created_at", { ascending: false });
    setClientRoutines(data || []);
  }

  function openNewRoutine() {
    setEditingRoutine("new");
    setRoutineName("");
    setExercises([{ name: "", sets: 3, reps: "8-12", notes: "" }]);
  }

  function openEditRoutine(routine) {
    setEditingRoutine(routine.id);
    setRoutineName(routine.name);
    setExercises(routine.exercises || []);
  }

  async function saveRoutine() {
    if (!routineName.trim() || exercises.length === 0) return;
    setSaving(true);
    setSaveMsg("");
    const cleanExercises = exercises.filter((e) => e.name.trim());
    const payload = {
      user_id: selectedClient.id,
      trainer_id: profile.id,
      name: routineName.trim(),
      exercises: cleanExercises,
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

  async function deleteRoutine(routineId) {
    if (!confirm("¿Eliminar esta rutina?")) return;
    await supabase.from("routines").delete().eq("id", routineId);
    await selectClient(selectedClient);
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

  const filteredCatalog = exSearch.length >= 2
    ? catalogNames.filter((n) => n.toLowerCase().includes(exSearch.toLowerCase())).slice(0, 30)
    : [];

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">{isAdmin ? "Admin" : "Entrenador"}</p>
        <h1>Mis clientes</h1>
      </div>

      {!selectedClient ? (
        <>
          {loading ? (
            <div className="loading-state"><Icon name="Loader" size={24} className="spin" /><p>Cargando…</p></div>
          ) : clients.length === 0 ? (
            <div className="empty-state">
              <Icon name="Users" size={40} />
              <p>No tenés clientes asignados aún.{isAdmin ? " Creá uno desde el panel Admin." : " Pedile al admin que te asigne clientes."}</p>
            </div>
          ) : (
            <div className="user-list">
              {clients.map((c) => (
                <button key={c.id} className="user-row as-button" onClick={() => selectClient(c)}>
                  <div className="user-avatar">{(c.name || c.email || "?")[0].toUpperCase()}</div>
                  <div className="user-info">
                    <strong>{c.name || "—"}</strong>
                    <small>{c.email}</small>
                  </div>
                  <Icon name="ChevronRight" size={18} />
                </button>
              ))}
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

              <div className="field-group">
                <label>Nombre de la rutina</label>
                <input
                  type="text"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="Ej: Push A · Pecho y Hombros"
                />
              </div>

              <div className="exercise-list-editor">
                {exercises.map((ex, i) => (
                  <div key={i} className="ex-row">
                    <div className="ex-row-top">
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
                      <button className="ghost icon-btn" onClick={() => removeExercise(i)}>
                        <Icon name="Trash2" size={14} />
                      </button>
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
                        <input type="text" value={ex.notes} onChange={(e) => updateExercise(i, "notes", e.target.value)} placeholder="Técnica, peso, etc." />
                      </div>
                    </div>
                  </div>
                ))}
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
              <button className="primary" style={{ width: "100%", marginBottom: 12 }} onClick={openNewRoutine}>
                <Icon name="Plus" size={16} /> Nueva rutina
              </button>

              {clientRoutines.length === 0 ? (
                <div className="empty-state">
                  <Icon name="Dumbbell" size={36} />
                  <p>Este cliente aún no tiene rutinas. Creá su primera.</p>
                </div>
              ) : (
                <div className="routine-list">
                  {clientRoutines.map((r) => (
                    <div key={r.id} className="routine-item card">
                      <div className="routine-item-header">
                        <div>
                          <strong>{r.name}</strong>
                          <small>{r.exercises?.length || 0} ejercicios</small>
                        </div>
                        <div className="routine-item-actions">
                          <button className="ghost icon-btn" onClick={() => openEditRoutine(r)}>
                            <Icon name="Pencil" size={16} />
                          </button>
                          <button className="ghost icon-btn danger-hover" onClick={() => deleteRoutine(r.id)}>
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="routine-exercises-preview">
                        {(r.exercises || []).map((ex, i) => (
                          <span key={i} className="ex-chip">{ex.name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
