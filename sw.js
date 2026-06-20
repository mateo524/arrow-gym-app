const CACHE_PREFIX = "arrow-gym-v";
const CACHE_VERSION = 39;
const CACHE = CACHE_PREFIX + CACHE_VERSION;
const BASE = "/arrow-gym-app";

// Install: cache HTML shell, then activate immediately (skipWaiting).
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll([BASE + "/", BASE + "/index.html"]))
  );
  self.skipWaiting();
});

// Activate: delete caches older than the PREVIOUS version, but keep N-1.
// This lets currently-open pages still load their old JS chunks from the old cache.
// NO clients.claim() — open pages stay under their current SW so their old chunks
// remain accessible. The new SW takes over silently on the next open.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => {
            if (!k.startsWith(CACHE_PREFIX)) return true;
            const v = parseInt(k.slice(CACHE_PREFIX.length), 10);
            return v < CACHE_VERSION - 1; // keep current (v39) + previous (v38)
          })
          .map(k => caches.delete(k))
      )
    )
  );
});

// Fetch: network-first, cache as offline fallback.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === "navigate";
  const isAsset = /\/assets\//.test(url.pathname);

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then(c => c || caches.match(BASE + "/index.html"))
        )
    );
    return;
  }

  if (isAsset) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.ok && res.type === "basic") {
          caches.open(CACHE).then(c => c.put(event.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
