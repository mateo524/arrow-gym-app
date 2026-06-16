import { supabase } from "./supabase.js";

// Upload a completed workout to Supabase.
// Called right after finishWorkout() – fire-and-forget, never throws.
export async function syncWorkoutUp(workout, userId) {
  if (!userId || !workout?.id) return;
  try {
    await supabase.from("user_workouts").upsert({
      id: workout.id,
      user_id: userId,
      type: workout.type,
      date: workout.date,
      sets: workout.sets,
      created_at: new Date().toISOString(),
    });
  } catch {}
}

// Pull all workouts for a user from Supabase.
// Returns an array sorted newest-first.
export async function fetchWorkoutsFromDB(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("user_workouts")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(500);
    if (error) return [];
    return (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      date: row.date,
      sets: row.sets || [],
    }));
  } catch {
    return [];
  }
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
