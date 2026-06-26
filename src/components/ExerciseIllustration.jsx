// Exercise illustrations — thick-limb solid style, side/profile views for clarity.
// viewBox 0 0 120 160 — all coords kept within x:4-116, y:4-156.

const B  = "#7bacc4";
const E  = "#a855f7";
const P  = "#2a3747";
const PL = "#3d5166";

function L({ x1,y1,x2,y2,w=11,c=B }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round"/>;
}
function H({ cx,cy,r=9 }) { return <circle cx={cx} cy={cy} r={r} fill={B}/>; }

// Barbell — center at (cx, cy), horizontal
function Barbell({ cx,cy,half=36 }) {
  return <>
    <rect x={cx-half} y={cy-2} width={half*2} height={5} rx={2} fill={E}/>
    <rect x={cx-half-3} y={cy-6} width={8} height={13} rx={1} fill={E} opacity={0.8}/>
    <rect x={cx+half-5} y={cy-6} width={8} height={13} rx={1} fill={E} opacity={0.8}/>
  </>;
}
// Dumbbell at (cx,cy) — horizontal orientation
function DB({ cx,cy }) {
  return <>
    <rect x={cx-8} y={cy-4} width={16} height={9} rx={2} fill={E}/>
    <rect x={cx-10} y={cy-7} width={5} height={15} rx={1} fill={E} opacity={0.7}/>
    <rect x={cx+5} y={cy-7} width={5} height={15} rx={1} fill={E} opacity={0.7}/>
  </>;
}
// Dumbbell at (cx,cy) — vertical orientation
function DBV({ cx,cy }) {
  return <>
    <rect x={cx-4} y={cy-8} width={9} height={16} rx={2} fill={E}/>
    <rect x={cx-7} y={cy-10} width={15} height={5} rx={1} fill={E} opacity={0.7}/>
    <rect x={cx-7} y={cy+5} width={15} height={5} rx={1} fill={E} opacity={0.7}/>
  </>;
}
// Flat bench (side view) — surface at y, legs going down
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
// Arrow indicator
function Arr({ x,y,dir="up",len=20 }) {
  const u = `M${x},${y+len} L${x},${y} M${x-5},${y+9} L${x},${y} L${x+5},${y+9}`;
  const d = `M${x},${y} L${x},${y+len} M${x-5},${y+len-9} L${x},${y+len} L${x+5},${y+len-9}`;
  const ud = `M${x},${y} L${x},${y+len} M${x-4},${y+8} L${x},${y} L${x+4},${y+8} M${x-4},${y+len-8} L${x},${y+len} L${x+4},${y+len-8}`;
  const paths = {up:u,down:d,updown:ud};
  return <path d={paths[dir]||u} stroke={E} fill="none" strokeWidth={2.5} strokeLinecap="round"/>;
}

// ─── STANDING FRONT VIEW BASE ─────────────────────────────────────────────────
// Head(60,18) · Torso(60,28→72) · Hips(72) · Knees(108) · Feet(150)
function Stand() {
  return <>
    <H cx={60} cy={18}/>
    <L x1={60} y1={27} x2={60} y2={72} w={14}/>
    <L x1={54} y1={72} x2={46} y2={108} w={12}/>
    <L x1={46} y1={108} x2={42} y2={150} w={10}/>
    <L x1={66} y1={72} x2={74} y2={108} w={12}/>
    <L x1={74} y1={108} x2={78} y2={150} w={10}/>
  </>;
}

// ─── LYING ON BENCH BASE (side view, head right) ─────────────────────────────
// Use for all bench exercises — body clearly horizontal
function LyingOnBench({ benchY=100 }) {
  return <>
    <FlatBench y={benchY}/>
    <H cx={108} cy={benchY-18}/>
    {/* Torso horizontal on bench */}
    <L x1={99} y1={benchY-8} x2={22} y2={benchY-6} w={13}/>
    {/* Legs bent at left end, feet on floor */}
    <L x1={26} y1={benchY-4} x2={16} y2={benchY+20} w={12}/>
    <L x1={16} y1={benchY+20} x2={22} y2={benchY+52} w={10}/>
  </>;
}

// ─── CHEST ───────────────────────────────────────────────────────────────────

function BenchHorizontal() {
  // Profile: person flat, bar pressed straight UP
  const by = 100;
  return <>
    <LyingOnBench benchY={by}/>
    {/* Arms: both visible pressing BAR straight up */}
    <L x1={62} y1={by-6} x2={52} y2={by-30} w={10}/>
    <L x1={52} y1={by-30} x2={54} y2={by-52} w={9}/>
    <L x1={72} y1={by-6} x2={78} y2={by-30} w={10}/>
    <L x1={78} y1={by-30} x2={76} y2={by-52} w={9}/>
    {/* Bar above chest */}
    <Barbell cx={65} cy={by-54} half={22}/>
    <Arr x={16} y={by-36} dir="updown" len={20}/>
  </>;
}

