import { Bench, InclinePad, Box, line, solve, FLOOR, C, vec, add, angleOf, TH, SH, UA, FA } from "../../components/motion/rig.jsx";

// Movimientos del grupo: legs2 (Piernas, posiciones 39-78). Formato en src/components/motion/rig.jsx.

const STAND = { t: -90, th: 90, sh: 90 };
const BAND = "#f472b6";
const rad2deg = (r) => (r * 180) / Math.PI;

/** Cinemática inversa de 2 segmentos: ángulos (th2, sh2) para llevar el tobillo de `hip` a `target`. s = lado de la rodilla. */
function legTo(hip, target, s = -1) {
  const dx = target[0] - hip[0], dy = target[1] - hip[1];
  const d = Math.min(Math.hypot(dx, dy), TH + SH - 0.01);
  const a = Math.atan2(dy, dx);
  const al = Math.acos((TH * TH + d * d - SH * SH) / (2 * TH * d));
  const th = a + s * al;
  const sh = Math.atan2(dy - Math.sin(th) * TH, dx - Math.cos(th) * TH);
  return { th2: rad2deg(th), sh2: rad2deg(sh) };
}
/** Completa la pierna lejana de una pose para que su tobillo llegue a `target` (la cadera sale de la pierna cercana). */
function withRear(anchorDef, pose, target, s = -1) {
  const hip = solve(anchorDef, pose).hip;
  return { ...pose, ...legTo(hip, target, s) };
}

const band = (p, q, w = 2.6) => line(p, q, w, BAND);

// ─── Pantorrillas ────────────────────────────────────────────────────────────
function calfRaiseSingle() {
  return {
    anchor: "toe", at: [104, 118], hl: ["calf"],
    a: { t: -90, th: 90, sh: 90, ft: -26, ua: 100, fa: 100, th2: 78, sh2: 150 },
    b: { t: -90, th: 90, sh: 90, ft: 58, ua: 100, fa: 100, th2: 78, sh2: 150 },
    env: () => <Box x0={90} x1={124} y={118} />,
  };
}
function calfRaiseSmith() {
  return {
    anchor: "toe", at: [104, 118], prop: ["barbell", "shoulder"], smith: true, hl: ["calf"],
    a: { t: -90, th: 90, sh: 90, ft: -24, ua: 125, fa: -35 },
    b: { t: -90, th: 90, sh: 90, ft: 56, ua: 125, fa: -35 },
    env: () => <Box x0={90} x1={124} y={118} />,
  };
}
function calfDonkey() {
  const def = {
    anchor: "toe", at: [96, 118], hl: ["calf"],
    a: { t: -6, th: 90, sh: 90, ft: -26, ua: 80, fa: 85 },
    b: { t: -6, th: 90, sh: 90, ft: 58, ua: 80, fa: 85 },
  };
  def.env = (j) => {
    const ja = solve(def, def.a), jb = solve(def, def.b);
    const wx = (ja.wrist[0] + jb.wrist[0]) / 2, wy = (ja.wrist[1] + jb.wrist[1]) / 2;
    const hx = j.hip[0], hy = j.hip[1];
    return (<>
      <Box x0={82} x1={124} y={118} />
      {line([wx, wy], [wx, FLOOR], 4, C.gear)}
      {line([wx - 8, wy], [wx + 6, wy], 4.4, C.gear2)}
      <rect x={hx - 9} y={hy - 17} width={12} height={9} rx={4} fill={C.gear2} />
      {line([hx - 3, hy - 17], [hx - 3, hy - 44], 3, C.gear)}
      <rect x={hx - 12} y={hy - 52} width={18} height={8} rx={2} fill={C.plate} stroke={C.plateEdge} strokeWidth={1} />
    </>);
  };
  return def;
}
function tibialRaise() {
  return {
    anchor: "foot", at: [102, 138], hl: ["calf"],
    a: { t: -102, th: 78, sh: 78, ft: 8, ua: 100, fa: 95 },
    b: { t: -102, th: 78, sh: 78, ft: -38, ua: 100, fa: 95 },
    env: () => <rect x={74} y={10} width={9} height={FLOOR - 10} rx={3} fill={C.gear2} />,
  };
}
function calfLegPress() {
  return {
    anchor: "hip", at: [70, 100], hl: ["calf"],
    a: { t: -118, th: -8, sh: 6, ft: -118, ua: 70, fa: 40 },
    b: { t: -118, th: -8, sh: 6, ft: -56, ua: 70, fa: 40 },
    env: (j) => {
      const px = j.toe[0] + 3;
      const s0 = add(j.hip, [-4.6, 5]), s1 = add(j.shoulder, [-4.6, 3]);
      return (<>
        {line(s0, s1, 9, C.gear2)}
        <rect x={j.hip[0] - 14} y={j.hip[1] + 7} width={36} height={7} rx={3} fill={C.gear2} />
        {line([j.hip[0], j.hip[1] + 14], [j.hip[0], FLOOR], 5, C.gear)}
        {line([j.hip[0] - 22, FLOOR - 2], [px + 14, FLOOR - 2], 4, C.gear)}
        <rect x={px} y={62} width={7} height={70} rx={3} fill={C.gear2} />
        {line([px + 3, 132], [px + 3, FLOOR - 2], 5, C.gear)}
      </>);
    },
  };
}

