import { useState, useEffect, useRef } from "react";

const CIRCUMFERENCE = 2 * Math.PI * 28;

export default function RestTimer({ duration = 90, onComplete, onSkip, active }) {
  const [remaining, setRemaining] = useState(duration);
  const timerRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setRemaining(duration);
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
            onComplete?.();
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active, duration, onComplete]);

  const progress = remaining / duration;
  const offset = CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="rest-timer" role="timer" aria-label={`Rest ${minutes}:${seconds.toString().padStart(2, "0")} remaining`}>
      <svg width={72} height={72} viewBox="0 0 72 72" className="rest-timer-ring">
        <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={5} />
        <circle
          cx={36} cy={36} r={28}
          fill="none"
          stroke="var(--green)"
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
      <div className="rest-timer-actions">
        <button className="ghost" onClick={onSkip} aria-label="Skip rest">Skip</button>
      </div>
    </div>
  );
}
