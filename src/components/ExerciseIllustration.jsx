// Exercise illustrations — council-designed: color hierarchy + clipping fixes + render-adaptive
// viewBox 0 0 120 160 — all coords within x:6-114, y:6-154

const B  = "#7bacc4";   // active/moving body segments
const BD = "#3d6e84";   // static/passive body segments
const E  = "#a855f7";   // equipment (solid, high contrast)
const P  = "#2a3747";   // platform/bench
const PL = "#3d5166";   // floor line

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function L({ x1,y1,x2,y2,w=11,c=B }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round"/>;
}
function H({ cx,cy,r=9,c=B }) { return <circle cx={cx} cy={cy} r={r} fill={c}/>; }

// Barbell — plates are solid (no opacity) for max contrast
function Barbell({ cx,cy,half=36 }) {
  return <>
    <rect x={cx-half} y={cy-2} width={half*2} height={5} rx={2} fill={E}/>
    <rect x={cx-half-3} y={cy-6} width={8} height={13} rx={1} fill={E}/>
    <rect x={cx+half-5} y={cy-6} width={8} height={13} rx={1} fill={E}/>
  </>;
}
// Dumbbell horizontal — solid plates
function DB({ cx,cy }) {
  return <>
    <rect x={cx-8} y={cy-4} width={16} height={9} rx={2} fill={E}/>
    <rect x={cx-11} y={cy-7} width={5} height={15} rx={1} fill={E}/>
    <rect x={cx+6} y={cy-7} width={5} height={15} rx={1} fill={E}/>
  </>;
}
// Dumbbell vertical — solid plates
function DBV({ cx,cy }) {
  return <>
    <rect x={cx-4} y={cy-8} width={9} height={16} rx={2} fill={E}/>
    <rect x={cx-8} y={cy-11} width={17} height={5} rx={1} fill={E}/>
    <rect x={cx-8} y={cy+6} width={17} height={5} rx={1} fill={E}/>
  </>;
}
// Flat bench (side view)
function FlatBench({ y=100 }) {
  return <>
    <rect x={12} y={y} width={96} height={8} rx={3} fill={P}/>
    <L x1={18} y1={y+8} x2={18} y2={y+40} w={6} c={P}/>
    <L x1={102} y1={y+8} x2={102} y2={y+40} w={6} c={P}/>
  </>;
}
function Floor({ y=152 }) {
  return <line x1={4} y1={y} x2={116} y2={y} stroke={PL} strokeWidth={5} strokeLinecap="round"/>;
}
// Arrow — hidden in mini mode
function Arr({ x,y,dir="up",len=20,mini=false }) {
  if (mini) return null;
  const u  = `M${x},${y+len} L${x},${y} M${x-5},${y+9} L${x},${y} L${x+5},${y+9}`;
  const d  = `M${x},${y} L${x},${y+len} M${x-5},${y+len-9} L${x},${y+len} L${x+5},${y+len-9}`;
  const ud = `M${x},${y} L${x},${y+len} M${x-4},${y+8} L${x},${y} L${x+4},${y+8} M${x-4},${y+len-8} L${x},${y+len} L${x+4},${y+len-8}`;
  return <path d={{up:u,down:d,updown:ud}[dir]||u} stroke={E} fill="none" strokeWidth={3} strokeLinecap="round"/>;
}
// Motion arc (dashes) — hidden in mini mode
function Arc({ d,mini=false }) {
  if (mini) return null;
  return <path d={d} fill="none" stroke={E} strokeWidth={2} strokeDasharray="5,3" opacity={0.7}/>;
}

// Standing front-view base — legs passive
function Stand({ mini=false }) {
  return <>
    <H cx={60} cy={18} c={BD}/>
    <L x1={60} y1={27} x2={60} y2={72} w={14} c={BD}/>
    <L x1={54} y1={72} x2={46} y2={108} w={12} c={BD}/>
    <L x1={46} y1={108} x2={42} y2={150} w={10} c={BD}/>
    <L x1={66} y1={72} x2={74} y2={108} w={12} c={BD}/>
    <L x1={74} y1={108} x2={78} y2={150} w={10} c={BD}/>
  </>;
}

// Lying on bench base — body passive
function LyingOnBench({ benchY=100 }) {
  return <>
    <FlatBench y={benchY}/>
    <H cx={108} cy={benchY-18} c={BD}/>
    <L x1={99} y1={benchY-8} x2={22} y2={benchY-6} w={13} c={BD}/>
    <L x1={26} y1={benchY-4} x2={16} y2={benchY+20} w={12} c={BD}/>
    <L x1={16} y1={benchY+20} x2={22} y2={benchY+52} w={10} c={BD}/>
  </>;
}

// ─── CHEST ───────────────────────────────────────────────────────────────────

function BenchHorizontal({ mini=false }) {
  const by = 100;
  return <>
    <LyingOnBench benchY={by}/>
    {/* Arms ACTIVE (pressing = B) — form a clear inverted-V going up */}
    <L x1={62} y1={by-6} x2={52} y2={by-30}/>
    <L x1={52} y1={by-30} x2={54} y2={by-52}/>
    <L x1={72} y1={by-6} x2={78} y2={by-30}/>
    <L x1={78} y1={by-30} x2={76} y2={by-52}/>
    <Barbell cx={65} cy={by-54} half={22}/>
    <Arr x={16} y={by-36} dir="updown" len={20} mini={mini}/>
  </>;
}

function BenchIncline({ mini=false }) {
  return <>
    <polygon points="10,155 26,155 100,46 84,46" fill={P}/>
    <rect x={10} y={126} width={16} height={30} fill={P}/>
    <H cx={92} cy={30} c={BD}/>
    <L x1={84} y1={38} x2={36} y2={88} w={13} c={BD}/>
    <L x1={36} y1={88} x2={22} y2={122} w={12} c={BD}/>
    <L x1={22} y1={122} x2={18} y2={155} w={10} c={BD}/>
    <L x1={46} y1={94} x2={56} y2={126} w={12} c={BD}/>
    <L x1={56} y1={126} x2={54} y2={155} w={10} c={BD}/>
    {/* Arms ACTIVE */}
    <L x1={66} y1={62} x2={56} y2={42}/>
    <L x1={56} y1={42} x2={60} y2={24}/>
    <L x1={72} y1={64} x2={80} y2={44}/>
    <L x1={80} y1={44} x2={76} y2={26}/>
    <Barbell cx={68} cy={22} half={18}/>
    <Arr x={14} y={80} dir="updown" len={18} mini={mini}/>
  </>;
}

