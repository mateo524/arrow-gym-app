import { useState, useEffect, useRef } from "react";

// Campo de fecha siempre en orden DÍA / MES / AÑO (el <input type="date"> del navegador
// usa el idioma del navegador y en muchos casos muestra mes/día/año).
// value y onChange usan formato ISO (AAAA-MM-DD), igual que antes.

function parse(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  return m ? { d: m[3], m: m[2], y: m[1] } : { d: "", m: "", y: "" };
}

function toIso({ d, m, y }) {
  if (!d || !m || y.length !== 4) return "";
  const dd = Number(d), mm = Number(m), yy = Number(y);
  if (mm < 1 || mm > 12 || dd < 1 || yy < 1900) return "";
  const daysInMonth = new Date(yy, mm, 0).getDate();
  if (dd > daysInMonth) return "";
  return `${y}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export default function DateInput({ value, onChange, inputStyle, ariaLabel = "Fecha" }) {
  const [parts, setParts] = useState(() => parse(value));
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  // Si el valor cambia desde afuera (por ejemplo al abrir el formulario), se refleja acá
  useEffect(() => {
    if (value && toIso(parts) !== value) setParts(parse(value));
    if (!value && toIso(parts)) setParts({ d: "", m: "", y: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function update(key, raw, max, nextRef) {
    const digits = raw.replace(/\D/g, "").slice(0, max);
    const next = { ...parts, [key]: digits };
    setParts(next);
    onChange?.(toIso(next));
    if (digits.length === max && nextRef?.current) nextRef.current.focus();
  }

  const base = { textAlign: "center", boxSizing: "border-box", ...inputStyle, width: undefined };
  return (
    <div role="group" aria-label={ariaLabel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input inputMode="numeric" aria-label="Día" placeholder="DD" maxLength={2} value={parts.d}
        onChange={(e) => update("d", e.target.value, 2, monthRef)} style={{ ...base, width: 56 }} />
      <span style={{ color: "var(--muted)" }}>/</span>
      <input ref={monthRef} inputMode="numeric" aria-label="Mes" placeholder="MM" maxLength={2} value={parts.m}
        onChange={(e) => update("m", e.target.value, 2, yearRef)} style={{ ...base, width: 56 }} />
      <span style={{ color: "var(--muted)" }}>/</span>
      <input ref={yearRef} inputMode="numeric" aria-label="Año" placeholder="AAAA" maxLength={4} value={parts.y}
        onChange={(e) => update("y", e.target.value, 4, null)} style={{ ...base, width: 78 }} />
    </div>
  );
}
