import { useEffect, useRef, useState } from "react";

/**
 * Muñeco propio de Loop Gym (violeta), articulado. Cada movimiento define dos poses (a = inicio, b = final)
 * en ángulos de articulaciones y se interpola. Ángulos sobre la pantalla: 0 = derecha, 90 = abajo, -90 = arriba, 180 = izquierda.
 *
 * VISTA DE PERFIL (def.view omitido o "side", mira a la derecha). Campos de pose:
 *   t   torso (cadera -> hombro)          ua, fa  brazo (hombro -> codo, codo -> muñeca)
 *   th  muslo (cadera -> rodilla)         sh      pierna (rodilla -> tobillo)
 *   ft  pie (tobillo -> punta), por defecto 0 (plano)
 *   ua2, fa2, th2, sh2  (opcionales) brazo / pierna del lado lejano; por defecto iguales a los cercanos.
 * def.anchor: "hip" (cadera fija en def.at), "foot" (tobillo fijo), "toe" (punta fija) o "wrist" (muñeca fija, p.ej. colgado de barra).
 *
 * VISTA DE FRENTE (def.view = "front"). Campos de pose: lt, ls (muslo/pierna izq. en pantalla), rt, rs (der.),
 *   la, lf (brazo izq.: hombro->codo, codo->muñeca), ra, rf (brazo der.), lean (inclinación del torso en grados, 0 = recto).
 *   def.anchor "foot": def.at = [x del centro, y del piso donde apoyan los pies]; "hip": def.at = cadera.
 *
 * Otros campos de def: prop ["barbell"|"db"|"bar"|"kb"|"plate"|"rope"|"none", "wrist"|"shoulder"|"hips"], hl [partes], env(j) => JSX
 * de equipo extra, cable {at:[x,y]} (torre con polea) o array de ellos, smith:true (dibuja la máquina Smith), extra:[[x,y]] puntos
 * a incluir en el encuadre, loop:"pingpong" (por defecto).
 */

export const T = 34, UA = 19, FA = 18, TH = 28, SH = 26, HEAD = 8, FOOT = 9, FLOOR = 142;
export const C = {
  near: "url(#mf-near)", far: "url(#mf-far)", head: "url(#mf-head)", joint: "#5b2fb8", hl: "#fbbf24",
  gear: "#3a3354", gear2: "#4d4470", plate: "#e2e8f0", plateEdge: "#94a3b8", cable: "#c4b5fd", bg: "#14101f", accent: "#a78bfa",
};

export const rad = (d) => (d * Math.PI) / 180;
export const vec = (a, l) => [Math.cos(rad(a)) * l, Math.sin(rad(a)) * l];
export const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
export const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
export const lerp = (a, b, k) => a + (b - a) * k;
export const mid = (a, b, k = 0.5) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
export const angleOf = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

// ─── Cinemática ──────────────────────────────────────────────────────────────
export function solve(def, pose) {
  const { t, ua, fa, th, sh } = pose;
  const ft = pose.ft ?? 0;
  const ua2 = pose.ua2 ?? ua, fa2 = pose.fa2 ?? fa, th2 = pose.th2 ?? th, sh2 = pose.sh2 ?? sh;
  const kneeOff = vec(th, TH), ankOff = vec(sh, SH), toeOff = vec(ft, FOOT);
  let hip;
  if (def.anchor === "foot") hip = sub(sub(def.at, ankOff), kneeOff);
  else if (def.anchor === "toe") hip = sub(sub(sub(def.at, toeOff), ankOff), kneeOff);
  else if (def.anchor === "wrist") hip = sub(sub(sub(def.at, vec(fa, FA)), vec(ua, UA)), vec(t, T));
  else hip = def.at;
  const knee = add(hip, kneeOff);
  const ankle = add(knee, ankOff);
  const shoulder = add(hip, vec(t, T));
  const elbow = add(shoulder, vec(ua, UA));
  const wrist = add(elbow, vec(fa, FA));
  const knee2 = add(hip, vec(th2, TH));
  const ankle2 = add(knee2, vec(sh2, SH));
  const elbow2 = add(shoulder, vec(ua2, UA));
  const wrist2 = add(elbow2, vec(fa2, FA));
  return {
    hip, knee, ankle, shoulder, elbow, wrist, toe: add(ankle, toeOff), head: add(shoulder, vec(t, HEAD + 4)),
    knee2, ankle2, toe2: add(ankle2, toeOff), elbow2, wrist2,
  };
}

