import { Bench, InclinePad, Seat, Pad, line, FLOOR, C, vec, add } from "../../components/motion/rig.jsx";

// Factorías de movimientos base (perfil). Los demás archivos de esta carpeta pueden importarlas y variarlas.
// Convención: cada una devuelve una def con pose a (inicio) y b (final); `o` = { prop, smith }.

const STAND = { t: -90, th: 90, sh: 90 };

/** Press de pecho acostado. angle = inclinación del respaldo en grados (0 = plano, 35 = inclinado, -15 = declinado). */
export function benchPress(o = {}) {
  const angle = o.angle ?? 0;
  const prop = o.prop || "barbell";
  if (angle === 0) {
    return {
      anchor: "hip", at: [126, 106], prop: [prop, "wrist"], hl: ["chest", "arm"], smith: o.smith,
      a: { t: 180, ua: 84, fa: -92, th: 15, sh: 85 },
      b: { t: 180, ua: -90, fa: -90, th: 15, sh: 85 },
      env: () => <Bench x0={64} x1={148} />,
    };
  }
  const t = -(180 - angle); // 35 -> -145
  return {
    anchor: "hip", at: [128, 106], prop: [prop, "wrist"], hl: ["chest", "shoulder"], smith: o.smith,
    a: { t, ua: 66, fa: -100, th: 15, sh: 85 },
    b: { t, ua: -78, fa: -80, th: 15, sh: 85 },
    env: (j) => <InclinePad j={j} ext={12} />,
  };
}

/** Press de pecho en máquina, sentado (respaldo y palanca). */
export function chestPressMachine() {
  return {
    anchor: "hip", at: [104, 108], prop: ["bar", "wrist"], hl: ["chest", "arm"],
    a: { t: -93, ua: 158, fa: 8, th: -4, sh: 85 },
    b: { t: -93, ua: 4, fa: 2, th: -4, sh: 85 },
    env: () => (<>
      <Seat x={103} y={114} w={34} />
      <Pad x={76} y={62} w={9} h={52} />
      <rect x={150} y={52} width={10} height={90} rx={4} fill={C.gear} />
    </>),
  };
}

/** Press de hombros de pie. */
export function overheadPress(o = {}) {
  return {
    anchor: "foot", at: [100, 138], prop: [o.prop || "barbell", "wrist"], hl: ["shoulder", "arm"], smith: o.smith,
    a: { ...STAND, ua: 75, fa: -85 },
    b: { ...STAND, ua: -90, fa: -90 },
  };
}

/** Curl de bíceps de pie (barra, mancuernas, Z). */
export function curlStanding(o = {}) {
  return {
    anchor: "foot", at: [100, 138], prop: [o.prop || "db", "wrist"], hl: ["arm"], smith: o.smith,
    a: { ...STAND, ua: 92, fa: 88 },
    b: { ...STAND, ua: 84, fa: -68 },
  };
}

/** Curl en polea baja (de pie, de frente a la torre). */
export function curlCable() {
  return {
    anchor: "foot", at: [92, 138], prop: ["bar", "wrist"], hl: ["arm"], cable: { at: [176, 130] },
    a: { ...STAND, ua: 92, fa: 88 },
    b: { ...STAND, ua: 84, fa: -68 },
  };
}

export function rowSeatedCable() {
  return {
    anchor: "hip", at: [108, 108], prop: ["bar", "wrist"], hl: ["back", "arm"], cable: { at: [188, 126] },
    a: { t: -92, ua: 2, fa: 2, th: -4, sh: 85 },
    b: { t: -98, ua: 168, fa: 6, th: -4, sh: 85 },
    env: () => (<><Seat x={107} y={114} w={34} /><rect x={150} y={124} width={30} height={5} rx={2} fill={C.gear2} /></>),
  };
}

