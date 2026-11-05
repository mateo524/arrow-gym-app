// Catálogo curado: almuerzos y cenas vegetarianos, veganos, con legumbres, pastas, tartas, huevos, sopas y ensaladas completas.
// Cada comida es un plato completo; el armador solo escala los ingredientes con `flex` (uno por rol como máximo).
// Los nombres de `food` coinciden exactamente con los de foodDatabase.js.

export const MEALS = [
  // ───────────── LEGUMBRES Y GRANOS (muchas veganas) ─────────────
  { id: "alm-lentejas-arroz-verdura", name: "Lentejas con arroz y verduras salteadas",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Lentejas cocidas", g: 220, min: 130, max: 340, flex: "protein" },
      { food: "Arroz blanco cocido", g: 130, min: 60, max: 220, flex: "carb" },
      { food: "Zucchini / Calabacín", g: 120, min: 72, max: 180 },
      { food: "Cebolla", g: 50, min: 30, max: 75 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 15, flex: "fat" } ] },

  { id: "alm-guiso-lentejas-verduras", name: "Guiso de lentejas con papa y verduras",
    slots: ["almuerzo"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Lentejas cocidas", g: 260, min: 160, max: 400, flex: "protein" },
      { food: "Papa hervida", g: 130, min: 60, max: 220 },
      { food: "Zanahoria", g: 80, min: 48, max: 120 },
      { food: "Cebolla", g: 60, min: 36, max: 90 },
      { food: "Pimiento rojo", g: 60, min: 36, max: 90 },
      { food: "Salsa de tomate casera", g: 80, min: 48, max: 120 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 15, flex: "fat" } ] },

  { id: "alm-garbanzos-espinaca-arroz", name: "Garbanzos con espinaca y arroz integral",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Garbanzos cocidos", g: 200, min: 120, max: 300, flex: "protein" },
      { food: "Arroz integral cocido", g: 110, min: 60, max: 200, flex: "carb" },
      { food: "Espinaca cocida", g: 150, min: 90, max: 225 },
      { food: "Cebolla", g: 50, min: 30, max: 75 },
      { food: "Tomate", g: 100, min: 60, max: 150 },
      { food: "Aceite de oliva", g: 10, min: 5, max: 15, flex: "fat" } ] },

  { id: "alm-porotos-negros-quinoa", name: "Porotos negros con quinoa y verduras",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "medio", cost: "medio",
    items: [
      { food: "Porotos negros cocidos", g: 200, min: 120, max: 300, flex: "protein" },
      { food: "Quinoa cocida", g: 100, min: 60, max: 200, flex: "carb" },
      { food: "Pimiento rojo", g: 80, min: 48, max: 120 },
      { food: "Choclo cocido", g: 80, min: 48, max: 120 },
      { food: "Cebolla", g: 40, min: 24, max: 60 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 15, flex: "fat" } ] },

  { id: "alm-guiso-porotos-zapallo", name: "Guiso de porotos colorados con zapallo",
    slots: ["almuerzo"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Porotos colorados cocidos", g: 260, min: 160, max: 400, flex: "protein" },
      { food: "Papa hervida", g: 110, min: 60, max: 200 },
      { food: "Zapallo cocido", g: 150, min: 90, max: 225 },
      { food: "Cebolla", g: 60, min: 36, max: 90 },
      { food: "Pimiento rojo", g: 60, min: 36, max: 90 },
      { food: "Salsa de tomate casera", g: 80, min: 48, max: 120 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 15, flex: "fat" } ] },

  { id: "alm-ensalada-garbanzos-palta", name: "Ensalada de garbanzos, palta y vegetales con pan árabe",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos"], contains: ["gluten"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Garbanzos cocidos", g: 170, min: 100, max: 260, flex: "protein" },
      { food: "Pan árabe integral", g: 64, min: 32, max: 128, flex: "carb" },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Pepino", g: 100, min: 60, max: 150 },
      { food: "Lechuga", g: 50, min: 30, max: 75 },
      { food: "Cebolla", g: 30, min: 18, max: 45 },
      { food: "Palta (aguacate)", g: 50, min: 30, max: 80, flex: "fat" } ] },

  { id: "alm-wrap-hummus-garbanzos", name: "Wrap vegetal de hummus y garbanzos",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos"], contains: ["gluten"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Garbanzos cocidos", g: 110, min: 70, max: 180, flex: "protein" },
      { food: "Wrap / tortilla integral", g: 82, min: 41, max: 123, flex: "carb" },
      { food: "Hummus", g: 60, min: 30, max: 90, flex: "fat" },
      { food: "Zanahoria cruda rallada", g: 80, min: 48, max: 120 },
      { food: "Lechuga", g: 50, min: 30, max: 75 },
      { food: "Tomate", g: 100, min: 60, max: 150 } ] },

  { id: "alm-tacos-porotos-negros", name: "Tacos de maíz con porotos negros, palta y repollo",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "medio", cost: "medio",
    items: [
      { food: "Porotos negros cocidos", g: 180, min: 110, max: 280, flex: "protein" },
      { food: "Tortilla de maíz", g: 120, min: 72, max: 168, flex: "carb" },
      { food: "Palta (aguacate)", g: 50, min: 30, max: 80, flex: "fat" },
      { food: "Tomate", g: 100, min: 60, max: 150 },
      { food: "Lechuga", g: 60, min: 36, max: 90 },
      { food: "Cebolla", g: 30, min: 18, max: 45 } ] },

  { id: "alm-soja-texturizada-arroz", name: "Soja texturizada con arroz y verduras",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: ["soja"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Soja texturizada seca", g: 40, min: 25, max: 65, flex: "protein" },
      { food: "Arroz blanco cocido", g: 150, min: 80, max: 240, flex: "carb" },
      { food: "Zanahoria", g: 80, min: 48, max: 120 },
      { food: "Pimiento rojo", g: 80, min: 48, max: 120 },
      { food: "Cebolla", g: 50, min: 30, max: 75 },
      { food: "Salsa de tomate casera", g: 80, min: 48, max: 120 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 15, flex: "fat" } ] },

  { id: "alm-polenta-tuco-soja", name: "Polenta con tuco vegetal de soja y verduras",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: ["soja"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Soja texturizada seca", g: 40, min: 25, max: 65, flex: "protein" },
      { food: "Polenta cocida", g: 300, min: 160, max: 450, flex: "carb" },
      { food: "Salsa de tomate casera", g: 130, min: 78, max: 195 },
      { food: "Cebolla", g: 50, min: 30, max: 75 },
      { food: "Zanahoria", g: 60, min: 36, max: 90 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 15, flex: "fat" } ] },

  { id: "alm-edamame-arroz-salteado", name: "Salteado de edamame, arroz y verduras al sésamo",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos"], contains: ["soja", "gluten"],
    prep: "medio", cost: "alto",
    items: [
      { food: "Edamame", g: 130, min: 80, max: 210, flex: "protein" },
      { food: "Arroz blanco cocido", g: 150, min: 80, max: 240, flex: "carb" },
      { food: "Brócoli", g: 100, min: 60, max: 150 },
      { food: "Zanahoria", g: 80, min: 48, max: 120 },
      { food: "Pimiento rojo", g: 70, min: 42, max: 105 },
      { food: "Salsa de soja", g: 10, min: 6, max: 15 },
      { food: "Aceite de sésamo", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-bulgur-garbanzos-verduras", name: "Bulgur con garbanzos y verduras asadas",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos"], contains: ["gluten"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Garbanzos cocidos", g: 140, min: 90, max: 220, flex: "protein" },
      { food: "Trigo bulgur cocido", g: 230, min: 130, max: 340, flex: "carb" },
      { food: "Zucchini / Calabacín", g: 100, min: 60, max: 150 },
      { food: "Pimiento rojo", g: 80, min: 48, max: 120 },
      { food: "Cebolla", g: 50, min: 30, max: 75 },
      { food: "Aceite de oliva", g: 10, min: 5, max: 15, flex: "fat" } ] },

  { id: "alm-bowl-batata-garbanzos-kale", name: "Bowl de batata asada, garbanzos y kale y hummus",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "medio", cost: "alto",
    items: [
      { food: "Garbanzos cocidos", g: 150, min: 90, max: 230, flex: "protein" },
      { food: "Batata asada al horno (pulpa)", g: 150, min: 90, max: 250 },
      { food: "Kale / col rizada cruda", g: 60, min: 36, max: 90 },
      { food: "Tomate cherry", g: 80, min: 48, max: 120 },
      { food: "Hummus", g: 60, min: 30, max: 90, flex: "fat" } ] },

  { id: "cen-ensalada-quinoa-garbanzos", name: "Ensalada tibia de quinoa, garbanzos y rúcula",
    slots: ["cena", "almuerzo"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Garbanzos cocidos", g: 160, min: 80, max: 230, flex: "protein" },
      { food: "Quinoa cocida", g: 110, min: 60, max: 180, flex: "carb" },
      { food: "Rúcula", g: 50, min: 30, max: 75 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Pepino", g: 80, min: 48, max: 120 },
      { food: "Zanahoria cruda rallada", g: 60, min: 36, max: 90 },
      { food: "Aceite de oliva", g: 10, min: 5, max: 15, flex: "fat" } ] },

  { id: "cen-crema-zapallo-garbanzos", name: "Crema de zapallo con garbanzos y pan árabe",
    slots: ["cena"], diet: ["vegetariano", "vegano", "sin_lacteos"], contains: ["gluten"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Garbanzos cocidos", g: 160, min: 100, max: 240, flex: "protein" },
      { food: "Pan árabe integral", g: 50, min: 30, max: 100, flex: "carb" },
      { food: "Zapallo cocido", g: 250, min: 150, max: 375 },
      { food: "Papa hervida", g: 100, min: 60, max: 150 },
      { food: "Cebolla", g: 50, min: 30, max: 75 },
      { food: "Caldo de verduras", g: 250, min: 150, max: 375 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "cen-salteado-edamame-quinoa", name: "Salteado de edamame, quinoa y verduras",
    slots: ["cena"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: ["soja"],
    prep: "rapido", cost: "alto",
    items: [
      { food: "Edamame", g: 120, min: 80, max: 190, flex: "protein" },
      { food: "Quinoa cocida", g: 100, min: 60, max: 180, flex: "carb" },
      { food: "Brócoli", g: 100, min: 60, max: 150 },
      { food: "Zanahoria", g: 60, min: 36, max: 90 },
      { food: "Champiñones", g: 80, min: 48, max: 120 },
      { food: "Aceite de sésamo", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "cen-zapallo-relleno-lentejas", name: "Zapallo anco relleno de lentejas y espinaca",
    slots: ["cena"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Lentejas cocidas", g: 190, min: 110, max: 290, flex: "protein" },
      { food: "Zapallo anco / butternut al horno", g: 250, min: 160, max: 350 },
      { food: "Espinaca cocida", g: 100, min: 60, max: 150 },
      { food: "Cebolla", g: 50, min: 30, max: 75 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "cen-pastel-papa-lentejas", name: "Pastel de papa vegetal de lentejas",
    slots: ["cena", "almuerzo"], diet: ["vegetariano", "vegano", "sin_lacteos", "sin_gluten"], contains: [],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Lentejas cocidas", g: 160, min: 100, max: 260, flex: "protein" },
      { food: "Papa hervida", g: 250, min: 150, max: 380 },
      { food: "Zanahoria", g: 60, min: 36, max: 90 },
      { food: "Cebolla", g: 50, min: 30, max: 75 },
      { food: "Arvejas verdes cocidas", g: 60, min: 36, max: 90 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-hamburguesa-lentejas-ensalada", name: "Hamburguesas de lentejas en pan árabe con ensalada",
    slots: ["almuerzo"], diet: ["vegetariano", "sin_lacteos"], contains: ["gluten", "huevo"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Hamburguesa de lentejas", g: 200, min: 100, max: 300, flex: "protein" },
      { food: "Pan árabe integral", g: 64, min: 32, max: 128, flex: "carb" },
      { food: "Lechuga", g: 60, min: 36, max: 90 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Cebolla", g: 20, min: 12, max: 30 },
      { food: "Palta (aguacate)", g: 40, min: 20, max: 75, flex: "fat" } ] },

  { id: "alm-arroz-verduras-huevo", name: "Arroz con verduras y huevos fritos",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_lacteos", "sin_gluten"], contains: ["huevo"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Huevo entero", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Arroz blanco cocido", g: 170, min: 90, max: 260, flex: "carb" },
      { food: "Arvejas verdes cocidas", g: 80, min: 48, max: 120 },
      { food: "Zanahoria", g: 60, min: 36, max: 90 },
      { food: "Pimiento rojo", g: 60, min: 36, max: 90 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-fideos-arroz-salteados-huevo", name: "Fideos de arroz salteados con huevo y verduras",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_lacteos"], contains: ["huevo", "soja", "gluten"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Huevo entero", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Fideos de arroz (cocidos)", g: 170, min: 90, max: 260, flex: "carb" },
      { food: "Brócoli", g: 100, min: 60, max: 150 },
      { food: "Zanahoria", g: 70, min: 42, max: 105 },
      { food: "Pimiento rojo", g: 60, min: 36, max: 90 },
      { food: "Salsa de soja", g: 8, min: 5, max: 12 },
      { food: "Aceite de sésamo", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-quinoa-bowl-huevo-palta", name: "Bowl de quinoa con huevo duro, palta y vegetales",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_lacteos", "sin_gluten"], contains: ["huevo"],
    prep: "medio", cost: "alto",
    items: [
      { food: "Huevo duro", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Quinoa cocida", g: 150, min: 80, max: 240, flex: "carb" },
      { food: "Palta (aguacate)", g: 50, min: 30, max: 80, flex: "fat" },
      { food: "Tomate cherry", g: 100, min: 60, max: 150 },
      { food: "Pepino", g: 80, min: 48, max: 120 },
      { food: "Espinaca", g: 40, min: 24, max: 60 } ] },

  { id: "alm-ensalada-lentejas-huevo", name: "Ensalada de lentejas con huevo duro y rúcula",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_lacteos", "sin_gluten"], contains: ["huevo"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Lentejas cocidas", g: 180, min: 110, max: 280, flex: "protein" },
      { food: "Huevo duro", g: 100, min: 60, max: 150 },
      { food: "Papa hervida", g: 100, min: 50, max: 180 },
      { food: "Rúcula", g: 40, min: 24, max: 60 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Cebolla", g: 30, min: 18, max: 45 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  // ───────────── PASTAS, ÑOQUIS Y POLENTA ─────────────
  { id: "alm-noquis-tomate-queso-ensalada", name: "Ñoquis con salsa de tomate, queso rallado y ensalada",
    slots: ["almuerzo"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Gnocchi / Ñoquis cocidos", g: 250, min: 140, max: 400, flex: "carb" },
      { food: "Salsa de tomate casera", g: 120, min: 72, max: 180 },
      { food: "Queso rallado", g: 25, min: 15, max: 40, flex: "protein" },
      { food: "Lechuga", g: 60, min: 36, max: 90 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Cebolla", g: 20, min: 12, max: 30 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-fideos-tomate-queso-ensalada", name: "Fideos con salsa de tomate, queso rallado y ensalada",
    slots: ["almuerzo", "cena"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Fideos cocidos", g: 210, min: 120, max: 340, flex: "carb" },
      { food: "Salsa de tomate casera", g: 120, min: 72, max: 180 },
      { food: "Queso rallado", g: 30, min: 15, max: 45, flex: "protein" },
      { food: "Lechuga", g: 60, min: 36, max: 90 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Cebolla", g: 20, min: 12, max: 30 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-pasta-integral-ricota-brocoli", name: "Pasta integral con ricota, brócoli y tomate cherry",
    slots: ["almuerzo", "cena"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Pasta integral cocida", g: 200, min: 120, max: 320, flex: "carb" },
      { food: "Ricota", g: 70, min: 40, max: 110, flex: "protein" },
      { food: "Brócoli", g: 110, min: 66, max: 165 },
      { food: "Tomate cherry", g: 100, min: 60, max: 150 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-ravioles-verdura-tomate", name: "Ravioles de verdura con salsa de tomate y ensalada",
    slots: ["almuerzo"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Ravioles de verdura", g: 300, min: 180, max: 450, flex: "carb" },
      { food: "Queso rallado", g: 20, min: 10, max: 35, flex: "protein" },
      { food: "Salsa de tomate casera", g: 60, min: 36, max: 90 },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 } ] },

  { id: "alm-canelones-verdura-ricota", name: "Canelones de verdura y ricota con ensalada",
    slots: ["almuerzo", "cena"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "medio",
    items: [
      { food: "Canelones de verdura y ricota", g: 250, min: 170, max: 400, flex: "protein" },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 },
      { food: "Aceite de oliva", g: 5, min: 3, max: 10, flex: "fat" } ] },

  { id: "alm-lasagna-verduras-ricota", name: "Lasaña de verduras, espinaca y ricota",
    slots: ["almuerzo"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "medio",
    items: [
      { food: "Pasta fresca (cocida)", g: 150, min: 90, max: 240, flex: "carb" },
      { food: "Ricota", g: 90, min: 50, max: 140, flex: "protein" },
      { food: "Queso mozzarella", g: 40, min: 24, max: 60 },
      { food: "Espinaca cocida", g: 100, min: 60, max: 150 },
      { food: "Salsa de tomate casera", g: 100, min: 60, max: 150 },
      { food: "Zucchini / Calabacín", g: 80, min: 48, max: 120 } ] },

  { id: "alm-tallarines-champinon-queso", name: "Tallarines con salsa de champiñones y queso rallado",
    slots: ["almuerzo", "cena"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Tallarines al huevo (cocidos)", g: 200, min: 120, max: 320, flex: "carb" },
      { food: "Queso rallado", g: 30, min: 15, max: 45, flex: "protein" },
      { food: "Champiñones", g: 120, min: 72, max: 180 },
      { food: "Salsa de tomate casera", g: 100, min: 60, max: 150 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-polenta-tomate-mozzarella", name: "Polenta con salsa de tomate, mozzarella y ensalada",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Polenta cocida", g: 250, min: 140, max: 400, flex: "carb" },
      { food: "Queso mozzarella", g: 80, min: 50, max: 120, flex: "protein" },
      { food: "Salsa de tomate casera", g: 150, min: 90, max: 225 },
      { food: "Lechuga", g: 45, min: 27, max: 68 },
      { food: "Tomate", g: 90, min: 54, max: 135 },
      { food: "Cebolla", g: 15, min: 9, max: 22 },
      { food: "Aceite de oliva", g: 5, min: 3, max: 10, flex: "fat" } ] },

  { id: "cen-polenta-champinones-huevo", name: "Polenta cremosa con champiñones y huevo poché",
    slots: ["cena", "almuerzo"], diet: ["vegetariano", "sin_gluten"], contains: ["huevo", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Huevo entero", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Polenta cocida", g: 220, min: 120, max: 360, flex: "carb" },
      { food: "Queso rallado", g: 15, min: 9, max: 22 },
      { food: "Champiñones", g: 120, min: 72, max: 180 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-risotto-hongos-queso", name: "Risotto de hongos con queso rallado y ensalada de rúcula",
    slots: ["almuerzo"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Risotto de hongos", g: 300, min: 190, max: 450, flex: "carb" },
      { food: "Queso rallado", g: 20, min: 10, max: 35, flex: "protein" },
      { food: "Rúcula", g: 50, min: 30, max: 75 },
      { food: "Tomate cherry", g: 80, min: 48, max: 120 } ] },

  // ───────────── TARTAS, TORTILLAS, EMPANADAS Y PIZZA ─────────────
  { id: "alm-tarta-espinaca-ricota-ensalada", name: "Tarta de espinaca y ricota con ensalada de garbanzos",
    slots: ["almuerzo", "cena"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "medio",
    items: [
      { food: "Tarta de espinaca y ricota", g: 200, min: 120, max: 300, flex: "carb" },
      { food: "Garbanzos cocidos", g: 70, min: 40, max: 130, flex: "protein" },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 } ] },

  { id: "alm-tarta-verduras-huevo-ensalada", name: "Tarta de verduras con ensalada y huevo duro",
    slots: ["almuerzo", "cena"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Tarta de verduras", g: 200, min: 120, max: 300, flex: "carb" },
      { food: "Huevo duro", g: 50, min: 50, max: 100, flex: "protein" },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 } ] },

  { id: "alm-tarta-zapallitos-cottage", name: "Tarta de zapallitos con ensalada de tomate y queso cottage",
    slots: ["almuerzo", "cena"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Tarta de zapallitos (porción)", g: 180, min: 110, max: 270, flex: "carb" },
      { food: "Queso cottage", g: 100, min: 60, max: 160, flex: "protein" },
      { food: "Tomate", g: 150, min: 90, max: 225 } ] },

  { id: "cen-tarta-puerro-ensalada", name: "Tarta de puerro con ensalada mixta y queso cottage",
    slots: ["cena", "almuerzo"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Tarta de puerro", g: 170, min: 100, max: 260, flex: "carb" },
      { food: "Queso cottage", g: 110, min: 60, max: 170, flex: "protein" },
      { food: "Lechuga", g: 60, min: 36, max: 90 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Cebolla", g: 20, min: 12, max: 30 } ] },

  { id: "cen-pascualina-ensalada", name: "Pascualina con ensalada y queso cottage",
    slots: ["cena", "almuerzo"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Pascualina", g: 190, min: 110, max: 280, flex: "carb" },
      { food: "Queso cottage", g: 70, min: 40, max: 120, flex: "protein" },
      { food: "Lechuga", g: 60, min: 36, max: 90 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Cebolla", g: 20, min: 12, max: 30 } ] },

  { id: "cen-tarta-choclo-ensalada", name: "Tarta de choclo con ensalada verde y huevo duro",
    slots: ["cena", "almuerzo"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Tarta de choclo", g: 150, min: 90, max: 230, flex: "carb" },
      { food: "Huevo duro", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Lechuga", g: 80, min: 48, max: 120 },
      { food: "Tomate", g: 120, min: 72, max: 180 } ] },

  { id: "cen-tarta-cebolla-ensalada-huevo", name: "Tarta de cebolla con ensalada de rúcula y huevo",
    slots: ["cena", "almuerzo"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Tarta de cebolla", g: 150, min: 90, max: 230, flex: "carb" },
      { food: "Huevo duro", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Rúcula", g: 50, min: 30, max: 75 },
      { food: "Tomate cherry", g: 100, min: 60, max: 150 } ] },

  { id: "cen-tortilla-papa-ensalada", name: "Tortilla de papa con ensalada mixta",
    slots: ["cena", "almuerzo"], diet: ["vegetariano", "sin_lacteos", "sin_gluten"], contains: ["huevo"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Tortilla de papa", g: 230, min: 140, max: 340, flex: "protein" },
      { food: "Lechuga", g: 60, min: 36, max: 90 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Cebolla", g: 20, min: 12, max: 30 },
      { food: "Aceite de oliva", g: 5, min: 3, max: 10, flex: "fat" } ] },

  { id: "cen-tortilla-verduras-pan", name: "Tortilla de verduras con ensalada y pan integral",
    slots: ["cena", "almuerzo"], diet: ["vegetariano", "sin_lacteos"], contains: ["huevo", "gluten"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Tortilla de verduras", g: 220, min: 140, max: 320, flex: "protein" },
      { food: "Pan lactal integral", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 } ] },

  { id: "cen-revuelto-huevo-zucchini", name: "Revuelto de huevos con zucchini, tomate y pan integral",
    slots: ["cena", "almuerzo"], diet: ["vegetariano", "sin_lacteos"], contains: ["huevo", "gluten"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Huevo entero", g: 150, min: 100, max: 200, flex: "protein" },
      { food: "Pan lactal integral", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Zucchini / Calabacín", g: 150, min: 90, max: 225 },
      { food: "Cebolla", g: 50, min: 30, max: 75 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-omelette-queso-papa", name: "Omelette de queso con papa hervida y ensalada",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_gluten"], contains: ["huevo", "lacteos"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Omelette de queso", g: 140, min: 100, max: 210, flex: "protein" },
      { food: "Papa hervida", g: 150, min: 80, max: 260 },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 },
      { food: "Aceite de oliva", g: 5, min: 3, max: 10, flex: "fat" } ] },

  { id: "cen-omelette-espinaca-queso-pan", name: "Omelette de espinaca y queso con tomate y pan integral",
    slots: ["cena"], diet: ["vegetariano"], contains: ["huevo", "lacteos", "gluten"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Omelette de espinaca y queso", g: 170, min: 120, max: 260, flex: "protein" },
      { food: "Pan lactal integral", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Tomate", g: 150, min: 90, max: 225 },
      { food: "Rúcula", g: 40, min: 24, max: 60 } ] },

  { id: "cen-omelette-champinones-papa", name: "Omelette de champiñones y queso con papa al horno",
    slots: ["cena"], diet: ["vegetariano", "sin_gluten"], contains: ["huevo", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Omelette de champiñones y queso", g: 170, min: 120, max: 260, flex: "protein" },
      { food: "Papa al horno", g: 150, min: 80, max: 250 },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 } ] },

  { id: "cen-omelette-claras-verduras-batata", name: "Omelette de claras con espinaca, batata y palta",
    slots: ["cena"], diet: ["vegetariano", "sin_lacteos", "sin_gluten"], contains: ["huevo"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Omelette de claras (4 claras)", g: 210, min: 140, max: 280, flex: "protein" },
      { food: "Batata hervida", g: 150, min: 80, max: 250 },
      { food: "Espinaca cocida", g: 100, min: 60, max: 150 },
      { food: "Tomate cherry", g: 100, min: 60, max: 150 },
      { food: "Palta (aguacate)", g: 50, min: 30, max: 80, flex: "fat" } ] },

  { id: "cen-huevos-plancha-verduras-grilladas", name: "Huevos a la plancha con verduras grilladas y pan",
    slots: ["cena"], diet: ["vegetariano", "sin_lacteos"], contains: ["huevo", "gluten"],
    prep: "rapido", cost: "bajo",
    items: [
      { food: "Huevos a la plancha (2)", g: 100, min: 100, max: 150, flex: "protein" },
      { food: "Pan lactal integral", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Verduras grilladas", g: 220, min: 132, max: 330 } ] },

  { id: "alm-revuelto-zapallitos-arroz", name: "Revuelto de zapallitos con arroz y ensalada de tomate",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_gluten"], contains: ["huevo", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Revuelto de zapallitos", g: 330, min: 200, max: 450, flex: "protein" },
      { food: "Arroz blanco cocido", g: 150, min: 80, max: 240, flex: "carb" },
      { food: "Tomate", g: 150, min: 90, max: 225 } ] },

  { id: "cen-tostada-palta-huevo-ensalada", name: "Tostadas con palta y huevo con ensalada de tomate",
    slots: ["cena", "almuerzo"], diet: ["vegetariano", "sin_lacteos"], contains: ["huevo", "gluten"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Tostadas con huevo y palta", g: 200, min: 140, max: 300, flex: "carb" },
      { food: "Huevo duro", g: 50, min: 50, max: 100, flex: "protein" },
      { food: "Tomate", g: 150, min: 90, max: 225 } ] },

  { id: "alm-pizza-muzzarella-verduras", name: "Pizza casera de muzzarella con verduras grilladas y ensalada",
    slots: ["almuerzo"], diet: ["vegetariano"], contains: ["gluten", "lacteos"],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Pizza muzzarella", g: 240, min: 120, max: 360, flex: "carb" },
      { food: "Verduras grilladas", g: 100, min: 60, max: 150 },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 } ] },

  { id: "alm-empanadas-caprese-ensalada", name: "Empanadas caprese al horno con ensalada",
    slots: ["almuerzo"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "largo", cost: "medio",
    items: [
      { food: "Empanada caprese (al horno)", g: 180, min: 90, max: 270, flex: "carb" },
      { food: "Lechuga", g: 60, min: 36, max: 90 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Cebolla", g: 20, min: 12, max: 30 },
      { food: "Garbanzos cocidos", g: 70, min: 40, max: 130, flex: "protein" } ] },

  // ───────────── VERDURAS RELLENAS, MILANESAS VEGETALES, PAPAS ─────────────
  { id: "alm-berenjenas-rellenas-quinoa", name: "Berenjenas rellenas de quinoa, garbanzos y mozzarella",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos"],
    prep: "largo", cost: "medio",
    items: [
      { food: "Queso mozzarella", g: 50, min: 30, max: 90, flex: "protein" },
      { food: "Quinoa cocida", g: 110, min: 60, max: 180, flex: "carb" },
      { food: "Garbanzos cocidos", g: 80, min: 48, max: 120 },
      { food: "Berenjena cocida", g: 250, min: 150, max: 375 },
      { food: "Tomate", g: 100, min: 60, max: 150 },
      { food: "Cebolla", g: 40, min: 24, max: 60 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "alm-papa-rellena-ricota-espinaca", name: "Papa rellena de ricota y espinaca gratinada",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Papa al horno", g: 220, min: 130, max: 340 },
      { food: "Ricota", g: 100, min: 60, max: 150, flex: "protein" },
      { food: "Queso rallado", g: 15, min: 9, max: 22 },
      { food: "Espinaca cocida", g: 100, min: 60, max: 150 },
      { food: "Ensalada de tomate", g: 150, min: 90, max: 225 } ] },

  { id: "cen-zucchini-rellenos-ricota", name: "Zucchini rellenos de ricota y queso con papa hervida",
    slots: ["cena"], diet: ["vegetariano", "sin_gluten"], contains: ["lacteos"],
    prep: "largo", cost: "bajo",
    items: [
      { food: "Ricota", g: 110, min: 70, max: 160, flex: "protein" },
      { food: "Papa hervida", g: 150, min: 80, max: 250 },
      { food: "Zucchini / Calabacín", g: 300, min: 180, max: 450 },
      { food: "Queso rallado", g: 20, min: 12, max: 30 },
      { food: "Salsa de tomate casera", g: 80, min: 48, max: 120 } ] },

  { id: "alm-milanesa-berenjena-napolitana-pure", name: "Milanesa de berenjena napolitana al horno con puré y ensalada",
    slots: ["almuerzo"], diet: ["vegetariano"], contains: ["gluten", "huevo", "lacteos"],
    prep: "medio", cost: "medio",
    items: [
      { food: "Milanesa de berenjena (al horno)", g: 240, min: 120, max: 360 },
      { food: "Queso mozzarella", g: 60, min: 40, max: 100, flex: "protein" },
      { food: "Puré de papa (solo con leche, sin manteca)", g: 200, min: 100, max: 300 },
      { food: "Salsa de tomate casera", g: 60, min: 36, max: 90 },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 } ] },

  { id: "alm-milanesa-soja-pure-ensalada", name: "Milanesa de soja con puré de calabaza y ensalada",
    slots: ["almuerzo", "cena"], diet: ["vegetariano", "sin_lacteos"], contains: ["gluten", "huevo", "soja"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Milanesa de soja", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Puré de calabaza", g: 250, min: 150, max: 380 },
      { food: "Ensalada mixta (lechuga, tomate, cebolla)", g: 200, min: 120, max: 300 } ] },

  { id: "cen-milanesa-soja-ensalada-batata", name: "Milanesa de soja al horno con ensalada y batata",
    slots: ["cena", "almuerzo"], diet: ["vegetariano", "sin_lacteos"], contains: ["gluten", "huevo", "soja"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Milanesa de soja", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Batata al horno", g: 150, min: 80, max: 260, flex: "carb" },
      { food: "Tomate", g: 150, min: 90, max: 225 },
      { food: "Aceite de oliva", g: 5, min: 3, max: 10, flex: "fat" } ] },

  // ───────────── SOPAS Y ENSALADAS COMPLETAS ─────────────
  { id: "cen-sopa-verduras-huevo-tostadas", name: "Sopa de verduras con huevo poché y tostadas",
    slots: ["cena"], diet: ["vegetariano", "sin_lacteos"], contains: ["huevo", "gluten"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Sopa de verduras", g: 300, min: 180, max: 450 },
      { food: "Huevo entero", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" } ] },

  { id: "cen-sopa-zapallo-queso-tostadas", name: "Sopa crema de calabaza con queso fresco y tostadas",
    slots: ["cena"], diet: ["vegetariano"], contains: ["lacteos", "gluten"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Sopa crema de calabaza", g: 300, min: 180, max: 450 },
      { food: "Queso fresco", g: 100, min: 60, max: 160, flex: "protein" },
      { food: "Tostadas", g: 52, min: 26, max: 104, flex: "carb" },
      { food: "Tomate", g: 100, min: 60, max: 150 } ] },

  { id: "cen-ensalada-completa-huevo-queso", name: "Ensalada completa de hojas, huevo duro, queso fresco y palta con pan",
    slots: ["cena", "almuerzo"], diet: ["vegetariano"], contains: ["huevo", "lacteos", "gluten"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Huevo duro", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Queso fresco", g: 80, min: 48, max: 120 },
      { food: "Pan lactal integral", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Lechuga", g: 100, min: 60, max: 150 },
      { food: "Rúcula", g: 40, min: 24, max: 60 },
      { food: "Tomate", g: 120, min: 72, max: 180 },
      { food: "Palta (aguacate)", g: 50, min: 30, max: 80, flex: "fat" } ] },

  { id: "alm-ensalada-griega-garbanzos", name: "Ensalada griega con garbanzos, queso feta y pan árabe",
    slots: ["almuerzo", "cena"], diet: ["vegetariano"], contains: ["lacteos", "gluten"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Garbanzos cocidos", g: 130, min: 80, max: 200, flex: "protein" },
      { food: "Pan árabe integral", g: 64, min: 32, max: 128, flex: "carb" },
      { food: "Queso feta", g: 40, min: 24, max: 60 },
      { food: "Tomate", g: 150, min: 90, max: 225 },
      { food: "Pepino", g: 100, min: 60, max: 150 },
      { food: "Aceitunas negras en lata", g: 20, min: 12, max: 30 },
      { food: "Aceite de oliva", g: 8, min: 5, max: 14, flex: "fat" } ] },

  { id: "cen-wrap-huevo-palta", name: "Wrap integral de huevo duro, palta y verduras",
    slots: ["cena", "almuerzo"], diet: ["vegetariano", "sin_lacteos"], contains: ["huevo", "gluten"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Huevo duro", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Wrap / tortilla integral", g: 82, min: 41, max: 123, flex: "carb" },
      { food: "Palta (aguacate)", g: 50, min: 30, max: 80, flex: "fat" },
      { food: "Tomate", g: 100, min: 60, max: 150 },
      { food: "Lechuga", g: 50, min: 30, max: 75 },
      { food: "Zanahoria cruda rallada", g: 50, min: 30, max: 75 } ] },

  { id: "cen-caprese-pan-rucula", name: "Ensalada caprese con rúcula y pan integral",
    slots: ["cena"], diet: ["vegetariano"], contains: ["lacteos", "gluten"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Ensalada caprese", g: 220, min: 150, max: 330, flex: "protein" },
      { food: "Pan lactal integral", g: 75, min: 50, max: 125, flex: "carb" },
      { food: "Rúcula", g: 50, min: 30, max: 75 } ] },

  { id: "cen-provoleta-ensalada-pan", name: "Provoleta con ensalada de tomate y rúcula y pan",
    slots: ["cena"], diet: ["vegetariano"], contains: ["lacteos", "gluten"],
    prep: "rapido", cost: "medio",
    items: [
      { food: "Provoleta a la parrilla", g: 100, min: 70, max: 150, flex: "protein" },
      { food: "Pan lactal integral", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Tomate", g: 150, min: 90, max: 225 },
      { food: "Rúcula", g: 50, min: 30, max: 75 } ] },

  { id: "cen-ensalada-papa-huevo-rucula", name: "Ensalada de papa y huevo con rúcula y queso fresco",
    slots: ["cena"], diet: ["vegetariano", "sin_gluten"], contains: ["huevo", "lacteos"],
    prep: "medio", cost: "bajo",
    items: [
      { food: "Ensalada de papa y huevo", g: 250, min: 160, max: 350, flex: "carb" },
      { food: "Queso fresco", g: 90, min: 60, max: 150, flex: "protein" },
      { food: "Rúcula", g: 50, min: 30, max: 75 },
      { food: "Tomate", g: 100, min: 60, max: 150 } ] }
];
