function haptic() {
  if (navigator.vibrate) navigator.vibrate(20);
}

export default function WorkoutSetCard({ setItem, index, onUpdate, onRepeat, onRemove, onStartRest, onOpenCalc }) {
  const currentWeight = Number(setItem.weight || 0);
  const currentReps = Number(setItem.reps || 0);
  const isPrefilled = Boolean(setItem.lastWeight || setItem.lastReps) && !setItem.weight && !setItem.reps;
  const hasData = setItem.weight && setItem.reps;

  function bumpWeight(delta) {
    haptic();
    onUpdate({ weight: String(Math.max(0, Math.round((currentWeight + delta) * 10) / 10)) });
  }

  function bumpReps(delta) {
    haptic();
    onUpdate({ reps: String(Math.max(0, currentReps + delta)) });
  }

  return (
    <div className={`set-card compact-set-card${isPrefilled ? " set-card-ghost" : ""}`} aria-label={`Serie ${index || 1}`}>
      <div className="set-head">
        <b>Serie {index || 1}</b>
        {setItem.lastWeight ? (
          <small>ant. {setItem.lastWeight}kg × {setItem.lastReps || "—"}</small>
        ) : null}
        <button className="set-delete-btn" onClick={onRemove} aria-label="Borrar">✕</button>
      </div>

      <div className="set-row">
        <button className="set-inc" onClick={() => bumpWeight(-2.5)}>−2.5</button>
        <button className="set-inc" onClick={() => bumpWeight(-5)}>−5</button>
        <input
          className="set-val"
          inputMode="decimal"
          value={setItem.weight}
          placeholder="kg"
          onChange={(e) => onUpdate({ weight: e.target.value })}
        />
        <button className="set-inc" onClick={() => bumpWeight(2.5)}>+2.5</button>
        <button className="set-inc" onClick={() => bumpWeight(5)}>+5</button>
      </div>

      <div className="set-row">
        <button className="set-inc" onClick={() => bumpReps(-2)}>−2</button>
        <button className="set-inc" onClick={() => bumpReps(-1)}>−1</button>
        <input
          className="set-val"
          inputMode="numeric"
          value={setItem.reps}
          placeholder="reps"
          onChange={(e) => onUpdate({ reps: e.target.value })}
        />
        <button className="set-inc" onClick={() => bumpReps(1)}>+1</button>
        <button className="set-inc" onClick={() => bumpReps(2)}>+2</button>
      </div>

      <div className="set-actions">
        <button className="ghost set-action-sm" onClick={onRepeat}>Duplicar</button>
        <button className="calc-btn set-action-sm" onClick={() => onOpenCalc?.(currentWeight)}>Discos</button>
      </div>

      {hasData && (
        <button className="rest-btn" onClick={() => { haptic(); onStartRest?.(); }}>
          ⏱ Descanso
        </button>
      )}
    </div>
  );
}
