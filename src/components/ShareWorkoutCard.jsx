import { useRef } from "react";

/**
 * ShareWorkoutCard
 * Generates a 1080×1080 canvas card and shares/downloads it.
 *
 * summary shape:
 *   { type, date, thisVol, overallPct, totalSets, exercises, newPRs, rpe, volumeChanges }
 */
export default function ShareWorkoutCard({ summary }) {
  const canvasRef = useRef(null);

  if (!summary) return null;

  function drawCard() {
    const SIZE = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");

    // ── Background gradient ──────────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, SIZE * 0.6, SIZE);
    bg.addColorStop(0, "#0f0f1a");
    bg.addColorStop(1, "#1a0f2e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // ── Decorative blobs ─────────────────────────────────────────────────────
    const glow = (x, y, r, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, SIZE, SIZE);
    };
    glow(200, 200, 400, "rgba(139, 92, 246, 0.18)");  // purple top-left
    glow(900, 800, 350, "rgba(59, 130, 246, 0.14)");   // blue bottom-right

    // ── Helper: rounded rect ─────────────────────────────────────────────────
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }

    // ── Logo ─────────────────────────────────────────────────────────────────
    ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
    ctx.fillStyle = "#a78bfa";
    ctx.letterSpacing = "4px";
    ctx.fillText("LOOP", 64, 110);

    // dot accent after logo
    ctx.beginPath();
    ctx.arc(64 + ctx.measureText("LOOP").width + 14, 96, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#7c3aed";
    ctx.fill();

    // ── Date ─────────────────────────────────────────────────────────────────
    const dateStr = summary.date
      ? new Date(summary.date + "T12:00:00").toLocaleDateString("es-AR", {
          day: "numeric", month: "long", year: "numeric",
        })
      : new Date().toLocaleDateString("es-AR", {
          day: "numeric", month: "long", year: "numeric",
        });
    ctx.font = "500 30px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText(dateStr, 64, 160);

    // ── Workout type ─────────────────────────────────────────────────────────
    const typeLabel = summary.type
      ? String(summary.type).toUpperCase()
      : "ENTRENO";
    ctx.font = "bold 148px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillText(typeLabel, 54, 330);   // ghost large

    ctx.font = "bold 96px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
    const typeGrad = ctx.createLinearGradient(60, 250, 60 + 500, 350);
    typeGrad.addColorStop(0, "#ffffff");
    typeGrad.addColorStop(1, "#a78bfa");
    ctx.fillStyle = typeGrad;
    ctx.fillText(typeLabel, 60, 340);

    // ── Divider ──────────────────────────────────────────────────────────────
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 380);
    ctx.lineTo(SIZE - 60, 380);
    ctx.stroke();

    // ── Stats row ────────────────────────────────────────────────────────────
    const stats = [
      { label: "VOLUMEN", value: `${summary.thisVol ?? "–"}kg` },
      { label: "SERIES",  value: summary.totalSets ?? "–" },
      { label: "EJERC.",  value: summary.exercises ?? "–" },
    ];
    const colW = (SIZE - 120) / stats.length;
    const rowY = 410;

    stats.forEach((s, i) => {
      const cx = 60 + i * colW + colW / 2;

      // card bg
      roundRect(60 + i * colW + 8, rowY, colW - 16, 160, 22);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fill();

      // value
      ctx.font = "bold 58px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(String(s.value), cx, rowY + 90);

      // label
      ctx.font = "500 26px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(s.label, cx, rowY + 130);
    });
    ctx.textAlign = "left";

    // ── Volume delta chip ────────────────────────────────────────────────────
    if (summary.overallPct !== null && summary.overallPct !== undefined) {
      const pct = summary.overallPct;
      const sign = pct >= 0 ? "+" : "";
      const chipText = `${sign}${pct}% vs promedio`;
      ctx.font = "600 30px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
      const tw = ctx.measureText(chipText).width;
      const chipX = SIZE / 2 - (tw + 48) / 2;
      const chipY = 590;
      roundRect(chipX, chipY, tw + 48, 50, 25);
      ctx.fillStyle = pct >= 0 ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)";
      ctx.fill();
      roundRect(chipX, chipY, tw + 48, 50, 25);
      ctx.strokeStyle = pct >= 0 ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = pct >= 0 ? "#4ade80" : "#f87171";
      ctx.textAlign = "center";
      ctx.fillText(chipText, SIZE / 2, chipY + 34);
      ctx.textAlign = "left";
    }

    // ── PRs highlight ─────────────────────────────────────────────────────────
    let prBandY = 668;
    if (summary.newPRs && summary.newPRs > 0) {
      const prText = `⚡ ${summary.newPRs} récord${summary.newPRs > 1 ? "s" : ""} nuevo${summary.newPRs > 1 ? "s" : ""}`;
      ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
      const ptw = ctx.measureText(prText).width;
      const px = SIZE / 2 - (ptw + 56) / 2;
      roundRect(px, prBandY, ptw + 56, 62, 31);
      const prGrad = ctx.createLinearGradient(px, prBandY, px + ptw + 56, prBandY);
      prGrad.addColorStop(0, "rgba(245,158,11,0.25)");
      prGrad.addColorStop(1, "rgba(234,179,8,0.15)");
      ctx.fillStyle = prGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(245,158,11,0.6)";
      ctx.lineWidth = 1.5;
      roundRect(px, prBandY, ptw + 56, 62, 31);
      ctx.stroke();
      ctx.fillStyle = "#fbbf24";
      ctx.textAlign = "center";
      ctx.fillText(prText, SIZE / 2, prBandY + 42);
      ctx.textAlign = "left";
      prBandY += 90;
    }

    // ── RPE bar ──────────────────────────────────────────────────────────────
    if (summary.rpe != null && summary.rpe > 0) {
      const rpe = Number(summary.rpe);
      ctx.font = "500 28px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.textAlign = "center";
      ctx.fillText(`RPE ${rpe}/10`, SIZE / 2, prBandY + 10);
      ctx.textAlign = "left";

      const barW = SIZE - 120;
      const barH = 10;
      const barX = 60;
      const barY = prBandY + 24;

      // track
      roundRect(barX, barY, barW, barH, 5);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fill();

      // fill
      const fillW = (rpe / 10) * barW;
      const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      barGrad.addColorStop(0, "#4ade80");
      barGrad.addColorStop(0.6, "#f59e0b");
      barGrad.addColorStop(1, "#ef4444");
      roundRect(barX, barY, fillW, barH, 5);
      ctx.fillStyle = barGrad;
      ctx.fill();
    }

    // ── Bottom tagline ────────────────────────────────────────────────────────
    ctx.font = "500 28px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.textAlign = "center";
    ctx.fillText("loopgym.app", SIZE / 2, SIZE - 56);
    ctx.textAlign = "left";

    return canvas;
  }

  async function handleShare() {
    const canvas = drawCard();
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "loop-entreno.png", { type: "image/png" });

      const canShare =
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] });

      if (canShare) {
        try {
          await navigator.share({
            files: [file],
            title: "Mi entreno en Loop",
            text: "Completé mi entreno. ¡Loop Gym!",
          });
          return;
        } catch (e) {
          if (e.name === "AbortError") return; // user cancelled
          // fall through to download
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "loop-entreno.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, "image/png");
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
      <span style={{ fontSize: 18 }}>📸</span>
      Compartir entreno
    </button>
  );
}