function BenchIncline() {
  // Inclined bench (~45°), pressing bar at angle
  return <>
    {/* Inclined seat */}
    <polygon points="10,155 26,155 100,46 84,46" fill={P}/>
    <rect x={10} y={126} width={16} height={30} fill={P}/>
    {/* Person on incline */}
    <H cx={92} cy={30}/>
    <L x1={84} y1={38} x2={36} y2={88} w={13}/>
    <L x1={36} y1={88} x2={22} y2={122} w={12}/>
    <L x1={22} y1={122} x2={18} y2={155} w={10}/>
    <L x1={46} y1={94} x2={56} y2={126} w={12}/>
    <L x1={56} y1={126} x2={54} y2={155} w={10}/>
    {/* Arms pressing at angle */}
    <L x1={66} y1={62} x2={56} y2={42} w={10}/>
    <L x1={56} y1={42} x2={60} y2={24} w={9}/>
    <L x1={72} y1={64} x2={80} y2={44} w={10}/>
    <L x1={80} y1={44} x2={76} y2={26} w={9}/>
    <Barbell cx={68} cy={22} half={18}/>
    <Arr x={14} y={80} dir="updown" len={18}/>
  </>;
}

function Fly() {
  // Profile: person flat on bench, arms WIDE open to sides — clearly different from press
  const by = 100;
  return <>
    <LyingOnBench benchY={by}/>
    {/* Arms going WIDE to each side — near-horizontal */}
    <L x1={62} y1={by-6} x2={38} y2={by-28} w={10}/>
    <L x1={38} y1={by-28} x2={14} y2={by-38} w={9}/>
    <L x1={72} y1={by-6} x2={94} y2={by-28} w={10}/>
    <L x1={94} y1={by-28} x2={112} y2={by-38} w={9}/>
    <DB cx={12} cy={by-40}/>
    <DB cx={110} cy={by-40}/>
    {/* Arc showing the closing motion */}
    <path d={`M14,${by-38} Q64,${by-68} 112,${by-38}`} fill="none" stroke={E} strokeWidth={2} strokeDasharray="5,3" opacity={0.7}/>
  </>;
}

function Pushup() {
  // Profile: body plank on floor, arms pushing up
  return <>
    <Floor/>
    <H cx={104} cy={76}/>
    <L x1={95} y1={84} x2={20} y2={100} w={13}/>
    {/* Arms: elbows slightly bent */}
    <L x1={84} y1={88} x2={88} y2={112} w={10}/>
    <L x1={88} y1={112} x2={92} y2={152} w={9}/>
    <L x1={68} y1={92} x2={70} y2={116} w={10}/>
    <L x1={70} y1={116} x2={72} y2={152} w={9}/>
    {/* Legs: toes on floor */}
    <L x1={20} y1={100} x2={6} y2={108} w={12}/>
    <L x1={6} y1={108} x2={4} y2={152} w={10}/>
    <L x1={20} y1={100} x2={36} y2={108} w={12}/>
    <L x1={36} y1={108} x2={38} y2={152} w={10}/>
    <Arr x={54} y={82} dir="updown" len={16}/>
  </>;
}

function Dip() {
  // Parallel bars: body suspended, arms bent at sides
  return <>
    <rect x={18} y={52} width={6} height={100} fill={P}/>
    <rect x={96} y={52} width={6} height={100} fill={P}/>
    <rect x={6} y={44} width={34} height={9} rx={4} fill={E}/>
    <rect x={80} y={44} width={34} height={9} rx={4} fill={E}/>
    <H cx={60} cy={16}/>
    <L x1={60} y1={25} x2={58} y2={62} w={14}/>
    <L x1={52} y1={36} x2={34} y2={46} w={10}/>
    <L x1={34} y1={46} x2={22} y2={56} w={9}/>
    <L x1={68} y1={36} x2={86} y2={46} w={10}/>
    <L x1={86} y1={46} x2={98} y2={56} w={9}/>
    <L x1={50} y1={62} x2={42} y2={96} w={12}/>
    <L x1={42} y1={96} x2={50} y2={126} w={10}/>
    <L x1={66} y1={62} x2={74} y2={96} w={12}/>
    <L x1={74} y1={96} x2={66} y2={126} w={10}/>
    <Arr x={112} y={62} dir="updown" len={26}/>
  </>;
}

// ─── SHOULDERS ────────────────────────────────────────────────────────────────

function OverheadPress() {
  // Front view: bar clearly ABOVE HEAD — bar at y=14 (safe from clip)
  return <>
    <Stand/>
    {/* Arms extended overhead — bar just above head level */}
    <L x1={52} y1={38} x2={42} y2={22} w={10}/>
    <L x1={42} y1={22} x2={44} y2={14} w={9}/>
    <L x1={68} y1={38} x2={78} y2={22} w={10}/>
    <L x1={78} y1={22} x2={76} y2={14} w={9}/>
    {/* Bar above head — plates well within viewBox */}
    <Barbell cx={60} cy={12} half={34}/>
    <Arr x={112} y={36} dir="updown" len={26}/>
  </>;
}

