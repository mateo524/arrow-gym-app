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

function muscleLevel(intensity, muscle) {
  if (["Deltoide anterior", "Deltoide lateral", "Deltoide posterior", "Trapecio superior"].includes(muscle)) {
    return intensity[muscle]?.level || intensity.Hombros?.level || 0;
  }
  return intensity[muscle]?.level || 0;
}

function muscleCount(intensity, muscle) {
  return intensity[muscle]?.count || 0;
}

function Figure({ title, side, shapes, intensity }) {
  return (
    <div className="figure pro-figure">
      <div className="figure-label">{title}</div>
      <svg viewBox="0 0 272 520" className="muscle-svg pro-muscle-svg" role="img" aria-label={`Mapa muscular ${side}`}>
        <defs>
          <radialGradient id={`glow-${side}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#233237" />
            <stop offset="100%" stopColor="#090d10" />
          </radialGradient>
        </defs>
        <ellipse cx="136" cy="262" rx="105" ry="235" fill={`url(#glow-${side})`} opacity="0.22" />
        <circle cx="136" cy="34" r="24" className="skeleton head" />
        <path d="M94 68 C111 54 161 54 178 68 L205 246 C184 260 88 260 67 246Z" className="skeleton torso" />
        <path d="M57 86 C30 111 24 246 47 310" className="skeleton limb" />
        <path d="M215 86 C242 111 248 246 225 310" className="skeleton limb" />
        <path d="M91 250 C76 315 78 430 107 492" className="skeleton limb" />
        <path d="M181 250 C196 315 194 430 165 492" className="skeleton limb" />
        <line x1="136" y1="64" x2="136" y2="490" className="center-line" />
        {shapes.map(([muscle, d, label], index) => (
          <g key={`${muscle}-${index}`}>
            <path d={d} className={`muscle level-${muscleLevel(intensity, muscle)}`}>
              <title>{muscle}: {muscleCount(intensity, muscle)} series</title>
            </path>
            <text className="muscle-code" x={index % 2 === 0 ? 104 : 168} y={40 + index * 20 % 430}>{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AdvancedMuscleDiagram({ intensity }) {
  return (
    <div className="advanced-map premium-map">
      <div className="map-title">
        <span>ADVANCED MUSCLE DIAGRAM</span>
        <small>ARROW GYM FEATURE · semana actual · reset lunes</small>
      </div>
      <div className="figures">
        <Figure title="Vista frontal" side="front" shapes={FRONT} intensity={intensity} />
        <Figure title="Vista posterior" side="back" shapes={BACK} intensity={intensity} />
      </div>
      <div className="legend">
        <span>Sin estímulo</span>
        <i className="level-1" />
        <i className="level-2" />
        <i className="level-3" />
        <i className="level-4" />
        <span>Más estímulo</span>
      </div>
    </div>
  );
}
