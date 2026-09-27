const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { definitions } = require('../src/hud/clan-icons.js');

test('all eleven clan symbols have standalone vector exports', () => {
  const names = ['fire', 'electric', 'stone', 'leaf', 'fighter', 'metal',
    'dragon', 'psychic', 'water', 'malefic', 'ice'];
  assert.deepEqual(Object.keys(definitions), names);
  for (const name of names) {
    const svg = fs.readFileSync(path.join(__dirname, '../design/icons', name + '.svg'), 'utf8');
    assert.match(svg, /viewBox="0 0 64 64"/);
    assert.ok(svg.includes(definitions[name].paths[0]));
  }
  assert.notEqual(definitions.dragon.paths[0], definitions.psychic.paths[0]);
});

test('theme icons are constructed inline without external image requests', () => {
  function element(name) {
    return {
      nodeName: name,
      attributes: {},
      children: [],
      setAttribute(key, value) { this.attributes[key] = value; },
      append(child) { this.children.push(child); }
    };
  }
  const context = vm.createContext({ document: { createElementNS: (_ns, name) => element(name) } });
  context.globalThis = context;
  const source = fs.readFileSync(path.join(__dirname, '../src/hud/clan-icons.js'), 'utf8');
  vm.runInContext(source, context);
  const icon = context.PokeClanHUD.modules.clanIcons.create('dragon');
  assert.equal(icon.nodeName, 'svg');
  assert.equal(icon.attributes.viewBox, '0 0 64 64');
  assert.equal(icon.children.length, definitions.dragon.paths.length + 1);
  assert.equal(icon.attributes.href, undefined);
});