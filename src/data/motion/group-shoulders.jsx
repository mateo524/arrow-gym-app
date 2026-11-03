import { Bench, Seat, Pad, Landmine, line, FLOOR, C, add } from "../../components/motion/rig.jsx";
import { overheadPress } from "./base.jsx";

// Movimientos del grupo: hombros. Formato en src/components/motion/rig.jsx.

const STAND = { t: -90, th: 90, sh: 90 };
const SEATED = { t: -93, th: -4, sh: 85 };
const SEAT_AT = [104, 108];
const seatedEnv = () => (<><Seat x={103} y={114} w={34} /><Pad x={76} y={60} w={9} h={54} /></>);
const plate = (p, r = 6) => (<g><circle cx={p[0]} cy={p[1]} r={r} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} /><circle cx={p[0]} cy={p[1]} r={Math.min(2, r / 2)} fill={C.plateEdge} /></g>);
// barra vista de frente (de mano a mano, con discos en las puntas)
const barFront = (j) => {
  const a = [j.lw[0] - 11, j.lw[1]], b = [j.rw[0] + 11, j.rw[1]];
  return (<>{line(a, b, 2.6, C.plateEdge)}<ellipse cx={a[0] - 1} cy={a[1]} rx={2.6} ry={7} fill={C.plate} stroke={C.plateEdge} strokeWidth={1} /><ellipse cx={b[0] + 1} cy={b[1]} rx={2.6} ry={7} fill={C.plate} stroke={C.plateEdge} strokeWidth={1} /></>);
};

// ─── Presses ────────────────────────────────────────────────────────────────
function seatedPress(o = {}) {
  return {
    anchor: "hip", at: SEAT_AT, prop: [o.prop || "db", "wrist"], hl: ["shoulder", "arm"],
    a: { ...SEATED, ua: o.ua ?? 75, fa: o.fa ?? -85 },
    b: { ...SEATED, ua: -90, fa: -90 },
    env: seatedEnv,
  };
}
const arnold = () => seatedPress({ ua: 48, fa: -112 });

function shoulderMachine() {
  return {
    anchor: "hip", at: SEAT_AT, prop: ["bar", "wrist"], hl: ["shoulder", "arm"],
    a: { ...SEATED, ua: 72, fa: -82 },
    b: { ...SEATED, ua: -86, fa: -92 },
    env: (j) => {
      const pv = [j.hip[0] + 50, 78];
      return (<>
        <Seat x={103} y={114} w={34} /><Pad x={76} y={60} w={9} h={54} />
        <rect x={pv[0] - 4} y={pv[1]} width={8} height={FLOOR - pv[1]} rx={3} fill={C.gear} />
        {line(pv, j.wrist, 4.4, C.gear2)}
        <circle cx={pv[0]} cy={pv[1]} r={4} fill={C.plateEdge} />
      </>);
    },
  };
}

function landminePress() {
  return {
    anchor: "foot", at: [84, 138], prop: ["none", "wrist"], hl: ["shoulder", "arm"],
    a: { t: -82, th: 90, sh: 90, ua: 62, fa: -62, ua2: 90, fa2: 90 },
    b: { t: -82, th: 90, sh: 90, ua: -42, fa: -50, ua2: 90, fa2: 90 },
    extra: [[190, 138]],
    env: (j) => <Landmine base={[196, 138]} tip={add(j.wrist, [3, -1])} />,
  };
}

function behindNeck(o = {}) {
  const seated = o.seated;
  const base = seated ? SEATED : STAND;
  return {
    anchor: seated ? "hip" : "foot", at: seated ? SEAT_AT : [100, 138],
    prop: [o.prop || "barbell", "wrist"], hl: ["shoulder", "arm"], smith: o.smith,
    a: { ...base, ua: 112, fa: -90 },
    b: { ...base, ua: -98, fa: -92 },
    env: seated ? seatedEnv : undefined,
  };
}