function LateralRaise() {
  // Front view: arms at SHOULDER HEIGHT out to sides — T-shape
  return <>
    <Stand/>
    {/* Arms horizontal, out to sides */}
    <L x1={52} y1={38} x2={20} y2={42} w={10}/>
    <L x1={20} y1={42} x2={6} y2={46} w={9}/>
    <L x1={68} y1={38} x2={100} y2={42} w={10}/>
    <L x1={100} y1={42} x2={114} y2={46} w={9}/>
    {/* Dumbbells — within bounds */}
    <DB cx={6} cy={46}/>
    <DB cx={114} cy={46}/>
    <Arr x={60} y={58} dir="updown" len={14}/>
  </>;
}

function FrontRaise() {
  // Front view: one arm raised FORWARD at shoulder height
  return <>
    <Stand/>
    {/* Left arm raised to front/up */}
    <L x1={52} y1={38} x2={28} y2={22} w={10}/>
    <L x1={28} y1={22} x2={14} y2={14} w={9}/>
    <DB cx={14} cy={14}/>
    {/* Right arm at side */}
    <L x1={68} y1={38} x2={86} y2={62} w={10}/>
    <L x1={86} y1={62} x2={92} y2={88} w={9}/>
    <Arr x={22} y={26} dir="up" len={18}/>
  </>;
}

function Shrug() {
  // Front view: arms DOWN, shoulders RAISED, traps engaged
  return <>
    <Stand/>
    <L x1={52} y1={32} x2={36} y2={60} w={10}/>
    <L x1={36} y1={60} x2={28} y2={92} w={9}/>
    <L x1={68} y1={32} x2={84} y2={60} w={10}/>
    <L x1={84} y1={60} x2={92} y2={92} w={9}/>
    <DBV cx={24} cy={100}/>
    <DBV cx={96} cy={100}/>
    <Arr x={60} y={20} dir="up" len={12}/>
  </>;
}

// ─── BACK ────────────────────────────────────────────────────────────────────

function Pulldown() {
  // Seated, bar pulled DOWN from above to chest
  return <>
    <rect x={4} y={8} width={112} height={7} rx={2} fill={P}/>
    <line x1={60} y1={15} x2={60} y2={38} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <Barbell cx={60} cy={40} half={32}/>
    {/* Seat */}
    <rect x={30} y={116} width={60} height={8} rx={2} fill={P}/>
    <rect x={36} y={124} width={6} height={26} fill={P}/>
    <rect x={78} y={124} width={6} height={26} fill={P}/>
    {/* Person */}
    <H cx={60} cy={60}/>
    <L x1={60} y1={69} x2={60} y2={114} w={14}/>
    <L x1={54} y1={114} x2={32} y2={116} w={12}/>
    <L x1={66} y1={114} x2={88} y2={116} w={12}/>
    {/* Arms reaching UP to bar, pulling DOWN */}
    <L x1={52} y1={78} x2={36} y2={52} w={10}/>
    <L x1={36} y1={52} x2={32} y2={42} w={9}/>
    <L x1={68} y1={78} x2={84} y2={52} w={10}/>
    <L x1={84} y1={52} x2={88} y2={42} w={9}/>
    <Arr x={112} y={70} dir="down" len={24}/>
  </>;
}

function Pullup() {
  // Hanging from bar, chin pulled above bar
  return <>
    <rect x={12} y={8} width={96} height={8} rx={4} fill={E}/>
    <H cx={60} cy={30}/>
    <L x1={60} y1={39} x2={60} y2={86} w={14}/>
    <L x1={54} y1={86} x2={46} y2={126} w={12}/>
    <L x1={46} y1={126} x2={44} y2={156} w={10}/>
    <L x1={66} y1={86} x2={74} y2={126} w={12}/>
    <L x1={74} y1={126} x2={76} y2={156} w={10}/>
    {/* Arms bent, elbows pulling DOWN */}
    <L x1={52} y1={48} x2={34} y2={26} w={10}/>
    <L x1={34} y1={26} x2={30} y2={16} w={9}/>
    <L x1={68} y1={48} x2={86} y2={26} w={10}/>
    <L x1={86} y1={26} x2={90} y2={16} w={9}/>
    <Arr x={110} y={64} dir="updown" len={26}/>
  </>;
}

function RowBent() {
  // Profile: bent ~45°, barbell pulled to lower torso
  return <>
    {/* Person side profile, facing right */}
    <H cx={100} cy={32}/>
    <L x1={92} y1={40} x2={52} y2={82} w={14}/>
    {/* Legs: standing */}
    <L x1={52} y1={82} x2={38} y2={120} w={12}/>
    <L x1={38} y1={120} x2={34} y2={156} w={10}/>
    <L x1={62} y1={86} x2={68} y2={120} w={12}/>
    <L x1={68} y1={120} x2={66} y2={156} w={10}/>
    {/* Arms pulling bar up toward torso */}
    <L x1={72} y1={60} x2={56} y2={90} w={10}/>
    <L x1={56} y1={90} x2={46} y2={132} w={9}/>
    <L x1={78} y1={62} x2={66} y2={92} w={10}/>
    <L x1={66} y1={92} x2={58} y2={132} w={9}/>
    <Barbell cx={52} cy={136} half={38}/>
    <Arr x={114} y={76} dir="up" len={28}/>
  </>;
}

