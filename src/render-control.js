/* MAIN world: omit only normal-hunt presentation drawing when requested by the HUD. */
(function (global) {
  'use strict';

  if (global.__GUIA_RENDER_CONTROL__) return;

  const marker = Symbol.for('guiaHUD.render-control.v1');
  const state = { paused: false, requestedPause: false, calls: 0, skipped: 0 };
  let presentation = null;
  let prototype = null;
  let wrappedRender = null;
  let unavailableReason = null;
  let poller = null;
  const startedAt = Date.now();

  function hookIntact() {
    try {
      if (!presentation || !prototype || !wrappedRender ||
        global.PokeIdleHuntPresentation.HuntPresentation !== presentation ||
        presentation.prototype !== prototype) return false;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'render');
      return Boolean(descriptor && descriptor.value === wrappedRender);
    } catch (_) { return false; }
  }

  function hdModern() {
    try {
      const checkbox = global.document.getElementById('settings-hd-modern');
      return checkbox ? Boolean(checkbox.checked) : null;
    } catch (_) { return null; }
  }

  function status() {
    const intact = hookIntact();
    if (wrappedRender && !intact) state.paused = false;
    return {
      installed: intact,
      paused: intact && state.paused,
      calls: state.calls,
      skipped: state.skipped,
      hookIntact: intact,
      hdModern: hdModern(),
      unavailableReason: intact ? null : unavailableReason || (wrappedRender ? 'hook-changed' : 'waiting-for-presentation')
    };
  }

  function publishStatus() {
    try {
      global.dispatchEvent(new CustomEvent('guiaHUD:render-status', {
        detail: status()
      }));
    } catch (_) { /* Status is diagnostic; never interrupt the game's render call. */ }
  }

  function pause() {
    state.requestedPause = true;
    state.paused = hookIntact();
    publishStatus();
    return state.paused;
  }

  function resume() {
    state.requestedPause = false;
    state.paused = false;
    publishStatus();
    return true;
  }

  function onControl(event) {
    try {
      const detail = event && event.detail;
      if (!detail || typeof detail !== 'object' ||
        Object.keys(detail).length !== 1 || typeof detail.paused !== 'boolean') return;
      if (detail.paused) pause();
      else resume();
    } catch (_) { /* Ignore malformed cross-world events. */ }
  }

  function stopPolling() {
    if (poller !== null) global.clearInterval(poller);
    poller = null;
  }

  function tryInstall() {
    if (wrappedRender || unavailableReason) { stopPolling(); return; }
    let constructor;
    try { constructor = global.PokeIdleHuntPresentation?.HuntPresentation; }
    catch (_) { unavailableReason = 'presentation-access-failed'; }
    if (unavailableReason) { stopPolling(); publishStatus(); return; }
    if (!constructor) {
      if (Date.now() - startedAt >= 30000) {
        unavailableReason = 'presentation-timeout';
        stopPolling();
        publishStatus();
      }
      return;
    }

    let target;
    let descriptor;
    try {
      target = constructor.prototype;
      descriptor = target && Object.getOwnPropertyDescriptor(target, 'render');
      if (!descriptor || typeof descriptor.value !== 'function' ||
        (!descriptor.writable && !descriptor.configurable) || descriptor.value[marker]) {
        unavailableReason = 'render-unavailable-or-already-wrapped';
      }
    } catch (_) { unavailableReason = 'render-inspection-failed'; }
    if (unavailableReason) {
      stopPolling();
      publishStatus();
      return;
    }

    const original = descriptor.value;
    function wrapped() {
      state.calls++;
      if (state.paused) {
        if (hookIntact()) {
          state.skipped++;
          return;
        }
        state.paused = false;
        publishStatus();
      }
      return Reflect.apply(original, this, arguments);
    }
    Object.defineProperty(wrapped, marker, { value: true });
    try {
      Object.defineProperty(target, 'render', Object.assign({}, descriptor, { value: wrapped }));
    } catch (_) {
      unavailableReason = 'render-install-failed';
      stopPolling();
      publishStatus();
      return;
    }
    presentation = constructor;
    prototype = target;
    wrappedRender = wrapped;
    state.paused = state.requestedPause;
    stopPolling();
    publishStatus();
  }

  Object.defineProperty(global, '__GUIA_RENDER_CONTROL__', {
    value: Object.freeze({ pause, resume, status }), configurable: false, enumerable: false
  });
  global.addEventListener('guiaHUD:render-control', onControl);
  tryInstall();
  if (!wrappedRender && !unavailableReason) poller = global.setInterval(tryInstall, 100);
})(globalThis);
