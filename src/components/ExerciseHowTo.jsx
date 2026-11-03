import Icon from "./Icon.jsx";
import ExerciseMotion from "./ExerciseMotion.jsx";
import { findExerciseMeta } from "../data/exerciseDatabase.js";

/**
 * Hoja única "Cómo se hace": animación del movimiento y técnica escrita.
 * `tip` es el texto de técnica ya resuelto por quien la abre.
 */
const DEFAULT_TIP = "Ejecutá el movimiento en forma controlada. Concentrate en el músculo que trabaja, exhalá en el esfuerzo e inhalá al volver. Si dudás, empezá con poco peso.";

export default function ExerciseHowTo({ exercise, tip, onClose, accent = "var(--green)" }) {
  if (!exercise) return null;
  const meta = findExerciseMeta(exercise) || {};
  const text = tip || meta.tip || DEFAULT_TIP;
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 500 }}>
      <div
        className="modal-card"
        role="dialog"
        aria-label={`Cómo se hace ${exercise}`}
        style={{ maxWidth: 380, maxHeight: "88dvh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 style={{ fontSize: 17, margin: 0 }}>Cómo se hace: {exercise}</h2>
          <button className="ghost icon-btn" onClick={onClose} aria-label="Cerrar"><Icon name="X" size={18} /></button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 10px" }}>
          <ExerciseMotion name={exercise} pattern={meta.pattern} muscle={meta.muscle} equipment={meta.equipment} size={260} />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          {meta.muscle && <span style={{ fontSize: 12, color: accent, background: "var(--panel2)", borderRadius: 8, padding: "3px 10px", fontWeight: 700 }}>{meta.muscle}</span>}
          {meta.equipment && <span style={{ fontSize: 12, color: "var(--muted)", background: "var(--panel2)", borderRadius: 8, padding: "3px 10px" }}>{meta.equipment}</span>}
        </div>

        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Técnica</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text)", margin: "0 0 14px" }}>{text}</p>

        <button className="ghost" style={{ width: "100%" }} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
