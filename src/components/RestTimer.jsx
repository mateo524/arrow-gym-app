import { useState, useEffect, useRef } from "react";
import { playDone, primeAudio } from "../lib/sound.js";

const CIRCUMFERENCE = 2 * Math.PI * 28;

export default function RestTimer({ duration = 90, onComplete, onSkip, onChangeDuration, active, soundEnabled = true, nextLabel }) {
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const doneRef = useRef(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    startTimeRef.current = null;
  }

  function startTimer(dur) {
    primeAudio();
    const d = dur ?? selectedDuration;
    doneRef.current = false;
    setRunning(true);
    startTimeRef.current = Date.now();
    setRemaining(d);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const left = Math.max(0, d - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setRunning(false);
        startTimeRef.current = null;
        if (doneRef.current) return;
        doneRef.current = true;
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        if (Notification?.permission === "granted") {
          try { new Notification("Loop - Descanso terminado", { body: "Listo para la proxima serie.", tag: "rest-timer", silent: true }); } catch {}
        }
        try { if (soundEnabled) playDone(); } catch {}
        onCompleteRef.current?.();
      }
    }, 200);
  }

  useEffect(() => {
    setSelectedDuration(duration);
    setRemaining(duration);
    setRunning(false);
  }, [duration]);

  useEffect(() => {
    if (active && !running) startTimer();
    return stopTimer;
  }, [active]);

  function applyDuration(secs) {
    if (!secs || secs < 5 || secs > 600) return;
    onChangeDuration?.(secs);
    const wasRunning = !!timerRef.current;
    if (timerRef.current) stopTimer();
    doneRef.current = false;
    setSelectedDuration(secs);
    setRemaining(secs);
    if (wasRunning) startTimer(secs);
  }

  function handleCustom(e) {
    e.preventDefault();
    const secs = parseInt(customInput, 10);
    if (!secs || secs < 5 || secs > 600) return;
    setCustomInput("");
    applyDuration(secs);
    if (!running) startTimer(secs);
  }

  const progress = selectedDuration > 0 ? remaining / selectedDuration : 0;
  const offset = CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="rest-overlay-inner" role="timer" aria-label={`Descanso ${minutes}:${seconds.toString().padStart(2, "0")} restantes`}>
      <form onSubmit={handleCustom}
        style={{ display:"flex", gap:8, alignItems:"center", marginBottom:14, justifyContent:"center" }}>
        <input type="number" value={customInput} onChange={e => setCustomInput(e.target.value)}
          placeholder={String(selectedDuration)}
          min="5" max="600"
          style={{ width:80, background:"var(--panel2)", border:"1px solid var(--line)", borderRadius:10, padding:"8px 10px", color:"var(--text)", fontSize:16, textAlign:"center", fontWeight:700 }} />
        <button type="submit"
          style={{ background:"rgba(168,85,247,.2)", border:"1.5px solid rgba(168,85,247,.5)", borderRadius:10, padding:"8px 18px", fontSize:14, color:"var(--green)", cursor:"pointer", fontWeight:800 }}>OK</button>
      </form>

      <div className="rest-ring-wrap">
        <svg width={72} height={72} viewBox="0 0 72 72" className="rest-timer-ring">
          <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={5} />
          <circle cx={36} cy={36} r={28} fill="none"
            stroke={remaining < 10 ? "var(--danger)" : "var(--green)"} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
            transform="rotate(-90 36 36)" className="rest-timer-progress" />
          <text x={36} y={38} textAnchor="middle" dominantBaseline="central" fill="var(--text)" fontSize={18} fontWeight={900}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </text>
        </svg>
        {nextLabel && <small className="rest-next-label">Proximo: {nextLabel}</small>}
      </div>

      {running ? (
        <button className="ghost rest-skip-btn" onClick={onSkip} aria-label="Saltear descanso">Saltear →</button>
      ) : (
        <button onClick={startTimer}
          style={{ width:"100%", padding:"12px", borderRadius:14, border:"1.5px solid var(--cyan)", background:"rgba(117,217,255,.1)", color:"var(--cyan)", fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          ▶ Iniciar descanso
        </button>
      )}
    </div>
  );
}
