import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {});
    try { caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.includes("arrow-gym")).map((k) => caches.delete(k)))).catch(() => {}); } catch (e) {}
  });
}

createRoot(document.getElementById("root")).render(<App />);
