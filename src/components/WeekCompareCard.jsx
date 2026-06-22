import React from "react";

function DiffArrow({ diff }) {
  if (diff > 0) return <span style={{ color: "#22c55e" }}>↑</span>;
  if (diff < 0) return <span style={{ color: "#ef4444" }}>↓</span>;
  return <span style={{ color: "#9ca3af" }}>=</span>;
}

function diffColor(diff) {
  if (diff > 0) return "#22c55e";
  if (diff < 0) return "#ef4444";
  return "#9ca3af";
}

export default function WeekCompareCard({ thisWeek, lastWeek, countDiff, volumeDiff }) {
  const volumePct =
    lastWeek.volume && lastWeek.volume !== 0
      ? ((volumeDiff / lastWeek.volume) * 100).toFixed(1)
      : null;

  return (
    <div style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          color: "#9ca3af",
          fontWeight: 600,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: "0.35rem",
        }}
      >
        <span />
        <span style={{ textAlign: "center" }}>Esta semana</span>
        <span style={{ textAlign: "center" }}>Sem. anterior</span>
      </div>

      {/* Count row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          alignItems: "center",
          marginBottom: "0.25rem",
        }}
      >
        <span style={{ color: "#6b7280", fontWeight: 500 }}>Entrenos</span>
        <span style={{ textAlign: "center", fontWeight: 700, color: "#f3f4f6" }}>
          {thisWeek.count}{" "}
          <DiffArrow diff={countDiff} />
        </span>
        <span style={{ textAlign: "center", color: "#9ca3af" }}>{lastWeek.count}</span>
      </div>

      {/* Volume row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#6b7280", fontWeight: 500 }}>Volumen</span>
        <span style={{ textAlign: "center", fontWeight: 700, color: "#f3f4f6" }}>
          {thisWeek.volume.toLocaleString()} kg{" "}
          <DiffArrow diff={volumeDiff} />
        </span>
        <span style={{ textAlign: "center", color: "#9ca3af" }}>
          {lastWeek.volume.toLocaleString()} kg
        </span>
      </div>

      {/* Percentage diff summary */}
      {volumePct !== null && (
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            color: diffColor(volumeDiff),
            fontWeight: 600,
          }}
        >
          {volumeDiff >= 0 ? "+" : ""}
          {volumePct}% vs semana anterior
        </div>
      )}
    </div>
  );
}
