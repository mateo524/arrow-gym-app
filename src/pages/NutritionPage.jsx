import { formatDMY } from "../lib/dates.js";
import { useState, useMemo, useCallback, useRef } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import Icon from "../components/Icon";
import { todayLocal } from "../lib/dates.js";
import { features, vocab } from "../config/features.js";
import { searchFoods } from "../data/foodDatabase.js";
import { searchSharedFoods, publishSharedFood } from "../lib/sharedFoods.js";
import { generateNutritionPlan } from "../data/nutritionData.js";
import BarcodeScanner from "../components/BarcodeScanner.jsx";
import ReportFoodButton from "../components/ReportFoodButton.jsx";
import { isSubscribed as hasAccess } from "../config/pricing.js";

const MEAL_TYPES = ["Desayuno", "Colación", "Almuerzo", "Merienda", "Cena"];

function getMealType() {
  const h = new Date().getHours();
  if (h >= 7 && h <= 10) return "Desayuno";
  if (h >= 11 && h <= 13) return "Colación";
  if (h >= 14 && h <= 16) return "Almuerzo";
  if (h >= 17 && h <= 19) return "Merienda";
  if (h >= 20) return "Cena";
  return "Colación";
}

// Round to max 1 decimal place, return as number (eliminates trailing zeros)
const r2 = (n) => Math.round((Number(n) || 0) * 10) / 10;

const QUICK_FOODS = [
  { name: "Arroz (100g cocido)",    kcal: 130, protein: 3,  carbs: 28, fat: 0 },
  { name: "Pechuga pollo (100g)",   kcal: 165, protein: 31, carbs: 0,  fat: 3 },
  { name: "Huevo entero",           kcal: 72,  protein: 6,  carbs: 0,  fat: 5 },
  { name: "Banana mediana",         kcal: 89,  protein: 1,  carbs: 23, fat: 0 },
  { name: "Avena (50g)",            kcal: 189, protein: 7,  carbs: 32, fat: 4 },
  { name: "Atún al natural (100g)", kcal: 116, protein: 26, carbs: 0,  fat: 1 },
  { name: "Papa hervida (100g)",    kcal: 77,  protein: 2,  carbs: 17, fat: 0 },
  { name: "Leche entera (250ml)",   kcal: 152, protein: 8,  carbs: 12, fat: 8 },
  { name: "Yogur griego (150g)",    kcal: 100, protein: 10, carbs: 4,  fat: 5 },
  { name: "Almendras (30g)",        kcal: 173, protein: 6,  carbs: 6,  fat: 15 },
  { name: "Carne picada 90% (100g)",kcal: 218, protein: 26, carbs: 0,  fat: 13 },
  { name: "Pan integral (1 rebanada)",kcal: 70, protein: 3, carbs: 13, fat: 1 },
];

