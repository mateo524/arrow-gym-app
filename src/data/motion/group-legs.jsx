// Movimientos del grupo: Piernas (tanda 0-39). Formato en src/components/motion/rig.jsx.
import { Bench, Seat, Pad, Box, InclinePad, line, FLOOR, C, vec, add, angleOf, solve, TH, SH } from "../../components/motion/rig.jsx";
import { squat } from "./base.jsx";

const STAND = { t: -90, th: 90, sh: 90 };
const D2R = Math.PI / 180;
const ang = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) / D2R);

/** IK de dos segmentos (muslo TH, pierna SH): devuelve { th, sh } para llegar de la cadera al tobillo. pick = "fwd" (rodilla adelante, x mayor), "up" (rodilla arriba), "out-l" (rodilla a la izquierda). */
function ik(hip, tgt, pick = "fwd") {
  let d = Math.hypot(tgt[0] - hip[0], tgt[1] - hip[1]);
  d = Math.min(Math.max(d, Math.abs(TH - SH) + 0.5), TH + SH - 0.01);
  const base = Math.atan2(tgt[1] - hip[1], tgt[0] - hip[0]);
  const A = Math.acos((TH * TH + d * d - SH * SH) / (2 * TH * d));
  const cands = [base + A, base - A].map((th) => {
    const knee = [hip[0] + Math.cos(th) * TH, hip[1] + Math.sin(th) * TH];
    return { th: th / D2R, knee };
  });
  const score = (k) => (pick === "fwd" ? k[0] : pick === "up" ? -k[1] : pick === "out-l" ? -k[0] : pick === "out-r" ? k[0] : k[0]);
  const best = cands.sort((p, q) => score(q.knee) - score(p.knee))[0];
  const ankle = tgt;
  return { th: best.th, sh: ang(best.knee, ankle), knee: best.knee, ankle };
}
/** Ángulo equivalente más cercano a `ref` (para que la interpolación no gire por el lado largo). */
const near = (a, ref) => { while (a - ref > 180) a -= 360; while (a - ref < -180) a += 360; return a; };

// ─── Sentadillas ────────────────────────────────────────────────────────────
function frontSquat() {
  const arms = { ua: -5, fa: -172 }; // agarre clean: codos al frente y arriba, muñeca bajo la barra apoyada en los deltoides
  return {
    anchor: "foot", at: [96, 138], prop: ["barbell", "shoulder"], hl: ["thigh", "glute"],
    a: { ...STAND, ...arms },
    b: { t: -76, th: 14, sh: 106, ...arms },
  };
}

function goblet() {
  const arms = { ua: 85, fa: -75 };
  return {
    anchor: "foot", at: [96, 138], prop: ["kb", "wrist"], hl: ["thigh", "glute"],
    a: { ...STAND, ...arms },
    b: { t: -70, th: 12, sh: 106, ...arms },
  };
}

/** Sentadilla a caja: la cadera va hacia atrás hasta sentarse en el cajón. */
function boxSquat() {
  const d = {
    anchor: "foot", at: [100, 138], prop: ["barbell", "shoulder"], hl: ["thigh", "glute"],
    a: { ...STAND, ua: 125, fa: -35 },
    b: { t: -52, th: 4, sh: 93, ua: 125, fa: -35 },
  };
  const hb = solve(d, d.b).hip;
  d.env = () => <Box x0={hb[0] - 20} x1={hb[0] + 12} y={hb[1] + 8} />;
  return d;
}

