const fs = require("fs");
let code = fs.readFileSync("src/data/exerciseDatabase.js", "utf8");

const secondaries = {
  "Aperturas planas con mancuernas": ["Deltoide anterior"],
  "Aperturas inclinadas con mancuernas": ["Deltoide anterior"],
  "Cruces en polea alta": ["Deltoide anterior"],
  "Cruces en polea baja": ["Deltoide anterior"],
  "Cruces en polea media": ["Deltoide anterior"],
  "Cruces en polea con cable": ["Deltoide anterior"],
  "Mariposa en maquina": ["Deltoide anterior"],
  "Fondos asistidos": ["Pectoral mayor", "Deltoide anterior"],
  "Flexiones con manos elevadas": ["Triceps", "Deltoide anterior"],
  "Flexiones con pies elevados": ["Triceps", "Deltoide anterior"],
  "Press de banca con pausa": ["Triceps", "Deltoide anterior"],
  "Pin press": ["Triceps", "Deltoide anterior"],
  "Floor press con barra": ["Triceps", "Deltoide anterior"],
  "Floor press con mancuernas": ["Triceps", "Deltoide anterior"],
  "Pulldown con brazos extendidos": ["Romboides", "Serrato anterior"],
  "Extensiones de espalda": ["Gluteos", "Isquios"],
  "Hiperextensiones": ["Gluteos", "Isquios"],
  "Buenos dias": ["Isquios", "Gluteos"],
  "Remo invertido con barra": ["Dorsales", "Biceps", "Erectores espinales"],
  "Remo en T": ["Biceps", "Erectores espinales"],
  "Remo Yates": ["Biceps", "Erectores espinales"],
  "Remo con mancuerna en banco": ["Biceps", "Romboides"],
  "Pulldown con agarre supino": ["Biceps"],
  "Remo bajo en maquina": ["Dorsales", "Biceps"],
  "Remo pendlay": ["Dorsales", "Biceps", "Erectores espinales"],
  "Superman": ["Gluteos", "Isquios"],
  "Dominadas pronadas con lastre": ["Biceps", "Romboides"],
  "Dominadas supinas con lastre": ["Biceps"],
  "Remo al pecho con polea": ["Biceps", "Dorsales"],
  "Peso muerto parcial en rack": ["Gluteos", "Isquios"],
  "Kroc row": ["Biceps", "Romboides"],
  "Elevaciones laterales con mancuernas": ["Trapecio superior"],
  "Elevaciones laterales en polea": ["Trapecio superior"],
  "Elevaciones laterales en maquina": ["Trapecio superior"],
  "Elevaciones frontales con mancuernas": ["Pectoral superior", "Trapecio superior"],
  "Elevaciones frontales con barra": ["Pectoral superior", "Trapecio superior"],
  "Elevaciones posteriores con mancuernas": ["Romboides", "Manguito rotador"],
  "Elevaciones posteriores en polea": ["Romboides", "Manguito rotador"],
  "Face pull": ["Romboides", "Manguito rotador"],
  "Pajaros con mancuernas": ["Romboides", "Manguito rotador"],
  "Remo al menton con barra": ["Deltoide lateral", "Biceps"],
  "Press trasero": ["Triceps", "Deltoide lateral"],
  "Push press": ["Triceps", "Cuadriceps"],
  "Elevaciones laterales inclinadas": ["Trapecio superior"],
  "Elevaciones laterales con banda": ["Trapecio superior"],
  "Pajaros en maquina": ["Romboides", "Manguito rotador"],
  "Overhead press en Smith": ["Triceps", "Deltoide lateral"],
  "Bradford press": ["Triceps", "Deltoide lateral", "Deltoide posterior"],
  "Lateral raise unilateral en polea": ["Trapecio superior"],
  "Turkish get-up": ["Gluteos", "Transverso abdominal", "Oblicuos"],
  "Overhead carry": ["Transverso abdominal", "Trapecio superior"],
  "Curl con barra Z": ["Braquial", "Braquiorradial"],
  "Curl alternado con mancuernas": ["Braquial"],
  "Curl con mancuernas": ["Braquial"],
  "Curl en polea baja": ["Braquial"],
  "Curl en banco inclinado": ["Braquial"],
  "Curl predicador": ["Braquial"],
  "Curl en maquina": ["Braquial"],
  "Curl reverso con barra": ["Braquial", "Biceps"],
  "Press frances": ["Pectoral mayor"],
  "Rompecraneos": ["Pectoral mayor"],
  "Rompecraneos con mancuernas": ["Pectoral mayor"],
  "Fondos en banco": ["Pectoral mayor", "Deltoide anterior"],
  "Flexiones diamante": ["Pectoral mayor"],
  "JM press": ["Pectoral mayor"],
  "Tate press": ["Pectoral mayor"],
  "Dips con lastre": ["Pectoral mayor", "Deltoide anterior"],
  "Curl de arana": ["Braquial"],
  "Curl 21s": ["Braquial"],
  "Curl martillo cruzado": ["Biceps", "Braquiorradial"],
  "Curl zottman": ["Biceps", "Braquial"],
  "Curl en polea alta": ["Braquial"],
  "Bayesian curl": ["Braquial"],
  "Prensa de piernas unilateral": ["Gluteos"],
  "Elevacion de pantorrillas de pie": ["Soleo"],
  "Elevacion de pantorrillas sentado": ["Gemelos"],
  "Elevacion de pantorrillas en prensa": ["Soleo"],
  "Elevacion de pantorrillas unilateral": ["Soleo"],
  "Elevacion de gemelos con burro": ["Soleo"],
  "Caminata lateral con banda": ["Gluteos"],
  "Buenos dias con barra": ["Gluteos", "Erectores espinales"],
  "Sentadilla a una pierna": ["Gluteos"],
  "Sentadilla con salto": ["Gluteos", "Isquios"],
  "Swing con kettlebell": ["Isquios", "Erectores espinales"],
  "Goblet squat con kettlebell": ["Gluteos"],
  "Burpee con salto": ["Gluteos", "Pectoral mayor", "Triceps"],
  "Box jump con mancuernas": ["Gluteos", "Isquios"],
  "Crunch": ["Oblicuos"],
  "Crunch en polea": ["Oblicuos"],
  "Plancha frontal": ["Recto abdominal", "Gluteos"],
  "Plancha lateral": ["Transverso abdominal"],
  "Elevacion de piernas colgado": ["Flexores de cadera"],
  "Elevacion de piernas en banco": ["Flexores de cadera"],
  "Rueda abdominal": ["Dorsales", "Triceps", "Transverso abdominal"],
  "Russian twist": ["Recto abdominal", "Flexores de cadera"],
  "Pallof press": ["Recto abdominal", "Oblicuos"],
  "Dead bug": ["Recto abdominal", "Flexores de cadera"],
  "Hollow body": ["Flexores de cadera"],
  "Escaladores": ["Cuadriceps", "Flexores de cadera"],
  "Bicicleta abdominal": ["Recto abdominal", "Flexores de cadera"],
  "Toques de talon": ["Recto abdominal"],
  "Toques de punta": ["Oblicuos"],
  "Dragon flag": ["Flexores de cadera", "Transverso abdominal"],
  "Crunch inverso": ["Flexores de cadera"],
  "Extension de cadera prona": ["Gluteos", "Isquios"],
  "Crunch con peso en polea alta": ["Oblicuos"],
  "L-sit": ["Flexores de cadera", "Triceps"],
  "Plancha con elevacion de brazo": ["Recto abdominal", "Oblicuos"],
  "Windmill": ["Gluteos", "Deltoide anterior"],
  "Rotacion de tronco con polea": ["Recto abdominal"],
  "Caminata del granjero": ["Trapecio superior", "Antebrazo", "Gluteos"],
  "Caminata con maletin": ["Transverso abdominal", "Trapecio superior"],
  "Abdominales en V": ["Flexores de cadera", "Transverso abdominal"],
  "Bear crawl": ["Pectoral mayor", "Triceps", "Cuadriceps"],
  "Farmer carry": ["Trapecio superior", "Antebrazo", "Gluteos"],
  "Farmer carry con kettlebell": ["Trapecio superior", "Gluteos"],
  "Suitcase carry": ["Transverso abdominal", "Trapecio superior"],
  "Dominada con rodillas al pecho": ["Recto abdominal", "Biceps"],
  "Burpee con press": ["Cuadriceps", "Gluteos", "Triceps"],
  "Push-up a remo con mancuernas": ["Dorsales", "Biceps", "Triceps"],
  "Man maker": ["Pectoral mayor", "Cuadriceps", "Gluteos", "Triceps", "Biceps"],
  "Peso muerto + remo": ["Gluteos", "Isquios", "Biceps", "Erectores espinales"],
  "Snatch con barra": ["Cuadriceps", "Gluteos", "Triceps", "Isquios"],
  "Kettlebell clean and press": ["Cuadriceps", "Gluteos", "Triceps"],
  "Swing to press con kettlebell": ["Gluteos", "Isquios", "Triceps"],
  "Rueda abdominal extension": ["Dorsales", "Triceps", "Recto abdominal"],
  "Peso muerto con deficit": ["Gluteos", "Isquios", "Cuadriceps"],
  "Curl nordico": ["Gluteos"],
  "Escalador (mountain climber)": ["Cuadriceps", "Flexores de cadera"],
};

// Normalize: strip accents for matching
function normalize(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

const normalizedSecondaries = {};
for (const [k, v] of Object.entries(secondaries)) {
  normalizedSecondaries[normalize(k)] = v;
}

const lines = code.split("\n");
let count = 0;
const result = lines.map(line => {
  // Match ex() lines that end with a pattern string and closing paren (5 args, no extras)
  const m = line.match(/^(\s*ex\(")([^"]+)("(?:,\s*"[^"]*"){3},\s*"(?:legs|pull|push|core|rehab|compound)")(\),?)(\s*\/\/.*)?$/);
  if (!m) return line;
  const exName = m[2];
  const normName = normalize(exName);
  const found = normalizedSecondaries[normName];
  if (!found || found.length === 0) return line;
  count++;
  const arr = JSON.stringify(found);
  const trailing = m[4].startsWith(")") ? m[4].slice(1) : m[4]; // remove the )
  const comment = m[5] || "";
  return m[1] + exName + m[3] + ", " + arr + ")" + trailing + comment;
});

fs.writeFileSync("src/data/exerciseDatabase.js", result.join("\n"));
console.log("Updated " + count + " exercises with secondary muscles");
