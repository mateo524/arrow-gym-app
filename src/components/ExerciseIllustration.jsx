// Exercise illustrations — thick-limb solid style.
// viewBox 0 0 120 160. strokeLinecap=round + strokeWidth 10-14 = solid-looking limbs.

const B  = "#7bacc4";   // body
const E  = "#a855f7";   // equipment / purple
const P  = "#2a3747";   // platform / bench dark
const PL = "#3d5166";   // bench lighter

function L({ x1,y1,x2,y2,w=11,c=B }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round"/>;
}
function H({ cx,cy,r=9 }) {
  return <circle cx={cx} cy={cy} r={r} fill={B}/>;
}
function Bar({ x,y,len=76 }) {
  return <>
    <rect x={x} y={y-2} width={len} height={5} rx={2} fill={E}/>
    <rect x={x-2} y={y-7} width={9} height={15} rx={1} fill={E} opacity={0.75}/>
    <rect x={x+len-7} y={y-7} width={9} height={15} rx={1} fill={E} opacity={0.75}/>
  </>;
}
function Dv({ x,y }) {
  return <>
    <rect x={x-4} y={y} width={9} height={14} rx={2} fill={E}/>
    <rect x={x-8} y={y+2} width={17} height={4} rx={1} fill={E} opacity={0.7}/>
    <rect x={x-8} y={y+8} width={17} height={4} rx={1} fill={E} opacity={0.7}/>
  </>;
}
function Dh({ x,y }) {
  return <>
    <rect x={x} y={y-4} width={14} height={9} rx={2} fill={E}/>
    <rect x={x+2} y={y-8} width={4} height={17} rx={1} fill={E} opacity={0.7}/>
    <rect x={x+8} y={y-8} width={4} height={17} rx={1} fill={E} opacity={0.7}/>
  </>;
}
function Bench({ x,y,w=90,h=7 }) {
  return <>
    <rect x={x} y={y} width={w} height={h} rx={3} fill={P}/>
    <rect x={x+4} y={y+h} width={6} height={28} fill={P}/>
    <rect x={x+w-10} y={y+h} width={6} height={28} fill={P}/>
  </>;
}
function Floor({ y=152 }) {
  return <line x1={4} y1={y} x2={116} y2={y} stroke={PL} strokeWidth={5} strokeLinecap="round"/>;
}
function Arr({ x,y,dir="up",len=20 }) {
  const u = `M${x},${y+len} L${x},${y} M${x-5},${y+9} L${x},${y} L${x+5},${y+9}`;
  const d = `M${x},${y} L${x},${y+len} M${x-5},${y+len-9} L${x},${y+len} L${x+5},${y+len-9}`;
  const ud = `M${x},${y} L${x},${y+len} M${x-4},${y+8} L${x},${y} L${x+4},${y+8} M${x-4},${y+len-8} L${x},${y+len} L${x+4},${y+len-8}`;
  const paths = { up:u, down:d, updown:ud };
  return <path d={paths[dir]||u} stroke={E} fill="none" strokeWidth={2.5} strokeLinecap="round"/>;
}

// Standing base: head + torso + legs
function StandBase() {
  return <>
    <H cx={60} cy={14}/>
    <L x1={60} y1={23} x2={60} y2={68} w={14}/>
    <L x1={54} y1={68} x2={46} y2={106} w={12}/>
    <L x1={46} y1={106} x2={42} y2={150} w={10}/>
    <L x1={66} y1={68} x2={74} y2={106} w={12}/>
    <L x1={74} y1={106} x2={78} y2={150} w={10}/>
  </>;
}

// ─── CHEST ───────────────────────────────────────────────────────────────────

function BenchHorizontal() {
  // Lying flat, bar pressed up from chest — arms bent then extended up
  return <>
    <Bench x={8} y={82} w={104}/>
    <H cx={106} cy={63}/>
    <L x1={97} y1={71} x2={20} y2={73} w={14}/>
    <L x1={20} y1={73} x2={12} y2={108} w={12}/>
    <L x1={12} y1={108} x2={16} y2={154} w={10}/>
    <L x1={28} y1={73} x2={30} y2={108} w={12}/>
    <L x1={30} y1={108} x2={34} y2={154} w={10}/>
    {/* Arms: upper arms diagonal, forearms VERTICAL pressing bar up */}
    <L x1={65} y1={73} x2={54} y2={52} w={10}/>
    <L x1={54} y1={52} x2={58} y2={28} w={9}/>
    <L x1={73} y1={73} x2={80} y2={52} w={10}/>
    <L x1={80} y1={52} x2={76} y2={28} w={9}/>
    <Bar x={42} y={26} len={34}/>
    <Arr x={14} y={68} dir="updown" len={18}/>
  </>;
}

function BenchIncline() {
  // Bench at ~45°, pressing bar upward at angle
  return <>
    <polygon points="10,154 26,154 96,50 80,50" fill={P}/>
    <rect x={10} y={122} width={16} height={32} fill={P}/>
    <H cx={90} cy={34}/>
    <L x1={82} y1={42} x2={34} y2={92} w={14}/>
    <L x1={34} y1={92} x2={20} y2={130} w={12}/>
    <L x1={20} y1={130} x2={16} y2={154} w={10}/>
    <L x1={44} y1={94} x2={52} y2={130} w={12}/>
    <L x1={52} y1={130} x2={50} y2={154} w={10}/>
    <L x1={62} y1={64} x2={52} y2={44} w={10}/>
    <L x1={52} y1={44} x2={56} y2={24} w={9}/>
    <L x1={68} y1={66} x2={76} y2={46} w={10}/>
    <L x1={76} y1={46} x2={72} y2={26} w={9}/>
    <Bar x={38} y={22} len={36}/>
    <Arr x={14} y={82} dir="updown" len={18}/>
  </>;
}

