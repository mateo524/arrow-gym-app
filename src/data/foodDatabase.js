// Base de datos de alimentos — valores por porción indicada (no necesariamente 100g)
// Campos: name, kcal, protein, carbs, fat, serving (texto), grams (peso de la porción en g)
// Fuentes: USDA, ANMAT, tablas argentinas de composición nutricional

export const FOOD_DB = [
  // ── HUEVOS ──────────────────────────────────────────────────────────
  { id:"e1",  cat:"Huevos",    name:"Huevo entero",           serving:"1 unidad",    grams:50,  kcal:72,  protein:6,  carbs:0,  fat:5 },
  { id:"e2",  cat:"Huevos",    name:"Clara de huevo",         serving:"1 clara",     grams:30,  kcal:17,  protein:4,  carbs:0,  fat:0 },
  { id:"e3",  cat:"Huevos",    name:"Yema de huevo",          serving:"1 yema",      grams:17,  kcal:55,  protein:3,  carbs:1,  fat:5 },
  { id:"e4",  cat:"Huevos",    name:"Huevo duro",             serving:"1 unidad",    grams:50,  kcal:78,  protein:6,  carbs:1,  fat:5 },
  { id:"e5",  cat:"Huevos",    name:"Revuelto de huevo (2)",  serving:"2 huevos",    grams:100, kcal:180, protein:12, carbs:1,  fat:14 },

  // ── LÁCTEOS ─────────────────────────────────────────────────────────
  { id:"d1",  cat:"Lácteos",   name:"Leche entera",           serving:"1 vaso 250ml",grams:250, kcal:152, protein:8,  carbs:12, fat:8 },
  { id:"d2",  cat:"Lácteos",   name:"Leche descremada",       serving:"1 vaso 250ml",grams:250, kcal:83,  protein:8,  carbs:12, fat:0 },
  { id:"d3",  cat:"Lácteos",   name:"Yogur griego entero",    serving:"1 pote 150g", grams:150, kcal:100, protein:10, carbs:4,  fat:5 },
  { id:"d4",  cat:"Lácteos",   name:"Yogur descremado",       serving:"1 pote 150g", grams:150, kcal:75,  protein:8,  carbs:9,  fat:0 },
  { id:"d5",  cat:"Lácteos",   name:"Queso cottage",          serving:"100g",        grams:100, kcal:98,  protein:11, carbs:3,  fat:4 },
  { id:"d6",  cat:"Lácteos",   name:"Queso port salut",       serving:"1 feta 30g",  grams:30,  kcal:90,  protein:6,  carbs:0,  fat:7 },
  { id:"d7",  cat:"Lácteos",   name:"Queso tybo",             serving:"1 feta 30g",  grams:30,  kcal:99,  protein:7,  carbs:0,  fat:8 },
  { id:"d8",  cat:"Lácteos",   name:"Queso mozzarella",       serving:"50g",         grams:50,  kcal:140, protein:10, carbs:1,  fat:11 },
  { id:"d9",  cat:"Lácteos",   name:"Queso crema",            serving:"1 cda 20g",   grams:20,  kcal:69,  protein:2,  carbs:1,  fat:7 },
  { id:"d10", cat:"Lácteos",   name:"Ricota",                 serving:"100g",        grams:100, kcal:174, protein:11, carbs:3,  fat:13 },
  { id:"d11", cat:"Lácteos",   name:"Leche chocolatada",      serving:"250ml",       grams:250, kcal:190, protein:7,  carbs:30, fat:5 },
  { id:"d12", cat:"Lácteos",   name:"Kéfir",                  serving:"250ml",       grams:250, kcal:128, protein:8,  carbs:11, fat:5 },

  // ── CARNES ROJAS ────────────────────────────────────────────────────
  { id:"r1",  cat:"Carnes",    name:"Asado (tira)",           serving:"100g",        grams:100, kcal:287, protein:20, carbs:0,  fat:23 },
  { id:"r2",  cat:"Carnes",    name:"Bife de chorizo",        serving:"100g",        grams:100, kcal:250, protein:22, carbs:0,  fat:18 },
  { id:"r3",  cat:"Carnes",    name:"Bife de lomo",           serving:"100g",        grams:100, kcal:190, protein:25, carbs:0,  fat:10 },
  { id:"r4",  cat:"Carnes",    name:"Nalga (magra)",          serving:"100g",        grams:100, kcal:170, protein:26, carbs:0,  fat:7 },
  { id:"r5",  cat:"Carnes",    name:"Carne picada 90%",       serving:"100g",        grams:100, kcal:218, protein:26, carbs:0,  fat:13 },
  { id:"r6",  cat:"Carnes",    name:"Carne picada 80%",       serving:"100g",        grams:100, kcal:265, protein:24, carbs:0,  fat:19 },
  { id:"r7",  cat:"Carnes",    name:"Milanesa de ternera",    serving:"100g",        grams:100, kcal:233, protein:22, carbs:7,  fat:13 },
  { id:"r8",  cat:"Carnes",    name:"Hamburguesa casera",     serving:"100g",        grams:100, kcal:231, protein:22, carbs:0,  fat:16 },
  { id:"r9",  cat:"Carnes",    name:"Cuadril",                serving:"100g",        grams:100, kcal:195, protein:28, carbs:0,  fat:9 },
  { id:"r10", cat:"Carnes",    name:"Vacío",                  serving:"100g",        grams:100, kcal:240, protein:27, carbs:0,  fat:14 },
  { id:"r11", cat:"Carnes",    name:"Bondiola de cerdo",      serving:"100g",        grams:100, kcal:290, protein:24, carbs:0,  fat:21 },
  { id:"r12", cat:"Carnes",    name:"Lomo de cerdo",          serving:"100g",        grams:100, kcal:180, protein:29, carbs:0,  fat:7 },
  { id:"r13", cat:"Carnes",    name:"Chorizos parrilleros",   serving:"100g",        grams:100, kcal:290, protein:14, carbs:2,  fat:25 },
  { id:"r14", cat:"Carnes",    name:"Morcilla",               serving:"100g",        grams:100, kcal:325, protein:13, carbs:4,  fat:30 },

  // ── AVES ────────────────────────────────────────────────────────────
  { id:"p1",  cat:"Carnes",    name:"Pechuga de pollo",       serving:"100g",        grams:100, kcal:165, protein:31, carbs:0,  fat:3 },
  { id:"p2",  cat:"Carnes",    name:"Muslo de pollo c/piel",  serving:"100g",        grams:100, kcal:200, protein:18, carbs:0,  fat:13 },
  { id:"p3",  cat:"Carnes",    name:"Muslo de pollo s/piel",  serving:"100g",        grams:100, kcal:175, protein:25, carbs:0,  fat:8 },
  { id:"p4",  cat:"Carnes",    name:"Pollo entero asado",     serving:"100g",        grams:100, kcal:215, protein:24, carbs:0,  fat:13 },
  { id:"p5",  cat:"Carnes",    name:"Suprema de pollo",       serving:"100g",        grams:100, kcal:165, protein:31, carbs:0,  fat:4 },
  { id:"p6",  cat:"Carnes",    name:"Milanesa de pollo",      serving:"100g",        grams:100, kcal:217, protein:25, carbs:8,  fat:8 },
  { id:"p7",  cat:"Carnes",    name:"Pavo pechuga",           serving:"100g",        grams:100, kcal:157, protein:30, carbs:0,  fat:3 },

  // ── PESCADOS Y MARISCOS ─────────────────────────────────────────────
  { id:"f1",  cat:"Pescados",  name:"Atún al natural",        serving:"1 lata 140g", grams:140, kcal:162, protein:37, carbs:0,  fat:1 },
  { id:"f2",  cat:"Pescados",  name:"Atún en aceite",         serving:"1 lata 140g", grams:140, kcal:280, protein:31, carbs:0,  fat:18 },
  { id:"f3",  cat:"Pescados",  name:"Salmón",                 serving:"100g",        grams:100, kcal:208, protein:20, carbs:0,  fat:13 },
  { id:"f4",  cat:"Pescados",  name:"Merluza",                serving:"100g",        grams:100, kcal:92,  protein:18, carbs:0,  fat:2 },
  { id:"f5",  cat:"Pescados",  name:"Trucha",                 serving:"100g",        grams:100, kcal:148, protein:21, carbs:0,  fat:7 },
  { id:"f6",  cat:"Pescados",  name:"Sardinas en lata",       serving:"1 lata 100g", grams:100, kcal:208, protein:25, carbs:0,  fat:11 },
  { id:"f7",  cat:"Pescados",  name:"Camarones",              serving:"100g",        grams:100, kcal:99,  protein:24, carbs:0,  fat:0 },

  // ── EMBUTIDOS / FIAMBRES ─────────────────────────────────────────────
  { id:"m1",  cat:"Fiambres",  name:"Jamón cocido",           serving:"2 fetas 40g", grams:40,  kcal:52,  protein:7,  carbs:1,  fat:2 },
  { id:"m2",  cat:"Fiambres",  name:"Jamón crudo (serrano)",  serving:"2 fetas 30g", grams:30,  kcal:70,  protein:7,  carbs:0,  fat:5 },
  { id:"m3",  cat:"Fiambres",  name:"Salame",                 serving:"3 rodajas",   grams:30,  kcal:120, protein:6,  carbs:0,  fat:10 },
  { id:"m4",  cat:"Fiambres",  name:"Mortadela",              serving:"2 fetas 40g", grams:40,  kcal:120, protein:6,  carbs:2,  fat:10 },
  { id:"m5",  cat:"Fiambres",  name:"Salchicha de Viena",     serving:"1 unidad",    grams:40,  kcal:115, protein:5,  carbs:1,  fat:10 },

  // ── CEREALES / GRANOS ────────────────────────────────────────────────
  { id:"c1",  cat:"Cereales",  name:"Arroz blanco cocido",    serving:"1 taza 180g", grams:180, kcal:234, protein:5,  carbs:50, fat:0 },
  { id:"c2",  cat:"Cereales",  name:"Arroz integral cocido",  serving:"1 taza 180g", grams:180, kcal:216, protein:5,  carbs:45, fat:2 },
  { id:"c3",  cat:"Cereales",  name:"Avena (seca)",           serving:"50g",         grams:50,  kcal:189, protein:7,  carbs:32, fat:4 },
  { id:"c4",  cat:"Cereales",  name:"Fideos cocidos",         serving:"1 taza 160g", grams:160, kcal:220, protein:7,  carbs:45, fat:1 },
  { id:"c5",  cat:"Cereales",  name:"Espaguetis cocidos",     serving:"1 taza 160g", grams:160, kcal:220, protein:7,  carbs:44, fat:1 },
  { id:"c6",  cat:"Cereales",  name:"Polenta cocida",         serving:"1 taza 200g", grams:200, kcal:148, protein:4,  carbs:32, fat:0 },
  { id:"c7",  cat:"Cereales",  name:"Quinoa cocida",          serving:"1 taza 180g", grams:180, kcal:222, protein:8,  carbs:40, fat:4 },
  { id:"c8",  cat:"Cereales",  name:"Trigo bulgur cocido",    serving:"1 taza 180g", grams:180, kcal:151, protein:6,  carbs:34, fat:0 },
  { id:"c9",  cat:"Cereales",  name:"Granola",                serving:"50g",         grams:50,  kcal:220, protein:5,  carbs:30, fat:9 },
  { id:"c10", cat:"Cereales",  name:"Maíz pisingallo",        serving:"1 taza 30g",  grams:30,  kcal:110, protein:3,  carbs:23, fat:1 },

  // ── PAN ──────────────────────────────────────────────────────────────
  { id:"b1",  cat:"Pan",       name:"Pan lactal blanco",      serving:"1 rebanada",  grams:25,  kcal:67,  protein:2,  carbs:13, fat:1 },
  { id:"b2",  cat:"Pan",       name:"Pan lactal integral",    serving:"1 rebanada",  grams:25,  kcal:60,  protein:3,  carbs:11, fat:1 },
  { id:"b3",  cat:"Pan",       name:"Pan francés",            serving:"1 unidad",    grams:50,  kcal:140, protein:5,  carbs:27, fat:1 },
  { id:"b4",  cat:"Pan",       name:"Medialuna (grasa)",      serving:"1 unidad",    grams:40,  kcal:160, protein:3,  carbs:20, fat:8 },
  { id:"b5",  cat:"Pan",       name:"Facturas (promedio)",    serving:"1 unidad",    grams:60,  kcal:220, protein:4,  carbs:28, fat:11 },
  { id:"b6",  cat:"Pan",       name:"Tostadas",               serving:"2 unidades",  grams:26,  kcal:92,  protein:3,  carbs:18, fat:1 },
  { id:"b7",  cat:"Pan",       name:"Galletitas de arroz",    serving:"2 unidades",  grams:18,  kcal:70,  protein:1,  carbs:15, fat:1 },
  { id:"b8",  cat:"Pan",       name:"Crackers/Agua",          serving:"4 unidades",  grams:28,  kcal:108, protein:2,  carbs:19, fat:3 },

  // ── PAPA / TUBÉRCULOS ────────────────────────────────────────────────
  { id:"v1",  cat:"Verduras",  name:"Papa hervida",           serving:"1 mediana",   grams:150, kcal:116, protein:3,  carbs:27, fat:0 },
  { id:"v2",  cat:"Verduras",  name:"Papa al horno",          serving:"1 mediana",   grams:150, kcal:130, protein:3,  carbs:30, fat:0 },
  { id:"v3",  cat:"Verduras",  name:"Puré de papa",           serving:"1 taza 200g", grams:200, kcal:210, protein:4,  carbs:40, fat:4 },
  { id:"v4",  cat:"Verduras",  name:"Batata hervida",         serving:"1 mediana",   grams:150, kcal:130, protein:2,  carbs:30, fat:0 },
  { id:"v5",  cat:"Verduras",  name:"Papas fritas caseras",   serving:"1 porción",   grams:100, kcal:312, protein:3,  carbs:41, fat:15 },
  { id:"v6",  cat:"Verduras",  name:"Mandioca hervida",       serving:"100g",        grams:100, kcal:159, protein:1,  carbs:38, fat:0 },

  // ── VERDURAS ─────────────────────────────────────────────────────────
  { id:"v7",  cat:"Verduras",  name:"Tomate",                 serving:"1 mediano",   grams:120, kcal:22,  protein:1,  carbs:5,  fat:0 },
  { id:"v8",  cat:"Verduras",  name:"Lechuga",                serving:"1 taza",      grams:50,  kcal:8,   protein:1,  carbs:1,  fat:0 },
  { id:"v9",  cat:"Verduras",  name:"Espinaca cruda",         serving:"1 taza",      grams:50,  kcal:11,  protein:1,  carbs:2,  fat:0 },
  { id:"v10", cat:"Verduras",  name:"Brócoli cocido",         serving:"1 taza",      grams:156, kcal:55,  protein:4,  carbs:11, fat:1 },
  { id:"v11", cat:"Verduras",  name:"Zanahoria",              serving:"1 mediana",   grams:80,  kcal:33,  protein:1,  carbs:8,  fat:0 },
  { id:"v12", cat:"Verduras",  name:"Cebolla",                serving:"1 mediana",   grams:100, kcal:40,  protein:1,  carbs:9,  fat:0 },
  { id:"v13", cat:"Verduras",  name:"Zapallo cocido",         serving:"100g",        grams:100, kcal:26,  protein:1,  carbs:6,  fat:0 },
  { id:"v14", cat:"Verduras",  name:"Choclo cocido",          serving:"1 mazorca",   grams:100, kcal:86,  protein:3,  carbs:19, fat:1 },
  { id:"v15", cat:"Verduras",  name:"Pepino",                 serving:"1/2 unidad",  grams:100, kcal:15,  protein:1,  carbs:4,  fat:0 },
  { id:"v16", cat:"Verduras",  name:"Pimiento morrón",        serving:"1 unidad",    grams:120, kcal:30,  protein:1,  carbs:7,  fat:0 },
  { id:"v17", cat:"Verduras",  name:"Espárragos cocidos",     serving:"6 tallos",    grams:90,  kcal:20,  protein:2,  carbs:4,  fat:0 },
  { id:"v18", cat:"Verduras",  name:"Acelga cocida",          serving:"1 taza",      grams:175, kcal:35,  protein:3,  carbs:7,  fat:0 },
  { id:"v19", cat:"Verduras",  name:"Berenjena cocida",       serving:"100g",        grams:100, kcal:35,  protein:1,  carbs:8,  fat:0 },
  { id:"v20", cat:"Verduras",  name:"Apio",                   serving:"1 tallo",     grams:40,  kcal:6,   protein:0,  carbs:1,  fat:0 },
  { id:"v21", cat:"Verduras",  name:"Repollitos de Bruselas", serving:"100g",        grams:100, kcal:43,  protein:3,  carbs:9,  fat:0 },
  { id:"v22", cat:"Verduras",  name:"Coliflor cocida",        serving:"1 taza",      grams:124, kcal:29,  protein:2,  carbs:5,  fat:0 },
  { id:"v23", cat:"Verduras",  name:"Remolacha cocida",       serving:"1 mediana",   grams:80,  kcal:37,  protein:1,  carbs:8,  fat:0 },

  // ── FRUTAS ───────────────────────────────────────────────────────────
  { id:"fr1", cat:"Frutas",    name:"Manzana",                serving:"1 mediana",   grams:150, kcal:78,  protein:0,  carbs:21, fat:0 },
  { id:"fr2", cat:"Frutas",    name:"Banana",                 serving:"1 mediana",   grams:120, kcal:107, protein:1,  carbs:27, fat:0 },
  { id:"fr3", cat:"Frutas",    name:"Naranja",                serving:"1 mediana",   grams:130, kcal:62,  protein:1,  carbs:15, fat:0 },
  { id:"fr4", cat:"Frutas",    name:"Mandarina",              serving:"1 unidad",    grams:100, kcal:53,  protein:1,  carbs:13, fat:0 },
  { id:"fr5", cat:"Frutas",    name:"Pera",                   serving:"1 mediana",   grams:150, kcal:86,  protein:1,  carbs:23, fat:0 },
  { id:"fr6", cat:"Frutas",    name:"Durazno",                serving:"1 mediano",   grams:130, kcal:51,  protein:1,  carbs:12, fat:0 },
  { id:"fr7", cat:"Frutas",    name:"Mango",                  serving:"1/2 unidad",  grams:100, kcal:60,  protein:1,  carbs:15, fat:0 },
  { id:"fr8", cat:"Frutas",    name:"Kiwi",                   serving:"1 unidad",    grams:75,  kcal:44,  protein:1,  carbs:11, fat:0 },
  { id:"fr9", cat:"Frutas",    name:"Frutillas",              serving:"1 taza",      grams:150, kcal:48,  protein:1,  carbs:12, fat:0 },
  { id:"fr10",cat:"Frutas",    name:"Uvas",                   serving:"1 taza",      grams:150, kcal:104, protein:1,  carbs:27, fat:0 },
  { id:"fr11",cat:"Frutas",    name:"Sandía",                 serving:"2 tajadas",   grams:280, kcal:84,  protein:2,  carbs:21, fat:0 },
  { id:"fr12",cat:"Frutas",    name:"Melón",                  serving:"1 tajada",    grams:200, kcal:68,  protein:2,  carbs:16, fat:0 },
  { id:"fr13",cat:"Frutas",    name:"Ananá (piña)",           serving:"1 rodaja",    grams:100, kcal:50,  protein:1,  carbs:13, fat:0 },
  { id:"fr14",cat:"Frutas",    name:"Limón",                  serving:"1 unidad",    grams:60,  kcal:17,  protein:1,  carbs:5,  fat:0 },
  { id:"fr15",cat:"Frutas",    name:"Ciruela",                serving:"2 unidades",  grams:80,  kcal:38,  protein:1,  carbs:10, fat:0 },
  { id:"fr16",cat:"Frutas",    name:"Arándanos",              serving:"1 puñado",    grams:80,  kcal:46,  protein:1,  carbs:12, fat:0 },
  { id:"fr17",cat:"Frutas",    name:"Pomelo",                 serving:"1/2 unidad",  grams:120, kcal:39,  protein:1,  carbs:10, fat:0 },

  // ── LEGUMBRES ────────────────────────────────────────────────────────
  { id:"l1",  cat:"Legumbres", name:"Lentejas cocidas",       serving:"1 taza",      grams:200, kcal:230, protein:18, carbs:40, fat:1 },
  { id:"l2",  cat:"Legumbres", name:"Garbanzos cocidos",      serving:"1 taza",      grams:200, kcal:280, protein:15, carbs:45, fat:4 },
  { id:"l3",  cat:"Legumbres", name:"Porotos negros cocidos", serving:"1 taza",      grams:200, kcal:228, protein:15, carbs:41, fat:1 },
  { id:"l4",  cat:"Legumbres", name:"Porotos blancos cocidos",serving:"1 taza",      grams:200, kcal:254, protein:17, carbs:45, fat:1 },
  { id:"l5",  cat:"Legumbres", name:"Edamame",                serving:"1 taza",      grams:155, kcal:188, protein:18, carbs:14, fat:8 },
  { id:"l6",  cat:"Legumbres", name:"Arvejas cocidas",        serving:"1 taza",      grams:160, kcal:134, protein:9,  carbs:25, fat:0 },

  // ── FRUTOS SECOS / SEMILLAS ──────────────────────────────────────────
  { id:"n1",  cat:"Frutos secos", name:"Almendras",           serving:"30g (1 puñado)",grams:30, kcal:173, protein:6, carbs:6,  fat:15 },
  { id:"n2",  cat:"Frutos secos", name:"Nueces",              serving:"30g",         grams:30,  kcal:196, protein:5,  carbs:4,  fat:20 },
  { id:"n3",  cat:"Frutos secos", name:"Maní tostado",        serving:"30g",         grams:30,  kcal:171, protein:8,  carbs:5,  fat:15 },
  { id:"n4",  cat:"Frutos secos", name:"Mantequilla de maní", serving:"1 cda 15g",   grams:15,  kcal:94,  protein:4,  carbs:3,  fat:8 },
  { id:"n5",  cat:"Frutos secos", name:"Castañas de cajú",    serving:"30g",         grams:30,  kcal:157, protein:5,  carbs:9,  fat:12 },
  { id:"n6",  cat:"Frutos secos", name:"Semillas de chía",    serving:"1 cda 15g",   grams:15,  kcal:72,  protein:2,  carbs:5,  fat:5 },
  { id:"n7",  cat:"Frutos secos", name:"Semillas de lino",    serving:"1 cda 15g",   grams:15,  kcal:74,  protein:3,  carbs:4,  fat:6 },
  { id:"n8",  cat:"Frutos secos", name:"Semillas de girasol", serving:"30g",         grams:30,  kcal:173, protein:5,  carbs:6,  fat:15 },

  // ── ACEITES Y GRASAS ─────────────────────────────────────────────────
  { id:"o1",  cat:"Aceites",   name:"Aceite de oliva",        serving:"1 cda 15ml",  grams:14,  kcal:119, protein:0,  carbs:0,  fat:14 },
  { id:"o2",  cat:"Aceites",   name:"Aceite de girasol",      serving:"1 cda 15ml",  grams:14,  kcal:124, protein:0,  carbs:0,  fat:14 },
  { id:"o3",  cat:"Aceites",   name:"Manteca",                serving:"1 cda 10g",   grams:10,  kcal:72,  protein:0,  carbs:0,  fat:8 },
  { id:"o4",  cat:"Aceites",   name:"Palta (aguacate)",       serving:"1/2 unidad",  grams:75,  kcal:120, protein:1,  carbs:6,  fat:11 },
  { id:"o5",  cat:"Aceites",   name:"Crema de leche",         serving:"2 cdas 30ml", grams:30,  kcal:103, protein:1,  carbs:1,  fat:11 },
  { id:"o6",  cat:"Aceites",   name:"Mayonesa",               serving:"1 cda 15g",   grams:15,  kcal:94,  protein:0,  carbs:1,  fat:10 },

  // ── BEBIDAS E INFUSIONES ─────────────────────────────────────────────
  // Infusiones calientes
  { id:"bv1",  cat:"Bebidas",  name:"Agua",                        serving:"1 vaso 250ml",   grams:250,  kcal:0,   protein:0,  carbs:0,  fat:0 },
  { id:"bv2",  cat:"Bebidas",  name:"Mate (sin azúcar)",           serving:"1 cebadura",     grams:250,  kcal:2,   protein:0,  carbs:0,  fat:0 },
  { id:"bv3",  cat:"Bebidas",  name:"Mate con azúcar",             serving:"1 cebadura",     grams:250,  kcal:20,  protein:0,  carbs:5,  fat:0 },
  { id:"bv4",  cat:"Bebidas",  name:"Mate cocido (sin azúcar)",    serving:"1 taza 200ml",   grams:200,  kcal:2,   protein:0,  carbs:0,  fat:0 },
  { id:"bv5",  cat:"Bebidas",  name:"Mate cocido con azúcar",      serving:"1 taza 200ml",   grams:200,  kcal:30,  protein:0,  carbs:7,  fat:0 },
  { id:"bv6",  cat:"Bebidas",  name:"Café negro (sin azúcar)",     serving:"1 taza 200ml",   grams:200,  kcal:5,   protein:0,  carbs:0,  fat:0 },
  { id:"bv7",  cat:"Bebidas",  name:"Café con azúcar",             serving:"1 taza 200ml",   grams:200,  kcal:25,  protein:0,  carbs:6,  fat:0 },
  { id:"bv8",  cat:"Bebidas",  name:"Café con leche",              serving:"1 taza 250ml",   grams:250,  kcal:80,  protein:4,  carbs:8,  fat:3 },
  { id:"bv9",  cat:"Bebidas",  name:"Cortado",                     serving:"1 taza 100ml",   grams:100,  kcal:30,  protein:2,  carbs:3,  fat:1 },
  { id:"bv10", cat:"Bebidas",  name:"Cappuccino",                  serving:"1 taza 180ml",   grams:180,  kcal:75,  protein:4,  carbs:7,  fat:3 },
  { id:"bv11", cat:"Bebidas",  name:"Latte (café con leche grande)",serving:"1 vaso 350ml",  grams:350,  kcal:140, protein:8,  carbs:14, fat:5 },
  { id:"bv12", cat:"Bebidas",  name:"Té negro (sin azúcar)",       serving:"1 taza 240ml",   grams:240,  kcal:2,   protein:0,  carbs:0,  fat:0 },
  { id:"bv13", cat:"Bebidas",  name:"Té negro con azúcar",         serving:"1 taza 240ml",   grams:240,  kcal:22,  protein:0,  carbs:6,  fat:0 },
  { id:"bv14", cat:"Bebidas",  name:"Té verde (sin azúcar)",       serving:"1 taza 240ml",   grams:240,  kcal:2,   protein:0,  carbs:0,  fat:0 },
  { id:"bv15", cat:"Bebidas",  name:"Té de manzanilla",            serving:"1 taza 240ml",   grams:240,  kcal:2,   protein:0,  carbs:0,  fat:0 },
  { id:"bv16", cat:"Bebidas",  name:"Té de menta",                 serving:"1 taza 240ml",   grams:240,  kcal:2,   protein:0,  carbs:0,  fat:0 },
  { id:"bv17", cat:"Bebidas",  name:"Té de jengibre y limón",      serving:"1 taza 240ml",   grams:240,  kcal:5,   protein:0,  carbs:1,  fat:0 },
  { id:"bv18", cat:"Bebidas",  name:"Té de tilo",                  serving:"1 taza 240ml",   grams:240,  kcal:1,   protein:0,  carbs:0,  fat:0 },
  { id:"bv19", cat:"Bebidas",  name:"Té de boldo",                 serving:"1 taza 240ml",   grams:240,  kcal:1,   protein:0,  carbs:0,  fat:0 },
  { id:"bv20", cat:"Bebidas",  name:"Té de rosa mosqueta",         serving:"1 taza 240ml",   grams:240,  kcal:3,   protein:0,  carbs:1,  fat:0 },
  { id:"bv21", cat:"Bebidas",  name:"Té de anís",                  serving:"1 taza 240ml",   grams:240,  kcal:5,   protein:0,  carbs:1,  fat:0 },
  { id:"bv22", cat:"Bebidas",  name:"Cacao (con leche)",           serving:"1 taza 250ml",   grams:250,  kcal:130, protein:5,  carbs:20, fat:4 },
  // Jugos y bebidas frías
  { id:"bv23", cat:"Bebidas",  name:"Jugo de naranja natural",     serving:"1 vaso 250ml",   grams:250,  kcal:110, protein:2,  carbs:26, fat:0 },
  { id:"bv24", cat:"Bebidas",  name:"Jugo de manzana",             serving:"1 vaso 250ml",   grams:250,  kcal:115, protein:0,  carbs:28, fat:0 },
  { id:"bv25", cat:"Bebidas",  name:"Jugo de pomelo",              serving:"1 vaso 250ml",   grams:250,  kcal:95,  protein:1,  carbs:22, fat:0 },
  { id:"bv26", cat:"Bebidas",  name:"Jugo de zanahoria",           serving:"1 vaso 250ml",   grams:250,  kcal:95,  protein:2,  carbs:22, fat:0 },
  { id:"bv27", cat:"Bebidas",  name:"Jugo verde (espinaca + manzana)", serving:"1 vaso 300ml", grams:300, kcal:80,  protein:2,  carbs:18, fat:0 },
  { id:"bv28", cat:"Bebidas",  name:"Limonada (con azúcar)",       serving:"1 vaso 300ml",   grams:300,  kcal:100, protein:0,  carbs:25, fat:0 },
  { id:"bv29", cat:"Bebidas",  name:"Limonada (sin azúcar)",       serving:"1 vaso 300ml",   grams:300,  kcal:15,  protein:0,  carbs:4,  fat:0 },
  { id:"bv30", cat:"Bebidas",  name:"Agua de coco",                serving:"1 vaso 330ml",   grams:330,  kcal:60,  protein:1,  carbs:14, fat:0 },
  { id:"bv31", cat:"Bebidas",  name:"Leche chocolatada",           serving:"1 vaso 250ml",   grams:250,  kcal:190, protein:7,  carbs:30, fat:5 },
  { id:"bv32", cat:"Bebidas",  name:"Licuado de banana",           serving:"1 vaso 300ml",   grams:300,  kcal:220, protein:8,  carbs:38, fat:3 },
  { id:"bv33", cat:"Bebidas",  name:"Licuado de frutilla",         serving:"1 vaso 300ml",   grams:300,  kcal:130, protein:5,  carbs:24, fat:2 },
  { id:"bv34", cat:"Bebidas",  name:"Smoothie verde",              serving:"1 vaso 350ml",   grams:350,  kcal:140, protein:4,  carbs:28, fat:2 },
  // Leches vegetales
  { id:"bv35", cat:"Bebidas",  name:"Leche de avena",              serving:"1 vaso 250ml",   grams:250,  kcal:130, protein:3,  carbs:23, fat:3 },
  { id:"bv36", cat:"Bebidas",  name:"Leche de almendras",          serving:"1 vaso 250ml",   grams:250,  kcal:40,  protein:1,  carbs:3,  fat:3 },
  { id:"bv37", cat:"Bebidas",  name:"Leche de soja",               serving:"1 vaso 250ml",   grams:250,  kcal:105, protein:7,  carbs:8,  fat:4 },
  { id:"bv38", cat:"Bebidas",  name:"Leche de coco",               serving:"1 vaso 250ml",   grams:250,  kcal:140, protein:1,  carbs:4,  fat:14 },
  // Gaseosas y bebidas envasadas
  { id:"bv39", cat:"Bebidas",  name:"Coca-Cola",                   serving:"1 lata 354ml",   grams:354,  kcal:140, protein:0,  carbs:39, fat:0 },
  { id:"bv40", cat:"Bebidas",  name:"Gaseosa cola light/zero",     serving:"1 lata 354ml",   grams:354,  kcal:0,   protein:0,  carbs:0,  fat:0 },
  { id:"bv41", cat:"Bebidas",  name:"Gaseosa naranja (Fanta)",     serving:"1 lata 354ml",   grams:354,  kcal:160, protein:0,  carbs:43, fat:0 },
  { id:"bv42", cat:"Bebidas",  name:"Agua saborizada",             serving:"1 botella 500ml",grams:500,  kcal:40,  protein:0,  carbs:10, fat:0 },
  { id:"bv43", cat:"Bebidas",  name:"Bebida isotónica (Gatorade)", serving:"1 botella 500ml",grams:500,  kcal:130, protein:0,  carbs:34, fat:0 },
  { id:"bv44", cat:"Bebidas",  name:"Bebida energizante (Red Bull)",serving:"1 lata 250ml",  grams:250,  kcal:110, protein:1,  carbs:27, fat:0 },
  { id:"bv45", cat:"Bebidas",  name:"Agua tónica",                 serving:"1 lata 354ml",   grams:354,  kcal:130, protein:0,  carbs:34, fat:0 },
  // Alcohólicas
  { id:"bv46", cat:"Bebidas",  name:"Cerveza",                     serving:"1 lata 354ml",   grams:354,  kcal:153, protein:2,  carbs:13, fat:0 },
  { id:"bv47", cat:"Bebidas",  name:"Cerveza sin alcohol",         serving:"1 lata 354ml",   grams:354,  kcal:70,  protein:1,  carbs:14, fat:0 },
  { id:"bv48", cat:"Bebidas",  name:"Vino tinto",                  serving:"1 copa 150ml",   grams:150,  kcal:125, protein:0,  carbs:4,  fat:0 },
  { id:"bv49", cat:"Bebidas",  name:"Vino blanco",                 serving:"1 copa 150ml",   grams:150,  kcal:120, protein:0,  carbs:4,  fat:0 },
  { id:"bv50", cat:"Bebidas",  name:"Fernet con Coca",             serving:"1 trago 250ml",  grams:250,  kcal:200, protein:0,  carbs:26, fat:0 },
  { id:"bv51", cat:"Bebidas",  name:"Clericó",                     serving:"1 copa 200ml",   grams:200,  kcal:140, protein:0,  carbs:14, fat:0 },

  // ── COMIDAS ARGENTINAS / PREPARACIONES ──────────────────────────────
  { id:"a1",  cat:"Comidas ARG", name:"Empanada de carne",    serving:"1 unidad",    grams:100, kcal:250, protein:12, carbs:24, fat:12 },
  { id:"a2",  cat:"Comidas ARG", name:"Empanada de humita",   serving:"1 unidad",    grams:90,  kcal:220, protein:5,  carbs:32, fat:8 },
  { id:"a3",  cat:"Comidas ARG", name:"Empanada de queso y cebolla","serving":"1 unidad",grams:90,kcal:240,protein:7, carbs:23, fat:13 },
  { id:"a4",  cat:"Comidas ARG", name:"Pizza (feta)",         serving:"1 porción",   grams:100, kcal:266, protein:11, carbs:33, fat:10 },
  { id:"a5",  cat:"Comidas ARG", name:"Tarta de verdura",     serving:"1 porción",   grams:130, kcal:250, protein:8,  carbs:22, fat:14 },
  { id:"a6",  cat:"Comidas ARG", name:"Guiso de lentejas",    serving:"1 plato",     grams:300, kcal:330, protein:20, carbs:50, fat:5 },
  { id:"a7",  cat:"Comidas ARG", name:"Locro",                serving:"1 plato",     grams:300, kcal:420, protein:22, carbs:45, fat:14 },
  { id:"a8",  cat:"Comidas ARG", name:"Sopa de verduras",     serving:"1 plato",     grams:300, kcal:80,  protein:3,  carbs:15, fat:1 },
  { id:"a9",  cat:"Comidas ARG", name:"Tallarines c/salsa",   serving:"1 plato",     grams:300, kcal:380, protein:12, carbs:68, fat:6 },
  { id:"a10", cat:"Comidas ARG", name:"Milanesa napolitana",  serving:"1 unidad",    grams:180, kcal:430, protein:32, carbs:20, fat:22 },
  { id:"a11", cat:"Comidas ARG", name:"Pollo a la española",  serving:"1 porción",   grams:200, kcal:310, protein:34, carbs:8,  fat:15 },
  { id:"a12", cat:"Comidas ARG", name:"Albóndigas c/salsa",   serving:"4 unidades",  grams:200, kcal:380, protein:28, carbs:18, fat:22 },
  { id:"a13", cat:"Comidas ARG", name:"Pancho (hot dog)",     serving:"1 unidad",    grams:120, kcal:290, protein:11, carbs:26, fat:16 },
  { id:"a14", cat:"Comidas ARG", name:"Choripán",             serving:"1 unidad",    grams:180, kcal:490, protein:18, carbs:36, fat:30 },

  // ── PROTEÍNAS SUPLEMENTOS ────────────────────────────────────────────
  { id:"s1",  cat:"Suplementos", name:"Whey protein",         serving:"1 scoop 30g", grams:30,  kcal:120, protein:24, carbs:2,  fat:2 },
  { id:"s2",  cat:"Suplementos", name:"Whey isolado",         serving:"1 scoop 25g", grams:25,  kcal:100, protein:23, carbs:1,  fat:1 },
  { id:"s3",  cat:"Suplementos", name:"Caseína",              serving:"1 scoop 30g", grams:30,  kcal:110, protein:24, carbs:2,  fat:1 },
  { id:"s4",  cat:"Suplementos", name:"Proteína vegana",      serving:"1 scoop 30g", grams:30,  kcal:115, protein:20, carbs:5,  fat:3 },
  { id:"s5",  cat:"Suplementos", name:"Gainer (hipercalórico)","serving":"1 scoop 80g",grams:80, kcal:300, protein:15, carbs:60, fat:3 },
  { id:"s6",  cat:"Suplementos", name:"Creatina",             serving:"1 cucharita 5g",grams:5, kcal:0,   protein:0,  carbs:0,  fat:0 },
  { id:"s7",  cat:"Suplementos", name:"BCAA en polvo",        serving:"1 scoop 8g",  grams:8,   kcal:20,  protein:4,  carbs:0,  fat:0 },

  // ── SNACKS / DULCES ──────────────────────────────────────────────────
  { id:"sw1", cat:"Snacks",    name:"Alfajor de maicena",     serving:"1 unidad",    grams:50,  kcal:200, protein:2,  carbs:32, fat:8 },
  { id:"sw2", cat:"Snacks",    name:"Alfajor de chocolate",   serving:"1 unidad",    grams:55,  kcal:240, protein:3,  carbs:32, fat:12 },
  { id:"sw3", cat:"Snacks",    name:"Galletitas Oreo",        serving:"3 unidades",  grams:36,  kcal:160, protein:2,  carbs:25, fat:7 },
  { id:"sw4", cat:"Snacks",    name:"Chocolate amargo 70%",   serving:"2 cuadraditos",grams:20, kcal:110, protein:2,  carbs:8,  fat:8 },
  { id:"sw5", cat:"Snacks",    name:"Dulce de leche",         serving:"1 cda 20g",   grams:20,  kcal:65,  protein:1,  carbs:13, fat:1 },
  { id:"sw6", cat:"Snacks",    name:"Papas fritas de bolsa",  serving:"1 porción",   grams:30,  kcal:160, protein:2,  carbs:16, fat:10 },
  { id:"sw7", cat:"Snacks",    name:"Barritas de cereal",     serving:"1 unidad",    grams:30,  kcal:120, protein:2,  carbs:22, fat:3 },
  { id:"sw8", cat:"Snacks",    name:"Helado cremoso",         serving:"1 bocha",     grams:100, kcal:200, protein:3,  carbs:25, fat:10 },
  { id:"sw9", cat:"Snacks",    name:"Medialunas",             serving:"2 unidades",  grams:80,  kcal:320, protein:6,  carbs:40, fat:16 },
  { id:"sw10",cat:"Snacks",    name:"Budín inglés (1 feta)",  serving:"1 rebanada",  grams:40,  kcal:130, protein:2,  carbs:20, fat:5 },

  // ── CONDIMENTOS / SALSAS ─────────────────────────────────────────────
  { id:"cn1", cat:"Condimentos",name:"Ketchup",               serving:"1 cda 15g",   grams:15,  kcal:15,  protein:0,  carbs:4,  fat:0 },
  { id:"cn2", cat:"Condimentos",name:"Mostaza",               serving:"1 cda 10g",   grams:10,  kcal:9,   protein:1,  carbs:1,  fat:0 },
  { id:"cn3", cat:"Condimentos",name:"Salsa de tomate",       serving:"2 cdas 30g",  grams:30,  kcal:20,  protein:1,  carbs:4,  fat:0 },
  { id:"cn4", cat:"Condimentos",name:"Hummus",                serving:"2 cdas 30g",  grams:30,  kcal:70,  protein:2,  carbs:6,  fat:5 },
  { id:"cn5", cat:"Condimentos",name:"Salsa chimichurri",     serving:"1 cda 15g",   grams:15,  kcal:40,  protein:0,  carbs:1,  fat:4 },

  // ── VERDURAS ────────────────────────────────────────────────────────
  { id:"verd-zanahoria",   cat:"Verduras", name:"Zanahoria",              serving:"100g", grams:100, kcal:41,  protein:0.9, carbs:9.6, fat:0.2 },
  { id:"verd-brocoli",     cat:"Verduras", name:"Brócoli",                serving:"100g", grams:100, kcal:34,  protein:2.8, carbs:6.6, fat:0.4 },
  { id:"verd-espinaca",    cat:"Verduras", name:"Espinaca",               serving:"100g", grams:100, kcal:23,  protein:2.9, carbs:3.6, fat:0.4 },
  { id:"verd-lechuga",     cat:"Verduras", name:"Lechuga",                serving:"100g", grams:100, kcal:15,  protein:1.4, carbs:2.9, fat:0.2 },
  { id:"verd-tomate",      cat:"Verduras", name:"Tomate",                 serving:"100g", grams:100, kcal:18,  protein:0.9, carbs:3.9, fat:0.2 },
  { id:"verd-cebolla",     cat:"Verduras", name:"Cebolla",                serving:"100g", grams:100, kcal:40,  protein:1.1, carbs:9.3, fat:0.1 },
  { id:"verd-ajo",         cat:"Verduras", name:"Ajo",                    serving:"100g", grams:100, kcal:149, protein:6.4, carbs:33,  fat:0.5 },
  { id:"verd-zapallo",     cat:"Verduras", name:"Zapallo",                serving:"100g", grams:100, kcal:26,  protein:1.0, carbs:6.5, fat:0.1 },
  { id:"verd-zucchini",    cat:"Verduras", name:"Zucchini / Calabacín",   serving:"100g", grams:100, kcal:17,  protein:1.2, carbs:3.1, fat:0.3 },
  { id:"verd-pimiento",    cat:"Verduras", name:"Pimiento rojo",          serving:"100g", grams:100, kcal:31,  protein:1.0, carbs:6.0, fat:0.3 },
  { id:"verd-pimiento-verde", cat:"Verduras", name:"Pimiento verde",      serving:"100g", grams:100, kcal:20,  protein:0.9, carbs:4.6, fat:0.2 },
  { id:"verd-berenjena",   cat:"Verduras", name:"Berenjena",              serving:"100g", grams:100, kcal:25,  protein:1.0, carbs:5.9, fat:0.2 },
  { id:"verd-coliflor",    cat:"Verduras", name:"Coliflor",               serving:"100g", grams:100, kcal:25,  protein:1.9, carbs:5.0, fat:0.3 },
  { id:"verd-repollo",     cat:"Verduras", name:"Repollo",                serving:"100g", grams:100, kcal:25,  protein:1.3, carbs:5.8, fat:0.1 },
  { id:"verd-apio",        cat:"Verduras", name:"Apio",                   serving:"100g", grams:100, kcal:16,  protein:0.7, carbs:3.0, fat:0.2 },
  { id:"verd-pepino",      cat:"Verduras", name:"Pepino",                 serving:"100g", grams:100, kcal:15,  protein:0.7, carbs:3.6, fat:0.1 },
  { id:"verd-remolacha",   cat:"Verduras", name:"Remolacha",              serving:"100g", grams:100, kcal:43,  protein:1.6, carbs:9.6, fat:0.2 },
  { id:"verd-esparragos",  cat:"Verduras", name:"Espárragos",             serving:"100g", grams:100, kcal:20,  protein:2.2, carbs:3.9, fat:0.1 },
  { id:"verd-choclo",      cat:"Verduras", name:"Choclo / Maíz",          serving:"100g", grams:100, kcal:86,  protein:3.3, carbs:19,  fat:1.4 },
  { id:"verd-arvejas",     cat:"Verduras", name:"Arvejas frescas",        serving:"100g", grams:100, kcal:81,  protein:5.4, carbs:14,  fat:0.4 },
  { id:"verd-batata",      cat:"Verduras", name:"Batata / Boniato",       serving:"100g", grams:100, kcal:86,  protein:1.6, carbs:20,  fat:0.1 },
  { id:"verd-acelga",      cat:"Verduras", name:"Acelga",                 serving:"100g", grams:100, kcal:19,  protein:1.8, carbs:3.7, fat:0.2 },
  { id:"verd-rucula",      cat:"Verduras", name:"Rúcula",                 serving:"100g", grams:100, kcal:25,  protein:2.6, carbs:3.7, fat:0.7 },
  { id:"verd-champinon",   cat:"Verduras", name:"Champiñones",            serving:"100g", grams:100, kcal:22,  protein:3.1, carbs:3.3, fat:0.3 },
  { id:"verd-papa-cocida", cat:"Verduras", name:"Papa cocida",            serving:"100g", grams:100, kcal:87,  protein:1.9, carbs:20,  fat:0.1 },
  { id:"verd-calabaza",   cat:"Verduras", name:"Calabaza",               serving:"100g", grams:100, kcal:26,  protein:1.0, carbs:6.5, fat:0.1 },
  { id:"verd-kabutia",    cat:"Verduras", name:"Kabütiá / Zapallo japonés", serving:"100g", grams:100, kcal:34,  protein:1.1, carbs:8.3, fat:0.1 },
  { id:"verd-nabo",       cat:"Verduras", name:"Nabo",                   serving:"100g", grams:100, kcal:28,  protein:0.9, carbs:6.4, fat:0.1 },
  { id:"verd-puerro",     cat:"Verduras", name:"Puerro",                 serving:"100g", grams:100, kcal:61,  protein:1.5, carbs:14,  fat:0.3 },
  { id:"verd-radicheta",  cat:"Verduras", name:"Radicheta / Achicoria",  serving:"100g", grams:100, kcal:23,  protein:1.7, carbs:4.7, fat:0.3 },
  { id:"verd-hinojo",     cat:"Verduras", name:"Hinojo",                 serving:"100g", grams:100, kcal:31,  protein:1.2, carbs:7.3, fat:0.2 },
  { id:"verd-alcaucil",   cat:"Verduras", name:"Alcaucil / Alcachofa",   serving:"100g", grams:100, kcal:47,  protein:3.3, carbs:10,  fat:0.2 },
  { id:"verd-berro",      cat:"Verduras", name:"Berro",                  serving:"100g", grams:100, kcal:11,  protein:2.3, carbs:1.3, fat:0.1 },
  { id:"verd-papa-frita", cat:"Verduras", name:"Papa frita (al horno)",  serving:"100g", grams:100, kcal:152, protein:2.7, carbs:28,  fat:4.0 },
  { id:"verd-bok-choy",   cat:"Verduras", name:"Bok choy / Col china",   serving:"100g", grams:100, kcal:13,  protein:1.5, carbs:2.2, fat:0.2 },
  { id:"verd-coles-bru",  cat:"Verduras", name:"Coles de Bruselas",      serving:"100g", grams:100, kcal:43,  protein:3.4, carbs:8.9, fat:0.3 },
  { id:"verd-ajoporro",   cat:"Verduras", name:"Cebollín / Cebolla de verdeo", serving:"100g", grams:100, kcal:32, protein:1.8, carbs:7.3, fat:0.2 },

  // ── FRUTAS ──────────────────────────────────────────────────────────
  { id:"frut-banana",   cat:"Frutas", name:"Banana",                    serving:"100g", grams:100, kcal:89,  protein:1.1, carbs:23,  fat:0.3 },
  { id:"frut-manzana",  cat:"Frutas", name:"Manzana",                   serving:"100g", grams:100, kcal:52,  protein:0.3, carbs:14,  fat:0.2 },
  { id:"frut-naranja",  cat:"Frutas", name:"Naranja",                   serving:"100g", grams:100, kcal:47,  protein:0.9, carbs:12,  fat:0.1 },
  { id:"frut-pera",     cat:"Frutas", name:"Pera",                      serving:"100g", grams:100, kcal:57,  protein:0.4, carbs:15,  fat:0.1 },
  { id:"frut-durazno",  cat:"Frutas", name:"Durazno / Melocotón",       serving:"100g", grams:100, kcal:39,  protein:0.9, carbs:10,  fat:0.3 },
  { id:"frut-uva",      cat:"Frutas", name:"Uva",                       serving:"100g", grams:100, kcal:69,  protein:0.7, carbs:18,  fat:0.2 },
  { id:"frut-frutilla", cat:"Frutas", name:"Frutilla / Fresa",          serving:"100g", grams:100, kcal:32,  protein:0.7, carbs:7.7, fat:0.3 },
  { id:"frut-sandia",   cat:"Frutas", name:"Sandía",                    serving:"100g", grams:100, kcal:30,  protein:0.6, carbs:7.6, fat:0.2 },
  { id:"frut-melon",    cat:"Frutas", name:"Melón",                     serving:"100g", grams:100, kcal:34,  protein:0.8, carbs:8.2, fat:0.2 },
  { id:"frut-palta",    cat:"Frutas", name:"Palta / Aguacate",          serving:"100g", grams:100, kcal:160, protein:2.0, carbs:8.5, fat:15  },
  { id:"frut-kiwi",     cat:"Frutas", name:"Kiwi",                      serving:"100g", grams:100, kcal:61,  protein:1.1, carbs:15,  fat:0.5 },
  { id:"frut-mango",    cat:"Frutas", name:"Mango",                     serving:"100g", grams:100, kcal:60,  protein:0.8, carbs:15,  fat:0.4 },
  { id:"frut-anana",    cat:"Frutas", name:"Ananá / Piña",              serving:"100g", grams:100, kcal:50,  protein:0.5, carbs:13,  fat:0.1 },
  { id:"frut-ciruela",  cat:"Frutas", name:"Ciruela",                   serving:"100g", grams:100, kcal:46,  protein:0.7, carbs:11,  fat:0.3 },
  { id:"frut-cereza",   cat:"Frutas", name:"Cerezas",                   serving:"100g", grams:100, kcal:63,  protein:1.1, carbs:16,  fat:0.2 },
  { id:"frut-pomelo",   cat:"Frutas", name:"Pomelo",                    serving:"100g", grams:100, kcal:42,  protein:0.8, carbs:11,  fat:0.1 },
  { id:"frut-limon",    cat:"Frutas", name:"Limón",                     serving:"100g", grams:100, kcal:29,  protein:1.1, carbs:9.3, fat:0.3 },
  { id:"frut-arandano", cat:"Frutas", name:"Arándanos / Blueberries",   serving:"100g", grams:100, kcal:57,  protein:0.7, carbs:14,  fat:0.3 },

  // ── CARNES ADICIONALES ───────────────────────────────────────────────
  { id:"carne-vac-lomo",      cat:"Carnes", name:"Lomo (ternera)",              serving:"100g", grams:100, kcal:143, protein:22, carbs:0, fat:5.5 },
  { id:"carne-vac-asado",     cat:"Carnes", name:"Asado (costillas)",           serving:"100g", grams:100, kcal:294, protein:19, carbs:0, fat:24  },
  { id:"carne-vac-hamburguesa",cat:"Carnes",name:"Hamburguesa vacuna",          serving:"100g", grams:100, kcal:245, protein:17, carbs:0, fat:19  },
  { id:"carne-cerdo-bondiola", cat:"Carnes",name:"Bondiola de cerdo",           serving:"100g", grams:100, kcal:280, protein:18, carbs:0, fat:23  },
  { id:"carne-cordero",        cat:"Carnes",name:"Cordero (pierna)",            serving:"100g", grams:100, kcal:258, protein:18, carbs:0, fat:20  },
  { id:"carne-pollo-suprema",  cat:"Carnes",name:"Suprema de pollo",            serving:"100g", grams:100, kcal:165, protein:31, carbs:0, fat:3.6 },
  { id:"carne-pollo-muslo",    cat:"Carnes",name:"Muslo de pollo con piel",     serving:"100g", grams:100, kcal:209, protein:18, carbs:0, fat:15  },
  { id:"carne-pollo-muslo-s",  cat:"Carnes",name:"Muslo de pollo sin piel",     serving:"100g", grams:100, kcal:157, protein:21, carbs:0, fat:8.0 },
  { id:"carne-pavo",           cat:"Carnes",name:"Pechuga de pavo",             serving:"100g", grams:100, kcal:135, protein:30, carbs:0, fat:1.0 },

  // ── PESCADOS ADICIONALES ─────────────────────────────────────────────
  { id:"pesc-salmon",      cat:"Pescados", name:"Salmón (filete)",              serving:"100g", grams:100, kcal:208, protein:20, carbs:0,   fat:13  },
  { id:"pesc-atun-agua",   cat:"Pescados", name:"Atún en lata (agua)",          serving:"100g", grams:100, kcal:116, protein:26, carbs:0,   fat:1.0 },
  { id:"pesc-atun-aceite", cat:"Pescados", name:"Atún en lata (aceite, escurrido)", serving:"100g", grams:100, kcal:198, protein:25, carbs:0, fat:10 },
  { id:"pesc-merluza",     cat:"Pescados", name:"Merluza",                      serving:"100g", grams:100, kcal:86,  protein:17, carbs:0,   fat:1.7 },
  { id:"pesc-sardina",     cat:"Pescados", name:"Sardinas en lata",             serving:"100g", grams:100, kcal:208, protein:25, carbs:0,   fat:12  },
  { id:"pesc-bacalao",     cat:"Pescados", name:"Bacalao",                      serving:"100g", grams:100, kcal:82,  protein:18, carbs:0,   fat:0.7 },
  { id:"pesc-caballa",     cat:"Pescados", name:"Caballa",                      serving:"100g", grams:100, kcal:205, protein:19, carbs:0,   fat:14  },
  { id:"pesc-langostinos", cat:"Pescados", name:"Langostinos",                  serving:"100g", grams:100, kcal:106, protein:20, carbs:1.5, fat:1.7 },
  { id:"pesc-mejillones",  cat:"Pescados", name:"Mejillones",                   serving:"100g", grams:100, kcal:86,  protein:12, carbs:3.7, fat:2.2 },
  { id:"pesc-pulpo",       cat:"Pescados", name:"Pulpo cocido",                 serving:"100g", grams:100, kcal:164, protein:30, carbs:4.4, fat:2.1 },
  { id:"pesc-calamar",     cat:"Pescados", name:"Calamar",                      serving:"100g", grams:100, kcal:92,  protein:16, carbs:3.1, fat:1.4 },

  // ── LEGUMBRES ────────────────────────────────────────────────────────
  { id:"leg-lentejas",     cat:"Legumbres", name:"Lentejas cocidas",            serving:"100g", grams:100, kcal:116, protein:9.0, carbs:20, fat:0.4 },
  { id:"leg-garbanzos",    cat:"Legumbres", name:"Garbanzos cocidos",           serving:"100g", grams:100, kcal:164, protein:8.9, carbs:27, fat:2.6 },
  { id:"leg-porotos-neg",  cat:"Legumbres", name:"Porotos negros cocidos",      serving:"100g", grams:100, kcal:132, protein:8.9, carbs:24, fat:0.5 },
  { id:"leg-porotos-col",  cat:"Legumbres", name:"Porotos colorados cocidos",   serving:"100g", grams:100, kcal:127, protein:8.7, carbs:23, fat:0.5 },
  { id:"leg-porotos-bla",  cat:"Legumbres", name:"Porotos blancos cocidos",     serving:"100g", grams:100, kcal:139, protein:9.7, carbs:25, fat:0.4 },
  { id:"leg-edamame",      cat:"Legumbres", name:"Edamame / Soja verde",        serving:"100g", grams:100, kcal:122, protein:11,  carbs:9.9,fat:5.2 },

  // ── LÁCTEOS ADICIONALES ──────────────────────────────────────────────
  { id:"lact-yogur-nat",   cat:"Lácteos", name:"Yogur natural entero",          serving:"100g", grams:100, kcal:61,  protein:3.5, carbs:4.7, fat:3.3 },
  { id:"lact-yogur-desc",  cat:"Lácteos", name:"Yogur descremado",              serving:"100g", grams:100, kcal:40,  protein:4.3, carbs:5.1, fat:0.4 },
  { id:"lact-qblanco",     cat:"Lácteos", name:"Queso blanco descremado",       serving:"100g", grams:100, kcal:72,  protein:11,  carbs:4.0, fat:0.8 },
  { id:"lact-qcheddar",    cat:"Lácteos", name:"Queso cheddar",                 serving:"100g", grams:100, kcal:403, protein:25,  carbs:1.3, fat:33  },
  { id:"lact-crema",       cat:"Lácteos", name:"Crema de leche",                serving:"100g", grams:100, kcal:340, protein:2.8, carbs:2.8, fat:36  },

  // ── HIDRATOS ADICIONALES ─────────────────────────────────────────────
  { id:"hidr-pan-int",     cat:"Harinas", name:"Pan integral",                  serving:"100g", grams:100, kcal:247, protein:8.5, carbs:48, fat:3.4 },
  { id:"hidr-pan-blanco",  cat:"Harinas", name:"Pan blanco / lactal",           serving:"100g", grams:100, kcal:265, protein:8.9, carbs:51, fat:3.2 },
  { id:"hidr-pasta-coc",   cat:"Harinas", name:"Pasta cocida (fideos)",         serving:"100g", grams:100, kcal:158, protein:5.8, carbs:31, fat:0.9 },
  { id:"hidr-pasta-int",   cat:"Harinas", name:"Pasta integral cocida",         serving:"100g", grams:100, kcal:174, protein:7.5, carbs:35, fat:0.8 },
  { id:"hidr-quinoa-coc",  cat:"Harinas", name:"Quinoa cocida",                 serving:"100g", grams:100, kcal:120, protein:4.4, carbs:22, fat:1.9 },
  { id:"hidr-avena",       cat:"Harinas", name:"Avena (seca)",                  serving:"100g", grams:100, kcal:389, protein:17,  carbs:66, fat:7.0 },
  { id:"hidr-avena-coc",   cat:"Harinas", name:"Avena cocida (porridge)",       serving:"100g", grams:100, kcal:71,  protein:2.5, carbs:12, fat:1.5 },
  { id:"hidr-tortilla",    cat:"Harinas", name:"Tortilla de harina",            serving:"100g", grams:100, kcal:306, protein:7.8, carbs:51, fat:8.1 },
  { id:"hidr-pan-arabe",   cat:"Harinas", name:"Pan de pita / árabe",           serving:"100g", grams:100, kcal:275, protein:9.1, carbs:56, fat:1.2 },
  { id:"hidr-polenta-coc", cat:"Harinas", name:"Polenta cocida",                serving:"100g", grams:100, kcal:70,  protein:1.7, carbs:15, fat:0.3 },
  { id:"hidr-granola",     cat:"Harinas", name:"Granola",                       serving:"100g", grams:100, kcal:471, protein:10,  carbs:64, fat:20  },

  // ── FRUTOS SECOS Y ACEITES ───────────────────────────────────────────
  { id:"frns-almendras",   cat:"Frutos Secos", name:"Almendras",                serving:"100g", grams:100, kcal:579, protein:21, carbs:22, fat:50  },
  { id:"frns-nueces",      cat:"Frutos Secos", name:"Nueces",                   serving:"100g", grams:100, kcal:654, protein:15, carbs:14, fat:65  },
  { id:"frns-mani",        cat:"Frutos Secos", name:"Maní / Cacahuetes",        serving:"100g", grams:100, kcal:567, protein:26, carbs:16, fat:49  },
  { id:"frns-mantmani",    cat:"Frutos Secos", name:"Mantequilla de maní",      serving:"100g", grams:100, kcal:588, protein:25, carbs:20, fat:50  },
  { id:"frns-semchia",     cat:"Frutos Secos", name:"Semillas de chía",         serving:"100g", grams:100, kcal:486, protein:17, carbs:42, fat:31  },
  { id:"frns-semlino",     cat:"Frutos Secos", name:"Semillas de lino",         serving:"100g", grams:100, kcal:534, protein:18, carbs:29, fat:42  },
  { id:"frns-aceite-oliva",cat:"Aceites",      name:"Aceite de oliva",          serving:"100ml",grams:100, kcal:884, protein:0,  carbs:0,  fat:100 },
  { id:"frns-aceite-coco", cat:"Aceites",      name:"Aceite de coco",           serving:"100ml",grams:100, kcal:862, protein:0,  carbs:0,  fat:100 },

];

// ── Búsqueda con score de relevancia ────────────────────────────────────────
export function searchFoods(query, limit = 20) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return FOOD_DB
    .map(food => {
      const name = food.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const cat  = food.cat.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      let score = 0;
      if (name.startsWith(q))        score += 10;
      else if (name.includes(q))     score += 6;
      else if (cat.includes(q))      score += 2;
      // word-level match
      const words = q.split(" ");
      words.forEach(w => { if (w && name.includes(w)) score += 3; });
      return { ...food, _score: score };
    })
    .filter(f => f._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}

export const FOOD_CATEGORIES = [...new Set(FOOD_DB.map(f => f.cat))];
