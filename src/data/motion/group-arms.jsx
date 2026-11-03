import {
  Bench, Seat, Pad, DipBars, line, FLOOR, C, vec, add, angleOf,
} from "../../components/motion/rig.jsx";
import {
  curlStanding, curlCable, spiderCurl, bayesianCurl, curlIncline, preacherCurl, concentrationCurl,
  tricepPushdown, skullCrusher, benchPress,
} from "./base.jsx";

// Movimientos del grupo Brazos (perfil salvo los marcados front). Formato en src/components/motion/rig.jsx.
const STAND = { t: -90, th: 90, sh: 90 };
// Progreso 0..1 estimado desde la pose actual (para dibujar partes animadas en env).
const kOf = (j, a, b) => (angleOf(j.elbow, j.wrist) - a) / (b - a);

// ─── Bíceps ──────────────────────────────────────────────────────────────────
/** Curl alternado (de frente): un brazo sube supinado hacia su hombro mientras el otro cuelga; se ven los dos. */
function curlAlternate() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["db", "both"], hl: ["arm"],
    a: { lt: 90, ls: 90, rt: 90, rs: 90, la: 92, lf: 90, ra: 88, rf: 90 },
    b: { lt: 90, ls: 90, rt: 90, rs: 90, la: 92, lf: 90, ra: 96, rf: -112 },
  };
}

/** Curl en máquina / predicador en máquina: asiento, almohadilla para el brazo y palanca. */
function curlMachine() {
  return {
    anchor: "hip", at: [90, 108], prop: ["bar", "wrist"], hl: ["arm"],
    a: { t: -88, ua: 52, fa: 40, th: 10, sh: 85 },
    b: { t: -88, ua: 52, fa: -105, th: 10, sh: 85 },
    env: (j) => {
      const a = add(j.shoulder, [3, 7]), b = add(j.shoulder, vec(52, 30));
      const pivot = add(j.shoulder, [40, 36]);
      return (<>
        <Seat x={j.hip[0]} y={j.hip[1] + 7} w={32} />
        <Pad x={j.hip[0] - 14} y={j.hip[1] - 46} w={7} h={46} />
        {line(a, [b[0] + 3, b[1] + 6], 9, C.gear2)}
        {line([a[0] + 6, a[1] + 4], [a[0] + 6, FLOOR], 5, C.gear)}
        <rect x={pivot[0] - 5} y={pivot[1] - 4} width={10} height={FLOOR - pivot[1] + 4} rx={3} fill={C.gear} />
        {line(pivot, j.wrist, 3.4, C.plateEdge)}
        <circle cx={pivot[0]} cy={pivot[1]} r={3.4} fill={C.gear2} stroke={C.cable} strokeWidth={1} />
      </>);
    },
  };
}

/** Curl reverso / inverso (agarre prono): mismo recorrido, resalta el antebrazo. */
function curlReverse(prop) {
  const d = curlStanding({ prop });
  return { ...d, hl: ["forearm", "arm"] };
}

/** Zottman: sube supino y baja prono (se ve el recorrido del curl; resalta bíceps y antebrazo). */
function zottman() {
  const d = curlStanding({ prop: "db" });
  return { ...d, hl: ["arm", "forearm"] };
}

/** Curl martillo cruzado (de frente): la mancuerna neutra cruza hacia el hombro opuesto. */
function hammerCross() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["db", "both"], hl: ["arm"],
    a: { lt: 90, ls: 90, rt: 90, rs: 90, la: 92, lf: 90, ra: 88, rf: 90 },
    b: { lt: 90, ls: 90, rt: 90, rs: 90, la: 92, lf: 90, ra: 96, rf: -158 },
  };
}

/** Curl en polea alta (de frente, un brazo, torre a su lado, brazo abierto a la altura del hombro). */
function curlHighCable() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["bar", "both"], hl: ["arm"],
    cable: { at: [176, 8], to: "rw" },
    a: { lt: 90, ls: 90, rt: 90, rs: 90, la: 92, lf: 90, ra: 0, rf: 0 },
    b: { lt: 90, ls: 90, rt: 90, rs: 90, la: 92, lf: 90, ra: 0, rf: -125 },
  };
}