function Dip() {
  // Parallel bars dip: arms supporting body, elbows bent
  return <>
    <rect x={18} y={56} width={6} height={96} fill={P}/>
    <rect x={96} y={56} width={6} height={96} fill={P}/>
    <rect x={6} y={48} width={34} height={9} rx={4} fill={E}/>
    <rect x={80} y={48} width={34} height={9} rx={4} fill={E}/>
    <H cx={60} cy={16}/>
    <L x1={60} y1={25} x2={58} y2={64} w={14}/>
    <L x1={52} y1={36} x2={36} y2={48} w={10}/>
    <L x1={36} y1={48} x2={22} y2={58} w={9}/>
    <L x1={68} y1={36} x2={84} y2={48} w={10}/>
    <L x1={84} y1={48} x2={98} y2={58} w={9}/>
    <L x1={50} y1={64} x2={42} y2={96} w={12}/>
    <L x1={42} y1={96} x2={50} y2={124} w={10}/>
    <L x1={66} y1={64} x2={74} y2={96} w={12}/>
    <L x1={74} y1={96} x2={66} y2={124} w={10}/>
    <Arr x={112} y={66} dir="updown" len={24}/>
  </>;
}

function Pushup() {
  // Body in plank, arms pushing up from floor
  return <>
    <Floor/>
    <H cx={100} cy={80}/>
    <L x1={91} y1={88} x2={22} y2={106} w={14}/>
    <L x1={82} y1={92} x2={86} y2={118} w={10}/>
    <L x1={86} y1={118} x2={92} y2={152} w={9}/>
    <L x1={68} y1={96} x2={68} y2={120} w={10}/>
    <L x1={68} y1={120} x2={72} y2={152} w={9}/>
    <L x1={22} y1={106} x2={8} y2={118} w={12}/>
    <L x1={8} y1={118} x2={4} y2={152} w={10}/>
    <L x1={22} y1={106} x2={36} y2={118} w={12}/>
    <L x1={36} y1={118} x2={42} y2={152} w={10}/>
    <Arr x={52} y={86} dir="updown" len={18}/>
  </>;
}

function Fly() {
  // Flat bench, arms wide open to sides with dumbbells (NOT pressing up)
  return <>
    <Bench x={8} y={82} w={104}/>
    <H cx={106} cy={63}/>
    <L x1={97} y1={71} x2={20} y2={73} w={14}/>
    <L x1={20} y1={73} x2={12} y2={108} w={12}/>
    <L x1={12} y1={108} x2={16} y2={154} w={10}/>
    {/* Arms WIDE open — nearly horizontal, low arc */}
    <L x1={66} y1={73} x2={42} y2={48} w={10}/>
    <L x1={42} y1={48} x2={20} y2={36} w={9}/>
    <L x1={72} y1={73} x2={94} y2={48} w={10}/>
    <L x1={94} y1={48} x2={114} y2={36} w={9}/>
    <Dv x={14} y={29}/>
    <Dv x={110} y={29}/>
    <path d="M20,36 Q67,18 114,36" fill="none" stroke={E} strokeWidth={2} strokeDasharray="5,3" opacity={0.7}/>
  </>;
}

// ─── SHOULDERS ────────────────────────────────────────────────────────────────

function OverheadPress() {
  // Standing, bar pressed from shoulders to overhead
  return <>
    <StandBase/>
    <L x1={52} y1={34} x2={40} y2={14} w={10}/>
    <L x1={40} y1={14} x2={40} y2={2} w={9}/>
    <L x1={68} y1={34} x2={80} y2={14} w={10}/>
    <L x1={80} y1={14} x2={80} y2={2} w={9}/>
    <Bar x={22} y={0} len={76}/>
    <Arr x={110} y={36} dir="updown" len={24}/>
  </>;
}

function LateralRaise() {
  // Standing, arms raised out to sides at shoulder height
  return <>
    <StandBase/>
    <L x1={52} y1={34} x2={18} y2={38} w={10}/>
    <L x1={18} y1={38} x2={4} y2={44} w={9}/>
    <L x1={68} y1={34} x2={102} y2={38} w={10}/>
    <L x1={102} y1={38} x2={116} y2={44} w={9}/>
    <Dh x={-4} y={40}/>
    <Dh x={108} y={40}/>
    <Arr x={60} y={56} dir="updown" len={14}/>
  </>;
}

function FrontRaise() {
  // Standing, one arm raised forward to shoulder height
  return <>
    <StandBase/>
    <L x1={52} y1={34} x2={30} y2={18} w={10}/>
    <L x1={30} y1={18} x2={16} y2={10} w={9}/>
    <Dh x={2} y={6}/>
    <L x1={68} y1={34} x2={86} y2={58} w={10}/>
    <L x1={86} y1={58} x2={92} y2={84} w={9}/>
    <Arr x={24} y={26} dir="up" len={18}/>
  </>;
}

function Shrug() {
  // Standing, arms straight down with dumbbells, shoulders raised
  return <>
    <StandBase/>
    <L x1={52} y1={30} x2={36} y2={58} w={10}/>
    <L x1={36} y1={58} x2={28} y2={90} w={9}/>
    <L x1={68} y1={30} x2={84} y2={58} w={10}/>
    <L x1={84} y1={58} x2={92} y2={90} w={9}/>
    <Dv x={22} y={88}/>
    <Dv x={88} y={88}/>
    <Arr x={60} y={18} dir="up" len={14}/>
  </>;
}

// ─── BACK ────────────────────────────────────────────────────────────────────