const SW = 8, HW = 5; // medio ancho de hombros y caderas (vista de frente)
export function solveFront(def, pose) {
  const lean = pose.lean ?? 0;
  const tdir = -90 + lean;
  const lLeg = [vec(pose.lt, TH), vec(pose.ls, SH)];
  const rLeg = [vec(pose.rt, TH), vec(pose.rs, SH)];
  let hip;
  if (def.anchor === "foot") {
    const lAnkle = add(lLeg[0], lLeg[1]); // desde la cadera izquierda
    hip = [def.at[0] - (lAnkle[0] + (-HW)) , def.at[1] - lAnkle[1]];
    hip = [def.at[0], def.at[1] - lAnkle[1]];
  } else hip = def.at;
  const hl = add(hip, [-HW, 0]), hr = add(hip, [HW, 0]);
  const sc = add(hip, vec(tdir, T));
  const sl = add(sc, [-SW, 0]), sr = add(sc, [SW, 0]);
  const lk = add(hl, lLeg[0]), la = add(lk, lLeg[1]);
  const rk = add(hr, rLeg[0]), ra = add(rk, rLeg[1]);
  const le = add(sl, vec(pose.la, UA)), lw = add(le, vec(pose.lf, FA));
  const re = add(sr, vec(pose.ra, UA)), rw = add(re, vec(pose.rf, FA));
  return { hip, hl, hr, sc, sl, sr, lk, la, rk, ra, le, lw, re, rw, head: add(sc, vec(tdir, HEAD + 4)) };
}

export const mixPose = (a, b, k) => {
  const o = {};
  for (const key of Object.keys(a)) o[key] = lerp(a[key], b[key] ?? a[key], k);
  return o;
};
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
export function cycle(p) {
  if (p < 0.1) return 0;
  if (p < 0.5) return ease((p - 0.1) / 0.4);
  if (p < 0.6) return 1;
  if (p < 1) return ease(1 - (p - 0.6) / 0.4);
  return 0;
}

// ─── Dibujo básico ───────────────────────────────────────────────────────────
export function limb(a, b, ra, rb, color, op = 1) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
  const pts = [[a[0] + nx * ra, a[1] + ny * ra], [b[0] + nx * rb, b[1] + ny * rb], [b[0] - nx * rb, b[1] - ny * rb], [a[0] - nx * ra, a[1] - ny * ra]];
  return (
    <g fill={color} opacity={op}>
      <polygon points={pts.map((p) => p.join(",")).join(" ")} />
      <circle cx={a[0]} cy={a[1]} r={ra} /><circle cx={b[0]} cy={b[1]} r={rb} />
    </g>
  );
}
export const dot = (p, r, c) => <circle cx={p[0]} cy={p[1]} r={r} fill={c} />;
export const line = (a, b, w, c, extra = {}) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" {...extra} />;