function Fly({ mini=false }) {
  // Arms WIDE open — clearly different from press (inverted-V)
  const by = 100;
  return <>
    <LyingOnBench benchY={by}/>
    {/* Arms ACTIVE going FAR to sides — max visual contrast with BenchHorizontal */}
    <L x1={62} y1={by-6} x2={36} y2={by-24}/>
    <L x1={36} y1={by-24} x2={14} y2={by-34}/>
    <L x1={72} y1={by-6} x2={96} y2={by-24}/>
    <L x1={96} y1={by-24} x2={108} y2={by-34}/>
    {/* DBs — within viewBox bounds: cx=12 and cx=110 */}
    <DB cx={12} cy={by-36}/>
    <DB cx={110} cy={by-36}/>
    <Arc d={`M14,${by-36} Q64,${by-66} 112,${by-36}`} mini={mini}/>
  </>;
}

function Pushup({ mini=false }) {
  return <>
    <Floor/>
    <H cx={104} cy={76} c={BD}/>
    <L x1={95} y1={84} x2={20} y2={100} w={13} c={BD}/>
    {/* Arms ACTIVE pushing */}
    <L x1={84} y1={88} x2={88} y2={112}/>
    <L x1={88} y1={112} x2={92} y2={152}/>
    <L x1={68} y1={92} x2={70} y2={116}/>
    <L x1={70} y1={116} x2={72} y2={152}/>
    {/* Legs passive */}
    <L x1={20} y1={100} x2={6} y2={108} w={12} c={BD}/>
    <L x1={6} y1={108} x2={4} y2={152} w={10} c={BD}/>
    <L x1={20} y1={100} x2={36} y2={108} w={12} c={BD}/>
    <L x1={36} y1={108} x2={38} y2={152} w={10} c={BD}/>
    <Arr x={54} y={82} dir="updown" len={16} mini={mini}/>
  </>;
}

function Dip({ mini=false }) {
  return <>
    <rect x={18} y={52} width={6} height={100} fill={P}/>
    <rect x={96} y={52} width={6} height={100} fill={P}/>
    <rect x={6} y={44} width={34} height={9} rx={4} fill={E}/>
    <rect x={80} y={44} width={34} height={9} rx={4} fill={E}/>
    <H cx={60} cy={16} c={BD}/>
    <L x1={60} y1={25} x2={58} y2={62} w={14} c={BD}/>
    {/* Arms ACTIVE */}
    <L x1={52} y1={36} x2={34} y2={46}/>
    <L x1={34} y1={46} x2={22} y2={56}/>
    <L x1={68} y1={36} x2={86} y2={46}/>
    <L x1={86} y1={46} x2={98} y2={56}/>
    {/* Legs passive */}
    <L x1={50} y1={62} x2={42} y2={96} w={12} c={BD}/>
    <L x1={42} y1={96} x2={50} y2={126} w={10} c={BD}/>
    <L x1={66} y1={62} x2={74} y2={96} w={12} c={BD}/>
    <L x1={74} y1={96} x2={66} y2={126} w={10} c={BD}/>
    <Arr x={112} y={62} dir="updown" len={26} mini={mini}/>
  </>;
}

// ─── SHOULDERS ───────────────────────────────────────────────────────────────

function OverheadPress({ mini=false }) {
  return <>
    <Stand/>
    {/* Arms ACTIVE overhead */}
    <L x1={52} y1={38} x2={42} y2={22}/>
    <L x1={42} y1={22} x2={44} y2={14}/>
    <L x1={68} y1={38} x2={78} y2={22}/>
    <L x1={78} y1={22} x2={76} y2={14}/>
    <Barbell cx={60} cy={12} half={34}/>
    <Arr x={112} y={36} dir="updown" len={26} mini={mini}/>
  </>;
}

function LateralRaise({ mini=false }) {
  return <>
    <Stand/>
    {/* Arms ACTIVE — horizontal T-shape. DB within bounds: cx=12 and cx=108 */}
    <L x1={52} y1={38} x2={22} y2={42}/>
    <L x1={22} y1={42} x2={8} y2={46}/>
    <L x1={68} y1={38} x2={98} y2={42}/>
    <L x1={98} y1={42} x2={112} y2={46}/>
    <DB cx={8} cy={46}/>
    <DB cx={112} cy={46}/>
    <Arr x={60} y={58} dir="updown" len={14} mini={mini}/>
  </>;
}

function FrontRaise({ mini=false }) {
  return <>
    <Stand/>
    {/* LEFT arm ACTIVE — raised to front */}
    <L x1={52} y1={38} x2={28} y2={22}/>
    <L x1={28} y1={22} x2={14} y2={14}/>
    <DB cx={14} cy={14}/>
    {/* Right arm passive */}
    <L x1={68} y1={38} x2={86} y2={62} w={10} c={BD}/>
    <L x1={86} y1={62} x2={92} y2={88} w={9} c={BD}/>
    <Arr x={22} y={24} dir="up" len={18} mini={mini}/>
  </>;
}

function Shrug({ mini=false }) {
  return <>
    <Stand/>
    {/* Arms passive holding weights */}
    <L x1={52} y1={32} x2={36} y2={60} w={10} c={BD}/>
    <L x1={36} y1={60} x2={28} y2={92} w={9} c={BD}/>
    <L x1={68} y1={32} x2={84} y2={60} w={10} c={BD}/>
    <L x1={84} y1={60} x2={92} y2={92} w={9} c={BD}/>
    <DBV cx={24} cy={100}/>
    <DBV cx={96} cy={100}/>
    {/* Shoulder elevation indicator */}
    <Arr x={60} y={20} dir="up" len={12} mini={mini}/>
  </>;
}

