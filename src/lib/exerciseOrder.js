// Orden de ejercicios que elige la persona: se guarda por rutina y se respeta en cada entrenamiento nuevo
// de esa rutina, hasta que lo vuelva a cambiar.

const nameOf = (ex) => (typeof ex === "string" ? ex : (ex?.name ?? ex?.exercise ?? ""));
const key = (s) => String(s || "").trim().toLowerCase();

/** Ordena `exercises` según `savedOrder` (lista de nombres). Los que no están en la lista van al final, en su orden original. */
export function applySavedOrder(exercises, savedOrder) {
  if (!Array.isArray(exercises) || !Array.isArray(savedOrder) || savedOrder.length === 0) return exercises;
  const rank = new Map();
  savedOrder.forEach((n, i) => { if (!rank.has(key(n))) rank.set(key(n), i); });
  const known = [];
  const unknown = [];
  exercises.forEach((ex, i) => {
    const r = rank.get(key(nameOf(ex)));
    (r === undefined ? unknown : known).push({ ex, r, i });
  });
  known.sort((a, b) => a.r - b.r || a.i - b.i);
  return [...known.map((x) => x.ex), ...unknown.map((x) => x.ex)];
}

/** Nombres de ejercicios en el orden en que aparecen las series. */
export function orderFromSets(sets) {
  const seen = new Set();
  const order = [];
  for (const s of sets || []) {
    if (!seen.has(s.exercise)) { seen.add(s.exercise); order.push(s.exercise); }
  }
  return order;
}
