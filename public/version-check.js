setTimeout(function () {
  var b = 49;
  fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.v > b && !sessionStorage.getItem('loop-refreshed')) {
        sessionStorage.setItem('loop-refreshed', '1');
        if (window.caches) {
          caches.keys().then(function (k) {
            return Promise.all(k.map(function (n) { return caches.delete(n); }));
          });
        }
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(function (r) {
            r.forEach(function (s) { s.unregister(); });
          });
        }
        location.reload();
      }
    })
    .catch(function () {});
}, 0);
