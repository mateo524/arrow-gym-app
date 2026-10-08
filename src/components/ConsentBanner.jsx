import { useState, useEffect } from "react";
import { getConsent, setConsent, onConsentChange } from "../lib/telemetry.js";

export default function ConsentBanner() {
  const [choice, setChoice] = useState(getConsent);
  useEffect(() => onConsentChange(() => setChoice(getConsent())), []);
  if (choice) return null;
  if (/^#\/?legal(\/|$)/.test(window.location.hash)) return null;

  return (
    <div role="dialog" aria-label="Consentimiento de analítica"
      style={{ position: "fixed", left: 12, right: 12, bottom: "calc(env(safe-area-inset-bottom, 0px) + 76px)", zIndex: 250, maxWidth: 520, margin: "0 auto", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", boxShadow: "0 8px 32px rgba(0,0,0,.4)" }}>
      <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.5, color: "var(--text)" }}>
        ¿Nos ayudás a mejorar Loop? Con tu permiso usamos analítica de uso (PostHog) para ver qué funciones se usan. No enviamos tus pesos, medidas ni fotos.{" "}
        <a href="#/legal/privacidad" target="_blank" rel="noopener noreferrer" style={{ color: "var(--green)" }}>Más info</a>
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="ghost" style={{ flex: 1, padding: "9px 12px", fontSize: 13 }} onClick={() => setConsent(false)}>
          Rechazar
        </button>
        <button type="button" className="primary" style={{ flex: 1, padding: "9px 12px", fontSize: 13 }} onClick={() => setConsent(true)}>
          Aceptar
        </button>
      </div>
    </div>
  );
}
