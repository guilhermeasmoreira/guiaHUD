const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load(file, context) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
}

test('theme switches update the document class without leaving the prior theme active', () => {
  const classes = new Set();
  let handlers;
  const html = {
    classList: {
      add: (value) => classes.add(value),
      remove: (value) => classes.delete(value),
      contains: (value) => classes.has(value),
      toggle: (value, enabled) => enabled ? classes.add(value) : classes.delete(value)
    }
  };
  const modules = {
    settingsDefaults: { enabled: true, theme: 'minimal', compact: true },
    settingsStorage: { save: () => Promise.resolve() },
    adapter: { createAdapter: () => ({ read: () => ({}), observe: () => {}, destroy: () => {} }) },
    store: { createStore: () => ({ getState: () => ({}), subscribe: () => {}, setState: () => {} }) },
    hudRoot: { mount: (_state, _settings, _actions, nextHandlers) => {
      handlers = nextHandlers;
      return { host: { isConnected: true }, update: () => ({}), destroy: () => {} };
    } },
    nativePanels: { start: () => {}, stop: () => {}, sync: () => {} }
  };
  const context = vm.createContext({
    document: { documentElement: html, addEventListener: () => {}, removeEventListener: () => {} },
    PokeClanHUD: { modules }
  });
  context.globalThis = context;
  load('src/content/lifecycle.js', context);
  context.PokeClanHUD.modules.lifecycle.enable();
  const themes = ['ice', 'fire', 'stone', 'dragon', 'naturia', 'gardestrike', 'psycraft', 'rainbolt', 'malefic', 'minimal'];
  for (const theme of themes) {
    handlers.onChange({ theme });
    const active = themes
      .filter((name) => classes.has('pch-theme-' + name));
    assert.deepEqual(active, [theme]);
  }
});

test('every selectable theme has a packaged stylesheet', () => {
  const manifest = require('../manifest.json');
  const css = manifest.content_scripts.find((entry) => entry.run_at === 'document_idle').css;
  for (const theme of ['ice', 'fire', 'stone', 'dragon', 'naturia', 'gardestrike', 'psycraft', 'rainbolt']) {
    const file = `src/themes/${theme}/theme.css`;
    assert.ok(css.includes(file), `${theme} missing from manifest`);
    assert.ok(fs.existsSync(path.join(__dirname, '..', file)));
  }
  assert.ok(css.includes('src/themes/elemental/base.css'));
});