// ─── Equipo (helpers para env) ───────────────────────────────────────────────
export const Floor = () => null; // el piso se dibuja siempre
export function Bench({ x0, x1, y = 113, legs = true }) {
  return (<>
    <rect x={x0} y={y} width={x1 - x0} height={8} rx={3} fill={C.gear2} />
    {legs && <>{line([x0 + 10, y + 8], [x0 + 10, FLOOR], 5, C.gear)}{line([x1 - 10, y + 8], [x1 - 10, FLOOR], 5, C.gear)}</>}
  </>);
}
/** Banco con respaldo inclinado, calculado desde el torso (cadera -> hombro). */
export function InclinePad({ j, ext = 12 }) {
  const n = [-4.6, 6.6];
  const ang = angleOf(j.hip, j.shoulder);
  const a = add(j.hip, n), b = add(add(j.shoulder, vec(ang, ext)), n);
  return (<>
    {line(a, b, 9, C.gear2)}
    <rect x={j.hip[0] - 14} y={j.hip[1] + 7} width={38} height={7} rx={3} fill={C.gear2} />
    {line([j.hip[0] - 2, j.hip[1] + 14], [j.hip[0] - 2, FLOOR], 5, C.gear)}
    {line([b[0] + 2, b[1] + 6], [b[0] - 6, FLOOR], 5, C.gear)}
  </>);
}
export function Seat({ x, y, w = 32 }) {
  return (<>
    <rect x={x - w / 2} y={y} width={w} height={7} rx={3} fill={C.gear2} />
    {line([x, y + 7], [x, FLOOR], 5, C.gear)}
  </>);
}
/** Torre de poleas: columna de placas + rueda de polea en (x, y). Si `y` es bajo, la polea queda abajo. */
export function CableTower({ x, y }) {
  const top = Math.min(y - 10, 20);
  return (<>
    <rect x={x - 6} y={top} width={12} height={FLOOR - top} rx={3} fill={C.gear} />
    <rect x={x - 3} y={top + 6} width={6} height={Math.max(8, (FLOOR - top) * 0.45)} rx={1.5} fill={C.gear2} />
    <circle cx={x} cy={y} r={5} fill={C.gear2} stroke={C.cable} strokeWidth={1.4} />
    <circle cx={x} cy={y} r={1.6} fill={C.cable} />
  </>);
}
/** Máquina Smith: dos rieles verticales y la barra guiada en (x, y). */
export function SmithMachine({ x, y }) {
  return (<>
    {line([x - 15, 8], [x - 15, FLOOR], 3.2, C.gear2)}
    {line([x + 15, 8], [x + 15, FLOOR], 3.2, C.gear2)}
    <rect x={x - 19} y={4} width={38} height={5} rx={2} fill={C.gear} />
    <rect x={x - 19} y={FLOOR - 4} width={38} height={4} rx={2} fill={C.gear} />
    <rect x={x - 17} y={y - 3} width={34} height={6} rx={2.5} fill={C.gear2} stroke={C.plateEdge} strokeWidth={0.8} />
  </>);
}
export function PullupBar({ x, y, w = 56 }) {
  return (<>
    {line([x - w / 2, y], [x + w / 2, y], 4.2, C.gear2)}
    {line([x - w / 2, y], [x - w / 2, FLOOR], 3.4, C.gear)}
    {line([x + w / 2, y], [x + w / 2, FLOOR], 3.4, C.gear)}
  </>);
}
export function DipBars({ x, y, w = 40 }) {
  return (<>
    {line([x - w / 2, y], [x + w / 2, y], 4.2, C.gear2)}
    {line([x - w / 2 + 3, y], [x - w / 2 + 3, FLOOR], 3.4, C.gear)}
    {line([x + w / 2 - 3, y], [x + w / 2 - 3, FLOOR], 3.4, C.gear)}
  </>);
}
export function Box({ x0, x1, y }) {
  return <rect x={x0} y={y} width={x1 - x0} height={FLOOR - y} rx={3} fill={C.gear2} />;
}
export function Landmine({ base, tip }) {
  return (<>
    <circle cx={base[0]} cy={base[1]} r={3.2} fill={C.gear} />
    {line(base, tip, 3.6, C.plateEdge)}
    <circle cx={tip[0]} cy={tip[1]} r={6.5} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.2} />
  </>);
}
export function Pad({ x, y, w = 9, h = 40, r = 4 }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={C.gear2} />;
}