/** Sentadilla sumo: vista de frente, pies muy abiertos, rodillas hacia afuera, barra en la espalda. */
function sumoSquat() {
  const hipA = [0, 0];
  const mk = (dy, dxA) => {
    const l = ik(hipA, [-dxA, dy], "out-l");
    const r = ik(hipA, [dxA, dy], "out-r");
    return { lt: l.th, ls: l.sh, rt: r.th, rs: r.sh };
  };
  // Se resuelve con IK en pose de frente: el muslo/pierna izquierdo apunta a (−x, y).
  const a = mk(50, 24), b = mk(32, 24);
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["none"], hl: ["thigh", "glute"],
    a: { ...a, la: 120, lf: -70, ra: 60, rf: -110 },
    b: { ...b, la: 120, lf: -70, ra: 60, rf: -110 },
    env: (j) => (<>
      {line(add(j.sl, [-26, -4]), add(j.sr, [26, -4]), 3.4, C.plateEdge)}
      <rect x={j.sl[0] - 32} y={j.sl[1] - 15} width={6} height={22} rx={2} fill={C.plate} stroke={C.plateEdge} strokeWidth={1} />
      <rect x={j.sr[0] + 26} y={j.sr[1] - 15} width={6} height={22} rx={2} fill={C.plate} stroke={C.plateEdge} strokeWidth={1} />
    </>),
    // perfil: sentadilla con barra alta, torso erguido (en sumo el tronco queda mas vertical)
    alt: {
      anchor: "foot", at: [96, 138], prop: ["barbell", "shoulder"], hl: ["thigh", "glute"],
      a: { ...STAND, ua: 125, fa: -35 },
      b: { t: -76, th: 18, sh: 104, ua: 125, fa: -35 },
    },
  };
}

/** Sentadilla hack en máquina: espalda sobre el respaldo inclinado, los pies adelante en la plataforma. */
function hackSquat() {
  const F = [112, 134];
  const back = -112; // respaldo inclinado hacia atrás (grados)
  const run = 68; // dirección de las guías (hacia abajo y adelante)
  const hipA = add(F, vec(run + 180, 53));
  const hipB = add(hipA, vec(run, 24));
  const mk = (h) => { const r = ik(h, F, "fwd"); return { t: back, th: r.th, sh: r.sh, ua: 80, fa: 70, ft: -22 }; };
  const d = { anchor: "foot", at: F, prop: ["none"], hl: ["thigh", "glute"], a: mk(hipA), b: mk(hipB) };
  d.env = (j) => {
    const bk = vec(158, 7);
    const p0 = add(add(hipA, vec(back, 54)), bk), p1 = add(add(hipA, vec(run, 62)), bk);
    return (<>
      {line(add(p0, vec(back, 8)), add(p1, [2, 0]), 3, C.gear)}
      {line(add(j.hip, bk), add(add(j.shoulder, vec(back, 10)), bk), 9, C.gear2)}
      {line(add(j.shoulder, [-5, 1]), add(j.shoulder, [3, -3]), 7, C.gear)}
      {line(add(F, add(vec(run, 5), vec(-22, 16))), add(F, add(vec(run, 5), vec(158, 16))), 5, C.gear2)}
    </>);
  };
  return d;
}

// ─── Prensas ─────────────────────────────────────────────────────────────────
/** Prensa 45°: respaldo reclinado, plataforma que sube en diagonal. uni = una sola pierna. */
function legPress45(o = {}) {
  const hip = [66, 104];
  const rail = -42;
  const d = {
    anchor: "hip", at: hip, prop: ["none"], hl: ["thigh"],
    a: { t: -135, ua: 60, fa: 40, th: -80, sh: 0, ft: rail - 90 },
    b: { t: -135, ua: 60, fa: 40, th: -42, sh: -42, ft: rail - 90 },
  };
  if (o.uni) { d.a = { ...d.a, th2: 20, sh2: 80 }; d.b = { ...d.b, th2: 20, sh2: 80 }; }
  d.env = (j) => {
    const pl = add(j.ankle, vec(rail, 4));
    const up = vec(rail - 90, 20), dn = vec(rail + 90, 20);
    return (<>
      {line(add(j.hip, [-3, 8]), add(add(j.shoulder, vec(-135, 6)), [-5, 6]), 9, C.gear2)}
      <rect x={hip[0] - 16} y={hip[1] + 8} width={34} height={7} rx={3} fill={C.gear2} />
      {line([hip[0] + 4, hip[1] + 15], [hip[0] + 4, FLOOR], 5, C.gear)}
      {line(add(hip, add(vec(rail, 22), [0, 18])), add(hip, add(vec(rail, 118), [0, 18])), 4, C.gear)}
      {line(add(pl, up), add(pl, dn), 6, C.gear2)}
      {line(add(pl, dn), add(add(hip, vec(rail, 70)), [0, 18]), 3, C.gear)}
    </>);
  };
  return d;
}