// ─── Banda (vista de frente) ─────────────────────────────────────────────────
function bandAbductor() {
  return {
    view: "front", anchor: "foot", at: [100, 138], hl: ["glute"],
    a: { lt: 90, ls: 90, rt: 90, rs: 90, la: 100, lf: 80, ra: 80, rf: 100, lean: 0 },
    b: { lt: 90, ls: 90, rt: 52, rs: 52, la: 100, lf: 80, ra: 80, rf: 100, lean: -4 },
    env: (j) => band(j.la, j.ra),
  };
}
function bandAdductor() {
  return {
    view: "front", anchor: "foot", at: [92, 138], hl: ["thigh"], extra: [[150, 100]],
    a: { lt: 90, ls: 90, rt: 60, rs: 60, la: 100, lf: 80, ra: 80, rf: 100, lean: 0 },
    b: { lt: 90, ls: 90, rt: 106, rs: 106, la: 100, lf: 80, ra: 80, rf: 100, lean: 0 },
    env: (j) => (<>
      {line([146, 96], [146, FLOOR], 5, C.gear)}
      <circle cx={146} cy={126} r={4} fill={C.gear2} />
      {band([146, 126], j.ra)}
    </>),
  };
}
function bandSideWalk() {
  return {
    view: "front", anchor: "foot", at: [92, 138], hl: ["glute", "thigh"],
    a: { lt: 120, ls: 60, rt: 60, rs: 120, la: 100, lf: 40, ra: 80, rf: 140, lean: 0 },
    b: { lt: 120, ls: 60, rt: 50, rs: 75, la: 100, lf: 40, ra: 80, rf: 140, lean: 0 },
    env: (j) => band(j.lk, j.rk, 3),
  };
}

// ─── Bisagra / isquios ───────────────────────────────────────────────────────
function goodMorning() {
  return {
    anchor: "foot", at: [96, 138], prop: ["barbell", "shoulder"], hl: ["back", "thigh"],
    a: { ...STAND, ua: 125, fa: -35 },
    b: { t: -26, th: 66, sh: 98, ua: 125, fa: -35 },
  };
}
function rdlRow() {
  return {
    anchor: "foot", at: [96, 138], prop: ["barbell", "wrist"], hl: ["back", "thigh"],
    a: { t: -34, th: 70, sh: 98, ua: 90, fa: 90 },
    b: { t: -34, th: 70, sh: 98, ua: 172, fa: 80 },
  };
}
function rdlSingle() {
  return {
    anchor: "foot", at: [100, 138], prop: ["barbell", "wrist"], hl: ["thigh", "glute"],
    a: { ...STAND, ua: 90, fa: 90, th2: 90, sh2: 90 },
    b: { t: -12, th: 76, sh: 98, ua: 90, fa: 90, th2: 168, sh2: 168 },
  };
}
function rdlSmith() {
  // Rodillas apenas flexionadas (~25 grados); la barra baja vertical pegada a los muslos (misma x que al estar de pie).
  const def = { anchor: "foot", at: [96, 138] };
  const a = { ...STAND, ua: 78, fa: 78 };
  const barX = solve(def, a).wrist[0];
  const b = { t: -28, th: 72, sh: 97, ua: 120, fa: 120 };
  const sh = solve(def, b).shoulder;
  const ang = rad2deg(Math.acos(Math.max(-1, Math.min(1, (barX - sh[0]) / (UA + FA)))));
  return {
    anchor: "foot", at: [96, 138], prop: ["barbell", "wrist"], smith: true, hl: ["thigh", "glute"],
    a, b: { ...b, ua: ang, fa: ang },
  };
}
function hexDeadlift() {
  return {
    anchor: "foot", at: [96, 138], prop: ["barbell", "wrist"], hl: ["thigh", "glute"],
    a: { t: -44, th: 38, sh: 100, ua: 92, fa: 92 },
    b: { ...STAND, ua: 92, fa: 92 },
  };
}
function nordic() {
  return {
    anchor: "foot", at: [58, 136], hl: ["thigh"],
    a: { t: -90, th: 90, sh: 180, ft: 180, ua: 75, fa: -65 },
    b: { t: -20, th: 160, sh: 180, ft: 180, ua: 60, fa: 30 },
    env: () => (<>
      <rect x={30} y={136} width={92} height={6} rx={3} fill={C.gear2} />
      {line([44, 112], [44, FLOOR], 4, C.gear)}
      {line([44, 126], [58, 126], 4, C.gear)}
      <rect x={52} y={124} width={11} height={6} rx={3} fill={C.gear2} />
    </>),
  };
}

