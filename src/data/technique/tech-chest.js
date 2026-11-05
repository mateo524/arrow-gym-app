// Técnica escrita de los ejercicios del grupo: chest. Formato en src/data/technique/index.js.

// Frases de respiración compartidas entre variantes.
const BENCH_BREATH = "Inhalá mientras bajás la barra y exhalá mientras la empujás hacia arriba.";
const DB_PRESS_BREATH = "Inhalá al bajar las mancuernas y exhalá al empujarlas hacia arriba.";
const MACHINE_BREATH = "Exhalá al empujar las manijas y inhalá al volver despacio.";
const FLY_BREATH = "Inhalá al abrir los brazos y exhalá al juntarlos.";
const PUSHUP_BREATH = "Inhalá al bajar el cuerpo y exhalá al empujar para subir.";
const CABLE_BREATH = "Exhalá al juntar las manos e inhalá al abrir los brazos con control.";

export const TECH = {
  "Press de banca plano": {
    setup: "Acostate boca arriba con los ojos debajo de la barra y los pies firmes en el piso. Agarrá la barra un poco más ancho que los hombros, con las muñecas rectas.",
    steps: [
      "Juntá los omóplatos (las paletas de la espalda) y apretalos contra el banco. Sacá el pecho.",
      "Sacá la barra del soporte con los brazos estirados y llevala sobre el pecho.",
      "Bajala con control hasta tocar apenas la parte media del pecho. Los codos quedan a unos 45 grados del cuerpo.",
      "Empujá hacia arriba apoyando bien los pies, sin despegar la cola del banco.",
    ],
    breath: BENCH_BREATH,
    mistakes: [
      "Rebotar la barra en el pecho: bajala frenando un instante y subí sin impulso.",
      "Abrir los codos a los costados como una T: acercalos al cuerpo para cuidar los hombros.",
      "Levantar la cola del banco: apoyá bien los pies y bajá el peso hasta poder hacerlo pegado.",
    ],
    tip: "Si entrenás solo o cerca del límite, usá los pines de seguridad del rack o pedí que te asistan.",
  },

  "Press de banca inclinado": {
    setup: "Acostate en un banco inclinado entre 30 y 40 grados, con los pies firmes en el piso. Agarrá la barra apenas más ancho que los hombros.",
    steps: [
      "Apretá los omóplatos contra el banco y sacá el pecho.",
      "Sacá la barra del soporte y ubicala sobre la parte alta del pecho, cerca de la clavícula.",
      "Bajala con control hasta tocar apenas la zona alta del pecho.",
      "Empujá hacia arriba hasta tener los brazos estirados sobre los hombros.",
    ],
    breath: BENCH_BREATH,
    mistakes: [
      "Inclinar el banco demasiado: pasando los 45 grados carga mucho más el hombro. Quedate entre 30 y 40.",
      "Bajar la barra al abdomen o muy abajo: tiene que tocar la parte alta del pecho.",
      "Rebotar la barra: bajá con control y subí sin impulso.",
    ],
    tip: "El banco inclinado enfatiza la parte alta del pecho, cerca de la clavícula. Usá menos peso que en el plano.",
  },

  "Press de banca declinado": {
    setup: "Acostate en un banco con la cabeza más baja que los pies y trabá bien las piernas en los soportes. Agarrá la barra apenas más ancho que los hombros.",
    steps: [
      "Apretá los omóplatos contra el banco. Pedí que te ayuden a sacar la barra del soporte.",
      "Bajá la barra con control hasta la parte baja del pecho.",
      "Empujá hacia arriba hasta estirar los brazos sobre el pecho.",
      "Al terminar, devolvé la barra al soporte con cuidado, sin apuro.",
    ],
    breath: BENCH_BREATH,
    mistakes: [
      "Rebotar la barra en el pecho: frenala un instante y subí sin impulso.",
      "Usar demasiado peso: en esta posición cuesta más controlar la barra, así que empezá liviano.",
      "Abrir mucho los codos: mantenelos a unos 45 grados del cuerpo.",
    ],
    tip: "La cabeza queda abajo y sube la presión en la cara. Si tenés presión alta o mareos, consultá antes de hacerlo.",
  },

  "Press de pecho con mancuernas": {
    setup: "Sentate en el banco plano con una mancuerna apoyada en cada muslo. Acostate llevando las mancuernas al pecho, con las palmas hacia los pies.",
    steps: [
      "Apoyá los pies y juntá los omóplatos contra el banco.",
      "Empujá las mancuernas hacia arriba hasta estirar los brazos sobre el pecho.",
      "Bajalas despacio, con los codos a unos 45 grados del cuerpo, hasta sentir el pecho estirarse.",
      "Volvé a empujar sin que las mancuernas se choquen arriba.",
    ],
    breath: DB_PRESS_BREATH,
    mistakes: [
      "Bajar demasiado, con los codos muy atrás del cuerpo: frená cuando los codos pasan apenas la línea del banco.",
      "Dejar que las muñecas se doblen hacia atrás: mantenelas rectas sobre el antebrazo.",
      "Chocar las mancuernas arriba: terminá con los brazos estirados pero sin golpearlas.",
    ],
    tip: "Para sentarte y acostarte con peso, apoyá cada mancuerna en el muslo y ayudate con las piernas.",
  },

  "Press inclinado con mancuernas": {
    setup: "Sentate en un banco inclinado entre 30 y 40 grados con las mancuernas en los muslos. Acostate llevándolas a la altura de la parte alta del pecho.",
    steps: [
      "Apoyá los pies y juntá los omóplatos contra el banco.",
      "Empujá las mancuernas hacia arriba hasta estirar los brazos sobre los hombros.",
      "Bajalas despacio, con los codos a unos 45 grados del cuerpo.",
      "Frená cuando sientas el pecho estirado y volvé a empujar.",
    ],
    breath: DB_PRESS_BREATH,
    mistakes: [
      "Subir el banco a más de 45 grados: se parece cada vez más a un press de hombros. Bajalo a 30 o 40.",
      "Abrir demasiado los codos: acercalos al cuerpo para cuidar el hombro.",
      "Usar peso excesivo y perder el control: bajá la carga y controlá todo el recorrido.",
    ],
    tip: "Con mancuernas cada brazo trabaja solo, así que se nota si un lado es más débil. Mantené el mismo ritmo en ambos.",
  },

  "Aperturas planas con mancuernas": {
    setup: "Acostate en un banco plano con una mancuerna en cada mano y los brazos estirados sobre el pecho. Las palmas se miran entre sí, con los codos apenas flexionados.",
    steps: [
      "Juntá los omóplatos contra el banco y apoyá bien los pies.",
      "Abrí los brazos hacia los costados, como un abrazo grande, sin cambiar la flexión de los codos.",
      "Bajá hasta sentir el pecho estirarse, sin pasar la altura del banco.",
      "Volvé juntando las mancuernas arriba, como abrazando un árbol.",
    ],
    breath: FLY_BREATH,
    mistakes: [
      "Doblar y estirar los codos: se vuelve un press. Mantené siempre la misma flexión.",
      "Bajar demasiado: tironea el hombro. Frená cuando las manos llegan a la altura del pecho.",
      "Usar mucho peso: elegí mancuernas livianas, acá importa el estiramiento, no el kilaje.",
    ],
    tip: "Pensá en abrazar, no en empujar. Si el hombro molesta, bajá menos.",
  },

  "Aperturas inclinadas con mancuernas": {
    setup: "Acostate en un banco inclinado entre 30 y 40 grados con una mancuerna en cada mano. Estirá los brazos sobre el pecho, con las palmas enfrentadas y los codos apenas flexionados.",
    steps: [
      "Juntá los omóplatos contra el banco y apoyá los pies.",
      "Abrí los brazos hacia los costados manteniendo la misma flexión de codos.",
      "Bajá hasta sentir el pecho estirarse, sin pasar el nivel del pecho.",
      "Volvé juntando las mancuernas arriba, apretando el pecho.",
    ],
    breath: FLY_BREATH,
    mistakes: [
      "Doblar los codos para ayudarte: mantené siempre la misma flexión, como un abrazo.",
      "Bajar demasiado y tironear el hombro: frená a la altura del pecho.",
      "Elegir mancuernas muy pesadas: usá poco peso y controlá la bajada.",
    ],
    tip: "En el banco inclinado trabaja más la parte alta del pecho. Mantené la inclinación entre 30 y 40 grados.",
  },

  "Press de pecho en máquina": {
    setup: "Sentate con la espalda pegada al respaldo y regulá el asiento para que las manijas queden a la altura de la mitad del pecho. Agarralas con las muñecas rectas.",
    steps: [
      "Apoyá los pies planos en el piso y sacá el pecho, con los hombros hacia atrás y abajo.",
      "Empujá las manijas hacia adelante hasta estirar casi del todo los brazos.",
      "Volvé despacio hasta que las manos queden a la altura del pecho.",
      "Mantené la espalda siempre apoyada en el respaldo.",
    ],
    breath: MACHINE_BREATH,
    mistakes: [
      "Asiento mal regulado, con las manijas muy altas o bajas: ajustalo para que queden a la altura del pecho.",
      "Despegar la espalda del respaldo: bajá el peso y mantenela pegada.",
      "Dejar caer el peso al volver: controlá la vuelta en dos o tres segundos.",
    ],
    tip: "La máquina guía el movimiento, ideal para empezar o entrenar sin ayuda. Elegí un peso con el que sientas el control.",
  },

  "Press inclinado en máquina": {
    setup: "Sentate con la espalda bien pegada al respaldo y regulá el asiento para que las manijas queden cerca de la parte alta del pecho. Agarralas con las muñecas rectas.",
    steps: [
      "Apoyá los pies en el piso y llevá los hombros hacia atrás y abajo.",
      "Empujá las manijas hacia adelante y un poco hacia arriba, hasta estirar casi los brazos.",
      "Volvé despacio hasta que las manos queden cerca del pecho.",
      "Mantené la espalda apoyada todo el tiempo.",
    ],
    breath: MACHINE_BREATH,
    mistakes: [
      "Encogerse de hombros al empujar: bajalos y alejalos de las orejas.",
      "Despegar la espalda del respaldo: bajá el peso para poder hacerlo pegado.",
      "Soltar el peso al volver: frenalo y controlá la bajada.",
    ],
    tip: "El recorrido hacia arriba trabaja más la parte alta del pecho. Regulá bien el asiento antes de empezar.",
  },

  "Cruces en polea alta": {
    setup: "Parate en el medio de dos poleas puestas arriba, con una manija en cada mano. Da un paso adelante, inclinate apenas y flexioná un poco los codos.",
    steps: [
      "Abrí los brazos hacia los costados y sentí el pecho estirarse.",
      "Llevá las manos hacia abajo y adelante, en un arco, hasta juntarlas a la altura del ombligo.",
      "Apretá el pecho un segundo con las manos juntas.",
      "Volvé abriendo los brazos despacio, manteniendo los codos con la misma flexión.",
    ],
    breath: CABLE_BREATH,
    mistakes: [
      "Doblar y estirar los codos: se convierte en un press. Mantené la misma flexión.",
      "Balancear el cuerpo para mover el peso: bajá la carga y quedate firme, con un pie adelante.",
      "Dejar que las poleas te tiren los brazos hacia atrás: abrí solo hasta sentir el estiramiento.",
    ],
    tip: "Al bajar desde arriba, las manos trabajan hacia la parte baja del pecho. Usá poco peso y buen control.",
  },

  "Cruces en polea baja": {
    setup: "Parate en el medio de dos poleas puestas abajo, con una manija en cada mano. Da un paso adelante, con el tronco recto y los codos apenas flexionados.",
    steps: [
      "Empezá con los brazos abiertos y las manos a la altura de la cadera.",
      "Subí las manos hacia adelante y arriba, en un arco, hasta juntarlas frente al pecho.",
      "Apretá el pecho un segundo.",
      "Volvé abriendo los brazos y bajando las manos despacio.",
    ],
    breath: CABLE_BREATH,
    mistakes: [
      "Levantar el peso con los hombros: dejá los hombros bajos y subí con el pecho.",
      "Doblar y estirar los codos: mantené la misma flexión durante todo el recorrido.",
      "Balancear el cuerpo: usá menos peso y quedate firme con un pie adelante.",
    ],
    tip: "El movimiento de abajo hacia arriba trabaja más la parte alta del pecho. Es un buen complemento del press inclinado.",
  },

  "Cruces en polea media": {
    setup: "Parate en el medio de dos poleas puestas a la altura del pecho, con una manija en cada mano. Da un paso adelante y flexioná apenas los codos.",
    steps: [
      "Abrí los brazos hacia los costados hasta sentir el pecho estirarse.",
      "Juntá las manos frente al pecho, en un arco amplio.",
      "Apretá el pecho un segundo con las manos juntas.",
      "Volvé abriendo los brazos despacio, con los codos siempre igual de flexionados.",
    ],
    breath: CABLE_BREATH,
    mistakes: [
      "Doblar y estirar los codos: mantené la misma flexión, como un abrazo.",
      "Abrir los brazos demasiado atrás: frená cuando sientas el estiramiento, sin dolor en el hombro.",
      "Inclinarte y balancearte con el peso: bajá la carga y mantené el torso firme.",
    ],
    tip: "Ideal para sentir el pecho trabajar. Usá menos peso que en los presses.",
  },

  "Fondos en paralelas": {
    setup: "Agarrá las barras paralelas con los brazos estirados y el cuerpo suspendido. Inclinate un poco hacia adelante y cruzá los pies detrás.",
    steps: [
      "Con el pecho inclinado hacia adelante, doblá los codos y bajá el cuerpo con control.",
      "Bajá hasta que los codos queden cerca de los 90 grados, sin pasar de ahí.",
      "Empujá las barras para subir hasta estirar los brazos.",
      "Mantené los hombros bajos, lejos de las orejas, todo el tiempo.",
    ],
    breath: "Inhalá al bajar y exhalá al empujar las barras para subir.",
    mistakes: [
      "Bajar demasiado: puede dañar el hombro. Frená cuando los codos llegan a unos 90 grados.",
      "Quedarse totalmente vertical: se trabaja más el tríceps. Inclinate un poco hacia adelante.",
      "Balancear las piernas para subir: mantené el cuerpo quieto y subí con fuerza de brazos.",
    ],
    tip: "Si todavía no podés hacerlos, empezá con fondos asistidos en máquina. Si el hombro molesta, no bajes tanto.",
  },

  "Flexiones": {
    setup: "Apoyá las manos en el piso, un poco más anchas que los hombros, y estirá las piernas atrás. Cuerpo recto de la cabeza a los talones.",
    steps: [
      "Apretá la panza y la cola para que la cadera no se hunda ni suba.",
      "Doblá los codos y bajá el pecho hacia el piso, con los codos a unos 45 grados del cuerpo.",
      "Frená cuando el pecho casi toque el piso.",
      "Empujá el piso hasta estirar los brazos, sin perder la línea recta.",
    ],
    breath: PUSHUP_BREATH,
    mistakes: [
      "Hundir la cadera o levantar la cola: apretá abdomen y cola para mantener el cuerpo recto.",
      "Abrir los codos como una T: llevalos cerca del cuerpo, a unos 45 grados.",
      "Bajar solo la mitad: llegá con el pecho cerca del piso. Si no podés, usá las rodillas o apoyá las manos en un banco.",
    ],
    tip: "Si te cuesta, apoyá las manos en un banco o pared. A medida que mejorás, bajá la altura.",
  },

  "Flexiones inclinadas": {
    setup: "Apoyá las manos en un banco o superficie firme, un poco más anchas que los hombros, y estirá las piernas atrás. Cuerpo recto de la cabeza a los talones.",
    steps: [
      "Apretá la panza y la cola para mantener el cuerpo en línea recta.",
      "Doblá los codos y bajá el pecho hacia el banco, con los codos a unos 45 grados.",
      "Frená cuando el pecho casi toque el banco.",
      "Empujá hasta estirar los brazos, sin hundir la cadera.",
    ],
    breath: PUSHUP_BREATH,
    mistakes: [
      "Usar un apoyo que se mueve: elegí un banco o barra firme que no se deslice.",
      "Hundir la cadera: apretá abdomen y cola.",
      "Abrir demasiado los codos: llevalos cerca del cuerpo.",
    ],
    tip: "Con las manos más altas que los pies, es más fácil que la flexión común. Ideal para novatos o para volver al ejercicio.",
  },

  "Fondos asistidos": {
    setup: "Parate o arrodillate en la plataforma de la máquina y agarrá las manijas con los brazos estirados. El contrapeso te ayuda a sostener parte de tu peso.",
    steps: [
      "Inclinate un poco hacia adelante con el pecho abierto.",
      "Doblá los codos y bajá con control hasta unos 90 grados.",
      "Empujá las manijas hasta estirar los brazos.",
      "Mantené los hombros bajos, lejos de las orejas.",
    ],
    breath: "Inhalá al bajar y exhalá al empujar para subir.",
    mistakes: [
      "Bajar demasiado: puede cargar el hombro. Frená cuando los codos llegan a unos 90 grados.",
      "Rebotar abajo con el impulso de la plataforma: bajá lento y subí con fuerza de brazos.",
      "Poner demasiada ayuda: a medida que mejorás, reducí el contrapeso para ganar fuerza.",
    ],
    tip: "Más contrapeso significa más ayuda. Cuando puedas, bajalo de a poco hasta hacer fondos libres.",
  },

  "Cruces en polea con cable": {
    setup: "Parate en el medio de dos poleas a la altura del pecho, con una manija en cada mano. Da un paso adelante y flexioná apenas los codos.",
    steps: [
      "Abrí los brazos hacia los costados hasta sentir el pecho estirarse.",
      "Juntá las manos frente al pecho, en un arco amplio.",
      "Apretá el pecho un segundo con las manos juntas.",
      "Volvé abriendo los brazos despacio, sin cambiar la flexión de los codos.",
    ],
    breath: CABLE_BREATH,
    mistakes: [
      "Doblar y estirar los codos: mantené la misma flexión, como un abrazo.",
      "Balancear el cuerpo para mover el peso: usá menos carga y quedate firme.",
      "Abrir los brazos más allá de lo cómodo: frená cuando sientas el estiramiento.",
    ],
    tip: "Trabajá con peso liviano y concentrate en apretar el pecho al juntar las manos.",
  },

  "Mariposa en máquina": {
    setup: "Sentate con la espalda pegada al respaldo y regulá el asiento para que los codos queden a la altura del pecho. Apoyá los antebrazos en las almohadillas, con los codos doblados.",
    steps: [
      "Apoyá los pies y llevá los hombros hacia atrás y abajo.",
      "Juntá las almohadillas frente al pecho, empujando con los antebrazos.",
      "Mantené un segundo la posición con los brazos juntos.",
      "Volvé abriendo despacio hasta sentir el pecho estirarse, sin que el peso te tire los hombros atrás.",
    ],
    breath: "Exhalá al juntar las manijas e inhalá al abrir con control.",
    mistakes: [
      "Dejar que el peso te lleve los brazos muy atrás: frená cuando sientas el estiramiento, sin dolor.",
      "Asiento mal regulado: ajustalo para que los codos queden a la altura del pecho.",
      "Despegar la espalda del respaldo: bajá el peso y mantenela apoyada.",
    ],
    tip: "Es una máquina guiada y segura para novatos. No hace falta mucho peso para sentir el pecho trabajar.",
  },

  "Aperturas en máquina (mariposa)": {
    setup: "Sentate con la espalda pegada al respaldo y regulá el asiento para que las manijas queden a la altura del pecho. Agarralas con los codos apenas doblados.",
    steps: [
      "Apoyá los pies y llevá los hombros hacia atrás y abajo.",
      "Juntá las manijas frente al pecho, apretando el pecho.",
      "Mantené un segundo la posición con las manos juntas.",
      "Volvé abriendo despacio hasta sentir el pecho estirarse, sin que el peso te tire los hombros atrás.",
    ],
    breath: "Exhalá al juntar las manijas e inhalá al abrir con control.",
    mistakes: [
      "Dejar que el peso te lleve los brazos muy atrás: frená cuando sientas el estiramiento, sin dolor.",
      "Asiento mal regulado: ajustalo para que los codos queden a la altura del pecho.",
      "Despegar la espalda del respaldo: bajá el peso y mantenela apoyada.",
    ],
    tip: "Es una máquina guiada y segura para novatos. No hace falta mucho peso para sentir el pecho trabajar.",
  },

  "Flexiones con manos elevadas": {
    setup: "Apoyá las manos en un banco o escalón firme, un poco más anchas que los hombros, con las piernas estiradas atrás. Cuerpo recto de la cabeza a los talones.",
    steps: [
      "Apretá la panza y la cola para mantener el cuerpo recto.",
      "Doblá los codos y bajá el pecho hacia el apoyo, con los codos a unos 45 grados.",
      "Frená cuando el pecho casi toque el apoyo.",
      "Empujá hasta estirar los brazos, sin hundir la cadera.",
    ],
    breath: PUSHUP_BREATH,
    mistakes: [
      "Usar un apoyo inestable: elegí algo firme que no se mueva.",
      "Hundir la cadera: apretá abdomen y cola.",
      "Abrir demasiado los codos: llevalos cerca del cuerpo.",
    ],
    tip: "Es más fácil que la flexión común. Cuanto más alto el apoyo, menos esfuerzo. Bajalo de a poco al mejorar.",
  },

  "Flexiones con pies elevados": {
    setup: "Apoyá los pies en un banco o escalón y las manos en el piso, un poco más anchas que los hombros. Cuerpo recto de la cabeza a los talones.",
    steps: [
      "Apretá la panza y la cola para que la cadera no se hunda.",
      "Doblá los codos y bajá la cabeza y el pecho hacia el piso, con los codos a unos 45 grados.",
      "Frená cuando el pecho casi toque el piso.",
      "Empujá el piso hasta estirar los brazos, sin perder la línea recta.",
    ],
    breath: PUSHUP_BREATH,
    mistakes: [
      "Hundir la cadera: apretá abdomen y cola.",
      "Mirar adelante y estirar el cuello: mantené la cabeza en línea con la espalda.",
      "Subir los pies demasiado antes de estar listo: empezá con una altura baja.",
    ],
    tip: "Con los pies arriba, cargás más peso en los brazos y trabaja más la parte alta del pecho y el hombro. Es más difícil que la flexión común.",
  },

  "Press de banca con pausa": {
    setup: "Acostate en el banco plano con los ojos debajo de la barra y los pies firmes en el piso. Agarrá la barra un poco más ancho que los hombros, con las muñecas rectas.",
    steps: [
      "Juntá los omóplatos y apretalos contra el banco. Sacá la barra del soporte.",
      "Bajala con control hasta tocar apenas la parte media del pecho.",
      "Pará la barra quieta sobre el pecho durante uno o dos segundos, sin relajarte ni rebotar.",
      "Empujá hacia arriba apoyando los pies hasta estirar los brazos.",
    ],
    breath: "Inhalá al bajar, aguantá el aire en la pausa y exhalá al empujar.",
    mistakes: [
      "Relajarte y hundir la barra en el pecho: mantené el cuerpo tenso durante la pausa.",
      "Usar el mismo peso que sin pausa: bajá la carga, la pausa lo vuelve más difícil.",
      "Rebotar al salir de la pausa: empujá con fuerza desde quieto.",
    ],
    tip: "Pedí a alguien que te cubra o usá los pines de seguridad. La pausa quita el rebote y enseña a controlar la barra.",
  },

  "Pin press": {
    setup: "Ubicá los pines del rack a la altura del tramo donde más te cuesta subir, y apoyá la barra encima. Acostate en un banco plano debajo, con los pies firmes, y agarrá la barra apenas más ancho que los hombros.",
    steps: [
      "Juntá los omóplatos contra el banco y apretá el cuerpo antes de empujar.",
      "Empujá la barra desde los pines, desde quieta, hasta estirar los brazos.",
      "Bajala con control hasta apoyarla de nuevo sobre los pines.",
      "Pará un instante, sin relajarte, y repetí empujando desde cero.",
    ],
    breath: "Inhalá antes de empujar y exhalá al subir la barra.",
    mistakes: [
      "Rebotar la barra en los pines: apoyala suave y volvé a empujar desde quieto.",
      "Poner los pines mal ajustados o sin trabarlos: revisá que queden parejos y firmes. Probalos con la barra vacía antes de cargar peso.",
      "Usar demasiado peso: como arrancás sin impulso, bajá la carga.",
    ],
    tip: "Cada repetición empieza sin ayuda del rebote, así que trabaja la fuerza de arranque. Usá menos peso que en el press normal y pedí que te cuiden.",
  },

  "Floor press con barra": {
    setup: "Acostate en el piso con las rodillas dobladas y los pies apoyados, con la barra en un rack bajo o ayudado por un compañero. Agarrá la barra apenas más ancho que los hombros.",
    steps: [
      "Sacá la barra y llevala sobre el pecho con los brazos estirados.",
      "Bajala despacio hasta que los codos toquen el piso.",
      "Pará un instante con los codos apoyados, sin relajarte.",
      "Empujá hacia arriba hasta estirar los brazos.",
    ],
    breath: BENCH_BREATH,
    mistakes: [
      "Dejar caer los codos contra el piso: bajá con control y frená suave.",
      "Rebotar los codos en el piso: pausá un segundo y empujá desde quieto.",
      "Usar el mismo peso que en banca: empezá con menos hasta tomar el tacto.",
    ],
    tip: "El piso limita el recorrido y cuida los hombros. Sirve si tenés molestia en el hombro con el press de banca.",
  },

  "Floor press con mancuernas": {
    setup: "Acostate en el piso con las rodillas dobladas y los pies apoyados. Sostené una mancuerna en cada mano con los brazos estirados sobre el pecho.",
    steps: [
      "Apretá los omóplatos contra el piso y mantené las muñecas rectas.",
      "Bajá las mancuernas despacio hasta que los codos toquen el piso.",
      "Pará un instante con los codos apoyados, sin relajarte.",
      "Empujá hacia arriba hasta estirar los brazos.",
    ],
    breath: DB_PRESS_BREATH,
    mistakes: [
      "Dejar caer los codos contra el piso: bajá con control.",
      "Rebotar los codos: pausá un segundo y empujá desde quieto.",
      "Abrir los codos como una T: mantenelos a unos 45 grados del cuerpo.",
    ],
    tip: "El piso corta el recorrido y cuida los hombros. Útil si el press en banco te molesta.",
  },

  "Aperturas en TRX": {
    setup: "Parate de espaldas al anclaje, con una manija en cada mano y los brazos estirados al frente, a la altura del pecho. Inclinate hacia adelante con el cuerpo recto.",
    steps: [
      "Apretá la panza y la cola para mantener el cuerpo recto.",
      "Abrí los brazos hacia los costados, con los codos apenas flexionados, hasta formar una T con el cuerpo.",
      "Frená cuando sientas el pecho estirarse, sin pasar la línea del pecho.",
      "Juntá los brazos de nuevo al frente, como en un abrazo, y volvé a la posición inicial.",
    ],
    breath: FLY_BREATH,
    mistakes: [
      "Hundir la cadera: apretá abdomen y cola para mantener el cuerpo recto.",
      "Abrir demasiado los brazos y tironear el hombro: frená cuando sientas el estiramiento.",
      "Doblar y estirar los codos: mantené la misma flexión durante todo el recorrido.",
    ],
    tip: "Cuanto más cerca del anclaje pongas los pies, más difícil es. Empezá casi parado y aumentá la inclinación de a poco.",
  },

  "Burpee con press": {
    setup: "Parate con una mancuerna en cada mano, colgando a los costados, y los pies al ancho de la cadera. Mantené la espalda recta.",
    steps: [
      "Agachate y apoyá las mancuernas en el piso, llevando los pies atrás hasta la posición de flexión.",
      "Hacé una flexión apoyada en las mancuernas, con el cuerpo recto. Podés saltearla si perdés la técnica.",
      "Traé los pies hacia las manos, con un paso o un salto, y levantate con las mancuernas.",
      "Llevalas a los hombros y empujalas por encima de la cabeza, estirando los brazos.",
    ],
    breath: "Exhalá al hacer la flexión y al empujar las mancuernas arriba, e inhalá al agacharte.",
    mistakes: [
      "Hundir la espalda al apoyar las manos: apretá abdomen y cola.",
      "Hacerlo rápido y perder el control: empezá lento y con poco peso.",
      "Levantar las mancuernas arqueando la espalda: mantené el tronco recto al empujar arriba.",
    ],
    tip: "Exige mucho. Usá mancuernas más livianas que en un press común, y si sos principiante, hacé los pasos de a uno y sin salto. Evitalo si te duelen las muñecas o los hombros.",
  },

  "Push-up a remo con mancuernas": {
    setup: "Apoyá las manos en dos mancuernas hexagonales en el piso, a la altura de los hombros, con las piernas abiertas atrás. Cuerpo recto de la cabeza a los talones.",
    steps: [
      "Apretá la panza y la cola, y abrí un poco los pies para estabilizarte.",
      "Hacé una flexión: bajá el pecho hacia el piso y empujá para subir.",
      "Arriba, remá una mancuerna hacia la costilla sin girar la cadera.",
      "Apoyá la mancuerna, hacé otra flexión y remá con el otro brazo.",
    ],
    breath: "Inhalá al bajar, exhalá al subir y exhalá de nuevo al remar.",
    mistakes: [
      "Girar la cadera al remar: apretá el abdomen y abrí más los pies.",
      "Usar mancuernas redondas que ruedan: elegí hexagonales o con base firme.",
      "Remar con el codo abierto: llevalo cerca del cuerpo, hacia la costilla.",
    ],
    tip: "Exigente para el abdomen y los hombros. Usá poco peso hasta dominar el equilibrio.",
  },

  "Press neutro con mancuernas": {
    setup: "Acostate en el banco plano con una mancuerna en cada mano a la altura del pecho. Las palmas se miran entre sí y los codos quedan cerca del cuerpo.",
    steps: [
      "Apoyá los pies y juntá los omóplatos contra el banco.",
      "Empujá las mancuernas hacia arriba hasta estirar los brazos, con las palmas enfrentadas.",
      "Bajalas despacio con los codos pegados al cuerpo, hasta sentir el pecho estirarse.",
      "Volvé a empujar sin que las mancuernas se choquen arriba.",
    ],
    breath: DB_PRESS_BREATH,
    mistakes: [
      "Abrir los codos hacia afuera: mantenelos cerca del cuerpo, es lo que define este agarre.",
      "Bajar demasiado y tironear el hombro: frená cuando los codos pasan apenas el banco.",
      "Chocar las mancuernas arriba: terminá con los brazos estirados, sin golpearlas.",
    ],
    tip: "Con las palmas enfrentadas, el hombro suele quedar más cómodo. Sirve si el agarre con palmas hacia adelante te molesta.",
  },

  "Apertura en polea unilateral": {
    setup: "Parate de costado a una polea a la altura del pecho, con la manija en la mano de afuera. Da un paso adelante con la pierna opuesta y flexioná apenas el codo.",
    steps: [
      "Apretá la panza y mantené el torso firme, sin girar.",
      "Abrí el brazo hacia afuera hasta sentir el pecho estirarse.",
      "Llevá la mano hacia el centro del pecho en un arco, apretando el pecho.",
      "Volvé despacio y repetí todas las repeticiones de un lado antes de cambiar.",
    ],
    breath: CABLE_BREATH,
    mistakes: [
      "Girar el torso para ayudarte: mantenelo firme con la panza apretada.",
      "Doblar y estirar el codo: mantené la misma flexión.",
      "Usar demasiado peso: elegí uno con el que controles todo el recorrido.",
    ],
    tip: "Trabajás un lado por vez, así detectás si uno es más débil. Hacé las mismas repeticiones con ambos brazos.",
  },

  "Press Svend": {
    setup: "Parate con los pies al ancho de los hombros y sostené un disco liviano entre las palmas, a la altura del pecho. Apretá fuerte los lados del disco, con los codos pegados al cuerpo.",
    steps: [
      "Apretá la panza y mantené la espalda recta.",
      "Estirá los brazos hacia adelante sin dejar de apretar el disco.",
      "Mantené un segundo con los brazos estirados.",
      "Volvé el disco al pecho despacio, sin aflojar el apretón.",
    ],
    breath: "Exhalá al estirar los brazos e inhalá al volver el disco al pecho.",
    mistakes: [
      "Usar un disco muy pesado: elegí uno liviano que no se te resbale.",
      "Aflojar el apretón del disco: apretá las palmas durante todo el recorrido.",
      "Arquear la espalda al estirar: apretá la panza y mantené el tronco recto.",
    ],
    tip: "Lo que trabaja el pecho es el apretón constante, no el peso. Usá poco peso y buena concentración.",
  },

  "Press de banca en Smith": {
    setup: "Acostate en el banco plano debajo de la barra de la máquina Smith, con la barra sobre la parte media del pecho. Pies firmes en el piso y agarre apenas más ancho que los hombros.",
    steps: [
      "Juntá los omóplatos contra el banco y sacá el pecho.",
      "Girá las muñecas para destrabar la barra y bajala con control hasta el pecho.",
      "Empujá hacia arriba hasta estirar los brazos.",
      "Al terminar, girá las muñecas para trabar la barra en los ganchos.",
    ],
    breath: BENCH_BREATH,
    mistakes: [
      "Ubicar mal el banco: la barra tiene que bajar sobre la parte media del pecho, no al cuello ni al abdomen.",
      "Olvidarte de trabar la barra al terminar: girá las muñecas para engancharla.",
      "Rebotar la barra en el pecho: frenala un instante y subí sin impulso.",
    ],
    tip: "La barra va guiada por rieles, así que es más estable y fácil de controlar. Probá la posición del banco con la barra vacía y regulá los topes de seguridad.",
  },

  "Press inclinado en Smith": {
    setup: "Acostate en un banco inclinado entre 30 y 40 grados debajo de la barra de la Smith, con la barra sobre la parte alta del pecho. Pies firmes y agarre apenas más ancho que los hombros.",
    steps: [
      "Juntá los omóplatos contra el banco y sacá el pecho.",
      "Girá las muñecas para destrabar la barra y bajala con control a la parte alta del pecho.",
      "Empujá hacia arriba hasta estirar los brazos.",
      "Al terminar, girá las muñecas para trabar la barra en los ganchos.",
    ],
    breath: BENCH_BREATH,
    mistakes: [
      "Ubicar mal el banco: la barra tiene que bajar sobre la parte alta del pecho, no al cuello.",
      "Inclinar demasiado el banco: pasar de 45 grados carga más el hombro. Quedate entre 30 y 40.",
      "Olvidarte de trabar la barra al terminar: girá las muñecas para engancharla.",
    ],
    tip: "La barra va guiada por rieles, así que es más estable. Regulá los topes de seguridad antes de empezar.",
  },

  "Press declinado en Smith": {
    setup: "Acostate en un banco declinado, con la cabeza más baja que los pies, debajo de la barra de la Smith. Trabá bien las piernas y agarrá la barra apenas más ancho que los hombros.",
    steps: [
      "Apretá los omóplatos contra el banco y destrabá la barra girando las muñecas.",
      "Bajá la barra con control hasta la parte baja del pecho.",
      "Empujá hacia arriba hasta estirar los brazos.",
      "Al terminar, girá las muñecas para trabar la barra en los ganchos.",
    ],
    breath: BENCH_BREATH,
    mistakes: [
      "Olvidarte de trabar la barra al terminar: girá las muñecas para engancharla.",
      "Rebotar la barra en el pecho: frenala un instante y subí sin impulso.",
      "Usar demasiado peso: empezá liviano, la posición exige más control.",
    ],
    tip: "La cabeza queda abajo y sube la presión en la cara. Si tenés presión alta o mareos, consultá antes.",
  },
};
