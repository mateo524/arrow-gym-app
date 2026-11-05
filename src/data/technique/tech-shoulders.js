// Técnica escrita de los ejercicios del grupo: shoulders. Formato en src/data/technique/index.js.
const CLEAN_PRESS_BARRA = {
  setup: "De pie frente a la barra apoyada en el piso, con las manos al ancho de los hombros. Rodillas flexionadas, espalda recta y mirada al frente.",
  steps: [
    "Levantá la barra del piso empujando con las piernas, con la espalda recta.",
    "Cuando pasa las rodillas, estirá las caderas y llevala hasta los hombros, girando los codos hacia adelante.",
    "Parate firme, con la barra apoyada en los hombros.",
    "Empujá la barra hacia arriba hasta estirar los brazos, sin ayuda de las piernas. Bajala con control hasta los hombros.",
  ],
  breath: "Inhalá antes de levantar del piso y soltá el aire al empujar arriba.",
  mistakes: [
    "Levantar la barra con la espalda redondeada: mantenela recta, y bajá el peso si no podés.",
    "Tirar con los brazos en vez de las piernas: la fuerza sale de las piernas y las caderas.",
    "Arquear la espalda al empujar: apretá abdomen y glúteos.",
  ],
  tip: "Es técnico. Practicá por separado el tirón, la barra apoyada en los hombros y el press, con poco peso y alguien que te corrija. Evitalo si te duele la espalda baja o el hombro.",
};

