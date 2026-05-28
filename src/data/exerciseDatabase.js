export const BODY_GROUPS = ["Hombros", "Pecho", "Espalda", "Brazos", "Piernas", "Core", "Cardio"];

export const MUSCLES_BY_GROUP = {
  Hombros: ["Deltoide anterior", "Deltoide lateral", "Deltoide posterior", "Manguito rotador", "Trapecio superior"],
  Pecho: ["Pectoral superior", "Pectoral mayor", "Pectoral inferior", "Serrato anterior"],
  Espalda: ["Dorsales", "Romboides", "Trapecio medio", "Trapecio inferior", "Erectores espinales", "Redondo mayor"],
  Brazos: ["Bíceps", "Tríceps", "Braquial", "Antebrazo", "Braquiorradial"],
  Piernas: ["Cuádriceps", "Isquios", "Glúteos", "Aductores", "Abductores", "Gemelos", "Sóleo"],
  Core: ["Recto abdominal", "Oblicuos", "Transverso abdominal", "Lumbar", "Flexores de cadera"],
  Cardio: ["Cardio general", "Cardio intensidad", "Cardio potencia"],
};

const IMPORTANT = [
  ["Chest Press Machine", "Pecho", "Pectoral mayor", "Máquina", "push"],
  ["Incline Chest Press Machine", "Pecho", "Pectoral superior", "Máquina", "push"],
  ["Landmine Shoulder Press", "Hombros", "Deltoide anterior", "Landmine", "push"],
  ["Cable Lateral Raise", "Hombros", "Deltoide lateral", "Polea", "push"],
  ["Triceps Pushdown", "Brazos", "Tríceps", "Polea", "push"],
  ["Cross Body Triceps Extension", "Brazos", "Tríceps", "Polea", "push"],
  ["Lat Pulldown", "Espalda", "Dorsales", "Máquina", "pull"],
  ["Cable Lat Pulldown", "Espalda", "Dorsales", "Polea", "pull"],
  ["Close Grip Lat Pulldown", "Espalda", "Dorsales", "Polea", "pull"],
  ["Seated Row", "Espalda", "Romboides", "Máquina", "pull"],
  ["High Row Machine", "Espalda", "Trapecio medio", "Máquina", "pull"],
  ["Lat Pullover", "Espalda", "Dorsales", "Polea", "pull"],
  ["Dumbbell Row", "Espalda", "Dorsales", "Mancuernas", "pull"],
  ["Face Pull", "Hombros", "Deltoide posterior", "Polea", "pull"],
  ["Cable Face Pull", "Hombros", "Deltoide posterior", "Polea", "pull"],
  ["Hammer Curl", "Brazos", "Braquial", "Mancuernas", "pull"],
  ["Cable Biceps Curl", "Brazos", "Bíceps", "Polea", "pull"],
  ["Leg Extension", "Piernas", "Cuádriceps", "Máquina", "legs"],
  ["Leg Curl", "Piernas", "Isquios", "Máquina", "legs"],
  ["Bulgarian Split Squat", "Piernas", "Glúteos", "Mancuernas", "legs"],
  ["Romanian Deadlift", "Piernas", "Isquios", "Barra", "legs"],
  ["Squat Multipower", "Piernas", "Cuádriceps", "Smith", "legs"],
  ["Calf Raise", "Piernas", "Gemelos", "Máquina", "legs"],
  ["Heel Touches", "Core", "Oblicuos", "Peso corporal", "core"],
  ["Toe Touches", "Core", "Recto abdominal", "Peso corporal", "core"],
  ["Rear Delt Fly", "Hombros", "Deltoide posterior", "Mancuernas", "pull"],
  ["Shoulder Press Machine", "Hombros", "Deltoide anterior", "Máquina", "push"],
  ["External Rotation Cable", "Hombros", "Manguito rotador", "Polea", "rehab"],
  ["Pallof Press", "Core", "Transverso abdominal", "Polea", "core"],
  ["Plank", "Core", "Transverso abdominal", "Peso corporal", "core"],
  ["Bicicleta fija Technogym", "Cardio", "Cardio general", "Technogym", "cardio"],
  ["Boxeo - Físico HIIT", "Cardio", "Cardio intensidad", "Peso corporal", "cardio"],
  ["Boxeo - Bolsa", "Cardio", "Cardio potencia", "Bolsa", "cardio"],
  ["Cinta de correr", "Cardio", "Cardio general", "Technogym", "cardio"],
];