// ─── BACK ─────────────────────────────────────────────────────────────────────

function Pulldown({ mini=false }) {
  return <>
    <rect x={4} y={8} width={112} height={7} rx={2} fill={P}/>
    <line x1={60} y1={15} x2={60} y2={38} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <Barbell cx={60} cy={40} half={32}/>
    <rect x={30} y={116} width={60} height={8} rx={2} fill={P}/>
    <rect x={36} y={124} width={6} height={26} fill={P}/>
    <rect x={78} y={124} width={6} height={26} fill={P}/>
    {/* Torso passive */}
    <H cx={60} cy={60} c={BD}/>
    <L x1={60} y1={69} x2={60} y2={114} w={14} c={BD}/>
    <L x1={54} y1={114} x2={32} y2={116} w={12} c={BD}/>
    <L x1={66} y1={114} x2={88} y2={116} w={12} c={BD}/>
    {/* Arms ACTIVE pulling down */}
    <L x1={52} y1={78} x2={36} y2={52}/>
    <L x1={36} y1={52} x2={32} y2={42}/>
    <L x1={68} y1={78} x2={84} y2={52}/>
    <L x1={84} y1={52} x2={88} y2={42}/>
    <Arr x={112} y={70} dir="down" len={24} mini={mini}/>
  </>;
}

function Pullup({ mini=false }) {
  return <>
    <rect x={12} y={8} width={96} height={8} rx={4} fill={E}/>
    {/* Body passive */}
    <H cx={60} cy={30} c={BD}/>
    <L x1={60} y1={39} x2={60} y2={86} w={14} c={BD}/>
    <L x1={54} y1={86} x2={46} y2={126} w={12} c={BD}/>
    <L x1={46} y1={126} x2={44} y2={156} w={10} c={BD}/>
    <L x1={66} y1={86} x2={74} y2={126} w={12} c={BD}/>
    <L x1={74} y1={126} x2={76} y2={156} w={10} c={BD}/>
    {/* Arms ACTIVE pulling */}
    <L x1={52} y1={48} x2={34} y2={26}/>
    <L x1={34} y1={26} x2={30} y2={16}/>
    <L x1={68} y1={48} x2={86} y2={26}/>
    <L x1={86} y1={26} x2={90} y2={16}/>
    <Arr x={110} y={64} dir="updown" len={26} mini={mini}/>
  </>;
}

function RowBent({ mini=false }) {
  return <>
    {/* Profile, facing right */}
    <H cx={100} cy={32} c={BD}/>
    {/* Back ACTIVE (working) */}
    <L x1={92} y1={40} x2={52} y2={82}/>
    {/* Legs passive */}
    <L x1={52} y1={82} x2={38} y2={120} w={12} c={BD}/>
    <L x1={38} y1={120} x2={34} y2={156} w={10} c={BD}/>
    <L x1={62} y1={86} x2={68} y2={120} w={12} c={BD}/>
    <L x1={68} y1={120} x2={66} y2={156} w={10} c={BD}/>
    {/* Arms ACTIVE pulling bar up */}
    <L x1={72} y1={60} x2={56} y2={90}/>
    <L x1={56} y1={90} x2={46} y2={132}/>
    <L x1={78} y1={62} x2={66} y2={92}/>
    <L x1={66} y1={92} x2={58} y2={132}/>
    <Barbell cx={52} cy={136} half={38}/>
    <Arr x={114} y={76} dir="up" len={28} mini={mini}/>
  </>;
}

function RowSeated({ mini=false }) {
  return <>
    <rect x={4} y={88} width={12} height={10} rx={2} fill={P}/>
    <line x1={16} y1={93} x2={46} y2={98} stroke={E} strokeWidth={2.5} strokeDasharray="5,2"/>
    <rect x={52} y={116} width={60} height={8} rx={2} fill={P}/>
    <rect x={58} y={124} width={6} height={26} fill={P}/>
    {/* Body passive */}
    <H cx={96} cy={58} c={BD}/>
    <L x1={96} y1={67} x2={92} y2={114} w={14} c={BD}/>
    <L x1={86} y1={114} x2={54} y2={116} w={12} c={BD}/>
    <L x1={54} y1={116} x2={40} y2={150} w={10} c={BD}/>
    {/* Arms ACTIVE pulling */}
    <L x1={88} y1={82} x2={62} y2={94}/>
    <L x1={62} y1={94} x2={46} y2={98}/>
    <L x1={90} y1={86} x2={68} y2={96}/>
    <Arr x={114} y={84} dir="updown" len={18} mini={mini}/>
  </>;
}

function ReverseFly({ mini=false }) {
  return <>
    <H cx={100} cy={32} c={BD}/>
    {/* Back/torso passive */}
    <L x1={92} y1={40} x2={52} y2={82} w={14} c={BD}/>
    <L x1={52} y1={82} x2={38} y2={120} w={12} c={BD}/>
    <L x1={38} y1={120} x2={34} y2={156} w={10} c={BD}/>
    <L x1={62} y1={86} x2={68} y2={120} w={12} c={BD}/>
    <L x1={68} y1={120} x2={66} y2={156} w={10} c={BD}/>
    {/* Arms ACTIVE raising outward */}
    <L x1={74} y1={60} x2={50} y2={42}/>
    <L x1={50} y1={42} x2={28} y2={28}/>
    <L x1={76} y1={62} x2={98} y2={44}/>
    <L x1={98} y1={44} x2={114} y2={30}/>
    <DBV cx={24} cy={24}/>
    <DBV cx={114} cy={26}/>
    <Arc d="M28,28 Q65,50 114,30" mini={mini}/>
  </>;
}

