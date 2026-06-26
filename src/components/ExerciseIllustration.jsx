// Exercise illustrations — thick solid-limb style (not stick figures).
// strokeLinecap="round" + strokeWidth=10-14 creates a solid anatomical look.

const BODY = "#8ca0b2";      // body segments
const BODY_D = "#6b7d8e";    // darker outline/joints
const EQUIP = "#a855f7";     // equipment (bars, cables, machines)
const EQUIP_F = "#a855f7";   // equipment fill
const PLAT = "#2d3748";      // bench / platform fill
const PLAT_S = "#4a5568";    // bench stroke

// ─── HELPERS ────────────────────────────────────────────────────────────────

function H({ cx, cy, r = 9 }) {
  return <circle cx={cx} cy={cy} r={r} fill={BODY} stroke={BODY_D} strokeWidth={1.5} />;
}
function S({ x1, y1, x2, y2, w = 11, c = BODY }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round" />;
}
function Bench({ x, y, w = 100, h = 7, legs = true }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={2} fill={PLAT} stroke={PLAT_S} strokeWidth={1} />
      {legs && <>
        <rect x={x + 3} y={y + h} width={5} height={26} fill={PLAT} />
        <rect x={x + w - 8} y={y + h} width={5} height={26} fill={PLAT} />
      </>}
    </>
  );
}
function Bar({ x, y, len = 80 }) {
  return (
    <>
      <rect x={x} y={y - 2} width={len} height={5} rx={2} fill={EQUIP_F} />
      <rect x={x - 1} y={y - 6} width={8} height={13} rx={1} fill={EQUIP_F} opacity={0.8} />
      <rect x={x + len - 7} y={y - 6} width={8} height={13} rx={1} fill={EQUIP_F} opacity={0.8} />
    </>
  );
}
function Dumbbell({ x, y, horiz = true }) {
  return horiz
    ? <><rect x={x} y={y - 2} width={14} height={5} rx={1} fill={EQUIP_F} /><rect x={x} y={y - 5} width={5} height={11} rx={1} fill={EQUIP_F} opacity={0.7} /><rect x={x + 9} y={y - 5} width={5} height={11} rx={1} fill={EQUIP_F} opacity={0.7} /></>
    : <><rect x={x - 2} y={y} width={5} height={14} rx={1} fill={EQUIP_F} /><rect x={x - 5} y={y} width={11} height={5} rx={1} fill={EQUIP_F} opacity={0.7} /><rect x={x - 5} y={y + 9} width={11} height={5} rx={1} fill={EQUIP_F} opacity={0.7} /></>;
}
function Arrow({ x, y, dir = "up", len = 20 }) {
  const paths = {
    up:    `M${x},${y} L${x},${y-len} M${x-5},${y-len+8} L${x},${y-len} L${x+5},${y-len+8}`,
    down:  `M${x},${y} L${x},${y+len} M${x-5},${y+len-8} L${x},${y+len} L${x+5},${y+len-8}`,
    updown:`M${x},${y-len} L${x},${y+len} M${x-4},${y-len+7} L${x},${y-len} L${x+4},${y-len+7} M${x-4},${y+len-7} L${x},${y+len} L${x+4},${y+len-7}`,
    arc:   `M${x-20},${y} Q${x},${y-24} ${x+20},${y}`,
  };
  return <path d={paths[dir]} stroke={EQUIP} fill="none" strokeWidth={2} strokeLinecap="round" />;
}

// ─── FIGURES ────────────────────────────────────────────────────────────────

// Standing base: upright figure template
function StandingBase({ lean = 0 }) {
  const tx = 60 + lean;
  return (
    <>
      <H cx={60} cy={15} />
      <S x1={60} y1={24} x2={tx} y2={70} w={14} />                    {/* torso */}
      <S x1={60} y1={34} x2={38} y2={54} w={10} />                    {/* L upper arm */}
      <S x1={60} y1={34} x2={82} y2={54} w={10} />                    {/* R upper arm */}
      <S x1={tx} y1={70} x2={tx-12} y2={108} w={13} />                {/* L thigh */}
      <S x1={tx-12} y1={108} x2={tx-16} y2={148} w={11} />            {/* L shin */}
      <S x1={tx} y1={70} x2={tx+12} y2={108} w={13} />                {/* R thigh */}
      <S x1={tx+12} y1={108} x2={tx+16} y2={148} w={11} />            {/* R shin */}
    </>
  );
}

function BenchHorizontal() {
  return (
    <>
      <Bench x={8} y={80} w={104} legs />
      {/* lying: head right, body horizontal */}
      <H cx={102} cy={62} />
      <S x1={93} y1={70} x2={28} y2={72} w={14} />                    {/* torso */}
      <S x1={28} y1={72} x2={16} y2={106} w={13} />                   {/* L thigh */}
      <S x1={16} y1={106} x2={20} y2={148} w={11} />
      <S x1={28} y1={72} x2={40} y2={106} w={13} />
      <S x1={40} y1={106} x2={36} y2={148} w={11} />
      {/* arms: elbows bent, pressing up */}
      <S x1={64} y1={72} x2={56} y2={50} w={10} />                    {/* L upper arm up */}
      <S x1={56} y1={50} x2={58} y2={32} w={9} />
      <S x1={64} y1={72} x2={72} y2={50} w={10} />
      <S x1={72} y1={50} x2={70} y2={32} w={9} />
      <Bar x={42} y={30} len={36} />
      <Arrow x={16} y={68} dir="updown" len={16} />
    </>
  );
}

function BenchIncline() {
  return (
    <>
      {/* inclined bench */}
      <polygon points="10,148 22,148 94,56 82,56" fill={PLAT} stroke={PLAT_S} strokeWidth={1} />
      <rect x={10} y={120} width={12} height={30} fill={PLAT} />
      {/* figure on incline */}
      <H cx={88} cy={40} />
      <S x1={80} y1={48} x2={30} y2={98} w={14} />                    {/* torso diagonal */}
      <S x1={30} y1={98} x2={18} y2={138} w={13} />
      <S x1={30} y1={98} x2={44} y2={136} w={13} />
      <S x1={62} y1={72} x2={52} y2={50} w={10} />
      <S x1={52} y1={50} x2={54} y2={32} w={9} />
      <S x1={62} y1={72} x2={72} y2={50} w={10} />
      <S x1={72} y1={50} x2={70} y2={32} w={9} />
      <Bar x={38} y={30} len={34} />
      <Arrow x={14} y={88} dir="updown" len={16} />
    </>
  );
}

