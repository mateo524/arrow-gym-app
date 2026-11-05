// Técnica escrita de los ejercicios del grupo: core. Formato en src/data/technique/index.js.
const plankFront = {
  setup: "Apoyá los antebrazos y las puntas de los pies en el piso. Los codos van justo debajo de los hombros.",
  steps: [
    "Estirá las piernas y formá una línea recta desde la cabeza hasta los talones.",
    "Apretá la cola y metete el ombligo hacia adentro, como si te fueran a dar un golpe suave.",
    "Mirá un punto del piso, un poco por delante de las manos.",
    "Sostené el tiempo indicado y apoyá las rodillas para salir.",
  ],
  breath: "Respirá de forma lenta y constante, sin aguantar el aire.",
  mistakes: [
    "Se hunde la cintura y duele la espalda baja: apretá cola y abdomen, o apoyá las rodillas.",
    "Subís la cola como una montaña: bajala hasta alinear la espalda con las piernas.",
    "Tenés el cuello caído o muy levantado: mirá al piso y mantené la nuca en línea con la espalda.",
  ],
  tip: "Mejor 20 segundos bien hechos que un minuto torcido. Sumá tiempo de a poco.",
};

const russianBase = (load) => ({
  setup: `Sentate en el piso con las rodillas flexionadas y los talones apoyados. Inclinate hacia atrás hasta sentir el abdomen trabajar${load ? ", sosteniendo " + load + " con las dos manos frente al pecho" : ", con las manos juntas frente al pecho"}.`,
  steps: [
    "Mantené la espalda larga, sin encorvarte, y el pecho abierto.",
    "Girá el torso hacia un lado, llevando las manos hacia el costado de la cadera.",
    "Volvé al centro sin parar y girá hacia el otro lado.",
    "Si querés más desafío, levantá los pies del piso, pero solo si la espalda no se redondea.",
  ],
  breath: "Exhalá al girar hacia cada lado y respirá de forma continua.",
  mistakes: [
    "Movés solo los brazos de lado a lado: girá las costillas y los hombros, no solo las manos.",
    "Te encorvás hacia atrás o hacia adelante: sentate más derecho y reducí el peso.",
    "Vas muy rápido y con tirones: hacelo lento para que trabaje el abdomen y no el impulso.",
  ],
  tip: load ? "Empezá con poco peso. Si la espalda se redondea, usá menos o dejá los pies apoyados." : "Con los pies apoyados es más fácil. Levantalos recién cuando el movimiento te salga limpio.",
});

const carryBase = (what, one) => ({
  setup: one
    ? `Agarrá ${what} con una sola mano, a un costado del cuerpo, y pará bien derecho con los pies al ancho de las caderas.`
    : `Agarrá ${what}, una en cada mano, a los costados del cuerpo y pará bien derecho con los pies al ancho de las caderas.`,
  steps: [
    "Subí el pecho, bajá los hombros lejos de las orejas y apretá el abdomen.",
    "Mirá al frente y caminá con pasos cortos y parejos.",
    one ? "No te inclines hacia el lado del peso: mantené los hombros nivelados." : "Mantené los brazos estirados y el peso pegado al costado, sin que choque con las piernas.",
    "Recorré la distancia o el tiempo indicado y soltá el peso con cuidado, flexionando las rodillas.",
  ],
  breath: "Respirá normal y constante, sin aguantar el aire.",
  mistakes: [
    one ? "Te inclinás hacia el peso: pará derecho, con la cabeza justo arriba de la cadera." : "Los hombros se encogen hacia las orejas: bajalos y alejalos de las orejas.",
    "Encorvás la espalda o echás la cabeza adelante: pecho arriba y mirada al frente.",
    "Caminás con pasos largos y apurados: acortá el paso para no perder el control.",
  ],
  tip: "Elegí un peso que puedas llevar sin soltarlo. Además mejora la fuerza de agarre del día a día.",
});

const mountainClimberTech = () => ({
  setup: "Entrá en posición de plancha alta, con las manos bajo los hombros y el cuerpo en línea recta de la cabeza a los talones.",
  steps: [
    "Apretá el abdomen y mantené la espalda plana.",
    "Llevá una rodilla hacia el pecho, sin subir la cola.",
    "Volvé el pie atrás y llevá la otra rodilla, alternando como si corrieras.",
    "Seguí a un ritmo que puedas controlar, sin rebotar con la cadera.",
  ],
  breath: "Respirá de forma continua, sin aguantar el aire.",
  mistakes: [
    "La cola sube hacia el techo: mantené la cadera a la altura de los hombros.",
    "Las manos se mueven o los hombros se hunden: empujá el piso y mantené los brazos firmes.",
    "Vas tan rápido que perdés la forma: bajá el ritmo y mantené el abdomen apretado.",
  ],
  tip: "Para empezar, apoyá las manos en un banco o escalón. Es más fácil y cuida las muñecas.",
});

