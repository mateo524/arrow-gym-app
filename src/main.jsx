import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js?v=5", { updateViaCache: "none" }).catch(() => {});
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== "arrow-gym-v5").map((k) => caches.delete(k)))).catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(<App />);
