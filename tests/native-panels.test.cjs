const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

test('native panels are suppressed only while their replacement is active and restored on stop', () => {
  const flags = new Set(['poke-clan-hud-enabled', 'pch-hunt-ready', 'pch-chat-ready']);
  const makePanel = (display) => {
    let value = display;
    let priority = '';
    return {
      isConnected: true,
      style: {
        getPropertyValue: () => value,
        getPropertyPriority: () => priority,
        setProperty: (_, next, nextPriority) => { value = next; priority = nextPriority || ''; },
        removeProperty: () => { value = ''; priority = ''; }
      }
    };
  };
  const hunt = makePanel('flex');
  const chat = makePanel('block');
  const nodes = { '#ha-panel': [hunt], '#game-chat': [chat] };
  const context = {
    document: {
      documentElement: { classList: { contains: (flag) => flags.has(flag) } },
      querySelectorAll: (selector) => nodes[selector] || []
    },
    PokeClanHUD: { modules: {} },
    setInterval: () => 1,
    clearInterval: () => {}
  };
  context.globalThis = context;
  const code = fs.readFileSync(path.join(__dirname, '../src/content/native-panels.js'), 'utf8');
  vm.runInNewContext(code, context);
  const panels = context.PokeClanHUD.modules.nativePanels;
  panels.sync();
  assert.equal(hunt.style.getPropertyValue('display'), 'none');
  assert.equal(hunt.style.getPropertyPriority('display'), 'important');
  assert.equal(chat.style.getPropertyValue('display'), 'none');
  flags.add('pch-hunt-expanded');
  flags.add('pch-chat-expanded');
  panels.sync();
  assert.equal(hunt.style.getPropertyValue('display'), 'flex');
  assert.equal(chat.style.getPropertyValue('display'), 'block');
  flags.delete('pch-hunt-expanded');
  panels.sync();
  panels.stop();
  assert.equal(hunt.style.getPropertyValue('display'), 'flex');
});
