import { Bench, InclinePad, Seat, Pad, DipBars, Box, line, FLOOR, C, vec, add, angleOf, solve, UA, FA, T, TH, SH } from "../../components/motion/rig.jsx";
import { benchPress } from "./base.jsx";

// Movimientos del grupo: Pecho. Formato en src/components/motion/rig.jsx.

const STAND = { t: -90, th: 90, sh: 90 };
const deg = (r) => (r * 180) / Math.PI;
const rd = (d) => (d * Math.PI) / 180;

/** IK de brazo de dos segmentos: devuelve [ua, fa] con el codo hacia atras (menor x). */
function ik(s, w) {
  const D = Math.min(Math.hypot(w[0] - s[0], w[1] - s[1]), UA + FA - 0.01);
  const base = angleOf(s, w);
  const A = deg(Math.acos((UA * UA + D * D - FA * FA) / (2 * UA * D)));
  const c = [base + A, base - A].map((ua) => {
    const e = add(s, vec(ua, UA));
    return { ua, fa: angleOf(e, w), x: e[0] };
  });
  const best = c[0].x < c[1].x ? c[0] : c[1];
  return [best.ua, best.fa];
}

// ─── Press de banca declinado (barra / Smith) ────────────────────────────────
function declinePress(o = {}) {
  return {
    anchor: "hip", at: [126, 98], prop: [o.prop || "barbell", "wrist"], hl: ["chest", "arm"], smith: o.smith,
    a: { t: 165, ua: 94, fa: -90, th: 0, sh: 90 },
    b: { t: 165, ua: -90, fa: -90, th: 0, sh: 90 },
    env: (j) => (<>
      <InclinePad j={j} ext={10} />
      <rect x={j.knee[0] + 3} y={j.knee[1] - 4} width={7} height={22} rx={3} fill={C.gear} />
      <rect x={j.ankle[0] - 9} y={j.ankle[1] - 6} width={7} height={22} rx={3} fill={C.gear} />
    </>),
  };
}

// ─── Aperturas con mancuernas (perfil: brazos casi rectos, arco de abajo hacia arriba) ─────
function dbFly(angle) {
  if (angle === 0) {
    return {
      anchor: "hip", at: [126, 106], prop: ["db", "wrist"], hl: ["chest", "arm"],
      a: { t: 180, ua: 98, fa: 82, th: 15, sh: 85 },
      b: { t: 180, ua: -90, fa: -84, th: 15, sh: 85 },
      env: () => <Bench x0={64} x1={148} />,
    };
  }
  const t = -(180 - angle);
  return {
    anchor: "hip", at: [128, 106], prop: ["db", "wrist"], hl: ["chest", "shoulder"],
    a: { t, ua: 100, fa: 88, th: 15, sh: 85 },
    b: { t, ua: -84, fa: -78, th: 15, sh: 85 },
    env: (j) => <InclinePad j={j} ext={12} />,
  };
}

// ─── Cruces en polea (de frente, dos poleas) ────────────────────────────────
function crossover(y, a, b, unilateral = false) {
  const cables = unilateral
    ? { at: [22, y], to: "lw" }
    : [{ at: [22, y], to: "lw" }, { at: [178, y], to: "rw" }];
  const mirror = (p) => ({ ra: 180 - p.la, rf: 180 - p.lf });
  const leg = { lt: 96, ls: 96, rt: 84, rs: 84 };
  const mk = (p, hang) => ({ ...leg, ...p, ...(unilateral ? { ra: 98, rf: 92 } : mirror(p)) , ...(hang || {}) });
  return {
    view: "front", anchor: "foot", at: [100, 138], hl: ["chest"], prop: ["none"], cable: cables,
    a: mk(a), b: mk(b),
  };
}
const crossHigh = () => crossover(8, { la: -155, lf: -165 }, { la: 65, lf: 80 });
const crossMid = () => crossover(70, { la: 165, lf: 165 }, { la: 30, lf: 50 });
const crossLow = () => crossover(130, { la: 135, lf: 120 }, { la: -10, lf: -40 });
const crossUni = () => crossover(70, { la: 168, lf: 168 }, { la: 30, lf: 50 }, true);

