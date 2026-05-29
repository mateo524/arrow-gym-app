import { useState, useEffect, useRef } from "react";

const PRESETS = [60, 90, 120, 180, 300];

export default function RestTimer({ onClose }) {
  const [seconds, setSeconds] = useState(90);
  const [remaining, setRemaining] = useState(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function start(duration) {
    setSeconds(duration);
    setRemaining(duration);
    setRunning(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setRemaining(null);
  }

  const isFinished = remaining === 0;

  return (
    <div className="rest-timer-overlay" onClick={() => { if (isFinished) onClose(); }}>
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