/** Prensa horizontal (sentado, plataforma vertical al frente). */
function legPressHoriz() {
  const hip = [58, 104];
  const d = {
    anchor: "hip", at: hip, prop: ["none"], hl: ["thigh"],
    a: { t: -100, ua: 60, fa: 40, th: -65, sh: -5, ft: -90 },
    b: { t: -100, ua: 60, fa: 40, th: -28, sh: -28, ft: -90 },
  };
  d.env = (j) => {
    const px = j.ankle[0] + 3;
    return (<>
      {line(add(j.hip, [-3, 8]), add(add(j.shoulder, vec(-100, 6)), [-6, 4]), 9, C.gear2)}
      <rect x={hip[0] - 16} y={hip[1] + 8} width={34} height={7} rx={3} fill={C.gear2} />
      {line([hip[0] + 4, hip[1] + 15], [hip[0] + 4, FLOOR], 5, C.gear)}
      {line([hip[0] + 10, hip[1] + 15], [hip[0] + 100, hip[1] + 15], 4, C.gear)}
      {line([px, j.ankle[1] - 20], [px, j.ankle[1] + 20], 6, C.gear2)}
      {line([px, j.ankle[1] + 20], [px, hip[1] + 15], 3, C.gear)}
    </>);
  };
  return d;
}

/** Elevación de pantorrillas en prensa: piernas extendidas, solo se mueve el tobillo (puntas en la plataforma). */
function calfPress() {
  const rail = -42;
  const d = {
    anchor: "toe", at: [124, 76], prop: ["none"], hl: ["calf"],
    a: { t: -135, ua: 60, fa: 40, th: rail, sh: rail, ft: rail - 98 },
    b: { t: -135, ua: 60, fa: 40, th: rail, sh: rail, ft: rail - 44 },
  };
  d.env = (j) => {
    const toe = d.at;
    const up = vec(rail - 90, 24), dn = vec(rail + 90, 10); // la bola del pie en el borde inferior de la plataforma
    const hip = j.hip;
    return (<>
      {line(add(hip, [-3, 8]), add(add(j.shoulder, vec(-135, 6)), [-5, 6]), 9, C.gear2)}
      <rect x={hip[0] - 16} y={hip[1] + 8} width={34} height={7} rx={3} fill={C.gear2} />
      {line([hip[0] + 4, hip[1] + 15], [hip[0] + 4, FLOOR], 5, C.gear)}
      {line(add(toe, vec(rail, 2)), add(add(toe, vec(rail, 2)), add(up, [0, 0])), 6, C.gear2)}
      {line(add(toe, vec(rail, 2)), add(add(toe, vec(rail, 2)), dn), 6, C.gear2)}
      {line(add(add(toe, vec(rail, 2)), dn), add(add(toe, vec(rail, 2)), add(dn, vec(rail + 180, 70))), 3, C.gear)}
    </>);
  };
  return d;
}

// ─── Máquinas de rodilla ────────────────────────────────────────────────────
function legExtension() {
  const hip = [82, 100];
  const d = {
    anchor: "hip", at: hip, prop: ["none"], hl: ["thigh"],
    a: { t: -95, ua: 70, fa: 50, th: 2, sh: 92 },
    b: { t: -95, ua: 70, fa: 50, th: 2, sh: -8 },
  };
  d.env = (j) => {
    const piv = [hip[0] + 30, hip[1] + 18];
    return (<>
      <Seat x={hip[0]} y={hip[1] + 7} w={34} />
      {line([hip[0] - 14, hip[1] + 4], [hip[0] - 18, hip[1] - 46], 8, C.gear2)}
      {line(piv, add(j.ankle, [-2, -2]), 3.4, C.gear)}
      {line(add(j.ankle, [-3, -5]), add(j.ankle, [3, 5]), 7, C.gear2)}
      <circle cx={piv[0]} cy={piv[1]} r={4} fill={C.gear} />
      <rect x={piv[0] - 6} y={piv[1] + 4} width={12} height={FLOOR - piv[1] - 4} rx={3} fill={C.gear} />
    </>);
  };
  return d;
}

