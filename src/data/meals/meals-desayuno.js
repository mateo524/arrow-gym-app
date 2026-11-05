// Catálogo curado de DESAYUNOS y MERIENDAS (comidas completas, estilo argentino).
// Cada comida: slots válidos, etiquetas de dieta que CUMPLE, alérgenos que CONTIENE,
// tiempo de preparación, costo e ingredientes (nombres exactos de FOOD_DB, g/ml base,
// min/max de porción y, opcionalmente, un ingrediente `flex` por rol: carb | protein | fat).
// Criterio conservador: avena, granola, muesli y barritas se marcan con gluten (contaminación)
// y NUNCA como sin_gluten; pan lactal/medialunas/budines/panqueques incluyen lácteos y huevo.

export const MEALS = [
  // ───────────── TOSTADAS, PAN Y UNTABLES ─────────────
  { id: "des-tostadas-queso-crema", name: "Tostadas con queso crema y mermelada + café con leche",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Pan lactal integral", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Queso crema", g: 20, min: 10, max: 40 },
      { food: "Mermelada", g: 15, min: 10, max: 30 },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-tostadas-palta-tomate-soja", name: "Tostadas con palta y tomate + latte de soja",
    slots: ["desayuno", "merienda"], diet: ["vegano", "vegetariano", "sin_lacteos"], contains: ["gluten", "soja"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Palta (aguacate)", g: 50, min: 30, max: 75 },
      { food: "Tomate", g: 60, min: 40, max: 120 },
      { food: "Leche de soja original", g: 200, min: 150, max: 250 } ] },

  { id: "des-tostadas-huevo-palta", name: "Tostadas con huevo y palta + mate cocido",
    slots: ["desayuno"], diet: ["vegetariano", "sin_lacteos"], contains: ["gluten", "huevo"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Huevo entero", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Palta (aguacate)", g: 50, min: 30, max: 75 },
      { food: "Mate cocido (sin azúcar)", g: 200, min: 150, max: 300 } ] },

  { id: "des-tostadas-ricota-tomate", name: "Tostadas con ricota y tomate + té",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Ricota", g: 60, min: 40, max: 120, flex: "protein" },
      { food: "Tomate", g: 60, min: 40, max: 120 },
      { food: "Té negro (sin azúcar)", g: 240, min: 200, max: 300 } ] },

  { id: "des-tostadas-queso-fresco-membrillo", name: "Tostadas con queso fresco y dulce de membrillo + mate cocido",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Queso fresco", g: 60, min: 40, max: 120, flex: "protein" },
      { food: "Dulce de membrillo", g: 30, min: 20, max: 40 },
      { food: "Mate cocido (sin azúcar)", g: 200, min: 150, max: 300 } ] },

  { id: "des-mate-tostadas-manteca-mermelada", name: "Mate con tostadas con manteca y mermelada",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Mate (sin azúcar)", g: 500, min: 250, max: 1000 },
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Manteca", g: 10, min: 5, max: 15 },
      { food: "Mermelada", g: 20, min: 10, max: 30 } ] },

  { id: "des-cafe-leche-tostadas-dulce-leche", name: "Café con leche con tostadas y dulce de leche",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Café con leche", g: 250, min: 200, max: 300 },
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Dulce de leche", g: 20, min: 10, max: 30 } ] },

  { id: "des-tostadas-mani-banana-soja", name: "Tostadas con mantequilla de maní y banana + leche de soja",
    slots: ["desayuno", "merienda"], diet: ["vegano", "vegetariano", "sin_lacteos"], contains: ["gluten", "mani", "frutos_secos", "soja"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Tostadas", g: 39, min: 26, max: 78, flex: "carb" },
      { food: "Mantequilla de maní", g: 15, min: 10, max: 30 },
      { food: "Banana", g: 60, min: 40, max: 120 },
      { food: "Leche de soja original", g: 250, min: 200, max: 300 } ] },

  { id: "des-tostadas-mani-mermelada-leche", name: "Tostadas con mantequilla de maní y mermelada + leche descremada",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos", "mani", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Pan lactal integral", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Mantequilla de maní", g: 15, min: 10, max: 30 },
      { food: "Mermelada", g: 15, min: 10, max: 30 },
      { food: "Leche descremada", g: 250, min: 200, max: 300 } ] },

  { id: "des-tostadas-mantequilla-almendras", name: "Tostadas con mantequilla de almendras y mermelada + té",
    slots: ["desayuno", "merienda"], diet: ["vegano", "vegetariano", "sin_lacteos"], contains: ["gluten", "frutos_secos"],
    prep: "rapido", cost: "alto",
    items: [
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Mantequilla de almendras", g: 16, min: 10, max: 32 },
      { food: "Mermelada", g: 15, min: 10, max: 30 },
      { food: "Té negro (sin azúcar)", g: 240, min: 200, max: 300 } ] },

  { id: "des-pan-frances-queso-crema", name: "Pan francés con queso crema y mermelada + café con leche",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Pan francés", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Queso crema", g: 20, min: 10, max: 40 },
      { food: "Mermelada", g: 15, min: 10, max: 30 },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-tostadas-integrales-queso-tomate", name: "Tostadas de pan integral con queso port salut y tomate + café con leche",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Pan integral", g: 60, min: 30, max: 120, flex: "carb" },
      { food: "Queso port salut", g: 30, min: 30, max: 60 },
      { food: "Tomate", g: 60, min: 40, max: 120 },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-mate-cocido-tostadas-port-salut", name: "Mate cocido con leche y tostadas con queso port salut",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Mate cocido (sin azúcar)", g: 200, min: 150, max: 300 },
      { food: "Leche descremada", g: 100, min: 50, max: 150 },
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Queso port salut", g: 30, min: 30, max: 60 } ] },

  { id: "des-ricota-miel-nueces-tostadas", name: "Tostadas con ricota, miel y nueces + café negro",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Tostadas", g: 26, min: 26, max: 78, flex: "carb" },
      { food: "Ricota", g: 80, min: 50, max: 140, flex: "protein" },
      { food: "Miel", g: 10, min: 5, max: 20 },
      { food: "Nueces", g: 10, min: 5, max: 20 },
      { food: "Café negro (sin azúcar)", g: 200, min: 150, max: 250 } ] },

  { id: "des-cacao-tostadas-queso-crema-light", name: "Cacao con leche y tostadas con queso crema light",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Cacao (con leche)", g: 250, min: 200, max: 300 },
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Queso crema light (untable)", g: 30, min: 15, max: 45 } ] },

  // ───────────── TOSTADOS, SÁNDWICHES Y FIAMBRES LIVIANOS ─────────────
  { id: "des-tostado-jamon-queso-cafe", name: "Tostado de jamón y queso + café con leche",
    slots: ["desayuno", "merienda"], diet: [], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Pan lactal blanco", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Jamón cocido", g: 40, min: 20, max: 60 },
      { food: "Queso port salut", g: 30, min: 30, max: 60 },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-pan-arabe-jamon-tomate", name: "Pan árabe con jamón cocido, queso crema light y tomate + café negro",
    slots: ["desayuno", "merienda"], diet: [], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Pan árabe integral", g: 64, min: 32, max: 128, flex: "carb" },
      { food: "Jamón cocido", g: 40, min: 20, max: 80, flex: "protein" },
      { food: "Queso crema light (untable)", g: 30, min: 15, max: 45 },
      { food: "Tomate", g: 60, min: 40, max: 120 },
      { food: "Café negro (sin azúcar)", g: 200, min: 150, max: 250 } ] },

  { id: "des-muffin-mozzarella-tomate", name: "Muffin inglés integral con mozzarella y tomate + té",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Muffin inglés integral", g: 57, min: 57, max: 114, flex: "carb" },
      { food: "Queso mozzarella", g: 50, min: 30, max: 80, flex: "protein" },
      { food: "Tomate", g: 60, min: 40, max: 120 },
      { food: "Té negro (sin azúcar)", g: 240, min: 200, max: 300 } ] },

  { id: "des-sandwich-miga-te", name: "Sándwiches de miga de jamón y queso + té",
    slots: ["merienda"], diet: [], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Sándwich de miga (jamón y queso)", g: 120, min: 60, max: 180, flex: "carb" },
      { food: "Té negro (sin azúcar)", g: 240, min: 200, max: 300 } ] },

  { id: "des-medialuna-jamon-queso-cafe", name: "Medialuna de jamón y queso + café con leche",
    slots: ["desayuno", "merienda"], diet: [], contains: ["gluten", "lacteos", "huevo"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Medialuna de jamón y queso", g: 90, min: 90, max: 180, flex: "carb" },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  // ───────────── HUEVOS ─────────────
  { id: "des-huevos-revueltos-tostadas", name: "Huevos revueltos con tostadas + café con leche",
    slots: ["desayuno"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Revuelto de huevo (2)", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-huevo-duro-tostadas-tomate", name: "Huevo duro con tostadas y tomate + café con leche",
    slots: ["desayuno"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Huevo duro", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Tomate", g: 60, min: 40, max: 120 },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-huevos-revueltos-jamon-tostadas", name: "Huevos revueltos con jamón y tostadas + té",
    slots: ["desayuno"], diet: [], contains: ["gluten", "huevo"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Huevo entero", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Jamón cocido", g: 40, min: 20, max: 60 },
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Té negro (sin azúcar)", g: 240, min: 200, max: 300 } ] },

  // ───────────── YOGUR Y CEREALES ─────────────
  { id: "des-yogur-griego-granola-frutillas", name: "Yogur griego con granola y frutillas",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Yogur griego natural descremado", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Granola", g: 30, min: 20, max: 60, flex: "carb" },
      { food: "Frutillas", g: 100, min: 60, max: 150 } ] },

  { id: "des-yogur-banana-avena", name: "Yogur natural con banana y avena",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Yogur natural descremado", g: 190, min: 150, max: 285 },
      { food: "Banana", g: 60, min: 40, max: 120 },
      { food: "Avena (seca)", g: 25, min: 15, max: 60, flex: "carb" } ] },

  { id: "des-yogur-muesli-manzana", name: "Yogur con muesli y manzana",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Yogur natural parcialmente descremado", g: 190, min: 150, max: 285 },
      { food: "Muesli", g: 40, min: 20, max: 80, flex: "carb" },
      { food: "Manzana", g: 150, min: 75, max: 150 } ] },

  { id: "des-yogur-griego-nueces-frutillas", name: "Yogur griego con nueces, miel y frutillas",
    slots: ["desayuno", "merienda"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Yogur griego entero", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Nueces", g: 15, min: 10, max: 30, flex: "fat" },
      { food: "Miel", g: 10, min: 5, max: 20 },
      { food: "Frutillas", g: 75, min: 50, max: 150 } ] },

  { id: "des-yogur-griego-chia-almendras", name: "Yogur griego con chía, frutillas y almendras",
    slots: ["desayuno", "merienda"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Yogur griego natural descremado", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Semillas de chía", g: 15, min: 10, max: 30 },
      { food: "Frutillas", g: 100, min: 60, max: 150 },
      { food: "Almendras", g: 15, min: 10, max: 30, flex: "fat" } ] },

  { id: "des-ensalada-frutas-yogur-nueces", name: "Ensalada de frutas con yogur griego y nueces",
    slots: ["desayuno", "merienda"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Banana", g: 60, min: 40, max: 120 },
      { food: "Manzana", g: 75, min: 50, max: 150 },
      { food: "Naranja", g: 65, min: 50, max: 130 },
      { food: "Yogur griego natural descremado", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Nueces", g: 10, min: 5, max: 20, flex: "fat" } ] },

  { id: "des-banana-mani-yogur-griego", name: "Banana con mantequilla de maní y yogur griego",
    slots: ["desayuno", "merienda"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos", "mani", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Banana", g: 120, min: 60, max: 120 },
      { food: "Mantequilla de maní", g: 15, min: 10, max: 30 },
      { food: "Yogur griego natural descremado", g: 150, min: 100, max: 250, flex: "protein" } ] },

  { id: "des-bran-flakes-leche-arandanos", name: "Cereal de salvado con leche descremada y arándanos",
    slots: ["desayuno"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Cereal de salvado (bran flakes)", g: 50, min: 30, max: 90, flex: "carb" },
      { food: "Leche descremada", g: 250, min: 200, max: 300 },
      { food: "Arándanos", g: 50, min: 30, max: 80 } ] },

  { id: "des-granola-leche-soja-frutillas", name: "Granola con leche de soja y frutillas",
    slots: ["desayuno"], diet: ["vegetariano", "sin_lacteos"], contains: ["gluten", "frutos_secos", "soja"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Granola", g: 50, min: 30, max: 90, flex: "carb" },
      { food: "Leche de soja original", g: 200, min: 150, max: 250 },
      { food: "Frutillas", g: 100, min: 60, max: 150 } ] },

  { id: "des-barrita-cereal-yogur", name: "Yogur natural con barrita de cereal",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos", "frutos_secos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Yogur natural descremado", g: 190, min: 150, max: 285, flex: "protein" },
      { food: "Barritas de cereal", g: 30, min: 30, max: 60 } ] },

  // ───────────── AVENA ─────────────
  { id: "des-avena-leche-banana", name: "Avena cocida con leche y banana",
    slots: ["desayuno"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Avena (seca)", g: 40, min: 25, max: 80, flex: "carb" },
      { food: "Leche entera", g: 250, min: 200, max: 300 },
      { food: "Banana", g: 60, min: 40, max: 120 } ] },

  { id: "des-avena-soja-banana-chia", name: "Avena con leche de soja, banana y chía",
    slots: ["desayuno"], diet: ["vegano", "vegetariano", "sin_lacteos"], contains: ["gluten", "soja"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Avena (seca)", g: 40, min: 25, max: 80, flex: "carb" },
      { food: "Leche de soja original", g: 250, min: 200, max: 300 },
      { food: "Banana", g: 60, min: 40, max: 120 },
      { food: "Semillas de chía", g: 10, min: 5, max: 20 } ] },

  { id: "des-avena-manzana-nueces", name: "Avena con leche, manzana y nueces",
    slots: ["desayuno"], diet: ["vegetariano"], contains: ["gluten", "lacteos", "frutos_secos"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Avena (seca)", g: 40, min: 25, max: 80, flex: "carb" },
      { food: "Leche descremada", g: 200, min: 150, max: 250 },
      { food: "Manzana", g: 100, min: 75, max: 150 },
      { food: "Nueces", g: 10, min: 5, max: 20, flex: "fat" } ] },

  // ───────────── LICUADOS ─────────────
  { id: "des-licuado-banana-whey", name: "Licuado de banana con leche descremada y proteína",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["lacteos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Banana", g: 120, min: 60, max: 120 },
      { food: "Leche descremada", g: 250, min: 200, max: 300 },
      { food: "Whey protein", g: 20, min: 15, max: 40, flex: "protein" } ] },

  { id: "des-licuado-frutilla-yogur", name: "Licuado de frutilla con yogur y banana",
    slots: ["desayuno", "merienda"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Yogur natural descremado", g: 190, min: 150, max: 285, flex: "protein" },
      { food: "Frutillas", g: 150, min: 100, max: 200 },
      { food: "Banana", g: 90, min: 60, max: 120 },
      { food: "Leche descremada", g: 150, min: 100, max: 200 } ] },

  { id: "des-licuado-vegano-proteina", name: "Licuado vegano de banana con leche de soja y proteína vegetal",
    slots: ["desayuno", "merienda"], diet: ["vegano", "vegetariano", "sin_lacteos"], contains: ["soja"],
    prep: "rapido", cost: "alto",
    items: [
      { food: "Banana", g: 120, min: 60, max: 120 },
      { food: "Leche de soja original", g: 250, min: 200, max: 300 },
      { food: "Proteína vegana", g: 30, min: 20, max: 45, flex: "protein" } ] },

  { id: "des-licuado-mani-banana", name: "Licuado de banana con mantequilla de maní y leche",
    slots: ["desayuno", "merienda"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos", "mani", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Banana", g: 120, min: 60, max: 120 },
      { food: "Leche descremada", g: 250, min: 200, max: 300 },
      { food: "Mantequilla de maní", g: 15, min: 10, max: 30, flex: "fat" } ] },

  { id: "des-smoothie-mango-yogur-griego", name: "Smoothie de mango con yogur griego",
    slots: ["desayuno", "merienda"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Mango", g: 150, min: 100, max: 200 },
      { food: "Yogur griego natural descremado", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Leche descremada", g: 150, min: 100, max: 200 } ] },

  { id: "des-pudding-chia-soja-frutillas", name: "Pudding de chía con leche de soja y frutillas",
    slots: ["desayuno", "merienda"], diet: ["vegano", "vegetariano", "sin_lacteos", "sin_gluten"], contains: ["soja"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Semillas de chía", g: 30, min: 15, max: 45 },
      { food: "Leche de soja original", g: 200, min: 150, max: 250, flex: "protein" },
      { food: "Frutillas", g: 100, min: 60, max: 150 } ] },

  // ───────────── PANQUEQUES, WAFFLES ─────────────
  { id: "des-panqueques-dulce-leche", name: "Panqueques con dulce de leche + café con leche",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Panqueques", g: 100, min: 50, max: 150, flex: "carb" },
      { food: "Dulce de leche", g: 20, min: 10, max: 30 },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-panqueques-ricota-frutillas", name: "Panqueques con ricota y frutillas + café negro",
    slots: ["desayuno"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Panqueques", g: 100, min: 50, max: 150, flex: "carb" },
      { food: "Ricota", g: 60, min: 40, max: 120, flex: "protein" },
      { food: "Frutillas", g: 100, min: 60, max: 150 },
      { food: "Café negro (sin azúcar)", g: 200, min: 150, max: 250 } ] },

  { id: "des-waffle-yogur-frutillas", name: "Waffle con yogur griego y frutillas",
    slots: ["desayuno"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Waffles", g: 60, min: 60, max: 120, flex: "carb" },
      { food: "Yogur griego natural descremado", g: 100, min: 75, max: 200, flex: "protein" },
      { food: "Frutillas", g: 80, min: 50, max: 150 } ] },

  // ───────────── BUDÍN, TORTA CASERA, FACTURAS ─────────────
  { id: "des-budin-cafe-con-leche", name: "Budín inglés con café con leche",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Budín inglés (1 feta)", g: 40, min: 40, max: 80, flex: "carb" },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-torta-naranja-cafe-con-leche", name: "Torta de naranja casera con café con leche",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Torta de naranja (porción)", g: 60, min: 40, max: 100, flex: "carb" },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-alfajor-maicena-cafe-con-leche", name: "Alfajor de maicena con café con leche",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Alfajor de maicena", g: 50, min: 50, max: 100, flex: "carb" },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-bizcochuelo-yogur-frutillas", name: "Bizcochuelo con yogur griego y frutillas",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Bizcochuelo (porción)", g: 50, min: 35, max: 100, flex: "carb" },
      { food: "Yogur griego natural descremado", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Frutillas", g: 100, min: 60, max: 150 } ] },

  { id: "des-medialuna-manteca-cafe-con-leche", name: "Medialuna de manteca con café con leche",
    slots: ["desayuno", "merienda"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Medialunas de manteca", g: 50, min: 50, max: 100, flex: "carb" },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] },

  { id: "des-factura-cafe-con-leche", name: "Café con leche con una factura",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Café con leche", g: 250, min: 200, max: 300 },
      { food: "Facturas (promedio)", g: 60, min: 60, max: 120, flex: "carb" } ] },

  { id: "des-bizcochitos-grasa-mate-queso", name: "Mate con bizcochitos de grasa y queso port salut",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Mate (sin azúcar)", g: 500, min: 250, max: 1000 },
      { food: "Bizcocho de grasa", g: 40, min: 20, max: 80, flex: "carb" },
      { food: "Queso port salut", g: 30, min: 30, max: 60 } ] },

  { id: "des-chocolatada-galletitas", name: "Leche chocolatada con galletitas dulces",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Leche chocolatada", g: 250, min: 200, max: 300 },
      { food: "Galletitas dulces tipo leche", g: 33, min: 33, max: 100, flex: "carb" } ] },

  // ───────────── GALLETITAS, QUESOS BLANDOS, FRUTA Y FRUTOS SECOS ─────────────
  { id: "des-galletitas-integrales-ricota-durazno", name: "Galletitas integrales con ricota y durazno + té",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Galletitas integrales", g: 30, min: 30, max: 90, flex: "carb" },
      { food: "Ricota", g: 60, min: 40, max: 120, flex: "protein" },
      { food: "Durazno", g: 130, min: 100, max: 195 },
      { food: "Té verde (sin azúcar)", g: 240, min: 200, max: 300 } ] },

  { id: "des-melba-mani-banana", name: "Tostadas Melba con mantequilla de maní y banana + té",
    slots: ["merienda"], diet: ["vegano", "vegetariano", "sin_lacteos"], contains: ["gluten", "mani", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Tostadas tipo Melba", g: 30, min: 15, max: 60, flex: "carb" },
      { food: "Mantequilla de maní", g: 20, min: 10, max: 30 },
      { food: "Banana", g: 60, min: 40, max: 120 },
      { food: "Té negro (sin azúcar)", g: 240, min: 200, max: 300 } ] },

  { id: "des-galletitas-integrales-queso-fresco", name: "Té con leche y galletitas integrales con queso fresco",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Té negro (sin azúcar)", g: 200, min: 150, max: 250 },
      { food: "Leche descremada", g: 100, min: 50, max: 150 },
      { food: "Galletitas integrales", g: 30, min: 30, max: 90, flex: "carb" },
      { food: "Queso fresco", g: 60, min: 40, max: 120, flex: "protein" } ] },

  { id: "des-manzana-frutos-secos", name: "Manzana con almendras y nueces + mate cocido",
    slots: ["merienda"], diet: ["vegano", "vegetariano", "sin_lacteos", "sin_gluten"], contains: ["frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Manzana", g: 150, min: 75, max: 150 },
      { food: "Almendras", g: 25, min: 10, max: 40, flex: "fat" },
      { food: "Nueces", g: 10, min: 5, max: 20 },
      { food: "Mate cocido (sin azúcar)", g: 200, min: 150, max: 300 } ] },

  { id: "des-vigilante-queso-membrillo", name: "Queso fresco con dulce de membrillo (vigilante) + té",
    slots: ["merienda"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Queso fresco", g: 80, min: 40, max: 150, flex: "protein" },
      { food: "Dulce de membrillo", g: 40, min: 20, max: 60 },
      { food: "Té negro (sin azúcar)", g: 240, min: 200, max: 300 } ] },

  { id: "des-queso-blanco-durazno-nueces", name: "Queso blanco descremado con durazno y nueces",
    slots: ["desayuno", "merienda"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos", "frutos_secos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Queso blanco descremado", g: 200, min: 100, max: 300, flex: "protein" },
      { food: "Durazno", g: 130, min: 100, max: 195 },
      { food: "Nueces", g: 15, min: 5, max: 30, flex: "fat" } ] },

  { id: "des-budin-pan-cafe-con-leche", name: "Budín de pan casero con café con leche",
    slots: ["merienda"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Budín de pan", g: 100, min: 60, max: 150, flex: "carb" },
      { food: "Café con leche", g: 250, min: 200, max: 300 } ] }
];