function Dip() {
  return (
    <>
      {/* parallel bars */}
      <rect x={22} y={56} width={6} height={92} fill={PLAT} />
      <rect x={92} y={56} width={6} height={92} fill={PLAT} />
      <rect x={10} y={52} width={30} height={8} rx={3} fill={EQUIP_F} />
      <rect x={80} y={52} width={30} height={8} rx={3} fill={EQUIP_F} />
      <H cx={60} cy={18} />
      <S x1={60} y1={27} x2={58} y2={60} w={14} />                    {/* torso forward lean */}
      {/* arms on bars */}
      <S x1={55} y1={38} x2={38} y2={48} w={10} />
      <S x1={38} y1={48} x2={25} y2={58} w={9} />
      <S x1={65} y1={38} x2={82} y2={48} w={10} />
      <S x1={82} y1={48} x2={95} y2={58} w={9} />
      {/* legs bent */}
      <S x1={48} y1={60} x2={40} y2={94} w={13} />
      <S x1={40} y1={94} x2={48} y2={122} w={11} />
      <S x1={68} y1={60} x2={76} y2={94} w={13} />
      <S x1={76} y1={94} x2={68} y2={122} w={11} />
      <Arrow x={108} y={70} dir="updown" len={20} />
    </>
  );
}

function Pushup() {
  return (
    <>
      <line x1={4} y1={126} x2={116} y2={126} stroke={PLAT} strokeWidth={4} strokeLinecap="round" />
      <H cx={100} cy={84} />
      <S x1={91} y1={92} x2={32} y2={110} w={14} />                   {/* body plank */}
      <S x1={80} y1={94} x2={88} y2={112} w={10} />
      <S x1={88} y1={112} x2={95} y2={126} w={9} />
      <S x1={70} y1={96} x2={74} y2={114} w={10} />
      <S x1={74} y1={114} x2={68} y2={126} w={9} />
      <S x1={32} y1={110} x2={16} y2={120} w={13} />
      <S x1={16} y1={120} x2={8} y2={126} w={11} />
      <S x1={32} y1={110} x2={44} y2={120} w={13} />
      <S x1={44} y1={120} x2={52} y2={126} w={11} />
      <Arrow x={55} y={90} dir="updown" len={16} />
    </>
  );
}

function OverheadPress() {
  return (
    <>
      <H cx={60} cy={14} />
      <S x1={60} y1={23} x2={60} y2={70} w={14} />
      <S x1={60} y1={70} x2={46} y2={108} w={13} />
      <S x1={46} y1={108} x2={42} y2={148} w={11} />
      <S x1={60} y1={70} x2={74} y2={108} w={13} />
      <S x1={74} y1={108} x2={78} y2={148} w={11} />
      {/* arms overhead */}
      <S x1={50} y1={34} x2={36} y2={18} w={10} />
      <S x1={36} y1={18} x2={36} y2={6} w={9} />
      <S x1={70} y1={34} x2={84} y2={18} w={10} />
      <S x1={84} y1={18} x2={84} y2={6} w={9} />
      <Bar x={20} y={4} len={80} />
      <Arrow x={110} y={38} dir="updown" len={20} />
    </>
  );
}

function LateralRaise() {
  return (
    <>
      <H cx={60} cy={14} />
      <S x1={60} y1={23} x2={60} y2={70} w={14} />
      <S x1={60} y1={70} x2={46} y2={108} w={13} />
      <S x1={46} y1={108} x2={42} y2={148} w={11} />
      <S x1={60} y1={70} x2={74} y2={108} w={13} />
      <S x1={74} y1={108} x2={78} y2={148} w={11} />
      {/* arms raised wide to sides */}
      <S x1={50} y1={34} x2={16} y2={44} w={10} />
      <S x1={16} y1={44} x2={4} y2={52} w={9} />
      <S x1={70} y1={34} x2={104} y2={44} w={10} />
      <S x1={104} y1={44} x2={116} y2={52} w={9} />
      <Dumbbell x={-4} y={48} horiz />
      <Dumbbell x={110} y={48} horiz />
      <Arrow x={60} y={55} dir="updown" len={14} />
    </>
  );
}

function Fly() {
  return (
    <>
      <Bench x={8} y={80} w={104} legs />
      <H cx={102} cy={62} />
      <S x1={93} y1={70} x2={28} y2={72} w={14} />
      <S x1={28} y1={72} x2={16} y2={106} w={13} />
      <S x1={28} y1={72} x2={40} y2={106} w={13} />
      {/* arms wide */}
      <S x1={64} y1={72} x2={40} y2={44} w={10} />
      <S x1={40} y1={44} x2={22} y2={34} w={9} />
      <S x1={64} y1={72} x2={88} y2={44} w={10} />
      <S x1={88} y1={44} x2={106} y2={34} w={9} />
      <Dumbbell x={12} y={28} />
      <Dumbbell x={100} y={28} />
      {/* arc showing movement */}
      <path d="M22,34 Q62,16 106,34" fill="none" stroke={EQUIP} strokeWidth={2} strokeDasharray="5,3" opacity={0.7} />
    </>
  );
}

function Pulldown() {
  return (
    <>
      <rect x={6} y={4} width={108} height={8} rx={2} fill={PLAT} stroke={PLAT_S} strokeWidth={1} />
      <line x1={60} y1={12} x2={60} y2={38} stroke={EQUIP} strokeWidth={2} strokeDasharray="4,2" />
      <rect x={30} y={36} width={60} height={6} rx={2} fill={EQUIP_F} />
      <Bench x={30} y={118} w={60} legs={false} />
      <rect x={38} y={125} width={5} height={24} fill={PLAT} />
      <rect x={77} y={125} width={5} height={24} fill={PLAT} />
      <H cx={60} cy={62} />
      <S x1={60} y1={71} x2={60} y2={116} w={14} />
      <S x1={60} y1={116} x2={40} y2={118} w={13} />
      <S x1={60} y1={116} x2={80} y2={118} w={13} />
      {/* arms reaching up */}
      <S x1={51} y1={80} x2={38} y2={54} w={10} />
      <S x1={38} y1={54} x2={33} y2={40} w={9} />
      <S x1={69} y1={80} x2={82} y2={54} w={10} />
      <S x1={82} y1={54} x2={87} y2={40} w={9} />
      <Arrow x={108} y={72} dir="down" len={18} />
    </>
  );
}