/** Curl bilateral en polea alta (doble bíceps, dos torres altas). */
function curlHighBilateral() {
  return {
    view: "front", anchor: "foot", at: [100, 138], prop: ["bar", "both"], hl: ["arm"],
    cable: [{ at: [26, 8], to: "lw" }, { at: [174, 8], to: "rw" }],
    a: { lt: 90, ls: 90, rt: 90, rs: 90, la: 180, lf: 180, ra: 0, rf: 0 },
    b: { lt: 90, ls: 90, rt: 90, rs: 90, la: 180, lf: 245, ra: 0, rf: -65 },
  };
}

/** Remo + curl: remo inclinado y, al final, el codo atrás, el antebrazo sube hacia el pecho. */
function rowCurl() {
  return {
    anchor: "foot", at: [96, 138], prop: ["db", "wrist"], hl: ["arm"],
    a: { t: -40, th: 80, sh: 100, ua: 90, fa: 90 },
    b: { t: -40, th: 80, sh: 100, ua: 180, fa: -35 },
  };
}

// ─── Tríceps ─────────────────────────────────────────────────────────────────
function pushdown(prop = "bar", unilateral = false) {
  const d = tricepPushdown();
  const o = { ...d, prop: [prop, "wrist"] };
  if (unilateral) { o.a = { ...d.a, ua2: 92, fa2: 90 }; o.b = { ...d.b, ua2: 92, fa2: 90 }; }
  return o;
}

/** Extensión sobre la cabeza (polea o mancuerna): codos arriba, el antebrazo pasa de detrás de la cabeza a recto. */
function overheadExt(o = {}) {
  return {
    anchor: "foot", at: [100, 138], prop: [o.prop || "rope", "wrist"], hl: ["arm"],
    cable: o.cable ? { at: [26, 76] } : undefined,
    a: { t: -86, th: 90, sh: 90, ua: -80, fa: 150 },
    b: { t: -86, th: 90, sh: 90, ua: -80, fa: -80 },
  };
}

/** Patada de tríceps con mancuerna (torso casi horizontal, brazo pegado al cuerpo, extiende el codo hacia atrás). */
function kickback(o = {}) {
  return {
    anchor: "hip", at: [100, 92], prop: [o.prop || "db", "wrist"], hl: ["arm"],
    cable: o.cable ? { at: [176, 130] } : undefined,
    a: { t: -25, th: 75, sh: 100, ua: 168, fa: 92, ua2: 60, fa2: 80 },
    b: { t: -25, th: 75, sh: 100, ua: 168, fa: 168, ua2: 60, fa2: 80 },
    env: (j) => (o.cable ? null : <Bench x0={j.hip[0] + 28} x1={j.hip[0] + 78} y={96} />),
  };
}

/** JM press: híbrido press cerrado / rompecráneos, la barra baja hacia la garganta con los codos adelante. */
function jmPress() {
  return {
    anchor: "hip", at: [126, 106], prop: ["bar", "wrist"], hl: ["arm"],
    a: { t: 180, ua: -62, fa: -135, th: 15, sh: 85 },
    b: { t: 180, ua: -90, fa: -90, th: 15, sh: 85 },
    env: () => <Bench x0={64} x1={148} />,
  };
}

/** Tate press: mancuernas sobre el pecho, codos abiertos; extiende hasta arriba. */
function tatePress() {
  return {
    anchor: "hip", at: [126, 106], prop: ["db", "wrist"], hl: ["arm"],
    a: { t: 180, ua: -80, fa: 112, th: 15, sh: 85 },
    b: { t: 180, ua: -90, fa: -90, th: 15, sh: 85 },
    env: () => <Bench x0={64} x1={148} />,
  };
}

/** Fondos en banco: manos en el banco detrás del cuerpo, pies en el piso. */
function benchDips() {
  return {
    anchor: "wrist", at: [70, 111], hl: ["arm"],
    a: { t: -94, ua: 98, fa: 94, th: 24, sh: 50 },
    b: { t: -86, ua: 150, fa: 88, th: 10, sh: 36 },
    env: (j) => <Bench x0={j.wrist[0] - 34} x1={j.wrist[0] + 1} y={113} />,
  };
}

