// Arrow Gym — UI kit seed data (mirrors src/data + store shapes, trimmed)
// Routines, exercises, sample workouts and coach scores for the click-thru demo.

window.AG_DATA = (function () {
  const ROUTINES = {
    Push:        { icon: "💪", muscles: "Pecho · Hombro · Tríceps", count: 6 },
    Pull:        { icon: "🔙", muscles: "Espalda · Bíceps", count: 6 },
    Legs:        { icon: "🦵", muscles: "Cuádriceps · Isquios · Glúteos", count: 6 },
    "Full Body": { icon: "🔥", muscles: "Cuerpo completo", count: 7 },
  };

  const CARDIO = {
    Bicicleta: { icon: "🚴", note: "4 fases · 25–60 min" },
    Boxeo:     { icon: "🥊", note: "5 rounds · 30 min" },
  };

  // Exercise bank sample (group · muscle · equipment)
  const BANK = [
    { name: "Chest Press Machine", group: "Pecho", muscle: "Pectoral mayor", equip: "Máquina" },
    { name: "Incline Chest Press Machine", group: "Pecho", muscle: "Pectoral superior", equip: "Máquina" },
    { name: "Landmine Shoulder Press", group: "Hombros", muscle: "Deltoide anterior", equip: "Landmine" },
    { name: "Cable Lateral Raise", group: "Hombros", muscle: "Deltoide lateral", equip: "Polea" },
    { name: "Cable Face Pull", group: "Hombros", muscle: "Deltoide posterior", equip: "Polea" },
    { name: "Triceps Pushdown", group: "Brazos", muscle: "Tríceps", equip: "Polea" },
    { name: "Lat Pulldown", group: "Espalda", muscle: "Dorsales", equip: "Máquina" },
    { name: "Seated Row", group: "Espalda", muscle: "Romboides", equip: "Máquina" },
    { name: "Dumbbell Row", group: "Espalda", muscle: "Dorsales", equip: "Mancuernas" },
    { name: "Hammer Curl", group: "Brazos", muscle: "Braquial", equip: "Mancuernas" },
    { name: "Leg Extension", group: "Piernas", muscle: "Cuádriceps", equip: "Máquina" },
    { name: "Romanian Deadlift", group: "Piernas", muscle: "Isquios", equip: "Barra" },
    { name: "Bulgarian Split Squat", group: "Piernas", muscle: "Glúteos", equip: "Mancuernas" },
    { name: "Calf Raise", group: "Piernas", muscle: "Gemelos", equip: "Máquina" },
    { name: "Pallof Press", group: "Core", muscle: "Transverso", equip: "Polea" },
    { name: "Plank", group: "Core", muscle: "Transverso", equip: "Peso corporal" },
  ];

  const GROUPS = ["Todos", "Hombros", "Pecho", "Espalda", "Brazos", "Piernas", "Core", "Cardio"];

  // The active workout shown in the Workout screen
  const ACTIVE = {
    type: "Push",
    date: "2026-06-04",
    exercises: [
      {
        name: "Chest Press Machine", group: "Pecho", muscle: "Pectoral mayor",
        last: { weight: 75, reps: 10, sets: 3, date: "05-28" },
        sets: [
          { id: 1, weight: 80, reps: 10, rpe: 8 },
          { id: 2, weight: 80, reps: 9, rpe: 8.5 },
          { id: 3, weight: 77.5, reps: 9, rpe: 9 },
        ],
      },
      {
        name: "Landmine Shoulder Press", group: "Hombros", muscle: "Deltoide anterior",
        last: { weight: 40, reps: 12, sets: 3, date: "05-28" },
        sets: [
          { id: 4, weight: 42.5, reps: 11, rpe: 8 },
          { id: 5, weight: 42.5, reps: 10, rir: 2 },
        ],
      },
    ],
  };

  // Coach scores (0–100)
  const SCORES = [
    { v: 82, label: "Muscle Gain" },
    { v: 64, label: "Fat Loss" },
    { v: 54, label: "Recuperación" },
    { v: 71, label: "Hombro" },
    { v: 78, label: "Cardio" },
    { v: 88, label: "Consistencia" },
    { v: 46, label: "Balance" },
    { v: 80, label: "Upper" },
  ];

  // Muscle-map intensity 0–4 per group (front/back schematic)
  const INTENSITY = {
    Pecho: 4, Hombros: 3, Brazos: 3, Core: 2,
    Espalda: 3, Piernas: 1, Glúteos: 1, Gemelos: 1,
  };

  // Radar: 6 axes 0–100
  const RADAR = [
    { axis: "Hombros", v: 72 }, { axis: "Pecho", v: 88 }, { axis: "Espalda", v: 64 },
    { axis: "Brazos", v: 70 }, { axis: "Piernas", v: 40 }, { axis: "Core", v: 55 },
  ];

  // Group distribution (Progress)
  const GROUP_TOTALS = [
    { group: "Pecho", sets: 38, ex: "Chest Press, Incline Press" },
    { group: "Espalda", sets: 32, ex: "Lat Pulldown, Seated Row" },
    { group: "Piernas", sets: 24, ex: "Leg Extension, RDL" },
    { group: "Hombros", sets: 22, ex: "Landmine Press, Lateral Raise" },
    { group: "Brazos", sets: 18, ex: "Hammer Curl, Pushdown" },
    { group: "Core", sets: 9, ex: "Plank, Pallof Press" },
  ];

  const ONE_RM = [
    { name: "Chest Press Machine", set: "80kg × 10", rm: 107 },
    { name: "Romanian Deadlift", set: "100kg × 8", rm: 127 },
    { name: "Lat Pulldown", set: "75kg × 9", rm: 98 },
    { name: "Landmine Shoulder Press", set: "42.5kg × 11", rm: 58 },
  ];

  const WEEKLY_VOL = [42, 55, 48, 70, 62, 88, 76]; // % heights

  const CALENDAR = { // day -> intensity (0 none, 1 light, 2 trained)
    trained: [2, 4, 5, 8, 10, 12, 15, 17, 18, 22, 24, 26, 29, 31],
    light: [6, 13, 20, 27],
    today: 4,
  };

  return { ROUTINES, CARDIO, BANK, GROUPS, ACTIVE, SCORES, INTENSITY, RADAR,
           GROUP_TOTALS, ONE_RM, WEEKLY_VOL, CALENDAR };
})();
