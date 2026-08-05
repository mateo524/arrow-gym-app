import { useState } from "react";

/**
 * ShareWorkoutCard — comparte un link público al resumen del entreno.
 *
 * summary shape:
 *   { type, date, thisVol, overallPct, totalSets, exercises, newPRs, rpe, mood, volumeChanges }
 */
export default function ShareWorkoutCard({ summary }) {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  function buildLink() {
    const payload = {
      type:       summary.type       ?? null,
      date:       summary.date       ?? null,
      thisVol:    summary.thisVol    ?? null,
      overallPct: summary.overallPct ?? null,
      totalSets:  summary.totalSets  ?? null,
      exercises:  summary.exercises  ?? null,
      newPRs:     summary.newPRs     ?? 0,
      rpe:        summary.rpe        ?? 0,
      mood:       summary.mood       ?? null,
    };
    const encoded = btoa(JSON.stringify(payload));
    return `${window.location.origin}/#/share/${encoded}`;
  }

  async function handleShare() {
    const url = buildLink();
    const text = [
      `💪 Completé un entreno en Loop Gym`,
      summary.type ? `🏋️ ${summary.type}` : null,
      summary.thisVol ? `📦 ${summary.thisVol}kg de volumen` : null,
      summary.totalSets ? `🔁 ${summary.totalSets} series` : null,
      summary.newPRs > 0 ? `⚡ ${summary.newPRs} récord${summary.newPRs > 1 ? "s" : ""} nuevo${summary.newPRs > 1 ? "s" : ""}` : null,
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "Mi entreno en Loop Gym", text, url });
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }
    // Fallback: copy link
    try { await navigator.clipboard.writeText(`${text}\n\n${url}`); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleShare}
      style={{
        width: "100%",
        marginTop: 10,
        padding: "12px 0",
        borderRadius: 14,
        border: "1.5px solid rgba(167,139,250,0.35)",
        background: "rgba(139,92,246,0.12)",
        color: "#a78bfa",
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        letterSpacing: "0.3px",
      }}
    >
      <span style={{ fontSize: 18 }}>{copied ? "✓" : "🔗"}</span>
      {copied ? "¡Link copiado!" : "Compartir entreno"}
    </button>
  );
}
