import { useState, useEffect, useRef } from "react";

const PRESETS = [60, 90, 120, 180, 300];

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.4);
    }, 250);

    setTimeout(() => {
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.value = 1320;
      osc3.type = "sine";
      gain3.gain.setValueAtTime(0.3, ctx.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc3.start(ctx.currentTime);
      osc3.stop(ctx.currentTime + 0.6);
    }, 500);
  } catch (e) { console.warn("Arrow Gym: beep AudioContext failed", e); }
}

export default function RestTimer({ onClose }) {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const overlayRef = useRef(null);
  const finishedRef = useRef(false);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    prevFocusRef.current = document.activeElement;
    overlayRef.current?.focus();
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("keydown", handler);
      prevFocusRef.current?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const rem = Math.max(0, duration - elapsed);
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(id);
        intervalRef.current = null;
        setRunning(false);
        if (!finishedRef.current) {
          finishedRef.current = true;
          playBeep();
        }
      }
    }, 200);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [running, duration]);

  function start(duration) {
    setDuration(duration);
    setRemaining(duration);
    setRunning(true);
    finishedRef.current = false;
    startTimeRef.current = Date.now();
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setRemaining(null);
  }

  const isFinished = remaining === 0;

  return (
    <div className="rest-timer-overlay" ref={overlayRef} tabIndex={-1} onClick={() => { if (isFinished) onClose(); }} role="dialog" aria-modal="true" aria-label="Temporizador de descanso">
      <div className="rest-timer" onClick={(e) => e.stopPropagation()}>
        <div className="rest-timer-head">
          <span>⏱ Descanso</span>
          <button className="ghost tiny" onClick={onClose} aria-label="Cerrar temporizador">Cerrar</button>
        </div>

        {!running && !isFinished && (
          <div className="rest-presets" role="group" aria-label="Duración del descanso">
            {PRESETS.map((p) => (
              <button key={p} className="secondary small" onClick={() => start(p)} aria-label={`${Math.floor(p / 60)} minutos ${p % 60} segundos`}>
                {p >= 60 ? `${Math.floor(p / 60)}:${(p % 60).toString().padStart(2, "0")}` : `${p}s`}
              </button>
            ))}
          </div>
        )}

        {(running || isFinished) && (
          <div className={`rest-display ${isFinished ? "finished" : ""}`} role="timer" aria-live="assertive" aria-label={`Tiempo restante: ${Math.floor(remaining / 60)} minutos ${remaining % 60} segundos`}>
            <span className="rest-time">
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </span>
            {isFinished && <p className="rest-done">¡Tiempo! 💪</p>}
            {running && <button className="ghost" onClick={stop} aria-label="Detener temporizador">Detener</button>}
          </div>
        )}
      </div>
    </div>
  );
}
