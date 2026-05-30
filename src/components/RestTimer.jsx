import { useState, useEffect, useRef } from "react";

const PRESETS = [60, 90, 120, 180, 300];

export default function RestTimer({ onClose }) {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    overlayRef.current?.focus();
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("keydown", handler);
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
      }
    }, 200);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [running, duration]);

  function start(duration) {
    setDuration(duration);
    setRemaining(duration);
    setRunning(true);
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
    <div className="rest-timer-overlay" ref={overlayRef} tabIndex={-1} onClick={() => { if (isFinished) onClose(); }}>
      <div className="rest-timer" onClick={(e) => e.stopPropagation()}>
        <div className="rest-timer-head">
          <span>⏱ Descanso</span>
          <button className="ghost tiny" onClick={onClose}>Cerrar</button>
        </div>

        {!running && !isFinished && (
          <div className="rest-presets">
            {PRESETS.map((p) => (
              <button key={p} className="secondary small" onClick={() => start(p)}>
                {p >= 60 ? `${Math.floor(p / 60)}:${(p % 60).toString().padStart(2, "0")}` : `${p}s`}
              </button>
            ))}
          </div>
        )}

        {(running || isFinished) && (
          <div className={`rest-display ${isFinished ? "finished" : ""}`}>
            <span className="rest-time">
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </span>
            {isFinished && <p className="rest-done">¡Tiempo! 💪</p>}
            {running && <button className="ghost" onClick={stop}>Detener</button>}
          </div>
        )}
      </div>
    </div>
  );
}
