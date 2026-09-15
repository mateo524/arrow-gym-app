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

export default function WorkoutSetCard({
  setItem, index, onUpdate, onApplyToNext, onRepeat, onRemove, onStartRest,
  prData, coachSuggestion, isBodyweight = false, bodyWeight = 0,
  prevSet = null, beyondLastSession = false
}) {
  const [done, setDone] = useState(false);
  const [showPRPanel, setShowPRPanel] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const exerciseNotes = useStore(s => s.exerciseNotes) || {};
  const setExerciseNote = useStore(s => s.setExerciseNote);
  const note = exerciseNotes[setItem.exercise] || "";
  const [noteText, setNoteText] = useState(note);

  function sanitizeWeight(v) {
    return v.replace(/,/g, ".").replace(/[^0-9.]/g, "").replace(/^(\d{0,4})(\.\d{0,2})?.*/, "$1$2");
  }
  function sanitizeReps(v) {
    return v.replace(/[^0-9]/g, "").slice(0, 3);
  }

  const hasData = isBodyweight
    ? (Number(setItem.weight) > 0 && setItem.reps !== '' && setItem.reps !== null && setItem.reps !== undefined && Number(setItem.reps) > 0)
    : ((setItem.weight !== '' && setItem.weight !== null && setItem.weight !== undefined) &&
       (setItem.reps !== '' && setItem.reps !== null && setItem.reps !== undefined && Number(setItem.reps) > 0));

  // Prev data — only from indexed prevSet when not beyondLastSession
  const antW = beyondLastSession ? null : (prevSet?.weight || setItem.lastWeight);
  const antR = beyondLastSession ? null : (prevSet?.reps || setItem.lastReps);
  const hasPrev = !beyondLastSession && (antW || antR);

  const isNewPR = Number(setItem.weight) > 0 && prData?.bestWeight && Number(setItem.weight) > prData.bestWeight;

  const orm = (() => {
    if (Number(setItem.reps) <= 0 || Number(setItem.reps) > 10) return null;
    const eff = isBodyweight
      ? (Number(setItem.weight) || 0) + (Number(setItem.extraWeight) || 0)
      : Number(setItem.weight) || 0;
    const rir = setItem.rir !== undefined && setItem.rir !== "" ? Number(setItem.rir) : 0;
    return calc1RM(eff, Math.min(Number(setItem.reps) + rir, 30));
  })();

  const hasExtras = editingNote || (note && !editingNote) || showPRPanel || (coachSuggestion !== null && coachSuggestion !== undefined);

  return (
    <div style={{ marginBottom: 4 }}>
      {/* ── Compact row ── */}
      <div className={`set-row${done ? " set-row-done" : ""}${beyondLastSession ? " set-row-new" : ""}`}>

        {/* Left: set number + ant info */}
        <div className="set-row-meta">
          <span className={`set-num-sm${done ? " done" : ""}`}>
            {done ? <Icon name="Check" size={10} /> : index}
          </span>
          <span className="set-ant-sm">
            {beyondLastSession
              ? <span style={{ color: "var(--muted)", opacity: 0.3 }}>—</span>
              : hasPrev
                ? <>{antW ? `${antW}kg` : "—"}×{antR || "—"}</>
                : <span style={{ opacity: 0.25 }}>—</span>
            }
          </span>
        </div>

        {/* Middle: inputs */}
        {isBodyweight ? (
          <div className="set-row-inputs">
            <span className="set-bw-badge">{bodyWeight > 0 ? bodyWeight : "?"}</span>
            <span className="set-sep">+</span>
            <input
              className="set-val-sm"
              inputMode="decimal"
              value={setItem.extraWeight === 0 || setItem.extraWeight === "0" ? "" : (setItem.extraWeight || "")}
              placeholder={setItem.lastExtraWeight && !beyondLastSession ? `${setItem.lastExtraWeight}` : "0"}
              onChange={(e) => { haptic(); setDone(false); onUpdate({ extraWeight: sanitizeWeight(e.target.value) || 0 }); }}
              onFocus={(e) => {
                if ((!setItem.extraWeight || setItem.extraWeight === 0) && setItem.lastExtraWeight && !beyondLastSession)
                  onUpdate({ extraWeight: Number(setItem.lastExtraWeight) });
                e.target.select();
              }}
              style={{ borderColor: setItem.extraWeight ? "rgba(168,85,247,.5)" : undefined }}
            />
            <span className="set-sep">×</span>
            <input
              className="set-val-sm"
              inputMode="numeric"
              value={setItem.reps}
              placeholder={!beyondLastSession ? (setItem.planReps || setItem.lastReps || "—") : "—"}
              onChange={(e) => { haptic(); setDone(false); onUpdate({ reps: sanitizeReps(e.target.value) }); }}
              onFocus={(e) => {
                if (!setItem.reps && setItem.lastReps && !beyondLastSession)
                  onUpdate({ reps: String(setItem.lastReps) });
                e.target.select();
              }}
              style={{ borderColor: setItem.reps ? "rgba(168,85,247,.5)" : undefined }}
            />
          </div>
        ) : (
          <div className="set-row-inputs">
            <input
              className="set-val-sm"
              inputMode="decimal"
              value={setItem.weight}
              placeholder={!beyondLastSession
                ? ((!setItem.weight && coachSuggestion?.weight != null) ? String(coachSuggestion.weight) : (setItem.lastWeight || ""))
                : ""}
              onChange={(e) => { haptic(); setDone(false); onUpdate({ weight: sanitizeWeight(e.target.value) }); }}
              onFocus={(e) => {
                if (!setItem.weight && setItem.lastWeight && !beyondLastSession)
                  onUpdate({ weight: String(setItem.lastWeight) });
                e.target.select();
              }}
              style={{ borderColor: setItem.weight ? "rgba(168,85,247,.5)" : undefined }}
            />
            <span className="set-sep">×</span>
            <input
              className="set-val-sm"
              inputMode="numeric"
              value={setItem.reps}
              placeholder={!beyondLastSession ? (setItem.planReps || setItem.lastReps || "—") : "—"}
              onChange={(e) => { haptic(); setDone(false); onUpdate({ reps: sanitizeReps(e.target.value) }); }}
              onFocus={(e) => {
                if (!setItem.reps && setItem.lastReps && !beyondLastSession)
                  onUpdate({ reps: String(setItem.lastReps) });
                e.target.select();
              }}
              style={{ borderColor: setItem.reps ? "rgba(168,85,247,.5)" : undefined }}
            />
          </div>
        )}

        {/* Right: actions */}
        <div className="set-row-actions">
          {isNewPR && (
            <span style={{ background: "var(--green)", color: "#fff", fontSize: 8, fontWeight: 900, padding: "2px 5px", borderRadius: 5, flexShrink: 0 }}>PR</span>
          )}
          {orm && hasData && (
            <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, flexShrink: 0, lineHeight: 1 }}>{Math.round(orm)}</span>
          )}
          <button
            className="set-delete-btn"
            style={{ color: note ? "var(--green)" : "var(--muted)" }}
            onClick={() => { setNoteText(note); setEditingNote(!editingNote); }}
            title="Nota"
          >
            <Icon name="FileText" size={12} />
          </button>
          <button
            className="set-delete-btn"
            style={{ color: showPRPanel ? "var(--green)" : "var(--muted)" }}
            onClick={() => setShowPRPanel(!showPRPanel)}
            title="Récords"
          >
            <Icon name="BarChart2" size={12} />
          </button>

          {hasData && !done ? (
            <button
              onClick={() => {
                haptic("done"); setDone(true); onUpdate({ done: true });
                const rpe = setItem.rir !== undefined && setItem.rir !== "" ? Math.max(6, 10 - Number(setItem.rir)) : setItem.rpe;
                onStartRest(rpe);
              }}
              className="set-done-action"
            >
              <Icon name="Check" size={12} /> Hecho
            </button>
          ) : done ? (
            <span className="set-done-label">
              <Icon name="CheckCircle" size={15} />
            </span>
          ) : (
            <button
              onClick={() => { haptic(); setDone(true); onStartRest(setItem.rpe); }}
              className="set-rest-action"
              title="Descanso"
            >
              <Icon name="Timer" size={13} />
            </button>
          )}

          <button className="set-delete-btn set-delete-x" onClick={onRemove} aria-label="Borrar">
            <Icon name="X" size={14} />
          </button>
        </div>
      </div>

      {/* ── Expandable extras ── */}
      {hasExtras && (
        <div style={{ padding: "2px 4px 2px", display: "flex", flexDirection: "column", gap: 4 }}>
          {editingNote && (
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onBlur={() => { setExerciseNote(setItem.exercise, noteText); setEditingNote(false); }}
              placeholder="Nota del ejercicio..."
              rows={2}
              style={{ width: "100%", background: "var(--panel2)", border: "1px solid var(--green)", borderRadius: 10, padding: "8px 10px", color: "var(--text)", fontSize: 12, resize: "none", boxSizing: "border-box" }}
              autoFocus
            />
          )}
          {!editingNote && note && (
            <p style={{ margin: 0, fontSize: 11, color: "var(--green)", background: "rgba(168,85,247,.07)", borderRadius: 8, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="ClipboardList" size={11} /> {note}
            </p>
          )}
          {showPRPanel && (
            <div style={{ background: "var(--panel2)", borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[
                  { label: "Mejor peso", value: prData?.bestWeight ? `${prData.bestWeight}kg` : "—" },
                  { label: "Mejor vol.", value: prData?.bestVolume ? `${prData.bestVolume}kg` : "—" },
                  { label: "Mas reps", value: prData?.bestReps ? `${prData.bestReps}×${prData.bestRepsWeight}` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--green)" }}>{value}</div>
                    <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
              {prData?.lastDate && (
                <p style={{ fontSize: 10, color: "var(--muted)", margin: "6px 0 0", textAlign: "center" }}>
                  Ultima sesion: {prData.lastDate}
                </p>
              )}
            </div>
          )}
          {coachSuggestion && coachSuggestion.dir !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(168,85,247,.08)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 10, padding: "5px 10px" }}>
              <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>
                {coachSuggestion.dir === "up" ? "+" : "-"} {coachSuggestion.weight}kg
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)", flex: 1 }}>{coachSuggestion.reason}</span>
              {onApplyToNext && (
                <button className="ghost" style={{ fontSize: 11, padding: "3px 8px", flexShrink: 0, borderColor: "var(--green)", color: "var(--green)" }}
                  onClick={() => onApplyToNext(coachSuggestion.weight)}>
                  Aplicar
                </button>
              )}
            </div>
          )}
          {coachSuggestion && coachSuggestion.dir === null && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(52,211,153,.07)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 10, padding: "5px 10px" }}>
              <span style={{ color: "#34d399", flexShrink: 0 }}><Icon name="Check" size={11} /></span>
              <span style={{ fontSize: 11, color: "var(--muted)", flex: 1 }}>{coachSuggestion.reason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
