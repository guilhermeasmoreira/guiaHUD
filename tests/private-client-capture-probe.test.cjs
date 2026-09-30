const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/private-client-capture-probe.js'), 'utf8');

function boot() {
  const callbacks = [];
  const context = vm.createContext({
    performance: { now: () => 9200 },
    document: { getElementById: () => ({ classList: { contains: () => true } }) },
    setTimeout: (fn) => { callbacks.push(fn); return callbacks.length; },
    clearTimeout: () => {}
  });
  context.globalThis = context;
  vm.runInContext(source, context);
  return { context, callbacks, api: context.__GUIA_CLIENT_PROBE__ };
}

test('unrelated assignment retains normal own-property semantics; client is captured and render alone is reversible', () => {
  const { context, api } = boot();
  vm.runInContext(`
    globalThis.unrelated = {};
    unrelated.lastRenderAt = 12;
    globalThis.clientUnderTest = {
      enabled: false, sessionId: '', presentation: {}, pendingInputs: new Map(),
      lastHudAt: 0, lastSnapshotAt: 0, lastResyncAt: 0,
      renderCalls: 0,
      render() { this.renderCalls++; return this.renderCalls; },
      frame() {}, present() {}, owns() { return true; }
    };
    globalThis.originalRender = clientUnderTest.render;
    globalThis.originalFrame = clientUnderTest.frame;
    clientUnderTest.lastRenderAt = 99;
  `, context);
  assert.equal(context.unrelated.lastRenderAt, 12);
  assert.deepEqual(Object.getOwnPropertyDescriptor(context.unrelated, 'lastRenderAt'), {
    value: 12, writable: true, configurable: true, enumerable: true
  });
  assert.equal(api.client(), context.clientUnderTest);
  assert.equal(context.clientUnderTest.lastRenderAt, 99);
  assert.equal(api.status().prototypeTrapRemoved, true);
  assert.equal(api.status().renderHookInstalled, true);
  assert.equal(api.status().hdWebglReady, true);
  assert.equal(vm.runInContext("Object.hasOwn(Object.prototype, 'lastRenderAt')", context), false);
  assert.equal(context.clientUnderTest.frame, context.originalFrame);
  assert.ok(api.methods().includes('render'));
  assert.match(api.renderSource(), /renderCalls/);
  assert.equal(context.clientUnderTest.render(), 1);
  assert.equal(api.pause(), true);
  assert.equal(context.clientUnderTest.render(), undefined);
  assert.equal(context.clientUnderTest.renderCalls, 1);
  assert.equal(api.resume(), true);
  assert.equal(context.clientUnderTest.render(), 2);
  const result = api.restore();
  assert.equal(result.closed, true);
  assert.equal(result.paused, false);
  assert.equal(context.clientUnderTest.render, context.originalRender);
  assert.equal(context.clientUnderTest.frame, context.originalFrame);
  assert.equal(context.__GUIA_RENDER_PAUSED__, false);
});

test('timeout and early restore remove the prototype accessor without capturing', () => {
  const timed = boot();
  assert.equal(timed.api.status().trapActive, true);
  timed.callbacks[0]();
  assert.equal(timed.api.status().reason, 'capture-timeout');
  assert.equal(timed.api.status().prototypeTrapRemoved, true);
  assert.equal(vm.runInContext("Object.hasOwn(Object.prototype, 'lastRenderAt')", timed.context), false);
  const early = boot();
  assert.equal(early.api.restore().closed, true);
  assert.equal(early.api.pause(), false);
  assert.equal(vm.runInContext("Object.hasOwn(Object.prototype, 'lastRenderAt')", early.context), false);
});