export const TECH = {
  "Crunch": {
    setup: "Acostate boca arriba con las rodillas flexionadas y los pies apoyados en el piso. Poné las manos cruzadas sobre el pecho o apenas tocando las sienes.",
    steps: [
      "Mantené la espalda baja apoyada en el piso.",
      "Subí solo los hombros y la parte alta de la espalda, mirando al techo.",
      "Frená un segundo arriba, apretando el abdomen.",
      "Bajá despacio hasta apoyar los hombros de nuevo.",
    ],
    breath: "Exhalá por la boca al subir y inhalá por la nariz al bajar.",
    mistakes: [
      "Tirás del cuello con las manos: dejá los codos abiertos y sostené la cabeza sin empujarla.",
      "Subís todo el torso: es un movimiento corto, solo se despegan los omóplatos.",
      "Vas rápido y con impulso: subí y bajá lento, contando hasta dos.",
    ],
    tip: "Imaginá que tenés una naranja entre el mentón y el pecho: así el cuello no se encorva.",
  },
  "Crunch en polea": {
    setup: "Arrodillate frente a la polea alta, con la soga agarrada a los lados de la cabeza. Las caderas quedan quietas, apoyadas sobre los talones.",
    steps: [
      "Sostené la soga junto a las orejas y no la muevas durante todo el ejercicio.",
      "Llevá los codos hacia las rodillas, enrollando la columna hacia abajo.",
      "Apretá el abdomen un segundo al final del recorrido.",
      "Volvé despacio hacia arriba sin dejar que el peso te tire.",
    ],
    breath: "Exhalá al bajar el torso y inhalá al subir.",
    mistakes: [
      "Tirás con los brazos: pensá en que los codos llegan a las rodillas gracias al abdomen.",
      "Movés la cadera hacia atrás y adelante: mantenela quieta, solo se dobla la columna.",
      "Usás demasiado peso y el cuello sufre: bajá la carga hasta mover el torso con control.",
    ],
    tip: "Empezá con poco peso. El movimiento es de columna, no de cadera.",
  },
  "Plancha frontal": plankFront,
  "Plancha lateral": {
    setup: "Acostate de costado y apoyá el antebrazo en el piso, con el codo justo debajo del hombro. Las piernas quedan estiradas y los pies uno sobre otro.",
    steps: [
      "Subí la cadera hasta formar una línea recta desde la cabeza hasta los pies.",
      "Mantené el hombro lejos de la oreja, empujando el piso con el antebrazo.",
      "Sostené sin girar el pecho hacia adelante ni hacia atrás.",
      "Bajá despacio y repetí del otro lado.",
    ],
    breath: "Respirá de forma lenta y constante, sin aguantar el aire.",
    mistakes: [
      "Se cae la cadera hacia el piso: subila hasta alinearla con los hombros y los pies.",
      "El pecho rota hacia el techo o el piso: mantené el cuerpo como si estuviera entre dos paredes.",
      "El hombro se hunde hacia la oreja: empujá el piso y alejalo del cuello.",
    ],
    tip: "Para empezar, doblá las rodillas y apoyalas: el apoyo corto es más fácil.",
  },
  "Elevación de piernas colgado": {
    setup: "Colgate de una barra con las manos algo más abiertas que los hombros y los brazos estirados. Las piernas cuelgan juntas.",
    steps: [
      "Apretá el abdomen antes de empezar para que el cuerpo no se balancee.",
      "Subí las piernas juntas, con las rodillas flexionadas para empezar, hasta la altura de la cadera o más.",
      "Llevá la pelvis un poco hacia adelante y arriba al final, como enrollándola.",
      "Bajá lento, sin soltarte, hasta que las piernas queden colgando de nuevo.",
    ],
    breath: "Exhalá al subir las piernas e inhalá al bajarlas.",
    mistakes: [
      "Te balanceás para tomar impulso: frená el cuerpo en cada repetición y subí solo con el abdomen.",
      "Las piernas suben con la espalda baja arqueada: llevá la pelvis hacia adelante al subir.",
      "Soltás las piernas de golpe: bajalas contando hasta tres.",
    ],
    tip: "Con las rodillas flexionadas es mucho más fácil. Estirá las piernas cuando te salga sin balanceo.",
  },
  "Elevación de piernas en banco": {
    setup: "Acostate boca arriba en un banco con las manos sosteniendo el borde detrás de la cabeza. Las piernas salen por el otro extremo, estiradas.",
    steps: [
      "Apretá el abdomen y mantené la espalda baja pegada al banco.",
      "Subí las piernas juntas hasta que queden casi verticales.",
      "Bajalas lento hasta donde la espalda baja siga apoyada.",
      "Repetí sin dar rebote.",
    ],
    breath: "Exhalá al subir las piernas e inhalá al bajar.",
    mistakes: [
      "La espalda baja se despega del banco: no bajes tanto las piernas, o doblá las rodillas.",
      "Bajás las piernas muy rápido: controlá el descenso contando hasta tres.",
      "Tirás de la cabeza con las manos: agarrá el banco y relajá el cuello.",
    ],
    tip: "Si te duele la espalda baja, hacelo con las rodillas flexionadas o con rango más corto.",
  },
  "Rueda abdominal": {
    setup: "Arrodillate sobre una colchoneta y agarrá la rueda con las dos manos justo debajo de los hombros. Metete la cola un poco hacia adelante y apretá el abdomen.",
    steps: [
      "Rodá hacia adelante despacio, estirando los brazos, con la espalda recta.",
      "Frená cuando todavía puedas mantener la espalda baja sin hundirla.",
      "Apretá el abdomen y traé la rueda de vuelta hacia las rodillas.",
      "Volvé a la posición inicial sin dejar caer la cadera.",
    ],
    breath: "Inhalá al rodar hacia adelante y exhalá al volver.",
    mistakes: [
      "Se hunde la espalda baja: rodá menos distancia y mantené la cola apretada.",
      "Tirás con los brazos para volver: la fuerza tiene que venir del abdomen.",
      "Intentás llegar al piso desde el primer día: empezá con medio recorrido.",
    ],
    tip: "Para empezar, hacelo contra una pared: la rueda choca y vos controlás hasta dónde llegás.",
  },
  "Rueda abdominal extensión": {
    setup: "Arrodillate con la rueda agarrada debajo de los hombros, con el abdomen apretado y la cola metida hacia adelante.",
    steps: [
      "Rodá hacia adelante con los brazos estirados, hasta casi llegar al piso con el cuerpo.",
      "Mantené la espalda sin hundirla y las costillas hacia abajo.",
      "Apretá el abdomen un segundo en el punto más lejano.",
      "Volvé a las rodillas despacio, sin tirar con los brazos ni empujar con la cadera.",
    ],
    breath: "Inhalá al rodar hacia adelante y exhalá al volver.",
    mistakes: [
      "La cintura se hunde en el punto más lejano: reducí la distancia hasta controlar la espalda.",
      "Volvés con el impulso de la cadera: llevá las costillas hacia la pelvis para volver con el abdomen.",
      "Tenés los hombros encogidos: alejalos de las orejas.",
    ],
    tip: "Es la versión más difícil. Si todavía no podés hacer la rueda corta con control, volvé a esa.",
  },
  "Russian twist": russianBase(null),
  "Pallof press": {
    setup: "Parate de costado a la polea, a la altura del pecho, con los pies al ancho de los hombros. Agarrá el cable con las dos manos pegadas al pecho y las rodillas apenas flexionadas.",
    steps: [
      "Apretá el abdomen y mantené la cadera y los hombros mirando al frente.",
      "Estirá los brazos hacia adelante, lejos del pecho, resistiendo el tirón del cable.",
      "Sostené un segundo sin que el cuerpo gire.",
      "Volvé las manos al pecho con control y repetí. Después cambiá de lado.",
    ],
    breath: "Exhalá al estirar los brazos e inhalá al volver, sin aguantar el aire.",
    mistakes: [
      "El cuerpo gira hacia la polea: usá menos peso o parate más cerca de la polea.",
      "Te inclinás hacia atrás: mantené las costillas hacia abajo y el cuerpo derecho.",
      "Hacés el movimiento rápido: lento, sosteniendo, para que trabaje el abdomen.",
    ],
    tip: "El objetivo es no girar. Si el cable te mueve, bajá el peso.",
  },
  "Dead bug": {
    setup: "Acostate boca arriba con los brazos estirados hacia el techo y las rodillas dobladas a 90 grados sobre la cadera. Apoyá toda la espalda baja en el piso.",
    steps: [
      "Apretá el abdomen para que la espalda baja no se despegue del piso.",
      "Bajá un brazo hacia atrás y la pierna contraria hacia adelante, sin tocar el piso.",
      "Volvé al centro con el mismo control.",
      "Repetí con el otro brazo y la otra pierna, alternando.",
    ],
    breath: "Exhalá al estirar el brazo y la pierna, e inhalá al volver al centro.",
    mistakes: [
      "La espalda baja se arquea: hacé el movimiento más corto o mové solo los brazos.",
      "Vas muy rápido: tardá unos tres segundos en cada bajada.",
      "Tenés el cuello tenso: mirá al techo y relajá la nuca.",
    ],
    tip: "Probá meter una mano bajo la espalda baja al inicio: si se despega, reducí el rango.",
  },
  "Hollow body": {
    setup: "Acostate boca arriba con los brazos estirados por encima de la cabeza y las piernas juntas y estiradas. Pegá la espalda baja al piso.",
    steps: [
      "Apretá el abdomen y aplastá la espalda baja contra el piso.",
      "Levantá los pies, los brazos y los hombros unos centímetros, como una banana.",
      "Mantené la espalda baja pegada, sin arquearla.",
      "Sostené el tiempo indicado y bajá despacio.",
    ],
    breath: "Respirá corto y tranquilo, sin aguantar el aire.",
    mistakes: [
      "La espalda baja se despega: subí las piernas más arriba hasta mantenerla pegada.",
      "Tirás de la cabeza hacia adelante: mirá a los pies y relajá el cuello.",
      "Los brazos o las piernas están muy bajos y duele: doblá las rodillas o llevá los brazos a los costados.",
    ],
    tip: "Para empezar, dejá las rodillas flexionadas y los brazos pegados al cuerpo. Es más fácil y igual de útil.",
  },
  "Escaladores": mountainClimberTech(),
  "Bicicleta abdominal": {
    setup: "Acostate boca arriba con las manos livianamente detrás de la cabeza, sin entrelazarlas. Levantá las piernas con las rodillas dobladas.",
    steps: [
      "Subí los hombros del piso y mantené la espalda baja apoyada.",
      "Llevá un codo hacia la rodilla contraria mientras estirás la otra pierna.",
      "Cambiá de lado en forma de pedaleo, girando el torso.",
      "Seguí alternando de forma lenta y controlada.",
    ],
    breath: "Exhalá al girar hacia cada lado y respirá de forma continua.",
    mistakes: [
      "Tirás de la cabeza con las manos: los codos van abiertos y el giro viene del torso.",
      "Girás solo los codos: llevá el hombro hacia la rodilla, no solo el codo.",
      "Vas demasiado rápido: hacelo lento para sentir el abdomen y no la cadera.",
    ],
    tip: "Si la espalda baja se despega, subí las piernas más arriba.",
  },
  "Toques de talón": {
    setup: "Acostate boca arriba con las rodillas flexionadas y los pies apoyados, y los brazos estirados a los costados del cuerpo.",
    steps: [
      "Levantá un poco los hombros del piso, mirando hacia arriba.",
      "Llevá la mano derecha hacia el talón derecho, inclinando el torso hacia ese lado.",
      "Volvé al centro y llevá la mano izquierda al talón izquierdo.",
      "Seguí alternando sin apoyar del todo los hombros.",
    ],
    breath: "Exhalá al tocar cada talón y respirá continuo.",
    mistakes: [
      "Solo estirás el brazo: inclinate de verdad hacia el costado, los hombros se mueven.",
      "Levantás todo el torso: solo se despegan los hombros.",
      "Movés los pies: mantenelos apoyados y quietos.",
    ],
    tip: "Acercá los pies a la cola para hacerlo más corto y fácil, o alejalos para más desafío.",
  },
  "Toques de punta": {
    setup: "Acostate boca arriba con las piernas estiradas hacia el techo, apenas flexionadas en las rodillas. Los brazos van estirados hacia los pies.",
    steps: [
      "Apretá el abdomen y mantené la espalda baja apoyada.",
      "Subí los hombros del piso e intentá tocar las puntas de los pies con las manos.",
      "Frená un segundo arriba, sin tirar del cuello.",
      "Bajá despacio hasta apoyar los hombros.",
    ],
    breath: "Exhalá al subir hacia los pies e inhalá al bajar.",
    mistakes: [
      "Impulsás con los brazos: pensá que el abdomen te sube, los brazos solo acompañan.",
      "Las piernas se bajan o se mueven: mantenelas quietas apuntando al techo.",
      "No llegás a los pies: no importa, tocá lo que puedas sin forzar el cuello.",
    ],
    tip: "Si las piernas estiradas te tiran de la espalda, flexioná un poco las rodillas.",
  },
  "Dragon flag": {
    setup: "Acostate boca arriba en un banco y agarrá el borde detrás de la cabeza con las dos manos. Apoyá solo los hombros y la parte alta de la espalda, con el mentón metido.",
    steps: [
      "Subí las piernas y la cadera hasta que el cuerpo quede casi vertical sobre los hombros.",
      "Mantené el cuerpo rígido como una tabla, desde los hombros hasta los pies.",
      "Bajá despacio, sin doblar la cintura, hasta donde puedas controlar.",
      "Volvé a subir con el abdomen apretado.",
    ],
    breath: "Exhalá al subir e inhalá al bajar, sin aguantar el aire.",
    mistakes: [
      "Doblás la cintura al bajar: bajá menos o doblá las rodillas hasta tener fuerza.",
      "Apoyás el cuello: el peso va en la parte alta de la espalda, no en la nuca.",
      "Bajás de golpe: contá tres segundos en la bajada.",
    ],
    tip: "Es avanzado. Antes dominá el hollow body y la elevación de piernas colgado, y progresá con las rodillas flexionadas y bajadas lentas. Evitalo si tenés dolor de cuello, espalda u hombro.",
  },
  "Crunch inverso": {
    setup: "Acostate boca arriba con las manos a los costados o debajo de la cola. Levantá las rodillas dobladas hasta formar 90 grados con la cadera.",
    steps: [
      "Apretá el abdomen y mantené los hombros apoyados.",
      "Llevá las rodillas hacia el pecho, levantando la cola unos centímetros del piso.",
      "Frená un segundo arriba.",
      "Bajá despacio, sin rebotar con la cola ni los pies.",
    ],
    breath: "Exhalá al subir la cadera e inhalá al bajar.",
    mistakes: [
      "Usás el impulso de las piernas: subí lento y con control del abdomen.",
      "Levantás mucho la cadera y te balanceás: el movimiento es corto, solo se despega la cola.",
      "Tirás con los brazos: apoyá las manos sin empujar.",
    ],
    tip: "Pensá en llevar la pelvis hacia las costillas, no los pies hacia la cara.",
  },
  "Vacío abdominal": {
    setup: "Ponete en cuatro apoyos, con las manos bajo los hombros, las rodillas bajo la cadera y la espalda recta. Si te cuesta, probá parado o acostado boca arriba con las rodillas flexionadas.",
    steps: [
      "Soltá todo el aire por la boca, hasta vaciar los pulmones.",
      "Sin inhalar, metete el ombligo hacia la columna, como si quisieras tocarla.",
      "Sostené unos segundos sin levantar los hombros ni mover la espalda.",
      "Relajá el abdomen y respirá con normalidad.",
    ],
    breath: "Exhalá todo el aire, sostené sin inhalar unos segundos y volvé a respirar normal.",
    mistakes: [
      "Aguantás el aire adentro: primero soltalo todo, el vacío se hace con los pulmones vacíos.",
      "Levantás los hombros o el pecho: relajalos y solo mové el abdomen.",
      "Lo mantenés demasiado y te mareás: soltá y respirá normal.",
    ],
    tip: "Empezá con 5 a 10 segundos. No lo hagas, o consultá antes, si tenés presión alta, problemas del corazón, hernia, embarazo o una cirugía abdominal reciente.",
  },
  "Giros rusos con peso": russianBase("una mancuerna"),
  "Extensión de cadera prona": {
    setup: "Acostate boca abajo con las piernas estiradas y los brazos a los costados o bajo la frente. Mirá al piso con el cuello relajado.",
    steps: [
      "Apretá los glúteos (la cola) antes de empezar.",
      "Subí una pierna estirada unos centímetros, con la panza y la cadera apoyadas en el piso.",
      "Frená un segundo arriba y bajá lento.",
      "Repetí con la otra pierna, alternando.",
    ],
    breath: "Exhalá al subir la pierna e inhalá al bajar.",
    mistakes: [
      "Arqueás la espalda baja para subir más: subí solo hasta donde la cadera no se despegue del piso.",
      "Girás la cadera hacia un lado: mantené ambas caderas apoyadas.",
      "Movés muy rápido: subí y bajá lento para que trabajen cola y espalda.",
    ],
    tip: "Si te molesta la espalda baja, poné una toalla finita bajo el abdomen y subí menos. Si el dolor sigue, frená.",
  },
  "Crunch con peso en polea alta": {
    setup: "Arrodillate frente a la polea alta y agarrá la soga con las dos manos a los lados de la cabeza. Quedate sentado sobre los talones con la cadera quieta.",
    steps: [
      "Mantené la soga junto a las orejas, sin moverla.",
      "Enrollá la columna hacia abajo llevando los codos a las rodillas.",
      "Apretá el abdomen un segundo abajo.",
      "Volvé lento hacia arriba, sin dejar que el peso te tire.",
    ],
    breath: "Exhalá al bajar el torso e inhalá al subir.",
    mistakes: [
      "Tirás con los brazos: la fuerza viene del abdomen, los brazos solo sostienen.",
      "Subís y bajás la cadera: mantenela quieta sobre los talones.",
      "Cargás demasiado peso y perdés la postura: bajá la carga y hacelo lento.",
    ],
    tip: "Con más peso el recorrido sigue siendo corto. Progresá la carga de a poco.",
  },
  "L-sit": {
    setup: "Apoyá las manos en el piso o en dos apoyos altos (paralelas o bloques), con los brazos estirados y los hombros hacia abajo. Sentate con las piernas estiradas al frente.",
    steps: [
      "Empujá fuerte contra el apoyo para separar la cola del piso.",
      "Subí las piernas estiradas hasta la altura de la cadera.",
      "Mantené el pecho abierto y los hombros lejos de las orejas.",
      "Sostené el tiempo indicado y bajá con control.",
    ],
    breath: "Respirá corto y constante, sin aguantar el aire.",
    mistakes: [
      "Los hombros suben hacia las orejas: empujá hacia abajo y alejalos del cuello.",
      "Se doblan las rodillas: si no podés estirarlas, empezá con las piernas flexionadas.",
      "Se doblan los codos: mantenelos estirados y empujá el apoyo hacia abajo.",
    ],
    tip: "Progresá así: primero con los pies apoyados, luego con las rodillas flexionadas, después una pierna estirada y por último las dos. Si te duelen las muñecas o los hombros, parate.",
  },
  "Plancha con elevación de brazo": {
    setup: "Entrá en plancha con las manos o los antebrazos en el piso y los pies al ancho de los hombros. El cuerpo forma una línea recta de cabeza a talones.",
    steps: [
      "Apretá el abdomen y la cola para mantener el cuerpo firme.",
      "Levantá un brazo hacia adelante, sin girar la cadera.",
      "Frená un segundo con el brazo estirado.",
      "Volvé la mano al piso y repetí con el otro brazo.",
    ],
    breath: "Exhalá al estirar el brazo e inhalá al volver.",
    mistakes: [
      "La cadera se balancea hacia el costado: abrí más los pies para tener más base.",
      "Se hunde la espalda baja: apretá cola y abdomen antes de levantar el brazo.",
      "Movés muy rápido: despacio, con pausa arriba, para que el abdomen frene el giro.",
    ],
    tip: "Cuanto más separados los pies, más fácil es mantener el equilibrio.",
  },
  "Windmill": {
    setup: "Parate con los pies un poco más abiertos que los hombros y la punta del pie de atrás girada hacia afuera. Sostené una kettlebell estirada sobre la cabeza con un brazo y mirala.",
    steps: [
      "Empujá la cadera hacia el lado del brazo que sostiene el peso, con la pierna de ese lado estirada.",
      "Bajá la mano libre hacia el pie siguiendo la pierna, sin doblar la rodilla de ese lado.",
      "Mantené el brazo con el peso vertical y los ojos en la kettlebell.",
      "Subí empujando con la cadera y volvé a quedar parado, sin apuro.",
    ],
    breath: "Inhalá al bajar y exhalá al volver a subir.",
    mistakes: [
      "Doblás la cintura en vez de la cadera: empujá la cadera hacia atrás, como cerrando una puerta con la cola.",
      "El brazo de arriba se dobla o cae: mantenelo estirado y firme sobre el hombro.",
      "Usás demasiado peso: empezá sin peso o con una kettlebell muy liviana hasta dominar el movimiento.",
    ],
    tip: "Aprendelo primero sin peso. Es un movimiento de movilidad y control, no de fuerza bruta.",
  },
  "Rotación de tronco con polea": {
    setup: "Parate de costado a la polea, a la altura del pecho, con los pies al ancho de los hombros y las rodillas apenas flexionadas. Agarrá el cable con las dos manos frente al pecho.",
    steps: [
      "Apretá el abdomen y estirá los brazos hacia adelante.",
      "Girá el torso alejándote de la polea, con los brazos estirados.",
      "Frená un segundo al final del giro.",
      "Volvé al centro lento, resistiendo el tirón del cable.",
    ],
    breath: "Exhalá al girar e inhalá al volver al centro.",
    mistakes: [
      "Movés solo los brazos: girá el pecho y los hombros, no solo las manos.",
      "Te pasás de giro y la espalda baja se tuerce: girá hasta donde el torso se mueva y la cadera quede casi firme.",
      "Usás impulso y mucho peso: bajá la carga y hacelo lento.",
    ],
    tip: "Pivotear un poco el pie de atrás ayuda a cuidar la rodilla.",
  },
  "Caminata con maletín": carryBase("una mancuerna o pesa", true),
  "Caminata del granjero": carryBase("dos mancuernas o pesas", false),
  "Crunch en TRX": {
    setup: "Regulá las correas del TRX a la altura de media pantorrilla. De espaldas al anclaje, poné los pies en las correas y apoyá las manos en el piso en plancha, con el cuerpo alineado.",
    steps: [
      "Apretá el abdomen y mantené los brazos estirados.",
      "Llevá las rodillas hacia el pecho, con los pies juntos. La cadera sube un poco.",
      "Frená un segundo con las rodillas cerca del pecho.",
      "Volvé estirando las piernas despacio hasta la plancha, sin hundir la espalda.",
    ],
    breath: "Exhalá al llevar las rodillas al pecho e inhalá al estirar las piernas.",
    mistakes: [
      "La espalda baja se hunde al estirar las piernas: no las estires del todo o apretá más el abdomen.",
      "Los hombros se encogen: empujá el piso y alejalos de las orejas.",
      "Movés muy rápido o las correas se balancean: hacelo despacio, para sentirlo en el abdomen y no en las piernas.",
    ],
    tip: "Controlá el balanceo de las correas. Evitalo si tenés dolor agudo en la espalda baja o en el hombro.",
  },
  "Abdominales en V": {
    setup: "Acostate boca arriba con los brazos estirados por encima de la cabeza y las piernas estiradas y juntas.",
    steps: [
      "Apretá el abdomen y mantené la espalda baja apoyada.",
      "Subí el torso y las piernas a la vez, estiradas, formando una V.",
      "Tocá los pies con las manos, o llegá lo más cerca que puedas.",
      "Bajá despacio hasta la posición inicial.",
    ],
    breath: "Exhalá al subir formando la V e inhalá al bajar.",
    mistakes: [
      "Usás el impulso de los brazos: arrancá con el abdomen y los brazos acompañan.",
      "La espalda baja se arquea al subir: doblá las rodillas hasta tener más fuerza.",
      "Bajás de golpe: hacé la bajada lenta, contando hasta tres.",
    ],
    tip: "Empezá con las rodillas flexionadas. Es una versión más fácil y segura para la espalda.",
  },
  "Escalador (mountain climber)": mountainClimberTech(),
  "Bear crawl": {
    setup: "Ponete en cuatro apoyos con las manos bajo los hombros y las rodillas bajo la cadera. Despegá las rodillas un par de centímetros del piso.",
    steps: [
      "Mantené la espalda plana y las rodillas cerca del piso.",
      "Avanzá la mano derecha y el pie izquierdo a la vez.",
      "Seguí con la mano izquierda y el pie derecho, con pasos cortos.",
      "Avanzá en línea recta y, para volver, retrocedé con el mismo ritmo.",
    ],
    breath: "Respirá de forma continua, sin aguantar el aire.",
    mistakes: [
      "La cola sube: mantené la cadera baja y la espalda plana.",
      "Das pasos largos y apurados: acortalos y movete controlado.",
      "Las rodillas tocan el piso: mantenelas flotando, a unos centímetros.",
    ],
    tip: "Empezá con pocos metros. Es un ejercicio exigente para hombros y abdomen.",
  },
  "Farmer carry": carryBase("dos mancuernas", false),
  "Farmer carry con kettlebell": carryBase("dos kettlebells (pesas rusas)", false),
  "Suitcase carry": carryBase("una mancuerna", true),
  "Sit-up": {
    setup: "Acostate boca arriba con las rodillas flexionadas y los pies apoyados, o sostenidos por un compañero. Cruzá los brazos sobre el pecho.",
    steps: [
      "Apretá el abdomen y mantené el mentón un poco hacia el pecho.",
      "Subí enrollando la columna, de a una vértebra, hasta quedar sentado.",
      "Frená un instante arriba sin impulsarte.",
      "Bajá despacio enrollando la espalda al piso.",
    ],
    breath: "Exhalá al subir e inhalá al bajar.",
    mistakes: [
      "Tirás del cuello con las manos: mantené los brazos cruzados sobre el pecho.",
      "Subís de golpe usando impulso: hacelo lento, contando hasta dos al subir.",
      "Sentís la espalda baja: hacé un crunch (solo subir los hombros) hasta tener más fuerza.",
    ],
    tip: "Si te cuesta subir, hacé el movimiento más corto o empezá con los crunch.",
  },
  "Bird dog": {
    setup: "Ponete en cuatro apoyos con las manos bajo los hombros y las rodillas bajo la cadera. La espalda queda recta y la mirada al piso.",
    steps: [
      "Apretá el abdomen y mantené la espalda plana.",
      "Estirá un brazo hacia adelante y la pierna contraria hacia atrás, a la altura de la espalda.",
      "Sostené un par de segundos sin que la cadera gire.",
      "Volvé al centro y repetí con el otro brazo y la otra pierna.",
    ],
    breath: "Exhalá al estirar brazo y pierna e inhalá al volver.",
    mistakes: [
      "Subís la pierna más arriba de la cadera y la espalda se arquea: frená a la altura de la espalda.",
      "La cadera gira hacia un lado: imaginá una taza apoyada en la espalda baja que no se cae.",
      "Levantás la cabeza: mirá al piso con el cuello largo.",
    ],
    tip: "Si perdés el equilibrio, estirá solo la pierna o solo el brazo hasta ganar estabilidad.",
  },
  "Leg raise": {
    setup: "Acostate boca arriba con las piernas estiradas y juntas. Poné las manos a los costados o debajo de la cola.",
    steps: [
      "Apretá el abdomen y pegá la espalda baja al piso.",
      "Subí las piernas juntas hasta que queden verticales.",
      "Bajalas despacio, parando antes de que se despegue la espalda baja.",
      "Repetí sin apoyar los pies en el piso.",
    ],
    breath: "Exhalá al subir las piernas e inhalá al bajar.",
    mistakes: [
      "La espalda baja se arquea al bajar: no bajes tanto o doblá las rodillas.",
      "Bajás las piernas muy rápido: bajalas contando hasta tres.",
      "Usás el impulso: pará un segundo arriba y empezá de nuevo.",
    ],
    tip: "Con las rodillas flexionadas es más fácil y más seguro para la espalda baja.",
  },
  "Russian twist con peso": russianBase("un disco o una pesa"),
  "Plancha con elevación de pierna": {
    setup: "Entrá en plancha apoyando los antebrazos y las puntas de los pies, con el cuerpo alineado de la cabeza a los talones.",
    steps: [
      "Apretá el abdomen y la cola para mantener el cuerpo firme.",
      "Subí una pierna estirada unos centímetros, sin girar la cadera.",
      "Frená un segundo arriba y bajala con control.",
      "Repetí con la otra pierna, alternando.",
    ],
    breath: "Respirá lento y constante, sin aguantar el aire.",
    mistakes: [
      "Se hunde la cintura al subir la pierna: apretá más el abdomen y subí menos.",
      "La cadera gira hacia el costado: mantenela paralela al piso.",
      "Subís la pierna muy alto: unos centímetros alcanzan para que trabaje el abdomen.",
    ],
    tip: "Primero dominá la plancha frontal. Esta es una variante más difícil.",
  },
  "Crunch con piernas elevadas": {
    setup: "Acostate boca arriba con las piernas elevadas, rodillas dobladas a 90 grados sobre la cadera. Poné las manos cruzadas sobre el pecho o apenas tocando las sienes.",
    steps: [
      "Mantené la espalda baja apoyada en el piso.",
      "Subí solo los hombros y la parte alta de la espalda, mirando al techo.",
      "Frená un segundo arriba apretando el abdomen.",
      "Bajá despacio hasta apoyar los hombros.",
    ],
    breath: "Exhalá al subir e inhalá al bajar.",
    mistakes: [
      "Tirás del cuello con las manos: dejá los codos abiertos y no empujes la cabeza.",
      "Las piernas se mueven de un lado a otro: mantenelas quietas.",
      "Subís todo el torso: es un movimiento corto, solo se despegan los omóplatos.",
    ],
    tip: "Con las piernas arriba el abdomen trabaja más y la espalda baja queda apoyada.",
  },
  "Hollow body rocks": {
    setup: "Acostate boca arriba con los brazos estirados sobre la cabeza y las piernas juntas y estiradas. Pegá la espalda baja al piso.",
    steps: [
      "Apretá el abdomen y levantá los hombros, brazos y pies, formando una banana.",
      "Mantené esa forma rígida sin arquear la espalda.",
      "Balanceate hacia atrás y hacia adelante, como una mecedora.",
      "Repetí sin que los pies ni los hombros toquen el piso.",
    ],
    breath: "Respirá corto y constante, sin aguantar el aire.",
    mistakes: [
      "La espalda baja se despega: subí las piernas más arriba o doblá las rodillas.",
      "Se rompe la forma al balancearte: balanceate menos y mantené el cuerpo rígido.",
      "Tirás de la cabeza: mirá a los pies y relajá el cuello.",
    ],
    tip: "Primero dominá el hollow body quieto durante 30 segundos. Después sumá el balanceo.",
  },
  "Superman modificado": {
    setup: "Acostate boca abajo con los brazos y las piernas estirados. Mirá al piso con la nuca relajada.",
    steps: [
      "Apretá los glúteos (la cola) antes de empezar.",
      "Subí un brazo y la pierna contraria unos centímetros, sin doblar codos ni rodillas y sin levantar la cabeza.",
      "Sostené dos o tres segundos y bajá despacio.",
      "Repetí con el otro brazo y la otra pierna, alternando.",
    ],
    breath: "Exhalá al subir brazo y pierna e inhalá al bajar.",
    mistakes: [
      "Arqueás la espalda para subir más: subí pocos centímetros, no importa la altura.",
      "Levantás la cabeza o mirás adelante: mirá al piso con el cuello largo.",
      "Movés muy rápido: subí y bajá lento para que trabajen cola y espalda.",
    ],
    tip: "Si sentís molestia en la espalda baja o el cuello, subí solo los brazos o solo las piernas. Si el dolor sigue, frená.",
  },
};
