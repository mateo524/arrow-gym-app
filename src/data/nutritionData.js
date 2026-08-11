// Shared nutrition data — imported by NutritionPage and CoachPage

export const CATS = [
  { id:"",            label:"Todo"       },
  { id:"desayuno",    label:"Desayuno"   },
  { id:"colacion",    label:"Colación"   },
  { id:"merienda",    label:"Merienda"   },
  { id:"entrada",     label:"Entrada"    },
  { id:"principal",   label:"Principal"  },
  { id:"postre",      label:"Postre"     },
  { id:"fruta",       label:"Fruta"      },
  { id:"verdura",     label:"Verdura"    },
  { id:"proteina",    label:"Proteína"   },
  { id:"carbohidrato",label:"Carbs"      },
  { id:"lacteo",      label:"Lácteo"     },
  { id:"legumbre",    label:"Legumbre"   },
  { id:"grasa",       label:"Grasas"     },
  { id:"bebida",      label:"Bebida"     },
  { id:"suplemento",  label:"Suplemento" },
  { id:"rapida",      label:"Rápida"     },
];

export const FOOD_DB = [
  // -- Proteínas ------------------------------------------------
  { cat:"proteina", name:"Pechuga de pollo",          kcal:165, protein:31,  carbs:0,   fat:3.6  },
  { cat:"proteina", name:"Muslo de pollo s/piel",     kcal:177, protein:24,  carbs:0,   fat:8.5  },
  { cat:"proteina", name:"Pollo entero asado",        kcal:239, protein:27,  carbs:0,   fat:14   },
  { cat:"proteina", name:"Pollo desmechado",          kcal:152, protein:29,  carbs:0,   fat:3.7  },
  { cat:"proteina", name:"Carne molida magra",        kcal:215, protein:26,  carbs:0,   fat:12   },
  { cat:"proteina", name:"Carne molida regular",      kcal:254, protein:24,  carbs:0,   fat:17   },
  { cat:"proteina", name:"Bife de lomo",              kcal:207, protein:26,  carbs:0,   fat:11   },
  { cat:"proteina", name:"Bife de chorizo",           kcal:289, protein:25,  carbs:0,   fat:20   },
  { cat:"proteina", name:"Cuadril",                   kcal:175, protein:28,  carbs:0,   fat:6.5  },
  { cat:"proteina", name:"Nalga",                     kcal:160, protein:28,  carbs:0,   fat:5    },
  { cat:"proteina", name:"Tapa de asado",             kcal:310, protein:23,  carbs:0,   fat:24   },
  { cat:"proteina", name:"Vacío",                     kcal:190, protein:27,  carbs:0,   fat:9    },
  { cat:"proteina", name:"Entraña",                   kcal:230, protein:24,  carbs:0,   fat:14   },
  { cat:"proteina", name:"Carne vacuna (asado)",      kcal:245, protein:22,  carbs:0,   fat:17   },
  { cat:"proteina", name:"Costillas de cerdo",        kcal:275, protein:24,  carbs:0,   fat:19   },
  { cat:"proteina", name:"Lomo de cerdo",             kcal:143, protein:26,  carbs:0,   fat:4    },
  { cat:"proteina", name:"Atún en lata (agua)",       kcal:116, protein:26,  carbs:0,   fat:1    },
  { cat:"proteina", name:"Atún en lata (aceite)",     kcal:198, protein:25,  carbs:0,   fat:11   },
  { cat:"proteina", name:"Salmón",                    kcal:208, protein:20,  carbs:0,   fat:13   },
  { cat:"proteina", name:"Merluza",                   kcal:82,  protein:17,  carbs:0,   fat:1    },
  { cat:"proteina", name:"Trucha",                    kcal:148, protein:21,  carbs:0,   fat:6.6  },
  { cat:"proteina", name:"Bacalao",                   kcal:105, protein:23,  carbs:0,   fat:0.9  },
  { cat:"proteina", name:"Pez espada",                kcal:121, protein:20,  carbs:0,   fat:4    },
  { cat:"proteina", name:"Sardinas en lata",          kcal:208, protein:25,  carbs:0,   fat:11   },
  { cat:"proteina", name:"Surimi / palitos de mar",   kcal:99,  protein:15,  carbs:4,   fat:2.5  },
  { cat:"proteina", name:"Langostinos",               kcal:99,  protein:24,  carbs:0,   fat:0.3  },
  { cat:"proteina", name:"Calamar",                   kcal:92,  protein:16,  carbs:3,   fat:1.4  },
  { cat:"proteina", name:"Huevo entero",              kcal:155, protein:13,  carbs:1,   fat:11,  unit:true, unitWeight:55 },
  { cat:"proteina", name:"Clara de huevo",            kcal:52,  protein:11,  carbs:0,   fat:0.2, unit:true, unitWeight:35 },
  { cat:"proteina", name:"Pechuga de pavo",           kcal:135, protein:30,  carbs:0,   fat:1    },
  { cat:"proteina", name:"Jamón cocido (feta)",       kcal:42,  protein:7,   carbs:0.5, fat:1.3  },
  { cat:"proteina", name:"Jamón serrano (feta)",      kcal:60,  protein:8,   carbs:0,   fat:3    },
  { cat:"proteina", name:"Salame (feta)",             kcal:90,  protein:5,   carbs:0.5, fat:7.5  },
  // -- Lácteos --------------------------------------------------
  { cat:"lacteo", name:"Queso cottage",             kcal:98,  protein:11,  carbs:3,   fat:4.5  },
  { cat:"lacteo", name:"Yogur griego (0%)",         kcal:59,  protein:10,  carbs:4,   fat:0.4  },
  { cat:"lacteo", name:"Yogur griego (entero)",     kcal:97,  protein:9,   carbs:4,   fat:5    },
  { cat:"lacteo", name:"Yogur natural descremado",  kcal:56,  protein:5,   carbs:7,   fat:0.3  },
  { cat:"lacteo", name:"Yogur bebible (125ml)",     kcal:70,  protein:3,   carbs:12,  fat:1.2, drink:true },
  { cat:"lacteo", name:"Queso descremado",          kcal:102, protein:14,  carbs:1,   fat:5    },
  { cat:"lacteo", name:"Queso port salut",          kcal:291, protein:22,  carbs:1,   fat:22   },
  { cat:"lacteo", name:"Queso mozzarella",          kcal:280, protein:22,  carbs:2,   fat:20   },
  { cat:"lacteo", name:"Queso brie",                kcal:334, protein:21,  carbs:0.5, fat:28   },
  { cat:"lacteo", name:"Queso cheddar",             kcal:402, protein:25,  carbs:1.3, fat:33   },
  { cat:"lacteo", name:"Queso parmesano",           kcal:431, protein:38,  carbs:3,   fat:29   },
  { cat:"lacteo", name:"Queso crema",               kcal:342, protein:6,   carbs:4,   fat:34   },
  { cat:"lacteo", name:"Ricota",                    kcal:174, protein:11,  carbs:3,   fat:13   },
  { cat:"lacteo", name:"Leche descremada (250ml)",  kcal:85,  protein:8.5, carbs:12.5,fat:0.3, drink:true },
  { cat:"lacteo", name:"Leche entera (250ml)",      kcal:153, protein:8,   carbs:12,  fat:8,   drink:true },
  { cat:"lacteo", name:"Leche de avena (250ml)",    kcal:120, protein:3,   carbs:20,  fat:3,   drink:true },
  { cat:"lacteo", name:"Leche de almendra (250ml)", kcal:60,  protein:1,   carbs:8,   fat:2.5, drink:true },
  { cat:"lacteo", name:"Crema de leche",            kcal:340, protein:2,   carbs:3,   fat:36   },
  { cat:"lacteo", name:"Manteca",                   kcal:717, protein:0.9, carbs:0.1, fat:81   },
  { cat:"lacteo", name:"Kéfir natural",             kcal:61,  protein:3.4, carbs:4.5, fat:3.3, drink:true },
  // -- Bebidas --------------------------------------------------
  { cat:"bebida", name:"Agua",                      kcal:0,   protein:0,   carbs:0,   fat:0,   drink:true },
  { cat:"bebida", name:"Jugo de naranja natural",   kcal:45,  protein:0.7, carbs:10.4,fat:0.2, drink:true },
  { cat:"bebida", name:"Leche entera",              kcal:61,  protein:3.2, carbs:4.8, fat:3.3, drink:true },
  { cat:"bebida", name:"Leche descremada",          kcal:34,  protein:3.4, carbs:5,   fat:0.1, drink:true },
  { cat:"bebida", name:"Kéfir natural",             kcal:61,  protein:3.4, carbs:4.5, fat:3.3, drink:true },
  { cat:"bebida", name:"Té verde",                  kcal:2,   protein:0,   carbs:0.4, fat:0,   drink:true },
  { cat:"bebida", name:"Café negro",                kcal:2,   protein:0.3, carbs:0,   fat:0,   drink:true },
  { cat:"bebida", name:"Jugo de manzana natural",   kcal:46,  protein:0.1, carbs:11,  fat:0.1, drink:true },
  // -- Carbohidratos --------------------------------------------
  { cat:"carbohidrato", name:"Arroz blanco cocido",     kcal:130, protein:2.7, carbs:28,  fat:0.3  },
  { cat:"carbohidrato", name:"Arroz integral cocido",   kcal:122, protein:2.5, carbs:25,  fat:1    },
  { cat:"carbohidrato", name:"Arroz yamani",            kcal:118, protein:2.8, carbs:24,  fat:0.8  },
  { cat:"carbohidrato", name:"Avena seca",              kcal:389, protein:17,  carbs:66,  fat:7    },
  { cat:"carbohidrato", name:"Avena cocida",            kcal:71,  protein:2.5, carbs:12,  fat:1.5  },
  { cat:"carbohidrato", name:"Pan integral (rebanada)", kcal:247, protein:9,   carbs:46,  fat:3.4  },
  { cat:"carbohidrato", name:"Pan blanco (rebanada)",   kcal:265, protein:9,   carbs:49,  fat:3.2  },
  { cat:"carbohidrato", name:"Pan árabe/pita",          kcal:275, protein:9,   carbs:56,  fat:1.2  },
  { cat:"carbohidrato", name:"Pan de molde (rebanada)", kcal:79,  protein:2.7, carbs:15,  fat:0.9  },
  { cat:"carbohidrato", name:"Pan lactal integral",     kcal:240, protein:9,   carbs:44,  fat:3    },
  { cat:"carbohidrato", name:"Tostada integral",        kcal:325, protein:10,  carbs:56,  fat:5    },
  { cat:"carbohidrato", name:"Papa hervida",            kcal:87,  protein:1.9, carbs:20,  fat:0.1  },
  { cat:"carbohidrato", name:"Papa al horno",           kcal:93,  protein:2.5, carbs:21,  fat:0.1  },
  { cat:"carbohidrato", name:"Papas fritas caseras",    kcal:312, protein:3.4, carbs:41,  fat:15   },
  { cat:"carbohidrato", name:"Batata/boniato",          kcal:86,  protein:1.6, carbs:20,  fat:0.1  },
  { cat:"carbohidrato", name:"Pasta cocida",            kcal:131, protein:5,   carbs:25,  fat:1.1  },
  { cat:"carbohidrato", name:"Pasta integral cocida",   kcal:124, protein:5.3, carbs:24,  fat:1.1  },
  { cat:"carbohidrato", name:"Fideos de arroz cocidos", kcal:109, protein:0.9, carbs:25,  fat:0.2  },
  { cat:"carbohidrato", name:"Tallarines cocidos",      kcal:138, protein:5.4, carbs:27,  fat:1.4  },
  { cat:"carbohidrato", name:"ñoquis cocidos",          kcal:130, protein:3.5, carbs:27,  fat:1    },
  { cat:"carbohidrato", name:"Quinoa cocida",           kcal:120, protein:4.4, carbs:21,  fat:1.9  },
  { cat:"carbohidrato", name:"Polenta cocida",          kcal:70,  protein:1.6, carbs:15,  fat:0.3  },
  { cat:"carbohidrato", name:"Cuscús cocido",           kcal:112, protein:3.8, carbs:23,  fat:0.2  },
  { cat:"carbohidrato", name:"Mijo cocido",             kcal:119, protein:3.5, carbs:23,  fat:1    },
  { cat:"carbohidrato", name:"Chipa (c/u)",             kcal:100, protein:3,   carbs:13,  fat:4,   unit:true, unitWeight:40 },
  { cat:"carbohidrato", name:"Maíz cocido",             kcal:108, protein:3.4, carbs:23,  fat:1.3  },
  { cat:"carbohidrato", name:"Miel (1 cda)",            kcal:64,  protein:0.1, carbs:17,  fat:0    },
  { cat:"carbohidrato", name:"Mermelada (1 cda)",       kcal:49,  protein:0.1, carbs:13,  fat:0    },
  { cat:"carbohidrato", name:"Dulce de leche (1 cda)",  kcal:70,  protein:1.5, carbs:13,  fat:1.5  },
  // -- Grasas saludables ----------------------------------------
  { cat:"grasa", name:"Palta/aguacate",          kcal:160, protein:2,   carbs:9,   fat:15   },
  { cat:"grasa", name:"Almendras",               kcal:579, protein:21,  carbs:22,  fat:50   },
  { cat:"grasa", name:"Nueces",                  kcal:654, protein:15,  carbs:14,  fat:65   },
  { cat:"grasa", name:"Castañas de cajú",        kcal:553, protein:18,  carbs:30,  fat:44   },
  { cat:"grasa", name:"Maní tostado",            kcal:585, protein:24,  carbs:16,  fat:50   },
  { cat:"grasa", name:"Manteca de maní",          kcal:588, protein:25,  carbs:20,  fat:50   },
  { cat:"grasa", name:"Pasta de almendras",      kcal:614, protein:21,  carbs:19,  fat:56   },
  { cat:"grasa", name:"Aceite de oliva",         kcal:884, protein:0,   carbs:0,   fat:100  },
  { cat:"grasa", name:"Aceite de coco",          kcal:862, protein:0,   carbs:0,   fat:100  },
  { cat:"grasa", name:"Aceite de girasol",       kcal:884, protein:0,   carbs:0,   fat:100  },
  { cat:"grasa", name:"Semillas de chía",        kcal:486, protein:17,  carbs:42,  fat:31   },
  { cat:"grasa", name:"Semillas de lino",        kcal:534, protein:18,  carbs:29,  fat:42   },
  { cat:"grasa", name:"Semillas de girasol",     kcal:584, protein:21,  carbs:20,  fat:51   },
  { cat:"grasa", name:"Semillas de calabaza",    kcal:559, protein:30,  carbs:11,  fat:49   },
  { cat:"grasa", name:"Pistacho (30g)",          kcal:173, protein:6,   carbs:9,   fat:14   },
  { cat:"grasa", name:"Aceitunas (10 unid)",     kcal:59,  protein:0.4, carbs:1.6, fat:6    },
  // -- Legumbres ------------------------------------------------
  { cat:"legumbre", name:"Lentejas cocidas",        kcal:116, protein:9,   carbs:20,  fat:0.4  },
  { cat:"legumbre", name:"Garbanzos cocidos",       kcal:164, protein:8.9, carbs:27,  fat:2.6  },
  { cat:"legumbre", name:"Porotos negros cocidos",  kcal:132, protein:8.9, carbs:24,  fat:0.5  },
  { cat:"legumbre", name:"Porotos blancos cocidos", kcal:139, protein:9.7, carbs:25,  fat:0.5  },
  { cat:"legumbre", name:"Porotos colorados",       kcal:127, protein:8.7, carbs:23,  fat:0.5  },
  { cat:"legumbre", name:"Edamame",                 kcal:122, protein:11,  carbs:10,  fat:5    },
  { cat:"legumbre", name:"Arvejas cocidas",         kcal:81,  protein:5.4, carbs:14,  fat:0.4  },
  { cat:"legumbre", name:"Soja cocida",             kcal:173, protein:17,  carbs:10,  fat:9    },
  { cat:"legumbre", name:"Hummus (100g)",           kcal:177, protein:8,   carbs:20,  fat:8    },
  // -- Frutas ---------------------------------------------------
  { cat:"fruta", name:"Banana",           kcal:89,  protein:1.1, carbs:23,  fat:0.3, unit:true, unitWeight:120 },
  { cat:"fruta", name:"Manzana",          kcal:52,  protein:0.3, carbs:14,  fat:0.2, unit:true, unitWeight:150 },
  { cat:"fruta", name:"Naranja",          kcal:47,  protein:0.9, carbs:12,  fat:0.1, unit:true, unitWeight:180 },
  { cat:"fruta", name:"Pera",             kcal:57,  protein:0.4, carbs:15,  fat:0.1, unit:true, unitWeight:160 },
  { cat:"fruta", name:"Mandarina",        kcal:53,  protein:0.8, carbs:13,  fat:0.3, unit:true, unitWeight:100 },
  { cat:"fruta", name:"Pomelo",           kcal:42,  protein:0.8, carbs:11,  fat:0.1, unit:true, unitWeight:250 },
  { cat:"fruta", name:"Limón",            kcal:29,  protein:1.1, carbs:9,   fat:0.3, unit:true, unitWeight:80  },
  { cat:"fruta", name:"Uvas",             kcal:69,  protein:0.7, carbs:18,  fat:0.2  },
  { cat:"fruta", name:"Sandía",           kcal:30,  protein:0.6, carbs:8,   fat:0.2  },
  { cat:"fruta", name:"Melón",            kcal:34,  protein:0.8, carbs:8,   fat:0.2  },
  { cat:"fruta", name:"Durazno",          kcal:39,  protein:0.9, carbs:10,  fat:0.3, unit:true, unitWeight:130 },
  { cat:"fruta", name:"Kiwi",             kcal:61,  protein:1.1, carbs:15,  fat:0.5, unit:true, unitWeight:90  },
  { cat:"fruta", name:"Frutillas",        kcal:32,  protein:0.7, carbs:8,   fat:0.3  },
  { cat:"fruta", name:"Arándanos",        kcal:57,  protein:0.7, carbs:14,  fat:0.3  },
  { cat:"fruta", name:"Frambuesas",       kcal:52,  protein:1.2, carbs:12,  fat:0.7  },
  { cat:"fruta", name:"Ciruela",          kcal:46,  protein:0.7, carbs:11,  fat:0.3, unit:true, unitWeight:65  },
  { cat:"fruta", name:"Cereza",           kcal:63,  protein:1.1, carbs:16,  fat:0.2  },
  { cat:"fruta", name:"Ananás/Piña",       kcal:50,  protein:0.5, carbs:13,  fat:0.1  },
  { cat:"fruta", name:"Mango",            kcal:60,  protein:0.8, carbs:15,  fat:0.4  },
  { cat:"fruta", name:"Papaya",           kcal:43,  protein:0.5, carbs:11,  fat:0.3  },
  { cat:"fruta", name:"Higo",             kcal:74,  protein:0.8, carbs:19,  fat:0.3, unit:true, unitWeight:50  },
  { cat:"fruta", name:"Maracuyá",         kcal:97,  protein:2.2, carbs:23,  fat:0.7  },
  { cat:"fruta", name:"Uva pasa (30g)",   kcal:85,  protein:0.9, carbs:22,  fat:0.1  },
  { cat:"fruta", name:"Coco rallado (30g)",kcal:100, protein:1,  carbs:4,   fat:9    },
  // -- Verduras -------------------------------------------------
  { cat:"verdura", name:"Brócoli",              kcal:34,  protein:2.8, carbs:7,   fat:0.4  },
  { cat:"verdura", name:"Espinaca",             kcal:23,  protein:2.9, carbs:3.6, fat:0.4  },
  { cat:"verdura", name:"Kale",                 kcal:49,  protein:4.3, carbs:9,   fat:0.9  },
  { cat:"verdura", name:"Rúcula",               kcal:25,  protein:2.6, carbs:3.7, fat:0.7  },
  { cat:"verdura", name:"Lechuga",              kcal:15,  protein:1.4, carbs:2.9, fat:0.2  },
  { cat:"verdura", name:"Acelga",               kcal:19,  protein:1.8, carbs:3.7, fat:0.2  },
  { cat:"verdura", name:"Tomate",               kcal:18,  protein:0.9, carbs:3.9, fat:0.2  },
  { cat:"verdura", name:"Tomate cherry",        kcal:18,  protein:0.9, carbs:3.9, fat:0.2  },
  { cat:"verdura", name:"Pepino",               kcal:16,  protein:0.7, carbs:3.6, fat:0.1  },
  { cat:"verdura", name:"Zanahoria",            kcal:41,  protein:0.9, carbs:10,  fat:0.2  },
  { cat:"verdura", name:"Remolacha",            kcal:43,  protein:1.6, carbs:10,  fat:0.2  },
  { cat:"verdura", name:"Cebolla",              kcal:40,  protein:1.1, carbs:9,   fat:0.1  },
  { cat:"verdura", name:"Puerro",               kcal:61,  protein:1.5, carbs:14,  fat:0.3  },
  { cat:"verdura", name:"Ajo",                  kcal:149, protein:6.4, carbs:33,  fat:0.5  },
  { cat:"verdura", name:"Pimiento rojo",        kcal:31,  protein:1,   carbs:6,   fat:0.3  },
  { cat:"verdura", name:"Pimiento verde",       kcal:20,  protein:0.9, carbs:4.6, fat:0.2  },
  { cat:"verdura", name:"Berenjena",            kcal:25,  protein:1,   carbs:6,   fat:0.2  },
  { cat:"verdura", name:"Zucchini",             kcal:17,  protein:1.2, carbs:3.1, fat:0.3  },
  { cat:"verdura", name:"Zapallo",              kcal:26,  protein:1,   carbs:6.5, fat:0.1  },
  { cat:"verdura", name:"Cabutia/Zapallo anco", kcal:40,  protein:1,   carbs:10,  fat:0.1  },
  { cat:"verdura", name:"Zapallo tronco",       kcal:22,  protein:0.8, carbs:5.5, fat:0.1  },
  { cat:"verdura", name:"Zapallito de tronco",  kcal:17,  protein:1.2, carbs:3.1, fat:0.3  },
  { cat:"verdura", name:"Coliflor",             kcal:25,  protein:1.9, carbs:5,   fat:0.3  },
  { cat:"verdura", name:"Repollo",              kcal:25,  protein:1.3, carbs:5.8, fat:0.1  },
  { cat:"verdura", name:"Apio",                 kcal:16,  protein:0.7, carbs:3,   fat:0.2  },
  { cat:"verdura", name:"Champiñón",            kcal:22,  protein:3.1, carbs:3.3, fat:0.3  },
  { cat:"verdura", name:"Chaucha (poroto verde)",kcal:31, protein:1.8, carbs:7,   fat:0.2  },
  { cat:"verdura", name:"Arvejas frescas",      kcal:81,  protein:5.4, carbs:14,  fat:0.4  },
  { cat:"verdura", name:"Choclo desgranado",    kcal:96,  protein:3.4, carbs:21,  fat:1.5  },
  { cat:"verdura", name:"Espárrago",            kcal:20,  protein:2.2, carbs:3.9, fat:0.1  },
  { cat:"verdura", name:"Alcaucil",             kcal:47,  protein:3.3, carbs:11,  fat:0.2  },
  { cat:"verdura", name:"Palmito",              kcal:20,  protein:2,   carbs:3,   fat:0.2  },
  { cat:"verdura", name:"Rábano",               kcal:16,  protein:0.7, carbs:3.4, fat:0.1  },
  // -- Desayunos ------------------------------------------------
  { cat:"desayuno", name:"Medialunas (c/u)",            kcal:160, protein:3.5, carbs:22,  fat:6.5, unit:true, unitWeight:50  },
  { cat:"desayuno", name:"Medialunas de manteca (x2)",  kcal:320, protein:7,   carbs:44,  fat:13,  unit:true, unitWeight:100 },
  { cat:"desayuno", name:"Tostadas con mermelada",      kcal:195, protein:3.5, carbs:38,  fat:2    },
  { cat:"desayuno", name:"Tostadas con manteca",        kcal:220, protein:4,   carbs:30,  fat:9    },
  { cat:"desayuno", name:"Tostada con palta",           kcal:210, protein:4.5, carbs:22,  fat:11   },
  { cat:"desayuno", name:"Tostada proteica (pan+huevo+queso)",kcal:280,protein:18,carbs:28,fat:10  },
  { cat:"desayuno", name:"Avena con frutas y miel",     kcal:130, protein:4.5, carbs:24,  fat:2.5  },
  { cat:"desayuno", name:"Avena overnight (150g)",      kcal:200, protein:9,   carbs:32,  fat:5    },
  { cat:"desayuno", name:"Yogur con granola",            kcal:230, protein:8,   carbs:32,  fat:8    },
  { cat:"desayuno", name:"Yogur griego con granola",     kcal:240, protein:11,  carbs:28,  fat:9    },
  { cat:"desayuno", name:"Yogur con granola y frutas",   kcal:270, protein:9,   carbs:38,  fat:8    },
  { cat:"desayuno", name:"Granola con yogur",            kcal:280, protein:8,   carbs:38,  fat:10   },
  { cat:"desayuno", name:"Granola (30g)",               kcal:132, protein:3,   carbs:20,  fat:5    },
  { cat:"desayuno", name:"Desayuno completo (avena+leche+banana)",kcal:350,protein:14,carbs:62,fat:5 },
  { cat:"desayuno", name:"Licuado de proteínas",        kcal:250, protein:28,  carbs:20,  fat:4    },
  { cat:"desayuno", name:"Licuado de banana y leche",   kcal:220, protein:7,   carbs:38,  fat:4    },
  { cat:"desayuno", name:"Omelette (2 huevos+queso)",   kcal:220, protein:18,  carbs:2,   fat:15   },
  { cat:"desayuno", name:"Revuelto de huevos (2)",      kcal:185, protein:14,  carbs:1.5, fat:14   },
  { cat:"desayuno", name:"Huevos revueltos con verduras",kcal:170,protein:13,  carbs:4,   fat:11   },
  { cat:"desayuno", name:"Panqueques (x2)",             kcal:280, protein:9,   carbs:40,  fat:9,   unit:true, unitWeight:100 },
  { cat:"desayuno", name:"Panqueques proteicos (x2)",   kcal:240, protein:16,  carbs:28,  fat:8,   unit:true, unitWeight:100 },
  { cat:"desayuno", name:"French toast (x2 rebanadas)", kcal:320, protein:12,  carbs:42,  fat:11   },
  { cat:"desayuno", name:"Muffin proteico",             kcal:210, protein:15,  carbs:22,  fat:7,   unit:true, unitWeight:80  },
  { cat:"desayuno", name:"Bowl de fruta con yogur",     kcal:140, protein:7,   carbs:24,  fat:2    },
  { cat:"desayuno", name:"Chia pudding (150g)",         kcal:210, protein:7,   carbs:18,  fat:13   },
  { cat:"desayuno", name:"Smoothie verde (espinaca+banana)",kcal:180,protein:6,carbs:32,  fat:3    },
  { cat:"desayuno", name:"Café con leche (200ml)",      kcal:64,  protein:4,   carbs:6,   fat:2,   drink:true },
  { cat:"desayuno", name:"Mate cocido con leche",       kcal:55,  protein:3.5, carbs:5.5, fat:2,   drink:true },
  // -- Meriendas ------------------------------------------------
  { cat:"merienda", name:"Facturas dulces (c/u)",       kcal:180, protein:3,   carbs:25,  fat:8,   unit:true, unitWeight:60  },
  { cat:"merienda", name:"Alfajor de chocolate",        kcal:350, protein:4,   carbs:50,  fat:14,  unit:true, unitWeight:50  },
  { cat:"merienda", name:"Alfajor triple",              kcal:380, protein:5,   carbs:54,  fat:15,  unit:true, unitWeight:65  },
  { cat:"merienda", name:"Alfajor de maicena",          kcal:220, protein:3,   carbs:38,  fat:6,   unit:true, unitWeight:45  },
  { cat:"merienda", name:"Galletitas de agua (c/u)",    kcal:21,  protein:0.5, carbs:3.5, fat:0.5, unit:true, unitWeight:8   },
  { cat:"merienda", name:"Galletitas dulces (c/u)",     kcal:45,  protein:0.6, carbs:6.5, fat:1.8, unit:true, unitWeight:12  },
  { cat:"merienda", name:"Galletitas de arroz (c/u)",   kcal:35,  protein:0.7, carbs:7.5, fat:0.3, unit:true, unitWeight:10  },
  { cat:"merienda", name:"Budín (porción 60g)",         kcal:220, protein:3.5, carbs:32,  fat:9    },
  { cat:"merienda", name:"Bizcochuelo (porción)",       kcal:230, protein:4,   carbs:34,  fat:9    },
  { cat:"merienda", name:"Muffin (c/u)",                kcal:270, protein:4,   carbs:38,  fat:11,  unit:true, unitWeight:80  },
  { cat:"merienda", name:"Bizcochitos de grasa",        kcal:450, protein:9,   carbs:60,  fat:20   },
  { cat:"merienda", name:"Barritas de cereal",          kcal:120, protein:2,   carbs:22,  fat:3,   unit:true, unitWeight:28  },
  { cat:"merienda", name:"Barra de proteínas",          kcal:200, protein:20,  carbs:18,  fat:6,   unit:true, unitWeight:60  },
  { cat:"merienda", name:"Tostado de jamón y queso",    kcal:340, protein:16,  carbs:32,  fat:14,  unit:true, unitWeight:140 },
  { cat:"merienda", name:"Turrón (30g)",                kcal:130, protein:3,   carbs:19,  fat:5    },
  { cat:"merienda", name:"Facturas de hojaldre (c/u)",  kcal:200, protein:3,   carbs:24,  fat:10,  unit:true, unitWeight:65  },
  { cat:"merienda", name:"Torta casera (porción)",      kcal:300, protein:4,   carbs:42,  fat:13   },
  { cat:"merienda", name:"Yogur con frutas",            kcal:120, protein:5,   carbs:20,  fat:2    },
  { cat:"merienda", name:"Fruta con queso (porción)",   kcal:130, protein:7,   carbs:16,  fat:4    },
  // -- Colaciones -----------------------------------------------
  { cat:"colacion", name:"Huevo duro",                  kcal:85,  protein:7,   carbs:0.5, fat:6,   unit:true, unitWeight:55  },
  { cat:"colacion", name:"Yogur griego + 1 fruta",      kcal:130, protein:10,  carbs:18,  fat:1    },
  { cat:"colacion", name:"Maní tostado (30g)",          kcal:176, protein:7,   carbs:5,   fat:15   },
  { cat:"colacion", name:"Mix de frutas secas (30g)",   kcal:175, protein:5,   carbs:8,   fat:14   },
  { cat:"colacion", name:"Pistacho (30g)",              kcal:173, protein:6,   carbs:9,   fat:14   },
  { cat:"colacion", name:"Hummus con verduras crudas",  kcal:120, protein:5,   carbs:14,  fat:5    },
  { cat:"colacion", name:"Hummus con pita",             kcal:220, protein:7,   carbs:32,  fat:8    },
  { cat:"colacion", name:"Queso cottage (150g)",        kcal:147, protein:17,  carbs:5,   fat:7    },
  { cat:"colacion", name:"Edamame (100g)",              kcal:122, protein:11,  carbs:10,  fat:5    },
  { cat:"colacion", name:"Fruta + manteca de maní",     kcal:185, protein:5,   carbs:22,  fat:9    },
  { cat:"colacion", name:"Palta con limón (½)",         kcal:120, protein:1.5, carbs:6,   fat:11   },
  { cat:"colacion", name:"Arroz con leche (150g)",      kcal:185, protein:5,   carbs:34,  fat:3.5  },
  { cat:"colacion", name:"Chocolate amargo (20g)",      kcal:114, protein:1.8, carbs:9,   fat:8    },
  { cat:"colacion", name:"Chips de papa (30g)",         kcal:160, protein:2,   carbs:15,  fat:10   },
  { cat:"colacion", name:"Palomitas/pochoclos (30g)",   kcal:110, protein:3,   carbs:19,  fat:3    },
  { cat:"colacion", name:"Dátiles (3 unid)",            kcal:66,  protein:0.5, carbs:18,  fat:0.1  },
  { cat:"colacion", name:"Pepino con hummus",           kcal:65,  protein:3,   carbs:9,   fat:2.5  },
  { cat:"colacion", name:"Chips de arroz (15g)",        kcal:57,  protein:1,   carbs:12,  fat:0.4  },
  { cat:"colacion", name:"Chocolate con leche (20g)",   kcal:107, protein:1.5, carbs:12,  fat:6    },
  // -- Entradas -------------------------------------------------
  { cat:"entrada", name:"Ensalada mixta c/huevo",      kcal:85,  protein:7,   carbs:5,   fat:4    },
  { cat:"entrada", name:"Ensalada César (sin pollo)",  kcal:140, protein:5,   carbs:10,  fat:9    },
  { cat:"entrada", name:"Ensalada caprese",            kcal:180, protein:10,  carbs:5,   fat:13   },
  { cat:"entrada", name:"Tabla de fiambres",           kcal:280, protein:16,  carbs:2,   fat:24   },
  { cat:"entrada", name:"Bruschetta (2 piezas)",       kcal:180, protein:5,   carbs:28,  fat:5    },
  { cat:"entrada", name:"Empanada de carne",           kcal:290, protein:12,  carbs:28,  fat:14,  unit:true, unitWeight:110 },
  { cat:"entrada", name:"Empanada de jamón y queso",   kcal:310, protein:14,  carbs:30,  fat:14,  unit:true, unitWeight:110 },
  { cat:"entrada", name:"Empanada de verdura",         kcal:250, protein:7,   carbs:30,  fat:11,  unit:true, unitWeight:100 },
  { cat:"entrada", name:"Empanada de humita",          kcal:240, protein:6,   carbs:34,  fat:9,   unit:true, unitWeight:100 },
  { cat:"entrada", name:"Provoleta (100g)",            kcal:320, protein:22,  carbs:1,   fat:26   },
  { cat:"entrada", name:"Tabla de quesos",             kcal:350, protein:20,  carbs:3,   fat:29   },
  { cat:"entrada", name:"Sopa de verduras",            kcal:45,  protein:2,   carbs:8,   fat:0.5  },
  { cat:"entrada", name:"Caldo de pollo (250ml)",      kcal:30,  protein:3,   carbs:2,   fat:1    },
  { cat:"entrada", name:"Sopa de tomate (200ml)",      kcal:70,  protein:2,   carbs:12,  fat:1.5  },
  { cat:"entrada", name:"Sopa de lentejas (200ml)",    kcal:130, protein:8,   carbs:18,  fat:2    },
  { cat:"entrada", name:"Gazpacho (200ml)",            kcal:50,  protein:1.5, carbs:10,  fat:0.5  },
  { cat:"entrada", name:"Ceviche (150g)",              kcal:100, protein:14,  carbs:8,   fat:1    },
  { cat:"entrada", name:"Croquetas de papa (x3)",      kcal:210, protein:4,   carbs:28,  fat:9    },
  { cat:"entrada", name:"Sopa paraguaya (porción)",    kcal:280, protein:8,   carbs:32,  fat:13   },
  { cat:"entrada", name:"Tabla de verduras asadas",    kcal:90,  protein:2.5, carbs:15,  fat:3    },
  { cat:"entrada", name:"Canelones de ricota",         kcal:210, protein:9,   carbs:22,  fat:9    },
  // -- Platos principales ---------------------------------------
  { cat:"principal", name:"Milanesa de carne (200g)",    kcal:500, protein:40,  carbs:24,  fat:24   },
  { cat:"principal", name:"Milanesa de pollo (200g)",    kcal:466, protein:44,  carbs:22,  fat:20   },
  { cat:"principal", name:"Milanesa napolitana",         kcal:310, protein:20,  carbs:14,  fat:18   },
  { cat:"principal", name:"Milanesa con papas fritas",   kcal:290, protein:16,  carbs:22,  fat:15   },
  { cat:"principal", name:"Milanesa de berenjena",       kcal:220, protein:6,   carbs:24,  fat:11   },
  { cat:"principal", name:"Asado (costilla, 200g)",      kcal:620, protein:46,  carbs:0,   fat:48   },
  { cat:"principal", name:"Arroz con pollo",             kcal:152, protein:12,  carbs:18,  fat:3    },
  { cat:"principal", name:"Arroz con carne molida",      kcal:165, protein:13,  carbs:19,  fat:5    },
  { cat:"principal", name:"Arroz con verduras",          kcal:135, protein:4,   carbs:25,  fat:2    },
  { cat:"principal", name:"Pollo al horno con papa",     kcal:155, protein:14,  carbs:14,  fat:4.5  },
  { cat:"principal", name:"Pollo al verdeo",             kcal:190, protein:20,  carbs:4,   fat:10   },
  { cat:"principal", name:"Pollo a la cacerola",         kcal:175, protein:18,  carbs:6,   fat:8    },
  { cat:"principal", name:"Pollo al limón",              kcal:160, protein:20,  carbs:3,   fat:7    },
  { cat:"principal", name:"Pollo teriyaki con arroz",    kcal:210, protein:18,  carbs:25,  fat:4    },
  { cat:"principal", name:"Fideos con salsa bolognesa",  kcal:180, protein:10,  carbs:22,  fat:5    },
  { cat:"principal", name:"Fideos con manteca",          kcal:200, protein:6,   carbs:28,  fat:7    },
  { cat:"principal", name:"Tallarines con pesto",        kcal:210, protein:7,   carbs:26,  fat:9    },
  { cat:"principal", name:"ñoquis con salsa",            kcal:190, protein:6,   carbs:30,  fat:5    },
  { cat:"principal", name:"Ravioles de carne",           kcal:220, protein:11,  carbs:26,  fat:7    },
  { cat:"principal", name:"Canelones de carne",          kcal:230, protein:14,  carbs:20,  fat:9    },
  { cat:"principal", name:"Lasaña de carne",             kcal:250, protein:15,  carbs:22,  fat:11   },
  { cat:"principal", name:"Pizza mozzarella (porción)",  kcal:272, protein:12,  carbs:32,  fat:10   },
  { cat:"principal", name:"Hamburguesa casera s/pan",    kcal:290, protein:26,  carbs:0,   fat:20,  unit:true, unitWeight:120 },
  { cat:"principal", name:"Hamburguesa completa",        kcal:550, protein:28,  carbs:40,  fat:28,  unit:true, unitWeight:200 },
  { cat:"principal", name:"Sándwich de milanesa",        kcal:420, protein:28,  carbs:38,  fat:14,  unit:true, unitWeight:220 },
  { cat:"principal", name:"Sándwich de pollo y lechuga", kcal:280, protein:22,  carbs:28,  fat:8,   unit:true, unitWeight:160 },
  { cat:"principal", name:"Sándwich de jamón y queso",   kcal:310, protein:18,  carbs:30,  fat:12,  unit:true, unitWeight:150 },
  { cat:"principal", name:"Sándwich de atún",            kcal:265, protein:20,  carbs:28,  fat:7,   unit:true, unitWeight:150 },
  { cat:"principal", name:"Tarta de verduras (porción)", kcal:220, protein:7,   carbs:20,  fat:12,  unit:true, unitWeight:150 },
  { cat:"principal", name:"Tarta de jamón y queso",      kcal:280, protein:12,  carbs:22,  fat:16,  unit:true, unitWeight:170 },
  { cat:"principal", name:"Tarta de pollo (porción)",    kcal:260, protein:14,  carbs:20,  fat:13,  unit:true, unitWeight:160 },
  { cat:"principal", name:"Tarta de atún",               kcal:245, protein:15,  carbs:20,  fat:11,  unit:true, unitWeight:155 },
  { cat:"principal", name:"Tarta de zapallitos",         kcal:195, protein:7,   carbs:18,  fat:10,  unit:true, unitWeight:145 },
  { cat:"principal", name:"Tarta de acelga",             kcal:200, protein:8,   carbs:19,  fat:10,  unit:true, unitWeight:150 },
  { cat:"principal", name:"Pizza mozzarella (porción)",  kcal:272, protein:12,  carbs:32,  fat:10,  unit:true, unitWeight:120 },
  { cat:"principal", name:"Pizza de jamón y morrón",     kcal:290, protein:13,  carbs:33,  fat:11,  unit:true, unitWeight:125 },
  { cat:"principal", name:"Pizza fugazzeta (porción)",   kcal:300, protein:11,  carbs:35,  fat:12,  unit:true, unitWeight:130 },
  { cat:"principal", name:"Pizza de calabresa",          kcal:285, protein:12,  carbs:32,  fat:12,  unit:true, unitWeight:125 },
  { cat:"principal", name:"Choripán",                    kcal:480, protein:18,  carbs:36,  fat:28,  unit:true, unitWeight:180 },
  { cat:"principal", name:"Pebete de jamón",             kcal:300, protein:14,  carbs:34,  fat:11,  unit:true, unitWeight:140 },
  { cat:"principal", name:"Tortilla de papas (porción)", kcal:195, protein:9,   carbs:18,  fat:9,   unit:true, unitWeight:130 },
  { cat:"principal", name:"Sándwich de lomito",          kcal:480, protein:30,  carbs:40,  fat:20,  unit:true, unitWeight:230 },
  { cat:"principal", name:"Sándwich club",               kcal:420, protein:25,  carbs:36,  fat:18,  unit:true, unitWeight:200 },
  { cat:"principal", name:"Sándwich de pavita",          kcal:270, protein:20,  carbs:28,  fat:8,   unit:true, unitWeight:155 },
  { cat:"principal", name:"Sándwich de roast beef",      kcal:380, protein:28,  carbs:32,  fat:14,  unit:true, unitWeight:190 },
  { cat:"principal", name:"Sándwich de queso y tomate",  kcal:240, protein:10,  carbs:30,  fat:9,   unit:true, unitWeight:140 },
  { cat:"principal", name:"Locro (plato 300g)",          kcal:270, protein:14,  carbs:30,  fat:9    },
  { cat:"principal", name:"Guiso de lentejas",           kcal:130, protein:8,   carbs:18,  fat:3    },
  { cat:"principal", name:"Guiso de arroz con pollo",    kcal:155, protein:12,  carbs:20,  fat:4    },
  { cat:"principal", name:"Estofado de res",             kcal:195, protein:18,  carbs:12,  fat:8    },
  { cat:"principal", name:"Curry de pollo",              kcal:185, protein:17,  carbs:10,  fat:8    },
  { cat:"principal", name:"Carbonada",                   kcal:170, protein:10,  carbs:20,  fat:6    },
  { cat:"principal", name:"Cazuela de mariscos",         kcal:145, protein:14,  carbs:10,  fat:5    },
  { cat:"principal", name:"Salmón al horno (200g)",      kcal:416, protein:40,  carbs:0,   fat:26   },
  { cat:"principal", name:"Pescado a la plancha (200g)", kcal:164, protein:34,  carbs:0,   fat:2    },
  { cat:"principal", name:"Puré de papas (con leche)",   kcal:104, protein:2.5, carbs:19,  fat:2.5  },
  { cat:"principal", name:"Bowl de arroz y atún",        kcal:148, protein:15,  carbs:18,  fat:1.5  },
  { cat:"principal", name:"Bowl proteico (arroz+pollo+verdura)", kcal:185, protein:22, carbs:20, fat:3 },
  { cat:"principal", name:"Ensalada de pollo",           kcal:135, protein:15,  carbs:6,   fat:5    },
  { cat:"principal", name:"Wok de verduras con pollo",   kcal:118, protein:13,  carbs:8,   fat:3.5  },
  { cat:"principal", name:"Wrap de pollo",               kcal:230, protein:18,  carbs:24,  fat:6,   unit:true, unitWeight:180 },
  { cat:"principal", name:"Shawarma/wrap árabe",         kcal:420, protein:22,  carbs:42,  fat:16,  unit:true, unitWeight:250 },
  { cat:"principal", name:"Burrito",                     kcal:490, protein:22,  carbs:60,  fat:16,  unit:true, unitWeight:280 },
  { cat:"principal", name:"Sushi (6 piezas)",            kcal:250, protein:12,  carbs:45,  fat:2    },
  { cat:"principal", name:"Risotto de champiñones",      kcal:180, protein:5,   carbs:28,  fat:6    },
  { cat:"principal", name:"Paella de mariscos",          kcal:165, protein:12,  carbs:22,  fat:4    },
  { cat:"principal", name:"Arroz con pollo y verduras",  kcal:148, protein:13,  carbs:17,  fat:3    },
  { cat:"principal", name:"Arroz con zapallo",           kcal:120, protein:2.5, carbs:26,  fat:0.5  },
  { cat:"principal", name:"Arroz con atún y maíz",       kcal:145, protein:13,  carbs:20,  fat:2    },
  { cat:"principal", name:"Fideos con salsa de tomate",  kcal:155, protein:5.5, carbs:28,  fat:2    },
  { cat:"principal", name:"Cazuela de pollo con verduras",kcal:160, protein:16,  carbs:12,  fat:5    },
  { cat:"principal", name:"Medallón de pollo (c/u)",     kcal:190, protein:20,  carbs:10,  fat:7,   unit:true, unitWeight:100 },
  { cat:"principal", name:"Nuggets de pollo (x6)",       kcal:290, protein:18,  carbs:22,  fat:14   },
  { cat:"principal", name:"Suprema a la Maryland",       kcal:380, protein:35,  carbs:20,  fat:16,  unit:true, unitWeight:200 },
  // -- Postres --------------------------------------------------
  { cat:"postre", name:"Flan casero (porción)",        kcal:150, protein:5,   carbs:24,  fat:4    },
  { cat:"postre", name:"Flan con dulce de leche",      kcal:220, protein:5,   carbs:38,  fat:5    },
  { cat:"postre", name:"Mousse de chocolate",          kcal:260, protein:4,   carbs:28,  fat:15   },
  { cat:"postre", name:"Torta de chocolate (porción)", kcal:380, protein:5,   carbs:50,  fat:18   },
  { cat:"postre", name:"Torta de queso (porción)",     kcal:320, protein:6,   carbs:30,  fat:20   },
  { cat:"postre", name:"Torta de manzana (porción)",   kcal:280, protein:3,   carbs:42,  fat:11   },
  { cat:"postre", name:"Helado de crema (2 bochas)",   kcal:260, protein:4,   carbs:32,  fat:13   },
  { cat:"postre", name:"Helado de agua (palito)",      kcal:80,  protein:0,   carbs:20,  fat:0    },
  { cat:"postre", name:"Tiramisu (porción)",           kcal:330, protein:6,   carbs:36,  fat:18   },
  { cat:"postre", name:"Cheesecake (porción)",         kcal:350, protein:6,   carbs:32,  fat:23   },
  { cat:"postre", name:"Brownie (porción 50g)",        kcal:220, protein:3,   carbs:28,  fat:11   },
  { cat:"postre", name:"Muffin de chocolate",          kcal:280, protein:4,   carbs:38,  fat:12,  unit:true, unitWeight:80  },
  { cat:"postre", name:"Churros (3 unid)",             kcal:240, protein:4,   carbs:34,  fat:10   },
  { cat:"postre", name:"Palitos de dulce de leche (c/u)",kcal:70,protein:1,   carbs:11,  fat:2.5, unit:true, unitWeight:20  },
  { cat:"postre", name:"Arroz con leche (150g)",       kcal:185, protein:5,   carbs:34,  fat:3.5  },
  { cat:"postre", name:"Budín de pan (porción)",       kcal:230, protein:6,   carbs:38,  fat:7    },
  { cat:"postre", name:"Panqueques con dulce de leche",kcal:380, protein:9,   carbs:58,  fat:12   },
  { cat:"postre", name:"Ensalada de frutas (200g)",    kcal:100, protein:1.5, carbs:25,  fat:0.5  },
  { cat:"postre", name:"Dulce de membrillo (30g)",     kcal:78,  protein:0.2, carbs:20,  fat:0    },
  // -- Bebidas --------------------------------------------------
  { cat:"bebida", name:"Café con leche (200ml)",       kcal:64,  protein:4,   carbs:6,   fat:2    },
  { cat:"bebida", name:"Mate cocido con leche",        kcal:55,  protein:3.5, carbs:5.5, fat:2    },
  { cat:"bebida", name:"Jugo de naranja natural",      kcal:45,  protein:0.7, carbs:10,  fat:0.2  },
  { cat:"bebida", name:"Jugo de manzana (200ml)",      kcal:90,  protein:0.2, carbs:23,  fat:0.2  },
  { cat:"bebida", name:"Jugo de mango (200ml)",        kcal:110, protein:0.8, carbs:26,  fat:0.4  },
  { cat:"bebida", name:"Leche chocolatada (250ml)",    kcal:160, protein:6,   carbs:27,  fat:3    },
  { cat:"bebida", name:"Batido de frutas (300ml)",     kcal:130, protein:2,   carbs:30,  fat:0.5  },
  { cat:"bebida", name:"Licuado de banana y leche",    kcal:220, protein:7,   carbs:38,  fat:4    },
  { cat:"bebida", name:"Gatorade/isotónica (500ml)",   kcal:140, protein:0,   carbs:35,  fat:0    },
  { cat:"bebida", name:"Agua con gas (500ml)",         kcal:0,   protein:0,   carbs:0,   fat:0    },
  { cat:"bebida", name:"Coca-Cola (350ml)",            kcal:140, protein:0,   carbs:39,  fat:0    },
  { cat:"bebida", name:"Coca-Cola Zero (350ml)",       kcal:1,   protein:0,   carbs:0,   fat:0    },
  { cat:"bebida", name:"Cerveza (330ml)",              kcal:155, protein:1.6, carbs:13,  fat:0    },
  { cat:"bebida", name:"Vino tinto (150ml)",           kcal:125, protein:0.1, carbs:4,   fat:0    },
  { cat:"bebida", name:"Vino blanco (150ml)",          kcal:121, protein:0.1, carbs:3.8, fat:0    },
  { cat:"bebida", name:"Té frío (500ml)",              kcal:60,  protein:0,   carbs:15,  fat:0    },
  // -- Suplementos ----------------------------------------------
  { cat:"suplemento", name:"Whey protein (scoop 30g)", kcal:120, protein:24,  carbs:3,   fat:2    },
  { cat:"suplemento", name:"Creatina (5g)",             kcal:0,   protein:0,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"BCAA (10g)",                kcal:40,  protein:9,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"Caseína (30g)",             kcal:110, protein:22,  carbs:4,   fat:1    },
  { cat:"suplemento", name:"Mass gainer (100g)",        kcal:380, protein:25,  carbs:60,  fat:4    },
  // -- Comidas rápidas ------------------------------------------
  { cat:"rapida", name:"Papas fritas (porción)",       kcal:320, protein:4,   carbs:40,  fat:16   },
  { cat:"rapida", name:"Pancho/hot dog",               kcal:310, protein:12,  carbs:28,  fat:17,  unit:true, unitWeight:120 },
  { cat:"rapida", name:"Taco",                         kcal:210, protein:10,  carbs:22,  fat:9,   unit:true, unitWeight:100 },
  { cat:"rapida", name:"Sándwich vegetal",             kcal:220, protein:8,   carbs:32,  fat:6,   unit:true, unitWeight:160 },
  { cat:"rapida", name:"Empanada frita (c/u)",         kcal:330, protein:11,  carbs:28,  fat:19,  unit:true, unitWeight:115 },
  { cat:"rapida", name:"Medialunas fritas (c/u)",      kcal:170, protein:3,   carbs:20,  fat:8.5, unit:true, unitWeight:55  },
  { cat:"rapida", name:"Sorrentinos de ricota (x4)",   kcal:280, protein:11,  carbs:36,  fat:9    },
  { cat:"rapida", name:"Porciones de pizza al corte",  kcal:270, protein:11,  carbs:33,  fat:10,  unit:true, unitWeight:120 },
  { cat:"rapida", name:"Hamburguesa doble (fast food)",kcal:590, protein:30,  carbs:44,  fat:30,  unit:true, unitWeight:230 },
  { cat:"rapida", name:"Pollo frito (presa c/u)",      kcal:290, protein:22,  carbs:12,  fat:17,  unit:true, unitWeight:130 },
  { cat:"rapida", name:"Papas en bastón al horno",     kcal:160, protein:2.5, carbs:26,  fat:5    },
  // -- Desayunos adicionales -------------------------------------
  { cat:"desayuno", name:"Bizcochos de grasa (c/u)",   kcal:130, protein:2.5, carbs:18,  fat:5.5, unit:true, unitWeight:45  },
  { cat:"desayuno", name:"Medialunas de grasa (c/u)",  kcal:145, protein:3,   carbs:19,  fat:6,   unit:true, unitWeight:45  },
  { cat:"desayuno", name:"Tostadas con ricota",        kcal:170, protein:8,   carbs:22,  fat:5    },
  { cat:"desayuno", name:"Tostadas con queso",         kcal:200, protein:9,   carbs:22,  fat:8    },
  { cat:"desayuno", name:"Bowl de yogur con granola",  kcal:260, protein:9,   carbs:36,  fat:8    },
  { cat:"desayuno", name:"Mate con galletas (3 unid)", kcal:90,  protein:1.5, carbs:14,  fat:3    },
  { cat:"desayuno", name:"Facturas surtidas (x2)",     kcal:360, protein:6,   carbs:50,  fat:16,  unit:true, unitWeight:120 },
  { cat:"desayuno", name:"Pan con dulce de leche",     kcal:210, protein:4,   carbs:38,  fat:4    },
  { cat:"desayuno", name:"Croissant (c/u)",            kcal:230, protein:4.5, carbs:26,  fat:12,  unit:true, unitWeight:80  },
  { cat:"desayuno", name:"Waffles (x2)",               kcal:310, protein:8,   carbs:42,  fat:12,  unit:true, unitWeight:130 },
  // -- Colaciones adicionales -------------------------------------
  { cat:"colacion", name:"Frutas secas mix (20g)",     kcal:114, protein:3,   carbs:6,   fat:9    },
  { cat:"colacion", name:"Barra de cereal y maní",     kcal:135, protein:3.5, carbs:20,  fat:5,   unit:true, unitWeight:35  },
  { cat:"colacion", name:"Galleta de arroz con maní",  kcal:95,  protein:3,   carbs:13,  fat:4    },
  { cat:"colacion", name:"Yogur bebible (200ml)",      kcal:120, protein:4.5, carbs:19,  fat:2    },
  { cat:"colacion", name:"Rollitos de pavo con queso", kcal:80,  protein:9,   carbs:1,   fat:4.5  },
  { cat:"colacion", name:"Manzana con manteca de maní",kcal:170, protein:3.5, carbs:22,  fat:8    },
  { cat:"colacion", name:"Aceitunas + queso (colación)",kcal:120, protein:5,   carbs:2,   fat:10   },
  { cat:"colacion", name:"Quesillo (50g)",             kcal:70,  protein:6.5, carbs:1,   fat:4.5  },
  { cat:"colacion", name:"Gelatina light (150g)",      kcal:15,  protein:3,   carbs:0.5, fat:0    },
  { cat:"colacion", name:"Palomitas sin sal (25g)",    kcal:95,  protein:2.5, carbs:17,  fat:2.5  },
  // -- Entradas adicionales -------------------------------------
  { cat:"entrada", name:"Empanada de espinaca y ricota",kcal:255, protein:8,  carbs:28,  fat:12,  unit:true, unitWeight:100 },
  { cat:"entrada", name:"Empanada caprese",            kcal:265, protein:9,   carbs:27,  fat:13,  unit:true, unitWeight:100 },
  { cat:"entrada", name:"Pasteles de carne (c/u)",     kcal:310, protein:12,  carbs:30,  fat:15,  unit:true, unitWeight:115 },
  { cat:"entrada", name:"Suprema napolitana s/pan",    kcal:340, protein:32,  carbs:10,  fat:18,  unit:true, unitWeight:180 },
  { cat:"entrada", name:"Ensalada de lentejas",        kcal:140, protein:8,   carbs:20,  fat:3    },
  { cat:"entrada", name:"Ensalada griega",             kcal:150, protein:5,   carbs:8,   fat:11   },
  { cat:"entrada", name:"Sopa de arvejas",             kcal:110, protein:6,   carbs:18,  fat:1.5  },
  { cat:"entrada", name:"Tortilla española (porción)", kcal:190, protein:8,   carbs:15,  fat:10,  unit:true, unitWeight:130 },
  // -- Postres adicionales ---------------------------------------
  { cat:"postre", name:"Facturas de crema (c/u)",      kcal:220, protein:3.5, carbs:28,  fat:10,  unit:true, unitWeight:70  },
  { cat:"postre", name:"Medialunas rellenas (c/u)",    kcal:195, protein:4,   carbs:26,  fat:8,   unit:true, unitWeight:65  },
  { cat:"postre", name:"Vigilante (queso+dulce membrillo)",kcal:210,protein:8, carbs:24,  fat:9    },
  { cat:"postre", name:"Pastafrola (porción)",         kcal:280, protein:4,   carbs:40,  fat:12,  unit:true, unitWeight:100 },
  { cat:"postre", name:"Facturas de hojaldre+crema",   kcal:240, protein:3.5, carbs:26,  fat:14,  unit:true, unitWeight:80  },
  { cat:"postre", name:"Copa de helado (3 bochas)",    kcal:380, protein:6,   carbs:48,  fat:18   },
  { cat:"postre", name:"Profiterol (x3)",              kcal:270, protein:5,   carbs:28,  fat:15   },
  { cat:"postre", name:"Lemon pie (porción)",          kcal:320, protein:4,   carbs:46,  fat:13,  unit:true, unitWeight:120 },
  { cat:"postre", name:"Rogel (porción)",              kcal:350, protein:4.5, carbs:48,  fat:16,  unit:true, unitWeight:100 },
  { cat:"postre", name:"Chocotorta (porción)",         kcal:390, protein:5,   carbs:52,  fat:18,  unit:true, unitWeight:120 },
  { cat:"postre", name:"Budín de banana (porción)",    kcal:240, protein:3.5, carbs:36,  fat:9,   unit:true, unitWeight:90  },
  { cat:"postre", name:"Petit four / bombón (c/u)",    kcal:65,  protein:0.8, carbs:8,   fat:3.5, unit:true, unitWeight:18  },
  // -- Meriendas adicionales -------------------------------------
  { cat:"merienda", name:"Tostado de pavita",          kcal:310, protein:17,  carbs:30,  fat:12,  unit:true, unitWeight:140 },
  { cat:"merienda", name:"Tostado vegetal",            kcal:270, protein:10,  carbs:30,  fat:11,  unit:true, unitWeight:130 },
  { cat:"merienda", name:"Budín de naranja (porción)", kcal:240, protein:3.5, carbs:35,  fat:10   },
  { cat:"merienda", name:"Scone (c/u)",                kcal:210, protein:4,   carbs:28,  fat:9,   unit:true, unitWeight:70  },
  { cat:"merienda", name:"Bizcochitos de queso (x5)",  kcal:165, protein:4.5, carbs:20,  fat:7.5  },
  { cat:"merienda", name:"Wrap de queso y verdura",    kcal:200, protein:8,   carbs:24,  fat:7,   unit:true, unitWeight:130 },
  // -- Bebidas adicionales ---------------------------------------
  { cat:"bebida", name:"Licuado verde (kale+pepino+manzana)",kcal:90,protein:2,carbs:20,  fat:0.5  },
  { cat:"bebida", name:"Smoothie de frutilla (300ml)", kcal:120, protein:2,   carbs:27,  fat:0.5  },
  { cat:"bebida", name:"Leche de avena+cacao (250ml)", kcal:145, protein:3.5, carbs:25,  fat:4    },
  { cat:"bebida", name:"Agua de coco (250ml)",         kcal:45,  protein:0.5, carbs:11,  fat:0.5  },
  { cat:"bebida", name:"Jugo de pomelo natural",       kcal:38,  protein:0.5, carbs:9,   fat:0.1  },
  { cat:"bebida", name:"Mate (sin azúcar)",            kcal:4,   protein:0.3, carbs:0.5, fat:0    },
  { cat:"bebida", name:"Té (sin azúcar)",              kcal:2,   protein:0,   carbs:0.4, fat:0    },
  { cat:"bebida", name:"Sprite/Fanta (350ml)",         kcal:142, protein:0,   carbs:38,  fat:0    },
  { cat:"bebida", name:"Jugo en caja (200ml)",         kcal:90,  protein:0.3, carbs:22,  fat:0    },
  // -- Suplementos adicionales -----------------------------------
  { cat:"suplemento", name:"Colágeno hidrolizado (10g)",kcal:38, protein:9,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"Pre-entreno (1 scoop)",    kcal:20,  protein:2,   carbs:3,   fat:0    },
  { cat:"suplemento", name:"Glutamina (5g)",           kcal:20,  protein:5,   carbs:0,   fat:0    },
  { cat:"suplemento", name:"Omega 3 (1g cápsula)",     kcal:9,   protein:0,   carbs:0,   fat:1    },
  { cat:"suplemento", name:"Proteína de arroz (30g)",  kcal:113, protein:22,  carbs:3,   fat:2    },
  { cat:"suplemento", name:"Proteína de guisante (30g)",kcal:110,protein:21,  carbs:4,   fat:1.5  },
  // -- Clásicos argentinos -----------------------------------
  { cat:"principal", name:"Matambre arrollado (100g)",    kcal:185, protein:20,  carbs:2,   fat:11   },
  { cat:"principal", name:"Revuelto gramajo",             kcal:210, protein:14,  carbs:18,  fat:9    },
  { cat:"principal", name:"Mondongo guisado (300g)",      kcal:220, protein:18,  carbs:14,  fat:9    },
  { cat:"principal", name:"Cazuela de vacuno",            kcal:175, protein:16,  carbs:14,  fat:6    },
  { cat:"principal", name:"Carne al horno con papas",     kcal:200, protein:20,  carbs:16,  fat:7    },
  { cat:"principal", name:"Puchero (plato 400g)",         kcal:240, protein:18,  carbs:22,  fat:8    },
  { cat:"principal", name:"Pollo al disco",               kcal:220, protein:22,  carbs:10,  fat:10   },
  { cat:"principal", name:"Churrasco a la plancha",       kcal:215, protein:30,  carbs:0,   fat:10,  unit:true, unitWeight:180 },
  { cat:"principal", name:"Bifecito de paleta",           kcal:170, protein:26,  carbs:0,   fat:7,   unit:true, unitWeight:150 },
  { cat:"principal", name:"Matambre a la pizza",          kcal:280, protein:24,  carbs:6,   fat:18   },
  { cat:"principal", name:"Tarta pascualina (porción)",   kcal:230, protein:9,   carbs:22,  fat:12,  unit:true, unitWeight:160 },
  { cat:"principal", name:"Humitas (c/u)",                kcal:190, protein:5,   carbs:30,  fat:6,   unit:true, unitWeight:130 },
  { cat:"principal", name:"Tamales (c/u)",                kcal:220, protein:8,   carbs:28,  fat:9,   unit:true, unitWeight:140 },
  { cat:"principal", name:"Sopa de cebolla gratinada",    kcal:180, protein:8,   carbs:18,  fat:8    },
  { cat:"principal", name:"Carne guisada con verduras",   kcal:190, protein:18,  carbs:14,  fat:7    },
  { cat:"principal", name:"Milanese de soja",             kcal:280, protein:16,  carbs:28,  fat:10,  unit:true, unitWeight:110 },
  { cat:"entrada",   name:"Picada variada",               kcal:280, protein:13,  carbs:12,  fat:22   },
  { cat:"entrada",   name:"Matambre con chimichurri",     kcal:220, protein:22,  carbs:2,   fat:14   },
  { cat:"entrada",   name:"Ensalada rusa (150g)",         kcal:160, protein:3,   carbs:18,  fat:9    },
  { cat:"postre",    name:"Pionono relleno (porción)",    kcal:300, protein:5,   carbs:40,  fat:13,  unit:true, unitWeight:110 },
  { cat:"colacion",  name:"Maní con pasas de uva (30g)",  kcal:155, protein:4.5, carbs:16,  fat:8    },
  { cat:"colacion",  name:"Quesillo con miel (porción)",  kcal:130, protein:8,   carbs:12,  fat:6    },
  { cat:"bebida",    name:"Tereré (500ml)",               kcal:5,   protein:0.3, carbs:1,   fat:0,   drink:true },
  { cat:"bebida",    name:"Mate con azúcar",              kcal:20,  protein:0.3, carbs:5,   fat:0,   drink:true },
  { cat:"bebida",    name:"Licuado de durazno (300ml)",   kcal:135, protein:3.5, carbs:26,  fat:2    },
  { cat:"carbohidrato", name:"Chipa guazú (porción)",     kcal:220, protein:7,   carbs:24,  fat:10   },
  { cat:"carbohidrato", name:"Pan casero (rebanada)",     kcal:200, protein:5,   carbs:38,  fat:3    },
  { cat:"carbohidrato", name:"Tortilla de campo (c/u)",   kcal:190, protein:5,   carbs:32,  fat:5,   unit:true, unitWeight:80  },
  { cat:"proteina",  name:"Asado de tira (100g)",         kcal:280, protein:23,  carbs:0,   fat:20   },
  { cat:"proteina",  name:"Morcilla (100g)",              kcal:355, protein:15,  carbs:2,   fat:32   },
  { cat:"proteina",  name:"Chorizo parrillero (c/u)",     kcal:290, protein:13,  carbs:2,   fat:25,  unit:true, unitWeight:100 },
  { cat:"proteina",  name:"Cordero patagónico (100g)",    kcal:258, protein:25,  carbs:0,   fat:17   },
  { cat:"proteina",  name:"Chinchulines (100g)",          kcal:230, protein:16,  carbs:0,   fat:18   },
  { cat:"proteina",  name:"Molleja (100g)",               kcal:250, protein:18,  carbs:0,   fat:19   },
];