function Pulldown() {
  // Seated at lat machine, arms pulling bar DOWN to chest
  return <>
    <rect x={4} y={4} width={112} height={8} rx={2} fill={P}/>
    <line x1={60} y1={12} x2={60} y2={38} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <Bar x={26} y={36} len={68}/>
    <Bench x={28} y={118} w={64}/>
    <rect x={34} y={126} width={6} height={26} fill={P}/>
    <rect x={80} y={126} width={6} height={26} fill={P}/>
    <H cx={60} cy={60}/>
    <L x1={60} y1={69} x2={60} y2={116} w={14}/>
    <L x1={54} y1={116} x2={28} y2={118} w={12}/>
    <L x1={66} y1={116} x2={92} y2={118} w={12}/>
    {/* Arms reaching UP to bar, elbows pulled DOWN */}
    <L x1={52} y1={78} x2={36} y2={50} w={10}/>
    <L x1={36} y1={50} x2={32} y2={40} w={9}/>
    <L x1={68} y1={78} x2={84} y2={50} w={10}/>
    <L x1={84} y1={50} x2={88} y2={40} w={9}/>
    <Arr x={110} y={70} dir="down" len={22}/>
  </>;
}

function Pullup() {
  // Hanging from bar, chin above bar — arms bent
  return <>
    <rect x={12} y={6} width={96} height={9} rx={4} fill={E}/>
    <H cx={60} cy={30}/>
    <L x1={60} y1={39} x2={60} y2={86} w={14}/>
    <L x1={54} y1={86} x2={46} y2={126} w={12}/>
    <L x1={46} y1={126} x2={44} y2={158} w={10}/>
    <L x1={66} y1={86} x2={74} y2={126} w={12}/>
    <L x1={74} y1={126} x2={76} y2={158} w={10}/>
    {/* Arms bent, elbows pointing down, hands at bar */}
    <L x1={52} y1={48} x2={34} y2={26} w={10}/>
    <L x1={34} y1={26} x2={30} y2={14} w={9}/>
    <L x1={68} y1={48} x2={86} y2={26} w={10}/>
    <L x1={86} y1={26} x2={90} y2={14} w={9}/>
    <Arr x={110} y={66} dir="updown" len={24}/>
  </>;
}

function RowBent() {
  // Bent-over ~45°, pulling barbell up to lower chest
  return <>
    <Bar x={12} y={136} len={78}/>
    <H cx={96} cy={36}/>
    <L x1={88} y1={44} x2={42} y2={88} w={14}/>
    <L x1={42} y1={88} x2={28} y2={126} w={12}/>
    <L x1={28} y1={126} x2={24} y2={156} w={10}/>
    <L x1={52} y1={92} x2={60} y2={126} w={12}/>
    <L x1={60} y1={126} x2={58} y2={156} w={10}/>
    {/* Arms: upper arms beside torso, forearms reaching DOWN to bar */}
    <L x1={70} y1={64} x2={56} y2={94} w={10}/>
    <L x1={56} y1={94} x2={48} y2={138} w={9}/>
    <L x1={74} y1={66} x2={64} y2={96} w={10}/>
    <L x1={64} y1={96} x2={60} y2={138} w={9}/>
    <Arr x={112} y={78} dir="up" len={26}/>
  </>;
}

function RowSeated() {
  // Seated, pulling cable toward abdomen
  return <>
    <rect x={0} y={92} width={10} height={8} rx={2} fill={P}/>
    <line x1={10} y1={96} x2={40} y2={96} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <Bench x={48} y={118} w={64}/>
    <H cx={90} cy={58}/>
    <L x1={90} y1={67} x2={88} y2={116} w={14}/>
    <L x1={82} y1={116} x2={52} y2={118} w={12}/>
    <L x1={52} y1={118} x2={38} y2={152} w={10}/>
    {/* Arms pulling cable from front to belly */}
    <L x1={82} y1={80} x2={56} y2={92} w={10}/>
    <L x1={56} y1={92} x2={40} y2={96} w={9}/>
    <L x1={84} y1={82} x2={60} y2={95} w={10}/>
    <Arr x={112} y={84} dir="updown" len={18}/>
  </>;
}

function ReverseFly() {
  // Bent-over, arms raising OUT to sides
  return <>
    <H cx={96} cy={36}/>
    <L x1={88} y1={44} x2={42} y2={88} w={14}/>
    <L x1={42} y1={88} x2={28} y2={126} w={12}/>
    <L x1={28} y1={126} x2={24} y2={156} w={10}/>
    <L x1={52} y1={92} x2={60} y2={126} w={12}/>
    <L x1={60} y1={126} x2={58} y2={156} w={10}/>
    {/* Arms raising UPWARD/OUTWARD */}
    <L x1={72} y1={64} x2={48} y2={44} w={10}/>
    <L x1={48} y1={44} x2={26} y2={30} w={9}/>
    <L x1={74} y1={66} x2={96} y2={46} w={10}/>
    <L x1={96} y1={46} x2={114} y2={32} w={9}/>
    <Dv x={18} y={24}/>
    <Dv x={110} y={26}/>
    <path d="M26,30 Q62,52 114,32" fill="none" stroke={E} strokeWidth={2} strokeDasharray="4,3" opacity={0.6}/>
  </>;
}

function BackExtension() {
  // GHD: body hinging at hips, torso raises up
  return <>
    <rect x={4} y={86} width={80} height={8} rx={2} fill={P}/>
    <rect x={8} y={94} width={6} height={46} fill={P}/>
    <rect x={60} y={94} width={6} height={46} fill={P}/>
    <rect x={52} y={76} width={30} height={10} rx={4} fill={E} opacity={0.8}/>
    <H cx={108} cy={58}/>
    <L x1={100} y1={66} x2={62} y2={84} w={14}/>
    <L x1={62} y1={84} x2={46} y2={92} w={12}/>
    <L x1={46} y1={92} x2={32} y2={122} w={12}/>
    <L x1={32} y1={122} x2={28} y2={152} w={10}/>
    {/* Arms folded on chest */}
    <L x1={92} y1={70} x2={76} y2={74} w={9}/>
    <L x1={76} y1={68} x2={92} y2={74} w={9}/>
    <Arr x={60} y={66} dir="updown" len={18}/>
  </>;
}

