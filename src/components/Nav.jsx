import { useState, useEffect } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import Icon from "./Icon.jsx";

const USER_TABS = [
  { id: "home",      label: "Inicio",    icon: "Home" },
  { id: "start",     label: "Entreno",   icon: "Dumbbell", badgeKey: "activeWorkout" },
  { id: "coach",     label: "Coach",     icon: "BrainCircuit", badgeKey: "coachBadge" },
  { id: "nutrition", label: "Comidas", icon: "Apple" },
  { id: "profile",   label: "Perfil",    icon: "User" },
];

// Prefetch de chunks lazy (mismos módulos que App.jsx; el navegador los cachea)
const PREFETCH = {
  start:     () => import("../pages/StartWorkoutPage.jsx"),
  coach:     () => import("../pages/CoachPage.jsx"),
  nutrition: () => import("../pages/NutritionPage.jsx"),
  profile:   () => import("../pages/ProfilePage.jsx"),
  trainer:   () => import("../pages/TrainerPage.jsx"),
  admin:     () => import("../pages/AdminPage.jsx"),
};
const prefetched = new Set();
function prefetchPage(id) {
  const loader = PREFETCH[id];
  if (!loader || prefetched.has(id)) return;
  prefetched.add(id);
  loader().catch(() => prefetched.delete(id));
}

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
    // Fetch once on mount and then every 5 minutes — not on every navigation
    const fetch = () => {
      supabase.from("notifications").select("id", { count: "exact" })
        .eq("user_id", profile.id).eq("read", false)
        .then(({ count }) => setNotifCount(count || 0))
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [profile?.id]);

  const badges = { activeWorkout: !!activeWorkout, coachBadge, notifBadge: notifCount > 0 };

  // Build tabs based on role
  let tabs = USER_TABS.map((tab) => {
    if (tab.id === "start" && activeWorkout) {
      return { id: "workout", label: "Entrenando", icon: "Zap", pulse: true };
    }
    return tab;
  });

  if (role === "trainer") tabs = [...tabs, TRAINER_EXTRA];
  if (role === "admin" || role === "superadmin")   tabs = [...tabs, ADMIN_EXTRA];

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {tabs.map((tab) => {
        const showBadge = tab.badgeKey ? badges[tab.badgeKey] : false;
        const isActive  = currentPage === tab.id || (tab.id === "workout" && currentPage === "workout");
        return (
          <button
            key={tab.id}
            className={`nav-item${isActive ? " active" : ""}${tab.pulse ? " nav-item-workout" : ""}`}
            onClick={() => setPage(tab.id)}
            onPointerEnter={() => prefetchPage(tab.id)}
            onTouchStart={() => prefetchPage(tab.id)}
            onFocus={() => prefetchPage(tab.id)}
            type="button"
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-icon-wrap">
              <Icon name={tab.icon} aria-hidden="true" />
              {showBadge && <span className="nav-badge" role="img" aria-label={tab.badgeKey === "notifBadge" ? "Notificaciones sin leer" : tab.badgeKey === "coachBadge" ? "Novedades del coach" : "Entrenamiento en curso"} />}
            </span>
            <small>{tab.label}</small>
          </button>
        );
      })}
    </nav>
  );
}

