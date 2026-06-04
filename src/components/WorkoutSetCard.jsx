export default function WorkoutSetCard({ setItem, index, onUpdate, onRepeat, onRemove, onComplete }) {
  const currentWeight = Number(setItem.weight || 0);
  const currentReps = Number(setItem.reps || 0);
  const isPrefilled = Boolean(setItem.lastWeight || setItem.lastReps) && !setItem.weight && !setItem.reps;
  const isEmpty = !setItem.weight && !setItem.reps;

  const handleWeightChange = (value) => {
    onUpdate({ weight: value });
    if (value && setItem.reps) onComplete?.();
  };

  const handleRepsChange = (value) => {
    onUpdate({ reps: value });
    if (value && setItem.weight) onComplete?.();
  };

  const handleWarmup = () => {
    const warmWeight = Math.round(currentWeight * 0.5 / 2.5) * 2.5 || 10;
    onUpdate({ weight: warmWeight, reps: 10 });
    onRepeat();
  };

  return (
    <div className={`set-card compact-set-card ${isPrefilled ? "set-card-ghost" : ""}`} aria-label={`Set ${index || 1}`}>
      <div className="set-head">
        <div>
          <b>Serie {index || 1}</b>
          <small>{setItem.weight || "—"} kg · {setItem.reps || "—"} reps</small>
        </div>
        <button className="danger" onClick={onRemove} aria-label="Delete set">Borrar</button>
      </div>

      <div className="quick-grid">
        <label>
          Peso
          <input
            inputMode="decimal"
            value={setItem.weight}
            placeholder="kg"
            onChange={(e) => handleWeightChange(e.target.value)}
          />
        </label>
        <label>
          Reps
          <input
            inputMode="numeric"
            value={setItem.reps}
            placeholder="reps"
            onChange={(e) => handleRepsChange(e.target.value)}
          />
        </label>
      </div>

      <div className="quick-actions">
        <button onClick={() => onUpdate({ weight: currentWeight + 2.5 })} aria-label="Add 2.5kg">+2.5</button>
        <button onClick={() => onUpdate({ weight: Math.max(0, currentWeight - 2.5) })} aria-label="Subtract 2.5kg">-2.5</button>
        <button onClick={() => onUpdate({ weight: currentWeight + 5 })} aria-label="Add 5kg">+5</button>
        <button onClick={() => onUpdate({ weight: Math.max(0, currentWeight - 5) })} aria-label="Subtract 5kg">-5</button>
        <button onClick={() => onUpdate({ reps: currentReps + 1 })} aria-label="Add 1 rep">+1 rep</button>
        <button onClick={onRepeat} aria-label="Duplicate set">Duplicar</button>
        {!isEmpty && (
          <button onClick={handleWarmup} aria-label="Add warm-up set">Calentar</button>
        )}
      </div>
    </div>
  );
}
