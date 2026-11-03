import Icon from "./Icon.jsx";
import ExerciseIllustration from "./ExerciseIllustration.jsx";
import { findExerciseMeta } from "../data/exerciseDatabase.js";
import { exerciseVideoUrl } from "../lib/exerciseVideo.js";

/**
 * Hoja única "Cómo se hace": dibujo animado del movimiento, técnica escrita y video.
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
          <ExerciseIllustration name={exercise} pattern={meta.pattern} muscle={meta.muscle} equipment={meta.equipment} size={170} animated />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          {meta.muscle && <span style={{ fontSize: 12, color: accent, background: "var(--panel2)", borderRadius: 8, padding: "3px 10px", fontWeight: 700 }}>{meta.muscle}</span>}
          {meta.equipment && <span style={{ fontSize: 12, color: "var(--muted)", background: "var(--panel2)", borderRadius: 8, padding: "3px 10px" }}>{meta.equipment}</span>}
        </div>

        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Técnica</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text)", margin: "0 0 14px" }}>{text}</p>

        <a
          href={exerciseVideoUrl(exercise)}
          target="_blank"
          rel="noopener noreferrer"
          className="primary"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: 12, fontWeight: 700, textDecoration: "none", marginBottom: 8 }}
        >
          <Icon name="Play" size={16} /> Ver video en YouTube
        </a>
        <button className="ghost" style={{ width: "100%" }} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