function Pullup() {
  return (
    <>
      <rect x={14} y={6} width={92} height={9} rx={4} fill={EQUIP_F} />
      <H cx={60} cy={32} />
      <S x1={60} y1={41} x2={60} y2={88} w={14} />
      <S x1={60} y1={88} x2={44} y2={126} w={13} />
      <S x1={44} y1={126} x2={48} y2={156} w={11} />
      <S x1={60} y1={88} x2={76} y2={126} w={13} />
      <S x1={76} y1={126} x2={72} y2={156} w={11} />
      {/* arms gripping bar */}
      <S x1={52} y1={50} x2={36} y2={28} w={10} />
      <S x1={36} y1={28} x2={34} y2={14} w={9} />
      <S x1={68} y1={50} x2={84} y2={28} w={10} />
      <S x1={84} y1={28} x2={86} y2={14} w={9} />
      <Arrow x={108} y={68} dir="updown" len={20} />
    </>
  );
}

function RowBent() {
  return (
    <>
      {/* bar on floor */}
      <Bar x={20} y={136} len={80} />
      {/* bent-over body: torso ~40° forward */}
      <H cx={92} cy={40} />
      <S x1={84} y1={48} x2={42} y2={94} w={14} />
      <S x1={42} y1={94} x2={48} y2={98} w={5} />                     {/* hip connector */}
      <S x1={42} y1={94} x2={30} y2={132} w={13} />
      <S x1={30} y1={132} x2={26} y2={150} w={11} />
      <S x1={48} y1={98} x2={58} y2={132} w={13} />
      <S x1={58} y1={132} x2={56} y2={150} w={11} />
      {/* arms pulling bar up */}
      <S x1={66} y1={68} x2={52} y2={100} w={10} />
      <S x1={52} y1={100} x2={46} y2={138} w={9} />
      <S x1={72} y1={70} x2={62} y2={102} w={10} />
      <S x1={62} y1={102} x2={60} y2={138} w={9} />
      <Arrow x={108} y={94} dir="up" len={20} />
    </>
  );
}

function RowSeated() {
  return (
    <>
      {/* cable from left */}
      <rect x={0} y={96} width={10} height={8} rx={2} fill={EQUIP_F} />
      <line x1={10} y1={100} x2={40} y2={100} stroke={EQUIP} strokeWidth={2} strokeDasharray="4,2" />
      <Bench x={50} y={118} w={60} legs />
      {/* person seated, pulling back */}
      <H cx={88} cy={62} />
      <S x1={88} y1={71} x2={86} y2={116} w={14} />
      <S x1={86} y1={116} x2={60} y2={118} w={13} />
      <S x1={60} y1={118} x2={38} y2={118} w={11} />
      <S x1={86} y1={116} x2={98} y2={118} w={13} />
      {/* arms pulling handle to torso */}
      <S x1={80} y1={82} x2={58} y2={94} w={10} />
      <S x1={58} y1={94} x2={40} y2={100} w={9} />
      <S x1={82} y1={84} x2={62} y2={96} w={10} />
      <S x1={62} y1={96} x2={46} y2={100} w={9} />
      <Arrow x={110} y={90} dir="updown" len={16} />
    </>
  );
}

function ReverseFly() {
  return (
    <>
      <H cx={96} cy={38} />
      {/* torso bent forward, head front */}
      <S x1={88} y1={46} x2={42} y2={86} w={14} />
      <S x1={42} y1={86} x2={54} y2={90} w={5} />
      <S x1={42} y1={86} x2={30} y2={122} w={13} />
      <S x1={30} y1={122} x2={26} y2={150} w={11} />
      <S x1={54} y1={90} x2={60} y2={122} w={13} />
      <S x1={60} y1={122} x2={58} y2={150} w={11} />
      {/* arms raising out behind */}
      <S x1={68} y1={64} x2={46} y2={44} w={10} />
      <S x1={46} y1={44} x2={24} y2={30} w={9} />
      <S x1={70} y1={66} x2={88} y2={46} w={10} />
      <S x1={88} y1={46} x2={110} y2={34} w={9} />
      <Dumbbell x={14} y={24} />
      <Dumbbell x={106} y={28} />
      <Arrow x={60} y={44} dir="updown" len={16} />
    </>
  );
}

function BackExtension() {
  return (
    <>
      {/* GHD/hyperextension bench */}
      <rect x={6} y={82} width={84} height={8} rx={2} fill={PLAT} stroke={PLAT_S} strokeWidth={1} />
      <rect x={10} y={90} width={6} height={40} fill={PLAT} />
      <rect x={60} y={90} width={6} height={40} fill={PLAT} />
      <rect x={54} y={72} width={26} height={10} rx={4} fill={EQUIP_F} opacity={0.8} />
      {/* person extended */}
      <H cx={106} cy={58} />
      <S x1={98} y1={66} x2={62} y2={80} w={14} />
      <S x1={62} y1={80} x2={40} y2={84} w={14} />
      {/* arms crossed on chest */}
      <S x1={90} y1={72} x2={78} y2={74} w={9} />
      <S x1={78} y1={70} x2={90} y2={74} w={9} />
      {/* legs through machine */}
      <S x1={40} y1={84} x2={28} y2={118} w={13} />
      <S x1={28} y1={118} x2={24} y2={148} w={11} />
      <S x1={40} y1={84} x2={52} y2={118} w={13} />
      <S x1={52} y1={118} x2={52} y2={148} w={11} />
      <Arrow x={62} y={66} dir="updown" len={16} />
    </>
  );
}

function Shrug() {
  return (
    <>
      <H cx={60} cy={14} />
      <S x1={60} y1={23} x2={60} y2={70} w={14} />
      <S x1={60} y1={70} x2={46} y2={108} w={13} />
      <S x1={46} y1={108} x2={42} y2={148} w={11} />
      <S x1={60} y1={70} x2={74} y2={108} w={13} />
      <S x1={74} y1={108} x2={78} y2={148} w={11} />
      {/* arms straight down with dumbbells */}
      <S x1={48} y1={34} x2={28} y2={72} w={10} />
      <S x1={28} y1={72} x2={22} y2={98} w={9} />
      <S x1={72} y1={34} x2={92} y2={72} w={10} />
      <S x1={92} y1={72} x2={98} y2={98} w={9} />
      <Dumbbell x={12} y={92} />
      <Dumbbell x={92} y={92} />
      <Arrow x={60} y={24} dir="up" len={14} />
    </>
  );
}

