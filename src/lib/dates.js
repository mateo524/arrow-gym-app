export function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dateToLocal(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isoToLocalDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Fechas para mostrar: siempre DÍA primero, después MES (y año).
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})/;

export function formatDMY(iso) {
  const m = ISO_RE.exec(String(iso || ""));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso || "");
}

export function formatDM(iso) {
  const m = ISO_RE.exec(String(iso || ""));
  return m ? `${m[3]}/${m[2]}` : (iso || "");
}
