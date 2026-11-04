import {
  Bench, Seat, Pad, Box, Landmine, PullupBar, line, FLOOR, C, vec, add, angleOf,
} from "../../components/motion/rig.jsx";
import { deadlift } from "./base.jsx";

// Movimientos del grupo: back. Formato en src/components/motion/rig.jsx.
const STAND = { t: -90, th: 90, sh: 90 };
const unit = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
const mid2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

// ─── Jalones (sentado, polea alta) ───────────────────────────────────────────
function pulldownSeated(o = {}) {
  const behind = !!o.behind;
  return {
    anchor: "hip", at: [92, 112], prop: [o.prop || "bar", "wrist"], hl: ["back", "arm"], cable: { at: [o.towerX ?? 124, 6] },
    a: { t: -92, ua: -80, fa: -80, th: -12, sh: 88 },
    b: behind
      ? { t: -100, ua: 108, fa: -96, th: -12, sh: 88 }
      : o.narrow
        ? { t: -106, ua: 96, fa: -38, th: -12, sh: 88 }
        : { t: -104, ua: 105, fa: -45, th: -12, sh: 88 },
    env: (j) => (<>
      <Seat x={91} y={118} w={32} />
      <rect x={102} y={92} width={30} height={7} rx={3} fill={C.gear2} transform="rotate(-12 102 92)" />
      {line(add(j.hip, [14, 14]), [add(j.hip, [14, 14])[0], FLOOR], 3, C.gear)}
    </>),
  };
}
// Brazos extendidos de pie, polea alta (pulldown recto)
function straightArmPulldown() {
  return {
    anchor: "foot", at: [92, 138], prop: ["bar", "wrist"], hl: ["back", "arm"], cable: { at: [150, 8] },
    a: { t: -72, th: 72, sh: 98, ua: -50, fa: -50 },
    b: { t: -62, th: 72, sh: 98, ua: 84, fa: 84 },
  };
}

// ─── Pullover acostado ───────────────────────────────────────────────────────
function pulloverDb() {
  return {
    anchor: "hip", at: [126, 106], prop: ["db", "wrist"], hl: ["back", "arm"],
    a: { t: 180, ua: -90, fa: -92, th: 15, sh: 85 },
    b: { t: 180, ua: 166, fa: 160, th: 15, sh: 85 },
    env: () => <Bench x0={64} x1={148} />,
  };
}
function pulloverCable() {
  return {
    anchor: "hip", at: [126, 106], prop: ["bar", "wrist"], hl: ["back", "arm"], cable: { at: [18, 128] },
    a: { t: 180, ua: 166, fa: 164, th: 15, sh: 85 },
    b: { t: 180, ua: -84, fa: -88, th: 15, sh: 85 },
    env: () => <Bench x0={64} x1={148} />,
  };
}

// ─── Remos sentados en polea baja ────────────────────────────────────────────
function seatedCableRow(o = {}) {
  return {
    anchor: "hip", at: [100, 114], prop: [o.prop || "bar", "wrist"], hl: ["back", "arm"], cable: { at: [o.towerX ?? 192, o.towerY ?? 118] },
    a: { t: -76, ua: 22, fa: 18, th: -6, sh: 16 },
    b: o.chest
      ? { t: -96, ua: 168, fa: 8, th: -6, sh: 16 }
      : { t: -96, ua: 128, fa: -4, th: -6, sh: 16 },
    env: () => (<>
      <Seat x={99} y={121} w={34} />
      <Box x0={148} x1={172} y={123} />
    </>),
  };
}
// Remo unilateral en polea (de pie, polea media)
function singleArmCableRow() {
  return {
    anchor: "foot", at: [88, 138], prop: ["bar", "wrist"], hl: ["back", "arm"], cable: { at: [182, 76] },
    a: { t: -72, th: 76, sh: 98, ua: 12, fa: 8, ua2: 78, fa2: 78 },
    b: { t: -80, th: 76, sh: 98, ua: 140, fa: 4, ua2: 78, fa2: 78 },
  };
}

