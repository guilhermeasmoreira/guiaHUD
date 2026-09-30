const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('economy preference defaults off and accepts only a stored boolean true', async () => {
  let saved = null;
  const context = vm.createContext({
    chrome: { storage: { local: {
      get: (_key, callback) => callback(saved),
      set: (value, callback) => { saved = value; callback(); }
    } } }
  });
  context.globalThis = context;
  for (const file of ['defaults.js', 'storage.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/settings', file), 'utf8'), context);
  }
  const storage = context.PokeClanHUD.modules.settingsStorage;
  assert.equal((await storage.load()).economyMode, false);
  saved = { pokeClanHudSettings: { economyMode: 'true' } };
  assert.equal((await storage.load()).economyMode, false);
  await storage.save({ enabled: true, economyMode: true });
  assert.equal((await storage.load()).economyMode, true);
});
