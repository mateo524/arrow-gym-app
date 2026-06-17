import { useState, useEffect, useRef } from "react";
import { playDone } from "../lib/sound.js";

const CIRCUMFERENCE = 2 * Math.PI * 28;
const PRESETS = [60, 90, 120];

export default function RestTimer({ duration = 90, onComplete, onSkip, active, soundEnabled = true, nextLabel }) {
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const [remaining, setRemaining] = useState(duration);
  const timerRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    setSelectedDuration(duration);
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (!active) {
      setRemaining(selectedDuration);
      doneRef.current = false;
      return;
    }
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          if (!doneRef.current) {
            doneRef.current = true;
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            if (soundEnabled) playDone();
            onComplete?.();
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active, selectedDuration, onComplete, soundEnabled]);

  function handlePreset(secs) {
    clearInterval(timerRef.current);
    doneRef.current = false;
    setSelectedDuration(secs);
    setRemaining(secs);
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
            onClick={() => handlePreset(s)}
          >
            {s}s
          </button>
        ))}
      </div>

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

      <button className="ghost rest-skip-btn" onClick={onSkip} aria-label="Saltear descanso">
        Saltear →
      </button>
    </div>
  );
}