// ─── Sentadilla y variantes ──────────────────────────────────────────────────
const SQUAT_B = { t: -64, th: 14, sh: 106 };
function pistol() {
  return {
    anchor: "foot", at: [96, 138], hl: ["thigh", "glute"],
    a: { ...STAND, ua: 0, fa: 0, th2: 6, sh2: 6 },
    b: { t: -52, th: 6, sh: 124, ua: 0, fa: 0, th2: 8, sh2: 8 },
  };
}
function jumpGeneric(o = {}) {
  return {
    anchor: "toe", at: [98, 138], prop: o.prop, hl: ["thigh", "glute"],
    a: { t: -58, th: 20, sh: 106, ft: 0, ua: o.armsA ?? 115, fa: o.armsA ?? 110 },
    b: { t: -90, th: 90, sh: 90, ft: 55, ua: o.armsB ?? -60, fa: o.armsB ?? -60 },
    env: o.env,
  };
}
const jumpSquat = () => jumpGeneric();
const boxJump = () => jumpGeneric({
  prop: ["db", "wrist"], armsA: 100, armsB: 100,
  env: () => <Box x0={128} x1={176} y={100} />,
});
function kbSwing() {
  return {
    anchor: "foot", at: [96, 138], prop: ["kb", "wrist"], hl: ["glute", "thigh"],
    a: { t: -28, th: 66, sh: 98, ua: 108, fa: 118 },
    b: { ...STAND, ua: 0, fa: 0 },
  };
}
function gobletKb(double) {
  return {
    anchor: "foot", at: [96, 138], prop: ["kb", "wrist"], hl: ["thigh", "glute"],
    a: { ...STAND, ua: 80, fa: -100 },
    b: { ...SQUAT_B, t: -72, ua: 80, fa: -100 },
    env: double
      ? (j) => (<g>
        <path d={`M${j.wrist[0] - 9},${j.wrist[1] - 3} a4,4 0 0 1 8,0`} fill="none" stroke={C.plateEdge} strokeWidth={2} />
        <circle cx={j.wrist[0] - 5} cy={j.wrist[1] + 2} r={6.5} fill={C.gear2} stroke={C.plateEdge} strokeWidth={1.4} />
      </g>)
      : undefined,
  };
}
/** Sentadilla en posición de rack + press por encima de la cabeza (thruster). */
function thruster(prop) {
  return {
    anchor: "foot", at: [96, 138], prop: [prop, "wrist"], hl: ["thigh", "shoulder"],
    a: { ...SQUAT_B, t: -72, ua: 10, fa: -150 },
    b: { ...STAND, ua: -90, fa: -90 },
  };
}

