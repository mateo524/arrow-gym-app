import { memo, useState, useCallback, useEffect } from "react";

function progressionTip(lastWeight, lastReps, currentWeight, currentReps) {
  const lw = Number(lastWeight) || 0;
  const lr = Number(lastReps) || 0;
  const cw = Number(currentWeight) || 0;
  if (lw > 0 && lr >= 12) return { text: "⚡ Probá +2.5kg", type: "positive" };
  if (lw > 0 && lr >= 9) return { text: "🎯 Llegá a 12 reps antes de subir", type: "warn" };
  if (lw > 0 && lr < 9) return { text: "🏗️ Bajá peso, enfocate en técnica", type: "warn" };
  if (cw > 0 && currentReps >= 12) return { text: "✅ Listo para aumentar peso", type: "positive" };
  return null;
}

const OPTIONS = { RPE: [6,6.5,7,7.5,8,8.5,9,9.5,10], RIR: ["0","1","2","3","4"] };

function WorkoutSetCard({ setItem, index, onUpdate, onRepeat, onRemove, onStartTimer }) {
  const isCardio = setItem.group === "Cardio";
  const currentWeight = Number(setItem.weight || 0);
  const currentReps = Number(setItem.reps || 0);
  const tip = progressionTip(setItem.lastWeight, setItem.lastReps, currentWeight, currentReps);

  const [localWeight, setLocalWeight] = useState(setItem.weight);
  const [localReps, setLocalReps] = useState(setItem.reps);
  const [localRpe, setLocalRpe] = useState(setItem.rpe || "");
  const [localRir, setLocalRir] = useState(setItem.rir || "");

  useEffect(() => { setLocalWeight(setItem.weight); }, [setItem.weight]);
  useEffect(() => { setLocalReps(setItem.reps); }, [setItem.reps]);
  useEffect(() => { setLocalRpe(setItem.rpe || ""); }, [setItem.rpe]);
  useEffect(() => { setLocalRir(setItem.rir || ""); }, [setItem.rir]);

  const commit = useCallback((patch) => {
    onUpdate(patch);
  }, [onUpdate]);

  if (isCardio) {
    return (
      <div className="set-card compact-set-card compact-v2">
        <div className="set-head">
          <b>#{index}</b>
          <div className="set-chips">
            <span className="chip">{localReps || "—"} min</span>
            <button className="chip danger-chip" onClick={onRemove}>×</button>
          </div>
        </div>
        <div className="quick-grid compact-grid">
          <label>
            <input type="text" inputMode="decimal" value={localReps} placeholder="min" onChange={(e) => setLocalReps(e.target.value.replace(",", "."))} onBlur={() => commit({ reps: localReps })} />
          </label>
          <label>
            <select value={localWeight || ""} onChange={(e) => { const v = e.target.value; setLocalWeight(v); commit({ weight: v }); }}>
              <option value="">Intensidad</option>
              {[1,2,3,4,5].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        </div>
        {tip && <div className={`progression-tip ${tip.type}`} role="status">{tip.text}</div>}
        <div className="quick-actions">
          <button onClick={() => { const v = String(currentReps + 5); setLocalReps(v); commit({ reps: v }); }} onPointerDown={(e) => e.preventDefault()}>+5</button>
          <button onClick={() => { const v = String(Math.max(0, currentReps - 5)); setLocalReps(v); commit({ reps: v }); }} onPointerDown={(e) => e.preventDefault()}>-5</button>
          <button onClick={onRepeat} onPointerDown={(e) => e.preventDefault()}>Duplicar</button>
          <button className="action-timer" onClick={onStartTimer} onPointerDown={(e) => e.preventDefault()}>⏱</button>
        </div>
      </div>
    );
  }

  return (
    <div className="set-card compact-set-card compact-v2">
      <div className="set-head">
        <b>#{index}</b>
        <div className="set-chips">
          <span className="chip">{localWeight || "—"} kg</span>
          <span className="chip">{localReps || "—"} reps</span>
          {localRpe && <span className="chip rpe-chip">RPE {localRpe}</span>}
          {localRir && <span className="chip">RIR {localRir}</span>}
          <button className="chip danger-chip" onClick={onRemove}>×</button>
        </div>
      </div>
      <div className="quick-grid compact-grid">
        <label>
          <input type="text" inputMode="decimal" value={localWeight} placeholder="kg" onChange={(e) => setLocalWeight(e.target.value.replace(",", "."))} onBlur={() => commit({ weight: localWeight })} />
        </label>
        <label>
          <input type="text" inputMode="numeric" value={localReps} placeholder="reps" onChange={(e) => setLocalReps(e.target.value.replace(",", "."))} onBlur={() => commit({ reps: localReps })} />
        </label>
        <label>
          <select value={localRpe} onChange={(e) => { const v = e.target.value; setLocalRpe(v); commit({ rpe: v }); }}>
            <option value="">RPE</option>
            {OPTIONS.RPE.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>
          <select value={localRir} onChange={(e) => { const v = e.target.value; setLocalRir(v); commit({ rir: v }); }}>
            <option value="">RIR</option>
            {OPTIONS.RIR.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </div>
      {tip && <div className={`progression-tip ${tip.type}`} role="status">{tip.text}</div>}
      <div className="quick-actions">
        <button onClick={() => { const v = String(currentWeight + 2.5); setLocalWeight(v); commit({ weight: v }); }} onPointerDown={(e) => e.preventDefault()}>+2.5</button>
        <button onClick={() => { const v = String(Math.max(0, currentWeight - 2.5)); setLocalWeight(v); commit({ weight: v }); }} onPointerDown={(e) => e.preventDefault()}>-2.5</button>
        <button onClick={() => { const v = String(currentReps + 1); setLocalReps(v); commit({ reps: v }); }} onPointerDown={(e) => e.preventDefault()}>+1 rep</button>
        <button onClick={onRepeat} onPointerDown={(e) => e.preventDefault()}>Duplicar</button>
      </div>
      <button className="action-timer full" onClick={onStartTimer}>⏱ Descanso</button>
    </div>
  );
}

export default memo(WorkoutSetCard);