// ─── Remos en máquina con apoyo de pecho ─────────────────────────────────────
function machineRow(o = {}) {
  const pivot = [176, o.pivotY ?? 112];
  return {
    anchor: "hip", at: [98, 114], prop: ["bar", "wrist"], hl: ["back", "arm"],
    a: { t: -90, ua: o.a, fa: o.a, th: -6, sh: 16 },
    b: { t: -94, ua: o.b, fa: o.bf ?? -4, th: -6, sh: 16 },
    env: (j) => (<>
      <Seat x={97} y={121} w={34} />
      <Pad x={j.shoulder[0] + 9} y={o.padY ?? 82} w={9} h={o.padH ?? 32} />
      <Box x0={148} x1={172} y={123} />
      {line(j.wrist, pivot, 4.5, C.gear)}
      <circle cx={pivot[0]} cy={pivot[1]} r={4} fill={C.gear2} />
      {line([pivot[0], pivot[1]], [pivot[0], FLOOR], 5, C.gear)}
    </>),
  };
}

// ─── Remo inclinado (barra / mancuernas) ─────────────────────────────────────
function bentRow(o = {}) {
  const t = o.t ?? -40;
  return {
    anchor: "foot", at: [92, 138], prop: [o.prop || "barbell", "wrist"], hl: ["back", "arm"],
    a: { t, th: 74, sh: 96, ua: 92, fa: 90 },
    b: { t: t - 2, th: 74, sh: 96, ua: o.ub ?? 136, fa: o.fb ?? 70 },
  };
}
function pendlayRow() {
  return {
    anchor: "foot", at: [90, 138], prop: ["barbell", "wrist"], hl: ["back", "arm"],
    a: { t: -8, th: 50, sh: 102, ua: 84, fa: 88 },
    b: { t: -8, th: 50, sh: 102, ua: 132, fa: 78 },
  };
}
// Remo a una mano con rodilla y mano en banco
function oneArmBenchRow(o = {}) {
  return {
    anchor: "foot", at: [86, 138], prop: ["db", "wrist"], hl: ["back", "arm"],
    a: { t: -12, th: 70, sh: 98, ua: 90, fa: 90, th2: 90, sh2: 180, ua2: 90, fa2: 90 },
    b: o.kroc
      ? { t: -24, th: 70, sh: 98, ua: 168, fa: 84, th2: 90, sh2: 180, ua2: 90, fa2: 90 }
      : { t: -14, th: 70, sh: 98, ua: 176, fa: 88, th2: 90, sh2: 180, ua2: 90, fa2: 90 },
    env: () => <Bench x0={44} x1={128} y={118} />,
  };
}
// Remo a una mano de pie con la otra mano apoyada en el muslo
function oneArmStandingRow() {
  return {
    anchor: "foot", at: [88, 138], prop: ["db", "wrist"], hl: ["back", "arm"],
    a: { t: -25, th: 68, sh: 98, ua: 90, fa: 90, ua2: 133, fa2: 133 },
    b: { t: -25, th: 68, sh: 98, ua: 172, fa: 88, ua2: 133, fa2: 133 },
  };
}
function rowRotation() {
  return {
    anchor: "foot", at: [88, 138], prop: ["db", "wrist"], hl: ["back", "arm"],
    a: { t: -30, th: 68, sh: 98, ua: 90, fa: 90, ua2: 90, fa2: 90 },
    b: { t: -56, th: 68, sh: 98, ua: 168, fa: 86, ua2: -40, fa2: -40 },
  };
}
// Remo en banco inclinado, pecho apoyado
function chestSupportedRow() {
  const t = -45;
  return {
    anchor: "foot", at: [58, 138], prop: ["db", "wrist"], hl: ["back", "arm"],
    a: { t, th: 118, sh: 116, ua: 90, fa: 90 },
    b: { t, th: 118, sh: 116, ua: 166, fa: 84 },
    env: (j) => {
      const nrm = vec(t + 90, 8);
      const s = add(j.hip, nrm), e = add(add(j.shoulder, vec(t, 10)), nrm);
      return (<>
        {line(s, e, 9, C.gear2)}
        {line(add(e, [0, 4]), [e[0] + 4, FLOOR], 5, C.gear)}
        {line(add(s, [2, 4]), [s[0] + 2, FLOOR], 5, C.gear)}
      </>);
    },
  };
}
// Remo en T con landmine
function tBarRow() {
  const base = [176, 136];
  return {
    anchor: "foot", at: [84, 138], prop: ["none"], hl: ["back", "arm"],
    a: { t: -40, th: 56, sh: 100, ua: 96, fa: 94 },
    b: { t: -42, th: 56, sh: 100, ua: 136, fa: 72 },
    extra: [[176, 130]],
    env: (j) => {
      const u = unit(base, j.wrist);
      const tip = add(j.wrist, [u[0] * 12, u[1] * 12]);
      return <Landmine base={base} tip={tip} />;
    },
  };
}
// Remo invertido bajo una barra (rack o Smith)
function invertedRow(o = {}) {
  // Pies fijos en el piso (talones apoyados): el cuerpo gira rígido sobre los talones y las muñecas quedan en la barra.
  const W = [120, 84];
  const def = {
    anchor: "foot", at: [44, 138], prop: ["bar", "wrist"], hl: ["back", "arm"], smith: o.smith,
    a: { t: -12.5, th: 167.5, sh: 167.5, ua: -95.5, fa: -116.6 },
    b: { t: -27, th: 153, sh: 153, ua: -163.5, fa: -28.5 },
    extra: [[120, 20]],
  };
  if (!o.smith) {
    def.env = () => (<>
      {line([W[0] + 12, W[1]], [W[0] + 12, FLOOR], 4, C.gear)}
      {line([W[0] - 4, W[1]], [W[0] + 12, W[1]], 4, C.gear2)}
      <rect x={W[0] + 4} y={FLOOR - 4} width={20} height={4} rx={2} fill={C.gear} />
    </>);
  }
  return def;
}

