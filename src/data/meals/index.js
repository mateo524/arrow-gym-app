// Catálogo curado de comidas completas por momento del día. Cada archivo meals-*.js exporta MEALS (formato en mealRules.js).
const modules = import.meta.glob("./meals-*.js", { eager: true });

export const ALL_MEALS = Object.keys(modules)
  .sort()
  .flatMap((path) => modules[path].MEALS || []);
