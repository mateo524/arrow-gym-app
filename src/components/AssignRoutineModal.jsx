import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import useAuthStore from "../store/useAuthStore.js";
import Icon from "./Icon.jsx";

export default function AssignRoutineModal({ targetUser, onClose, onDone }) {
  const { profile } = useAuthStore();
  const [routines, setRoutines] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("routines")
      .select("*")
      .eq("trainer_id", profile?.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRoutines(data || []));
  }, []);

  async function assign() {
    if (!selected) return;
    setSaving(true);
    setError("");

    // Upsert assignment (if exists, update it as pending again with new note)
    const { data: existing } = await supabase.from("routine_assignments")
      .select("id")
      .eq("routine_id", selected.id)
      .eq("user_id", targetUser.id)
      .maybeSingle();

    let assignmentId;
    if (existing) {
      const { data: upd } = await supabase.from("routine_assignments")
        .update({ status: "pending", change_summary: note || null, updated_at: new Date().toISOString(), assigned_by: profile?.id })
        .eq("id", existing.id)
        .select("id")
        .single();
      assignmentId = upd?.id;
    } else {
      const { data: ins } = await supabase.from("routine_assignments")
        .insert({ routine_id: selected.id, user_id: targetUser.id, assigned_by: profile?.id, change_summary: note || null })
        .select("id")
        .single();
      assignmentId = ins?.id;
    }

    // Send notification to user
    await supabase.from("notifications").insert({
      user_id: targetUser.id,
      type: existing ? "routine_updated" : "routine_assigned",
      title: existing ? "Rutina actualizada" : "Nueva rutina asignada",
      body: existing
        ? `Tu entrenador actualizó la rutina "${selected.name}"${note ? `: ${note}` : ""}`
        : `Tu entrenador te asignó la rutina "${selected.name}"${note ? `: ${note}` : ""}`,
      data: {
        routine_id: selected.id,
        routine_name: selected.name,
        assignment_id: assignmentId,
        assigned_by: profile?.id,
      },
    });

    setSaving(false);
    onDone?.();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Asignar rutina a {targetUser.name}</h2>
          <button className="ghost icon-btn" onClick={onClose}><Icon name="X" size={20} /></button>
        </div>

        {routines.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)", fontSize: 14 }}>
            No tenés rutinas creadas aún.<br />
            <span style={{ fontSize: 12 }}>Creá una desde "Mis Rutinas" primero.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {routines.map(r => (
              <button key={r.id} type="button"
                onClick={() => setSelected(r)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  background: selected?.id === r.id ? "rgba(168,85,247,.1)" : "var(--panel2)",
                  border: `2px solid ${selected?.id === r.id ? "var(--green)" : "var(--line)"}`,
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: selected?.id === r.id ? "var(--green)" : "var(--text)" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{(r.exercises || []).length} ejercicios</div>
                </div>
                {selected?.id === r.id && <Icon name="Check" size={18} style={{ color: "var(--green)" }} />}
              </button>
            ))}
          </div>
        )}

        {routines.length > 0 && (
          <>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label>Nota para el usuario (opcional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="ej: Empezá con pesos moderados" />
            </div>

            {error && <div className="login-error" style={{ marginBottom: 12 }}><Icon name="AlertCircle" size={14} /><span>{error}</span></div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
              <button className="primary" style={{ flex: 2 }} disabled={!selected || saving} onClick={assign}>
                {saving ? "Asignando…" : "Asignar rutina"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

