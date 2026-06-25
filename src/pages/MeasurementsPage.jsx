import { useState, useMemo } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import { todayLocal } from "../lib/dates.js";
import { formatDate } from "../lib/analytics.js";
import Icon from "../components/Icon.jsx";

function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob + "T12:00:00");
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function toNum(v) { return Number(String(v || "").replace(/,/g, ".")) || 0; }

const TAB_STYLE_BASE = {
  flex: 1,
  padding: "9px 4px",
  fontSize: 12,
  fontWeight: 500,
  background: "none",
  border: "none",
  borderBottom: "2px solid transparent",
  color: "var(--muted)",
  cursor: "pointer",
  transition: "color 0.15s, border-color 0.15s",
  whiteSpace: "nowrap",
};

const TAB_STYLE_ACTIVE = {
  ...TAB_STYLE_BASE,
  color: "var(--green)",
  borderBottom: "2px solid var(--green)",
};

const inputStyle = {
  background: "var(--panel2)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "9px 10px",
  color: "var(--text)",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 12,
  color: "var(--muted)",
};

function WeightSparkline({ data }) {
  if (!data || data.length < 2) return null;
  const pts = data.slice(-8);
  const vals = pts.map((p) => p.kg);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const W = 100, H = 28;
  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p.kg - min) / range) * (H - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WeightChart({ data }) {
  if (!data || data.length < 2) return null;
  const pts = [...data].reverse().slice(-30); // last 30 entries, chronological
  const vals = pts.map(p => Number(p.kg));
  const min = Math.floor(Math.min(...vals) - 1);
  const max = Math.ceil(Math.max(...vals) + 1);
  const range = max - min || 1;
  const W = 300, H = 120, PAD = { l: 36, r: 8, t: 8, b: 28 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const cx = (i) => PAD.l + (i / (pts.length - 1)) * iW;
  const cy = (v) => PAD.t + iH - ((v - min) / range) * iH;

  const linePoints = pts.map((p, i) => `${cx(i)},${cy(p.kg)}`).join(" ");
  const areaPoints = `${cx(0)},${PAD.t + iH} ${linePoints} ${cx(pts.length-1)},${PAD.t + iH}`;

  // Y axis ticks
  const yTicks = [min, min + Math.round(range/2), max];
  // X axis labels: first, middle, last
  const xLabels = [0, Math.floor((pts.length-1)/2), pts.length-1].map(i => ({
    x: cx(i), label: pts[i]?.date?.slice(5) || "",
  }));

  const latest = vals[vals.length - 1];
  const oldest = vals[0];
  const diff = latest - oldest;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>Últimos {pts.length} registros</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: diff > 0 ? "var(--danger)" : diff < 0 ? "var(--green)" : "var(--muted)" }}>
          {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", overflow: "visible" }}>
        {/* Area fill */}
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--green)" stopOpacity=".25" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#wg)" />
        {/* Grid lines */}
        {yTicks.map(v => (
          <line key={v} x1={PAD.l} x2={W - PAD.r} y1={cy(v)} y2={cy(v)}
            stroke="rgba(255,255,255,.06)" strokeWidth="1" />
        ))}
        {/* Line */}
        <polyline points={linePoints} fill="none" stroke="var(--green)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Latest dot */}
        <circle cx={cx(pts.length-1)} cy={cy(latest)} r="4" fill="var(--green)" />
        {/* Y labels */}
        {yTicks.map(v => (
          <text key={v} x={PAD.l - 4} y={cy(v) + 4} textAnchor="end"
            fontSize="9" fill="rgba(255,255,255,.4)">{v}</text>
        ))}
        {/* X labels */}
        {xLabels.map(({ x, label }) => (
          <text key={label} x={x} y={H - 6} textAnchor="middle"
            fontSize="8" fill="rgba(255,255,255,.35)">{label}</text>
        ))}
      </svg>
    </div>
  );
}

