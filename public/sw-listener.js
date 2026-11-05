// Recarga cuando un Service Worker NUEVO toma el control, pero:
//  - no en la primera instalación (no había controlador previo: nada que actualizar);
//  - no si hay un entrenamiento activo (se perdería la sesión en curso); en ese caso
//    la nueva versión se aplica en la próxima carga normal.
if ('serviceWorker' in navigator) {
  var hadController = !!navigator.serviceWorker.controller;
  var reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController) { hadController = true; return; } // primera instalación
    if (reloaded) return;
    try {
      if (sessionStorage.getItem('loop-gym-active-workout')) return;
      var raw = localStorage.getItem('loop-gym-v4');
      if (raw) {
        var st = JSON.parse(raw);
        if (st && st.state && st.state.activeWorkout) return;
      }
      if (localStorage.getItem('loop-gym-active-workout')) return;
    } catch (e) {}
    reloaded = true;
    window.location.reload();
  });
}