function Prop({ kind, at }) {
  if (kind === "barbell") return <g><circle cx={at[0]} cy={at[1]} r={10} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.6} /><circle cx={at[0]} cy={at[1]} r={6.5} fill="none" stroke={C.plateEdge} strokeWidth={0.8} /><circle cx={at[0]} cy={at[1]} r={2.4} fill={C.plateEdge} /></g>;
  if (kind === "db") return <g><circle cx={at[0]} cy={at[1]} r={6} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} /><circle cx={at[0]} cy={at[1]} r={2} fill={C.plateEdge} /></g>;
  if (kind === "bar") return <g><circle cx={at[0]} cy={at[1]} r={3.6} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} /></g>;
  if (kind === "plate") return <g><circle cx={at[0]} cy={at[1]} r={9} fill="none" stroke={C.plate} strokeWidth={3} /></g>;
  if (kind === "kb") return <g><path d={`M${at[0] - 4},${at[1] - 2} a4,4 0 0 1 8,0`} fill="none" stroke={C.plateEdge} strokeWidth={2} /><circle cx={at[0]} cy={at[1] + 3} r={6.5} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} /></g>;
  if (kind === "rope") return <g>{line(add(at, [-3, -2]), add(at, [-6, 6]), 2.4, C.plate)}{line(add(at, [3, -2]), add(at, [6, 6]), 2.4, C.plate)}</g>;
  return null;
}

function Highlight({ part, j }) {
  const g = (el) => <g filter="url(#mf-glow)">{el}</g>;
  switch (part) {
    case "chest": case "back": return g(limb(mid(j.hip, j.shoulder, 0.5), mid(j.hip, j.shoulder, 0.97), 6.2, 7, C.hl, 0.95));
    case "core": return g(limb(mid(j.hip, j.shoulder, 0.08), mid(j.hip, j.shoulder, 0.55), 6, 6, C.hl, 0.95));
    case "shoulder": return g(dot(j.shoulder, 6.6, C.hl));
    case "arm": return g(limb(j.shoulder, j.elbow, 4.4, 3.6, C.hl, 0.95));
    case "forearm": return g(limb(j.elbow, j.wrist, 3.5, 2.8, C.hl, 0.95));
    case "thigh": return g(limb(j.hip, j.knee, 6.4, 4.8, C.hl, 0.95));
    case "glute": return g(dot(j.hip, 7, C.hl));
    case "calf": return g(limb(j.knee, j.ankle, 4.8, 3.4, C.hl, 0.95));
    default: return null;
  }
}
function HighlightFront({ part, j }) {
  const g = (el) => <g filter="url(#mf-glow)">{el}</g>;
  switch (part) {
    case "chest": return g(limb(mid(j.hip, j.sc, 0.55), mid(j.hip, j.sc, 0.95), 9, 11, C.hl, 0.95));
    case "back": return g(limb(mid(j.hip, j.sc, 0.45), mid(j.hip, j.sc, 0.95), 9, 11, C.hl, 0.95));
    case "core": return g(limb(mid(j.hip, j.sc, 0.05), mid(j.hip, j.sc, 0.55), 7, 7, C.hl, 0.95));
    case "shoulder": return g(<g>{dot(j.sl, 5.8, C.hl)}{dot(j.sr, 5.8, C.hl)}</g>);
    case "arm": return g(<g>{limb(j.sl, j.le, 4.2, 3.4, C.hl, 0.95)}{limb(j.sr, j.re, 4.2, 3.4, C.hl, 0.95)}</g>);
    case "thigh": return g(<g>{limb(j.hl, j.lk, 5.6, 4.4, C.hl, 0.95)}{limb(j.hr, j.rk, 5.6, 4.4, C.hl, 0.95)}</g>);
    case "glute": return g(<g>{dot(j.hl, 6, C.hl)}{dot(j.hr, 6, C.hl)}</g>);
    case "calf": return g(<g>{limb(j.lk, j.la, 4.4, 3.2, C.hl, 0.95)}{limb(j.rk, j.ra, 4.4, 3.2, C.hl, 0.95)}</g>);
    case "traps": return g(<g>{limb(j.sc, j.sl, 4.5, 5, C.hl, 0.95)}{limb(j.sc, j.sr, 4.5, 5, C.hl, 0.95)}</g>);
    default: return null;
  }
}

