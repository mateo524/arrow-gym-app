import React, { useState } from "react";

const FRONT = [
  ["Deltoide anterior", "M57 92 C43 100 37 120 43 139 C50 154 67 149 74 131 C79 114 73 99 57 92Z", "DA"],
  ["Deltoide lateral", "M215 92 C229 100 235 120 229 139 C222 154 205 149 198 131 C193 114 199 99 215 92Z", "DL"],
  ["Pectoral superior", "M80 91 C98 78 124 79 135 96 C117 105 96 104 80 91Z", "PS"],
  ["Pectoral superior", "M137 96 C148 79 174 78 192 91 C176 104 155 105 137 96Z", "PS"],
  ["Pectoral mayor", "M77 101 C101 107 122 107 135 97 C133 122 116 137 86 130 C76 124 71 111 77 101Z", "P"],
  ["Pectoral mayor", "M137 97 C150 107 171 107 195 101 C201 111 196 124 186 130 C156 137 139 122 137 97Z", "P"],
  ["Bíceps", "M43 145 C30 169 31 204 45 227 C61 207 63 168 43 145Z", "BI"],
  ["Bíceps", "M229 145 C242 169 241 204 227 227 C211 207 209 168 229 145Z", "BI"],
  ["Antebrazo", "M43 230 C30 250 31 284 48 306 C60 280 58 252 43 230Z", "AN"],
  ["Antebrazo", "M229 230 C242 250 241 284 224 306 C212 280 214 252 229 230Z", "AN"],
  ["Recto abdominal", "M111 120 H161 C167 150 167 206 157 238 H115 C105 206 105 150 111 120Z", "ABS"],
  ["Oblicuos", "M82 126 C99 150 101 203 113 239 C91 229 76 178 82 126Z", "OB"],
  ["Oblicuos", "M190 126 C173 150 171 203 159 239 C181 229 196 178 190 126Z", "OB"],
  ["Cuádriceps", "M92 256 C78 293 82 354 105 389 C127 346 124 287 118 256Z", "Q"],
  ["Cuádriceps", "M154 256 C148 287 145 346 167 389 C190 354 194 293 180 256Z", "Q"],
  ["Aductores", "M120 258 C136 292 136 330 132 363 C116 330 111 292 120 258Z", "AD"],
  ["Aductores", "M152 258 C136 292 136 330 140 363 C156 330 161 292 152 258Z", "AD"],
  ["Gemelos", "M95 396 C82 429 88 463 108 486 C123 450 120 420 112 396Z", "G"],
  ["Gemelos", "M160 396 C152 420 149 450 164 486 C184 463 190 429 177 396Z", "G"],
];

const BACK = [
  ["Trapecio superior", "M94 76 C113 58 159 58 178 76 C159 94 113 94 94 76Z", "TR"],
  ["Deltoide posterior", "M57 92 C43 100 37 121 44 141 C51 155 68 149 75 130 C79 113 73 99 57 92Z", "DP"],
  ["Deltoide posterior", "M215 92 C229 100 235 121 228 141 C221 155 204 149 197 130 C193 113 199 99 215 92Z", "DP"],
  ["Trapecio medio", "M96 90 C118 104 154 104 176 90 L158 151 H114Z", "TM"],
  ["Romboides", "M112 101 H160 L151 137 H121Z", "R"],
  ["Dorsales", "M78 121 C101 144 110 193 113 238 C86 222 69 171 78 121Z", "D"],
  ["Dorsales", "M194 121 C171 144 162 193 159 238 C186 222 203 171 194 121Z", "D"],
  ["Tríceps", "M43 145 C30 169 31 204 45 227 C61 207 63 168 43 145Z", "TRI"],
  ["Tríceps", "M229 145 C242 169 241 204 227 227 C211 207 209 168 229 145Z", "TRI"],
  ["Lumbar", "M112 179 H160 C166 204 160 232 136 246 C112 232 106 204 112 179Z", "L"],
  ["Glúteos", "M88 243 C113 224 136 238 132 268 C108 281 90 270 88 243Z", "GL"],
  ["Glúteos", "M184 243 C159 224 136 238 140 268 C164 281 182 270 184 243Z", "GL"],
  ["Isquios", "M93 277 C79 314 82 357 105 389 C127 345 124 310 118 277Z", "IS"],
  ["Isquios", "M154 277 C148 310 145 345 167 389 C190 357 193 314 179 277Z", "IS"],
  ["Gemelos", "M95 396 C82 429 88 463 108 486 C123 450 120 420 112 396Z", "G"],
  ["Sóleo", "M160 396 C152 420 149 450 164 486 C184 463 190 429 177 396Z", "S"],
];