function BackExtension({ mini=false }) {
  return <>
    <rect x={4} y={90} width={82} height={7} rx={2} fill={P}/>
    <rect x={8} y={97} width={6} height={46} fill={P}/>
    <rect x={62} y={97} width={6} height={46} fill={P}/>
    <rect x={54} y={80} width={28} height={10} rx={4} fill={E} opacity={0.8}/>
    {/* Torso ACTIVE extending up */}
    <H cx={110} cy={56}/>
    <L x1={102} y1={64} x2={64} y2={88}/>
    {/* Legs passive */}
    <L x1={64} y1={88} x2={46} y2={94} w={12} c={BD}/>
    <L x1={46} y1={94} x2={30} y2={124} w={12} c={BD}/>
    <L x1={30} y1={124} x2={26} y2={156} w={10} c={BD}/>
    {/* Arms folded on chest (passive) */}
    <L x1={94} y1={68} x2={80} y2={72} w={9} c={BD}/>
    <L x1={82} y1={66} x2={96} y2={72} w={9} c={BD}/>
    <Arr x={60} y={64} dir="updown" len={20} mini={mini}/>
  </>;
}

// ─── ARMS ─────────────────────────────────────────────────────────────────────

function CurlStanding({ mini=false }) {
  return <>
    <Stand/>
    {/* LEFT arm ACTIVE — curled up */}
    <L x1={52} y1={38} x2={38} y2={64}/>
    <L x1={38} y1={64} x2={46} y2={40}/>
    <DBV cx={44} cy={32}/>
    {/* Right arm passive — hanging */}
    <L x1={68} y1={38} x2={84} y2={62} w={10} c={BD}/>
    <L x1={84} y1={62} x2={90} y2={90} w={9} c={BD}/>
    <DBV cx={90} cy={98}/>
    <Arr x={24} y={46} dir="up" len={20} mini={mini}/>
  </>;
}

function CurlSeated({ mini=false }) {
  return <>
    <polygon points="20,156 36,156 94,70 78,70" fill={P}/>
    <rect x={20} y={146} width={16} height={10} fill={P}/>
    {/* Body passive */}
    <H cx={92} cy={46} c={BD}/>
    <L x1={88} y1={55} x2={80} y2={84} w={14} c={BD}/>
    <L x1={72} y1={84} x2={56} y2={118} w={12} c={BD}/>
    <L x1={56} y1={118} x2={48} y2={156} w={10} c={BD}/>
    {/* Arm ACTIVE curling */}
    <L x1={82} y1={68} x2={62} y2={84}/>
    <L x1={62} y1={84} x2={54} y2={62}/>
    <Barbell cx={52} cy={58} half={12}/>
    <Arr x={40} y={72} dir="up" len={20} mini={mini}/>
  </>;
}

function TricepPushdown({ mini=false }) {
  return <>
    <rect x={4} y={8} width={112} height={7} rx={2} fill={P}/>
    <line x1={60} y1={15} x2={60} y2={42} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <line x1={60} y1={42} x2={46} y2={52} stroke={E} strokeWidth={3} strokeLinecap="round"/>
    <line x1={60} y1={42} x2={74} y2={52} stroke={E} strokeWidth={3} strokeLinecap="round"/>
    <circle cx={46} cy={52} r={5} fill={E}/>
    <circle cx={74} cy={52} r={5} fill={E}/>
    {/* Body passive */}
    <Stand/>
    {/* Upper arms passive (pinned) */}
    <L x1={52} y1={38} x2={48} y2={48} w={10} c={BD}/>
    <L x1={68} y1={38} x2={72} y2={48} w={10} c={BD}/>
    {/* Forearms ACTIVE pushing down */}
    <L x1={48} y1={48} x2={46} y2={70}/>
    <L x1={72} y1={48} x2={74} y2={70}/>
    <Arr x={114} y={48} dir="down" len={22} mini={mini}/>
  </>;
}

function TricepOverhead({ mini=false }) {
  return <>
    <Stand/>
    {/* Upper arms passive beside head */}
    <L x1={52} y1={38} x2={44} y2={14} w={10} c={BD}/>
    <L x1={68} y1={38} x2={76} y2={14} w={10} c={BD}/>
    {/* Forearms ACTIVE extending */}
    <L x1={44} y1={14} x2={50} y2={36}/>
    <L x1={76} y1={14} x2={70} y2={36}/>
    <rect x={46} y={34} width={28} height={8} rx={3} fill={E}/>
    <Arr x={60} y={18} dir="updown" len={16} mini={mini}/>
  </>;
}

function SkullCrusher({ mini=false }) {
  const by = 100;
  return <>
    <LyingOnBench benchY={by}/>
    {/* Upper arms vertical (passive) */}
    <L x1={64} y1={by-6} x2={62} y2={by-30} w={10} c={BD}/>
    <L x1={74} y1={by-6} x2={78} y2={by-30} w={10} c={BD}/>
    {/* Forearms ACTIVE folding toward head */}
    <L x1={62} y1={by-30} x2={76} y2={by-42}/>
    <L x1={78} y1={by-30} x2={90} y2={by-42}/>
    <Barbell cx={83} cy={by-46} half={14}/>
    <Arr x={16} y={by-32} dir="updown" len={18} mini={mini}/>
  </>;
}

// ─── LEGS ─────────────────────────────────────────────────────────────────────

function Squat({ mini=false }) {
  // Profile: bar on back, DEEP knee bend — legs ACTIVE
  return <>
    <Barbell cx={60} cy={38} half={48}/>
    {/* Head/torso passive */}
    <H cx={78} cy={22} c={BD}/>
    <L x1={72} y1={30} x2={56} y2={78} w={14} c={BD}/>
    {/* Arm grip passive */}
    <L x1={66} y1={38} x2={28} y2={42} w={9} c={BD}/>
    <L x1={70} y1={38} x2={96} y2={40} w={9} c={BD}/>
    {/* Legs ACTIVE — deeply bent */}
    <L x1={52} y1={78} x2={76} y2={112}/>
    <L x1={76} y1={112} x2={62} y2={154}/>
    <L x1={58} y1={80} x2={34} y2={114}/>
    <L x1={34} y1={114} x2={46} y2={154}/>
    <Arr x={114} y={92} dir="updown" len={24} mini={mini}/>
  </>;
}