function CurlStanding() {
  return (
    <>
      <H cx={60} cy={14} />
      <S x1={60} y1={23} x2={60} y2={70} w={14} />
      <S x1={60} y1={70} x2={46} y2={108} w={13} />
      <S x1={46} y1={108} x2={42} y2={148} w={11} />
      <S x1={60} y1={70} x2={74} y2={108} w={13} />
      <S x1={74} y1={108} x2={78} y2={148} w={11} />
      {/* left arm curled (forearm up to shoulder) */}
      <S x1={48} y1={34} x2={30} y2={58} w={10} />
      <S x1={30} y1={58} x2={32} y2={36} w={9} />
      <Dumbbell x={24} y={30} />
      {/* right arm at side */}
      <S x1={72} y1={34} x2={92} y2={64} w={10} />
      <S x1={92} y1={64} x2={98} y2={94} w={9} />
      <Dumbbell x={90} y={89} />
      <Arrow x={24} y={54} dir="up" len={18} />
    </>
  );
}

function CurlSeated() {
  return (
    <>
      {/* preacher bench pad */}
      <polygon points="24,150 40,150 86,76 70,76" fill={PLAT} stroke={PLAT_S} strokeWidth={1} />
      <rect x={24} y={142} width={16} height={8} fill={PLAT} />
      <H cx={86} cy={50} />
      <S x1={82} y1={59} x2={70} y2={88} w={14} />
      {/* arms on pad, curling */}
      <S x1={76} y1={72} x2={60} y2={86} w={10} />
      <S x1={60} y1={86} x2={52} y2={72} w={9} />
      <S x1={78} y1={74} x2={64} y2={88} w={10} />
      <S x1={64} y1={88} x2={56} y2={76} w={9} />
      <Bar x={40} y={68} len={22} />
      {/* legs seated behind */}
      <S x1={70} y1={88} x2={56} y2={118} w={13} />
      <S x1={56} y1={118} x2={48} y2={150} w={11} />
      <Arrow x={38} y={78} dir="up" len={18} />
    </>
  );
}

function TricepPushdown() {
  return (
    <>
      <rect x={6} y={4} width={108} height={8} rx={2} fill={PLAT} stroke={PLAT_S} strokeWidth={1} />
      <line x1={60} y1={12} x2={60} y2={36} stroke={EQUIP} strokeWidth={2} strokeDasharray="4,2" />
      {/* rope ends */}
      <line x1={60} y1={36} x2={44} y2={44} stroke={EQUIP} strokeWidth={3} strokeLinecap="round" />
      <line x1={60} y1={36} x2={76} y2={44} stroke={EQUIP} strokeWidth={3} strokeLinecap="round" />
      <circle cx={44} cy={44} r={3} fill={EQUIP_F} />
      <circle cx={76} cy={44} r={3} fill={EQUIP_F} />
      <H cx={60} cy={22} />
      <S x1={60} y1={31} x2={58} y2={76} w={14} />
      <S x1={58} y1={76} x2={42} y2={80} w={13} />
      <S x1={58} y1={76} x2={74} y2={80} w={13} />
      {/* upper arms close to body, forearms pushing down */}
      <S x1={50} y1={46} x2={46} y2={34} w={10} />
      <S x1={46} y1={34} x2={44} y2={46} w={9} />
      <S x1={70} y1={46} x2={74} y2={34} w={10} />
      <S x1={74} y1={34} x2={76} y2={46} w={9} />
      {/* legs */}
      <S x1={42} y1={80} x2={34} y2={114} w={13} />
      <S x1={34} y1={114} x2={30} y2={150} w={11} />
      <S x1={74} y1={80} x2={82} y2={114} w={13} />
      <S x1={82} y1={114} x2={86} y2={150} w={11} />
      <Arrow x={110} y={50} dir="down" len={20} />
    </>
  );
}

function TricepOverhead() {
  return (
    <>
      <H cx={60} cy={14} />
      <S x1={60} y1={23} x2={60} y2={70} w={14} />
      <S x1={60} y1={70} x2={46} y2={108} w={13} />
      <S x1={46} y1={108} x2={42} y2={148} w={11} />
      <S x1={60} y1={70} x2={74} y2={108} w={13} />
      <S x1={74} y1={108} x2={78} y2={148} w={11} />
      {/* arms: elbows up, weight behind head */}
      <S x1={50} y1={36} x2={40} y2={16} w={10} />
      <S x1={40} y1={16} x2={48} y2={40} w={9} />
      <S x1={70} y1={36} x2={80} y2={16} w={10} />
      <S x1={80} y1={16} x2={72} y2={40} w={9} />
      <rect x={44} y={38} width={32} height={8} rx={3} fill={EQUIP_F} />
      <Arrow x={60} y={26} dir="updown" len={14} />
    </>
  );
}

function SkullCrusher() {
  return (
    <>
      <Bench x={8} y={80} w={104} legs />
      <H cx={100} cy={62} />
      <S x1={91} y1={70} x2={28} y2={72} w={14} />
      <S x1={28} y1={72} x2={16} y2={106} w={13} />
      <S x1={28} y1={72} x2={40} y2={106} w={13} />
      {/* upper arms perpendicular (pointing straight up), forearms bent toward head */}
      <S x1={62} y1={72} x2={60} y2={46} w={10} />
      <S x1={60} y1={46} x2={76} y2={36} w={9} />
      <S x1={64} y1={72} x2={66} y2={46} w={10} />
      <S x1={66} y1={46} x2={80} y2={36} w={9} />
      <Bar x={70} y={32} len={20} />
      <Arrow x={14} y={72} dir="updown" len={14} />
    </>
  );
}

// ─── LEGS ──────────────────────────────────────────────────────────────────

function Squat() {
  return (
    <>
      {/* bar on traps */}
      <Bar x={14} y={42} len={92} />
      <H cx={60} cy={26} />
      {/* torso slight forward lean */}
      <S x1={60} y1={35} x2={58} y2={78} w={14} />
      {/* hips wide */}
      <S x1={58} y1={78} x2={40} y2={82} w={5} />
      <S x1={58} y1={78} x2={76} y2={82} w={5} />
      {/* arms holding bar */}
      <S x1={50} y1={50} x2={36} y2={48} w={9} />
      <S x1={36} y1={48} x2={16} y2={46} w={8} />
      <S x1={70} y1={50} x2={84} y2={48} w={9} />
      <S x1={84} y1={48} x2={104} y2={46} w={8} />
      {/* DEEP SQUAT: knees bent, both feet forward, symmetric */}
      <S x1={40} y1={82} x2={24} y2={116} w={13} />
      <S x1={24} y1={116} x2={22} y2={150} w={11} />
      <S x1={76} y1={82} x2={96} y2={116} w={13} />
      <S x1={96} y1={116} x2={98} y2={150} w={11} />
      <Arrow x={110} y={94} dir="updown" len={20} />
    </>
  );
}

