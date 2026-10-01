(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;
  const storageKey = 'pokeClanHudLayout';

  function storageGet(callback) {
    if (app.modules.userScriptStorage) return callback(app.modules.userScriptStorage.get(storageKey) || {});
    if (!global.chrome || !global.chrome.storage || !global.chrome.storage.local) return callback({});
    global.chrome.storage.local.get(storageKey, function (result) {
      callback(result && result[storageKey] || {});
    });
  }

  function storageSet(layout) {
    if (app.modules.userScriptStorage) return app.modules.userScriptStorage.set(storageKey, layout);
    if (!global.chrome || !global.chrome.storage || !global.chrome.storage.local) return;
    global.chrome.storage.local.set({ [storageKey]: layout });
  }

  function applyPosition(element, position) {
    if (!position || !Number.isFinite(position.left) || !Number.isFinite(position.top)) return;
    const rect = element.getBoundingClientRect();
    const left = Math.max(4, Math.min(global.innerWidth - Math.max(24, rect.width), position.left));
    const top = Math.max(4, Math.min(global.innerHeight - Math.max(24, rect.height), position.top));
    element.style.left = left + 'px';
    element.style.top = top + 'px';
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.transform = 'none';
  }

  function make(element, key, layout) {
    const handle = dom.create('button', 'pch-drag-handle', '⠿');
    handle.type = 'button';
    handle.title = 'Arraste para mover. Duplo clique para restaurar a posição.';
    handle.setAttribute('aria-label', 'Mover ' + key);
    element.append(handle);

    applyPosition(element, layout[key]);
    let drag = null;

    handle.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = element.getBoundingClientRect();
      drag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
      handle.setPointerCapture(event.pointerId);
      element.classList.add('is-dragging');
    });

    handle.addEventListener('pointermove', function (event) {
      if (!drag) return;
      applyPosition(element, {
        left: event.clientX - drag.offsetX,
        top: event.clientY - drag.offsetY
      });
    });

    function finish(event) {
      if (!drag) return;
      drag = null;
      element.classList.remove('is-dragging');
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      const rect = element.getBoundingClientRect();
      layout[key] = { left: Math.round(rect.left), top: Math.round(rect.top) };
      storageSet(layout);
    }

    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
    handle.addEventListener('dblclick', function (event) {
      event.preventDefault();
      event.stopPropagation();
      delete layout[key];
      storageSet(layout);
      element.style.removeProperty('left');
      element.style.removeProperty('top');
      element.style.removeProperty('right');
      element.style.removeProperty('bottom');
      element.style.removeProperty('transform');
    });
  }

  function mount(widgets) {
    storageGet(function (layout) {
      Object.keys(widgets).forEach(function (key) {
        if (widgets[key]) make(widgets[key], key, layout);
      });
    });
  }

  app.modules.draggable = { mount };
})(globalThis);
