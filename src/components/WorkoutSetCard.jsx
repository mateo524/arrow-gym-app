export default function WorkoutSetCard({ setItem, index, onUpdate, onRepeat, onRemove, onStartTimer }) {
  const isCardio = setItem.group === "Cardio";
  const currentWeight = Number(setItem.weight || 0);
  const currentReps = Number(setItem.reps || 0);

  if (isCardio) {
    return (
      <div className="set-card compact-set-card">
        <div className="set-head">
          <div>
            <b>Serie {index || 1}</b>
            <small>{setItem.reps || "—"} min</small>
          </div>
          <button className="danger" onClick={onRemove}>Borrar</button>
        </div>
        <div className="quick-grid">
          <label>
            Duración
            <input type="text" inputMode="decimal" value={setItem.reps} placeholder="minutos" onChange={(e) => onUpdate({ reps: e.target.value.replace(",", ".") })} />
          </label>
          <label>
            Intensidad
            <select value={setItem.weight || ""} onChange={(e) => onUpdate({ weight: e.target.value })}>
              <option value="">Nivel</option>
              <option value="1">1 - Suave</option>
              <option value="2">2 - Ligero</option>
              <option value="3">3 - Moderado</option>
              <option value="4">4 - Intenso</option>
              <option value="5">5 - Máximo</option>
            </select>
          </label>
        </div>
        <div className="quick-actions">
          <button onClick={() => onUpdate({ reps: currentReps + 5 })}>+5 min</button>
          <button onClick={() => onUpdate({ reps: Math.max(0, currentReps - 5) })}>-5 min</button>
          <button onClick={onRepeat}>Duplicar</button>
        </div>
      </div>
    );
  }

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
          <input type="text" inputMode="decimal" value={setItem.weight} placeholder="kg" onChange={(e) => onUpdate({ weight: e.target.value.replace(",", ".") })} />
        </label>
        <label>
          Reps
          <input type="text" inputMode="numeric" value={setItem.reps} placeholder="reps" onChange={(e) => onUpdate({ reps: e.target.value.replace(",", ".") })} />
        </label>
        <label>
          RPE
          <select value={setItem.rpe || ""} onChange={(e) => onUpdate({ rpe: e.target.value })}>
            <option value="">—</option>
            <option value="6">6</option>
            <option value="6.5">6.5</option>
            <option value="7">7</option>
            <option value="7.5">7.5</option>
            <option value="8">8</option>
            <option value="8.5">8.5</option>
            <option value="9">9</option>
            <option value="9.5">9.5</option>
            <option value="10">10</option>
          </select>
        </label>
        <label>
          RIR
          <select value={setItem.rir || ""} onChange={(e) => onUpdate({ rir: e.target.value })}>
            <option value="">—</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </label>
      </div>
      <div className="quick-actions">
        <button onClick={() => onUpdate({ weight: currentWeight + 2.5 })}>+2.5kg</button>
        <button onClick={() => onUpdate({ weight: Math.max(0, currentWeight - 2.5) })}>-2.5kg</button>
        <button onClick={() => onUpdate({ reps: currentReps + 1 })}>+1 rep</button>
        <button onClick={onRepeat}>Duplicar</button>
      </div>
      {onStartTimer && (
        <button className="ghost tiny" style={{ marginTop: 6, width: "100%" }} onClick={onStartTimer}>
          ⏱ Iniciar descanso
        </button>
      )}
    </div>
  );
}