// ─── Dominadas (perfil, colgado de la barra) ─────────────────────────────────
function pullup(o = {}) {
  const at = [100, 12];
  return {
    anchor: "wrist", at, prop: o.weighted ? ["plate", "hips"] : ["none"], hl: ["back", "arm"],
    a: { t: -90, ua: -90, fa: -90, th: 88, sh: 132 },
    b: o.knees
      ? { t: -100, ua: 70, fa: -105, th: 10, sh: 96 }
      : { t: -100, ua: 70, fa: -105, th: 88, sh: 132 },
    extra: [[100, 0]],
    env: () => <PullupBar x={at[0]} y={at[1]} w={50} />,
  };
}

// Dominadas de frente: el cuerpo queda fijo y la barra baja hacia el pecho (movimiento relativo), para distinguir los agarres
function pullupGrip(grip, weighted) {
  const G = {
    wide: { a: { la: -115.6, lf: -115.6, ra: -64.4, rf: -64.4 }, b: { la: 130, lf: -100, ra: 50, rf: -80 }, x: 24 },
    supine: { a: { la: -90, lf: -90, ra: -90, rf: -90 }, b: { la: 95, lf: -85, ra: 85, rf: -95 }, x: 8 },
    neutral: { a: { la: -99.3, lf: -99.3, ra: -80.7, rf: -80.7 }, b: { la: 110, lf: -92, ra: 70, rf: -88 }, x: 14 },
  }[grip];
  const legs = { lt: 92, ls: 90, rt: 88, rs: 90, lean: 0 };
  return {
    view: "front", anchor: "hip", at: [100, 76], prop: ["none"], hl: ["back", "arm"],
    a: { ...legs, ...G.a }, b: { ...legs, ...G.b },
    extra: [[100, 4]],
    env: (j) => {
      const y = (j.lw[1] + j.rw[1]) / 2, cx = j.sc[0];
      return (<>
        {grip === "neutral" ? (<>
          {line([cx - 22, y - 14], [cx + 22, y - 14], 4.2, C.gear2)}
          {line([cx - G.x - 1, y - 14], [cx - G.x - 1, y + 3], 3.6, C.plateEdge)}
          {line([cx + G.x + 1, y - 14], [cx + G.x + 1, y + 3], 3.6, C.plateEdge)}
        </>) : line([cx - G.x - 10, y - 1], [cx + G.x + 10, y - 1], 4, C.plateEdge)}
        {weighted && <g>{line([j.hip[0] + 6, j.hip[1]], [j.hip[0] + 16, j.hip[1] + 12], 1.6, C.plateEdge)}<circle cx={j.hip[0] + 16} cy={j.hip[1] + 20} r={8} fill="none" stroke={C.plate} strokeWidth={3} /></g>}
      </>);
    },
  };
}

