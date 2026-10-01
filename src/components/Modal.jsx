import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal accesible reutilizable.
 * - role="dialog", aria-modal, aria-labelledby (usar `titleId` en el título) o `ariaLabel`
 * - Escape cierra, foco inicial dentro, Tab atrapado, foco devuelto al disparador al cerrar.
 */
export default function Modal({ onClose, titleId, ariaLabel, className = "modal-card", style, children }) {
  const cardRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    const card = cardRef.current;
    const first = card?.querySelector(FOCUSABLE);
    (first || card)?.focus();

    function onKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !card) return;
      const items = [...card.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) { e.preventDefault(); return; }
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === card)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous && typeof previous.focus === "function" && document.contains(previous)) previous.focus();
    };
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeRef.current?.(); }}>
      <div
        ref={cardRef}
        className={className}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={titleId ? undefined : ariaLabel}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
