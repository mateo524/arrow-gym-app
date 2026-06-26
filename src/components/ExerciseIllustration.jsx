// Exercise illustration component — vector stick figures showing body position + movement.
// One illustration per movement pattern; covers all 283 exercises via the getKey() mapping.

const B = { stroke: "#e2e8f0", fill: "none", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" };
const P = { stroke: "#a855f7", fill: "none", strokeWidth: 3,   strokeLinecap: "round", strokeLinejoin: "round" };
const PF = { stroke: "#a855f7", fill: "#a855f7" };
const BF = { fill: "#334155", stroke: "#475569", strokeWidth: 1 };

function Arrow({ x, y, dir = "up", len = 18 }) {
  const d = {
    up:    `M${x},${y} L${x},${y - len} M${x - 5},${y - len + 7} L${x},${y - len} L${x + 5},${y - len + 7}`,
    down:  `M${x},${y} L${x},${y + len} M${x - 5},${y + len - 7} L${x},${y + len} L${x + 5},${y + len - 7}`,
    right: `M${x},${y} L${x + len},${y} M${x + len - 7},${y - 5} L${x + len},${y} L${x + len - 7},${y + 5}`,
    left:  `M${x},${y} L${x - len},${y} M${x - len + 7},${y - 5} L${x - len},${y} L${x - len + 7},${y + 5}`,
    updown:`M${x},${y - len} L${x},${y + len} M${x-4},${y-len+6} L${x},${y-len} L${x+4},${y-len+6} M${x-4},${y+len-6} L${x},${y+len} L${x+4},${y+len-6}`,
  };
  return <path d={d[dir]} {...PF} fill="none" strokeWidth={2} strokeLinecap="round" />;
}

// ─── FIGURES ────────────────────────────────────────────────────────────────

function BenchHorizontal() {
  return (
    <>
      {/* bench */}
      <rect x={8} y={82} width={104} height={8} rx={2} {...BF} />
      <rect x={10} y={90} width={5} height={28} {...BF} />
      <rect x={105} y={90} width={5} height={28} {...BF} />
      {/* head */}
      <circle cx={100} cy={64} r={9} {...B} />
      {/* torso horizontal */}
      <line x1={91} y1={72} x2={28} y2={74} {...B} />
      {/* legs */}
      <line x1={28} y1={74} x2={16} y2={108} {...B} />
      <line x1={16} y1={108} x2={20} y2={148} {...B} />
      <line x1={28} y1={74} x2={38} y2={108} {...B} />
      <line x1={38} y1={108} x2={35} y2={148} {...B} />
      {/* arms pressing up, elbows bent */}
      <line x1={62} y1={74} x2={54} y2={52} {...B} />
      <line x1={54} y1={52} x2={56} y2={33} {...B} />
      <line x1={62} y1={74} x2={70} y2={52} {...B} />
      <line x1={70} y1={52} x2={68} y2={33} {...B} />
      {/* bar */}
      <rect x={40} y={28} width={40} height={5} rx={1} {...P} />
      <circle cx={40} cy={30} r={5} {...P} />
      <circle cx={80} cy={30} r={5} {...P} />
      <Arrow x={18} y={72} dir="up" len={16} />
    </>
  );
}

function BenchIncline() {
  return (
    <>
      {/* incline bench */}
      <polygon points="12,148 20,148 94,58 86,58" {...BF} />
      <rect x={12} y={120} width={5} height={30} {...BF} />
      <rect x={90} y={52} width={5} height={30} {...BF} />
      {/* head (top of incline) */}
      <circle cx={88} cy={44} r={9} {...B} />
      {/* torso diagonal */}
      <line x1={79} y1={52} x2={30} y2={105} {...B} />
      {/* legs */}
      <line x1={30} y1={105} x2={18} y2={138} {...B} />
      <line x1={30} y1={105} x2={40} y2={138} {...B} />
      {/* arms incline pressing */}
      <line x1={62} y1={76} x2={53} y2={52} {...B} />
      <line x1={53} y1={52} x2={55} y2={33} {...B} />
      <line x1={62} y1={76} x2={70} y2={53} {...B} />
      <line x1={70} y1={53} x2={68} y2={34} {...B} />
      {/* bar */}
      <rect x={40} y={27} width={36} height={5} rx={1} {...P} />
      <circle cx={40} cy={29} r={5} {...P} />
      <circle cx={76} cy={29} r={5} {...P} />
      <Arrow x={15} y={95} dir="up" len={16} />
    </>
  );
}

function Dip() {
  return (
    <>
      {/* parallel bars */}
      <line x1={25} y1={58} x2={25} y2={148} {...P} />
      <line x1={95} y1={58} x2={95} y2={148} {...P} />
      <line x1={14} y1={60} x2={36} y2={60} {...P} />
      <line x1={84} y1={60} x2={106} y2={60} {...P} />
      {/* head */}
      <circle cx={60} cy={20} r={9} {...B} />
      {/* torso slightly forward */}
      <line x1={60} y1={29} x2={57} y2={60} {...B} />
      {/* hips */}
      <line x1={48} y1={58} x2={66} y2={58} {...B} />
      {/* arms on bars */}
      <line x1={57} y1={36} x2={38} y2={46} {...B} />
      <line x1={38} y1={46} x2={25} y2={58} {...B} />
      <line x1={57} y1={36} x2={76} y2={46} {...B} />
      <line x1={76} y1={46} x2={95} y2={58} {...B} />
      {/* legs hanging/bent */}
      <line x1={48} y1={58} x2={42} y2={90} {...B} />
      <line x1={42} y1={90} x2={50} y2={118} {...B} />
      <line x1={66} y1={58} x2={72} y2={90} {...B} />
      <line x1={72} y1={90} x2={64} y2={118} {...B} />
      <Arrow x={105} y={72} dir="updown" len={18} />
    </>
  );
}

function Pushup() {
  return (
    <>
      {/* floor line */}
      <line x1={5} y1={122} x2={115} y2={122} stroke="#334155" strokeWidth={2} />
      {/* head */}
      <circle cx={100} cy={84} r={9} {...B} />
      {/* torso diagonal */}
      <line x1={91} y1={90} x2={32} y2={108} {...B} />
      {/* hips */}
      <line x1={45} y1={104} x2={55} y2={108} {...B} />
      {/* arms */}
      <line x1={80} y1={93} x2={90} y2={110} {...B} />
      <line x1={90} y1={110} x2={96} y2={122} {...B} />
      <line x1={72} y1={95} x2={68} y2={112} {...B} />
      <line x1={68} y1={112} x2={62} y2={122} {...B} />
      {/* hands on floor */}
      <circle cx={96} cy={122} r={3} {...B} />
      <circle cx={62} cy={122} r={3} {...B} />
      {/* legs straight */}
      <line x1={32} y1={108} x2={18} y2={118} {...B} />
      <line x1={18} y1={118} x2={10} y2={122} {...B} />
      <line x1={32} y1={108} x2={42} y2={118} {...B} />
      <line x1={42} y1={118} x2={50} y2={122} {...B} />
      <Arrow x={55} y={90} dir="updown" len={16} />
    </>
  );
}

function OverheadPress() {
  return (
    <>
      {/* head */}
      <circle cx={60} cy={16} r={9} {...B} />
      {/* neck + torso */}
      <line x1={60} y1={25} x2={60} y2={72} {...B} />
      {/* hips */}
      <line x1={44} y1={72} x2={76} y2={72} {...B} />
      {/* legs */}
      <line x1={44} y1={72} x2={38} y2={108} {...B} />
      <line x1={38} y1={108} x2={34} y2={148} {...B} />
      <line x1={76} y1={72} x2={82} y2={108} {...B} />
      <line x1={82} y1={108} x2={86} y2={148} {...B} />
      {/* arms overhead */}
      <line x1={48} y1={36} x2={36} y2={22} {...B} />
      <line x1={36} y1={22} x2={36} y2={8}  {...B} />
      <line x1={72} y1={36} x2={84} y2={22} {...B} />
      <line x1={84} y1={22} x2={84} y2={8}  {...B} />
      {/* bar overhead */}
      <rect x={22} y={3} width={76} height={5} rx={1} {...P} />
      <circle cx={22} cy={5} r={5} {...P} />
      <circle cx={98} cy={5} r={5} {...P} />
      <Arrow x={108} y={38} dir="updown" len={18} />
    </>
  );
}

function LateralRaise() {
  return (
    <>
      {/* head */}
      <circle cx={60} cy={16} r={9} {...B} />
      <line x1={60} y1={25} x2={60} y2={72} {...B} />
      <line x1={44} y1={72} x2={76} y2={72} {...B} />
      <line x1={44} y1={72} x2={38} y2={108} {...B} />
      <line x1={38} y1={108} x2={34} y2={148} {...B} />
      <line x1={76} y1={72} x2={82} y2={108} {...B} />
      <line x1={82} y1={108} x2={86} y2={148} {...B} />
      {/* arms out to sides - raised position */}
      <line x1={48} y1={36} x2={18} y2={42} {...B} />
      <line x1={18} y1={42} x2={8}  y2={52} {...B} />
      <line x1={72} y1={36} x2={102} y2={42} {...B} />
      <line x1={102} y1={42} x2={112} y2={52} {...B} />
      {/* dumbbells */}
      <rect x={2}  y={48} width={10} height={5} rx={1} {...P} />
      <rect x={108} y={48} width={10} height={5} rx={1} {...P} />
      <Arrow x={60} y={60} dir="up" len={14} />
    </>
  );
}

function FrontRaise() {
  return (
    <>
      <circle cx={60} cy={16} r={9} {...B} />
      <line x1={60} y1={25} x2={60} y2={72} {...B} />
      <line x1={44} y1={72} x2={76} y2={72} {...B} />
      <line x1={44} y1={72} x2={38} y2={108} {...B} />
      <line x1={38} y1={108} x2={34} y2={148} {...B} />
      <line x1={76} y1={72} x2={82} y2={108} {...B} />
      <line x1={82} y1={108} x2={86} y2={148} {...B} />
      {/* one arm raised forward */}
      <line x1={48} y1={36} x2={38} y2={52} {...B} />
      <line x1={38} y1={52} x2={30} y2={36} {...B} />
      {/* other arm at side */}
      <line x1={72} y1={36} x2={84} y2={64} {...B} />
      <line x1={84} y1={64} x2={90} y2={92} {...B} />
      {/* dumbbell raised */}
      <rect x={22} y={30} width={10} height={5} rx={1} {...P} />
      <Arrow x={60} y={50} dir="up" len={14} />
    </>
  );
}

function Fly() {
  return (
    <>
      {/* bench */}
      <rect x={8} y={82} width={104} height={8} rx={2} {...BF} />
      <rect x={10} y={90} width={5} height={28} {...BF} />
      <rect x={105} y={90} width={5} height={28} {...BF} />
      {/* head */}
      <circle cx={100} cy={64} r={9} {...B} />
      {/* torso */}
      <line x1={91} y1={72} x2={28} y2={74} {...B} />
      {/* legs */}
      <line x1={28} y1={74} x2={16} y2={108} {...B} />
      <line x1={28} y1={74} x2={38} y2={108} {...B} />
      {/* arms wide (fly position) */}
      <line x1={62} y1={74} x2={38} y2={46} {...B} />
      <line x1={38} y1={46} x2={24} y2={38} {...B} />
      <line x1={62} y1={74} x2={86} y2={46} {...B} />
      <line x1={86} y1={46} x2={100} y2={38} {...B} />
      {/* dumbbells at end */}
      <rect x={14} y={33} width={10} height={5} rx={1} {...P} />
      <rect x={96} y={33} width={10} height={5} rx={1} {...P} />
      {/* arc showing movement */}
      <path d="M24,38 Q60,20 100,38" fill="none" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
    </>
  );
}

function Pulldown() {
  return (
    <>
      {/* cable machine top bar */}
      <rect x={8} y={6} width={104} height={6} rx={2} {...BF} />
      {/* cable */}
      <line x1={60} y1={12} x2={60} y2={35} stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3,2" />
      {/* bar */}
      <rect x={32} y={34} width={56} height={5} rx={1} {...P} />
      {/* seat */}
      <rect x={36} y={118} width={48} height={6} rx={2} {...BF} />
      <rect x={46} y={124} width={5} height={24} {...BF} />
      <rect x={69} y={124} width={5} height={24} {...BF} />
      {/* person seated */}
      <circle cx={60} cy={62} r={9} {...B} />
      <line x1={60} y1={71} x2={60} y2={116} {...B} />
      <line x1={44} y1={116} x2={76} y2={116} {...B} />
      {/* arms reaching up to bar */}
      <line x1={52} y1={78} x2={42} y2={56} {...B} />
      <line x1={42} y1={56} x2={38} y2={38} {...B} />
      <line x1={68} y1={78} x2={78} y2={56} {...B} />
      <line x1={78} y1={56} x2={82} y2={38} {...B} />
      {/* legs forward */}
      <line x1={44} y1={116} x2={26} y2={116} {...B} />
      <line x1={76} y1={116} x2={94} y2={116} {...B} />
      <Arrow x={108} y={70} dir="down" len={18} />
    </>
  );
}

function Pullup() {
  return (
    <>
      {/* pull-up bar */}
      <rect x={16} y={8} width={88} height={7} rx={3} {...P} />
      {/* head */}
      <circle cx={60} cy={34} r={9} {...B} />
      {/* torso */}
      <line x1={60} y1={43} x2={60} y2={88} {...B} />
      {/* hips */}
      <line x1={45} y1={88} x2={75} y2={88} {...B} />
      {/* arms overhead gripping bar */}
      <line x1={52} y1={50} x2={38} y2={30} {...B} />
      <line x1={38} y1={30} x2={36} y2={15} {...B} />
      <line x1={68} y1={50} x2={82} y2={30} {...B} />
      <line x1={82} y1={30} x2={84} y2={15} {...B} />
      {/* legs hanging/crossed */}
      <line x1={45} y1={88} x2={38} y2={124} {...B} />
      <line x1={38} y1={124} x2={44} y2={154} {...B} />
      <line x1={75} y1={88} x2={82} y2={124} {...B} />
      <line x1={82} y1={124} x2={76} y2={154} {...B} />
      <Arrow x={108} y={70} dir="updown" len={18} />
    </>
  );
}

function RowBent() {
  return (
    <>
      {/* barbell on floor */}
      <rect x={28} y={136} width={64} height={5} rx={1} {...P} />
      <circle cx={28} cy={138} r={6} {...P} />
      <circle cx={92} cy={138} r={6} {...P} />
      {/* head */}
      <circle cx={96} cy={44} r={9} {...B} />
      {/* torso bent forward ~45° */}
      <line x1={88} y1={52} x2={42} y2={96} {...B} />
      {/* hips */}
      <line x1={42} y1={96} x2={55} y2={100} {...B} />
      {/* legs */}
      <line x1={42} y1={96} x2={36} y2={132} {...B} />
      <line x1={36} y1={132} x2={30} y2={148} {...B} />
      <line x1={55} y1={100} x2={60} y2={132} {...B} />
      <line x1={60} y1={132} x2={58} y2={148} {...B} />
      {/* arms pulling bar to torso */}
      <line x1={72} y1={72} x2={58} y2={106} {...B} />
      <line x1={58} y1={106} x2={55} y2={138} {...B} />
      <line x1={60} y1={74} x2={70} y2={110} {...B} />
      <line x1={70} y1={110} x2={72} y2={138} {...B} />
      <Arrow x={108} y={90} dir="up" len={18} />
    </>
  );
}

function RowSeated() {
  return (
    <>
      {/* cable from left */}
      <line x1={5} y1={100} x2={38} y2={100} stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3,2" />
      {/* handle */}
      <rect x={2} y={96} width={8} height={8} rx={2} {...P} />
      {/* seat */}
      <rect x={52} y={118} width={60} height={6} rx={2} {...BF} />
      <rect x={100} y={124} width={5} height={24} {...BF} />
      {/* foot platform */}
      <rect x={28} y={112} width={28} height={6} rx={1} {...BF} />
      {/* head */}
      <circle cx={90} cy={62} r={9} {...B} />
      {/* torso upright */}
      <line x1={90} y1={71} x2={88} y2={116} {...B} />
      {/* hips */}
      <line x1={78} y1={116} x2={98} y2={116} {...B} />
      {/* legs forward */}
      <line x1={78} y1={116} x2={50} y2={116} {...B} />
      <line x1={50} y1={116} x2={30} y2={116} {...B} />
      <line x1={98} y1={116} x2={80} y2={116} {...B} />
      {/* arms pulling cable */}
      <line x1={82} y1={80} x2={60} y2={92} {...B} />
      <line x1={60} y1={92} x2={38} y2={100} {...B} />
      <line x1={84} y1={82} x2={65} y2={96} {...B} />
      <line x1={65} y1={96} x2={44} y2={100} {...B} />
      <Arrow x={108} y={88} dir="left" len={20} />
    </>
  );
}

function ReverseFly() {
  return (
    <>
      {/* head */}
      <circle cx={96} cy={40} r={9} {...B} />
      {/* torso bent horizontal */}
      <line x1={88} y1={48} x2={38} y2={82} {...B} />
      <line x1={38} y1={82} x2={50} y2={86} {...B} />
      {/* legs */}
      <line x1={38} y1={82} x2={32} y2={118} {...B} />
      <line x1={32} y1={118} x2={28} y2={148} {...B} />
      <line x1={50} y1={86} x2={56} y2={118} {...B} />
      <line x1={56} y1={118} x2={54} y2={148} {...B} />
      {/* arms raising backward/out to sides */}
      <line x1={68} y1={62} x2={52} y2={42} {...B} />
      <line x1={52} y1={42} x2={32} y2={30} {...B} />
      <line x1={68} y1={64} x2={82} y2={46} {...B} />
      <line x1={82} y1={46} x2={104} y2={36} {...B} />
      {/* dumbbells */}
      <rect x={25} y={25} width={10} height={5} rx={1} {...P} />
      <rect x={100} y={31} width={10} height={5} rx={1} {...P} />
      <Arrow x={60} y={46} dir="up" len={16} />
    </>
  );
}

function BackExtension() {
  return (
    <>
      {/* GHD machine platform */}
      <rect x={8} y={88} width={80} height={8} rx={2} {...BF} />
      <rect x={64} y={96} width={6} height={40} {...BF} />
      <rect x={10} y={96} width={6} height={40} {...BF} />
      {/* hip pad */}
      <rect x={55} y={78} width={24} height={10} rx={3} {...P} />
      {/* person extended */}
      <circle cx={108} cy={60} r={9} {...B} />
      <line x1={100} y1={68} x2={60} y2={84} {...B} />
      <line x1={60} y1={84} x2={40} y2={88} {...B} />
      {/* legs down through machine */}
      <line x1={40} y1={88} x2={30} y2={120} {...B} />
      <line x1={30} y1={120} x2={28} y2={148} {...B} />
      <line x1={40} y1={88} x2={50} y2={120} {...B} />
      <line x1={50} y1={120} x2={50} y2={148} {...B} />
      {/* arms across chest */}
      <line x1={92} y1={74} x2={78} y2={76} {...B} />
      <line x1={78} y1={74} x2={92} y2={76} {...B} />
      <Arrow x={60} y={68} dir="up" len={16} />
    </>
  );
}

function Shrug() {
  return (
    <>
      <circle cx={60} cy={16} r={9} {...B} />
      <line x1={60} y1={25} x2={60} y2={72} {...B} />
      <line x1={44} y1={72} x2={76} y2={72} {...B} />
      <line x1={44} y1={72} x2={38} y2={108} {...B} />
      <line x1={38} y1={108} x2={34} y2={148} {...B} />
      <line x1={76} y1={72} x2={82} y2={108} {...B} />
      <line x1={82} y1={108} x2={86} y2={148} {...B} />
      {/* arms straight down, dumbbells */}
      <line x1={44} y1={36} x2={30} y2={72} {...B} />
      <line x1={30} y1={72} x2={24} y2={100} {...B} />
      <line x1={76} y1={36} x2={90} y2={72} {...B} />
      <line x1={90} y1={72} x2={96} y2={100} {...B} />
      <rect x={16} y={96} width={14} height={5} rx={1} {...P} />
      <rect x={90} y={96} width={14} height={5} rx={1} {...P} />
      {/* shoulder shrug arrows */}
      <Arrow x={60} y={30} dir="up" len={12} />
    </>
  );
}

function CurlStanding() {
  return (
    <>
      <circle cx={60} cy={16} r={9} {...B} />
      <line x1={60} y1={25} x2={60} y2={72} {...B} />
      <line x1={44} y1={72} x2={76} y2={72} {...B} />
      <line x1={44} y1={72} x2={38} y2={108} {...B} />
      <line x1={38} y1={108} x2={34} y2={148} {...B} />
      <line x1={76} y1={72} x2={82} y2={108} {...B} />
      <line x1={82} y1={108} x2={86} y2={148} {...B} />
      {/* one arm curled, one at side */}
      <line x1={44} y1={36} x2={30} y2={60} {...B} />
      <line x1={30} y1={60} x2={34} y2={40} {...B} />
      <rect x={26} y={34} width={12} height={5} rx={1} {...P} />
      {/* other arm at side */}
      <line x1={76} y1={36} x2={90} y2={64} {...B} />
      <line x1={90} y1={64} x2={94} y2={92} {...B} />
      <rect x={86} y={88} width={14} height={5} rx={1} {...P} />
      <Arrow x={22} y={58} dir="up" len={16} />
    </>
  );
}

function CurlSeated() {
  return (
    <>
      {/* preacher bench */}
      <polygon points="28,148 42,148 80,80 66,80" {...BF} />
      <rect x={28} y={142} width={14} height={6} {...BF} />
      {/* head */}
      <circle cx={82} cy={52} r={9} {...B} />
      {/* torso */}
      <line x1={80} y1={61} x2={68} y2={90} {...B} />
      {/* arms on preacher pad */}
      <line x1={72} y1={74} x2={60} y2={90} {...B} />
      <line x1={60} y1={90} x2={54} y2={76} {...B} />
      <line x1={74} y1={76} x2={64} y2={90} {...B} />
      <line x1={64} y1={90} x2={58} y2={78} {...B} />
      {/* dumbbell/bar */}
      <rect x={44} y={70} width={20} height={5} rx={1} {...P} />
      {/* legs behind */}
      <line x1={68} y1={90} x2={58} y2={120} {...B} />
      <line x1={58} y1={120} x2={50} y2={148} {...B} />
      <Arrow x={40} y={80} dir="up" len={16} />
    </>
  );
}

function TricepPushdown() {
  return (
    <>
      {/* cable from top */}
      <rect x={8} y={6} width={104} height={6} rx={2} {...BF} />
      <line x1={60} y1={12} x2={60} y2={38} stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3,2" />
      {/* rope/bar handle */}
      <line x1={44} y1={38} x2={76} y2={38} {...P} />
      <circle cx={44} cy={38} r={3} {...P} />
      <circle cx={76} cy={38} r={3} {...P} />
      {/* head */}
      <circle cx={60} cy={24} r={9} {...B} />
      {/* torso slight forward lean */}
      <line x1={60} y1={33} x2={58} y2={78} {...B} />
      <line x1={44} y1={78} x2={72} y2={78} {...B} />
      {/* arms: upper arm close to body, forearm pushes down */}
      <line x1={50} y1={46} x2={46} y2={34} {...B} />
      <line x1={46} y1={34} x2={44} y2={38} {...B} />
      <line x1={70} y1={46} x2={74} y2={34} {...B} />
      <line x1={74} y1={34} x2={76} y2={38} {...B} />
      {/* legs */}
      <line x1={44} y1={78} x2={36} y2={112} {...B} />
      <line x1={36} y1={112} x2={30} y2={148} {...B} />
      <line x1={72} y1={78} x2={80} y2={112} {...B} />
      <line x1={80} y1={112} x2={86} y2={148} {...B} />
      <Arrow x={108} y={50} dir="down" len={18} />
    </>
  );
}

function TricepOverhead() {
  return (
    <>
      <circle cx={60} cy={16} r={9} {...B} />
      <line x1={60} y1={25} x2={60} y2={72} {...B} />
      <line x1={44} y1={72} x2={76} y2={72} {...B} />
      <line x1={44} y1={72} x2={38} y2={108} {...B} />
      <line x1={38} y1={108} x2={34} y2={148} {...B} />
      <line x1={76} y1={72} x2={82} y2={108} {...B} />
      <line x1={82} y1={108} x2={86} y2={148} {...B} />
      {/* arms overhead, elbows pointing up, weight behind head */}
      <line x1={52} y1={36} x2={42} y2={18} {...B} />
      <line x1={42} y1={18} x2={48} y2={38} {...B} />
      <line x1={68} y1={36} x2={78} y2={18} {...B} />
      <line x1={78} y1={18} x2={72} y2={38} {...B} />
      {/* weight behind head */}
      <rect x={46} y={38} width={28} height={6} rx={2} {...P} />
      <Arrow x={60} y={28} dir="up" len={14} />
    </>
  );
}

function SkullCrusher() {
  return (
    <>
      {/* bench */}
      <rect x={8} y={82} width={104} height={8} rx={2} {...BF} />
      <rect x={10} y={90} width={5} height={28} {...BF} />
      <rect x={105} y={90} width={5} height={28} {...BF} />
      {/* head */}
      <circle cx={98} cy={64} r={9} {...B} />
      {/* torso horizontal */}
      <line x1={89} y1={72} x2={28} y2={74} {...B} />
      {/* legs */}
      <line x1={28} y1={74} x2={16} y2={108} {...B} />
      <line x1={28} y1={74} x2={38} y2={108} {...B} />
      {/* arms: upper vertical, forearms pointing toward head */}
      <line x1={62} y1={74} x2={60} y2={46} {...B} />
      <line x1={60} y1={46} x2={78} y2={36} {...B} />
      <line x1={64} y1={74} x2={66} y2={46} {...B} />
      <line x1={66} y1={46} x2={82} y2={36} {...B} />
      {/* bar */}
      <rect x={72} y={30} width={20} height={5} rx={1} {...P} />
      <Arrow x={14} y={72} dir="up" len={14} />
    </>
  );
}

function Squat() {
  return (
    <>
      {/* barbell on traps */}
      <rect x={16} y={44} width={88} height={5} rx={1} {...P} />
      <circle cx={16} cy={46} r={6} {...P} />
      <circle cx={104} cy={46} r={6} {...P} />
      {/* head */}
      <circle cx={60} cy={28} r={9} {...B} />
      {/* neck + torso slight forward */}
      <line x1={60} y1={37} x2={60} y2={44} {...B} />
      <line x1={60} y1={44} x2={58} y2={80} {...B} />
      {/* hips */}
      <line x1={42} y1={80} x2={74} y2={80} {...B} />
      {/* arms holding bar */}
      <line x1={48} y1={52} x2={38} y2={50} {...B} />
      <line x1={38} y1={50} x2={18} y2={48} {...B} />
      <line x1={72} y1={52} x2={82} y2={50} {...B} />
      <line x1={82} y1={50} x2={102} y2={48} {...B} />
      {/* legs: knees bent, squat position */}
      <line x1={42} y1={80} x2={26} y2={112} {...B} />
      <line x1={26} y1={112} x2={24} y2={148} {...B} />
      <line x1={74} y1={80} x2={92} y2={112} {...B} />
      <line x1={92} y1={112} x2={94} y2={148} {...B} />
      <Arrow x={108} y={90} dir="updown" len={18} />
    </>
  );
}

function Deadlift() {
  return (
    <>
      {/* barbell on floor */}
      <rect x={16} y={130} width={88} height={5} rx={1} {...P} />
      <circle cx={16} cy={132} r={8} {...P} />
      <circle cx={104} cy={132} r={8} {...P} />
      {/* person at lift-off position: torso at ~45°, arms down */}
      {/* head */}
      <circle cx={88} cy={44} r={9} {...B} />
      {/* torso angled */}
      <line x1={80} y1={52} x2={46} y2={96} {...B} />
      {/* hips */}
      <line x1={46} y1={96} x2={60} y2={100} {...B} />
      {/* arms straight down to bar */}
      <line x1={68} y1={68} x2={52} y2={100} {...B} />
      <line x1={52} y1={100} x2={48} y2={132} {...B} />
      <line x1={74} y1={70} x2={62} y2={100} {...B} />
      <line x1={62} y1={100} x2={60} y2={132} {...B} />
      {/* legs bent */}
      <line x1={46} y1={96} x2={32} y2={128} {...B} />
      <line x1={32} y1={128} x2={28} y2={148} {...B} />
      <line x1={60} y1={100} x2={70} y2={128} {...B} />
      <line x1={70} y1={128} x2={72} y2={148} {...B} />
      <Arrow x={108} y={90} dir="up" len={20} />
    </>
  );
}

function RDL() {
  return (
    <>
      {/* barbell near shins */}
      <rect x={20} y={114} width={80} height={5} rx={1} {...P} />
      <circle cx={20} cy={116} r={6} {...P} />
      <circle cx={100} cy={116} r={6} {...P} />
      {/* person hip-hinge, back flat */}
      <circle cx={94} cy={40} r={9} {...B} />
      {/* torso ~45° forward */}
      <line x1={86} y1={48} x2={42} y2={92} {...B} />
      {/* hips */}
      <line x1={42} y1={92} x2={56} y2={94} {...B} />
      {/* arms straight down holding bar */}
      <line x1={70} y1={66} x2={52} y2={96} {...B} />
      <line x1={52} y1={96} x2={45} y2={116} {...B} />
      <line x1={76} y1={68} x2={62} y2={96} {...B} />
      <line x1={62} y1={96} x2={58} y2={116} {...B} />
      {/* legs mostly straight, slight knee bend */}
      <line x1={42} y1={92} x2={32} y2={124} {...B} />
      <line x1={32} y1={124} x2={30} y2={148} {...B} />
      <line x1={56} y1={94} x2={62} y2={124} {...B} />
      <line x1={62} y1={124} x2={62} y2={148} {...B} />
      <Arrow x={108} y={80} dir="updown" len={20} />
    </>
  );
}

function HipThrust() {
  return (
    <>
      {/* bench behind */}
      <rect x={56} y={52} width={60} height={12} rx={2} {...BF} />
      <rect x={58} y={64} width={6} height={30} {...BF} />
      <rect x={104} y={64} width={6} height={30} {...BF} />
      {/* floor */}
      <line x1={5} y1={138} x2={115} y2={138} stroke="#334155" strokeWidth={2} />
      {/* barbell on hips */}
      <rect x={22} y={72} width={76} height={5} rx={1} {...P} />
      <circle cx={22} cy={74} r={6} {...P} />
      <circle cx={98} cy={74} r={6} {...P} />
      {/* person bridging */}
      <circle cx={104} cy={42} r={9} {...B} />
      {/* upper torso resting on bench, hips up */}
      <line x1={96} y1={50} x2={60} y2={62} {...B} />
      {/* hips raised */}
      <line x1={60} y1={62} x2={46} y2={76} {...B} />
      {/* thighs going down to feet */}
      <line x1={46} y1={76} x2={32} y2={112} {...B} />
      <line x1={32} y1={112} x2={28} y2={138} {...B} />
      <line x1={46} y1={76} x2={58} y2={110} {...B} />
      <line x1={58} y1={110} x2={60} y2={138} {...B} />
      {/* feet flat */}
      <line x1={22} y1={138} x2={38} y2={138} {...B} />
      <line x1={50} y1={138} x2={68} y2={138} {...B} />
      <Arrow x={14} y={78} dir="updown" len={16} />
    </>
  );
}

function Lunge() {
  return (
    <>
      {/* dumbbells at sides */}
      <rect x={2}  y={72} width={12} height={5} rx={1} {...P} />
      <rect x={106} y={72} width={12} height={5} rx={1} {...P} />
      {/* floor */}
      <line x1={5} y1={150} x2={115} y2={150} stroke="#334155" strokeWidth={2} />
      {/* head */}
      <circle cx={60} cy={16} r={9} {...B} />
      {/* torso upright */}
      <line x1={60} y1={25} x2={60} y2={72} {...B} />
      {/* hips */}
      <line x1={46} y1={72} x2={74} y2={72} {...B} />
      {/* arms down */}
      <line x1={48} y1={36} x2={18} y2={72} {...B} />
      <line x1={72} y1={36} x2={102} y2={72} {...B} />
      {/* front leg: knee bent at 90° */}
      <line x1={46} y1={72} x2={32} y2={110} {...B} />
      <line x1={32} y1={110} x2={30} y2={150} {...B} />
      {/* back leg: knee on ground, foot behind */}
      <line x1={74} y1={72} x2={88} y2={108} {...B} />
      <line x1={88} y1={108} x2={92} y2={134} {...B} />
      <circle cx={92} cy={134} r={4} {...B} />
      <Arrow x={108} y={100} dir="updown" len={18} />
    </>
  );
}

function LegCurl() {
  return (
    <>
      {/* machine bench */}
      <rect x={8} y={70} width={104} height={8} rx={2} {...BF} />
      <rect x={10} y={78} width={5} height={30} {...BF} />
      <rect x={105} y={78} width={5} height={30} {...BF} />
      {/* ankle pad */}
      <rect x={20} y={62} width={16} height={8} rx={3} {...P} />
      {/* head */}
      <circle cx={100} cy={52} r={9} {...B} />
      {/* torso lying prone */}
      <line x1={91} y1={60} x2={30} y2={64} {...B} />
      {/* arms hanging */}
      <line x1={70} y1={62} x2={65} y2={78} {...B} />
      <line x1={65} y1={78} x2={60} y2={82} {...B} />
      {/* legs: one curled */}
      <line x1={30} y1={64} x2={22} y2={76} {...B} />
      <line x1={22} y1={76} x2={28} y2={46} {...B} />
      {/* other leg straight */}
      <line x1={34} y1={64} x2={26} y2={76} {...B} />
      <line x1={26} y1={76} x2={24} y2={104} {...B} />
      <Arrow x={14} y={62} dir="up" len={18} />
    </>
  );
}

function LegExtension() {
  return (
    <>
      {/* machine chair */}
      <rect x={50} y={80} width={62} height={8} rx={2} {...BF} />
      <rect x={55} y={88} width={5} height={40} {...BF} />
      <rect x={102} y={88} width={5} height={40} {...BF} />
      <rect x={50} y={60} width={62} height={20} rx={3} {...BF} />
      {/* shin pad */}
      <rect x={16} y={118} width={16} height={8} rx={3} {...P} />
      {/* head */}
      <circle cx={88} cy={38} r={9} {...B} />
      {/* torso seated upright */}
      <line x1={88} y1={47} x2={86} y2={80} {...B} />
      {/* hips */}
      <line x1={72} y1={80} x2={100} y2={80} {...B} />
      {/* thigh horizontal (seated) */}
      <line x1={72} y1={80} x2={40} y2={82} {...B} />
      {/* lower leg extended forward */}
      <line x1={40} y1={82} x2={18} y2={120} {...B} />
      {/* arms on arm rests */}
      <line x1={78} y1={56} x2={68} y2={68} {...B} />
      <line x1={68} y1={68} x2={56} y2={70} {...B} />
      <Arrow x={8} y={100} dir="up" len={18} />
    </>
  );
}

function CalfRaise() {
  return (
    <>
      {/* step/platform */}
      <rect x={24} y={128} width={72} height={10} rx={2} {...BF} />
      {/* head */}
      <circle cx={60} cy={16} r={9} {...B} />
      <line x1={60} y1={25} x2={60} y2={72} {...B} />
      <line x1={44} y1={72} x2={76} y2={72} {...B} />
      {/* arms at sides (holding dumbbell) */}
      <line x1={44} y1={36} x2={30} y2={72} {...B} />
      <line x1={30} y1={72} x2={24} y2={104} {...B} />
      <rect x={16} y={100} width={12} height={5} rx={1} {...P} />
      <line x1={76} y1={36} x2={90} y2={72} {...B} />
      <line x1={90} y1={72} x2={96} y2={104} {...B} />
      <rect x={92} y={100} width={12} height={5} rx={1} {...P} />
      {/* legs: on tiptoe (raised heels) */}
      <line x1={44} y1={72} x2={40} y2={108} {...B} />
      <line x1={40} y1={108} x2={38} y2={128} {...B} />
      <line x1={76} y1={72} x2={80} y2={108} {...B} />
      <line x1={80} y1={108} x2={82} y2={128} {...B} />
      {/* heels raised off platform */}
      <circle cx={38} cy={128} r={4} {...B} />
      <circle cx={82} cy={128} r={4} {...B} />
      <Arrow x={108} y={100} dir="updown" len={18} />
    </>
  );
}

function Plank() {
  return (
    <>
      {/* floor */}
      <line x1={5} y1={122} x2={115} y2={122} stroke="#334155" strokeWidth={2} />
      {/* head */}
      <circle cx={100} cy={84} r={9} {...B} />
      {/* body straight horizontal */}
      <line x1={91} y1={92} x2={30} y2={100} {...B} />
      {/* hips in line */}
      <line x1={46} y1={98} x2={58} y2={100} {...B} />
      {/* forearms on floor */}
      <line x1={82} y1={95} x2={88} y2={110} {...B} />
      <line x1={88} y1={110} x2={96} y2={122} {...B} />
      <line x1={72} y1={97} x2={74} y2={112} {...B} />
      <line x1={74} y1={112} x2={70} y2={122} {...B} />
      {/* legs straight */}
      <line x1={30} y1={100} x2={16} y2={114} {...B} />
      <line x1={16} y1={114} x2={8}  y2={122} {...B} />
      <line x1={30} y1={100} x2={40} y2={114} {...B} />
      <line x1={40} y1={114} x2={48} y2={122} {...B} />
      {/* hold indicator */}
      <text x={60} y={142} textAnchor="middle" fontSize={9} fill="#a855f7" fontFamily="system-ui" fontWeight={700}>mantener</text>
    </>
  );
}

function Crunch() {
  return (
    <>
      {/* floor */}
      <line x1={5} y1={140} x2={115} y2={140} stroke="#334155" strokeWidth={2} />
      {/* legs bent at knees on floor */}
      <line x1={28} y1={140} x2={46} y2={108} {...B} />
      <line x1={46} y1={108} x2={80} y2={120} {...B} />
      <line x1={80} y1={120} x2={86} y2={140} {...B} />
      {/* back on floor to lower back */}
      <line x1={28} y1={140} x2={46} y2={136} {...B} />
      <line x1={46} y1={136} x2={68} y2={128} {...B} />
      {/* torso crunching up */}
      <line x1={68} y1={128} x2={82} y2={106} {...B} />
      <line x1={82} y1={106} x2={88} y2={88} {...B} />
      {/* head */}
      <circle cx={93} cy={80} r={9} {...B} />
      {/* hands behind head */}
      <line x1={86} y1={76} x2={78} y2={68} {...B} />
      <line x1={96} y1={72} x2={104} y2={64} {...B} />
      <Arrow x={60} y={110} dir="up" len={16} />
    </>
  );
}

function HangingLegRaise() {
  return (
    <>
      {/* bar at top */}
      <rect x={16} y={8} width={88} height={7} rx={3} {...P} />
      {/* head */}
      <circle cx={60} cy={32} r={9} {...B} />
      {/* torso */}
      <line x1={60} y1={41} x2={60} y2={86} {...B} />
      {/* arms up gripping bar */}
      <line x1={52} y1={48} x2={38} y2={26} {...B} />
      <line x1={38} y1={26} x2={36} y2={15} {...B} />
      <line x1={68} y1={48} x2={82} y2={26} {...B} />
      <line x1={82} y1={26} x2={84} y2={15} {...B} />
      {/* hips */}
      <line x1={46} y1={86} x2={74} y2={86} {...B} />
      {/* legs raised to 90° */}
      <line x1={46} y1={86} x2={34} y2={120} {...B} />
      <line x1={34} y1={120} x2={30} y2={148} {...B} />
      <line x1={74} y1={86} x2={86} y2={120} {...B} />
      <line x1={86} y1={120} x2={90} y2={148} {...B} />
      <Arrow x={108} y={108} dir="up" len={20} />
    </>
  );
}

function KettlebellSwing() {
  return (
    <>
      {/* floor */}
      <line x1={5} y1={150} x2={115} y2={150} stroke="#334155" strokeWidth={2} />
      {/* head */}
      <circle cx={86} cy={38} r={9} {...B} />
      {/* torso hinged forward */}
      <line x1={78} y1={46} x2={40} y2={88} {...B} />
      <line x1={40} y1={88} x2={52} y2={92} {...B} />
      {/* legs hip-width, slight knee bend */}
      <line x1={40} y1={88} x2={30} y2={118} {...B} />
      <line x1={30} y1={118} x2={26} y2={150} {...B} />
      <line x1={52} y1={92} x2={62} y2={118} {...B} />
      <line x1={62} y1={118} x2={62} y2={150} {...B} />
      {/* arms swinging forward/up */}
      <line x1={62} y1={64} x2={48} y2={82} {...B} />
      <line x1={48} y1={82} x2={34} y2={70} {...B} />
      <line x1={64} y1={66} x2={52} y2={84} {...B} />
      <line x1={52} y1={84} x2={38} y2={74} {...B} />
      {/* kettlebell */}
      <rect x={24} y={62} width={14} height={11} rx={3} {...P} />
      <path d="M28,62 Q31,55 34,62" fill="none" {...P} strokeWidth={2} />
      <Arrow x={108} y={90} dir="up" len={22} />
    </>
  );
}

function AbWheel() {
  return (
    <>
      {/* floor */}
      <line x1={5} y1={140} x2={115} y2={140} stroke="#334155" strokeWidth={2} />
      {/* wheel */}
      <circle cx={60} cy={132} r={8} {...P} />
      <line x1={44} y1={132} x2={76} y2={132} {...P} />
      {/* person: starting from knees, arms extended */}
      <circle cx={102} cy={72} r={9} {...B} />
      {/* torso extended forward */}
      <line x1={94} y1={80} x2={52} y2={110} {...B} />
      {/* arms extended forward */}
      <line x1={82} y1={84} x2={62} y2={118} {...B} />
      <line x1={62} y1={118} x2={60} y2={132} {...B} />
      <line x1={86} y1={86} x2={68} y2={120} {...B} />
      <line x1={68} y1={120} x2={66} y2={132} {...B} />
      {/* knees on floor */}
      <line x1={52} y1={110} x2={40} y2={130} {...B} />
      <line x1={40} y1={130} x2={36} y2={140} {...B} />
      <line x1={52} y1={110} x2={60} y2={130} {...B} />
      <line x1={60} y1={130} x2={62} y2={140} {...B} />
      <Arrow x={16} y={108} dir="right" len={20} />
    </>
  );
}

function RussianTwist() {
  return (
    <>
      {/* floor */}
      <line x1={5} y1={148} x2={115} y2={148} stroke="#334155" strokeWidth={2} />
      {/* person seated, legs raised */}
      <circle cx={60} cy={56} r={9} {...B} />
      {/* torso reclined */}
      <line x1={60} y1={65} x2={56} y2={100} {...B} />
      {/* hips */}
      <line x1={44} y1={100} x2={68} y2={100} {...B} />
      {/* legs raised bent */}
      <line x1={44} y1={100} x2={28} y2={124} {...B} />
      <line x1={28} y1={124} x2={26} y2={148} {...B} />
      <line x1={68} y1={100} x2={72} y2={124} {...B} />
      <line x1={72} y1={124} x2={74} y2={148} {...B} />
      {/* arms with weight, rotated to side */}
      <line x1={52} y1={78} x2={34} y2={66} {...B} />
      <line x1={34} y1={66} x2={20} y2={60} {...B} />
      <rect x={10} y={55} width={12} height={7} rx={2} {...P} />
      <Arrow x={90} y={72} dir="left" len={20} />
    </>
  );
}

function Rotation() {
  return (
    <>
      {/* cable from left */}
      <line x1={5} y1={76} x2={38} y2={76} stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3,2" />
      <rect x={2} y={72} width={8} height={8} rx={2} {...P} />
      {/* head */}
      <circle cx={60} cy={16} r={9} {...B} />
      <line x1={60} y1={25} x2={60} y2={72} {...B} />
      <line x1={44} y1={72} x2={76} y2={72} {...B} />
      <line x1={44} y1={72} x2={38} y2={108} {...B} />
      <line x1={38} y1={108} x2={34} y2={148} {...B} />
      <line x1={76} y1={72} x2={82} y2={108} {...B} />
      <line x1={82} y1={108} x2={86} y2={148} {...B} />
      {/* arm rotating */}
      <line x1={56} y1={42} x2={42} y2={64} {...B} />
      <line x1={42} y1={64} x2={38} y2={76} {...B} />
      <line x1={64} y1={42} x2={72} y2={64} {...B} />
      <line x1={72} y1={64} x2={82} y2={76} {...B} />
      {/* rotation arc */}
      <path d="M38,76 Q60,60 82,76" fill="none" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.7} />
      <Arrow x={90} y={72} dir="right" len={14} />
    </>
  );
}

