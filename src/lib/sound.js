let _ctx = null;

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _ctx;
}

// Keep context running: resume on any user interaction
function resumeCtx() {
  if (_ctx && _ctx.state === "suspended") {
    _ctx.resume().catch(() => {});
  }
}

if (typeof document !== "undefined") {
  ["touchstart", "touchend", "click", "keydown"].forEach(evt => {
    document.addEventListener(evt, resumeCtx, { passive: true, capture: true });
  });
}

export async function playBeep(frequency = 880, duration = 0.5) {
  try {
    const ctx = getCtx();
    // iOS suspends context when page loses focus — always resume before playing
    if (ctx.state !== "running") {
      await ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function primeAudio() {
  const ctx = getCtx();
  if (ctx.state !== "running") ctx.resume().catch(() => {});
}

export function playDone() {
  playBeep(660, 0.15);
  setTimeout(() => playBeep(880, 0.25), 200);
}