function Deadlift({ mini=false }) {
  // Profile: bar ON FLOOR, back ~55°, knees BENT — back+legs ACTIVE
  return <>
    {/* Head/torso ACTIVE */}
    <H cx={96} cy={30}/>
    <L x1={88} y1={38} x2={48} y2={80}/>
    {/* Arms passive (just holding) */}
    <L x1={68} y1={58} x2={52} y2={86} w={10} c={BD}/>
    <L x1={52} y1={86} x2={44} y2={130} w={9} c={BD}/>
    <L x1={76} y1={60} x2={62} y2={88} w={10} c={BD}/>
    <L x1={62} y1={88} x2={56} y2={130} w={9} c={BD}/>
    {/* Legs ACTIVE — bent */}
    <L x1={48} y1={80} x2={28} y2={114}/>
    <L x1={28} y1={114} x2={24} y2={154}/>
    <L x1={60} y1={84} x2={70} y2={114}/>
    <L x1={70} y1={114} x2={72} y2={154}/>
    {/* Bar on FLOOR */}
    <Barbell cx={50} cy={136} half={42}/>
    <Arr x={114} y={78} dir="up" len={28} mini={mini}/>
  </>;
}

function RDL({ mini=false }) {
  // Profile: back NEARLY HORIZONTAL, legs STRAIGHT — clearly distinct from Deadlift
  return <>
    {/* Torso ACTIVE (hinging) */}
    <H cx={104} cy={28}/>
    <L x1={96} y1={36} x2={44} y2={72}/>
    {/* Arms passive hanging */}
    <L x1={72} y1={52} x2={56} y2={76} w={10} c={BD}/>
    <L x1={56} y1={76} x2={46} y2={110} w={9} c={BD}/>
    <L x1={80} y1={54} x2={68} y2={78} w={10} c={BD}/>
    <L x1={68} y1={78} x2={60} y2={110} w={9} c={BD}/>
    {/* Legs passive — STRAIGHT (key visual diff from Deadlift) */}
    <L x1={44} y1={72} x2={30} y2={112} w={12} c={BD}/>
    <L x1={30} y1={112} x2={26} y2={154} w={10} c={BD}/>
    <L x1={56} y1={74} x2={64} y2={112} w={12} c={BD}/>
    <L x1={64} y1={112} x2={66} y2={154} w={10} c={BD}/>
    {/* Bar at THIGH level — not floor */}
    <Barbell cx={53} cy={114} half={38}/>
    <Arr x={114} y={70} dir="updown" len={22} mini={mini}/>
  </>;
}

function HipThrust({ mini=false }) {
  return <>
    <FlatBench y={52}/>
    <Floor/>
    {/* Head/upper back passive */}
    <H cx={108} cy={38} c={BD}/>
    {/* Hip/glute area ACTIVE — the raised hips are the key feature */}
    <L x1={100} y1={46} x2={64} y2={58}/>
    <L x1={64} y1={58} x2={50} y2={78}/>
    {/* Legs passive */}
    <L x1={50} y1={78} x2={34} y2={118} w={12} c={BD}/>
    <L x1={34} y1={118} x2={28} y2={154} w={10} c={BD}/>
    <L x1={56} y1={80} x2={68} y2={116} w={12} c={BD}/>
    <L x1={68} y1={116} x2={70} y2={154} w={10} c={BD}/>
    <Barbell cx={57} cy={76} half={30}/>
    <Arr x={16} y={80} dir="updown" len={22} mini={mini}/>
  </>;
}

function Lunge({ mini=false }) {
  return <>
    <Floor/>
    <H cx={60} cy={14} c={BD}/>
    <L x1={60} y1={23} x2={60} y2={68} w={14} c={BD}/>
    {/* Arms with dumbbells passive */}
    <L x1={52} y1={38} x2={18} y2={68} w={10} c={BD}/>
    <L x1={18} y1={68} x2={10} y2={98} w={9} c={BD}/>
    <DBV cx={8} cy={106}/>
    <L x1={68} y1={38} x2={102} y2={68} w={10} c={BD}/>
    <L x1={102} y1={68} x2={110} y2={98} w={9} c={BD}/>
    <DBV cx={112} cy={106}/>
    {/* FRONT LEG ACTIVE (bent) */}
    <L x1={54} y1={68} x2={28} y2={108}/>
    <L x1={28} y1={108} x2={24} y2={154}/>
    {/* BACK LEG — lighter to emphasize front */}
    <L x1={66} y1={68} x2={92} y2={110} w={12} c={BD}/>
    <L x1={92} y1={110} x2={98} y2={144} w={10} c={BD}/>
    <circle cx={98} cy={144} r={7} fill={E} opacity={0.4}/>
    <Arr x={116} y={102} dir="updown" len={26} mini={mini}/>
  </>;
}

function LegCurl({ mini=false }) {
  // PRONE on machine — shin curling UP is the ONLY thing highlighted
  return <>
    <FlatBench y={78}/>
    <rect x={8} y={64} width={26} height={14} rx={5} fill={E}/>
    {/* Body passive */}
    <H cx={108} cy={60} c={BD}/>
    <L x1={99} y1={68} x2={26} y2={70} w={14} c={BD}/>
    {/* Thigh passive */}
    <L x1={26} y1={70} x2={14} y2={82} w={12} c={BD}/>
    {/* Shin ACTIVE — curling UP, bright B */}
    <L x1={14} y1={82} x2={20} y2={50}/>
    <Arr x={8} y={44} dir="up" len={24} mini={mini}/>
    <L x1={90} y1={68} x2={86} y2={84} w={9} c={BD}/>
  </>;
}