function Deadlift() {
  return (
    <>
      <Bar x={14} y={128} len={92} />
      {/* starting pull position: torso ~50° forward, knees bent, arms down */}
      <H cx={84} cy={42} />
      <S x1={76} y1={50} x2={46} y2={94} w={14} />                    {/* torso forward */}
      <S x1={46} y1={94} x2={60} y2={98} w={5} />
      {/* arms straight down gripping bar */}
      <S x1={64} y1={68} x2={52} y2={98} w={10} />
      <S x1={52} y1={98} x2={48} y2={130} w={9} />
      <S x1={68} y1={70} x2={60} y2={100} w={10} />
      <S x1={60} y1={100} x2={58} y2={130} w={9} />
      {/* legs bent, driving through floor */}
      <S x1={46} y1={94} x2={32} y2={126} w={13} />
      <S x1={32} y1={126} x2={28} y2={150} w={11} />
      <S x1={60} y1={98} x2={70} y2={126} w={13} />
      <S x1={70} y1={126} x2={72} y2={150} w={11} />
      <Arrow x={110} y={88} dir="up" len={22} />
    </>
  );
}

function RDL() {
  return (
    <>
      <Bar x={16} y={112} len={88} />
      {/* hip hinge: torso nearly horizontal, back FLAT, legs straight */}
      <H cx={96} cy={36} />
      <S x1={88} y1={44} x2={44} y2={88} w={14} />                    {/* flat back */}
      <S x1={44} y1={88} x2={58} y2={92} w={5} />
      {/* arms hanging straight down */}
      <S x1={70} y1={62} x2={54} y2={92} w={10} />
      <S x1={54} y1={92} x2={46} y2={114} w={9} />
      <S x1={74} y1={64} x2={62} y2={94} w={10} />
      <S x1={62} y1={94} x2={58} y2={114} w={9} />
      {/* STRAIGHT legs (barely bent) */}
      <S x1={44} y1={88} x2={32} y2={122} w={13} />
      <S x1={32} y1={122} x2={28} y2={150} w={11} />
      <S x1={58} y1={92} x2={64} y2={124} w={13} />
      <S x1={64} y1={124} x2={64} y2={150} w={11} />
      <Arrow x={110} y={78} dir="updown" len={20} />
    </>
  );
}

function HipThrust() {
  return (
    <>
      {/* bench (shoulders rest on it) */}
      <Bench x={54} y={48} w={58} legs />
      {/* floor */}
      <line x1={4} y1={140} x2={116} y2={140} stroke={PLAT} strokeWidth={4} />
      {/* bar on hips */}
      <Bar x={20} y={72} len={80} />
      {/* figure: shoulders on bench, hips RAISED high, feet on floor */}
      <H cx={104} cy={40} />
      <S x1={96} y1={48} x2={62} y2={56} w={14} />                    {/* upper back on bench */}
      <S x1={62} y1={56} x2={46} y2={76} w={14} />                    {/* torso up from hips */}
      {/* arms on bench */}
      <S x1={84} y1={54} x2={68} y2={60} w={9} />
      {/* thighs at ~45° down to feet */}
      <S x1={46} y1={76} x2={30} y2={112} w={13} />
      <S x1={30} y1={112} x2={26} y2={140} w={11} />
      <S x1={46} y1={76} x2={60} y2={112} w={13} />
      <S x1={60} y1={112} x2={62} y2={140} w={11} />
      <Arrow x={14} y={80} dir="updown" len={20} />
    </>
  );
}

function Lunge() {
  return (
    <>
      {/* floor */}
      <line x1={4} y1={152} x2={116} y2={152} stroke={PLAT} strokeWidth={4} />
      <H cx={62} cy={14} />
      {/* torso upright */}
      <S x1={62} y1={23} x2={62} y2={72} w={14} />
      {/* arms down with dumbbells */}
      <S x1={50} y1={36} x2={20} y2={70} w={10} />
      <S x1={74} y1={36} x2={104} y2={70} w={10} />
      <Dumbbell x={10} y={65} />
      <Dumbbell x={100} y={65} />
      {/* SPLIT STANCE: front knee at 90°, back knee near floor */}
      {/* front leg (left) */}
      <S x1={52} y1={72} x2={30} y2={110} w={13} />
      <S x1={30} y1={110} x2={28} y2={152} w={11} />
      {/* back leg (right) */}
      <S x1={72} y1={72} x2={88} y2={110} w={13} />
      <S x1={88} y1={110} x2={96} y2={138} w={11} />
      {/* back knee on floor indicator */}
      <circle cx={96} cy={138} r={6} fill={EQUIP_F} opacity={0.5} />
      <Arrow x={114} y={100} dir="updown" len={20} />
    </>
  );
}

// Lying face-down on machine, one knee curling up toward butt
function LegCurl() {
  return (
    <>
      {/* machine bench (person lies face down) */}
      <Bench x={8} y={72} w={104} legs />
      {/* ankle roller */}
      <rect x={16} y={62} width={18} height={10} rx={4} fill={EQUIP_F} opacity={0.9} />
      {/* person lying PRONE (face down) */}
      <H cx={104} cy={54} />
      <S x1={95} y1={62} x2={30} y2={66} w={14} />                    {/* torso horizontal */}
      {/* arms hanging down from bench sides */}
      <S x1={76} y1={66} x2={72} y2={82} w={9} />
      <S x1={72} y1={82} x2={68} y2={90} w={8} />
      {/* LEFT leg BENT UP (curling toward butt) */}
      <S x1={30} y1={66} x2={24} y2={78} w={13} />
      <S x1={24} y1={78} x2={30} y2={46} w={11} />                    {/* shin curled UP */}
      {/* RIGHT leg STRAIGHT (start position) */}
      <S x1={38} y1={66} x2={32} y2={80} w={13} />
      <S x1={32} y1={80} x2={28} y2={110} w={11} />
      <Arrow x={14} y={56} dir="up" len={20} />
    </>
  );
}

