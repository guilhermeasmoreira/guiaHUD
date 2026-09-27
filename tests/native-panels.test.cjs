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

test('native quick bar and mailbox are annotated regardless of their screen position', () => {
  const quickClasses = new Set();
  const mailClasses = new Set();
  const node = (classes) => ({ classList: { add: (name) => classes.add(name) } });
  const nodes = {
    'nav.rh-mini[data-rh-panel="quick"]': [node(quickClasses)],
    '#mailbox-floating-letter': [node(mailClasses)]
  };
  const context = {
    document: { querySelectorAll: (selector) => nodes[selector] || [] },
    PokeClanHUD: { modules: {} },
    setInterval: () => 1,
    clearInterval: () => {},
    innerWidth: 1200
  };
  context.globalThis = context;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/content/native-panels.js'), 'utf8'), context);
  const panels = context.PokeClanHUD.modules.nativePanels;
  panels.start();
  assert.ok(quickClasses.has('pch-native-shortcut'));
  assert.ok(mailClasses.has('pch-native-mail'));
  panels.stop();
});
