// Catálogo curado: almuerzos y cenas con carne, pollo, cerdo y pescado.
export const MEALS = [
  {
    id: "alm-pollo-plancha-arroz-ensalada",
    name: "Pollo a la plancha con arroz y ensalada mixta",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Pechuga de pollo (cocida)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Arroz blanco cocido",
        g: 180,
        min: 115,
        max: 290,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-pollo-horno-papas-ensalada",
    name: "Muslo de pollo al horno con papas y ensalada",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "largo",
    cost: "bajo",
    items: [
      {
        food: "Muslo de pollo s/piel (cocido)",
        g: 200,
        min: 130,
        max: 320,
        flex: "protein"
      },
      {
        food: "Papas al horno con romero",
        g: 225,
        min: 145,
        max: 360,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 50,
        min: 35,
        max: 70
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Aceite de oliva",
        g: 5,
        min: 5,
        max: 5
      }
    ]
  },
  {
    id: "alm-pollo-horno-batata-brocoli",
    name: "Pollo al horno con batata asada y brócoli",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "largo",
    cost: "medio",
    items: [
      {
        food: "Pollo al horno sin piel",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Batata al horno",
        g: 200,
        min: 130,
        max: 320,
        flex: "carb"
      },
      {
        food: "Brócoli cocido",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Aceite de oliva",
        g: 5,
        min: 5,
        max: 5
      }
    ]
  },
  {
    id: "alm-milanesa-pollo-pure",
    name: "Milanesa de pollo al horno con puré y ensalada de tomate",
    slots: [
      "almuerzo"
    ],
    diet: [],
    contains: [
      "gluten",
      "huevo",
      "lacteos"
    ],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Milanesa de pollo al horno",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Puré de papa con leche y manteca",
        g: 200,
        min: 140,
        max: 280
      },
      {
        food: "Tomate",
        g: 150,
        min: 105,
        max: 210
      }
    ]
  },
  {
    id: "alm-milanesa-pollo-papa-ensalada",
    name: "Milanesa de pollo al horno con papa hervida y ensalada",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [
      "gluten",
      "huevo"
    ],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Milanesa de pollo al horno",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Aceite de oliva",
        g: 5,
        min: 5,
        max: 5
      }
    ]
  },
  {
    id: "alm-pollo-verdeo-arroz-integral",
    name: "Pollo al verdeo con arroz integral y ensalada de tomate",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Muslo de pollo s/piel (cocido)",
        g: 180,
        min: 115,
        max: 290,
        flex: "protein"
      },
      {
        food: "Cebollín / Cebolla de verdeo",
        g: 80,
        min: 55,
        max: 110
      },
      {
        food: "Arroz integral cocido",
        g: 180,
        min: 115,
        max: 290,
        flex: "carb"
      },
      {
        food: "Tomate",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-brochette-pollo-arroz",
    name: "Brochette de pollo con pimientos y arroz",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Pechuga de pollo (cocida)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Pimiento morrón",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Cebolla",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Arroz blanco cocido",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-cazuela-pollo-pan",
    name: "Cazuela de pollo con pan y ensalada mixta",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [
      "gluten"
    ],
    prep: "largo",
    cost: "bajo",
    items: [
      {
        food: "Cazuela de pollo",
        g: 300,
        min: 195,
        max: 480,
        flex: "protein"
      },
      {
        food: "Pan francés",
        g: 50,
        min: 35,
        max: 80,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "cena-pollo-quinoa-esparragos",
    name: "Pollo grillado con quinoa, espárragos y palta",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "alto",
    items: [
      {
        food: "Pechuga de pollo (cocida)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Quinoa cocida",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Espárragos cocidos",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Palta (aguacate)",
        g: 40,
        min: 30,
        max: 55
      }
    ]
  },
  {
    id: "alm-pollo-polenta-tuco",
    name: "Pollo con polenta y salsa de tomate casera",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Muslo de pollo s/piel (cocido)",
        g: 180,
        min: 115,
        max: 290,
        flex: "protein"
      },
      {
        food: "Polenta cocida",
        g: 200,
        min: 130,
        max: 320,
        flex: "carb"
      },
      {
        food: "Salsa de tomate casera",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-pollo-parrilla-choclo",
    name: "Pollo a la parrilla con choclo y ensalada mixta",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Muslo de pollo c/piel (cocido)",
        g: 180,
        min: 115,
        max: 290,
        flex: "protein"
      },
      {
        food: "Choclo cocido",
        g: 103,
        min: 70,
        max: 145
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-pollo-cuscus-zucchini",
    name: "Pollo a la plancha con cuscús y zucchini",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [
      "gluten"
    ],
    prep: "rapido",
    cost: "medio",
    items: [
      {
        food: "Pechuga de pollo (cocida)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Cuscús (cocido)",
        g: 160,
        min: 105,
        max: 255,
        flex: "carb"
      },
      {
        food: "Zapallito / zucchini hervido",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Tomate cherry",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-pavo-arroz-integral-brocoli",
    name: "Pechuga de pavo con arroz integral y brócoli",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "rapido",
    cost: "medio",
    items: [
      {
        food: "Pechuga de pavo (cocida)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Arroz integral cocido",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Brócoli cocido",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "cena-pollo-pure-calabaza",
    name: "Pollo a la plancha con puré de calabaza y espinaca",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Pechuga de pollo (cocida)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Puré de calabaza",
        g: 200,
        min: 130,
        max: 320,
        flex: "carb"
      },
      {
        food: "Espinaca cocida",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "cena-ensalada-pollo-choclo",
    name: "Ensalada completa de pollo grillado, choclo y palta",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "rapido",
    cost: "medio",
    items: [
      {
        food: "Pechuga de pollo (cocida)",
        g: 180,
        min: 115,
        max: 290,
        flex: "protein"
      },
      {
        food: "Choclo cocido",
        g: 103,
        min: 70,
        max: 145
      },
      {
        food: "Lechuga",
        g: 80,
        min: 55,
        max: 110
      },
      {
        food: "Tomate cherry",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Pepino",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Palta (aguacate)",
        g: 40,
        min: 30,
        max: 55
      }
    ]
  },
  {
    id: "alm-pollo-salteado-arroz-verduras",
    name: "Pollo salteado con arroz y verduras",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "rapido",
    cost: "bajo",
    items: [
      {
        food: "Pechuga de pollo (cocida)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Arroz blanco cocido",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Zapallito / zucchini hervido",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Zanahoria",
        g: 80,
        min: 55,
        max: 110
      },
      {
        food: "Pimiento rojo",
        g: 80,
        min: 55,
        max: 110
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-bife-chorizo-papa-ensalada",
    name: "Bife de chorizo con papa al horno y ensalada mixta",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "rapido",
    cost: "alto",
    items: [
      {
        food: "Bife de chorizo (cocido)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Papas al horno con romero",
        g: 225,
        min: 145,
        max: 360,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-asado-batata-ensalada",
    name: "Asado de tira con batata y ensalada mixta",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "largo",
    cost: "medio",
    items: [
      {
        food: "Asado (tira)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Batata al horno",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-milanesa-ternera-horno-papa",
    name: "Milanesa de ternera al horno con papa hervida y ensalada",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [
      "gluten",
      "huevo"
    ],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Milanesa de ternera (al horno)",
        g: 115,
        min: 75,
        max: 185,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 225,
        min: 160,
        max: 315
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-milanesa-ternera-pure-batata",
    name: "Milanesa de ternera con puré de batata y ensalada",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [
      "gluten",
      "huevo"
    ],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Milanesa de ternera (frita)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Puré de batata (asada o hervida, sin agregados)",
        g: 200,
        min: 140,
        max: 280
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-hamburguesa-casera-papa",
    name: "Hamburguesa casera de carne magra con papa al horno y ensalada",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Carne picada 90% (cocida)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Papas al horno con romero",
        g: 225,
        min: 145,
        max: 360,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 50,
        min: 35,
        max: 70
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-higado-pure-batata",
    name: "Bife de hígado con puré de batata y cebolla",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "rapido",
    cost: "bajo",
    items: [
      {
        food: "Hígado vacuno (salteado)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Puré de batata (asada o hervida, sin agregados)",
        g: 200,
        min: 140,
        max: 280
      },
      {
        food: "Cebolla",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-nalga-arroz-integral",
    name: "Nalga a la plancha con arroz integral y ensalada",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Nalga (magra)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Arroz integral cocido",
        g: 180,
        min: 115,
        max: 290,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-peceto-horno-papa",
    name: "Peceto al horno con papa hervida y ensalada de tomate",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "largo",
    cost: "medio",
    items: [
      {
        food: "Peceto (cocido)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 225,
        min: 160,
        max: 315
      },
      {
        food: "Tomate",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-estofado-carne-papa",
    name: "Estofado de carne con papas y ensalada mixta",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [],
    prep: "largo",
    cost: "bajo",
    items: [
      {
        food: "Estofado de carne con papas",
        g: 450,
        min: 295,
        max: 720,
        flex: "protein"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-guiso-fideos-carne",
    name: "Guiso de fideos con carne y ensalada de tomate",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [
      "gluten"
    ],
    prep: "largo",
    cost: "bajo",
    items: [
      {
        food: "Guiso de fideos con carne",
        g: 400,
        min: 260,
        max: 640,
        flex: "protein"
      },
      {
        food: "Tomate",
        g: 150,
        min: 105,
        max: 210
      }
    ]
  },
  {
    id: "alm-vacio-choclo-chimichurri",
    name: "Vacío a la parrilla con choclo, ensalada y chimichurri",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "largo",
    cost: "medio",
    items: [
      {
        food: "Vacío",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Choclo cocido",
        g: 103,
        min: 70,
        max: 145
      },
      {
        food: "Tomate",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Salsa chimichurri",
        g: 15,
        min: 10,
        max: 20
      }
    ]
  },
  {
    id: "alm-cuadril-batata-brocoli",
    name: "Cuadril con batata y brócoli",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Cuadril",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Batata al horno",
        g: 200,
        min: 130,
        max: 320,
        flex: "carb"
      },
      {
        food: "Brócoli cocido",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Aceite de oliva",
        g: 5,
        min: 5,
        max: 5
      }
    ]
  },
  {
    id: "alm-pastel-papa-ensalada",
    name: "Pastel de papa con ensalada mixta",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_gluten"
    ],
    contains: [
      "lacteos"
    ],
    prep: "largo",
    cost: "bajo",
    items: [
      {
        food: "Pastel de papa",
        g: 350,
        min: 230,
        max: 560,
        flex: "protein"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-albondigas-arroz",
    name: "Albóndigas con salsa, arroz y ensalada",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [
      "gluten",
      "huevo"
    ],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Albóndigas c/salsa",
        g: 250,
        min: 165,
        max: 400,
        flex: "protein"
      },
      {
        food: "Arroz blanco cocido",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-milanesa-napolitana-papa",
    name: "Milanesa napolitana al horno con papa hervida y ensalada",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [],
    contains: [
      "gluten",
      "huevo",
      "lacteos"
    ],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Milanesa napolitana al horno",
        g: 200,
        min: 130,
        max: 320,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-entrana-papa-ensalada",
    name: "Entraña a la parrilla con papa al horno y ensalada",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "largo",
    cost: "alto",
    items: [
      {
        food: "Entraña a la parrilla",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Papas al horno con romero",
        g: 225,
        min: 145,
        max: 360,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-bife-angosto-batata",
    name: "Bife angosto con batata y ensalada mixta",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "alto",
    items: [
      {
        food: "Bife angosto",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Batata al horno",
        g: 200,
        min: 130,
        max: 320,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "cena-lomo-pure-batata-esparragos",
    name: "Bife de lomo con puré de batata y espárragos",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "alto",
    items: [
      {
        food: "Bife de lomo (cocido)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Puré de batata (asada o hervida, sin agregados)",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Espárragos cocidos",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Aceite de oliva",
        g: 5,
        min: 5,
        max: 5
      }
    ]
  },
  {
    id: "alm-puchero-ensalada",
    name: "Puchero con ensalada mixta",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [],
    prep: "largo",
    cost: "bajo",
    items: [
      {
        food: "Puchero (250g)",
        g: 340,
        min: 220,
        max: 545,
        flex: "protein"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-carbonada-ensalada",
    name: "Carbonada con ensalada mixta",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [],
    prep: "largo",
    cost: "bajo",
    items: [
      {
        food: "Carbonada",
        g: 450,
        min: 295,
        max: 720,
        flex: "protein"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-picadillo-arroz",
    name: "Picadillo de carne con arroz, morrón y tomate",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Carne picada 90% (cocida)",
        g: 130,
        min: 85,
        max: 210,
        flex: "protein"
      },
      {
        food: "Arroz blanco cocido",
        g: 180,
        min: 115,
        max: 290,
        flex: "carb"
      },
      {
        food: "Pimiento morrón",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Aceite de oliva",
        g: 5,
        min: 5,
        max: 5
      }
    ]
  },
  {
    id: "cena-bife-chorizo-pure-calabaza",
    name: "Bife de chorizo con puré de calabaza y rúcula",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "rapido",
    cost: "alto",
    items: [
      {
        food: "Bife de chorizo (cocido)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Puré de calabaza",
        g: 200,
        min: 130,
        max: 320,
        flex: "carb"
      },
      {
        food: "Rúcula",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate cherry",
        g: 100,
        min: 70,
        max: 140
      }
    ]
  },
  {
    id: "alm-bondiola-batata-repollo",
    name: "Bondiola de cerdo con batata y ensalada de repollo y zanahoria",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "largo",
    cost: "medio",
    items: [
      {
        food: "Bondiola de cerdo (cocida)",
        g: 130,
        min: 85,
        max: 210,
        flex: "protein"
      },
      {
        food: "Batata al horno",
        g: 200,
        min: 130,
        max: 320,
        flex: "carb"
      },
      {
        food: "Repollo",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Zanahoria cruda rallada",
        g: 80,
        min: 55,
        max: 110
      }
    ]
  },
  {
    id: "alm-lomo-cerdo-papa-brocoli",
    name: "Lomo de cerdo con papa hervida y brócoli",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Lomo de cerdo",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 225,
        min: 160,
        max: 315
      },
      {
        food: "Brócoli cocido",
        g: 150,
        min: 105,
        max: 210
      }
    ]
  },
  {
    id: "alm-churrasco-cerdo-arroz",
    name: "Churrasco de cerdo con arroz y ensalada mixta",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "rapido",
    cost: "bajo",
    items: [
      {
        food: "Churrasco de cerdo",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Arroz blanco cocido",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "cena-costeleta-cerdo-polenta",
    name: "Costeleta de cerdo a la plancha con polenta y zapallitos",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Costeleta de cerdo a la plancha (magra)",
        g: 142,
        min: 90,
        max: 225,
        flex: "protein"
      },
      {
        food: "Polenta cocida",
        g: 200,
        min: 130,
        max: 320,
        flex: "carb"
      },
      {
        food: "Zapallito / zucchini hervido",
        g: 180,
        min: 125,
        max: 250
      },
      {
        food: "Aceite de oliva",
        g: 5,
        min: 5,
        max: 5
      }
    ]
  },
  {
    id: "alm-merluza-horno-papa-brocoli",
    name: "Merluza al horno con papa y brócoli",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Merluza al horno",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Papas al horno con romero",
        g: 225,
        min: 145,
        max: 360,
        flex: "carb"
      },
      {
        food: "Brócoli cocido",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-salmon-plancha-arroz-esparragos",
    name: "Salmón a la plancha con arroz y espárragos",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "medio",
    cost: "alto",
    items: [
      {
        food: "Salmón a la plancha",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Arroz blanco cocido",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Espárragos cocidos",
        g: 100,
        min: 70,
        max: 140
      }
    ]
  },
  {
    id: "alm-trucha-papa-zapallito",
    name: "Trucha al horno con papa y zapallitos",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Trucha (cocida)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 225,
        min: 160,
        max: 315
      },
      {
        food: "Zapallito / zucchini hervido",
        g: 180,
        min: 125,
        max: 250
      },
      {
        food: "Aceite de oliva",
        g: 5,
        min: 5,
        max: 5
      }
    ]
  },
  {
    id: "alm-atun-fresco-quinoa",
    name: "Atún fresco a la plancha con quinoa y rúcula",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "rapido",
    cost: "alto",
    items: [
      {
        food: "Atún fresco a la plancha",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Quinoa cocida",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Rúcula",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate cherry",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "cena-bacalao-papa-chauchas",
    name: "Bacalao con papa y chauchas",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "medio",
    cost: "alto",
    items: [
      {
        food: "Bacalao (cocido)",
        g: 180,
        min: 115,
        max: 290,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 225,
        min: 160,
        max: 315
      },
      {
        food: "Chaucha",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "cena-pejerrey-horno-ensalada",
    name: "Pejerrey al horno con papa y ensalada mixta",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Pejerrey",
        g: 220,
        min: 145,
        max: 350,
        flex: "protein"
      },
      {
        food: "Papas al horno con romero",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-langostinos-arroz",
    name: "Langostinos salteados con arroz y morrón",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado",
      "mariscos"
    ],
    prep: "rapido",
    cost: "alto",
    items: [
      {
        food: "Langostinos (cocidos)",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Arroz blanco cocido",
        g: 180,
        min: 115,
        max: 290,
        flex: "carb"
      },
      {
        food: "Pimiento morrón",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-calamar-plancha-arroz",
    name: "Calamares a la plancha con arroz y ensalada",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado",
      "mariscos"
    ],
    prep: "rapido",
    cost: "medio",
    items: [
      {
        food: "Calamar (crudo)",
        g: 200,
        min: 130,
        max: 320,
        flex: "protein"
      },
      {
        food: "Arroz blanco cocido",
        g: 180,
        min: 115,
        max: 290,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-pulpo-papa-pimiento",
    name: "Pulpo con papa hervida y pimiento",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado",
      "mariscos"
    ],
    prep: "medio",
    cost: "alto",
    items: [
      {
        food: "Pulpo cocido",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 225,
        min: 160,
        max: 315
      },
      {
        food: "Pimiento rojo",
        g: 80,
        min: 55,
        max: 110
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "cena-sardinas-papa-tomate",
    name: "Sardinas con papa hervida y ensalada de tomate",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "rapido",
    cost: "bajo",
    items: [
      {
        food: "Sardinas en lata",
        g: 120,
        min: 80,
        max: 190,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 225,
        min: 160,
        max: 315
      },
      {
        food: "Tomate",
        g: 150,
        min: 105,
        max: 210
      }
    ]
  },
  {
    id: "alm-atun-arroz-ensalada",
    name: "Atún al natural con arroz y ensalada mixta",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "rapido",
    cost: "bajo",
    items: [
      {
        food: "Atún al natural",
        g: 140,
        min: 90,
        max: 225,
        flex: "protein"
      },
      {
        food: "Arroz blanco cocido",
        g: 180,
        min: 115,
        max: 290,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "cena-corvina-batata-zapallito",
    name: "Corvina al horno con batata y zapallitos",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Corvina (cruda)",
        g: 220,
        min: 145,
        max: 350,
        flex: "protein"
      },
      {
        food: "Batata al horno",
        g: 200,
        min: 130,
        max: 320,
        flex: "carb"
      },
      {
        food: "Zapallito / zucchini hervido",
        g: 180,
        min: 125,
        max: 250
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "cena-lenguado-papa-espinaca",
    name: "Lenguado con papa hervida y espinaca",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "rapido",
    cost: "medio",
    items: [
      {
        food: "Lenguado (cocido)",
        g: 200,
        min: 130,
        max: 320,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 225,
        min: 160,
        max: 315
      },
      {
        food: "Espinaca cocida",
        g: 100,
        min: 70,
        max: 140
      },
      {
        food: "Aceite de oliva",
        g: 10,
        min: 5,
        max: 15
      }
    ]
  },
  {
    id: "alm-merluza-rebozada-papa",
    name: "Merluza rebozada al horno con papa y ensalada",
    slots: [
      "almuerzo"
    ],
    diet: [
      "sin_lacteos"
    ],
    contains: [
      "gluten",
      "huevo",
      "pescado"
    ],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Merluza rebozada",
        g: 200,
        min: 130,
        max: 320,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "cena-caballa-batata-ensalada",
    name: "Caballa a la plancha con batata y ensalada mixta",
    slots: [
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado"
    ],
    prep: "medio",
    cost: "bajo",
    items: [
      {
        food: "Caballa",
        g: 150,
        min: 100,
        max: 240,
        flex: "protein"
      },
      {
        food: "Batata al horno",
        g: 150,
        min: 100,
        max: 240,
        flex: "carb"
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  },
  {
    id: "alm-mejillones-papa-ensalada",
    name: "Mejillones con papa hervida y ensalada",
    slots: [
      "almuerzo",
      "cena"
    ],
    diet: [
      "sin_lacteos",
      "sin_gluten"
    ],
    contains: [
      "pescado",
      "mariscos"
    ],
    prep: "medio",
    cost: "medio",
    items: [
      {
        food: "Mejillones (cocidos)",
        g: 200,
        min: 130,
        max: 320,
        flex: "protein"
      },
      {
        food: "Papa hervida",
        g: 150,
        min: 105,
        max: 210
      },
      {
        food: "Lechuga",
        g: 60,
        min: 40,
        max: 85
      },
      {
        food: "Tomate",
        g: 120,
        min: 85,
        max: 170
      }
    ]
  }
];
