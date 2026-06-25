import { useState, useEffect } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import Icon from "./Icon.jsx";

const USER_TABS = [
  { id: "home",    label: "Inicio",    icon: "Home" },
  { id: "start",   label: "Entreno",   icon: "Dumbbell", badgeKey: "activeWorkout" },
  { id: "coach",   label: "Coach",     icon: "BrainCircuit", badgeKey: "coachBadge" },
  { id: "history",      label: "Historial",  icon: "Clock" },
  { id: "profile", label: "Perfil",    icon: "User" },
];

const TRAINER_EXTRA = { id: "trainer", label: "Alumnos", icon: "Users" };
const ADMIN_EXTRA   = { id: "admin",   label: "Admin",   icon: "ShieldCheck" };

export default function Nav({ role }) {
  const currentPage = useStore((s) => s.currentPage);
  const setPage     = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const coachBadge    = useStore((s) => s.coachBadge);
  const { profile } = useAuthStore();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;
    supabase.from("notifications").select("id", { count: "exact" })
      .eq("user_id", profile.id).eq("read", false)
      .then(({ count }) => setNotifCount(count || 0))
      .catch(() => {});
  }, [profile?.id, currentPage]);

  const badges = { activeWorkout: !!activeWorkout, coachBadge, notifBadge: notifCount > 0 };

  // Build tabs based on role
  let tabs = USER_TABS.map((tab) => {
    if (tab.id === "start" && activeWorkout) {
      return { id: "workout", label: "Entrenando", icon: "Zap", pulse: true };
    }
    return tab;
  });

  if (role === "trainer") tabs = [...tabs, TRAINER_EXTRA];
  if (role === "admin")   tabs = [...tabs, ADMIN_EXTRA];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => {
        const showBadge = tab.badgeKey ? badges[tab.badgeKey] : false;
        const isActive  = currentPage === tab.id || (tab.id === "workout" && currentPage === "workout");
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

