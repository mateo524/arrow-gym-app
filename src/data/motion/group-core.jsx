import { Bench, PullupBar, line, C, FLOOR } from "../../components/motion/rig.jsx";

// Movimientos del grupo: core. Formato en src/components/motion/rig.jsx.
// Nota: los ángulos se interpolan numéricamente (180 -> 205, no 180 -> -155) para no dar la vuelta larga.

const BENT = { th: -60, sh: 85 }; // rodillas flexionadas, pies en el piso (acostado)
const SUP = { anchor: "hip", at: [128, 134] }; // acostado boca arriba, cabeza a la izquierda

// Pequeño kettlebell / mancuerna dibujados a mano (para cargar un solo lado en vista de frente)
const KB = ({ at }) => (
  <g>
    <path d={`M${at[0] - 4},${at[1] - 2} a4,4 0 0 1 8,0`} fill="none" stroke={C.plateEdge} strokeWidth={2} />
    <circle cx={at[0]} cy={at[1] + 3} r={6.5} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} />
  </g>
);
const DB = ({ at }) => (
  <g><circle cx={at[0]} cy={at[1]} r={6} fill={C.plate} stroke={C.plateEdge} strokeWidth={1.4} /><circle cx={at[0]} cy={at[1]} r={2} fill={C.plateEdge} /></g>
);

// ─── Acostado boca arriba ────────────────────────────────────────────────────
/** Crunch: despega hombros del piso, manos detrás de la cabeza. */
function crunch(o = {}) {
  const legs = o.legsUp ? { th: -80, sh: 10 } : BENT;
  return {
    ...SUP, hl: ["core"],
    a: { t: 180, ua: -120, fa: 115, ...legs },
    b: { t: 205, ua: -95, fa: 140, ...legs },
  };
}

function sitUp() {
  return {
    ...SUP, hl: ["core"],
    // brazos cruzados sobre el pecho, pies fijos (anclados) y rodillas flexionadas
    a: { t: 180, ua: -25, fa: 205, ...BENT },
    b: { t: 275, ua: 70, fa: 300, ...BENT },
    env: (j) => (<>
      <rect x={j.ankle[0] - 7} y={j.ankle[1] - 3} width={14} height={4} rx={2} fill={C.gear2} />
      <rect x={j.ankle[0] - 2} y={j.ankle[1] - 1} width={4} height={FLOOR - j.ankle[1] + 1} rx={2} fill={C.gear} />
    </>),
  };
}

/** Elevación de piernas rectas acostado (banco opcional). */
function legRaiseLying(o = {}) {
  if (o.bench) {
    return {
      anchor: "hip", at: [128, 106], hl: ["core"],
      a: { t: 180, ua: 175, fa: 180, th: 35, sh: 35 },
      b: { t: 180, ua: 175, fa: 180, th: -85, sh: -85 },
      env: () => <Bench x0={48} x1={140} />,
    };
  }
  return {
    ...SUP, hl: ["core"],
    a: { t: 180, ua: 5, fa: 5, th: -4, sh: -4 },
    b: { t: 180, ua: 5, fa: 5, th: -88, sh: -88 },
  };
}

function reverseCrunch() {
  return {
    anchor: "wrist", at: [125, 139], hl: ["core"],
    a: { t: 180, ua: 5, fa: 5, th: -80, sh: 10 },
    b: { t: 168, ua: 5, fa: 5, th: -130, sh: 0 },
  };
}

function deadBug() {
  return {
    ...SUP, hl: ["core"],
    a: { t: 180, ua: -90, fa: -90, ua2: -90, fa2: -90, th: -90, sh: 0, th2: -90, sh2: 0 },
    b: { t: 180, ua: 170, fa: 175, ua2: -90, fa2: -90, th: -90, sh: 0, th2: -8, sh2: -4 },
  };
}

function hollow(rocks) {
  if (rocks) {
    return {
      ...SUP, hl: ["core"],
      a: { t: 192, ua: 192, fa: 192, th: -32, sh: -32 },
      b: { t: 210, ua: 210, fa: 210, th: -12, sh: -12 },
    };
  }
  return {
    ...SUP, hl: ["core"],
    a: { t: 180, ua: 180, fa: 180, th: 0, sh: 0 },
    b: { t: 200, ua: 200, fa: 200, th: -20, sh: -20 },
  };
}

function bicycle() {
  const arm = { ua: -95, fa: 140 };
  return {
    ...SUP, hl: ["core"],
    a: { t: 205, ...arm, th: -115, sh: 20, th2: -20, sh2: -20 },
    b: { t: 205, ...arm, th: -20, sh: -20, th2: -115, sh2: 20 },
  };
}