function pushPress() {
  return {
    anchor: "foot", at: [100, 138], prop: ["barbell", "wrist"], hl: ["shoulder", "arm"],
    a: { t: -84, th: 58, sh: 108, ua: 68, fa: -82 },
    b: { ...STAND, ua: -90, fa: -90 },
  };
}

function bradford() {
  return {
    anchor: "foot", at: [100, 138], prop: ["barbell", "wrist"], hl: ["shoulder", "arm"],
    a: { ...STAND, ua: 55, fa: -95 },
    b: { ...STAND, ua: 115, fa: -92 },
  };
}

// ─── Olímpicos / kettlebell ─────────────────────────────────────────────────
const FLOOR_PULL = { t: -32, th: 44, sh: 100, ua: 92, fa: 92 };
function cleanPress(prop = "barbell") {
  return {
    anchor: "foot", at: [96, 138], prop: [prop, "wrist"], hl: ["shoulder", "arm"],
    a: { ...FLOOR_PULL },
    b: { ...STAND, ua: -92, fa: -90 },
  };
}
function cleanJerk() {
  return {
    anchor: "foot", at: [100, 138], prop: ["barbell", "wrist"], hl: ["shoulder", "arm"],
    a: { ...FLOOR_PULL },
    b: { t: -90, th: 64, sh: 98, th2: 112, sh2: 80, ua: -92, fa: -90 },
  };
}
function snatch() {
  return {
    anchor: "foot", at: [96, 138], prop: ["barbell", "wrist"], hl: ["shoulder", "back"],
    a: { ...FLOOR_PULL },
    b: { t: -72, th: 10, sh: 106, ua: -100, fa: -92 },
  };
}
function kbCleanPress() {
  return {
    anchor: "foot", at: [96, 138], prop: ["kb", "wrist"], hl: ["shoulder", "arm"],
    a: { ...FLOOR_PULL, ua2: 90, fa2: 90 },
    b: { ...STAND, ua: -92, fa: -90, ua2: 90, fa2: 90 },
  };
}
function kbSwingPress() {
  return {
    anchor: "foot", at: [96, 138], prop: ["kb", "wrist"], hl: ["shoulder", "arm"],
    a: { t: -34, th: 46, sh: 100, ua: 118, fa: 124, ua2: 118, fa2: 124 },
    b: { ...STAND, ua: -92, fa: -90, ua2: 90, fa2: 90 },
  };
}
function turkishGetUp() {
  return {
    anchor: "foot", at: [140, 135], prop: ["kb", "wrist"], hl: ["shoulder", "core"],
    a: { t: -180, th: -50, sh: 100, ua: -90, fa: -90, ua2: 15, fa2: 15 },
    b: { ...STAND, ua: -90, fa: -90, ua2: 90, fa2: 90 },
  };
}
function overheadCarry() {
  return {
    anchor: "hip", at: [100, 84], prop: ["db", "wrist"], hl: ["shoulder", "arm"],
    a: { t: -90, th: 72, sh: 88, th2: 106, sh2: 96, ua: -92, fa: -90 },
    b: { t: -90, th: 106, sh: 96, th2: 72, sh2: 88, ua: -92, fa: -90 },
  };
}

// ─── Elevaciones frontales (perfil) ─────────────────────────────────────────
function frontRaise(prop) {
  return {
    anchor: "foot", at: [100, 138], prop: [prop, "wrist"], hl: ["shoulder"],
    a: { ...STAND, ua: 84, fa: 86 },
    b: { ...STAND, ua: -12, fa: -8 },
  };
}

