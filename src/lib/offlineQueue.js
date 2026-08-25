const KEY = "pulse-offline-queue";
const MAX_QUEUE_SIZE = 100;

// Last-resort in-memory queue used when localStorage is completely full.
// Data survives the current session but is lost on page reload — acceptable
// because a reload implies connectivity was likely restored.
let inMemoryFallback = null;

function load() {
  if (inMemoryFallback !== null) return inMemoryFallback;
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function save(q) {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
    inMemoryFallback = null; // clear fallback now that localStorage is working
  } catch (e) {
    const isQuota =
      e instanceof DOMException &&
      (e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        e.code === 22);
    if (isQuota) {
      // Step 1: prune and retry
      const pruned = q.slice(-MAX_QUEUE_SIZE);
      try {
        localStorage.setItem(KEY, JSON.stringify(pruned));
        inMemoryFallback = null;
        console.warn(
          "[offlineQueue] QuotaExceededError — cola recortada a",
          pruned.length,
          "items"
        );
      } catch {
        // Step 2: fall back to memory so no workout data is lost silently
        inMemoryFallback = q;
        console.error(
          "[offlineQueue] QuotaExceededError sin recuperación — datos guardados en memoria (se perderán al recargar). Items en cola:",
          q.length
        );
      }
    } else {
      console.warn("[offlineQueue] no se pudo guardar la cola:", e);
    }
  }
}

export function enqueue(item) {
  const q = load();
  if (q.length >= MAX_QUEUE_SIZE) {
    // Evict the oldest item to make room — prevents unbounded growth
    console.warn(
      "[offlineQueue] cola llena (máx " + MAX_QUEUE_SIZE + ") — descartando item más antiguo:",
      q[0]
    );
    q.shift();
  }
  q.push({ ...item, queuedAt: Date.now() });
  save(q);
}

export function dequeue() {
  const q = load();
  const item = q.shift();
  save(q);
  return item;
}

export function peek() {
  return load()[0] || null;
}

export function size() {
  return load().length;
}

export function clear() {
  localStorage.removeItem(KEY);
}

// Flush: try to process all queued items with the provided handler.
// handler(item) should return a Promise. Stops on first failure.
export async function flush(handler) {
  const q = load();
  if (!q.length) return 0;
  let processed = 0;
  const remaining = [];
  for (const item of q) {
    try {
      await handler(item);
      processed++;
    } catch {
      remaining.push(item);
    }
  }
  save(remaining);
  return processed;
}