function RowSeated() {
  // Profile: seated, cable pulled from front to abdomen
  return <>
    {/* Cable machine */}
    <rect x={4} y={88} width={12} height={10} rx={2} fill={P}/>
    <line x1={16} y1={93} x2={46} y2={98} stroke={E} strokeWidth={2.5} strokeDasharray="5,2"/>
    {/* Seat */}
    <rect x={52} y={116} width={60} height={8} rx={2} fill={P}/>
    <rect x={58} y={124} width={6} height={26} fill={P}/>
    {/* Person seated, upright back */}
    <H cx={96} cy={58}/>
    <L x1={96} y1={67} x2={92} y2={114} w={14}/>
    {/* Thighs horizontal on seat */}
    <L x1={86} y1={114} x2={54} y2={116} w={12}/>
    <L x1={54} y1={116} x2={40} y2={150} w={10}/>
    {/* Arms pulling cable handle toward belly */}
    <L x1={88} y1={82} x2={62} y2={94} w={10}/>
    <L x1={62} y1={94} x2={46} y2={98} w={9}/>
    <L x1={90} y1={86} x2={68} y2={96} w={10}/>
    <Arr x={114} y={84} dir="updown" len={18}/>
  </>;
}

function ReverseFly() {
  // Bent over, arms raising OUT to sides
  return <>
    <H cx={100} cy={32}/>
    <L x1={92} y1={40} x2={52} y2={82} w={14}/>
    <L x1={52} y1={82} x2={38} y2={120} w={12}/>
    <L x1={38} y1={120} x2={34} y2={156} w={10}/>
    <L x1={62} y1={86} x2={68} y2={120} w={12}/>
    <L x1={68} y1={120} x2={66} y2={156} w={10}/>
    {/* Arms raising UPWARD/OUTWARD from bent position */}
    <L x1={74} y1={60} x2={50} y2={42} w={10}/>
    <L x1={50} y1={42} x2={28} y2={28} w={9}/>
    <L x1={76} y1={62} x2={98} y2={44} w={10}/>
    <L x1={98} y1={44} x2={114} y2={30} w={9}/>
    <DBV cx={24} cy={24}/>
    <DBV cx={114} cy={26}/>
    <path d="M28,28 Q65,50 114,30" fill="none" stroke={E} strokeWidth={2} strokeDasharray="4,3" opacity={0.6}/>
  </>;
}

function BackExtension() {
  // GHD: body extends up from hip pivot
  return <>
    <rect x={4} y={90} width={82} height={7} rx={2} fill={P}/>
    <rect x={8} y={97} width={6} height={46} fill={P}/>
    <rect x={62} y={97} width={6} height={46} fill={P}/>
    <rect x={54} y={80} width={28} height={10} rx={4} fill={E} opacity={0.8}/>
    {/* Body extended upward */}
    <H cx={110} cy={56}/>
    <L x1={102} y1={64} x2={64} y2={88} w={14}/>
    <L x1={64} y1={88} x2={46} y2={94} w={12}/>
    <L x1={46} y1={94} x2={30} y2={124} w={12}/>
    <L x1={30} y1={124} x2={26} y2={156} w={10}/>
    {/* Arms folded on chest */}
    <L x1={94} y1={68} x2={80} y2={72} w={9}/>
    <L x1={82} y1={66} x2={96} y2={72} w={9}/>
    <Arr x={60} y={64} dir="updown" len={20}/>
  </>;
}

// ─── ARMS ─────────────────────────────────────────────────────────────────────

function CurlStanding() {
  // Front view: left arm BENT UP (curl), right arm hanging down
  return <>
    <Stand/>
    {/* LEFT arm curled: upper arm down, forearm bent UP toward shoulder */}
    <L x1={52} y1={38} x2={38} y2={64} w={10}/>
    <L x1={38} y1={64} x2={46} y2={40} w={9}/>
    <DBV cx={44} cy={32}/>
    {/* RIGHT arm hanging straight */}
    <L x1={68} y1={38} x2={84} y2={62} w={10}/>
    <L x1={84} y1={62} x2={90} y2={90} w={9}/>
    <DBV cx={90} cy={98}/>
    <Arr x={24} y={48} dir="up" len={20}/>
  </>;
}

function CurlSeated() {
  // Preacher/incline: arm on pad, forearm curls up
  return <>
    <polygon points="20,156 36,156 94,70 78,70" fill={P}/>
    <rect x={20} y={146} width={16} height={10} fill={P}/>
    <H cx={92} cy={46}/>
    <L x1={88} y1={55} x2={80} y2={84} w={14}/>
    <L x1={72} y1={84} x2={56} y2={118} w={12}/>
    <L x1={56} y1={118} x2={48} y2={156} w={10}/>
    {/* Upper arm on pad, forearm curled UP */}
    <L x1={82} y1={68} x2={62} y2={84} w={10}/>
    <L x1={62} y1={84} x2={54} y2={62} w={9}/>
    <Barbell cx={52} cy={58} half={12}/>
    <Arr x={40} y={72} dir="up" len={20}/>
  </>;
}

