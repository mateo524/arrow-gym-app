import { useState } from "react";
import { supabase } from "../lib/supabase.js";

// Formulario "Ayuda / Contacto": crea un ticket que ve el panel admin.
export default function SupportForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("support_tickets").insert({ subject: subject.trim(), message: message.trim() });
    setBusy(false);
    if (error) { window.__showToast?.("No se pudo enviar. Intentá de nuevo.", "error"); return; }
    setSubject(""); setMessage("");
    window.__showToast?.("Mensaje enviado. Te vamos a responder por email.", "success");
  }

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <h2>Ayuda / Contacto</h2>
      <form onSubmit={send} style={{ display: "grid", gap: 10 }}>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Asunto" required minLength={3} maxLength={120} aria-label="Asunto" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Contanos qué pasó o qué necesitás" required minLength={5} maxLength={2000} rows={4} aria-label="Mensaje" />
        <button type="submit" className="primary" disabled={busy}>{busy ? "Enviando…" : "Enviar"}</button>
      </form>
    </div>
  );
}
