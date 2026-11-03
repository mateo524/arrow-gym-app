import { useEffect, useRef, useState } from "react";

// Muñeco propio de Loop Gym (violeta), articulado: se define cada movimiento con dos poses
// (inicio y final) en ángulos de articulaciones y se interpola. Vista de perfil mirando a la derecha.
// Ángulos en grados sobre la pantalla: 0 = derecha, 90 = abajo, -90 = arriba, 180 = izquierda.

const T = 34, UA = 19, FA = 18, TH = 28, SH = 26, HEAD = 8;
const FLOOR = 142;
const C = {
  near: "#8b5cf6", far: "#6d3fd0", head: "#a78bfa", joint: "#5b2fb8", hl: "#fbbf24",
  gear: "#3a3354", gear2: "#4d4470", plate: "#e2e8f0", plateEdge: "#94a3b8", cable: "#c4b5fd", bg: "#14101f",
};

const rad = (d) => (d * Math.PI) / 180;
const vec = (a, l) => [Math.cos(rad(a)) * l, Math.sin(rad(a)) * l];
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
const lerp = (a, b, k) => a + (b - a) * k;

export function solve(def, pose) {
  const kneeOff = vec(pose.th, TH);
  const ankOff = vec(pose.sh, SH);
  const hip = def.anchor === "foot"
    ? [def.at[0] - kneeOff[0] - ankOff[0], def.at[1] - kneeOff[1] - ankOff[1]]
    : def.at;
  const knee = add(hip, kneeOff);
  const ankle = add(knee, ankOff);
  const shoulder = add(hip, vec(pose.t, T));
  const head = add(shoulder, vec(pose.t, HEAD + 4));
  const elbow = add(shoulder, vec(pose.ua, UA));
  const wrist = add(elbow, vec(pose.fa, FA));
  return { hip, knee, ankle, shoulder, head, elbow, wrist, toe: add(ankle, [9, 0]) };
}

export function mixPose(a, b, k) {
  const o = {};
  for (const key of Object.keys(a)) o[key] = lerp(a[key], b[key], k);
  return o;
}

const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
// Ciclo: pausa en inicio, va, pausa en final, vuelve.
export function cycle(p) {
  if (p < 0.1) return 0;
  if (p < 0.5) return ease((p - 0.1) / 0.4);
  if (p < 0.6) return 1;
  if (p < 1) return ease(1 - (p - 0.6) / 0.4);
  return 0;
}

const hypot = Math.hypot;
// Extremidad que se afina de a hacia b (radios ra y rb).
function limb(a, b, ra, rb, color, op = 1) {
  const d = hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
  const pts = [[a[0] + nx * ra, a[1] + ny * ra], [b[0] + nx * rb, b[1] + ny * rb], [b[0] - nx * rb, b[1] - ny * rb], [a[0] - nx * ra, a[1] - ny * ra]];
  return (
    <g fill={color} opacity={op}>
      <polygon points={pts.map((p) => p.join(",")).join(" ")} />
      <circle cx={a[0]} cy={a[1]} r={ra} /><circle cx={b[0]} cy={b[1]} r={rb} />
    </g>
  );
}
const seg = (a, b, w, c, op = 1) => limb(a, b, w / 2, w / 2, c, op);
const dot = (p, r, c) => <circle cx={p[0]} cy={p[1]} r={r} fill={c} />;
const mid = (a, b, k = 0.5) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

function Prop({ kind, at }) {
  if (kind === "barbell") return <g><circle cx={at[0]} cy={at[1]} r={10} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.6} /><circle cx={at[0]} cy={at[1]} r={6.5} fill="none" stroke={C.plateEdge} strokeWidth={0.8} /><circle cx={at[0]} cy={at[1]} r={2.4} fill={C.plateEdge} /></g>;
  if (kind === "db") return <g><circle cx={at[0]} cy={at[1]} r={6} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} /><circle cx={at[0]} cy={at[1]} r={2} fill={C.plateEdge} /></g>;
  if (kind === "bar") return <g><circle cx={at[0]} cy={at[1]} r={3.6} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} /></g>;
  return null;
}

// Músculo que trabaja: mismo contorno que la parte del cuerpo, en ámbar y con brillo.
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

// ─── Movimientos ─────────────────────────────────────────────────────────────
const STAND = { t: -90, th: 90, sh: 90 };

