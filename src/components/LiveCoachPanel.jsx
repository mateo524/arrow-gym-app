import { useState, useEffect, useRef } from "react";
import { VOLUME_LANDMARKS } from "../lib/analytics.js";

const TYPE_META = {
  pr:          { icon: "🏆", color: "#a855f7", bg: "rgba(168,85,247,.1)",   label: "Record" },
  ready:       { icon: "↑",  color: "#a855f7", bg: "rgba(168,85,247,.08)",  label: "Progresión" },
  plateau:     { icon: "⚠",  color: "#f59e0b", bg: "rgba(245,158,11,.1)",   label: "Plateau" },
  fatigue:     { icon: "⚡", color: "#f59e0b", bg: "rgba(245,158,11,.1)",   label: "Fatiga" },
  form:        { icon: "⚠",  color: "#f87171", bg: "rgba(248,113,113,.1)",  label: "Técnica" },
  overreach:   { icon: "🔴", color: "#f87171", bg: "rgba(248,113,113,.1)",  label: "Exceso" },
  high_volume: { icon: "🟡", color: "#f59e0b", bg: "rgba(245,158,11,.08)",  label: "Volumen" },
  balance:     { icon: "⚖",  color: "#a78bfa", bg: "rgba(167,139,250,.1)",  label: "Balance" },
  recovery:    { icon: "💤", color: "#60a5fa", bg: "rgba(96,165,250,.1)",   label: "Recovery" },
  deload:      { icon: "😴", color: "#94a3b8", bg: "rgba(148,163,184,.1)",  label: "Deload" },
};

const STATUS_COLOR = {
  below_mev:      "#60a5fa",
  optimal:        "#a855f7",
  approaching_mrv:"#f59e0b",
  over_mrv:       "#f87171",
};
const STATUS_LABEL = {
  below_mev:      "Bajo",
  optimal:        "Óptimo",
  approaching_mrv:"Alto",
  over_mrv:       "Exceso",
};

export default function LiveCoachPanel({ hints, volStatus }) {
  const [expanded, setExpanded] = useState(false);
  const [newHintCount, setNewHintCount] = useState(0);
  const prevHintsRef = useRef(hints);
  const pulseRef = useRef(false);

  // Detect new hints arriving
  useEffect(() => {
    const prev = prevHintsRef.current;
    const prevMsgs = new Set(prev.map(h => h.msg));
    const added = hints.filter(h => !prevMsgs.has(h.msg));
    if (added.length > 0 && !expanded) {
      setNewHintCount(n => n + added.length);
      pulseRef.current = true;
      setTimeout(() => { pulseRef.current = false; }, 2000);
    }
    prevHintsRef.current = hints;
  }, [hints]);

  const topHint = hints[0];
  const volGroups = Object.entries(volStatus || {}).filter(([, d]) => d.sessionSets > 0);

  return (
    <div style={{
      background: "var(--panel)",
      borderRadius: 14,
      marginBottom: 12,
      border: "1px solid rgba(168,85,247,.15)",
      overflow: "hidden",
      transition: "all 0.3s ease",
    }}>
      {/* Header */}
      <button
        onClick={() => { setExpanded(e => !e); setNewHintCount(0); }}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>🤖</span>
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Coach en vivo
            </span>
            {newHintCount > 0 && !expanded && (
              <span style={{
                background: "var(--green)", color: "#fff",
                fontSize: 10, fontWeight: 900, borderRadius: 10,
                padding: "1px 6px", animation: "pulse 1s ease-in-out 3",
              }}>
                +{newHintCount}
              </span>
            )}
          </div>
          {!expanded && topHint && (
            <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {topHint.msg}
            </p>
          )}
          {!expanded && !topHint && (
            <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>
              Completá series para recibir análisis
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {hints.length > 0 && (
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>
              {hints.length}
            </span>
          )}
          <span style={{ color: "var(--muted)", fontSize: 12, transition: "transform 0.3s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "12px 14px" }}>
          {/* Volume status per group */}
          {volGroups.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Volumen semanal por grupo
              </p>
              <p style={{ fontSize: 9, color: "var(--muted)", margin: "0 0 8px" }}>
                Series totales esta semana (MEV–MAV–MRV son rangos semanales, no por sesión)
              </p>
              {volGroups.map(([group, data]) => {
                const pct = Math.min(100, (data.weekTotal / data.landmark.mrv) * 100);
                const mevPct = (data.landmark.mev / data.landmark.mrv) * 100;
                const mavPct = (data.landmark.mav / data.landmark.mrv) * 100;
                const color = STATUS_COLOR[data.status];
                return (
                  <div key={group} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{group}</span>
                      <span style={{ fontSize: 11, color }}>
                        <b>{data.weekTotal}</b>/{data.landmark.mrv} series · <span style={{ fontWeight: 700 }}>{STATUS_LABEL[data.status]}</span>
                      </span>
                    </div>
                    <div style={{ position: "relative", height: 6, background: "var(--panel2)", borderRadius: 4, overflow: "visible" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: color,
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                      }} />
                      {/* MEV marker */}
                      <div style={{ position: "absolute", top: -2, left: `${mevPct}%`, width: 1, height: 10, background: "rgba(255,255,255,.4)" }} />
                      {/* MAV marker */}
                      <div style={{ position: "absolute", top: -2, left: `${mavPct}%`, width: 1, height: 10, background: "rgba(255,255,255,.7)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 3, fontSize: 9, color: "var(--muted)" }}>
                      <span>MEV {data.landmark.mev}s</span>
                      <span>MAV {data.landmark.mav}s</span>
                      <span>MRV {data.landmark.mrv}s</span>
                      {data.sessionSets > 0 && <span style={{ marginLeft: "auto", color }}>(+{data.sessionSets} esta sesión)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hints list */}
          {hints.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {hints.map((h, i) => {
                const meta = TYPE_META[h.type] || TYPE_META.form;
                return (
                  <div key={i} style={{
                    background: meta.bg,
                    borderLeft: `3px solid ${meta.color}`,
                    borderRadius: "0 8px 8px 0",
                    padding: "8px 12px",
                    display: "flex", gap: 8, alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: 14, marginTop: 1 }}>{meta.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: meta.color, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 1 }}>{meta.label}</span>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--text)", lineHeight: 1.4 }}>{h.msg}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, margin: 0 }}>
              Registrá series con peso y reps para ver análisis en tiempo real
            </p>
          )}
        </div>
      )}
    </div>
  );
}