function TricepPushdown() {
  // Cable from top, upper arms PINNED to sides, forearms push DOWN
  return <>
    <rect x={4} y={8} width={112} height={7} rx={2} fill={P}/>
    <line x1={60} y1={15} x2={60} y2={42} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <line x1={60} y1={42} x2={46} y2={52} stroke={E} strokeWidth={3} strokeLinecap="round"/>
    <line x1={60} y1={42} x2={74} y2={52} stroke={E} strokeWidth={3} strokeLinecap="round"/>
    <circle cx={46} cy={52} r={5} fill={E}/>
    <circle cx={74} cy={52} r={5} fill={E}/>
    <Stand/>
    {/* Upper arms close to body (vertical/pinned) */}
    <L x1={52} y1={38} x2={48} y2={48} w={10}/>
    <L x1={68} y1={38} x2={72} y2={48} w={10}/>
    {/* Forearms pushing DOWN */}
    <L x1={48} y1={48} x2={46} y2={70} w={9}/>
    <L x1={72} y1={48} x2={74} y2={70} w={9}/>
    <Arr x={114} y={48} dir="down" len={22}/>
  </>;
}

function TricepOverhead() {
  // Weight behind head, elbows up, arms extending overhead
  return <>
    <Stand/>
    {/* Upper arms straight UP beside head */}
    <L x1={52} y1={38} x2={44} y2={14} w={10}/>
    <L x1={68} y1={38} x2={76} y2={14} w={10}/>
    {/* Forearms bent BEHIND head */}
    <L x1={44} y1={14} x2={50} y2={36} w={9}/>
    <L x1={76} y1={14} x2={70} y2={36} w={9}/>
    <rect x={46} y={34} width={28} height={8} rx={3} fill={E}/>
    <Arr x={60} y={20} dir="updown" len={16}/>
  </>;
}

function SkullCrusher() {
  // Lying: upper arms vertical, forearms fold toward forehead
  const by = 100;
  return <>
    <LyingOnBench benchY={by}/>
    {/* Upper arms perpendicular to bench (vertical) */}
    <L x1={64} y1={by-6} x2={62} y2={by-30} w={10}/>
    <L x1={74} y1={by-6} x2={78} y2={by-30} w={10}/>
    {/* Forearms angled back toward head */}
    <L x1={62} y1={by-30} x2={76} y2={by-42} w={9}/>
    <L x1={78} y1={by-30} x2={90} y2={by-42} w={9}/>
    <Barbell cx={83} cy={by-46} half={14}/>
    <Arr x={16} y={by-32} dir="updown" len={18}/>
  </>;
}

// ─── LEGS ─────────────────────────────────────────────────────────────────────

function Squat() {
  // Profile side view: bar on back, KNEES DEEPLY BENT — most recognizable view
  return <>
    {/* Bar across back/shoulders, spanning wide */}
    <Barbell cx={60} cy={38} half={50}/>
    {/* Head: slightly in front of bar */}
    <H cx={78} cy={22}/>
    {/* Torso: angled forward in deep squat */}
    <L x1={72} y1={30} x2={56} y2={78} w={14}/>
    {/* Arms holding bar */}
    <L x1={66} y1={38} x2={28} y2={42} w={9}/>
    <L x1={70} y1={38} x2={96} y2={40} w={9}/>
    {/* LEFT LEG (front leg in side view): thigh forward, shin back */}
    <L x1={52} y1={78} x2={76} y2={112} w={12}/>
    <L x1={76} y1={112} x2={62} y2={154} w={10}/>
    {/* RIGHT LEG (back leg): thigh back, shin forward */}
    <L x1={58} y1={80} x2={34} y2={114} w={12}/>
    <L x1={34} y1={114} x2={46} y2={154} w={10}/>
    <Arr x={114} y={92} dir="updown" len={24}/>
  </>;
}

function Deadlift() {
  // Profile: bar on FLOOR, back ~60°, knees BENT picking up bar
  return <>
    {/* Head tilted forward */}
    <H cx={96} cy={30}/>
    {/* Back: angled ~60° from vertical */}
    <L x1={88} y1={38} x2={48} y2={80} w={14}/>
    {/* Arms: straight down to bar on floor */}
    <L x1={68} y1={58} x2={52} y2={86} w={10}/>
    <L x1={52} y1={86} x2={44} y2={130} w={9}/>
    <L x1={76} y1={60} x2={62} y2={88} w={10}/>
    <L x1={62} y1={88} x2={56} y2={130} w={9}/>
    {/* Legs: KNEES BENT significantly */}
    <L x1={48} y1={80} x2={28} y2={114} w={12}/>
    <L x1={28} y1={114} x2={24} y2={154} w={10}/>
    <L x1={60} y1={84} x2={70} y2={114} w={12}/>
    <L x1={70} y1={114} x2={72} y2={154} w={10}/>
    {/* Bar on floor */}
    <Barbell cx={50} cy={134} half={42}/>
    <Arr x={114} y={78} dir="up" len={28}/>
  </>;
}