// ─── Pec deck / mariposa (de frente, sentado) ───────────────────────────────
function pecDeck(handles = false) {
  const leg = { lt: 105, ls: 90, rt: 75, rs: 90 };
  return {
    view: "front", anchor: "hip", at: [100, 89], hl: ["chest"], prop: ["none"],
    a: handles ? { ...leg, la: 172, lf: 200, ra: 8, rf: -20 } : { ...leg, la: 170, lf: -100, ra: 10, rf: -80 },
    b: handles ? { ...leg, la: 52, lf: 80, ra: 128, rf: 100 } : { ...leg, la: 55, lf: -100, ra: 125, rf: -80 },
    env: (j) => (<>
      <rect x={95} y={14} width={10} height={FLOOR - 14} rx={3} fill={C.gear} />
      <rect x={86} y={j.hip[1] - 46} width={28} height={50} rx={6} fill={C.gear2} />
      <rect x={83} y={j.hip[1] + 5} width={34} height={7} rx={3} fill={C.gear2} />
      {line([j.hip[0], j.hip[1] + 12], [j.hip[0], FLOOR], 5, C.gear)}
      {!handles && line(j.le, [97, 18], 3, C.gear)}
      {!handles && line(j.re, [103, 18], 3, C.gear)}
      {handles
        ? <>{line(j.lw, [97, 18], 3, C.gear)}{line(j.rw, [103, 18], 3, C.gear)}{line(j.lw, add(j.lw, [0, -10]), 4, C.gear2)}{line(j.rw, add(j.rw, [0, -10]), 4, C.gear2)}</>
        : <>{line(j.le, j.lw, 9, C.gear2)}{line(j.re, j.rw, 9, C.gear2)}</>}
    </>),
  };
}

// ─── Flexiones y variantes (muñeca fija en el piso o apoyo elevado, pies fijos) ───────────
function pushup({ wy = 139, ay = 138, drop = 21, wx = 140, row = false, handBox = 0, footBox = 0, prop = null }) {
  const L = T + TH + SH;
  const w = [wx, wy];
  const s1 = [wx + 3, wy - 36.5];
  const al1 = deg(Math.asin((ay - s1[1]) / L));
  const ax = s1[0] - L * Math.cos(rd(al1));
  const s2y = s1[1] + drop;
  const al2 = deg(Math.asin(Math.max(-1, Math.min(1, (ay - s2y) / L))));
  const s2 = [ax + L * Math.cos(rd(al2)), s2y];
  const [ua1, fa1] = ik(s1, w), [ua2, fa2] = ik(s2, w);
  const a = { t: -al1, th: 180 - al1, sh: 180 - al1, ft: 0, ua: ua1, fa: fa1 };
  const b = { t: -al2, th: 180 - al2, sh: 180 - al2, ft: 0, ua: ua2, fa: fa2 };
  if (row) { a.ua2 = ua1; a.fa2 = fa1; b.ua2 = 168; b.fa2 = 96; }
  return {
    anchor: "wrist", at: w, hl: ["chest", "arm"], prop: prop ? [prop, "wrist"] : ["none"],
    a, b,
    env: (j) => (<>
      {handBox > 0 && <Box x0={wx - 14} x1={wx + 12} y={wy + 4} />}
      {footBox > 0 && <Box x0={ax - 18} x1={ax + 8} y={ay + 5} />}
      {row && <circle cx={j.wrist2[0] - 2} cy={j.wrist2[1]} r={6} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} />}
    </>),
  };
}
const pushFloor = () => pushup({});
const pushHandsInc = (h) => pushup({ wy: 139 - h, drop: 17, handBox: h });
const pushFeetUp = () => pushup({ ay: 96, drop: 21, footBox: 1 });

// ─── Fondos ─────────────────────────────────────────────────────────────────
function dips(assisted = false) {
  const wx = 110, wy = 66, w = [wx, wy];
  const s1 = [wx, wy - 36.5];
  const s2 = [wx - 8, wy - 20];
  const [u1, f1] = ik(s1, w), [u2, f2] = ik(s2, w);
  const legs = assisted ? { th: 84, sh: 172 } : { th: 98, sh: 138 };
  return {
    anchor: "wrist", at: w, hl: ["chest", "arm"], prop: ["none"],
    a: { t: -76, ua: u1, fa: f1, ...legs },
    b: { t: -56, ua: u2, fa: f2, ...legs },
    env: (j) => (<>
      <DipBars x={wx} y={wy} w={40} />
      {assisted && (<>
        <rect x={j.knee[0] - 12} y={j.knee[1] + 4} width={30} height={7} rx={3} fill={C.gear2} />
        {line([j.knee[0] + 16, j.knee[1] + 11], [j.knee[0] + 16, FLOOR], 5, C.gear)}
        <rect x={wx + 30} y={30} width={10} height={FLOOR - 30} rx={3} fill={C.gear} />
      </>)}
    </>),
  };
}

// ─── Floor press (en el piso, sin banco) ────────────────────────────────────
function floorPress(prop) {
  return {
    anchor: "hip", at: [126, 134], prop: [prop, "wrist"], hl: ["chest", "arm"],
    a: { t: 180, ua: 160, fa: -85, th: -58, sh: 80 },
    b: { t: 180, ua: -90, fa: -90, th: -58, sh: 80 },
  };
}

// ─── Pin press (barra apoyada en pines del rack, arranque desde parada) ─────
function pinPress() {
  const def = {
    anchor: "hip", at: [126, 106], prop: ["barbell", "wrist"], hl: ["chest", "arm"],
    a: { t: 180, ua: 62, fa: -95, th: 15, sh: 85 },
    b: { t: 180, ua: -90, fa: -90, th: 15, sh: 85 },
  };
  const wa = solve(def, def.a).wrist;
  def.env = () => (<>
    <Bench x0={64} x1={148} />
    {line([wa[0] + 14, 20], [wa[0] + 14, FLOOR], 5, C.gear)}
    {line([wa[0] + 14, wa[1] + 8], [wa[0] - 1, wa[1] + 8], 4, C.plateEdge)}
  </>);
  return def;
}

