const TIPS = {
  // ── PECHO ──────────────────────────────────────────────────────────────────
  "press-de-banca-plano": {
    steps: [
      "Acostado en el banco, escápulas retraídas, agarre algo más ancho que los hombros, pies planos en el suelo.",
      "Bajá la barra lento hasta rozar el pecho, codos a ~75° del torso.",
      "Empujá explosivo hasta extensión casi completa sin soltar la tensión.",
    ],
    tip: "Apretá la barra como si quisieras doblarla hacia afuera — activa más el pecho.",
  },
  "press-de-banca-inclinado": {
    steps: [
      "Banco a 30-45°. Escápulas retraídas, agarre similar al press plano.",
      "Bajá hacia la parte superior del pecho, no al cuello.",
      "Empujá hacia arriba y levemente hacia atrás.",
    ],
    tip: "A 30° es el punto óptimo para pectoral superior con mínima participación del hombro.",
  },
  "press-de-banca-declinado": {
    steps: [
      "Banco a -15°/-30°, pies asegurados, agarre algo más ancho que el press plano.",
      "Bajá la barra a la parte baja del pecho, codos a 60-70°.",
      "Empujá hasta extensión sin arquear exageradamente la lumbar.",
    ],
    tip: "Ideal para el pectoral inferior. Complementa muy bien los fondos en paralelas.",
  },
  "press-de-pecho-con-mancuernas": {
    steps: [
      "Sentado con mancuernas en las rodillas; al acostarte, subílas con el impulso de las rodillas.",
      "Bajá con los codos a 70-75°, muñecas neutras, hasta que los codos queden levemente por debajo del banco.",
      "Empujá hacia arriba juntando levemente las mancuernas en la parte alta.",
    ],
    tip: "Las mancuernas permiten mayor rango que la barra. Aprovechá ese estiramiento extra abajo.",
  },
  "aperturas-planas-con-mancuernas": {
    steps: [
      "Acostado en banco plano, mancuernas extendidas sobre el pecho, palmas enfrentadas, codos con leve flexión.",
      "Abrí los brazos en arco amplio hasta sentir estiramiento en el pecho.",
      "Volvé al centro por el mismo arco, contrayendo el pecho.",
    ],
    tip: "Pensá en 'abrazar un árbol grande'. El movimiento es de hombros, no de codos.",
  },
  "aperturas-inclinadas-con-mancuernas": {
    steps: [
      "Banco a 30-45°, mancuernas con leve flexión de codos.",
      "Abrí los brazos en arco amplio hasta sentir estiramiento en el pectoral superior.",
      "Cerrá contrayendo el pecho hacia arriba.",
    ],
    tip: "Mayor énfasis en pectoral superior que las aperturas planas.",
  },
  "cruces-en-polea-alta": {
    steps: [
      "Poleas altas, un pie adelante para estabilidad, codos levemente flexionados.",
      "Tirá los cables hacia abajo y adelante hasta que las manos se crucen frente al abdomen.",
      "Volvé controlado sintiendo el estiramiento en el pecho.",
    ],
    tip: "Variá la altura de cruce para enfocarte en diferentes zonas del pectoral.",
  },
  "cruces-en-polea-baja": {
    steps: [
      "Poleas bajas, codos levemente flexionados.",
      "Subí los brazos hacia adelante y arriba hasta juntar las manos a la altura del pecho.",
      "Volvé controlado.",
    ],
    tip: "Trabaja principalmente el pectoral superior. Excelente complemento del press inclinado.",
  },
  "fondos-en-paralelas": {
    steps: [
      "Agarrá las barras con brazos extendidos. Inclinarte levemente hacia adelante activa más el pecho.",
      "Bajá flexionando los codos hasta que el hombro quede levemente por debajo del codo.",
      "Empujá hacia arriba hasta casi extensión, sin bloquear los codos.",
    ],
    tip: "Cuerpo vertical = tríceps. Torso inclinado = pecho. Controlá el descenso para proteger el hombro.",
  },
  "flexiones": {
    steps: [
      "Manos a ancho de hombros, cuerpo en línea recta de cabeza a talones, core activo.",
      "Bajá hasta que el pecho casi toque el suelo, codos a ~45° del cuerpo.",
      "Empujá hacia arriba con fuerza hasta extensión completa.",
    ],
    tip: "El cuerpo es una tabla rígida. No dejés que las caderas suban o bajen.",
  },
  // ── ESPALDA ────────────────────────────────────────────────────────────────
  "peso-muerto": {
    steps: [
      "Párate con la barra sobre el mediopié, agarre a ancho de hombros, caderas más altas que rodillas.",
      "Empujá el suelo con los pies (no 'tires' la barra hacia arriba), manteniendo la barra pegada al cuerpo.",
      "Extendé caderas y rodillas simultáneamente. Terminá erguido, no hiper-extendido.",
    ],
    tip: "La espalda permanece neutra todo el tiempo. Si se redondea la lumbar, bajá el peso.",
  },
  "jalon-al-pecho-con-barra": {
    steps: [
      "Sentado, agarre pronado a ancho de 1.5 veces los hombros, torso levemente inclinado atrás.",
      "Deprimí las escápulas primero, luego tirá los codos hacia abajo y atrás hasta que la barra llegue al pecho.",
      "Volvé controlado hasta extensión casi completa.",
    ],
    tip: "Iniciá cada repetición con la depresión escapular antes de doblar el codo.",
  },
  "jalon-neutro": {
    steps: [
      "Sentado, agarre neutro (palmas enfrentadas) a ancho de hombros.",
      "Deprimí escápulas y tirá los codos hacia las caderas.",
      "Volvé hasta extensión casi completa.",
    ],
    tip: "El agarre neutro es el más cómodo para el hombro y permite gran activación del dorsal.",
  },
  "remo-con-barra": {
    steps: [
      "Pies a ancho de hombros, rodillas levemente flexionadas, torso inclinado 45-70°.",
      "Tirá la barra hacia el ombligo, retrayendo las escápulas al final.",
      "Bajá controlado extendiendo los brazos completamente.",
    ],
    tip: "Torso más horizontal = más dorsales. Más vertical = más trapecio medio.",
  },
  "remo-con-mancuerna": {
    steps: [
      "Una mano y rodilla apoyadas en el banco. Espalda paralela al suelo, mancuerna colgando.",
      "Tirá el codo hacia arriba y atrás, retrayendo la escápula al final.",
      "Bajá completamente el brazo antes de la siguiente rep.",
    ],
    tip: "No rotés el torso para 'ayudar'. El movimiento es solo del brazo y la escápula.",
  },
  "remo-en-polea-baja": {
    steps: [
      "Sentado, pies en los topes, rodillas levemente flexionadas.",
      "Desde estirado, comenzá retraer las escápulas, luego tirá los codos hacia atrás hasta las caderas.",
      "Volvé controlado extendiendo completamente.",
    ],
    tip: "No usés el torso para hacer balanceo. El movimiento viene de la espalda.",
  },
  "dominadas-pronadas": {
    steps: [
      "Agarre pronado (palmas al frente) a ancho de hombros o más amplio.",
      "Desde colgado completo, deprimí las escápulas primero, luego tirá los codos hacia abajo.",
      "Subí hasta que el mentón supere la barra. Bajá completamente.",
    ],
    tip: "Activá el core para no bambolear. Pensá en 'llevar los codos a las caderas'.",
  },
  "dominadas-supinas": {
    steps: [
      "Agarre supino (palmas hacia vos) a ancho de hombros.",
      "Desde colgado completo, deprimí escápulas y tirá los codos hacia abajo y atrás.",
      "Subí hasta que el pecho llegue a la barra.",
    ],
    tip: "El agarre supino genera mayor activación del bíceps que el pronado.",
  },
  "extensiones-de-espalda": {
    steps: [
      "Caderas apoyadas en la almohadilla, cuerpo flexionado hacia abajo, manos cruzadas o detrás de la cabeza.",
      "Levantá el torso hasta quedar en línea recta con las piernas.",
      "No hiperextiendas más allá de la posición neutra.",
    ],
    tip: "Para más glúteos, llevá el torso levemente más allá de la horizontal.",
  },
  "hiperextensiones": {
    steps: [
      "Caderas apoyadas en el soporte, pies asegurados, manos cruzadas o detrás de la cabeza.",
      "Partí con el torso flexionado hacia abajo y levantalo hasta quedar en línea recta.",
      "No hiperextiendas más allá de la posición neutra.",
    ],
    tip: "Ejercicio fundamental para fortalecer la cadena posterior y proteger la lumbar.",
  },
  "buenos-dias": {
    steps: [
      "Barra en la trapecio, pies a ancho de hombros, rodillas levemente flexionadas.",
      "Inclinarte hacia adelante desde la cadera (no la cintura) hasta que el torso quede paralelo o más.",
      "Volvé a erguirte contrayendo isquios y glúteos.",
    ],
    tip: "Mantené la espalda neutra. Si la lumbar se redondea, reducí el rango o el peso.",
  },
  "pullover-con-mancuerna": {
    steps: [
      "Tumbado transversal en el banco, caderas abajo. Agarra la mancuerna con ambas manos.",
      "Con codos levemente flexionados, llevá la mancuerna en arco hacia atrás hasta sentir estiramiento del dorsal.",
      "Volvé al punto de partida sobre el pecho.",
    ],
    tip: "Sentís el estiramiento del dorsal y el pecho. Ideal para expandir la caja torácica.",
  },
  // ── HOMBROS ────────────────────────────────────────────────────────────────
  "press-militar-con-barra": {
    steps: [
      "De pie o sentado, barra a la altura del pecho, agarre a ancho de hombros o algo más.",
      "Empujá la barra hacia arriba en línea recta hasta extensión completa.",
      "Bajá controlado hasta la clavícula.",
    ],
    tip: "Activá el core para no arquear la lumbar. Si es de pie, mayor demanda de estabilidad.",
  },
  "press-con-mancuernas": {
    steps: [
      "Sentado con respaldo, mancuernas a altura de orejas, palmas al frente.",
      "Empujá hacia arriba hasta casi extensión, sin juntar las mancuernas en la parte alta.",
      "Bajá controlado.",
    ],
    tip: "Mayor rango y trabajo independiente de cada hombro respecto a la barra.",
  },
  "press-arnold": {
    steps: [
      "Mancuernas frente a la cara, palmas hacia vos (posición de curl arriba).",
      "Al subir, rotá las muñecas hacia afuera hasta que las palmas queden al frente arriba.",
      "Al bajar, hacé el recorrido inverso.",
    ],
    tip: "Trabaja los tres deltoides. El giro activa el deltoide anterior en todo el rango.",
  },
  "elevaciones-laterales-con-mancuernas": {
    steps: [
      "De pie, mancuernas a los costados, leve flexión de codos.",
      "Levantá los brazos hacia los costados hasta que el codo quede a la altura del hombro.",
      "Bajá controlado en 2-3 segundos.",
    ],
    tip: "El meñique levemente arriba (como vertiendo agua) activa más el deltoide lateral.",
  },
  "elevaciones-frontales-con-mancuernas": {
    steps: [
      "De pie, mancuernas frente a los muslos, palmas abajo.",
      "Levantá un brazo a la vez (o ambos) hasta la altura del hombro.",
      "Bajá controlado.",
    ],
    tip: "No balanceés el torso. Peso moderado con control total.",
  },
  "elevaciones-posteriores-con-mancuernas": {
    steps: [
      "Inclinado hacia adelante (o en banco inclinado boca abajo), codos con leve flexión.",
      "Levantá los brazos hacia los costados pensando en llevar los codos al techo.",
      "Volvé controlado.",
    ],
    tip: "Imaginá que tenés una naranja en la axila. No dejés que los codos se cierren.",
  },
  "face-pull": {
    steps: [
      "Polea a la altura de la cara, cuerda, agarre neutro (pulgares hacia vos).",
      "Tirá la cuerda hacia la cara separando las manos al final, codos arriba.",
      "Volvé controlado.",
    ],
    tip: "Fundamental para la salud del manguito rotador. Siempre incluirlo en día de hombros.",
  },
  // ── BRAZOS ────────────────────────────────────────────────────────────────
  "curl-con-barra": {
    steps: [
      "De pie, agarre supino a ancho de hombros, codos fijos a los costados del torso.",
      "Flexioná los codos subiendo la barra hasta la contracción máxima del bíceps.",
      "Bajá controlado hasta extensión casi completa.",
    ],
    tip: "No usés el torso para hacer swing. Si lo hacés, el peso es demasiado.",
  },
  "curl-con-barra-z": {
    steps: [
      "De pie, agarre supino en la barra Z, codos fijos a los costados.",
      "Curlá hasta máxima contracción, sin mover los codos hacia adelante.",
      "Bajá controlado.",
    ],
    tip: "La barra Z reduce el estrés en las muñecas comparado con la barra recta.",
  },
  "curl-alternado-con-mancuernas": {
    steps: [
      "De pie o sentado, mancuernas a los costados, palmas enfrentadas.",
      "Al subir, rotá la muñeca para que la palma quede arriba (supinación).",
      "Bajá y alternás el otro brazo.",
    ],
    tip: "La supinación aumenta la contracción del bíceps. No la salteés.",
  },
  "curl-martillo": {
    steps: [
      "De pie, mancuernas a los costados, palmas enfrentadas (grip neutro).",
      "Flexioná el codo sin rotar la muñeca.",
      "Bajá completamente.",
    ],
    tip: "Trabaja más el braquial y braquiorradial. Excelente para grosor del brazo.",
  },
  "curl-concentrado": {
    steps: [
      "Sentado, codo apoyado en el muslo interno, mancuerna colgando.",
      "Curlá hacia arriba hasta máxima contracción.",
      "Bajá muy controlado.",
    ],
    tip: "Aislamiento puro del bíceps. Mantené el codo fijo en el muslo sin moverlo.",
  },
  "curl-predicador": {
    steps: [
      "Brazo apoyado en la almohadilla, codo levemente hacia adelante.",
      "Curlá hasta máxima contracción sin despegar el brazo del soporte.",
      "Bajá controlado, sin extender completamente para proteger la articulación.",
    ],
    tip: "La posición elimina el swing. Enfocate en sentir el bíceps, no en el peso.",
  },
  "extension-de-triceps-en-polea": {
    steps: [
      "Polea alta con barra recta o cuerda, codos fijos a los costados.",
      "Extendé los codos hacia abajo hasta lockout completo.",
      "Volvé sin mover los codos de lugar.",
    ],
    tip: "Codos quietos es la clave. Si se van hacia adelante, el peso es demasiado.",
  },
  "extension-de-triceps-con-cuerda": {
    steps: [
      "Polea alta con cuerda, codos fijos a los costados.",
      "Al extender, abrí levemente las manos hacia afuera para mayor contracción.",
      "Volvé controlado.",
    ],
    tip: "La apertura de la cuerda abajo maximiza la contracción de los tres cabezales del tríceps.",
  },
  "press-frances": {
    steps: [
      "Acostado en banco plano, barra Z sobre el pecho, codos apuntando al techo.",
      "Bajá la barra hacia la frente flexionando solo los codos.",
      "Extendé hasta lockout.",
    ],
    tip: "La barra Z reduce estrés en las muñecas. Si sentís dolor, probá con mancuernas.",
  },
  "rompecraneos": {
    steps: [
      "Acostado en banco plano, barra sobre el pecho, codos apuntando al techo.",
      "Bajá la barra hacia la frente o levemente detrás de la cabeza.",
      "Extendé los codos hasta lockout.",
    ],
    tip: "Mantené los codos apuntando al techo durante todo el movimiento.",
  },
  "fondos-en-banco": {
    steps: [
      "Manos en el borde del banco, pies extendidos al frente con piernas rectas.",
      "Bajá flexionando los codos hasta que los brazos estén a ~90°.",
      "Empujá hasta extensión completa.",
    ],
    tip: "Para más dificultad, elevá los pies. Codos cerca del cuerpo = más tríceps.",
  },
  // ── PIERNAS ────────────────────────────────────────────────────────────────
  "sentadilla-libre": {
    steps: [
      "Barra en la trapecio, pies a ancho de hombros o algo más, punteras levemente afuera.",
      "Bajá como si te sentaras en una silla detrás de vos, rodillas en línea con los pies.",
      "Empujá desde los talones hasta extensión completa.",
    ],
    tip: "El pecho siempre arriba. Si la espalda se redondea, trabajá movilidad de tobillo y cadera.",
  },
  "sentadilla-en-smith": {
    steps: [
      "Barra en la trapecio, pies levemente adelantados respecto a la barra.",
      "Bajá con control hasta muslos paralelos al suelo o más.",
      "Empujá desde los talones.",
    ],
    tip: "El Smith permite mayor seguridad para principiantes o trabajo unilateral.",
  },
  "sentadilla-hack-en-maquina": {
    steps: [
      "Espalda pegada a la almohadilla, hombros bajo los soportes, pies a ancho de hombros.",
      "Soltá los seguros y bajá con control hasta ~90° de rodillas.",
      "Empujá desde los talones para subir.",
    ],
    tip: "Pies más juntos y adelante = más cuádriceps. Más separados = más glúteos.",
  },
  "prensa-de-piernas": {
    steps: [
      "Pies a ancho de hombros en el plato, rodillas apuntando hacia los pies.",
      "Bajá el plato hasta que las rodillas estén a ~90° sin que la lumbar se despegue.",
      "Empujá hasta casi extensión, sin bloquear las rodillas.",
    ],
    tip: "No dejés que la zona lumbar se despegue de la almohadilla al bajar.",
  },
  "extension-de-piernas": {
    steps: [
      "Sentado en la máquina, tobillo detrás de la almohadilla, rodilla a 90°.",
      "Extendé las rodillas hasta máxima extensión y sostené 1 segundo.",
      "Bajá controlado.",
    ],
    tip: "Punteras al frente o levemente adentro activa más el recto femoral.",
  },
  "curl-femoral-acostado": {
    steps: [
      "Acostado boca abajo, tobillo detrás de la almohadilla, caderas planas en el banco.",
      "Curlá hacia los glúteos hasta donde llegues.",
      "Bajá controlado hasta extensión.",
    ],
    tip: "Apretá los glúteos durante el movimiento para proteger la zona lumbar.",
  },
  "curl-femoral-sentado": {
    steps: [
      "Sentado, tobillo sobre la almohadilla, espalda apoyada.",
      "Curlá hacia abajo hasta máxima flexión.",
      "Volvé controlado.",
    ],
    tip: "La posición sentada estira más la cadera, dando mayor rango al isquio.",
  },
  "peso-muerto-rumano": {
    steps: [
      "De pie, barra frente a los muslos, leve flexión de rodillas, espalda neutra.",
      "Empujá las caderas hacia atrás bajando la barra a lo largo de las piernas hasta sentir el tirón en los isquios.",
      "Volvé empujando las caderas hacia adelante.",
    ],
    tip: "El movimiento es de caderas hacia atrás, no de torso hacia abajo. La barra siempre cerca del cuerpo.",
  },
  "peso-muerto-rumano-con-mancuernas": {
    steps: [
      "De pie, mancuernas frente a los muslos, leve flexión de rodillas.",
      "Empujá las caderas hacia atrás bajando las mancuernas hasta sentir el tirón en los isquios.",
      "Volvé empujando las caderas hacia adelante.",
    ],
    tip: "Las mancuernas dan mayor libertad de movimiento y corrigen desequilibrios entre lados.",
  },
  "estocada-con-mancuernas": {
    steps: [
      "De pie, mancuernas a los costados. Dá un paso largo hacia adelante.",
      "Bajá la rodilla trasera casi al suelo manteniendo el torso erguido.",
      "Empujá con la pierna delantera para volver.",
    ],
    tip: "Paso largo = más glúteo. Paso corto = más cuádriceps. La rodilla no supera la punta del pie.",
  },
  "estocada-bulgara": {
    steps: [
      "Pie trasero elevado en banco (30-45 cm), pie delantero bien adelante, mancuernas a los costados.",
      "Bajá la rodilla trasera hacia el suelo con el torso erguido.",
      "Empujá con el talón del pie delantero para volver.",
    ],
    tip: "Buscá estabilidad antes de agregar peso. Es uno de los ejercicios de pierna más completos.",
  },
  "hip-thrust-con-barra": {
    steps: [
      "Hombros apoyados en el banco, barra sobre las caderas (con almohadilla), pies firmes y cercanos al cuerpo.",
      "Bajá las caderas hacia el suelo, luego empujá hacia arriba apretando glúteos.",
      "En la posición alta, caderas, rodillas y torso deben formar una línea recta.",
    ],
    tip: "Sostené 1 segundo arriba apretando los glúteos. No hiperextiendas la lumbar.",
  },
  "hip-thrust-en-maquina": {
    steps: [
      "Sentado en la máquina, almohadilla sobre las caderas, pies apoyados.",
      "Empujá las caderas hacia adelante hasta extensión completa apretando glúteos.",
      "Volvé controlado.",
    ],
    tip: "Pensá en 'esconder el coxis' en la parte alta para máxima contracción del glúteo.",
  },
  "glute-kickback-en-maquina": {
    steps: [
      "Posicioná el pie en la almohadilla, inclinate levemente hacia adelante.",
      "Empujá hacia atrás y arriba extendiendo la cadera hasta máxima contracción del glúteo.",
      "Volvé controlado.",
    ],
    tip: "No rotés la cadera para 'ayudar'. El movimiento debe venir solo del glúteo.",
  },
  "elevacion-de-pantorrillas-de-pie": {
    steps: [
      "De pie en el borde de un escalón, puntas de pies al borde, talones colgando.",
      "Bajá los talones lo más posible para máximo estiramiento del gemelo.",
      "Subí en puntas lo más alto posible.",
    ],
    tip: "Pausá 1 segundo arriba y abajo para eliminar el rebote y maximizar el rango.",
  },
  "elevacion-de-pantorrillas-sentado": {
    steps: [
      "Sentado en la máquina, almohadilla sobre los muslos, puntas en la plataforma.",
      "Bajá los talones lo más posible.",
      "Subí en puntas hasta máxima contracción.",
    ],
    tip: "La posición sentada aísla el sóleo (músculo profundo de la pantorrilla).",
  },
  "curl-nordico": {
    steps: [
      "De rodillas con los tobillos fijos, cuerpo recto desde rodillas hasta hombros.",
      "Caé hacia adelante controlando la velocidad con los isquios.",
      "Frenate con las manos cuando llegués al límite y volvé contrayendo los isquios.",
    ],
    tip: "Empezá con rangos parciales. Uno de los ejercicios más efectivos para prevenir lesiones de isquios.",
  },
  "sentadilla-goblet": {
    steps: [
      "De pie, kettlebell o mancuerna sostenida verticalmente frente al pecho, pies a ancho de hombros.",
      "Bajá manteniendo el torso erguido y los codos hacia adentro de las rodillas.",
      "Empujá desde los talones para subir.",
    ],
    tip: "El peso adelante te obliga a mantener el torso erguido. Ideal para aprender la sentadilla.",
  },
  // ── CORE ──────────────────────────────────────────────────────────────────
  "crunch": {
    steps: [
      "Acostado, rodillas flexionadas, manos detrás de la cabeza (sin tirar del cuello).",
      "Curvá el torso levantando las escápulas del suelo.",
      "Bajá controlado.",
    ],
    tip: "El movimiento es pequeño — solo levantás las escápulas, no el torso completo.",
  },
  "plancha-frontal": {
    steps: [
      "Apoyado en antebrazos y puntas de pies, cuerpo en línea recta de cabeza a talones.",
      "Activá el core, apretá los glúteos, no dejes caer la cadera.",
      "Respirá normalmente durante todo el tiempo.",
    ],
    tip: "Mejor 3×20 segundos perfectos que 1×60 segundos mal hecho.",
  },
  "plancha-lateral": {
    steps: [
      "Apoyo en un antebrazo, cuerpo de lado en línea recta, caderas arriba.",
      "Activá el oblicuo para no dejar caer la cadera.",
      "Podés hacer elevaciones de cadera para mayor dificultad.",
    ],
    tip: "Cabeza, caderas y pies en línea perfecta. La cadera no cae ni sube.",
  },
  "elevacion-de-piernas-colgado": {
    steps: [
      "Colgado de la barra, activá el core antes de mover las piernas.",
      "Levantá las piernas (rectas o flexionadas) hasta la horizontal o más.",
      "Bajá controlado sin bambolear.",
    ],
    tip: "Si balanceás, el movimiento pierde efectividad. Core siempre activo.",
  },
  "rueda-abdominal": {
    steps: [
      "De rodillas con la rueda en el suelo frente a vos, core muy activado.",
      "Rodá hacia adelante bajando el cuerpo en línea recta tanto como puedas.",
      "Volvé contrayendo el core sin que la lumbar se arquee.",
    ],
    tip: "Ejercicio avanzado. Empezá con extensiones parciales hasta ganar fuerza.",
  },
  "russian-twist": {
    steps: [
      "Sentado, rodillas flexionadas, torso a 45°, pies en el suelo (o levantados para más dificultad).",
      "Con peso o sin, rotá el torso hacia cada lado llevando las manos al nivel del suelo.",
      "Mantené el core activo todo el tiempo.",
    ],
    tip: "La rotación viene del core, no del swing de brazos. Movimiento controlado.",
  },
  "pallof-press": {
    steps: [
      "De pie lateral a la polea, agarre con ambas manos a la altura del pecho.",
      "Extendé los brazos hacia adelante sin dejar que el torso gire.",
      "Volvé los brazos al pecho.",
    ],
    tip: "Es un ejercicio anti-rotación: el objetivo es NO moverse. Ideal para estabilidad de core.",
  },
  "dead-bug": {
    steps: [
      "Acostado, brazos extendidos al techo, rodillas a 90° sobre las caderas.",
      "Extendé simultáneamente el brazo derecho hacia atrás y la pierna izquierda hacia adelante.",
      "Volvé al centro y alternás.",
    ],
    tip: "La zona lumbar debe pegarse al suelo todo el tiempo. Si se despega, reducí el rango.",
  },
  "crunch-en-polea": {
    steps: [
      "De rodillas frente a la polea alta, agarre de la cuerda por detrás de la cabeza.",
      "Flexioná el torso hacia adelante contrayendo el abdomen.",
      "Volvé controlado.",
    ],
    tip: "El movimiento viene del abdomen, no de tirar la cuerda con los brazos.",
  },
  // ── COMPUESTOS CLAVE ──────────────────────────────────────────────────────
  "peso-muerto-sumo": {
    steps: [
      "Pies más anchos que los hombros, punteras bien afuera, agarre dentro de las piernas.",
      "Empujá el suelo con los pies, rodillas hacia afuera en línea con los pies.",
      "Extendé caderas y rodillas simultáneamente.",
    ],
    tip: "El sumo reduce el rango de movimiento y permite más trabajo de glúteos y aductores.",
  },
  "sentadilla-frontal": {
    steps: [
      "Barra apoyada en los deltoides anteriores (rack position), codos arriba.",
      "Bajá con el torso lo más vertical posible.",
      "Empujá desde los talones.",
    ],
    tip: "Requiere gran movilidad de tobillo y hombro. El torso vertical trabaja más el cuádriceps.",
  },
};

