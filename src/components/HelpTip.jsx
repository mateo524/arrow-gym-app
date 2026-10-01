import { useState, useRef, useEffect } from "react";
import { GLOSSARY } from "../data/glossary.js";

/** Ícono "?" que despliega la definición de un término del glosario. */
export default function HelpTip({ term, text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const entry = GLOSSARY[term];
  const body = text || entry?.def;

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (!body) return null;
  return (
    <span className="help-tip" ref={ref}>
      <button
        type="button"
        className="help-tip-btn"
        aria-label={`¿Qué es ${entry?.name || term}?`}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >?</button>
      {open && (
        <span role="tooltip" className="help-tip-pop">
          {entry && <b>{entry.name}</b>}
          {body}
        </span>
      )}
    </span>
  );
}