export default function MeasurementsPage() {
  const setPage = useStore((s) => s.setPage);
  const logWeight = useStore((s) => s.logWeight);
  const weightLog = useStore((s) => s.weightLog) || [];
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const [todayKg, setTodayKg] = useState("");
  const latestWeightEntry = weightLog[0];

  const [measTab, setMeasTab] = useState("basico");
  const [photoNote, setPhotoNote] = useState("");
  const progressPhotos = useStore(s => s.progressPhotos) || [];
  const addProgressPhoto = useStore(s => s.addProgressPhoto);
  const deleteProgressPhoto = useStore(s => s.deleteProgressPhoto);

  // Básico
  const [editBasico, setEditBasico] = useState(false);
  const [measWeight, setMeasWeight] = useState("");
  const [measHeight, setMeasHeight] = useState("");
  const [measDob, setMeasDob] = useState("");
  const [basicoMsg, setBasicoMsg] = useState("");

  // Pliegues
  const [editPliegues, setEditPliegues] = useState(false);
  const [plieguesMsg, setPlieguesMsg] = useState("");
  const [triceps, setTriceps] = useState("");
  const [subscapular, setSubscapular] = useState("");
  const [biceps, setBiceps] = useState("");
  const [iliacCrest, setIliacCrest] = useState("");
  const [supraspinal, setSupraspinal] = useState("");
  const [abdominal, setAbdominal] = useState("");
  const [frontThigh, setFrontThigh] = useState("");
  const [medialCalf, setMedialCalf] = useState("");

  // Perímetros
  const [editPerimetros, setEditPerimetros] = useState(false);
  const [perimetrosMsg, setPerimetrosMsg] = useState("");
  const [armRelaxed, setArmRelaxed] = useState("");
  const [armFlexed, setArmFlexed] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [calfPer, setCalfPer] = useState("");
  const [humerus, setHumerus] = useState("");
  const [femur, setFemur] = useState("");

  // Hidratación
  const waterLog = useStore(s => s.waterLog) || [];
  const waterGoal = useStore(s => s.waterGoal) || 8;
  const logWater = useStore(s => s.logWater);
  const todayWater = waterLog.find(e => e.date === new Date().toISOString().slice(0,10))?.glasses || 0;

  // Sueño
  const sleepLog = useStore(s => s.sleepLog) || [];
  const logSleep = useStore(s => s.logSleep);
  const [todaySleep, setTodaySleep] = useState("");
  const todaySleepEntry = sleepLog.find(e => e.date === new Date().toISOString().slice(0,10));

  // Historial de circunferencias (localStorage)
  const [measHistory, setMeasHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pulse-meas-history") || "[]"); }
    catch { return []; }
  });

  const uid = profile?.id || user?.id;

  // Computed age from stored DOB
  const storedDob = profile?.date_of_birth;
  const displayAge = storedDob ? calcAge(storedDob) : (profile?.age || null);

  // Live age preview while editing
  const liveAge = measDob ? calcAge(measDob) : null;

  const bmi = useMemo(() => {
    const w = latestWeightEntry?.kg || Number(profile?.weight_kg);
    const h = Number(profile?.height_cm);
    if (!w || !h) return null;
    const bmiVal = w / ((h/100) ** 2);
    const category = bmiVal < 18.5 ? "Bajo peso" : bmiVal < 25 ? "Normal" : bmiVal < 30 ? "Sobrepeso" : "Obesidad";
    const color = bmiVal < 18.5 ? "#60a5fa" : bmiVal < 25 ? "var(--green)" : bmiVal < 30 ? "#f59e0b" : "var(--danger)";
    return { value: bmiVal.toFixed(1), category, color };
  }, [profile, latestWeightEntry]);

  const bodyFat = useMemo(() => {
    const tri = Number(profile?.triceps_mm);
    const sub = Number(profile?.subscapular_mm);
    const bic = Number(profile?.biceps_mm);
    const ili = Number(profile?.iliac_crest_mm);
    const age = Number(profile?.age);
    if (!tri || !sub || !bic || !ili) return null;
    const sum4 = tri + sub + bic + ili;
    const logSum = Math.log10(sum4);
    // Durnin-Womersley constants (male, simplified for 17-29 y.o.)
    const density = age && age >= 30
      ? 1.1581 - 0.0720 * logSum   // 30-39
      : 1.1620 - 0.0630 * logSum;  // 17-29 default
    const pct = ((4.95 / density) - 4.5) * 100;
    const category = pct < 10 ? "Muy magro" : pct < 15 ? "Atlético" : pct < 20 ? "Buena forma" : pct < 25 ? "Normal" : "Por encima de lo óptimo";
    return { pct: Math.round(pct * 10) / 10, sum4: Math.round(sum4), category };
  }, [profile]);

  function openBasico() {
    setMeasWeight(String(profile?.weight_kg || ""));
    setMeasHeight(String(profile?.height_cm || ""));
    setMeasDob(profile?.date_of_birth || "");
    setBasicoMsg("");
    setEditBasico(true);
  }

  async function saveBasico(e) {
    e.preventDefault();
    if (!uid) { setBasicoMsg("Error: sesión no válida"); return; }
    const payload = {};
    if (measWeight) payload.weight_kg = toNum(measWeight);
    if (measHeight) payload.height_cm = toNum(measHeight);
    if (measDob) {
      payload.date_of_birth = measDob;
      const computed = calcAge(measDob);
      if (computed !== null) payload.age = computed;
    }
    if (!Object.keys(payload).length) { setBasicoMsg("Ingresá al menos un valor."); return; }
    setBasicoMsg("Guardando…");
    const { error } = await supabase.from("profiles").update(payload).eq("id", uid);
    if (error) {
      setBasicoMsg("Error: " + error.message);
    } else {
      useAuthStore.setState(s => ({ profile: { ...(s.profile || { id: uid }), ...payload } }));
      setBasicoMsg("✓ Guardado");
      setTimeout(() => { setEditBasico(false); setBasicoMsg(""); }, 1400);
    }
  }

  function openPliegues() {
    setTriceps(String(profile?.triceps_mm || ""));
    setSubscapular(String(profile?.subscapular_mm || ""));
    setBiceps(String(profile?.biceps_mm || ""));
    setIliacCrest(String(profile?.iliac_crest_mm || ""));
    setSupraspinal(String(profile?.supraspinal_mm || ""));
    setAbdominal(String(profile?.abdominal_mm || ""));
    setFrontThigh(String(profile?.front_thigh_mm || ""));
    setMedialCalf(String(profile?.medial_calf_mm || ""));
    setPlieguesMsg("");
    setEditPliegues(true);
  }

  async function savePliegues(e) {
    e.preventDefault();
    if (!uid) { setPlieguesMsg("Error: sesión no válida"); return; }
    const payload = {};
    if (triceps)     payload.triceps_mm     = toNum(triceps);
    if (subscapular) payload.subscapular_mm = toNum(subscapular);
    if (biceps)      payload.biceps_mm      = toNum(biceps);
    if (iliacCrest)  payload.iliac_crest_mm = toNum(iliacCrest);
    if (supraspinal) payload.supraspinal_mm = toNum(supraspinal);
    if (abdominal)   payload.abdominal_mm   = toNum(abdominal);
    if (frontThigh)  payload.front_thigh_mm = toNum(frontThigh);
    if (medialCalf)  payload.medial_calf_mm = toNum(medialCalf);
    if (!Object.keys(payload).length) { setPlieguesMsg("Ingresá al menos un valor."); return; }
    setPlieguesMsg("Guardando…");
    const { error } = await supabase.from("profiles").update(payload).eq("id", uid);
    if (error) {
      setPlieguesMsg("Error: " + error.message);
    } else {
      useAuthStore.setState(s => ({ profile: { ...(s.profile || { id: uid }), ...payload } }));
      setPlieguesMsg("✓ Pliegues guardados");
      setTimeout(() => { setEditPliegues(false); setPlieguesMsg(""); }, 1400);
    }
  }

  function openPerimetros() {
    setArmRelaxed(String(profile?.arm_relaxed_cm || ""));
    setArmFlexed(String(profile?.arm_flexed_cm || ""));
    setWaist(String(profile?.waist_cm || ""));
    setHip(String(profile?.hip_cm || ""));
    setCalfPer(String(profile?.calf_cm || ""));
    setHumerus(String(profile?.humerus_cm || ""));
    setFemur(String(profile?.femur_cm || ""));
    setPerimetrosMsg("");
    setEditPerimetros(true);
  }

  async function savePerimetros(e) {
    e.preventDefault();
    if (!uid) { setPerimetrosMsg("Error: sesión no válida"); return; }
    const payload = {};
    if (armRelaxed) payload.arm_relaxed_cm = toNum(armRelaxed);
    if (armFlexed)  payload.arm_flexed_cm  = toNum(armFlexed);
    if (waist)      payload.waist_cm       = toNum(waist);
    if (hip)        payload.hip_cm         = toNum(hip);
    if (calfPer)    payload.calf_cm        = toNum(calfPer);
    if (humerus)    payload.humerus_cm     = toNum(humerus);
    if (femur)      payload.femur_cm       = toNum(femur);
    if (!Object.keys(payload).length) { setPerimetrosMsg("Ingresá al menos un valor."); return; }
    setPerimetrosMsg("Guardando…");
    const { error } = await supabase.from("profiles").update(payload).eq("id", uid);
    if (error) {
      setPerimetrosMsg("Error: " + error.message);
    } else {
      useAuthStore.setState(s => ({ profile: { ...(s.profile || { id: uid }), ...payload } }));
      // Guardar en historial local de circunferencias
      const today = todayLocal();
      setMeasHistory(prev => {
        const next = [{ date: today, ...payload }, ...prev.filter(e => e.date !== today)].slice(0, 60);
        try { localStorage.setItem("pulse-meas-history", JSON.stringify(next)); } catch {}
        return next;
      });
      setPerimetrosMsg("✓ Guardado");
      setTimeout(() => { setEditPerimetros(false); setPerimetrosMsg(""); }, 1400);
    }
  }

  return (
    <section className="page">
      <div style={{ marginBottom: 16 }}>
        <p className="eyebrow">Mi cuerpo</p>
        <h1 style={{ margin: 0 }}>Mediciones</h1>
      </div>

      {/* Peso corporal rápido */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Peso corporal</h2>
          <WeightSparkline data={weightLog} />
        </div>
        {weightLog.length > 0 && (
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--muted)" }}>
            Último: <b style={{ color: "var(--text)" }}>{weightLog[0]?.kg} kg</b>
            <span style={{ marginLeft: 8 }}>{formatDate(weightLog[0]?.date)}</span>
          </p>
        )}
        {(() => {
          const last7 = weightLog.slice(0,7);
          if (last7.length < 3) return null;
          const newest = last7[0].kg;
          const oldest = last7[last7.length-1].kg;
          const diff = oldest - newest; // positivo = bajó
          const days = last7.length;
          const weeklyRate = (diff / days) * 7;
          if (weeklyRate > 1.5) return (
            <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)", borderRadius:12, padding:"10px 14px", marginBottom:10, fontSize:13 }}>
              <b style={{ color:"var(--danger)" }}>⚠ Bajás muy rápido</b>
              <p style={{ margin:"4px 0 0", color:"var(--muted)" }}>~{weeklyRate.toFixed(1)}kg/semana. Podés perder masa muscular. Lo ideal es 0.5–1kg/semana.</p>
            </div>
          );
          return null;
        })()}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            inputMode="decimal"
            placeholder="kg de hoy"
            value={todayKg}
            onChange={(e) => setTodayKg(e.target.value)}
            style={{ flex: 1, background: "var(--panel2)", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", color: "var(--text)", fontSize: 15 }}
          />
          <button className="primary" style={{ padding: "10px 18px" }} disabled={!todayKg}
            onClick={async () => {
              if (!todayKg) return;
              logWeight(todayKg);
              setTodayKg("");
              if (uid) {
                const newWeight = toNum(todayKg);
                await supabase.from("profiles").update({ weight_kg: newWeight }).eq("id", uid);
                useAuthStore.setState(s => ({ profile: { ...(s.profile || { id: uid }), weight_kg: newWeight } }));
              }
            }}>
            +
          </button>
        </div>
        {weightLog.length >= 2 && <WeightChart data={weightLog} />}
      </div>

      {/* Hidratación */}
      <div className="card" style={{ marginBottom:14 }}>
        <h2 style={{ marginBottom:12 }}>💧 Hidratación hoy</h2>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:22, fontWeight:900, color:"#60a5fa" }}>{todayWater}<span style={{ fontSize:14, fontWeight:400, color:"var(--muted)" }}>/{waterGoal} vasos</span></div>
            <div style={{ height:8, background:"var(--panel2)", borderRadius:4, overflow:"hidden", marginTop:6 }}>
              <div style={{ height:"100%", width:`${Math.min(100,(todayWater/waterGoal)*100)}%`, background:"#60a5fa", borderRadius:4, transition:"width .3s" }} />
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[1,2,3].map(n => (
            <button key={n} onClick={() => logWater(todayWater + n)} className="ghost" style={{ fontSize:13, padding:"7px 14px" }}>
              +{n} 💧
            </button>
          ))}
          {todayWater > 0 && (
            <button onClick={() => logWater(Math.max(0, todayWater - 1))} className="ghost" style={{ fontSize:13, padding:"7px 14px", color:"var(--muted)" }}>
              -1
            </button>
          )}
        </div>
      </div>

      {/* Sueño */}
      <div className="card" style={{ marginBottom:14 }}>
        <h2 style={{ marginBottom:12 }}>😴 Sueño de anoche</h2>
        {todaySleepEntry ? (
          <div style={{ fontSize:20, fontWeight:900, color:"#60a5fa", marginBottom:8 }}>
            {todaySleepEntry.hours}h
            <span style={{ fontSize:13, fontWeight:400, color:"var(--muted)", marginLeft:6 }}>
              {todaySleepEntry.hours >= 8 ? "✓ Óptimo" : todaySleepEntry.hours >= 7 ? "Bueno" : todaySleepEntry.hours >= 6 ? "Regular" : "⚠ Insuficiente"}
            </span>
          </div>
        ) : null}
        <div style={{ display:"flex", gap:8 }}>
          <input
            type="number"
            value={todaySleep}
            onChange={e => setTodaySleep(e.target.value)}
            placeholder="Horas dormidas"
            min="1" max="12" step="0.5"
            style={{ flex:1, background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:10, padding:"9px 12px", color:"var(--text)", fontSize:14 }}
          />
          <button className="primary" disabled={!todaySleep} style={{ padding:"9px 18px" }}
            onClick={() => { if(todaySleep) { logSleep(todaySleep); setTodaySleep(""); } }}>
            Guardar
          </button>
        </div>
        {sleepLog.length >= 3 && (() => {
          const recent = sleepLog.slice(0, 7);
          const avg = recent.reduce((s, e) => s + e.hours, 0) / recent.length;
          return <p style={{ margin:"8px 0 0", fontSize:12, color:"var(--muted)" }}>Promedio últimos 7 días: <b style={{ color: avg >= 7 ? "var(--green)" : "#f59e0b" }}>{avg.toFixed(1)}h</b></p>;
        })()}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 16, gap: 0 }}>
          {[
            { id: "basico", label: "Básico" },
            { id: "pliegues", label: "Pliegues" },
            { id: "perimetros", label: "Perímetros" },
            { id: "fotos", label: "📷 Fotos" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMeasTab(id)}
              style={measTab === id ? TAB_STYLE_ACTIVE : TAB_STYLE_BASE}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab 1: Básico */}
        {measTab === "basico" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              {!editBasico && (
                <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={openBasico}>
                  {profile?.weight_kg ? "Editar" : "Agregar"}
                </button>
              )}
            </div>

            {!editBasico ? (
              <>
                {/* Age display */}
                {displayAge !== null && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, background: "rgba(168,85,247,.07)",
                    border: "1px solid rgba(168,85,247,.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 12,
                  }}>
                    <Icon name="Calendar" size={18} strokeWidth={2} style={{ color: "var(--green)", flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "var(--green)" }}>{displayAge}</span>
                      <span style={{ fontSize: 14, color: "var(--muted)", marginLeft: 6 }}>años</span>
                      {storedDob && (
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>
                          Nacido el {new Date(storedDob + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {(profile?.weight_kg || profile?.height_cm) ? (
                  <div className="stats-grid" style={{ marginTop: 4 }}>
                    {profile.weight_kg && <div><b>{profile.weight_kg}</b><span>kg</span></div>}
                    {profile.height_cm && <div><b>{profile.height_cm}</b><span>cm</span></div>}
                  </div>
                ) : (
                  displayAge === null && (
                    <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                      Aún no cargaste tus medidas básicas.
                    </p>
                  )
                )}
              </>
            ) : (
              <form onSubmit={saveBasico} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="quick-grid">
                  <label className="field-group">
                    Peso (kg)
                    <input inputMode="decimal" value={measWeight} onChange={(e) => setMeasWeight(e.target.value)} placeholder="ej: 75" />
                  </label>
                  <label className="field-group">
                    Altura (cm)
                    <input inputMode="decimal" value={measHeight} onChange={(e) => setMeasHeight(e.target.value)} placeholder="ej: 175" />
                  </label>
                </div>

                <label style={fieldGroupStyle}>
                  Fecha de nacimiento
                  <input
                    type="date"
                    value={measDob}
                    onChange={(e) => setMeasDob(e.target.value)}
                    style={inputStyle}
                  />
                </label>

                {liveAge !== null && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, background: "rgba(168,85,247,.07)",
                    border: "1px solid rgba(168,85,247,.2)", borderRadius: 10, padding: "8px 12px",
                  }}>
                    <Icon name="Calendar" size={16} strokeWidth={2} style={{ color: "var(--green)" }} />
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>
                      Edad: <b style={{ color: "var(--green)" }}>{liveAge} años</b>
                    </span>
                  </div>
                )}

                {basicoMsg && (
                  <div className={basicoMsg.startsWith("✓") ? "success-msg" : "login-error"}>
                    <Icon name={basicoMsg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                    <span>{basicoMsg}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setEditBasico(false)}>Cancelar</button>
                  <button type="submit" className="primary" style={{ flex: 1 }}>Guardar</button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Tab 2: Pliegues cutáneos */}
        {measTab === "pliegues" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              {!editPliegues && (
                <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={openPliegues}>
                  {profile?.triceps_mm ? "Editar" : "Agregar"}
                </button>
              )}
            </div>
            {!editPliegues ? (
              profile?.triceps_mm || profile?.subscapular_mm || profile?.biceps_mm ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Tríceps", val: profile?.triceps_mm },
                    { label: "Subescapular", val: profile?.subscapular_mm },
                    { label: "Bíceps", val: profile?.biceps_mm },
                    { label: "Cresta ilíaca", val: profile?.iliac_crest_mm },
                    { label: "Supraspinal", val: profile?.supraspinal_mm },
                    { label: "Abdominal", val: profile?.abdominal_mm },
                    { label: "Muslo anterior", val: profile?.front_thigh_mm },
                    { label: "Pantorrilla medial", val: profile?.medial_calf_mm },
                  ].map(({ label, val }) => val ? (
                    <div key={label} style={{ background: "var(--panel2)", borderRadius: 10, padding: "8px 10px" }}>
                      <b style={{ fontSize: 16 }}>{val}</b>
                      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>mm</span>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>{label}</p>
                    </div>
                  ) : null)}
                </div>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                  Aún no cargaste los pliegues cutáneos.
                </p>
              )
            ) : (
              <form onSubmit={savePliegues} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Tríceps (mm)", val: triceps, set: setTriceps },
                    { label: "Subescapular (mm)", val: subscapular, set: setSubscapular },
                    { label: "Bíceps (mm)", val: biceps, set: setBiceps },
                    { label: "Cresta ilíaca (mm)", val: iliacCrest, set: setIliacCrest },
                    { label: "Supraspinal (mm)", val: supraspinal, set: setSupraspinal },
                    { label: "Abdominal (mm)", val: abdominal, set: setAbdominal },
                    { label: "Muslo anterior (mm)", val: frontThigh, set: setFrontThigh },
                    { label: "Pantorrilla medial (mm)", val: medialCalf, set: setMedialCalf },
                  ].map(({ label, val, set }) => (
                    <label key={label} style={fieldGroupStyle}>
                      {label}
                      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder="mm" style={inputStyle} />
                    </label>
                  ))}
                </div>
                {plieguesMsg && (
                  <div className={plieguesMsg.startsWith("✓") ? "success-msg" : "login-error"}>
                    <Icon name={plieguesMsg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                    <span>{plieguesMsg}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setEditPliegues(false)}>Cancelar</button>
                  <button type="submit" className="primary" style={{ flex: 1 }}>Guardar</button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Tab 3: Perímetros */}
        {measTab === "perimetros" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              {!editPerimetros && (
                <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={openPerimetros}>
                  {profile?.arm_relaxed_cm ? "Editar" : "Agregar"}
                </button>
              )}
            </div>
            {!editPerimetros ? (
              <>
                {profile?.arm_relaxed_cm || profile?.waist_cm || profile?.hip_cm ? (
                  <>
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Perímetros</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                      {[
                        { label: "Brazo relajado", val: profile?.arm_relaxed_cm },
                        { label: "Brazo contraído", val: profile?.arm_flexed_cm },
                        { label: "Cintura", val: profile?.waist_cm },
                        { label: "Caderas", val: profile?.hip_cm },
                        { label: "Pantorrilla", val: profile?.calf_cm },
                      ].map(({ label, val }) => val ? (
                        <div key={label} style={{ background: "var(--panel2)", borderRadius: 10, padding: "8px 10px" }}>
                          <b style={{ fontSize: 16 }}>{val}</b>
                          <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>cm</span>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>{label}</p>
                        </div>
                      ) : null)}
                    </div>
                    {(profile?.humerus_cm || profile?.femur_cm) && (
                      <>
                        <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Diámetros</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {[
                            { label: "Húmero", val: profile?.humerus_cm },
                            { label: "Fémur", val: profile?.femur_cm },
                          ].map(({ label, val }) => val ? (
                            <div key={label} style={{ background: "var(--panel2)", borderRadius: 10, padding: "8px 10px" }}>
                              <b style={{ fontSize: 16 }}>{val}</b>
                              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>cm</span>
                              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>{label}</p>
                            </div>
                          ) : null)}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                    Aún no cargaste perímetros ni diámetros.
                  </p>
                )}
                {measHistory.length >= 2 && (() => {
                  const FIELDS = [
                    { key: "waist_cm", label: "Cintura", color: "#f59e0b" },
                    { key: "hip_cm", label: "Caderas", color: "#a78bfa" },
                    { key: "arm_relaxed_cm", label: "Brazo", color: "#34d399" },
                  ];
                  const relevant = FIELDS.filter(f => measHistory.some(e => e[f.key]));
                  if (!relevant.length) return null;
                  const pts = measHistory.slice(0, 12).reverse();
                  const W = 240, H = 60;
                  return (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Evolución de perímetros</p>
                      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
                        {relevant.map(({ key, color }) => {
                          const validPts = pts.filter(p => p[key]);
                          if (validPts.length < 2) return null;
                          const allVals = relevant.flatMap(f => pts.map(p => p[f.key]).filter(Boolean));
                          const minV = Math.min(...allVals);
                          const maxV = Math.max(...allVals);
                          const range = maxV - minV || 1;
                          const polyPoints = validPts.map((p, i) => {
                            const x = (i / (validPts.length - 1)) * (W - 8) + 4;
                            const y = H - 4 - ((p[key] - minV) / range) * (H - 12);
                            return `${x},${y}`;
                          }).join(" ");
                          return <polyline key={key} points={polyPoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
                        })}
                      </svg>
                      <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                        {relevant.map(({ key, label, color }) => (
                          <span key={key} style={{ fontSize: 11, color, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ display: "inline-block", width: 10, height: 3, background: color, borderRadius: 2 }} />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <form onSubmit={savePerimetros} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Perímetros</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Brazo relajado (cm)", val: armRelaxed, set: setArmRelaxed },
                    { label: "Brazo contraído (cm)", val: armFlexed, set: setArmFlexed },
                    { label: "Cintura (cm)", val: waist, set: setWaist },
                    { label: "Caderas (cm)", val: hip, set: setHip },
                    { label: "Pantorrilla (cm)", val: calfPer, set: setCalfPer },
                  ].map(({ label, val, set }) => (
                    <label key={label} style={fieldGroupStyle}>
                      {label}
                      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder="cm" style={inputStyle} />
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Diámetros</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Húmero (cm)", val: humerus, set: setHumerus },
                    { label: "Fémur (cm)", val: femur, set: setFemur },
                  ].map(({ label, val, set }) => (
                    <label key={label} style={fieldGroupStyle}>
                      {label}
                      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder="cm" style={inputStyle} />
                    </label>
                  ))}
                </div>
                {perimetrosMsg && (
                  <div className={perimetrosMsg.startsWith("✓") ? "success-msg" : "login-error"}>
                    <Icon name={perimetrosMsg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                    <span>{perimetrosMsg}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setEditPerimetros(false)}>Cancelar</button>
                  <button type="submit" className="primary" style={{ flex: 1 }}>Guardar</button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Tab Fotos */}
        {measTab === "fotos" && (
          <div>
            <p style={{ fontSize:13, color:"var(--muted)", margin:"0 0 14px" }}>
              Subí fotos mensuales para comparar tu progreso visual.
            </p>
            <label style={{ display:"block", background:"rgba(168,85,247,.07)", border:"2px dashed rgba(168,85,247,.3)", borderRadius:14, padding:"18px", textAlign:"center", cursor:"pointer", marginBottom:14 }}>
              <span style={{ fontSize:28 }}>📷</span>
              <p style={{ margin:"6px 0 0", fontSize:13, color:"var(--green)", fontWeight:700 }}>Agregar foto</p>
              <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--muted)" }}>Tocá para seleccionar una imagen</p>
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => addProgressPhoto(ev.target.result, photoNote);
                reader.readAsDataURL(file);
                e.target.value = "";
              }} />
            </label>
            <input
              value={photoNote}
              onChange={e => setPhotoNote(e.target.value)}
              placeholder="Nota opcional (ej: 85kg, semana 4…)"
              style={{ width:"100%", background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:10, padding:"9px 12px", color:"var(--text)", fontSize:13, boxSizing:"border-box", marginBottom:14 }}
            />
            {progressPhotos.length === 0 ? (
              <p style={{ fontSize:13, color:"var(--muted)", textAlign:"center", padding:"20px 0" }}>Sin fotos aún.</p>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {progressPhotos.map(photo => (
                  <div key={photo.id} style={{ position:"relative", borderRadius:12, overflow:"hidden", background:"var(--panel2)", border:"1px solid var(--line)" }}>
                    <img src={photo.dataUrl} alt={photo.date} style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block" }} />
                    <div style={{ padding:"6px 8px" }}>
                      <div style={{ fontSize:11, color:"var(--green)", fontWeight:700 }}>{photo.date}</div>
                      {photo.note && <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{photo.note}</div>}
                    </div>
                    <button onClick={() => deleteProgressPhoto(photo.id)}
                      style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,.6)", border:"none", borderRadius:8, width:26, height:26, cursor:"pointer", color:"#fff", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {bmi && (
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"14px", marginBottom:14 }}>
          <h2 style={{ margin:"0 0 10px", fontSize:15 }}>Composición corporal</h2>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ background:"var(--panel2)", borderRadius:12, padding:"12px 20px", textAlign:"center", flexShrink:0 }}>
              <div style={{ fontSize:28, fontWeight:900, color:bmi.color }}>{bmi.value}</div>
              <div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase" }}>IMC</div>
            </div>
            <div>
              <p style={{ margin:"0 0 4px", fontWeight:700, color:bmi.color }}>{bmi.category}</p>
              <p style={{ margin:0, fontSize:12, color:"var(--muted)", lineHeight:1.4 }}>
                Peso normal: {Math.round((18.5 * (Number(profile.height_cm)/100)**2))}–{Math.round((24.9 * (Number(profile.height_cm)/100)**2))} kg
              </p>
            </div>
          </div>
        </div>
      )}

      {bodyFat && (
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"14px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700 }}>% Grasa corporal estimado</p>
              <p style={{ margin:0, fontSize:12, color:"var(--muted)" }}>Fórmula Durnin-Womersley · Suma 4 pliegues: {bodyFat.sum4}mm</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:24, fontWeight:900, color:"var(--green)" }}>{bodyFat.pct}%</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>{bodyFat.category}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

