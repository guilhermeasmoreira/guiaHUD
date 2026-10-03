const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture() {
  const observers = [];
  const modals = [];
  function element(classes = [], children = []) {
    const names = new Set(classes);
    return {
      nodeType: 1, isConnected: true, children,
      classList: { contains: n => names.has(n), add: n => names.add(n), remove: n => names.delete(n) },
      matches: s => s === '.rankings-window' && names.has('rankings-window'),
      closest: () => names.has('rankings-window') ? true : null,
      querySelectorAll: () => children.filter(c => c.matches('.rankings-window'))
    };
  }
  const document = { documentElement: element(), querySelectorAll: () => modals };
  class MutationObserver {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() { this.active = true; }
    disconnect() { this.active = false; }
  }
  const context = vm.createContext({ document, MutationObserver });
  vm.runInContext(fs.readFileSync('src/hud/ranking-premium.js', 'utf8'), context);
  return { api: context.PokeClanHUD.modules.rankingPremium, modals, observers, element };
}

test('skin preserves native nodes, controls, canvas and owned classes across theme changes', () => {
  const f = fixture();
  const canvas = { width: 112, height: 112 };
  let clicks = 0;
  const profile = { onclick: () => clicks++ };
  const modal = f.element(['rankings-window', 'native-class'], [canvas, profile]);
  f.modals.push(modal);
  f.api.setTheme('minimal');
  assert.equal(f.observers.length, 0);
  f.api.setTheme('dragon');
  assert.ok(modal.classList.contains('gh-ranking-theme-wingeon'));
  assert.equal(modal.children[0], canvas);
  assert.equal(canvas.width, 112);
  modal.children[1].onclick();
  assert.equal(clicks, 1);
  f.api.setTheme('dragon');
  assert.equal(f.observers.length, 1);
  // Category/pagination updates replace native descendants, never the window.
  const replacement = {};
  modal.children[0] = replacement;
  f.observers[0].callback([{ target: modal, addedNodes: [replacement] }]);
  assert.equal(modal.children[0], replacement);
  f.api.setTheme('fire');
  assert.equal(f.observers[0].active, false);
  assert.equal(modal.classList.contains('gh-ranking-premium'), false);
  assert.ok(modal.classList.contains('native-class'));
});

test('opening/replacing/closing a modal is reversible without permanent monitoring', () => {
  const f = fixture();
  f.api.setTheme('dragon');
  const first = f.element(['rankings-window']);
  const parent = f.element([], [first]);
  f.observers[0].callback([{ target: parent, addedNodes: [parent] }]);
  assert.ok(first.classList.contains('gh-ranking-premium'));
  first.isConnected = false;
  const second = f.element(['rankings-window', 'gh-ranking-premium']);
  f.observers[0].callback([{ target: parent, addedNodes: [second] }]);
  assert.equal(first.classList.contains('gh-ranking-premium'), false);
  assert.ok(second.classList.contains('gh-ranking-theme-wingeon'));
  f.api.stop();
  assert.equal(f.observers[0].active, false);
  assert.equal(second.classList.contains('gh-ranking-theme-wingeon'), false);
  assert.ok(second.classList.contains('gh-ranking-premium'), 'pre-existing classes belong to their original owner');
});
