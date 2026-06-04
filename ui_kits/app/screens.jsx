// Arrow Gym UI kit — screens
const D = window.AG_DATA;

// ── HOME ──────────────────────────────────────────────────────
function HomeScreen({ onNav }) {
  const cal = D.CALENDAR;
  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];
  const dayCells = [];
  // pad: month starts Wed (offset 2)
  for (let i = 0; i < 2; i++) dayCells.push(<div key={`p${i}`} />);
  for (let d = 1; d <= 30; d++) {
    let cls = "calendar-day";
    if (cal.trained.includes(d)) cls += " trained";
    else if (cal.light.includes(d)) cls += " light";
    if (d === cal.today) cls += " today";
    dayCells.push(<div key={d} className={cls}>{d}</div>);
  }
  return (
    <section className="page">
      <div className="hero">
        <p className="eyebrow">Arrow Gym</p>
        <h1>Entrená rápido. Medí cada músculo.</h1>
        <p>Mapa muscular, radar por grupos y registro sin fricción.</p>
        <button className="primary big" onClick={() => onNav("start")}>Empezar entrenamiento</button>
      </div>

      <div className="stats-grid">
        <div><b>128</b><span>entrenos</span></div>
        <div><b>1.4k</b><span>series</span></div>
        <div><b>🔥12</b><span>días seguidos</span></div>
      </div>

      <div className="card">
        <div className="card-head-row">
          <h2>Esta semana</h2>
          <small className="vs-up">↑ 3 ant.</small>
        </div>
        <div className="stats-grid four" style={{ margin: "0 0 4px" }}>
          <div><b>4</b><span>fuerza</span></div>
          <div><b>2</b><span>cardio</span></div>
          <div><b>312</b><span>min</span></div>
          <div><b>4</b><span>días</span></div>
        </div>
        <div className="week-goal-bar">
          <div className="week-goal-label"><span>Meta semanal</span><b>4/5 días</b></div>
          <div className="week-goal-track"><div className="week-goal-fill" style={{ width: "80%" }} /></div>
        </div>
      </div>

      <MuscleMap intensity={D.INTENSITY} />

      <button className="as-button" onClick={() => onNav("progress")}>
        <h2>Último entrenamiento</h2>
        <p>Push · 2026-06-02</p>
        <strong>18 series · 4.2k kg</strong>
      </button>

      <div className="card" style={{ borderLeft: "3px solid #f59e0b" }}>
        <b style={{ color: "var(--green)", fontSize: 13 }}>Coach dice</b>
        <p style={{ marginTop: 4 }}>Tu hombro derecho viene cargado. Sumá un face pull esta semana.</p>
      </div>

      <div className="card">
        <h2>Junio</h2>
        <div className="calendar-grid">
          {weekDays.map((d, i) => <div key={i} className="calendar-header">{d}</div>)}
          {dayCells}
        </div>
      </div>
    </section>
  );
}

// ── START ─────────────────────────────────────────────────────
function StartScreen({ onStart }) {
  return (
    <section className="page">
      <p className="eyebrow">Start Workout</p>
      <h1>Elegí entrenamiento</h1>
      <p className="eyebrow" style={{ marginTop: 16 }}>Gimnasio</p>
      <div className="routine-grid">
        {Object.entries(D.ROUTINES).map(([name, r]) => (
          <button key={name} className="routine-card" onClick={() => onStart(name)}>
            <span>{r.icon}</span><b>{name}</b><small>{r.count} ejercicios</small>
          </button>
        ))}
      </div>
      <p className="eyebrow" style={{ marginTop: 16 }}>Cardio</p>
      <div className="routine-grid">
        {Object.entries(D.CARDIO).map(([name, r]) => (
          <button key={name} className="routine-card cardio" onClick={() => onStart(name)}>
            <span>{r.icon}</span><b>{name}</b><small>{r.note}</small>
          </button>
        ))}
      </div>
      <button className="routine-card free" onClick={() => onStart("Libre")}>
        <span>⚡</span><div><b>Libre</b><small>Elegí ejercicios sobre la marcha</small></div>
      </button>
    </section>
  );
}

