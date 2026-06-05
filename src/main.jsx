import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}

window.addEventListener("beforeunload", (e) => {
  try {
    const raw = localStorage.getItem("arrow-gym-v4");
    if (raw) {
      const state = JSON.parse(raw);
      if (state?.state?.activeWorkout) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
  } catch {}
});

createRoot(document.getElementById("root")).render(<App />);