function heelTouch() {
  // De perfil la flexion lateral no se ve (se probo vista cenital: se lee como figura de pie). Se muestra el alternado
  // como el brazo cercano estirado hacia el talon (a) y el lejano (b), con los hombros despegados.
  return {
    ...SUP, hl: ["core"],
    a: { t: 190, ua: 4, fa: 0, ua2: 28, fa2: 18, ...BENT },
    b: { t: 190, ua: 28, fa: 18, ua2: 4, fa2: 0, ...BENT },
  };
}

function toeTouch() {
  return {
    ...SUP, hl: ["core"],
    a: { t: 180, ua: -100, fa: -100, th: -88, sh: -88 },
    b: { t: 240, ua: -60, fa: -60, th: -88, sh: -88 },
  };
}

function vUp() {
  return {
    ...SUP, hl: ["core"],
    a: { t: 180, ua: 180, fa: 180, th: -6, sh: -6 },
    b: { t: 235, ua: -17, fa: -17, th: -55, sh: -55 },
  };
}

// ─── Planchas y apoyos ───────────────────────────────────────────────────────
/** Plancha con antebrazos. raiseLeg: eleva la pierna lejana. */
function plankForearm(o = {}) {
  const a = { t: -9, ua: 90, fa: 0, th: 171, sh: 171, ft: 60 };
  const b = o.raiseLeg ? { ...a, th2: 190, sh2: 190 } : { ...a, t: -14, th: 166, sh: 166 };
  const a2 = o.raiseLeg ? { ...a, th2: 171, sh2: 171 } : a;
  return { anchor: "toe", at: [40, 141], hl: ["core"], a: a2, b };
}

/** Plancha alta con elevación de un brazo (el brazo cercano se estira al frente). */
function plankArmReach() {
  const base = { t: -23, th: 157, sh: 157, ft: 35, ua2: 90, fa2: 90 };
  return {
    anchor: "toe", at: [34, 141], hl: ["core"],
    a: { ...base, ua: 90, fa: 90 },
    b: { ...base, ua: -14, fa: -14 },
  };
}

function mountainClimber() {
  const base = { t: -23, ua: 90, fa: 90, ft: 35, th: 157, sh: 157 };
  return {
    anchor: "wrist", at: [150, 138], hl: ["core"],
    // alternan las dos piernas: a = pierna lejana al pecho, b = pierna cercana al pecho
    a: { ...base, th: 157, sh: 157, th2: 30, sh2: 155 },
    b: { ...base, th: 30, sh: 155, th2: 157, sh2: 157 },
  };
}

function bearCrawl() {
  // cuadrupedia con rodillas flotando ~5 cm; brazo y pierna opuestos avanzan juntos
  const base = { t: -12, ft: 135 };
  return {
    anchor: "hip", at: [117, 108], hl: ["core"],
    a: { ...base, ua: 90, fa: 90, ua2: 40, fa2: 15, th: 50, sh: 170, th2: 90, sh2: 180 },
    b: { ...base, ua: 40, fa: 15, ua2: 90, fa2: 90, th: 90, sh: 180, th2: 50, sh2: 170 },
  };
}

/** Plancha lateral (de frente): cuerpo en diagonal apoyado en el antebrazo, caderas suben/bajan. */
function sidePlank() {
  const arms = { la: -100, lf: -95, ra: 82, rf: 40 };
  return {
    view: "front", anchor: "foot", at: [78, 139], hl: ["core"],
    a: { lean: 78, lt: 170, ls: 170, rt: 170, rs: 170, ...arms },
    b: { lean: 82, lt: 163, ls: 163, rt: 163, rs: 163, ...arms },
  };
}

function lSit() {
  return {
    anchor: "wrist", at: [96, 130], hl: ["core"],
    a: { t: -90, ua: 90, fa: 90, th: -30, sh: 60 },
    b: { t: -90, ua: 90, fa: 90, th: 0, sh: 0 },
    env: (j) => (<>
      <rect x={j.wrist[0] - 9} y={j.wrist[1] + 3} width={18} height={FLOOR - j.wrist[1] - 3} rx={3} fill={C.gear2} />
    </>),
  };
}