const LEVEL_FILL = [
  "rgba(255,255,255,0.04)",
  "rgba(34,211,120,0.25)",
  "rgba(34,211,120,0.5)",
  "rgba(34,211,120,0.75)",
  "rgba(34,211,120,0.95)",
];

const LEVEL_STROKE = [
  "rgba(255,255,255,0.08)",
  "rgba(34,211,120,0.45)",
  "rgba(34,211,120,0.7)",
  "rgba(34,211,120,0.9)",
  "rgba(34,211,120,1)",
];

const LEVEL_LABELS = ["Inactivo", "1–3 series", "3–6 series", "6–10 series", "10+ series"];
const LEVEL_PILL_BG = [
  "rgba(255,255,255,0.06)",
  "rgba(34,211,120,0.18)",
  "rgba(34,211,120,0.36)",
  "rgba(34,211,120,0.58)",
  "rgba(34,211,120,0.85)",
];
const LEVEL_PILL_COLOR = ["#888", "#22d378", "#22d378", "#fff", "#fff"];

function muscleLevel(intensity, muscle) {
  if (["Deltoide anterior", "Deltoide lateral", "Deltoide posterior", "Trapecio superior"].includes(muscle)) {
    return intensity[muscle]?.level || intensity.Hombros?.level || 0;
  }
  return intensity[muscle]?.level || 0;
}

function muscleCount(intensity, muscle) {
  return intensity[muscle]?.count || 0;
}

function BodySilhouette({ side }) {
  const bf = `url(#body-fill-${side})`;
  return (
    <g className="body-silhouette">
      {/* Head */}
      <circle cx="136" cy="34" r="26"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1.5"
      />
      {/* Neck */}
      <rect x="126" y="56" width="20" height="14" rx="4"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1"
      />
      {/* Torso */}
      <path d="M94 68 C111 54 161 54 178 68 L205 246 C184 260 88 260 67 246Z"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1.5"
      />
      {/* Left upper arm */}
      <path d="M74 82 C52 92 32 165 40 228 C52 215 62 180 68 140 C72 115 74 98 74 82Z"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1"
      />
      {/* Right upper arm */}
      <path d="M198 82 C220 92 240 165 232 228 C220 215 210 180 204 140 C200 115 198 98 198 82Z"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1"
      />
      {/* Left forearm */}
      <path d="M38 228 C28 252 30 292 50 312 C60 288 58 258 42 228Z"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1"
      />
      {/* Right forearm */}
      <path d="M234 228 C244 252 242 292 222 312 C214 288 214 258 230 228Z"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1"
      />
      {/* Left thigh */}
      <path d="M88 248 C74 288 78 360 106 394 C126 350 122 285 115 252Z"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1"
      />
      {/* Right thigh */}
      <path d="M184 248 C198 285 194 350 166 394 C156 360 152 288 157 248Z"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1"
      />
      {/* Left lower leg */}
      <path d="M98 396 C82 432 86 468 108 492 C124 454 122 424 114 396Z"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1"
      />
      {/* Right lower leg */}
      <path d="M158 396 C150 424 148 454 164 492 C186 468 190 432 174 396Z"
        fill={bf}
        stroke="#2a3a3f"
        strokeWidth="1"
      />
      {/* Joint circles */}
      {/* Shoulder joints */}
      <circle cx="74" cy="84" r="7" fill="#1e2e33" stroke="#2e4248" strokeWidth="1.5" />
      <circle cx="198" cy="84" r="7" fill="#1e2e33" stroke="#2e4248" strokeWidth="1.5" />
      {/* Elbow joints */}
      <circle cx="42" cy="228" r="6" fill="#1e2e33" stroke="#2e4248" strokeWidth="1.5" />
      <circle cx="230" cy="228" r="6" fill="#1e2e33" stroke="#2e4248" strokeWidth="1.5" />
      {/* Hip joints */}
      <circle cx="100" cy="252" r="7" fill="#1e2e33" stroke="#2e4248" strokeWidth="1.5" />
      <circle cx="172" cy="252" r="7" fill="#1e2e33" stroke="#2e4248" strokeWidth="1.5" />
      {/* Knee joints */}
      <circle cx="106" cy="394" r="8" fill="#1e2e33" stroke="#2e4248" strokeWidth="1.5" />
      <circle cx="166" cy="394" r="8" fill="#1e2e33" stroke="#2e4248" strokeWidth="1.5" />
    </g>
  );
}

