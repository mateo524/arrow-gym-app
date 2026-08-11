import { useState, useMemo, useCallback, useRef } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import Icon from "../components/Icon";
import { todayLocal } from "../lib/dates.js";
import { features, vocab } from "../config/features.js";
import { searchFoods } from "../data/foodDatabase.js";
import { generateNutritionPlan } from "../data/nutritionData.js";

const MEAL_TYPES = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Snack"];

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

export default function NutritionPage() {
  const profile  = useAuthStore(s => s.profile);
  const setPage  = useStore(s => s.setPage);

  // Subscription gate
  const isSubscribed = profile?.subscription_status === "active" || ["trainer","admin","superadmin"].includes(profile?.role);
  if (profile && !isSubscribed) {
    return (
      <section className="page" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"48px 24px" }}>
        <span style={{ fontSize:56, marginBottom:16 }}>🥗</span>
        <h2 style={{ margin:"0 0 8px", fontSize:22 }}>Nutrición</h2>
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
        <p style={{ color:"var(--muted)", fontSize:11, marginTop:12 }}>Renovación automática · cancelá cuando quieras</p>
      </section>
    );
  }

  const f   = features(profile);
  const voc = vocab(profile);

  const mealLog        = useStore(s => s.mealLog) || [];
  const savedCombos    = useStore(s => s.savedMealCombos) || [];
  const logMeal        = useStore(s => s.logMeal);
  const deleteMeal     = useStore(s => s.deleteMeal);
  const saveMealCombo  = useStore(s => s.saveMealCombo);
  const logMealCombo   = useStore(s => s.logMealCombo);
  const weightLog      = useStore(s => s.weightLog) || [];
  const userGoal       = useStore(s => s.userGoal) || "mantenimiento";

  const [tab, setTab]         = useState("hoy");    // "hoy" | "semana" | "plan" (plan hidden in simple)

  const [showForm, setShowForm] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [form, setForm]       = useState({ type:"Almuerzo", name:"", kcal:"", protein:"", carbs:"", fat:"" });
  const [saving, setSaving]   = useState(false);
  const [dbQuery, setDbQuery] = useState("");
  const [dbResults, setDbResults] = useState([]);

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

  const handleDbSearch = useCallback((q) => {
    setDbQuery(q);
    setDbResults(q.trim().length >= 2 ? searchFoods(q, 12) : []);
  }, []);

  const selectDbFood = useCallback((food) => {
    setForm(f => ({
      ...f,
      name: food.name,
      kcal: String(food.kcal),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    }));
    setDbQuery("");
    setDbResults([]);
  }, []);

  const today = todayLocal();
  const bodyWeight = Number([...weightLog].sort((a,b) => String(b.date).localeCompare(String(a.date)))[0]?.kg) || null;

  // TDEE estimate — Harris-Benedict simplificado sin altura/sexo
  // Multipliers: mantenimiento=sedentario-leve, volumen=moderado, definicion=moderado, rendimiento=activo
  const tdee = useMemo(() => {
    if (!bodyWeight) return null;
    // RMR aproximado: 22 kcal/kg (promedio hombre+mujer sin datos de composición)
    const rmr = bodyWeight * 22;
    const multipliers = { mantenimiento:1.55, volumen:1.65, definicion:1.50, rendimiento:1.70 };
    return Math.round(rmr * (multipliers[userGoal] ?? 1.55));
  }, [bodyWeight, userGoal]);

  // Macro targets — consenso deportivo para gym-goers
  // Proteína: 1.6g/kg mant, 2.0g/kg volumen, 2.2g/kg definición, 1.8g/kg rendimiento
  // (el mínimo OMS de 0.8g/kg es para sedentarios; para gym el estándar es 1.6-2.2g/kg)
  const targets = useMemo(() => {
    const bw = bodyWeight || 70; // fallback 70kg si no hay peso registrado
    const goalMap = {
      volumen:       { proteinFactor:2.0, carbFactor:4.0, fatFactor:1.0 },
      definicion:    { proteinFactor:2.2, carbFactor:2.5, fatFactor:0.8 },
      mantenimiento: { proteinFactor:1.6, carbFactor:3.5, fatFactor:1.0 },
      rendimiento:   { proteinFactor:1.8, carbFactor:5.0, fatFactor:1.0 },
    };
    const g = goalMap[userGoal] ?? goalMap.mantenimiento;
    const protein = Math.round(bw * g.proteinFactor);
    const fat     = Math.round(bw * g.fatFactor);
    // Carbs se calculan para cerrar las calorías desde el TDEE
    const kcalBase = tdee || Math.round(bw * 22 * 1.55);
    const carbsKcal = kcalBase - (protein * 4) - (fat * 9);
    const carbs = Math.max(Math.round(carbsKcal / 4), Math.round(bw * g.carbFactor));
    const kcal  = protein*4 + carbs*4 + fat*9;
    return { kcal, protein, carbs, fat, proteinPerKg: g.proteinFactor };
  }, [bodyWeight, userGoal, tdee]);

  const todayMeals = useMemo(() => mealLog.filter(m => m.date === today), [mealLog, today]);
  const todayTotals = useMemo(() => todayMeals.reduce((s,m) => ({
    kcal:    s.kcal    + (Number(m.kcal)    || 0),
    protein: s.protein + (Number(m.protein) || 0),
    carbs:   s.carbs   + (Number(m.carbs)   || 0),
    fat:     s.fat     + (Number(m.fat)     || 0),
  }), { kcal:0, protein:0, carbs:0, fat:0 }), [todayMeals]);

  // Last 7 days avg
  const weekAvg = useMemo(() => {
    const days = Array.from({length:7},(_,i) => {
      const d = new Date(); d.setDate(d.getDate()-i);
      return d.toISOString().slice(0,10);
    });
    const dayTotals = days.map(d => mealLog.filter(m => m.date===d).reduce((s,m) => s+(Number(m.kcal)||0), 0));
    const filled = dayTotals.filter(v => v > 0);
    return filled.length ? Math.round(filled.reduce((a,b) => a+b, 0) / filled.length) : 0;
  }, [mealLog]);

  function resetForm() {
    setForm({ type:"Almuerzo", name:"", kcal:"", protein:"", carbs:"", fat:"" });
    setShowForm(false);
    setShowQuick(false);
    setDbQuery("");
    setDbResults([]);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || !form.kcal) return;
    setSaving(true);
    logMeal({ type: form.type, name: form.name.trim(), kcal: Number(form.kcal), protein: Number(form.protein)||0, carbs: Number(form.carbs)||0, fat: Number(form.fat)||0 });
    resetForm();
    setSaving(false);
  }

  function addQuickFood(food) {
    logMeal({ type: form.type, name: food.name, kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat });
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

  return (
    <section className="page">
      <div className="home-header">
        <div style={{ flex:1 }}>
          <p className="eyebrow">Seguimiento</p>
          <h1 style={{ margin:0 }}>Nutrición</h1>
        </div>
        <button className="primary" style={{ padding:"8px 14px", fontSize:13, borderRadius:12 }} onClick={() => { setShowForm(true); setShowQuick(false); }}>
          + Agregar
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {[["hoy","Hoy"],["semana","Semana"],...(f.coach_insights ? [["plan","Plan"]] : [])].map(([id,label]) => (
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
                <span style={{ fontSize:14, fontWeight:400, color:"var(--muted)", marginLeft:4 }}>/ {targets.kcal} kcal</span>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"var(--muted)" }}>Restante</div>
              <div style={{ fontSize:20, fontWeight:800, color: targets.kcal - todayTotals.kcal >= 0 ? "var(--text)" : "#ef4444" }}>
                {targets.kcal - todayTotals.kcal} kcal
              </div>
            </div>
          </div>
          {macroBar(todayTotals.kcal, targets.kcal, "var(--green)")}
        </div>

        {/* Macros — hidden in simple mode */}
        {f.coach_insights && <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
          {[
            { label:"Proteína", val:todayTotals.protein, target:targets.protein, unit:"g", color:"#60a5fa" },
            { label:"Carbs",    val:todayTotals.carbs,   target:targets.carbs,   unit:"g", color:"#f59e0b" },
            { label:"Grasa",    val:todayTotals.fat,     target:targets.fat,     unit:"g", color:"#f87171" },
          ].map(m => (
            <div key={m.label} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"12px 10px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{m.label}</div>
              <div style={{ fontSize:20, fontWeight:900, color:m.color, lineHeight:1, marginTop:4 }}>{m.val}<span style={{ fontSize:11, fontWeight:400, color:"var(--muted)" }}>{m.unit}</span></div>
              <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>meta {m.target}{m.unit}</div>
              {macroBar(m.val, m.target, m.color)}
            </div>
          ))}
        </div>}

        {/* Quick combos */}
        {savedCombos.length > 0 && (
          <div style={{ marginBottom:14 }}>
            <p className="section-label">Combos guardados</p>
            <div style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none" }}>
              {savedCombos.map(c => (
                <button key={c.id} onClick={() => { logMealCombo(c.id); window.__showToast?.(`${c.name} registrado`, "success"); }}
                  style={{ flexShrink:0, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"8px 14px", fontSize:13, fontWeight:600, cursor:"pointer", color:"var(--text)", whiteSpace:"nowrap" }}>
                  🍽 {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meals list */}
        <p className="section-label">Comidas de hoy</p>
        {todayMeals.length === 0 ? (
          <div style={{ textAlign:"center", padding:"28px 16px", color:"var(--muted)", fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🍽</div>
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
                    {m.kcal} kcal
                    {m.protein > 0 && <span> · {m.protein}g P</span>}
                    {m.carbs > 0   && <span> · {m.carbs}g C</span>}
                    {m.fat > 0     && <span> · {m.fat}g G</span>}
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
            const pct   = Math.min(100, targets.kcal > 0 ? (kcal/targets.kcal)*100 : 0);
            const dayLabel = i===0?"Hoy":i===1?"Ayer":d.toLocaleDateString("es-AR",{weekday:"short",day:"numeric"});
            return (
              <div key={dateStr} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"10px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{dayLabel}</span>
                  <span style={{ fontSize:13, fontWeight:700, color: kcal > 0 ? "var(--green)" : "var(--muted)" }}>{kcal > 0 ? `${kcal} kcal` : "—"}</span>
                </div>
                {macroBar(kcal, targets.kcal, "var(--green)")}
              </div>
            );
          })}
        </div>
      </>)}

      {/* ── PLAN ── */}
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
              { label:"Calorías",      val:`${targets.kcal}`, unit:"kcal", color:"var(--green)" },
              { label:"Proteína",      val:`${targets.protein}`, unit:`g · ${targets.proteinPerKg}g/kg`, color:"#60a5fa" },
              { label:"Carbohidratos", val:`${targets.carbs}`, unit:"g", color:"#f59e0b" },
              { label:"Grasas",        val:`${targets.fat}`, unit:"g", color:"#f87171" },
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
              Basado en <b style={{ color:"var(--text)" }}>{bodyWeight}kg</b> · proteína: {targets.proteinPerKg}g/kg (rango gym: 1.6–2.2g/kg)
            </div>
          )}
        </div>

        {/* Distribución por comida */}
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px", marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Distribución diaria sugerida</div>
          {[
            { name:"Desayuno", pct:0.25, icon:"🌅", hint:"Carbos + proteína para arrancar" },
            { name:"Almuerzo", pct:0.35, icon:"☀️", hint:"La comida más completa del día" },
            { name:"Merienda", pct:0.15, icon:"🍎", hint:"Snack pre/post entreno" },
            { name:"Cena",     pct:0.25, icon:"🌙", hint:"Proteína + vegetales, menos carbos" },
          ].map(({ name, pct, icon, hint }) => {
            const kcal  = Math.round(targets.kcal * pct);
            const prot  = Math.round(targets.protein * pct);
            return (
              <div key={name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid var(--line)" }}>
                <span style={{ fontSize:22, width:28, textAlign:"center", flexShrink:0 }}>{icon}</span>
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
              const kcal  = Math.round(targets.kcal * mults[i]);
              const prot  = Math.round(targets.protein * (isTrain.includes(i) ? 1.0 : 0.95));
              const carbs = Math.round(targets.carbs * mults[i]);
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
                targets.kcal, targets.kcal, targets.protein, targets.carbs, targets.fat
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
                              <div style={{ fontSize:13, fontWeight:700, color:"var(--green)" }}>{item.kcal} kcal</div>
                              <div style={{ fontSize:10, color:"var(--muted)" }}>{item.protein}g P · {item.carbs}g C · {item.fat}g G</div>
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
      </>)}

      {/* ── MODAL AGREGAR ── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:100, display:"flex", alignItems:"flex-end" }} onClick={e => { if(e.target===e.currentTarget) resetForm(); }}>
          <div style={{ background:"var(--bg)", borderRadius:"20px 20px 0 0", width:"100%", padding:"20px 20px 36px", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:17 }}>Registrar comida</h3>
              <button onClick={resetForm} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"var(--muted)" }}>×</button>
            </div>

            {/* ── BUSCADOR DE BASE DE DATOS ── */}
            <div style={{ position:"relative", marginBottom:14 }}>
              <input
                className="input"
                placeholder="🔍 Buscar alimento (ej: pollo, manzana, arroz…)"
                value={dbQuery}
                onChange={e => handleDbSearch(e.target.value)}
                style={{ width:"100%", boxSizing:"border-box" }}
                autoComplete="off"
              />
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
                        <div style={{ fontSize:13, fontWeight:800, color:"var(--green)" }}>{food.kcal} kcal</div>
                        <div style={{ fontSize:10, color:"var(--muted)" }}>{food.protein}P · {food.carbs}C · {food.fat}G</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick foods toggle */}
            <button onClick={() => setShowQuick(p => !p)} style={{ width:"100%", background:"rgba(34,211,120,.08)", border:"1px solid rgba(34,211,120,.2)", borderRadius:12, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer", color:"var(--green)", marginBottom:14 }}>
              {showQuick ? <><Icon name="ChevronUp" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Ocultar alimentos rápidos</> : <><Icon name="Zap" size={13} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Alimentos frecuentes</>}
            </button>

            {showQuick && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                {QUICK_FOODS.map(food => (
                  <button key={food.name} onClick={() => { addQuickFood(food); window.__showToast?.(food.name+" agregado","success"); }}
                    style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, padding:"8px 10px", fontSize:12, fontWeight:600, cursor:"pointer", textAlign:"left", color:"var(--text)" }}>
                    <div style={{ fontWeight:700, marginBottom:2, fontSize:11, lineHeight:1.3 }}>{food.name}</div>
                    <div style={{ color:"var(--green)", fontWeight:800 }}>{food.kcal} kcal</div>
                    <div style={{ color:"var(--muted)", fontSize:10 }}>{food.protein}g P · {food.carbs}g C · {food.fat}g G</div>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleAdd} style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* Tipo */}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {MEAL_TYPES.map(t => (
                  <button type="button" key={t} onClick={() => setForm(f => ({...f,type:t}))}
                    style={{ padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
                      background: form.type===t ? "var(--green)" : "var(--panel2)", color: form.type===t ? "#fff" : "var(--muted)" }}>
                    {t}
                  </button>
                ))}
              </div>
              <input className="input" placeholder="Nombre del alimento *" value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} required />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <input className="input" type="number" placeholder="Calorías *" value={form.kcal} onChange={e => setForm(f => ({...f,kcal:e.target.value}))} required min="0" />
                <input className="input" type="number" placeholder="Proteína (g)" value={form.protein} onChange={e => setForm(f => ({...f,protein:e.target.value}))} min="0" />
                <input className="input" type="number" placeholder="Carbs (g)" value={form.carbs} onChange={e => setForm(f => ({...f,carbs:e.target.value}))} min="0" />
                <input className="input" type="number" placeholder="Grasas (g)" value={form.fat} onChange={e => setForm(f => ({...f,fat:e.target.value}))} min="0" />
              </div>
              <button type="submit" className="primary" style={{ marginTop:4 }} disabled={saving}>
                {saving ? "Guardando…" : "Guardar comida"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
