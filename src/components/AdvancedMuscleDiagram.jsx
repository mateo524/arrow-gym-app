import { useMemo } from "react";

const MUSCLE_TO_KEY = {
  "Pectoral mayor":"pecho","Pectoral superior":"pecho","Pectoral inferior":"pecho","Serrato anterior":"pecho",
  "Deltoide anterior":"deltA","Deltoide lateral":"deltL","Hombros":"deltA",
  "Deltoide posterior":"deltP",
  "Bíceps":"biceps","Braquial":"biceps","Braquiorradial":"biceps","Brazos":"biceps",
  "Tríceps":"triceps","Antebrazo":"triceps",
  "Dorsales":"dorsales","Redondo mayor":"dorsales","Espalda":"dorsales",
  "Romboides":"romboides",
  "Trapecio medio":"trapecio","Trapecio superior":"trapecio","Trapecio inferior":"trapecio",
  "Erectores espinales":"lumbares",
  "Recto abdominal":"abs","Oblicuos":"oblicuos","Transverso abdominal":"abs",
  "Flexores de cadera":"abs","Core":"abs",
  "Cuádriceps":"cuads","Aductores":"cuads","Piernas":"cuads",
  "Isquios":"isquios","Glúteos":"gluteos",
  "Gemelos":"gemelos","Sóleo":"gemelos",
  "Pecho":"pecho",
};

const INACTIVE_FILL   = "rgba(255,255,255,.03)";
const INACTIVE_STROKE = "rgba(255,255,255,.18)";
const ACTIVE_FILL     = "rgba(168,85,247,.75)";
const ACTIVE_STROKE   = "#a855f7";
const ACTIVE_GLOW     = "drop-shadow(0 0 4px #a855f7) drop-shadow(0 0 10px #a855f788)";