function Figure({ title, side, shapes, intensity, onMuscleClick, activeMuscle, onHover }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: 6,
      }}>{title}</div>
      <svg
        viewBox="0 0 272 520"
        style={{ width: "100%", maxWidth: 160, display: "block" }}
        role="img"
        aria-label={`Mapa muscular ${side}`}
      >
        <defs>
          <linearGradient id={`body-fill-${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3038" />
            <stop offset="100%" stopColor="#111c22" />
          </linearGradient>
          <radialGradient id={`ambient-${side}`} cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1e3a44" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#090d10" stopOpacity="0" />
          </radialGradient>
          <filter id="muscle-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="muscle-glow-strong" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {shapes.map(([muscle, , ], index) => {
            const lv = muscleLevel(intensity, muscle);
            if (lv === 0) return null;
            return (
              <linearGradient key={`hl-${side}-${index}`} id={`highlight-${side}-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="60%" stopColor="rgba(255,255,255,0.03)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
              </linearGradient>
            );
          })}
        </defs>

        {/* Ambient background glow */}
        <ellipse cx="136" cy="262" rx="110" ry="240" fill={`url(#ambient-${side})`} />

        {/* Body silhouette */}
        <BodySilhouette side={side} />

        {/* Muscle paths */}
        {shapes.map(([muscle, d], index) => {
          const lv = muscleLevel(intensity, muscle);
          const count = muscleCount(intensity, muscle);
          const isActive = activeMuscle === muscle;
          const hasGlow = lv >= 1;
          const useStrongGlow = lv >= 3;

          return (
            <g
              key={`${muscle}-${index}`}
              style={{ cursor: "pointer" }}
              onClick={() => onMuscleClick?.(muscle)}
              onMouseEnter={() => onHover?.(muscle, count, lv)}
              onMouseLeave={() => onHover?.(null)}
              onKeyDown={(e) => e.key === "Enter" && onMuscleClick?.(muscle)}
              role="button"
              tabIndex={0}
              aria-label={`${muscle}: ${count} series`}
            >
              {/* Glow layer for active muscles */}
              {hasGlow && (
                <path
                  d={d}
                  fill={LEVEL_FILL[lv]}
                  filter={useStrongGlow ? "url(#muscle-glow-strong)" : "url(#muscle-glow)"}
                  style={{ pointerEvents: "none" }}
                />
              )}
              {/* Main muscle fill */}
              <path
                d={d}
                fill={LEVEL_FILL[lv]}
                stroke={isActive ? "rgba(34,211,120,1)" : LEVEL_STROKE[lv]}
                strokeWidth={isActive ? 1.5 : 0.8}
              >
                <title>{muscle}: {count} series esta semana</title>
              </path>
              {/* Highlight overlay for active muscles */}
              {lv > 0 && (
                <path
                  d={d}
                  fill={`url(#highlight-${side}-${index})`}
                  style={{ pointerEvents: "none" }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const AdvancedMuscleDiagram = React.forwardRef(function ({ intensity, onMuscleClick, activeMuscle }, ref) {
  const [hovered, setHovered] = useState(null); // { muscle, count, level }

  function handleHover(muscle, count, level) {
    if (muscle) setHovered({ muscle, count, level });
    else setHovered(null);
  }

  return (
    <div
      ref={ref}
      style={{
        background: "var(--panel)",
        borderRadius: 16,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", letterSpacing: "0.02em" }}>
          Mapa muscular semanal
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <Figure
          title="Vista frontal"
          side="front"
          shapes={FRONT}
          intensity={intensity}
          onMuscleClick={onMuscleClick}
          activeMuscle={activeMuscle}
          onHover={handleHover}
        />
        <Figure
          title="Vista posterior"
          side="back"
          shapes={BACK}
          intensity={intensity}
          onMuscleClick={onMuscleClick}
          activeMuscle={activeMuscle}
          onHover={handleHover}
        />
      </div>

      {/* Tooltip label */}
      <div style={{
        minHeight: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {hovered ? (
          <div style={{
            background: "rgba(34,211,120,0.12)",
            border: "1px solid rgba(34,211,120,0.3)",
            borderRadius: 8,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--green)",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}>
            <span>{hovered.muscle}</span>
            <span style={{ opacity: 0.7, fontWeight: 400 }}>·</span>
            <span style={{ opacity: 0.85 }}>{hovered.count} series</span>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: "var(--muted)", opacity: 0.6 }}>
            Pasa el cursor sobre un músculo
          </span>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {[1, 2, 3, 4].map((lv) => (
          <div key={lv} style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: LEVEL_PILL_BG[lv],
            borderRadius: 20,
            padding: "3px 10px",
            border: `1px solid ${LEVEL_STROKE[lv]}`,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: LEVEL_FILL[lv],
              border: `1px solid ${LEVEL_STROKE[lv]}`,
              display: "inline-block",
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: LEVEL_PILL_COLOR[lv],
            }}>{LEVEL_LABELS[lv]}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default AdvancedMuscleDiagram;