function RDL() {
  // Profile: back NEARLY HORIZONTAL, STRAIGHT legs — key contrast vs Deadlift
  return <>
    <H cx={104} cy={28}/>
    {/* Back almost horizontal — clearly different from deadlift */}
    <L x1={96} y1={36} x2={44} y2={72} w={14}/>
    {/* Arms hanging down straight */}
    <L x1={72} y1={52} x2={56} y2={76} w={10}/>
    <L x1={56} y1={76} x2={46} y2={110} w={9}/>
    <L x1={80} y1={54} x2={68} y2={78} w={10}/>
    <L x1={68} y1={78} x2={60} y2={110} w={9}/>
    {/* LEGS NEARLY STRAIGHT — minimal knee bend */}
    <L x1={44} y1={72} x2={30} y2={112} w={12}/>
    <L x1={30} y1={112} x2={26} y2={154} w={10}/>
    <L x1={56} y1={74} x2={64} y2={112} w={12}/>
    <L x1={64} y1={112} x2={66} y2={154} w={10}/>
    {/* Bar at thigh/shin level */}
    <Barbell cx={53} cy={114} half={38}/>
    <Arr x={114} y={70} dir="updown" len={22}/>
  </>;
}

function HipThrust() {
  // Back on bench, hips HIGH, bar on hips
  return <>
    <FlatBench y={52}/>
    <Floor/>
    {/* Person: upper back on bench, hips raised, feet on floor */}
    <H cx={108} cy={38}/>
    <L x1={100} y1={46} x2={64} y2={58} w={14}/>
    <L x1={64} y1={58} x2={50} y2={78} w={14}/>
    {/* Legs bent, feet on floor */}
    <L x1={50} y1={78} x2={34} y2={118} w={12}/>
    <L x1={34} y1={118} x2={28} y2={154} w={10}/>
    <L x1={56} y1={80} x2={68} y2={116} w={12}/>
    <L x1={68} y1={116} x2={70} y2={154} w={10}/>
    {/* Bar across hips */}
    <Barbell cx={57} cy={76} half={30}/>
    <Arr x={16} y={80} dir="updown" len={22}/>
  </>;
}

function Lunge() {
  // Front view: VERY CLEAR split stance — front leg bent, back knee near floor
  return <>
    <Floor/>
    <H cx={60} cy={14}/>
    <L x1={60} y1={23} x2={60} y2={68} w={14}/>
    {/* Arms with dumbbells at sides */}
    <L x1={52} y1={38} x2={18} y2={68} w={10}/>
    <L x1={18} y1={68} x2={10} y2={98} w={9}/>
    <DBV cx={8} cy={106}/>
    <L x1={68} y1={38} x2={102} y2={68} w={10}/>
    <L x1={102} y1={68} x2={110} y2={98} w={9}/>
    <DBV cx={112} cy={106}/>
    {/* FRONT LEG: thigh forward-down, shin nearly vertical */}
    <L x1={54} y1={68} x2={28} y2={108} w={12}/>
    <L x1={28} y1={108} x2={24} y2={154} w={10}/>
    {/* BACK LEG: thigh backward-down, knee NEAR FLOOR */}
    <L x1={66} y1={68} x2={92} y2={110} w={12}/>
    <L x1={92} y1={110} x2={98} y2={144} w={10}/>
    {/* Back knee indicator — near floor */}
    <circle cx={98} cy={144} r={8} fill={E} opacity={0.35}/>
    <Arr x={116} y={102} dir="updown" len={26}/>
  </>;
}

function LegCurl() {
  // LYING FACE DOWN — shin curling UP toward butt
  return <>
    <FlatBench y={78}/>
    {/* Roller pad at ankle end */}
    <rect x={8} y={64} width={26} height={14} rx={5} fill={E} opacity={0.9}/>
    {/* Figure PRONE — head at RIGHT, face down */}
    <H cx={108} cy={60}/>
    <L x1={99} y1={68} x2={26} y2={70} w={14}/>
    {/* THIGH: flat on bench */}
    <L x1={26} y1={70} x2={14} y2={82} w={12}/>
    {/* SHIN: curled UP — this is the KEY feature, clearly going upward */}
    <L x1={14} y1={82} x2={20} y2={50} w={10}/>
    {/* Arrow pointing up clearly showing the curling motion */}
    <Arr x={8} y={46} dir="up" len={24}/>
    {/* Hands near head */}
    <L x1={90} y1={68} x2={86} y2={84} w={9}/>
  </>;
}

function LegExtension() {
  // SEATED on machine — shin clearly EXTENDING FORWARD from bent
  return <>
    {/* Machine: seat back + seat + legs */}
    <rect x={76} y={44} width={38} height={64} rx={3} fill={P}/>
    <rect x={46} y={62} width={68} height={16} rx={3} fill={P}/>
    <rect x={50} y={78} width={6} height={54} fill={P}/>
    <rect x={108} y={78} width={6} height={54} fill={P}/>
    {/* Shin roller at foot */}
    <rect x={6} y={96} width={28} height={12} rx={5} fill={E} opacity={0.9}/>
    {/* Person seated */}
    <H cx={96} cy={36}/>
    <L x1={96} y1={45} x2={92} y2={78} w={14}/>
    {/* Thigh HORIZONTAL on seat */}
    <L x1={86} y1={78} x2={50} y2={80} w={12}/>
    {/* SHIN EXTENDED FORWARD — horizontal from bent position */}
    <L x1={50} y1={80} x2={22} y2={98} w={10}/>
    <L x1={22} y1={98} x2={6} y2={104} w={10}/>
    {/* Arms on arm rests */}
    <L x1={88} y1={56} x2={78} y2={68} w={9}/>
    {/* Arrow showing extension direction */}
    <Arr x={4} y={90} dir="up" len={22}/>
  </>;
}

