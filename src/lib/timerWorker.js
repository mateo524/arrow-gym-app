// Web Worker for background rest timer — survives app switching on mobile
let interval = null;
let remaining = 0;

self.onmessage = (e) => {
  const { type, seconds } = e.data;
  if (type === "start") {
    remaining = seconds;
    clearInterval(interval);
    interval = setInterval(() => {
      remaining--;
      self.postMessage({ type: "tick", remaining });
      if (remaining <= 0) {
        clearInterval(interval);
        interval = null;
        self.postMessage({ type: "done" });
      }
    }, 1000);
  } else if (type === "stop") {
    clearInterval(interval);
    interval = null;
    remaining = 0;
  } else if (type === "reset") {
    clearInterval(interval);
    interval = null;
    remaining = seconds || 0;
  }
};
