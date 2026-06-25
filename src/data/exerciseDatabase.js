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
  ex("Flexiones", "Pecho", "Pectoral mayor", "Peso corporal", "push"),
  ex("Flexiones inclinadas", "Pecho", "Pectoral superior", "Peso corporal", "push"),
  ex("Pullover con mancuerna", "Pecho", "Pectoral mayor", "Mancuernas", "push"),
  ex("Pullover en polea", "Pecho", "Pectoral mayor", "Polea", "push"),
  ex("Fondos asistidos", "Pecho", "Pectoral mayor", "Máquina", "push"),
  ex("Cruces en polea con cable", "Pecho", "Pectoral mayor", "Polea", "push"),
  ex("Mariposa en máquina", "Pecho", "Pectoral mayor", "Máquina", "push"),

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
  ex("Dominadas pronadas", "Espalda", "Dorsales", "Peso corporal", "pull"),
  ex("Dominadas supinas", "Espalda", "Dorsales", "Peso corporal", "pull"),
  ex("Dominadas neutras", "Espalda", "Dorsales", "Peso corporal", "pull"),
  ex("Remo unilateral en polea", "Espalda", "Dorsales", "Polea", "pull"),
  ex("Pulldown con brazos extendidos", "Espalda", "Dorsales", "Polea", "pull"),
  ex("Extensiones de espalda", "Espalda", "Erectores espinales", "Máquina", "pull"),
  ex("Hiperextensiones", "Espalda", "Erectores espinales", "Peso corporal", "pull"),
  ex("Buenos días", "Espalda", "Erectores espinales", "Barra", "pull"),
  ex("Remo invertido con barra", "Espalda", "Romboides", "Barra", "pull"),
  ex("Encogimientos con barra", "Espalda", "Trapecio superior", "Barra", "pull"),
  ex("Encogimientos con mancuernas", "Espalda", "Trapecio superior", "Mancuernas", "pull"),
  ex("Remo en T", "Espalda", "Dorsales", "Landmine", "pull"),
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
  ex("Remo al mentón con barra", "Hombros", "Trapecio superior", "Barra", "pull"),
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
  ex("Rompecráneos", "Brazos", "Tríceps", "Barra", "push"),
  ex("Rompecráneos con mancuernas", "Brazos", "Tríceps", "Mancuernas", "push"),
  ex("Patada de tríceps", "Brazos", "Tríceps", "Mancuernas", "push"),
  ex("Fondos en banco", "Brazos", "Tríceps", "Peso corporal", "push"),
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
  ex("Extensión de piernas", "Piernas", "Cuádriceps", "Máquina", "legs"),
  ex("Curl femoral acostado", "Piernas", "Isquios", "Máquina", "legs"),
  ex("Curl femoral sentado", "Piernas", "Isquios", "Máquina", "legs"),
  ex("Peso muerto rumano", "Piernas", "Isquios", "Barra", "legs"),
  ex("Peso muerto rumano con mancuernas", "Piernas", "Isquios", "Mancuernas", "legs"),
  ex("Peso muerto", "Espalda", "Erectores espinales", "Barra", "pull"),
  ex("Peso muerto sumo", "Piernas", "Glúteos", "Barra", "legs"),
  ex("Estocada con mancuernas", "Piernas", "Cuádriceps", "Mancuernas", "legs"),
  ex("Estocada búlgara", "Piernas", "Cuádriceps", "Mancuernas", "legs"),
  ex("Hip thrust con barra", "Piernas", "Glúteos", "Barra", "legs"),
  ex("Hip thrust en máquina", "Piernas", "Glúteos", "Máquina", "legs"),
  ex("Glute kickback en máquina", "Piernas", "Glúteos", "Máquina", "legs"),
  ex("Abductor en máquina", "Piernas", "Abductores", "Máquina", "legs"),
  ex("Aductor en máquina", "Piernas", "Aductores", "Máquina", "legs"),
  ex("Elevación de pantorrillas de pie", "Piernas", "Gemelos", "Peso corporal", "legs"),
  ex("Elevación de pantorrillas sentado", "Piernas", "Sóleo", "Máquina", "legs"),
  ex("Elevación de pantorrillas en prensa", "Piernas", "Gemelos", "Máquina", "legs"),
  ex("Step-up con mancuernas", "Piernas", "Cuádriceps", "Mancuernas", "legs"),
  ex("Peso muerto rumano unilateral", "Piernas", "Isquios", "Mancuernas", "legs"),
  ex("Curl nórdico", "Piernas", "Isquios", "Peso corporal", "legs"),
  ex("Sentadilla sissy", "Piernas", "Cuádriceps", "Peso corporal", "legs"),
  ex("Prensa de piernas unilateral", "Piernas", "Cuádriceps", "Máquina", "legs"),

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
  ex("Escaladores", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Bicicleta abdominal", "Core", "Oblicuos", "Peso corporal", "core"),
  ex("Toques de talón", "Core", "Oblicuos", "Peso corporal", "core"),
  ex("Toques de punta", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Dragon flag", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Rueda abdominal extensión", "Core", "Transverso abdominal", "Peso corporal", "core"),
  ex("Crunch inverso", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Vacío abdominal", "Core", "Transverso abdominal", "Peso corporal", "core"),
  ex("Giros rusos con peso", "Core", "Oblicuos", "Mancuernas", "core"),
  ex("Extensión de cadera prona", "Core", "Lumbar", "Peso corporal", "core"),
  ex("Crunch con peso en polea alta", "Core", "Recto abdominal", "Polea", "core"),
  ex("L-sit", "Core", "Recto abdominal", "Peso corporal", "core"),
  ex("Plancha con elevación de brazo", "Core", "Transverso abdominal", "Peso corporal", "core"),
  ex("Windmill", "Core", "Oblicuos", "Kettlebell", "core"),
  ex("Rotación de tronco con polea", "Core", "Oblicuos", "Polea", "core"),
  ex("Caminata con maletín", "Core", "Oblicuos", "Mancuernas", "core"),
  ex("Caminata del granjero", "Core", "Transverso abdominal", "Mancuernas", "core"),
  ex("Crunch en TRX", "Core", "Recto abdominal", "TRX", "core"),
  ex("Abdominales en V", "Core", "Recto abdominal", "Peso corporal", "core"),

  // ── PECHO ADICIONAL ───────────────────────────────────────────────────────
  ex("Press de banca con agarre cerrado", "Pecho", "Pectoral mayor", "Barra", "push"),
  ex("Aperturas en máquina (mariposa)", "Pecho", "Pectoral mayor", "Máquina", "push"),
  ex("Flexiones diamante", "Pecho", "Pectoral menor", "Peso corporal", "push"),
  ex("Flexiones con manos elevadas", "Pecho", "Pectoral inferior", "Peso corporal", "push"),
  ex("Flexiones con pies elevados", "Pecho", "Pectoral superior", "Peso corporal", "push"),
  ex("Press de banca con pausa", "Pecho", "Pectoral mayor", "Barra", "push"),
  ex("Pin press", "Pecho", "Pectoral mayor", "Barra", "push"),
  ex("Floor press con barra", "Pecho", "Pectoral mayor", "Barra", "push"),
  ex("Floor press con mancuernas", "Pecho", "Pectoral mayor", "Mancuernas", "push"),
  ex("Aperturas en TRX", "Pecho", "Pectoral mayor", "TRX", "push"),

  // ── ESPALDA ADICIONAL ─────────────────────────────────────────────────────
  ex("Remo con mancuerna en banco", "Espalda", "Dorsales", "Mancuernas", "pull"),
  ex("Pulldown con agarre supino", "Espalda", "Dorsales", "Máquina", "pull"),
  ex("Remo bajo en máquina", "Espalda", "Romboides", "Máquina", "pull"),
  ex("Remo pendlay", "Espalda", "Dorsales", "Barra", "pull"),
  ex("Superman", "Espalda", "Erectores espinales", "Peso corporal", "pull"),
  ex("Curl de columna en polea", "Espalda", "Dorsales", "Polea", "pull"),
  ex("Dominadas pronadas con lastre", "Espalda", "Dorsales", "Peso corporal", "pull"),
  ex("Dominadas supinas con lastre", "Espalda", "Dorsales", "Peso corporal", "pull"),
  ex("Separación de hombros con banda", "Espalda", "Romboides", "Banda", "pull"),
  ex("Remo al pecho con polea", "Espalda", "Romboides", "Polea", "pull"),
  ex("Peso muerto parcial en rack", "Espalda", "Erectores espinales", "Barra", "pull"),
  ex("Peso muerto con déficit", "Espalda", "Erectores espinales", "Barra", "legs"),
  ex("Kroc row", "Espalda", "Dorsales", "Mancuernas", "pull"),

  // ── HOMBROS ADICIONAL ─────────────────────────────────────────────────────
  ex("Press trasnuca", "Hombros", "Deltoide anterior", "Barra", "push"),
  ex("Push press", "Hombros", "Deltoide anterior", "Barra", "push"),
  ex("Elevaciones laterales inclinadas", "Hombros", "Deltoide lateral", "Mancuernas", "push"),
  ex("Elevaciones laterales con banda", "Hombros", "Deltoide lateral", "Banda", "push"),
  ex("Pájaros en máquina", "Hombros", "Deltoide posterior", "Máquina", "pull"),
  ex("Elevación en W", "Hombros", "Manguito rotador", "Mancuernas", "rehab"),
  ex("Overhead press en Smith", "Hombros", "Deltoide anterior", "Smith", "push"),
  ex("Bradford press", "Hombros", "Deltoide anterior", "Barra", "push"),
  ex("Lateral raise unilateral en polea", "Hombros", "Deltoide lateral", "Polea", "push"),
  ex("Clean and press", "Hombros", "Deltoide anterior", "Barra", "push"),

  // ── BRAZOS ADICIONAL ──────────────────────────────────────────────────────
  ex("Curl de araña", "Brazos", "Bíceps", "Mancuernas", "pull"),
  ex("Curl 21s", "Brazos", "Bíceps", "Barra", "pull"),
  ex("Curl martillo cruzado", "Brazos", "Braquial", "Mancuernas", "pull"),
  ex("Curl zottman", "Brazos", "Braquiorradial", "Mancuernas", "pull"),
  ex("Curl en polea alta", "Brazos", "Bíceps", "Polea", "pull"),
  ex("Bayesian curl", "Brazos", "Bíceps", "Polea", "pull"),
  ex("JM press", "Brazos", "Tríceps", "Barra", "push"),
  ex("Press de banca con agarre cerrado", "Brazos", "Tríceps", "Barra", "push"),
  ex("Tate press", "Brazos", "Tríceps", "Mancuernas", "push"),
  ex("Extensión de tríceps con mancuerna sobre cabeza", "Brazos", "Tríceps", "Mancuernas", "push"),
  ex("Dips con lastre", "Brazos", "Tríceps", "Peso corporal", "push"),
  ex("Curl inverso con barra", "Brazos", "Braquiorradial", "Barra", "pull"),
  ex("Rodillo de muñeca", "Brazos", "Antebrazo", "Polea", "pull"),
  ex("Agarre de pinza", "Brazos", "Antebrazo", "Mancuernas", "pull"),

  // ── PIERNAS ADICIONAL ─────────────────────────────────────────────────────
  ex("Sentadilla pausa", "Piernas", "Cuádriceps", "Barra", "legs"),
  ex("Sentadilla box", "Piernas", "Cuádriceps", "Barra", "legs"),
  ex("Sentadilla sumo", "Piernas", "Aductores", "Barra", "legs"),
  ex("Sentadilla búlgara con barra", "Piernas", "Cuádriceps", "Barra", "legs"),
  ex("Estocada estacionaria", "Piernas", "Cuádriceps", "Mancuernas", "legs"),
  ex("Estocada lateral", "Piernas", "Aductores", "Mancuernas", "legs"),
  ex("Estocada con barra", "Piernas", "Cuádriceps", "Barra", "legs"),
  ex("Hip thrust con mancuernas", "Piernas", "Glúteos", "Mancuernas", "legs"),
  ex("Puente de glúteos", "Piernas", "Glúteos", "Peso corporal", "legs"),
  ex("Peso muerto rumano con kettlebell", "Piernas", "Isquios", "Kettlebell", "legs"),
  ex("Peso muerto con trap bar", "Piernas", "Isquios", "Barra", "legs"),
  ex("Elevación de pantorrillas unilateral", "Piernas", "Gemelos", "Peso corporal", "legs"),
  ex("Elevación de gemelos con burro", "Piernas", "Gemelos", "Máquina", "legs"),
  ex("Elevación tibial", "Piernas", "Tibial anterior", "Peso corporal", "legs"),
  ex("Abductor con banda", "Piernas", "Abductores", "Banda", "legs"),
  ex("Aductor con banda", "Piernas", "Aductores", "Banda", "legs"),
  ex("Caminata lateral con banda", "Piernas", "Abductores", "Banda", "legs"),
  ex("Buenos días con barra", "Piernas", "Isquios", "Barra", "legs"),
  ex("Sentadilla a una pierna", "Piernas", "Cuádriceps", "Peso corporal", "legs"),
  ex("Sentadilla con salto", "Piernas", "Cuádriceps", "Peso corporal", "legs"),
  ex("Swing con kettlebell", "Piernas", "Glúteos", "Kettlebell", "legs"),
  ex("Goblet squat con kettlebell", "Piernas", "Cuádriceps", "Kettlebell", "legs"),

  // ── COMPUESTOS / FUNCIONALES ─────────────────────────────────────────────
  ex("Thruster con barra", "Piernas", "Cuádriceps", "Barra", "compound"),
  ex("Thruster con mancuernas", "Piernas", "Cuádriceps", "Mancuernas", "compound"),
  ex("Sentadilla con press", "Piernas", "Cuádriceps", "Mancuernas", "compound"),
  ex("Sentadilla frontal a press", "Piernas", "Cuádriceps", "Barra", "compound"),
  ex("Zancada con press", "Piernas", "Cuádriceps", "Mancuernas", "compound"),
  ex("Zancada con curl de bíceps", "Piernas", "Cuádriceps", "Mancuernas", "compound"),
  ex("Burpee con salto", "Piernas", "Cuádriceps", "Peso corporal", "compound"),
  ex("Box jump con mancuernas", "Piernas", "Cuádriceps", "Mancuernas", "compound"),
  ex("Hip thrust a press de hombros", "Piernas", "Glúteos", "Mancuernas", "compound"),
  ex("Peso muerto rumano + remo", "Piernas", "Isquios", "Barra", "compound"),
  ex("Clean and press con barra", "Hombros", "Deltoide anterior", "Barra", "compound"),
  ex("Clean and press con mancuernas", "Hombros", "Deltoide anterior", "Mancuernas", "compound"),
  ex("Clean and jerk", "Hombros", "Deltoide anterior", "Barra", "compound"),
  ex("Snatch con barra", "Hombros", "Deltoide anterior", "Barra", "compound"),
  ex("Kettlebell clean and press", "Hombros", "Deltoide anterior", "Kettlebell", "compound"),
  ex("Turkish get-up", "Hombros", "Deltoide anterior", "Kettlebell", "compound"),
  ex("Swing to press con kettlebell", "Hombros", "Deltoide anterior", "Kettlebell", "compound"),
  ex("Overhead carry", "Hombros", "Deltoide anterior", "Mancuernas", "compound"),
  ex("Peso muerto + remo", "Espalda", "Dorsales", "Barra", "compound"),
  ex("Peso muerto + encogimiento de hombros", "Espalda", "Trapecio superior", "Barra", "compound"),
  ex("Remo con mancuerna + rotación", "Espalda", "Dorsales", "Mancuernas", "compound"),
  ex("Man maker", "Espalda", "Dorsales", "Mancuernas", "compound"),
  ex("Dominada con rodillas al pecho", "Espalda", "Dorsales", "Peso corporal", "compound"),
  ex("Tire flip", "Espalda", "Erectores espinales", "Otros", "compound"),
  ex("Kettlebell flow", "Espalda", "Dorsales", "Kettlebell", "compound"),
  ex("Burpee con press", "Pecho", "Pectoral mayor", "Mancuernas", "compound"),
  ex("Push-up a remo con mancuernas", "Pecho", "Pectoral mayor", "Mancuernas", "compound"),
  ex("Remo + curl de bíceps", "Brazos", "Bíceps", "Mancuernas", "compound"),
  ex("Escalador (mountain climber)", "Core", "Recto abdominal", "Peso corporal", "compound"),
  ex("Bear crawl", "Core", "Transverso abdominal", "Peso corporal", "compound"),
  ex("Farmer carry", "Core", "Transverso abdominal", "Mancuernas", "compound"),
  ex("Farmer carry con kettlebell", "Core", "Transverso abdominal", "Kettlebell", "compound"),
  ex("Suitcase carry", "Core", "Oblicuos", "Mancuernas", "compound"),
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
  if (clean.includes("pierna") || clean.includes("sentadilla") || clean.includes("press de") || clean.includes("squat") || clean.includes("leg") || clean.includes("pantorrilla") || clean.includes("estocada") || clean.includes("peso muerto") || clean.includes("hip thrust") || clean.includes("curl femoral") || clean.includes("curl nordic") || clean.includes("nordico") || clean.includes("puente de glut")) return "Piernas";
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
  if (clean.includes("glute") || clean.includes("gluteo") || clean.includes("hip thrust") || clean.includes("estocada") || clean.includes("step") || clean.includes("puente de glut")) return "Glúteos";
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