// ── WORKOUT ───────────────────────────────────────────────────
function SetRow({ set, index, onChange, onTimer }) {
  const tip = set.reps >= 12 ? { t: "⚡ Probá +2.5kg", c: "positive" }
    : set.reps >= 9 ? { t: "🎯 Llegá a 12 reps antes de subir", c: "warn" } : null;
  return (
    <div className="compact-set-card">
      <div className="set-head">
        <b>#{index}</b>
        <div className="set-chips">
          <span className="chip">{set.weight || "—"} kg</span>
          <span className="chip">{set.reps || "—"} reps</span>
          {set.rpe && <span className="chip rpe-chip">RPE {set.rpe}</span>}
          {set.rir != null && <span className="chip">RIR {set.rir}</span>}
        </div>
      </div>
      <div className="quick-grid">
        <label><input value={set.weight} onChange={(e) => onChange({ weight: e.target.value })} placeholder="kg" /></label>
        <label><input value={set.reps} onChange={(e) => onChange({ reps: e.target.value })} placeholder="reps" /></label>
        <label><select value={set.rpe || ""} onChange={(e) => onChange({ rpe: e.target.value })}><option value="">RPE</option>{[7,7.5,8,8.5,9,9.5,10].map(v=><option key={v}>{v}</option>)}</select></label>
        <label><select value={set.rir ?? ""} onChange={(e) => onChange({ rir: e.target.value })}><option value="">RIR</option>{[0,1,2,3,4].map(v=><option key={v}>{v}</option>)}</select></label>
      </div>
      {tip && <div className={`progression-tip ${tip.c}`}>{tip.t}</div>}
      <div className="quick-actions">
        <button onClick={() => onChange({ weight: String((+set.weight||0)+2.5) })}>+2.5</button>
        <button onClick={() => onChange({ weight: String(Math.max(0,(+set.weight||0)-2.5)) })}>-2.5</button>
        <button onClick={() => onChange({ reps: String((+set.reps||0)+1) })}>+1 rep</button>
        <button onClick={onTimer}>⏱</button>
      </div>
    </div>
  );
}

function WorkoutScreen({ workout, elapsed, onUpdateSet, onAddSet, onCancel, onFinish, onAddExercise, onTimer }) {
  const mm = String(Math.floor(elapsed / 60));
  const ss = String(elapsed % 60).padStart(2, "0");
  return (
    <section className="page">
      <div className="top-row">
        <div>
          <p className="eyebrow">Entrenando</p>
          <h1 style={{ marginBottom: 2 }}>{workout.type}</h1>
          <div className="workout-meta"><small className="muted">{workout.date}</small><span className="elapsed-timer">⏱ {mm}:{ss}</span></div>
        </div>
        <button className="ghost" onClick={onCancel}>Cancelar</button>
      </div>

      {workout.exercises.map((ex, ei) => (
        <div className="exercise-block" key={ei}>
          <div className="exercise-block-head">
            <div>
              <b>{ex.name}</b>
              <small>{ex.group} · {ex.muscle}</small>
              <span className="last-line">Último: {ex.last.weight} kg · {ex.last.reps} reps · {ex.last.sets} series · {ex.last.date}</span>
            </div>
            <div className="block-actions">
              <button className="secondary small" onClick={() => onAddSet(ei)}>+ Serie</button>
            </div>
          </div>
          {ex.sets.map((s, si) => (
            <SetRow key={s.id} set={s} index={si + 1} onChange={(p) => onUpdateSet(ei, si, p)} onTimer={onTimer} />
          ))}
        </div>
      ))}

      <button className="secondary full" onClick={onAddExercise}>+ Agregar ejercicio</button>
      <button className="finish-button" onClick={onFinish}>Finalizar entrenamiento</button>
    </section>
  );
}

