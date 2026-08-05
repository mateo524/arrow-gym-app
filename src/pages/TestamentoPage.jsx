import { useState, useEffect, useCallback } from "react";
import useAuthStore from "../store/useAuthStore.js";
import useStore from "../store/useStore.js";
import { supabase } from "../lib/supabase.js";
import Icon from "../components/Icon.jsx";

// Default question hints to guide trainers
const HINT_TEMPLATES = [
  "¿Qué hago si no puedo hacer una banca plana?",
  "¿Con qué frecuencia tengo que entrenar?",
  "¿Qué como antes del entreno?",
  "¿Cómo sé si estoy progresando?",
  "¿Qué hago si me duele la rodilla/espalda?",
  "¿Cuánto descanso entre series?",
  "¿Puedo entrenar si estoy enfermo?",
  "¿Cómo calculo mi peso de trabajo?",
];

export default function TestamentoPage() {
  const { profile } = useAuthStore();
  const setPage = useStore(s => s.setPage);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [hint, setHint] = useState("");
  const [responseText, setResponseText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const isTrainer = profile?.role === "trainer" || profile?.role === "admin" || profile?.role === "superadmin";

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    const [{ data: resp }, { data: prof }] = await Promise.all([
      supabase.from("testamento_responses").select("*").eq("trainer_id", profile.id).order("created_at"),
      supabase.from("profiles").select("testamento_active").eq("id", profile.id).single(),
    ]);
    setResponses(resp || []);
    setIsActive(prof?.testamento_active ?? false);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  async function toggleActive() {
    const next = !isActive;
    setIsActive(next);
    await supabase.from("profiles").update({ testamento_active: next }).eq("id", profile.id);
  }

  async function save() {
    if (!hint.trim() || !responseText.trim()) return;
    setSaving(true);
    if (editingId) {
      await supabase.from("testamento_responses").update({
        question_hint: hint.trim(),
        response_text: responseText.trim(),
        embedding: null, // reset embedding so it gets recalculated
        updated_at: new Date().toISOString(),
      }).eq("id", editingId);
    } else {
      await supabase.from("testamento_responses").insert({
        trainer_id: profile.id,
        question_hint: hint.trim(),
        response_text: responseText.trim(),
      });
    }
    setHint(""); setResponseText(""); setEditingId(null); setShowForm(false);
    setSaving(false);
    load();
  }

  async function remove(id) {
    await supabase.from("testamento_responses").delete().eq("id", id);
    setResponses(r => r.filter(x => x.id !== id));
  }

  function edit(r) {
    setHint(r.question_hint);
    setResponseText(r.response_text);
    setEditingId(r.id);
    setShowForm(true);
  }

  if (!isTrainer) {
    return (
      <div className="page-container" style={{ padding: 24, textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>Solo para entrenadores.</p>
        <button className="ghost" onClick={() => setPage("home")}>Volver</button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 500, margin: "0 auto", padding: "0 0 100px" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <button className="ghost icon-btn" onClick={() => setPage("trainer")}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Modo Testamento</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Tu voz cuando no estás</p>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Explanation */}
        <div className="card" style={{ marginBottom: 16, background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.2)" }}>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.7 }}>
            <b style={{ color: "var(--accent, #a855f7)" }}>¿Cómo funciona?</b><br/>
            Grabás respuestas a las preguntas más frecuentes de tus alumnos. Cuando estés ausente y actives este modo, la IA busca la respuesta más similar a lo que pregunta el alumno y la adapta con tu voz — sin inventar nada nuevo.
          </p>
        </div>

        {/* Toggle activo/inactivo */}
        <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
              {isActive ? "🟢 Modo Testamento activo" : "⚪ Modo Testamento inactivo"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
              {isActive ? "Tus alumnos pueden consultarte via IA" : "Tus alumnos ven el chat normal"}
            </p>
          </div>
          <button
            onClick={toggleActive}
            style={{
              width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
              background: isActive ? "var(--accent, #a855f7)" : "var(--panel2)",
              transition: "background 0.3s",
              position: "relative",
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: "#fff",
              position: "absolute", top: 3,
              left: isActive ? 25 : 3,
              transition: "left 0.3s",
            }} />
          </button>
        </div>

        {/* Responses count */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
            Mis respuestas ({responses.length})
          </p>
          {!showForm && (
            <button className="btn-primary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setShowForm(true)}>
              <Icon name="Plus" size={13} /> Agregar
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p className="section-label" style={{ marginBottom: 10 }}>
              {editingId ? "Editar respuesta" : "Nueva respuesta"}
            </p>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                Pregunta típica (guía para la IA)
              </label>
              <input
                value={hint}
                onChange={e => setHint(e.target.value)}
                placeholder="Ej: ¿Qué hago si no tengo equipamiento?"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--panel2)", color: "var(--text)", fontSize: 14, boxSizing: "border-box",
                }}
              />
              {/* Hint templates */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {HINT_TEMPLATES.slice(0, 4).map(t => (
                  <button key={t} className="ghost" style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20 }}
                    onClick={() => setHint(t)}>
                    {t.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                Tu respuesta (en tu propio estilo)
              </label>
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="Escribí como si le hablaras directamente a tu alumno..."
                rows={5}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--panel2)", color: "var(--text)", fontSize: 14,
                  resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => { setShowForm(false); setEditingId(null); setHint(""); setResponseText(""); }}>
                Cancelar
              </button>
              <button className="btn-primary" style={{ flex: 2 }} disabled={saving || !hint.trim() || !responseText.trim()} onClick={save}>
                {saving ? "Guardando…" : editingId ? "Actualizar" : "Guardar respuesta"}
              </button>
            </div>
          </div>
        )}

        {/* Response list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Icon name="Loader" size={24} className="spin" /></div>
        ) : responses.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
              Aún no tenés respuestas grabadas.<br/>Agregá las preguntas más frecuentes de tus alumnos.
            </p>
          </div>
        ) : (
          responses.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--accent, #a855f7)", fontWeight: 600 }}>
                  {r.question_hint}
                </p>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="ghost icon-btn" onClick={() => edit(r)}>
                    <Icon name="Edit2" size={14} />
                  </button>
                  <button className="ghost icon-btn" onClick={() => remove(r.id)} style={{ color: "var(--danger)" }}>
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                {r.response_text}
              </p>
            </div>
          ))
        )}

        {responses.length > 0 && responses.length < 5 && (
          <div className="card" style={{ background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.2)", marginTop: 8 }}>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
              💡 Recomendamos al menos <b>10 respuestas</b> para que el modo funcione bien. Tenés {responses.length}/10.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
