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

  // TDEE estimate
  const tdee = useMemo(() => {
    if (!bodyWeight) return null;
    const base = bodyWeight * 24; // rough RMR
    const multipliers = { mantenimiento:1.5, volumen:1.6, definicion:1.45, rendimiento:1.65 };
    return Math.round(base * (multipliers[userGoal] ?? 1.5));
  }, [bodyWeight, userGoal]);

  // Macro targets
  const targets = useMemo(() => {
    if (!bodyWeight) return { kcal: tdee || 2000, protein: 160, carbs: 250, fat: 65 };
    const goalMap = {
      volumen:       { proteinFactor:2.2, carbFactor:4, fatFactor:1.0 },
      definicion:    { proteinFactor:2.4, carbFactor:2.5, fatFactor:0.8 },
      mantenimiento: { proteinFactor:1.8, carbFactor:3.5, fatFactor:0.9 },
      rendimiento:   { proteinFactor:2.0, carbFactor:5, fatFactor:0.9 },
    };
    const g = goalMap[userGoal] ?? goalMap.mantenimiento;
    const protein = Math.round(bodyWeight * g.proteinFactor);
    const carbs   = Math.round(bodyWeight * g.carbFactor);
    const fat     = Math.round(bodyWeight * g.fatFactor);
    const kcal    = protein*4 + carbs*4 + fat*9;
    return { kcal, protein, carbs, fat };
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
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px", marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Targets calculados para vos</div>
          {!bodyWeight && (
            <div style={{ background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.3)", borderRadius:10, padding:"10px 12px", fontSize:13, marginBottom:12 }}>
              ⚠️ Registrá tu peso en <b>Mediciones</b> para que los targets sean precisos.
              <button onClick={() => setPage("measurements")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--green)", fontWeight:700, fontSize:13, marginLeft:6 }}>Ir →</button>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { label:`Calorías (${goalLabels[userGoal]})`, val:`${targets.kcal} kcal`, color:"var(--green)" },
              { label:"Proteína",   val:`${targets.protein}g`, color:"#60a5fa" },
              { label:"Carbohidratos", val:`${targets.carbs}g`, color:"#f59e0b" },
              { label:"Grasas",     val:`${targets.fat}g`,     color:"#f87171" },
            ].map(row => (
              <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--line)" }}>
                <span style={{ fontSize:13, color:"var(--muted)" }}>{row.label}</span>
                <span style={{ fontSize:14, fontWeight:800, color:row.color }}>{row.val}</span>
              </div>
            ))}
          </div>
          {bodyWeight && <div style={{ fontSize:11, color:"var(--muted)", marginTop:10 }}>Basado en {bodyWeight}kg · objetivo {goalLabels[userGoal].toLowerCase()}</div>}
        </div>

        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px" }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Distribución por comida</div>
          {[
            ["Desayuno", "25%", Math.round(targets.kcal*0.25)],
            ["Almuerzo", "35%", Math.round(targets.kcal*0.35)],
            ["Merienda", "15%", Math.round(targets.kcal*0.15)],
            ["Cena",     "25%", Math.round(targets.kcal*0.25)],
          ].map(([name,pct,kcal]) => (
            <div key={name} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--line)", fontSize:13 }}>
              <span style={{ color:"var(--muted)" }}>{name}</span>
              <span>{pct} · <b style={{ color:"var(--green)" }}>{kcal} kcal</b></span>
            </div>
          ))}
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
