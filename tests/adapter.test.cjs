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
    id: settings.id || '',
    hidden: false,
    classList: {
      contains: function (name) { return classes.has(name); },
      add: function (name) { classes.add(name); },
      remove: function (name) { classes.delete(name); },
      toggle: function (name, force) {
        const enabled = force == null ? !classes.has(name) : Boolean(force);
        if (enabled) classes.add(name);
        else classes.delete(name);
        return enabled;
      }
    },
    isConnected: true,
    getAttribute: function (name) { return attributes[name] == null ? null : attributes[name]; },
    setAttribute: function (name, value) { attributes[name] = String(value); },
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
  const cooldownOverlay = element('', {
    classes: ['cooldown-overlay'],
    attributes: { 'data-cooldown': '7s' }
  });
  const moveSlot = element('', {
    lists: { '.cooldown-number, .cooldown-overlay': [cooldownOverlay] }
  });
  const move = element('', {
    attributes: {
      'data-move-key': '0:bite',
      'data-move-name': 'Bite',
      'data-move-type': 'dark'
    },
    classes: ['move-ready', 'is-cooldown']
  });
  move.closest = function (selector) { return selector === '.move-slot' ? moveSlot : null; };
  const menuRoot = element('', {
    lists: {
      '[data-client-action]': [menuInventory, menuMap],
      '[data-system-open]': []
    }
  });

  const elements = new Map([
    ['#pokemon-team-bar', element('', { classes: ['collapsed'] })],
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
    getComputedStyle: function () { throw new Error('Cooldown attribute must avoid computed style reads'); }
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
  assert.equal(state.player.teamExpanded, false);
  assert.equal(state.target.name, 'Aerodactyl');
  assert.equal(state.target.hp, 3297);
  assert.equal(state.target.maxHp, 4000);
  assert.equal(state.target.hpPercent, 82.4);
  assert.equal(state.hunt.time, '04:30:05');
  assert.equal(state.hunt.boss, '0');
  assert.equal(state.boss.time, '00:39:50');
  assert.equal(state.skills.moves[0].key, '0:bite');
  assert.equal(state.skills.moves[0].ready, true);
  assert.equal(state.skills.moves[0].cooldown, '7s');
  assert.deepEqual(
    Array.from(state.menu.actions, function (action) { return action.key; }),
    ['inventory', 'map']
  );
});

test('menu adapter discovers actions exposed outside the top menu root', function () {
  const autoHelper = element('Auto Helper', {
    attributes: { 'data-client-action': 'auto-helper', title: 'Auto Helper' }
  });
  const menuRoot = element('', { lists: { '[data-client-action]': [], '[data-system-open]': [] } });
  const elements = new Map([['#pio-main-menu', menuRoot]]);
  const document = {
    querySelector: function (selector) { return elements.get(selector) || null; },
    querySelectorAll: function (selector) {
      if (selector === '[data-client-action]') return [autoHelper];
      return [];
    }
  };
  const context = vm.createContext({
    document: document,
    getComputedStyle: function () { return { display: 'block', visibility: 'visible' }; }
  });
  context.globalThis = context;
  ['src/utils/dom.js', 'src/utils/parse.js', 'src/adapter/selectors.js', 'src/adapter/index.js']
    .forEach(function (file) { loadModule(file, context); });

  const state = context.PokeClanHUD.modules.adapter.read();
  assert.equal(state.menu.available, true);
  assert.deepEqual(Array.from(state.menu.actions, function (action) { return action.key; }), ['auto-helper']);
});

test('manifest keeps the game match and permissions narrow', function () {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest.permissions, ['storage']);
  const hud = manifest.content_scripts.find((entry) => entry.run_at === 'document_idle');
  assert.deepEqual(hud.matches, ['https://pokeidle.online/game/*']);
  const scripts = hud.js;
  assert.ok(scripts.indexOf('src/adapter/selectors.js') < scripts.indexOf('src/adapter/index.js'));
  assert.ok(scripts.indexOf('src/hud/icons.js') < scripts.indexOf('src/hud/main-menu.js'));
  assert.ok(scripts.indexOf('src/content/lifecycle.js') < scripts.indexOf('src/content/bootstrap.js'));
  assert.ok(hud.css.includes('src/themes/malefic/theme.css'));
  scripts.forEach(function (script) {
    assert.equal(fs.existsSync(path.join(__dirname, '..', script)), true, script + ' is missing');
  });
  hud.css.forEach(function (style) {
    assert.equal(fs.existsSync(path.join(__dirname, '..', style)), true, style + ' is missing');
  });
});