// ─── Encuadre ────────────────────────────────────────────────────────────────
function jointsOf(def, pose) {
  if (def.view === "front") {
    const j = solveFront(def, pose);
    return [j.hip, j.hl, j.hr, j.sl, j.sr, j.lk, j.la, j.rk, j.ra, j.le, j.lw, j.re, j.rw, j.head];
  }
  const j = solve(def, pose);
  return [j.hip, j.knee, j.ankle, j.toe, j.shoulder, j.head, j.elbow, j.wrist, j.knee2, j.ankle2, j.elbow2, j.wrist2];
}
export function frame(def) {
  const xs = [], ys = [];
  for (const pose of [def.a, def.b]) for (const p of jointsOf(def, pose)) { xs.push(p[0]); ys.push(p[1]); }
  const cables = def.cable ? (Array.isArray(def.cable) ? def.cable : [def.cable]) : [];
  for (const c of cables) { xs.push(c.at[0]); ys.push(c.at[1]); }
  for (const p of def.extra || []) { xs.push(p[0]); ys.push(p[1]); }
  ys.push(FLOOR + 4);
  let x0 = Math.min(...xs) - 26, x1 = Math.max(...xs) + 26, y0 = Math.min(...ys) - 18, y1 = Math.max(...ys) + 6;
  let w = x1 - x0, h = y1 - y0;
  if (w / h < 4 / 3) { const nw = (h * 4) / 3; x0 -= (nw - w) / 2; w = nw; } else { const nh = (w * 3) / 4; y0 -= nh - h; h = nh; }
  return [x0, y0, w, h];
}

const Defs = () => (
  <defs>
    <linearGradient id="mf-near" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b79cff" /><stop offset="1" stopColor="#7433e6" /></linearGradient>
    <linearGradient id="mf-far" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7d57d8" /><stop offset="1" stopColor="#4b2599" /></linearGradient>
    <linearGradient id="mf-head" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d4c2ff" /><stop offset="1" stopColor="#9a74f5" /></linearGradient>
    <radialGradient id="mf-bg" cx="50%" cy="55%" r="65%"><stop offset="0" stopColor="#2a2150" /><stop offset="1" stopColor="#120e1f" /></radialGradient>
    <filter id="mf-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
  </defs>
);

function Cables({ def, from }) {
  const list = def.cable ? (Array.isArray(def.cable) ? def.cable : [def.cable]) : [];
  return list.map((c, i) => {
    const target = c.to ? from[c.to] : from.wrist;
    return (
      <g key={i}>
        {c.tower !== false && <CableTower x={c.at[0]} y={c.at[1]} />}
        {line(c.at, target, 1.3, C.cable, { strokeDasharray: "4 3" })}
      </g>
    );
  });
}

function SideSvg({ def, k, vb }) {
  const pose = mixPose(def.a, def.b, k);
  const j = solve(def, pose);
  const dx = (p, x, y = 0) => [p[0] + x, p[1] + y];
  const where = def.prop?.[1];
  const propAt = where === "shoulder" ? dx(j.shoulder, -3, -1) : where === "hips" ? j.hip : j.wrist;
  const pa = def.smith ? solve(def, def.a) : null;
  const smithAt = def.smith ? (where === "shoulder" ? dx(pa.shoulder, -3, -1) : pa.wrist) : null;
  return (
    <>
      {def.smith && <SmithMachine x={smithAt[0]} y={propAt[1]} />}
      {def.env?.(j)}
      <Cables def={def} from={j} />
      {limb(dx(j.hip, 4), dx(j.knee2, 4), 5.6, 4.4, C.far)}
      {limb(dx(j.knee2, 4), dx(j.ankle2, 4), 4.4, 3.2, C.far)}
      {limb(dx(j.ankle2, 4), dx(j.toe2, 4), 3.2, 2.6, C.far)}
      {limb(dx(j.shoulder, -2), dx(j.elbow2, -2), 4, 3.3, C.far)}
      {limb(dx(j.elbow2, -2), dx(j.wrist2, -2), 3.3, 2.6, C.far)}
      {limb(j.hip, j.shoulder, 7, 7.6, C.near)}
      {def.hl?.map((h) => <Highlight key={h} part={h} j={j} />)}
      {limb(j.hip, j.knee, 6.2, 4.8, C.near)}
      {limb(j.knee, j.ankle, 4.8, 3.4, C.near)}
      {limb(j.ankle, j.toe, 3.6, 2.8, C.joint)}
      {limb(j.shoulder, mid(j.shoulder, j.head, 0.75), 4.6, 4.6, C.head)}
      <circle cx={j.head[0]} cy={j.head[1]} r={HEAD} fill={C.head} />
      {limb(j.shoulder, j.elbow, 4.4, 3.6, C.near)}
      {limb(j.elbow, j.wrist, 3.6, 2.8, C.near)}
      {dot(j.wrist, 3.1, C.head)}
      {def.prop && def.prop[0] !== "none" && <Prop kind={def.prop[0]} at={propAt} />}
    </>
  );
}

