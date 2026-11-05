// Catalogo curado de colaciones / snacks (media manana, media tarde y meriendas livianas).
// Cantidades base en g/ml; flex indica que ingrediente escala para cerrar macros.
export const MEALS = [
  { id: "col-yogur-fruta-granola", name: "Yogur griego con banana y granola",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["lacteos","gluten","frutos_secos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Yogur griego entero", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Banana", g: 100, min: 60, max: 150 },
      { food: "Granola", g: 25, min: 15, max: 50, flex: "carb" } ] }, // ~345 kcal, 16.8 g P
  { id: "col-yogur-frutillas-avena", name: "Yogur descremado con frutillas y avena",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["lacteos","gluten"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Yogur descremado", g: 150, min: 100, max: 300, flex: "protein" },
      { food: "Frutillas", g: 100, min: 60, max: 150 },
      { food: "Avena (seca)", g: 20, min: 10, max: 40, flex: "carb" } ] }, // ~192 kcal, 12.1 g P
  { id: "col-yogur-arandanos-chia", name: "Yogur griego con arándanos y chía",
    slots: ["colacion"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos","frutos_secos"], prep: "rapido", cost: "alto",
    items: [
      { food: "Yogur griego entero", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Arándanos", g: 80, min: 50, max: 120 },
      { food: "Semillas de chía", g: 8, min: 5, max: 15, flex: "fat" } ] }, // ~231 kcal, 15.8 g P
  { id: "col-yogur-mango-nueces", name: "Yogur natural con mango y nueces",
    slots: ["colacion"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos","frutos_secos"], prep: "rapido", cost: "alto",
    items: [
      { food: "Yogur natural entero", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Mango", g: 100, min: 60, max: 150 },
      { food: "Nueces", g: 15, min: 10, max: 30, flex: "fat" } ] }, // ~250 kcal, 8.8 g P
  { id: "col-yogur-durazno-granola", name: "Yogur descremado con durazno y granola",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["lacteos","gluten","frutos_secos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Yogur descremado", g: 150, min: 100, max: 300, flex: "protein" },
      { food: "Durazno", g: 130, min: 80, max: 170 },
      { food: "Granola", g: 20, min: 10, max: 40, flex: "carb" } ] }, // ~223 kcal, 11.6 g P
  { id: "col-queso-blanco-frutillas", name: "Queso blanco con frutillas y granola",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["lacteos","gluten","frutos_secos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Queso blanco descremado", g: 150, min: 100, max: 250, flex: "protein" },
      { food: "Frutillas", g: 100, min: 60, max: 150 },
      { food: "Granola", g: 15, min: 10, max: 30, flex: "carb" } ] }, // ~206 kcal, 18.7 g P
  { id: "col-ricota-manzana", name: "Ricota con manzana",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Ricota", g: 80, min: 50, max: 130, flex: "protein" },
      { food: "Manzana", g: 150, min: 100, max: 200 } ] }, // ~217 kcal, 8.8 g P
  { id: "col-ricota-membrillo", name: "Galletitas de arroz con ricota y dulce de membrillo",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Ricota", g: 80, min: 50, max: 130, flex: "protein" },
      { food: "Dulce de membrillo", g: 30, min: 20, max: 45 },
      { food: "Galletitas de arroz", g: 18, min: 18, max: 54, flex: "carb" } ] }, // ~294 kcal, 9.8 g P
  { id: "col-queso-fresco-membrillo", name: "Queso fresco con dulce de membrillo",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Queso fresco", g: 90, min: 60, max: 150, flex: "protein" },
      { food: "Dulce de membrillo", g: 30, min: 20, max: 45 } ] }, // ~189 kcal, 9 g P
  { id: "col-queso-fresco-batata", name: "Queso fresco con batata",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "medio", cost: "bajo",
    items: [
      { food: "Queso fresco", g: 80, min: 50, max: 130, flex: "protein" },
      { food: "Batata / Boniato", g: 100, min: 70, max: 160 } ] }, // ~178 kcal, 9.6 g P
  { id: "col-galleta-ricota-pera", name: "Galletitas de arroz con ricota y pera",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Galletitas de arroz", g: 36, min: 18, max: 72, flex: "carb" },
      { food: "Ricota", g: 60, min: 40, max: 100, flex: "protein" },
      { food: "Pera", g: 100, min: 70, max: 150 } ] }, // ~302 kcal, 9.3 g P
  { id: "col-galleta-mani-banana", name: "Galletitas de arroz con mantequilla de maní y banana",
    slots: ["colacion","merienda"], diet: ["vegano","vegetariano","sin_lacteos","sin_gluten"], contains: ["mani","frutos_secos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Galletitas de arroz", g: 18, min: 18, max: 54, flex: "carb" },
      { food: "Mantequilla de maní", g: 20, min: 10, max: 30, flex: "fat" },
      { food: "Banana", g: 100, min: 60, max: 130 } ] }, // ~279 kcal, 6.2 g P
  { id: "col-galleta-jamon-tomate", name: "Galletitas de arroz con jamón cocido y tomate",
    slots: ["colacion","merienda"], diet: ["sin_lacteos","sin_gluten"], contains: [], prep: "rapido", cost: "medio",
    items: [
      { food: "Galletitas de arroz", g: 36, min: 18, max: 72, flex: "carb" },
      { food: "Jamón cocido", g: 40, min: 40, max: 80, flex: "protein" },
      { food: "Tomate cherry", g: 60, min: 40, max: 100 } ] }, // ~203 kcal, 9.6 g P
  { id: "col-cracker-jamon-tomate", name: "Crackers con jamón cocido y tomate",
    slots: ["colacion","merienda"], diet: ["sin_lacteos"], contains: ["gluten"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Crackers/Agua", g: 28, min: 14, max: 56, flex: "carb" },
      { food: "Jamón cocido", g: 40, min: 40, max: 80, flex: "protein" },
      { food: "Tomate cherry", g: 60, min: 40, max: 100 } ] }, // ~171 kcal, 9.6 g P
  { id: "col-tostada-palta-huevo", name: "Tostada con palta y huevo duro",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_lacteos"], contains: ["gluten","huevo"], prep: "medio", cost: "medio",
    items: [
      { food: "Tostadas", g: 26, min: 13, max: 52, flex: "carb" },
      { food: "Palta (aguacate)", g: 50, min: 35, max: 75, flex: "fat" },
      { food: "Huevo duro", g: 50, min: 50, max: 100, flex: "protein" } ] }, // ~250 kcal, 9.7 g P
  { id: "col-tostada-palta-tomate", name: "Tostada con palta, tomate y semillas",
    slots: ["colacion","merienda"], diet: ["vegano","vegetariano","sin_lacteos"], contains: ["gluten","frutos_secos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Tostadas", g: 26, min: 13, max: 52, flex: "carb" },
      { food: "Palta (aguacate)", g: 60, min: 40, max: 75, flex: "fat" },
      { food: "Tomate cherry", g: 60, min: 40, max: 100 },
      { food: "Semillas de girasol", g: 10, min: 5, max: 20 } ] }, // ~257 kcal, 6.5 g P
  { id: "col-huevo-tomate-cherry", name: "Huevo duro con tomates cherry",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_lacteos","sin_gluten"], contains: ["huevo"], prep: "medio", cost: "bajo",
    items: [
      { food: "Huevo duro", g: 100, min: 50, max: 150, flex: "protein" },
      { food: "Tomate cherry", g: 100, min: 60, max: 150 } ] }, // ~174 kcal, 13 g P
  { id: "col-huevo-crackers", name: "Huevo duro con galletas agua",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_lacteos"], contains: ["gluten","huevo"], prep: "medio", cost: "bajo",
    items: [
      { food: "Huevo duro", g: 50, min: 50, max: 100, flex: "protein" },
      { food: "Crackers/Agua", g: 28, min: 14, max: 56, flex: "carb" },
      { food: "Tomate cherry", g: 50, min: 30, max: 80 } ] }, // ~195 kcal, 8.5 g P
  { id: "col-hummus-zanahoria", name: "Hummus con bastones de zanahoria y apio",
    slots: ["colacion"], diet: ["vegano","vegetariano","sin_lacteos","sin_gluten"], contains: [], prep: "rapido", cost: "bajo",
    items: [
      { food: "Hummus", g: 60, min: 30, max: 90, flex: "protein" },
      { food: "Zanahoria", g: 100, min: 60, max: 160 },
      { food: "Apio", g: 40, min: 20, max: 80 } ] }, // ~187 kcal, 5.3 g P
  { id: "col-hummus-pan-arabe", name: "Hummus con pan árabe y pepino",
    slots: ["colacion","merienda"], diet: ["vegano","vegetariano","sin_lacteos"], contains: ["gluten"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Hummus", g: 50, min: 30, max: 90, flex: "fat" },
      { food: "Pan de pita / árabe", g: 35, min: 20, max: 70, flex: "carb" },
      { food: "Pepino", g: 80, min: 50, max: 120 } ] }, // ~225 kcal, 7.1 g P
  { id: "col-manzana-mani", name: "Manzana con mantequilla de maní",
    slots: ["colacion"], diet: ["vegano","vegetariano","sin_lacteos","sin_gluten"], contains: ["mani","frutos_secos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Manzana", g: 150, min: 100, max: 200 },
      { food: "Mantequilla de maní", g: 20, min: 10, max: 30, flex: "fat" } ] }, // ~198 kcal, 4.4 g P
  { id: "col-manzana-almendras", name: "Manzana con almendras",
    slots: ["colacion"], diet: ["vegano","vegetariano","sin_lacteos","sin_gluten"], contains: ["frutos_secos"], prep: "rapido", cost: "alto",
    items: [
      { food: "Manzana", g: 150, min: 100, max: 200 },
      { food: "Almendras", g: 25, min: 15, max: 40, flex: "fat" } ] }, // ~222 kcal, 5 g P
  { id: "col-pera-nueces", name: "Pera con nueces",
    slots: ["colacion"], diet: ["vegano","vegetariano","sin_lacteos","sin_gluten"], contains: ["frutos_secos"], prep: "rapido", cost: "alto",
    items: [
      { food: "Pera", g: 150, min: 100, max: 200 },
      { food: "Nueces", g: 20, min: 10, max: 35, flex: "fat" } ] }, // ~217 kcal, 4.3 g P
  { id: "col-mandarina-caju", name: "Mandarinas con castañas de cajú",
    slots: ["colacion"], diet: ["vegano","vegetariano","sin_lacteos","sin_gluten"], contains: ["frutos_secos"], prep: "rapido", cost: "alto",
    items: [
      { food: "Mandarina", g: 200, min: 100, max: 300 },
      { food: "Castañas de cajú", g: 20, min: 10, max: 35, flex: "fat" } ] }, // ~217 kcal, 5.7 g P
  { id: "col-mix-arandanos", name: "Mix de frutos secos con arándanos",
    slots: ["colacion"], diet: ["vegano","vegetariano","sin_lacteos","sin_gluten"], contains: ["frutos_secos","mani"], prep: "rapido", cost: "alto",
    items: [
      { food: "Frutos secos mix", g: 25, min: 15, max: 40, flex: "fat" },
      { food: "Arándanos", g: 60, min: 40, max: 100 } ] }, // ~180 kcal, 4.9 g P
  { id: "col-pochoclo-mani", name: "Pochoclo con maní",
    slots: ["colacion"], diet: ["vegetariano","sin_gluten"], contains: ["mani","frutos_secos","lacteos"], prep: "medio", cost: "bajo",
    items: [
      { food: "Pochoclo / maiz pisingallo (sin manteca)", g: 30, min: 20, max: 50, flex: "carb" },
      { food: "Maní tostado", g: 20, min: 10, max: 30, flex: "fat" } ] }, // ~227 kcal, 7.9 g P
  { id: "col-barrita-yogur", name: "Barrita de cereal con yogur",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["gluten","lacteos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Barritas de cereal", g: 30, min: 30, max: 60, flex: "carb" },
      { food: "Yogur descremado", g: 150, min: 100, max: 300, flex: "protein" } ] }, // ~204 kcal, 10.6 g P
  { id: "col-licuado-banana-whey", name: "Licuado de banana con leche y whey",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "alto",
    items: [
      { food: "Leche descremada", g: 250, min: 150, max: 300 },
      { food: "Banana", g: 100, min: 60, max: 150 },
      { food: "Whey protein", g: 15, min: 10, max: 30, flex: "protein" } ] }, // ~237 kcal, 21.8 g P
  { id: "col-licuado-vegano", name: "Licuado vegano de banana y soja",
    slots: ["colacion","merienda"], diet: ["vegano","vegetariano","sin_lacteos","sin_gluten"], contains: ["soja"], prep: "rapido", cost: "alto",
    items: [
      { food: "Leche de soja", g: 250, min: 150, max: 300 },
      { food: "Banana", g: 100, min: 60, max: 150 },
      { food: "Proteína vegana", g: 20, min: 15, max: 30, flex: "protein" } ] }, // ~271 kcal, 21.2 g P
  { id: "col-licuado-frutillas-whey", name: "Licuado de frutillas con leche y whey",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "alto",
    items: [
      { food: "Leche descremada", g: 250, min: 150, max: 300 },
      { food: "Frutillas", g: 150, min: 100, max: 200 },
      { food: "Whey protein", g: 20, min: 10, max: 30, flex: "protein" } ] }, // ~216 kcal, 26 g P
  { id: "col-licuado-frutillas-yogur", name: "Licuado de frutillas con yogur",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Yogur descremado", g: 150, min: 100, max: 300, flex: "protein" },
      { food: "Leche descremada", g: 150, min: 100, max: 250 },
      { food: "Frutillas", g: 150, min: 100, max: 200 } ] }, // ~185 kcal, 15 g P
  { id: "col-kefir-arandanos", name: "Kéfir con arándanos y avena",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["lacteos","gluten"], prep: "rapido", cost: "medio",
    items: [
      { food: "Kéfir", g: 250, min: 150, max: 300, flex: "protein" },
      { food: "Arándanos", g: 80, min: 50, max: 120 },
      { food: "Avena (seca)", g: 15, min: 10, max: 30, flex: "carb" } ] }, // ~231 kcal, 11.1 g P
  { id: "col-cacao-galletitas", name: "Cacao con leche y galletitas de arroz",
    slots: ["merienda","colacion"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Cacao (con leche)", g: 250, min: 200, max: 300 },
      { food: "Galletitas de arroz", g: 18, min: 18, max: 54, flex: "carb" } ] }, // ~200 kcal, 6 g P
  { id: "col-tostada-qcrema-frutillas", name: "Tostada con queso crema y frutillas",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["gluten","lacteos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Tostadas", g: 26, min: 13, max: 52, flex: "carb" },
      { food: "Queso crema", g: 30, min: 20, max: 50, flex: "fat" },
      { food: "Frutillas", g: 80, min: 50, max: 120 } ] }, // ~221 kcal, 6.5 g P
  { id: "col-tostada-ricota-tomate", name: "Tostada con ricota y tomate",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["gluten","lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Tostadas", g: 26, min: 13, max: 52, flex: "carb" },
      { food: "Ricota", g: 60, min: 40, max: 100, flex: "protein" },
      { food: "Tomate", g: 60, min: 40, max: 100 } ] }, // ~207 kcal, 10.1 g P
  { id: "col-tostada-qfresco-tomate", name: "Tostada con queso fresco y tomate",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["gluten","lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Tostadas", g: 26, min: 13, max: 52, flex: "carb" },
      { food: "Queso fresco", g: 70, min: 40, max: 110, flex: "protein" },
      { food: "Tomate", g: 60, min: 40, max: 100 } ] }, // ~184 kcal, 10.5 g P
  { id: "col-tostada-mani-banana", name: "Tostada con mantequilla de maní y banana",
    slots: ["colacion","merienda"], diet: ["vegano","vegetariano","sin_lacteos"], contains: ["gluten","mani","frutos_secos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Tostadas", g: 26, min: 13, max: 52, flex: "carb" },
      { food: "Mantequilla de maní", g: 15, min: 10, max: 25, flex: "fat" },
      { food: "Banana", g: 80, min: 50, max: 120 } ] }, // ~253 kcal, 7 g P
  { id: "col-gelatina-yogur", name: "Gelatina con yogur y frutillas",
    slots: ["colacion","merienda"], diet: ["sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Gelatina", g: 120, min: 120, max: 240 },
      { food: "Yogur descremado", g: 150, min: 100, max: 300, flex: "protein" },
      { food: "Frutillas", g: 80, min: 50, max: 120 } ] }, // ~180 kcal, 11.1 g P
  { id: "col-budin-yogur", name: "Rebanada de budín con yogur",
    slots: ["merienda","colacion"], diet: ["vegetariano"], contains: ["gluten","huevo","lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Budín inglés (1 feta)", g: 40, min: 40, max: 80, flex: "carb" },
      { food: "Yogur descremado", g: 150, min: 100, max: 300, flex: "protein" } ] }, // ~214 kcal, 10.6 g P
  { id: "col-chipa", name: "Chipá con mate cocido",
    slots: ["merienda","colacion"], diet: ["vegetariano"], contains: ["lacteos","huevo"], prep: "medio", cost: "bajo",
    items: [
      { food: "Chipá", g: 80, min: 40, max: 120, flex: "carb" },
      { food: "Mate cocido (sin azúcar)", g: 200, min: 150, max: 300 } ] }, // ~262 kcal, 8 g P
  { id: "col-sandwich-jamon-queso", name: "Sándwich de jamón cocido y queso port salut",
    slots: ["merienda","colacion"], diet: [], contains: ["gluten","lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Pan lactal blanco", g: 50, min: 25, max: 100, flex: "carb" },
      { food: "Jamón cocido", g: 40, min: 40, max: 80, flex: "protein" },
      { food: "Queso port salut", g: 30, min: 30, max: 60 } ] }, // ~276 kcal, 17 g P
  { id: "col-cottage-galleta-tomate", name: "Galletitas de arroz con cottage y tomate cherry",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Galletitas de arroz", g: 36, min: 18, max: 72, flex: "carb" },
      { food: "Queso cottage", g: 80, min: 50, max: 130, flex: "protein" },
      { food: "Tomate cherry", g: 60, min: 40, max: 100 } ] }, // ~229 kcal, 11.4 g P
  { id: "col-cottage-anana", name: "Queso cottage con ananá",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Queso cottage", g: 120, min: 80, max: 200, flex: "protein" },
      { food: "Ananá (piña)", g: 100, min: 70, max: 150 } ] }, // ~168 kcal, 14.2 g P
  { id: "col-yogur-mani-banana", name: "Yogur griego con banana y mantequilla de maní",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos","mani","frutos_secos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Yogur griego entero", g: 120, min: 100, max: 250, flex: "protein" },
      { food: "Banana", g: 80, min: 50, max: 120 },
      { food: "Mantequilla de maní", g: 10, min: 5, max: 20, flex: "fat" } ] }, // ~248 kcal, 13.7 g P
  { id: "col-porridge-whey", name: "Porridge de avena con banana y whey",
    slots: ["colacion","merienda"], diet: ["vegetariano"], contains: ["gluten","lacteos"], prep: "medio", cost: "medio",
    items: [
      { food: "Avena cocida (porridge)", g: 150, min: 100, max: 250, flex: "carb" },
      { food: "Banana", g: 80, min: 50, max: 120 },
      { food: "Whey protein", g: 15, min: 10, max: 30, flex: "protein" } ] }, // ~238 kcal, 16.4 g P
  { id: "col-rolls-jamon-crema", name: "Rolls de jamón cocido con queso crema y pepino",
    slots: ["colacion","merienda"], diet: ["sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Jamón cocido", g: 60, min: 40, max: 100, flex: "protein" },
      { food: "Queso crema", g: 20, min: 20, max: 40 },
      { food: "Pepino", g: 50, min: 30, max: 100 } ] }, // ~155 kcal, 12.9 g P
  { id: "col-rolls-jamon-queso", name: "Rolls de jamón y queso port salut con tomate cherry",
    slots: ["colacion","merienda"], diet: ["sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Jamón cocido", g: 60, min: 40, max: 100, flex: "protein" },
      { food: "Queso port salut", g: 30, min: 30, max: 60 },
      { food: "Tomate cherry", g: 60, min: 40, max: 100 } ] }, // ~179 kcal, 17.1 g P
  { id: "col-fruta-yogur-ensalada", name: "Ensalada de frutas con yogur",
    slots: ["colacion","merienda"], diet: ["vegetariano","sin_gluten"], contains: ["lacteos"], prep: "rapido", cost: "bajo",
    items: [
      { food: "Manzana", g: 75, min: 50, max: 110 },
      { food: "Banana", g: 60, min: 40, max: 90 },
      { food: "Naranja", g: 65, min: 40, max: 100 },
      { food: "Yogur descremado", g: 150, min: 100, max: 300, flex: "protein" } ] }, // ~208 kcal, 9.6 g P
  { id: "col-ensalada-frutas-almendras", name: "Ensalada de frutas y almendras",
    slots: ["colacion"], diet: ["vegano","vegetariano","sin_lacteos","sin_gluten"], contains: ["frutos_secos"], prep: "rapido", cost: "medio",
    items: [
      { food: "Manzana", g: 80, min: 50, max: 120 },
      { food: "Naranja", g: 100, min: 60, max: 150 },
      { food: "Uvas", g: 60, min: 40, max: 100 },
      { food: "Almendras", g: 15, min: 10, max: 30, flex: "fat" } ] }, // ~217 kcal, 4.2 g P
  { id: "col-chocolate-almendras", name: "Chocolate amargo con almendras",
    slots: ["colacion"], diet: ["vegetariano","sin_gluten"], contains: ["frutos_secos"], prep: "rapido", cost: "alto",
    items: [
      { food: "Chocolate amargo 70%", g: 20, min: 10, max: 40, flex: "carb" },
      { food: "Almendras", g: 15, min: 10, max: 30, flex: "fat" } ] }, // ~207 kcal, 5 g P
];
