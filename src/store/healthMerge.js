// Pure helpers to merge health data between devices without resurrecting
// deleted entries. Deletions are recorded as tombstones { "<key>": deletedAtMs }
// per collection; entries carry an optional `updatedAt` (ms).

export const TOMBSTONE_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
export const LOG_LIMIT = 90;

export function entryKey(x) {
  if (x?.id != null) return `id:${x.id}`;
  if (x?.date != null) return `date:${x.date}`;
  return null;
}

export function addTombstone(tombs, key, now = Date.now()) {
  if (!key) return tombs || {};
  return { ...(tombs || {}), [key]: now };
}

// Union of two tombstone maps (max timestamp per key), dropping very old ones.
export function mergeTombstones(a = {}, b = {}, now = Date.now()) {
  const out = {};
  for (const src of [a || {}, b || {}]) {
    for (const [k, ts] of Object.entries(src)) {
      const n = Number(ts) || 0;
      if (now - n > TOMBSTONE_MAX_AGE_MS) continue;
      if (!(k in out) || n > out[k]) out[k] = n;
    }
  }
  return out;
}

export function mergeAllTombstones(local = {}, remote = {}, now = Date.now()) {
  const out = {};
  for (const c of new Set([...Object.keys(local || {}), ...Object.keys(remote || {})])) {
    out[c] = mergeTombstones(local?.[c], remote?.[c], now);
  }
  return out;
}

// Union by key. On conflict the newer `updatedAt` wins (local wins ties and legacy
// entries without timestamps). Entries covered by a tombstone at least as recent
// as the entry are dropped. `sortByDate` + `limit` apply after the union.
export function mergeCollection(local, remote, tombs = {}, { limit, sortByDate = false } = {}) {
  const map = new Map();
  const keyless = [];
  for (const x of local || []) {
    const k = entryKey(x);
    if (k) map.set(k, x); else keyless.push(x);
  }
  for (const x of remote || []) {
    const k = entryKey(x);
    if (!k) { keyless.push(x); continue; }
    const ex = map.get(k);
    if (!ex || (Number(x.updatedAt) || 0) > (Number(ex.updatedAt) || 0)) map.set(k, x);
  }
  let out = [...map.entries()]
    .filter(([k, x]) => !((Number(tombs?.[k]) || 0) >= (Number(x.updatedAt) || 0) && tombs?.[k] != null))
    .map(([, x]) => x);
  out = [...out, ...keyless];
  if (sortByDate) out.sort((a, b) => String(b?.date || "").localeCompare(String(a?.date || "")));
  return limit ? out.slice(0, limit) : out;
}

// Scalar groups (nutritionPlan, competition...) carry a timestamp: the newer side
// wins, INCLUDING a cleared (null) value. Local wins ties. Legacy (both ts = 0):
// local value if set, else remote.
export function mergeScalar(localVal, localTs, remoteVal, remoteTs) {
  const lt = Number(localTs) || 0;
  const rt = Number(remoteTs) || 0;
  if (lt === 0 && rt === 0) return { value: localVal ?? remoteVal ?? null, ts: 0 };
  return lt >= rt ? { value: localVal ?? null, ts: lt } : { value: remoteVal ?? null, ts: rt };
}

// Collections that support deletion (tombstones) and how they merge.
const COLLECTION_OPTS = {
  weightLog: { sortByDate: true, limit: LOG_LIMIT },
  sleepLog: { sortByDate: true, limit: LOG_LIMIT },
  waterLog: { sortByDate: true, limit: LOG_LIMIT },
  restDays: { sortByDate: true, limit: LOG_LIMIT },
  mealLog: { sortByDate: true },
  cardioHistory: { sortByDate: true },
  savedMealCombos: {},
  activeChallenges: {},
  progressPhotos: {},
};
const REMOTE_FIELD = {
  weightLog: "weight_log", sleepLog: "sleep_log", waterLog: "water_log", restDays: "rest_days",
  mealLog: "meal_log", cardioHistory: "cardio_history", savedMealCombos: "saved_meal_combos",
  activeChallenges: "active_challenges", progressPhotos: "progress_photos",
};

// Pure: merge the local health state with a remote health_data blob. Returns the
// partial state to `set`. Deleted entries (tombstones) and cleared scalar groups
// (nutritionPlan / competition) do not come back from the other device.
export function mergeHealthData(local, hd, now = Date.now()) {
  const tombs = mergeAllTombstones(local?.healthTombstones, hd?.tombstones, now);
  const out = { healthTombstones: tombs };
  for (const [name, opts] of Object.entries(COLLECTION_OPTS)) {
    out[name] = mergeCollection(local?.[name], hd?.[REMOTE_FIELD[name]], tombs[name], opts);
  }
  const plan = mergeScalar(local?.nutritionPlan, local?.nutritionPlanUpdatedAt, hd?.nutrition_plan, hd?.nutrition_plan_updated_at);
  out.nutritionPlan = plan.value;
  out.nutritionPlanUpdatedAt = plan.ts;
  const lc = local?.competitionDate ? { date: local.competitionDate, name: local.competitionName || "" } : null;
  const rc = hd?.competition_date ? { date: hd.competition_date, name: hd.competition_name || "" } : null;
  const comp = mergeScalar(lc, local?.competitionUpdatedAt, rc, hd?.competition_updated_at);
  out.competitionDate = comp.value?.date ?? null;
  out.competitionName = comp.value?.name ?? "";
  out.competitionUpdatedAt = comp.ts;
  return out;
}
