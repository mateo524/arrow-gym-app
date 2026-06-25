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
function ex(name, group, muscle, equipment, pattern, extraMuscles = []) {
  return { id: slug(name), name, group, muscle, equipment, pattern, builtin: true, muscles: [muscle, ...extraMuscles] };
}

export const EXERCISE_DATABASE = [
  // ── PECHO ──────────────────────────────────────────────────────────────────
  ex("Press de banca plano", "Pecho", "Pectoral mayor", "Barra", "push", ["Tríceps", "Deltoide anterior"]),
  ex("Press de banca inclinado", "Pecho", "Pectoral superior", "Barra", "push", ["Tríceps", "Deltoide anterior"]),
  ex("Press de banca declinado", "Pecho", "Pectoral inferior", "Barra", "push", ["Tríceps"]),
  ex("Press de pecho con mancuernas", "Pecho", "Pectoral mayor", "Mancuernas", "push", ["Tríceps", "Deltoide anterior"]),
  ex("Press inclinado con mancuernas", "Pecho", "Pectoral superior", "Mancuernas", "push", ["Tríceps", "Deltoide anterior"]),
  ex("Aperturas planas con mancuernas", "Pecho", "Pectoral mayor", "Mancuernas", "push", ["Deltoide anterior"]),
  ex("Aperturas inclinadas con mancuernas", "Pecho", "Pectoral superior", "Mancuernas", "push", ["Deltoide anterior"]),
  ex("Press de pecho en máquina", "Pecho", "Pectoral mayor", "Máquina", "push", ["Tríceps"]),
  ex("Press inclinado en máquina", "Pecho", "Pectoral superior", "Máquina", "push", ["Tríceps"]),
  ex("Cruces en polea alta", "Pecho", "Pectoral mayor", "Polea", "push", ["Deltoide anterior"]),
  ex("Cruces en polea baja", "Pecho", "Pectoral inferior", "Polea", "push", ["Deltoide anterior"]),
  ex("Cruces en polea media", "Pecho", "Pectoral mayor", "Polea", "push", ["Deltoide anterior"]),
  ex("Fondos en paralelas", "Pecho", "Pectoral inferior", "Peso corporal", "push", ["Tríceps"]),
  ex("Flexiones", "Pecho", "Pectoral mayor", "Peso corporal", "push", ["Tríceps", "Deltoide anterior"]),
  ex("Flexiones inclinadas", "Pecho", "Pectoral superior", "Peso corporal", "push", ["Tríceps"]),
  ex("Pullover con mancuerna", "Espalda", "Dorsales", "Mancuernas", "pull"),
  ex("Pullover en polea", "Espalda", "Dorsales", "Polea", "pull"),
  ex("Fondos asistidos", "Pecho", "Pectoral mayor", "Máquina", "push", ["Pectoral mayor","Deltoide anterior"]),
  ex("Cruces en polea con cable", "Pecho", "Pectoral mayor", "Polea", "push", ["Deltoide anterior"]),
  ex("Mariposa en máquina", "Pecho", "Pectoral mayor", "Máquina", "push", ["Deltoide anterior"]),

  // ── ESPALDA ────────────────────────────────────────────────────────────────
  ex("Jalón al pecho con barra", "Espalda", "Dorsales", "Máquina", "pull", ["Bíceps", "Romboides"]),
  ex("Jalón con agarre estrecho", "Espalda", "Dorsales", "Máquina", "pull", ["Bíceps"]),
  ex("Jalón neutro", "Espalda", "Dorsales", "Polea", "pull", ["Bíceps"]),
  ex("Jalón en polea", "Espalda", "Dorsales", "Polea", "pull", ["Bíceps"]),
  ex("Remo en polea baja", "Espalda", "Romboides", "Polea", "pull", ["Dorsales", "Bíceps"]),
  ex("Remo en polea con barra", "Espalda", "Romboides", "Polea", "pull", ["Dorsales", "Bíceps"]),
  ex("Remo con barra", "Espalda", "Romboides", "Barra", "pull", ["Dorsales", "Bíceps", "Erectores espinales"]),
  ex("Remo con mancuerna", "Espalda", "Dorsales", "Mancuernas", "pull", ["Bíceps", "Romboides"]),
  ex("Remo en máquina", "Espalda", "Romboides", "Máquina", "pull", ["Dorsales", "Bíceps"]),
  ex("Remo alto en máquina", "Espalda", "Trapecio medio", "Máquina", "pull", ["Dorsales", "Bíceps"]),
  ex("Dominadas pronadas", "Espalda", "Dorsales", "Peso corporal", "pull", ["Bíceps", "Romboides"]),
  ex("Dominadas supinas", "Espalda", "Dorsales", "Peso corporal", "pull", ["Bíceps"]),
  ex("Dominadas neutras", "Espalda", "Dorsales", "Peso corporal", "pull", ["Bíceps", "Romboides"]),
  ex("Remo unilateral en polea", "Espalda", "Dorsales", "Polea", "pull", ["Bíceps"]),
  ex("Pulldown con brazos extendidos", "Espalda", "Dorsales", "Polea", "pull", ["Romboides","Serrato anterior"]),
  ex("Extensiones de espalda", "Espalda", "Erectores espinales", "Máquina", "pull", ["Gluteos","Isquios"]),
  ex("Hiperextensiones", "Espalda", "Erectores espinales", "Peso corporal", "pull", ["Gluteos","Isquios"]),
  ex("Buenos días", "Espalda", "Erectores espinales", "Barra", "pull", ["Isquios","Gluteos"]),
  ex("Remo invertido con barra", "Espalda", "Romboides", "Barra", "pull", ["Dorsales","Biceps","Erectores espinales"]),
  ex("Encogimientos con barra", "Espalda", "Trapecio superior", "Barra", "pull"),
  ex("Encogimientos con mancuernas", "Espalda", "Trapecio superior", "Mancuernas", "pull"),
  ex("Remo en T", "Espalda", "Dorsales", "Landmine", "pull", ["Biceps","Erectores espinales"]),
  ex("Remo Yates", "Espalda", "Dorsales", "Barra", "pull", ["Biceps","Erectores espinales"]),

  // ── HOMBROS ────────────────────────────────────────────────────────────────
  ex("Press militar con barra", "Hombros", "Deltoide anterior", "Barra", "push", ["Tríceps", "Deltoide lateral"]),
  ex("Press con mancuernas", "Hombros", "Deltoide anterior", "Mancuernas", "push", ["Tríceps", "Deltoide lateral"]),
  ex("Press Arnold", "Hombros", "Deltoide anterior", "Mancuernas", "push", ["Tríceps", "Deltoide lateral", "Deltoide posterior"]),
  ex("Press en máquina de hombros", "Hombros", "Deltoide anterior", "Máquina", "push", ["Tríceps"]),
  ex("Landmine press", "Hombros", "Deltoide anterior", "Landmine", "push", ["Pectoral superior", "Tríceps"]),
  ex("Elevaciones laterales con mancuernas", "Hombros", "Deltoide lateral", "Mancuernas", "push", ["Trapecio superior"]),
  ex("Elevaciones laterales en polea", "Hombros", "Deltoide lateral", "Polea", "push", ["Trapecio superior"]),
  ex("Elevaciones laterales en máquina", "Hombros", "Deltoide lateral", "Máquina", "push", ["Trapecio superior"]),
  ex("Elevaciones frontales con mancuernas", "Hombros", "Deltoide anterior", "Mancuernas", "push", ["Pectoral superior","Trapecio superior"]),
  ex("Elevaciones frontales con barra", "Hombros", "Deltoide anterior", "Barra", "push", ["Pectoral superior","Trapecio superior"]),
  ex("Elevaciones posteriores con mancuernas", "Hombros", "Deltoide posterior", "Mancuernas", "pull", ["Romboides","Manguito rotador"]),
  ex("Elevaciones posteriores en polea", "Hombros", "Deltoide posterior", "Polea", "pull", ["Romboides","Manguito rotador"]),
  ex("Face pull", "Hombros", "Deltoide posterior", "Polea", "pull", ["Romboides","Manguito rotador"]),
  ex("Pájaros con mancuernas", "Hombros", "Deltoide posterior", "Mancuernas", "pull", ["Romboides","Manguito rotador"]),
  ex("Rotación externa en polea", "Hombros", "Manguito rotador", "Polea", "rehab"),
  ex("Rotación interna en polea", "Hombros", "Manguito rotador", "Polea", "rehab"),
  ex("Remo al mentón con barra", "Hombros", "Trapecio superior", "Barra", "pull", ["Deltoide lateral","Biceps"]),
  ex("Cuban press", "Hombros", "Manguito rotador", "Mancuernas", "rehab"),

  // ── BRAZOS ────────────────────────────────────────────────────────────────
  ex("Curl con barra", "Brazos", "Bíceps", "Barra", "pull"),
  ex("Curl con barra Z", "Brazos", "Bíceps", "Barra", "pull", ["Braquial","Braquiorradial"]),
  ex("Curl alternado con mancuernas", "Brazos", "Bíceps", "Mancuernas", "pull", ["Braquial"]),
  ex("Curl con mancuernas", "Brazos", "Bíceps", "Mancuernas", "pull", ["Braquial"]),
  ex("Curl martillo", "Brazos", "Braquial", "Mancuernas", "pull"),
  ex("Curl en polea baja", "Brazos", "Bíceps", "Polea", "pull", ["Braquial"]),
  ex("Curl en banco inclinado", "Brazos", "Bíceps", "Mancuernas", "pull", ["Braquial"]),
  ex("Curl concentrado", "Brazos", "Bíceps", "Mancuernas", "pull"),
  ex("Curl predicador", "Brazos", "Bíceps", "Máquina", "pull", ["Braquial"]),
  ex("Curl en máquina", "Brazos", "Bíceps", "Máquina", "pull", ["Braquial"]),
  ex("Curl reverso con barra", "Brazos", "Braquiorradial", "Barra", "pull", ["Braquial","Biceps"]),
  ex("Extensión de tríceps en polea", "Brazos", "Tríceps", "Polea", "push"),
  ex("Extensión de tríceps con cuerda", "Brazos", "Tríceps", "Polea", "push"),
  ex("Extensión de tríceps unilateral", "Brazos", "Tríceps", "Polea", "push"),
  ex("Extensión de tríceps sobre cabeza", "Brazos", "Tríceps", "Polea", "push"),
  ex("Press francés", "Brazos", "Tríceps", "Barra", "push", ["Pectoral mayor"]),
  ex("Rompecráneos", "Brazos", "Tríceps", "Barra", "push", ["Pectoral mayor"]),
  ex("Rompecráneos con mancuernas", "Brazos", "Tríceps", "Mancuernas", "push", ["Pectoral mayor"]),
  ex("Patada de tríceps", "Brazos", "Tríceps", "Mancuernas", "push"),
  ex("Fondos en banco", "Brazos", "Tríceps", "Peso corporal", "push", ["Pectoral mayor","Deltoide anterior"]),
  ex("Extensión de tríceps en máquina", "Brazos", "Tríceps", "Máquina", "push"),
  ex("Curl de muñeca", "Brazos", "Antebrazo", "Barra", "pull"),

  // ── PIERNAS ────────────────────────────────────────────────────────────────
  ex("Sentadilla libre", "Piernas", "Cuádriceps", "Barra", "legs", ["Glúteos", "Isquios"]),
  ex("Sentadilla en Smith", "Piernas", "Cuádriceps", "Smith", "legs", ["Glúteos", "Isquios"]),
  ex("Sentadilla hack en máquina", "Piernas", "Cuádriceps", "Máquina", "legs", ["Glúteos"]),
  ex("Sentadilla goblet", "Piernas", "Cuádriceps", "Kettlebell", "legs", ["Glúteos"]),
  ex("Sentadilla frontal", "Piernas", "Cuádriceps", "Barra", "legs", ["Glúteos"]),
  ex("Prensa de piernas", "Piernas", "Cuádriceps", "Máquina", "legs", ["Glúteos"]),
  ex("Prensa de piernas 45°", "Piernas", "Cuádriceps", "Máquina", "legs", ["Glúteos"]),
  ex("Extensión de piernas", "Piernas", "Cuádriceps", "Máquina", "legs"),
  ex("Curl femoral acostado", "Piernas", "Isquios", "Máquina", "legs"),
  ex("Curl femoral sentado", "Piernas", "Isquios", "Máquina", "legs"),
  ex("Peso muerto rumano", "Piernas", "Isquios", "Barra", "legs", ["Glúteos", "Erectores espinales"]),
  ex("Peso muerto rumano con mancuernas", "Piernas", "Isquios", "Mancuernas", "legs", ["Glúteos", "Erectores espinales"]),
  ex("Peso muerto", "Espalda", "Erectores espinales", "Barra", "pull", ["Glúteos", "Isquios", "Cuádriceps"]),
  ex("Peso muerto sumo", "Piernas", "Glúteos", "Barra", "legs", ["Cuádriceps", "Isquios"]),
  ex("Estocada con mancuernas", "Piernas", "Cuádriceps", "Mancuernas", "legs", ["Glúteos"]),
  ex("Estocada búlgara", "Piernas", "Cuádriceps", "Mancuernas", "legs", ["Glúteos"]),
  ex("Hip thrust con barra", "Piernas", "Glúteos", "Barra", "legs", ["Isquios"]),
  ex("Hip thrust en máquina", "Piernas", "Glúteos", "Máquina", "legs", ["Isquios"]),
  ex("Glute kickback en máquina", "Piernas", "Glúteos", "Máquina", "legs"),
  ex("Abductor en máquina", "Piernas", "Abductores", "Máquina", "legs"),
  ex("Aductor en máquina", "Piernas", "Aductores", "Máquina", "legs"),
  ex("Elevación de pantorrillas de pie", "Piernas", "Gemelos", "Peso corporal", "legs", ["Soleo"]),
  ex("Elevación de pantorrillas sentado", "Piernas", "Sóleo", "Máquina", "legs", ["Gemelos"]),
  ex("Elevación de pantorrillas en prensa", "Piernas", "Gemelos", "Máquina", "legs", ["Soleo"]),
  ex("Step-up con mancuernas", "Piernas", "Cuádriceps", "Mancuernas", "legs", ["Glúteos"]),
  ex("Peso muerto rumano unilateral", "Piernas", "Isquios", "Mancuernas", "legs", ["Glúteos", "Erectores espinales"]),
  ex("Curl nórdico", "Piernas", "Isquios", "Peso corporal", "legs"),
  ex("Sentadilla sissy", "Piernas", "Cuádriceps", "Peso corporal", "legs"),
  ex("Prensa de piernas unilateral", "Piernas", "Cuádriceps", "Máquina", "legs", ["Gluteos"]),

  // ── CORE ──────────────────────────────────────────────────────────────────
  ex("Crunch", "Core", "Recto abdominal", "Peso corporal", "core", ["Oblicuos"]),
  ex("Crunch en polea", "Core", "Recto abdominal", "Polea", "core", ["Oblicuos"]),
  ex("Plancha frontal", "Core", "Transverso abdominal", "Peso corporal", "core", ["Recto abdominal","Gluteos"]),
  ex("Plancha lateral", "Core", "Oblicuos", "Peso corporal", "core", ["Transverso abdominal"]),
  ex("Elevación de piernas colgado", "Core", "Recto abdominal", "Peso corporal", "core", ["Flexores de cadera"]),
  ex("Elevación de piernas en banco", "Core", "Recto abdominal", "Peso corporal", "core", ["Flexores de cadera"]),
  ex("Rueda abdominal", "Core", "Recto abdominal", "Peso corporal", "core", ["Dorsales","Triceps","Transverso abdominal"]),
  ex("Russian twist", "Core", "Oblicuos", "Peso corporal", "core", ["Recto abdominal","Flexores de cadera"]),
  ex("Pallof press", "Core", "Transverso abdominal", "Polea", "core", ["Recto abdominal","Oblicuos"]),
  ex("Dead bug", "Core", "Transverso abdominal", "Peso corporal", "core", ["Recto abdominal","Flexores de cadera"]),
  ex("Hollow body", "Core", "Recto abdominal", "Peso corporal", "core", ["Flexores de cadera"]),
  ex("Escaladores", "Core", "Recto abdominal", "Peso corporal", "core", ["Cuadriceps","Flexores de cadera"]),
  ex("Bicicleta abdominal", "Core", "Oblicuos", "Peso corporal", "core", ["Recto abdominal","Flexores de cadera"]),
  ex("Toques de talón", "Core", "Oblicuos", "Peso corporal", "core", ["Recto abdominal"]),
  ex("Toques de punta", "Core", "Recto abdominal", "Peso corporal", "core", ["Oblicuos"]),
  ex("Dragon flag", "Core", "Recto abdominal", "Peso corporal", "core", ["Flexores de cadera","Transverso abdominal"]),
  ex("Rueda abdominal extensión", "Core", "Transverso abdominal", "Peso corporal", "core", ["Dorsales","Triceps","Recto abdominal"]),
  ex("Crunch inverso", "Core", "Recto abdominal", "Peso corporal", "core", ["Flexores de cadera"]),
  ex("Vacío abdominal", "Core", "Transverso abdominal", "Peso corporal", "core"),
  ex("Giros rusos con peso", "Core", "Oblicuos", "Mancuernas", "core"),
  ex("Extensión de cadera prona", "Core", "Lumbar", "Peso corporal", "core", ["Gluteos","Isquios"]),
  ex("Crunch con peso en polea alta", "Core", "Recto abdominal", "Polea", "core", ["Oblicuos"]),
  ex("L-sit", "Core", "Recto abdominal", "Peso corporal", "core", ["Flexores de cadera","Triceps"]),
  ex("Plancha con elevación de brazo", "Core", "Transverso abdominal", "Peso corporal", "core", ["Recto abdominal","Oblicuos"]),
  ex("Windmill", "Core", "Oblicuos", "Kettlebell", "core", ["Gluteos","Deltoide anterior"]),
  ex("Rotación de tronco con polea", "Core", "Oblicuos", "Polea", "core", ["Recto abdominal"]),
  ex("Caminata con maletín", "Core", "Oblicuos", "Mancuernas", "core", ["Transverso abdominal","Trapecio superior"]),
  ex("Caminata del granjero", "Core", "Transverso abdominal", "Mancuernas", "core", ["Trapecio superior","Antebrazo","Gluteos"]),
  ex("Crunch en TRX", "Core", "Recto abdominal", "TRX", "core"),
  ex("Abdominales en V", "Core", "Recto abdominal", "Peso corporal", "core", ["Flexores de cadera","Transverso abdominal"]),

  // ── PECHO ADICIONAL ───────────────────────────────────────────────────────
  ex("Press de banca con agarre cerrado", "Brazos", "Tríceps", "Barra", "push"),
  ex("Aperturas en máquina (mariposa)", "Pecho", "Pectoral mayor", "Máquina", "push"),
  ex("Flexiones diamante", "Brazos", "Tríceps", "Peso corporal", "push", ["Pectoral mayor"]),
  ex("Flexiones con manos elevadas", "Pecho", "Pectoral inferior", "Peso corporal", "push", ["Triceps","Deltoide anterior"]),
  ex("Flexiones con pies elevados", "Pecho", "Pectoral superior", "Peso corporal", "push", ["Triceps","Deltoide anterior"]),
  ex("Press de banca con pausa", "Pecho", "Pectoral mayor", "Barra", "push", ["Triceps","Deltoide anterior"]),
  ex("Pin press", "Pecho", "Pectoral mayor", "Barra", "push", ["Triceps","Deltoide anterior"]),
  ex("Floor press con barra", "Pecho", "Pectoral mayor", "Barra", "push", ["Triceps","Deltoide anterior"]),
  ex("Floor press con mancuernas", "Pecho", "Pectoral mayor", "Mancuernas", "push", ["Triceps","Deltoide anterior"]),
  ex("Aperturas en TRX", "Pecho", "Pectoral mayor", "TRX", "push"),

  // ── ESPALDA ADICIONAL ─────────────────────────────────────────────────────
  ex("Remo con mancuerna en banco", "Espalda", "Dorsales", "Mancuernas", "pull", ["Biceps","Romboides"]),
  ex("Pulldown con agarre supino", "Espalda", "Dorsales", "Máquina", "pull", ["Biceps"]),
  ex("Remo bajo en máquina", "Espalda", "Romboides", "Máquina", "pull", ["Dorsales","Biceps"]),
  ex("Remo pendlay", "Espalda", "Dorsales", "Barra", "pull", ["Dorsales","Biceps","Erectores espinales"]),
  ex("Superman", "Espalda", "Erectores espinales", "Peso corporal", "pull", ["Gluteos","Isquios"]),
  ex("Curl de columna en polea", "Espalda", "Dorsales", "Polea", "pull"),
  ex("Dominadas pronadas con lastre", "Espalda", "Dorsales", "Peso corporal", "pull", ["Biceps","Romboides"]),
  ex("Dominadas supinas con lastre", "Espalda", "Dorsales", "Peso corporal", "pull", ["Biceps"]),
  ex("Separación de hombros con banda", "Espalda", "Romboides", "Banda", "pull"),
  ex("Remo al pecho con polea", "Espalda", "Romboides", "Polea", "pull", ["Biceps","Dorsales"]),
  ex("Peso muerto parcial en rack", "Espalda", "Erectores espinales", "Barra", "pull", ["Gluteos","Isquios"]),
  ex("Peso muerto con déficit", "Espalda", "Erectores espinales", "Barra", "legs", ["Gluteos","Isquios","Cuadriceps"]),
  ex("Kroc row", "Espalda", "Dorsales", "Mancuernas", "pull", ["Biceps","Romboides"]),

  // ── HOMBROS ADICIONAL ─────────────────────────────────────────────────────
  ex("Press trasnuca", "Hombros", "Deltoide anterior", "Barra", "push"),
  ex("Push press", "Hombros", "Deltoide anterior", "Barra", "push", ["Triceps","Cuadriceps"]),
  ex("Elevaciones laterales inclinadas", "Hombros", "Deltoide lateral", "Mancuernas", "push", ["Trapecio superior"]),
  ex("Elevaciones laterales con banda", "Hombros", "Deltoide lateral", "Banda", "push", ["Trapecio superior"]),
  ex("Pájaros en máquina", "Hombros", "Deltoide posterior", "Máquina", "pull", ["Romboides","Manguito rotador"]),
  ex("Elevación en W", "Hombros", "Manguito rotador", "Mancuernas", "rehab"),
  ex("Overhead press en Smith", "Hombros", "Deltoide anterior", "Smith", "push", ["Triceps","Deltoide lateral"]),
  ex("Bradford press", "Hombros", "Deltoide anterior", "Barra", "push", ["Triceps","Deltoide lateral","Deltoide posterior"]),
  ex("Lateral raise unilateral en polea", "Hombros", "Deltoide lateral", "Polea", "push", ["Trapecio superior"]),
  ex("Clean and press", "Hombros", "Deltoide anterior", "Barra", "push"),

  // ── BRAZOS ADICIONAL ──────────────────────────────────────────────────────
  ex("Curl de araña", "Brazos", "Bíceps", "Mancuernas", "pull", ["Braquial"]),
  ex("Curl 21s", "Brazos", "Bíceps", "Barra", "pull", ["Braquial"]),
  ex("Curl martillo cruzado", "Brazos", "Braquial", "Mancuernas", "pull", ["Biceps","Braquiorradial"]),
  ex("Curl zottman", "Brazos", "Braquiorradial", "Mancuernas", "pull", ["Biceps","Braquial"]),
  ex("Curl en polea alta", "Brazos", "Bíceps", "Polea", "pull", ["Braquial"]),
  ex("Bayesian curl", "Brazos", "Bíceps", "Polea", "pull", ["Braquial"]),
  ex("JM press", "Brazos", "Tríceps", "Barra", "push", ["Pectoral mayor"]),
  ex("Tate press", "Brazos", "Tríceps", "Mancuernas", "push", ["Pectoral mayor"]),
  ex("Extensión de tríceps con mancuerna sobre cabeza", "Brazos", "Tríceps", "Mancuernas", "push"),
  ex("Dips con lastre", "Brazos", "Tríceps", "Peso corporal", "push", ["Pectoral mayor","Deltoide anterior"]),
  ex("Curl inverso con barra", "Brazos", "Braquiorradial", "Barra", "pull"),
  ex("Rodillo de muñeca", "Brazos", "Antebrazo", "Polea", "pull"),
  ex("Agarre de pinza", "Brazos", "Antebrazo", "Mancuernas", "pull"),

  // ── PIERNAS ADICIONAL ─────────────────────────────────────────────────────
  ex("Sentadilla pausa", "Piernas", "Cuádriceps", "Barra", "legs", ["Glúteos", "Isquios"]),
  ex("Sentadilla box", "Piernas", "Cuádriceps", "Barra", "legs", ["Glúteos"]),
  ex("Sentadilla sumo", "Piernas", "Cuádriceps", "Barra", "legs", ["Glúteos", "Isquios"]),
  ex("Sentadilla búlgara con barra", "Piernas", "Cuádriceps", "Barra", "legs", ["Glúteos"]),
  ex("Estocada estacionaria", "Piernas", "Cuádriceps", "Mancuernas", "legs", ["Glúteos"]),
  ex("Estocada lateral", "Piernas", "Aductores", "Mancuernas", "legs", ["Cuádriceps", "Glúteos"]),
  ex("Estocada con barra", "Piernas", "Cuádriceps", "Barra", "legs", ["Glúteos"]),
  ex("Hip thrust con mancuernas", "Piernas", "Glúteos", "Mancuernas", "legs", ["Isquios"]),
  ex("Puente de glúteos", "Piernas", "Glúteos", "Peso corporal", "legs", ["Isquios"]),
  ex("Peso muerto rumano con kettlebell", "Piernas", "Isquios", "Kettlebell", "legs", ["Glúteos", "Erectores espinales"]),
  ex("Peso muerto con trap bar", "Piernas", "Cuádriceps", "Barra", "legs", ["Glúteos", "Isquios", "Erectores espinales"]),
  ex("Elevación de pantorrillas unilateral", "Piernas", "Gemelos", "Peso corporal", "legs", ["Soleo"]),
  ex("Elevación de gemelos con burro", "Piernas", "Gemelos", "Máquina", "legs", ["Soleo"]),
  ex("Elevación tibial", "Piernas", "Tibial anterior", "Peso corporal", "legs"),
  ex("Abductor con banda", "Piernas", "Abductores", "Banda", "legs"),
  ex("Aductor con banda", "Piernas", "Aductores", "Banda", "legs"),
  ex("Caminata lateral con banda", "Piernas", "Abductores", "Banda", "legs", ["Gluteos"]),
  ex("Buenos días con barra", "Piernas", "Isquios", "Barra", "legs", ["Gluteos","Erectores espinales"]),
  ex("Sentadilla a una pierna", "Piernas", "Cuádriceps", "Peso corporal", "legs", ["Gluteos"]),
  ex("Sentadilla con salto", "Piernas", "Cuádriceps", "Peso corporal", "legs", ["Gluteos","Isquios"]),
  ex("Swing con kettlebell", "Piernas", "Glúteos", "Kettlebell", "legs", ["Isquios","Erectores espinales"]),
  ex("Goblet squat con kettlebell", "Piernas", "Cuádriceps", "Kettlebell", "legs", ["Gluteos"]),

  // ── COMPUESTOS / FUNCIONALES ─────────────────────────────────────────────
  ex("Thruster con barra", "Piernas", "Cuádriceps", "Barra", "compound"),
  ex("Thruster con mancuernas", "Piernas", "Cuádriceps", "Mancuernas", "compound"),
  ex("Sentadilla con press", "Piernas", "Cuádriceps", "Mancuernas", "compound", ["Glúteos", "Deltoide anterior", "Tríceps"]),
  ex("Sentadilla frontal a press", "Piernas", "Cuádriceps", "Barra", "compound", ["Glúteos", "Deltoide anterior", "Tríceps"]),
  ex("Zancada con press", "Piernas", "Cuádriceps", "Mancuernas", "compound", ["Glúteos", "Deltoide anterior", "Tríceps"]),
  ex("Zancada con curl de bíceps", "Piernas", "Cuádriceps", "Mancuernas", "compound", ["Glúteos", "Bíceps"]),
  ex("Burpee con salto", "Piernas", "Cuádriceps", "Peso corporal", "compound", ["Gluteos","Pectoral mayor","Triceps"]),
  ex("Box jump con mancuernas", "Piernas", "Cuádriceps", "Mancuernas", "compound", ["Gluteos","Isquios"]),
  ex("Hip thrust a press de hombros", "Piernas", "Glúteos", "Mancuernas", "compound"),
  ex("Peso muerto rumano + remo", "Piernas", "Isquios", "Barra", "compound"),
  ex("Clean and press con barra", "Hombros", "Deltoide anterior", "Barra", "compound", ["Cuádriceps", "Glúteos", "Tríceps", "Erectores espinales"]),
  ex("Clean and press con mancuernas", "Hombros", "Deltoide anterior", "Mancuernas", "compound", ["Cuádriceps", "Glúteos", "Tríceps"]),
  ex("Clean and jerk", "Hombros", "Deltoide anterior", "Barra", "compound", ["Cuádriceps", "Glúteos", "Tríceps"]),
  ex("Snatch con barra", "Hombros", "Deltoide anterior", "Barra", "compound", ["Cuadriceps","Gluteos","Triceps","Isquios"]),
  ex("Kettlebell clean and press", "Hombros", "Deltoide anterior", "Kettlebell", "compound", ["Cuadriceps","Gluteos","Triceps"]),
  ex("Turkish get-up", "Hombros", "Deltoide anterior", "Kettlebell", "compound", ["Gluteos","Transverso abdominal","Oblicuos"]),
  ex("Swing to press con kettlebell", "Hombros", "Deltoide anterior", "Kettlebell", "compound", ["Gluteos","Isquios","Triceps"]),
  ex("Overhead carry", "Hombros", "Deltoide anterior", "Mancuernas", "compound", ["Transverso abdominal","Trapecio superior"]),
  ex("Peso muerto + remo", "Espalda", "Dorsales", "Barra", "compound", ["Gluteos","Isquios","Biceps","Erectores espinales"]),
  ex("Peso muerto + encogimiento de hombros", "Espalda", "Trapecio superior", "Barra", "compound"),
  ex("Remo con mancuerna + rotación", "Espalda", "Dorsales", "Mancuernas", "compound"),
  ex("Man maker", "Espalda", "Dorsales", "Mancuernas", "compound", ["Pectoral mayor","Cuadriceps","Gluteos","Triceps","Biceps"]),
  ex("Dominada con rodillas al pecho", "Espalda", "Dorsales", "Peso corporal", "compound", ["Recto abdominal","Biceps"]),
  ex("Tire flip", "Espalda", "Erectores espinales", "Otros", "compound"),
  ex("Kettlebell flow", "Espalda", "Dorsales", "Kettlebell", "compound"),
  ex("Burpee con press", "Pecho", "Pectoral mayor", "Mancuernas", "compound", ["Cuadriceps","Gluteos","Triceps"]),
  ex("Push-up a remo con mancuernas", "Pecho", "Pectoral mayor", "Mancuernas", "compound", ["Dorsales","Biceps","Triceps"]),
  ex("Remo + curl de bíceps", "Brazos", "Bíceps", "Mancuernas", "compound"),
  ex("Escalador (mountain climber)", "Core", "Recto abdominal", "Peso corporal", "compound", ["Cuadriceps","Flexores de cadera"]),
  ex("Bear crawl", "Core", "Transverso abdominal", "Peso corporal", "compound", ["Pectoral mayor","Triceps","Cuadriceps"]),
  ex("Farmer carry", "Core", "Transverso abdominal", "Mancuernas", "compound", ["Trapecio superior","Antebrazo","Gluteos"]),
  ex("Farmer carry con kettlebell", "Core", "Transverso abdominal", "Kettlebell", "compound", ["Trapecio superior","Gluteos"]),
  ex("Suitcase carry", "Core", "Oblicuos", "Mancuernas", "compound", ["Transverso abdominal","Trapecio superior"]),
];

