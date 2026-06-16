import useStore from "../store/useStore.js";
import Icon from "./Icon.jsx";

const BASE_TABS = [
  { id: "home", label: "Inicio", icon: "Home" },
  { id: "start", label: "Start", icon: "Play", badgeKey: "activeWorkout" },
  { id: "coach", label: "Coach", icon: "BrainCircuit", badgeKey: "coachBadge" },
  { id: "map", label: "Mapa", icon: "Map" },
  { id: "history", label: "Historial", icon: "Clock" },
];

export default function Nav({ role }) {
  const currentPage = useStore((s) => s.currentPage);
  const setPage = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const coachBadge = useStore((s) => s.coachBadge);
  const badges = { activeWorkout: !!activeWorkout, coachBadge };

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {BASE_TABS.map((tab) => {
        const showBadge = tab.badgeKey ? badges[tab.badgeKey] : false;
        return (
          <button
            key={tab.id}
            className={`nav-item${currentPage === tab.id ? " active" : ""}`}
            onClick={() => setPage(tab.id)}
            type="button"
            aria-label={tab.label}
            aria-current={currentPage === tab.id ? "page" : undefined}
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
