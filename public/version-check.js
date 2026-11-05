setTimeout(function () {
  var b = 61;
  fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.v > b && !sessionStorage.getItem('loop-refreshed')) {
        sessionStorage.setItem('loop-refreshed', '1');
        if (window.caches) {
          // Se limpian los caches de la app (navegación, precache) pero se CONSERVA
          // 'exercise-media' (fotos de ejercicios offline): son contenido inmutable de CDN
          // y volver a descargarlo es costoso. El SW se desregistra y se vuelve a registrar igual.
          caches.keys().then(function (k) {
            return Promise.all(k.filter(function (n) { return n !== 'exercise-media'; })
              .map(function (n) { return caches.delete(n); }));
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
