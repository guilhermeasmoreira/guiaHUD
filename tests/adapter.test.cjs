const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function element(text, options) {
  const settings = options || {};
  const attributes = settings.attributes || {};
  const classes = new Set(settings.classes || []);
  return {
    textContent: text || '',
    style: settings.style || {},
    disabled: Boolean(settings.disabled),
    hidden: false,
    classList: { contains: function (name) { return classes.has(name); } },
    isConnected: true,
    getAttribute: function (name) { return attributes[name] == null ? null : attributes[name]; },
    querySelector: function (selector) { return settings.children && settings.children[selector] || null; },
    querySelectorAll: function (selector) { return settings.lists && settings.lists[selector] || []; },
    getBoundingClientRect: function () { return { width: 20, height: 10 }; },
    click: function () {}
  };
}

function loadModule(relativePath, context) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  vm.runInContext(source, context, { filename: relativePath });
}

test('adapter normalizes live player, target, hunt, boss, skills, and menu values', function () {
  const menuInventory = element('Inventário', {
    attributes: { 'data-client-action': 'inventory', title: 'Inventário' }
  });
  const menuMap = element('Mapa', {
    attributes: { 'data-client-action': 'map', title: 'Mapa' },
    classes: ['available']
  });
  const move = element('', {
    attributes: {
      'data-move-key': '0:bite',
      'data-move-name': 'Bite',
      'data-move-type': 'dark'
    },
    classes: ['move-ready']
  });
  const menuRoot = element('', {
    lists: {
      '[data-client-action]': [menuInventory, menuMap],
      '[data-system-open]': []
    }
  });

  const elements = new Map([
    ['#pokemon-team-bar', element('')],
    ['#pokemon-team-bar .player-name', element('KTo')],
    ['#pokemon-team-bar .player-summary', element('Nível 230 • Shiny Tyranitar')],
    ['#reference-hud', element('')],
    ['#reference-hud [data-rh-panel="target"]', element('')],
    ['#rh-name', element('Aerodactyl')],
    ['#rh-level', element('158')],
    ['#rh-hp-text', element('3.297 / 4.000')],
    ['#rh-hp-fill', element('', { style: { width: '82.4%' } })],
    ['#ha-panel', element('')],
    ['#ha-mTime', element('04:30:05')],
    ['#ha-mSaldoH', element('+$4,01kk/h')],
    ['#ha-mXph', element('531,6k/h')],
    ['#ha-mKills', element('11,6k')],
    ['#ha-cpShiny .num', element('43')],
    ['#ha-cpMega .num', element('13')],
    ['#ha-cpBoss .num', element('')],
    ['#shiny-global-next', element('')],
    ['#shiny-global-next-label', element('PRÓXIMO BOSS GLOBAL')],
    ['#shiny-global-next-time', element('00:39:50')],
    ['#shiny-global-next-detail', element('Ancient surpresa')],
    ['#pokemon-skills-window', element('')],
    ['#pio-main-menu', menuRoot]
  ]);

  const document = {
    querySelector: function (selector) { return elements.get(selector) || null; },
    querySelectorAll: function (selector) {
      return selector === '#pokemon-moves [data-move-key]' ? [move] : [];
    }
  };
  const context = vm.createContext({
    document: document,
    getComputedStyle: function () { return { display: 'block', visibility: 'visible' }; }
  });
  context.globalThis = context;

  [
    'src/utils/dom.js',
    'src/utils/parse.js',
    'src/adapter/selectors.js',
    'src/adapter/index.js'
  ].forEach(function (file) { loadModule(file, context); });

  const state = context.PokeClanHUD.modules.adapter.read();
  assert.equal(state.player.name, 'KTo');
  assert.equal(state.player.level, 230);
  assert.equal(state.player.activePokemonName, 'Shiny Tyranitar');
  assert.equal(state.target.name, 'Aerodactyl');
  assert.equal(state.target.hp, 3297);
  assert.equal(state.target.maxHp, 4000);
  assert.equal(state.target.hpPercent, 82.4);
  assert.equal(state.hunt.time, '04:30:05');
  assert.equal(state.hunt.boss, '0');
  assert.equal(state.boss.time, '00:39:50');
  assert.equal(state.skills.moves[0].key, '0:bite');
  assert.equal(state.skills.moves[0].ready, true);
  assert.deepEqual(
    Array.from(state.menu.actions, function (action) { return action.key; }),
    ['inventory', 'map']
  );
});

test('manifest keeps the game match and permissions narrow', function () {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.deepEqual(manifest.content_scripts[0].matches, ['https://pokeidle.online/game/*']);
  const scripts = manifest.content_scripts[0].js;
  assert.ok(scripts.indexOf('src/adapter/selectors.js') < scripts.indexOf('src/adapter/index.js'));
  assert.ok(scripts.indexOf('src/content/lifecycle.js') < scripts.indexOf('src/content/bootstrap.js'));
  scripts.forEach(function (script) {
    assert.equal(fs.existsSync(path.join(__dirname, '..', script)), true, script + ' is missing');
  });
  manifest.content_scripts[0].css.forEach(function (style) {
    assert.equal(fs.existsSync(path.join(__dirname, '..', style)), true, style + ' is missing');
  });
});