function Compound() {
  return (
    <>
      {/* generic full body compound movement */}
      <circle cx={60} cy={16} r={9} {...B} />
      <line x1={60} y1={25} x2={60} y2={68} {...B} />
      <line x1={44} y1={68} x2={76} y2={68} {...B} />
      {/* arms in action */}
      <line x1={48} y1={36} x2={32} y2={54} {...B} />
      <line x1={32} y1={54} x2={28} y2={40} {...B} />
      <line x1={72} y1={36} x2={88} y2={54} {...B} />
      <line x1={88} y1={54} x2={92} y2={40} {...B} />
      {/* weight overhead */}
      <rect x={22} y={30} width={76} height={5} rx={1} {...P} />
      {/* legs slight squat */}
      <line x1={44} y1={68} x2={34} y2={104} {...B} />
      <line x1={34} y1={104} x2={28} y2={148} {...B} />
      <line x1={76} y1={68} x2={86} y2={104} {...B} />
      <line x1={86} y1={104} x2={92} y2={148} {...B} />
      <Arrow x={108} y={70} dir="updown" len={20} />
    </>
  );
}

// ─── ILLUSTRATION KEY MAPPING ───────────────────────────────────────────────

function getKey(name, pattern, muscle, equipment) {
  const n = (name || "").toLowerCase();
  const m = (muscle || "").toLowerCase();
  const p = pattern || "";

  if (p === "core") {
    if (n.includes("plancha") || n.includes("plank") || n.includes("hollow") || n.includes("dead bug") || n.includes("vacío") || n.includes("l-sit")) return "plank";
    if (n.includes("rueda") || n.includes("wheel")) return "ab-wheel";
    if (n.includes("russian") || n.includes("giro") || n.includes("twist") || n.includes("windmill") || n.includes("toque") || n.includes("bicicleta") || n.includes("rotación de tronco") || n.includes("v")) return "russian-twist";
    if (n.includes("colgado") || n.includes("elevación de piernas")) return "hanging-leg-raise";
    if (n.includes("escalador") || n.includes("mountain") || n.includes("bear crawl")) return "pushup";
    if (n.includes("pallof") || n.includes("caminata") || n.includes("farmer") || n.includes("suitcase") || n.includes("maletín")) return "plank";
    return "crunch";
  }

  if (p === "push") {
    if (m.includes("tríceps") || m.includes("triceps") || n.includes("tricep")) {
      if (n.includes("polea") || n.includes("cuerda") || n.includes("pushdown") || n.includes("extensión de tríceps en polea") || n.includes("unilateral")) return "tricep-pushdown";
      if (n.includes("cabeza") || n.includes("overhead") || n.includes("sobre cabeza")) return "tricep-overhead";
      if (n.includes("fondo en banco") || n.includes("dip con lastre")) return "dip";
      if (n.includes("press de banca con agarre") || n.includes("rompecráneos") || n.includes("press francés") || n.includes("skull") || n.includes("jm press") || n.includes("tate press")) return "skull-crusher";
      return "tricep-pushdown";
    }
    if (n.includes("flexión") || n.includes("flexiones") || n.includes("push-up") || n.includes("push up")) return "pushup";
    if (n.includes("fondo") || n.includes("paralelas")) return "dip";
    if (n.includes("apertura") || n.includes("cruce") || n.includes("mariposa") || n.includes("fly") || (m.includes("pectoral") && (n.includes("cable") || n.includes("polea")))) return "fly";
    if (m.includes("pectoral") || n.includes("pecho") || n.includes("banca")) {
      if (n.includes("inclinado") || n.includes("incline")) return "bench-incline";
      return "bench-horizontal";
    }
    if (m.includes("deltoide lateral") || n.includes("lateral")) return "lateral-raise";
    if (m.includes("deltoide anterior") || n.includes("frontal") || n.includes("front raise")) {
      if (n.includes("frontal") || n.includes("front")) return "front-raise";
      return "overhead-press";
    }
    return "overhead-press";
  }

  if (p === "pull") {
    if (m.includes("bíceps") || m.includes("biceps") || m.includes("braquial") || n.includes("curl")) {
      if (n.includes("concentrado") || n.includes("predicador") || n.includes("inclinado") || n.includes("araña") || n.includes("bayesian") || n.includes("21")) return "curl-seated";
      return "curl-standing";
    }
    if (m.includes("trapecio") || n.includes("encogimiento") || n.includes("shrug")) return "shrug";
    if (m.includes("erector") || n.includes("hiperextensión") || n.includes("extensión de espalda") || n.includes("superman") || n.includes("buenos días")) return "back-extension";
    if (m.includes("deltoide posterior") || n.includes("pájaro") || n.includes("face pull") || n.includes("reverso") || n.includes("posterior") || n.includes("pájaros")) return "reverse-fly";
    if (n.includes("pullover") || n.includes("pulldown") || n.includes("jalón") || n.includes("curl de columna")) return "pulldown";
    if (n.includes("dominada") || n.includes("pull-up") || n.includes("chin")) return "pullup";
    if (n.includes("remo") || n.includes("row")) {
      if (n.includes("polea baja") || n.includes("cable") || n.includes("sentado") || n.includes("al pecho") || n.includes("bajo en máquina") || n.includes("pendlay")) return "row-seated";
      return "row-bent";
    }
    if (n.includes("peso muerto")) return "deadlift";
    if (n.includes("encogimiento") || n.includes("remo al mentón")) return "shrug";
    return "row-bent";
  }

  if (p === "legs") {
    if (n.includes("peso muerto")) {
      if (n.includes("rumano") || n.includes("rdl") || n.includes("unilateral")) return "rdl";
      if (n.includes("sumo")) return "deadlift";
      return "deadlift";
    }
    if (n.includes("hip thrust") || n.includes("puente de glúteo") || n.includes("glute bridge")) return "hip-thrust";
    if (n.includes("estocada") || n.includes("zancada") || n.includes("lunge") || n.includes("step-up")) return "lunge";
    if (n.includes("curl femoral") || n.includes("isquiotibial") || n.includes("nórdico") || n.includes("nordic") || (n.includes("curl") && (n.includes("pierna") || n.includes("femoral")))) return "leg-curl";
    if (n.includes("extensión de") && (n.includes("pierna") || n.includes("cuadricep"))) return "leg-extension";
    if (n.includes("pantorrilla") || n.includes("gemelo") || n.includes("calf") || n.includes("sóleo")) return "calf-raise";
    if (n.includes("abductor") || n.includes("aductor") || n.includes("caminata lateral")) return "lateral-raise";
    if (n.includes("swing") || n.includes("kettlebell") || n.includes("goblet")) return "kettlebell-swing";
    if (n.includes("sentadilla") || n.includes("squat") || n.includes("prensa") || n.includes("hack")) return "squat";
    if (n.includes("glute kickback")) return "leg-curl";
    return "squat";
  }

  if (p === "rehab") return "rotation";
  if (p === "compound") return "compound";

  return "compound";
}