function LegExtension({ mini=false }) {
  // SEATED — shin extending FORWARD is the ONLY thing highlighted
  return <>
    <rect x={76} y={44} width={38} height={64} rx={3} fill={P}/>
    <rect x={46} y={62} width={68} height={16} rx={3} fill={P}/>
    <rect x={50} y={78} width={6} height={54} fill={P}/>
    <rect x={108} y={78} width={6} height={54} fill={P}/>
    <rect x={6} y={96} width={28} height={12} rx={5} fill={E}/>
    {/* Body passive */}
    <H cx={96} cy={36} c={BD}/>
    <L x1={96} y1={45} x2={92} y2={78} w={14} c={BD}/>
    <L x1={86} y1={78} x2={50} y2={80} w={12} c={BD}/>
    {/* Shin ACTIVE — extending forward */}
    <L x1={50} y1={80} x2={22} y2={98}/>
    <L x1={22} y1={98} x2={6} y2={104}/>
    {/* Arms passive */}
    <L x1={88} y1={56} x2={78} y2={68} w={9} c={BD}/>
    <Arr x={4} y={88} dir="up" len={22} mini={mini}/>
  </>;
}

function CalfRaise({ mini=false }) {
  return <>
    <rect x={16} y={128} width={88} height={10} rx={2} fill={P}/>
    <Floor y={154}/>
    {/* Body passive */}
    <H cx={60} cy={14} c={BD}/>
    <L x1={60} y1={23} x2={60} y2={68} w={14} c={BD}/>
    <L x1={52} y1={38} x2={34} y2={62} w={10} c={BD}/>
    <L x1={34} y1={62} x2={26} y2={90} w={9} c={BD}/>
    <DBV cx={22} cy={98}/>
    <L x1={68} y1={38} x2={86} y2={62} w={10} c={BD}/>
    <L x1={86} y1={62} x2={94} y2={90} w={9} c={BD}/>
    <DBV cx={98} cy={98}/>
    {/* Legs passive */}
    <L x1={54} y1={68} x2={46} y2={108} w={12} c={BD}/>
    <L x1={66} y1={68} x2={74} y2={108} w={12} c={BD}/>
    {/* Calves/feet ACTIVE — on toes */}
    <L x1={46} y1={108} x2={44} y2={128}/>
    <L x1={74} y1={108} x2={76} y2={128}/>
    <circle cx={44} cy={128} r={5} fill={B}/>
    <circle cx={76} cy={128} r={5} fill={B}/>
    <Arr x={114} y={104} dir="updown" len={18} mini={mini}/>
  </>;
}

// ─── CORE ─────────────────────────────────────────────────────────────────────

function Plank({ mini=false }) {
  return <>
    <Floor/>
    {/* Full body active (isometric) */}
    <H cx={104} cy={80}/>
    <L x1={95} y1={88} x2={18} y2={106}/>
    <L x1={82} y1={92} x2={88} y2={116}/>
    <L x1={88} y1={116} x2={96} y2={152}/>
    <L x1={66} y1={95} x2={70} y2={118}/>
    <L x1={70} y1={118} x2={76} y2={152}/>
    <L x1={18} y1={106} x2={6} y2={116} w={12}/>
    <L x1={6} y1={116} x2={4} y2={152} w={10}/>
    <L x1={18} y1={106} x2={32} y2={116} w={12}/>
    <L x1={32} y1={116} x2={36} y2={152} w={10}/>
    {!mini && <text x={60} y={148} textAnchor="middle" fontSize={9} fill={E} fontFamily="system-ui" fontWeight={700} letterSpacing={1}>HOLD</text>}
  </>;
}

function Crunch({ mini=false }) {
  return <>
    <Floor/>
    {/* Lower body passive */}
    <L x1={14} y1={132} x2={48} y2={128} w={12} c={BD}/>
    <L x1={14} y1={132} x2={32} y2={106} w={12} c={BD}/>
    <L x1={32} y1={106} x2={62} y2={118} w={10} c={BD}/>
    <L x1={62} y1={118} x2={70} y2={152} w={10} c={BD}/>
    {/* Upper torso ACTIVE curling up */}
    <L x1={48} y1={128} x2={66} y2={110}/>
    <L x1={66} y1={110} x2={80} y2={84}/>
    <H cx={86} cy={74}/>
    {/* Hands behind head */}
    <L x1={80} y1={78} x2={66} y2={66} w={9} c={BD}/>
    <L x1={88} y1={70} x2={104} y2={62} w={9} c={BD}/>
    <Arr x={52} y={112} dir="up" len={20} mini={mini}/>
  </>;
}

function HangingLegRaise({ mini=false }) {
  return <>
    <rect x={12} y={8} width={96} height={8} rx={4} fill={E}/>
    {/* Arms/torso passive */}
    <H cx={60} cy={30} c={BD}/>
    <L x1={60} y1={39} x2={60} y2={84} w={14} c={BD}/>
    <L x1={52} y1={48} x2={34} y2={26} w={10} c={BD}/>
    <L x1={34} y1={26} x2={30} y2={16} w={9} c={BD}/>
    <L x1={68} y1={48} x2={86} y2={26} w={10} c={BD}/>
    <L x1={86} y1={26} x2={90} y2={16} w={9} c={BD}/>
    {/* Legs ACTIVE raised */}
    <L x1={54} y1={84} x2={32} y2={86}/>
    <L x1={32} y1={86} x2={14} y2={116}/>
    <L x1={66} y1={84} x2={88} y2={86}/>
    <L x1={88} y1={86} x2={106} y2={116}/>
    <Arr x={60} y={110} dir="up" len={22} mini={mini}/>
  </>;
}

function KettlebellSwing({ mini=false }) {
  return <>
    <Floor/>
    {/* Head passive */}
    <H cx={88} cy={34} c={BD}/>
    {/* Torso/hips ACTIVE (hip hinge) */}
    <L x1={80} y1={42} x2={42} y2={84}/>
    {/* Legs passive */}
    <L x1={42} y1={84} x2={26} y2={120} w={12} c={BD}/>
    <L x1={26} y1={120} x2={20} y2={154} w={10} c={BD}/>
    <L x1={54} y1={88} x2={62} y2={120} w={12} c={BD}/>
    <L x1={62} y1={120} x2={64} y2={154} w={10} c={BD}/>
    {/* Arms ACTIVE swinging KB */}
    <L x1={62} y1={60} x2={46} y2={76}/>
    <L x1={46} y1={76} x2={30} y2={64}/>
    <rect x={18} y={56} width={18} height={14} rx={4} fill={E}/>
    <path d="M22,56 Q27,48 34,56" fill="none" stroke={E} strokeWidth={2.5} strokeLinecap="round"/>
    <Arr x={114} y={86} dir="up" len={28} mini={mini}/>
  </>;
}