function seatedLegCurl() {
  const hip = [82, 98];
  const d = {
    anchor: "hip", at: hip, prop: ["none"], hl: ["thigh"],
    a: { t: -95, ua: 70, fa: 50, th: 0, sh: -10 },
    b: { t: -95, ua: 70, fa: 50, th: 0, sh: 82 },
  };
  d.env = (j) => {
    const piv = [hip[0] + 40, hip[1] + 20];
    return (<>
      <Seat x={hip[0]} y={hip[1] + 7} w={34} />
      {line([hip[0] - 14, hip[1] + 4], [hip[0] - 18, hip[1] - 46], 8, C.gear2)}
      <rect x={j.knee[0] - 12} y={j.knee[1] - 13} width={22} height={7} rx={3.5} fill={C.gear2} />
      {line([j.knee[0] + 2, j.knee[1] - 13], [j.knee[0] + 2, j.knee[1] - 40], 3, C.gear)}
      {line(add(j.ankle, [0, 0]), piv, 3.4, C.gear)}
      {line(add(j.ankle, [-2, -6]), add(j.ankle, [4, 4]), 7, C.gear2)}
      <circle cx={piv[0]} cy={piv[1]} r={4} fill={C.gear} />
      <rect x={piv[0] - 6} y={piv[1] + 4} width={12} height={FLOOR - piv[1] - 4} rx={3} fill={C.gear} />
    </>);
  };
  return d;
}

function lyingLegCurl() {
  const hip = [126, 104];
  const d = {
    anchor: "hip", at: hip, prop: ["none"], hl: ["thigh"],
    a: { t: 180, ua: 160, fa: 100, th: 2, sh: -2 },
    b: { t: 180, ua: 160, fa: 100, th: 2, sh: -112 },
  };
  d.env = (j) => {
    const piv = [hip[0] + 34, hip[1] + 6];
    return (<>
      <Bench x0={hip[0] - 40} x1={hip[0] + 34} y={hip[1] + 7} />
      {line(piv, j.ankle, 3.4, C.gear)}
      {line(add(j.ankle, [-3, 6]), add(j.ankle, [3, -6]), 7, C.gear2)}
      <circle cx={piv[0]} cy={piv[1]} r={4} fill={C.gear} />
    </>);
  };
  return d;
}

// ─── Bisagra de cadera ──────────────────────────────────────────────────────
function rdl(o = {}) {
  return {
    anchor: "foot", at: [96, 138], prop: [o.prop || "barbell", "wrist"], hl: ["thigh", "glute"],
    a: { ...STAND, ua: 92, fa: 90 },
    b: { t: -26, th: 68, sh: 80, ua: 94, fa: 90 },
  };
}

function rdlUni() {
  return {
    anchor: "foot", at: [100, 138], prop: ["db", "wrist"], hl: ["thigh", "glute"],
    a: { ...STAND, ua: 92, fa: 90, th2: 92, sh2: 92 },
    b: { t: -8, th: 82, sh: 94, ua: 100, fa: 90, th2: 176, sh2: 172 },
  };
}

function sumoDeadlift() {
  // Vista de frente: pies muy abiertos, rodillas hacia afuera, brazos rectos por dentro de las rodillas, barra al piso entre los pies.
  const hip = [0, 0];
  const mk = (dy, dx) => {
    const l = ik(hip, [-dx, dy], "out-l"), r = ik(hip, [dx, dy], "out-r");
    return { lt: l.th, ls: l.sh, rt: r.th, rs: r.sh, la: 90, lf: 90, ra: 90, rf: 90, lean: 0 };
  };
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["barbell", "hands-mid"], hl: ["glute", "thigh"],
    a: mk(26, 34), b: mk(50, 16),
    // perfil: bisagra con espalda recta, barra cerca de las piernas, torso mas vertical que en convencional
    alt: {
      anchor: "foot", at: [96, 138], prop: ["barbell", "wrist"], hl: ["glute", "thigh"],
      a: { t: -52, th: 22, sh: 96, ua: 92, fa: 92 },
      b: { ...STAND, ua: 92, fa: 92 },
    },
  };
}

function trapBar() {
  return {
    anchor: "foot", at: [96, 138], prop: ["barbell", "wrist"], hl: ["thigh", "glute"],
    a: { t: -45, th: 8, sh: 100, ua: 92, fa: 92 }, // torso mas vertical que el convencional, mas flexion de rodilla
    b: { ...STAND, ua: 92, fa: 92 },
    env: (j) => (<>
      <rect x={j.wrist[0] - 17} y={j.wrist[1] - 4} width={34} height={8} rx={4} fill="none" stroke={C.plateEdge} strokeWidth={2} />
    </>),
  };
}

