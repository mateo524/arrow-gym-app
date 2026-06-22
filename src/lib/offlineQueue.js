const KEY = "pulse-offline-queue";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function save(q) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function enqueue(item) {
  const q = load();
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
