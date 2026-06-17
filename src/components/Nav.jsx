import useStore from "../store/useStore.js";
import Icon from "./Icon.jsx";

const BASE_TABS = [
  { id: "home", label: "Inicio", icon: "Home" },
  { id: "start", label: "Start", icon: "Play", badgeKey: "activeWorkout" },
  { id: "coach", label: "Análisis", icon: "BrainCircuit", badgeKey: "coachBadge" },
  { id: "map", label: "Mapa", icon: "Map" },
  { id: "history", label: "Historial", icon: "Clock" },
];

export default function Nav({ role }) {
  const currentPage = useStore((s) => s.currentPage);
  const setPage = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const coachBadge = useStore((s) => s.coachBadge);
  const badges = { activeWorkout: !!activeWorkout, coachBadge };

  const tabs = BASE_TABS.map((tab) => {
    if (tab.id === "start" && activeWorkout) {
      return { id: "workout", label: "Entrenando", icon: "Zap", pulse: true };
    }
    return tab;
  });

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => {
        const showBadge = tab.badgeKey ? badges[tab.badgeKey] : false;
        const isActive = currentPage === tab.id || (tab.id === "workout" && currentPage === "workout");
        return (
          <button
            key={tab.id}
            className={`nav-item${isActive ? " active" : ""}${tab.pulse ? " nav-item-workout" : ""}`}
            onClick={() => setPage(tab.id)}
            type="button"
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-icon-wrap">
              <Icon name={tab.icon} aria-hidden="true" />
              {showBadge && <span className="nav-badge" aria-label="Notification" />}
            </span>
            <small>{tab.label}</small>
          </button>
        );
      })}
    </nav>
  );
}