/** Fondos en paralelas con lastre (disco colgado de la cintura). */
function weightedDips() {
  return {
    anchor: "wrist", at: [100, 70], prop: ["plate", "hips"], hl: ["arm"],
    a: { t: -90, ua: 90, fa: 90, th: 100, sh: 150 },
    b: { t: -78, ua: 130, fa: 60, th: 110, sh: 160 },
    env: (j) => <DipBars x={j.wrist[0] - 6} y={j.wrist[1] + 3} w={34} />,
  };
}

/** Extensión de tríceps en máquina (sentado, codos apoyados, empuja las manijas hacia abajo). */
function tricepMachine() {
  return {
    anchor: "hip", at: [96, 108], prop: ["bar", "wrist"], hl: ["arm"],
    a: { t: -92, ua: 62, fa: -40, th: 5, sh: 90 },
    b: { t: -92, ua: 62, fa: 52, th: 5, sh: 90 },
    env: (j) => {
      const pivot = add(j.shoulder, [38, 6]);
      return (<>
        <Seat x={j.hip[0]} y={j.hip[1] + 7} w={32} />
        <Pad x={j.hip[0] - 14} y={j.hip[1] - 46} w={7} h={46} />
        {line(add(j.shoulder, [5, 6]), add(j.shoulder, vec(62, 22)), 8, C.gear2)}
        <rect x={pivot[0] - 5} y={pivot[1] - 4} width={10} height={FLOOR - pivot[1] + 4} rx={3} fill={C.gear} />
        {line(pivot, j.wrist, 3.4, C.plateEdge)}
        <circle cx={pivot[0]} cy={pivot[1]} r={3.4} fill={C.gear2} stroke={C.cable} strokeWidth={1} />
      </>);
    },
  };
}

/** Flexiones diamante: manos juntas bajo el pecho (rombo en el piso), codos pegados. */
function diamondPushup() {
  return {
    anchor: "toe", at: [34, 141], hl: ["arm"],
    a: { t: -20, ua: 90, fa: 90, th: 160, sh: 160, ft: 80 },
    b: { t: -8, ua: 150, fa: 40, th: 172, sh: 172, ft: 80 },
    env: (j) => {
      const w = j.wrist;
      return <polygon points={`${w[0]},${w[1] - 1} ${w[0] + 6},${FLOOR - 3} ${w[0]},${FLOOR + 2} ${w[0] - 6},${FLOOR - 3}`} fill="none" stroke={C.accent} strokeWidth={1.2} />;
    },
  };
}

// ─── Antebrazo ───────────────────────────────────────────────────────────────
/** Mano + barra que se flexiona desde la muñeca (para el curl de muñeca). */
function WristHand({ j, from, to, a, b }) {
  const k = Math.max(0, Math.min(1, kOf(j, a, b)));
  const ang = from + (to - from) * k;
  const tip = add(j.wrist, vec(ang, 9));
  return (<>
    {line(j.wrist, tip, 3.4, "url(#mf-head)")}
    <circle cx={tip[0]} cy={tip[1]} r={5.5} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.2} />
    <circle cx={tip[0]} cy={tip[1]} r={2} fill={C.plateEdge} />
  </>);
}
function wristCurl() {
  return {
    anchor: "hip", at: [96, 104], hl: ["forearm"],
    a: { t: -88, ua: 78, fa: 6, th: 8, sh: 88 },
    b: { t: -88, ua: 78, fa: -6, th: 8, sh: 88 },
    env: (j) => (<>
      <Bench x0={j.hip[0] - 20} x1={j.hip[0] + 32} y={j.hip[1] + 7} />
      <WristHand j={j} from={55} to={-55} a={6} b={-6} />
    </>),
  };
}

