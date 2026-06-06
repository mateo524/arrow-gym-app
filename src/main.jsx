import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}

function hasActiveWorkout() {
  try {
    const raw = localStorage.getItem("arrow-gym-v4");
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
