/* Temporary MAIN-world probe: capture a private hunt client on first lastRenderAt assignment. */
(function () {
  'use strict';

  const root = globalThis;
  if (root.__GUIA_CLIENT_PROBE__) return;
  const prototype = Object.prototype;
  const key = 'lastRenderAt';
  const started = root.performance && root.performance.now ? root.performance.now() : Date.now();
  const originalFlag = Object.getOwnPropertyDescriptor(root, '__GUIA_RENDER_PAUSED__');
  const nativeSource = Function.prototype.toString;
  let capturedClient = null;
  let capturedAtMs = null;
  let originalRender = null;
  let originalRenderDescriptor = null;
  let wrapper = null;
  let timer = null;
  let trapInstalled = false;
  let trapRemoved = false;
  let closed = false;
  let otherWrites = 0;
  let reason = null;
  let renderHookInstalled = false;

  function elapsed() {
    return Math.round((root.performance && root.performance.now ? root.performance.now() : Date.now()) - started);
  }

  function data(object, property) {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(object, property);
      return descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value') ? descriptor.value : undefined;
    } catch (_) { return undefined; }
  }

  function looksLikeClient(target) {
    if (!target || typeof target !== 'object') return false;
    try {
      if (['render', 'frame', 'present', 'owns'].some(function (name) {
        return typeof data(target, name) !== 'function';
      })) return false;
      if (data(target, 'presentation') == null) return false;
      if (!(data(target, 'pendingInputs') instanceof Map)) return false;
      return typeof data(target, 'enabled') === 'boolean' &&
        typeof data(target, 'sessionId') === 'string' &&
        ['lastHudAt', 'lastSnapshotAt', 'lastResyncAt'].every(function (name) {
          return Object.prototype.hasOwnProperty.call(target, name);
        });
    } catch (_) { return false; }
  }

  function removeTrap() {
    if (!trapInstalled) return;
    try {
      const current = Object.getOwnPropertyDescriptor(prototype, key);
      if (current && current.get === readLastRenderAt && current.set === writeLastRenderAt) {
        delete prototype[key];
      }
      trapRemoved = !Object.getOwnPropertyDescriptor(prototype, key) ||
        Object.getOwnPropertyDescriptor(prototype, key).set !== writeLastRenderAt;
      trapInstalled = false;
    } catch (_) { reason = 'trap-removal-failed'; }
  }

  function readLastRenderAt() { return undefined; }

  function writeLastRenderAt(value) {
    if (this === prototype) {
      reason = 'prototype-was-receiver';
      removeTrap();
      return;
    }
    const candidate = !closed && !capturedClient && looksLikeClient(this);
    try {
      // Shadow the inherited setter for every ordinary receiver, including false positives.
      Object.defineProperty(this, key, {
        value: value, writable: true, configurable: true, enumerable: true
      });
    } catch (_) {
      reason = 'receiver-could-not-own-lastRenderAt';
      return;
    }
    if (!candidate) { otherWrites++; return; }
    capturedClient = this;
    capturedAtMs = elapsed();
    removeTrap();
    if (timer !== null) { root.clearTimeout(timer); timer = null; }
    installRenderWrapper();
  }

  function installRenderWrapper() {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(capturedClient, 'render');
      if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value') ||
        typeof descriptor.value !== 'function' || !descriptor.configurable && !descriptor.writable) {
        reason = 'render-not-writable';
        return;
      }
      originalRenderDescriptor = descriptor;
      originalRender = descriptor.value;
      wrapper = function () {
        if (root.__GUIA_RENDER_PAUSED__) return;
        return Reflect.apply(originalRender, this, arguments);
      };
      Object.defineProperty(capturedClient, 'render', { ...descriptor, value: wrapper });
      renderHookInstalled = data(capturedClient, 'render') === wrapper;
      if (!renderHookInstalled) reason = 'render-wrapper-not-installed';
    } catch (_) { reason = 'render-wrapper-install-failed'; }
  }

  function stageIsHdReady() {
    try {
      const stage = root.document.getElementById('stage');
      return Boolean(stage && stage.classList.contains('hd-webgl-ready'));
    } catch (_) { return false; }
  }

  function status() {
    return {
      captured: Boolean(capturedClient), capturedAtMs,
      prototypeTrapRemoved: trapRemoved,
      trapActive: trapInstalled,
      hasRender: Boolean(capturedClient && typeof data(capturedClient, 'render') === 'function'),
      hasFrame: Boolean(capturedClient && typeof data(capturedClient, 'frame') === 'function'),
      hasPresent: Boolean(capturedClient && typeof data(capturedClient, 'present') === 'function'),
      hasOwns: Boolean(capturedClient && typeof data(capturedClient, 'owns') === 'function'),
      renderHookInstalled: Boolean(renderHookInstalled && data(capturedClient, 'render') === wrapper),
      paused: Boolean(renderHookInstalled && root.__GUIA_RENDER_PAUSED__),
      hdWebglReady: stageIsHdReady(), otherWrites, closed, reason
    };
  }

  function pause() {
    if (closed || !renderHookInstalled || data(capturedClient, 'render') !== wrapper) return false;
    root.__GUIA_RENDER_PAUSED__ = true;
    return root.__GUIA_RENDER_PAUSED__ === true;
  }

  function resume() {
    root.__GUIA_RENDER_PAUSED__ = false;
    return root.__GUIA_RENDER_PAUSED__ === false;
  }

  function restore() {
    resume();
    closed = true;
    if (timer !== null) { root.clearTimeout(timer); timer = null; }
    removeTrap();
    if (capturedClient && originalRenderDescriptor && data(capturedClient, 'render') === wrapper) {
      try {
        Object.defineProperty(capturedClient, 'render', originalRenderDescriptor);
      } catch (_) { reason = 'render-wrapper-restore-failed'; }
    }
    renderHookInstalled = false;
    return status();
  }

  const api = {
    status,
    client: function () { return capturedClient; },
    methods: function () {
      if (!capturedClient) return [];
      return Object.getOwnPropertyNames(capturedClient).filter(function (name) {
        return typeof data(capturedClient, name) === 'function';
      });
    },
    renderSource: function () {
      return originalRender ? nativeSource.call(originalRender) : null;
    },
    pause, resume, restore
  };
  Object.defineProperty(root, '__GUIA_CLIENT_PROBE__', { value: api, configurable: true });

  if (Object.getOwnPropertyDescriptor(prototype, key)) {
    reason = 'prototype-property-already-exists';
    trapRemoved = true; // This probe did not install one.
    return;
  }
  if (originalFlag && !originalFlag.configurable && !originalFlag.writable) {
    reason = 'pause-flag-not-writable';
    trapRemoved = true;
    return;
  }
  try {
    root.__GUIA_RENDER_PAUSED__ = false;
    Object.defineProperty(prototype, key, {
      configurable: true, enumerable: false,
      get: readLastRenderAt, set: writeLastRenderAt
    });
    trapInstalled = true;
    timer = root.setTimeout(function () {
      removeTrap();
      if (!capturedClient) reason = 'capture-timeout';
      timer = null;
    }, 15000);
  } catch (_) {
    reason = 'prototype-trap-install-failed';
    removeTrap();
  }
})();
