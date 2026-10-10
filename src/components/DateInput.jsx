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

export default function DateInput({ value, onChange, inputStyle, ariaLabel = "Fecha", autoComplete }) {
  const [parts, setParts] = useState(() => parse(value));
  const dayRef = useRef(null);
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

  // Backspace en una casilla vacía vuelve a la anterior
  function onKeyDown(e, prevRef, current) {
    if (e.key === "Backspace" && !parts[current] && prevRef?.current) {
      e.preventDefault();
      prevRef.current.focus();
    }
  }

  const complete = parts.d && parts.m && parts.y.length === 4;
  const invalid = Boolean(complete && !toIso(parts));
  const base = { textAlign: "center", boxSizing: "border-box", ...inputStyle, width: undefined, fontSize: 16 };
  const err = invalid ? { borderColor: "var(--danger, #ef4444)" } : null;
  const ac = (part) => (autoComplete === "bday" ? `bday-${part}` : "off");
  return (
    <div>
      <div role="group" aria-label={ariaLabel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input ref={dayRef} inputMode="numeric" aria-label="Día" aria-invalid={invalid} autoComplete={ac("day")} placeholder="DD" maxLength={2} value={parts.d}
          onChange={(e) => update("d", e.target.value, 2, monthRef)} style={{ ...base, ...err, width: 56 }} />
        <span style={{ color: "var(--muted)" }} aria-hidden="true">/</span>
        <input ref={monthRef} inputMode="numeric" aria-label="Mes" aria-invalid={invalid} autoComplete={ac("month")} placeholder="MM" maxLength={2} value={parts.m}
          onKeyDown={(e) => onKeyDown(e, dayRef, "m")}
          onChange={(e) => update("m", e.target.value, 2, yearRef)} style={{ ...base, ...err, width: 56 }} />
        <span style={{ color: "var(--muted)" }} aria-hidden="true">/</span>
        <input ref={yearRef} inputMode="numeric" aria-label="Año" aria-invalid={invalid} autoComplete={ac("year")} placeholder="AAAA" maxLength={4} value={parts.y}
          onKeyDown={(e) => onKeyDown(e, monthRef, "y")}
          onChange={(e) => update("y", e.target.value, 4, null)} style={{ ...base, ...err, width: 78 }} />
      </div>
      {invalid && (
        <div role="alert" style={{ color: "var(--danger, #ef4444)", fontSize: 12, marginTop: 4 }}>
          Esa fecha no existe. Revisá el día y el mes.
        </div>
      )}
    </div>
  );
}
