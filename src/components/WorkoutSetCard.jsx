import { useState } from "react";
import Icon from "./Icon.jsx";
import useStore from "../store/useStore.js";

function haptic(type = "tap") {
  if (!navigator.vibrate) return;
  if (type === "tap") navigator.vibrate(18);
  else if (type === "done") navigator.vibrate([30, 40, 60]);
  else if (type === "delete") navigator.vibrate([15, 20, 15]);
}

export default function WorkoutSetCard({ setItem, index, onUpdate, onRepeat, onRemove, onStartRest, prData, coachSuggestion }) {
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const hasData = (setItem.weight !== '' && setItem.weight !== null && setItem.weight !== undefined) &&
                  (setItem.reps !== '' && setItem.reps !== null && setItem.reps !== undefined && Number(setItem.reps) > 0);
  const isPrefilled = Boolean((setItem.lastWeight || setItem.lastReps) && !hasData);

  function sanitizeWeight(v) {
    return v.replace(/,/g, ".").replace(/[^0-9.]/g, "").replace(/^(\d{0,4})(\.\d{0,2})?.*/, "$1$2");
  }
  function sanitizeReps(v) {
    return v.replace(/[^0-9]/g, "").slice(0, 3);
  }
  const exerciseNotes = useStore(s => s.exerciseNotes) || {};
  const setExerciseNote = useStore(s => s.setExerciseNote);
  const note = exerciseNotes[setItem.exercise] || "";
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(note);

  if (flipped) {
    return (
      <div className="set-card set-card-flipped">
        <div className="set-head">
          <b style={{ color: "var(--green)" }}>Serie {index || 1} · Récords</b>
          <button className="set-delete-btn" onClick={() => setFlipped(false)} aria-label="Volver">↩</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 8 }}>
          {[
            { label: "Mejor peso",  value: prData?.bestWeight ? `${prData.bestWeight}kg` : "—" },
            { label: "Mejor vol.",  value: prData?.bestVolume ? `${prData.bestVolume}kg` : "—" },
            { label: "Más reps",   value: prData?.bestReps ? `${prData.bestReps}×${prData.bestRepsWeight}kg` : "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "var(--panel2)", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--green)" }}>{value}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        {prData?.lastDate && (
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "8px 0 0", textAlign: "center" }}>
            Última sesión: {prData.lastDate}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`set-card compact-set-card${isPrefilled ? " set-card-ghost" : ""}${done ? " set-card-done" : ""}`}
      aria-label={`Serie ${index || 1}`}
    >
      <div className="set-head">
        {/* Set number badge — display only */}
        <span className={`set-done-btn${done ? " done" : ""}`} style={{ cursor: "default", pointerEvents: "none" }}>
          {done ? "✓" : index || 1}
        </span>
        <div style={{ flex:1, minWidth:0 }}>
          {Number(setItem.weight) > 0 && prData?.bestWeight && Number(setItem.weight) > prData.bestWeight && (
            <span style={{ background:"var(--green)", color:"#fff", fontSize:9, fontWeight:900, padding:"2px 6px", borderRadius:6, marginRight:4 }}>PR 🔥</span>
          )}
          {setItem.lastWeight ? (
            <small style={{ color: "var(--muted)", fontSize:13 }}>ant. {setItem.lastWeight}kg × {setItem.lastReps || "—"}</small>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="set-delete-btn" style={{ color: note ? "var(--green)" : "var(--muted)" }}
            onClick={() => { setNoteText(note); setEditingNote(!editingNote); }} aria-label="Nota">
            <Icon name="FileText" size={13} />
          </button>
          <button className="set-delete-btn" style={{ color: "var(--muted)" }} onClick={() => setFlipped(true)} aria-label="Ver récords">
            <Icon name="BarChart2" size={13} />
          </button>
          <button className="set-delete-btn" style={{ color: "var(--danger)" }} onClick={onRemove} aria-label="Borrar">✕</button>
        </div>
      </div>

      {editingNote && (
        <div style={{ marginBottom:8 }}>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onBlur={() => { setExerciseNote(setItem.exercise, noteText); setEditingNote(false); }}
            placeholder="Nota del ejercicio (ej: bajar más en sentadilla)..."
            rows={2}
            style={{ width:"100%", background:"var(--panel2)", border:"1px solid var(--green)", borderRadius:10, padding:"8px 10px", color:"var(--text)", fontSize:12, resize:"none", boxSizing:"border-box" }}
            autoFocus
          />
        </div>
      )}
      {!editingNote && note && (
        <p style={{ margin:"2px 0 6px", fontSize:11, color:"var(--green)", background:"rgba(168,85,247,.07)", borderRadius:8, padding:"4px 8px" }}>
          📝 {note}
        </p>
      )}

      {/* Live coach weight suggestion */}
      {coachSuggestion && coachSuggestion.dir !== null && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(168,85,247,.08)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 10, padding: "6px 10px", marginBottom: 6 }}>
          <span style={{ fontSize: 14, color: "var(--green)", fontWeight: 700 }}>
            {coachSuggestion.dir === "up" ? "⬆ Subí a" : "⬇ Bajá a"} {coachSuggestion.weight}kg
          </span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{coachSuggestion.reason}</span>
          <button className="ghost" style={{ fontSize: 13, padding: "2px 8px", marginLeft: 6 }}
            onClick={() => onUpdate({ weight: String(coachSuggestion.weight) })}>
            Aplicar
          </button>
        </div>
      )}
      {coachSuggestion && coachSuggestion.dir === null && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(52,211,153,.07)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 10, padding: "5px 10px", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: "#34d399", fontWeight: 700 }}>✓</span>
          <span style={{ fontSize: 12, color: "var(--muted)", flex: 1 }}>{coachSuggestion.reason}</span>
          {coachSuggestion.rest && (
            <span style={{ fontSize: 11, color: "rgba(117,217,255,.8)", fontWeight: 700, flexShrink: 0 }}>
              ⏱ {coachSuggestion.rest < 60 ? `${coachSuggestion.rest}s` : `${coachSuggestion.rest/60}min`} descanso
            </span>
          )}
        </div>
      )}

      {/* kg + reps side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "10px 0 8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>kg</span>
            {setItem.lastWeight && !setItem.weight && (
              <span style={{ fontSize: 12, color: "rgba(168,85,247,.6)", fontWeight: 700 }}>ult. {setItem.lastWeight}</span>
            )}
          </div>
          <input
            className="set-val"
            inputMode="decimal"
            value={setItem.weight}
            placeholder={setItem.lastWeight || "—"}
            onChange={(e) => { haptic(); onUpdate({ weight: sanitizeWeight(e.target.value) }); }}
            style={{ width: "100%", textAlign: "center", fontSize: 26, fontWeight: 800, borderColor: setItem.weight ? "rgba(168,85,247,.5)" : undefined, transition: "border-color .2s" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>reps</span>
            {(setItem.planReps || setItem.lastReps) && !setItem.reps && (
              <span style={{ fontSize: 12, color: "rgba(168,85,247,.6)", fontWeight: 700 }}>{setItem.planReps ? `plan ${setItem.planReps}` : `ult. ${setItem.lastReps}`}</span>
            )}
          </div>
          <input
            className="set-val"
            inputMode="numeric"
            value={setItem.reps}
            placeholder={setItem.planReps || setItem.lastReps || "—"}
            onChange={(e) => { haptic(); onUpdate({ reps: sanitizeReps(e.target.value) }); }}
            style={{ width: "100%", textAlign: "center", fontSize: 26, fontWeight: 800, borderColor: setItem.reps ? "rgba(168,85,247,.5)" : undefined, transition: "border-color .2s" }}
          />
        </div>
      </div>

      {/* RPE selector — show only when reps filled */}
      {setItem.reps && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>RPE</span>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {[6,7,8,9,10].map(r => (
              <button key={r}
                onClick={() => onUpdate({ rpe: setItem.rpe === r ? null : r })}
                style={{
                  width: 28, height: 24, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
                  background: setItem.rpe === r ? (r >= 9 ? "var(--danger)" : r >= 7 ? "#f59e0b" : "var(--green)") : "var(--panel2)",
                  color: setItem.rpe === r ? "#fff" : "var(--muted)",
                }}>
                {r}
              </button>
            ))}
          </div>
          {setItem.rpe && <span style={{ fontSize: 10, color: "var(--muted)" }}>{setItem.rpe >= 9 ? "Máximo esfuerzo" : setItem.rpe >= 7 ? "Muy difícil" : "Moderado"}</span>}
        </div>
      )}

      <div className="set-actions">
        <button
          className="ghost set-action-sm"
          onClick={() => { haptic(); onStartRest(); }}
          title="Descanso"
          style={{ display:"flex", alignItems:"center", gap:5, border:"1.5px dashed var(--cyan)", color:"var(--cyan)", background:"rgba(117,217,255,.06)" }}
        >
          <Icon name="Timer" size={13} />
          Descanso
        </button>
        <button
          className="ghost set-action-sm"
          onClick={() => { haptic(); onRepeat(); }}
          title="Repetir serie"
          style={{ display:"flex", alignItems:"center", gap:5 }}
        >
          <Icon name="RefreshCw" size={13} />
          Repetir
        </button>
      </div>
    </div>
  );
}

