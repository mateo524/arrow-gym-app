import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// Si un chunk lazy falla al cargar (SW desactualizado, cache rota), recarga una vez.
// Evita el "pantalla negra" en esos casos usando sessionStorage para no entrar en loop.
window.addEventListener('unhandledrejection', (e) => {
  const msg = String(e.reason?.message || '');
  const isChunkFail =
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Unable to preload CSS') ||
    e.reason?.name === 'ChunkLoadError';
  if (isChunkFail && !sessionStorage.getItem('_chunk_reload')) {
    sessionStorage.setItem('_chunk_reload', '1');
    window.location.reload();
  }
});

function hasActiveWorkout() {
  try {
    const raw = localStorage.getItem("loop-gym-v4");
    if (!raw) return false;
    const state = JSON.parse(raw);
    return !!state?.state?.activeWorkout;
  } catch { return false; }
}

window.addEventListener("beforeunload", (e) => {
  if (!hasActiveWorkout()) return;
  e.preventDefault();
  e.returnValue = "";
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && hasActiveWorkout()) {
    try {
      navigator.vibrate?.([100, 50, 100]);
    } catch {}
  }
});

createRoot(document.getElementById("root")).render(<App />);
