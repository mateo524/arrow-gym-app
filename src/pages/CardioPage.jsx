import { useState, useEffect, useRef } from "react";
import useStore from "../store/useStore.js";
import Icon from "../components/Icon.jsx";

const SPORTS = [
  // Resistencia
  { id:"correr",    name:"Correr",        icon:"🏃", cat:"Resistencia", metrics:["distancia"], met:9   },
  { id:"ciclismo",  name:"Ciclismo",      icon:"🚴", cat:"Resistencia", metrics:["distancia"], met:8   },
  { id:"natacion",  name:"Natación",      icon:"🏊", cat:"Resistencia", metrics:["distancia"], met:7   },
  { id:"caminata",  name:"Caminata",      icon:"🚶", cat:"Resistencia", metrics:["distancia"], met:3.5 },
  { id:"remo",      name:"Remo",          icon:"🚣", cat:"Resistencia", metrics:["distancia"], met:7   },
  { id:"eliptica",  name:"Elíptica",      icon:"🔄", cat:"Resistencia", metrics:["calorias"],  met:6   },
  { id:"cinta",     name:"Cinta incl.",   icon:"🏔️", cat:"Resistencia", metrics:["distancia"], met:7   },
  { id:"soga",      name:"Saltar la soga",icon:"⛓️", cat:"Resistencia", metrics:["rondas"],    met:11  },
  // Intervalos
  { id:"hiit",      name:"HIIT",          icon:"⚡", cat:"Intervalos",  metrics:["rondas"],    met:10  },
  { id:"boxeo",     name:"Boxeo",         icon:"🥊", cat:"Intervalos",  metrics:["rondas"],    met:9   },
  { id:"crossfit",  name:"CrossFit / WOD",icon:"🔥", cat:"Intervalos",  metrics:["rondas"],    met:10  },
  { id:"spinning",  name:"Spinning",      icon:"🎯", cat:"Intervalos",  metrics:["calorias"],  met:9   },
  // Deporte
  { id:"futbol",    name:"Fútbol",        icon:"⚽", cat:"Deporte",     metrics:[],            met:7   },
  { id:"basquet",   name:"Básquet",       icon:"🏀", cat:"Deporte",     metrics:[],            met:8   },
  { id:"tenis",     name:"Tenis / Pádel", icon:"🎾", cat:"Deporte",     metrics:[],            met:7   },
  { id:"hiking",    name:"Hiking / Trek", icon:"🥾", cat:"Deporte",     metrics:["distancia"], met:5   },
  { id:"escalada",  name:"Escalada",      icon:"🧗", cat:"Deporte",     metrics:[],            met:8   },
  { id:"yoga",      name:"Yoga / Pilates",icon:"🧘", cat:"Deporte",     metrics:[],            met:3   },
];

const INTENSITY_OPTS = [
  { id:"baja",   label:"Baja",   color:"#4ade80", desc:"Conversación fácil" },
  { id:"media",  label:"Media",  color:"#fbbf24", desc:"Respiración elevada" },
  { id:"alta",   label:"Alta",   color:"#f87171", desc:"Sin poder hablar" },
];

