const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadModule(relativePath, context) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  vm.runInContext(source, context, { filename: relativePath });
}

function createContext() {
  const context = vm.createContext({});
  context.globalThis = context;
  return context;
}

test('parses game HP with Brazilian thousands separators', function () {
  const context = createContext();
  loadModule('src/utils/parse.js', context);
  const result = context.PokeClanHUD.modules.parse.parseHp('HP 3.297 / 4.000');
  assert.equal(result.hp, 3297);
  assert.equal(result.maxHp, 4000);
});

test('parses player level and active Pokémon from the game summary', function () {
  const context = createContext();
  loadModule('src/utils/parse.js', context);
  const result = context.PokeClanHUD.modules.parse.parsePlayerSummary('Nível 230 • Shiny Tyranitar');
  assert.equal(result.level, 230);
  assert.equal(result.activePokemonName, 'Shiny Tyranitar');
});

test('parses level labels and clamps HP percentages', function () {
  const context = createContext();
  loadModule('src/utils/parse.js', context);
  const parse = context.PokeClanHUD.modules.parse;
  assert.equal(parse.parseLevel('Nv. 158'), 158);
  assert.equal(parse.parsePercent('74,5%'), 74.5);
  assert.equal(parse.parsePercent('140%'), 100);
});