// ── COACH ─────────────────────────────────────────────────────
const COACH_TABS = [
  { id: "resume", icon: "⚡", label: "Resumen" },
  { id: "body", icon: "📏", label: "Cuerpo" },
  { id: "training", icon: "💪", label: "Training" },
  { id: "alerts", icon: "⚠", label: "Alertas" },
];
function CoachScreen() {
  const [tab, setTab] = useState("resume");
  return (
    <section className="page">
      <div className="top-row">
        <div><p className="eyebrow">Coach IA</p><h1>{COACH_TABS.find(t=>t.id===tab).label}</h1></div>
      </div>
      <div className="coach-tabs">
        {COACH_TABS.map((t) => (
          <button key={t.id} className={`coach-tab ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span><small>{t.label}</small>
          </button>
        ))}
      </div>

      {tab === "resume" && (
        <div className="coach-feature">
          <div className="coach-feature-head">
            <div className="arrow-logo">→</div>
            <div><small>Panel de scores</small><h2>Estado general</h2></div>
          </div>
          <div className="scores-grid">{D.SCORES.map((s) => <ScoreBadge key={s.label} v={s.v} label={s.label} />)}</div>
          <div className="coach-status"><span>Resumen</span><p>Buena semana: +8% de volumen y consistencia alta. El balance empuje/tracción quedó corto — sumá espalda.</p></div>
          <div className="coach-block rec"><span>Próximas acciones</span><p>→ Subí 2.5 kg en Chest Press</p><p>→ Agregá 1 face pull por desequilibrio de hombro</p></div>
          <div className="coach-block"><span>Cómo mejorar</span><p className="tip">💡 Dormí 7h+ para subir recuperación</p></div>
        </div>
      )}
      {tab === "body" && (
        <div className="coach-feature">
          <div className="coach-feature-head"><div className="arrow-logo">→</div><div><small>Composición</small><h2>Cuerpo</h2></div></div>
          <div className="coach-block"><span>Peso corporal</span><Sparkline values={[78.4, 78.1, 77.9, 77.6, 77.2, 77.0]} dots={false} /><p style={{ marginTop: 6 }}><b style={{ color: "var(--green)" }}>77.0 kg</b> · −1.4 kg en 6 semanas</p></div>
          <div className="coach-block"><span>Insights corporales</span><p>✓ Tendencia de recomposición: bajás grasa manteniendo fuerza.</p></div>
        </div>
      )}
      {tab === "training" && (
        <div className="coach-feature">
          <div className="coach-feature-head"><div className="arrow-logo">→</div><div><small>Análisis</small><h2>Entrenamiento</h2></div></div>
          <div className="coach-status"><span>Totales</span><p>128 entrenos · 1.4k series · 184k kg · 1.2k min cardio</p></div>
          <div className="coach-block"><span>Volumen semanal</span>
            <div className="weekly-vol-chart">{D.WEEKLY_VOL.map((h, i) => (<div className="vol-col" key={i}><div className="vol-bar" style={{ height: `${h}%` }} /><small>S{i+1}</small></div>))}</div>
          </div>
          <div className="coach-block"><span>Top mejoras</span><p>↑ Chest Press +7.5 kg · ↑ RDL +10 kg</p></div>
        </div>
      )}
      {tab === "alerts" && (
        <div className="coach-feature">
          <div className="coach-feature-head"><div className="arrow-logo">→</div><div><small>Desequilibrios</small><h2>Alertas (2)</h2></div></div>
          <div className="coach-block warn"><span>Hombro — atención</span><p>⚠️ Mucho press, poco trabajo posterior. Riesgo de desequilibrio.</p></div>
          <div className="coach-block warn"><span>Estancamiento</span><p>⚠ Lat Pulldown sin cambios hace 4 sesiones.</p></div>
          <div className="coach-block prs"><span>🏆 Récords (2)</span><p>Chest Press 80 kg · RDL 100 kg</p></div>
        </div>
      )}
    </section>
  );
}

// ── PROGRESS ──────────────────────────────────────────────────
function ProgressScreen() {
  const maxSets = Math.max(...D.GROUP_TOTALS.map((g) => g.sets));
  return (
    <section className="page">
      <p className="eyebrow">Progreso de entrenamiento</p>
      <h1>Progreso</h1>
      <div className="stats-grid four tight">
        <div><b>128</b><span>entrenos</span></div>
        <div><b>1.4k</b><span>series</span></div>
        <div><b>184k</b><span>kg total</span></div>
        <div><b>14k</b><span>reps</span></div>
      </div>
      <Radar data={D.RADAR} />
      <h2>Distribución por grupo</h2>
      <div className="progress-groups">
        {D.GROUP_TOTALS.map((g) => (
          <div className="mini-bar-row" key={g.group}>
            <div className="mini-bar-label"><span>{g.group}</span><b>{g.sets}</b></div>
            <div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: `${(g.sets / maxSets) * 100}%` }} /></div>
            <small>{g.ex}</small>
          </div>
        ))}
      </div>
      <h2 style={{ marginTop: 16 }}>1RM estimado</h2>
      <div className="rm-list">
        {D.ONE_RM.map((r) => (
          <div className="rm-item" key={r.name}>
            <div className="rm-info"><b>{r.name}</b><small>{r.set}</small></div>
            <span className="rm-value">{r.rm} kg</span>
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { HomeScreen, StartScreen, WorkoutScreen, CoachScreen, ProgressScreen });
