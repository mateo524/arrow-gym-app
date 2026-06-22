import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import Icon from "../components/Icon.jsx";
import ExercisePicker from "../components/ExercisePicker.jsx";

const EMPTY_ROUTINE = { name: "", exercises: [] };

export default function RoutinesPage() {
  const setPage = useStore(s => s.setPage);
  const { profile } = useAuthStore();
  const role = profile?.role;

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null); // routine being edited
  const [form, setForm] = useState(EMPTY_ROUTINE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showExPicker, setShowExPicker] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null); // {id, name}

  const isTrainerOrAdmin = ["trainer", "admin", "superadmin"].includes(role);

  useEffect(() => { if (profile?.id) { loadRoutines(); loadNotifications(); } }, [profile?.id]);

  async function loadRoutines() {
    setLoading(true);
    const { data } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", profile?.id)
      .order("created_at", { ascending: false });
    setRoutines(data || []);
    setLoading(false);
  }

  async function loadNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile?.id)
      .eq("read", false)
      .order("created_at", { ascending: false });
    setNotifications(data || []);
  }

  async function saveRoutine(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      exercises: form.exercises,
      is_template: role === "trainer" || role === "admin" || role === "superadmin",
      user_id: profile?.id,
      trainer_id: (role === "trainer" || role === "admin" || role === "superadmin") ? profile?.id : null,
    };

    let err;
    if (editing) {
      ({ error: err } = await supabase.from("routines").update(payload).eq("id", editing.id));
    } else {
      ({ error: err } = await supabase.from("routines").insert(payload));
    }

    if (err) { setError(err.message); setSaving(false); return; }

    setSaving(false);
    setShowCreate(false);
    setEditing(null);
    setForm(EMPTY_ROUTINE);
    loadRoutines();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.user_id !== profile?.id) {
      setError("No tenés permisos para eliminar esta rutina.");
      setDeleteTarget(null);
      return;
    }
    const { error } = await supabase
      .from("routines")
      .delete()
      .eq("id", deleteTarget.id)
      .eq("user_id", profile.id);
    if (error) { setError(error.message); setDeleteTarget(null); return; }
    setDeleteTarget(null);
    loadRoutines();
  }

  function openEdit(r) {
    setEditing(r);
    setForm({ name: r.name, exercises: r.exercises || [] });
    setShowCreate(true);
  }

  function addExercise(ex) {
    setForm(f => ({
      ...f,
      exercises: [...f.exercises, { exerciseId: ex.id, name: ex.name, sets: [{ reps: "", weight: "" }] }],
    }));
    setShowExPicker(false);
  }

  function removeExercise(idx) {
    setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }));
  }

  function moveExercise(fromIdx, toIdx) {
    setForm(f => {
      if (toIdx < 0 || toIdx >= f.exercises.length) return f;
      const exs = [...f.exercises];
      const [moved] = exs.splice(fromIdx, 1);
      exs.splice(toIdx, 0, moved);
      return { ...f, exercises: exs };
    });
  }

  // Drag state
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);
  const dragStartY = useRef(0);
  const itemHeights = useRef([]);
  const listRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragPos, setDragPos] = useState(null); // {idx, y}

  function onHandleTouchStart(e, idx) {
    e.stopPropagation();
    dragIdx.current = idx;
    dragOverIdx.current = idx;
    dragStartY.current = e.touches[0].clientY;
    // Snapshot item heights for position calculation
    if (listRef.current) {
      const items = listRef.current.querySelectorAll("[data-ex-item]");
      itemHeights.current = Array.from(items).map(el => el.getBoundingClientRect().height + 8); // +gap
    }
    setDragActive(true);
    setDragPos({ idx, y: 0 });
    navigator.vibrate?.(30);
  }

  function onHandleTouchMove(e) {
    if (dragIdx.current === null) return;
    e.preventDefault();
    const dy = e.touches[0].clientY - dragStartY.current;
    setDragPos({ idx: dragIdx.current, y: dy });
    // Determine which slot the item is hovering over
    let accumulated = 0;
    let newOver = dragIdx.current;
    const heights = itemHeights.current;
    for (let i = 0; i < heights.length; i++) {
      const mid = accumulated + heights[i] / 2;
      if (dragStartY.current + dy - (listRef.current?.getBoundingClientRect().top || 0) < mid) {
        newOver = i;
        break;
      }
      accumulated += heights[i];
      newOver = i + 1;
    }
    newOver = Math.max(0, Math.min(heights.length - 1, newOver));
    if (newOver !== dragOverIdx.current) {
      dragOverIdx.current = newOver;
      setDragPos(p => ({ ...p })); // trigger re-render to show placeholder
    }
  }

  function onHandleTouchEnd() {
    if (dragIdx.current !== null && dragOverIdx.current !== null && dragIdx.current !== dragOverIdx.current) {
      moveExercise(dragIdx.current, dragOverIdx.current);
    }
    dragIdx.current = null;
    dragOverIdx.current = null;
    setDragActive(false);
    setDragPos(null);
  }

  function addSet(exIdx) {
    setForm(f => {
      const exs = [...f.exercises];
      exs[exIdx] = { ...exs[exIdx], sets: [...exs[exIdx].sets, { reps: "", weight: "" }] };
      return { ...f, exercises: exs };
    });
  }

  function updateSet(exIdx, setIdx, field, val) {
    setForm(f => {
      const exs = [...f.exercises];
      const sets = [...exs[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: val };
      exs[exIdx] = { ...exs[exIdx], sets };
      return { ...f, exercises: exs };
    });
  }

  async function respondNotification(notif, accept) {
    const assignmentId = notif.data?.assignment_id;
    if (!assignmentId) return;

    await supabase.from("routine_assignments")
      .update({ status: accept ? "accepted" : "declined", updated_at: new Date().toISOString() })
      .eq("id", assignmentId);

    // Mark notification as read
    await supabase.from("notifications").update({ read: true }).eq("id", notif.id);

    if (!accept) {
      // Notify trainer of decline
      const trainerId = notif.data?.assigned_by;
      if (trainerId) {
        await supabase.from("notifications").insert({
          user_id: trainerId,
          type: "routine_declined",
          title: "Rutina rechazada",
          body: `${profile?.name || "El usuario"} rechazó la rutina "${notif.data?.routine_name || ""}"`,
          data: { routine_id: notif.data?.routine_id, user_id: profile?.id },
        });
      }
    }

    loadNotifications();
    if (accept) loadRoutines();
  }

  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("home")}><Icon name="ArrowLeft" size={20} strokeWidth={2.5} /></button>
        <div className="page-head-titles">
          <p className="eyebrow">Entrenamiento</p>
          <h1>Mis Rutinas</h1>
        </div>
      </div>

      {/* Pending notifications */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.3)",
              borderRadius: 14, padding: "14px 16px", marginBottom: 10,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>{n.body}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="primary" style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
                  onClick={() => respondNotification(n, true)}>✓ Aceptar</button>
                <button className="ghost" style={{ flex: 1, padding: "8px 0", fontSize: 13, color: "var(--danger)", borderColor: "var(--danger)" }}
                  onClick={() => respondNotification(n, false)}>✕ Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="primary" style={{ width: "100%", marginBottom: 16 }}
        onClick={() => { setShowCreate(true); setEditing(null); setForm(EMPTY_ROUTINE); setError(""); }}>
        <Icon name="Plus" size={16} /> {isTrainerOrAdmin ? "Crear rutina plantilla" : "Crear rutina"}
      </button>

      {loading ? (
        <div className="loading-state"><Icon name="Loader" size={24} className="spin" /></div>
      ) : routines.length === 0 ? (
        <div className="empty-state">
          <Icon name="Dumbbell" size={40} style={{ opacity: 0.3 }} />
          <p>No tenés rutinas guardadas aún</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {routines.map(r => (
            <div key={r.id} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    {(r.exercises || []).length} ejercicio{r.exercises?.length !== 1 ? "s" : ""}
                    {r.is_template && <span style={{ marginLeft: 8, color: "var(--accent)", fontWeight: 600 }}>· Plantilla</span>}
                  </div>
                </div>
                <button className="ghost icon-btn" onClick={() => openEdit(r)}><Icon name="Edit2" size={16} /></button>
                <button className="ghost icon-btn" style={{ color: "var(--danger)" }} onClick={() => setDeleteTarget({ id: r.id, name: r.name })}><Icon name="Trash2" size={16} /></button>
              </div>
              {(r.exercises || []).length > 0 && (
                <div style={{ marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                  {r.exercises.slice(0, 5).map((ex, i) => (
                    <div key={i} style={{ fontSize: 13, color: "var(--muted)" }}>
                      · {ex.name} <span style={{ color: "var(--text)", fontWeight: 600 }}>{ex.sets?.length} series</span>
                    </div>
                  ))}
                  {r.exercises.length > 5 && <div style={{ fontSize: 12, color: "var(--muted)" }}>+{r.exercises.length - 5} más</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-card" style={{ maxHeight: "85vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "Editar rutina" : "Nueva rutina"}</h2>
              <button className="ghost icon-btn" onClick={() => setShowCreate(false)}><Icon name="X" size={20} /></button>
            </div>

            <form onSubmit={saveRoutine} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field-group">
                <label>Nombre de la rutina</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="ej: Push A — Pecho/Hombros" required />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700 }}>Ejercicios ({form.exercises.length})</label>
                  <button type="button" className="ghost" style={{ fontSize: 12, padding: "5px 10px" }}
                    onClick={() => setShowExPicker(true)}>
                    <Icon name="Plus" size={13} /> Agregar
                  </button>
                </div>

                {form.exercises.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontSize: 13 }}>
                    Agregá ejercicios con el botón de arriba
                  </div>
                )}

                <div
                  ref={listRef}
                  onTouchMove={dragActive ? onHandleTouchMove : undefined}
                  onTouchEnd={dragActive ? onHandleTouchEnd : undefined}
                  style={{ touchAction: dragActive ? "none" : "auto" }}
                >
                {form.exercises.map((ex, exIdx) => {
                  const isDragging = dragActive && dragPos?.idx === exIdx;
                  const isPlaceholder = dragActive && dragOverIdx.current === exIdx && dragIdx.current !== exIdx;
                  return (
                  <div
                    key={exIdx}
                    data-ex-item
                    style={{
                      background: isDragging ? "var(--panel)" : "var(--panel2)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      marginBottom: 8,
                      border: isPlaceholder ? "2px dashed var(--green)" : "2px solid transparent",
                      transform: isDragging ? `translateY(${dragPos.y}px)` : "none",
                      zIndex: isDragging ? 10 : 1,
                      position: "relative",
                      boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,.4)" : "none",
                      transition: isDragging ? "none" : "transform .15s, box-shadow .15s",
                      opacity: isDragging ? 0.95 : 1,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      {/* Drag handle */}
                      <div
                        onTouchStart={e => onHandleTouchStart(e, exIdx)}
                        style={{
                          cursor: "grab", padding: "4px 10px 4px 0", color: "var(--muted)",
                          touchAction: "none", userSelect: "none", flexShrink: 0,
                          display: "flex", flexDirection: "column", gap: 3,
                        }}
                      >
                        {[0,1,2].map(i => (
                          <div key={i} style={{ display: "flex", gap: 3 }}>
                            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--muted)" }} />
                            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--muted)" }} />
                          </div>
                        ))}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, flex: 1, marginRight: 8 }}>{ex.name}</span>
                      <button type="button" className="ghost icon-btn" style={{ color: "var(--danger)", padding: "4px 6px" }}
                        onClick={() => removeExercise(exIdx)}><Icon name="X" size={14} /></button>
                    </div>
                    {ex.sets.map((s, sIdx) => (
                      <div key={sIdx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6 }}>
                        <input type="number" placeholder="Reps" value={s.reps}
                          onChange={e => updateSet(exIdx, sIdx, "reps", e.target.value)}
                          style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 10px", color: "var(--text)", fontSize: 13 }} />
                        <input type="number" placeholder="Peso (kg)" value={s.weight}
                          onChange={e => updateSet(exIdx, sIdx, "weight", e.target.value)}
                          style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 10px", color: "var(--text)", fontSize: 13 }} />
                      </div>
                    ))}
                    <button type="button" className="ghost" style={{ fontSize: 12, padding: "4px 10px", marginTop: 2 }}
                      onClick={() => addSet(exIdx)}>+ Serie</button>
                  </div>
                  );
                })}
                </div>
              </div>

              {error && <div className="login-error"><Icon name="AlertCircle" size={14} /><span>{error}</span></div>}

              <button type="submit" className="primary" style={{ width: "100%" }} disabled={saving}>
                {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear rutina"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showExPicker && (
        <ExercisePicker onSelect={addExercise} onClose={() => setShowExPicker(false)} />
      )}

      {/* Custom delete confirmation modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-card confirm-modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Icon name="Trash2" size={24} style={{ color: "var(--danger)" }} />
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Eliminar rutina</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
                ¿Eliminar <strong style={{ color: "var(--text)" }}>"{deleteTarget.name}"</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="primary" style={{ flex: 1, background: "var(--danger)", borderColor: "var(--danger)" }} onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
