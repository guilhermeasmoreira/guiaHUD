(function (global) {
  'use strict';
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  // Theme IDs are the saved HUD IDs, not translated labels.
  const skins = Object.freeze({ dragon: 'wingeon' });
  const selector = '.rankings-window';
  const managed = new Map();
  let theme = null;
  let observer = null;

  function decorate(window) {
    if (!theme || !window.isConnected || managed.has(window)) return;
    const names = ['gh-ranking-premium', 'gh-ranking-theme-' + theme];
    const added = names.filter(function (name) { return !window.classList.contains(name); });
    added.forEach(function (name) { window.classList.add(name); });
    managed.set(window, added);
  }

  function release(window, added) {
    added.forEach(function (name) { window.classList.remove(name); });
    managed.delete(window);
  }

  function visit(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.matches(selector)) decorate(node);
    node.querySelectorAll(selector).forEach(decorate);
  }

  function onMutations(records) {
    // Native content updates need no JS: CSS follows the original nodes. Do
    // not scan avatar/team changes, chat text, or the HUD's own mutations.
    records.forEach(function (record) {
      if (record.target.nodeType === 1 && record.target.closest(selector + ', #poke-clan-hud-root')) return;
      record.addedNodes.forEach(visit);
    });
    managed.forEach(function (added, window) {
      if (!window.isConnected) release(window, added);
    });
  }

  function stop() {
    if (observer) observer.disconnect();
    observer = null;
    theme = null;
    managed.forEach(function (added, window) { release(window, added); });
  }

  function setTheme(id) {
    const next = skins[id] || null;
    if (next === theme && observer) return;
    stop();
    if (!next) return;
    theme = next;
    global.document.querySelectorAll(selector).forEach(decorate);
    observer = new global.MutationObserver(onMutations);
    observer.observe(global.document.documentElement, { childList: true, subtree: true });
  }

  app.modules.rankingPremium = { setTheme, stop };
})(globalThis);