// --- Plan de alimentación generator ----------------------------------------
export const DAY_NAMES_PLAN =["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

export const SLOT_DEFS = {
  3: [
    { id:"desayuno", label:"Desayuno", factor:0.30, cats:["desayuno","lacteo","fruta"] },
    { id:"almuerzo", label:"Almuerzo", factor:0.40, cats:["principal","proteina","carbohidrato","legumbre"] },
    { id:"cena",     label:"Cena",     factor:0.30, cats:["principal","proteina","verdura","legumbre"] },
  ],
  4: [
    { id:"desayuno", label:"Desayuno", factor:0.25, cats:["desayuno","lacteo","fruta"] },
    { id:"almuerzo", label:"Almuerzo", factor:0.35, cats:["principal","proteina","carbohidrato","legumbre"] },
    { id:"merienda", label:"Merienda",  factor:0.15, cats:["merienda","colacion","fruta","lacteo"] },
    { id:"cena",     label:"Cena",     factor:0.25, cats:["principal","proteina","verdura","legumbre"] },
  ],
  5: [
    { id:"desayuno", label:"Desayuno",  factor:0.20, cats:["desayuno","lacteo","fruta"] },
    { id:"almuerzo", label:"Almuerzo",  factor:0.30, cats:["principal","proteina","carbohidrato","legumbre"] },
    { id:"colacion", label:"Colación",  factor:0.12, cats:["colacion","fruta","lacteo"] },
    { id:"merienda", label:"Merienda",  factor:0.13, cats:["merienda","colacion","fruta"] },
    { id:"cena",     label:"Cena",      factor:0.25, cats:["principal","proteina","verdura","legumbre"] },
  ],
  6: [
    { id:"desayuno", label:"Desayuno",    factor:0.18, cats:["desayuno","lacteo","fruta"] },
    { id:"colacion1",label:"Colación AM", factor:0.10, cats:["colacion","fruta"] },
    { id:"almuerzo", label:"Almuerzo",    factor:0.28, cats:["principal","proteina","carbohidrato"] },
    { id:"merienda", label:"Merienda",     factor:0.12, cats:["merienda","colacion","fruta","lacteo"] },
    { id:"colacion2",label:"Colación PM", factor:0.10, cats:["colacion","proteina"] },
    { id:"cena",     label:"Cena",        factor:0.22, cats:["principal","proteina","verdura","legumbre"] },
  ],
};

export function cleanFoodName(name) {
  // Only strip if parenthetical contains digits or quantity units
  return name.replace(/\s*\(\s*[^)]*\d[^)]*\)\s*$/i, '').trim();
}