// ─── Press neutro con mancuernas (banco plano, codos algo cerrados) ─────────
function neutralPress() {
  return {
    anchor: "hip", at: [126, 106], prop: ["none"], hl: ["chest", "arm"],
    a: { t: 180, ua: 72, fa: -92, th: 15, sh: 85 },
    b: { t: 180, ua: -90, fa: -90, th: 15, sh: 85 },
    // agarre neutro: la mancuerna se ve de lado (eje paralelo al cuerpo, palmas enfrentadas)
    env: (j) => (<>
      <Bench x0={64} x1={148} />
      {[j.wrist2, j.wrist].map((w, i) => (<g key={i}>
        {line([w[0] - 7, w[1]], [w[0] + 7, w[1]], 3.5, C.gear2)}
        <rect x={w[0] - 11} y={w[1] - 6} width={5} height={12} rx={1.5} fill={C.plate} stroke={C.plateEdge} strokeWidth={1} />
        <rect x={w[0] + 6} y={w[1] - 6} width={5} height={12} rx={1.5} fill={C.plate} stroke={C.plateEdge} strokeWidth={1} />
      </g>))}
    </>),
  };
}

// ─── Aperturas en TRX (cuerpo inclinado, correas desde arriba) ──────────────
function trxFly() {
  return {
    anchor: "foot", at: [56, 138], prop: ["bar", "wrist"], hl: ["chest", "arm"],
    cable: { at: [50, 8], tower: false },
    a: { t: -65, th: 115, sh: 115, ua: 78, fa: 70 },
    b: { t: -65, th: 115, sh: 115, ua: 28, fa: 22 },
    env: () => <circle cx={50} cy={8} r={4} fill={C.gear2} stroke={C.cable} strokeWidth={1.4} />,
  };
}

// ─── Burpee con press (desde el piso con mancuernas hasta arriba) ───────────
function burpeePress() {
  return {
    // fase 1: plancha / flexion con las mancuernas en el piso; fase 2: de pie con press por encima de la cabeza
    anchor: "foot", at: [96, 138], prop: ["db", "wrist"], hl: ["chest", "arm", "shoulder"],
    a: { t: -28, th: 152, sh: 152, ua: 90, fa: 90 },
    b: { ...STAND, ua: -90, fa: -90 },
  };
}

// ─── Press Svend (disco apretado contra el pecho, extender al frente) ───────
function svend() {
  return {
    anchor: "foot", at: [100, 138], prop: ["plate", "wrist"], hl: ["chest", "arm"],
    a: { ...STAND, ua: 86, fa: -22 },
    b: { ...STAND, ua: -2, fa: -2 },
  };
}

// ─── Press inclinado en máquina (respaldo inclinado, empuje hacia arriba-adelante) ─────
function inclineMachine() {
  return {
    anchor: "hip", at: [100, 108], prop: ["bar", "wrist"], hl: ["chest", "shoulder"],
    a: { t: -115, ua: 150, fa: -8, th: -4, sh: 85 },
    b: { t: -115, ua: -32, fa: -28, th: -4, sh: 85 },
    env: (j) => (<>
      <InclinePad j={j} ext={8} />
      <rect x={142} y={96} width={18} height={FLOOR - 96} rx={4} fill={C.gear} />
      {line(j.wrist, [151, 118], 5, C.gear)}
    </>),
  };
}

export const ENTRIES = {
  "Press de banca declinado": declinePress(),
  "Press declinado en Smith": declinePress({ smith: true }),
  "Aperturas planas con mancuernas": dbFly(0),
  "Aperturas inclinadas con mancuernas": dbFly(35),
  "Cruces en polea alta": crossHigh(),
  "Cruces en polea baja": crossLow(),
  "Cruces en polea media": crossMid(),
  "Cruces en polea con cable": crossMid(),
  "Apertura en polea unilateral": crossUni(),
  "Fondos en paralelas": dips(false),
  "Fondos asistidos": dips(true),
  "Flexiones": pushFloor(),
  "Flexiones inclinadas": pushHandsInc(34),
  "Flexiones con manos elevadas": pushHandsInc(48),
  "Flexiones con pies elevados": pushFeetUp(),
  "Mariposa en máquina": pecDeck(false),
  "Aperturas en máquina (mariposa)": pecDeck(true),
  "Pin press": pinPress(),
  "Floor press con barra": floorPress("barbell"),
  "Floor press con mancuernas": floorPress("db"),
  "Aperturas en TRX": trxFly(),
  "Burpee con press": burpeePress(),
  "Push-up a remo con mancuernas": pushup({ wy: 133, drop: 0, row: true, prop: "db" }),
  "Press neutro con mancuernas": neutralPress(),
  "Press Svend": svend(),
  "Press inclinado en máquina": inclineMachine(),
};
