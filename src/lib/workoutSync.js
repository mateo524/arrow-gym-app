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
    const { error: upsertError } = await withTimeout(supabase.from("user_workouts").upsert(row));
    if (upsertError) throw upsertError;
    // Flush any previously queued saves now that we're online.
    await flush(async (item) => {
      if (item.type === "upsert_workout") {
        const { error: flushError } = await withTimeout(supabase.from("user_workouts").upsert(item.row));
        if (flushError) throw flushError;
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
      if (error) return [];
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
      created_at: row.created_at ?? null,
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
    const { error: upsertAllError } = await withTimeout(supabase.from("user_workouts").upsert(rows));
    if (upsertAllError) throw upsertAllError;
  } catch {}
}

// Merge local workouts (from localStorage) with remote ones (from DB).
// Deduplicates by id. When the same id appears in both, the version with
// the more recent updated_at / created_at timestamp wins — this prevents
// local from always overwriting a remote edit made on another device.
export function mergeWorkouts(local, remote) {
  const map = new Map();
  // Seed with local entries (have full transient fields)
  for (const w of local) map.set(w.id, w);
  // Remote: prefer whichever copy was updated most recently
  for (const w of remote) {
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