const MOVES = {
  Hombros: ["Press", "Raise", "Fly", "Rotation", "Y Raise", "Scaption", "Upright Row"],
  Pecho: ["Press", "Fly", "Squeeze Press", "Push Up", "Cable Press", "Dip Assisted"],
  Espalda: ["Row", "Pulldown", "Pullover", "Shrug", "Back Extension", "Reverse Fly"],
  Brazos: ["Curl", "Extension", "Pushdown", "Skullcrusher", "Kickback", "Reverse Curl"],
  Piernas: ["Squat", "Press", "Extension", "Curl", "Lunge", "Raise", "Thrust"],
  Core: ["Crunch", "Plank", "Twist", "Raise", "Carry", "Anti Rotation", "Dead Bug"],
  Cardio: ["Bicicleta", "HIIT", "Bolsa", "Cinta", "Remo", "Elíptico"],
};
const EQUIPMENT = ["Máquina", "Polea", "Mancuernas", "Barra", "Kettlebell", "Peso corporal", "Banda", "Banco", "Smith", "Landmine", "Technogym", "Bolsa", "Guantes"];

function slug(value) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function item(name, group, muscle, equipment, pattern, builtin = true) { return { id: slug(name), name, group, muscle, equipment, pattern, builtin }; }

const generated = [];
BODY_GROUPS.forEach((group) => {
  MUSCLES_BY_GROUP[group].forEach((muscle) => {
    MOVES[group].forEach((move) => {
      EQUIPMENT.forEach((equipment) => {
        ["Neutral", "Controlado", "Unilateral", "Inclinado", "Estricto", "Tempo"].forEach((style) => {
          generated.push(item(`${move} ${style} - ${muscle} (${equipment})`, group, muscle, equipment, group === "Espalda" ? "pull" : group === "Piernas" ? "legs" : group === "Core" ? "core" : "push"));
        });
      });
    });
  });
});

const important = IMPORTANT.map(([name, group, muscle, equipment, pattern]) => item(name, group, muscle, equipment, pattern));
export const EXERCISE_DATABASE = Array.from(new Map([...important, ...generated].map((ex) => [ex.name.toLowerCase(), ex])).values());

export function findExerciseMeta(name) {
  const clean = String(name || "").toLowerCase().trim();
  return EXERCISE_DATABASE.find((exercise) => exercise.name.toLowerCase() === clean) || null;
}

export function resolveExerciseGroup(name, fallback = "Core") {
  const meta = findExerciseMeta(name);
  if (meta?.group) return meta.group;
  const clean = String(name || "").toLowerCase();
  if (clean.includes("landmine") || clean.includes("shoulder") || clean.includes("lateral raise") || clean.includes("face pull") || clean.includes("rear delt") || clean.includes("deltoid")) return "Hombros";
  if (clean.includes("chest") || clean.includes("press") || clean.includes("pec") || clean.includes("fly")) return "Pecho";
  if (clean.includes("row") || clean.includes("pull") || clean.includes("lat") || clean.includes("back")) return "Espalda";
  if (clean.includes("curl") || clean.includes("triceps") || clean.includes("biceps")) return "Brazos";
  if (clean.includes("leg") || clean.includes("squat") || clean.includes("lunge") || clean.includes("calf")) return "Piernas";
  if (clean.includes("core") || clean.includes("touch") || clean.includes("plank") || clean.includes("abs")) return "Core";
  return fallback;
}

export function resolveExerciseMuscle(name, fallback = "General") {
  const meta = findExerciseMeta(name);
  if (meta?.muscle) return meta.muscle;
  const clean = String(name || "").toLowerCase();
  if (clean.includes("landmine") || clean.includes("shoulder press")) return "Deltoide anterior";
  if (clean.includes("lateral raise")) return "Deltoide lateral";
  if (clean.includes("face pull") || clean.includes("rear delt")) return "Deltoide posterior";
  if (clean.includes("chest")) return clean.includes("incline") ? "Pectoral superior" : "Pectoral mayor";
  if (clean.includes("row")) return "Romboides";
  if (clean.includes("lat")) return "Dorsales";
  if (clean.includes("triceps")) return "Tríceps";
  if (clean.includes("curl")) return "Bíceps";
  if (clean.includes("extension")) return "Cuádriceps";
  if (clean.includes("leg curl")) return "Isquios";
  if (clean.includes("split") || clean.includes("glute")) return "Glúteos";
  if (clean.includes("touch") || clean.includes("crunch")) return "Recto abdominal";
  return fallback;
}

export function getFilteredExercises({ query = "", group = "Todos", muscle = "Todos", equipment = "Todos" } = {}) {
  const q = query.trim().toLowerCase();
  return EXERCISE_DATABASE.filter((exercise) => {
    if (group !== "Todos" && exercise.group !== group) return false;
    if (muscle !== "Todos" && exercise.muscle !== muscle) return false;
    if (equipment !== "Todos" && exercise.equipment !== equipment) return false;
    if (q && !`${exercise.name} ${exercise.group} ${exercise.muscle} ${exercise.equipment}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export const EQUIPMENT_OPTIONS = EQUIPMENT;
