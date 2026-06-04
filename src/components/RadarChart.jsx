export default function RadarChart({ data }) {
  const size = 300, center = 150, radius = 104;
  const points = data.map((item, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / data.length;
    const r = radius * ((item.score || 0) / 100);
    return { ...item, x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r, lx: center + Math.cos(angle) * (radius + 32), ly: center + Math.sin(angle) * (radius + 32), ax: center + Math.cos(angle) * radius, ay: center + Math.sin(angle) * radius };
  });
  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <div className="radar-card">
      <svg viewBox={`0 0 ${size} ${size}`} className="radar-svg">
        {[0.25, 0.5, 0.75, 1].map((scale) => <circle key={scale} cx={center} cy={center} r={radius * scale} className="radar-ring" />)}
        {points.map((p) => <line key={p.group} x1={center} y1={center} x2={p.ax} y2={p.ay} className="radar-axis" />)}
        <polygon points={polygon} className="radar-fill" />
        <polygon points={polygon} className="radar-line" />
        {points.map((p) => <g key={p.group}><circle cx={p.x} cy={p.y} r="4" className="radar-dot"/><text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" className="radar-label">{p.group}</text><text x={p.lx} y={p.ly+15} textAnchor="middle" dominantBaseline="middle" className="radar-small">{p.sets} series</text></g>)}
      </svg>
    </div>
  );
}