// ─── Zancadas ────────────────────────────────────────────────────────────────
const FRONT_FOOT = [100, 138];
const LUNGE_BOTTOM = { t: -90, th: 12, sh: 100 };
const LUNGE_TOP = { t: -90, th: 78, sh: 100 };
const lungePose = (base, rearTarget, extra) => withRear({ anchor: "foot", at: FRONT_FOOT }, { ...base, ...extra }, rearTarget, -1);
function lungeCombo(o) {
  return {
    anchor: "foot", at: FRONT_FOOT, prop: [o.prop, "wrist"], hl: ["thigh", "glute"],
    a: lungePose(LUNGE_BOTTOM, [46, 134], o.a),
    b: lungePose(LUNGE_TOP, [62, 136], o.b),
  };
}
function reverseLunge() {
  return {
    anchor: "foot", at: FRONT_FOOT, prop: ["barbell", "shoulder"], hl: ["thigh", "glute"],
    a: withRear({ anchor: "foot", at: FRONT_FOOT }, { t: -90, th: 90, sh: 90, ua: 125, fa: -35 }, [96, 138]),
    b: lungePose(LUNGE_BOTTOM, [46, 134], { ua: 125, fa: -35 }),
  };
}
function smithLunge() {
  // Zancada estática en Smith: los dos pies no se mueven; la cadera sube y baja sobre la misma vertical que la barra.
  const arms = { ua: 125, fa: -35 };
  const base = { anchor: "foot", at: FRONT_FOOT };
  const rear = [52, 136];
  const aBase = { t: -90, th: 12, sh: 112, ...arms };
  const hipA = solve(base, aBase).hip;
  const f = legTo([hipA[0], 92], FRONT_FOOT, -1);
  return {
    anchor: "foot", at: FRONT_FOOT, prop: ["barbell", "shoulder"], smith: true, hl: ["thigh", "glute"],
    a: withRear(base, aBase, rear, -1),
    b: withRear(base, { t: -90, th: f.th2, sh: f.sh2, ...arms }, rear, -1),
  };
}
function smithBulgarian() {
  const arms = { ua: 125, fa: -35 };
  return {
    anchor: "foot", at: FRONT_FOOT, prop: ["barbell", "shoulder"], smith: true, hl: ["thigh", "glute"],
    a: lungePose({ t: -90, th: 14, sh: 112 }, [40, 111], arms),
    b: lungePose({ t: -90, th: 71, sh: 71 }, [40, 111], arms),
    env: () => <Bench x0={24} x1={52} y={116} />,
  };
}
function stepUpBarbell() {
  const at = [100, 116];
  const arms = { ua: 125, fa: -35 };
  return {
    anchor: "foot", at, prop: ["barbell", "shoulder"], hl: ["thigh", "glute"],
    a: withRear({ anchor: "foot", at }, { t: -78, th: 20, sh: 105, ...arms }, [72, 138]),
    b: { t: -90, th: 90, sh: 90, ...arms, th2: 96, sh2: 100 },
    env: () => <Box x0={88} x1={150} y={120} />,
  };
}

// ─── Hip thrust / puente ─────────────────────────────────────────────────────
const HT_FOOT = [128, 138];
function hipThrust(o = {}) {
  const arms = o.arms ?? [{ ua: 84, fa: -92 }, { ua: -90, fa: -90 }];
  const free = o.single ? [{ th2: -24, sh2: -24 }, { th2: 0, sh2: 0 }] : [{}, {}];
  return {
    anchor: "foot", at: HT_FOOT, prop: o.prop, smith: o.smith, hl: ["glute"],
    a: { t: 202, th: -42, sh: 76, ...arms[0], ...free[0] },
    b: { t: 175, th: 8, sh: 90, ...arms[1], ...free[1] },
    env: () => <Bench x0={44} x1={80} y={116} />,
  };
}
function glutBridgeSingle() {
  return {
    anchor: "foot", at: [120, 138], hl: ["glute"],
    a: { t: 180, th: -43, sh: 76, ua: 5, fa: 5, th2: -43, sh2: -43 },
    b: { t: 144, th: 0, sh: 90, ua: 5, fa: 5, th2: -8, sh2: -8 },
  };
}

// ─── Máquinas ────────────────────────────────────────────────────────────────
function legExtensionSingle() {
  return {
    anchor: "hip", at: [92, 110], hl: ["thigh"],
    a: { t: -102, th: 4, sh: 92, ua: 80, fa: 40, th2: 4, sh2: 92 },
    b: { t: -102, th: 4, sh: 8, ua: 80, fa: 40, th2: 4, sh2: 92 },
    env: (j) => {
      const dir = angleOf(j.knee, j.ankle);
      const pad = add(j.ankle, vec(dir - 90, -4.5));
      const pivot = add(j.knee, [-5, 7]);
      return (<>
        <InclinePad j={j} ext={4} />
        {line(pivot, pad, 3, C.gear)}
        <circle cx={pivot[0]} cy={pivot[1]} r={3} fill={C.gear2} />
        {line(add(pad, vec(dir, -5)), add(pad, vec(dir, 5)), 6.5, C.gear2)}
      </>);
    },
  };
}
function legCurlStanding() {
  return {
    anchor: "hip", at: [92, 84], hl: ["thigh"],
    a: { t: -64, th: 90, sh: 94, ua: 40, fa: 30, th2: 90, sh2: 90 },
    b: { t: -64, th: 90, sh: 192, ua: 40, fa: 30, th2: 90, sh2: 90 },
    env: (j) => {
      const dir = angleOf(j.knee, j.ankle);
      const pad = add(j.ankle, vec(dir + 90, 4.5));
      const pivot = add(j.knee, [4, 3]);
      const n = vec(-64 + 90, 11);
      const p0 = add(add(j.hip, vec(-64, 14)), n), p1 = add(add(j.hip, vec(-64, 36)), n);
      return (<>
        {line(p0, p1, 9, C.gear2)}
        {line([p0[0] + 3, p0[1]], [p0[0] + 3, FLOOR], 5, C.gear)}
        {line(pivot, pad, 3, C.gear)}
        <circle cx={pivot[0]} cy={pivot[1]} r={3} fill={C.gear2} />
        {line(add(pad, vec(dir, -5)), add(pad, vec(dir, 5)), 6.5, C.gear2)}
      </>);
    },
  };
}

