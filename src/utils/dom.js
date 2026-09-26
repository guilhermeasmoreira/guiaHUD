(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};

  function query(selector, root) {
    return (root || global.document).querySelector(selector);
  }

  function queryAll(selector, root) {
    return Array.from((root || global.document).querySelectorAll(selector));
  }

  function readText(selector, root) {
    const element = typeof selector === 'string' ? query(selector, root) : selector;
    return element ? String(element.textContent || '').trim() : null;
  }

  function isVisible(element) {
    if (!element || !element.isConnected) return false;
    const style = global.getComputedStyle ? global.getComputedStyle(element) : null;
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function create(tag, className, text) {
    const element = global.document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  }

  function setText(element, value, fallback) {
    if (!element) return;
    const next = value == null || value === '' ? (fallback || '') : String(value);
    if (element.textContent !== next) element.textContent = next;
  }

  app.modules.dom = { query, queryAll, readText, isVisible, create, setText };
})(globalThis);
