export default function WorkoutSetCard({ setItem, index, onUpdate, onRepeat, onRemove }) {
  const currentWeight = Number(setItem.weight || 0);
  const currentReps = Number(setItem.reps || 0);

  return (
    <div className="set-card compact-set-card">
      <div className="set-head">
        <div>
          <b>Serie {index || 1}</b>
          <small>{setItem.weight || "—"} kg · {setItem.reps || "—"} reps</small>
        </div>
        <button className="danger" onClick={onRemove}>Borrar</button>
      </div>

      <div className="quick-grid">
        <label>
          Peso
          <input
            inputMode="decimal"
            value={setItem.weight}
            placeholder="kg"
            onChange={(e) => onUpdate({ weight: e.target.value })}
          />
        </label>
        <label>
          Reps
          <input
            inputMode="numeric"
            value={setItem.reps}
            placeholder="reps"
            onChange={(e) => onUpdate({ reps: e.target.value })}
          />
        </label>
      </div>

      <div className="quick-actions">
        <button onClick={() => onUpdate({ weight: currentWeight + 2.5 })}>+2.5kg</button>
        <button onClick={() => onUpdate({ weight: Math.max(0, currentWeight - 2.5) })}>-2.5kg</button>
        <button onClick={() => onUpdate({ reps: currentReps + 1 })}>+1 rep</button>
        <button onClick={onRepeat}>Duplicar</button>
      </div>
    </div>
  );
}
