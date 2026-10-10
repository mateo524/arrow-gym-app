import { supabase } from "./supabase.js";
import { track } from "./telemetry.js";
import { enqueue, flush, items, ownerOf } from "./offlineQueue.js";
import { getAuthUserId } from "./authBridge.js";

// Race a Supabase promise against a hard timeout so that dead-WiFi situations
// (navigator.onLine returns true but there is no real connectivity) don't leave
// the SyncChip stuck in "saving" forever.
const withTimeout = (promise, ms = 8000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([promise, timeout]);
};

const ROW_FIELDS = (w, userId) => ({
  id: w.id,
  user_id: userId,
  type: w.type,
  date: w.date,
  sets: w.sets,
  duration_min: w.durationMin ?? null,
  notes: w.notes ?? null,
  mood: w.mood ?? null,
  // created_at intentionally omitted: DB default sets it once; updated_at is a trigger.
});

// Single processor shared by every flush path (syncWorkoutUp, online handler, background sync).
export async function processItem(item) {
  // Item from another account (A -> B switch): discard it instead of throwing,
  // so it can't be uploaded under the wrong session nor block the queue.
  const uid = getAuthUserId();
  const owner = ownerOf(item);
  if (uid && owner && owner !== uid) return;
  if (item.type === "upsert_workout") {
    const { error } = await withTimeout(supabase.from("user_workouts").upsert(item.row));
    if (error) throw error;
  } else if (item.type === "delete_workout") {
    const { error } = await withTimeout(
      supabase.from("user_workouts").update({ deleted_at: item.deleted_at }).eq("id", item.id).eq("user_id", item.userId)
    );
    if (error) throw error;
  } else {
    // Unknown type: throw so the queue keeps it (never discard silently).
    throw new Error(`tipo no reconocido: ${item.type}`);
  }
}

export function flushPending({ force = false } = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return Promise.resolve(0);
  return flush(processItem, { force });
}

// Upload a completed workout: always persisted in the queue first (keyed by id,
// last write wins), then flushed in order.
export async function syncWorkoutUp(workout, userId) {
  if (!userId || !workout?.id) return;
  enqueue({ type: "upsert_workout", id: workout.id, key: `workout:${workout.id}`, row: ROW_FIELDS(workout, userId) });
  await flushPending();
}

// Soft-delete a workout remotely (queued if offline).
export async function syncWorkoutDelete(id, userId) {
  if (!userId || !id) return;
  enqueue({ type: "delete_workout", id, userId, key: `workout:${id}`, deleted_at: new Date().toISOString() });
  await flushPending();
}

const PAGE_SIZE = 500;

// Pull all workouts for a user from Supabase.
// Paginates through all pages so users with more than 500 workouts don't
// silently lose their older history on the next merge.
// Returns an array sorted newest-first.
export async function fetchWorkoutsFromDB(userId) {
  if (!userId) return [];
  try {
    let allRows = [];
    let from = 0;
    while (true) {
      const { data, error } = await withTimeout(
        supabase
          .from("user_workouts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(from, from + PAGE_SIZE - 1)
      );
      if (error) { console.warn("[workoutSync] fetch falló:", error.message); return []; }
      allRows = [...allRows, ...(data || [])];
      if (!data || data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
    return allRows.map((row) => ({
      id: row.id,
      type: row.type,
      date: row.date,
      sets: row.sets || [],
      durationMin: row.duration_min ?? null,
      notes: row.notes ?? null,
      mood: row.mood ?? null,
      updated_at: row.updated_at ?? null,
      deleted_at: row.deleted_at ?? null,
      created_at: row.created_at ?? null,
    }));
  } catch (e) {
    console.warn("[workoutSync] fetch falló:", e?.message || e);
    return [];
  }
}

// Bulk-upsert all workouts for a user to Supabase.
// Used for the initial sync when the DB is empty but localStorage has data.
export async function syncAllWorkoutsUp(workouts, userId) {
  if (!userId || !workouts?.length) return;
  try {
    // Never upload seed/demo workouts — they have no place in a real user's DB
    const real = workouts.filter(w => !w.isSeed);
    if (!real.length) return;
    const rows = real.map((w) => ROW_FIELDS(w, userId));
    const { error } = await withTimeout(supabase.from("user_workouts").upsert(rows));
    if (error) throw error;
  } catch (e) {
    console.warn("[workoutSync] syncAllWorkoutsUp falló:", e?.message || e);
    try { track("sync_all_workouts_failed", { error: String(e?.message || e) }); } catch {}
  }
}

// Merge local workouts (from localStorage) with remote ones (from DB).
// Deduplicates by id. When the same id appears in both, the version with
// the more recent updated_at / created_at timestamp wins — this prevents
// local from always overwriting a remote edit made on another device.
export function mergeWorkouts(local, remote) {
  const map = new Map();
  // Ids with a delete still queued must not be resurrected by a stale remote row.
  const queued = items();
  const pendingDeletes = new Set(queued.filter((i) => i.type === "delete_workout").map((i) => i.id));
  // Local edits whose upsert hasn't reached the DB yet: the remote copy is stale by definition.
  const pendingUpserts = new Set(queued.filter((i) => i.type === "upsert_workout").map((i) => i.id));
  // Seed with local entries (have full transient fields)
  for (const w of local) map.set(w.id, w);
  // Remote: prefer whichever copy was updated most recently
  for (const w of remote) {
    if (pendingUpserts.has(w.id) && map.has(w.id)) continue;
    if (w.deleted_at || pendingDeletes.has(w.id)) { map.delete(w.id); continue; }
    if (map.has(w.id)) {
      const local = map.get(w.id);
      const remoteTs = new Date(w.updated_at || w.created_at || w.date || 0).getTime();
      const localTs  = new Date(local.updated_at || local.created_at || local.date || 0).getTime();
      if (remoteTs > localTs) map.set(w.id, w);
    } else {
      map.set(w.id, w);
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    String(b.date || "").localeCompare(String(a.date || ""))
  );
}