export function generateNutritionPlan(config, tdee, targetCal, proteinG, carbG, fatG) {
  const { days, mealsPerDay, goal, restrictions, likedCats, allergies, cuisine, prepTime, budget, seed } = config;
  const slots = SLOT_DEFS[mealsPerDay] || SLOT_DEFS[4];

  const MEAT_KEYWORDS = ["pollo","carne","pavo","cerdo","jamón","salame","vacío","entraña","asado","bife","lomo","cuadril","nalga","tapa","costilla","chorizo","lomito","roast beef"];
  const GLUTEN_KEYWORDS = ["pan","pasta","fideos","tallarines","ñoquis","ravioles","canelones","lasaña","tostada","alfajor","galletita","medialunas","bizcochuelo","pizza","empanada","galleta","galletón","cracker","pancho","panecillo","panqueque","panqueque","panque", "sémola", "cuscús", "trigo", "cebada", "centeno", "avena", "espelta"];
  const ALLERGEN_KEYWORDS = {
    frutos_secos: ["nuez","almendra","cacahuate","maní","mani","castaña","avellana","pistacho","pecán","pecan","macadamia","nueces","nueces de","crema de maní","crema de cacahuate","manteca de maní","crema de almendras","pasta de maní"],
    huevo: ["huevo","huevos","omelette","tortilla","mayonesa","mayonesa","merengue","flan","budín","budin","crema pastelera","crema de huevo","clara de huevo","yema"],
    pescado: ["pescado","pescados","merluza","salmón","atún","caballa","jurel","corvina","lenguado","brótola","trucha","abadejo","bacalao","rape","pejerrey"],
    mariscos: ["camarón","camarones","langostino","langosta","cangrejo","mejillón","mejillones","almeja","almejas","pulpo","calamar","chipirones","vieira","ostra","ostras","berberecho"],
    soja: ["tofu","soja","soya","edamame","miso","tempeh","salsa de soja","sillao","shoyu","proteína de soja","leche de soja","yogur de soja"],
    mani: ["maní","mani","cacahuate","manteca de maní","crema de cacahuate","pasta de maní","cacahuetes"],
  };

  function foodAllowed(f) {
    if (["rapida","suplemento","bebida"].includes(f.cat)) return false;
    if (restrictions.includes("vegano") && ["proteina","lacteo"].includes(f.cat)) return false;
    if (restrictions.includes("vegetariano") && f.cat === "proteina") {
      if (MEAT_KEYWORDS.some(k => f.name.toLowerCase().includes(k))) return false;
    }
    if (restrictions.includes("sin_lacteos") && f.cat === "lacteo") return false;
    if (restrictions.includes("sin_gluten") && GLUTEN_KEYWORDS.some(k => f.name.toLowerCase().includes(k))) return false;
    if (allergies && allergies.length > 0) {
      for (const a of allergies) {
        const keywords = ALLERGEN_KEYWORDS[a];
        if (keywords && keywords.some(k => f.name.toLowerCase().includes(k))) return false;
      }
    }
    return true;
  }

  function scaleFood(f, targetKcal) {
    if (f.unit) {
      const kcalPerUnit = f.kcal * (f.unitWeight || 100) / 100;
      const qty = Math.max(1, Math.round(targetKcal / kcalPerUnit));
      const factor = qty * (f.unitWeight || 100) / 100;
      return { name:cleanFoodName(f.name), qty, unit:true,
        kcal:Math.round(f.kcal*factor), protein:Math.round(f.protein*factor*10)/10,
        carbs:Math.round(f.carbs*factor*10)/10, fat:Math.round(f.fat*factor*10)/10 };
    } else if (f.drink) {
      const mlAmount = Math.max(100, Math.min(500, Math.round(targetKcal * 100 / Math.max(f.kcal, 1))));
      const factor = mlAmount / 100;
      return { name:cleanFoodName(f.name), ml:mlAmount, drink:true,
        kcal:Math.round(f.kcal*factor), protein:Math.round(f.protein*factor*10)/10,
        carbs:Math.round(f.carbs*factor*10)/10, fat:Math.round(f.fat*factor*10)/10 };
    } else {
      const grams = Math.max(40, Math.min(400, Math.round(targetKcal * 100 / Math.max(f.kcal, 1))));
      const factor = grams / 100;
      return { name:cleanFoodName(f.name), grams,
        kcal:Math.round(f.kcal*factor), protein:Math.round(f.protein*factor*10)/10,
        carbs:Math.round(f.carbs*factor*10)/10, fat:Math.round(f.fat*factor*10)/10 };
    }
  }

  // Seeded PRNG — includes random seed so each generation produces unique plans
  let rngSeed = days * 31 + mealsPerDay * 7 + (cuisine ? cuisine.charCodeAt(0) : 0) + (seed || 0);
  function rng() { rngSeed = (rngSeed * 16807 + 0) % 2147483647; return (rngSeed - 1) / 2147483646; }

  function pickForSlot(slot, dayIdx, slotIdx, recentNames) {
    const targetKcal = Math.round(targetCal * slot.factor);
    // Map user-friendly wizard labels to actual db category values
    const CAT_LABEL_MAP = { principales:"principal", desayunos:"desayuno", legumbres:"legumbre", pescados:"proteina", carnes:"proteina", verduras:"verdura", huevos:"proteina", pastas:"carbohidrato", frutas:"fruta", lácteos:"lacteo", colaciones:"colacion" };
    const mappedLiked = likedCats.map(c => CAT_LABEL_MAP[c] || c);
    const filtered = mappedLiked.length > 0 ? slot.cats.filter(c => mappedLiked.includes(c)) : slot.cats;
    const allowedCats = filtered.length > 0 ? filtered : slot.cats; // always fall back to slot defaults
    const cats = allowedCats.length > 0 ? allowedCats : slot.cats;

    let pool = FOOD_DB.filter(f => cats.includes(f.cat) && foodAllowed(f));
    // Budget filtering: economico prefers legumbres and carbohidratos
    if (budget === "economico" && pool.length > 0) {
      const budgetPool = pool.filter(f => ["legumbre","carbohidrato","verdura","fruta"].includes(f.cat));
      if (budgetPool.length >= 2) pool = budgetPool;
    }
    // Cuisine preference: if set, prefer items matching cuisine keywords
    if (cuisine && pool.length > 0) {
      const cuisinePool = pool.filter(f => f.name.toLowerCase().includes(cuisine));
      if (cuisinePool.length > 0) pool = cuisinePool;
    }
    if (pool.length === 0) return [];

    // Deprioritize foods used yesterday
    const freshPool = recentNames && recentNames.size > 0
      ? pool.filter(f => !recentNames.has(cleanFoodName(f.name)))
      : pool;
    const finalPool = freshPool.length >= 2 ? freshPool : pool;

    // True randomness per pick (not deterministic per dayIdx/slotIdx)
    // But shuffle deterministically per config so same config = same plan
    const shuffled = [...finalPool].sort((a, b) => {
      const sa = ((finalPool.indexOf(a) + 1) * rng()) % 1;
      const sb = ((finalPool.indexOf(b) + 1) * rng()) % 1;
      return sa - sb;
    });
    const main = shuffled[0];
    const sidePool = shuffled.filter(f => f.cat !== main.cat);
    const side = sidePool.length > 0 ? sidePool[0] : null;

    const items = [scaleFood(main, side ? Math.round(targetKcal * 0.65) : targetKcal)];
    if (side) items.push(scaleFood(side, Math.round(targetKcal * 0.35)));
    return items;
  }

  const result = [];
  for (let dayIdx = 0; dayIdx < days; dayIdx++) {
    const yesterday = dayIdx > 0 ? result[dayIdx-1] : null;
    const recentNames = new Set(yesterday ? yesterday.meals.flatMap(m => m.items.map(i => i.name)) : []);
    const meals = slots.map((slot, slotIdx) => {
      const items = pickForSlot(slot, dayIdx, slotIdx, recentNames);
      const tot = items.reduce((a,i) => ({ kcal:a.kcal+i.kcal, protein:a.protein+i.protein, carbs:a.carbs+i.carbs, fat:a.fat+i.fat }), {kcal:0,protein:0,carbs:0,fat:0});
      return { slot:slot.id, label:slot.label, items, ...tot };
    });
    const dayTot = meals.reduce((a,m) => ({ kcal:a.kcal+m.kcal, protein:a.protein+m.protein, carbs:a.carbs+m.carbs, fat:a.fat+m.fat }), {kcal:0,protein:0,carbs:0,fat:0});
    result.push({ dayIdx, dayName:DAY_NAMES_PLAN[dayIdx % 7], meals, ...dayTot });
  }
  return {
    config,
    dailyKcal: targetCal,
    dailyProtein: proteinG,
    dailyCarbs: carbG,
    dailyFat: fatG,
    generatedAt: new Date().toISOString(),
    days: result,
  };
}