// ─── Zancadas ───────────────────────────────────────────────────────────────
/** Estocada (perfil): pie delantero fijo, pie trasero apoyado en la punta. mode: "up" (arranca de pie), "split" (arranca ya escalonado). */
function lunge(o = {}) {
  const F = [104, 138];
  const R = [62, 128]; // pie trasero apoyado en la punta, talon levantado
  const hA = o.together ? [F[0], 84] : [84, 89];
  const hB = [84, 108];
  const mk = (h, t) => {
    const f = ik(h, F, "fwd"), r = ik(h, o.together && h === hA ? [F[0] - 2, 138] : R, "fwd");
    return { t, th: f.th, sh: f.sh, th2: r.th, sh2: r.sh };
  };
  const barbell = o.prop === "barbell";
  const arms = barbell ? { ua: 125, fa: -35 } : { ua: 92, fa: 90 };
  return {
    anchor: "foot", at: F, prop: [o.prop || "db", barbell ? "shoulder" : "wrist"], hl: ["thigh", "glute"],
    a: { ...mk(hA, -90), ...arms }, b: { ...mk(hB, -90), ...arms },
    // punta del pie trasero orientada solo aqui: apoyada en el piso con el talon arriba (plano si el pie esta en el piso)
    env: (j) => { const k = Math.min(1, Math.max(0, (138 - j.ankle2[1]) / 8)); j.toe2 = add(j.ankle2, vec(70 * k, 9)); return null; },
  };
}

function bulgarian(o = {}) {
  const F = [112, 138];
  const R = [68, 112];
  const hA = [92, 90], hB = [92, 108];
  const mk = (h, t) => {
    const f = ik(h, F, "fwd"), r = ik(h, R, "fwd");
    return { t, th: f.th, sh: f.sh, th2: r.th, sh2: r.sh };
  };
  const barbell = o.prop === "barbell";
  const arms = barbell ? { ua: 125, fa: -35 } : { ua: 92, fa: 90 };
  return {
    anchor: "foot", at: F, prop: [o.prop || "db", barbell ? "shoulder" : "wrist"], hl: ["thigh", "glute"],
    a: { ...mk(hA, -86), ...arms }, b: { ...mk(hB, -80), ...arms },
    env: (j) => { j.toe2 = add(j.ankle2, vec(180, 9)); return <Bench x0={R[0] - 22} x1={R[0] + 14} y={R[1] + 3} />; }, // empeine apoyado en el banco, punta hacia atras
  };
}

function lateralLunge() {
  const hip = [0, 0];
  const mk = (dy, lx, rx) => {
    const l = ik(hip, [lx, dy], "out-l"), r = ik(hip, [rx, dy], "out-r");
    return { lt: l.th, ls: l.sh, rt: r.th, rs: r.sh };
  };
  const arms = { la: 100, lf: -40, ra: 80, rf: -140 };
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["db", "hands-mid"], hl: ["thigh"],
    a: { ...mk(52, -9, 9), ...arms },
    b: { ...mk(32, -16, 44), ...arms },
    // perfil: la cadera se sienta hacia atras sobre la pierna que flexiona (la otra queda estirada hacia el costado)
    alt: {
      anchor: "foot", at: [96, 138], prop: ["db", "wrist"], hl: ["thigh"],
      a: { ...STAND, ua: 85, fa: -75, th2: 90, sh2: 90 },
      b: { t: -62, th: 20, sh: 104, ua: 85, fa: -75, th2: 82, sh2: 90 },
    },
  };
}

function stepUp() {
  const F = [100, 118];
  const hA = [88, 86], hB = [100, 66];
  const mk = (h, t, far) => {
    const n = ik(h, F, "fwd");
    return { t, th: n.th, sh: n.sh, ...far(h) };
  };
  const arms = { ua: 92, fa: 90 };
  const fa = ik(hA, [76, 138], "fwd");
  return {
    anchor: "foot", at: F, prop: ["db", "wrist"], hl: ["thigh", "glute"],
    a: { ...mk(hA, -84, () => ({ th2: fa.th, sh2: fa.sh })), ...arms },
    b: { ...mk(hB, -90, () => ({ th2: 80, sh2: 92 })), ...arms }, // arriba: de pie, el pie trasero llega junto al de apoyo
    env: () => <Box x0={F[0] - 8} x1={F[0] + 34} y={F[1] + 4} />,
  };
}