// ─── ARMS ─────────────────────────────────────────────────────────────────────

function CurlStanding() {
  // Standing, forearm BENT UP (curl) — upper arm stays vertical
  return <>
    <StandBase/>
    {/* LEFT arm: upper arm hanging down, forearm curled UP toward shoulder */}
    <L x1={52} y1={34} x2={38} y2={62} w={10}/>
    <L x1={38} y1={62} x2={46} y2={38} w={9}/>
    <Dv x={40} y={30}/>
    {/* RIGHT arm hanging at side */}
    <L x1={68} y1={34} x2={84} y2={60} w={10}/>
    <L x1={84} y1={60} x2={90} y2={88} w={9}/>
    <Dv x={86} y={86}/>
    <Arr x={26} y={52} dir="up" len={20}/>
  </>;
}

function CurlSeated() {
  // Preacher bench: arm resting on incline, forearm curls up
  return <>
    <polygon points="20,156 36,156 92,72 76,72" fill={P}/>
    <rect x={20} y={146} width={16} height={10} fill={P}/>
    <H cx={90} cy={48}/>
    <L x1={86} y1={57} x2={78} y2={86} w={14}/>
    <L x1={70} y1={86} x2={54} y2={120} w={12}/>
    <L x1={54} y1={120} x2={46} y2={156} w={10}/>
    {/* Upper arm on pad, forearm curled UP */}
    <L x1={80} y1={70} x2={62} y2={86} w={10}/>
    <L x1={62} y1={86} x2={54} y2={66} w={9}/>
    <Bar x={42} y={62} len={18}/>
    <Arr x={42} y={74} dir="up" len={20}/>
  </>;
}

function TricepPushdown() {
  // Standing, cable from above, upper arms PINNED to sides, forearms push DOWN
  return <>
    <rect x={4} y={4} width={112} height={8} rx={2} fill={P}/>
    <line x1={60} y1={12} x2={60} y2={36} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <line x1={60} y1={36} x2={46} y2={46} stroke={E} strokeWidth={3} strokeLinecap="round"/>
    <line x1={60} y1={36} x2={74} y2={46} stroke={E} strokeWidth={3} strokeLinecap="round"/>
    <circle cx={46} cy={46} r={4} fill={E}/>
    <circle cx={74} cy={46} r={4} fill={E}/>
    <StandBase/>
    {/* Upper arms nearly vertical (pinned at sides) */}
    <L x1={52} y1={34} x2={48} y2={42} w={10}/>
    <L x1={68} y1={34} x2={72} y2={42} w={10}/>
    {/* Forearms pushing DOWN */}
    <L x1={48} y1={42} x2={46} y2={62} w={9}/>
    <L x1={72} y1={42} x2={74} y2={62} w={9}/>
    <Arr x={112} y={42} dir="down" len={22}/>
  </>;
}

function TricepOverhead() {
  // Standing, weight behind head, elbows up, extending overhead
  return <>
    <StandBase/>
    {/* Upper arms UP beside head */}
    <L x1={52} y1={34} x2={44} y2={10} w={10}/>
    <L x1={68} y1={34} x2={76} y2={10} w={10}/>
    {/* Forearms folded BEHIND HEAD */}
    <L x1={44} y1={10} x2={50} y2={34} w={9}/>
    <L x1={76} y1={10} x2={70} y2={34} w={9}/>
    <rect x={46} y={32} width={28} height={8} rx={3} fill={E}/>
    <Arr x={60} y={20} dir="updown" len={16}/>
  </>;
}

function SkullCrusher() {
  // Lying on bench, upper arms perpendicular to bench (vertical), forearms fold toward head
  return <>
    <Bench x={8} y={82} w={104}/>
    <H cx={106} cy={63}/>
    <L x1={97} y1={71} x2={20} y2={73} w={14}/>
    <L x1={20} y1={73} x2={12} y2={108} w={12}/>
    {/* Upper arms pointing straight UP from torso */}
    <L x1={64} y1={73} x2={62} y2={46} w={10}/>
    <L x1={72} y1={73} x2={78} y2={46} w={10}/>
    {/* Forearms fold back toward head */}
    <L x1={62} y1={46} x2={78} y2={38} w={9}/>
    <L x1={78} y1={46} x2={92} y2={38} w={9}/>
    <Bar x={74} y={34} len={24}/>
    <Arr x={14} y={73} dir="updown" len={16}/>
  </>;
}

// ─── LEGS ─────────────────────────────────────────────────────────────────────

function Squat() {
  // Bar on upper back, BOTH KNEES symmetrically bent wide — deep squat
  return <>
    <Bar x={8} y={42} len={104}/>
    <H cx={60} cy={26}/>
    <L x1={60} y1={35} x2={58} y2={76} w={14}/>
    {/* Arms holding bar wide */}
    <L x1={52} y1={46} x2={32} y2={44} w={9}/>
    <L x1={68} y1={46} x2={88} y2={44} w={9}/>
    {/* BOTH THIGHS wide and down — symmetric */}
    <L x1={52} y1={76} x2={24} y2={112} w={12}/>
    <L x1={24} y1={112} x2={18} y2={154} w={10}/>
    <L x1={66} y1={76} x2={96} y2={112} w={12}/>
    <L x1={96} y1={112} x2={102} y2={154} w={10}/>
    <Arr x={112} y={94} dir="updown" len={24}/>
  </>;
}