// Seated on machine, lower leg EXTENDS forward/up
function LegExtension() {
  return (
    <>
      {/* machine chair */}
      <rect x={48} y={60} width={64} height={22} rx={3} fill={PLAT} stroke={PLAT_S} strokeWidth={1} />
      <rect x={48} y={82} width={64} height={8} rx={2} fill={PLAT} />
      <rect x={52} y={90} width={6} height={46} fill={PLAT} />
      <rect x={100} y={90} width={6} height={46} fill={PLAT} />
      {/* shin pad */}
      <rect x={12} y={98} width={20} height={10} rx={4} fill={EQUIP_F} opacity={0.9} />
      <H cx={90} cy={36} />
      <S x1={90} y1={45} x2={88} y2={82} w={14} />
      {/* hips on seat, thigh horizontal */}
      <S x1={88} y1={82} x2={52} y2={84} w={13} />
      {/* lower leg EXTENDING FORWARD (horizontal to floor or raised) */}
      <S x1={52} y1={84} x2={20} y2={100} w={11} />
      <S x1={20} y1={100} x2={8} y2={112} w={11} />                   {/* fully extended */}
      {/* arms on machine sides */}
      <S x1={82} y1={60} x2={72} y2={72} w={9} />
      <S x1={72} y1={72} x2={60} y2={74} w={8} />
      <Arrow x={8} y={96} dir="up" len={20} />
    </>
  );
}

function CalfRaise() {
  return (
    <>
      {/* step */}
      <rect x={22} y={126} width={76} height={10} rx={2} fill={PLAT} stroke={PLAT_S} strokeWidth={1} />
      <H cx={60} cy={14} />
      <S x1={60} y1={23} x2={60} y2={70} w={14} />
      <S x1={60} y1={70} x2={46} y2={108} w={13} />
      <S x1={60} y1={70} x2={74} y2={108} w={13} />
      {/* arms with dumbbells at sides */}
      <S x1={48} y1={34} x2={26} y2={72} w={10} />
      <S x1={26} y1={72} x2={20} y2={100} w={9} />
      <S x1={72} y1={34} x2={94} y2={72} w={10} />
      <S x1={94} y1={72} x2={100} y2={100} w={9} />
      <Dumbbell x={10} y={95} />
      <Dumbbell x={96} y={95} />
      {/* on tiptoe: heels raised */}
      <S x1={46} y1={108} x2={42} y2={126} w={11} />
      <S x1={74} y1={108} x2={78} y2={126} w={11} />
      <circle cx={42} cy={126} r={5} fill={BODY} />
      <circle cx={78} cy={126} r={5} fill={BODY} />
      <Arrow x={110} y={100} dir="updown" len={18} />
    </>
  );
}

function Plank() {
  return (
    <>
      <line x1={4} y1={124} x2={116} y2={124} stroke={PLAT} strokeWidth={4} />
      <H cx={102} cy={84} />
      {/* body rigid horizontal */}
      <S x1={93} y1={92} x2={30} y2={100} w={14} />
      {/* forearms on floor */}
      <S x1={84} y1={96} x2={90} y2={112} w={10} />
      <S x1={90} y1={112} x2={98} y2={124} w={9} />
      <S x1={72} y1={98} x2={74} y2={114} w={10} />
      <S x1={74} y1={114} x2={70} y2={124} w={9} />
      {/* legs */}
      <S x1={30} y1={100} x2={14} y2={114} w={13} />
      <S x1={14} y1={114} x2={6} y2={124} w={11} />
      <S x1={30} y1={100} x2={42} y2={114} w={13} />
      <S x1={42} y1={114} x2={50} y2={124} w={11} />
      <text x={60} y={144} textAnchor="middle" fontSize={9} fill={EQUIP} fontFamily="system-ui" fontWeight={700} letterSpacing={1}>MANTENER</text>
    </>
  );
}

function Crunch() {
  return (
    <>
      <line x1={4} y1={142} x2={116} y2={142} stroke={PLAT} strokeWidth={4} />
      {/* legs bent, feet on floor */}
      <S x1={28} y1={142} x2={46} y2={108} w={13} />
      <S x1={46} y1={108} x2={80} y2={120} w={11} />
      <S x1={80} y1={120} x2={88} y2={142} w={11} />
      {/* lower back on floor */}
      <S x1={28} y1={142} x2={50} y2={136} w={13} />
      <S x1={50} y1={136} x2={70} y2={128} w={13} />
      {/* torso crunching up */}
      <S x1={70} y1={128} x2={84} y2={106} w={14} />
      <S x1={84} y1={106} x2={90} y2={88} w={14} />
      <H cx={95} cy={80} />
      {/* hands behind head */}
      <S x1={88} y1={76} x2={76} y2={68} w={9} />
      <S x1={98} y1={72} x2={108} y2={64} w={9} />
      <Arrow x={58} y={112} dir="up" len={18} />
    </>
  );
}

function HangingLegRaise() {
  return (
    <>
      <rect x={14} y={4} width={92} height={9} rx={4} fill={EQUIP_F} />
      <H cx={60} cy={30} />
      <S x1={60} y1={39} x2={60} y2={86} w={14} />
      {/* arms up */}
      <S x1={52} y1={48} x2={34} y2={24} w={10} />
      <S x1={34} y1={24} x2={32} y2={12} w={9} />
      <S x1={68} y1={48} x2={86} y2={24} w={10} />
      <S x1={86} y1={24} x2={88} y2={12} w={9} />
      <S x1={60} y1={86} x2={44} y2={86} w={5} />
      <S x1={60} y1={86} x2={76} y2={86} w={5} />
      {/* legs raised toward 90° */}
      <S x1={44} y1={86} x2={32} y2={122} w={13} />
      <S x1={32} y1={122} x2={28} y2={152} w={11} />
      <S x1={76} y1={86} x2={88} y2={122} w={13} />
      <S x1={88} y1={122} x2={92} y2={152} w={11} />
      <Arrow x={110} y={110} dir="up" len={22} />
    </>
  );
}

function KettlebellSwing() {
  return (
    <>
      <line x1={4} y1={152} x2={116} y2={152} stroke={PLAT} strokeWidth={4} />
      <H cx={82} cy={36} />
      {/* hip hinge position */}
      <S x1={74} y1={44} x2={36} y2={86} w={14} />
      <S x1={36} y1={86} x2={50} y2={90} w={5} />
      {/* legs hip-width, slightly bent */}
      <S x1={36} y1={86} x2={26} y2={118} w={13} />
      <S x1={26} y1={118} x2={22} y2={152} w={11} />
      <S x1={50} y1={90} x2={62} y2={118} w={13} />
      <S x1={62} y1={118} x2={64} y2={152} w={11} />
      {/* arms swinging forward with kettlebell */}
      <S x1={58} y1={62} x2={44} y2={80} w={10} />
      <S x1={44} y1={80} x2={30} y2={68} w={9} />
      <S x1={60} y1={64} x2={48} y2={82} w={10} />
      <S x1={48} y1={82} x2={34} y2={70} w={9} />
      {/* kettlebell */}
      <rect x={20} y={60} width={16} height={13} rx={3} fill={EQUIP_F} />
      <path d="M24,60 Q28,52 34,60" fill="none" stroke={EQUIP} strokeWidth={2.5} strokeLinecap="round" />
      <Arrow x={110} y={90} dir="up" len={24} />
    </>
  );
}

