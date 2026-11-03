import { describe, it, expect } from "vitest";
import { EXERCISE_DATABASE } from "../exerciseDatabase.js";
import { motionForName } from "./index.js";
import { solve, solveFront, mixPose, frame } from "../../components/motion/rig.jsx";

const POSE_SIDE = ["t", "ua", "fa", "th", "sh"];
const POSE_FRONT = ["lt", "ls", "rt", "rs", "la", "lf", "ra", "rf"];

describe("movimientos del muñeco", () => {
  it("cada movimiento definido tiene poses válidas y se puede dibujar", () => {
    const bad = [];
    for (const e of EXERCISE_DATABASE) {
      const def = motionForName(e.name);
      if (!def) continue;
      const front = def.view === "front";
      const need = front ? POSE_FRONT : POSE_SIDE;
      for (const pose of [def.a, def.b]) {
        if (!pose || need.some((k) => !Number.isFinite(pose[k]))) { bad.push(e.name + ": pose incompleta"); continue; }
        const j = front ? solveFront(def, mixPose(def.a, def.b, 0.5)) : solve(def, mixPose(def.a, def.b, 0.5));
        if (Object.values(j).some((p) => !p.every(Number.isFinite))) bad.push(e.name + ": coordenadas no finitas");
      }
      if (!def.at || !["hip", "foot", "toe", "wrist"].includes(def.anchor)) bad.push(e.name + ": falta anchor/at");
      if (!frame(def).every(Number.isFinite)) bad.push(e.name + ": encuadre inválido");
    }
    expect(bad).toEqual([]);
  });

  // Se exige cobertura total con MOTION_COVERAGE=1 (o cuando todos los grupos estén terminados).
  const enforce = true;
  (enforce ? it : it.skip)("los 302 ejercicios tienen movimiento", () => {
    const missing = EXERCISE_DATABASE.filter((e) => !motionForName(e.name)).map((e) => e.name);
    expect(missing).toEqual([]);
  });
});
