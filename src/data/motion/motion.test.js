import { describe, it, expect } from "vitest";
import { EXERCISE_DATABASE } from "../exerciseDatabase.js";
import { motionForName } from "./index.js";
import { solve, solveFront, solveProjected, mixPose, frame, availableViews } from "../../components/motion/rig.jsx";

const POSE_SIDE = ["t", "ua", "fa", "th", "sh"];
const POSE_FRONT = ["lt", "ls", "rt", "rs", "la", "lf", "ra", "rf"];

function problems(name, def, front) {
  const bad = [];
  const need = front ? POSE_FRONT : POSE_SIDE;
  for (const pose of [def.a, def.b]) {
    if (!pose || need.some((k) => !Number.isFinite(pose[k]))) { bad.push(name + ": pose incompleta"); continue; }
    const mid = mixPose(def.a, def.b, 0.5);
    const j = front ? solveFront(def, mid) : solve(def, mid);
    if (Object.values(j).some((p) => !p.every(Number.isFinite))) bad.push(name + ": coordenadas no finitas");
    if (!front) {
      const q = solveProjected(def, mid);
      if (q.points.some((p) => !p.every(Number.isFinite))) bad.push(name + ": proyección no finita");
    }
  }
  if (!def.at || !["hip", "foot", "toe", "wrist"].includes(def.anchor)) bad.push(name + ": falta anchor/at");
  if (!frame(def, front ? undefined : "proj").every(Number.isFinite)) bad.push(name + ": encuadre inválido");
  return bad;
}

describe("movimientos del muñeco", () => {
  it("cada movimiento definido tiene poses válidas y se puede dibujar", () => {
    const bad = [];
    for (const e of EXERCISE_DATABASE) {
      const def = motionForName(e.name);
      if (!def) continue;
      bad.push(...problems(e.name, def, def.view === "front"));
      if (def.alt) bad.push(...problems(e.name + " (alt perfil)", def.alt, false));
    }
    expect(bad).toEqual([]);
  });

  it("los 298 ejercicios tienen movimiento", () => {
    const missing = EXERCISE_DATABASE.filter((e) => !motionForName(e.name)).map((e) => e.name);
    expect(missing).toEqual([]);
  });

  it("todos tienen vista de perfil y de frente", () => {
    const missing = EXERCISE_DATABASE.filter((e) => {
      const v = availableViews(motionForName(e.name));
      return !(v.includes("side") && v.includes("front"));
    }).map((e) => e.name);
    expect(missing).toEqual([]);
  });
});