export function pulldown() {
  return {
    anchor: "hip", at: [100, 110], prop: ["bar", "wrist"], hl: ["back", "arm"], cable: { at: [108, 6] },
    a: { t: -96, ua: -82, fa: -82, th: -12, sh: 88 },
    b: { t: -104, ua: 122, fa: -58, th: -12, sh: 88 },
    env: () => (<><Seat x={98} y={116} w={32} /><rect x={112} y={96} width={26} height={6} rx={3} fill={C.gear2} transform="rotate(-8 112 96)" /></>),
  };
}

export function squat(o = {}) {
  return {
    anchor: "foot", at: [96, 138], prop: [o.prop || "barbell", "shoulder"], hl: ["thigh", "glute"], smith: o.smith,
    a: { ...STAND, ua: 125, fa: -35 },
    b: { t: -62, th: 14, sh: 106, ua: 125, fa: -35 },
  };
}

export function deadlift(o = {}) {
  return {
    anchor: "foot", at: [96, 138], prop: [o.prop || "barbell", "wrist"], hl: ["back", "glute"],
    a: { t: -32, th: 44, sh: 100, ua: 92, fa: 92 },
    b: { ...STAND, ua: 92, fa: 92 },
  };
}

export function spiderCurl() {
  return {
    anchor: "hip", at: [92, 100], prop: ["db", "wrist"], hl: ["arm"],
    a: { t: -45, ua: 90, fa: 88, th: 72, sh: 100 },
    b: { t: -45, ua: 90, fa: -125, th: 72, sh: 100 },
    env: (j) => {
      const a = add(j.hip, [5, 7]), b = add(j.shoulder, [4, 7]);
      return (<>
        {line(a, [b[0] + 4, b[1] - 2], 9, C.gear2)}
        <rect x={j.hip[0] - 16} y={j.hip[1] + 14} width={34} height={7} rx={3} fill={C.gear2} />
        {line([j.hip[0], j.hip[1] + 21], [j.hip[0], FLOOR], 5, C.gear)}
        {line([b[0] + 2, b[1] + 4], [b[0] + 2, FLOOR], 5, C.gear)}
      </>);
    },
  };
}

export function bayesianCurl() {
  return {
    anchor: "foot", at: [118, 138], prop: ["bar", "wrist"], hl: ["arm"], cable: { at: [22, 130] },
    a: { t: -82, th: 90, sh: 90, ua: 112, fa: 98 },
    b: { t: -82, th: 90, sh: 90, ua: 112, fa: -62 },
  };
}

export function curlIncline() {
  return {
    anchor: "hip", at: [112, 108], prop: ["db", "wrist"], hl: ["arm"],
    a: { t: -125, ua: 92, fa: 90, th: 10, sh: 85 },
    b: { t: -125, ua: 92, fa: -70, th: 10, sh: 85 },
    env: (j) => <InclinePad j={j} ext={10} />,
  };
}

export function preacherCurl(o = {}) {
  return {
    anchor: "hip", at: [90, 108], prop: [o.prop || "db", "wrist"], hl: ["arm"],
    a: { t: -86, ua: 56, fa: 58, th: 10, sh: 85 },
    b: { t: -86, ua: 56, fa: -105, th: 10, sh: 85 },
    env: (j) => {
      const a = add(j.shoulder, [3, 6]), b = add(j.shoulder, vec(56, 36));
      return (<>
        {line(a, [b[0] + 3, b[1] + 6], 9, C.gear2)}
        {line([a[0] + 4, a[1]], [a[0] + 4, FLOOR], 5, C.gear)}
        <Seat x={j.hip[0]} y={j.hip[1] + 7} w={32} />
      </>);
    },
  };
}

export function concentrationCurl() {
  return {
    anchor: "hip", at: [96, 108], prop: ["db", "wrist"], hl: ["arm"],
    a: { t: -30, ua: 100, fa: 76, th: 5, sh: 90 },
    b: { t: -30, ua: 100, fa: -82, th: 5, sh: 90 },
    env: (j) => <Bench x0={j.hip[0] - 20} x1={j.hip[0] + 32} y={j.hip[1] + 7} />,
  };
}