// Fallbacks por patrón para ejercicios sin instrucciones específicas
const PATTERN_TIPS = {
  push: {
    steps: [
      "Posicioná el cuerpo estable con core activado.",
      "Bajá o acercá el peso de forma controlada.",
      "Empujá explosivo hasta extensión casi completa.",
    ],
    tip: "Respirá al bajar, soltá el aire al empujar.",
  },
  pull: {
    steps: [
      "Iniciá el movimiento retrayendo las escápulas.",
      "Tirá con los codos, no con las manos.",
      "Controlá el regreso a posición inicial.",
    ],
    tip: "Sentí el estiramiento en el músculo objetivo al inicio de cada repetición.",
  },
  legs: {
    steps: [
      "Pies a ancho de hombros, punteras levemente afuera.",
      "Bajá manteniendo las rodillas alineadas con los pies.",
      "Empujá desde los talones.",
    ],
    tip: "Mantené el torso erguido y el core firme durante todo el movimiento.",
  },
  core: {
    steps: [
      "Activá el core antes de mover (como si fueras a recibir un golpe).",
      "Ejecutá el movimiento con rango completo sin compensar con la espalda baja.",
      "Controlá tanto la contracción como el regreso.",
    ],
    tip: "Exhalá en la contracción, inhalá al volver.",
  },
  rehab: {
    steps: [
      "Usá un peso ligero que permita control total.",
      "Movimiento lento y controlado, sin inercia.",
      "Sentí el músculo trabajar en cada repetición.",
    ],
    tip: "Este ejercicio prioriza calidad sobre cantidad. Nunca sacrifiques rango por peso.",
  },
};

export function getExerciseTips(exercise) {
  if (!exercise) return PATTERN_TIPS.push;
  const specific = TIPS[exercise.id];
  if (specific) return specific;
  return PATTERN_TIPS[exercise.pattern] || PATTERN_TIPS.push;
}