// ─── Elevaciones laterales (frente) ─────────────────────────────────────────
const FRONT_STAND = { lt: 96, ls: 90, rt: 84, rs: 90, lean: 0 };
function lateralRaise(o = {}) {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: o.db === false ? ["none"] : ["db", "both"], hl: ["shoulder"],
    a: { ...FRONT_STAND, la: 100, lf: 97, ra: 80, rf: 83 },
    b: { ...FRONT_STAND, la: 177, lf: 166, ra: 3, rf: 14 },
    env: o.env,
  };
}
function lateralBand() {
  return lateralRaise({
    db: false,
    env: (j) => (<>
      {line([j.la[0] - 2, 140], [j.ra[0] + 2, 140], 2.4, "#f59e0b")}
      {line([j.la[0] - 2, 140], j.lw, 1.6, "#f59e0b")}
      {line([j.ra[0] + 2, 140], j.rw, 1.6, "#f59e0b")}
      {line(j.lw, add(j.lw, [-3, 4]), 3.2, "#f59e0b")}{line(j.rw, add(j.rw, [3, 4]), 3.2, "#f59e0b")}
    </>),
  });
}
function lateralCableSingle() {
  return {
    view: "front", anchor: "foot", at: [86, 138], prop: ["none"], hl: ["shoulder"], cable: { at: [160, 130], to: "lw" },
    a: { ...FRONT_STAND, la: 100, lf: 100, ra: 80, rf: 82 },
    b: { ...FRONT_STAND, la: 177, lf: 166, ra: 80, rf: 82 },
    env: (j) => plate(j.lw, 3.6),
  };
}
function lateralMachine() {
  return {
    view: "front", anchor: "hip", at: [100, 98], prop: ["none"], hl: ["shoulder"],
    a: { lt: 140, ls: 90, rt: 40, rs: 90, la: 104, lf: 100, ra: 76, rf: 80 },
    b: { lt: 140, ls: 90, rt: 40, rs: 90, la: 176, lf: 170, ra: 4, rf: 10 },
    env: (j) => {
      const sh = j.sc[1];
      return (<>
        <rect x={j.hip[0] - 17} y={j.hip[1] + 6} width={34} height={7} rx={3} fill={C.gear2} />
        {line([j.hip[0], j.hip[1] + 13], [j.hip[0], FLOOR], 5, C.gear)}
        <rect x={j.hip[0] - 12} y={sh - 8} width={24} height={48} rx={5} fill={C.gear2} />
        <rect x={j.hip[0] - 44} y={sh - 12} width={7} height={FLOOR - sh + 12} rx={3} fill={C.gear} />
        <rect x={j.hip[0] + 37} y={sh - 12} width={7} height={FLOOR - sh + 12} rx={3} fill={C.gear} />
        {line([j.hip[0] - 41, sh], j.le, 4.2, C.gear2)}
        {line([j.hip[0] + 41, sh], j.re, 4.2, C.gear2)}
        {line(j.le, j.lw, 6.2, C.plateEdge)}{line(j.re, j.rw, 6.2, C.plateEdge)}
      </>);
    },
  };
}
function lateralLeaning() {
  return {
    view: "front", anchor: "foot", at: [110, 138], prop: ["none"], hl: ["shoulder"],
    a: { lt: 98, ls: 90, rt: 80, rs: 90, lean: -14, la: 150, lf: 130, ra: 78, rf: 82 },
    b: { lt: 98, ls: 90, rt: 80, rs: 90, lean: -14, la: 150, lf: 130, ra: -12, rf: 0 },
    env: (j) => (<>
      {line([j.lw[0] - 3, 142], [j.lw[0] - 3, 28], 5, C.gear2)}
      <rect x={j.lw[0] - 12} y={138} width={18} height={4} rx={2} fill={C.gear} />
      {plate(j.rw)}
    </>),
  };
}
function lateralLying() {
  return {
    view: "front", anchor: "hip", at: [112, 104], prop: ["none"], hl: ["shoulder"],
    a: { lt: 180, ls: 180, rt: 180, rs: 180, lean: 90, la: 30, lf: -20, ra: 180, rf: 180 },
    b: { lt: 180, ls: 180, rt: 180, rs: 180, lean: 90, la: 30, lf: -20, ra: 270, rf: 270 },
    env: (j) => (<>
      <Bench x0={50} x1={178} />
      {plate(j.rw)}
    </>),
  };
}

