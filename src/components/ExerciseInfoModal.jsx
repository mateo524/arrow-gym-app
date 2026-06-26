import { useMemo, useEffect } from "react";
import { findExerciseMeta } from "../data/exerciseDatabase.js";
import { getExerciseTips } from "../data/exerciseTips.js";
import MuscleMap from "./MuscleMap.jsx";

const EQUIPMENT_ICON = {
  "Barra": "🏋️", "Mancuernas": "💪", "Máquina": "⚙️", "Polea": "🔗",
  "Peso corporal": "🤸", "Kettlebell": "🫧", "Smith": "🏗️",
  "Banda": "🪢", "TRX": "🪢", "Landmine": "📐",
};

const GROUP_COLOR = {
  Pecho: "#f97316", Espalda: "#3b82f6", Hombros: "#a855f7",
  Brazos: "#22c55e", Piernas: "#eab308", Core: "#ec4899",
};

export default function ExerciseInfoModal({ exerciseName, onClose }) {
  const meta = useMemo(() => findExerciseMeta(exerciseName), [exerciseName]);
  const tips = useMemo(() => getExerciseTips(meta), [meta]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquear scroll del fondo
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!meta) return null;

  const accentColor = GROUP_COLOR[meta.group] || "#a855f7";
  const equipIcon = EQUIPMENT_ICON[meta.equipment] || "🏋️";

  // Músculos: primario + secundarios
  const primaryMuscle = meta.muscle;
  const secondaryMuscles = (meta.muscles || []).filter(m => m !== primaryMuscle);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.65)",
          zIndex: 1200,
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          zIndex: 1201,
          background: "var(--bg, #0a0f1a)",
          borderRadius: "22px 22px 0 0",
          border: "1px solid rgba(255,255,255,.08)",
          borderBottom: "none",
          maxHeight: "88vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "0 16px 40px",
          animation: "slideUpModal .25s cubic-bezier(.32,1.12,.64,1) both",
        }}
      >
        <style>{`
          @keyframes slideUpModal {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: "rgba(255,255,255,.18)", borderRadius: 2, margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 16, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, lineHeight: 1.2, color: "var(--text, #e2e8f0)" }}>
              {meta.name}
            </h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: `${accentColor}22`, color: accentColor,
                border: `1px solid ${accentColor}44`,
              }}>{meta.group}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                background: "rgba(255,255,255,.06)", color: "var(--muted, #64748b)",
                border: "1px solid rgba(255,255,255,.1)",
              }}>{equipIcon} {meta.equipment}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.08)", border: "none", borderRadius: "50%",
              width: 32, height: 32, cursor: "pointer", color: "var(--muted, #64748b)",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Muscle diagram */}
        <MuscleMap muscles={meta.muscles || [meta.muscle]} height={160} color={accentColor} />

        {/* Muscles chips */}
        <div style={{ marginTop: 10, marginBottom: 14 }}>
          <p style={{ margin: "0 0 6px", fontSize: 10, color: "var(--muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Músculos</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            <span style={{
              fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
              background: `${accentColor}30`, color: accentColor,
              border: `1px solid ${accentColor}55`,
            }}>{primaryMuscle}</span>
            {secondaryMuscles.map(m => (
              <span key={m} style={{
                fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20,
                background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.45)",
                border: "1px solid rgba(255,255,255,.1)",
              }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, color: "var(--muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Ejecución</p>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {tips.steps.map((step, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0,
                  width: 22, height: 22, borderRadius: "50%",
                  background: `${accentColor}20`, color: accentColor,
                  border: `1px solid ${accentColor}44`,
                  fontSize: 11, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 1,
                }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: "var(--text, #e2e8f0)", lineHeight: 1.5 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tip */}
        {tips.tip && (
          <div style={{
            background: "rgba(168,85,247,.07)",
            border: "1px solid rgba(168,85,247,.2)",
            borderRadius: 12,
            padding: "10px 12px",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>{tips.tip}</span>
          </div>
        )}
      </div>
    </>
  );
}
