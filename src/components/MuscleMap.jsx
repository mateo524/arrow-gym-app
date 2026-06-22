import { useMemo } from "react";

const MUSCLE_IDS = {
  "Pectoral mayor":       ["chest-l","chest-r"],
  "Pectoral superior":    ["chest-upper-l","chest-upper-r"],
  "Pectoral inferior":    ["chest-lower-l","chest-lower-r"],
  "Serrato anterior":     ["serratus-l","serratus-r"],
  "Dorsales":             ["lat-l","lat-r"],
  "Romboides":            ["rhomboid-l","rhomboid-r"],
  "Trapecio medio":       ["trap-mid-l","trap-mid-r"],
  "Trapecio superior":    ["trap-l","trap-r"],
  "Trapecio inferior":    ["trap-low-l","trap-low-r"],
  "Erectores espinales":  ["erector-l","erector-r"],
  "Redondo mayor":        ["teres-l","teres-r"],
  "Deltoide anterior":    ["delt-ant-l","delt-ant-r"],
  "Deltoide lateral":     ["delt-lat-l","delt-lat-r"],
  "Deltoide posterior":   ["delt-post-l","delt-post-r"],
  "Manguito rotador":     ["infra-l","infra-r","teres-l","teres-r"],
  "Bíceps":               ["bicep-l","bicep-r"],
  "Tríceps":              ["tricep-l","tricep-r"],
  "Braquial":             ["brachialis-l","brachialis-r"],
  "Braquiorradial":       ["forearm-l","forearm-r"],
  "Antebrazo":            ["forearm-l","forearm-r"],
  "Recto abdominal":      ["abs-1","abs-2","abs-3","abs-4","abs-5","abs-6"],
  "Oblicuos":             ["oblique-l","oblique-r"],
  "Transverso abdominal": ["abs-3","abs-4","abs-5","abs-6"],
  "Lumbar":               ["erector-l","erector-r"],
  "Flexores de cadera":   ["hip-l","hip-r"],
  "Cuádriceps":           ["rf-l","rf-r","vl-l","vl-r","vm-l","vm-r","vi-l","vi-r"],
  "Isquios":              ["hamstring-l","hamstring-r","biceps-fem-l","biceps-fem-r"],
  "Glúteos":              ["glute-l","glute-r","glute-med-l","glute-med-r"],
  "Aductores":            ["adductor-l","adductor-r"],
  "Abductores":           ["abductor-l","abductor-r","glute-med-l","glute-med-r"],
  "Gemelos":              ["calf-l","calf-r"],
  "Sóleo":                ["soleus-l","soleus-r"],
};

const GROUP_FALLBACK = {
  Pecho:   ["Pectoral mayor","Serrato anterior"],
  Espalda: ["Dorsales","Trapecio medio","Romboides"],
  Hombros: ["Deltoide anterior","Deltoide lateral","Deltoide posterior"],
  Brazos:  ["Bíceps","Tríceps","Antebrazo"],
  Piernas: ["Cuádriceps","Isquios","Glúteos","Gemelos"],
  Core:    ["Recto abdominal","Oblicuos"],
};

function resolveIds(muscles = [], groups = []) {
  const ids = new Set();
  muscles.forEach(m => (MUSCLE_IDS[m] || []).forEach(id => ids.add(id)));
  groups.forEach(g => (GROUP_FALLBACK[g] || []).forEach(m => (MUSCLE_IDS[m] || []).forEach(id => ids.add(id))));
  return ids;
}

/* ── Colors ─────────────────────────────────────────────────────── */
const BG      = "#0c1a26";
const SKIN    = "#0e1f2e";
const IDLE    = "#172d42";
const IDLE_S  = "#1f3d54";
const BORDER  = "#1a2e40";

/* ── Body silhouettes ────────────────────────────────────────────── */
const FRONT_BODY = `
  M50,2 C44,2 37,7 37,14 C37,21 43,27 50,27 C57,27 63,21 63,14 C63,7 56,2 50,2 Z
  M44,27 Q40,28 37,32 Q31,36 22,43
  Q13,50 10,62 L9,78
  Q8,92 9,108 L11,132
  Q12,140 14,146 L15,154
  Q18,153 21,151 Q24,149 26,145
  Q29,140 31,135 Q34,130 36,126
  L38,118 Q40,114 42,112 L42,90
  Q43,87 47,87 L53,87
  Q57,87 58,90 L58,112
  Q60,114 62,118 L64,126
  Q66,130 69,135 Q71,140 74,145
  Q76,149 79,151 Q82,153 85,154
  L86,146 Q88,140 89,132 L91,108
  Q92,92 91,78 L90,62
  Q87,50 78,43 Q69,36 63,32 Q60,28 56,27 Z
`;