test('action bridge forwards commands to the original game buttons', function () {
  const clicks = { inventory: 0, trainer: 0, move: 0, more: 0, reset: 0, confirm: 0, boss: 0 };
  const classes = new Set();
  const classList = {
    contains: function (name) { return classes.has(name); },
    add: function (name) { classes.add(name); },
    toggle: function (name, force) {
      if (force) classes.add(name);
      else classes.delete(name);
    }
  };
  const inventory = element('Inventário', {
    attributes: { 'data-client-action': 'inventory' }
  });
  inventory.click = function () { clicks.inventory += 1; };
  const trainer = element('Perfil', { attributes: { 'data-client-action': 'skills' } });
  trainer.click = function () { clicks.trainer += 1; };
  const move = element('', { attributes: { 'data-move-key': '0:bite' } });
  move.click = function () { clicks.move += 1; };
  const reset = element('');
  reset.click = function () { clicks.reset += 1; };
  const more = element('', { attributes: { 'aria-expanded': 'false' } });
  more.click = function () { clicks.more += 1; more.setAttribute('aria-expanded', 'true'); };
  const confirm = element('');
  confirm.click = function () { clicks.confirm += 1; };
  const boss = element('');
  boss.click = function () { clicks.boss += 1; };
  const menuRoot = element('', {
    lists: { '[data-client-action]': [inventory, trainer], '[data-system-open]': [] }
  });
  const elements = new Map([
    ['#pio-main-menu', menuRoot],
    ['#ha-btnMore', more],
    ['#ha-mZero', reset],
    ['#ha-cYes', confirm],
    ['#shiny-global-next', boss]
  ]);
  const document = {
    documentElement: { classList: classList },
    querySelector: function (selector) { return elements.get(selector) || null; },
    querySelectorAll: function (selector) {
      return selector === '#pokemon-moves [data-move-key]' ? [move] : [];
    }
  };
  const context = vm.createContext({ document: document });
  context.globalThis = context;
  ['src/utils/dom.js', 'src/adapter/selectors.js', 'src/bridge/actions.js']
    .forEach(function (file) { loadModule(file, context); });

  const actions = context.PokeClanHUD.modules.actions;
  assert.equal(actions.openMenuAction('client', 'inventory'), true);
  assert.equal(actions.openMenuAction('client', 'skills'), true);
  assert.equal(actions.activateMove('0:bite'), true);
  assert.equal(actions.resetHunt(), true);
  assert.equal(actions.toggleBoss(), true);
  assert.deepEqual(clicks, { inventory: 1, trainer: 1, move: 1, more: 1, reset: 1, confirm: 1, boss: 1 });
  assert.equal(classes.has('pch-hunt-expanded'), false);
  assert.equal(classes.has('pch-boss-expanded'), true);
});

test('Hunt details opens the native panel while reset keeps the compact panel', function () {
  const clicks = { team: 0, huntRestore: 0, reset: 0 };
  const teamClasses = new Set(['collapsed']);
  const huntClasses = new Set(['collapsed']);
  const teamRoot = element('', { classes: ['collapsed'] });
  const teamToggle = element('');
  teamToggle.click = function () {
    clicks.team += 1;
    teamClasses.delete('collapsed');
    teamRoot.classList.remove('collapsed');
  };
  teamRoot.querySelector = function (selector) { return selector === '.team-minimize' ? teamToggle : null; };

  const huntRoot = element('', { classes: ['collapsed'] });
  const restore = element('');
  const reset = element('');
  restore.click = function () {
    clicks.huntRestore += 1;
    huntClasses.delete('collapsed');
    huntClasses.add('client-open');
    huntRoot.classList.remove('collapsed');
    huntRoot.classList.add('client-open');
  };
  reset.click = function () { clicks.reset += 1; };
  huntRoot.querySelector = function (selector) {
    if (selector === '#minimize-hunt-analyzer') return restore;
    if (selector === '#ha-mZero') return reset;
    return null;
  };

  const htmlClasses = new Set();
  const document = {
    documentElement: {
      classList: {
        contains: function (name) { return htmlClasses.has(name); },
        add: function (name) { htmlClasses.add(name); },
        remove: function (name) { htmlClasses.delete(name); },
        toggle: function (name, force) {
          const enabled = force == null ? !htmlClasses.has(name) : Boolean(force);
          if (enabled) htmlClasses.add(name);
          else htmlClasses.delete(name);
          return enabled;
        }
      }
    },
    querySelector: function (selector) {
      if (selector === '#pokemon-team-bar') return teamRoot;
      if (selector === '#pokemon-team-bar .team-minimize') return teamToggle;
      if (selector === '#ha-panel') return huntRoot;
      if (selector === '#minimize-hunt-analyzer') return restore;
      return null;
    },
    querySelectorAll: function () { return []; }
  };
  const context = vm.createContext({ document: document });
  context.globalThis = context;
  ['src/utils/dom.js', 'src/adapter/selectors.js', 'src/bridge/actions.js']
    .forEach(function (file) { loadModule(file, context); });

  const actions = context.PokeClanHUD.modules.actions;
  assert.equal(actions.togglePlayerTeam(), true);
  assert.equal(htmlClasses.has('pch-team-expanded'), true);
  assert.equal(actions.resetHunt(), true);
  assert.deepEqual(clicks, { team: 1, huntRestore: 0, reset: 1 });
  assert.equal(htmlClasses.has('pch-hunt-expanded'), false);
  assert.equal(actions.toggleHuntDetails(), true);
  assert.deepEqual(clicks, { team: 1, huntRestore: 1, reset: 1 });
  assert.equal(htmlClasses.has('pch-hunt-expanded'), true);
  assert.equal(actions.openMenuAction('client', 'hunt-analyzer'), true);
  assert.equal(htmlClasses.has('pch-hunt-expanded'), false);
  assert.deepEqual(clicks, { team: 1, huntRestore: 1, reset: 1 });
});