function Deadlift() {
  // Bar from floor, hips LOW, knees BENT significantly (more bent than RDL)
  return <>
    <Bar x={8} y={132} len={104}/>
    <H cx={86} cy={36}/>
    {/* Back at ~60° angle */}
    <L x1={78} y1={44} x2={46} y2={88} w={14}/>
    {/* Arms straight down to bar */}
    <L x1={62} y1={64} x2={50} y2={92} w={10}/>
    <L x1={50} y1={92} x2={46} y2={134} w={9}/>
    <L x1={66} y1={66} x2={58} y2={94} w={10}/>
    <L x1={58} y1={94} x2={58} y2={134} w={9}/>
    {/* Knees BENT — hips LOW (key diff from RDL) */}
    <L x1={46} y1={88} x2={28} y2={118} w={12}/>
    <L x1={28} y1={118} x2={22} y2={154} w={10}/>
    <L x1={58} y1={92} x2={68} y2={118} w={12}/>
    <L x1={68} y1={118} x2={70} y2={154} w={10}/>
    <Arr x={112} y={80} dir="up" len={26}/>
  </>;
}

function RDL() {
  // Hip hinge: back NEARLY HORIZONTAL, legs barely bent — key diff from Deadlift
  return <>
    <Bar x={8} y={112} len={104}/>
    <H cx={98} cy={34}/>
    {/* Almost horizontal back */}
    <L x1={90} y1={42} x2={46} y2={82} w={14}/>
    {/* Arms hanging straight down */}
    <L x1={72} y1={60} x2={58} y2={86} w={10}/>
    <L x1={58} y1={86} x2={50} y2={114} w={9}/>
    <L x1={76} y1={62} x2={66} y2={88} w={10}/>
    <L x1={66} y1={88} x2={62} y2={114} w={9}/>
    {/* LEGS barely bent — mostly straight */}
    <L x1={46} y1={82} x2={38} y2={118} w={12}/>
    <L x1={38} y1={118} x2={34} y2={154} w={10}/>
    <L x1={56} y1={84} x2={62} y2={118} w={12}/>
    <L x1={62} y1={118} x2={64} y2={154} w={10}/>
    <Arr x={112} y={74} dir="updown" len={24}/>
  </>;
}

function HipThrust() {
  // Upper back on bench, hips HIGH, bar on hips, feet on floor
  return <>
    <Bench x={54} y={48} w={58}/>
    <Floor/>
    <Bar x={16} y={74} len={78}/>
    <H cx={106} cy={38}/>
    {/* Upper back on bench */}
    <L x1={98} y1={46} x2={64} y2={56} w={14}/>
    {/* Hips raised: torso diagonal */}
    <L x1={64} y1={56} x2={48} y2={76} w={14}/>
    {/* Legs: knees bent, feet flat on floor */}
    <L x1={48} y1={76} x2={30} y2={116} w={12}/>
    <L x1={30} y1={116} x2={24} y2={154} w={10}/>
    <L x1={54} y1={78} x2={66} y2={116} w={12}/>
    <L x1={66} y1={116} x2={68} y2={154} w={10}/>
    <Arr x={14} y={80} dir="updown" len={22}/>
  </>;
}

function Lunge() {
  // SPLIT STANCE: front knee bent 90°, back knee near floor — ASYMMETRIC
  return <>
    <Floor/>
    <H cx={62} cy={14}/>
    <L x1={62} y1={23} x2={62} y2={72} w={14}/>
    {/* Arms with dumbbells */}
    <L x1={54} y1={36} x2={20} y2={68} w={10}/>
    <L x1={20} y1={68} x2={12} y2={98} w={9}/>
    <Dv x={6} y={96}/>
    <L x1={70} y1={36} x2={104} y2={68} w={10}/>
    <L x1={104} y1={68} x2={110} y2={98} w={9}/>
    <Dv x={106} y={96}/>
    {/* FRONT LEG: thigh angled forward/down, shin vertical */}
    <L x1={56} y1={72} x2={32} y2={110} w={12}/>
    <L x1={32} y1={110} x2={28} y2={154} w={10}/>
    {/* BACK LEG: thigh angled back, knee near ground */}
    <L x1={68} y1={72} x2={92} y2={112} w={12}/>
    <L x1={92} y1={112} x2={98} y2={140} w={10}/>
    <circle cx={98} cy={140} r={7} fill={E} opacity={0.4}/>
    <Arr x={116} y={100} dir="updown" len={24}/>
  </>;
}

function LegCurl() {
  // LYING FACE DOWN on machine, shin curls UP toward butt
  return <>
    <Bench x={8} y={74} w={104}/>
    {/* Ankle roller at foot end */}
    <rect x={10} y={60} width={24} height={14} rx={5} fill={E} opacity={0.9}/>
    {/* Figure PRONE — head right side */}
    <H cx={106} cy={54}/>
    <L x1={97} y1={62} x2={28} y2={66} w={14}/>
    {/* Hands near face on bench */}
    <L x1={88} y1={64} x2={84} y2={80} w={9}/>
    {/* THIGH: lying flat on bench */}
    <L x1={28} y1={66} x2={18} y2={80} w={12}/>
    {/* SHIN: CURLED UP toward butt — key movement */}
    <L x1={18} y1={80} x2={24} y2={46} w={10}/>
    {/* Second leg mostly flat for reference */}
    <L x1={34} y1={66} x2={26} y2={80} w={12}/>
    <L x1={26} y1={80} x2={22} y2={116} w={10}/>
    <Arr x={10} y={54} dir="up" len={24}/>
  </>;
}

