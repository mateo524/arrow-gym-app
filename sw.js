const CACHE = "arrow-gym-v38";
const BASE = "/arrow-gym-app";

// On install: cache the HTML shell, then WAIT — do NOT skip waiting.
// The new SW stays in "waiting" state until the user explicitly approves the update.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll([BASE + "/", BASE + "/index.html"]))
  );
  // No skipWaiting() here — this is intentional.
});

// Listen for a message from the app: when the user taps "Actualizar",
// the app sends SKIP_WAITING and then reloads.
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// On activate: delete old caches, claim clients.
// This only runs after skipWaiting() is called (user-triggered).
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy: network-first for everything, cache as fallback offline.
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
