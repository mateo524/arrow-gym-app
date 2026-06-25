import { useState } from "react";
import useStore from "../store/useStore.js";
import { todayLocal } from "../lib/dates.js";
import Icon from "../components/Icon.jsx";

const PRESET_CHALLENGES = [
  { exercise: "Plancha", label: "Plancha 30 días", desc: "Hacé plancha todos los días, empezando en 20 segundos y sumando 5 segundos cada día." },
  { exercise: "Sentadilla", label: "100 sentadillas", desc: "Completá 100 sentadillas en una sesión antes de que pasen 30 días." },
  { exercise: "Flexiones", label: "Flexiones diarias", desc: "Hacé flexiones todos los días. Empezá con 10 y aumentá de a 5 cada semana." },
  { exercise: "Caminata", label: "30 días caminando", desc: "Caminá al menos 20 minutos cada día durante 30 días." },
];

export default function ChallengesPage() {
  const setPage = useStore(s => s.setPage);
  const activeChallenges = useStore(s => s.activeChallenges) || [];
  const start30DayChallenge = useStore(s => s.start30DayChallenge);
  const markChallengeDay = useStore(s => s.markChallengeDay);
  const deleteChallenge = useStore(s => s.deleteChallenge);
  const today = todayLocal();

  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("profile")} aria-label="Volver">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
        <div className="page-head-titles">
          <p className="eyebrow">Hábitos</p>
          <h1>Retos de 30 días</h1>
        </div>
      </div>

      {activeChallenges.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <p className="section-label">Retos activos</p>
          {activeChallenges.map(ch => {
            const done = ch.completedDays.length;
            const doneToday = ch.completedDays.includes(today);
            const pct = Math.min(100, (done / ch.targetDays) * 100);
            return (
              <div key={ch.id} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800 }}>{ch.exercise}</div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>Día {done}/{ch.targetDays} · Empezó {ch.startDate}</div>
                  </div>
                  <button onClick={() => deleteChallenge(ch.id)} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:16 }}>✕</button>
                </div>
                <div style={{ height:8, background:"var(--panel2)", borderRadius:4, overflow:"hidden", marginBottom:10 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background: pct>=100 ? "var(--green)" : "#60a5fa", borderRadius:4, transition:"width .4s" }} />
                </div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
                  {Array.from({length: ch.targetDays}, (_,i) => {
                    const d = new Date(ch.startDate); d.setDate(d.getDate()+i);
                    const dateStr = d.toISOString().slice(0,10);
                    const isDone = ch.completedDays.includes(dateStr);
                    return <div key={i} style={{ width:10, height:10, borderRadius:2, background: isDone ? "var(--green)" : "var(--panel2)", border:"1px solid var(--line)" }} />;
                  })}
                </div>
                {!doneToday && done < ch.targetDays && (
                  <button className="primary" style={{ width:"100%" }} onClick={() => markChallengeDay(ch.id)}>
                    ✓ Marcar hoy como completado
                  </button>
                )}
                {doneToday && <div style={{ textAlign:"center", color:"var(--green)", fontWeight:700, fontSize:13 }}>✓ Completado hoy</div>}
                {done >= ch.targetDays && <div style={{ textAlign:"center", color:"var(--green)", fontWeight:900, fontSize:15 }}>🎉 ¡Reto completado!</div>}
              </div>
            );
          })}
        </div>
      )}

      <p className="section-label">Retos disponibles</p>
      {PRESET_CHALLENGES.map(preset => {
        const alreadyActive = activeChallenges.some(c => c.exercise === preset.exercise);
        return (
          <div key={preset.exercise} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px", marginBottom:10 }}>
            <div style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>{preset.label}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginBottom:12, lineHeight:1.5 }}>{preset.desc}</div>
            <button
              className={alreadyActive ? "ghost" : "primary"}
              style={{ width:"100%" }}
              disabled={alreadyActive}
              onClick={() => start30DayChallenge(preset.exercise)}>
              {alreadyActive ? "Ya activo" : "Iniciar reto"}
            </button>
          </div>
        );
      })}
    </section>
  );
}
