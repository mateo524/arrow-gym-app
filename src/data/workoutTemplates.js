export const WORKOUT_TEMPLATES = [
  {
    id: "ppl",
    name: "Push Pull Legs (PPL)",
    description:
      "Programa de 6 días que divide el entrenamiento en empuje, jalón y piernas. Ideal para intermedios que quieren mayor frecuencia y volumen.",
    difficulty: "Intermedio",
    days: 6,
    exercises_per_day: 5,
    routines: [
      {
        name: "Push A",
        exercises: [
          { name: "Press de banca", sets: 4, reps: "8-12" },
          { name: "Press militar", sets: 4, reps: "8-12" },
          { name: "Fondos en paralelas", sets: 3, reps: "10-12" },
          { name: "Extensión de tríceps en polea", sets: 3, reps: "10-15" },
          { name: "Elevaciones laterales", sets: 3, reps: "12-15" },
        ],
      },
      {
        name: "Pull A",
        exercises: [
          { name: "Dominadas", sets: 4, reps: "6-10" },
          { name: "Remo con barra", sets: 4, reps: "8-12" },
          { name: "Curl de bíceps con barra", sets: 3, reps: "10-12" },
          { name: "Face pulls", sets: 3, reps: "15-20" },
          { name: "Remo en polea baja", sets: 3, reps: "10-12" },
        ],
      },
      {
        name: "Legs A",
        exercises: [
          { name: "Sentadilla", sets: 4, reps: "8-12" },
          { name: "Prensa de piernas", sets: 3, reps: "10-15" },
          { name: "Extensión de cuádriceps", sets: 3, reps: "12-15" },
          { name: "Curl femoral acostado", sets: 3, reps: "10-12" },
          { name: "Elevación de pantorrillas de pie", sets: 4, reps: "15-20" },
        ],
      },
      {
        name: "Push B",
        exercises: [
          { name: "Press de banca inclinado", sets: 4, reps: "8-12" },
          { name: "Press con mancuernas", sets: 3, reps: "10-12" },
          { name: "Aperturas en polea alta", sets: 3, reps: "12-15" },
          { name: "Press francés con barra EZ", sets: 3, reps: "10-12" },
          { name: "Elevaciones frontales", sets: 3, reps: "12-15" },
        ],
      },
      {
        name: "Pull B",
        exercises: [
          { name: "Jalón al pecho en polea", sets: 4, reps: "8-12" },
          { name: "Remo con mancuerna unilateral", sets: 4, reps: "10-12" },
          { name: "Curl martillo", sets: 3, reps: "10-12" },
          { name: "Remo en máquina", sets: 3, reps: "10-12" },
          { name: "Curl concentrado", sets: 3, reps: "12-15" },
        ],
      },
      {
        name: "Legs B",
        exercises: [
          { name: "Sentadilla búlgara", sets: 4, reps: "8-10" },
          { name: "Peso muerto rumano", sets: 4, reps: "8-12" },
          { name: "Estocadas con mancuernas", sets: 3, reps: "10-12" },
          { name: "Curl femoral sentado", sets: 3, reps: "10-15" },
          { name: "Elevación de pantorrillas sentado", sets: 4, reps: "15-20" },
        ],
      },
    ],
  },
  {
    id: "stronglifts-5x5",
    name: "5x5 StrongLifts",
    description:
      "Programa de fuerza de 3 días basado en movimientos compuestos pesados. Perfecto para principiantes que quieren ganar fuerza y masa muscular rápidamente.",
    difficulty: "Principiante",
    days: 3,
    exercises_per_day: 3,
    routines: [
      {
        name: "Día A",
        exercises: [
          { name: "Sentadilla", sets: 5, reps: "5" },
          { name: "Press de banca", sets: 5, reps: "5" },
          { name: "Remo con barra Pendlay", sets: 5, reps: "5" },
        ],
      },
      {
        name: "Día B",
        exercises: [
          { name: "Sentadilla", sets: 5, reps: "5" },
          { name: "Press militar de pie", sets: 5, reps: "5" },
          { name: "Peso muerto", sets: 1, reps: "5" },
        ],
      },
    ],
  },
  {
    id: "arnold-split",
    name: "Arnold Split",
    description:
      "El programa de 6 días popularizado por Arnold Schwarzenegger. Combina grupos musculares grandes en cada sesión para un volumen muy alto. Solo para avanzados.",
    difficulty: "Avanzado",
    days: 6,
    exercises_per_day: 6,
    routines: [
      {
        name: "Pecho y Espalda A",
        exercises: [
          { name: "Press de banca con barra", sets: 4, reps: "8-12" },
          { name: "Dominadas", sets: 4, reps: "8-12" },
          { name: "Press inclinado con mancuernas", sets: 4, reps: "10-12" },
          { name: "Remo con barra", sets: 4, reps: "8-12" },
          { name: "Aperturas con mancuernas", sets: 3, reps: "12-15" },
          { name: "Pull-over con mancuerna", sets: 3, reps: "12-15" },
        ],
      },
      {
        name: "Hombros y Brazos A",
        exercises: [
          { name: "Press militar con barra", sets: 4, reps: "8-12" },
          { name: "Curl de bíceps con barra", sets: 4, reps: "8-12" },
          { name: "Elevaciones laterales", sets: 4, reps: "12-15" },
          { name: "Press francés con barra EZ", sets: 4, reps: "10-12" },
          { name: "Curl martillo con mancuernas", sets: 3, reps: "10-12" },
          { name: "Extensión de tríceps en polea", sets: 3, reps: "12-15" },
        ],
      },
      {
        name: "Piernas A",
        exercises: [
          { name: "Sentadilla con barra", sets: 5, reps: "8-12" },
          { name: "Prensa de piernas", sets: 4, reps: "10-15" },
          { name: "Extensión de cuádriceps", sets: 4, reps: "12-15" },
          { name: "Curl femoral acostado", sets: 4, reps: "10-12" },
          { name: "Elevación de pantorrillas de pie", sets: 5, reps: "15-20" },
          { name: "Sentadilla hack", sets: 3, reps: "10-12" },
        ],
      },
      {
        name: "Pecho y Espalda B",
        exercises: [
          { name: "Press de banca declinado", sets: 4, reps: "8-12" },
          { name: "Jalón al pecho en polea", sets: 4, reps: "8-12" },
          { name: "Fondos en paralelas", sets: 4, reps: "10-12" },
          { name: "Remo en polea baja sentado", sets: 4, reps: "10-12" },
          { name: "Cruces en polea", sets: 3, reps: "12-15" },
          { name: "Remo con mancuerna unilateral", sets: 3, reps: "10-12" },
        ],
      },
      {
        name: "Hombros y Brazos B",
        exercises: [
          { name: "Press Arnold con mancuernas", sets: 4, reps: "10-12" },
          { name: "Curl inclinado con mancuernas", sets: 4, reps: "10-12" },
          { name: "Elevaciones frontales", sets: 3, reps: "12-15" },
          { name: "Fondos en banco para tríceps", sets: 4, reps: "12-15" },
          { name: "Curl concentrado", sets: 3, reps: "12-15" },
          { name: "Patada de tríceps con mancuerna", sets: 3, reps: "12-15" },
        ],
      },
      {
        name: "Piernas B",
        exercises: [
          { name: "Sentadilla búlgara", sets: 4, reps: "8-10" },
          { name: "Peso muerto rumano", sets: 4, reps: "8-12" },
          { name: "Estocadas caminando", sets: 3, reps: "12-14" },
          { name: "Curl femoral sentado", sets: 4, reps: "10-15" },
          { name: "Elevación de pantorrillas sentado", sets: 5, reps: "15-20" },
          { name: "Peso muerto con piernas rígidas", sets: 3, reps: "10-12" },
        ],
      },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper/Lower Split",
    description:
      "División de 4 días entre tren superior e inferior. Gran opción para principiantes avanzados e intermedios que buscan frecuencia y volumen equilibrado.",
    difficulty: "Principiante",
    days: 4,
    exercises_per_day: 6,
    routines: [
      {
        name: "Upper A (Fuerza)",
        exercises: [
          { name: "Press de banca con barra", sets: 4, reps: "6-8" },
          { name: "Remo con barra", sets: 4, reps: "6-8" },
          { name: "Press militar con barra", sets: 3, reps: "8-10" },
          { name: "Dominadas lastradas", sets: 3, reps: "6-8" },
          { name: "Curl de bíceps con barra", sets: 3, reps: "8-10" },
          { name: "Extensión de tríceps en polea", sets: 3, reps: "8-10" },
        ],
      },
      {
        name: "Lower A (Fuerza)",
        exercises: [
          { name: "Sentadilla con barra", sets: 4, reps: "6-8" },
          { name: "Peso muerto rumano", sets: 4, reps: "6-8" },
          { name: "Extensión de cuádriceps", sets: 3, reps: "10-12" },
          { name: "Curl femoral acostado", sets: 3, reps: "10-12" },
          { name: "Elevación de pantorrillas de pie", sets: 4, reps: "10-15" },
          { name: "Hip thrust", sets: 3, reps: "10-12" },
        ],
      },
      {
        name: "Upper B (Hipertrofia)",
        exercises: [
          { name: "Press inclinado con mancuernas", sets: 4, reps: "10-12" },
          { name: "Remo en polea baja sentado", sets: 4, reps: "10-12" },
          { name: "Elevaciones laterales con mancuernas", sets: 3, reps: "12-15" },
          { name: "Jalón al pecho en polea", sets: 3, reps: "10-12" },
          { name: "Curl martillo con mancuernas", sets: 3, reps: "10-12" },
          { name: "Press francés con barra EZ", sets: 3, reps: "10-12" },
        ],
      },
      {
        name: "Lower B (Hipertrofia)",
        exercises: [
          { name: "Prensa de piernas", sets: 4, reps: "10-15" },
          { name: "Sentadilla búlgara", sets: 3, reps: "10-12" },
          { name: "Estocadas con mancuernas", sets: 3, reps: "10-12" },
          { name: "Curl femoral sentado", sets: 4, reps: "12-15" },
          { name: "Elevación de pantorrillas sentado", sets: 4, reps: "15-20" },
          { name: "Abducción de cadera en máquina", sets: 3, reps: "15-20" },
        ],
      },
    ],
  },
  {
    id: "full-body",
    name: "Full Body",
    description:
      "Programa de cuerpo completo de 3 días con movimientos compuestos fundamentales. Ideal para principiantes que quieren desarrollar una base sólida de fuerza y técnica.",
    difficulty: "Principiante",
    days: 3,
    exercises_per_day: 6,
    routines: [
      {
        name: "Full Body A",
        exercises: [
          { name: "Sentadilla con barra", sets: 3, reps: "8-12" },
          { name: "Press de banca con barra", sets: 3, reps: "8-12" },
          { name: "Remo con barra", sets: 3, reps: "8-12" },
          { name: "Press militar de pie", sets: 3, reps: "8-12" },
          { name: "Peso muerto", sets: 3, reps: "8-10" },
          { name: "Dominadas o jalón al pecho", sets: 3, reps: "8-12" },
        ],
      },
      {
        name: "Full Body B",
        exercises: [
          { name: "Sentadilla frontal o goblet", sets: 3, reps: "8-12" },
          { name: "Press inclinado con mancuernas", sets: 3, reps: "8-12" },
          { name: "Remo con mancuerna unilateral", sets: 3, reps: "8-12" },
          { name: "Press Arnold con mancuernas", sets: 3, reps: "10-12" },
          { name: "Peso muerto rumano", sets: 3, reps: "8-12" },
          { name: "Fondos en paralelas", sets: 3, reps: "8-12" },
        ],
      },
      {
        name: "Full Body C",
        exercises: [
          { name: "Prensa de piernas", sets: 3, reps: "10-12" },
          { name: "Press de banca con mancuernas", sets: 3, reps: "10-12" },
          { name: "Jalón al pecho en polea", sets: 3, reps: "10-12" },
          { name: "Elevaciones laterales", sets: 3, reps: "12-15" },
          { name: "Estocadas con mancuernas", sets: 3, reps: "10-12" },
          { name: "Remo en polea baja", sets: 3, reps: "10-12" },
        ],
      },
    ],
  },
];
