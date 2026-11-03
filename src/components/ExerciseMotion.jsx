import { useState } from "react";
import ExerciseIllustration, { getKey, norm } from "./ExerciseIllustration.jsx";
import MotionFigure, { MOVES } from "./MotionFigure.jsx";
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
  const eq = norm(equipment || "");
  let key = getKey(name, pattern, muscle, equipment);
  if (key === "bench-horizontal" && /maquina|smith/.test(eq) && !/smith/.test(eq)) key = "chest-press-machine";
  if (key === "bench-incline" && /maquina/.test(eq)) key = "chest-press-machine";
  const propKind = eq.includes("mancuerna") ? "db" : /maquina|polea|smith/.test(eq) ? "bar" : undefined;
  const frames = getExerciseFrames(name);
  const [failed, setFailed] = useState(false);

  if (MOVES[key]) {
    return <div role="img" aria-label={`Movimiento: ${name}`}><MotionFigure moveKey={key} size={size} propKind={propKind} /></div>;
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