const BACK_BODY = `
  M50,2 C44,2 37,7 37,14 C37,21 43,27 50,27 C57,27 63,21 63,14 C63,7 56,2 50,2 Z
  M44,27 Q40,28 37,32 Q29,36 20,43
  Q11,50 9,62 L8,78
  Q7,92 9,108 L11,132
  Q12,140 14,146 L15,154
  Q18,153 21,151 Q24,149 26,145
  Q29,140 31,134 Q33,128 35,124
  L37,116 Q39,112 42,110 L44,90
  Q46,88 50,88 Q54,88 56,90 L58,110
  Q61,112 63,116 L65,124
  Q67,128 69,134 Q71,140 74,145
  Q76,149 79,151 Q82,153 85,154
  L86,146 Q88,140 89,132 L91,108
  Q93,92 92,78 L91,62
  Q89,50 80,43 Q71,36 63,32 Q60,28 56,27 Z
`;

/* ── Front muscles ───────────────────────────────────────────────── */
const FRONT_MUSCLES = [
  // Deltoid anterior
  { id:"delt-ant-l", el:<path d="M13,48 Q7,58 8,72 Q10,80 19,80 Q25,74 24,60 Q22,50 16,47 Z" /> },
  { id:"delt-ant-r", el:<path d="M87,48 Q93,58 92,72 Q90,80 81,80 Q75,74 76,60 Q78,50 84,47 Z" /> },
  // Deltoid lateral (outer cap)
  { id:"delt-lat-l", el:<path d="M9,66 Q7,74 9,80 Q13,84 17,82 Q18,76 17,68 Z" /> },
  { id:"delt-lat-r", el:<path d="M91,66 Q93,74 91,80 Q87,84 83,82 Q82,76 83,68 Z" /> },

  // Pectoral mayor — fan from sternum out to shoulder
  { id:"chest-l", el:<path d="M50,54 Q36,50 24,58 Q15,66 16,78 Q18,88 30,92 Q42,96 50,88 Z" /> },
  { id:"chest-r", el:<path d="M50,54 Q64,50 76,58 Q85,66 84,78 Q82,88 70,92 Q58,96 50,88 Z" /> },
  { id:"chest-upper-l", el:<path d="M50,54 Q36,50 24,58 Q18,62 18,68 Q34,60 50,62 Z" /> },
  { id:"chest-upper-r", el:<path d="M50,54 Q64,50 76,58 Q82,62 82,68 Q66,60 50,62 Z" /> },
  { id:"chest-lower-l", el:<path d="M18,72 Q16,82 20,90 Q32,96 50,88 Q40,86 26,82 Q20,78 18,72 Z" /> },
  { id:"chest-lower-r", el:<path d="M82,72 Q84,82 80,90 Q68,96 50,88 Q60,86 74,82 Q80,78 82,72 Z" /> },

  // Serrato anterior — diagonal finger serrations
  { id:"serratus-l", el:<>
    <path d="M22,88 Q16,93 17,99 Q21,102 26,99 Q28,93 22,88 Z" />
    <path d="M20,99 Q14,105 15,111 Q19,114 24,111 Q26,105 20,99 Z" />
    <path d="M19,111 Q13,117 14,123 Q18,126 23,123 Q25,116 19,111 Z" />
  </> },
  { id:"serratus-r", el:<>
    <path d="M78,88 Q84,93 83,99 Q79,102 74,99 Q72,93 78,88 Z" />
    <path d="M80,99 Q86,105 85,111 Q81,114 76,111 Q74,105 80,99 Z" />
    <path d="M81,111 Q87,117 86,123 Q82,126 77,123 Q75,116 81,111 Z" />
  </> },

  // Bíceps — long + short head visible
  { id:"bicep-l", el:<path d="M12,72 Q7,84 7,100 Q8,110 15,112 Q21,110 23,96 Q25,82 21,72 Z" /> },
  { id:"bicep-r", el:<path d="M88,72 Q93,84 93,100 Q92,110 85,112 Q79,110 77,96 Q75,82 79,72 Z" /> },
  // Brachialis (under bicep outer)
  { id:"brachialis-l", el:<path d="M10,96 Q7,108 9,118 Q13,122 17,120 Q19,110 18,100 Z" /> },
  { id:"brachialis-r", el:<path d="M90,96 Q93,108 91,118 Q87,122 83,120 Q81,110 82,100 Z" /> },

  // Forearm
  { id:"forearm-l", el:<path d="M11,112 Q8,124 9,136 Q13,144 18,142 Q22,132 22,118 Q21,112 16,110 Z" /> },
  { id:"forearm-r", el:<path d="M89,112 Q92,124 91,136 Q87,144 82,142 Q78,132 78,118 Q79,112 84,110 Z" /> },

  // Abdominales — 6-pack con forma más redondeada
  { id:"abs-1", el:<path d="M43,90 Q42,95 43,99 Q46,101 50,101 Q50,97 50,90 Z" /> },
  { id:"abs-2", el:<path d="M57,90 Q58,95 57,99 Q54,101 50,101 Q50,97 50,90 Z" /> },
  { id:"abs-3", el:<path d="M42,103 Q41,108 42,113 Q45,115 50,115 Q50,111 50,103 Z" /> },
  { id:"abs-4", el:<path d="M58,103 Q59,108 58,113 Q55,115 50,115 Q50,111 50,103 Z" /> },
  { id:"abs-5", el:<path d="M43,117 Q42,122 43,126 Q46,128 50,128 Q50,124 50,117 Z" /> },
  { id:"abs-6", el:<path d="M57,117 Q58,122 57,126 Q54,128 50,128 Q50,124 50,117 Z" /> },

  // Oblicuos — de costillas hacia cadera
  { id:"oblique-l", el:<path d="M28,90 Q21,104 22,122 Q25,130 36,130 Q41,122 41,110 Q40,96 33,88 Z" /> },
  { id:"oblique-r", el:<path d="M72,90 Q79,104 78,122 Q75,130 64,130 Q59,122 59,110 Q60,96 67,88 Z" /> },

  // Hip flexors (iliopsoas)
  { id:"hip-l", el:<path d="M34,128 Q28,134 30,142 Q36,146 44,142 Q46,136 44,128 Z" /> },
  { id:"hip-r", el:<path d="M66,128 Q72,134 70,142 Q64,146 56,142 Q54,136 56,128 Z" /> },

  // Cuádriceps — rectus femoris (center-front)
  { id:"rf-l",  el:<path d="M38,144 Q32,162 33,186 Q37,196 44,196 Q48,190 48,172 Q49,154 44,143 Z" /> },
  { id:"rf-r",  el:<path d="M62,144 Q68,162 67,186 Q63,196 56,196 Q52,190 52,172 Q51,154 56,143 Z" /> },
  // Vastus lateralis (outer quad)
  { id:"vl-l",  el:<path d="M28,148 Q20,166 22,190 Q27,200 36,198 Q42,188 41,166 Q40,152 32,146 Z" /> },
  { id:"vl-r",  el:<path d="M72,148 Q80,166 78,190 Q73,200 64,198 Q58,188 59,166 Q60,152 68,146 Z" /> },
  // Vastus medialis (tear-drop inner)
  { id:"vm-l",  el:<path d="M38,180 Q34,192 36,202 Q42,208 48,204 Q50,196 48,180 Z" /> },
  { id:"vm-r",  el:<path d="M62,180 Q66,192 64,202 Q58,208 52,204 Q50,196 52,180 Z" /> },
  // Vastus intermedius (between rf and vl, mostly hidden but outline)
  { id:"vi-l",  el:<path d="M30,152 Q26,168 28,186 Q33,194 38,192 Q42,184 41,164 Q40,154 34,150 Z" /> },
  { id:"vi-r",  el:<path d="M70,152 Q74,168 72,186 Q67,194 62,192 Q58,184 59,164 Q60,154 66,150 Z" /> },

  // Aductores
  { id:"adductor-l", el:<path d="M44,146 Q40,166 42,186 Q46,192 50,190 L50,146 Z" /> },
  { id:"adductor-r", el:<path d="M56,146 Q60,166 58,186 Q54,192 50,190 L50,146 Z" /> },

  // Abductores (TFL + glute med visible from front outer hip)
  { id:"abductor-l", el:<path d="M22,148 Q16,162 18,178 Q22,184 28,180 Q30,168 28,152 Z" /> },
  { id:"abductor-r", el:<path d="M78,148 Q84,162 82,178 Q78,184 72,180 Q70,168 72,152 Z" /> },

  // Gemelos — medial head more visible from front
  { id:"calf-l", el:<path d="M26,204 Q20,218 21,234 Q26,244 34,242 Q40,234 39,218 Q38,207 31,202 Z" /> },
  { id:"calf-r", el:<path d="M74,204 Q80,218 79,234 Q74,244 66,242 Q60,234 61,218 Q62,207 69,202 Z" /> },
  { id:"soleus-l", el:<path d="M28,238 Q26,244 28,250 Q32,252 36,250 Q38,244 36,238 Z" /> },
  { id:"soleus-r", el:<path d="M72,238 Q74,244 72,250 Q68,252 64,250 Q62,244 64,238 Z" /> },
];

