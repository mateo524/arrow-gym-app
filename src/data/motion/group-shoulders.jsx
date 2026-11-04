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
// Press Arnold de frente (sentado): arranca con los codos adelante, juntos, antebrazos verticales y palmas hacia vos;
// al subir los codos se abren hacia los costados (las palmas giran hacia adelante) y termina con los brazos arriba.
const arnold = () => ({
  alt: {
    anchor: "hip", at: SEAT_AT, prop: ["db", "wrist"], hl: ["shoulder", "arm"],
    a: { ...SEATED, ua: 38, fa: -96 },
    b: { ...SEATED, ua: -88, fa: -90 },
    env: seatedEnv,
  },
  view: "front", anchor: "hip", at: [100, 98], prop: ["db", "both"], hl: ["shoulder", "arm"],
  a: { lt: 140, ls: 90, rt: 40, rs: 90, la: 75, lf: 290, ra: 105, rf: -110 },
  b: { lt: 140, ls: 90, rt: 40, rs: 90, la: 262, lf: 265, ra: -82, rf: -85 },
  env: (j) => (<>
    <rect x={j.hip[0] - 17} y={j.hip[1] + 6} width={34} height={7} rx={3} fill={C.gear2} />
    {line([j.hip[0], j.hip[1] + 13], [j.hip[0], FLOOR], 5, C.gear)}
    <rect x={j.hip[0] - 12} y={j.sc[1] - 8} width={24} height={48} rx={5} fill={C.gear2} opacity={0.7} />
  </>),
});

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
    a: { t: -86, th: 68, sh: 104, ua: 68, fa: -82 },
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
const SIDE_LAT = { t: -85, th: 90, sh: 90 };
function lateralRaise(o = {}) {
  return {
    // perfil: el brazo sube por el costado (plano escapular, algo adelante) visto de lado
    alt: {
      anchor: "foot", at: [100, 138], prop: o.db === false ? ["none"] : ["db", "wrist"], hl: ["shoulder"],
      a: { ...SIDE_LAT, ua: 92, fa: 98 },
      b: { ...SIDE_LAT, ua: -22, fa: -8 },
      env: o.altEnv,
    },
    view: "front", anchor: "foot", at: [100, 138], prop: o.db === false ? ["none"] : ["db", "both"], hl: ["shoulder"],
    a: { ...FRONT_STAND, la: 100, lf: 97, ra: 80, rf: 83 },
    b: { ...FRONT_STAND, la: 177, lf: 166, ra: 3, rf: 14 },
    env: o.env,
  };
}
function lateralBand() {
  return lateralRaise({
    db: false,
    altEnv: (j) => (<>
      {line([98, 140], j.wrist, 1.6, "#f59e0b")}
      {line([98, 140], [112, 140], 2.4, "#f59e0b")}
    </>),
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
    alt: {
      anchor: "foot", at: [96, 138], prop: ["none"], hl: ["shoulder"], cable: { at: [140, 130] },
      a: { ...SIDE_LAT, ua: 92, fa: 96 },
      b: { ...SIDE_LAT, ua: -22, fa: -8 },
      env: (j) => plate(j.wrist, 3.6),
    },
    view: "front", anchor: "foot", at: [86, 138], prop: ["none"], hl: ["shoulder"], cable: { at: [160, 130], to: "lw" },
    a: { ...FRONT_STAND, la: 100, lf: 100, ra: 80, rf: 82 },
    b: { ...FRONT_STAND, la: 177, lf: 166, ra: 80, rf: 82 },
    env: (j) => plate(j.lw, 3.6),
  };
}
function lateralMachine() {
  return {
    alt: {
      anchor: "hip", at: SEAT_AT, prop: ["none"], hl: ["shoulder"],
      a: { ...SEATED, ua: 88, fa: 92 },
      b: { ...SEATED, ua: -22, fa: -12 },
      env: (j) => (<>
        <Seat x={103} y={114} w={34} /><Pad x={76} y={60} w={9} h={54} />
        <circle cx={j.shoulder[0] + 2} cy={j.shoulder[1]} r={4} fill={C.plateEdge} />
        {line(j.elbow, j.wrist, 7, C.plateEdge)}
      </>),
    },
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
  const L = { t: -80, th: 92, sh: 90 };
  return {
    alt: {
      anchor: "foot", at: [100, 138], prop: ["none"], hl: ["shoulder"],
      a: { ...L, ua: 92, fa: 98, ua2: 22, fa2: -18 },
      b: { ...L, ua: -22, fa: -8, ua2: 22, fa2: -18 },
      env: (j) => (<>
        {line([j.wrist2[0], 142], [j.wrist2[0], 28], 5, C.gear2)}
        <rect x={j.wrist2[0] - 9} y={138} width={18} height={4} rx={2} fill={C.gear} />
        {plate(j.wrist, 6)}
      </>),
    },
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
  const Ly = { t: 0, th: 178, sh: 180 };
  return {
    // perfil: acostado de lado, el brazo sube desde la cadera hasta vertical (se ve en el plano de la pantalla)
    alt: {
      anchor: "hip", at: [112, 104], prop: ["none"], hl: ["shoulder"],
      a: { ...Ly, ua: 178, fa: 178 },
      b: { ...Ly, ua: -90, fa: -90 },
      env: (j) => (<>
        <Bench x0={50} x1={178} />
        {plate(j.wrist, 5)}
      </>),
    },
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
  // De perfil con el torso inclinado hacia adelante (bisagra de cadera): se distingue de la lateral (de frente).
  // Los brazos suben hacia los costados (plano frontal): de perfil se ven acortados, por eso la amplitud angular es corta.
  const seated = o.seated;
  if (!seated) {
    const H = { t: -38, th: 100, sh: 78 };
    return {
      anchor: "foot", at: [96, 138], prop: ["db", "wrist"], hl: ["shoulder", "back"],
      a: { ...H, ua: 90, fa: 90 },
      b: { ...H, ua: 58, fa: 52 },
    };
  }
  const S = { t: -36, th: 6, sh: 90 };
  return {
    anchor: "hip", at: [96, 112], prop: ["db", "wrist"], hl: ["shoulder", "back"],
    a: { ...S, ua: 90, fa: 90 }, b: { ...S, ua: 58, fa: 52 },
    env: (j) => <Bench x0={j.hip[0] - 22} x1={j.hip[0] + 24} y={j.hip[1] + 6} />,
  };
}
function rearMachine() {
  const R = { t: -80, th: -4, sh: 85 };
  return {
    // perfil: sentado de frente al respaldo (pecho apoyado); los brazos van de adelante hacia los costados/atras
    alt: {
      anchor: "hip", at: [92, 108], prop: ["none"], hl: ["shoulder", "back"],
      a: { ...R, ua: 2, fa: 0 },
      b: { ...R, ua: 150, fa: 160 },
      env: (j) => (<>
        <Seat x={92} y={114} w={34} />
        <rect x={j.shoulder[0] + 6} y={j.shoulder[1] - 6} width={9} height={52} rx={4} fill={C.gear2} />
        <rect x={j.shoulder[0] + 24} y={j.shoulder[1] + 40} width={8} height={FLOOR - j.shoulder[1] - 40} rx={3} fill={C.gear} />
        {line([j.shoulder[0] + 24, j.shoulder[1] + 4], j.wrist, 4.4, C.gear2)}
        {plate(j.wrist, 3.6)}
      </>),
    },
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
  const Hn = { t: -86, th: 90, sh: 90 };
  return {
    alt: {
      anchor: "foot", at: [92, 138], prop: ["none"], hl: ["shoulder", "back"], cable: { at: [170, 8] },
      a: { ...Hn, ua: -12, fa: -18 },
      b: { ...Hn, ua: 160, fa: 168 },
      env: (j) => plate(j.wrist, 3.4),
    },
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
  const rot = (fa) => ({ ...STAND, ua: 90, fa });
  return {
    // perfil: codo pegado al costado a 90 grados; el antebrazo gira hacia afuera (visto de lado, acortado)
    alt: {
      anchor: "foot", at: [100, 138], prop: ["none"], hl: ["shoulder"], cable: { at: [60, 92] },
      a: rot(18), b: rot(-24),
      env: (j) => plate(j.wrist, 3.4),
    },
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["shoulder"], cable: { at: [20, 70], to: "rw" },
    a: { ...FRONT_STAND, la: 92, lf: 92, ra: 90, rf: 180 },
    b: { ...FRONT_STAND, la: 92, lf: 92, ra: 90, rf: 20 },
    env: (j) => plate(j.rw, 3.4),
  };
}
function internalRotation() {
  const rot = (fa) => ({ ...STAND, ua: 90, fa });
  return {
    alt: {
      anchor: "foot", at: [100, 138], prop: ["none"], hl: ["shoulder"], cable: { at: [60, 92] },
      a: rot(-24), b: rot(18),
      env: (j) => plate(j.wrist, 3.4),
    },
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["shoulder"], cable: { at: [180, 70], to: "rw" },
    a: { ...FRONT_STAND, la: 92, lf: 92, ra: 90, rf: 20 },
    b: { ...FRONT_STAND, la: 92, lf: 92, ra: 90, rf: 180 },
    env: (j) => plate(j.rw, 3.4),
  };
}
function cubanPress() {
  return {
    alt: {
      anchor: "foot", at: [100, 138], prop: ["db", "wrist"], hl: ["shoulder"],
      a: { ...STAND, ua: 12, fa: 100 },
      b: { ...STAND, ua: -90, fa: -90 },
    },
    view: "front", anchor: "foot", at: [100, 138], prop: ["db", "both"], hl: ["shoulder"],
    a: { ...FRONT_STAND, la: 175, lf: 95, ra: 5, rf: 85 },
    b: { ...FRONT_STAND, la: 250, lf: 280, ra: -70, rf: -100 },
  };
}
function wRaise() {
  // Inclinado hacia adelante, codos flexionados a ~90 grados que se llevan atras/arriba juntando las escapulas (W).
  const H = { t: -38, th: 100, sh: 78 };
  return {
    anchor: "foot", at: [96, 138], prop: ["db", "wrist"], hl: ["shoulder", "back"],
    a: { ...H, ua: 92, fa: 50 },
    b: { ...H, ua: 142, fa: 100 },
  };
}

// ─── Trapecio ───────────────────────────────────────────────────────────────
function uprightRow() {
  return {
    alt: {
      anchor: "foot", at: [100, 138], prop: ["barbell", "wrist"], hl: ["traps", "shoulder"],
      a: { ...STAND, ua: 86, fa: 88 },
      b: { ...STAND, ua: -22, fa: 118 },
    },
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["traps", "shoulder"],
    a: { ...FRONT_STAND, la: 100, lf: 68, ra: 80, rf: 112 },
    b: { ...FRONT_STAND, la: 165, lf: 40, ra: 15, rf: 140 },
    env: barFront,
  };
}
function cableShrug() {
  return {
    alt: {
      anchor: "foot", at: [96, 138], prop: ["none"], hl: ["traps"], cable: { at: [140, 130] },
      a: { ...STAND, ua: 92, fa: 92 },
      b: { ...STAND, ua: 100, fa: 98 },
      env: (j) => {
        const arrow = (p) => (<g stroke={C.accent} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.9}>
          <path d={`M${p[0] - 4},${p[1] - 12} l4,-5 l4,5`} /><path d={`M${p[0] - 4},${p[1] - 19} l4,-5 l4,5`} opacity={0.5} />
        </g>);
        return (<>{plate(j.wrist, 3.4)}{arrow(add(j.shoulder, [0, 4]))}</>);
      },
    },
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["traps"],
    cable: [{ at: [40, 130], to: "lw" }, { at: [160, 130], to: "rw" }],
    a: { ...FRONT_STAND, la: 94, lf: 94, ra: 86, rf: 86 },
    b: { ...FRONT_STAND, la: 97, lf: 78, ra: 83, rf: 102 },
    // el hombro no sube en el rig: flechas sobre los hombros indican el ascenso (brazos rectos, la polea tira hacia abajo)
    env: (j) => {
      const arrow = (p) => (<g stroke={C.accent} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.9}>
        <path d={`M${p[0] - 4},${p[1] - 12} l4,-5 l4,5`} /><path d={`M${p[0] - 4},${p[1] - 19} l4,-5 l4,5`} opacity={0.5} />
      </g>);
      return (<>{plate(j.lw, 3.4)}{plate(j.rw, 3.4)}{arrow(add(j.sl, [-7, 4]))}{arrow(add(j.sr, [7, 4]))}</>);
    },
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