// ─── Espalda baja ────────────────────────────────────────────────────────────
function backExtensionMachine() {
  return {
    anchor: "hip", at: [100, 108], prop: ["none"], hl: ["back"],
    a: { t: -42, ua: 62, fa: -150, th: -5, sh: 85 },
    b: { t: -102, ua: 62, fa: -150, th: -5, sh: 85 },
    env: (j) => {
      const ang = angleOf(j.hip, j.shoulder) - 90;
      const p0 = add(mid2(j.hip, j.shoulder, 0.1), vec(ang, 10));
      const p1 = add(mid2(j.hip, j.shoulder, 0.5), vec(ang, 10));
      return (<>
        <Seat x={99} y={114} w={34} />
        {line(p0, p1, 8, C.gear2)}
        <rect x={112} y={94} width={28} height={6} rx={3} fill={C.gear2} />
        {line([146, 100], [146, FLOOR], 4, C.gear)}
      </>);
    },
  };
}

function hyperextension() {
  const hip = [110, 88];
  return {
    anchor: "hip", at: hip, prop: ["none"], hl: ["back", "glute"],
    a: { t: 60, ua: 75, fa: 255, th: 135, sh: 135, ua2: 75, fa2: 255 },
    b: { t: -45, ua: -30, fa: 150, th: 135, sh: 135, ua2: -30, fa2: 150 },
    extra: [[60, 130], [150, 40]],
    env: () => {
      const c = add(hip, vec(45, 9));
      const s = add(c, vec(135, 16)), e = add(c, vec(-45, 6));
      const ank = add(hip, vec(135, 54));
      const roll = add(ank, vec(-135, 6));
      return (<>
        {line(s, e, 9, C.gear2)}
        {line(add(c, [0, 5]), [c[0] + 2, FLOOR], 5, C.gear)}
        {line(add(s, [0, 4]), [s[0] - 4, FLOOR], 5, C.gear)}
        {line(add(roll, vec(-45, 7)), add(roll, vec(135, 7)), 7, C.gear2)}
        {line(add(ank, vec(45, 4)), [ank[0] + 4, FLOOR], 4, C.gear)}
      </>);
    },
  };
}
function goodMorning(o = {}) {
  if (o.smith) {
    // Smith: la barra solo sube y baja; la cadera viaja atrás con las rodillas semiflexionadas (bent-knee good morning)
    return {
      anchor: "foot", at: [100, 138], prop: ["barbell", "shoulder"], hl: ["back", "glute"], smith: true,
      a: { t: -92, th: 80, sh: 100, ua: 125, fa: -35 },
      b: { t: -52, th: 50, sh: 106, ua: 125, fa: -35 },
    };
  }
  return {
    anchor: "foot", at: [100, 138], prop: ["barbell", "shoulder"], hl: ["back", "glute"], smith: o.smith,
    a: { ...STAND, ua: 125, fa: -35 },
    b: { t: -22, th: 76, sh: 94, ua: 125, fa: -35 },
  };
}
function superman() {
  return {
    anchor: "hip", at: [100, 135], prop: ["none"], hl: ["back", "glute"],
    a: { t: 0, ua: 0, fa: 0, th: 180, sh: 180, ua2: 0, fa2: 0 },
    b: { t: -16, ua: -22, fa: -22, th: 194, sh: 196, ua2: -22, fa2: -22 },
  };
}
function cableSpinalCurl() {
  return {
    anchor: "foot", at: [92, 138], prop: ["rope", "wrist"], hl: ["back"], cable: { at: [178, 130] },
    a: { t: -22, th: 62, sh: 100, ua: 70, fa: 64 },
    b: { t: -92, th: 90, sh: 90, ua: 96, fa: 90 },
  };
}