function FrontSvg({ def, k }) {
  const pose = mixPose(def.a, def.b, k);
  const j = solveFront(def, pose);
  const where = def.prop?.[1];
  const hands = mid(j.lw, j.rw);
  return (
    <>
      {def.smith && <SmithMachine x={hands[0]} y={hands[1]} />}
      {def.env?.(j)}
      <Cables def={def} from={{ wrist: hands, lw: j.lw, rw: j.rw }} />
      {limb(j.hr, j.rk, 5.4, 4.4, C.far)}{limb(j.rk, j.ra, 4.4, 3.2, C.far)}{limb(j.ra, add(j.ra, [3, 3]), 3.2, 2.8, C.far)}
      {limb(j.hl, j.lk, 5.4, 4.4, C.near)}{limb(j.lk, j.la, 4.4, 3.2, C.near)}{limb(j.la, add(j.la, [-3, 3]), 3.2, 2.8, C.joint)}
      {limb(j.hip, j.sc, 8.5, 12, C.near)}
      {limb(add(j.sc, [-SW, 0]), add(j.sc, [SW, 0]), 4.2, 4.2, C.near)}
      {def.hl?.map((h) => <HighlightFront key={h} part={h} j={j} />)}
      {limb(j.sc, mid(j.sc, j.head, 0.75), 4.4, 4.4, C.head)}
      <circle cx={j.head[0]} cy={j.head[1]} r={HEAD} fill={C.head} />
      {limb(j.sl, j.le, 4.2, 3.4, C.near)}{limb(j.le, j.lw, 3.4, 2.8, C.near)}{dot(j.lw, 3, C.head)}
      {limb(j.sr, j.re, 4.2, 3.4, C.near)}{limb(j.re, j.rw, 3.4, 2.8, C.near)}{dot(j.rw, 3, C.head)}
      {def.prop && def.prop[0] !== "none" && (where === "hands-mid"
        ? <Prop kind={def.prop[0]} at={hands} />
        : where === "both" ? <g><Prop kind={def.prop[0]} at={j.lw} /><Prop kind={def.prop[0]} at={j.rw} /></g>
        : <Prop kind={def.prop[0]} at={hands} />)}
    </>
  );
}

export function FigureSvg({ def, k, size = 260 }) {
  const vb = frame(def);
  return (
    <svg viewBox={vb.join(" ")} width={size} height={size * 0.75} style={{ display: "block", maxWidth: "100%", borderRadius: 14, background: C.bg }} aria-hidden="true">
      <Defs />
      <rect x={vb[0]} y={vb[1]} width={vb[2]} height={vb[3]} fill="url(#mf-bg)" />
      <rect x={vb[0]} y={FLOOR} width={vb[2]} height={400} fill="#171229" />
      <rect x={vb[0]} y={FLOOR} width={vb[2]} height={1.6} fill={C.gear2} />
      {def.view === "front" ? <FrontSvg def={def} k={k} /> : <SideSvg def={def} k={k} vb={vb} />}
    </svg>
  );
}

const CYCLE_MS = 2800;
export function usePhase(active) {
  const [k, setK] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!active) return undefined;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setK(1); return undefined; }
    const t0 = performance.now();
    const tick = (now) => { setK(cycle(((now - t0) % CYCLE_MS) / CYCLE_MS)); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);
  return k;
}