function AbWheel() {
  return (
    <>
      <line x1={4} y1={142} x2={116} y2={142} stroke={PLAT} strokeWidth={4} />
      {/* wheel */}
      <circle cx={60} cy={134} r={8} fill="none" stroke={EQUIP} strokeWidth={3} />
      <line x1={44} y1={134} x2={76} y2={134} stroke={EQUIP} strokeWidth={3} strokeLinecap="round" />
      {/* person on knees, arms extended */}
      <H cx={104} cy={72} />
      <S x1={96} y1={80} x2={52} y2={110} w={14} />
      <S x1={80} y1={86} x2={62} y2={120} w={10} />
      <S x1={62} y1={120} x2={58} y2={134} w={9} />
      <S x1={84} y1={88} x2={68} y2={122} w={10} />
      <S x1={68} y1={122} x2={66} y2={134} w={9} />
      {/* knees */}
      <S x1={52} y1={110} x2={40} y2={132} w={13} />
      <S x1={40} y1={132} x2={36} y2={142} w={11} />
      <S x1={52} y1={110} x2={62} y2={132} w={13} />
      <S x1={62} y1={132} x2={64} y2={142} w={11} />
      <Arrow x={14} y={110} dir="right" len={22} />
    </>
  );
}

function RussianTwist() {
  return (
    <>
      <line x1={4} y1={150} x2={116} y2={150} stroke={PLAT} strokeWidth={4} />
      <H cx={62} cy={54} />
      {/* torso reclined ~45° */}
      <S x1={62} y1={63} x2={56} y2={100} w={14} />
      <S x1={44} y1={100} x2={68} y2={100} w={5} />
      {/* legs raised and bent */}
      <S x1={44} y1={100} x2={26} y2={124} w={13} />
      <S x1={26} y1={124} x2={24} y2={150} w={11} />
      <S x1={68} y1={100} x2={72} y2={124} w={13} />
      <S x1={72} y1={124} x2={74} y2={150} w={11} />
      {/* arms reaching to one side with weight */}
      <S x1={54} y1={76} x2={36} y2={64} w={10} />
      <S x1={36} y1={64} x2={20} y2={56} w={9} />
      <rect x={8} y={50} width={14} height={8} rx={3} fill={EQUIP_F} />
      <Arrow x={90} y={70} dir="updown" len={14} />
    </>
  );
}

function Rotation() {
  return (
    <>
      <rect x={0} y={76} width={10} height={8} rx={2} fill={EQUIP_F} />
      <line x1={10} y1={80} x2={40} y2={80} stroke={EQUIP} strokeWidth={2} strokeDasharray="4,2" />
      <H cx={62} cy={14} />
      <S x1={62} y1={23} x2={62} y2={70} w={14} />
      <S x1={62} y1={70} x2={46} y2={108} w={13} />
      <S x1={46} y1={108} x2={42} y2={148} w={11} />
      <S x1={62} y1={70} x2={78} y2={108} w={13} />
      <S x1={78} y1={108} x2={82} y2={148} w={11} />
      {/* arm in rotation */}
      <S x1={52} y1={40} x2={40} y2={64} w={10} />
      <S x1={40} y1={64} x2={40} y2={80} w={9} />
      <S x1={72} y1={40} x2={80} y2={62} w={10} />
      <S x1={80} y1={62} x2={84} y2={76} w={9} />
      <path d="M36,80 Q60,58 88,76" fill="none" stroke={EQUIP} strokeWidth={2} strokeDasharray="5,3" opacity={0.8} />
    </>
  );
}

function Compound() {
  return (
    <>
      <H cx={60} cy={14} />
      <S x1={60} y1={23} x2={60} y2={66} w={14} />
      <S x1={50} y1={36} x2={34} y2={18} w={10} />
      <S x1={34} y1={18} x2={36} y2={6} w={9} />
      <S x1={70} y1={36} x2={86} y2={18} w={10} />
      <S x1={86} y1={18} x2={84} y2={6} w={9} />
      <Bar x={20} y={4} len={80} />
      <S x1={60} y1={66} x2={44} y2={106} w={13} />
      <S x1={44} y1={106} x2={38} y2={150} w={11} />
      <S x1={60} y1={66} x2={76} y2={106} w={13} />
      <S x1={76} y1={106} x2={82} y2={150} w={11} />
      <Arrow x={110} y={72} dir="updown" len={22} />
    </>
  );
}

function FrontRaise() {
  return (
    <>
      <H cx={60} cy={14} />
      <S x1={60} y1={23} x2={60} y2={70} w={14} />
      <S x1={60} y1={70} x2={46} y2={108} w={13} />
      <S x1={46} y1={108} x2={42} y2={148} w={11} />
      <S x1={60} y1={70} x2={74} y2={108} w={13} />
      <S x1={74} y1={108} x2={78} y2={148} w={11} />
      {/* one arm raised FORWARD to shoulder height */}
      <S x1={50} y1={36} x2={34} y2={50} w={10} />
      <S x1={34} y1={50} x2={22} y2={36} w={9} />
      <Dumbbell x={12} y={30} />
      {/* other arm at side */}
      <S x1={70} y1={36} x2={90} y2={64} w={10} />
      <S x1={90} y1={64} x2={96} y2={92} w={9} />
      <Dumbbell x={90} y={87} />
      <Arrow x={22} y={50} dir="up" len={16} />
    </>
  );
}

// ─── MAPPING ────────────────────────────────────────────────────────────────