function LegExtension() {
  // SEATED on machine, lower leg extending FORWARD from bent to straight
  return <>
    {/* Seat back */}
    <rect x={74} y={48} width={40} height={62} rx={3} fill={P}/>
    {/* Seat horizontal */}
    <rect x={44} y={62} width={70} height={18} rx={3} fill={P}/>
    <rect x={48} y={80} width={6} height={52} fill={P}/>
    <rect x={108} y={80} width={6} height={52} fill={P}/>
    {/* Shin roller pad */}
    <rect x={6} y={96} width={26} height={12} rx={5} fill={E} opacity={0.9}/>
    <H cx={94} cy={36}/>
    <L x1={94} y1={45} x2={92} y2={80} w={14}/>
    {/* Thigh HORIZONTAL on seat */}
    <L x1={86} y1={80} x2={50} y2={82} w={12}/>
    {/* SHIN EXTENDING FORWARD — from bent to horizontal */}
    <L x1={50} y1={82} x2={22} y2={96} w={10}/>
    <L x1={22} y1={96} x2={6} y2={104} w={10}/>
    {/* Arms resting on machine handles */}
    <L x1={86} y1={58} x2={76} y2={70} w={9}/>
    <Arr x={4} y={90} dir="up" len={22}/>
  </>;
}

function CalfRaise() {
  // Standing on step, heels raised (tiptoe position)
  return <>
    <rect x={18} y={130} width={84} height={10} rx={2} fill={P}/>
    <Floor y={156}/>
    <H cx={60} cy={14}/>
    <L x1={60} y1={23} x2={60} y2={68} w={14}/>
    <L x1={52} y1={34} x2={34} y2={60} w={10}/>
    <L x1={34} y1={60} x2={26} y2={90} w={9}/>
    <Dv x={20} y={88}/>
    <L x1={68} y1={34} x2={86} y2={60} w={10}/>
    <L x1={86} y1={60} x2={94} y2={90} w={9}/>
    <Dv x={90} y={88}/>
    {/* Legs: standing on TOES — heels raised */}
    <L x1={54} y1={68} x2={46} y2={106} w={12}/>
    <L x1={46} y1={106} x2={44} y2={130} w={10}/>
    <L x1={66} y1={68} x2={74} y2={106} w={12}/>
    <L x1={74} y1={106} x2={76} y2={130} w={10}/>
    <circle cx={44} cy={130} r={5} fill={B}/>
    <circle cx={76} cy={130} r={5} fill={B}/>
    <Arr x={112} y={104} dir="updown" len={18}/>
  </>;
}

// ─── CORE ────────────────────────────────────────────────────────────────────

function Plank() {
  // Forearm plank: body rigid horizontal, forearms on floor
  return <>
    <Floor/>
    <H cx={100} cy={82}/>
    <L x1={91} y1={90} x2={22} y2={104} w={14}/>
    {/* FOREARMS on floor — elbows and hands both touching */}
    <L x1={82} y1={94} x2={88} y2={116} w={10}/>
    <L x1={88} y1={116} x2={96} y2={152} w={9}/>
    <L x1={68} y1={97} x2={72} y2={118} w={10}/>
    <L x1={72} y1={118} x2={76} y2={152} w={9}/>
    <L x1={22} y1={104} x2={8} y2={116} w={12}/>
    <L x1={8} y1={116} x2={4} y2={152} w={10}/>
    <L x1={22} y1={104} x2={38} y2={116} w={12}/>
    <L x1={38} y1={116} x2={44} y2={152} w={10}/>
    <text x={60} y={146} textAnchor="middle" fontSize={9} fill={E} fontFamily="system-ui" fontWeight={700} letterSpacing={1}>HOLD</text>
  </>;
}

function Crunch() {
  // ONLY upper torso curls up — hips stay on floor, knees bent
  return <>
    <Floor/>
    {/* Hips and lower back on floor */}
    <L x1={18} y1={130} x2={50} y2={128} w={12}/>
    {/* Legs: thighs angled up, shins bent toward floor */}
    <L x1={18} y1={130} x2={36} y2={104} w={12}/>
    <L x1={36} y1={104} x2={64} y2={116} w={10}/>
    <L x1={64} y1={116} x2={72} y2={152} w={10}/>
    {/* Torso CURLING UP from lower back */}
    <L x1={50} y1={128} x2={68} y2={110} w={14}/>
    <L x1={68} y1={110} x2={80} y2={86} w={14}/>
    <H cx={86} cy={76}/>
    {/* Hands behind head */}
    <L x1={80} y1={80} x2={66} y2={68} w={9}/>
    <L x1={88} y1={72} x2={102} y2={64} w={9}/>
    <Arr x={54} y={112} dir="up" len={20}/>
  </>;
}

function HangingLegRaise() {
  // Hanging from bar, legs raised to 90°
  return <>
    <rect x={12} y={6} width={96} height={9} rx={4} fill={E}/>
    <H cx={60} cy={30}/>
    <L x1={60} y1={39} x2={60} y2={86} w={14}/>
    {/* Arms gripping bar */}
    <L x1={52} y1={48} x2={34} y2={26} w={10}/>
    <L x1={34} y1={26} x2={30} y2={14} w={9}/>
    <L x1={68} y1={48} x2={86} y2={26} w={10}/>
    <L x1={86} y1={26} x2={90} y2={14} w={9}/>
    {/* LEGS RAISED horizontal — 90° */}
    <L x1={54} y1={86} x2={32} y2={86} w={12}/>
    <L x1={32} y1={86} x2={14} y2={118} w={10}/>
    <L x1={66} y1={86} x2={88} y2={86} w={12}/>
    <L x1={88} y1={86} x2={106} y2={118} w={10}/>
    <Arr x={60} y={110} dir="up" len={24}/>
  </>;
}