/* ── Back muscles ────────────────────────────────────────────────── */
const BACK_MUSCLES = [
  // Deltoid posterior
  { id:"delt-post-l", el:<path d="M13,48 Q7,58 8,72 Q10,80 19,80 Q25,74 24,60 Q22,50 16,47 Z" /> },
  { id:"delt-post-r", el:<path d="M87,48 Q93,58 92,72 Q90,80 81,80 Q75,74 76,60 Q78,50 84,47 Z" /> },
  { id:"delt-lat-l",  el:<path d="M9,66 Q7,74 9,80 Q13,84 17,82 Q18,76 17,68 Z" /> },
  { id:"delt-lat-r",  el:<path d="M91,66 Q93,74 91,80 Q87,84 83,82 Q82,76 83,68 Z" /> },

  // Trapezius — large diamond
  // Upper trap (neck to shoulder)
  { id:"trap-l",     el:<path d="M50,30 Q42,34 30,42 Q22,48 20,56 Q28,60 38,58 Q45,52 50,42 Z" /> },
  { id:"trap-r",     el:<path d="M50,30 Q58,34 70,42 Q78,48 80,56 Q72,60 62,58 Q55,52 50,42 Z" /> },
  // Middle trap (horizontal fibers to scapular spine)
  { id:"trap-mid-l", el:<path d="M22,56 Q16,64 18,76 Q24,84 38,80 Q44,72 42,62 Q32,58 22,56 Z" /> },
  { id:"trap-mid-r", el:<path d="M78,56 Q84,64 82,76 Q76,84 62,80 Q56,72 58,62 Q68,58 78,56 Z" /> },
  // Lower trap (descending to T12)
  { id:"trap-low-l", el:<path d="M40,78 Q36,92 37,106 Q43,110 50,108 L50,78 Z" /> },
  { id:"trap-low-r", el:<path d="M60,78 Q64,92 63,106 Q57,110 50,108 L50,78 Z" /> },

  // Rhomboids (under trap, between spine and medial scapula border)
  { id:"rhomboid-l", el:<path d="M42,60 Q38,72 40,84 Q46,88 50,86 L50,60 Z" /> },
  { id:"rhomboid-r", el:<path d="M58,60 Q62,72 60,84 Q54,88 50,86 L50,60 Z" /> },

  // Infraspinatus (below scapular spine, fills most of scapula)
  { id:"infra-l", el:<path d="M24,64 Q18,72 20,84 Q24,92 34,90 Q40,84 38,72 Q32,64 24,64 Z" /> },
  { id:"infra-r", el:<path d="M76,64 Q82,72 80,84 Q76,92 66,90 Q60,84 62,72 Q68,64 76,64 Z" /> },

  // Teres major/minor (from lateral scapula to humerus)
  { id:"teres-l", el:<path d="M18,80 Q13,90 15,100 Q20,106 28,102 Q32,94 28,84 Z" /> },
  { id:"teres-r", el:<path d="M82,80 Q87,90 85,100 Q80,106 72,102 Q68,94 72,84 Z" /> },

  // Dorsales — grande ala desde axila hasta cresta iliaca
  { id:"lat-l", el:<path d="M20,66 Q10,84 10,108 Q11,120 18,128 Q28,134 40,128 Q46,118 45,100 Q44,82 30,68 Z" /> },
  { id:"lat-r", el:<path d="M80,66 Q90,84 90,108 Q89,120 82,128 Q72,134 60,128 Q54,118 55,100 Q56,82 70,68 Z" /> },

  // Erectors — parallel columns along spine
  { id:"erector-l", el:<path d="M44,92 C43,108 43,122 44,134 Q46,138 48,136 C49,122 49,108 48,92 Z" /> },
  { id:"erector-r", el:<path d="M56,92 C57,108 57,122 56,134 Q54,138 52,136 C51,122 51,108 52,92 Z" /> },

  // Tríceps (all 3 heads visible from back)
  { id:"tricep-l", el:<path d="M10,68 Q6,82 7,98 Q10,108 17,106 Q22,94 21,76 Q19,66 13,66 Z" /> },
  { id:"tricep-r", el:<path d="M90,68 Q94,82 93,98 Q90,108 83,106 Q78,94 79,76 Q81,66 87,66 Z" /> },

  // Forearm (posterior compartment from back)
  { id:"forearm-l", el:<path d="M9,108 Q7,120 8,134 Q12,142 18,140 Q22,128 21,114 Z" /> },
  { id:"forearm-r", el:<path d="M91,108 Q93,120 92,134 Q88,142 82,140 Q78,128 79,114 Z" /> },

  // Glúteo mayor (large, rounded)
  { id:"glute-l", el:<path d="M25,136 Q14,154 16,174 Q20,186 40,186 Q50,180 50,162 Q50,144 36,134 Z" /> },
  { id:"glute-r", el:<path d="M75,136 Q86,154 84,174 Q80,186 60,186 Q50,180 50,162 Q50,144 64,134 Z" /> },
  // Glúteo medio (upper/outer glute, above and lateral)
  { id:"glute-med-l", el:<path d="M18,122 Q12,132 14,146 Q20,152 30,148 Q36,140 32,128 Z" /> },
  { id:"glute-med-r", el:<path d="M82,122 Q88,132 86,146 Q80,152 70,148 Q64,140 68,128 Z" /> },

  // Isquiotibiales — bíceps femoral + semitendinosus
  { id:"hamstring-l",    el:<path d="M26,182 Q20,198 21,216 Q26,226 40,224 Q48,216 46,198 Q46,184 34,180 Z" /> },
  { id:"hamstring-r",    el:<path d="M74,182 Q80,198 79,216 Q74,226 60,224 Q52,216 54,198 Q54,184 66,180 Z" /> },
  { id:"biceps-fem-l",   el:<path d="M22,184 Q16,200 18,218 Q22,226 32,224 Q38,214 36,196 Q35,184 26,182 Z" /> },
  { id:"biceps-fem-r",   el:<path d="M78,184 Q84,200 82,218 Q78,226 68,224 Q62,214 64,196 Q65,184 74,182 Z" /> },

  // Aductores
  { id:"adductor-l", el:<path d="M44,150 Q40,168 42,188 Q47,194 50,192 L50,150 Z" /> },
  { id:"adductor-r", el:<path d="M56,150 Q60,168 58,188 Q53,194 50,192 L50,150 Z" /> },

  // Abductores (glute med from back)
  { id:"abductor-l", el:<path d="M18,122 Q12,132 14,146 Q20,152 30,148 Q36,140 32,128 Z" /> },
  { id:"abductor-r", el:<path d="M82,122 Q88,132 86,146 Q80,152 70,148 Q64,140 68,128 Z" /> },

  // Gemelos — lateral + medial heads clearly separated
  { id:"calf-l", el:<path d="M26,224 Q20,238 22,248 Q27,256 36,254 Q42,246 40,230 Z" /> },
  { id:"calf-r", el:<path d="M74,224 Q80,238 78,248 Q73,256 64,254 Q58,246 60,230 Z" /> },
  { id:"soleus-l", el:<path d="M28,248 Q26,254 28,258 Q32,260 36,258 Q38,252 36,248 Z" /> },
  { id:"soleus-r", el:<path d="M72,248 Q74,254 72,258 Q68,260 64,258 Q62,252 64,248 Z" /> },
];

