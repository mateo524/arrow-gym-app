import React, { useMemo } from "react";

export default function ExerciseProgressChart({ workouts, exerciseName, height = 120 }) {
  const data = useMemo(() => {
    if (!workouts || !exerciseName) return [];

    const sessions = [];

    for (const workout of workouts) {
      const date = workout.date || workout.createdAt || workout.timestamp;
      if (!date) continue;

      let maxWeight = null;

      const sets = workout.sets || [];
      for (const set of sets) {
        const name = set.exercise || "";
        if (name.toLowerCase() !== exerciseName.toLowerCase()) continue;
        const w = parseFloat(set.weight ?? 0);
        if (!isNaN(w) && w > 0) {
          if (maxWeight === null || w > maxWeight) maxWeight = w;
        }
      }

      if (maxWeight !== null) {
        sessions.push({ date: new Date(date), maxWeight });
      }
    }

    sessions.sort((a, b) => a.date - b.date);

    return sessions.slice(-10);
  }, [workouts, exerciseName]);

  if (data.length < 2) {
    return (
      <div
        style={{
          background: "var(--panel2)",
          borderRadius: 10,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted, #888)",
          fontSize: 13,
          padding: "0 16px",
          textAlign: "center",
        }}
      >
        No hay suficientes datos aún
      </div>
    );
  }

  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 16;
  const paddingBottom = 24;
  const width = 320;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const weights = data.map((d) => d.maxWeight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const toX = (i) => paddingLeft + (i / (data.length - 1)) * chartW;
  const toY = (w) => paddingTop + chartH - ((w - minW) / range) * chartH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.maxWeight), ...d }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const formatDate = (d) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}`;
  };

  const lastPoint = points[points.length - 1];
  const labelAbove = lastPoint.y > paddingTop + 14;

  const yTicks = [minW, Math.round((minW + maxW) / 2), maxW];

  return (
    <div
      style={{
        background: "var(--panel2)",
        borderRadius: 10,
        overflow: "hidden",
        width: "100%",
        maxWidth: width,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        style={{ display: "block" }}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={paddingLeft}
              x2={paddingLeft + chartW}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="var(--border, rgba(255,255,255,0.07))"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text
              x={paddingLeft - 4}
              y={toY(tick) + 4}
              textAnchor="end"
              fontSize={9}
              fill="var(--text-muted, #888)"
            >
              {tick}
            </text>
          </g>
        ))}

        {[0, data.length - 1].map((i) => (
          <text
            key={i}
            x={toX(i)}
            y={height - 6}
            textAnchor="middle"
            fontSize={9}
            fill="var(--text-muted, #888)"
          >
            {formatDate(data[i].date)}
          </text>
        ))}

        <path
          d={pathD}
          fill="none"
          stroke="var(--green)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 4 : 3}
            fill={i === points.length - 1 ? "var(--green)" : "var(--panel2)"}
            stroke="var(--green)"
            strokeWidth={2}
          />
        ))}

        <text
          x={lastPoint.x}
          y={labelAbove ? lastPoint.y - 8 : lastPoint.y + 14}
          textAnchor={lastPoint.x > paddingLeft + chartW * 0.8 ? "end" : "middle"}
          fontSize={10}
          fontWeight="600"
          fill="var(--green)"
        >
          {lastPoint.maxWeight} kg
        </text>
      </svg>
    </div>
  );
}
