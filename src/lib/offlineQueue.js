import { track } from "./telemetry.js";

const KEY = "pulse-offline-queue";
const SOFT_WARN_SIZE = 100;

// Last-resort in-memory queue used when localStorage is completely full.
// Data survives the current session but is lost on page reload.
let inMemoryFallback = null;

// Backoff state for flush (exponential, capped).
let failures = 0;
let backoffUntil = 0;
const BACKOFF_BASE_MS = 2000;
const BACKOFF_MAX_MS = 5 * 60 * 1000;

// Mutex: one flush at a time (concurrent flushes would reorder / duplicate writes).
let flushPromise = null;

function warn(reason, extra = {}) {
  console.warn("[offlineQueue]", reason, extra);
  try { track("offline_queue_warning", { reason, ...extra }); } catch {}
  try { window.dispatchEvent(new CustomEvent("offline-queue-warning", { detail: { reason, ...extra } })); } catch {}
}

function load() {
  if (inMemoryFallback !== null) return inMemoryFallback;
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

// Never drops items: if localStorage is full we keep the queue in memory and warn.
function save(q) {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
    inMemoryFallback = null;
  } catch (e) {
    inMemoryFallback = q;
    warn("no se pudo persistir la cola; queda solo en memoria", { size: q.length, error: String(e?.name || e) });
  }
}

// Items are keyed (item.key, defaults to type + id): enqueueing the same key
// replaces the previous entry (last write wins) and moves it to the end.
export function keyOf(item) {
  return item.key || (item.id != null ? `${item.type}:${item.id}` : null);
}

export function enqueue(item) {
  const key = keyOf(item);
  let q = load();
  if (key) q = q.filter((i) => keyOf(i) !== key);
  q.push({ ...item, key, queuedAt: Date.now() });
  if (q.length === SOFT_WARN_SIZE) warn("cola de sincronización grande", { size: q.length });
  save(q);
}

export function peek() { return load()[0] || null; }
export function size() { return load().length; }
export function items() { return load().slice(); }
export function clear() {
  inMemoryFallback = null;
  try { localStorage.removeItem(KEY); } catch {}
}

function removeExact(item) {
  // Remove only if the stored entry is still the one we processed; a newer
  // version enqueued during the flush must survive.
  const q = load();
  const next = q.filter((i) => !(keyOf(i) === keyOf(item) && i.queuedAt === item.queuedAt));
  if (next.length !== q.length) save(next);
}

// Flush: process items in order with handler(item) (must throw on failure).
// Stops at the first failure and applies exponential backoff. Returns processed count.
export function flush(handler, { force = false } = {}) {
  if (flushPromise) return flushPromise;
  if (!force && Date.now() < backoffUntil) return Promise.resolve(0);
  flushPromise = (async () => {
    let processed = 0;
    try {
      for (const item of load().slice()) {
        try {
          await handler(item);
        } catch (e) {
          failures++;
          backoffUntil = Date.now() + Math.min(BACKOFF_BASE_MS * 2 ** (failures - 1), BACKOFF_MAX_MS);
          warn("fallo al sincronizar item; se reintentará", { type: item.type, failures, error: String(e?.message || e) });
          break;
        }
        removeExact(item);
        processed++;
        failures = 0;
        backoffUntil = 0;
      }
    } finally {
      flushPromise = null;
    }
    return processed;
  })();
  return flushPromise;
}
