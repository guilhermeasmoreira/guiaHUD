/* Boot-only, passive renderer hook discovery. No gameplay callback is replaced. */
(function () {
  'use strict';

  const root = globalThis;
  if (root.__GUIA_RENDER_PROBE__) return;
  const nativeRAF = root.requestAnimationFrame;
  const originalRAFDescriptor = Object.getOwnPropertyDescriptor(root, 'requestAnimationFrame');
  const canvasPrototype = root.HTMLCanvasElement && root.HTMLCanvasElement.prototype;
  const nativeGetContext = canvasPrototype && canvasPrototype.getContext;
  const originalCanvasDescriptor = canvasPrototype && Object.getOwnPropertyDescriptor(canvasPrototype, 'getContext');
  const initialGlobals = new Set(Object.getOwnPropertyNames(root));
  const started = root.performance && root.performance.now ? root.performance.now() : Date.now();
  const durationMs = 15000;
  const keywords = /poke|idle|hunt|render|renderer|frame|world|canvas|game|battle|client|visual|present|stage|map|hud|sprite/i;
  const frameMarkers = ['updateWithMovementGuard', 'continuousHuntClient.render'];
  const own = Object.prototype.hasOwnProperty;
  const nativeFunctionSource = Function.prototype.toString;
  const records = {
    readyStateAtInstall: root.document && root.document.readyState || 'unavailable',
    newGlobals: [], suspiciousGlobals: [], rafCalls: 0, rafCallbacks: [],
    canvasContexts: [], scripts: [], resources: [], errors: [],
    rafWrapperReplaced: false, canvasWrapperReplaced: false,
    startedAt: new Date().toISOString(), stoppedAfterMs: null
  };
  const seenGlobals = new Set(initialGlobals);
  const seenScripts = new WeakSet();
  const seenResources = new Set();
  const callbacks = new Map();
  const renderCandidates = [];
  let gameFrame = null;
  let gameFrameRecord = null;
  let finished = false;
  let scriptObserver = null;
  let resourceObserver = null;
  let scanner = null;
  let deadline = null;

  function elapsed() {
    return Math.round((root.performance && root.performance.now ? root.performance.now() : Date.now()) - started);
  }

  function error(phase, exception) {
    if (records.errors.length < 12) records.errors.push({ phase, name: exception && exception.name || 'Error' });
  }

  function sourceOf(fn) {
    try { return nativeFunctionSource.call(fn); } catch (_) { return ''; }
  }

  function sourcePreview(source, length) {
    // Literal contents might contain account identifiers or embedded credentials.
    const input = source.slice(0, length);
    let output = '';
    for (let i = 0; i < input.length;) {
      const char = input[i];
      if (char === '"' || char === "'" || char === '`') {
        output += '[literal]';
        i++;
        while (i < input.length) {
          if (input[i] === '\\') { i += 2; continue; }
          if (input[i++] === char) break;
        }
      } else if (char === '/' && input[i + 1] === '/') {
        i += 2;
        while (i < input.length && input[i] !== '\n') i++;
      } else if (char === '/' && input[i + 1] === '*') {
        i += 2;
        while (i < input.length && !(input[i] === '*' && input[i + 1] === '/')) i++;
        i += 2;
      } else { output += char; i++; }
    }
    return output;
  }

  function label(value) {
    try {
      const proto = Object.getPrototypeOf(value);
      const descriptor = proto && Object.getOwnPropertyDescriptor(proto, 'constructor');
      return descriptor && own.call(descriptor, 'value') &&
        typeof descriptor.value === 'function' ? descriptor.value.name : typeof value;
    }
    catch (_) { return typeof value; }
  }

  // Report only path fragments; never include query strings, URL credentials or hashes.
  function resourceName(value) {
    try {
      const url = new URL(value, root.location.href);
      const segments = url.pathname.split('/').filter(Boolean);
      return (url.origin === root.location.origin ? '' : url.hostname + '/') + (segments.at(-1) || 'unknown');
    } catch (_) { return 'unknown'; }
  }

  function safeProperties(value, limit) {
    try { return Object.getOwnPropertyNames(value).slice(0, limit); }
    catch (_) { return []; }
  }

  function prototypeMethods(value) {
    try {
      const proto = Object.getPrototypeOf(value);
      if (!proto) return [];
      return safeProperties(proto, 48).filter(function (key) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        return descriptor && own.call(descriptor, 'value') && typeof descriptor.value === 'function';
      });
    } catch (_) { return []; }
  }

  function renderMethod(value) {
    try {
      for (const object of [value, Object.getPrototypeOf(value)]) {
        if (!object) continue;
        const descriptor = Object.getOwnPropertyDescriptor(object, 'render');
        if (descriptor && own.call(descriptor, 'value') && typeof descriptor.value === 'function') return true;
      }
    } catch (_) { /* Unknown proxies and accessors are never invoked. */ }
    return false;
  }

  function inspectGlobal(name, isNew) {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(root, name);
      if (!descriptor) return;
      if (isNew && records.newGlobals.length < 300) records.newGlobals.push(name);
      if (!keywords.test(name) || records.suspiciousGlobals.length >= 100) return;
      const hasValue = own.call(descriptor, 'value');
      const value = hasValue ? descriptor.value : undefined;
      const type = hasValue ? typeof value : 'accessor (not read)';
      const functionSource = type === 'function' ? sourceOf(value) : '';
      const method = hasValue && value != null && (type === 'object' || type === 'function') && renderMethod(value);
      const item = {
        name, new: isNew, type,
        constructor: hasValue && value != null ? label(value) : null,
        ownProperties: hasValue && value != null ? safeProperties(value, 48) : [],
        prototypeMethods: hasValue && value != null ? prototypeMethods(value) : [],
        hasRenderMethod: Boolean(method),
        descriptor: { writable: hasValue ? descriptor.writable : null,
          configurable: descriptor.configurable, enumerable: descriptor.enumerable },
        functionLength: type === 'function' ? functionSource.length : null,
        functionPreview: type === 'function' ? sourcePreview(functionSource, 280) : null
      };
      records.suspiciousGlobals.push(item);
      if (method && renderCandidates.length < 20) renderCandidates.push(name);
      // One level of own data properties only: never traverse account state or invoke getters.
      if (hasValue && value && (type === 'object' || type === 'function')) {
        for (const key of safeProperties(value, 48)) {
          if (renderCandidates.length >= 20) break;
          const child = Object.getOwnPropertyDescriptor(value, key);
          if (!child || !own.call(child, 'value') || !child.value || typeof child.value !== 'object') continue;
          if (renderMethod(child.value)) renderCandidates.push(name + '.' + key);
        }
      }
    } catch (exception) { error('global', exception); }
  }

  function scanGlobals() {
    try {
      for (const name of Object.getOwnPropertyNames(root)) {
        if (seenGlobals.has(name)) continue;
        seenGlobals.add(name);
        if (name !== '__GUIA_RENDER_PROBE__') inspectGlobal(name, true);
      }
    } catch (exception) { error('scanGlobals', exception); }
  }

  function scriptRecord(node) {
    if (!node || node.tagName !== 'SCRIPT' || seenScripts.has(node) || records.scripts.length >= 200) return;
    seenScripts.add(node);
    records.scripts.push({ src: node.src ? resourceName(node.src) : '(inline)',
      type: node.type || 'classic', async: Boolean(node.async), defer: Boolean(node.defer), atMs: elapsed() });
  }

  function scanScriptNode(node) {
    if (!node || node.nodeType !== 1) return;
    scriptRecord(node);
    if (node.querySelectorAll) for (const script of node.querySelectorAll('script')) scriptRecord(script);
  }

  function scanScripts() {
    try { for (const script of root.document.querySelectorAll('script')) scriptRecord(script); }
    catch (exception) { error('scripts', exception); }
  }

  function resourceRecord(entry) {
    if (!entry || entry.initiatorType !== 'script' && !keywords.test(entry.name)) return;
    const name = resourceName(entry.name);
    const key = name + ':' + Math.round(entry.startTime);
    if (seenResources.has(key) || records.resources.length >= 120) return;
    seenResources.add(key);
    records.resources.push({ name, initiatorType: entry.initiatorType,
      atMs: Math.round(entry.startTime - started) });
  }

  function scanResources() {
    try { for (const entry of root.performance.getEntriesByType('resource')) resourceRecord(entry); }
    catch (exception) { error('resources', exception); }
  }

  function rafRecord(callback) {
    records.rafCalls++;
    if (typeof callback !== 'function') return;
    const existing = callbacks.get(callback);
    if (existing) { existing.calls++; return; }
    if (callbacks.size >= 100) return;
    const source = sourceOf(callback);
    const candidate = frameMarkers.every(function (marker) { return source.includes(marker); });
    const item = { name: callback.name || '(anonymous)', calls: 1, sourceLength: source.length,
      preview: sourcePreview(source, 400), mainFrameCandidate: candidate,
      hasRecursiveRAFText: /requestAnimationFrame\s*\(\s*frame\s*\)/.test(source), firstSeenMs: elapsed() };
    callbacks.set(callback, item);
    records.rafCallbacks.push(item);
    if (candidate && !gameFrame) { gameFrame = callback; gameFrameRecord = item; }
  }

  function wrappedRAF(callback) {
    // Instrumentation must never alter the scheduling path or throw into the game.
    try { rafRecord(callback); } catch (exception) { error('raf', exception); }
    return Reflect.apply(nativeRAF, this, [callback]);
  }

  function wrappedGetContext() {
    try {
      if (records.canvasContexts.length < 60) {
        const canvas = this;
        const id = canvas.id || '';
        if (id === 'game' || keywords.test(id) || records.canvasContexts.length < 8) {
          records.canvasContexts.push({ id, type: String(arguments[0] || ''), atMs: elapsed() });
        }
      }
    } catch (exception) { error('getContext', exception); }
    return Reflect.apply(nativeGetContext, this, arguments);
  }

  function publicReport() {
    return {
      readyStateAtInstall: records.readyStateAtInstall,
      durationMs: records.stoppedAfterMs == null ? elapsed() : records.stoppedAfterMs,
      finished, newGlobals: records.newGlobals.length,
      suspiciousGlobals: records.suspiciousGlobals.map(function (entry) { return entry.name; }),
      rafCalls: records.rafCalls, uniqueRafCallbacks: records.rafCallbacks.length,
      gameFrameCaptured: Boolean(gameFrame),
      gameFrameCalls: gameFrameRecord ? gameFrameRecord.calls : 0,
      gameCanvasContexts: records.canvasContexts.filter(function (entry) { return entry.id === 'game'; }).length,
      rendererCandidates: renderCandidates.slice(),
      rafWrapperReplaced: records.rafWrapperReplaced,
      canvasWrapperReplaced: records.canvasWrapperReplaced
    };
  }

  function download() {
    const report = { summary: publicReport(), newGlobals: records.newGlobals,
      suspiciousGlobals: records.suspiciousGlobals,
      rafCallbacks: records.rafCallbacks, canvasContexts: records.canvasContexts,
      scripts: records.scripts, resources: records.resources, errors: records.errors };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = root.document.createElement('a');
    link.href = url;
    link.download = 'guiahud-render-probe.json';
    link.style.display = 'none';
    root.document.documentElement.appendChild(link);
    link.click();
    link.remove();
    root.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    return report.summary;
  }

  function stop() {
    if (finished) return publicReport();
    finished = true;
    root.clearInterval(scanner);
    root.clearTimeout(deadline);
    if (scriptObserver) scriptObserver.disconnect();
    if (resourceObserver) resourceObserver.disconnect();
    scanGlobals(); scanScripts(); scanResources();
    records.rafWrapperReplaced = root.requestAnimationFrame !== wrappedRAF;
    records.canvasWrapperReplaced = Boolean(canvasPrototype && canvasPrototype.getContext !== wrappedGetContext);
    try {
      if (root.requestAnimationFrame === wrappedRAF) {
        if (originalRAFDescriptor) Object.defineProperty(root, 'requestAnimationFrame', originalRAFDescriptor);
        else delete root.requestAnimationFrame;
      }
    } catch (exception) { error('restoreRAF', exception); }
    try {
    if (canvasPrototype && canvasPrototype.getContext === wrappedGetContext) {
        if (originalCanvasDescriptor) Object.defineProperty(canvasPrototype, 'getContext', originalCanvasDescriptor);
        else delete canvasPrototype.getContext;
      }
    } catch (exception) { error('restoreCanvas', exception); }
    callbacks.clear(); // Only the explicitly requested gameFrame reference survives the probe.
    scriptObserver = null;
    resourceObserver = null;
    records.stoppedAfterMs = elapsed();
    return publicReport();
  }

  const api = {
    summary: publicReport,
    suspicious: function () { return records.suspiciousGlobals.map(function (item) { return { ...item }; }); },
    raf: function () { return records.rafCallbacks.map(function (item) { return { ...item }; }); },
    gameFrame: function () { return gameFrame; },
    gameFrameSource: function () { return gameFrame ? sourceOf(gameFrame) : null; },
    download,
    stop
  };
  Object.defineProperty(root, '__GUIA_RENDER_PROBE__', { value: api, configurable: true });

  // Existing globals can already include public game diagnostics at document_start.
  for (const name of initialGlobals) if (keywords.test(name)) inspectGlobal(name, false);
  try { if (typeof nativeRAF === 'function') root.requestAnimationFrame = wrappedRAF; }
  catch (exception) { error('installRAF', exception); }
  try { if (typeof nativeGetContext === 'function') canvasPrototype.getContext = wrappedGetContext; }
  catch (exception) { error('installCanvas', exception); }
  try {
    scriptObserver = new MutationObserver(function (mutations) {
      try {
        for (const mutation of mutations) for (const node of mutation.addedNodes) scanScriptNode(node);
      } catch (exception) { error('scriptMutation', exception); }
    });
    scriptObserver.observe(root.document, { childList: true, subtree: true });
  } catch (exception) { error('scriptObserver', exception); }
  try {
    if (typeof PerformanceObserver === 'function') {
      resourceObserver = new PerformanceObserver(function (list) {
        try { for (const entry of list.getEntries()) resourceRecord(entry); }
        catch (exception) { error('resourceEntries', exception); }
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
    }
  } catch (exception) { error('resourceObserver', exception); }
  scanScripts(); scanResources();
  scanner = root.setInterval(function () { scanGlobals(); scanScripts(); }, 250);
  deadline = root.setTimeout(stop, durationMs);
})();