/* ── Body definition lines (always visible, subtle anatomy cues) ── */
const FRONT_LINES = (
  <g stroke="#1a3345" strokeWidth="0.35" fill="none" opacity="0.7">
    {/* Linea alba (center ab line) */}
    <line x1="50" y1="88" x2="50" y2="130" />
    {/* Horizontal ab separations */}
    <path d="M43,100 Q50,101 57,100" />
    <path d="M42,113 Q50,114 58,113" />
    {/* Clavicles */}
    <path d="M50,48 Q40,46 28,50" />
    <path d="M50,48 Q60,46 72,50" />
    {/* Sternum */}
    <line x1="50" y1="50" x2="50" y2="88" />
    {/* Inguinal lines */}
    <path d="M44,128 Q38,136 36,142" />
    <path d="M56,128 Q62,136 64,142" />
    {/* Quad separation lines */}
    <path d="M38,156 Q42,170 40,188" />
    <path d="M62,156 Q58,170 60,188" />
  </g>
);

const BACK_LINES = (
  <g stroke="#1a3345" strokeWidth="0.35" fill="none" opacity="0.7">
    {/* Spine */}
    <line x1="50" y1="32" x2="50" y2="134" />
    {/* Scapula borders (left) */}
    <path d="M26,52 Q30,68 28,86 Q36,90 42,84" />
    {/* Scapula borders (right) */}
    <path d="M74,52 Q70,68 72,86 Q64,90 58,84" />
    {/* Scapula spine (left) */}
    <path d="M26,60 Q36,62 42,60" />
    {/* Scapula spine (right) */}
    <path d="M74,60 Q64,62 58,60" />
    {/* Glute crease */}
    <path d="M50,186 Q44,182 36,182" />
    <path d="M50,186 Q56,182 64,182" />
    {/* Ham separation */}
    <path d="M40,196 Q44,210 42,222" />
    <path d="M60,196 Q56,210 58,222" />
  </g>
);