export function findExerciseMeta(name) {
  const clean = String(name || "").toLowerCase().trim();
  return EXERCISE_DATABASE.find((e) => e.name.toLowerCase() === clean) || null;
}

export function resolveExerciseGroup(name, fallback = "Core") {
  const meta = findExerciseMeta(name);
  if (meta?.group) return meta.group;
  const clean = String(name || "").toLowerCase();
  // Piernas BEFORE arms — leg exercises that contain "curl", "extension", "zancada", "isquio" must resolve to Piernas
  if (clean.includes("isquio") || clean.includes("femoral") || clean.includes("zancada") || clean.includes("nordico") || clean.includes("nordic") || clean.includes("curl femoral") || clean.includes("curl de isquio")) return "Piernas";
  if (clean.includes("pierna") || clean.includes("sentadilla") || clean.includes("squat") || clean.includes("leg ") || clean.includes("pantorrilla") || clean.includes("gemelo") || clean.includes("calf") || clean.includes("estocada") || clean.includes("peso muerto") || clean.includes("hip thrust") || clean.includes("puente de glut") || clean.includes("gluteo") || clean.includes("glute") || clean.includes("prensa de pierna")) return "Piernas";
  if ((clean.includes("extension") || clean.includes("extensión")) && !clean.includes("tricep") && !clean.includes("espalda")) return "Piernas";
  if (clean.includes("hombro") || clean.includes("shoulder") || clean.includes("face pull") || clean.includes("deltoide") || clean.includes("militar") || clean.includes("landmine")) return "Hombros";
  if (clean.includes("elevacion") || clean.includes("elevación")) return clean.includes("pierna") || clean.includes("cadera") ? "Piernas" : "Hombros";
  if (clean.includes("pecho") || clean.includes("chest") || clean.includes("pec") || clean.includes("apertura")) return "Pecho";
  if (clean.includes("press") && !clean.includes("leg")) return clean.includes("banca") || clean.includes("pecho") || clean.includes("bench") ? "Pecho" : "Hombros";
  if (clean.includes("espalda") || clean.includes("row") || clean.includes("pull") || clean.includes("jalon") || clean.includes("remo") || clean.includes("dorsal")) return "Espalda";
  if (clean.includes("curl") || clean.includes("bicep") || clean.includes("tricep") || clean.includes("brazo")) return "Brazos";
  if (clean.includes("lateral") || clean.includes("pajaro")) return "Hombros";
  return fallback;
}

