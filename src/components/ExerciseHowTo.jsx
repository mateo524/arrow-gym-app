import { Suspense, lazy } from "react";
import Icon from "./Icon.jsx";
import { findExerciseMeta } from "../data/exerciseDatabase.js";
import { techniqueFor } from "../data/technique/index.js";

// La animación (muñeco + 298 movimientos) pesa bastante: se baja recién cuando se abre esta hoja.
const ExerciseMotion = lazy(() => import("./ExerciseMotion.jsx"));

/**
 * Hoja única "Cómo se hace": animación del movimiento (perfil, diagonal y frente) y técnica escrita paso a paso.
 * `tip` es una nota ya resuelta por quien la abre (por ejemplo, del entrenador).
 */
const DEFAULT_TIP = "Ejecutá el movimiento en forma controlada. Concentrate en el músculo que trabaja, exhalá en el esfuerzo e inhalá al volver. Si dudás, empezá con poco peso.";

const H = { margin: "14px 0 6px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" };
const P = { fontSize: 14, lineHeight: 1.6, color: "var(--text)", margin: 0 };

export default function ExerciseHowTo({ exercise, tip, onClose, accent = "var(--green)" }) {
  if (!exercise) return null;
  const meta = findExerciseMeta(exercise) || {};
  const tech = techniqueFor(exercise);
  const note = tip && tip !== meta.tip && tip !== tech?.tip ? tip : "";
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

        <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 10px", minHeight: 200 }}>
          <Suspense fallback={<div style={{ alignSelf: "center", fontSize: 13, color: "var(--muted)" }}>Cargando animación…</div>}>
            <ExerciseMotion name={exercise} pattern={meta.pattern} muscle={meta.muscle} equipment={meta.equipment} size={260} />
          </Suspense>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 4 }}>
          {meta.muscle && <span style={{ fontSize: 12, color: accent, background: "var(--panel2)", borderRadius: 8, padding: "3px 10px", fontWeight: 700 }}>{meta.muscle}</span>}
          {meta.equipment && <span style={{ fontSize: 12, color: "var(--muted)", background: "var(--panel2)", borderRadius: 8, padding: "3px 10px" }}>{meta.equipment}</span>}
          {(meta.muscles || []).slice(1, 3).map((m) => <span key={m} style={{ fontSize: 12, color: "var(--muted)", border: "1px solid var(--line)", borderRadius: 8, padding: "2px 9px" }}>{m}</span>)}
        </div>

        {tech ? (
          <>
            <p style={H}>Posición inicial</p>
            <p style={P}>{tech.setup}</p>

            <p style={H}>Cómo se hace</p>
            <ol style={{ ...P, paddingLeft: 20 }}>
              {tech.steps.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
            </ol>

            {tech.breath && (<><p style={H}>Respiración</p><p style={P}>{tech.breath}</p></>)}

            <p style={H}>Errores comunes</p>
            <ul style={{ ...P, listStyle: "none", padding: 0 }}>
              {tech.mistakes.map((m, i) => (
                <li key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <span aria-hidden="true" style={{ color: "var(--danger)", fontWeight: 800 }}>✕</span><span>{m}</span>
                </li>
              ))}
            </ul>

            {tech.tip && (
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "var(--panel2)", border: "1px solid var(--line)" }}>
                <p style={{ ...P, fontSize: 13 }}><strong style={{ color: accent }}>Consejo: </strong>{tech.tip}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <p style={H}>Técnica</p>
            <p style={P}>{tip || meta.tip || DEFAULT_TIP}</p>
          </>
        )}

        {note && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "var(--panel2)", border: "1px solid var(--line)" }}>
            <p style={{ ...P, fontSize: 13 }}><strong style={{ color: accent }}>Nota: </strong>{note}</p>
          </div>
        )}

        <button className="ghost" style={{ width: "100%", marginTop: 16 }} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
