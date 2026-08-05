const COLORS = ["#a855f7","#38bdf8","#a78bfa","#fb923c","#f472b6","#facc15"];

export default function MuscleRadarChart({ data }) {
  const cx = 95, cy = 95, r = 62;
  const n = data.length;
  const max = Math.max(...data.map(d => d.value), 1);
  const angle = (i) => (Math.PI * 2 * i / n) - Math.PI / 2;
  const point = (i, ratio) => {
    const a = angle(i);
    return [cx + r * ratio * Math.cos(a), cy + r * ratio * Math.sin(a)];
  };
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = data.map((d, i) => point(i, d.value / max));
  const polyline = [...dataPoints, dataPoints[0]].map(p => p.join(",")).join(" ");

  return (
    <svg width={190} height={190} viewBox="0 0 190 190" style={{ display: "block", overflow: "hidden" }}>
      {gridLevels.map(l => {
        const pts = data.map((_, i) => point(i, l).join(",")).join(" ");
        return <polygon key={l} points={pts} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={1} />;
      })}
      {data.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,.1)" strokeWidth={1} />;
      })}
      <polygon points={polyline} fill="rgba(168,85,247,.18)" stroke="#a855f7" strokeWidth={2} />
      {data.map((d, i) => {
        const [px, py] = point(i, 1.22);
        const [dx, dy] = dataPoints[i];
        return (
          <g key={i}>
            <circle cx={dx} cy={dy} r={3.5} fill={COLORS[i % COLORS.length]} />
            <text x={px} y={py} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,.7)" fontSize={9} fontWeight={600}>{d.name}</text>
            {d.value > 0 && (
              <text x={dx} y={dy - 8} textAnchor="middle" fill={COLORS[i % COLORS.length]}
                fontSize={8} fontWeight={700}>{d.pct}%</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
