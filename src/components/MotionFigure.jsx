import { useEffect, useState } from "react";
import { FigureSvg, usePhase, availableViews } from "./motion/rig.jsx";

const VIEW_LABEL = { side: "Perfil", front: "Frente" };

/** Muñeco animado de un movimiento. `def` viene de src/data/motion (ver rig.jsx). Si el ejercicio tiene dos vistas, muestra el selector. */
export default function MotionFigure({ def, size = 260, name }) {
  const k = usePhase(!!def);
  const views = availableViews(def);
  const [view, setView] = useState(views[0]);
  useEffect(() => { setView(availableViews(def)[0]); }, [def]);
  if (!def) return null;
  const current = views.includes(view) ? view : views[0];
  return (
    <div style={{ width: size, maxWidth: "100%" }}>
      <FigureSvg def={def} k={k} size={size} view={current} />
      {views.length > 1 && (
        <div role="group" aria-label={name ? `Vista de ${name}` : "Vista"} style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}>
          {views.map((v) => (
            <button
              key={v}
              type="button"
              data-testid={`view-${v}`}
              aria-pressed={current === v}
              onClick={() => setView(v)}
              style={{
                fontSize: 12, fontWeight: 700, padding: "6px 14px", minHeight: 32, borderRadius: 999, cursor: "pointer",
                border: "1px solid " + (current === v ? "var(--green)" : "var(--line)"),
                background: current === v ? "var(--green)" : "var(--panel2)",
                color: current === v ? "#fff" : "var(--muted)",
              }}
            >{VIEW_LABEL[v]}</button>
          ))}
        </div>
      )}
    </div>
  );
}
