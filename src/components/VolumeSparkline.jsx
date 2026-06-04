import { useMemo } from "react";

export default function VolumeSparkline({ data = [], width = 120, height = 32 }) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const max = Math.max(...data, 1);
    const stepX = width / (data.length - 1);
    return data
      .map((v, i) => {
        const x = i * stepX;
        const y = height - (v / max) * (height - 4) - 2;
        return i === 0 ? `M${x},${y}` : `L${x},${y}`;
      })
      .join(" ");
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="volume-sparkline" aria-label={`Volume trend: ${data.join(", ")} kg`} role="img">
      <path d={path} fill="none" stroke="var(--cyan)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
