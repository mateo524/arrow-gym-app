import { useState } from "react";
import ExerciseIllustration from "./ExerciseIllustration.jsx";
import MotionFigure from "./MotionFigure.jsx";
import { motionForName } from "../data/motion/index.js";
import { getExerciseFrames } from "../data/exerciseMedia.js";

const CSS = `
@keyframes exmotion-fade { 0%, 25% { opacity: 0; } 50%, 75% { opacity: 1; } 100% { opacity: 0; } }
.exmotion-top { animation: exmotion-fade 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .exmotion-top { animation: none; opacity: 0; } }
`;

/**
 * Persona haciendo el ejercicio: alterna las dos fotos (inicio y final del movimiento) para dar
 * sensación de animación. Si no hay fotos o no cargan (sin conexión), usa el dibujo animado.
 */
export default function ExerciseMotion({ name, pattern, muscle, equipment, size = 220 }) {
  const def = motionForName(name);
  const frames = getExerciseFrames(name);
  const [failed, setFailed] = useState(false);

  if (def) {
    return <div role="img" aria-label={`Movimiento: ${name}`}><MotionFigure def={def} size={size} /></div>;
  }
  if (!frames || failed) {
    return <ExerciseIllustration name={name} pattern={pattern} muscle={muscle} equipment={equipment} size={170} animated />;
  }
  const box = { position: "relative", width: size, maxWidth: "100%", aspectRatio: "4 / 3", borderRadius: 14, overflow: "hidden", background: "#fff" };
  const img = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" };
  return (
    <div style={box} role="img" aria-label={`Movimiento: ${name}`}>
      <style>{CSS}</style>
      <img src={frames[0]} alt="" style={img} loading="eager" onError={() => setFailed(true)} draggable={false} />
      <img className="exmotion-top" src={frames[1]} alt="" style={img} loading="eager" onError={() => setFailed(true)} draggable={false} />
    </div>
  );
}
