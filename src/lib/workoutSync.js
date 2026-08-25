import { supabase } from "./supabase.js";
import { enqueue, flush } from "./offlineQueue.js";

// Race a Supabase promise against a hard timeout so that dead-WiFi situations
// (navigator.onLine returns true but there is no real connectivity) don't leave
// the SyncChip stuck in "saving" forever.
const withTimeout = (promise, ms = 8000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([promise, timeout]);
};

// Prevent parallel requests that could race each other (the older one winning
// over a newer write when the network is slow but not fully dead).
let isSyncing = false;

// Upload a completed workout to Supabase.
// If offline (or a request is already in-flight), queues it for later and
// flushes the pending queue on the next successful upload.
export async function syncWorkoutUp(workout, userId) {
  if (!userId || !workout?.id) return;
  const row = {
    id: workout.id,
    user_id: userId,
    type: workout.type,
    date: workout.date,
    sets: workout.sets,
    duration_min: workout.durationMin ?? null,
    notes: workout.notes ?? null,
    mood: workout.mood ?? null,
    created_at: new Date().toISOString(),
  };
  if (!navigator.onLine) {
    enqueue({ type: "upsert_workout", row });
    return;
  }
  // Avoid concurrent requests for the same resource.
  if (isSyncing) {
    enqueue({ type: "upsert_workout", row });
    return;
  }
  isSyncing = true;
  try {
    await withTimeout(supabase.from("user_workouts").upsert(row));
    // Flush any previously queued saves now that we're online.
    await flush(async (item) => {
      if (item.type === "upsert_workout") {
        await withTimeout(supabase.from("user_workouts").upsert(item.row));
      } else {
        // Unknown type: throw so flush keeps it in the queue instead of
        // silently discarding it — data loss prevention.
        console.error(`[offlineQueue] tipo no reconocido: "${item.type}" — dejando en cola para reintentar`);
        throw new Error(`tipo no reconocido: ${item.type}`);
      }
    });
  } catch {
    enqueue({ type: "upsert_workout", row });
  } finally {
    isSyncing = false;
  }
}

// Pull all workouts for a user from Supabase.
// Returns an array sorted newest-first.
export async function fetchWorkoutsFromDB(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("user_workouts")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(500)
    );
    if (error) return [];
    return (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      date: row.date,
      sets: row.sets || [],
      durationMin: row.duration_min ?? null,
      notes: row.notes ?? null,
      mood: row.mood ?? null,
    }));
  } catch {
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
    const rows = real.map((w) => ({
      id: w.id,
      user_id: userId,
      type: w.type,
      date: w.date,
      sets: w.sets,
      created_at: new Date().toISOString(),
    }));
    await withTimeout(supabase.from("user_workouts").upsert(rows));
  } catch {}
}

// Merge local workouts (from localStorage) with remote ones (from DB).
// Deduplicates by id, keeps the most complete version.
export function mergeWorkouts(local, remote) {
  const map = new Map();
  // Local first (has full data including transient fields)
  for (const w of local) map.set(w.id, w);
  // Remote fills gaps (workouts done on other devices)
  for (const w of remote) {
    if (!map.has(w.id)) map.set(w.id, w);
  }
  return Array.from(map.values()).sort((a, b) =>
    String(b.date || "").localeCompare(String(a.date || ""))
  );
}
