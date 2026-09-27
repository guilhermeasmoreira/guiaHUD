(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  let timer = null;
  const suppressed = new Map();

  // The game writes inline display styles while changing panels. Keep their
  // original value so disabling the extension returns control to the game.
  function hide(element) {
    if (!element || !element.isConnected) return;
    if (!suppressed.has(element)) {
      suppressed.set(element, {
        value: element.style.getPropertyValue('display'),
        priority: element.style.getPropertyPriority('display')
      });
    }
    if (element.style.getPropertyValue('display') !== 'none' ||
        element.style.getPropertyPriority('display') !== 'important') {
      element.style.setProperty('display', 'none', 'important');
    }
  }

  function reveal(element) {
    const original = suppressed.get(element);
    if (!original) return;
    if (original.value) element.style.setProperty('display', original.value, original.priority);
    else element.style.removeProperty('display');
    suppressed.delete(element);
  }

  function sync() {
    const html = global.document.documentElement;
    const enabled = html.classList.contains('poke-clan-hud-enabled');
    const mappings = [
      ['pch-player-ready', '#pokemon-team-bar'],
      ['pch-target-ready', '#reference-hud [data-rh-panel="target"], #target-card'],
      ['pch-boss-ready', '#shiny-global-next', 'pch-boss-expanded'],
      ['pch-menu-ready', '#pio-main-menu'],
      ['pch-skills-ready', '#pokemon-skills-window'],
      ['pch-hunt-ready', '#ha-panel', 'pch-hunt-expanded'],
      ['pch-chat-ready', '#game-chat', 'pch-chat-expanded']
    ];
    const shouldHide = new Set();
    mappings.forEach(function ([ready, selector, expanded]) {
      if (!enabled || !html.classList.contains(ready) ||
          expanded && html.classList.contains(expanded)) return;
      global.document.querySelectorAll(selector).forEach(function (element) {
        shouldHide.add(element);
      });
    });
    suppressed.forEach(function (_, element) {
      if (!shouldHide.has(element)) reveal(element);
    });
    shouldHide.forEach(hide);
  }

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
    // The quick bar is a fixed <nav> on either side of the screen. Its
    // individual buttons are not reliable position-based annotation targets.
    global.document.querySelectorAll('nav.rh-mini[data-rh-panel="quick"]').forEach(function (bar) {
      bar.classList.add('pch-native-shortcut');
    });
    global.document.querySelectorAll('#mailbox-floating-letter').forEach(function (mail) {
      mail.classList.add('pch-native-mail');
    });
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
    timer = global.setInterval(function () { annotate(); sync(); }, 500);
  }

  function stop() {
    if (timer) global.clearInterval(timer);
    timer = null;
    suppressed.forEach(function (_, element) { reveal(element); });
  }

  app.modules.nativePanels = { start, stop, sync };
})(globalThis);
