// Canvas-based workout share image. Returns a Promise that resolves when done.
export async function shareWorkout(workout) {
  const W = 390, H = 720;
  const canvas = document.createElement("canvas");
  canvas.width = W * 2; canvas.height = H * 2; // retina
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = "#080510";
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines
  ctx.strokeStyle = "rgba(168,85,247,.06)";
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // ── Header gradient band ─────────────────────────────────────────────────────
  const hdr = ctx.createLinearGradient(0, 0, W, 100);
  hdr.addColorStop(0, "#a855f7"); hdr.addColorStop(1, "#6d28d9");
  ctx.fillStyle = hdr;
  roundRect(ctx, 0, 0, W, 100, { tl: 0, tr: 0, br: 0, bl: 0 });
  ctx.fill();

  // ── Logo / brand ─────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,.6)";
  ctx.font = "600 11px -apple-system, system-ui, sans-serif";
  ctx.fillText("PULSE · ENTRENAMIENTO", 20, 22);

  // ── Workout title ─────────────────────────────────────────────────────────────
  ctx.fillStyle = "#fff";
  ctx.font = "800 26px -apple-system, system-ui, sans-serif";
  ctx.fillText(truncate(workout.type || "Entrenamiento", 28), 20, 56);

  // ── Date ─────────────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.font = "500 13px -apple-system, system-ui, sans-serif";
  ctx.fillText(formatDateEs(workout.date), 20, 80);

  // ── Stats row ────────────────────────────────────────────────────────────────
  const sets = workout.sets || [];
  const exercises = [...new Set(sets.map(s => s.exercise))];
  const totalVol = sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
  const totalSets = sets.length;

  const stats = [
    { label: "EJERCICIOS", value: exercises.length },
    { label: "SERIES", value: totalSets },
    { label: "VOLUMEN", value: totalVol >= 1000 ? (totalVol / 1000).toFixed(1) + "t" : totalVol + "kg" },
  ];
  const boxW = (W - 40) / 3;
  stats.forEach(({ label, value }, i) => {
    const x = 20 + i * boxW;
    ctx.fillStyle = "rgba(168,85,247,.15)";
    roundRect(ctx, x, 116, boxW - 8, 58, 12); ctx.fill();
    ctx.strokeStyle = "rgba(168,85,247,.3)";
    ctx.lineWidth = 1;
    roundRect(ctx, x, 116, boxW - 8, 58, 12); ctx.stroke();

    ctx.fillStyle = "#a855f7";
    ctx.font = "800 20px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(value), x + (boxW - 8) / 2, 147);

    ctx.fillStyle = "rgba(255,255,255,.45)";
    ctx.font = "600 9px -apple-system, system-ui, sans-serif";
    ctx.fillText(label, x + (boxW - 8) / 2, 163);
    ctx.textAlign = "left";
  });

  // ── Exercise list ─────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.font = "700 10px -apple-system, system-ui, sans-serif";
  ctx.fillText("EJERCICIOS", 20, 202);

  const maxShow = 7;
  const shown = exercises.slice(0, maxShow);
  shown.forEach((ex, i) => {
    const y = 220 + i * 46;
    const exSets = sets.filter(s => s.exercise === ex);
    const bestWeight = Math.max(...exSets.map(s => Number(s.weight) || 0));
    const totalReps = exSets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0);
    const vol = exSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);

    // row bg
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,.03)" : "transparent";
    roundRect(ctx, 14, y - 14, W - 28, 40, 8); ctx.fill();

    // number badge
    ctx.fillStyle = "rgba(168,85,247,.2)";
    roundRect(ctx, 20, y - 8, 22, 22, 6); ctx.fill();
    ctx.fillStyle = "#a855f7";
    ctx.font = "700 11px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(i + 1, 31, y + 7);
    ctx.textAlign = "left";

    // name
    ctx.fillStyle = "#fff";
    ctx.font = "600 13px -apple-system, system-ui, sans-serif";
    ctx.fillText(truncate(ex, 26), 50, y + 5);

    // stats
    ctx.fillStyle = "rgba(255,255,255,.4)";
    ctx.font = "500 11px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "right";
    const parts = [];
    if (bestWeight) parts.push(`${bestWeight}kg`);
    if (totalReps) parts.push(`${totalReps} reps`);
    if (vol) parts.push(`${vol}kg vol`);
    ctx.fillText(parts.join(" · "), W - 20, y + 5);
    ctx.textAlign = "left";
  });
  if (exercises.length > maxShow) {
    ctx.fillStyle = "rgba(255,255,255,.3)";
    ctx.font = "500 12px -apple-system, system-ui, sans-serif";
    ctx.fillText(`+${exercises.length - maxShow} más`, 20, 220 + maxShow * 46);
  }

  // ── PRs row ───────────────────────────────────────────────────────────────────
  const prSets = sets.filter(s => s._isPR);
  if (prSets.length) {
    const prY = H - 100;
    ctx.fillStyle = "rgba(168,85,247,.12)";
    roundRect(ctx, 14, prY, W - 28, 36, 10); ctx.fill();
    ctx.strokeStyle = "rgba(168,85,247,.4)";
    roundRect(ctx, 14, prY, W - 28, 36, 10); ctx.stroke();
    ctx.fillStyle = "#a855f7";
    ctx.font = "700 12px -apple-system, system-ui, sans-serif";
    ctx.fillText(`🔥 ${prSets.length} PR${prSets.length > 1 ? "s" : ""} nuevo${prSets.length > 1 ? "s" : ""}`, 28, prY + 23);
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,.2)";
  ctx.font = "500 11px -apple-system, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Entrenado con Loop App", W / 2, H - 16);
  ctx.textAlign = "left";

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "entrenamiento-pulse.png", { type: "image/png" });
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Loop — " + (workout.type || "Entrenamiento") });
          resolve("shared");
          return;
        }
      } catch { /* user cancelled share */ resolve("cancelled"); return; }
      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "entrenamiento-pulse.png"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve("downloaded");
    }, "image/png");
  });
}

function roundRect(ctx, x, y, w, h, r) {
  if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br); ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl); ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function formatDateEs(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}