// ─── Sumo en Smith (frente) ──────────────────────────────────────────────────
function sumoSmith() {
  const arms = { la: 105, lf: -75, ra: 75, rf: -105 };
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["barbell", "hands-mid"], smith: true, hl: ["thigh", "glute"],
    a: { lt: 112, ls: 112, rt: 68, rs: 68, ...arms, lean: 0 },
    b: { lt: 148, ls: 79, rt: 32, rs: 101, ...arms, lean: 0 },
  };
}

// ─── Burpee ──────────────────────────────────────────────────────────────────
function burpeeJump() {
  return {
    anchor: "toe", at: [34, 139], hl: ["thigh", "glute"],
    a: { t: -20, th: 160, sh: 160, ft: 50, ua: 90, fa: 90 },
    b: { t: -90, th: 90, sh: 90, ft: 55, ua: -90, fa: -90 },
  };
}

export const ENTRIES = {
  "Elevación de pantorrillas unilateral": calfRaiseSingle(),
  "Elevación de gemelos con burro": calfDonkey(),
  "Elevación tibial": tibialRaise(),
  "Abductor con banda": bandAbductor(),
  "Aductor con banda": bandAdductor(),
  "Caminata lateral con banda": bandSideWalk(),
  "Buenos días con barra": goodMorning(),
  "Sentadilla a una pierna": pistol(),
  "Sentadilla con salto": jumpSquat(),
  "Swing con kettlebell": kbSwing(),
  "Goblet squat con kettlebell": gobletKb(false),
  "Thruster con barra": thruster("barbell"),
  "Thruster con mancuernas": thruster("db"),
  "Sentadilla con press": thruster("db"),
  "Sentadilla frontal a press": thruster("barbell"),
  "Zancada con press": lungeCombo({ prop: "db", a: { ua: 40, fa: -120 }, b: { ua: -90, fa: -90 } }),
  "Zancada con curl de bíceps": lungeCombo({ prop: "db", a: { ua: 92, fa: 88 }, b: { ua: 84, fa: -68 } }),
  "Burpee con salto": burpeeJump(),
  "Box jump con mancuernas": boxJump(),
  "Hip thrust a press de hombros": hipThrust({ prop: ["db", "wrist"] }),
  "Peso muerto rumano + remo": rdlRow(),
  "Extensión de cuádriceps unilateral": legExtensionSingle(),
  "Hip thrust unilateral": hipThrust({ single: true, arms: [{ ua: 20, fa: 20 }, { ua: 20, fa: 20 }] }),
  "Curl femoral de pie": legCurlStanding(),
  "Step-up con barra": stepUpBarbell(),
  "Estocada reversa con barra": reverseLunge(),
  "Peso muerto con hex bar": hexDeadlift(),
  "RDL unilateral con barra": rdlSingle(),
  "Curl nórdico asistido": nordic(),
  "Elevación de talón en prensa": calfLegPress(),
  "Sentadilla con kettlebell doble": gobletKb(true),
  "Glute bridge unilateral": glutBridgeSingle(),
  "Zancada en Smith": smithLunge(),
  "Sentadilla frontal en Smith": {
    anchor: "foot", at: [96, 138], prop: ["barbell", "shoulder"], smith: true, hl: ["thigh", "glute"],
    a: { t: -90, th: 76, sh: 76, ua: 10, fa: -150 },
    b: { t: -76, th: 14, sh: 106, ua: 10, fa: -150 },
  },
  "Sentadilla sumo en Smith": sumoSmith(),
  "Hip thrust en Smith": hipThrust({ prop: ["barbell", "hips"], smith: true, arms: [{ ua: 10, fa: 10 }, { ua: 10, fa: 10 }] }),
  "Peso muerto rumano en Smith": rdlSmith(),
  "Elevación de talones en Smith": calfRaiseSmith(),
  "Split squat búlgaro en Smith": smithBulgarian(),
};
