// Arrow Gym UI kit — root app: state, rest timer, exercise picker, more menu
const D2 = window.AG_DATA;

function clone(o) { return JSON.parse(JSON.stringify(o)); }

const MORE = [
  { icon: "📋", label: "Rutinas" }, { icon: "🏆", label: "Récords" },
  { icon: "📏", label: "Mediciones" }, { icon: "+", label: "Ejercicios" },
  { icon: "☰", label: "Historial" }, { icon: "◈", label: "Mapa" }, { icon: "☁", label: "Sync" },
];

function RestTimer({ onClose }) {
  const [t, setT] = useState(90);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((x) => (x <= 0 ? 0 : x - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = Math.floor(t / 60), ss = String(t % 60).padStart(2, "0");
  return (
    <div className="rest-overlay" onClick={onClose}>
      <div className="rest-timer" onClick={(e) => e.stopPropagation()}>
        <div className="rest-head"><span>Descanso</span><button className="ghost small" style={{ padding: "4px 10px", minHeight: "auto", borderRadius: 10 }} onClick={onClose}>✕</button></div>
        <span className="rest-time" style={{ color: t === 0 ? "var(--cyan)" : "var(--green)" }}>{mm}:{ss}</span>
        <div className="rest-presets">
          {[60, 90, 120].map((s) => <button key={s} className="secondary small" onClick={() => { setT(s); setRunning(true); }}>{s}s</button>)}
        </div>
        <button className="primary big" onClick={() => setRunning((r) => !r)}>{running ? "Pausar" : "Reanudar"}</button>
      </div>
    </div>
  );
}

function ExerciseSheet({ onPick, onClose }) {
  const [group, setGroup] = useState("Todos");
  const [q, setQ] = useState("");
  const results = D2.BANK.filter((e) =>
    (group === "Todos" || e.group === group) &&
    (!q || `${e.name} ${e.muscle}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <input autoFocus placeholder="Buscar en +1000 ejercicios" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 10 }} />
        <div className="chip-row">
          {D2.GROUPS.map((g) => (
            <button key={g} className={`filter-chip ${group === g ? "active" : ""}`} onClick={() => setGroup(g)}>{g}</button>
          ))}
        </div>
        <div className="exercise-results">
          {results.length === 0 ? <p className="muted" style={{ padding: 12, textAlign: "center" }}>Sin resultados.</p> :
            results.map((e) => (
              <button key={e.name} onClick={() => onPick(e)}>
                <b>{e.name}</b><small>{e.group} · {e.muscle} · {e.equip}</small>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function MoreSheet({ onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <p className="eyebrow" style={{ textAlign: "center", color: "var(--muted)" }}>Más opciones</p>
        <div style={{ display: "grid", gap: 4, marginTop: 6 }}>
          {MORE.map((m) => (
            <button key={m.label} className="exercise-results" style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: 0, color: "#f4fff8", padding: 12, borderRadius: 14, fontSize: 15, fontWeight: 700, textAlign: "left" }}>
              <span style={{ width: 24, textAlign: "center", fontSize: 18 }}>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [workout, setWorkout] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const scrollRef = useRef(null);

  // workout timer
  useEffect(() => {
    if (page !== "workout") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [page]);

  // scroll to top on page change
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [page]);

  function startWorkout(type) {
    const w = clone(D2.ACTIVE);
    w.type = type;
    if (type === "Libre") w.exercises = [];
    setWorkout(w);
    setElapsed(0);
    setPage("workout");
  }
  function updateSet(ei, si, patch) {
    setWorkout((w) => { const n = clone(w); Object.assign(n.exercises[ei].sets[si], patch); return n; });
  }
  function addSet(ei) {
    setWorkout((w) => {
      const n = clone(w); const ex = n.exercises[ei];
      const last = ex.sets[ex.sets.length - 1] || { weight: "", reps: "" };
      ex.sets.push({ id: Date.now(), weight: last.weight, reps: last.reps });
      return n;
    });
  }
  function addExercise(e) {
    setWorkout((w) => {
      const n = clone(w);
      n.exercises.push({ name: e.name, group: e.group, muscle: e.muscle, last: { weight: "—", reps: "—", sets: 0, date: "—" }, sets: [{ id: Date.now(), weight: "", reps: "" }] });
      return n;
    });
    setShowSheet(false);
  }

  function nav(id) {
    if (id === "more") { setShowMore(true); return; }
    setPage(id);
  }

  return (
    <IOSDevice dark>
      <div className="ag-app">
        <div className="ag-scroll" ref={scrollRef}>
          {page === "home" && <HomeScreen onNav={nav} />}
          {page === "start" && <StartScreen onStart={startWorkout} />}
          {page === "workout" && workout && (
            <WorkoutScreen workout={workout} elapsed={elapsed}
              onUpdateSet={updateSet} onAddSet={addSet}
              onCancel={() => { setWorkout(null); setPage("home"); }}
              onFinish={() => { setWorkout(null); setPage("coach"); }}
              onAddExercise={() => setShowSheet(true)} onTimer={() => setShowTimer(true)} />
          )}
          {page === "coach" && <CoachScreen />}
          {page === "progress" && <ProgressScreen />}
        </div>

        {page !== "workout" && <BottomNav page={page} onNav={nav} />}

        {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
        {showSheet && <ExerciseSheet onPick={addExercise} onClose={() => setShowSheet(false)} />}
        {showMore && <MoreSheet onClose={() => setShowMore(false)} />}
      </div>
    </IOSDevice>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
