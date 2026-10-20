import { useState, useEffect, useMemo } from "react";
import useStore from "../store/useStore.js";
import { todayLocal, formatDMY } from "../lib/dates.js";
import { vacationLength } from "../lib/streak.js";

const card = { background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, padding: "14px 16px", marginBottom: 14 };

/**
 * Modo vacaciones: pausa la racha y silencia los recordatorios (app y servidor).
 * Al volver ofrece retomar con pesos algo más bajos durante una semana.
 */
export default function VacationCard() {
  const periods = useStore((s) => s.vacationPeriods) || [];
  const welcome = useStore((s) => s.vacationWelcomeBack);
  const startVacation = useStore((s) => s.startVacation);
  const endVacation = useStore((s) => s.endVacation);
  const setVacationUntil = useStore((s) => s.setVacationUntil);
  const autoEnd = useStore((s) => s.autoEndExpiredVacation);
  const dismissWelcome = useStore((s) => s.dismissVacationWelcome);
  const acceptPlan = useStore((s) => s.acceptPlanRecommendation);
  const [open, setOpen] = useState(false);
  const [until, setUntil] = useState("");

  const active = periods.find((p) => !p.end) || null;
  const today = todayLocal();

  // Si la fecha de regreso ya pasó, se termina sola al abrir la app
  useEffect(() => { autoEnd?.(); }, [autoEnd]);

  const days = useMemo(() => (active ? vacationLength(active, today) : 0), [active, today]);

  if (welcome) {
    const away = vacationLength(welcome, welcome.end);
    return (
      <div style={{ ...card, border: "1px solid rgba(56,189,248,.35)", background: "rgba(56,189,248,.07)" }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Bienvenido de vuelta</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
          Estuviste {away} {away === 1 ? "día" : "días"} de vacaciones. Tu racha quedó intacta.
          {away >= 5 && " Para volver sin lesionarte podés arrancar con 10% menos de peso durante una semana."}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {away >= 5 && (
            <button className="primary" style={{ fontSize: 13, padding: "8px 14px" }}
              onClick={() => { acceptPlan("vacation_return", 0.9); dismissWelcome(); }}>
              Retomar suave
            </button>
          )}
          <button className="ghost" style={{ fontSize: 13, padding: "8px 14px" }} onClick={dismissWelcome}>
            {away >= 5 ? "Con mis pesos de siempre" : "Entendido"}
          </button>
        </div>
      </div>
    );
  }

  if (active) {
    return (
      <div style={{ ...card, border: "1px solid rgba(56,189,248,.35)", background: "linear-gradient(135deg, rgba(56,189,248,.10), transparent 70%)" }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Modo vacaciones activo</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
          Día {days}{active.until ? ` · volvés el ${formatDMY(active.until)}` : ""}. Tu racha está en pausa y no te mandamos recordatorios.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
            Regreso
            <input type="date" min={today} value={active.until || ""} onChange={(e) => setVacationUntil(e.target.value || null)}
              style={{ fontSize: 13, padding: "6px 8px", minWidth: 0 }} />
          </label>
          <button className="ghost" style={{ fontSize: 13, padding: "8px 14px" }} onClick={endVacation}>Terminar vacaciones</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      {!open ? (
        <button className="ghost" onClick={() => setOpen(true)} style={{ fontSize: 12, padding: "8px 12px", width: "100%" }}>
          Me voy de vacaciones · pausar racha
        </button>
      ) : (
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Modo vacaciones</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
            Tu racha no se corta si no entrenás, y pausamos los recordatorios. Si querés, elegí cuándo volvés y se desactiva solo.
          </div>
          <label style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            Fecha de regreso (opcional)
            <input type="date" min={today} value={until} onChange={(e) => setUntil(e.target.value)} style={{ fontSize: 13, padding: "6px 8px", minWidth: 0 }} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary" style={{ fontSize: 13, padding: "8px 14px" }}
              onClick={() => { startVacation(until || null); setOpen(false); setUntil(""); }}>
              Activar
            </button>
            <button className="ghost" style={{ fontSize: 13, padding: "8px 14px" }} onClick={() => setOpen(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