export function resolveExerciseMuscle(name, fallback = "General") {
  const meta = findExerciseMeta(name);
  if (meta?.muscle) return meta.muscle;
  const clean = String(name || "").toLowerCase();
  // Leg muscles BEFORE arms — prevent "curl" from matching Bíceps on leg exercises
  if (clean.includes("isquio") || clean.includes("femoral") || clean.includes("curl de isquio") || clean.includes("nordico") || clean.includes("nordic") || clean.includes("peso muerto") || clean.includes("rdl")) return "Isquios";
  if (clean.includes("glute") || clean.includes("gluteo") || clean.includes("hip thrust") || clean.includes("puente de glut")) return "Glúteos";
  if (clean.includes("estocada") || clean.includes("zancada") || clean.includes("step")) return "Cuádriceps";
  if (clean.includes("sentadilla") || clean.includes("squat") || clean.includes("prensa") || clean.includes("leg press")) return "Cuádriceps";
  if ((clean.includes("extension") || clean.includes("extensión")) && !clean.includes("tricep") && !clean.includes("espalda")) return "Cuádriceps";
  if (clean.includes("pantorrilla") || clean.includes("gemelo") || clean.includes("calf")) return "Gemelos";
  if (clean.includes("lateral raise") || clean.includes("elevacion lateral") || clean.includes("elevación lateral")) return "Deltoide lateral";
  if (clean.includes("face pull") || clean.includes("pajaro") || clean.includes("posterior")) return "Deltoide posterior";
  if (clean.includes("hombro") || clean.includes("shoulder") || clean.includes("press mil") || clean.includes("landmine")) return "Deltoide anterior";
  if (clean.includes("incline") || clean.includes("inclinado")) return "Pectoral superior";
  if (clean.includes("pecho") || clean.includes("chest")) return "Pectoral mayor";
  if (clean.includes("jalon") || clean.includes("pull") || clean.includes("dorsal")) return "Dorsales";
  if (clean.includes("remo") || clean.includes("row")) return "Romboides";
  if (clean.includes("tricep") || clean.includes("skullcrusher") || clean.includes("frances")) return "Tríceps";
  if (clean.includes("curl") || clean.includes("bicep")) return "Bíceps";
  if (clean.includes("martillo") || clean.includes("hammer")) return "Braquial";
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
