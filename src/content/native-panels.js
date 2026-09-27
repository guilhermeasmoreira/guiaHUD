(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  let timer = null;

  function frameFor(element) {
    let candidate = element;
    for (let depth = 0; candidate && depth < 5; depth++, candidate = candidate.parentElement) {
      if (candidate.closest('#poke-clan-hud-root')) return null;
      const rect = candidate.getBoundingClientRect();
      if (rect.width < 24 || rect.width > 320 || rect.height < 24 || rect.height > 150) continue;
      if (global.getComputedStyle(candidate).position === 'fixed') return candidate;
    }
    return element;
  }

  function annotate() {
    const controls = Array.from(global.document.querySelectorAll('button, [role="button"]'));
    controls.forEach(function (control) {
      if (control.closest('#poke-clan-hud-root')) return;
      const label = [control.textContent, control.getAttribute('aria-label'), control.getAttribute('title')]
        .filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      if (/\bCORREIO\b/i.test(label)) {
        const frame = frameFor(control);
        if (frame) frame.classList.add('pch-native-mail');
      }
      if (/TRAVAR ZOOM/i.test(label)) {
        const frame = frameFor(control);
        if (frame) frame.classList.add('pch-native-zoom');
      }
    });

    const rightEdge = global.innerWidth - 98;
    const shortcuts = controls.filter(function (control) {
      if (control.closest('#poke-clan-hud-root')) return false;
      const rect = control.getBoundingClientRect();
      return rect.left > rightEdge && rect.top >= 65 && rect.bottom < global.innerHeight * .7 &&
        rect.width >= 24 && rect.width <= 90 && rect.height >= 22 && rect.height <= 100;
    });
    if (shortcuts.length >= 3) {
      shortcuts.forEach(function (control) { control.classList.add('pch-native-shortcut'); });
    }
  }

  function start() {
    if (timer) return;
    annotate();
    timer = global.setInterval(annotate, 3000);
  }

  function stop() {
    if (timer) global.clearInterval(timer);
    timer = null;
  }

  app.modules.nativePanels = { start, stop };
})(globalThis);
