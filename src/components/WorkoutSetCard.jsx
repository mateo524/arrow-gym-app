import { useState } from "react";
import Icon from "./Icon.jsx";
import useStore from "../store/useStore.js";
import { calc1RM } from "../lib/analytics.js";

function haptic(type = "tap") {
  if (!navigator.vibrate) return;
  if (type === "tap") navigator.vibrate(18);
  else if (type === "done") navigator.vibrate([30, 40, 60]);
  else if (type === "delete") navigator.vibrate([15, 20, 15]);
}

export default function WorkoutSetCard({ setItem, index, onUpdate, onApplyToNext, onRepeat, onRemove, onStartRest, prData, coachSuggestion, isBodyweight=false, bodyWeight=0 }) {
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
            <span style={{ background:"var(--green)", color:"#fff", fontSize:9, fontWeight:900, padding:"2px 6px", borderRadius:6, marginRight:4 }}>PR</span>
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
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(168,85,247,.08)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 10, padding: "6px 10px", marginBottom: 6 }}>
          <span style={{ fontSize: 14, color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>
            {coachSuggestion.dir === "up" ? "⬆" : "⬇"} {coachSuggestion.weight}kg
          </span>
          <span style={{ fontSize: 12, color: "var(--muted)", flex: 1 }}>{coachSuggestion.reason}</span>
          {onApplyToNext && (
            <button className="ghost" style={{ fontSize: 12, padding: "3px 10px", flexShrink: 0, borderColor: "var(--green)", color: "var(--green)" }}
              onClick={() => onApplyToNext(coachSuggestion.weight)}>
              Aplicar al próximo
            </button>
          )}
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

      {/* Pre-set suggestion: tap to fill */}
      {!setItem.weight && setItem.lastWeight != null && setItem.lastWeight !== '' && (
        <button
          onClick={() => onUpdate({ weight: String(setItem.lastWeight), reps: String(setItem.lastReps || '') })}
          style={{
            width: "100%", marginBottom: 6, padding: "7px 12px",
            background: "rgba(168,85,247,.07)", border: "1px dashed rgba(168,85,247,.3)",
            borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Probá igual que última vez</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--green)" }}>
            {isBodyweight ? (setItem.lastWeight > 0 ? `+${setItem.lastWeight}kg` : "PC") : `${setItem.lastWeight}kg`} × {setItem.lastReps || "?"}
          </span>
        </button>
      )}

      {/* Bodyweight indicator */}
      {isBodyweight && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "5px 10px", background: "rgba(96,165,250,.07)", border: "1px solid rgba(96,165,250,.2)", borderRadius: 8 }}>
          <span style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700 }}>PC</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            {bodyWeight > 0 ? `${bodyWeight}kg` : "?"} + {Number(setItem.weight) || 0}kg extra
          </span>
          {bodyWeight > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 800, color: "#60a5fa" }}>
              = {bodyWeight + (Number(setItem.weight) || 0)}kg total
            </span>
          )}
        </div>
      )}

      {/* kg + reps side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "10px 0 8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              {isBodyweight ? "extra" : "kg"}
            </span>
            {setItem.lastWeight && !setItem.weight && (
              <span style={{ fontSize: 12, color: "rgba(168,85,247,.6)", fontWeight: 700 }}>ult. {setItem.lastWeight}</span>
            )}
          </div>
          <input
            className="set-val"
            inputMode="decimal"
            value={setItem.weight}
            placeholder={setItem.lastWeight || "0"}
            onChange={(e) => { haptic(); setDone(false); onUpdate({ weight: sanitizeWeight(e.target.value) }); }}
            onFocus={(e) => e.target.select()}
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
            onChange={(e) => { haptic(); setDone(false); onUpdate({ reps: sanitizeReps(e.target.value) }); }}
            onFocus={(e) => e.target.select()}
            style={{ width: "100%", textAlign: "center", fontSize: 26, fontWeight: 800, borderColor: setItem.reps ? "rgba(168,85,247,.5)" : undefined, transition: "border-color .2s" }}
          />
        </div>
      </div>

      {/* e1RM estimate badge — only shown for reliable rep ranges (≤ 10 reps) */}
      {Number(setItem.weight) > 0 && Number(setItem.reps) > 0 && Number(setItem.reps) <= 10 && (() => {
        const rir = setItem.rir !== undefined && setItem.rir !== "" ? Number(setItem.rir) : 0;
        const effectiveReps = Math.min(Number(setItem.reps) + rir, 30);
        const orm = calc1RM(Number(setItem.weight), effectiveReps);
        if (!orm || orm <= 0) return null;
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "var(--muted)", background: "var(--panel2)", borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>
              1RM est. {Math.round(orm)}kg
            </span>
          </div>
        );
      })()}

      {/* RIR selector (Reps In Reserve) — shows when reps filled */}
      {setItem.reps && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>RIR</span>
          <div style={{ display: "flex", gap: 3 }}>
            {[
              { val: 0, label: "0", tip: "Al fallo" },
              { val: 1, label: "1", tip: "1 en reserva" },
              { val: 2, label: "2", tip: "2 en reserva" },
              { val: 3, label: "3+", tip: "Fácil" },
            ].map(({ val, label, tip }) => {
              const selected = setItem.rir === val;
              const bg = selected ? (val === 0 ? "var(--danger)" : val === 1 ? "#f59e0b" : "var(--green)") : "var(--panel2)";
              return (
                <button key={val}
                  onClick={() => onUpdate({ rir: selected ? undefined : val, rpe: selected ? null : Math.max(6, 10 - val) })}
                  title={tip}
                  style={{
                    minWidth: 28, height: 24, borderRadius: 6, fontSize: 11, fontWeight: 700,
                    cursor: "pointer", border: "none", background: bg,
                    color: selected ? "#fff" : "var(--muted)", padding: "0 5px",
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
          {setItem.rir !== undefined && setItem.rir !== "" && (
            <span style={{ fontSize: 10, color: "var(--muted)" }}>
              {setItem.rir === 0 ? "Al fallo" : setItem.rir === 1 ? "1 rep en reserva" : setItem.rir === 2 ? "2 reps en reserva" : "Fácil (3+)"}
            </span>
          )}
        </div>
      )}

      <div className="set-actions">
        <button
          className="ghost set-action-sm"
          onClick={() => {
            haptic();
            setDone(true);
            // Convert RIR to effective RPE for smart timer: RIR 0 = RPE 10, RIR 1 = RPE 9, etc.
            const effectiveRpe = setItem.rir !== undefined && setItem.rir !== ""
              ? Math.max(6, 10 - Number(setItem.rir))
              : setItem.rpe;
            onStartRest(effectiveRpe);
          }}
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

