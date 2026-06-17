import { useState } from "react";
import useStore from "../store/useStore.js";
import Icon from "./Icon.jsx";

const MAIN_TABS = [
  { id:"home",    label:"Inicio",   icon:"Home" },
  { id:"start",   label:"Start",    icon:"Play",        badgeKey:"activeWorkout" },
  { id:"coach",   label:"Coach",    icon:"BrainCircuit", badgeKey:"coachBadge" },
  { id:"prs",     label:"Progreso", icon:"TrendingUp" },
];

const MORE_ITEMS = [
  { id:"history",   label:"Historial",  icon:"Clock" },
  { id:"exercises", label:"Ejercicios", icon:"Dumbbell" },
  { id:"profile",   label:"Mediciones", icon:"Activity" },
  { id:"prs",       label:"Récords",    icon:"Trophy" },
  { id:"start",     label:"Rutinas",    icon:"List" },
];

export default function Nav({ role }) {
  const currentPage = useStore((s) => s.currentPage);
  const setPage = useStore((s) => s.setPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const coachBadge = useStore((s) => s.coachBadge);
  const [showMore, setShowMore] = useState(false);

  const badges = { activeWorkout: !!activeWorkout, coachBadge };

  const tabs = MAIN_TABS.map((tab) => {
    if (tab.id === "start" && activeWorkout) {
      return { id:"workout", label:"Entrenando", icon:"Zap", pulse:true };
    }
    return tab;
  });

  function handleTabClick(id) {
    setShowMore(false);
    setPage(id);
  }

  return (
    <>
      {showMore && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:90 }}
          onClick={() => setShowMore(false)}
        />
      )}

      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        background:"var(--bg-2, #0f1e24)",
        borderRadius:"20px 20px 0 0",
        padding:"20px 20px calc(env(safe-area-inset-bottom, 0px) + 76px)",
        zIndex:91,
        transform: showMore ? "translateY(0)" : "translateY(100%)",
        transition:"transform 0.25s cubic-bezier(0.32,0.72,0,1)",
        boxShadow:"0 -4px 24px rgba(0,0,0,.4)",
      }}>
        <div style={{ width:40, height:4, background:"var(--line)", borderRadius:4, margin:"0 auto 20px" }} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
          {MORE_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleTabClick(item.id)}
              style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                padding:"12px 4px", background:"var(--panel)", borderRadius:14,
                border:"1px solid var(--line)", cursor:"pointer",
                color: currentPage === item.id ? "var(--green)" : "var(--muted)",
              }}
            >
              <Icon name={item.icon} size={22} strokeWidth={1.8} />
              <span style={{ fontSize:10, fontWeight:600, textAlign:"center", lineHeight:1.2 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((tab) => {
          const showBadge = tab.badgeKey ? badges[tab.badgeKey] : false;
          const isActive = currentPage === tab.id || (tab.id === "workout" && currentPage === "workout");
          return (
            <button
              key={tab.id}
              className={`nav-item${isActive ? " active" : ""}${tab.pulse ? " nav-item-workout" : ""}`}
              onClick={() => handleTabClick(tab.id)}
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

        <button
          className={`nav-item${showMore ? " active" : ""}`}
          onClick={() => setShowMore((v) => !v)}
          type="button"
          aria-label="Más opciones"
        >
          <span className="nav-icon-wrap">
            <Icon name={showMore ? "X" : "Plus"} aria-hidden="true" />
          </span>
          <small>Más</small>
        </button>
      </nav>
    </>
  );
}
