import { FigureSvg, usePhase } from "./motion/rig.jsx";

/** Muñeco animado de un movimiento. `def` viene de src/data/motion (ver rig.jsx para el formato). */
export default function MotionFigure({ def, size = 260 }) {
  const k = usePhase(!!def);
  if (!def) return null;
  return <FigureSvg def={def} k={k} size={size} />;
}