function KettlebellSwing() {
  // Hip hinge, KB swings forward and up
  return <>
    <Floor/>
    <H cx={84} cy={36}/>
    <L x1={76} y1={44} x2={40} y2={86} w={14}/>
    <L x1={40} y1={86} x2={24} y2={120} w={12}/>
    <L x1={24} y1={120} x2={18} y2={154} w={10}/>
    <L x1={52} y1={90} x2={62} y2={120} w={12}/>
    <L x1={62} y1={120} x2={64} y2={154} w={10}/>
    {/* Arms swinging KB forward */}
    <L x1={60} y1={62} x2={44} y2={78} w={10}/>
    <L x1={44} y1={78} x2={28} y2={66} w={9}/>
    <L x1={62} y1={64} x2={48} y2={80} w={10}/>
    <rect x={16} y={58} width={18} height={14} rx={4} fill={E}/>
    <path d="M20,58 Q25,50 32,58" fill="none" stroke={E} strokeWidth={2.5} strokeLinecap="round"/>
    <Arr x={112} y={88} dir="up" len={26}/>
  </>;
}

function AbWheel() {
  // On knees, arms extended rolling wheel forward
  return <>
    <Floor/>
    <circle cx={38} cy={144} r={10} fill="none" stroke={E} strokeWidth={3}/>
    <line x1={22} y1={144} x2={54} y2={144} stroke={E} strokeWidth={3} strokeLinecap="round"/>
    <H cx={102} cy={72}/>
    <L x1={94} y1={80} x2={46} y2={110} w={14}/>
    {/* Arms extended forward toward wheel */}
    <L x1={76} y1={86} x2={56} y2={116} w={10}/>
    <L x1={56} y1={116} x2={42} y2={144} w={9}/>
    <L x1={80} y1={88} x2={62} y2={118} w={10}/>
    {/* Knees on floor */}
    <L x1={46} y1={110} x2={36} y2={130} w={12}/>
    <L x1={36} y1={130} x2={30} y2={154} w={10}/>
    <L x1={46} y1={110} x2={58} y2={130} w={12}/>
    <L x1={58} y1={130} x2={60} y2={154} w={10}/>
    <Arr x={26} y={118} dir="down" len={20}/>
  </>;
}

function RussianTwist() {
  // V-sit, rotating torso side to side with weight
  return <>
    <Floor/>
    <H cx={62} cy={52}/>
    {/* Torso leaning back ~45° */}
    <L x1={62} y1={61} x2={56} y2={98} w={14}/>
    {/* Legs RAISED and bent */}
    <L x1={46} y1={98} x2={28} y2={126} w={12}/>
    <L x1={28} y1={126} x2={32} y2={154} w={10}/>
    <L x1={66} y1={98} x2={74} y2={126} w={12}/>
    <L x1={74} y1={126} x2={72} y2={154} w={10}/>
    {/* Arms reaching to ONE SIDE (showing rotation) */}
    <L x1={56} y1={72} x2={34} y2={62} w={10}/>
    <L x1={34} y1={62} x2={18} y2={54} w={9}/>
    <rect x={6} y={48} width={14} height={8} rx={3} fill={E}/>
    <Arr x={92} y={68} dir="updown" len={16}/>
  </>;
}

function Rotation() {
  // Cable rotation / pallof press
  return <>
    <rect x={0} y={76} width={10} height={8} rx={2} fill={P}/>
    <line x1={10} y1={80} x2={42} y2={80} stroke={E} strokeWidth={2} strokeDasharray="4,2"/>
    <StandBase/>
    <L x1={52} y1={40} x2={38} y2={66} w={10}/>
    <L x1={38} y1={66} x2={42} y2={80} w={9}/>
    <L x1={68} y1={40} x2={80} y2={62} w={10}/>
    <L x1={80} y1={62} x2={82} y2={76} w={9}/>
    <path d="M38,80 Q60,60 86,76" fill="none" stroke={E} strokeWidth={2} strokeDasharray="5,3" opacity={0.8}/>
  </>;
}

function Compound() {
  // Generic compound movement
  return <>
    <StandBase/>
    <L x1={52} y1={34} x2={40} y2={12} w={10}/>
    <L x1={40} y1={12} x2={40} y2={2} w={9}/>
    <L x1={68} y1={34} x2={80} y2={12} w={10}/>
    <L x1={80} y1={12} x2={80} y2={2} w={9}/>
    <Bar x={22} y={0} len={76}/>
    <Arr x={112} y={36} dir="updown" len={24}/>
  </>;
}

// ─── MAPPING ─────────────────────────────────────────────────────────────────