// ─── Rueda abdominal ─────────────────────────────────────────────────────────
function abWheel(full) {
  return {
    anchor: "foot", at: [50, 138], hl: ["core"],
    a: { t: -22, ua: 88, fa: 88, th: 90, sh: 180, ft: 180 },
    b: full
      ? { t: -4, ua: 6, fa: 6, th: 168, sh: 180, ft: 180 }
      : { t: -8, ua: 14, fa: 14, th: 158, sh: 180, ft: 180 },
    env: (j) => (<>
      <circle cx={j.wrist[0]} cy={j.wrist[1]} r={7} fill={C.gear2} stroke={C.plateEdge} strokeWidth={1.2} />
      <circle cx={j.wrist[0]} cy={j.wrist[1]} r={2} fill={C.plateEdge} />
    </>),
  };
}

// ─── Colgado ─────────────────────────────────────────────────────────────────
function hangingLegRaise() {
  return {
    anchor: "wrist", at: [100, 10], hl: ["core"],
    a: { t: -90, ua: -90, fa: -90, th: 92, sh: 92 },
    b: { t: -90, ua: -90, fa: -90, th: -8, sh: -8 },
    env: () => <PullupBar x={96} y={10} w={170} />,
  };
}

function dragonFlag() {
  return {
    anchor: "wrist", at: [85, 103], hl: ["core"],
    a: { t: 90, ua: 180, fa: 180, th: -90, sh: -90 },
    b: { t: 165, ua: 180, fa: 180, th: -15, sh: -15 },
    env: () => <Bench x0={62} x1={140} y={112} />,
  };
}

// ─── Polea / TRX ─────────────────────────────────────────────────────────────
function cableCrunch(alt) {
  return {
    anchor: "foot", at: [74, 138], prop: ["rope", "wrist"], hl: ["core"],
    cable: { at: [alt ? 150 : 158, 8] },
    a: { t: -85, ua: 0, fa: -150, th: 90, sh: 180, ft: 180 },
    b: { t: -25, ua: 60, fa: -90, th: 90, sh: 180, ft: 180 },
  };
}

function pallof() {
  return {
    // de frente, torre de polea a un lado a altura de pecho: el cable tira de costado y el cuerpo no rota
    view: "front", anchor: "foot", at: [118, 139], prop: ["bar", "hands-mid"], hl: ["core"], cable: { at: [28, 70] },
    a: { lean: 0, lt: 96, ls: 96, rt: 84, rs: 84, la: 105, lf: -25, ra: 75, rf: 205 },
    b: { lean: 0, lt: 96, ls: 96, rt: 84, rs: 84, la: 95, lf: -50, ra: 85, rf: 230 },
  };
}

function cableRotation() {
  const legs = { lt: 98, ls: 98, rt: 82, rs: 82 };
  return {
    view: "front", anchor: "foot", at: [118, 139], hl: ["core"], cable: { at: [28, 66] },
    a: { lean: -6, ...legs, la: 158, lf: 160, ra: 158, rf: 160 },
    b: { lean: 6, ...legs, la: 22, lf: 20, ra: 22, rf: 20 },
  };
}

function trxCrunch() {
  return {
    anchor: "wrist", at: [150, 138], hl: ["core"], extra: [[64, 8]],
    a: { t: -11, ua: 90, fa: 90, th: 169, sh: 169, ft: 80 },
    b: { t: -11, ua: 90, fa: 90, th: 62, sh: 200, ft: 80 },
    env: (j) => (<>
      <rect x={52} y={4} width={24} height={5} rx={2} fill={C.gear} />
      {line([64, 9], j.ankle, 2.2, C.cable)}
      {line([64, 9], j.ankle2, 2.2, C.cable, { opacity: 0.6 })}
    </>),
  };
}

// ─── Rotaciones de frente ────────────────────────────────────────────────────
function russianTwist(prop) {
  const legs = { lt: -125, ls: 80, rt: -55, rs: 100 };
  return {
    view: "front", anchor: "hip", at: [100, 134], hl: ["core"],
    ...(prop ? { prop: [prop, "hands-mid"] } : {}),
    a: { lean: -10, ...legs, la: 140, lf: 150, ra: 140, rf: 150 },
    b: { lean: 10, ...legs, la: 40, lf: 30, ra: 40, rf: 30 },
  };
}

function windmill() {
  const legs = { lt: 106, ls: 106, rt: 74, rs: 74 };
  return {
    view: "front", anchor: "hip", at: [100, 86], hl: ["core"],
    a: { lean: 0, ...legs, la: 100, lf: 95, ra: -90, rf: -90 },
    b: { lean: -52, ...legs, la: 118, lf: 108, ra: -90, rf: -90 },
    env: (j) => <KB at={j.rw} />,
  };
}

