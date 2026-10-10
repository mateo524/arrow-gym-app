// Récord de peso: la serie supera tu mejor peso histórico en el ejercicio y también
// el de las series anteriores de esta sesión (igual o menor no es récord).
// Tolera strings, vacíos, null y 0.
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function isNewPR(weight, historicalBest = 0, previousSetsWeights = []) {
  const w = toNum(weight);
  if (w <= 0) return false;
  const best = Math.max(toNum(historicalBest), ...(previousSetsWeights || []).map(toNum));
  return w > best;
}