export const MOVES = {
  "bench-horizontal": {
    anchor: "hip", at: [126, 106], prop: ["barbell", "wrist"], hl: ["chest", "arm"],
    a: { t: 180, ua: 84, fa: -92, th: 15, sh: 85 },
    b: { t: 180, ua: -90, fa: -90, th: 15, sh: 85 },
    env: () => (<>
      <rect x={64} y={113} width={84} height={8} rx={3} fill={C.gear2} />
      <line x1={74} y1={121} x2={74} y2={FLOOR} stroke={C.gear} strokeWidth={5} strokeLinecap="round" />
      <line x1={138} y1={121} x2={138} y2={FLOOR} stroke={C.gear} strokeWidth={5} strokeLinecap="round" />
    </>),
  },
  "bench-incline": {
    anchor: "hip", at: [128, 106], prop: ["barbell", "wrist"], hl: ["chest", "shoulder"],
    a: { t: -150, ua: 70, fa: -100, th: 15, sh: 85 },
    b: { t: -150, ua: -80, fa: -80, th: 15, sh: 85 },
    env: () => (<>
      <line x1={132} y1={112} x2={84} y2={84} stroke={C.gear2} strokeWidth={9} strokeLinecap="round" />
      <rect x={112} y={113} width={34} height={7} rx={3} fill={C.gear2} />
      <line x1={124} y1={120} x2={124} y2={FLOOR} stroke={C.gear} strokeWidth={5} strokeLinecap="round" />
      <line x1={92} y1={92} x2={86} y2={FLOOR} stroke={C.gear} strokeWidth={5} strokeLinecap="round" />
    </>),
  },
  "chest-press-machine": {
    anchor: "hip", at: [104, 108], prop: ["bar", "wrist"], hl: ["chest", "arm"],
    a: { t: -93, ua: 158, fa: 8, th: -4, sh: 85 },
    b: { t: -93, ua: 4, fa: 2, th: -4, sh: 85 },
    env: () => (<>
      <rect x={86} y={114} width={34} height={8} rx={3} fill={C.gear2} />
      <line x1={103} y1={122} x2={103} y2={FLOOR} stroke={C.gear} strokeWidth={5} strokeLinecap="round" />
      <rect x={76} y={62} width={9} height={52} rx={4} fill={C.gear2} />
      <rect x={150} y={52} width={10} height={90} rx={4} fill={C.gear} />
    </>),
  },
  "overhead-press": {
    anchor: "foot", at: [100, 138], prop: ["barbell", "wrist"], hl: ["shoulder", "arm"],
    a: { ...STAND, ua: 75, fa: -85 },
    b: { ...STAND, ua: -90, fa: -90 },
    env: () => null,
  },
  "row-seated": {
    anchor: "hip", at: [108, 108], prop: ["bar", "wrist"], hl: ["back", "arm"], cable: [196, 122],
    a: { t: -92, ua: 2, fa: 2, th: -4, sh: 85 },
    b: { t: -98, ua: 168, fa: 6, th: -4, sh: 85 },
    env: () => (<>
      <rect x={90} y={114} width={34} height={8} rx={3} fill={C.gear2} />
      <line x1={107} y1={122} x2={107} y2={FLOOR} stroke={C.gear} strokeWidth={5} strokeLinecap="round" />
      <rect x={150} y={124} width={30} height={5} rx={2} fill={C.gear2} />
      <rect x={186} y={112} width={8} height={30} rx={3} fill={C.gear} />
    </>),
  },
  "pulldown": {
    anchor: "hip", at: [100, 110], prop: ["bar", "wrist"], hl: ["back", "arm"], cable: [108, 6],
    a: { t: -96, ua: -82, fa: -82, th: -12, sh: 88 },
    b: { t: -104, ua: 122, fa: -58, th: -12, sh: 88 },
    env: () => (<>
      <rect x={82} y={116} width={32} height={7} rx={3} fill={C.gear2} />
      <line x1={98} y1={123} x2={98} y2={FLOOR} stroke={C.gear} strokeWidth={5} strokeLinecap="round" />
      <rect x={112} y={96} width={26} height={6} rx={3} fill={C.gear2} transform="rotate(-8 112 96)" />
      <rect x={100} y={2} width={24} height={6} rx={3} fill={C.gear} />
    </>),
  },
  "curl-standing": {
    anchor: "foot", at: [100, 138], prop: ["db", "wrist"], hl: ["arm"],
    a: { ...STAND, ua: 92, fa: 88 },
    b: { ...STAND, ua: 84, fa: -68 },
    env: () => null,
  },
  "squat": {
    anchor: "foot", at: [96, 138], prop: ["barbell", "shoulder"], hl: ["thigh", "glute"],
    a: { ...STAND, ua: 125, fa: -35 },
    b: { t: -62, th: 14, sh: 106, ua: 125, fa: -35 },
    env: () => null,
  },
  "deadlift": {
    anchor: "foot", at: [96, 138], prop: ["barbell", "wrist"], hl: ["back", "glute"],
    a: { t: -32, th: 44, sh: 100, ua: 92, fa: 92 },
    b: { ...STAND, ua: 92, fa: 92 },
    env: () => null,
  },
};

