import { useMemo, useState } from "react";
import useStore from "../store/useStore.js";
import { getWorkoutVolume, hydrateSet, formatDate } from "../lib/analytics.js";
import Icon from "../components/Icon.jsx";

export default function WorkoutDetailPage() {
  const id = useStore((state) => state.selectedWorkoutId);
  const workouts = useStore((state) => state.workouts);
  const setPage = useStore((state) => state.setPage);
  const workout = workouts.find((item) => item.id === id) || workouts[0];
  const [sharing, setSharing] = useState(false);

  if (!workout) return <section className="page"><h1>Sin entrenamiento</h1></section>;

  async function shareWorkout() {
    setSharing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 500;
      const ctx = canvas.getContext("2d");
      // Fondo oscuro
      ctx.fillStyle = "#050709";
      ctx.fillRect(0, 0, 400, 500);
      // Logo / título
      ctx.fillStyle = "#a855f7";
      ctx.font = "bold 24px system-ui";
      ctx.fillText("Loop", 24, 48);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 20px system-ui";
      ctx.fillText(workout.type || "Entrenamiento", 24, 82);
      ctx.fillStyle = "#64748b";
      ctx.font = "14px system-ui";
      ctx.fillText(workout.date || "", 24, 106);
      // Stats
      const rawSets = (workout.sets || []).filter(s => Number(s.weight) > 0 && Number(s.reps) > 0);
      const vol = rawSets.reduce((sum, s) => sum + Number(s.weight) * Number(s.reps), 0);
      const maxW = rawSets.length ? Math.max(...rawSets.map(s => Number(s.weight))) : 0;
      ctx.fillStyle = "#a855f7";
      ctx.font = "bold 40px system-ui";
      ctx.fillText(`${vol >= 1000 ? (vol / 1000).toFixed(1) + "t" : vol + "kg"}`, 24, 170);
      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui";
      ctx.fillText("volumen total", 24, 190);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 28px system-ui";
      ctx.fillText(`${rawSets.length} series`, 24, 240);
      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui";
      ctx.fillText(`máx ${maxW}kg`, 24, 260);
      // Ejercicios
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 11px system-ui";
      ctx.fillText("EJERCICIOS", 24, 300);
      const exList = [...new Set(rawSets.map(s => s.exercise))].slice(0, 6);
      exList.forEach((ex, i) => {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "13px system-ui";
        ctx.fillText(`· ${ex}`, 24, 320 + i * 22);
      });
      // Footer
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 460, 400, 40);
      ctx.fillStyle = "#a855f7";
      ctx.font = "bold 12px system-ui";
      ctx.fillText("pulse-gym.vercel.app", 24, 483);
      // Share or download
      canvas.toBlob(async (blob) => {
        const file = new File([blob], "pulse-workout.png", { type: "image/png" });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Mi entrenamiento en Loop" });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "pulse-workout.png"; a.click();
          URL.revokeObjectURL(url);
        }
        setSharing(false);
      }, "image/png");
    } catch {
      setSharing(false);
    }
  }

  const volume = Math.round(getWorkoutVolume(workout));
  const sets = (workout.sets || []).map(hydrateSet);

  // Group sets by exercise
  const byExercise = useMemo(() => {
    const map = {};
    for (const s of sets) {
      if (!map[s.exercise]) map[s.exercise] = { exercise: s.exercise, group: s.group, sets: [] };
      map[s.exercise].sets.push(s);
    }
    return Object.values(map);
  }, [sets]);

  const bestSet = useMemo(() => {
    const filtered = sets.filter(s => Number(s.weight) > 0 && Number(s.reps) > 0);
    if (!filtered.length) return null;
    return filtered.reduce((best, s) => Number(s.weight) * Number(s.reps) > Number(best.weight) * Number(best.reps) ? s : best);
  }, [sets]);

  const totalReps = sets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0);

  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("history")} aria-label="Volver">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
        <div className="page-head-titles">
          <p className="eyebrow">{formatDate(workout.date)}</p>
          <h1>{workout.type}</h1>
        </div>
        <button onClick={shareWorkout} disabled={sharing} className="ghost" style={{ display:"flex", alignItems:"center", gap:6 }}>
          {sharing ? "Generando…" : "📤 Compartir"}
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
        {[
          { label:"Volumen", value:`${volume}kg` },
          { label:"Series", value:sets.length },
          { label:"Reps totales", value:totalReps },
        ].map(({ label, value }) => (
          <div key={label} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"12px 8px", textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:900, color:"var(--green)", lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:10, color:"var(--muted)", marginTop:3, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Best set highlight */}
      {bestSet && (
        <div style={{ background:"rgba(168,85,247,.07)", border:"1px solid rgba(168,85,247,.2)", borderRadius:14, padding:"12px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>🏆</span>
          <div>
            <p style={{ margin:"0 0 2px", fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Mejor serie</p>
            <p style={{ margin:0, fontSize:14, fontWeight:800 }}>{bestSet.exercise}</p>
            <p style={{ margin:0, fontSize:13, color:"var(--green)", fontWeight:700 }}>{bestSet.weight}kg × {bestSet.reps} reps</p>
          </div>
        </div>
      )}

      {/* Exercise breakdown */}
      <div>
        {byExercise.map(({ exercise, group, sets: exSets }) => {
          const exVol = exSets.reduce((s, set) => s + (Number(set.weight)||0)*(Number(set.reps)||0), 0);
          const best = exSets.filter(s => Number(s.weight)>0&&Number(s.reps)>0).reduce((b,s) => !b || Number(s.weight)>Number(b.weight) ? s : b, null);
          return (
            <div key={exercise} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:"12px 14px", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <p style={{ margin:"0 0 2px", fontSize:14, fontWeight:800 }}>{exercise}</p>
                  <p style={{ margin:0, fontSize:11, color:"var(--muted)" }}>{group || "General"} · {exSets.length} serie{exSets.length !== 1 ? "s" : ""}</p>
                </div>
                {exVol > 0 && (
                  <span style={{ fontSize:12, fontWeight:700, color:"var(--muted)" }}>{Math.round(exVol)}kg vol.</span>
                )}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {exSets.map((s, i) => (
                  <div key={s.id || i} style={{
                    background: (Number(s.weight)>0 && best && Number(s.weight)===Number(best.weight)) ? "rgba(168,85,247,.12)" : "var(--panel2,rgba(255,255,255,.04))",
                    border: `1px solid ${(Number(s.weight)>0 && best && Number(s.weight)===Number(best.weight)) ? "rgba(168,85,247,.3)" : "var(--line)"}`,
                    borderRadius:10, padding:"6px 10px", textAlign:"center", minWidth:56,
                  }}>
                    <div style={{ fontSize:14, fontWeight:800, color: Number(s.weight)>0 ? "var(--text)" : "var(--muted)" }}>
                      {Number(s.weight)>0 ? `${s.weight}kg` : "—"}
                    </div>
                    <div style={{ fontSize:10, color:"var(--muted)", marginTop:1 }}>{Number(s.reps)>0 ? `×${s.reps}` : "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

