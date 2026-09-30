const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function read(file) {
  return fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
}

test('MAIN world hook waits for the public prototype, skips only render, and resumes with original this/args', () => {
  const manifest = require('../manifest.json');
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.deepEqual(manifest.content_scripts[0], {
    matches: ['https://pokeidle.online/game/*'],
    js: ['src/render-control.js'], run_at: 'document_start', world: 'MAIN'
  });

  const listeners = new Map();
  let poll;
  const context = vm.createContext({
    addEventListener: (name, listener) => listeners.set(name, listener),
    dispatchEvent: (event) => listeners.get(event.type)?.(event),
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    setInterval: (fn) => { poll = fn; return 1; }, clearInterval: () => { poll = null; },
    document: { getElementById: () => ({ checked: false }) }
  });
  context.globalThis = context;
  vm.runInContext(read('src/render-control.js'), context);
  const api = context.__GUIA_RENDER_CONTROL__;
  assert.equal(api.status().installed, false);
  const calls = [];
  function Presentation() {}
  const original = function () { calls.push({ receiver: this, args: [...arguments] }); return 'drawn'; };
  Presentation.prototype.render = original;
  context.PokeIdleHuntPresentation = { HuntPresentation: Presentation };
  poll();
  assert.equal(api.status().installed, true);
  assert.equal(api.status().hookIntact, true);
  const instance = new Presentation();
  assert.equal(instance.render('a', 1), 'drawn');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].receiver, instance);
  assert.deepEqual(calls[0].args, ['a', 1]);

  listeners.get('guiaHUD:render-control')({ detail: { paused: 'true' } });
  assert.equal(api.status().paused, false);
  listeners.get('guiaHUD:render-control')({ detail: { paused: true } });
  assert.equal(instance.render('b'), undefined);
  assert.equal(calls.length, 1);
  assert.equal(api.status().skipped, 1);
  listeners.get('guiaHUD:render-control')({ detail: { paused: false } });
  assert.equal(instance.render('c'), 'drawn');
  assert.equal(calls.length, 2);
  assert.equal(api.status().calls, 3);
  assert.equal(api.status().hdModern, false);
  vm.runInContext(read('src/render-control.js'), context);
  assert.equal(instance.render('d'), 'drawn');
  assert.equal(api.status().calls, 4); // No second wrapper.
  Presentation.prototype.render = original;
  assert.equal(api.pause(), false);
  assert.equal(api.status().hookIntact, false);
});

test('settings toggle starts off, refuses unavailable hook, and reports the change when available', () => {
  const nodes = [];
  const document = {
    createElement(tag) {
      const node = {
        tagName: tag.toUpperCase(), children: [], listeners: {},
        append(...children) { this.children.push(...children); },
        setAttribute(key, value) { this[key] = value; },
        addEventListener(name, listener) { this.listeners[name] = listener; },
        focus() {}
      };
      nodes.push(node);
      return node;
    },
    addEventListener() {}, removeEventListener() {}
  };
  const context = vm.createContext({ document });
  context.globalThis = context;
  vm.runInContext(read('src/utils/dom.js'), context);
  vm.runInContext(read('src/settings/panel.js'), context);
  const changed = [];
  const parent = { append() {} };
  const panel = context.PokeClanHUD.modules.settingsPanel.mount(parent,
    { theme: 'minimal', compact: true, economyMode: false },
    { onChange: (settings) => changed.push(settings) });
  const toggle = nodes.find((node) => node['aria-label'] === 'Modo Econômico');
  assert.equal(toggle.checked, false);
  assert.equal(toggle.disabled, true);
  panel.setRenderAvailable(true);
  assert.equal(toggle.disabled, false);
  toggle.checked = true;
  toggle.listeners.change();
  assert.equal(changed.at(-1).economyMode, true);
  panel.setRenderAvailable(false);
  assert.equal(toggle.checked, false);
  assert.equal(toggle.disabled, true);
  assert.equal(changed.at(-1).economyMode, true); // Saved preference is preserved.
});
