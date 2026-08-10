import { useState, useMemo } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { todayLocal } from "../lib/dates.js";
import { features, vocab } from "../config/features.js";

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
              ⚠️ Registrá tu peso en <b>Mediciones</b> para targets precisos.
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
      </>)}

      {/* ── MODAL AGREGAR ── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:100, display:"flex", alignItems:"flex-end" }} onClick={e => { if(e.target===e.currentTarget) resetForm(); }}>
          <div style={{ background:"var(--bg)", borderRadius:"20px 20px 0 0", width:"100%", padding:"20px 20px 36px", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:17 }}>Registrar comida</h3>
              <button onClick={resetForm} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"var(--muted)" }}>×</button>
            </div>

            {/* Quick foods toggle */}
            <button onClick={() => setShowQuick(p => !p)} style={{ width:"100%", background:"rgba(34,211,120,.08)", border:"1px solid rgba(34,211,120,.2)", borderRadius:12, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer", color:"var(--green)", marginBottom:14 }}>
              {showQuick ? "▲ Ocultar alimentos rápidos" : "⚡ Alimentos frecuentes"}
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
