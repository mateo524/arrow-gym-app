import { norm } from "../components/ExerciseIllustration.jsx";

// Ejercicio -> movimiento del muñeco. Solo van los que coinciden de verdad con el movimiento;
// si un ejercicio no está acá, "Cómo se hace" usa la ilustración de antes en lugar de mostrar algo incorrecto.
const RAW = {
  "bench-horizontal": ["Press de banca plano", "Press de banca con pausa", "Press de pecho con mancuernas", "Press de banca en Smith"],
  "bench-incline": ["Press de banca inclinado", "Press inclinado con mancuernas", "Press inclinado en Smith"],
  "chest-press-machine": ["Press de pecho en máquina", "Press inclinado en máquina"],
  "overhead-press": ["Press militar con barra", "Press con mancuernas", "Press militar en Smith", "Overhead press en Smith"],
  "row-seated": ["Remo en polea baja", "Remo bajo en máquina"],
  "pulldown": ["Jalón al pecho con barra", "Jalón con agarre estrecho", "Jalón neutro", "Jalón en polea", "Pulldown con agarre supino"],
  "curl-standing": ["Curl con barra", "Curl con barra Z", "Curl con mancuernas", "Curl alternado con mancuernas", "Curl martillo", "Curl en polea baja", "Curl de bíceps en Smith"],
  "spider-curl": ["Curl de araña"],
  "bayesian-curl": ["Bayesian curl"],
  "curl-incline": ["Curl en banco inclinado"],
  "preacher-curl": ["Curl predicador", "Curl Scott con mancuernas"],
  "concentration-curl": ["Curl concentrado"],
  "tricep-pushdown": ["Extensión de tríceps en polea", "Extensión de tríceps con cuerda", "Extensión de tríceps unilateral", "Press de tríceps en polea alta"],
  "skull-crusher": ["Rompecráneos", "Rompecráneos con barra Z", "Rompecráneos con mancuernas", "Press francés", "Extensión de tríceps acostado con mancuernas"],
  "squat": ["Sentadilla libre", "Sentadilla en Smith", "Sentadilla frontal"],
  "deadlift": ["Peso muerto", "Peso muerto con déficit"],
};

const BY_NAME = new Map();
for (const [key, names] of Object.entries(RAW)) for (const n of names) BY_NAME.set(norm(n), key);

export function motionKeyForName(name) {
  return BY_NAME.get(norm(name)) || null;
}
