import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { getAchievements, ACHIEVEMENTS_DEF, getStreak } from "../lib/analytics.js";

const TIER_COLORS = {
  1: { bg: "rgba(205,127,50,.15)", border: "rgba(205,127,50,.5)", text: "#cd7f32", label: "Bronce" },
  2: { bg: "rgba(192,192,192,.15)", border: "rgba(192,192,192,.5)", text: "#b0b0b0", label: "Plata" },
  3: { bg: "rgba(255,215,0,.15)",   border: "rgba(255,215,0,.5)",  text: "#ffd700", label: "Oro" },
};

const CATS = ["Todos","Consistencia","Fuerza","Volumen","Variedad","Tiempo","Progresión","Nutrición","Especial"];

export default function BadgesPage() {
  const workouts   = useStore(s => s.workouts || []);
  const prs        = useStore(s => s.prs || []);
  const mealLog    = useStore(s => s.mealLog || []);
  const weightLog  = useStore(s => s.weightLog || []);
  const restDays   = useStore(s => s.restDays || []);
  const setPage    = useStore(s => s.setPage);
  const [cat, setCat] = useState("Todos");

  const earned = useMemo(() => getAchievements(workouts, prs, mealLog, weightLog, restDays), [workouts, prs, mealLog, weightLog, restDays]);
  const streak = useMemo(() => getStreak(workouts, restDays), [workouts, restDays]);

  const earnedMap = useMemo(() => {
    const m = {};
    earned.forEach(e => { m[e.id] = e; });
    return m;
  }, [earned]);

  const filtered = ACHIEVEMENTS_DEF.filter(d => cat === "Todos" || d.cat === cat);

  const totalPossible = ACHIEVEMENTS_DEF.length * 3;
  const totalEarned   = earned.reduce((s, e) => s + (e.level || 0), 0);
  const pct = Math.round((totalEarned / totalPossible) * 100);

  return (
    <div style={{ paddingBottom: 100, background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "56px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setPage("home")} style={{ background: "var(--panel)", border: "none", borderRadius: 12, width: 40, height: 40, cursor: "pointer", color: "var(--text)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Logros</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>{earned.length} desbloqueados · {totalEarned}/{totalPossible} niveles</p>
        </div>
      </div>

      {/* Global progress */}
      <div style={{ margin: "0 20px 20px", background: "var(--panel)", borderRadius: 16, padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Progreso total</span>
          <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 800 }}>{pct}%</span>
        </div>
        <div style={{ background: "var(--panel2)", borderRadius: 8, height: 8, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg, #a855f7, #ffd700)", borderRadius: 8, transition: "width .5s" }} />
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          {[1,2,3].map(lvl => {
            const count = earned.filter(e => e.level >= lvl).length;
            const c = TIER_COLORS[lvl];
            return (
              <div key={lvl} style={{ flex: 1, textAlign: "center", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: "10px 0" }}>
                <div style={{ fontSize: 22 }}>{lvl===1?"🥉":lvl===2?"🥈":"🥇"}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>{count}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{c.label}</div>
              </div>
            );
          })}
          <div style={{ flex: 1, textAlign: "center", background: "var(--panel2)", borderRadius: 12, padding: "10px 0" }}>
            <div style={{ fontSize: 22 }}>🔥</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{streak}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Racha</div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px 16px", overflowX: "auto" }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            flexShrink: 0, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
            background: cat===c ? "var(--green)" : "var(--panel)",
            color: cat===c ? "#000" : "var(--muted)",
            border: cat===c ? "none" : "1px solid var(--border)"
          }}>{c}</button>
        ))}
      </div>

      {/* Achievement list */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(def => {
          const e = earnedMap[def.id];
          const currentLevel = e?.level || 0;
          const nextTier = def.tiers[currentLevel]; // undefined if maxed
          const isMaxed = currentLevel === 3;
          const c = currentLevel > 0 ? TIER_COLORS[currentLevel] : null;

          return (
            <div key={def.id} style={{
              background: currentLevel > 0 ? c.bg : "var(--panel)",
              border: `1.5px solid ${currentLevel > 0 ? c.border : "var(--border)"}`,
              borderRadius: 16, padding: "14px 16px",
              opacity: currentLevel === 0 ? 0.55 : 1,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0, filter: currentLevel === 0 ? "grayscale(1)" : "none" }}>{def.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{def.title}</span>
                    {currentLevel > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: c.text, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: "2px 8px" }}>
                        {isMaxed ? "🥇 ORO" : c.label}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>{def.cat}</span>
                  </div>

                  {/* Tier progress dots */}
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {def.tiers.map((t, i) => {
                      const tc = TIER_COLORS[t.lvl];
                      const done = currentLevel >= t.lvl;
                      return (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: done ? tc.text : "var(--panel2)",
                          transition: "background .3s"
                        }} />
                      );
                    })}
                  </div>

                  {/* Current desc or next goal */}
                  {currentLevel > 0 && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                      ✓ {def.tiers[currentLevel - 1].desc}
                    </div>
                  )}
                  {!isMaxed && (
                    <div style={{ fontSize: 12, color: "var(--text)", opacity: 0.7 }}>
                      {currentLevel === 0 ? "🔒" : "→"} Siguiente: {nextTier?.desc}
                    </div>
                  )}
                  {isMaxed && (
                    <div style={{ fontSize: 12, color: "#ffd700" }}>✨ Nivel máximo alcanzado</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

