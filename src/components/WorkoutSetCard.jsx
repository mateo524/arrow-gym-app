import { memo } from "react";

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

function WorkoutSetCard({ setItem, index, onUpdate, onRepeat, onRemove, onStartTimer }) {
  const isCardio = setItem.group === "Cardio";
  const currentWeight = Number(setItem.weight || 0);
  const currentReps = Number(setItem.reps || 0);
  const tip = progressionTip(setItem.lastWeight, setItem.lastReps, currentWeight, currentReps);

  if (isCardio) {
    return (
      <div className="set-card compact-set-card compact-v2">
        <div className="set-head">
          <b>#{index}</b>
          <div className="set-chips">
            <span className="chip">{setItem.reps || "—"} min</span>
            <button className="chip danger-chip" onClick={onRemove}>×</button>
          </div>
        </div>
        <div className="quick-grid compact-grid">
          <label>
            <input type="text" inputMode="decimal" value={setItem.reps} placeholder="min" onChange={(e) => onUpdate({ reps: e.target.value.replace(",", ".") })} />
          </label>
          <label>
            <select value={setItem.weight || ""} onChange={(e) => onUpdate({ weight: e.target.value })}>
              <option value="">Intensidad</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>
        </div>
        {tip && <div className={`progression-tip ${tip.type}`}>{tip.text}</div>}
        <div className="quick-actions">
          <button onClick={() => onUpdate({ reps: currentReps + 5 })}>+5</button>
          <button onClick={() => onUpdate({ reps: Math.max(0, currentReps - 5) })}>-5</button>
          <button onClick={onRepeat}>Duplicar</button>
          <button className="action-timer" onClick={onStartTimer}>⏱</button>
        </div>
      </div>
    );
  }

  return (
    <div className="set-card compact-set-card compact-v2">
      <div className="set-head">
        <b>#{index}</b>
        <div className="set-chips">
          <span className="chip">{setItem.weight || "—"} kg</span>
          <span className="chip">{setItem.reps || "—"} reps</span>
          {setItem.rpe && <span className="chip rpe-chip">RPE {setItem.rpe}</span>}
          {setItem.rir && <span className="chip">RIR {setItem.rir}</span>}
          <button className="chip danger-chip" onClick={onRemove}>×</button>
        </div>
      </div>
      <div className="quick-grid compact-grid">
        <label>
          <input type="text" inputMode="decimal" value={setItem.weight} placeholder="kg" onChange={(e) => onUpdate({ weight: e.target.value.replace(",", ".") })} />
        </label>
        <label>
          <input type="text" inputMode="numeric" value={setItem.reps} placeholder="reps" onChange={(e) => onUpdate({ reps: e.target.value.replace(",", ".") })} />
        </label>
        <label>
          <select value={setItem.rpe || ""} onChange={(e) => onUpdate({ rpe: e.target.value })}>
            <option value="">RPE</option>
            {[6,6.5,7,7.5,8,8.5,9,9.5,10].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>
          <select value={setItem.rir || ""} onChange={(e) => onUpdate({ rir: e.target.value })}>
            <option value="">RIR</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </label>
      </div>
      {tip && <div className={`progression-tip ${tip.type}`}>{tip.text}</div>}
      <div className="quick-actions">
        <button onClick={() => onUpdate({ weight: currentWeight + 2.5 })}>+2.5</button>
        <button onClick={() => onUpdate({ weight: Math.max(0, currentWeight - 2.5) })}>-2.5</button>
        <button onClick={() => onUpdate({ reps: currentReps + 1 })}>+1 rep</button>
        <button onClick={onRepeat}>Duplicar</button>
      </div>
      <button className="action-timer full" onClick={onStartTimer}>⏱ Descanso</button>
    </div>
  );
}

export default memo(WorkoutSetCard);