// ─── Posteriores (pájaros) ──────────────────────────────────────────────────
function rearRaiseBent(o = {}) {
  // Vista de frente: la abduccion horizontal se ve mejor abriendo los brazos (torso inclinado no representable de frente)
  const seated = o.seated;
  const a = { ...FRONT_STAND, la: 104, lf: 112, ra: 76, rf: 68 };
  const b = { ...FRONT_STAND, la: 182, lf: 174, ra: -2, rf: 6 };
  if (!seated) return { view: "front", anchor: "foot", at: [100, 138], prop: ["db", "both"], hl: ["shoulder", "back"], a, b };
  const S = { lt: 140, ls: 90, rt: 40, rs: 90, lean: 0 };
  return {
    view: "front", anchor: "hip", at: [100, 98], prop: ["db", "both"], hl: ["shoulder", "back"],
    a: { ...S, la: 104, lf: 112, ra: 76, rf: 68 }, b: { ...S, la: 182, lf: 174, ra: -2, rf: 6 },
    env: (j) => <Bench x0={j.hip[0] - 24} x1={j.hip[0] + 24} y={j.hip[1] + 6} />,
  };
}
function rearMachine() {
  return {
    view: "front", anchor: "hip", at: [100, 98], prop: ["none"], hl: ["shoulder", "back"],
    a: { lt: 140, ls: 90, rt: 40, rs: 90, la: 162, lf: 20, ra: 18, rf: 160 },
    b: { lt: 140, ls: 90, rt: 40, rs: 90, la: 184, lf: 176, ra: -4, rf: 4 },
    env: (j) => {
      const sh = j.sc[1], px = j.sc[0];
      return (<>
        <rect x={j.hip[0] - 17} y={j.hip[1] + 6} width={34} height={7} rx={3} fill={C.gear2} />
        {line([j.hip[0], j.hip[1] + 13], [j.hip[0], FLOOR], 5, C.gear)}
        <rect x={px - 12} y={sh - 6} width={24} height={44} rx={5} fill={C.gear2} />
        <rect x={px - 4} y={sh + 38} width={8} height={FLOOR - sh - 38} rx={3} fill={C.gear} />
        {line([px - 3, sh + 6], j.lw, 4.4, C.gear2)}{line([px + 3, sh + 6], j.rw, 4.4, C.gear2)}
        {plate(j.lw, 3.6)}{plate(j.rw, 3.6)}
      </>);
    },
  };
}
function rearCable() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["shoulder", "back"],
    cable: [{ at: [30, 8], to: "rw" }, { at: [170, 8], to: "lw" }],
    a: { ...FRONT_STAND, la: 160, lf: 20, ra: 20, rf: 160 },
    b: { ...FRONT_STAND, la: 184, lf: 176, ra: -4, rf: 4 },
    env: (j) => (<>{plate(j.lw, 3.4)}{plate(j.rw, 3.4)}</>),
  };
}
function facePull() {
  return {
    anchor: "foot", at: [84, 138], prop: ["rope", "wrist"], hl: ["shoulder", "back"], cable: { at: [176, 50] },
    a: { ...STAND, ua: 0, fa: 0 },
    b: { ...STAND, ua: 158, fa: -34 },
  };
}