function CalfRaise() {
  // Standing on elevated step, heels RAISED (tiptoe)
  return <>
    <rect x={16} y={128} width={88} height={10} rx={2} fill={P}/>
    <Floor y={154}/>
    <H cx={60} cy={14}/>
    <L x1={60} y1={23} x2={60} y2={68} w={14}/>
    {/* Arms at sides holding dumbbells */}
    <L x1={52} y1={38} x2={34} y2={62} w={10}/>
    <L x1={34} y1={62} x2={26} y2={90} w={9}/>
    <DBV cx={22} cy={98}/>
    <L x1={68} y1={38} x2={86} y2={62} w={10}/>
    <L x1={86} y1={62} x2={94} y2={90} w={9}/>
    <DBV cx={98} cy={98}/>
    {/* Legs: HEELS RAISED, standing on TOES */}
    <L x1={54} y1={68} x2={46} y2={108} w={12}/>
    <L x1={46} y1={108} x2={44} y2={128} w={10}/>
    <L x1={66} y1={68} x2={74} y2={108} w={12}/>
    <L x1={74} y1={108} x2={76} y2={128} w={10}/>
    {/* Toes on step */}
    <circle cx={44} cy={128} r={5} fill={B}/>
    <circle cx={76} cy={128} r={5} fill={B}/>
    <Arr x={114} y={104} dir="updown" len={18}/>
  </>;
}

// ─── CORE ────────────────────────────────────────────────────────────────────

function Plank() {
  // Profile: rigid horizontal body, forearms on floor
  return <>
    <Floor/>
    <H cx={104} cy={80}/>
    {/* Rigid body, horizontal */}
    <L x1={95} y1={88} x2={18} y2={106} w={14}/>
    {/* FOREARMS on floor — elbows and hands down */}
    <L x1={82} y1={92} x2={88} y2={116} w={10}/>
    <L x1={88} y1={116} x2={96} y2={152} w={9}/>
    <L x1={66} y1={95} x2={70} y2={118} w={10}/>
    <L x1={70} y1={118} x2={76} y2={152} w={9}/>
    {/* Legs */}
    <L x1={18} y1={106} x2={6} y2={116} w={12}/>
    <L x1={6} y1={116} x2={4} y2={152} w={10}/>
    <L x1={18} y1={106} x2={32} y2={116} w={12}/>
    <L x1={32} y1={116} x2={36} y2={152} w={10}/>
    <text x={60} y={148} textAnchor="middle" fontSize={9} fill={E} fontFamily="system-ui" fontWeight={700} letterSpacing={1}>HOLD</text>
  </>;
}

function Crunch() {
  // Profile: UPPER torso curls up, HIPS STAY on floor
  return <>
    <Floor/>
    {/* Lower back + hips flat on floor */}
    <L x1={14} y1={132} x2={48} y2={128} w={12}/>
    {/* Knees bent */}
    <L x1={14} y1={132} x2={32} y2={106} w={12}/>
    <L x1={32} y1={106} x2={62} y2={118} w={10}/>
    <L x1={62} y1={118} x2={70} y2={152} w={10}/>
    {/* UPPER TORSO CURLING UP */}
    <L x1={48} y1={128} x2={66} y2={110} w={14}/>
    <L x1={66} y1={110} x2={80} y2={84} w={14}/>
    <H cx={86} cy={74}/>
    {/* Hands behind head */}
    <L x1={80} y1={78} x2={66} y2={66} w={9}/>
    <L x1={88} y1={70} x2={104} y2={62} w={9}/>
    <Arr x={52} y={112} dir="up" len={20}/>
  </>;
}

function HangingLegRaise() {
  // Hanging from bar, LEGS RAISED to 90°
  return <>
    <rect x={12} y={8} width={96} height={8} rx={4} fill={E}/>
    <H cx={60} cy={30}/>
    <L x1={60} y1={39} x2={60} y2={84} w={14}/>
    {/* Arms gripping bar */}
    <L x1={52} y1={48} x2={34} y2={26} w={10}/>
    <L x1={34} y1={26} x2={30} y2={16} w={9}/>
    <L x1={68} y1={48} x2={86} y2={26} w={10}/>
    <L x1={86} y1={26} x2={90} y2={16} w={9}/>
    {/* LEGS RAISED HORIZONTAL */}
    <L x1={54} y1={84} x2={32} y2={86} w={12}/>
    <L x1={32} y1={86} x2={14} y2={116} w={10}/>
    <L x1={66} y1={84} x2={88} y2={86} w={12}/>
    <L x1={88} y1={86} x2={106} y2={116} w={10}/>
    <Arr x={60} y={110} dir="up" len={22}/>
  </>;
}