function polarToCartesian(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx, cy, r, start, end) {
  if (end - start >= 359.9) end = start + 359.9;
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  return `M${s.x} ${s.y} A${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
}
function MacroDonut({ protein = 0, carbs = 0, fat = 0 }) {
  const pk = (Number(protein) || 0) * 4;
  const ck = (Number(carbs) || 0) * 4;
  const fk = (Number(fat) || 0) * 9;
  const total = pk + ck + fk || 1;
  const segs = [
    { kcal: pk, color: "#60a5fa", label: "Proteína", g: Number(protein) || 0 },
    { kcal: ck, color: "#f59e0b", label: "Carbs",    g: Number(carbs)   || 0 },
    { kcal: fk, color: "#f87171", label: "Grasas",   g: Number(fat)     || 0 },
  ];
  const cx = 46, cy = 46, r = 38, sw = 12;
  let cumPct = 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
      <svg width="92" height="92" viewBox="0 0 92 92" style={{ flexShrink:0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={sw} />
        {segs.map((seg, i) => {
          const pct = seg.kcal / total;
          if (pct < 0.005) { cumPct += pct; return null; }
          const start = cumPct * 360;
          cumPct += pct;
          const end = cumPct * 360;
          return <path key={i} d={arcPath(cx, cy, r, start, end)} fill="none" stroke={seg.color} strokeWidth={sw} strokeLinecap="butt" />;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text)">{Math.round(protein)}g</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fill="var(--muted)">prot</text>
      </svg>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
        {segs.map(seg => (
          <div key={seg.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:seg.color, flexShrink:0 }} />
            <span style={{ fontSize:12, color:"var(--muted)", flex:1 }}>{seg.label}</span>
            <span style={{ fontSize:12, fontWeight:700, color:"var(--text)" }}>{Math.round(seg.g)}g</span>
            <span style={{ fontSize:11, color:seg.color, fontWeight:700, minWidth:30, textAlign:"right" }}>{Math.round(seg.kcal / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const profile  = useAuthStore(s => s.profile);
  const setPage  = useStore(s => s.setPage);

  // Subscription gate — compute flag only, actual gate applied after all hooks
  const isSubscribed = hasAccess(profile) || ["trainer","admin","superadmin"].includes(profile?.role);
  const isLocked = profile && !isSubscribed;

  const f   = features(profile);
  const voc = vocab(profile);

  const mealLog        = useStore(s => s.mealLog) || [];
  const savedCombos    = useStore(s => s.savedMealCombos) || [];
  const logMeal        = useStore(s => s.logMeal);
  const deleteMeal     = useStore(s => s.deleteMeal);
  const saveMealCombo   = useStore(s => s.saveMealCombo);
  const logMealCombo    = useStore(s => s.logMealCombo);
  const deleteMealCombo = useStore(s => s.deleteMealCombo);
  const weightLog      = useStore(s => s.weightLog) || [];
  const userGoal       = useStore(s => s.userGoal) || "mantenimiento";

  const [tab, setTab]         = useState("hoy");    // "hoy" | "semana" | "plan" (plan hidden in simple)

  const [showForm, setShowForm] = useState(false);
  const [foodMode, setFoodMode] = useState("buscar"); // "buscar" = elegir de la lista | "crear" = alimento nuevo
  const [showQuick, setShowQuick] = useState(false);
  const [form, setForm]       = useState({ type:getMealType(), name:"", kcal:"", protein:"", carbs:"", fat:"", grams:"" });
  const [saving, setSaving]   = useState(false);
  const [dbQuery, setDbQuery] = useState("");
  const [dbResults, setDbResults] = useState([]);
  const [baseFood, setBaseFood] = useState(null);
  const [macrosEdited, setMacrosEdited] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // ── MIS COMIDAS — combo modal state ──────────────────────────────────────
  const [showComboModal, setShowComboModal] = useState(false);
  const [comboName, setComboName] = useState("");
  const [comboFoods, setComboFoods] = useState([]);
  const [comboDbQuery, setComboDbQuery] = useState("");
  const [comboDbResults, setComboDbResults] = useState([]);

  const addCustomFood    = useStore(s => s.addCustomFood);
  const deleteCustomFood = useStore(s => s.deleteCustomFood);
  const storeCustomFoods = useStore(s => s.customFoods) || [];
  const customKcal    = useStore(s => s.customKcal) ?? "";
  const setCustomKcal = useStore(s => s.setCustomKcal);
  const [showKcalEdit, setShowKcalEdit] = useState(false);

  // Nutrition plan wizard state
  const nutritionPlan     = useStore(s => s.nutritionPlan);
  const saveNutritionPlan = useStore(s => s.saveNutritionPlan);
  const clearNutritionPlan = useStore(s => s.clearNutritionPlan);
  const [showWizard, setShowWizard] = useState(false);
  const [wizStep, setWizStep]   = useState(0);
  const [wizDays, setWizDays]   = useState(7);
  const [wizMeals, setWizMeals] = useState(4);
  const [wizRestrictions, setWizRestrictions] = useState([]);
  const [wizAllergies, setWizAllergies]       = useState([]);
  const [wizBudget, setWizBudget] = useState("moderado");
  const [expandedPlanDay, setExpandedPlanDay] = useState(0);
  const wizSeedRef = useRef(Math.floor(Math.random() * 9999));

  const searchSeqRef = useRef(0);
  const handleDbSearch = useCallback((q) => {
    setDbQuery(q);
    const seq = ++searchSeqRef.current;
    if (q.trim().length >= 2) {
      const matches = searchFoods(q, 12);
      const lq = q.toLowerCase();
      const customMatches = (storeCustomFoods || []).filter(f =>
        f.name.toLowerCase().includes(lq)
      );
      const local = [...customMatches, ...matches];
      setDbResults(local.slice(0, 20));
      // Alimentos creados por otros usuarios (catálogo compartido)
      searchSharedFoods(q, 10).then(shared => {
        if (seq !== searchSeqRef.current || shared.length === 0) return;
        const seen = new Set(local.map(f => f.name.toLowerCase()));
        const extra = shared.filter(f => !seen.has(f.name.toLowerCase()));
        setDbResults([...local, ...extra].slice(0, 25));
      });
    } else {
      setDbResults([]);
    }
  }, [storeCustomFoods]);

  const selectDbFood = useCallback((food) => {
    // Normalise to per-100g so handleGramsChange can scale correctly
    const per100 = food.grams && food.grams !== 100
      ? {
          kcal:    Math.round(food.kcal    / food.grams * 100),
          protein: Math.round(food.protein / food.grams * 100 * 10) / 10,
          carbs:   Math.round(food.carbs   / food.grams * 100 * 10) / 10,
          fat:     Math.round(food.fat     / food.grams * 100 * 10) / 10,
        }
      : { kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat };
    setBaseFood({ ...food, ...per100 });
    setMacrosEdited(false);
    setForm(f => ({
      ...f,
      name: food.name,
      grams: String(food.grams || 100),
      kcal: String(food.kcal),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    }));
    setDbQuery("");
    setDbResults([]);
  }, []);

  const handleGramsChange = useCallback((g) => {
    setForm(f => {
      // If user manually edited macro fields, don't overwrite them
      if (!baseFood || !g || macrosEdited) return { ...f, grams: g };
      const factor = Number(g) / 100;
      return {
        ...f,
        grams: g,
        kcal:    String(r2(baseFood.kcal    * factor)),
        protein: String(r2(baseFood.protein * factor)),
        carbs:   String(r2(baseFood.carbs   * factor)),
        fat:     String(r2(baseFood.fat     * factor)),
      };
    });
  }, [baseFood, macrosEdited]);

  const today = todayLocal();
  const age = (() => {
    const dob = profile?.date_of_birth ? new Date(profile.date_of_birth) : null;
    if (!dob || isNaN(dob)) return null;
    const now = new Date();
    let a = now.getFullYear() - dob.getFullYear();
    if (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate())) a -= 1;
    return a;
  })();
  const isMinor = age !== null && age < 18;
  const bodyWeight = Number([...weightLog].sort((a,b) => String(b.date).localeCompare(String(a.date)))[0]?.kg) || null;

  // TDEE estimate — Harris-Benedict simplificado sin altura/sexo
  // Multipliers: mantenimiento=sedentario-leve, volumen=moderado, definicion=moderado, rendimiento=activo
  const tdee = useMemo(() => {
    if (!bodyWeight) return null;
    // RMR aproximado: 22 kcal/kg (promedio hombre+mujer sin datos de composición)
    const h = Number(profile?.height_cm);
    const sx = profile?.sex;
    // Mifflin-St Jeor si tenemos altura, edad y sexo; si no, estimación simple
    const rmr = (h > 0 && age !== null && (sx === "M" || sx === "F"))
      ? 10 * bodyWeight + 6.25 * h - 5 * age + (sx === "M" ? 5 : -161)
      : bodyWeight * 22;
    const multipliers = { mantenimiento:1.55, volumen:1.65, definicion:1.50, rendimiento:1.70 };
    const safeGoal = isMinor && userGoal === "definicion" ? "mantenimiento" : userGoal;
    const tdeeRaw = Math.round(rmr * (multipliers[safeGoal] ?? 1.55));
    // Déficit máximo 25 % (20 % si es menor de 21) y nunca bajo el piso de calorías
    const maintenance = Math.round(rmr * 1.55);
    const maxDeficit = (age !== null && age < 21) ? 0.8 : 0.75;
    const floor = sx === "M" ? 1500 : 1200;
    const t = safeGoal === "definicion" ? Math.max(tdeeRaw, Math.round(maintenance * maxDeficit)) : tdeeRaw;
    return Math.max(t, floor);
  }, [bodyWeight, userGoal, profile, age, isMinor]);

  // Macro targets — consenso deportivo para gym-goers
  // Proteína: 1.6g/kg mant, 2.0g/kg volumen, 2.2g/kg definición, 1.8g/kg rendimiento
  // (el mínimo OMS de 0.8g/kg es para sedentarios; para gym el estándar es 1.6-2.2g/kg)
  const targets = useMemo(() => {
    const bw = bodyWeight || 70; // fallback 70kg si no hay peso registrado
    const goalMap = {
      volumen:       { proteinFactor:1.8, carbFactor:4.0, fatFactor:1.0 },  // ISSN: 1.6-2.2g/kg; 1.8 es punto medio conservador
      definicion:    { proteinFactor:2.2, carbFactor:2.5, fatFactor:0.8 },  // Helms 2014: 2.3-3.1g/kg LBM en corte; 2.2g/kg total razonable
      mantenimiento: { proteinFactor:1.6, carbFactor:3.5, fatFactor:1.0 },  // ISSN mínimo para activos
      rendimiento:   { proteinFactor:1.8, carbFactor:5.0, fatFactor:1.0 },  // Volumen + alto rendimiento aeróbico
    };
    const g = goalMap[userGoal] ?? goalMap.mantenimiento;
    const protein = Math.round(bw * (isMinor ? Math.min(g.proteinFactor, 1.6) : g.proteinFactor));
    const fat     = Math.round(bw * g.fatFactor);
    // Carbs se calculan para cerrar las calorías desde el TDEE
    const kcalBase = tdee || Math.round(bw * 22 * 1.55);
    const carbsKcal = kcalBase - (protein * 4) - (fat * 9);
    const carbs = Math.max(Math.round(carbsKcal / 4), Math.round(bw * g.carbFactor));
    const kcal  = protein*4 + carbs*4 + fat*9;
    return { kcal, protein, carbs, fat, proteinPerKg: g.proteinFactor };
  }, [bodyWeight, userGoal, tdee, isMinor]);

  const kcalFloor = profile?.sex === "M" ? 1500 : 1200;
  const customKcalNum = Number(customKcal) || 0;
  const customKcalOut = customKcalNum > 0 && (customKcalNum < kcalFloor || customKcalNum > 5000);
  // Una meta fuera de rango seguro no se aplica: se usa la calculada
  const effectiveKcal = customKcalNum > 0 && !customKcalOut ? customKcalNum : targets.kcal;

  // Recalculate macros if using custom kcal
  const effectiveTargets = useMemo(() => {
    if (!customKcalNum || customKcalOut) return targets;
    const kcal = customKcalNum;
    const protein = targets.protein;
    const fat = targets.fat;
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { ...targets, kcal, carbs };
  }, [customKcalNum, customKcalOut, targets]);

  const todayMeals = useMemo(() => {
    const uid = profile?.id;
    return mealLog.filter(m => m.date === today && (!uid || m.user_id === uid));
  }, [mealLog, today, profile]);
  const todayTotals = useMemo(() => {
    const raw = todayMeals.reduce((s,m) => ({
      kcal:    s.kcal    + (Number(m.kcal)    || 0),
      protein: s.protein + (Number(m.protein) || 0),
      carbs:   s.carbs   + (Number(m.carbs)   || 0),
      fat:     s.fat     + (Number(m.fat)     || 0),
    }), { kcal:0, protein:0, carbs:0, fat:0 });
    return { kcal: r2(raw.kcal), protein: r2(raw.protein), carbs: r2(raw.carbs), fat: r2(raw.fat) };
  }, [todayMeals]);

  // Last 7 days avg
  const weekAvg = useMemo(() => {
    const uid = profile?.id;
    const days = Array.from({length:7},(_,i) => {
      const d = new Date(); d.setDate(d.getDate()-i);
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d - offset).toISOString().slice(0,10);
    });
    const dayTotals = days.map(d => mealLog.filter(m => m.date===d && (!uid || m.user_id === uid)).reduce((s,m) => s+(Number(m.kcal)||0), 0));
    const filled = dayTotals.filter(v => v > 0);
    return filled.length ? Math.round(filled.reduce((a,b) => a+b, 0) / filled.length) : 0;
  }, [mealLog, profile]);

  function resetForm() {
    setForm({ type:getMealType(), name:"", kcal:"", protein:"", carbs:"", fat:"", grams:"" });
    setShowForm(false);
    setFoodMode("buscar");
    setShowQuick(false);
    setDbQuery("");
    setDbResults([]);
    setBaseFood(null);
    setMacrosEdited(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || !form.kcal) return;
    setSaving(true);
    logMeal({ type: form.type, name: form.name.trim(), kcal: r2(form.kcal), protein: r2(form.protein), carbs: r2(form.carbs), fat: r2(form.fat) });
    // Save as custom food if not in DB and not already saved as custom
    const dbCheck = searchFoods(form.name, 5);
    const alreadyCustom = (storeCustomFoods || []).some(f => f.name.toLowerCase() === form.name.trim().toLowerCase());
    if (foodMode === "crear" && !alreadyCustom && !dbCheck.some(f => f.name.toLowerCase() === form.name.toLowerCase())) {
      addCustomFood?.({
        id: `custom-${form.name.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}`,
        name: form.name.trim(),
        cat: "Mis alimentos",
        serving: form.grams ? `${form.grams}g` : "100g",
        grams: form.grams ? Number(form.grams) : 100,
        kcal: r2(form.kcal),
        protein: r2(form.protein),
        carbs: r2(form.carbs),
        fat: r2(form.fat),
      });
      window.__showToast?.("Alimento guardado. También lo van a poder usar los demás usuarios", "success");
      publishSharedFood({ name: form.name, grams: form.grams, kcal: form.kcal, protein: form.protein, carbs: form.carbs, fat: form.fat });
    }
    resetForm();
    setSaving(false);
  }

  function addQuickFood(food) {
    logMeal({ type: form.type, name: food.name, kcal: r2(food.kcal), protein: r2(food.protein), carbs: r2(food.carbs), fat: r2(food.fat) });
  }

  const macroBar = (val, target, color) => {
    const pct = Math.min(100, target > 0 ? Math.round((val/target)*100) : 0);
    return (
      <div style={{ height:6, background:"rgba(255,255,255,.08)", borderRadius:4, overflow:"hidden", marginTop:4 }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:4, transition:"width .6s ease" }} />
      </div>
    );
  };

  const goalLabels = { volumen:"Volumen", definicion:"Definición", mantenimiento:"Mantenimiento", rendimiento:"Rendimiento" };

  if (isLocked) {
    return (
      <section className="page" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"48px 24px" }}>
        <h2 style={{ margin:"0 0 8px", fontSize:22 }}>Comidas</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginBottom:28, maxWidth:280 }}>
          Registrá tus comidas, seguí tus macros y recibí recomendaciones adaptadas a tu objetivo.
        </p>
        <button className="primary" style={{ padding:"13px 28px", borderRadius:14, fontSize:14, fontWeight:700 }}
          onClick={async () => {
            try {
              const { supabase } = await import("../lib/supabase.js");
              const { data, error } = await supabase.functions.invoke("mp-create-subscription");
              if (data?.already_active) { window.__showToast?.("Ya tenés una suscripción activa.", "info"); return; }
              if (!error && data?.init_point) window.location.href = data.init_point;
              else window.__showToast?.("No se pudo iniciar el pago. Intentá de nuevo.", "error");
            } catch { window.__showToast?.("Error de conexión.", "error"); }
          }}>
          Suscribirme — $10.000/mes
        </button>
        <p style={{ color:"var(--muted)", fontSize:11, marginTop:12 }}>Pago mensual de 30 días · te avisamos antes de que venza</p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="home-header">
        <div style={{ flex:1 }}>
          <p className="eyebrow">Seguimiento</p>
          <h1 style={{ margin:0 }}>Comidas</h1>
        </div>
        <button className="primary" style={{ padding:"8px 14px", fontSize:13, borderRadius:12 }} onClick={() => { setShowForm(true); setShowQuick(false); }}>
          + Agregar
        </button>
      </div>

      <p style={{ fontSize:11, color:"var(--muted)", margin:"-6px 0 12px" }}>
        Los valores son orientativos y no reemplazan la consulta con un médico o nutricionista.
        {isMinor && " Si sos menor de 18, consultá con un profesional antes de cambiar tu alimentación."}
      </p>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        {[["hoy","Hoy"],["semana","Semana"],...(f.coach_insights ? [["plan","Plan"]] : []),["historial","Historial"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
            background: tab===id ? "var(--green)" : "var(--panel2)", color: tab===id ? "#fff" : "var(--muted)",
          }}>{label}</button>
        ))}
      </div>

      {/* ── HOY ── */}
      {tab === "hoy" && (<>
        {/* Resumen calórico */}
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Calorías hoy</div>
              <div style={{ fontSize:36, fontWeight:900, color:"var(--green)", lineHeight:1 }}>
                {todayTotals.kcal}
                <span style={{ fontSize:14, fontWeight:400, color:"var(--muted)", marginLeft:4 }}>/ {effectiveKcal} kcal</span>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"var(--muted)" }}>Restante</div>
              <div style={{ fontSize:20, fontWeight:800, color: effectiveKcal - todayTotals.kcal >= 0 ? "var(--text)" : "#ef4444" }}>
                {effectiveKcal - todayTotals.kcal} kcal
              </div>
            </div>
          </div>
          {macroBar(todayTotals.kcal, effectiveKcal, "var(--green)")}
        </div>

        {/* Split de macros */}
        {(todayTotals.protein > 0 || todayTotals.carbs > 0 || todayTotals.fat > 0) && (
          <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px 16px 14px", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Split de macros</div>
            <MacroDonut protein={todayTotals.protein} carbs={todayTotals.carbs} fat={todayTotals.fat} />
          </div>
        )}

        {/* Macros — hidden in simple mode */}
        {f.coach_insights && <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
          {[
            { label:"Proteína", val:todayTotals.protein, target:effectiveTargets.protein, unit:"g", color:"#60a5fa" },
            { label:"Carbs",    val:todayTotals.carbs,   target:effectiveTargets.carbs,   unit:"g", color:"#f59e0b" },
            { label:"Grasa",    val:todayTotals.fat,     target:effectiveTargets.fat,     unit:"g", color:"#f87171" },
          ].map(m => (
            <div key={m.label} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"12px 10px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{m.label}</div>
              <div style={{ fontSize:20, fontWeight:900, color:m.color, lineHeight:1, marginTop:4 }}>{m.val}<span style={{ fontSize:11, fontWeight:400, color:"var(--muted)" }}>{m.unit}</span></div>
              <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>meta {m.target}{m.unit}</div>
              {macroBar(m.val, m.target, m.color)}
            </div>
          ))}
        </div>}

        {/* Mis combinaciones: platos armados que se guardan y se cargan con un toque */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <p className="section-label" style={{ margin:0 }}>Mis combinaciones</p>
            <button type="button" onClick={() => setShowComboModal(true)}
              style={{ background:"rgba(52,211,153,.12)", border:"1px solid rgba(52,211,153,.35)", color:"var(--green)", borderRadius:10, padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              + Armar combinación
            </button>
          </div>
          {savedCombos.length === 0 ? (
            <div style={{ fontSize:12, color:"var(--muted)", background:"var(--panel)", border:"1px dashed var(--line)", borderRadius:12, padding:"12px 14px" }}>
              Guardá platos que repetís, por ejemplo <b>patitas de pollo con arroz</b> o <b>sándwich de lomo con tomate</b>, y cargalos con un solo toque.
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {savedCombos.map(c => {
                const tot = (c.meals || []).reduce((t, m) => ({ kcal:t.kcal + (Number(m.kcal)||0), protein:t.protein + (Number(m.protein)||0) }), { kcal:0, protein:0 });
                return (
                  <div key={c.id} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"10px 12px", display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700 }}>{c.name}</div>
                      <div style={{ fontSize:11, color:"var(--muted)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {(c.meals || []).map(m => m.name).join(" + ")}
                      </div>
                      <div style={{ fontSize:12, color:"var(--green)", fontWeight:700, marginTop:2 }}>{Math.round(tot.kcal)} kcal · {Math.round(tot.protein)}g P</div>
                    </div>
                    <button type="button" className="primary" style={{ padding:"8px 12px", fontSize:12 }}
                      onClick={() => { logMealCombo(c.id); window.__showToast?.(`${c.name} agregado a hoy`, "success"); }}>
                      Agregar a hoy
                    </button>
                    <button type="button" aria-label={`Borrar ${c.name}`}
                      onClick={() => { if (window.confirm(`¿Borrar la combinación "${c.name}"?`)) deleteMealCombo(c.id); }}
                      style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"var(--muted)", padding:4, lineHeight:1 }}>×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Meals list */}
        <p className="section-label">Comidas de hoy</p>
        {todayMeals.length === 0 ? (
          <div style={{ textAlign:"center", padding:"28px 16px", color:"var(--muted)", fontSize:13 }}>
            Todavía no registraste nada hoy
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {todayMeals.map(m => (
              <div key={m.id} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)", marginBottom:2 }}>{m.type}</div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{m.name}</div>
                  <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>
                    {r2(m.kcal)} kcal
                    {m.protein > 0 && <span> · {r2(m.protein)}g P</span>}
                    {m.carbs > 0   && <span> · {r2(m.carbs)}g C</span>}
                    {m.fat > 0     && <span> · {r2(m.fat)}g G</span>}
                  </div>
                </div>
                <button onClick={() => deleteMeal(m.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--muted)", padding:4, lineHeight:1 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </>)}

      {/* ── SEMANA ── */}
      {tab === "semana" && (<>
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px", marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Promedio últimos 7 días</div>
          <div style={{ fontSize:32, fontWeight:900, color:"var(--green)" }}>{weekAvg} <span style={{ fontSize:14, fontWeight:400, color:"var(--muted)" }}>kcal/día</span></div>
          {tdee && <div style={{ fontSize:12, color:"var(--muted)", marginTop:6 }}>
            {f.coach_insights
              ? <>Tu TDEE estimado: <b style={{ color:"var(--text)" }}>{tdee} kcal</b> · objetivo: <b style={{ color:"var(--green)" }}>{goalLabels[userGoal]}</b></>
              : <>Meta diaria sugerida: <b style={{ color:"var(--green)" }}>{tdee} kcal</b></>
            }
          </div>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {Array.from({length:7},(_,i) => {
            const d = new Date(); d.setDate(d.getDate()-i);
            const dateStr = d.toISOString().slice(0,10);
            const meals = mealLog.filter(m => m.date===dateStr);
            const kcal  = meals.reduce((s,m) => s+(Number(m.kcal)||0), 0);
            const pct   = Math.min(100, effectiveKcal > 0 ? (kcal/effectiveKcal)*100 : 0);
            const dayLabel = i===0?"Hoy":i===1?"Ayer":d.toLocaleDateString("es-AR",{weekday:"short",day:"numeric"});
            return (
              <div key={dateStr} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"10px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{dayLabel}</span>
                  <span style={{ fontSize:13, fontWeight:700, color: kcal > 0 ? "var(--green)" : "var(--muted)" }}>{kcal > 0 ? `${kcal} kcal` : "—"}</span>
                </div>
                {macroBar(kcal, effectiveKcal, "var(--green)")}
              </div>
            );
          })}
        </div>
      </>)}

      {/* ── PLAN ── */}
      {/* ── HISTORIAL ── */}
      {tab === "historial" && (() => {
        const byDate = {};
        mealLog.forEach(entry => {
          const d = entry.date || "sin fecha";
          if (!byDate[d]) byDate[d] = [];
          byDate[d].push(entry);
        });
        const dates = Object.keys(byDate).sort((a,b) => b.localeCompare(a)).slice(0, 14);

        if (dates.length === 0) return (
          <div style={{ textAlign:"center", padding:40, color:"var(--muted)" }}>
            <p style={{ margin:0 }}>Sin historial todavía. Comenzá registrando tus comidas.</p>
          </div>
        );

        return (
          <div>
            {dates.map(date => {
              const entries = byDate[date];
              const totals = entries.reduce((acc, e) => ({
                kcal: acc.kcal + (Number(e.kcal)||0),
                protein: acc.protein + (Number(e.protein)||0),
                carbs: acc.carbs + (Number(e.carbs)||0),
                fat: acc.fat + (Number(e.fat)||0),
              }), { kcal:0, protein:0, carbs:0, fat:0 });

              return (
                <div key={date} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:14, fontWeight:800 }}>{formatDMY(date)}</span>
                    <span style={{ fontSize:14, fontWeight:900, color:"var(--green)" }}>{Math.round(totals.kcal)} kcal</span>
                  </div>
                  {[
                    { label:"P", val:totals.protein, color:"#60a5fa", target: effectiveTargets.protein },
                    { label:"C", val:totals.carbs, color:"#f59e0b", target: effectiveTargets.carbs },
                    { label:"G", val:totals.fat, color:"#f87171", target: effectiveTargets.fat },
                  ].map(m => (
                    <div key={m.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:11, color:"var(--muted)", width:12 }}>{m.label}</span>
                      <div style={{ flex:1, height:6, background:"rgba(255,255,255,.07)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ width:`${Math.min(100, (m.val / (m.target||1)) * 100)}%`, height:"100%", background:m.color, borderRadius:4 }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:m.color, width:40, textAlign:"right" }}>{Math.round(m.val)}g</span>
                    </div>
                  ))}
                  <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:4 }}>
                    {entries.map((e,i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0", borderTop:"1px solid rgba(255,255,255,.05)" }}>
                        <span style={{ color:"var(--text)" }}>{e.name}</span>
                        <span style={{ color:"var(--muted)" }}>{Math.round(e.kcal||0)} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {tab === "plan" && (<>
        {/* Targets card */}
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px", marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>Targets diarios — {goalLabels[userGoal]}</div>
          {!bodyWeight && (
            <div style={{ background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.3)", borderRadius:10, padding:"10px 12px", fontSize:12, marginBottom:12 }}>
              <Icon name="AlertTriangle" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Registrá tu peso en <b>Mediciones</b> para targets precisos.
              <button onClick={() => setPage("measurements")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--green)", fontWeight:700, fontSize:12, marginLeft:6 }}>Ir →</button>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
            {[
              { label:"Calorías",      val:`${effectiveKcal}`, unit:"kcal", color:"var(--green)" },
              { label:"Proteína",      val:`${effectiveTargets.protein}`, unit:`g · ${effectiveTargets.proteinPerKg}g/kg`, color:"#60a5fa" },
              { label:"Carbohidratos", val:`${effectiveTargets.carbs}`, unit:"g", color:"#f59e0b" },
              { label:"Grasas",        val:`${effectiveTargets.fat}`, unit:"g", color:"#f87171" },
            ].map(row => (
              <div key={row.label} style={{ background:"var(--panel2)", borderRadius:12, padding:"10px" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{row.label}</div>
                <div style={{ fontSize:20, fontWeight:900, color:row.color, lineHeight:1 }}>{row.val}</div>
                <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>{row.unit}</div>
              </div>
            ))}
          </div>
          {bodyWeight && (
            <div style={{ fontSize:11, color:"var(--muted)", background:"rgba(255,255,255,.03)", borderRadius:8, padding:"6px 10px" }}>
              Basado en <b style={{ color:"var(--text)" }}>{bodyWeight}kg</b> · proteína: {effectiveTargets.proteinPerKg}g/kg (rango gym: 1.6–2.2g/kg)
            </div>
          )}
          <div style={{ marginTop:10, borderTop:"1px solid var(--line)", paddingTop:10 }}>
            {!showKcalEdit ? (
              <button onClick={() => setShowKcalEdit(true)}
                style={{ background:"none", border:"1px solid var(--line)", borderRadius:8, padding:"6px 12px", fontSize:11, color:"var(--muted)", cursor:"pointer" }}>
                {customKcal ? `Meta personalizada: ${customKcal} kcal` : "Personalizar meta de calorías"}
              </button>
            ) : (
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input type="number" inputMode="numeric" value={customKcal}
                  onChange={e => setCustomKcal(e.target.value)}
                  placeholder={`${targets.kcal} kcal (calculado)`}
                  style={{ flex:1, background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:8, padding:"7px 10px", color:"var(--text)", fontSize:13 }} />
                <button onClick={() => setShowKcalEdit(false)}
                  style={{ background:"var(--green)", color:"#000", border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  OK
                </button>
                {customKcalOut && <span style={{ fontSize:11, color:"#ef4444" }}>Usá entre {kcalFloor} y 5000 kcal</span>}
                {customKcal && <button onClick={() => { setCustomKcal(""); setShowKcalEdit(false); }}
                  style={{ background:"none", border:"none", color:"var(--muted)", fontSize:18, cursor:"pointer" }}>×</button>}
              </div>
            )}
          </div>
        </div>

        {/* ── PLAN DE COMIDAS ── */}
        <div style={{ marginTop:14 }}>
          {!nutritionPlan && !showWizard && (
            <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"20px 16px", textAlign:"center" }}>
              <Icon name="Utensils" size={32} style={{ color:"var(--green)", marginBottom:10 }} />
              <div style={{ fontSize:14, fontWeight:800, marginBottom:6 }}>Plan de comidas</div>
              <div style={{ fontSize:12, color:"var(--muted)", marginBottom:16, maxWidth:260, margin:"0 auto 16px" }}>
                Generá un plan semanal con comidas específicas adaptadas a tus macros y preferencias.
              </div>
              <button onClick={() => { setShowWizard(true); setWizStep(0); }}
                style={{ background:"var(--green)", color:"#000", fontWeight:700, fontSize:14, border:"none", borderRadius:12, padding:"12px 24px", cursor:"pointer" }}>
                Crear mi plan de comidas
              </button>
            </div>
          )}

          {/* Wizard */}
          {showWizard && (() => {
            const WIZARD_STEPS = [
              { title:"¿Cuántos días?", key:"days" },
              { title:"¿Cuántas comidas por día?", key:"meals" },
              { title:"Restricciones alimentarias", key:"restrictions" },
              { title:"Presupuesto y preferencias", key:"budget" },
            ];
            const totalSteps = WIZARD_STEPS.length;

            function finishWizard() {
              const config = {
                days: wizDays,
                mealsPerDay: wizMeals,
                goal: userGoal,
                restrictions: wizRestrictions,
                likedCats: [],
                allergies: wizAllergies,
                cuisine: "",
                prepTime: "30min",
                budget: wizBudget,
                seed: wizSeedRef.current,
              };
              const plan = generateNutritionPlan(
                config,
                effectiveKcal, effectiveKcal, effectiveTargets.protein, effectiveTargets.carbs, effectiveTargets.fat
              );
              plan.planStartDate = todayLocal();
              saveNutritionPlan(plan);
              setShowWizard(false);
              setWizStep(0);
              setExpandedPlanDay(0);
              window.__showToast?.("Plan de comidas generado.", "success");
            }

            const btnStyle = (active) => ({
              flex:1, padding:"10px 8px", border: active ? "2px solid var(--green)" : "1px solid var(--line)",
              borderRadius:10, background: active ? "rgba(52,211,153,.1)" : "var(--panel2)",
              color: active ? "var(--green)" : "var(--text)", fontWeight: active ? 700 : 500,
              fontSize:13, cursor:"pointer",
            });

            const toggleRestriction = (r) => setWizRestrictions(prev => prev.includes(r) ? prev.filter(x=>x!==r) : [...prev,r]);
            const toggleAllergy = (a) => setWizAllergies(prev => prev.includes(a) ? prev.filter(x=>x!==a) : [...prev,a]);

            return (
              <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"20px 16px" }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ fontSize:14, fontWeight:800 }}>{WIZARD_STEPS[wizStep].title}</div>
                  <button onClick={() => setShowWizard(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:20 }}>×</button>
                </div>
                {/* Progress dots */}
                <div style={{ display:"flex", gap:6, marginBottom:20 }}>
                  {WIZARD_STEPS.map((_,i) => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= wizStep ? "var(--green)" : "var(--line)" }} />
                  ))}
                </div>

                {/* Step 0: días */}
                {wizStep === 0 && (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {[3,5,7,14].map(d => (
                      <button key={d} onClick={() => setWizDays(d)} style={btnStyle(wizDays===d)}>
                        {d} días
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 1: comidas */}
                {wizStep === 1 && (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {[3,4,5,6].map(m => (
                      <button key={m} onClick={() => setWizMeals(m)} style={btnStyle(wizMeals===m)}>
                        {m} comidas
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: restricciones */}
                {wizStep === 2 && (
                  <div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginBottom:12 }}>Seleccioná todas las que aplican</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                      {[
                        { id:"vegetariano", label:"Vegetariano" },
                        { id:"vegano", label:"Vegano" },
                        { id:"sin_lacteos", label:"Sin lácteos" },
                        { id:"sin_gluten", label:"Sin gluten" },
                      ].map(r => (
                        <button key={r.id} onClick={() => toggleRestriction(r.id)} style={btnStyle(wizRestrictions.includes(r.id))}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginBottom:8 }}>Alergias</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {[
                        { id:"frutos_secos", label:"Frutos secos" },
                        { id:"huevo", label:"Huevo" },
                        { id:"pescado", label:"Pescado" },
                        { id:"mani", label:"Maní" },
                      ].map(a => (
                        <button key={a.id} onClick={() => toggleAllergy(a.id)} style={btnStyle(wizAllergies.includes(a.id))}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: presupuesto */}
                {wizStep === 3 && (
                  <div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginBottom:12 }}>¿Cómo es tu presupuesto semanal para comida?</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {[
                        { id:"economico", label:"Económico", hint:"Legumbres y básicos" },
                        { id:"moderado",  label:"Moderado",  hint:"Variedad normal" },
                        { id:"amplio",    label:"Sin límite", hint:"Cualquier alimento" },
                      ].map(b => (
                        <button key={b.id} onClick={() => setWizBudget(b.id)}
                          style={{ ...btnStyle(wizBudget===b.id), flexDirection:"column", display:"flex", alignItems:"flex-start", gap:2 }}>
                          <span>{b.label}</span>
                          <span style={{ fontSize:10, color:"var(--muted)", fontWeight:400 }}>{b.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nav buttons */}
                <div style={{ display:"flex", gap:8, marginTop:20 }}>
                  {wizStep > 0 && (
                    <button onClick={() => setWizStep(s => s-1)}
                      style={{ flex:1, padding:"11px", border:"1px solid var(--line)", borderRadius:10, background:"var(--panel2)", color:"var(--text)", fontSize:13, cursor:"pointer" }}>
                      Atrás
                    </button>
                  )}
                  {wizStep < totalSteps - 1 ? (
                    <button onClick={() => setWizStep(s => s+1)}
                      style={{ flex:2, padding:"11px", border:"none", borderRadius:10, background:"var(--green)", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                      Siguiente
                    </button>
                  ) : (
                    <button onClick={finishWizard}
                      style={{ flex:2, padding:"11px", border:"none", borderRadius:10, background:"var(--green)", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                      Generar plan
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Plan generado */}
          {nutritionPlan && !showWizard && (
            <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                <div style={{ fontSize:14, fontWeight:800 }}>Mi plan de comidas</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { wizSeedRef.current = Math.floor(Math.random()*9999); setShowWizard(true); setWizStep(0); }}
                    style={{ background:"none", border:"1px solid var(--line)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"var(--muted)", cursor:"pointer" }}>
                    Nuevo plan
                  </button>
                  <button onClick={clearNutritionPlan}
                    style={{ background:"none", border:"none", padding:"4px 6px", fontSize:18, color:"var(--muted)", cursor:"pointer" }}>×</button>
                </div>
              </div>
              <div style={{ fontSize:11, color:"var(--muted)", marginBottom:14 }}>
                {nutritionPlan.config?.days} días · {nutritionPlan.config?.mealsPerDay} comidas/día · ~{Math.round(nutritionPlan.dailyKcal)} kcal
              </div>

              {/* Day selector */}
              <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:12 }}>
                {nutritionPlan.days?.map((day, i) => (
                  <button key={i} onClick={() => setExpandedPlanDay(i)}
                    style={{ flexShrink:0, padding:"6px 12px", borderRadius:10,
                      background: expandedPlanDay===i ? "var(--green)" : "var(--panel2)",
                      border: "1px solid " + (expandedPlanDay===i ? "var(--green)" : "var(--line)"),
                      color: expandedPlanDay===i ? "#000" : "var(--text)",
                      fontSize:12, fontWeight: expandedPlanDay===i ? 700 : 500, cursor:"pointer" }}>
                    {day.dayName?.slice(0,3) || `Día ${i+1}`}
                  </button>
                ))}
              </div>

              {/* Day detail */}
              {nutritionPlan.days?.[expandedPlanDay] && (() => {
                const day = nutritionPlan.days[expandedPlanDay];
                return (
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, padding:"8px 10px", background:"rgba(52,211,153,.07)", borderRadius:10 }}>
                      <span style={{ fontSize:13, fontWeight:700 }}>{day.dayName}</span>
                      <span style={{ fontSize:13, fontWeight:800, color:"var(--green)" }}>{Math.round(day.kcal)} kcal</span>
                    </div>
                    {day.meals?.map((meal, mi) => (
                      <div key={mi} style={{ marginBottom:10, padding:"10px 12px", background:"var(--panel2)", borderRadius:12, border:"1px solid var(--line)" }}>
                        <div style={{ fontSize:12, fontWeight:800, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{meal.label}</div>
                        {meal.items?.map((item, ii) => (
                          <div key={ii} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0", borderBottom: ii < meal.items.length-1 ? "1px solid var(--line)" : "none" }}>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight:600 }}>{item.name}</div>
                              <div style={{ fontSize:10, color:"var(--muted)" }}>
                                {item.grams ? `${item.grams}g` : item.ml ? `${item.ml}ml` : item.qty ? `×${item.qty}` : ""}
                              </div>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:13, fontWeight:700, color:"var(--green)" }}>{r2(item.kcal)} kcal</div>
                              <div style={{ fontSize:10, color:"var(--muted)" }}>{r2(item.protein)}g P · {r2(item.carbs)}g C · {r2(item.fat)}g G</div>
                            </div>
                          </div>
                        ))}
                        <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:6, fontSize:11, color:"var(--muted)" }}>
                          <span style={{ color:"var(--green)", fontWeight:700 }}>{Math.round(meal.kcal)} kcal</span>
                          <span>{Math.round(meal.protein)}g P</span>
                          <span>{Math.round(meal.carbs)}g C</span>
                          <span>{Math.round(meal.fat)}g G</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      

        {/* Distribución por comida */}
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px", marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Distribución diaria sugerida</div>
          {[
            { name:"Desayuno", pct:0.25, icon:"", hint:"Carbos + proteína para arrancar" },
            { name:"Almuerzo", pct:0.35, icon:"", hint:"La comida más completa del día" },
            { name:"Merienda", pct:0.15, icon:"", hint:"Snack pre/post entreno" },
            { name:"Cena",     pct:0.25, icon:"", hint:"Proteína + vegetales, menos carbos" },
          ].map(({ name, pct, icon, hint }) => {
            const kcal  = Math.round(effectiveKcal * pct);
            const prot  = Math.round(effectiveTargets.protein * pct);
            return (
              <div key={name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid var(--line)" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{name}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>{hint}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:14, fontWeight:800, color:"var(--green)" }}>{kcal} kcal</div>
                  <div style={{ fontSize:10, color:"#60a5fa" }}>{prot}g prot.</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan semanal — 7 días con progresión */}
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px" }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>Plan semanal</div>
          <div style={{ fontSize:11, color:"var(--muted)", marginBottom:12 }}>Variación de calorías según días de entreno</div>
          {(() => {
            const days = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
            // Patrón: días de entreno más carbos, descanso menos
            const patterns = {
              volumen:       [1.05, 1.0,  1.05, 1.0,  1.05, 1.0, 0.90],
              definicion:    [1.0,  0.90, 1.0,  0.90, 1.0, 0.85, 0.85],
              mantenimiento: [1.0,  1.0,  1.0,  1.0,  1.0,  0.95, 0.95],
              rendimiento:   [1.10, 1.0,  1.10, 1.0,  1.10, 1.0,  0.90],
            };
            const mults = patterns[userGoal] ?? patterns.mantenimiento;
            const trainDays = { volumen:[0,2,4], definicion:[0,2,4], mantenimiento:[0,2,4], rendimiento:[0,2,4,6] };
            const isTrain = trainDays[userGoal] ?? [0,2,4];
            return days.map((day, i) => {
              const kcal  = Math.round(effectiveKcal * mults[i]);
              const prot  = Math.round(effectiveTargets.protein * (isTrain.includes(i) ? 1.0 : 0.95));
              const carbs = Math.round(effectiveTargets.carbs * mults[i]);
              const isTrainDay = isTrain.includes(i);
              return (
                <div key={day} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom: i < 6 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ width:28, fontSize:12, fontWeight:700, color: isTrainDay ? "var(--green)" : "var(--muted)" }}>{day}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:5, background:"rgba(255,255,255,.07)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ width:`${Math.round(mults[i]*100)}%`, height:"100%", background: isTrainDay ? "var(--green)" : "rgba(255,255,255,.2)", borderRadius:3 }} />
                    </div>
                  </div>
                  <div style={{ textAlign:"right", minWidth:90 }}>
                    <span style={{ fontSize:13, fontWeight:800, color: isTrainDay ? "var(--green)" : "var(--text)" }}>{kcal} kcal</span>
                    <span style={{ fontSize:10, color:"var(--muted)", marginLeft:6 }}>{prot}g P</span>
                  </div>
                  {isTrainDay && <span style={{ fontSize:10, fontWeight:700, color:"var(--green)", background:"rgba(52,211,153,.1)", borderRadius:6, padding:"2px 6px", flexShrink:0 }}>Entreno</span>}
                  {!isTrainDay && <span style={{ fontSize:10, color:"var(--muted)", width:52, textAlign:"center", flexShrink:0 }}>Descanso</span>}
                </div>
              );
            });
          })()}
          <div style={{ fontSize:11, color:"var(--muted)", marginTop:10, padding:"8px 10px", background:"rgba(255,255,255,.03)", borderRadius:8 }}>
            En días de entreno: más carbohidratos para energía. En descanso: menos calorías totales, proteína similar.
          </div>
        </div>
      </>)}

      {/* ── MODAL AGREGAR ── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:300 }} onClick={e => { if(e.target===e.currentTarget) resetForm(); }}>
          <div style={{ position:"absolute", top:"8vh", left:0, right:0, bottom:0, background:"var(--bg)", borderRadius:"20px 20px 0 0", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"20px 20px 0", flexShrink:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:17 }}>{foodMode === "buscar" ? "¿Qué comiste?" : "Crear alimento nuevo"}</h3>
              <button onClick={resetForm} aria-label="Cerrar" style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"var(--muted)" }}>×</button>
            </div>

            {/* Dos modos claramente separados */}
            <div role="tablist" style={{ display:"flex", gap:4, padding:4, background:"var(--panel2)", borderRadius:12, marginBottom:14 }}>
              {[["buscar","Buscar alimento"],["crear","Crear alimento nuevo"]].map(([id,label]) => (
                <button key={id} role="tab" aria-selected={foodMode===id} type="button"
                  onClick={() => { setFoodMode(id); setDbQuery(""); setDbResults([]); if (id==="crear") setBaseFood(null); }}
                  style={{ flex:1, padding:"9px 6px", border:"none", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700,
                    background: foodMode===id ? "var(--green)" : "transparent", color: foodMode===id ? "#fff" : "var(--muted)" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── BUSCADOR DE BASE DE DATOS ── */}
            {foodMode === "buscar" && <div style={{ position:"relative", marginBottom:14 }}>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  className="input"
                  placeholder="Buscá un alimento (pollo, manzana, arroz…)"
                  value={dbQuery}
                  onChange={e => handleDbSearch(e.target.value)}
                  style={{ flex:1, boxSizing:"border-box" }}
                  autoComplete="off"
                />
                <button type="button" onClick={() => setShowScanner(true)}
                  style={{ padding:"9px 12px", background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:10, cursor:"pointer", color:"var(--text)", flexShrink:0 }}>
                  <Icon name="Camera" size={18} />
                </button>
              </div>
              {dbResults.length > 0 && (
                <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, zIndex:200, maxHeight:260, overflowY:"auto", boxShadow:"0 8px 24px rgba(0,0,0,.4)" }}>
                  {dbResults.map(food => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => selectDbFood(food)}
                      style={{ width:"100%", padding:"10px 14px", background:"none", border:"none", borderBottom:"1px solid var(--line)", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}
                    >
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{food.name}</div>
                        <div style={{ fontSize:11, color:"var(--muted)" }}>{food.serving} · {food.cat}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:"var(--green)" }}>{r2(food.kcal)} kcal</div>
                        <div style={{ fontSize:10, color:"var(--muted)" }}>{r2(food.protein)}P · {r2(food.carbs)}C · {r2(food.fat)}G</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>}

            {/* "No results" hint — pre-fills form.name so the user can enter macros manually */}
            {foodMode === "buscar" && dbQuery.trim().length >= 2 && dbResults.length === 0 && (
              <div style={{ marginTop:8, padding:"12px", background:"rgba(52,211,153,.06)", border:"1px dashed var(--green)", borderRadius:12, display:"flex", flexDirection:"column", gap:8 }}>
                <span style={{ fontSize:13, color:"var(--text)" }}>No encontramos <b>"{dbQuery.trim()}"</b> en la lista.</span>
                <button type="button" className="primary"
                  onClick={() => { setFoodMode("crear"); setBaseFood(null); setMacrosEdited(false); setForm(f => ({...f, name: dbQuery.trim(), grams:"100", kcal:"", protein:"", carbs:"", fat:""})); setDbQuery(""); setDbResults([]); }}
                  style={{ width:"100%" }}>
                  + Crear "{dbQuery.trim()}" como alimento nuevo
                </button>
                <span style={{ fontSize:11, color:"var(--muted)" }}>Lo cargás una vez con sus valores y queda disponible para todos.</span>
              </div>
            )}

            </div>{/* end non-scrollable header */}

            {/* Scrollable body */}
            <div style={{ flex:1, overflowY:"auto", padding:"0 20px 20px" }}>

            {/* Quick foods toggle */}
            {foodMode === "buscar" && <button onClick={() => setShowQuick(p => !p)} style={{ width:"100%", background:"rgba(34,211,120,.08)", border:"1px solid rgba(34,211,120,.2)", borderRadius:12, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer", color:"var(--green)", marginBottom:14 }}>
              {showQuick ? <><Icon name="ChevronUp" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Ocultar alimentos rápidos</> : <><Icon name="Zap" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Alimentos frecuentes</>}
            </button>}

            {foodMode === "buscar" && showQuick && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                {QUICK_FOODS.map(food => (
                  <button key={food.name} onClick={() => { addQuickFood(food); window.__showToast?.(food.name+" agregado","success"); }}
                    style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, padding:"8px 10px", fontSize:12, fontWeight:600, cursor:"pointer", textAlign:"left", color:"var(--text)" }}>
                    <div style={{ fontWeight:700, marginBottom:2, fontSize:11, lineHeight:1.3 }}>{food.name}</div>
                    <div style={{ color:"var(--green)", fontWeight:800 }}>{r2(food.kcal)} kcal</div>
                    <div style={{ color:"var(--muted)", fontSize:10 }}>{r2(food.protein)}g P · {r2(food.carbs)}g C · {r2(food.fat)}g G</div>
                  </button>
                ))}
              </div>
            )}

            {foodMode === "buscar" && !baseFood && !form.name && (
              <div style={{ textAlign:"center", padding:"28px 12px", color:"var(--muted)", fontSize:13 }}>
                Escribí arriba lo que comiste y elegí una opción de la lista.<br />
                ¿No está? Te vamos a ofrecer crearlo.
              </div>
            )}
            {(foodMode === "crear" || baseFood || form.name) && (
            <form onSubmit={handleAdd} style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* Tipo de comida según horario */}
              <div>
                <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6, fontWeight:600 }}>¿En qué momento del día?</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {MEAL_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({...f, type:t}))}
                      style={{ padding:"5px 12px", borderRadius:20, border:"1.5px solid", fontSize:12, fontWeight:600, cursor:"pointer",
                        borderColor: form.type === t ? "var(--green)" : "var(--line)",
                        background: form.type === t ? "rgba(52,211,153,.12)" : "transparent",
                        color: form.type === t ? "var(--green)" : "var(--muted)" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {foodMode === "crear" ? (<>
                <div style={{ fontSize:12, color:"var(--muted)", background:"rgba(255,255,255,.04)", border:"1px solid var(--line)", borderRadius:10, padding:"8px 10px" }}>
                  Cargá el alimento una sola vez con los valores del envase. Después aparece en el buscador, para vos y para todos los usuarios.
                </div>
                <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, marginBottom:-4 }}>Nombre del alimento</label>
                <input className="input" placeholder="Ej: Milanesa de pollo" value={form.name} onChange={e => { setForm(f => ({...f,name:e.target.value})); setBaseFood(null); setMacrosEdited(false); }} required />
              </>) : (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                  <div style={{ fontSize:15, fontWeight:800 }}>{form.name}</div>
                  {String(baseFood?.id || "").startsWith("shared-") && <ReportFoodButton foodId={baseFood.id} />}
                </div>
              )}
              {/* Gramaje */}
              <div>
                <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:4 }}>{foodMode === "crear" ? "¿Para cuántos gramos son estos valores?" : "¿Cuántos gramos comiste?"}</label>
                <input inputMode="decimal" value={form.grams}
                  onChange={e => handleGramsChange(e.target.value.replace(",","."))}
                  placeholder="Ej: 150"
                  style={{ width:"100%", background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:10, padding:"9px 12px", color:"var(--text)", fontSize:14, boxSizing:"border-box" }} />
                {/* Macro preview — shown when a DB food is selected and grams is filled */}
                {baseFood && form.grams && Number(form.grams) > 0 && !macrosEdited && (
                  <div style={{ marginTop:6, fontSize:12, color:"var(--green)", fontWeight:600, padding:"6px 10px", background:"rgba(52,211,153,.07)", borderRadius:8, border:"1px solid rgba(52,211,153,.15)" }}>
                    Por {form.grams}g: {r2(form.kcal)} kcal · {r2(form.protein)}g P · {r2(form.carbs)}g C · {r2(form.fat)}g G
                  </div>
                )}
              </div>
              {foodMode === "crear" && <>
              <div style={{ fontSize:12, color:"var(--muted)", fontWeight:600, marginBottom:-2 }}>
                Valores nutricionales de esa cantidad <span style={{ fontWeight:400 }}>(figuran en el envase)</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  ["kcal","Calorías (kcal)","Ej: 250"],
                  ["protein","Proteínas (g)","Ej: 20"],
                  ["carbs","Carbohidratos (g)","Ej: 30"],
                  ["fat","Grasas (g)","Ej: 8"],
                ].map(([key,label,ph]) => (
                  <label key={key} style={{ display:"flex", flexDirection:"column", gap:4, fontSize:11, color:"var(--muted)" }}>
                    {label}
                    <input className="input" inputMode="decimal" placeholder={ph} value={form[key]}
                      onChange={e => { setForm(f => ({...f,[key]:e.target.value.replace(",",".")})); setMacrosEdited(true); }}
                      required={key==="kcal"} />
                  </label>
                ))}
              </div>
              </>}
              {/* Botón sticky al fondo del scroll — funciona en todos los navegadores incluyendo iOS Safari */}
              <div style={{ position:"sticky", bottom:0, background:"var(--bg)", paddingTop:10, paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))", marginTop:4, borderTop:"1px solid var(--line)" }}>
                <button type="submit" className="primary" style={{ width:"100%" }} disabled={saving || !form.name.trim() || !form.kcal}>
                  {saving ? "Guardando…" : foodMode === "crear" ? "Crear alimento y agregarlo a mi día" : "Agregar a mi día"}
                </button>
              </div>
            </form>
            )}
            </div>{/* end scrollable body */}
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner
          onDetect={food => {
            setForm(f => ({ ...f, name: food.name, kcal: String(food.kcal), protein: String(food.protein), carbs: String(food.carbs), fat: String(food.fat) }));
            setBaseFood({ kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat });
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* ── MODAL CREAR COMBINACIÓN ── */}
      {showComboModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:400 }}
          onClick={e => { if (e.target === e.currentTarget) setShowComboModal(false); }}>
          <div style={{ position:"absolute", top:"8vh", left:0, right:0, bottom:0, background:"var(--bg)", borderRadius:"20px 20px 0 0", display:"flex", flexDirection:"column" }}>

            {/* Header fijo */}
            <div style={{ padding:"20px 20px 0", flexShrink:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <h3 style={{ margin:0, fontSize:17 }}>Armar combinación</h3>
                <button onClick={() => setShowComboModal(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"var(--muted)" }}>×</button>
              </div>

              {/* Nombre de la combinación */}
              <input
                className="input"
                placeholder="Nombre del plato (ej: Patitas de pollo con arroz)"
                value={comboName}
                onChange={e => setComboName(e.target.value)}
                style={{ width:"100%", boxSizing:"border-box", marginBottom:12 }}
              />

              {/* Buscador de alimentos */}
              <div style={{ position:"relative", marginBottom:4 }}>
                <input
                  className="input"
                  placeholder="Buscá cada ingrediente y agregalo…"
                  value={comboDbQuery}
                  onChange={e => {
                    const q = e.target.value;
                    setComboDbQuery(q);
                    if (q.trim().length >= 2) {
                      const matches = searchFoods(q, 12);
                      const lq = q.toLowerCase();
                      const customMatches = (storeCustomFoods || []).filter(cf => cf.name.toLowerCase().includes(lq));
                      const local = [...customMatches, ...matches];
                      setComboDbResults(local.slice(0, 15));
                      const seq = ++searchSeqRef.current;
                      searchSharedFoods(q, 8).then(shared => {
                        if (seq !== searchSeqRef.current || shared.length === 0) return;
                        const seen = new Set(local.map(f => f.name.toLowerCase()));
                        setComboDbResults([...local, ...shared.filter(f => !seen.has(f.name.toLowerCase()))].slice(0, 20));
                      });
                    } else {
                      setComboDbResults([]);
                    }
                  }}
                  style={{ width:"100%", boxSizing:"border-box" }}
                  autoComplete="off"
                />
                {comboDbResults.length > 0 && (
                  <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, zIndex:500, maxHeight:220, overflowY:"auto", boxShadow:"0 8px 24px rgba(0,0,0,.5)" }}>
                    {comboDbResults.map(food => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => {
                          const g0 = food.grams || 100;
                          const per100 = (v) => (Number(v) || 0) / g0 * 100;
                          setComboFoods(prev => [...prev, {
                            id: `cf-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                            foodId: food.id,
                            name: food.name,
                            grams: g0,
                            base: { kcal: per100(food.kcal), protein: per100(food.protein), carbs: per100(food.carbs), fat: per100(food.fat) },
                            kcal: r2(food.kcal),
                            protein: r2(food.protein),
                            carbs: r2(food.carbs),
                            fat: r2(food.fat),
                          }]);
                          setComboDbQuery("");
                          setComboDbResults([]);
                        }}
                        style={{ width:"100%", padding:"10px 14px", background:"none", border:"none", borderBottom:"1px solid var(--line)", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{food.name}</div>
                          <div style={{ fontSize:11, color:"var(--muted)" }}>{food.serving} · {food.cat}</div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontSize:13, fontWeight:800, color:"var(--green)" }}>{r2(food.kcal)} kcal</div>
                          <div style={{ fontSize:10, color:"var(--muted)" }}>{r2(food.protein)}P · {r2(food.carbs)}C · {r2(food.fat)}G</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cuerpo scrollable */}
            <div style={{ flex:1, overflowY:"auto", padding:"12px 20px 0" }}>

              {/* Totales en tiempo real */}
              {comboFoods.length > 0 && (() => {
                const tot = comboFoods.reduce((s, cf) => ({
                  kcal:    s.kcal    + (Number(cf.kcal)    || 0),
                  protein: s.protein + (Number(cf.protein) || 0),
                  carbs:   s.carbs   + (Number(cf.carbs)   || 0),
                  fat:     s.fat     + (Number(cf.fat)     || 0),
                }), { kcal:0, protein:0, carbs:0, fat:0 });
                return (
                  <div style={{ background:"rgba(52,211,153,.08)", border:"1px solid rgba(52,211,153,.2)", borderRadius:12, padding:"10px 14px", marginBottom:12, display:"flex", gap:14, flexWrap:"wrap", alignItems:"center" }}>
                    <span style={{ fontSize:14, fontWeight:900, color:"var(--green)" }}>{Math.round(tot.kcal)} kcal</span>
                    <span style={{ fontSize:13, color:"#60a5fa", fontWeight:600 }}>{Math.round(tot.protein)}g P</span>
                    <span style={{ fontSize:13, color:"#f59e0b", fontWeight:600 }}>{Math.round(tot.carbs)}g C</span>
                    <span style={{ fontSize:13, color:"#f87171", fontWeight:600 }}>{Math.round(tot.fat)}g G</span>
                  </div>
                );
              })()}

              {/* Lista de alimentos agregados */}
              {comboFoods.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px 16px", color:"var(--muted)", fontSize:13 }}>
                  Buscá cada ingrediente arriba (por ejemplo "patitas de pollo" y "arroz") y agregalo. Después ajustá los gramos de cada uno.<br />
                  Si no encontrás uno, creálo desde «+ Agregar» → «Crear alimento nuevo» y volvé acá.
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
                  {comboFoods.map((cf, idx) => (
                    <div key={cf.id} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"10px 12px", display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700 }}>{cf.name}</div>
                        <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>
                          {r2(cf.kcal)} kcal · {r2(cf.protein)}g P · {r2(cf.carbs)}g C · {r2(cf.fat)}g G
                        </div>
                      </div>
                      <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--muted)" }}>
                        <input inputMode="decimal" aria-label={`Gramos de ${cf.name}`} value={cf.grams}
                          onChange={e => {
                            const g = e.target.value.replace(",", ".");
                            const f = (Number(g) || 0) / 100;
                            setComboFoods(prev => prev.map((x, i) => i !== idx ? x : {
                              ...x, grams: g,
                              kcal: r2((x.base?.kcal ?? 0) * f), protein: r2((x.base?.protein ?? 0) * f),
                              carbs: r2((x.base?.carbs ?? 0) * f), fat: r2((x.base?.fat ?? 0) * f),
                            }));
                          }}
                          style={{ width:58, textAlign:"center", background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:8, padding:"6px 4px", color:"var(--text)", fontSize:14 }} />
                        g
                      </label>
                      <button onClick={() => setComboFoods(prev => prev.filter((_, i) => i !== idx))}
                        style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"var(--muted)", padding:4, lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón guardar sticky */}
              <div style={{ position:"sticky", bottom:0, background:"var(--bg)", paddingTop:10, paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))", borderTop:"1px solid var(--line)" }}>
                <button
                  className="primary"
                  style={{ width:"100%" }}
                  disabled={!comboName.trim() || comboFoods.length === 0}
                  onClick={() => {
                    if (!comboName.trim() || comboFoods.length === 0) {
                      window.__showToast?.("Ingresá un nombre y al menos un alimento", "error");
                      return;
                    }
                    const meals = comboFoods.map(cf => ({
                      type: "Combinación",
                      name: `${cf.name} (${cf.grams}g)`,
                      kcal: r2(cf.kcal),
                      protein: r2(cf.protein),
                      carbs: r2(cf.carbs),
                      fat: r2(cf.fat),
                    }));
                    saveMealCombo(comboName.trim(), meals);
                    const savedName = comboName.trim();
                    setShowComboModal(false);
                    setComboName("");
                    setComboFoods([]);
                    setTab("hoy");
                    window.__showToast?.(`"${savedName}" guardada en Mis combinaciones`, "success");
                  }}>
                  Guardar combinación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