function frame(def) {
  const xs = [], ys = [];
  for (const pose of [def.a, def.b]) {
    const jt = solve(def, pose);
    for (const p of [jt.hip, jt.knee, jt.ankle, jt.toe, jt.shoulder, jt.head, jt.elbow, jt.wrist]) { xs.push(p[0]); ys.push(p[1]); }
  }
  if (def.cable) { xs.push(def.cable[0]); ys.push(def.cable[1]); }
  ys.push(FLOOR + 4);
  let x0 = Math.min(...xs) - 26, x1 = Math.max(...xs) + 26, y0 = Math.min(...ys) - 18, y1 = Math.max(...ys) + 6;
  let w = x1 - x0, h = y1 - y0;
  if (w / h < 4 / 3) { const nw = h * 4 / 3; x0 -= (nw - w) / 2; w = nw; } else { const nh = w * 3 / 4; y0 -= (nh - h); h = nh; }
  return [x0, y0, w, h];
}

export function FigureSvg({ def, k, size = 260, propKind }) {
  const pose = mixPose(def.a, def.b, k);
  const j = solve(def, pose);
  const dx = (p, x, y = 0) => [p[0] + x, p[1] + y];
  const propAt = def.prop?.[1] === "shoulder" ? dx(j.shoulder, -3, -1) : j.wrist;
  const vb = frame(def);
  return (
    <svg viewBox={vb.join(" ")} width={size} height={size * 0.75} style={{ display: "block", maxWidth: "100%", borderRadius: 14, background: C.bg }} aria-hidden="true">
      <defs>
        <filter id="mf-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect x={vb[0]} y={FLOOR} width={vb[2]} height={400} fill="#1b1630" />
      <rect x={vb[0]} y={FLOOR} width={vb[2]} height={1.6} fill={C.gear2} />
      <ellipse cx={(j.ankle[0] + j.hip[0]) / 2 + 4} cy={FLOOR + 1} rx={26} ry={2.6} fill="#000" opacity={0.35} />
      {def.env?.()}
      {def.cable && <line x1={j.wrist[0]} y1={j.wrist[1]} x2={def.cable[0]} y2={def.cable[1]} stroke={C.cable} strokeWidth={1.2} strokeDasharray="4 3" />}
      {/* lado lejano */}
      {limb(dx(j.hip, 4), dx(j.knee, 4), 5.6, 4.4, C.far)}
      {limb(dx(j.knee, 4), dx(j.ankle, 4), 4.4, 3.2, C.far)}
      {limb(dx(j.ankle, 4), dx(j.toe, 4), 3.2, 2.6, C.far)}
      {limb(dx(j.shoulder, -2), dx(j.elbow, -2), 4, 3.3, C.far)}
      {limb(dx(j.elbow, -2), dx(j.wrist, -2), 3.3, 2.6, C.far)}
      {/* tronco, pierna cercana */}
      {limb(j.hip, j.shoulder, 7, 7.6, C.near)}
      {def.hl?.map((h) => <Highlight key={h} part={h} j={j} />)}
      {limb(j.hip, j.knee, 6.2, 4.8, C.near)}
      {limb(j.knee, j.ankle, 4.8, 3.4, C.near)}
      {limb(j.ankle, j.toe, 3.6, 2.8, C.joint)}
      {seg(j.shoulder, mid(j.shoulder, j.head, 0.75), 4.6, C.head)}
      <circle cx={j.head[0]} cy={j.head[1]} r={HEAD} fill={C.head} />
      {limb(j.shoulder, j.elbow, 4.4, 3.6, C.near)}
      {limb(j.elbow, j.wrist, 3.6, 2.8, C.near)}
      {dot(j.wrist, 3.1, C.head)}
      {def.prop && <Prop kind={propKind || def.prop[0]} at={propAt} />}
    </svg>
  );
}

const CYCLE_MS = 2800;

export default function MotionFigure({ moveKey, size = 260, propKind }) {
  const def = MOVES[moveKey];
  const [k, setK] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!def) return undefined;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setK(1); return undefined; }
    const t0 = performance.now();
    const tick = (now) => {
      setK(cycle(((now - t0) % CYCLE_MS) / CYCLE_MS));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [def]);
  if (!def) return null;
  return <FigureSvg def={def} k={k} size={size} propKind={propKind} />;
}