/* ── Renderer ────────────────────────────────────────────────────── */
function BodySVG({ bodyPath, muscles, defLines, activeIds, color, uid }) {
  const clipId = `clip-${uid}`;
  const gId    = `grad-${uid}`;
  const g2Id   = `grad2-${uid}`;
  const glowId = `glow-${uid}`;
  return (
    <svg viewBox="0 0 100 262" style={{ width:"100%", height:"100%", display:"block" }} aria-hidden="true">
      <defs>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        <radialGradient id={gId} cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id={g2Id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Body base */}
      <path d={bodyPath} fill={SKIN} />

      {/* Subtle inner shading */}
      <path d={bodyPath} fill="url(#bodyShade)" clipPath={`url(#${clipId})`} />

      {/* Muscles clipped to body */}
      <g clipPath={`url(#${clipId})`}>
        {muscles.map(({ id, el }) => {
          const active = activeIds.has(id);
          return (
            <g key={id}
              fill={active ? `url(#${gId})` : IDLE}
              stroke={active ? color : IDLE_S}
              strokeWidth={active ? "0.5" : "0.25"}
              filter={active ? `url(#${glowId})` : undefined}
              style={{ transition:"fill 0.35s ease, stroke 0.35s ease, filter 0.35s ease" }}
            >
              {el}
            </g>
          );
        })}
        {/* Anatomy definition lines */}
        {defLines}
      </g>

      {/* Body outline */}
      <path d={bodyPath} fill="none" stroke={BORDER} strokeWidth="0.7" />
    </svg>
  );
}

export default function MuscleMap({ muscles = [], groups = [], color = "#a855f7", height = 190 }) {
  const activeIds = useMemo(() => resolveIds(muscles, groups), [muscles, groups]);
  const anyActive = activeIds.size > 0;

  return (
    <div style={{
      display: "flex",
      gap: 4,
      justifyContent: "center",
      alignItems: "flex-start",
      height,
      background: BG,
      borderRadius: 14,
      padding: "6px 4px",
      opacity: anyActive ? 1 : 0.6,
      transition: "opacity 0.3s",
    }}>
      <div style={{ flex:1, maxWidth:"47%", height:"100%" }}>
        <BodySVG bodyPath={FRONT_BODY} muscles={FRONT_MUSCLES} defLines={FRONT_LINES}
          activeIds={activeIds} color={color} uid="front" />
      </div>
      <div style={{ flex:1, maxWidth:"47%", height:"100%" }}>
        <BodySVG bodyPath={BACK_BODY} muscles={BACK_MUSCLES} defLines={BACK_LINES}
          activeIds={activeIds} color={color} uid="back" />
      </div>
    </div>
  );
}