function fmt(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function estimateCalories(met, durationSec, weightKg = 70) {
  return Math.round(met * weightKg * (durationSec / 3600));
}

export default function CardioPage() {
  const setPage   = useStore(s => s.setPage);
  const logCardio = useStore(s => s.logCardio);
  const weightLog = useStore(s => s.weightLog) || [];
  const cardioHistory = useStore(s => s.cardioHistory) || [];
  const deleteCardio  = useStore(s => s.deleteCardio);

  const userWeight = weightLog.length ? Number(weightLog[weightLog.length - 1]?.kg || 70) : 70;

  const [step, setStep] = useState("picker"); // "picker" | "logging" | "done"
  const [sport, setSport] = useState(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [manualHours, setManualHours] = useState("");
  const [manualMins, setManualMins] = useState("");
  const [distance, setDistance] = useState("");
  const [rounds, setRounds] = useState("");
  const [calories, setCalories] = useState("");
  const [intensity, setIntensity] = useState("media");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function selectSport(s) {
    setSport(s);
    setStep("logging");
    setElapsed(0);
    setRunning(false);
    setManualMode(false);
    setManualHours(""); setManualMins("");
    setDistance(""); setRounds(""); setCalories(""); setNotes("");
    setIntensity("media");
  }

  function save() {
    const effectiveElapsed = manualMode
      ? (Number(manualHours || 0) * 3600 + Number(manualMins || 0) * 60)
      : elapsed;
    const intMult = intensity === "baja" ? 0.8 : intensity === "alta" ? 1.2 : 1;
    const cal = calories
      ? Number(calories)
      : estimateCalories(sport.met * intMult, effectiveElapsed, userWeight);

    const session = {
      sport: sport.id,
      sportName: sport.name,
      sportIcon: sport.icon,
      duration: effectiveElapsed,
      intensity,
      distance: distance ? Number(distance) : null,
      rounds: rounds ? Number(rounds) : null,
      calories: cal,
      notes,
    };
    logCardio(session);
    setSaved(session);
    setStep("done");
    setRunning(false);
  }

  const cats = [...new Set(SPORTS.map(s => s.cat))];

  /* ── Sport picker ──────────────────────────────────────────────── */
  if (step === "picker") {
    return (
      <div className="page-wrap">
        <div className="page-head">
          <button className="back-btn" onClick={() => setPage("start")} aria-label="Volver">
            <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
          </button>
          <div className="page-head-titles">
            <p className="eyebrow">Actividad</p>
            <h1>Cardio</h1>
          </div>
        </div>

        {cats.map(cat => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{cat}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {SPORTS.filter(s => s.cat === cat).map(s => (
                <button key={s.id} onClick={() => selectSport(s)}
                  style={{
                    background: "var(--panel)", border: "1.5px solid var(--border)",
                    borderRadius: 14, padding: "14px 8px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    transition: "border-color 0.2s, transform 0.1s",
                  }}
                  onTouchStart={e => e.currentTarget.style.transform = "scale(0.96)"}
                  onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span style={{ fontSize: 26 }}>{s.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", textAlign: "center", lineHeight: 1.2 }}>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {cardioHistory.length > 0 && (
          <div style={{ marginTop: 8, marginBottom: 80 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Historial reciente</p>
            {cardioHistory.slice(0, 5).map(c => (
              <div key={c.id} style={{ background: "var(--panel)", borderRadius: 12, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{c.sportIcon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{c.sportName}</p>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
                    {fmt(c.duration)} · {c.calories} kcal · {c.date}
                    {c.distance ? ` · ${c.distance} km` : ""}
                    {c.rounds ? ` · ${c.rounds} rondas` : ""}
                  </p>
                </div>
                <button onClick={() => deleteCardio(c.id)}
                  style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 16, cursor: "pointer", padding: 4 }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Logging view ──────────────────────────────────────────────── */
  if (step === "logging") {
    const intOpt  = INTENSITY_OPTS.find(o => o.id === intensity);
    const displayElapsed = manualMode
      ? (Number(manualHours || 0) * 3600 + Number(manualMins || 0) * 60)
      : elapsed;
    const estCal  = estimateCalories(
      sport.met * (intensity === "baja" ? 0.8 : intensity === "alta" ? 1.2 : 1),
      displayElapsed, userWeight
    );
    const timerColor = elapsed > 3600 ? "#f87171" : elapsed > 1800 ? "#fbbf24" : "var(--green)";

    return (
      <div className="page-wrap">
        <div className="page-head">
          <button className="back-btn" onClick={() => { setRunning(false); setStep("picker"); }} aria-label="Volver">
            <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
          </button>
          <div className="page-head-titles">
            <p className="eyebrow" style={{ color: "var(--green)" }}>{sport.icon} {sport.cat}</p>
            <h1>{sport.name}</h1>
          </div>
        </div>

        {/* Mode toggle: live vs manual */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { id: false, label: "▶ En vivo", desc: "Cronómetro" },
            { id: true,  label: "📝 Ya lo hice", desc: "Ingresá el tiempo" },
          ].map(m => (
            <button key={String(m.id)} onClick={() => { setManualMode(m.id); setRunning(false); }}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 12, cursor: "pointer",
                background: manualMode === m.id ? "rgba(168,85,247,.1)" : "var(--panel)",
                border: `1.5px solid ${manualMode === m.id ? "var(--green)" : "var(--border)"}`,
                color: manualMode === m.id ? "var(--green)" : "var(--muted)",
                fontWeight: 700, fontSize: 13,
              }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Big timer or manual input */}
        {!manualMode ? (
        <div style={{ textAlign: "center", margin: "24px 0 20px" }}>
          <div style={{
            fontSize: 64, fontWeight: 900, letterSpacing: "-2px",
            color: timerColor, fontVariantNumeric: "tabular-nums",
            textShadow: running ? `0 0 24px ${timerColor}40` : "none",
            transition: "color 0.5s, text-shadow 0.5s",
          }}>
            {fmt(elapsed)}
          </div>
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              marginTop: 12,
              background: running ? "rgba(248,113,113,.12)" : "rgba(168,85,247,.12)",
              border: `2px solid ${running ? "#f87171" : "var(--green)"}`,
              borderRadius: 50, width: 64, height: 64, fontSize: 26, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            {running ? "⏸" : "▶"}
          </button>
          {elapsed > 0 && (
            <button onClick={() => { setElapsed(0); setRunning(false); }}
              style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", display: "block", margin: "8px auto 0" }}>
              Reiniciar
            </button>
          )}
        </div>
        ) : (
        <div style={{ background: "var(--panel)", borderRadius: 14, padding: "16px 16px", marginBottom: 16 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Duración total</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Horas</label>
              <input type="number" inputMode="numeric" min="0" max="24"
                value={manualHours} onChange={e => setManualHours(e.target.value)}
                placeholder="0"
                style={{ width: "100%", background: "var(--panel2)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 12px", color: "var(--text)", fontSize: 24, fontWeight: 900, textAlign: "center", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Minutos</label>
              <input type="number" inputMode="numeric" min="0" max="59"
                value={manualMins} onChange={e => setManualMins(e.target.value)}
                placeholder="0"
                style={{ width: "100%", background: "var(--panel2)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 12px", color: "var(--text)", fontSize: 24, fontWeight: 900, textAlign: "center", boxSizing: "border-box" }} />
            </div>
          </div>
          {(manualHours || manualMins) && (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--green)", textAlign: "center" }}>
              ⏱ {manualHours || 0}h {manualMins || 0}min registrados
            </p>
          )}
        </div>
        )}

        {/* Metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {sport.metrics.includes("distancia") && (
            <div style={{ background: "var(--panel)", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Distancia (km)</label>
                {distance && elapsed > 0 && (
                  <span style={{ fontSize: 11, color: "var(--green)" }}>
                    {(Number(distance) / (elapsed / 3600)).toFixed(1)} km/h
                  </span>
                )}
              </div>
              <input type="number" inputMode="decimal" value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder="0.0"
                style={{ width: "100%", background: "none", border: "none", outline: "none", fontSize: 28, fontWeight: 900, color: "var(--text)", marginTop: 4 }} />
            </div>
          )}

          {sport.metrics.includes("rondas") && (
            <div style={{ background: "var(--panel)", borderRadius: 12, padding: "12px 16px" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Rondas / Series</label>
              <input type="number" inputMode="numeric" value={rounds}
                onChange={e => setRounds(e.target.value)}
                placeholder="0"
                style={{ width: "100%", background: "none", border: "none", outline: "none", fontSize: 28, fontWeight: 900, color: "var(--text)", marginTop: 4 }} />
            </div>
          )}

          {sport.metrics.includes("calorias") && (
            <div style={{ background: "var(--panel)", borderRadius: 12, padding: "12px 16px" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Calorías (de la máquina)</label>
              <input type="number" inputMode="numeric" value={calories}
                onChange={e => setCalories(e.target.value)}
                placeholder="0"
                style={{ width: "100%", background: "none", border: "none", outline: "none", fontSize: 28, fontWeight: 900, color: "var(--text)", marginTop: 4 }} />
            </div>
          )}

          {/* Intensity */}
          <div style={{ background: "var(--panel)", borderRadius: 12, padding: "12px 16px" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
              Intensidad
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {INTENSITY_OPTS.map(o => (
                <button key={o.id} onClick={() => setIntensity(o.id)}
                  style={{
                    background: intensity === o.id ? `${o.color}18` : "var(--panel2)",
                    border: `1.5px solid ${intensity === o.id ? o.color : "var(--border)"}`,
                    borderRadius: 10, padding: "8px 4px", cursor: "pointer",
                    textAlign: "center", transition: "all 0.2s",
                  }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: intensity === o.id ? o.color : "var(--text)" }}>{o.label}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{o.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calorie estimate */}
        {(elapsed > 0 || (manualMode && (manualHours || manualMins))) && (
          <div style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 12, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>🔥 Estimación calórica</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "var(--green)" }}>{calories || estCal} kcal</span>
          </div>
        )}

        {/* Notes */}
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notas (ej: ritmo promedio, cómo me sentí...)"
          rows={2}
          style={{
            width: "100%", background: "var(--panel)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "10px 14px", color: "var(--text)", fontSize: 13,
            resize: "none", boxSizing: "border-box", marginBottom: 16,
          }} />

        <button className="primary big" onClick={save}
          disabled={manualMode ? (Number(manualHours||0)*3600 + Number(manualMins||0)*60) === 0 : elapsed === 0}
          style={{ width: "100%", marginBottom: 80 }}>
          Guardar sesión
        </button>
      </div>
    );
  }

  /* ── Done / Summary ─────────────────────────────────────────────── */
  if (step === "done" && saved) {
    const pace = saved.distance && saved.duration
      ? `${(saved.duration / 60 / saved.distance).toFixed(1)} min/km`
      : null;
    const speed = saved.distance && saved.duration
      ? `${(saved.distance / (saved.duration / 3600)).toFixed(1)} km/h`
      : null;

    return (
      <div className="page-wrap" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginTop: 32 }}>{sport.icon}</div>
        <h2 style={{ marginTop: 8, marginBottom: 4 }}>{sport.name}</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 28 }}>{saved.date}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Tiempo", value: fmt(saved.duration) },
            { label: "Calorías", value: `${saved.calories} kcal` },
            saved.distance && { label: "Distancia", value: `${saved.distance} km` },
            saved.rounds && { label: "Rondas", value: saved.rounds },
            pace && { label: "Ritmo", value: pace },
            speed && { label: "Velocidad", value: speed },
          ].filter(Boolean).map(m => (
            <div key={m.label} style={{ background: "var(--panel)", borderRadius: 12, padding: "14px 12px" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--green)" }}>{m.value}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--panel)", borderRadius: 12, padding: "10px 16px", display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Intensidad</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: INTENSITY_OPTS.find(o => o.id === saved.intensity)?.color }}>
            {INTENSITY_OPTS.find(o => o.id === saved.intensity)?.label}
          </span>
        </div>

        <button className="primary big" onClick={() => setPage("home")} style={{ width: "100%", marginBottom: 12 }}>
          Volver al inicio
        </button>
        <button className="ghost" onClick={() => setStep("picker")} style={{ width: "100%", marginBottom: 80 }}>
          Registrar otra sesión
        </button>
      </div>
    );
  }

  return null;
}