// ─── Caminatas con carga (de frente, pasos alternados) ───────────────────────
function carry(o = {}) {
  const arms = { la: 92, lf: 90, ra: 88, rf: 90 };
  const down = { lt: 96, ls: 96, rt: 84, rs: 84 };
  const stepL = { lt: 108, ls: 55, rt: 84, rs: 84 }; // pie izquierdo levantado
  const stepR = { lt: 96, ls: 96, rt: 72, rs: 125 }; // pie derecho levantado
  void down;
  const def = {
    view: "front", anchor: "hip", at: [100, 86], hl: ["core"],
    a: { lean: 0, ...stepL, ...arms },
    b: { lean: 0, ...stepR, ...arms },
  };
  if (o.one) {
    // maletín: carga solo en la mano izquierda; el otro brazo queda libre
    return { ...def, env: (j) => <DB at={[j.lw[0] - 6, j.lw[1] + 4]} /> };
  }
  return { ...def, prop: [o.prop || "db", "both"] };
}

// ─── Boca abajo / cuadrupedia ────────────────────────────────────────────────
const PRONE = { anchor: "hip", at: [92, 135] }; // cabeza a la derecha

function proneHipExt() {
  return {
    ...PRONE, hl: ["glute", "back"],
    a: { t: 0, ua: 8, fa: 8, th: 180, sh: 180 },
    b: { t: 0, ua: 8, fa: 8, th: 200, sh: 200 },
  };
}

function supermanMod() {
  return {
    ...PRONE, hl: ["back"],
    a: { t: 0, ua: 10, fa: 10, ua2: 10, fa2: 10, th: 180, sh: 180, th2: 180, sh2: 180 },
    b: { t: -6, ua: -18, fa: -18, ua2: 10, fa2: 10, th: 180, sh: 180, th2: 203, sh2: 203 },
  };
}

function birdDog() {
  return {
    anchor: "hip", at: [100, 111], hl: ["core"],
    a: { t: -17, ua: 90, fa: 90, ua2: 90, fa2: 90, th: 90, sh: 180, th2: 90, sh2: 180, ft: 180 },
    b: { t: -17, ua: -17, fa: -17, ua2: 90, fa2: 90, th: 90, sh: 180, th2: 197, sh2: 197, ft: 180 },
  };
}

function vacuum() {
  return {
    anchor: "wrist", at: [150, 138], hl: ["core"],
    // a cuatro apoyos (variante confirmada), columna neutra; el abdomen se mete (no es visible): leve cambio de tronco
    a: { t: -17, ua: 90, fa: 90, th: 90, sh: 180, ft: 180 },
    b: { t: -27, ua: 90, fa: 90, th: 90, sh: 180, ft: 180 },
  };
}

export const ENTRIES = {
  "Crunch": crunch(),
  "Crunch en polea": cableCrunch(false),
  "Plancha frontal": plankForearm(),
  "Plancha lateral": sidePlank(),
  "Elevación de piernas colgado": hangingLegRaise(),
  "Elevación de piernas en banco": legRaiseLying({ bench: true }),
  "Rueda abdominal": abWheel(false),
  "Russian twist": russianTwist(null),
  "Pallof press": pallof(),
  "Dead bug": deadBug(),
  "Hollow body": hollow(false),
  "Escaladores": mountainClimber(),
  "Bicicleta abdominal": bicycle(),
  "Toques de talón": heelTouch(),
  "Toques de punta": toeTouch(),
  "Dragon flag": dragonFlag(),
  "Rueda abdominal extensión": abWheel(true),
  "Crunch inverso": reverseCrunch(),
  "Vacío abdominal": vacuum(),
  "Giros rusos con peso": russianTwist("db"),
  "Extensión de cadera prona": proneHipExt(),
  "Crunch con peso en polea alta": cableCrunch(true),
  "L-sit": lSit(),
  "Plancha con elevación de brazo": plankArmReach(),
  "Windmill": windmill(),
  "Rotación de tronco con polea": cableRotation(),
  "Caminata con maletín": carry({ one: true }),
  "Caminata del granjero": carry(),
  "Crunch en TRX": trxCrunch(),
  "Abdominales en V": vUp(),
  "Escalador (mountain climber)": mountainClimber(),
  "Bear crawl": bearCrawl(),
  "Farmer carry": carry(),
  "Farmer carry con kettlebell": carry({ prop: "kb" }),
  "Suitcase carry": carry({ one: true }),
  "Sit-up": sitUp(),
  "Bird dog": birdDog(),
  "Leg raise": legRaiseLying(),
  "Russian twist con peso": russianTwist("plate"),
  "Plancha con elevación de pierna": plankForearm({ raiseLeg: true }),
  "Crunch con piernas elevadas": crunch({ legsUp: true }),
  "Hollow body rocks": hollow(true),
  "Superman modificado": supermanMod(),
};
