import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import useAuthStore from "../store/useAuthStore.js";
import { EXERCISE_DATABASE } from "../data/exerciseDatabase.js";
import Icon from "../components/Icon.jsx";
import AssignRoutineModal from "../components/AssignRoutineModal.jsx";

export default function TrainerPage() {
  const profile = useAuthStore((s) => s.profile);
  const isAdmin = profile?.role === "superadmin";

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientRoutines, setClientRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [deleteRoutineTarget, setDeleteRoutineTarget] = useState(null);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [routineName, setRoutineName] = useState("");
  const [routineDayIndex, setRoutineDayIndex] = useState("");
  const [routineNotes, setRoutineNotes] = useState("");
  const [routineGroupName, setRoutineGroupName] = useState("");
  const [exercises, setExercises] = useState([]);

  const catalogNames = EXERCISE_DATABASE.map((e) => e.name);

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    if (!profile?.id) { setLoading(false); return; }
    setLoading(true);
    const query = isAdmin
      ? supabase.from("profiles").select("*").eq("role", "user")
      : supabase.from("profiles").select("*").eq("role", "user").eq("trainer_id", profile.id);
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
      .order("day_index", { ascending: true, nullsFirst: false });
    setClientRoutines(data || []);
  }

  function openNewRoutine() {
    const nextDay = clientRoutines.length + 1;
    setEditingRoutine("new");
    setRoutineName("");
    setRoutineDayIndex(String(nextDay));
    setRoutineNotes("");
    setExercises([{ name: "", sets: 3, reps: "8-12", notes: "" }]);
  }

  function openEditRoutine(routine) {
    setEditingRoutine(routine.id);
    setRoutineName(routine.name);
    setRoutineDayIndex(routine.day_index != null ? String(routine.day_index) : "");
    setRoutineNotes(routine.notes || "");
    const grp = (routine.notes || "").match(/^\[GRUPO: (.+?)\]/);
    setRoutineGroupName(grp ? grp[1] : "");
    setExercises(routine.exercises || []);
  }

  async function saveRoutine() {
    if (!routineName.trim() || exercises.length === 0) return;
    setSaving(true);
    setSaveMsg("");
    const cleanExercises = exercises.filter((e) => e.name.trim());
    const isGroup = routineGroupName.trim().length > 0;
    const finalNotes = isGroup
      ? `[GRUPO: ${routineGroupName.trim()}] ${routineNotes.trim()}`
      : routineNotes.trim() || null;
    const payload = {
      user_id: isGroup ? profile.id : selectedClient.id,
      trainer_id: profile.id,
      name: routineName.trim(),
      exercises: cleanExercises,
      notes: finalNotes,
      day_index: routineDayIndex !== "" ? parseInt(routineDayIndex, 10) : null,
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

  async function confirmDeleteRoutine() {
    if (!deleteRoutineTarget) return;
    const { error } = await supabase.from("routines").delete().eq("id", deleteRoutineTarget.id);
    if (error) {
      setSaveMsg("Error al eliminar: " + error.message);
    } else {
      setSaveMsg("");
      await selectClient(selectedClient);
    }
    setDeleteRoutineTarget(null);
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

  function moveExercise(fromIdx, toIdx) {
    if (toIdx < 0 || toIdx >= exercises.length) return;
    const exs = [...exercises];
    const [moved] = exs.splice(fromIdx, 1);
    exs.splice(toIdx, 0, moved);
    setExercises(exs);
  }

  const trDragIdx = useRef(null);
  const trDragOverIdx = useRef(null);
  const trDragStartY = useRef(0);
  const trItemHeights = useRef([]);
  const trListRef = useRef(null);
  const [trDragActive, setTrDragActive] = useState(false);
  const [trDragPos, setTrDragPos] = useState(null);

  function onTrHandleTouchStart(e, idx) {
    e.stopPropagation();
    trDragIdx.current = idx;
    trDragOverIdx.current = idx;
    trDragStartY.current = e.touches[0].clientY;
    if (trListRef.current) {
      const items = trListRef.current.querySelectorAll("[data-ex-item]");
      trItemHeights.current = Array.from(items).map(el => el.getBoundingClientRect().height + 8);
    }
    setTrDragActive(true);
    setTrDragPos({ idx, y: 0 });
    navigator.vibrate?.(30);
  }

  function onTrHandleTouchMove(e) {
    if (trDragIdx.current === null) return;
    e.preventDefault();
    const dy = e.touches[0].clientY - trDragStartY.current;
    setTrDragPos({ idx: trDragIdx.current, y: dy });
    let accumulated = 0, newOver = trDragIdx.current;
    const heights = trItemHeights.current;
    for (let i = 0; i < heights.length; i++) {
      const mid = accumulated + heights[i] / 2;
      if (trDragStartY.current + dy - (trListRef.current?.getBoundingClientRect().top || 0) < mid) { newOver = i; break; }
      accumulated += heights[i];
      newOver = i + 1;
    }
    newOver = Math.max(0, Math.min(heights.length - 1, newOver));
    if (newOver !== trDragOverIdx.current) { trDragOverIdx.current = newOver; setTrDragPos(p => ({ ...p })); }
  }

  function onTrHandleTouchEnd() {
    if (trDragIdx.current !== null && trDragOverIdx.current !== null && trDragIdx.current !== trDragOverIdx.current) {
      moveExercise(trDragIdx.current, trDragOverIdx.current);
    }
    trDragIdx.current = null; trDragOverIdx.current = null;
    setTrDragActive(false); setTrDragPos(null);
  }

  if (!["trainer", "admin", "superadmin"].includes(profile?.role)) return null;

  return (<>
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

              <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                <div className="field-group" style={{ flex:3 }}>
                  <label>Nombre de la rutina</label>
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    placeholder="Ej: Día 1 · Pecho y Hombros"
                  />
                </div>
                <div className="field-group" style={{ flex:1 }}>
                  <label>Día #</label>
                  <input
                    type="number"
                    min={1}
                    value={routineDayIndex}
                    onChange={(e) => setRoutineDayIndex(e.target.value)}
                    placeholder="1"
                    style={{ textAlign:"center" }}
                  />
                </div>
              </div>

              <div className="field-group" style={{ marginBottom:12 }}>
                <label>Notas para el cliente (opcional)</label>
                <textarea
                  value={routineNotes}
                  onChange={(e) => setRoutineNotes(e.target.value)}
                  placeholder="Indicaciones generales, objetivo de la sesión, etc."
                  rows={2}
                  style={{ width:"100%", background:"#0b1518", border:"1px solid #1b2d31", borderRadius:12, padding:"10px 12px", color:"var(--text)", fontSize:13, resize:"vertical" }}
                />
              </div>

              <div className="field-group" style={{ marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
                <input type="checkbox" id="grupChk" checked={routineGroupName.trim().length > 0}
                  onChange={(e) => setRoutineGroupName(e.target.checked ? "Grupo" : "")}
                  style={{ width:18, height:18 }} />
                <label htmlFor="grupChk" style={{ margin:0 }}>Rutina grupal (todos mis clientes)</label>
                {routineGroupName.trim().length > 0 && (
                  <input type="text" value={routineGroupName}
                    onChange={(e) => setRoutineGroupName(e.target.value)}
                    placeholder="Nombre del grupo"
                    style={{ flex:1, background:"#0b1518", border:"1px solid #1b2d31", borderRadius:8, padding:"6px 10px", color:"var(--text)", fontSize:12 }} />
                )}
              </div>

              <p className="section-label" style={{ marginBottom:8 }}>Ejercicios</p>
              <div
                className="exercise-list-editor"
                ref={trListRef}
                onTouchMove={trDragActive ? onTrHandleTouchMove : undefined}
                onTouchEnd={trDragActive ? onTrHandleTouchEnd : undefined}
                style={{ touchAction: trDragActive ? "none" : "auto" }}
              >
                {exercises.map((ex, i) => {
                  const isDragging = trDragActive && trDragPos?.idx === i;
                  const isPlaceholder = trDragActive && trDragOverIdx.current === i && trDragIdx.current !== i;
                  return (
                  <div
                    key={i}
                    data-ex-item
                    className="ex-row"
                    style={{
                      border: isPlaceholder ? "2px dashed var(--green)" : "2px solid transparent",
                      transform: isDragging ? `translateY(${trDragPos.y}px)` : "none",
                      zIndex: isDragging ? 10 : 1,
                      position: "relative",
                      boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,.4)" : "none",
                      transition: isDragging ? "none" : "transform .15s",
                      background: isDragging ? "var(--panel)" : undefined,
                    }}
                  >
                    <div className="ex-row-top">
                      {/* Drag handle */}
                      <div
                        onTouchStart={e => onTrHandleTouchStart(e, i)}
                        style={{ cursor:"grab", padding:"4px 8px 4px 0", touchAction:"none", userSelect:"none", display:"flex", flexDirection:"column", gap:3, flexShrink:0 }}
                      >
                        {[0,1,2].map(r => (
                          <div key={r} style={{ display:"flex", gap:3 }}>
                            <div style={{ width:3, height:3, borderRadius:"50%", background:"var(--muted)" }} />
                            <div style={{ width:3, height:3, borderRadius:"50%", background:"var(--muted)" }} />
                          </div>
                        ))}
                      </div>
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
                      <button className="ghost icon-btn" onClick={() => removeExercise(i)}>✕</button>
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
                        <input type="text" value={ex.notes || ""} onChange={(e) => updateExercise(i, "notes", e.target.value)} placeholder="Técnica, peso, etc." />
                      </div>
                    </div>
                  </div>
                  );
                })}
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
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button className="primary" style={{ flex: 1 }} onClick={openNewRoutine}>
                  <Icon name="Plus" size={14} /> Nueva rutina
                </button>
                <button className="ghost" style={{ flex: 1, color: "var(--accent)", borderColor: "var(--accent)" }} onClick={() => setShowAssign(true)}>
                  <Icon name="Share2" size={14} /> Asignar plantilla
                </button>
              </div>

              {clientRoutines.length === 0 ? (
                <div className="empty-state">
                  <Icon name="Dumbbell" size={36} />
                  <p>Este cliente aún no tiene rutinas. Creá su primera.</p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize:12, color:"var(--muted)", marginBottom:10 }}>
                    Las rutinas se muestran al cliente en orden de Día #. La app detecta automáticamente cuál le toca hoy.
                  </p>
                  <div className="routine-list">
                    {clientRoutines.map((r) => (
                      <div key={r.id} className="routine-item card">
                        <div className="routine-item-header">
                          <div style={{ flex:1, minWidth:0 }}>
                            {r.day_index != null && (
                              <span className="day-badge">Día {r.day_index}</span>
                            )}
                            {(r.notes || "").startsWith("[GRUPO:") && (() => {
                              const g = (r.notes || "").match(/^\[GRUPO: (.+?)\]/);
                              return g ? <span className="day-badge" style={{ background:"rgba(168,85,247,.15)", color:"var(--green)", marginLeft:4 }}>👥 {g[1]}</span> : null;
                            })()}
                            <strong style={{ display:"block" }}>{r.name}</strong>
                            <small>{r.exercises?.length || 0} ejercicios</small>
                            {r.notes && <small style={{ color:"var(--muted)", display:"block", marginTop:2 }}>{r.notes.replace(/^\[GRUPO:.+?\]\s*/,"")}</small>}
                          </div>
                          <div className="routine-item-actions">
                            <button className="ghost icon-btn" onClick={() => openEditRoutine(r)}>
                              <Icon name="Edit2" size={16} />
                            </button>
                            <button className="ghost icon-btn" onClick={() => setDeleteRoutineTarget({ id: r.id })}><Icon name="Trash2" size={16} /></button>
                          </div>
                        </div>
                        <div className="routine-exercises-preview">
                          {(r.exercises || []).slice(0, 6).map((ex, i) => (
                            <span key={i} className="ex-chip">{ex.name}</span>
                          ))}
                          {(r.exercises || []).length > 6 && (
                            <span className="ex-chip muted">+{r.exercises.length - 6} más</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
    )}
  </section>
  {showAssign && selectedClient && (
    <AssignRoutineModal
      targetUser={selectedClient}
      onClose={() => setShowAssign(false)}
      onDone={() => selectClient(selectedClient)}
    />
  )}

  {deleteRoutineTarget && (
    <div className="modal-overlay" onClick={() => setDeleteRoutineTarget(null)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Icon name="Trash2" size={20} style={{ color: "var(--danger, #e05)" }} />
          <h3>Eliminar rutina</h3>
        </div>
        <p>¿Estás seguro de que querés eliminar esta rutina? Esta acción no se puede deshacer.</p>
        <div className="modal-actions">
          <button className="ghost" onClick={() => setDeleteRoutineTarget(null)}>Cancelar</button>
          <button className="danger" onClick={confirmDeleteRoutine}>Eliminar</button>
        </div>
      </div>
    </div>
  )}
</>);
}