export default function AdvancedMuscleDiagram({ workouts = [], intensity = {}, onMuscleClick, activeMuscle }) {

  const levelMap = useMemo(() => {
    if (Object.keys(intensity).length > 0) {
      const m = {};
      Object.entries(intensity).forEach(([name, data]) => {
        const key = MUSCLE_TO_KEY[name];
        if (key && data?.level) m[key] = Math.max(m[key]||0, data.level);
      });
      return m;
    }
    const todayStr = new Date().toISOString().slice(0,10);
    const ws = new Date(); const dow = ws.getDay();
    ws.setDate(ws.getDate() + (dow===0?-6:1-dow)); ws.setHours(0,0,0,0);
    const weekStr = ws.toISOString().slice(0,10);
    const counts = {};
    workouts.forEach(wo => {
      if (wo.date < weekStr) return;
      const mult = wo.date === todayStr ? 2 : 1;
      (wo.sets||[]).forEach(s => {
        const key = MUSCLE_TO_KEY[s.muscle] || MUSCLE_TO_KEY[s.group];
        if (key) counts[key] = (counts[key]||0) + mult;
      });
    });
    const m = {};
    Object.entries(counts).forEach(([k,v]) => {
      m[k] = v >= 10 ? 4 : v >= 6 ? 3 : v >= 3 ? 2 : 1;
    });
    return m;
  }, [workouts, intensity]);

  function mp(key) {
    const active = (levelMap[key] || 0) > 0;
    return {
      fill:        active ? ACTIVE_FILL   : INACTIVE_FILL,
      stroke:      active ? ACTIVE_STROKE : INACTIVE_STROKE,
      strokeWidth: active ? 0.6 : 0.5,
      style: {
        filter:     active ? ACTIVE_GLOW : "none",
        transition: "all .35s ease",
        cursor:     onMuscleClick ? "pointer" : "default",
        opacity:    activeMuscle && activeMuscle !== key ? 0.4 : 1,
      },
      onClick: onMuscleClick ? () => onMuscleClick(key) : undefined,
    };
  }

  // Body outline style (always visible, never active)
  const outline = { fill: "none", stroke: "rgba(255,255,255,.12)", strokeWidth: 0.5 };
  const skin    = { fill: "rgba(255,255,255,.05)", stroke: "rgba(255,255,255,.12)", strokeWidth: 0.5 };

  const hasActivity = Object.keys(levelMap).length > 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
      <div style={{ display:"flex", gap:12, width:"100%", maxWidth:300, alignItems:"flex-start" }}>

        {/* ── FRONT ─────────────────────────────────────────────────────── */}
        <div style={{ flex:"1 1 0", minWidth:0 }}>
          <p style={{ fontSize:9, color:"rgba(255,255,255,.3)", letterSpacing:1, textTransform:"uppercase", textAlign:"center", margin:"0 0 4px" }}>Frente</p>
          <svg viewBox="0 0 60 158" style={{ width:"100%", height:"auto", display:"block" }}>

            {/* Head */}
            <ellipse cx="30" cy="7" rx="7" ry="8" {...skin}/>
            {/* Neck */}
            <rect x="27" y="14" width="6" height="5" rx="1.5" {...skin}/>

            {/* LEFT SHOULDER */}
            <polygon points="11,19 20,17 19,29 10,31" {...mp("deltA")}/>
            {/* RIGHT SHOULDER */}
            <polygon points="49,19 40,17 41,29 50,31" {...mp("deltA")}/>

            {/* LEFT PECTORAL */}
            <polygon points="20,17 30,16 30,30 19,30" {...mp("pecho")}/>
            {/* RIGHT PECTORAL */}
            <polygon points="30,16 40,17 41,30 30,30" {...mp("pecho")}/>

            {/* LEFT BICEP */}
            <polygon points="10,31 18,29 17,47 9,49" {...mp("biceps")}/>
            {/* RIGHT BICEP */}
            <polygon points="50,31 42,29 43,47 51,49" {...mp("biceps")}/>

            {/* LEFT FOREARM */}
            <polygon points="9,49 17,47 16,63 8,65" {...mp("biceps")}/>
            {/* RIGHT FOREARM */}
            <polygon points="51,49 43,47 44,63 52,65" {...mp("biceps")}/>

            {/* ABS — 6 cells */}
            <rect x="24" y="30" width="6"  height="7" rx="1" {...mp("abs")}/>
            <rect x="30" y="30" width="6"  height="7" rx="1" {...mp("abs")}/>
            <rect x="24" y="38" width="6"  height="7" rx="1" {...mp("abs")}/>
            <rect x="30" y="38" width="6"  height="7" rx="1" {...mp("abs")}/>
            <rect x="24" y="46" width="6"  height="7" rx="1" {...mp("abs")}/>
            <rect x="30" y="46" width="6"  height="7" rx="1" {...mp("abs")}/>

            {/* LEFT OBLIQUE */}
            <polygon points="19,30 24,30 24,54 18,56 16,44" {...mp("oblicuos")}/>
            {/* RIGHT OBLIQUE */}
            <polygon points="41,30 36,30 36,54 42,56 44,44" {...mp("oblicuos")}/>

            {/* HIP connector */}
            <polygon points="18,56 42,56 44,64 16,64" {...skin}/>

            {/* LEFT QUAD outer */}
            <polygon points="16,64 26,63 25,97 15,98" {...mp("cuads")}/>
            {/* LEFT QUAD inner */}
            <polygon points="26,63 30,63 30,97 25,97" {...mp("cuads")}/>
            {/* RIGHT QUAD inner */}
            <polygon points="30,63 34,63 35,97 30,97" {...mp("cuads")}/>
            {/* RIGHT QUAD outer */}
            <polygon points="34,63 44,64 45,98 35,97" {...mp("cuads")}/>

            {/* KNEE caps */}
            <rect x="15" y="98" width="15" height="7" rx="2" {...skin}/>
            <rect x="30" y="98" width="15" height="7" rx="2" {...skin}/>

            {/* LEFT CALF */}
            <polygon points="15,105 29,105 28,151 16,152" {...mp("gemelos")}/>
            {/* RIGHT CALF */}
            <polygon points="31,105 45,105 44,152 32,151" {...mp("gemelos")}/>

            {/* Feet */}
            <rect x="14" y="152" width="16" height="5" rx="2" {...skin}/>
            <rect x="30" y="152" width="16" height="5" rx="2" {...skin}/>

            {/* Body outline */}
            <path d="M20,17 L11,19 L9,49 L8,65 L16,64 L15,98 L14,152 L30,157 L46,152 L45,98 L44,64 L52,65 L51,49 L50,31 L40,17 L30,16 Z" {...outline}/>
          </svg>
        </div>

        {/* ── BACK ──────────────────────────────────────────────────────── */}
        <div style={{ flex:"1 1 0", minWidth:0 }}>
          <p style={{ fontSize:9, color:"rgba(255,255,255,.3)", letterSpacing:1, textTransform:"uppercase", textAlign:"center", margin:"0 0 4px" }}>Espalda</p>
          <svg viewBox="0 0 60 158" style={{ width:"100%", height:"auto", display:"block" }}>

            {/* Head */}
            <ellipse cx="30" cy="7" rx="7" ry="8" {...skin}/>
            {/* Neck */}
            <rect x="27" y="14" width="6" height="5" rx="1.5" {...skin}/>

            {/* LEFT REAR DELT */}
            <polygon points="11,19 20,17 19,29 10,31" {...mp("deltP")}/>
            {/* RIGHT REAR DELT */}
            <polygon points="49,19 40,17 41,29 50,31" {...mp("deltP")}/>

            {/* TRAPEZIUS — upper diamond */}
            <polygon points="27,15 30,16 33,15 40,17 30,24 20,17" {...mp("trapecio")}/>

            {/* LEFT LAT */}
            <polygon points="20,17 30,24 30,52 18,55 16,40" {...mp("dorsales")}/>
            {/* RIGHT LAT */}
            <polygon points="40,17 30,24 30,52 42,55 44,40" {...mp("dorsales")}/>

            {/* RHOMBOID center */}
            <polygon points="24,24 30,22 36,24 36,40 30,42 24,40" {...mp("romboides")}/>

            {/* LEFT TRICEP */}
            <polygon points="10,31 18,29 17,47 9,49" {...mp("triceps")}/>
            {/* RIGHT TRICEP */}
            <polygon points="50,31 42,29 43,47 51,49" {...mp("triceps")}/>

            {/* LEFT FOREARM back */}
            <polygon points="9,49 17,47 16,63 8,65" {...mp("triceps")}/>
            {/* RIGHT FOREARM back */}
            <polygon points="51,49 43,47 44,63 52,65" {...mp("triceps")}/>

            {/* LOWER BACK / erectors */}
            <polygon points="24,52 36,52 38,64 22,64" {...mp("lumbares")}/>

            {/* Spine line */}
            <line x1="30" y1="22" x2="30" y2="64" stroke="rgba(255,255,255,.08)" strokeWidth=".6"/>

            {/* GLUTES */}
            <polygon points="16,64 30,63 44,64 44,86 30,88 16,86" {...mp("gluteos")}/>

            {/* LEFT HAMSTRING outer */}
            <polygon points="16,86 26,85 25,118 15,119" {...mp("isquios")}/>
            {/* LEFT HAMSTRING inner */}
            <polygon points="26,85 30,85 30,118 25,118" {...mp("isquios")}/>
            {/* RIGHT HAMSTRING inner */}
            <polygon points="30,85 34,85 35,118 30,118" {...mp("isquios")}/>
            {/* RIGHT HAMSTRING outer */}
            <polygon points="34,85 44,86 45,119 35,118" {...mp("isquios")}/>

            {/* KNEE back */}
            <rect x="15" y="119" width="15" height="7" rx="2" {...skin}/>
            <rect x="30" y="119" width="15" height="7" rx="2" {...skin}/>

            {/* LEFT CALF back */}
            <polygon points="15,126 29,126 28,151 16,152" {...mp("gemelos")}/>
            {/* RIGHT CALF back */}
            <polygon points="31,126 45,126 44,152 32,151" {...mp("gemelos")}/>

            {/* Feet */}
            <rect x="14" y="152" width="16" height="5" rx="2" {...skin}/>
            <rect x="30" y="152" width="16" height="5" rx="2" {...skin}/>

            {/* Body outline */}
            <path d="M20,17 L11,19 L9,49 L8,65 L16,64 L16,86 L15,119 L14,152 L30,157 L46,152 L45,119 L44,86 L44,64 L52,65 L51,49 L50,31 L40,17 L30,16 Z" {...outline}/>
          </svg>
        </div>
      </div>

      {hasActivity ? (
        <div style={{ display:"flex", gap:14, fontSize:11, color:"rgba(255,255,255,.4)", justifyContent:"center" }}>
          <span style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:ACTIVE_FILL, boxShadow:"0 0 6px #22d37a" }}/>
            Entrenado esta semana
          </span>
        </div>
      ) : (
        <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", margin:0 }}>Sin actividad esta semana</p>
      )}
    </div>
  );
}
