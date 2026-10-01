import { useState } from "react";
import { reportSharedFood } from "../lib/sharedFoods.js";

// Botón para reportar un alimento "Creado por usuarios" (id con prefijo "shared-").
export default function ReportFoodButton({ foodId }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!String(foodId || "").startsWith("shared-")) return null;
  if (done) return <small style={{ color: "var(--muted)" }}>Gracias, lo vamos a revisar.</small>;

  async function send(e) {
    e.preventDefault();
    setBusy(true);
    const ok = await reportSharedFood(foodId, reason);
    setBusy(false);
    if (ok) { setDone(true); window.__showToast?.("Reporte enviado.", "success"); }
    else window.__showToast?.("No se pudo enviar el reporte.", "error");
  }

  if (!open) {
    return (
      <button type="button" className="ghost" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setOpen(true)}>
        Reportar
      </button>
    );
  }
  return (
    <form onSubmit={send} style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      <input
        type="text" value={reason} onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo (datos incorrectos, ofensivo…)" maxLength={300} minLength={3} required
        aria-label="Motivo del reporte" style={{ flex: 1, minWidth: 160 }}
      />
      <button type="submit" className="primary" style={{ fontSize: 12, padding: "6px 12px" }} disabled={busy}>
        {busy ? "Enviando…" : "Enviar"}
      </button>
      <button type="button" className="ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setOpen(false)}>
        Cancelar
      </button>
    </form>
  );
}
