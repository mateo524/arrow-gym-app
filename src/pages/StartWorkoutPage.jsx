import { useState, useEffect, useMemo } from "react";
import useStore, { ROUTINES } from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import { EXERCISE_DATABASE } from "../data/exerciseDatabase.js";
import Icon from "../components/Icon.jsx";
import ExercisePicker from "../components/ExercisePicker.jsx";

export default function StartWorkoutPage() {
  const startWorkout = useStore((s) => s.startWorkout);
  const startRoutineWorkout = useStore((s) => s.startRoutineWorkout);
  const startEmptyWorkout = useStore((s) => s.startEmptyWorkout);
  const setPage = useStore((s) => s.setPage);
  const workouts = useStore((s) => s.workouts);
  const repeatLastWorkout = useStore((s) => s.repeatLastWorkout);
  const lastWorkout = workouts[0];
  const profile = useAuthStore((s) => s.profile);

  const savedTemplates = useStore((s) => s.savedTemplates);
  const saveTemplate = useStore((s) => s.saveTemplate);
  const deleteTemplate = useStore((s) => s.deleteTemplate);
  const useTemplate = useStore((s) => s.useTemplate);

  const [editRoutine, setEditRoutine] = useState(null);
  const [editExercises, setEditExercises] = useState([]);
  const [assignedRoutines, setAssignedRoutines] = useState([]);
  const [restDayDone, setRestDayDone] = useState(false);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [saveTemplateModal, setSaveTemplateModal] = useState(null); // { name, exercises }
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState(null); // { id, name }
  const [deleteRoutineTarget, setDeleteRoutineTarget] = useState(null); // { id, name }
  const [previewRoutine, setPreviewRoutine] = useState(null); // { name, recent: [] }
  const [createRoutineModal, setCreateRoutineModal] = useState(false);
  const [creationMode, setCreationMode] = useState("choose"); // 'choose' | 'manual' | 'coach'
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineExercises, setNewRoutineExercises] = useState([]);
  const [showCreatePicker, setShowCreatePicker] = useState(false);
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [editRoutineTarget, setEditRoutineTarget] = useState(null); // { id, name, exercises }
  const [editRoutineName, setEditRoutineName] = useState("");
  const [editRoutineExercises, setEditRoutineExercises] = useState([]);
  const [showEditPicker, setShowEditPicker] = useState(false);
  const [savingEditRoutine, setSavingEditRoutine] = useState(false);
  const [coachSplit, setCoachSplit] = useState("");
  const [coachGoal, setCoachGoal] = useState("");

  function fetchRoutines() {
    if (!profile?.id) return;
    setLoadingRoutines(true);
    supabase
      .from("routines")
      .select("*")
      .eq("user_id", profile.id)
      .order("day_index", { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setAssignedRoutines(data || []);
        setLoadingRoutines(false);
      })
      .catch(() => { setLoadingRoutines(false); });
  }

  useEffect(() => {
    fetchRoutines();
  }, [profile?.id]);

  useEffect(() => {
    function onVisible() { if (document.visibilityState === "visible") fetchRoutines(); }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [profile?.id]);

  /* ── "Hoy toca" logic ──────────────────────────────────────── */
  const todayRoutine = useMemo(() => {
    if (assignedRoutines.length === 0) return null;
    const sorted = [...assignedRoutines].sort((a, b) => (a.day_index ?? 999) - (b.day_index ?? 999));
    if (sorted.length === 1) return sorted[0];
    // Find last used routine in workout history
    for (const w of workouts || []) {
      const found = sorted.findIndex((r) => r.name === w.type);
      if (found >= 0) {
        // Next in cycle
        return sorted[(found + 1) % sorted.length];
      }
    }
    // No history → start from day 1
    return sorted[0];
  }, [assignedRoutines, workouts]);

  const historyTypes = useMemo(() => {
    const types = {};
    (workouts || []).forEach((w) => {
      if (!types[w.type]) types[w.type] = { count: 0, exercises: [] };
      types[w.type].count++;
      (w.sets || []).forEach((s) => {
        if (!types[w.type].exercises.includes(s.exercise)) types[w.type].exercises.push(s.exercise);
      });
    });
    return types;
  }, [workouts]);

  const allRoutines = useMemo(() => {
    // Never show pre-loaded ROUTINES constant — only show routines from user workout history
    const merged = {};
    Object.entries(historyTypes).forEach(([type, data]) => {
      if (!merged[type] && data.count >= 1) merged[type] = data.exercises;
    });
    return merged;
  }, [historyTypes]);

  function startAssignedRoutine(routine) {
    const exercises = (routine.exercises || []).map((ex) => ex.name || ex).filter(Boolean);
    startRoutineWorkout(routine.name, exercises);
  }

  function handleStart(name) {
    if (editRoutine === name) {
      const finalExercises = editExercises.filter(Boolean);
      useStore.setState((s) => ({
        activeWorkout: {
          id: `workout-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: name,
          date: new Date().toISOString().slice(0, 10),
          sets: finalExercises.map((ex) => {
            const meta = EXERCISE_DATABASE.find((e) => e.name === ex) || {};
            return {
              id: `set-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              exercise: ex,
              weight: "", reps: "",
              group: meta.group || "Core",
              muscle: meta.muscle || "General",
              equipment: meta.equipment || "",
              lastWeight: "", lastReps: "", lastSets: 0, lastDate: null,
            };
          }),
        },
        currentPage: "workout",
      }));
      return;
    }
    startWorkout(name);
  }

  function showRoutinePreview(name) {
    const recent = (workouts || []).filter(w => w.type === name).slice(0, 3);
    setPreviewRoutine({ name, recent });
  }

  function handleSaveTemplate(name) {
    const finalExercises = editExercises.filter(Boolean);
    if (finalExercises.length === 0) return;
    setSaveTemplateName(name);
    setSaveTemplateModal({ name, exercises: finalExercises });
  }

  function confirmSaveTemplate() {
    if (!saveTemplateName.trim() || !saveTemplateModal) return;
    saveTemplate(saveTemplateName.trim(), saveTemplateModal.exercises);
    setSaveTemplateModal(null);
    setSaveTemplateName("");
    setSavedMsg("✓ Guardado");
    setTimeout(() => setSavedMsg(""), 1500);
  }

  function handleDeleteTemplate(id, name) {
    setDeleteTemplateTarget({ id, name });
  }

  async function confirmDeleteRoutine() {
    if (!deleteRoutineTarget) return;
    try {
      await supabase.from("routines").delete().eq("id", deleteRoutineTarget.id);
      setAssignedRoutines(rs => rs.filter(r => r.id !== deleteRoutineTarget.id));
    } catch {}
    setDeleteRoutineTarget(null);
  }

  async function saveNewRoutine() {
    const name = newRoutineName.trim();
    const exercises = newRoutineExercises.filter(Boolean);
    if (!name || exercises.length === 0 || !profile?.id) return;
    setSavingRoutine(true);
    try {
      const { data, error } = await supabase.from("routines").insert({
        user_id: profile.id,
        name,
        exercises: exercises.map(e => ({ name: e })),
        day_index: assignedRoutines.length,
      }).select().single();
      if (!error && data) {
        setAssignedRoutines(rs => [...rs, data]);
      }
    } catch {}
    setSavingRoutine(false);
    setCreateRoutineModal(false);
    setCreationMode("choose");
    setShowCreatePicker(false);
    setNewRoutineName("");
    setNewRoutineExercises([]);
  }

  async function saveEditedRoutine() {
    const name = editRoutineName.trim();
    const exercises = editRoutineExercises.map(e => e.trim()).filter(Boolean);
    if (!name || exercises.length === 0 || !editRoutineTarget?.id) return;
    setSavingEditRoutine(true);
    try {
      const { data, error } = await supabase.from("routines").update({
        name,
        exercises: exercises.map(e => ({ name: e })),
      }).eq("id", editRoutineTarget.id).select().single();
      if (!error && data) {
        setAssignedRoutines(rs => rs.map(r => r.id === data.id ? data : r));
      }
    } catch {}
    setSavingEditRoutine(false);
    setEditRoutineTarget(null);
  }

  const catalogNames = useMemo(() => EXERCISE_DATABASE.map((e) => e.name), []);

  const COACH_SPLITS = [
    { id:"push",     label:"Push",     desc:"Pecho, hombros y tríceps" },
    { id:"pull",     label:"Pull",     desc:"Espalda y bíceps" },
    { id:"legs",     label:"Piernas",  desc:"Cuádriceps, isquios y glúteos" },
    { id:"upper",    label:"Upper",    desc:"Todo el torso" },
    { id:"lower",    label:"Lower",    desc:"Piernas completo" },
    { id:"fullbody", label:"Full Body",desc:"Cuerpo completo en cada sesión" },
  ];
  const COACH_GOALS = [
    { id:"fuerza",        label:"💪 Fuerza",        desc:"Pocas reps, pesos altos" },
    { id:"hipertrofia",   label:"💪🏽 Hipertrofia",  desc:"Reps moderadas, volumen alto" },
    { id:"resistencia",   label:"🏃 Resistencia",   desc:"Muchas reps, peso moderado" },
  ];
  const EXERCISES_BY_SPLIT = useMemo(() => ({
    push:     ["Press de banca plano","Incline Chest Press Machine","Landmine Shoulder Press","Cable Lateral Raise","Triceps Pushdown","Chest Press Machine"],
    pull:     ["Cable Lat Pulldown","Close Grip Lat Pulldown","Dumbbell Row","High Row Machine","Cable Face Pull","Cable Biceps Curl","Hammer Curl"],
    legs:     ["Leg Extension","Leg Curl","Bulgarian Split Squat","Sentadilla","Peso muerto"],
    upper:    ["Press de banca plano","Cable Lat Pulldown","Landmine Shoulder Press","Dumbbell Row","Cable Biceps Curl","Triceps Pushdown"],
    lower:    ["Sentadilla","Peso muerto","Leg Extension","Leg Curl","Bulgarian Split Squat"],
    fullbody: ["Press de banca plano","Cable Lat Pulldown","Sentadilla","Dumbbell Row","Leg Extension","Cable Biceps Curl","Triceps Pushdown"],
  }), []);

  const weeklyMuscleVolume = useMemo(() => {
    const GROUPS = ["Piernas","Espalda","Pecho","Hombros","Brazos","Core"];
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const counts = {};
    GROUPS.forEach(g => { counts[g] = 0; });
    (workouts || []).forEach(w => {
      if (!w.date || new Date(w.date + "T12:00:00") < monday) return;
      (w.sets || []).forEach(s => {
        if (counts[s.group] !== undefined) counts[s.group]++;
      });
    });
    // Recommended weekly sets per group
    const REC = { "Piernas":12,"Espalda":14,"Pecho":12,"Hombros":10,"Brazos":10,"Core":8 };
    return GROUPS.map(g => ({
      name: g,
      sets: counts[g],
      rec: REC[g],
      pct: Math.min(100, Math.round((counts[g] / REC[g]) * 100)),
    }));
  }, [workouts]);

  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("home")} aria-label="Back">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
        <div className="page-head-titles">
          <p className="eyebrow">Loop</p>
          <h1>Empezar entrenamiento</h1>
        </div>
      </div>

      {/* ── HOY TOCA card ──────────────────────────────────── */}
      {todayRoutine && (
        <div className="today-routine-card">
          <div className="today-routine-header">
            <div>
              <p className="eyebrow" style={{ margin:"0 0 2px", color:"var(--green)" }}>
                {todayRoutine.day_index != null ? `Día ${todayRoutine.day_index} · ` : ""}Hoy toca
              </p>
              <h2 style={{ margin:0, fontSize:20 }}>{todayRoutine.name}</h2>
              <p style={{ margin:"4px 0 0", fontSize:12, color:"var(--muted)" }}>
                {todayRoutine.exercises?.length || 0} ejercicios
                {todayRoutine.notes ? ` · ${todayRoutine.notes}` : ""}
              </p>
            </div>
          </div>
          <div className="today-routine-exercises">
            {(todayRoutine.exercises || []).slice(0, 5).map((ex, i) => (
              <span key={i} className="ex-chip">{ex.name || ex}</span>
            ))}
            {(todayRoutine.exercises || []).length > 5 && (
              <span className="ex-chip muted">+{todayRoutine.exercises.length - 5} más</span>
            )}
          </div>
          <button
            className="primary big today-start-btn"
            onClick={() => startAssignedRoutine(todayRoutine)}
          >
            <Icon name="Play" size={20} /> Empezar ahora
          </button>
        </div>
      )}

      {/* ── Volumen semanal por grupo muscular ───────────────── */}
      <div style={{ marginBottom:18 }}>
        <p className="section-label" style={{ marginBottom:8 }}>Volumen esta semana</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6 }}>
          {weeklyMuscleVolume.map(({ name, sets, rec, pct }) => {
            const color = pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "rgba(168,85,247,.8)";
            return (
              <div key={name} style={{ background:"var(--panel)", borderRadius:12, padding:"8px 10px" }}>
                <p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>{name}</p>
                <p style={{ margin:"0 0 5px", fontSize:18, fontWeight:900, color, lineHeight:1 }}>
                  {sets}<span style={{ fontSize:11, fontWeight:500, color:"var(--muted)", marginLeft:2 }}>/{rec}</span>
                </p>
                <div style={{ height:3, background:"var(--panel2)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2, transition:"width .4s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved Templates */}
      {savedTemplates && savedTemplates.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p className="section-label">Mis plantillas</p>
          {savedTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="card"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", marginBottom: 4 }}>{tpl.name}</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(tpl.exercises || []).slice(0, 3).map((ex, i) => (
                    <span key={i} className="ex-chip">{ex}</span>
                  ))}
                  {(tpl.exercises || []).length > 3 && (
                    <span className="ex-chip muted">+{tpl.exercises.length - 3} más</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginLeft: 10, flexShrink: 0 }}>
                <button className="primary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => useTemplate(tpl.id)}>
                  Iniciar
                </button>
                <button
                  className="ghost"
                  style={{ padding: "6px 10px", fontSize: 14 }}
                  onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                  aria-label="Eliminar plantilla"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tus rutinas ── */}
      <div style={{ marginBottom: 20 }}>
        {/* Header row with create button */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <p className="section-label" style={{ margin:0 }}>Tus rutinas</p>
          <button
            onClick={() => setCreateRoutineModal(true)}
            style={{ background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.3)", borderRadius:10, padding:"7px 14px", cursor:"pointer", fontSize:12, fontWeight:700, color:"var(--green)", display:"flex", alignItems:"center", gap:6 }}>
            <Icon name="Plus" size={13} /> Nueva rutina
          </button>
        </div>

        {loadingRoutines ? (
          <div className="loading-state small"><Icon name="Loader" size={18} className="spin" /><span>Cargando…</span></div>
        ) : assignedRoutines.length === 0 ? (
          /* No routines yet — big create CTA */
          <button
            onClick={() => setCreateRoutineModal(true)}
            style={{ width:"100%", background:"rgba(168,85,247,.06)", border:"2px dashed rgba(168,85,247,.3)", borderRadius:20, padding:"28px 16px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <Icon name="Plus" size={28} style={{ color:"var(--green)" }} />
            <span style={{ fontSize:16, fontWeight:700, color:"var(--green)" }}>Crear tu primera rutina</span>
            <span style={{ fontSize:13, color:"var(--muted)" }}>Ingresá el nombre y los ejercicios</span>
          </button>
        ) : (
            <div className="assigned-routines">
              {assignedRoutines.map((r) => (
                <div key={r.id} style={{ borderRadius:20, overflow:"hidden", marginBottom:10, border: todayRoutine?.id === r.id ? "1px solid rgba(168,85,247,.4)" : "1px solid rgba(168,85,247,.15)", background:"linear-gradient(135deg, rgba(168,85,247,.05), rgba(117,217,255,.04))" }}>
                  {/* Main tap area → start */}
                  <button
                    onClick={() => startAssignedRoutine(r)}
                    style={{ width:"100%", background:"none", border:"none", padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      {r.day_index != null && <span className="day-badge">Día {r.day_index}</span>}
                      <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", marginBottom:2 }}>{r.name}</div>
                      <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>{r.exercises?.length || 0} ejercicios</div>
                      <div className="routine-exercises-preview">
                        {(r.exercises || []).slice(0, 4).map((ex, i) => (
                          <span key={i} className="ex-chip">{ex.name || ex}</span>
                        ))}
                        {(r.exercises || []).length > 4 && (
                          <span className="ex-chip muted">+{r.exercises.length - 4} más</span>
                        )}
                      </div>
                    </div>
                    <div style={{ background:"var(--green)", borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:6, color:"#000", fontWeight:700, fontSize:13, flexShrink:0 }}>
                      <Icon name="Play" size={13} /> Iniciar
                    </div>
                  </button>
                  {/* Action row — edit + delete */}
                  <div style={{ borderTop:"1px solid rgba(168,85,247,.1)", padding:"8px 16px", display:"flex", gap:12 }}>
                    <button
                      onClick={() => { setEditRoutineTarget(r); setEditRoutineName(r.name); setEditRoutineExercises((r.exercises||[]).map(e=>e.name||e)); }}
                      style={{ background:"none", border:"none", color:"var(--green)", fontSize:12, cursor:"pointer", padding:"2px 0", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                      <Icon name="Pencil" size={13} /> Editar
                    </button>
                    <button
                      onClick={() => setDeleteRoutineTarget({ id: r.id, name: r.name })}
                      style={{ background:"none", border:"none", color:"var(--danger)", fontSize:12, cursor:"pointer", padding:"2px 0", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                      <Icon name="Trash2" size={13} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Generic routines — only shown when user has no Supabase routines yet */}
      {Object.keys(allRoutines).length > 0 && assignedRoutines.length === 0 && <p className="section-label">Rutinas generales</p>}

      <div className="routine-grid">
        {Object.entries(allRoutines).filter(() => assignedRoutines.length === 0).map(([name, exercises]) => (
          <div key={name}>
            <button className="routine-card" onClick={() => handleStart(name)}>
              <span>START</span>
              <b>{name}</b>
              <small>{exercises.length} ejercicios</small>
            </button>
            {editRoutine === name ? (
              <div className="card" style={{ marginTop: 6 }}>
                {editExercises.map((ex, i) => (
                  <div key={i} style={{ display: "flex", gap: 4, width: "100%", marginBottom: 4 }}>
                    <input
                      list="ex-suggestions"
                      value={ex}
                      onChange={(e) => {
                        const next = [...editExercises];
                        next[i] = e.target.value;
                        setEditExercises(next);
                      }}
                      placeholder="Ejercicio..."
                      style={{ flex: 1, background: "#0b1518", border: "1px solid #1b2d31", borderRadius: 12, padding: "8px 10px", color: "var(--text)", fontSize: 13 }}
                    />
                    <button className="danger" style={{ padding: "8px 10px", borderRadius: 10 }} onClick={() => setEditExercises((p) => p.filter((_, idx) => idx !== i))}>✕</button>
                  </div>
                ))}
                <datalist id="ex-suggestions">
                  {catalogNames.map((n) => <option key={n} value={n} />)}
                </datalist>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button className="ghost" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => setEditExercises((p) => [...p, ""])}>+ Agregar</button>
                  <button className="primary" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => handleStart(name)}>Iniciar</button>
                  <button className="ghost" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => handleSaveTemplate(name)}>
                    {savedMsg || "Guardar plantilla"}
                  </button>
                  <button className="ghost" style={{ padding: "8px", fontSize: 12 }} onClick={() => setEditRoutine(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button className="ghost" style={{ width: "100%", marginTop: 4, padding: "8px", fontSize: 12 }} onClick={() => { setEditRoutine(name); setEditExercises([...exercises]); }}>
                Editar ejercicios
              </button>
            )}
          </div>
        ))}
        <button className="routine-card free" onClick={startEmptyWorkout}>
          <span>START</span>
          <b>Libre</b>
          <small>Armalo desde cero</small>
        </button>
      </div>

      <button className="ghost" style={{ width: "100%", marginTop: 8 }} onClick={startEmptyWorkout}>
        <Icon name="Plus" size={14} /> Entrenamiento libre
      </button>

      {/* Cardio */}
      <button
        className="ghost"
        style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1.5px solid rgba(251,191,36,.3)", color: "#fbbf24" }}
        onClick={() => setPage("cardio")}
      >
        <span style={{ fontSize: 18 }}>🏃</span> Registrar cardio
      </button>

      {/* Rest day */}
      {restDayDone ? (
        <div style={{ textAlign:"center", padding:"12px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          <span style={{ color:"var(--green)", fontSize:13, fontWeight:700 }}>🌙 Día de descanso registrado</span>
          <button className="ghost"
            style={{ fontSize:11, padding:"4px 12px", color:"var(--muted)", border:"1px solid var(--border)" }}
            onClick={() => { setRestDayDone(false); }}>
            Revertir — quiero entrenar igual
          </button>
        </div>
      ) : (
        <button
          className="rest-day-btn"
          onClick={() => {
            setRestDayDone(true);
            useStore.getState().logRestDay?.();
          }}
        >
          <Icon name="Moon" size={18} />
          Registrar día de descanso
        </button>
      )}

      {/* Save template modal */}
      {saveTemplateModal && (
        <div className="modal-overlay" onClick={() => setSaveTemplateModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Guardar plantilla</h2>
              <button className="ghost icon-btn" onClick={() => setSaveTemplateModal(null)}><Icon name="X" size={20} /></button>
            </div>
            <p style={{ fontSize:13, color:"var(--muted)", margin:"0 0 14px" }}>Dale un nombre a esta plantilla para usarla en el futuro.</p>
            <input
              value={saveTemplateName}
              onChange={e => setSaveTemplateName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && confirmSaveTemplate()}
              placeholder="ej: Push A — Pecho y tríceps"
              autoFocus
              style={{ width:"100%", background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"12px 14px", color:"var(--text)", fontSize:15, boxSizing:"border-box", marginBottom:14 }}
            />
            <div style={{ display:"flex", gap:10 }}>
              <button className="ghost" style={{ flex:1 }} onClick={() => setSaveTemplateModal(null)}>Cancelar</button>
              <button className="primary" style={{ flex:2 }} disabled={!saveTemplateName.trim()} onClick={confirmSaveTemplate}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete template modal */}
      {deleteTemplateTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTemplateTarget(null)}>
          <div className="modal-card confirm-modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:"center", padding:"8px 0 16px" }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(239,68,68,.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                <Icon name="Trash2" size={24} style={{ color:"var(--danger)" }} />
              </div>
              <h2 style={{ margin:"0 0 8px", fontSize:18 }}>Eliminar plantilla</h2>
              <p style={{ color:"var(--muted)", fontSize:14, margin:0 }}>
                ¿Eliminar <strong style={{ color:"var(--text)" }}>"{deleteTemplateTarget.name}"</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="ghost" style={{ flex:1 }} onClick={() => setDeleteTemplateTarget(null)}>Cancelar</button>
              <button className="primary" style={{ flex:1, background:"var(--danger)", borderColor:"var(--danger)" }}
                onClick={() => { deleteTemplate(deleteTemplateTarget.id); setDeleteTemplateTarget(null); }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteRoutineTarget && (
        <div className="modal-overlay" onClick={() => setDeleteRoutineTarget(null)}>
          <div className="modal-card confirm-modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:"center", padding:"8px 0 16px" }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(239,68,68,.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                <Icon name="Trash2" size={24} style={{ color:"var(--danger)" }} />
              </div>
              <h2 style={{ margin:"0 0 8px", fontSize:18 }}>Eliminar rutina</h2>
              <p style={{ color:"var(--muted)", fontSize:14, margin:0 }}>
                ¿Eliminar <strong style={{ color:"var(--text)" }}>"{deleteRoutineTarget.name}"</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="ghost" style={{ flex:1 }} onClick={() => setDeleteRoutineTarget(null)}>Cancelar</button>
              <button className="primary" style={{ flex:1, background:"var(--danger)", borderColor:"var(--danger)" }}
                onClick={confirmDeleteRoutine}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create routine modal */}
      {createRoutineModal && (
        <div className="modal-overlay" onClick={() => { setCreateRoutineModal(false); setCreationMode("choose"); setShowCreatePicker(false); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight:"90vh", overflowY:"auto", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h2 style={{ margin:0, fontSize:18 }}>
                {creationMode === "choose" ? "Nueva rutina" : creationMode === "coach" ? "Rutina con coach" : "Nueva rutina"}
              </h2>
              <button onClick={() => { setCreateRoutineModal(false); setCreationMode("choose"); setShowCreatePicker(false); }} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>

            {/* ── MODE PICKER ── */}
            {creationMode === "choose" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12, padding:"8px 0" }}>
                <p style={{ fontSize:13, color:"var(--muted)", margin:"0 0 4px", textAlign:"center" }}>¿Cómo querés crear la rutina?</p>
                <button onClick={() => setCreationMode("manual")} style={{ background:"var(--panel)", border:"1.5px solid var(--line)", borderRadius:16, padding:"18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
                  <span style={{ width:40, height:40, borderRadius:12, background:"rgba(168,85,247,.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>✏️</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>Hacerla vos</div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>Elegí el nombre y cada ejercicio manualmente</div>
                  </div>
                </button>
                <button onClick={() => setCreationMode("coach")} style={{ background:"var(--panel)", border:"1.5px solid var(--cyan)", borderRadius:16, padding:"18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
                  <span style={{ width:40, height:40, borderRadius:12, background:"rgba(117,217,255,.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🤖</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>Que el coach te ayude</div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>Seleccioná el tipo de rutina y el coach sugiere ejercicios</div>
                  </div>
                </button>
              </div>
            )}

            {/* ── MANUAL MODE ── */}
            {creationMode === "manual" && (
              <>
                <input
                  autoFocus
                  value={newRoutineName}
                  onChange={e => setNewRoutineName(e.target.value)}
                  placeholder="Nombre de la rutina (ej: Push A)"
                  style={{ width:"100%", background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"11px 14px", color:"var(--text)", fontSize:15, boxSizing:"border-box", marginBottom:14 }}
                />
                {newRoutineExercises.length > 0 && (
                  <div style={{ marginBottom:10 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 6px" }}>Ejercicios ({newRoutineExercises.length})</p>
                    {newRoutineExercises.map((ex, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:"var(--panel2)", borderRadius:10, marginBottom:5 }}>
                        <span style={{ flex:1, fontSize:13 }}>{ex}</span>
                        <button onClick={() => setNewRoutineExercises(p => p.filter((_, idx) => idx !== i))}
                          style={{ background:"none", border:"none", color:"var(--danger)", cursor:"pointer", fontSize:15, padding:"2px 4px" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => setShowCreatePicker(p => !p)}
                  style={{ width:"100%", background:"rgba(168,85,247,.08)", border:"1px dashed rgba(168,85,247,.4)", borderRadius:10, padding:"10px", cursor:"pointer", fontSize:13, color:"var(--green)", fontWeight:700, marginBottom:10 }}>
                  {showCreatePicker ? "✕ Cerrar buscador" : "+ Agregar ejercicio"}
                </button>
                {showCreatePicker && (
                  <div style={{ border:"1px solid var(--line)", borderRadius:12, overflowY:"auto", marginBottom:12, maxHeight:300 }}>
                    <ExercisePicker compact onPick={ex => { setNewRoutineExercises(p => [...p, ex.name]); }} />
                  </div>
                )}
                <div style={{ display:"flex", gap:10, marginTop:"auto", paddingTop:4 }}>
                  <button className="ghost" style={{ flex:1 }} onClick={() => setCreationMode("choose")}>Atrás</button>
                  <button className="primary" style={{ flex:2 }}
                    disabled={!newRoutineName.trim() || newRoutineExercises.length === 0 || savingRoutine}
                    onClick={saveNewRoutine}>
                    {savingRoutine ? "Guardando…" : "Guardar rutina"}
                  </button>
                </div>
              </>
            )}

            {/* ── COACH MODE ── */}
            {creationMode === "coach" && (
              <>
                <input
                  autoFocus
                  value={newRoutineName}
                  onChange={e => setNewRoutineName(e.target.value)}
                  placeholder="Nombre de la rutina (ej: Push A)"
                  style={{ width:"100%", background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"11px 14px", color:"var(--text)", fontSize:15, boxSizing:"border-box", marginBottom:14 }}
                />
                {/* Split picker */}
                {!coachSplit && (
                  <div style={{ marginBottom:12 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 8px" }}>Elegí el tipo de rutina</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {COACH_SPLITS.map(s => (
                        <button key={s.id} onClick={() => { setCoachSplit(s.id); setNewRoutineName(s.label); setNewRoutineExercises(EXERCISES_BY_SPLIT[s.id] || []); }}
                          style={{ background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:14, padding:"14px 12px", cursor:"pointer", textAlign:"center" }}>
                          <div style={{ fontSize:13, fontWeight:700, marginBottom:2 }}>{s.label}</div>
                          <div style={{ fontSize:11, color:"var(--muted)" }}>{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Goal picker (after split) */}
                {coachSplit && !coachGoal && (
                  <div style={{ marginBottom:12 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 8px" }}>¿Cuál es tu objetivo?</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {COACH_GOALS.map(g => (
                        <button key={g.id} onClick={() => setCoachGoal(g.id)}
                          style={{ background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:14, padding:"14px 14px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ fontSize:18 }}>{g.label.split(" ")[0]}</span>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700 }}>{g.label}</div>
                            <div style={{ fontSize:12, color:"var(--muted)" }}>{g.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Suggested exercises (after goal) */}
                {coachSplit && coachGoal && (
                  <div style={{ marginBottom:10 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 6px" }}>Ejercicios sugeridos ({newRoutineExercises.length})</p>
                    {newRoutineExercises.map((ex, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:"var(--panel2)", borderRadius:10, marginBottom:5 }}>
                        <span style={{ flex:1, fontSize:13 }}>{ex}</span>
                        <button onClick={() => setNewRoutineExercises(p => p.filter((_, idx) => idx !== i))}
                          style={{ background:"none", border:"none", color:"var(--danger)", cursor:"pointer", fontSize:15, padding:"2px 4px" }}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => setShowCreatePicker(p => !p)}
                      style={{ width:"100%", background:"rgba(168,85,247,.08)", border:"1px dashed rgba(168,85,247,.4)", borderRadius:10, padding:"8px", cursor:"pointer", fontSize:12, color:"var(--green)", fontWeight:700, marginTop:6 }}>
                      {showCreatePicker ? "✕ Cerrar buscador" : "+ Agregar/quitar ejercicio"}
                    </button>
                    {showCreatePicker && (
                      <div style={{ border:"1px solid var(--line)", borderRadius:12, overflow:"hidden", marginBottom:8, marginTop:6, maxHeight:200, overflowY:"auto" }}>
                        <ExercisePicker compact onPick={ex => { if (!newRoutineExercises.includes(ex.name)) setNewRoutineExercises(p => [...p, ex.name]); }} />
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display:"flex", gap:10, marginTop:"auto", paddingTop:4 }}>
                  <button className="ghost" style={{ flex:1 }}
                    onClick={() => { if (coachGoal) setCoachGoal(""); else if (coachSplit) { setCoachSplit(""); setCoachGoal(""); setNewRoutineName(""); setNewRoutineExercises([]); } else setCreationMode("choose"); }}>
                    Atrás
                  </button>
                  <button className="primary" style={{ flex:2 }}
                    disabled={!newRoutineName.trim() || newRoutineExercises.length === 0 || savingRoutine}
                    onClick={saveNewRoutine}>
                    {savingRoutine ? "Guardando…" : "Guardar rutina"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Edit routine modal */}
      {editRoutineTarget && (
        <div className="modal-overlay" onClick={() => { setEditRoutineTarget(null); setShowEditPicker(false); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight:"90vh", overflowY:"auto", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h2 style={{ margin:0, fontSize:18 }}>Editar rutina</h2>
              <button onClick={() => { setEditRoutineTarget(null); setShowEditPicker(false); }} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>
            <input
              autoFocus
              value={editRoutineName}
              onChange={e => setEditRoutineName(e.target.value)}
              placeholder="Nombre de la rutina"
              style={{ width:"100%", background:"var(--panel2)", border:"1.5px solid var(--border)", borderRadius:10, padding:"11px 14px", color:"var(--text)", fontSize:15, boxSizing:"border-box", marginBottom:14 }}
            />
            {editRoutineExercises.length > 0 && (
              <div style={{ marginBottom:10 }}>
                <p style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 6px" }}>Ejercicios ({editRoutineExercises.length})</p>
                {editRoutineExercises.map((ex, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:"var(--panel2)", borderRadius:10, marginBottom:5 }}>
                    <span style={{ flex:1, fontSize:13 }}>{ex}</span>
                    <button onClick={() => setEditRoutineExercises(p => p.filter((_, idx) => idx !== i))}
                      style={{ background:"none", border:"none", color:"var(--danger)", cursor:"pointer", fontSize:15, padding:"2px 4px" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowEditPicker(p => !p)}
              style={{ width:"100%", background:"rgba(168,85,247,.08)", border:"1px dashed rgba(168,85,247,.4)", borderRadius:10, padding:"10px", cursor:"pointer", fontSize:13, color:"var(--green)", fontWeight:700, marginBottom:10 }}>
              {showEditPicker ? "✕ Cerrar buscador" : "+ Agregar ejercicio"}
            </button>
            {showEditPicker && (
              <div style={{ border:"1px solid var(--line)", borderRadius:12, overflowY:"auto", marginBottom:12, maxHeight:300 }}>
                <ExercisePicker compact onPick={ex => { setEditRoutineExercises(p => [...p, ex.name]); }} />
              </div>
            )}
            <div style={{ display:"flex", gap:10, marginTop:"auto", paddingTop:4 }}>
              <button className="ghost" style={{ flex:1 }} onClick={() => { setEditRoutineTarget(null); setShowEditPicker(false); }}>Cancelar</button>
              <button className="primary" style={{ flex:2 }}
                disabled={!editRoutineName.trim() || editRoutineExercises.length === 0 || savingEditRoutine}
                onClick={saveEditedRoutine}>
                {savingEditRoutine ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