function norm(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function getKey(name, pattern, muscle) {
  const n = norm(name);
  const m = norm(muscle);
  const p = pattern || "";

  // ── CORE ──────────────────────────────────────────────────────────────────
  if (p === "core") {
    if (n.includes("rueda") || n.includes("wheel") || n.includes("ab wheel")) return "ab-wheel";
    if (n.includes("colgado") || n.includes("elevacion") || (n.includes("pierna") && n.includes("colgad"))) return "hanging-leg-raise";
    if (n.includes("hanging") || n.includes("toes to bar") || n.includes("rodillas al pecho colgado")) return "hanging-leg-raise";
    if (n.includes("twist") || n.includes("ruso") || n.includes("russian") || n.includes("bicicleta") || n.includes("giro")) return "russian-twist";
    if (n.includes("crunch") || n.includes("abdominal") || n.includes("sit-up") || n.includes("situp") || n.includes("encogimiento")) return "crunch";
    if (n.includes("pallof") || n.includes("rotacion") || n.includes("rotation")) return "rotation";
    if (n.includes("plancha") || n.includes("plank") || n.includes("hollow") || n.includes("dead bug") || n.includes("farmer") || n.includes("l-sit") || n.includes("caminata")) return "plank";
    if (n.includes("swing") || n.includes("kettlebell")) return "kettlebell-swing";
    return "crunch";
  }

  // ── PUSH ──────────────────────────────────────────────────────────────────
  if (p === "push") {
    const isTri = m.includes("tricep") || n.includes("tricep");
    if (isTri) {
      if (n.includes("polea") || n.includes("cable") || n.includes("pushdown") || n.includes("cuerda") || n.includes("barra v") || n.includes("press banca agarre")) return "tricep-pushdown";
      if (n.includes("cabeza") || n.includes("overhead") || n.includes("sobre la cabeza") || n.includes("mancuerna")) return "tricep-overhead";
      if (n.includes("banco") || n.includes("fondo en banco")) return "skull-crusher";
      if (n.includes("frances") || n.includes("rompe") || n.includes("skull") || n.includes("jm press") || n.includes("tate") || n.includes("acostado")) return "skull-crusher";
      return "tricep-pushdown";
    }
    if (n.includes("flexion") || n.includes("push-up") || n.includes("push up") || n.includes("lagartija")) return "pushup";
    if (n.includes("fondo") && (n.includes("paralela") || n.includes("barra"))) return "dip";
    if (n.includes("apertura") || n.includes("cruce") || n.includes("mariposa") || (m.includes("pectoral") && (n.includes("polea") || n.includes("cable") || n.includes("trx")))) return "fly";
    if (m.includes("pectoral") || n.includes("pecho") || n.includes("banca") || n.includes("bench") || n.includes("press de pecho")) {
      if (n.includes("inclinado") || n.includes("incline")) return "bench-incline";
      return "bench-horizontal";
    }
    if (m.includes("deltoide lateral") || (n.includes("lateral") && !n.includes("estocada"))) return "lateral-raise";
    if (n.includes("frontal") || n.includes("front raise") || (n.includes("elevacion") && !n.includes("posterior") && !n.includes("pierna"))) return "front-raise";
    return "overhead-press";
  }

  // ── PULL ──────────────────────────────────────────────────────────────────
  if (p === "pull") {
    if (m.includes("bicep") || m.includes("braquial") || n.includes("curl")) {
      if (n.includes("concentrado") || n.includes("predicador") || n.includes("inclinado") || n.includes("bayesian") || n.includes("spider") || n.includes("banco inclinado") || n.includes("21")) return "curl-seated";
      return "curl-standing";
    }
    if (m.includes("trapecio") || n.includes("encogimiento") || n.includes("shrug") || n.includes("remo al menton")) return "shrug";
    if (m.includes("erector") || n.includes("hiperextension") || n.includes("extension de espalda") || n.includes("superman") || n.includes("buenos dias")) return "back-extension";
    if (m.includes("deltoide posterior") || n.includes("pajaro") || n.includes("face pull") || n.includes("elevacion posterior") || n.includes("posterior")) return "reverse-fly";
    if (n.includes("jalon") || n.includes("pulldown") || n.includes("pull down") || n.includes("pullover")) return "pulldown";
    if (n.includes("dominada") || n.includes("pull-up") || n.includes("pull up") || n.includes("chin-up")) return "pullup";
    if (n.includes("remo") || n.includes("row")) {
      if (n.includes("cable") || n.includes("polea baja") || n.includes("sentado") || n.includes("maquina") || n.includes("pecho apoyado")) return "row-seated";
      return "row-bent";
    }
    if (n.includes("peso muerto")) return "deadlift";
    return "row-bent";
  }

  // ── LEGS ──────────────────────────────────────────────────────────────────
  if (p === "legs") {
    if (n.includes("peso muerto")) {
      if (n.includes("rumano") || n.includes("rdl") || n.includes("pierna recta") || n.includes("stiff")) return "rdl";
      return "deadlift";
    }
    if (n.includes("hip thrust") || n.includes("puente de glut") || n.includes("glute bridge") || n.includes("empuje de cadera")) return "hip-thrust";
    if (n.includes("estocada") || n.includes("zancada") || n.includes("lunge") || n.includes("bulgara") || n.includes("bulgar") || n.includes("step-up") || n.includes("estacionaria") || n.includes("split")) return "lunge";
    // Leg curl — check before generic curl
    if (n.includes("curl femoral") || n.includes("curl de isquio") || n.includes("isquiotibial") || n.includes("nordico") || n.includes("nordic") || (n.includes("curl") && (n.includes("femoral") || n.includes("isquio") || n.includes("pierna")))) return "leg-curl";
    // Leg extension
    if ((n.includes("extension") || n.includes("extensi")) && (n.includes("pierna") || n.includes("cuadricep") || n.includes("quad") || n.includes("rodilla"))) return "leg-extension";
    if (n.includes("pantorrilla") || n.includes("gemelo") || n.includes("calf") || n.includes("soleo") || n.includes("tibial") || n.includes("elevacion de talones")) return "calf-raise";
    if (n.includes("abductor") || n.includes("aductor")) return "lateral-raise";
    if (n.includes("swing") || n.includes("goblet") || n.includes("kettlebell")) return "kettlebell-swing";
    return "squat";
  }

  if (p === "rehab") return "rotation";
  if (p === "compound") return "compound";
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

export default function ExerciseIllustration({ name, pattern, muscle, equipment, size = 100 }) {
  const key = getKey(name, pattern, muscle);
  const Figure = FIGURES[key] || Compound;
  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={Math.round(size * 1.33)}
      style={{ display: "block", overflow: "visible" }}
      aria-label={`Ilustración: ${name}`}
    >
      <Figure />
    </svg>
  );
}