// ─── Deadlift y derivados ────────────────────────────────────────────────────
function deficitDeadlift() {
  // De pie sobre una plataforma baja (~2 pulgadas): la barra arranca desde el piso a la misma altura que un peso muerto normal, o sea mas abajo respecto de los pies.
  return {
    anchor: "foot", at: [96, 133], prop: ["barbell", "wrist"], hl: ["back", "glute"],
    a: { t: -46, th: 22, sh: 100, ua: 92, fa: 92 },
    b: { ...STAND, ua: 92, fa: 92 },
    env: () => <Box x0={64} x1={130} y={137} />,
  };
}
function rackPull() {
  const post = (x) => line([x, 100], [x, FLOOR], 4, C.gear);
  return {
    anchor: "foot", at: [96, 138], prop: ["barbell", "wrist"], hl: ["back", "glute"],
    a: { t: -62, th: 72, sh: 94, ua: 90, fa: 90 },
    b: { ...STAND, ua: 92, fa: 92 },
    env: () => (<>
      {post(78)}{post(116)}
      {line([76, 108], [120, 108], 3, C.gear2)}
    </>),
  };
}
function deadliftThen(kind) {
  const base = deadlift();
  return {
    ...base,
    hl: kind === "shrug" ? ["back"] : ["back", "arm"],
    b: kind === "row" ? { ...STAND, ua: 130, fa: 64 } : { ...STAND, ua: 92, fa: 92 },
  };
}

// ─── Encogimientos (vista de frente) ─────────────────────────────────────────
function shrugFront(o = {}) {
  const hands = o.prop === "db";
  const arrow = (p) => (<g stroke={C.accent} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.9}>
    <path d={`M${p[0] - 4},${p[1] - 12} l4,-5 l4,5`} /><path d={`M${p[0] - 4},${p[1] - 19} l4,-5 l4,5`} opacity={0.5} />
  </g>);
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: hands ? ["db", "both"] : ["none"], hl: ["traps"], smith: o.smith,
    a: { lt: 94, ls: 92, rt: 86, rs: 88, la: 94, lf: 90, ra: 86, rf: 90, lean: 0 },
    b: { lt: 94, ls: 92, rt: 86, rs: 88, la: 100, lf: 80, ra: 80, rf: 100, lean: 0 },
    env: (j) => (<>
      {!hands && (<>
        {line(add(j.lw, [-16, 0]), add(j.rw, [16, 0]), 3.2, C.plateEdge)}
        <rect x={j.lw[0] - 21} y={j.lw[1] - 10} width={5} height={20} rx={2} fill={C.plate} stroke={C.plateEdge} strokeWidth={1} />
        <rect x={j.rw[0] + 16} y={j.rw[1] - 10} width={5} height={20} rx={2} fill={C.plate} stroke={C.plateEdge} strokeWidth={1} />
      </>)}
      {arrow(add(j.sl, [-7, 4]))}{arrow(add(j.sr, [7, 4]))}
    </>),
  };
}

// ─── Otros ───────────────────────────────────────────────────────────────────
function bandPullApart() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["back"],
    a: { lt: 94, ls: 92, rt: 86, rs: 88, la: 135, lf: 15, ra: 45, rf: 165, lean: 0 },
    b: { lt: 94, ls: 92, rt: 86, rs: 88, la: 180, lf: 180, ra: 0, rf: 0, lean: 0 },
    env: (j) => (<>
      {line(j.lw, j.rw, 1.8, C.cable)}
      <circle cx={j.lw[0]} cy={j.lw[1]} r={3.4} fill={C.cable} /><circle cx={j.rw[0]} cy={j.rw[1]} r={3.4} fill={C.cable} />
    </>),
  };
}
function manMaker() {
  return {
    anchor: "toe", at: [64, 141], prop: ["db", "wrist"], hl: ["back", "arm"],
    a: { t: -14, th: 168, sh: 166, ft: 72, ua: 90, fa: 90 },
    b: { ...STAND, ua: -90, fa: -90 },
  };
}
function kettlebellFlow() {
  return {
    anchor: "foot", at: [92, 138], prop: ["kb", "wrist"], hl: ["back", "glute"],
    a: { t: -36, th: 60, sh: 100, ua: 78, fa: 76 },
    b: { ...STAND, ua: 2, fa: 2 },
  };
}
function tireFlip() {
  return {
    anchor: "foot", at: [92, 138], prop: ["none"], hl: ["back", "glute"],
    a: { t: -42, th: 36, sh: 106, ua: 70, fa: 62 },
    b: { t: -80, th: 80, sh: 92, ua: -18, fa: -30 },
    env: (j) => {
      const c = add(j.wrist, [12, -10]);
      return (<>
        <circle cx={c[0]} cy={c[1]} r={19} fill="none" stroke={C.gear} strokeWidth={9} />
        <circle cx={c[0]} cy={c[1]} r={19} fill="none" stroke={C.gear2} strokeWidth={1.2} />
      </>);
    },
  };
}