// ─── Cadera / glúteo ────────────────────────────────────────────────────────
/** Hip thrust: espalda alta en el banco, pies fijos. kind: "barbell" | "db" | "machine". */
function hipThrust(kind) {
  const S = [70, 112];
  const topH = [S[0] + 34, S[1]];
  const botAng = 22 * D2R;
  const botH = [S[0] + 34 * Math.cos(botAng), S[1] + 34 * Math.sin(botAng)];
  const F = [S[0] + 64, 138];
  const mk = (h, tAng) => {
    const r = ik(h, F, "up");
    const arm = ang(S, h);
    return { t: tAng, th: r.th, sh: r.sh, ua: arm, fa: arm };
  };
  const a = mk(botH, 180 + 22), b = mk(topH, 180);
  const prop = kind === "machine" ? ["none"] : [kind, "hips"];
  const d = { anchor: "foot", at: F, prop, hl: ["glute"], a, b };
  d.env = (j) => (<>
    <Bench x0={S[0] - 14} x1={S[0] + 12} y={S[1] + 6} />
    {kind === "machine" && (<>
      {line([j.hip[0], j.hip[1] - 6], [S[0] + 70, S[1] - 14], 3.4, C.gear)}
      <rect x={j.hip[0] - 9} y={j.hip[1] - 12} width={18} height={7} rx={3.5} fill={C.gear2} />
      <circle cx={S[0] + 70} cy={S[1] - 14} r={4} fill={C.gear} />
      {line([S[0] + 70, S[1] - 10], [S[0] + 70, FLOOR], 5, C.gear)}
    </>)}
  </>);
  return d;
}

function gluteBridge() {
  const S = [58, 134];
  const F = [S[0] + 54, 138];
  const topH = [S[0] + 28, 114];
  const botH = [S[0] + 34, 135];
  const mk = (h) => {
    const r = ik(h, F, "up");
    return { t: ang(h, S), th: r.th, sh: r.sh, ua: 0, fa: 0 };
  };
  const a = mk(botH), b = mk(topH);
  a.t = near(a.t, 180); b.t = near(b.t, 180);
  return { anchor: "foot", at: F, prop: ["none"], hl: ["glute"], a, b };
}

function gluteKickback() {
  const hip = [96, 84];
  const d = {
    anchor: "hip", at: hip, prop: ["none"], hl: ["glute"],
    a: { t: -60, ua: 5, fa: -15, th: 62, sh: 100, th2: 90, sh2: 90 },
    b: { t: -60, ua: 5, fa: -15, th: 118, sh: 120, th2: 90, sh2: 90 },
  };
  d.env = (j) => {
    const piv = [hip[0] - 14, hip[1] + 22];
    const shoulder = j.shoulder;
    return (<>
      {line(add(shoulder, [9, 10]), add(shoulder, [13, 34]), 9, C.gear2)}
      {line(add(shoulder, [13, 34]), [shoulder[0] + 15, FLOOR], 5, C.gear)}
      <rect x={shoulder[0] + 16} y={shoulder[1] - 4} width={5} height={14} rx={2} fill={C.gear2} />
      {line(piv, add(j.ankle, [0, 0]), 3.4, C.gear)}
      {line(add(j.ankle, [-3, 5]), add(j.ankle, [3, -5]), 7, C.gear2)}
      <circle cx={piv[0]} cy={piv[1]} r={4} fill={C.gear} />
      <rect x={hip[0] - 12} y={FLOOR - 4} width={50} height={4} rx={2} fill={C.gear} />
    </>);
  };
  return d;
}

