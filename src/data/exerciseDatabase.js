export const BODY_GROUPS = ["Hombros", "Pecho", "Espalda", "Brazos", "Piernas", "Core"];

export const MUSCLES_BY_GROUP = {
  Hombros: ["Deltoide anterior", "Deltoide lateral", "Deltoide posterior", "Manguito rotador", "Trapecio superior"],
  Pecho: ["Pectoral superior", "Pectoral mayor", "Pectoral inferior", "Serrato anterior"],
  Espalda: ["Dorsales", "Romboides", "Trapecio medio", "Trapecio inferior", "Erectores espinales", "Redondo mayor"],
  Brazos: ["Bíceps", "Tríceps", "Braquial", "Antebrazo", "Braquiorradial"],
  Piernas: ["Cuádriceps", "Isquios", "Glúteos", "Aductores", "Abductores", "Gemelos", "Sóleo"],
  Core: ["Recto abdominal", "Oblicuos", "Transverso abdominal", "Lumbar", "Flexores de cadera"],
};

function slug(v) {
  return v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function ex(name, group, muscle, equipment, pattern) {
  return { id: slug(name), name, group, muscle, equipment, pattern, builtin: true };
}

export const EXERCISE_DATABASE = [
  // ── PECHO ──────────────────────────────────────────────────────────────────
  ex("Press de banca plano", "Pecho", "Pectoral mayor", "Barra", "push"),
  ex("Press de banca inclinado", "Pecho", "Pectoral superior", "Barra", "push"),
  ex("Press de banca declinado", "Pecho", "Pectoral inferior", "Barra", "push"),
  ex("Press de pecho con mancuernas", "Pecho", "Pectoral mayor", "Mancuernas", "push"),
  ex("Press inclinado con mancuernas", "Pecho", "Pectoral superior", "Mancuernas", "push"),
  ex("Aperturas planas con mancuernas", "Pecho", "Pectoral mayor", "Mancuernas", "push"),
  ex("Aperturas inclinadas con mancuernas", "Pecho", "Pectoral superior", "Mancuernas", "push"),
  ex("Press de pecho en máquina", "Pecho", "Pectoral mayor", "Máquina", "push"),
  ex("Press inclinado en máquina", "Pecho", "Pectoral superior", "Máquina", "push"),
  ex("Cruces en polea alta", "Pecho", "Pectoral mayor", "Polea", "push"),
  ex("Cruces en polea baja", "Pecho", "Pectoral inferior", "Polea", "push"),
  ex("Cruces en polea media", "Pecho", "Pectoral mayor", "Polea", "push"),
  ex("Fondos en paralelas", "Pecho", "Pectoral inferior", "Peso corporal", "push"),
  ex("Push up", "Pecho", "Pectoral mayor", "Peso corporal", "push"),
  ex("Push up inclinado", "Pecho", "Pectoral superior", "Peso corporal", "push"),
  ex("Pullover con mancuerna", "Pecho", "Pectoral mayor", "Mancuernas", "push"),
  ex("Pullover en polea", "Pecho", "Pectoral mayor", "Polea", "push"),
  ex("Dip asistido", "Pecho", "Pectoral mayor", "Máquina", "push"),
  ex("Cable chest fly", "Pecho", "Pectoral mayor", "Polea", "push"),
  ex("Pec deck", "Pecho", "Pectoral mayor", "Máquina", "push"),

  // ── ESPALDA ────────────────────────────────────────────────────────────────
  ex("Jalón al pecho con barra", "Espalda", "Dorsales", "Máquina", "pull"),
  ex("Jalón con agarre estrecho", "Espalda", "Dorsales", "Máquina", "pull"),
  ex("Jalón neutro", "Espalda", "Dorsales", "Polea", "pull"),
  ex("Jalón en polea", "Espalda", "Dorsales", "Polea", "pull"),
  ex("Remo en polea baja", "Espalda", "Romboides", "Polea", "pull"),
  ex("Remo en polea con barra", "Espalda", "Romboides", "Polea", "pull"),
  ex("Remo con barra", "Espalda", "Romboides", "Barra", "pull"),
  ex("Remo con mancuerna", "Espalda", "Dorsales", "Mancuernas", "pull"),
  ex("Remo en máquina", "Espalda", "Romboides", "Máquina", "pull"),
  ex("Remo alto en máquina", "Espalda", "Trapecio medio", "Máquina", "pull"),
  ex("Pull-up", "Espalda", "Dorsales", "Peso corporal", "pull"),
  ex("Chin-up", "Espalda", "Dorsales", "Peso corporal", "pull"),
  ex("Dominadas neutras", "Espalda", "Dorsales", "Peso corporal", "pull"),
  ex("Remo unilateral en polea", "Espalda", "Dorsales", "Polea", "pull"),
  ex("Straight arm pulldown", "Espalda", "Dorsales", "Polea", "pull"),
  ex("Extensiones de espalda", "Espalda", "Erectores espinales", "Máquina", "pull"),
  ex("Hiperextensiones", "Espalda", "Erectores espinales", "Peso corporal", "pull"),
  ex("Good morning", "Espalda", "Erectores espinales", "Barra", "pull"),
  ex("Remo invertido con barra", "Espalda", "Romboides", "Barra", "pull"),
  ex("Encogimientos con barra", "Espalda", "Trapecio superior", "Barra", "pull"),
  ex("Encogimientos con mancuernas", "Espalda", "Trapecio superior", "Mancuernas", "pull"),
  ex("T-bar row", "Espalda", "Dorsales", "Landmine", "pull"),
  ex("Remo Yates", "Espalda", "Dorsales", "Barra", "pull"),

  // ── HOMBROS ────────────────────────────────────────────────────────────────
  ex("Press militar con barra", "Hombros", "Deltoide anterior", "Barra", "push"),
  ex("Press con mancuernas", "Hombros", "Deltoide anterior", "Mancuernas", "push"),
  ex("Press Arnold", "Hombros", "Deltoide anterior", "Mancuernas", "push"),
  ex("Press en máquina de hombros", "Hombros", "Deltoide anterior", "Máquina", "push"),
  ex("Landmine press", "Hombros", "Deltoide anterior", "Landmine", "push"),
  ex("Elevaciones laterales con mancuernas", "Hombros", "Deltoide lateral", "Mancuernas", "push"),
  ex("Elevaciones laterales en polea", "Hombros", "Deltoide lateral", "Polea", "push"),
  ex("Elevaciones laterales en máquina", "Hombros", "Deltoide lateral", "Máquina", "push"),
  ex("Elevaciones frontales con mancuernas", "Hombros", "Deltoide anterior", "Mancuernas", "push"),
  ex("Elevaciones frontales con barra", "Hombros", "Deltoide anterior", "Barra", "push"),
  ex("Elevaciones posteriores con mancuernas", "Hombros", "Deltoide posterior", "Mancuernas", "pull"),
  ex("Elevaciones posteriores en polea", "Hombros", "Deltoide posterior", "Polea", "pull"),
  ex("Face pull", "Hombros", "Deltoide posterior", "Polea", "pull"),
  ex("Pájaros con mancuernas", "Hombros", "Deltoide posterior", "Mancuernas", "pull"),
  ex("Rotación externa en polea", "Hombros", "Manguito rotador", "Polea", "rehab"),
  ex("Rotación interna en polea", "Hombros", "Manguito rotador", "Polea", "rehab"),
  ex("Upright row con barra", "Hombros", "Trapecio superior", "Barra", "pull"),
  ex("Cuban press", "Hombros", "Manguito rotador", "Mancuernas", "rehab"),

  // ── BRAZOS ────────────────────────────────────────────────────────────────
  ex("Curl con barra", "Brazos", "Bíceps", "Barra", "pull"),
  ex("Curl con barra Z", "Brazos", "Bíceps", "Barra", "pull"),
  ex("Curl alternado con mancuernas", "Brazos", "Bíceps", "Mancuernas", "pull"),
  ex("Curl con mancuernas", "Brazos", "Bíceps", "Mancuernas", "pull"),
  ex("Curl martillo", "Brazos", "Braquial", "Mancuernas", "pull"),
  ex("Curl en polea baja", "Brazos", "Bíceps", "Polea", "pull"),
  ex("Curl en banco inclinado", "Brazos", "Bíceps", "Mancuernas", "pull"),
  ex("Curl concentrado", "Brazos", "Bíceps", "Mancuernas", "pull"),
  ex("Curl predicador", "Brazos", "Bíceps", "Máquina", "pull"),
  ex("Curl en máquina", "Brazos", "Bíceps", "Máquina", "pull"),
  ex("Curl reverso con barra", "Brazos", "Braquiorradial", "Barra", "pull"),
  ex("Extensión de tríceps en polea", "Brazos", "Tríceps", "Polea", "push"),
  ex("Extensión de tríceps con cuerda", "Brazos", "Tríceps", "Polea", "push"),
  ex("Extensión de tríceps unilateral", "Brazos", "Tríceps", "Polea", "push"),
  ex("Extensión de tríceps sobre cabeza", "Brazos", "Tríceps", "Polea", "push"),
  ex("Press francés", "Brazos", "Tríceps", "Barra", "push"),
  ex("Skullcrusher", "Brazos", "Tríceps", "Barra", "push"),
  ex("Skullcrusher con mancuernas", "Brazos", "Tríceps", "Mancuernas", "push"),
  ex("Patada de tríceps", "Brazos", "Tríceps", "Mancuernas", "push"),
  ex("Dips en banco", "Brazos", "Tríceps", "Peso corporal", "push"),
  ex("Extensión de tríceps en máquina", "Brazos", "Tríceps", "Máquina", "push"),
  ex("Curl de muñeca", "Brazos", "Antebrazo", "Barra", "pull"),

  // ── PIERNAS ────────────────────────────────────────────────────────────────
  ex("Sentadilla libre", "Piernas", "Cuádriceps", "Barra", "legs"),
  ex("Sentadilla en Smith", "Piernas", "Cuádriceps", "Smith", "legs"),
  ex("Sentadilla hack en máquina", "Piernas", "Cuádriceps", "Máquina", "legs"),
  ex("Sentadilla goblet", "Piernas", "Cuádriceps", "Kettlebell", "legs"),
  ex("Sentadilla frontal", "Piernas", "Cuádriceps", "Barra", "legs"),
  ex("Prensa de piernas", "Piernas", "Cuádriceps", "Máquina", "legs"),
  ex("Prensa de piernas 45°", "Piernas", "Cuádriceps", "Máquina", "legs"),
  ex("Extensión de cuádriceps", "Piernas", "Cuádriceps", "Máquina", "legs"),
  ex("Curl de isquios acostado", "Piernas", "Isquios", "Máquina", "legs"),
  ex("Curl de isquios sentado", "Piernas", "Isquios", "Máquina", "legs"),
  ex("Peso muerto rumano", "Piernas", "Isquios", "Barra", "legs"),
  ex("Peso muerto rumano con mancuernas", "Piernas", "Isquios", "Mancuernas", "legs"),
  ex("Peso muerto", "Piernas", "Isquios", "Barra", "legs"),
  ex("Peso muerto sumo", "Piernas", "Glúteos", "Barra", "legs"),
  ex("Zancada con mancuernas", "Piernas", "Glúteos", "Mancuernas", "legs"),
  ex("Zancada búlgara", "Piernas", "Glúteos", "Mancuernas", "legs"),
  ex("Hip thrust con barra", "Piernas", "Glúteos", "Barra", "legs"),
  ex("Hip thrust en máquina", "Piernas", "Glúteos", "Máquina", "legs"),
  ex("Glute kickback en máquina", "Piernas", "Glúteos", "Máquina", "legs"),
  ex("Abductor en máquina", "Piernas", "Abductores", "Máquina", "legs"),
  ex("Aductor en máquina", "Piernas", "Aductores", "Máquina", "legs"),
  ex("Elevación de pantorrillas de pie", "Piernas", "Gemelos", "Máquina", "legs"),
  ex("Elevación de pantorrillas sentado", "Piernas", "Sóleo", "Máquina", "legs"),
  ex("Elevación de pantorrillas en prensa", "Piernas", "Gemelos", "Máquina", "legs"),
  ex("Step-up con mancuernas", "Piernas", "Glúteos", "Mancuernas", "legs"),
  ex("RDL unilateral", "Piernas", "Isquios", "Mancuernas", "legs"),
  ex("Nordic curl", "Piernas", "Isquios", "Peso corporal", "legs"),
  ex("Sentadilla sissy", "Piernas", "Cuádriceps", "Peso corporal", "legs"),
  ex("Leg press unilateral", "Piernas", "Cuádriceps", "Máquina", "legs"),

  // ── CORE ──────────────────────────────────────────────────────────────────
  ex("Crunch", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Crunch en polea", "Core", "Recto abdominal", "Polea", "core"),
  ex("Plancha frontal", "Core", "Transverso abdominal", "Peso corporal", "core"),
  ex("Plancha lateral", "Core", "Oblicuos", "Peso corporal", "core"),
  ex("Elevación de piernas colgado", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Elevación de piernas en banco", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Rueda abdominal", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Russian twist", "Core", "Oblicuos", "Peso corporal", "core"),
  ex("Pallof press", "Core", "Transverso abdominal", "Polea", "core"),
  ex("Dead bug", "Core", "Transverso abdominal", "Peso corporal", "core"),
  ex("Hollow body", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Mountain climbers", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Bicicleta abdominal", "Core", "Oblicuos", "Peso corporal", "core"),
  ex("Heel touches", "Core", "Oblicuos", "Peso corporal", "core"),
  ex("Toe touches", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Dragon flag", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Ab wheel rollout", "Core", "Transverso abdominal", "Peso corporal", "core"),
  ex("Crunch inverso", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Vacío abdominal", "Core", "Transverso abdominal", "Peso corporal", "core"),
  ex("Giros rusos con peso", "Core", "Oblicuos", "Mancuernas", "core"),
  ex("Extensión de cadera prona", "Core", "Lumbar", "Peso corporal", "core"),
];

export function findExerciseMeta(name) {
  const clean = String(name || "").toLowerCase().trim();
  return EXERCISE_DATABASE.find((e) => e.name.toLowerCase() === clean) || null;
}

export function resolveExerciseGroup(name, fallback = "Core") {
  const meta = findExerciseMeta(name);
  if (meta?.group) return meta.group;
  const clean = String(name || "").toLowerCase();
  if (clean.includes("hombro") || clean.includes("shoulder") || clean.includes("lateral") || clean.includes("face pull") || clean.includes("deltoide") || clean.includes("militar") || clean.includes("landmine") || clean.includes("elevacion")) return "Hombros";
  if (clean.includes("pecho") || clean.includes("chest") || clean.includes("press") || clean.includes("pec") || clean.includes("apertura")) return "Pecho";
  if (clean.includes("espalda") || clean.includes("row") || clean.includes("pull") || clean.includes("jalon") || clean.includes("remo") || clean.includes("dorsal")) return "Espalda";
  if (clean.includes("curl") || clean.includes("bicep") || clean.includes("tricep") || clean.includes("extension de tricep") || clean.includes("brazo")) return "Brazos";
  if (clean.includes("pierna") || clean.includes("sentadilla") || clean.includes("press de") || clean.includes("squat") || clean.includes("leg") || clean.includes("pantorrilla") || clean.includes("zancada") || clean.includes("peso muerto") || clean.includes("hip thrust")) return "Piernas";
  return fallback;
}

export function resolveExerciseMuscle(name, fallback = "General") {
  const meta = findExerciseMeta(name);
  if (meta?.muscle) return meta.muscle;
  const clean = String(name || "").toLowerCase();
  if (clean.includes("lateral raise") || clean.includes("elevacion lateral")) return "Deltoide lateral";
  if (clean.includes("face pull") || clean.includes("pajaro") || clean.includes("posterior")) return "Deltoide posterior";
  if (clean.includes("hombro") || clean.includes("shoulder") || clean.includes("press mil") || clean.includes("landmine")) return "Deltoide anterior";
  if (clean.includes("incline") || clean.includes("inclinado")) return "Pectoral superior";
  if (clean.includes("pecho") || clean.includes("chest")) return "Pectoral mayor";
  if (clean.includes("jalon") || clean.includes("pull") || clean.includes("dorsal")) return "Dorsales";
  if (clean.includes("remo") || clean.includes("row")) return "Romboides";
  if (clean.includes("tricep") || clean.includes("skullcrusher") || clean.includes("frances")) return "Tríceps";
  if (clean.includes("curl") || clean.includes("bicep")) return "Bíceps";
  if (clean.includes("martillo") || clean.includes("hammer")) return "Braquial";
  if (clean.includes("extension") && !clean.includes("tricep")) return "Cuádriceps";
  if (clean.includes("curl de isquio") || clean.includes("peso muerto") || clean.includes("rdl") || clean.includes("nordic")) return "Isquios";
  if (clean.includes("glute") || clean.includes("gluteo") || clean.includes("hip thrust") || clean.includes("zancada") || clean.includes("step")) return "Glúteos";
  if (clean.includes("sentadilla") || clean.includes("squat") || clean.includes("prensa") || clean.includes("leg press")) return "Cuádriceps";
  if (clean.includes("pantorrilla") || clean.includes("gemelo") || clean.includes("calf")) return "Gemelos";
  if (clean.includes("crunch") || clean.includes("plancha") || clean.includes("abdominal") || clean.includes("abd")) return "Recto abdominal";
  return fallback;
}

function _fuzzyMatch(text, query) {
  if (!query) return true;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function _fuzzyScore(text, query) {
  if (!query) return 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.startsWith(q)) return 100;
  if (t.includes(q)) return 50;
  return 10;
}

export function getFilteredExercises({ query = "", group = "Todos", muscle = "Todos", equipment = "Todos" } = {}) {
  const q = query.trim().toLowerCase();
  const filtered = EXERCISE_DATABASE.filter((e) => {
    if (group !== "Todos" && e.group !== group) return false;
    if (muscle !== "Todos" && e.muscle !== muscle) return false;
    if (equipment !== "Todos" && e.equipment !== equipment) return false;
    if (q) {
      const searchText = `${e.name} ${e.group} ${e.muscle}`;
      if (!_fuzzyMatch(searchText, q)) return false;
    }
    return true;
  });
  if (q) {
    filtered.sort((a, b) => _fuzzyScore(b.name, q) - _fuzzyScore(a.name, q));
  }
  return filtered;
}

export const EQUIPMENT_OPTIONS = ["Máquina", "Polea", "Mancuernas", "Barra", "Kettlebell", "Peso corporal", "Banda", "Banco", "Smith", "Landmine"];
