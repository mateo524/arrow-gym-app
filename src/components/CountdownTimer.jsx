import { useState, useEffect, useRef } from "react";

export default function CountdownTimer({ defaultSeconds = 60, onComplete, setIndex, totalSets }) {
  const [duration, setDuration] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  // Reset when setIndex changes
  useEffect(() => {
    setRemaining(duration);
    setRunning(false);
    setDone(false);
    clearInterval(intervalRef.current);
  }, [setIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setDone(true);
            // Play beep
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              [0, 0.15, 0.3].forEach(delay => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.frequency.value = 880;
                gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);
                osc.start(ctx.currentTime + delay);
                osc.stop(ctx.currentTime + delay + 0.15);
              });
            } catch {}
            // Vibrate if supported
            try { navigator.vibrate?.([200, 100, 200]); } catch {}
            onComplete?.();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    if (done) {
      setRemaining(duration);
      setDone(false);
      setRunning(true);
    } else {
      setRunning(r => !r);
    }
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(false);
    setRemaining(duration);
  };

  const changeDuration = (delta) => {
    const next = Math.max(5, duration + delta);
    setDuration(next);
    if (!running && !done) setRemaining(next);
  };

  const pct = duration > 0 ? remaining / duration : 0;
  const color = done ? "#22d37a" : remaining <= 5 ? "#ef4444" : remaining <= 10 ? "#f59e0b" : "#60a5fa";

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"12px 0" }}>
      {totalSets > 1 && (
        <div style={{ fontSize:12, color:"var(--muted)", fontWeight:700 }}>
          Serie {setIndex + 1} de {totalSets}
        </div>
      )}

      {/* Circular progress */}
      <div style={{ position:"relative", width:140, height:140 }}>
        <svg width="140" height="140" style={{ transform:"rotate(-90deg)" }}>
          <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
          <circle cx="70" cy="70" r="60" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${Math.PI * 2 * 60}`}
            strokeDashoffset={`${Math.PI * 2 * 60 * (1 - pct)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:32, fontWeight:900, fontVariantNumeric:"tabular-nums", color: done ? "#22d37a" : "var(--text)", letterSpacing:-1 }}>
            {done ? "✓" : fmt(remaining)}
          </span>
          {!done && <span style={{ fontSize:11, color:"var(--muted)" }}>de {fmt(duration)}</span>}
        </div>
      </div>

      {/* Duration selector */}
      {!running && !done && (
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => changeDuration(-15)} style={{ width:32, height:32, borderRadius:"50%", background:"var(--panel2)", border:"1px solid var(--line)", cursor:"pointer", fontSize:16, color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
          <span style={{ fontSize:13, color:"var(--muted)", minWidth:60, textAlign:"center" }}>duración</span>
          <button onClick={() => changeDuration(15)} style={{ width:32, height:32, borderRadius:"50%", background:"var(--panel2)", border:"1px solid var(--line)", cursor:"pointer", fontSize:16, color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
        </div>
      )}

      {/* Controls */}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={toggle}
          style={{ padding:"10px 28px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:800, fontSize:15,
            background: done ? "var(--green)" : running ? "#ef4444" : "var(--green)", color:"#fff" }}>
          {done ? "Repetir" : running ? "Pausar" : "Iniciar"}
        </button>
        {(running || remaining < duration) && !done && (
          <button onClick={reset} style={{ padding:"10px 18px", borderRadius:14, border:"1px solid var(--line)", background:"var(--panel2)", cursor:"pointer", color:"var(--muted)", fontSize:14 }}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