/** Rodillo de muñeca: barra con cuerda y disco; al enrollar la cuerda sube el disco. */
function wristRoller() {
  return {
    anchor: "foot", at: [92, 138], hl: ["forearm"],
    a: { ...STAND, ua: 5, fa: 4 },
    b: { ...STAND, ua: 5, fa: -4 },
    env: (j) => {
      const k = Math.max(0, Math.min(1, kOf(j, 4, -4)));
      const w = j.wrist;
      const len = 64 - 46 * k;
      const end = [w[0], w[1] + len];
      return (<>
        <circle cx={w[0]} cy={w[1]} r={4} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} />
        {line([w[0], w[1] + 3], end, 1.3, C.cable)}
        <circle cx={end[0]} cy={end[1] + 5} r={9} fill="none" stroke={C.plate} strokeWidth={3.2} />
      </>);
    },
  };
}

/** Agarre de pinza: se levanta la mancuerna/disco sujetándola con la punta de los dedos. */
function pinchGrip() {
  return {
    anchor: "foot", at: [100, 138], prop: ["plate", "wrist"], hl: ["forearm"],
    a: { ...STAND, ua: 92, fa: 90 },
    b: { ...STAND, ua: 92, fa: 55 },
  };
}

// ─── Asignación ejercicio -> movimiento ──────────────────────────────────────
export const ENTRIES = {
  "Curl con barra": curlStanding({ prop: "barbell" }),
  "Curl con barra Z": curlStanding({ prop: "barbell" }),
  "Curl alternado con mancuernas": curlAlternate(),
  "Curl con mancuernas": curlStanding(),
  "Curl martillo": curlStanding(),
  "Curl en polea baja": curlCable(),
  "Curl en banco inclinado": curlIncline(),
  "Curl concentrado": concentrationCurl(),
  "Curl predicador": curlMachine(),
  "Curl en máquina": curlMachine(),
  "Curl reverso con barra": curlReverse("barbell"),
  "Curl inverso con barra": curlReverse("barbell"),
  "Curl inverso con mancuernas": curlReverse("db"),
  "Curl de araña": spiderCurl(),
  "Curl 21s": curlStanding({ prop: "barbell" }),
  "Curl martillo cruzado": hammerCross(),
  "Curl zottman": zottman(),
  "Curl en polea alta": curlHighCable(),
  "Curl bilateral en polea alta": curlHighBilateral(),
  "Bayesian curl": bayesianCurl(),
  "Curl Scott con mancuernas": preacherCurl(),
  "Curl de bíceps en Smith": curlStanding({ prop: "barbell", smith: true }),
  "Remo + curl de bíceps": rowCurl(),
  "Curl martillo en polea": { ...curlCable(), prop: ["rope", "wrist"] },

  "Extensión de tríceps en polea": pushdown("bar"),
  "Extensión de tríceps con cuerda": pushdown("rope"),
  "Extensión de tríceps unilateral": pushdown("bar", true),
  "Press de tríceps en polea alta": pushdown("bar"),
  "Extensión de tríceps sobre cabeza": overheadExt({ prop: "rope", cable: true }),
  "Extensión de tríceps con mancuerna sobre cabeza": overheadExt({ prop: "db" }),
  "Press francés": skullCrusher(),
  "Rompecráneos": skullCrusher(),
  "Rompecráneos con barra Z": skullCrusher(),
  "Rompecráneos con mancuernas": skullCrusher({ prop: "db" }),
  "Extensión de tríceps acostado con mancuernas": skullCrusher({ prop: "db" }),
  "Patada de tríceps": kickback(),
  "Patada de tríceps en polea": kickback({ prop: "bar", cable: true }),
  "Fondos en banco": benchDips(),
  "Dips con lastre": weightedDips(),
  "Extensión de tríceps en máquina": tricepMachine(),
  "Press de banca con agarre cerrado": { ...benchPress(), hl: ["arm"] },
  "Press cerrado en Smith": { ...benchPress({ smith: true }), hl: ["arm"] },
  "Flexiones diamante": diamondPushup(),
  "JM press": jmPress(),
  "Tate press": tatePress(),

  "Curl de muñeca": wristCurl(),
  "Rodillo de muñeca": wristRoller(),
  "Agarre de pinza": pinchGrip(),
};
