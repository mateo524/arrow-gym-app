import { useMemo } from "react";

export default function WorkoutSharePage({ data }) {
  const summary = useMemo(() => {
    try {
      return JSON.parse(atob(data));
    } catch {
      return null;
    }
  }, [data]);

  if (!summary) {
    return (
      <div style={{ minHeight: "100dvh", background: "#050408", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>😕</div>
        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14 }}>Link de entreno inválido o expirado.</p>
        <a href="https://loop-gym.vercel.app" style={{ marginTop: 16, color: "#a855f7", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Abrir Loop Gym →</a>
      </div>
    );
  }

  const dateStr = summary.date
    ? new Date(summary.date + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  const pctColor = summary.overallPct > 0 ? "#4ade80" : summary.overallPct < 0 ? "#f87171" : "rgba(255,255,255,.5)";
  const pctSign  = summary.overallPct >= 0 ? "+" : "";

  const stats = [
    { label: "Volumen",    value: summary.thisVol ? `${summary.thisVol}kg` : "–" },
    { label: "Series",     value: summary.totalSets ?? "–"  },
    { label: "Ejercicios", value: summary.exercises ?? "–"  },
    ...(summary.newPRs > 0 ? [{ label: "PRs", value: `⚡ ${summary.newPRs}` }] : []),
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(160deg, #1a0a30 0%, #050209 60%)", color: "#f5f0ff", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 20px 48px" }}>

      {/* Logo */}
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, color: "#a855f7", marginBottom: 32 }}>
        LOOP<span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#7c3aed", marginLeft: 4, verticalAlign: "middle", marginBottom: 3 }} />
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: "28px 24px", boxShadow: "0 16px 60px rgba(0,0,0,.6)" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          {dateStr && <p style={{ margin: "0 0 6px", fontSize: 12, color: "rgba(255,255,255,.4)", textTransform: "capitalize" }}>{dateStr}</p>}
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, background: "linear-gradient(90deg, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {summary.type || "Entreno libre"}
          </h1>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {stats.map(({ label, value }) => (
            <div key={label} style={{ background: "rgba(255,255,255,.05)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Volume vs avg */}
        {summary.overallPct !== null && summary.overallPct !== undefined && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ background: "rgba(255,255,255,.06)", border: `1px solid ${pctColor}44`, borderRadius: 99, padding: "5px 16px", fontSize: 13, fontWeight: 700, color: pctColor }}>
              {pctSign}{summary.overallPct}% vs tu promedio
            </span>
          </div>
        )}

        {/* RPE bar */}
        {summary.rpe > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Esfuerzo percibido (RPE)</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>{summary.rpe}/10</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(summary.rpe / 10) * 100}%`, borderRadius: 3, background: "linear-gradient(90deg, #4ade80, #f59e0b, #ef4444)" }} />
            </div>
          </div>
        )}

        {/* Mood */}
        {summary.mood && (
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>
              {summary.mood === "tired" ? "😴" : summary.mood === "good" ? "😊" : "💪"}
            </span>
            <span style={{ marginLeft: 8, fontSize: 13, color: "rgba(255,255,255,.5)" }}>
              {summary.mood === "tired" ? "Estaba cansado" : summary.mood === "good" ? "Se sintió bien" : "¡Sesión excelente!"}
            </span>
          </div>
        )}

        {/* CTA */}
        <a href="https://loop-gym.vercel.app" style={{ display: "block", marginTop: 20, padding: "14px", borderRadius: 14, background: "rgba(168,85,247,.2)", border: "1px solid rgba(168,85,247,.4)", color: "#a78bfa", fontWeight: 800, fontSize: 14, textAlign: "center", textDecoration: "none", letterSpacing: "0.3px" }}>
          Empezar a entrenar con Loop →
        </a>
      </div>

      <p style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,.2)" }}>loop-gym.vercel.app</p>
    </div>
  );
}