function KettlebellSwing() {
  // Profile: hip hinge, KB swings from between legs to chest height
  return <>
    <Floor/>
    <H cx={88} cy={34}/>
    <L x1={80} y1={42} x2={42} y2={84} w={14}/>
    <L x1={42} y1={84} x2={26} y2={120} w={12}/>
    <L x1={26} y1={120} x2={20} y2={154} w={10}/>
    <L x1={54} y1={88} x2={62} y2={120} w={12}/>
    <L x1={62} y1={120} x2={64} y2={154} w={10}/>
    {/* Arms swinging KB forward */}
    <L x1={62} y1={60} x2={46} y2={76} w={10}/>
    <L x1={46} y1={76} x2={30} y2={64} w={9}/>
    {/* Kettlebell */}
    <rect x={18} y={56} width={18} height={14} rx={4} fill={E}/>
    <path d="M22,56 Q27,48 34,56" fill="none" stroke={E} strokeWidth={2.5} strokeLinecap="round"/>
    <Arr x={114} y={86} dir="up" len={28}/>
  </>;
}

function AbWheel() {
  // Profile: on knees, arms extended rolling wheel forward
  return <>
    <Floor/>
    <circle cx={36} cy={144} r={11} fill="none" stroke={E} strokeWidth={3}/>
    <line x1={20} y1={144} x2={52} y2={144} stroke={E} strokeWidth={3} strokeLinecap="round"/>
    <H cx={106} cy={68}/>
    <L x1={98} y1={76} x2={48} y2={108} w={14}/>
    {/* Arms extended to wheel */}
    <L x1={78} y1={84} x2={58} y2={112} w={10}/>
    <L x1={58} y1={112} x2={40} y2={144} w={9}/>
    <L x1={84} y1={86} x2={66} y2={114} w={10}/>
    {/* Knees on floor */}
    <L x1={48} y1={108} x2={36} y2={130} w={12}/>
    <L x1={36} y1={130} x2={30} y2={154} w={10}/>
    <L x1={48} y1={108} x2={60} y2={130} w={12}/>
    <L x1={60} y1={130} x2={62} y2={154} w={10}/>
    <Arr x={24} y={116} dir="down" len={20}/>
  </>;
}

function RussianTwist() {
  // V-sit, arms rotate to one side
  return <>
    <Floor/>
    <H cx={64} cy={50}/>
    <L x1={64} y1={59} x2={58} y2={96} w={14}/>
    {/* Legs raised and bent */}
    <L x1={48} y1={96} x2={30} y2={124} w={12}/>
    <L x1={30} y1={124} x2={34} y2={152} w={10}/>
    <L x1={68} y1={96} x2={76} y2={124} w={12}/>
    <L x1={76} y1={124} x2={74} y2={152} w={10}/>
    {/* Arms reaching to ONE SIDE */}
    <L x1={58} y1={70} x2={36} y2={60} w={10}/>
    <L x1={36} y1={60} x2={18} y2={52} w={9}/>
    <rect x={8} y={46} width={14} height={8} rx={3} fill={E}/>
    <Arr x={96} y={66} dir="updown" len={16}/>
  </>;
}

function Rotation() {
  // Pallof press / cable anti-rotation
  return <>
    <rect x={4} y={74} width={12} height={10} rx={2} fill={P}/>
    <line x1={16} y1={79} x2={46} y2={79} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <Stand/>
    <L x1={52} y1={42} x2={38} y2={66} w={10}/>
    <L x1={38} y1={66} x2={46} y2={78} w={9}/>
    <L x1={68} y1={42} x2={80} y2={62} w={10}/>
    <L x1={80} y1={62} x2={82} y2={74} w={9}/>
    <path d="M38,79 Q60,62 86,74" fill="none" stroke={E} strokeWidth={2} strokeDasharray="5,3" opacity={0.8}/>
  </>;
}

function Compound() {
  // Generic compound — standing overhead press position, bar visible
  return <>
    <Stand/>
    <L x1={52} y1={38} x2={44} y2={22} w={10}/>
    <L x1={44} y1={22} x2={46} y2={14} w={9}/>
    <L x1={68} y1={38} x2={76} y2={22} w={10}/>
    <L x1={76} y1={22} x2={74} y2={14} w={9}/>
    {/* Bar safely above head, within bounds */}
    <Barbell cx={60} cy={12} half={34}/>
    <Arr x={114} y={38} dir="updown" len={24}/>
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

  // ── CORE ──────────────────────────────────────────────────────────────────
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

  // ── PUSH ──────────────────────────────────────────────────────────────────
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

  // ── PULL ──────────────────────────────────────────────────────────────────
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

  // ── LEGS ──────────────────────────────────────────────────────────────────
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
    if (n.includes("abductor")||n.includes("aductor")) return "lateral-raise";
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
  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={Math.round(size * 1.33)}
      style={{ display:"block" }}
      aria-label={`Ilustración: ${name}`}
    >
      <Figure/>
    </svg>
  );
}