function AbWheel({ mini=false }) {
  return <>
    <Floor/>
    <circle cx={36} cy={144} r={11} fill="none" stroke={E} strokeWidth={3}/>
    <line x1={20} y1={144} x2={52} y2={144} stroke={E} strokeWidth={3} strokeLinecap="round"/>
    {/* Body passive */}
    <H cx={106} cy={68} c={BD}/>
    {/* Torso ACTIVE extending */}
    <L x1={98} y1={76} x2={48} y2={108}/>
    {/* Arms ACTIVE */}
    <L x1={78} y1={84} x2={58} y2={112}/>
    <L x1={58} y1={112} x2={40} y2={144}/>
    <L x1={84} y1={86} x2={66} y2={114}/>
    {/* Knees passive */}
    <L x1={48} y1={108} x2={36} y2={130} w={12} c={BD}/>
    <L x1={36} y1={130} x2={30} y2={154} w={10} c={BD}/>
    <L x1={48} y1={108} x2={60} y2={130} w={12} c={BD}/>
    <L x1={60} y1={130} x2={62} y2={154} w={10} c={BD}/>
    <Arr x={24} y={116} dir="down" len={20} mini={mini}/>
  </>;
}

function RussianTwist({ mini=false }) {
  return <>
    <Floor/>
    {/* Body passive */}
    <H cx={64} cy={50} c={BD}/>
    <L x1={64} y1={59} x2={58} y2={96} w={14} c={BD}/>
    <L x1={48} y1={96} x2={30} y2={124} w={12} c={BD}/>
    <L x1={30} y1={124} x2={34} y2={152} w={10} c={BD}/>
    <L x1={68} y1={96} x2={76} y2={124} w={12} c={BD}/>
    <L x1={76} y1={124} x2={74} y2={152} w={10} c={BD}/>
    {/* Arms ACTIVE rotating to one side */}
    <L x1={58} y1={70} x2={36} y2={60}/>
    <L x1={36} y1={60} x2={18} y2={52}/>
    <rect x={8} y={46} width={14} height={8} rx={3} fill={E}/>
    <Arr x={96} y={66} dir="updown" len={16} mini={mini}/>
  </>;
}

function Rotation({ mini=false }) {
  return <>
    <rect x={4} y={74} width={12} height={10} rx={2} fill={P}/>
    <line x1={16} y1={79} x2={46} y2={79} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <Stand/>
    {/* Arms ACTIVE rotating */}
    <L x1={52} y1={42} x2={38} y2={66}/>
    <L x1={38} y1={66} x2={46} y2={78}/>
    <L x1={68} y1={42} x2={80} y2={62}/>
    <L x1={80} y1={62} x2={82} y2={74}/>
    <Arc d="M38,79 Q60,62 86,74" mini={mini}/>
  </>;
}

// Compound: DIFFERENT from OverheadPress — shows a bent-over barbell hold at hip level
function Compound({ mini=false }) {
  return <>
    {/* Profile: standing upright, bar held at hips */}
    <H cx={70} cy={16} c={BD}/>
    <L x1={64} y1={25} x2={60} y2={70} w={14} c={BD}/>
    <L x1={54} y1={70} x2={46} y2={110} w={12} c={BD}/>
    <L x1={46} y1={110} x2={42} y2={152} w={10} c={BD}/>
    <L x1={66} y1={70} x2={74} y2={110} w={12} c={BD}/>
    <L x1={74} y1={110} x2={78} y2={152} w={10} c={BD}/>
    {/* Arms ACTIVE holding bar at hip level */}
    <L x1={56} y1={38} x2={40} y2={60}/>
    <L x1={40} y1={60} x2={32} y2={86}/>
    <L x1={64} y1={38} x2={78} y2={60}/>
    <L x1={78} y1={60} x2={86} y2={86}/>
    {/* Bar at hip/thigh level */}
    <Barbell cx={59} cy={90} half={38}/>
    <Arr x={114} y={56} dir="updown" len={30} mini={mini}/>
  </>;
}

// ─── MAPPING ─────────────────────────────────────────────────────────────────

function norm(s) {
  return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
}