// ─── Manguito rotador ───────────────────────────────────────────────────────
function externalRotation() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["shoulder"], cable: { at: [20, 70], to: "rw" },
    a: { ...FRONT_STAND, la: 92, lf: 92, ra: 90, rf: 180 },
    b: { ...FRONT_STAND, la: 92, lf: 92, ra: 90, rf: 20 },
    env: (j) => plate(j.rw, 3.4),
  };
}
function internalRotation() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["shoulder"], cable: { at: [180, 70], to: "rw" },
    a: { ...FRONT_STAND, la: 92, lf: 92, ra: 90, rf: 20 },
    b: { ...FRONT_STAND, la: 92, lf: 92, ra: 90, rf: 180 },
    env: (j) => plate(j.rw, 3.4),
  };
}
function cubanPress() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["db", "both"], hl: ["shoulder"],
    a: { ...FRONT_STAND, la: 175, lf: 95, ra: 5, rf: 85 },
    b: { ...FRONT_STAND, la: 250, lf: 280, ra: -70, rf: -100 },
  };
}
function wRaise() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["db", "both"], hl: ["shoulder", "back"],
    a: { ...FRONT_STAND, la: 104, lf: 80, ra: 76, rf: 100 },
    b: { ...FRONT_STAND, la: 196, lf: 250, ra: -16, rf: -70 },
  };
}

// ─── Trapecio ───────────────────────────────────────────────────────────────
function uprightRow() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["traps", "shoulder"],
    a: { ...FRONT_STAND, la: 100, lf: 68, ra: 80, rf: 112 },
    b: { ...FRONT_STAND, la: 165, lf: 40, ra: 15, rf: 140 },
    env: barFront,
  };
}
function cableShrug() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["traps"],
    cable: [{ at: [40, 130], to: "lw" }, { at: [160, 130], to: "rw" }],
    a: { ...FRONT_STAND, la: 94, lf: 94, ra: 86, rf: 86 },
    b: { ...FRONT_STAND, la: 97, lf: 78, ra: 83, rf: 102 },
    env: (j) => (<>{plate(j.lw, 3.4)}{plate(j.rw, 3.4)}</>),
  };
}

export const ENTRIES = {
  "Press militar con barra": overheadPress(),
  "Press con mancuernas": overheadPress({ prop: "db" }),
  "Overhead press en Smith": overheadPress({ smith: true }),
  "Press militar en Smith": overheadPress({ smith: true }),
  "Press Arnold": arnold(),
  "Press en máquina de hombros": shoulderMachine(),
  "Landmine press": landminePress(),
  "Elevaciones laterales con mancuernas": lateralRaise(),
  "Elevaciones laterales en polea": lateralCableSingle(),
  "Elevaciones laterales en máquina": lateralMachine(),
  "Elevaciones frontales con mancuernas": frontRaise("db"),
  "Elevaciones frontales con barra": frontRaise("barbell"),
  "Elevaciones posteriores con mancuernas": rearRaiseBent(),
  "Elevaciones posteriores en polea": rearCable(),
  "Face pull": facePull(),
  "Pájaros con mancuernas": rearRaiseBent({ seated: true }),
  "Rotación externa en polea": externalRotation(),
  "Rotación interna en polea": internalRotation(),
  "Remo al mentón con barra": uprightRow(),
  "Cuban press": cubanPress(),
  "Press trasnuca": behindNeck(),
  "Push press": pushPress(),
  "Elevaciones laterales inclinadas": lateralLeaning(),
  "Elevaciones laterales con banda": lateralBand(),
  "Pájaros en máquina": rearMachine(),
  "Elevación en W": wRaise(),
  "Bradford press": bradford(),
  "Lateral raise unilateral en polea": lateralCableSingle(),
  "Clean and press": cleanPress(),
  "Clean and press con barra": cleanPress(),
  "Clean and press con mancuernas": cleanPress("db"),
  "Clean and jerk": cleanJerk(),
  "Snatch con barra": snatch(),
  "Kettlebell clean and press": kbCleanPress(),
  "Turkish get-up": turkishGetUp(),
  "Swing to press con kettlebell": kbSwingPress(),
  "Overhead carry": overheadCarry(),
  "Press de hombros con mancuernas sentado": seatedPress(),
  "Elevación lateral acostado": lateralLying(),
  "Encogimiento de hombros en polea": cableShrug(),
  "Press trasnuca con mancuernas": behindNeck({ seated: true, prop: "db" }),
  "Press trasnuca en Smith": behindNeck({ seated: true, smith: true }),
};
