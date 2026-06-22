import { useState, useEffect, useRef } from "react";
import { playDone } from "../lib/sound.js";

const CIRCUMFERENCE = 2 * Math.PI * 28;
const PRESETS = [30, 60, 90, 120, 180];

// Create a Web Worker from inline code so the timer runs even when the app
// is backgrounded on mobile (avoids throttled setInterval).
function createWorker() {
  try {
    const url = new URL("../lib/timerWorker.js", import.meta.url);
    return new Worker(url, { type: "module" });
  } catch {
    return null;
  }
}

export default function RestTimer({ duration = 90, onComplete, onSkip, active, soundEnabled = true, nextLabel }) {
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const workerRef = useRef(null);
  const doneRef = useRef(false);
  const timerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Init worker once
  useEffect(() => {
    workerRef.current = createWorker();
    if (workerRef.current) {
      workerRef.current.onmessage = (e) => {
        const { type, remaining: r } = e.data;
        if (type === "tick") setRemaining(r);
        if (type === "done" && !doneRef.current) {
          doneRef.current = true;
          setRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          if (Notification?.permission === "granted") {
            try { new Notification("⏱ Loop — Descanso terminado", { body: "¡Listo para la próxima serie!", tag: "rest-timer", silent: true }); } catch {}
          }
          try { if (soundEnabled) import("../lib/sound.js").then(({ playDone: pd }) => pd()); } catch {}
          onCompleteRef.current?.();
        }
      };
    }
    return () => { stopTimer(); workerRef.current?.terminate(); workerRef.current = null; };
  }, []);

  useEffect(() => {
    setSelectedDuration(duration);
    setRemaining(duration);
    setRunning(false);
  }, [duration]);

  function stopTimer() {
    workerRef.current?.postMessage({ type: "stop" });
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function startTimer() {
    doneRef.current = false;
    setRemaining(selectedDuration);
    setRunning(true);
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "start", seconds: selectedDuration });
    } else {
      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); timerRef.current = null; setRunning(false); onCompleteRef.current?.(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
  }

  function handlePreset(secs) {
    if (secs === selectedDuration) return;
    workerRef.current?.postMessage({ type: "stop" });
    doneRef.current = false;
    setSelectedDuration(secs);
    setRemaining(secs);
  }

  function handleCustom(e) {
    e.preventDefault();
    const secs = parseInt(customInput, 10);
    if (!secs || secs < 5 || secs > 600) return;
    setCustomInput("");
    handlePreset(secs);
  }

  const progress = remaining / selectedDuration;
  const offset = CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="rest-overlay-inner" role="timer" aria-label={`Descanso ${minutes}:${seconds.toString().padStart(2, "0")} restantes`}>
      <div className="rest-presets">
        {PRESETS.map((s) => (
          <button
            key={s}
            className={`rest-preset${selectedDuration === s ? " active" : ""}`}
            onClick={() => { if (!running) handlePreset(s); }}
            disabled={running}
          >
            {s >= 60 ? `${s/60}m` : `${s}s`}
          </button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (!running) handleCustom(e); }} style={{ display:"flex", gap:4, alignItems:"center", marginBottom:6 }}>
        <input
          type="number"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder="seg"
          min="5" max="600"
          disabled={running}
          style={{ width:60, background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:8, padding:"5px 8px", color:"var(--text)", fontSize:13, textAlign:"center" }}
        />
        <button type="submit" disabled={running} style={{ background:"rgba(168,85,247,.15)", border:"1px solid rgba(168,85,247,.35)", borderRadius:8, padding:"5px 10px", fontSize:12, color:"var(--green)", cursor:"pointer", fontWeight:700 }}>OK</button>
      </form>

      <div className="rest-ring-wrap">
        <svg width={72} height={72} viewBox="0 0 72 72" className="rest-timer-ring">
          <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={5} />
          <circle
            cx={36} cy={36} r={28}
            fill="none"
            stroke={remaining < 10 ? "var(--danger)" : "var(--green)"}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
            className="rest-timer-progress"
          />
          <text x={36} y={38} textAnchor="middle" dominantBaseline="central" fill="var(--text)" fontSize={18} fontWeight={900}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </text>
        </svg>
        {nextLabel && (
          <small className="rest-next-label">Próximo: {nextLabel}</small>
        )}
      </div>

      {running ? (
        <button className="ghost rest-skip-btn" onClick={onSkip} aria-label="Saltear descanso">
          Saltear →
        </button>
      ) : (
        <button
          onClick={startTimer}
          style={{ width:"100%", padding:"12px", borderRadius:14, border:"1.5px solid var(--cyan)", background:"rgba(117,217,255,.1)", color:"var(--cyan)", fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
        >
          ▶ Iniciar descanso
        </button>
      )}
    </div>
  );
}

