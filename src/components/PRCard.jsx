import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import useAuthStore from "../store/useAuthStore.js";
import Icon from "./Icon.jsx";

// Renders an HTML5 Canvas card for a PR achievement ("El Grito")
// and optionally notifies the trainer.
export default function PRCard({ pr, totalWorkouts, onClose }) {
  const canvasRef = useRef(null);
  const { profile } = useAuthStore();
  const [shared, setShared] = useState(false);
  const [notified, setNotified] = useState(false);

  const exerciseName = pr?.exercise || "Ejercicio";
  const weight = pr?.weight ?? 0;
  const reps = pr?.reps ?? 0;
  const unit = pr?.unit || "kg";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = 540;
    const H = canvas.height = 300;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0f0f1a");
    bg.addColorStop(1, "#1a0a2e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Accent top bar
    ctx.fillStyle = "#a855f7";
    ctx.fillRect(0, 0, W, 4);

    // "EL GRITO" label
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 13px 'Inter', system-ui, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("⚡ EL GRITO — NUEVO RÉCORD", 24, 36);

    // Exercise name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px 'Inter', system-ui, sans-serif";
    ctx.letterSpacing = "0px";
    const name = exerciseName.length > 22 ? exerciseName.slice(0, 22) + "…" : exerciseName;
    ctx.fillText(name, 24, 86);

    // Weight — big number
    ctx.fillStyle = "#a855f7";
    ctx.font = "900 72px 'Inter', system-ui, sans-serif";
    ctx.fillText(`${weight}`, 24, 180);
    ctx.fillStyle = "#ccb4ff";
    ctx.font = "bold 28px 'Inter', system-ui, sans-serif";
    ctx.fillText(unit, 24 + ctx.measureText(`${weight}`).width + 8, 175);

    // Reps
    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px 'Inter', system-ui, sans-serif";
    ctx.fillText(`× ${reps} reps`, 26, 210);

    // Days trained context
    if (totalWorkouts > 0) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "13px 'Inter', system-ui, sans-serif";
      ctx.fillText(`Logrado después de ${totalWorkouts} entrenamientos`, 24, H - 28);
    }

    // Athlete name
    if (profile?.name) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(profile.name, W - 24, H - 28);
      ctx.textAlign = "left";
    }

    // Loop branding
    ctx.fillStyle = "#374151";
    ctx.font = "12px 'Inter', system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("loop · gym tracker", W - 24, H - 10);
    ctx.textAlign = "left";
  }, [pr, totalWorkouts, profile?.name, exerciseName, weight, reps, unit]);

  async function notifyTrainer() {
    if (!profile?.trainer_id || notified) return;
    // Insert a notification for the trainer
    await supabase.from("trainer_notifications").insert({
      trainer_id: profile.trainer_id,
      student_id: profile.id,
      type: "pr",
      payload: { exercise: exerciseName, weight, reps, unit, total_workouts: totalWorkouts },
    });
    setNotified(true);
  }

  async function shareCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "pr-record.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `¡Nuevo récord en ${exerciseName}!` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "pr-record.png"; a.click();
        URL.revokeObjectURL(url);
      }
      setShared(true);
    });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, flexDirection: "column", gap: 16,
    }}>
      {/* Trophy animation */}
      <div style={{ fontSize: 64, animation: "bounce 0.6s ease" }}>🏆</div>

      <canvas ref={canvasRef} style={{
        borderRadius: 16, maxWidth: "100%", width: "min(540px, 100%)",
        boxShadow: "0 0 40px rgba(168,85,247,.4)",
      }} />

      <p style={{ color: "#a855f7", fontWeight: 700, fontSize: 18, margin: 0 }}>
        ¡Nuevo récord personal!
      </p>
      <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
        {exerciseName} — {weight} {unit} × {reps} reps
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          className="btn-primary"
          onClick={shareCard}
          style={{ gap: 6 }}
        >
          <Icon name={shared ? "Check" : "Share2"} size={14} />
          {shared ? "¡Compartido!" : "Compartir récord"}
        </button>

        {profile?.trainer_id && (
          <button
            className="ghost"
            onClick={notifyTrainer}
            disabled={notified}
            style={{ gap: 6 }}
          >
            <Icon name={notified ? "Check" : "Bell"} size={14} />
            {notified ? "Entrenador notificado" : "Notificar a mi entrenador"}
          </button>
        )}

        <button className="ghost" onClick={onClose}>
          Cerrar
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
