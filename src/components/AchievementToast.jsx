import { useEffect } from "react";

const styles = `
@keyframes slideUpFade {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes shrink {
  from { width: 100%; }
  to   { width: 0%; }
}
`;

export default function AchievementToast({ achievement, onClose }) {
  const { icon, title, desc } = achievement;

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <style>{styles}</style>
      <div
        role="alert"
        aria-live="assertive"
        style={{
          position: "fixed",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          minWidth: "320px",
          maxWidth: "420px",
          width: "90vw",
          background: "#1a1a1a",
          borderLeft: "4px solid #22c55e",
          borderRadius: "10px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(34,197,94,0.15)",
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          padding: "16px 16px 14px 18px",
          animation: "slideUpFade 0.4s cubic-bezier(0.22,1,0.36,1) both",
          overflow: "hidden",
        }}
      >
        {/* Icon */}
        <span
          aria-hidden="true"
          style={{
            fontSize: "2.4rem",
            lineHeight: 1,
            flexShrink: 0,
            filter: "drop-shadow(0 0 8px rgba(34,197,94,0.5))",
            marginTop: "2px",
          }}
        >
          {icon}
        </span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#22c55e",
              marginBottom: "3px",
            }}
          >
            Achievement Unlocked
          </div>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#f5f5f5",
              marginBottom: "3px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              color: "#a3a3a3",
              lineHeight: 1.4,
            }}
          >
            {desc}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Dismiss achievement notification"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#737373",
            fontSize: "1.1rem",
            lineHeight: 1,
            padding: "2px 4px",
            borderRadius: "4px",
            flexShrink: 0,
            marginTop: "1px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f5f5")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#737373")}
        >
          &#x2715;
        </button>

        {/* Auto-dismiss progress bar */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "3px",
            background: "#22c55e",
            borderRadius: "0 0 0 10px",
            animation: "shrink 4s linear forwards",
            opacity: 0.7,
          }}
        />
      </div>
    </>
  );
}
