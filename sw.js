const CACHE = "arrow-gym-v34";
const BASE = "/arrow-gym-app";

// On install: cache only the HTML shell.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll([BASE + "/", BASE + "/index.html"]))
  );
  self.skipWaiting();
});

// On activate: delete ALL old caches, claim all clients immediately.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - HTML (navigation): network-first, fallback to cached index.html
// - JS/CSS assets: network-first, cache as fallback (avoids stale chunk problem)
// - Everything else: network-first with cache fallback
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const isAsset = /\/assets\//.test(url.pathname);
  const isNavigation = event.request.mode === "navigate";

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
    // Network-first for JS/CSS assets — always get fresh code, fall back to cache offline
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(event.request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
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
