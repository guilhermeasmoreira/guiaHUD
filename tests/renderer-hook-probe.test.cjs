const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/renderer-hook-probe.js'), 'utf8');

test('probe starts in MAIN world, captures a frame, and restores original methods', () => {
  const manifest = require('../manifest.json');
  const probe = manifest.content_scripts.find((entry) => entry.world === 'MAIN');
  assert.deepEqual(probe, {
    matches: ['https://pokeidle.online/game/*'],
    js: ['src/renderer-hook-probe.js'],
    run_at: 'document_start',
    world: 'MAIN'
  });

  const requested = [];
  const nativeRAF = function (callback) { requested.push(callback); return requested.length; };
  const nativeGetContext = function () { return { canvas: this }; };
  function Canvas() { this.id = 'game'; }
  Canvas.prototype.getContext = nativeGetContext;
  const context = vm.createContext({
    requestAnimationFrame: nativeRAF,
    HTMLCanvasElement: Canvas,
    document: { readyState: 'loading', querySelectorAll: () => [], documentElement: {} },
    location: { href: 'https://pokeidle.online/game/', origin: 'https://pokeidle.online' },
    performance: { now: () => 100, getEntriesByType: () => [] },
    setInterval: () => 1, clearInterval: () => {}, setTimeout: () => 2, clearTimeout: () => {},
    MutationObserver: class { observe() {} disconnect() {} },
    URL
  });
  context.globalThis = context;
  vm.runInContext(source, context);
  const api = context.__GUIA_RENDER_PROBE__;
  assert.equal(api.summary().readyStateAtInstall, 'loading');
  assert.notEqual(context.requestAnimationFrame, nativeRAF);

  const frame = function frame() {
    updateWithMovementGuard();
    continuousHuntClient.render(render);
    presentHdFrame(0);
    requestAnimationFrame(frame);
  };
  context.requestAnimationFrame(frame);
  context.requestAnimationFrame(frame);
  assert.equal(requested[0], frame);
  assert.equal(api.gameFrame(), frame);
  assert.equal(api.summary().gameFrameCalls, 2);
  assert.match(api.gameFrameSource(), /continuousHuntClient\.render/);
  new Canvas().getContext('2d');
  assert.equal(api.summary().gameCanvasContexts, 1);

  let getterCalls = 0;
  Object.defineProperty(context, 'pokeGameSecret', { configurable: true,
    get() { getterCalls++; throw new Error('getter must not run'); } });
  const result = api.stop();
  assert.equal(getterCalls, 0);
  assert.ok(result.suspiciousGlobals.includes('pokeGameSecret'));
  assert.equal(context.requestAnimationFrame, nativeRAF);
  assert.equal(Canvas.prototype.getContext, nativeGetContext);
  assert.equal(api.stop().rafCalls, 2);
});