export const ENTRIES = {
  "Pullover con mancuerna": pulloverDb(),
  "Pullover en polea": pulloverCable(),
  "Jalón al pecho con barra": pulldownSeated(),
  "Jalón con agarre estrecho": pulldownSeated({ narrow: true }),
  "Jalón neutro": pulldownSeated({ narrow: true }),
  "Jalón en polea": pulldownSeated(),
  "Pulldown con agarre supino": pulldownSeated({ narrow: true }),
  "Jalón trasnuca": pulldownSeated({ behind: true, towerX: 94 }),
  "Remo en polea baja": seatedCableRow(),
  "Remo en polea con barra": seatedCableRow({ prop: "barbell" }),
  "Remo al pecho con polea": seatedCableRow({ chest: true, towerY: 84 }),
  "Remo unilateral en polea": singleArmCableRow(),
  "Remo con barra": bentRow(),
  "Remo con agarre supino": bentRow({ t: -52, ub: 124, fb: 78 }),
  "Remo Yates": bentRow({ t: -62, ub: 124, fb: 78 }),
  "Remo pendlay": pendlayRow(),
  "Remo con mancuerna": oneArmStandingRow(),
  "Remo con mancuerna en banco": oneArmBenchRow(),
  "Kroc row": oneArmBenchRow({ kroc: true }),
  "Remo con mancuerna + rotación": rowRotation(),
  "Remo en banco inclinado": chestSupportedRow(),
  "Remo en máquina": machineRow({ a: 8, b: 172, bf: 4 }),
  "Remo alto en máquina": machineRow({ a: 2, b: 176, bf: 2, padY: 84, padH: 30 }),
  "Remo bajo en máquina": machineRow({ a: 34, b: 120, bf: 24, padY: 90, padH: 26, pivotY: 126 }),
  "Remo en T": tBarRow(),
  "Remo invertido con barra": invertedRow(),
  "Remo invertido en Smith": invertedRow({ smith: true }),
  "Dominadas pronadas": pullupGrip("wide"),
  "Dominadas supinas": pullupGrip("supine"),
  "Dominadas neutras": pullupGrip("neutral"),
  "Dominadas pronadas con lastre": pullupGrip("wide", true),
  "Dominadas supinas con lastre": pullupGrip("supine", true),
  "Dominada con rodillas al pecho": pullup({ knees: true }),
  "Pulldown con brazos extendidos": straightArmPulldown(),
  "Extensiones de espalda": backExtensionMachine(),
  "Hiperextensiones": hyperextension(),
  "Buenos días": goodMorning(),
  "Good morning en Smith": goodMorning({ smith: true }),
  "Superman": superman(),
  "Curl de columna en polea": cableSpinalCurl(),
  "Encogimientos con barra": shrugFront(),
  "Encogimientos con mancuernas": shrugFront({ prop: "db" }),
  "Shrug en Smith": shrugFront({ smith: true }),
  "Separación de hombros con banda": bandPullApart(),
  "Peso muerto": deadlift(),
  "Peso muerto con déficit": deficitDeadlift(),
  "Peso muerto parcial en rack": rackPull(),
  "Rack pull": rackPull(),
  "Peso muerto + remo": deadliftThen("row"),
  "Peso muerto + encogimiento de hombros": deadliftThen("shrug"),
  "Man maker": manMaker(),
  "Kettlebell flow": kettlebellFlow(),
  "Tire flip": tireFlip(),
};