function getKey(name, pattern, muscle, equipment) {
  const n = (name || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "");   // strip accents for matching
  const m = (muscle || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "");
  const p = pattern || "";

  // ── CORE ──────────────────────────────────────────────────────────────────
  if (p === "core") {
    if (n.includes("plancha") || n.includes("plank") || n.includes("hollow") ||
        n.includes("dead bug") || n.includes("vacio") || n.includes("l-sit") ||
        n.includes("pallof") || n.includes("caminata") || n.includes("farmer") ||
        n.includes("suitcase") || n.includes("maletin") || n.includes("bear crawl")) return "plank";
    if (n.includes("rueda") || n.includes("wheel") || n.includes("ab wheel")) return "ab-wheel";
    if (n.includes("russian") || n.includes("giro") || n.includes("twist") ||
        n.includes("windmill") || n.includes("toque") || n.includes("bicicleta") ||
        n.includes("rotacion de tronco") || n.includes("abdominales en v") ||
        n.includes("v ")) return "russian-twist";
    if (n.includes("colgado") || n.includes("elevacion de piernas")) return "hanging-leg-raise";
    if (n.includes("escalador") || n.includes("mountain")) return "pushup";
    return "crunch";
  }

  // ── PUSH ──────────────────────────────────────────────────────────────────
  if (p === "push") {
    const isTri = m.includes("triceps") || n.includes("tricep");
    if (isTri) {
      if (n.includes("polea") || n.includes("cuerda") || n.includes("cable") ||
          n.includes("pushdown") || n.includes("unilateral") || n.includes("en polea")) return "tricep-pushdown";
      if (n.includes("cabeza") || n.includes("overhead") || n.includes("sobre cabeza") ||
          n.includes("extension de triceps con mancuerna")) return "tricep-overhead";
      if (n.includes("fondo en banco") || n.includes("dips con lastre")) return "dip";
      if (n.includes("rompe") || n.includes("skullcrusher") || n.includes("frances") ||
          n.includes("jm press") || n.includes("tate") ||
          n.includes("press de banca con agarre")) return "skull-crusher";
      return "tricep-pushdown";
    }
    if (n.includes("flexion") || n.includes("push-up") || n.includes("push up")) return "pushup";
    if (n.includes("fondo") && n.includes("paralela")) return "dip";
    if (n.includes("apertura") || n.includes("cruce") || n.includes("mariposa") ||
        (m.includes("pectoral") && (n.includes("polea") || n.includes("cable") || n.includes("trx")))) return "fly";
    if (m.includes("pectoral") || n.includes("pecho") || n.includes("banca") || n.includes("bench")) {
      if (n.includes("inclinado") || n.includes("incline")) return "bench-incline";
      return "bench-horizontal";
    }
    if (m.includes("deltoide lateral") || (n.includes("lateral") && !n.includes("estocada"))) return "lateral-raise";
    if (n.includes("frontal") || n.includes("front raise")) return "front-raise";
    return "overhead-press";
  }

  // ── PULL ──────────────────────────────────────────────────────────────────
  if (p === "pull") {
    const isCurl = m.includes("biceps") || m.includes("braquial") || n.includes("curl");
    if (isCurl) {
      if (n.includes("concentrado") || n.includes("predicador") ||
          n.includes("inclinado") || n.includes("arana") || n.includes("bayesian") ||
          n.includes("21") || n.includes("curl en banco")) return "curl-seated";
      return "curl-standing";
    }
    if (m.includes("trapecio superior") || n.includes("encogimiento") || n.includes("shrug") ||
        n.includes("remo al menton")) return "shrug";
    if (m.includes("erector") || n.includes("hiperextension") || n.includes("extension de espalda") ||
        n.includes("superman") || n.includes("buenos dias")) return "back-extension";
    if (m.includes("deltoide posterior") || n.includes("pajaro") || n.includes("face pull") ||
        n.includes("reverso") || n.includes("elevacion posterior")) return "reverse-fly";
    if (n.includes("pullover") || n.includes("pulldown") || n.includes("jalon") ||
        n.includes("pull down") || n.includes("curl de columna")) return "pulldown";
    if (n.includes("dominada") || n.includes("pull-up") || n.includes("chin") ||
        n.includes("pull up")) return "pullup";
    if (n.includes("remo") || n.includes("row")) {
      if (n.includes("polea baja") || n.includes("cable") || n.includes("sentado") ||
          n.includes("al pecho") || n.includes("bajo en maquina") || n.includes("pendlay") ||
          n.includes("maquina")) return "row-seated";
      return "row-bent";
    }
    if (n.includes("peso muerto")) return "deadlift";
    return "row-bent";
  }

  // ── LEGS ──────────────────────────────────────────────────────────────────
  if (p === "legs") {
    // Deadlift family
    if (n.includes("peso muerto")) {
      if (n.includes("rumano") || n.includes("rdl") || n.includes("unilateral")) return "rdl";
      if (n.includes("sumo")) return "deadlift";
      if (n.includes("deficit") || n.includes("rack") || n.includes("trap bar")) return "deadlift";
      return "deadlift";
    }
    // Hip thrust / glute bridge
    if (n.includes("hip thrust") || n.includes("puente de glut") || n.includes("glute bridge") ||
        n.includes("puente de gluteo")) return "hip-thrust";
    // Lunges / split stance
    if (n.includes("estocada") || n.includes("zancada") || n.includes("lunge") ||
        n.includes("step-up") || n.includes("bulgara") || n.includes("bulgar") ||
        n.includes("estacionaria")) return "lunge";
    // Leg curl (hamstring machine) — explicitly check BEFORE general curl
    if (n.includes("curl femoral") || n.includes("isquiotibial") ||
        n.includes("nordico") || n.includes("nordic") ||
        n.includes("curl de isquio") ||
        (n.includes("curl") && (n.includes("femoral") || n.includes("isquio") || n.includes("pierna")))) return "leg-curl";
    // Leg extension (quad machine)
    if ((n.includes("extension") || n.includes("extensión")) &&
        (n.includes("pierna") || n.includes("cuadricep") || n.includes("quad"))) return "leg-extension";
    // Calf / soleus
    if (n.includes("pantorrilla") || n.includes("gemelo") || n.includes("calf") ||
        n.includes("soleo") || n.includes("tibial")) return "calf-raise";
    // Glute / isolation
    if (n.includes("abductor") || n.includes("aductor") || n.includes("caminata lateral") ||
        n.includes("glute kickback")) return "lateral-raise";
    // Kettlebell / swing
    if (n.includes("swing") || n.includes("goblet") || n.includes("kettlebell")) return "kettlebell-swing";
    // Default squat family
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
  "overhead-press":    OverheadPress,
  "lateral-raise":     LateralRaise,
  "front-raise":       FrontRaise,
  "fly":               Fly,
  "pulldown":          Pulldown,
  "pullup":            Pullup,
  "row-bent":          RowBent,
  "row-seated":        RowSeated,
  "reverse-fly":       ReverseFly,
  "back-extension":    BackExtension,
  "shrug":             Shrug,
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
  const key = getKey(name, pattern, muscle, equipment);
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
