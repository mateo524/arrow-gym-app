import { useState, useEffect, useRef } from "react";
import { playDone, primeAudio } from "../lib/sound.js";

const CIRCUMFERENCE = 2 * Math.PI * 28;

function swPost(msg) {
  try {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage(msg);
    }
  } catch {}
}

async function requestNotifPermission() {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission().catch(() => {});
  }
}

export default function RestTimer({ duration = 90, onComplete, onSkip, onClose, onChangeDuration, active, soundEnabled = true, nextLabel }) {
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const doneRef = useRef(false);
  const pausedAtRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const wakeLockRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  async function acquireWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      if (wakeLockRef.current) return; // already held
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      wakeLockRef.current.addEventListener('release', () => { wakeLockRef.current = null; });
    } catch { /* permission denied or not supported — silent */ }
  }

  function releaseWakeLock() {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }

  // Re-acquire after the page becomes visible again (screen was locked)
  useEffect(() => {
    function onVisChange() {
      if (document.visibilityState === 'visible' && running && !paused) {
        acquireWakeLock();
      }
    }
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [running, paused]);

  // Release wake lock on unmount
  useEffect(() => releaseWakeLock, []);

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    startTimeRef.current = null;
    pausedAtRef.current = null;
    releaseWakeLock();
    swPost({ type: 'CANCEL_TIMER', id: 'rest-timer' });
  }

  function togglePause() {
    if (!running) return;
    if (paused) {
      // resume: shift startTime forward by the time we were paused
      const pausedDuration = Date.now() - pausedAtRef.current;
      startTimeRef.current = startTimeRef.current + pausedDuration;
      pausedAtRef.current = null;
      setPaused(false);
      acquireWakeLock();
    } else {
      pausedAtRef.current = Date.now();
      setPaused(true);
      releaseWakeLock(); // screen can sleep while paused
    }
  }

  function startTimer(dur) {
    primeAudio();
    const d = dur ?? selectedDuration;
    doneRef.current = false;
    setRunning(true);
    acquireWakeLock();
    startTimeRef.current = Date.now();
    setRemaining(d);
    // Schedule SW notification as fallback for background/locked screen
    requestNotifPermission().then(() => {
      swPost({ type: 'SCHEDULE_TIMER', id: 'rest-timer', delayMs: d * 1000, label: nextLabel || '' });
    });
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (pausedAtRef.current) return; // paused — don't advance
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
        swPost({ type: 'CANCEL_TIMER', id: 'rest-timer' });
      }
    }, 200);
  }

  useEffect(() => {
    stopTimer();
    setSelectedDuration(duration);
    setRemaining(duration);
    setRunning(false);
    setPaused(false);
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
  const ringColor = remaining <= 10 ? "var(--danger)" : remaining <= 30 ? "#f59e0b" : "var(--green)";

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
            stroke={ringColor} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
            transform="rotate(-90 36 36)" className="rest-timer-progress" />
          <text x={36} y={38} textAnchor="middle" dominantBaseline="central" fill={ringColor} fontSize={18} fontWeight={900}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </text>
        </svg>
        {nextLabel && <small className="rest-next-label">Proximo: {nextLabel}</small>}
      </div>

      {running ? (
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <button
            className="ghost rest-skip-btn"
            onClick={togglePause}
            aria-label={paused ? "Reanudar descanso" : "Pausar descanso"}
            style={{ flex: 1, borderColor: "var(--cyan)", color: "var(--cyan)" }}
          >
            {paused ? "Reanudar" : "Pausar"}
          </button>
          <button className="ghost rest-skip-btn" onClick={onSkip} aria-label="Saltear descanso" style={{ flex: 1 }}>Saltear →</button>
          {onClose && (
            <button className="ghost rest-skip-btn" onClick={onClose} aria-label="Cerrar timer" style={{ color: "var(--muted)", borderColor: "var(--line)", padding: "0 12px" }}>X</button>
          )}
        </div>
      ) : (
        <button onClick={startTimer}
          style={{ width:"100%", padding:"12px", borderRadius:14, border:"1.5px solid var(--cyan)", background:"rgba(117,217,255,.1)", color:"var(--cyan)", fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          Iniciar descanso
        </button>
      )}
    </div>
  );
}
