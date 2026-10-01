const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('built userscript installs the presentation hook and persists HUD settings', async () => {
  const source = fs.readFileSync('userscript/guiaHUD.user.js', 'utf8');
  assert.match(source, /@run-at\s+document-start/);
  assert.match(source, /@sandbox\s+raw/);
  assert.match(source, /@grant\s+none/);
  assert.match(source, /@match\s+https:\/\/pokeidle\.online\/game\/\*/);
  const listeners = new Map();
  const storage = new Map();
  const styles = [];
  const document = {
    readyState: 'loading',
    createElement(tag) { return { tag, isConnected: false }; },
    documentElement: { append(style) { style.isConnected = true; styles.push(style); } },
    addEventListener(name, fn) { listeners.set(name, fn); },
    getElementById() { return null; }
  };
  let drawn = 0;
  class HuntPresentation { render() { drawn++; } }
  const context = {
    document,
    PokeIdleHuntPresentation: { HuntPresentation },
    localStorage: {
      getItem(key) { return storage.get(key) ?? null; },
      setItem(key, value) { storage.set(key, value); }
    },
    addEventListener() {}, dispatchEvent() {},
    setInterval() { throw new Error('hook should install without polling'); },
    clearInterval() {},
    CustomEvent: class { constructor(name, options) { this.type = name; this.detail = options.detail; } }
  };
  context.globalThis = context;
  vm.runInNewContext(source, context, { filename: 'guiaHUD.user.js' });
  assert.equal(styles.length, 1);
  assert.match(styles[0].textContent, /pch-economy-screen/);
  assert.equal(context.__GUIA_RENDER_CONTROL__.status().installed, true);
  const presentation = new HuntPresentation();
  presentation.render();
  context.__GUIA_RENDER_CONTROL__.pause();
  presentation.render();
  assert.equal(drawn, 1);
  assert.equal(context.__GUIA_RENDER_CONTROL__.status().skipped, 1);
  context.__GUIA_RENDER_CONTROL__.resume();
  presentation.render();
  assert.equal(drawn, 2);

  const settings = context.PokeClanHUD.modules.settingsStorage;
  assert.equal((await settings.load()).economyMode, false);
  await settings.save({ theme: 'malefic', economyMode: true });
  assert.equal(storage.has('guiaHUD.userscript.pokeClanHudSettings'), true);
  assert.equal((await settings.load()).theme, 'malefic');
  assert.equal((await settings.load()).economyMode, true);
  assert.equal(typeof listeners.get('DOMContentLoaded'), 'function');
});
