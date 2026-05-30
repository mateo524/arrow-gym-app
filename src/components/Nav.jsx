import { useEffect } from "react";
import useStore from "../store/useStore.js";

const MAIN_TABS = [
  { id: "home", label: "Inicio", icon: "⚡" },
  { id: "start", label: "Start", icon: "▶" },
  { id: "coach", label: "Coach", icon: "🧠" },
  { id: "progress", label: "Progreso", icon: "📈" },
];

const MORE_TABS = [
  { id: "routines", label: "Rutinas", icon: "📋" },
  { id: "bodyMetrics", label: "Mediciones", icon: "📏" },
  { id: "exercises", label: "Ejercicios", icon: "+" },
  { id: "history", label: "Historial", icon: "☰" },
  { id: "map", label: "Mapa", icon: "◈" },
  { id: "sync", label: "Sync", icon: "☁" },
];

const HIDE_NAV_PAGES = ["workout", "workoutDetail"];

export default function Nav() {
  const currentPage = useStore((state) => state.currentPage);
  const setPage = useStore((state) => state.setPage);
  const showMoreMenu = useStore((state) => state.showMoreMenu);
  const toggleMoreMenu = useStore((state) => state.toggleMoreMenu);

  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e) => { if (e.key === "Escape") toggleMoreMenu(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showMoreMenu, toggleMoreMenu]);

  if (HIDE_NAV_PAGES.includes(currentPage)) return null;

  return (
    <>
      {showMoreMenu && (
        <div className="more-overlay" onClick={toggleMoreMenu} role="dialog" aria-modal="true" aria-label="Más opciones">
          <div className="more-menu" onClick={(e) => e.stopPropagation()}>
            <p className="more-menu-title" id="more-menu-title">Más opciones</p>
            <div role="tablist" aria-labelledby="more-menu-title">
              {MORE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`more-item ${currentPage === tab.id ? "active" : ""}`}
                  onClick={() => setPage(tab.id)}
                  role="tab"
                  aria-selected={currentPage === tab.id}
                  aria-label={tab.label}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <button className="ghost full" onClick={toggleMoreMenu}>Cerrar</button>
            {window.arrowGymInstall && (
              <button className="secondary full" style={{ marginTop: 8 }} onClick={async () => { const r = await window.arrowGymInstall(); if (r === "accepted") toggleMoreMenu(); }}>
                📲 Instalar app
              </button>
            )}
            {typeof window.arrowGymInstall === "function" && (
              <button className="secondary full" style={{ marginTop: 8 }} onClick={async () => { const r = await window.arrowGymInstall(); if (r === "accepted") toggleMoreMenu(); }}>
                📲 Instalar app
              </button>
            )}
          </div>
        </div>
      )}
      <nav className="bottom-nav" role="tablist" aria-label="Navegación principal">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${currentPage === tab.id ? "active" : ""}`}
            onClick={() => setPage(tab.id)}
            type="button"
            role="tab"
            aria-selected={currentPage === tab.id}
            aria-label={tab.label}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <small>{tab.label}</small>
          </button>
        ))}
        <button
          className={`nav-item ${showMoreMenu || MORE_TABS.some((t) => t.id === currentPage) ? "active" : ""}`}
          onClick={toggleMoreMenu}
          type="button"
          role="tab"
          aria-selected={showMoreMenu || MORE_TABS.some((t) => t.id === currentPage)}
          aria-label="Más opciones"
        >
          <span aria-hidden="true">+</span>
          <small>Más</small>
        </button>
      </nav>
    </>
  );
}
