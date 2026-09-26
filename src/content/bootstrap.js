(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  if (app.started) return;
  app.started = true;

  function start() {
    app.modules.lifecycle.start();
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})(globalThis);