function getKey(name, pattern, muscle) {
  const n = norm(name);
  const m = norm(muscle);
  const p = pattern||"";

  if (p==="core") {
    if (n.includes("rueda")||n.includes("wheel")||n.includes("ab wheel")) return "ab-wheel";
    if (n.includes("colgado")||n.includes("hanging")||(n.includes("pierna")&&n.includes("colgad"))||n.includes("toes to bar")) return "hanging-leg-raise";
    if (n.includes("twist")||n.includes("ruso")||n.includes("russian")||n.includes("bicicleta")||n.includes("giro")) return "russian-twist";
    if (n.includes("pallof")||n.includes("rotacion")||n.includes("rotation")) return "rotation";
    if (n.includes("swing")||n.includes("kettlebell")) return "kettlebell-swing";
    if (n.includes("crunch")||n.includes("abdominal")||n.includes("sit-up")||n.includes("situp")||n.includes("encogimiento")) return "crunch";
    if (n.includes("plancha")||n.includes("plank")||n.includes("hollow")||n.includes("dead bug")||n.includes("farmer")||n.includes("l-sit")||n.includes("caminata")) return "plank";
    return "crunch";
  }

  if (p==="push") {
    const isTri = m.includes("tricep")||n.includes("tricep");
    if (isTri) {
      if (n.includes("polea")||n.includes("cable")||n.includes("pushdown")||n.includes("cuerda")||n.includes("barra v")) return "tricep-pushdown";
      if (n.includes("cabeza")||n.includes("overhead")||n.includes("sobre la cabeza")||n.includes("mancuerna")) return "tricep-overhead";
      if (n.includes("frances")||n.includes("rompe")||n.includes("skull")||n.includes("jm press")||n.includes("tate")||n.includes("acostado")||n.includes("banco")) return "skull-crusher";
      return "tricep-pushdown";
    }
    if (n.includes("flexion")||n.includes("push-up")||n.includes("push up")||n.includes("lagartija")) return "pushup";
    if (n.includes("fondo")&&(n.includes("paralela")||n.includes("barra"))) return "dip";
    if (n.includes("apertura")||n.includes("cruce")||n.includes("mariposa")||(m.includes("pectoral")&&(n.includes("polea")||n.includes("cable")||n.includes("trx")))) return "fly";
    if (m.includes("pectoral")||n.includes("pecho")||n.includes("banca")||n.includes("bench")||n.includes("press de pecho")) {
      if (n.includes("inclinado")||n.includes("incline")) return "bench-incline";
      return "bench-horizontal";
    }
    if (m.includes("deltoide lateral")||(n.includes("lateral")&&!n.includes("estocada"))) return "lateral-raise";
    if (n.includes("frontal")||n.includes("front raise")||(n.includes("elevacion")&&!n.includes("posterior")&&!n.includes("pierna"))) return "front-raise";
    return "overhead-press";
  }

  if (p==="pull") {
    if (m.includes("bicep")||m.includes("braquial")||n.includes("curl")) {
      if (n.includes("concentrado")||n.includes("predicador")||n.includes("inclinado")||n.includes("bayesian")||n.includes("spider")||n.includes("banco inclinado")||n.includes("21")) return "curl-seated";
      return "curl-standing";
    }
    if (m.includes("trapecio")||n.includes("encogimiento")||n.includes("shrug")||n.includes("remo al menton")) return "shrug";
    if (m.includes("erector")||n.includes("hiperextension")||n.includes("extension de espalda")||n.includes("superman")||n.includes("buenos dias")) return "back-extension";
    if (m.includes("deltoide posterior")||n.includes("pajaro")||n.includes("face pull")||n.includes("elevacion posterior")||n.includes("posterior")) return "reverse-fly";
    if (n.includes("jalon")||n.includes("pulldown")||n.includes("pull down")||n.includes("pullover")) return "pulldown";
    if (n.includes("dominada")||n.includes("pull-up")||n.includes("pull up")||n.includes("chin-up")) return "pullup";
    if (n.includes("remo")||n.includes("row")) {
      if (n.includes("cable")||n.includes("polea baja")||n.includes("sentado")||n.includes("maquina")||n.includes("pecho apoyado")) return "row-seated";
      return "row-bent";
    }
    if (n.includes("peso muerto")) return "deadlift";
    return "row-bent";
  }

  if (p==="legs") {
    if (n.includes("peso muerto")) {
      if (n.includes("rumano")||n.includes("rdl")||n.includes("pierna recta")||n.includes("stiff")) return "rdl";
      return "deadlift";
    }
    if (n.includes("hip thrust")||n.includes("puente de glut")||n.includes("glute bridge")||n.includes("empuje de cadera")) return "hip-thrust";
    if (n.includes("estocada")||n.includes("zancada")||n.includes("lunge")||n.includes("bulgara")||n.includes("bulgar")||n.includes("step-up")||n.includes("estacionaria")||n.includes("split")) return "lunge";
    if (n.includes("curl femoral")||n.includes("curl de isquio")||n.includes("isquiotibial")||n.includes("nordico")||n.includes("nordic")||(n.includes("curl")&&(n.includes("femoral")||n.includes("isquio")||n.includes("pierna")))) return "leg-curl";
    if ((n.includes("extension")||n.includes("extensi"))&&(n.includes("pierna")||n.includes("cuadricep")||n.includes("quad")||n.includes("rodilla"))) return "leg-extension";
    if (n.includes("pantorrilla")||n.includes("gemelo")||n.includes("calf")||n.includes("soleo")||n.includes("tibial")||n.includes("talon")) return "calf-raise";
    // abductor/aductor = seated machine → leg-extension is least-wrong (NOT lateral-raise shoulder pose)
    if (n.includes("abductor")||n.includes("aductor")) return "leg-extension";
    if (n.includes("swing")||n.includes("kettlebell")) return "kettlebell-swing";
    return "squat";
  }

  if (p==="rehab") return "rotation";
  if (p==="compound") return "compound";
  return "compound";
}

const FIGURES = {
  "bench-horizontal":  BenchHorizontal,
  "bench-incline":     BenchIncline,
  "dip":               Dip,
  "pushup":            Pushup,
  "fly":               Fly,
  "overhead-press":    OverheadPress,
  "lateral-raise":     LateralRaise,
  "front-raise":       FrontRaise,
  "shrug":             Shrug,
  "pulldown":          Pulldown,
  "pullup":            Pullup,
  "row-bent":          RowBent,
  "row-seated":        RowSeated,
  "reverse-fly":       ReverseFly,
  "back-extension":    BackExtension,
  "curl-standing":     CurlStanding,
  "curl-seated":       CurlSeated,
  "tricep-pushdown":   TricepPushdown,
  "tricep-overhead":   TricepOverhead,
  "skull-crusher":     SkullCrusher,
  "squat":             Squat,
  "deadlift":          Deadlift,
  "rdl":               RDL,
  "hip-thrust":        HipThrust,
  "lunge":             Lunge,
  "leg-curl":          LegCurl,
  "leg-extension":     LegExtension,
  "calf-raise":        CalfRaise,
  "plank":             Plank,
  "crunch":            Crunch,
  "hanging-leg-raise": HangingLegRaise,
  "kettlebell-swing":  KettlebellSwing,
  "ab-wheel":          AbWheel,
  "russian-twist":     RussianTwist,
  "rotation":          Rotation,
  "compound":          Compound,
};

export default function ExerciseIllustration({ name, pattern, muscle, equipment, size=100 }) {
  const key = getKey(name, pattern, muscle);
  const Figure = FIGURES[key] || Compound;
  const mini = size < 70;
  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={Math.round(size * 1.33)}
      style={{ display:"block" }}
      aria-label={`Ilustración: ${name}`}
      role="img"
    >
      <Figure mini={mini}/>
    </svg>
  );
}