/** Abductor / aductor en máquina (vista de frente, sentado). */
function hipMachine(adduct) {
  const hip = [0, 0];
  const mk = (dy, dx) => {
    const l = ik(hip, [-dx, dy], "out-l"), r = ik(hip, [dx, dy], "out-r");
    return { lt: l.th, ls: l.sh, rt: r.th, rs: r.sh, la: 100, lf: 70, ra: 80, rf: 110 };
  };
  const closed = { lt: 112, ls: 80, rt: 68, rs: 100, la: 100, lf: 70, ra: 80, rf: 110 }, open = mk(44, 34);
  return {
    view: "front", anchor: "hip", at: [100, 91], prop: ["none"], hl: ["thigh", "glute"],
    a: adduct ? open : closed, b: adduct ? closed : open,
    env: (j) => (<>
      <rect x={j.hip[0] - 18} y={j.hip[1] + 6} width={36} height={7} rx={3} fill={C.gear2} />
      <rect x={j.hip[0] - 3} y={j.hip[1] + 13} width={6} height={FLOOR - j.hip[1] - 13} rx={2} fill={C.gear} />
      <rect x={j.sc[0] - 15} y={j.sc[1] - 2} width={30} height={16} rx={4} fill={C.gear} opacity={0.5} />
      {/* palancas de la maquina: cada almohadilla gira desde un pivote a los lados del asiento (topes = recorrido de las palancas) */}
      {[-1, 1].map((sg) => {
        const kx = (sg < 0 ? j.lk : j.rk)[0] + sg * (adduct ? -4 : 5);
        return <g key={sg}>{line([kx, j.lk[1] + 1], [j.hip[0] + sg * 26, j.hip[1] + 12], 3, C.gear)}<circle cx={j.hip[0] + sg * 26} cy={j.hip[1] + 12} r={3.6} fill={C.gear2} /></g>;
      })}
      {adduct
        ? (<><Pad x={j.lk[0] + 1} y={j.lk[1] - 12} w={6} h={26} r={3} /><Pad x={j.rk[0] - 7} y={j.rk[1] - 12} w={6} h={26} r={3} /></>)
        : (<><Pad x={j.lk[0] - 8} y={j.lk[1] - 12} w={6} h={26} r={3} /><Pad x={j.rk[0] + 2} y={j.rk[1] - 12} w={6} h={26} r={3} /></>)}
      <rect x={j.lk[0] - 20} y={FLOOR - 3} width={50} height={3} fill={C.gear} opacity={0} />
    </>),
    // perfil: sentada con respaldo; las piernas se abren / cierran en V y las almohadillas giran desde el pivote bajo el asiento
    alt: (() => {
      const open = { t: -98, ua: 55, fa: 85, th: -14, sh: 88, th2: 20, sh2: 92 };
      const closed = { t: -98, ua: 55, fa: 85, th: 3, sh: 90, th2: 6, sh2: 90 };
      return {
        anchor: "hip", at: [78, 112], prop: ["none"], hl: ["thigh", "glute"],
        a: adduct ? open : closed, b: adduct ? closed : open,
        env: (j) => {
          const lever = (kn, an, op) => {
            const dir = angleOf(kn, an), m = add(kn, vec(dir, 14)), piv = [j.hip[0] - 4, j.hip[1] + 13];
            return (<g opacity={op}>
              {line(m, piv, 3, C.gear)}
              {line(add(m, vec(dir + 90, -4)), add(m, vec(dir + 90, 4)), 4, C.gear2)}
              <circle cx={piv[0]} cy={piv[1]} r={3.4} fill={C.gear2} />
            </g>);
          };
          return (<>
            <InclinePad j={j} ext={6} />
            {lever(j.knee2, j.ankle2, 0.55)}
            {lever(j.knee, j.ankle, 1)}
            {line([j.ankle[0] - 7, FLOOR - 2], [j.ankle[0] + 24, FLOOR - 2], 4, C.gear)}
          </>);
        },
      };
    })(),
  };
}

// ─── Gemelos / sóleo / pesos corporales ─────────────────────────────────────
function standingCalf() {
  const toe = [100, 124];
  return {
    anchor: "toe", at: toe, prop: ["none"], hl: ["calf"],
    a: { ...STAND, ua: 92, fa: 88, ft: -20 },
    b: { ...STAND, ua: 92, fa: 88, ft: 62 },
    env: () => <Box x0={toe[0] - 14} x1={toe[0] + 34} y={toe[1] + 1} />,
  };
}