export function tricepPushdown() {
  return {
    anchor: "foot", at: [100, 138], prop: ["bar", "wrist"], hl: ["arm"], cable: { at: [112, 8] },
    a: { t: -84, th: 90, sh: 90, ua: 88, fa: -8 },
    b: { t: -84, th: 90, sh: 90, ua: 88, fa: 86 },
  };
}

export function skullCrusher(o = {}) {
  return {
    anchor: "hip", at: [126, 106], prop: [o.prop || "bar", "wrist"], hl: ["arm"],
    a: { t: 180, ua: -86, fa: -168, th: 15, sh: 85 },
    b: { t: 180, ua: -86, fa: -88, th: 15, sh: 85 },
    env: () => <Bench x0={64} x1={148} />,
  };
}

// ─── Asignación ejercicio -> movimiento (nombres exactos, tal como están en exerciseDatabase.js) ───
export const ENTRIES = {
  "Press de banca plano": benchPress(),
  "Press de banca con pausa": benchPress(),
  "Press de pecho con mancuernas": benchPress({ prop: "db" }),
  "Press de banca en Smith": benchPress({ smith: true }),
  "Press de banca inclinado": benchPress({ angle: 35 }),
  "Press inclinado con mancuernas": benchPress({ angle: 35, prop: "db" }),
  "Press inclinado en Smith": benchPress({ angle: 35, smith: true }),
  "Press de pecho en máquina": chestPressMachine(),
  "Press inclinado en máquina": chestPressMachine(),
  "Press militar con barra": overheadPress(),
  "Press con mancuernas": overheadPress({ prop: "db" }),
  "Press militar en Smith": overheadPress({ smith: true }),
  "Overhead press en Smith": overheadPress({ smith: true }),
  "Remo en polea baja": rowSeatedCable(),
  "Remo bajo en máquina": rowSeatedCable(),
  "Jalón al pecho con barra": pulldown(),
  "Jalón con agarre estrecho": pulldown(),
  "Jalón neutro": pulldown(),
  "Jalón en polea": pulldown(),
  "Pulldown con agarre supino": pulldown(),
  "Curl con barra": curlStanding({ prop: "barbell" }),
  "Curl con barra Z": curlStanding({ prop: "barbell" }),
  "Curl con mancuernas": curlStanding(),
  "Curl alternado con mancuernas": curlStanding(),
  "Curl martillo": curlStanding(),
  "Curl en polea baja": curlCable(),
  "Curl de bíceps en Smith": curlStanding({ prop: "barbell", smith: true }),
  "Curl de araña": spiderCurl(),
  "Bayesian curl": bayesianCurl(),
  "Curl en banco inclinado": curlIncline(),
  "Curl predicador": preacherCurl(),
  "Curl Scott con mancuernas": preacherCurl(),
  "Curl concentrado": concentrationCurl(),
  "Extensión de tríceps en polea": tricepPushdown(),
  "Extensión de tríceps con cuerda": { ...tricepPushdown(), prop: ["rope", "wrist"] },
  "Extensión de tríceps unilateral": tricepPushdown(),
  "Press de tríceps en polea alta": tricepPushdown(),
  "Rompecráneos": skullCrusher(),
  "Rompecráneos con barra Z": skullCrusher(),
  "Rompecráneos con mancuernas": skullCrusher({ prop: "db" }),
  "Press francés": skullCrusher(),
  "Extensión de tríceps acostado con mancuernas": skullCrusher({ prop: "db" }),
  "Sentadilla libre": squat(),
  "Sentadilla en Smith": squat({ smith: true }),
  "Sentadilla frontal": squat(),
  "Peso muerto": deadlift(),
  "Peso muerto con déficit": deadlift(),
};