const FIGURES = {
  "bench-horizontal": BenchHorizontal,
  "bench-incline":    BenchIncline,
  "dip":              Dip,
  "pushup":           Pushup,
  "overhead-press":   OverheadPress,
  "lateral-raise":    LateralRaise,
  "front-raise":      FrontRaise,
  "fly":              Fly,
  "pulldown":         Pulldown,
  "pullup":           Pullup,
  "row-bent":         RowBent,
  "row-seated":       RowSeated,
  "reverse-fly":      ReverseFly,
  "back-extension":   BackExtension,
  "shrug":            Shrug,
  "curl-standing":    CurlStanding,
  "curl-seated":      CurlSeated,
  "tricep-pushdown":  TricepPushdown,
  "tricep-overhead":  TricepOverhead,
  "skull-crusher":    SkullCrusher,
  "squat":            Squat,
  "deadlift":         Deadlift,
  "rdl":              RDL,
  "hip-thrust":       HipThrust,
  "lunge":            Lunge,
  "leg-curl":         LegCurl,
  "leg-extension":    LegExtension,
  "calf-raise":       CalfRaise,
  "plank":            Plank,
  "crunch":           Crunch,
  "hanging-leg-raise":HangingLegRaise,
  "kettlebell-swing": KettlebellSwing,
  "ab-wheel":         AbWheel,
  "russian-twist":    RussianTwist,
  "rotation":         Rotation,
  "compound":         Compound,
};

export default function ExerciseIllustration({ name, pattern, muscle, equipment, size = 130 }) {
  const key = getKey(name, pattern, muscle, equipment);
  const Figure = FIGURES[key] || Compound;
  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={size * (160 / 120)}
      style={{ display: "block", overflow: "visible" }}
      aria-label={`Ilustración: ${name}`}
    >
      <Figure />
    </svg>
  );
}
