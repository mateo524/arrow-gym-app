// Arrow Gym UI kit — shared primitives & data viz
const { useState, useEffect, useRef } = React;

// ── Bottom nav ────────────────────────────────────────────────
const NAV = [
  { id: "home", icon: "⚡", label: "Inicio" },
  { id: "start", icon: "▶", label: "Start" },
  { id: "coach", icon: "🧠", label: "Coach" },
  { id: "progress", icon: "📈", label: "Progreso" },
];
function BottomNav({ page, onNav }) {
  return (
    <nav className="bottom-nav">
      {NAV.map((t) => (
        <button key={t.id} className={`nav-item ${page === t.id ? "active" : ""}`} onClick={() => onNav(t.id)}>
          <span>{t.icon}</span><small>{t.label}</small>
        </button>
      ))}
      <button className="nav-item" onClick={() => onNav("more")}>
        <span>+</span><small>Más</small>
      </button>
    </nav>
  );
}

// ── Score badge ───────────────────────────────────────────────
function scoreColor(v) { return v >= 70 ? "#6df2a4" : v >= 40 ? "#f59e0b" : "#ff6b6b"; }
function ScoreBadge({ v, label }) {
  const c = scoreColor(v);
  return (
    <div className="score-badge" style={{ borderColor: c }}>
      <b style={{ color: c }}>{v}</b><span>{label}</span>
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────
function Sparkline({ values, color = "#6df2a4", dots = true }) {
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = i * (260 / (values.length - 1)) + 10;
    const y = 70 - ((v - min) / range) * 60;
    return `${x},${y}`;
  });
  return (
    <svg viewBox="0 0 280 80" style={{ width: "100%", height: "auto", display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {dots && values.map((v, i) => {
        const x = i * (260 / (values.length - 1)) + 10;
        const y = 70 - ((v - min) / range) * 60;
        return <circle key={i} cx={x} cy={y} r={i === values.length - 1 ? 3.5 : 2.5} fill={i === values.length - 1 ? "#eafff2" : color} />;
      })}
    </svg>
  );
}

// ── Muscle map (anatomically realistic front/back) ────────────
const LEVEL_FILL = ["#131e20", "#1a3d42", "#1a6875", "#30a2b8", "#5ee0ff"];
function mFill(I, group) { return LEVEL_FILL[Math.max(0, Math.min(4, I[group] || 0))]; }

// Shared stroke style for muscles
const MS = { stroke: "rgba(10,20,22,.65)", strokeWidth: 1 };
const MS_THIN = { stroke: "rgba(10,20,22,.5)", strokeWidth: 0.7 };

function FrontFigure({ I }) {
  const f = (g) => mFill(I, g);
  return (
    <svg viewBox="0 0 120 280" style={{ width: "100%", display: "block" }}>
      {/* ── Limbs (base layer) ── */}
      <path d="M 28 48 Q 15 70 12 94" fill="none" strokeLinecap="round" strokeWidth="18" stroke="#1a2a2e"/>
      <path d="M 92 48 Q 105 70 108 94" fill="none" strokeLinecap="round" strokeWidth="18" stroke="#1a2a2e"/>
      <path d="M 12 94 Q 9 116 11 136" fill="none" strokeLinecap="round" strokeWidth="14" stroke="#1a2a2e"/>
      <path d="M 108 94 Q 111 116 109 136" fill="none" strokeLinecap="round" strokeWidth="14" stroke="#1a2a2e"/>
      <path d="M 49 144 Q 44 178 42 208" fill="none" strokeLinecap="round" strokeWidth="20" stroke="#1a2a2e"/>
      <path d="M 71 144 Q 76 178 78 208" fill="none" strokeLinecap="round" strokeWidth="20" stroke="#1a2a2e"/>
      <path d="M 42 208 Q 39 234 40 258" fill="none" strokeLinecap="round" strokeWidth="16" stroke="#1a2a2e"/>
      <path d="M 78 208 Q 81 234 80 258" fill="none" strokeLinecap="round" strokeWidth="16" stroke="#1a2a2e"/>
      {/* ── Torso ── */}
      <path d="M 30 46 Q 20 64 22 88 Q 22 118 36 134 L 84 134 Q 98 118 98 88 Q 100 64 90 46 Q 76 37 60 37 Q 44 37 30 46 Z" fill="#0f1618" stroke="#2a4045" strokeWidth="1.5"/>
      <path d="M 35 132 Q 28 150 32 160 L 88 160 Q 92 150 85 132 Z" fill="#0a1113" stroke="#25383c" strokeWidth="1"/>
      {/* ── Head ── */}
      <ellipse cx="60" cy="19" rx="13" ry="15" fill="#0d1417" stroke="#2a4045" strokeWidth="1.5"/>
      <rect x="55" y="32" width="10" height="13" rx="4" fill="#0f1618" stroke="#2a4045" strokeWidth="1"/>
      {/* ── Muscles ── */}
      {/* Left pectoral */}
      <path d="M 33 52 Q 23 58 22 70 Q 22 83 35 88 Q 48 92 58 85 Q 60 80 58 75 Q 50 63 42 55 Z" fill={f("Pecho")} {...MS}/>
      {/* Right pectoral */}
      <path d="M 87 52 Q 97 58 98 70 Q 98 83 85 88 Q 72 92 62 85 Q 60 80 62 75 Q 70 63 78 55 Z" fill={f("Pecho")} {...MS}/>
      {/* Left anterior delt */}
      <ellipse cx="25" cy="52" rx="11" ry="10" fill={f("Hombros")} {...MS}/>
      {/* Right anterior delt */}
      <ellipse cx="95" cy="52" rx="11" ry="10" fill={f("Hombros")} {...MS}/>
      {/* Left bicep */}
      <path d="M 15 66 Q 8 78 9 91 Q 10 98 15 100 Q 22 97 25 88 Q 28 76 23 65 Z" fill={f("Brazos")} {...MS}/>
      {/* Right bicep */}
      <path d="M 105 66 Q 112 78 111 91 Q 110 98 105 100 Q 98 97 95 88 Q 92 76 97 65 Z" fill={f("Brazos")} {...MS}/>
      {/* Left forearm */}
      <path d="M 13 102 Q 7 118 9 133 Q 10 138 14 139 Q 19 137 22 130 Q 26 116 22 101 Z" fill={f("Brazos")} {...MS_THIN}/>
      {/* Right forearm */}
      <path d="M 107 102 Q 113 118 111 133 Q 110 138 106 139 Q 101 137 98 130 Q 94 116 98 101 Z" fill={f("Brazos")} {...MS_THIN}/>
      {/* Rectus abdominis – 3 pairs */}
      <ellipse cx="53" cy="100" rx="7" ry="6.5" fill={f("Core")} {...MS_THIN}/>
      <ellipse cx="67" cy="100" rx="7" ry="6.5" fill={f("Core")} {...MS_THIN}/>
      <ellipse cx="53" cy="113" rx="7" ry="6" fill={f("Core")} {...MS_THIN}/>
      <ellipse cx="67" cy="113" rx="7" ry="6" fill={f("Core")} {...MS_THIN}/>
      <ellipse cx="54" cy="125" rx="6" ry="5.5" fill={f("Core")} {...MS_THIN}/>
      <ellipse cx="66" cy="125" rx="6" ry="5.5" fill={f("Core")} {...MS_THIN}/>
      {/* Left oblique */}
      <path d="M 30 90 Q 25 103 26 116 Q 30 126 41 129 Q 47 122 47 112 Q 47 99 42 89 Z" fill={f("Core")} {...MS_THIN}/>
      {/* Right oblique */}
      <path d="M 90 90 Q 95 103 94 116 Q 90 126 79 129 Q 73 122 73 112 Q 73 99 78 89 Z" fill={f("Core")} {...MS_THIN}/>
      {/* Left quad (vastus lateralis + rectus) */}
      <path d="M 33 160 Q 28 184 30 207 Q 32 215 40 217 Q 50 216 54 210 Q 58 200 57 180 Q 56 158 48 152 Z" fill={f("Piernas")} {...MS}/>
      {/* Right quad */}
      <path d="M 87 160 Q 92 184 90 207 Q 88 215 80 217 Q 70 216 66 210 Q 62 200 63 180 Q 64 158 72 152 Z" fill={f("Piernas")} {...MS}/>
      {/* Left VMO (inner quad teardrop) */}
      <ellipse cx="46" cy="210" rx="8" ry="6" transform="rotate(-15 46 210)" fill={f("Piernas")} {...MS_THIN}/>
      {/* Right VMO */}
      <ellipse cx="74" cy="210" rx="8" ry="6" transform="rotate(15 74 210)" fill={f("Piernas")} {...MS_THIN}/>
      {/* Left tibialis anterior */}
      <path d="M 37 218 Q 33 236 35 254 Q 37 260 41 260 Q 45 258 47 248 Q 50 233 47 217 Z" fill={f("Piernas")} {...MS_THIN} opacity="0.7"/>
      {/* Right tibialis anterior */}
      <path d="M 83 218 Q 87 236 85 254 Q 83 260 79 260 Q 75 258 73 248 Q 70 233 73 217 Z" fill={f("Piernas")} {...MS_THIN} opacity="0.7"/>
      {/* Linea alba + horizontal divisions */}
      <line x1="60" y1="92" x2="60" y2="134" stroke="rgba(10,20,22,.45)" strokeWidth="0.6"/>
      <line x1="44" y1="106" x2="76" y2="106" stroke="rgba(10,20,22,.35)" strokeWidth="0.5"/>
      <line x1="44" y1="119" x2="76" y2="119" stroke="rgba(10,20,22,.35)" strokeWidth="0.5"/>
    </svg>
  );
}

function BackFigure({ I }) {
  const f = (g) => mFill(I, g);
  return (
    <svg viewBox="0 0 120 280" style={{ width: "100%", display: "block" }}>
      {/* ── Limbs ── */}
      <path d="M 28 48 Q 15 70 12 94" fill="none" strokeLinecap="round" strokeWidth="18" stroke="#1a2a2e"/>
      <path d="M 92 48 Q 105 70 108 94" fill="none" strokeLinecap="round" strokeWidth="18" stroke="#1a2a2e"/>
      <path d="M 12 94 Q 9 116 11 136" fill="none" strokeLinecap="round" strokeWidth="14" stroke="#1a2a2e"/>
      <path d="M 108 94 Q 111 116 109 136" fill="none" strokeLinecap="round" strokeWidth="14" stroke="#1a2a2e"/>
      <path d="M 49 148 Q 44 182 42 210" fill="none" strokeLinecap="round" strokeWidth="20" stroke="#1a2a2e"/>
      <path d="M 71 148 Q 76 182 78 210" fill="none" strokeLinecap="round" strokeWidth="20" stroke="#1a2a2e"/>
      <path d="M 42 210 Q 39 235 40 258" fill="none" strokeLinecap="round" strokeWidth="16" stroke="#1a2a2e"/>
      <path d="M 78 210 Q 81 235 80 258" fill="none" strokeLinecap="round" strokeWidth="16" stroke="#1a2a2e"/>
      {/* ── Torso ── */}
      <path d="M 30 46 Q 20 64 22 88 Q 22 118 36 134 L 84 134 Q 98 118 98 88 Q 100 64 90 46 Q 76 37 60 37 Q 44 37 30 46 Z" fill="#0f1618" stroke="#2a4045" strokeWidth="1.5"/>
      <path d="M 34 132 Q 24 155 28 174 L 92 174 Q 96 155 86 132 Z" fill="#0a1113" stroke="#25383c" strokeWidth="1"/>
      {/* ── Head ── */}
      <ellipse cx="60" cy="19" rx="13" ry="15" fill="#0d1417" stroke="#2a4045" strokeWidth="1.5"/>
      <rect x="55" y="32" width="10" height="13" rx="4" fill="#0f1618" stroke="#2a4045" strokeWidth="1"/>
      {/* ── Muscles ── */}
      {/* Trapezius (upper + mid) */}
      <path d="M 60 32 Q 77 37 92 46 Q 100 58 98 74 Q 84 82 60 84 Q 36 82 22 74 Q 20 58 28 46 Q 43 37 60 32 Z" fill={f("Espalda")} {...MS}/>
      {/* Left rear deltoid */}
      <ellipse cx="25" cy="54" rx="11" ry="10" fill={f("Hombros")} {...MS}/>
      {/* Right rear deltoid */}
      <ellipse cx="95" cy="54" rx="11" ry="10" fill={f("Hombros")} {...MS}/>
      {/* Left latissimus dorsi */}
      <path d="M 28 62 Q 21 83 23 108 Q 25 122 34 129 Q 44 122 48 108 Q 52 90 47 70 Q 40 61 33 59 Z" fill={f("Espalda")} {...MS}/>
      {/* Right latissimus dorsi */}
      <path d="M 92 62 Q 99 83 97 108 Q 95 122 86 129 Q 76 122 72 108 Q 68 90 73 70 Q 80 61 87 59 Z" fill={f("Espalda")} {...MS}/>
      {/* Rhomboids / mid-traps */}
      <path d="M 60 57 Q 71 64 77 76 Q 73 87 60 89 Q 47 87 43 76 Q 49 64 60 57 Z" fill={f("Espalda")} {...MS_THIN}/>
      {/* Left erector spinae */}
      <rect x="51" y="90" width="8" height="40" rx="4" fill={f("Espalda")} {...MS_THIN}/>
      {/* Right erector spinae */}
      <rect x="61" y="90" width="8" height="40" rx="4" fill={f("Espalda")} {...MS_THIN}/>
      {/* Left tricep */}
      <path d="M 14 65 Q 7 78 8 91 Q 9 98 14 100 Q 20 97 23 87 Q 26 74 22 63 Z" fill={f("Brazos")} {...MS}/>
      {/* Right tricep */}
      <path d="M 106 65 Q 113 78 112 91 Q 111 98 106 100 Q 100 97 97 87 Q 94 74 98 63 Z" fill={f("Brazos")} {...MS}/>
      {/* Left forearm back */}
      <path d="M 13 102 Q 7 118 9 133 Q 10 138 14 139 Q 19 137 22 130 Q 26 116 22 101 Z" fill={f("Brazos")} {...MS_THIN}/>
      {/* Right forearm back */}
      <path d="M 107 102 Q 113 118 111 133 Q 110 138 106 139 Q 101 137 98 130 Q 94 116 98 101 Z" fill={f("Brazos")} {...MS_THIN}/>
      {/* Left gluteus maximus */}
      <path d="M 33 136 Q 24 156 26 170 Q 29 181 42 184 Q 55 186 60 176 Q 62 164 60 148 Q 57 134 48 131 Z" fill={f("Glúteos")} {...MS}/>
      {/* Right gluteus maximus */}
      <path d="M 87 136 Q 96 156 94 170 Q 91 181 78 184 Q 65 186 60 176 Q 58 164 60 148 Q 63 134 72 131 Z" fill={f("Glúteos")} {...MS}/>
      {/* Left hamstring */}
      <path d="M 32 186 Q 26 208 28 230 Q 30 240 37 242 Q 45 240 49 230 Q 53 210 51 188 Q 47 182 39 182 Z" fill={f("Piernas")} {...MS}/>
      {/* Right hamstring */}
      <path d="M 88 186 Q 94 208 92 230 Q 90 240 83 242 Q 75 240 71 230 Q 67 210 69 188 Q 73 182 81 182 Z" fill={f("Piernas")} {...MS}/>
      {/* Left gastrocnemius */}
      <path d="M 33 244 Q 28 258 32 268 Q 36 274 40 272 Q 47 266 49 252 Q 51 241 47 237 Z" fill={f("Gemelos")} {...MS}/>
      <path d="M 44 245 Q 46 259 44 268 Q 42 272 40 273 Q 38 268 36 258 Q 34 248 36 242 Z" fill={f("Gemelos")} {...MS_THIN}/>
      {/* Right gastrocnemius */}
      <path d="M 87 244 Q 92 258 88 268 Q 84 274 80 272 Q 73 266 71 252 Q 69 241 73 237 Z" fill={f("Gemelos")} {...MS}/>
      <path d="M 76 245 Q 74 259 76 268 Q 78 272 80 273 Q 82 268 84 258 Q 86 248 84 242 Z" fill={f("Gemelos")} {...MS_THIN}/>
      {/* Spine guide */}
      <line x1="60" y1="40" x2="60" y2="134" stroke="rgba(10,20,22,.5)" strokeWidth="0.8" strokeDasharray="3 3"/>
    </svg>
  );
}
function MuscleMap({ intensity }) {
  return (
    <div className="advanced-map">
      <div className="map-title"><span>MAPA MUSCULAR</span><small>Esta semana</small></div>
      <div className="figures">
        <div className="figure"><h3>Frontal</h3><FrontFigure I={intensity} /></div>
        <div className="figure"><h3>Posterior</h3><BackFigure I={intensity} /></div>
      </div>
      <div className="legend">
        <span>menos</span>
        <i style={{ background: LEVEL_FILL[1] }} />
        <i style={{ background: LEVEL_FILL[2] }} />
        <i style={{ background: LEVEL_FILL[3] }} />
        <i style={{ background: LEVEL_FILL[4] }} />
        <span>más</span>
      </div>
    </div>
  );
}

// ── Radar chart ───────────────────────────────────────────────
function Radar({ data }) {
  const cx = 110, cy = 100, R = 78, n = data.length;
  const pt = (i, r) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const rings = [0.25, 0.5, 0.75, 1];
  const poly = data.map((d, i) => pt(i, R * (d.v / 100)).join(",")).join(" ");
  return (
    <div className="radar-card">
      <div className="card-head-row"><h2 style={{ fontSize: 14 }}>Radar por grupos</h2></div>
      <svg viewBox="0 0 220 200" style={{ width: "100%" }}>
        {rings.map((r, ri) => (
          <polygon key={ri} points={data.map((_, i) => pt(i, R * r).join(",")).join(" ")} fill="none" stroke="#244044" strokeWidth="1" />
        ))}
        {data.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#244044" strokeWidth="1" />; })}
        <polygon points={poly} fill="rgba(109,242,164,.15)" stroke="#6df2a4" strokeWidth="2.5" />
        {data.map((d, i) => { const [x, y] = pt(i, R * (d.v / 100)); return <circle key={i} cx={x} cy={y} r="3" fill="#eafff2" />; })}
        {data.map((d, i) => {
          const [x, y] = pt(i, R + 16);
          return <text key={i} x={x} y={y} fill="#eafff2" fontSize="10" fontWeight="800" textAnchor="middle" dominantBaseline="middle">{d.axis}</text>;
        })}
      </svg>
    </div>
  );
}

Object.assign(window, { BottomNav, ScoreBadge, Sparkline, MuscleMap, Radar, scoreColor, NAV });
