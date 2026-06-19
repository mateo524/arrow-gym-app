const CACHE = "arrow-gym-v25";
const BASE = "/arrow-gym-app";

// On install: cache the shell. JS/CSS assets get cached on first fetch.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll([BASE + "/", BASE + "/index.html"]))
  );
  self.skipWaiting();
});

// On activate: delete old caches, claim all clients.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - HTML (navigation): network-first, 5s timeout, fallback to cached index.html
// - JS/CSS/images (assets with hash in name): cache-first (immutable files)
// - Everything else: network-first with cache fallback
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const isAsset = /\/assets\//.test(url.pathname);
  const isNavigation = event.request.mode === "navigate";

  if (isAsset) {
    // Cache-first for hashed assets (immutable)
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(event.request, res.clone()));
          }
          return res;
        });
      })
    );
    return;
  }

  if (isNavigation) {
    // Network-first for navigation, fallback to cached index.html
    event.respondWith(
      fetch(event.request, { signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined })
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

  // Default: network-first with cache fallback
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