function seatedCalf() {
  const toe = [138, 128];
  const d = {
    anchor: "toe", at: toe, prop: ["none"], hl: ["calf"],
    a: { t: -92, ua: 60, fa: 20, th: 0, sh: 90, ft: -18 },
    b: { t: -92, ua: 60, fa: 20, th: 0, sh: 90, ft: 56 },
  };
  d.env = (j) => (<>
    <Seat x={j.hip[0] - 2} y={j.hip[1] + 7} w={34} />
    <Box x0={toe[0] - 16} x1={toe[0] + 14} y={toe[1] + 1} />
    <rect x={j.knee[0] - 11} y={j.knee[1] - 14} width={22} height={8} rx={4} fill={C.gear2} />
    {line([j.knee[0] + 7, j.knee[1] - 14], [j.knee[0] + 20, j.knee[1] - 40], 3.4, C.gear)}
  </>);
  return d;
}

function nordic() {
  const ank = [64, 136];
  const arms = { ua: 90, fa: 60 };
  const d = {
    anchor: "foot", at: ank, prop: ["none"], hl: ["thigh"],
    a: { t: -90, th: 90, sh: 180, ft: 125, ua: 90, fa: 70 },
    b: { t: -26, th: 154, sh: 180, ft: 125, ua: 66, fa: 82 },
  };
  void arms;
  d.env = () => (<>
    <rect x={ank[0] - 8} y={FLOOR - 3} width={96} height={3} rx={1.5} fill={C.gear} />
    <rect x={ank[0] - 12} y={ank[1] - 18} width={9} height={22} rx={4} fill={C.gear2} />
    {line([ank[0] - 14, ank[1] - 18], [ank[0] - 14, FLOOR], 3, C.gear)}
  </>);
  return d;
}

function sissy() {
  const toe = [100, 132];
  return {
    anchor: "toe", at: toe, prop: ["none"], hl: ["thigh"],
    a: { ...STAND, ua: 50, fa: 0, ft: 40 },
    b: { t: -124, th: 60, sh: 128, ua: 20, fa: -8, ft: 55 },
  };
}

function frontCalfSafe() { return null; }
void frontCalfSafe; void angleOf;

// ─── Asignación ejercicio -> movimiento ─────────────────────────────────────
export const ENTRIES = {
  "Sentadilla libre": squat(),
  "Sentadilla en Smith": squat({ smith: true }),
  "Sentadilla hack en máquina": hackSquat(),
  "Sentadilla goblet": goblet(),
  "Sentadilla frontal": frontSquat(),
  "Prensa de piernas": legPressHoriz(),
  "Prensa de piernas 45°": legPress45(),
  "Extensión de piernas": legExtension(),
  "Curl femoral acostado": lyingLegCurl(),
  "Curl femoral sentado": seatedLegCurl(),
  "Peso muerto rumano": rdl(),
  "Peso muerto rumano con mancuernas": rdl({ prop: "db" }),
  "Peso muerto sumo": sumoDeadlift(),
  "Estocada con mancuernas": lunge({ prop: "db", together: true }),
  "Estocada búlgara": bulgarian({ prop: "db" }),
  "Hip thrust con barra": hipThrust("barbell"),
  "Hip thrust en máquina": hipThrust("machine"),
  "Glute kickback en máquina": gluteKickback(),
  "Abductor en máquina": hipMachine(false),
  "Aductor en máquina": hipMachine(true),
  "Elevación de pantorrillas de pie": standingCalf(),
  "Elevación de pantorrillas sentado": seatedCalf(),
  "Elevación de pantorrillas en prensa": calfPress(),
  "Step-up con mancuernas": stepUp(),
  "Peso muerto rumano unilateral": rdlUni(),
  "Curl nórdico": nordic(),
  "Sentadilla sissy": sissy(),
  "Prensa de piernas unilateral": legPress45({ uni: true }),
  "Sentadilla pausa": squat(),
  "Sentadilla box": boxSquat(),
  "Sentadilla sumo": sumoSquat(),
  "Sentadilla búlgara con barra": bulgarian({ prop: "barbell" }),
  "Estocada estacionaria": lunge({ prop: "db" }),
  "Estocada lateral": lateralLunge(),
  "Estocada con barra": lunge({ prop: "barbell" }),
  "Hip thrust con mancuernas": hipThrust("db"),
  "Puente de glúteos": gluteBridge(),
  "Peso muerto rumano con kettlebell": rdl({ prop: "kb" }),
  "Peso muerto con trap bar": trapBar(),
};