export const TECH = {
  "Press militar con barra": {
    setup: "De pie, pies al ancho de los hombros. Agarrá la barra un poco más ancha que los hombros, apoyada sobre la parte de adelante de los hombros.",
    steps: [
      "Apretá la cola y la panza para que el cuerpo quede firme.",
      "Empujá la barra hacia arriba, corriendo la cabeza apenas hacia atrás para dejarla pasar.",
      "Cuando la barra pasa la frente, metele la cabeza debajo y estirá los brazos arriba.",
      "Bajá despacio hasta apoyar la barra otra vez en los hombros.",
    ],
    breath: "Tomá aire antes de empujar y soltalo mientras la barra sube o al terminar el movimiento.",
    mistakes: [
      "Arquear mucho la espalda para subir la barra: apretá abdomen y glúteos, y bajá el peso si no podés evitarlo.",
      "Empujar la barra hacia adelante: la barra tiene que subir recta, pegada a la cara.",
      "Doblar las rodillas para ayudarte: si necesitás las piernas, es otro ejercicio (push press). Bajá el peso.",
    ],
    tip: "Si sentís pellizco o dolor en el hombro, no sigas: probá primero con mancuernas.",
  },

  "Press con mancuernas": {
    setup: "De pie, con una mancuerna en cada mano a la altura de los hombros. Las palmas miran hacia adelante y los codos quedan un poco por delante del cuerpo.",
    steps: [
      "Apretá la panza y mantené el pecho en alto.",
      "Empujá las mancuernas hacia arriba hasta estirar los brazos, sin chocarlas.",
      "Hacé una pausa corta arriba, con las manos sobre los hombros.",
      "Bajá controlando hasta que las mancuernas queden a la altura de las orejas.",
    ],
    breath: "Inhalá al bajar y exhalá al empujar hacia arriba.",
    mistakes: [
      "Arquear la espalda: apretá el abdomen y no te inclines hacia atrás.",
      "Abrir los codos hacia los costados: llevalos un poco hacia adelante, así cuidás el hombro.",
      "Bajar a medias: bajá hasta las orejas, solo si no te duele el hombro.",
    ],
    tip: "Cada brazo trabaja solo, así que si uno es más débil, vas a notarlo y lo podés mejorar.",
  },

  "Press Arnold": {
    setup: "Sentado con la espalda apoyada. Sostené las mancuernas frente al pecho, con las palmas hacia vos y los codos juntos.",
    steps: [
      "Empezá a subir las mancuernas frente a la cara.",
      "Mientras subís, abrí los codos y girá las palmas hacia adelante.",
      "Estirá los brazos arriba con las palmas mirando hacia adelante.",
      "Bajá girando las palmas de nuevo hacia vos, hasta el pecho.",
    ],
    breath: "Exhalá mientras empujás hacia arriba e inhalá al bajar.",
    mistakes: [
      "Hacer el giro muy rápido: es un giro suave, junto con la subida.",
      "Usar demasiado peso: la rotación hace que cueste más, así que empezá liviano.",
      "Despegar la espalda del respaldo: mantenela apoyada.",
    ],
    tip: "Es un press con un giro extra: la diferencia con el press común es que las palmas empiezan hacia vos.",
  },

  "Press en máquina de hombros": {
    setup: "Ajustá el asiento para que las manijas queden a la altura de los hombros. Espalda apoyada y pies firmes en el piso.",
    steps: [
      "Agarrá las manijas con las muñecas rectas.",
      "Empujá hacia arriba hasta estirar casi del todo los brazos.",
      "Pausá un segundo arriba, sin trabar los codos de golpe.",
      "Volvé despacio hasta que las manos queden a la altura de los hombros.",
    ],
    breath: "Exhalá al empujar e inhalá al volver.",
    mistakes: [
      "Asiento muy bajo o muy alto: ajustalo para que el movimiento sea cómodo, sin tirón en el hombro.",
      "Soltar el peso de golpe al bajar: controlá la vuelta.",
      "Despegar la espalda del respaldo: dejala apoyada todo el tiempo.",
    ],
    tip: "Es ideal para empezar: la máquina guía el recorrido y te da seguridad.",
  },

  "Landmine press": {
    setup: "Con un extremo de la barra fijo en el piso, parate frente a ella. Agarrá el otro extremo con una mano, a la altura del hombro, con el codo hacia adelante.",
    steps: [
      "Apretá la panza y pisá firme con los dos pies.",
      "Empujá la barra hacia arriba y adelante, en diagonal, hasta estirar el brazo.",
      "Dejá que el tronco se incline apenas hacia adelante, sin arquear la espalda.",
      "Bajá despacio hasta el hombro y repetí.",
    ],
    breath: "Inhalá antes de empujar y exhalá al subir la barra.",
    mistakes: [
      "Arquear la zona baja de la espalda: mantené el cuerpo firme como una tabla.",
      "Inclinarte mucho sobre la barra: una inclinación leve alcanza.",
      "Empujar recto hacia arriba: seguí la diagonal que marca la barra, es más amable con el hombro.",
    ],
    tip: "Suele ser más cómoda para el hombro que el press recto, buena opción si te cuesta subir los brazos.",
  },

  "Elevaciones laterales con mancuernas": {
    setup: "De pie, con una mancuerna en cada mano a los costados. Los codos van apenas doblados y el pecho en alto.",
    steps: [
      "Subí los brazos hacia los costados, como abriendo alas.",
      "Frená cuando las manos llegan a la altura de los hombros.",
      "Pausá un instante arriba.",
      "Bajá despacio, en unos tres segundos.",
    ],
    breath: "Exhalá al subir los brazos e inhalá al bajarlos.",
    mistakes: [
      "Balancear el cuerpo para subir: usá menos peso y mantené el tronco quieto.",
      "Subir los brazos más arriba de los hombros: frená a esa altura.",
      "Encoger los hombros hacia las orejas: mantenelos relajados y bajos.",
    ],
    tip: "Acá mandan el control y la técnica, no el peso: con poco peso ya se siente.",
  },

  "Elevaciones laterales en polea": {
    setup: "Parado de costado a la polea baja, con el cable cruzando por delante del cuerpo. Agarrá el asa con la mano más lejana a la polea.",
    steps: [
      "Mantené el codo apenas doblado y el tronco firme.",
      "Subí el brazo hacia el costado hasta la altura del hombro.",
      "Pausá un instante arriba.",
      "Bajá despacio, sin dejar que el cable te tire.",
    ],
    breath: "Exhalá al subir y inhalá al bajar.",
    mistakes: [
      "Inclinar el cuerpo para subir: usá menos peso y mantenete parado.",
      "Subir el brazo por encima del hombro: frená a esa altura.",
      "Dejar caer el brazo: la vuelta es lenta y controlada.",
    ],
    tip: "El cable mantiene tensión durante todo el recorrido, incluso abajo, algo que la mancuerna no hace.",
  },

  "Elevaciones laterales en máquina": {
    setup: "Sentado con la espalda apoyada, con los brazos contra las almohadillas. Ajustá el asiento para que los codos queden a la altura de los hombros.",
    steps: [
      "Apoyá los brazos en las almohadillas.",
      "Empujá hacia afuera y arriba, abriendo los brazos hasta la altura de los hombros.",
      "Pausá un instante arriba.",
      "Volvé despacio a la posición inicial.",
    ],
    breath: "Exhalá al abrir los brazos e inhalá al volver.",
    mistakes: [
      "Encoger los hombros: mantenelos bajos y relajados.",
      "Usar impulso con el cuerpo: bajá el peso y mantenete apoyado.",
      "Asiento mal ajustado: si el eje queda lejos del hombro, ajustalo.",
    ],
    tip: "Empujá con los codos, no con las manos: así sentís el hombro y no los brazos.",
  },

  "Elevaciones frontales con mancuernas": {
    setup: "De pie, con una mancuerna en cada mano delante de los muslos, palmas hacia vos. Codos apenas doblados.",
    steps: [
      "Subí un brazo hacia adelante, recto, hasta la altura del hombro.",
      "Pausá un instante arriba.",
      "Bajá despacio hasta los muslos.",
      "Repetí con el otro brazo, o subí los dos juntos.",
    ],
    breath: "Exhalá al subir y inhalá al bajar.",
    mistakes: [
      "Balancear el cuerpo para subir: usá menos peso y mantené el tronco quieto.",
      "Subir por encima de los hombros: frená a esa altura.",
      "Encogerte hacia las orejas: mantené los hombros bajos.",
    ],
    tip: "El hombro de adelante ya trabaja en todos los press, así que no hace falta mucho peso.",
  },

  "Elevaciones frontales con barra": {
    setup: "De pie, agarrá la barra con las manos al ancho de los hombros, con agarre desde arriba. La barra apoya delante de los muslos.",
    steps: [
      "Apretá la panza y mantené el pecho en alto.",
      "Subí la barra hacia adelante, con los brazos casi rectos, hasta los hombros.",
      "Pausá un instante.",
      "Bajá despacio hasta los muslos.",
    ],
    breath: "Exhalá al subir y inhalá al bajar.",
    mistakes: [
      "Inclinarte hacia atrás para subir: bajá el peso y mantenete firme.",
      "Subir más arriba de los hombros: frená a esa altura.",
      "Bajar la barra de golpe: controlá la bajada.",
    ],
    tip: "Si te molesta el hombro, hacelo con mancuernas, que te dejan elegir una posición más cómoda.",
  },

  "Elevaciones posteriores con mancuernas": {
    setup: "De pie, con una mancuerna en cada mano. Inclinate hacia adelante, con la espalda recta y las rodillas apenas flexionadas.",
    steps: [
      "Dejá los brazos colgando, con los codos apenas doblados.",
      "Abrí los brazos hacia los costados, como alas, hasta la altura del tronco.",
      "Juntá los omóplatos un instante, como si quisieras apretar un lápiz entre ellos.",
      "Bajá despacio sin balancear el cuerpo.",
    ],
    breath: "Exhalá al abrir los brazos e inhalá al volver.",
    mistakes: [
      "Subir el torso para ayudarte: mantené la inclinación fija y usá menos peso.",
      "Redondear la espalda: mirá al piso y mantenela recta.",
      "Subir los brazos muy arriba: frená cuando queden a la altura del tronco.",
    ],
    tip: "Con poco peso se siente más: es un músculo chico.",
  },

  "Elevaciones posteriores en polea": {
    setup: "Parado frente a la polea alta o media, con las poleas cruzadas. Agarrá con cada mano el asa opuesta, con los brazos casi rectos.",
    steps: [
      "Dá un paso atrás para tensar los cables y mantené el pecho en alto.",
      "Abrí los brazos hacia los costados, tirando con los codos.",
      "Frená cuando las manos queden a la altura de los hombros.",
      "Volvé despacio, sin soltar la tensión.",
    ],
    breath: "Exhalá al abrir los brazos e inhalá al volver.",
    mistakes: [
      "Tirar con el cuerpo hacia atrás: mantené el tronco quieto.",
      "Doblar mucho los codos: dejalos casi rectos.",
      "Usar demasiado peso: elegí uno con el que no tengas que balancearte.",
    ],
    tip: "Pensá que abrís los brazos, no que tirás de las manos.",
  },

  "Face pull": {
    setup: "Con la polea alta y una soga, agarrá los extremos con las palmas enfrentadas. Dá un paso atrás para tensar el cable.",
    steps: [
      "Tirá de la soga hacia tu cara, a la altura de los ojos.",
      "Llevá los codos altos y hacia afuera.",
      "Al final, separá las manos y juntá los omóplatos.",
      "Volvé despacio hasta estirar los brazos.",
    ],
    breath: "Exhalá al tirar y inhalá al volver.",
    mistakes: [
      "Usar mucho peso y tirar con el cuerpo: bajá el peso y mantenete firme.",
      "Tirar hacia el pecho: tirá hacia la cara, con los codos altos.",
      "Encoger los hombros hacia las orejas: mantenelos bajos.",
    ],
    tip: "Es un ejercicio para postura y salud del hombro: hacelo liviano y con muchas repeticiones.",
  },

  "Pájaros con mancuernas": {
    setup: "Sentado en un banco, inclinate hacia adelante con el pecho cerca de las rodillas. Dejá colgar una mancuerna a cada lado, con los codos apenas doblados.",
    steps: [
      "Mantené la espalda recta y la mirada al piso.",
      "Abrí los brazos hacia los costados hasta la altura de la espalda.",
      "Apretá los omóplatos un instante.",
      "Bajá lento hasta que las mancuernas casi se toquen.",
    ],
    breath: "Exhalá al abrir los brazos e inhalá al bajar.",
    mistakes: [
      "Subir el torso para ayudarte: bajá el peso y mantené la posición.",
      "Redondear la espalda: mantenela recta.",
      "Subir los brazos muy arriba: frená a la altura del tronco.",
    ],
    tip: "Con poco peso se siente mucho: es un músculo chico y de cuidado.",
  },

  "Rotación externa en polea": {
    setup: "Parado de costado a la polea a la altura del codo. Agarrá el asa con la mano de afuera, el codo doblado en 90 grados y pegado a las costillas.",
    steps: [
      "Si querés, poné una toalla enrollada entre el codo y las costillas.",
      "Llevá la mano hacia afuera, girando solo el antebrazo.",
      "Frená cuando sientas que el hombro no puede más.",
      "Volvé despacio hasta el punto de partida.",
    ],
    breath: "Exhalá al girar hacia afuera e inhalá al volver.",
    mistakes: [
      "Despegar el codo del cuerpo: si se cae la toalla, el codo se movió.",
      "Girar el tronco para ayudarte: mantenelo quieto.",
      "Usar mucho peso: es un músculo chico, usá poco.",
    ],
    tip: "Sirve para cuidar el hombro: si duele, frená y consultá con un profesional.",
  },

  "Rotación interna en polea": {
    setup: "Parado de costado a la polea a la altura del codo, con el lado de la mano que trabaja lejos de la polea. Codo doblado en 90 grados y pegado a las costillas.",
    steps: [
      "Si querés, poné una toalla enrollada entre el codo y las costillas.",
      "Llevá la mano hacia la panza, girando solo el antebrazo.",
      "Frená cuando la mano llegue cerca del cuerpo.",
      "Volvé despacio hasta el punto de partida.",
    ],
    breath: "Exhalá al girar hacia adentro e inhalá al volver.",
    mistakes: [
      "Despegar el codo del cuerpo: si se cae la toalla, el codo se movió.",
      "Girar el tronco: mantenelo quieto, solo se mueve el antebrazo.",
      "Usar mucho peso: es un ejercicio liviano.",
    ],
    tip: "Se hace junto con la rotación externa para equilibrar los dos lados del hombro.",
  },

  "Remo al mentón con barra": {
    setup: "De pie, agarrá la barra con las manos al ancho de los hombros o un poco más, con agarre desde arriba. La barra cuelga delante de los muslos.",
    steps: [
      "Tirá de la barra hacia arriba, pegada al cuerpo.",
      "Subí con los codos, que van más altos que las manos.",
      "Frená con la barra a la altura del pecho, y los codos no más altos que los hombros.",
      "Bajá despacio hasta estirar los brazos.",
    ],
    breath: "Exhalá al subir y inhalá al bajar.",
    mistakes: [
      "Subir los codos por encima de los hombros: frená antes, es lo que cuida el hombro.",
      "Agarre muy angosto: abrí las manos al ancho de los hombros.",
      "Balancear el cuerpo: usá menos peso y mantenete quieto.",
    ],
    tip: "Si el hombro molesta, cortá el recorrido más abajo o elegí otro ejercicio.",
  },

  "Cuban press": {
    setup: "De pie, con una mancuerna liviana en cada mano, agarre desde arriba y los brazos colgando al frente.",
    steps: [
      "Subí las mancuernas con los codos por delante, como un remo al mentón.",
      "Con los codos arriba, girá los antebrazos hacia atrás hasta que las manos apunten al techo.",
      "Empujá las mancuernas hacia arriba hasta estirar los brazos.",
      "Volvé haciendo el recorrido al revés, despacio.",
    ],
    breath: "Exhalá al empujar hacia arriba e inhalá al bajar.",
    mistakes: [
      "Usar mucho peso: la idea es trabajar el hombro por dentro, con peso liviano.",
      "Saltearse el giro: sin la rotación se vuelve un remo con press y pierde el sentido.",
      "Subir los codos más arriba de los hombros: mantenelos a esa altura o debajo.",
    ],
    tip: "Practicá cada parte por separado antes de unirlas.",
  },

  "Press trasnuca": {
    setup: "De pie, con la barra apoyada detrás de la nuca, sobre los hombros. Agarre ancho. Hacelo solo si podés subir los brazos sin dolor y sin arquear la espalda.",
    steps: [
      "Mantené la cabeza un poco hacia adelante, sin forzar el cuello.",
      "Empujá la barra hacia arriba hasta estirar los brazos.",
      "Pausá arriba, con la barra sobre la cabeza.",
      "Bajá despacio hasta la nuca, sin rebotar.",
    ],
    breath: "Inhalá al bajar y exhalá al empujar.",
    mistakes: [
      "Hacerlo sin buena movilidad de hombros: si te duele o se te arquea la espalda, no lo hagas.",
      "Bajar la barra más allá de la nuca: frená a la altura de las orejas.",
      "Usar mucho peso: es un ejercicio delicado, empezá liviano.",
    ],
    tip: "Si no estás seguro, hacé el press militar al frente: es más seguro para casi todos.",
  },

  "Push press": {
    setup: "De pie, con la barra apoyada sobre los hombros por delante y pies al ancho de los hombros. Agarre un poco más ancho que los hombros.",
    steps: [
      "Hacé una flexión corta de rodillas, con el torso derecho.",
      "Extendé las piernas con fuerza, como saltando sin despegar los pies.",
      "Aprovechá el envión para empujar la barra hasta estirar los brazos arriba.",
      "Bajá la barra a los hombros doblando las rodillas para amortiguar.",
    ],
    breath: "Inhalá antes de bajar y soltá el aire al subir la barra.",
    mistakes: [
      "Bajar demasiado con las rodillas: es una flexión corta, no una sentadilla.",
      "Empujar con los brazos antes de que terminen las piernas: primero piernas, después brazos.",
      "Arquear la espalda al final: apretá abdomen y glúteos.",
    ],
    tip: "Usá las piernas para mover más peso que en el press militar. Empezá liviano para aprender el ritmo.",
  },

  "Elevaciones laterales inclinadas": {
    setup: "Parado de costado, apoyá una mano en un soporte e inclinate hacia un costado. Con la otra mano, sostené una mancuerna colgando.",
    steps: [
      "Mantené el codo apenas doblado.",
      "Subí el brazo hacia el costado hasta pasar apenas la altura del hombro.",
      "Pausá un instante.",
      "Bajá despacio, sin balancear el cuerpo.",
    ],
    breath: "Exhalá al subir y inhalá al bajar.",
    mistakes: [
      "Balancear el cuerpo para subir: usá menos peso.",
      "Encoger el hombro hacia la oreja: mantenelo bajo.",
      "Subir muy arriba: frená a la altura del hombro.",
    ],
    tip: "La inclinación pone más tensión al empezar el movimiento, con poco peso alcanza.",
  },

  "Elevaciones laterales con banda": {
    setup: "De pie, pisá la banda elástica con un pie o con los dos. Agarrá los extremos con las manos a los costados.",
    steps: [
      "Mantené los codos apenas doblados.",
      "Subí los brazos hacia los costados hasta la altura de los hombros.",
      "Pausá un instante arriba, donde la banda tira más.",
      "Bajá despacio, sin dejar que la banda te gane.",
    ],
    breath: "Exhalá al subir y inhalá al bajar.",
    mistakes: [
      "Balancear el cuerpo para subir: usá una banda más suave.",
      "Subir los hombros hacia las orejas: mantenelos bajos.",
      "Soltar la banda de golpe al bajar: controlá la vuelta.",
    ],
    tip: "La banda tira más fuerte arriba: es normal, y por eso conviene empezar con una suave.",
  },

  "Pájaros en máquina": {
    setup: "Sentado mirando hacia la máquina, con el pecho apoyado en el respaldo. Ajustá el asiento para que las manijas queden a la altura de los hombros.",
    steps: [
      "Agarrá las manijas con los brazos casi rectos.",
      "Abrí los brazos hacia atrás, llevando los codos hacia afuera.",
      "Juntá los omóplatos un instante.",
      "Volvé despacio sin soltar el peso de golpe.",
    ],
    breath: "Exhalá al abrir los brazos e inhalá al volver.",
    mistakes: [
      "Despegar el pecho del respaldo: mantenelo apoyado.",
      "Tirar con las manos y flexionar los codos: pensá en abrir los brazos.",
      "Usar mucho peso: elegí uno que te deje controlar.",
    ],
    tip: "Es un ejercicio sencillo para empezar a trabajar la parte de atrás del hombro.",
  },

  "Elevación en W": {
    setup: "De pie, con una mancuerna muy liviana en cada mano. Inclinate hacia adelante doblando la cadera, con la espalda recta y las rodillas apenas flexionadas. Los codos van doblados en unos 90 grados.",
    steps: [
      "Dejá los brazos colgando, con los codos doblados.",
      "Subí los codos hacia atrás y hacia afuera, formando una W con los brazos.",
      "Al final, girá los antebrazos hacia arriba y juntá los omóplatos.",
      "Bajá despacio hasta la posición inicial.",
    ],
    breath: "Exhalá al subir y inhalá al bajar.",
    mistakes: [
      "Usar mucho peso: es un movimiento fino, usá mancuernas muy livianas.",
      "Subir el torso para ayudarte: mantené la inclinación fija y la espalda recta.",
      "Encoger los hombros hacia las orejas: mantenelos bajos.",
    ],
    tip: "Sirve para cuidar el hombro y mejorar la postura. Hacelo lento y con rango corto. También se hace boca abajo en un banco inclinado.",
  },

  "Overhead press en Smith": {
    setup: "De pie dentro de la máquina Smith, con la barra a la altura de los hombros. Agarre un poco más ancho que los hombros.",
    steps: [
      "Destrabá la barra girando las muñecas.",
      "Empujá la barra hacia arriba hasta estirar los brazos.",
      "Pausá un instante arriba.",
      "Bajá despacio hasta los hombros y trabá la barra al terminar.",
    ],
    breath: "Inhalá al bajar y exhalá al empujar.",
    mistakes: [
      "Ponerte muy adelante o muy atrás: la barra tiene que subir sobre la cabeza, ajustá la posición.",
      "Arquear la espalda: apretá el abdomen.",
      "No usar los topes de seguridad: ajustalos por si no podés seguir.",
    ],
    tip: "La barra guiada te da seguridad, pero el recorrido es fijo: si te incomoda el hombro, probá con mancuernas.",
  },

  "Bradford press": {
    setup: "De pie, con la barra apoyada sobre los hombros por delante. Agarre un poco más ancho que los hombros. Usá poco peso.",
    steps: [
      "Empujá la barra hacia arriba apenas lo justo para pasar la cabeza, sin estirar los brazos del todo.",
      "Bajala por detrás de la nuca, controlando el movimiento.",
      "Volvé a subirla, pasando por encima de la cabeza.",
      "Bajala al frente y seguí con el mismo ritmo, sin trabar los codos arriba.",
    ],
    breath: "Respirá de forma constante y tranquila, sin aguantar el aire.",
    mistakes: [
      "Usar mucho peso o impulso: es un ejercicio de repeticiones con peso liviano.",
      "Hacerlo con poca movilidad de hombros: si te duele pasar la barra por detrás, no sigas.",
      "Mover la cabeza de forma brusca: movela lo justo y con control.",
    ],
    tip: "Es avanzado y poco común: empezá con un palo para aprender el movimiento.",
  },

  "Lateral raise unilateral en polea": {
    setup: "Parado de costado a la polea baja, con una mano agarrando el asa del lado opuesto, cruzando el cuerpo. Con la otra mano, sostenete de un apoyo.",
    steps: [
      "Mantené el codo apenas doblado.",
      "Subí el brazo hacia el costado hasta la altura del hombro.",
      "Pausá un instante arriba.",
      "Bajá despacio, sin dejar que el cable te tire.",
    ],
    breath: "Exhalá al subir y inhalá al bajar.",
    mistakes: [
      "Inclinar el cuerpo para subir: usá menos peso y mantenete firme.",
      "Subir el brazo por encima del hombro: frená a esa altura.",
      "Bajar de golpe: la vuelta tiene que ser lenta.",
    ],
    tip: "Trabajar un lado por vez ayuda a que los dos hombros queden parejos.",
  },

  "Clean and press": CLEAN_PRESS_BARRA,
  "Clean and press con barra": CLEAN_PRESS_BARRA,

  "Clean and press con mancuernas": {
    setup: "De pie, con los pies al ancho de los hombros y una mancuerna a cada lado, en el piso. Agachate con la espalda recta y agarrá una en cada mano.",
    steps: [
      "Levantá las mancuernas empujando el piso con las piernas, con la espalda recta.",
      "Cuando pasan las rodillas, estirá las caderas con fuerza y llevalas hasta los hombros, con los codos por delante.",
      "Parate firme, con las mancuernas apoyadas en los hombros.",
      "Empujá las dos hacia arriba hasta estirar los brazos y bajalas con control hasta los hombros.",
    ],
    breath: "Inhalá antes de levantar y soltá el aire al empujar arriba.",
    mistakes: [
      "Tirar con los brazos: la fuerza sale de las piernas y las caderas.",
      "Redondear la espalda al agacharte: mantenela recta.",
      "Dejar caer las mancuernas sobre los hombros: recibilas con control.",
    ],
    tip: "Cada brazo trabaja por su lado, buena forma de aprender antes de pasar a la barra. Si te cuesta, partí con las mancuernas colgando a los costados de las rodillas.",
  },

  "Clean and jerk": {
    setup: "De pie frente a la barra apoyada en el piso, con las manos al ancho de los hombros. Rodillas flexionadas, espalda recta y mirada al frente.",
    steps: [
      "Levantá la barra del piso con las piernas hasta los hombros, con la espalda recta.",
      "Parate firme, con la barra apoyada en los hombros.",
      "Flexioná las rodillas apenas y estirá con fuerza, empujando la barra hacia arriba.",
      "Abrí los pies, uno adelante y otro atrás, y recibí la barra con los brazos estirados sobre la cabeza.",
      "Juntá los pies y bajá la barra con control.",
    ],
    breath: "Inhalá antes de cada fase de empuje y soltá el aire cuando la barra queda arriba.",
    mistakes: [
      "Hacerlo sin técnica ni experiencia: es un movimiento olímpico, aprendelo con un entrenador.",
      "Tirar con los brazos: la fuerza sale de las piernas.",
      "Usar mucho peso: empezá con una barra vacía o un palo.",
    ],
    tip: "Es un ejercicio avanzado. Si sos principiante, empezá por el press y el clean por separado.",
  },

  "Snatch con barra": {
    setup: "De pie frente a la barra apoyada en el piso, con un agarre muy ancho: parado y con los brazos relajados, la barra tiene que quedar a la altura de la cadera. Rodillas flexionadas, espalda recta y mirada al frente.",
    steps: [
      "Levantá la barra del piso con las piernas, con la espalda recta y la barra cerca del cuerpo.",
      "Cuando pasa las rodillas, estirá las caderas con fuerza.",
      "Bajá rápido en sentadilla y recibí la barra con los brazos estirados sobre la cabeza.",
      "Parate firme con la barra arriba y bajala con control.",
    ],
    breath: "Inhalá antes de levantar y soltá el aire cuando la barra queda arriba.",
    mistakes: [
      "Hacerlo sin técnica: es un movimiento olímpico complejo, aprendelo con un entrenador.",
      "Tirar con los brazos: la fuerza sale de las piernas y las caderas.",
      "Usar mucho peso: empezá con un palo o una barra vacía.",
    ],
    tip: "Exige buena movilidad de hombros y mucha técnica: no es para principiantes.",
  },

  "Kettlebell clean and press": {
    setup: "De pie con las piernas abiertas, una pesa rusa (kettlebell) en el piso entre los pies. Agarrala con una mano, con la espalda recta.",
    steps: [
      "Llevá la cadera hacia atrás y levantá la pesa pegada al cuerpo.",
      "Estirá las caderas con fuerza y llevá la pesa hasta apoyarla contra el antebrazo y el pecho, con el codo pegado al cuerpo.",
      "Parate firme, con la muñeca recta y la pesa apoyada en esa posición.",
      "Empujá la pesa hacia arriba hasta estirar el brazo, sin ayuda de las piernas. Bajala con control hasta el hombro.",
    ],
    breath: "Inhalá antes de levantar y soltá el aire al empujar arriba.",
    mistakes: [
      "Dejar que la pesa golpee la muñeca o el antebrazo: el problema está en el primer tramo, practicalo solo y mantené la pesa pegada al cuerpo.",
      "Tirar con el brazo: la fuerza sale de las caderas.",
      "Arquear la espalda al empujar: apretá el abdomen.",
    ],
    tip: "Hacé todas las repeticiones de un lado y después cambiá de brazo. Empezá con una pesa liviana hasta que el movimiento salga fluido.",
  },

  "Turkish get-up": {
    setup: "Acostado boca arriba con una pesa rusa en una mano, brazo estirado hacia el techo. La rodilla del mismo lado está flexionada y el otro brazo y pierna van abiertos.",
    steps: [
      "Mirando la pesa, apoyate en el codo y luego en la mano del piso.",
      "Levantá la cadera y pasá la pierna de atrás debajo del cuerpo, hasta quedar con una rodilla en el piso.",
      "Subí el torso y parate, con la pesa siempre arriba.",
      "Volvé haciendo los mismos pasos al revés, despacio.",
    ],
    breath: "Respirá de forma tranquila y constante, sin aguantar el aire.",
    mistakes: [
      "Ir muy rápido: hacelo lento y con control, paso por paso.",
      "Doblar el brazo de la pesa: mantenelo estirado y mirá la pesa.",
      "Usar mucho peso: practicá primero sin peso o con un zapato en la mano.",
    ],
    tip: "Aprendé cada paso por separado, sin peso, antes de usar la pesa.",
  },

  "Swing to press con kettlebell": {
    setup: "De pie con las piernas abiertas, una pesa rusa (kettlebell) delante de los pies. Agarrala con las dos manos, con la espalda recta.",
    steps: [
      "Llevá la cadera hacia atrás, como en una bisagra, y balanceá la pesa entre las piernas.",
      "Estirá las caderas con fuerza y dejá que la pesa suba hasta el pecho.",
      "Soltá una mano y llevá la pesa hasta el hombro, pegada al cuerpo y con el codo cerca de las costillas.",
      "Empujá hacia arriba hasta estirar el brazo y bajala con control hasta el hombro.",
    ],
    breath: "Inhalá al llevar la pesa atrás y soltá el aire al estirar la cadera y empujar.",
    mistakes: [
      "Levantar la pesa con los brazos: el impulso sale de las caderas.",
      "Redondear la espalda en el balanceo o hacer una sentadilla: la cadera va atrás, las espinillas casi quietas.",
      "Usar mucho peso: elegí una pesa liviana hasta dominar el movimiento.",
    ],
    tip: "Aprendé cada parte por separado: primero el balanceo, después llevar la pesa al hombro y al final el empuje.",
  },

  "Overhead carry": {
    setup: "De pie, con una mancuerna en cada mano (o una sola, en un brazo). Subila hasta estirar el codo sobre la cabeza, con el hombro hacia abajo y las costillas bajas.",
    steps: [
      "Apretá la panza y mantené los brazos estirados arriba, con la pesa justo sobre el hombro.",
      "Caminá con pasos cortos y firmes, sin inclinarte.",
      "Mirá al frente y mantené el pecho en alto.",
      "Caminá la distancia elegida y bajá las mancuernas con control.",
    ],
    breath: "Respirá de forma tranquila y constante, sin aguantar el aire.",
    mistakes: [
      "Arquear la espalda: apretá el abdomen y mantené las costillas abajo.",
      "Dejar que los brazos se doblen: mantenelos estirados.",
      "Usar mucho peso: elegí uno con el que puedas caminar sin perder la postura.",
    ],
    tip: "Hacelo solo si podés subir los brazos sin dolor ni arquear la espalda. Si no, probá con la pesa a un costado. Empezá liviano y con poca distancia.",
  },

  "Press de hombros con mancuernas sentado": {
    setup: "Sentado en un banco con respaldo recto, espalda apoyada. Sostené una mancuerna en cada mano a la altura de los hombros, con las palmas hacia adelante.",
    steps: [
      "Apretá la panza y mantené la espalda apoyada.",
      "Empujá las mancuernas hacia arriba hasta estirar los brazos.",
      "Pausá un instante arriba.",
      "Bajá despacio hasta la altura de las orejas.",
    ],
    breath: "Inhalá al bajar y exhalá al empujar.",
    mistakes: [
      "Arquear la espalda y despegarla del respaldo: mantenela apoyada.",
      "Abrir los codos muy hacia los costados: llevalos un poco hacia adelante.",
      "Bajar de golpe: controlá la bajada.",
    ],
    tip: "Sentado se cuida más la espalda: buena opción si recién empezás.",
  },

  "Elevación lateral acostado": {
    setup: "Acostado de costado sobre un banco o el piso, con una mancuerna liviana en la mano de arriba. El brazo descansa sobre el cuerpo.",
    steps: [
      "Mantené el codo apenas doblado y el cuerpo quieto.",
      "Subí el brazo hacia el techo, hasta dejarlo vertical sobre el hombro.",
      "Pausá un instante arriba.",
      "Bajá despacio hasta la posición inicial.",
    ],
    breath: "Exhalá al subir y inhalá al bajar.",
    mistakes: [
      "Girar el cuerpo para subir: mantenelo quieto y usá menos peso.",
      "Subir con impulso: hacelo lento.",
      "Usar mucho peso: es un músculo chico, usá poco.",
    ],
    tip: "Acostado no podés balancear el cuerpo, así que el movimiento sale más limpio.",
  },

  "Encogimiento de hombros en polea": {
    setup: "Parado frente a la polea baja, agarrá la barra o las asas con los brazos estirados y pegados al cuerpo.",
    steps: [
      "Mantené los brazos estirados y el pecho en alto.",
      "Subí los hombros hacia las orejas, como diciendo no sé.",
      "Pausá un segundo arriba.",
      "Bajá despacio, estirando los hombros hacia abajo.",
    ],
    breath: "Exhalá al subir los hombros e inhalá al bajar.",
    mistakes: [
      "Doblar los codos para subir: mantené los brazos estirados.",
      "Girar los hombros en círculos: subí y bajá en línea recta.",
      "Usar mucho peso y rebotar: elegí uno que puedas controlar.",
    ],
    tip: "Pensá que los hombros suben hacia las orejas, no hacia atrás.",
  },

  "Press trasnuca con mancuernas": {
    setup: "Sentado con la espalda apoyada, con una mancuerna en cada mano detrás de la cabeza, a la altura de las orejas. Solo si podés subir los brazos sin dolor.",
    steps: [
      "Mantené la espalda apoyada y la panza firme.",
      "Empujá las mancuernas hacia arriba hasta estirar los brazos.",
      "Pausá arriba, con las mancuernas sobre la cabeza.",
      "Bajá despacio hasta la altura de las orejas, sin pasarte.",
    ],
    breath: "Inhalá al bajar y exhalá al empujar.",
    mistakes: [
      "Hacerlo sin buena movilidad: si duele o se arquea la espalda, no lo hagas.",
      "Bajar más allá de las orejas: frená ahí para cuidar el hombro.",
      "Usar mucho peso: empezá con poco.",
    ],
    tip: "Con mancuernas las manos se mueven libres, lo que puede resultar más cómodo que con la barra.",
  },

  "Press militar en Smith": {
    setup: "De pie dentro de la máquina Smith, con la barra apoyada sobre los hombros por delante. Agarre un poco más ancho que los hombros.",
    steps: [
      "Destrabá la barra girando las muñecas.",
      "Empujá la barra hacia arriba hasta estirar los brazos.",
      "Pausá un instante arriba.",
      "Bajá despacio hasta los hombros y trabá la barra al terminar.",
    ],
    breath: "Inhalá al bajar y exhalá al empujar.",
    mistakes: [
      "Pararte muy adelante o atrás: la barra tiene que subir sobre tu cabeza, ajustá los pies.",
      "Arquear la espalda: apretá abdomen y glúteos.",
      "No usar los topes de seguridad: ajustalos antes de empezar.",
    ],
    tip: "La barra guiada ayuda a empezar, pero el recorrido es fijo: si te incomoda el hombro, probá con mancuernas.",
  },

  "Press trasnuca en Smith": {
    setup: "Sentado en un banco dentro de la Smith, con la barra detrás de la nuca, sobre los hombros. Agarre ancho. Solo si podés subir los brazos sin dolor.",
    steps: [
      "Destrabá la barra y mantené la cabeza un poco hacia adelante.",
      "Empujá la barra hacia arriba hasta estirar los brazos.",
      "Pausá arriba.",
      "Bajá despacio hasta la altura de las orejas y trabá la barra al terminar.",
    ],
    breath: "Inhalá al bajar y exhalá al empujar.",
    mistakes: [
      "Hacerlo sin buena movilidad de hombros: si duele o arquea la espalda, no lo hagas.",
      "Bajar más allá de las orejas: frená ahí.",
      "Banco mal ubicado: la barra tiene que subir sobre tu cabeza, ajustalo.",
    ],
    tip: "Los topes de seguridad de la Smith ayudan, pero el recorrido es fijo: usalo con poco peso.",
  },
};
