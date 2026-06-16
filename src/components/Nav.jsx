import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import Icon from "./Icon.jsx";

const USER_TABS = [
  { id: "home", label: "Inicio", icon: "Home" },
  { id: "start", label: "Start", icon: "Play", badgeKey: "activeWorkout" },
  { id: "coach", label: "Coach", icon: "BrainCircuit", badgeKey: "coachBadge" },
  { id: "map", label: "Mapa", icon: "Map" },
  { id: "history", label: "Historial", icon: "Clock" },
];

const TRAINER_TABS = [
  { id: "home", label: "Inicio", icon: "Home" },
  { id: "start", label: "Start", icon: "Play", badgeKey: "activeWorkout" },
  { id: "trainer", label: "Clientes", icon: "Users" },
  { id: "coach", label: "Coach", icon: "BrainCircuit", badgeKey: "coachBadge" },
  { id: "history", label: "Historial", icon: "Clock" },
];

const ADMIN_TABS = [
  { id: "home", label: "Inicio", icon: "Home" },
  { id: "start", label: "Start", icon: "Play", badgeKey: "activeWorkout" },
  { id: "trainer", label: "Clientes", icon: "Users" },
  { id: "admin", label: "Admin", icon: "ShieldCheck" },
  { id: "history", label: "Historial", icon: "Clock" },
];

function getTabsForRole(role) {
  if (role === "superadmin" || role === "admin") return ADMIN_TABS;
  if (role === "trainer") return TRAINER_TABS;
  return USER_TABS;
}

export default function Nav({ role }) {
  const currentPage = useStore((s) => s.currentPage);
  const setPage = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const coachBadge = useStore((s) => s.coachBadge);
  const logout = useAuthStore((s) => s.logout);

  const TABS = getTabsForRole(role);
  const badges = { activeWorkout: !!activeWorkout, coachBadge };

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map((tab) => {
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
      <button
        className="nav-item"
        onClick={logout}
        type="button"
        aria-label="Cerrar sesión"
      >
        <span className="nav-icon-wrap">
          <Icon name="LogOut" aria-hidden="true" />
        </span>
        <small>Salir</small>
      </button>
    </nav>
  );
}
