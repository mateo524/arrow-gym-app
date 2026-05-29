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
        <div className="more-overlay" onClick={toggleMoreMenu}>
          <div className="more-menu" onClick={(e) => e.stopPropagation()}>
            <p className="more-menu-title">Más opciones</p>
            {MORE_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`more-item ${currentPage === tab.id ? "active" : ""}`}
                onClick={() => setPage(tab.id)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
            <button className="ghost full" onClick={toggleMoreMenu}>Cerrar</button>
          </div>
        </div>
      )}
      <nav className="bottom-nav">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${currentPage === tab.id ? "active" : ""}`}
            onClick={() => setPage(tab.id)}
            type="button"
            aria-label={tab.label}
          >
            <span>{tab.icon}</span>
            <small>{tab.label}</small>
          </button>
        ))}
        <button
          className={`nav-item ${showMoreMenu || MORE_TABS.some((t) => t.id === currentPage) ? "active" : ""}`}
          onClick={toggleMoreMenu}
          type="button"
          aria-label="Más"
        >
          <span>+</span>
          <small>Más</small>
        </button>
      </nav>
    </>
  );
}
