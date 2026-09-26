(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;

  const primaryDefinitions = [
    { type: 'client', key: 'inventory', label: 'Bolsa' },
    { type: 'client', key: 'profile', label: 'Perfil' },
    { type: 'client', key: 'map', label: 'Mapa' },
    { type: 'client', key: 'auto-helper', label: 'Helper' },
    { type: 'client', key: 'hunt-analyzer', label: 'Hunt' }
  ];

  const shortLabels = {
    'health': 'Centro Pokémon',
    'pokedex': 'Pokédex',
    'pokelog': 'Pokélog',
    'captures': 'Capturas',
    'diamond-shop': 'Diamantes',
    'player-market': 'Market de jogadores',
    'auto-helper': 'Auto Helper',
    'hunt-analyzer': 'Hunt Analyzer',
    'npc-shop': 'Loja NPC'
  };

  function categoryFor(action) {
    const key = action.key.toLowerCase();
    if (/^(inventory|profile|map|auto-helper|hunt-analyzer)$/.test(key)) return 'Principal';
    if (/^(pokedex|pokelog|captures|npcs|depot|health|craft-bosses|skills)$/.test(key)) return 'Jogo';
    if (/shop|market|diamond|store|held/.test(key)) return 'Trocas';
    if (/friend|guild|discord|invite|clan/.test(key)) return 'Social';
    return 'Sistemas';
  }

  function displayLabel(action) {
    return shortLabels[action.key] || action.label;
  }

  function actionButton(action, primary) {
    const button = dom.create('button', primary ? 'pch-menu-action' : 'pch-menu-list-action');
    button.type = 'button';
    button.dataset.actionType = action.type;
    button.dataset.actionKey = action.key;
    button.title = action.label;
    button.setAttribute('aria-label', action.label);
    dom.setText(button, displayLabel(action), '');
    if (action.notification) button.classList.add('has-notification');
    return button;
  }

  function mount(parent, actions) {
    const nav = dom.create('nav', 'pch-main-menu');
    nav.setAttribute('aria-label', 'Menu compacto do jogo');
    const primary = dom.create('div', 'pch-menu-primary');
    const moreButton = dom.create('button', 'pch-menu-more', 'Mais');
    moreButton.type = 'button';
    moreButton.setAttribute('aria-expanded', 'false');
    const popover = dom.create('div', 'pch-menu-popover');
    popover.hidden = true;
    popover.setAttribute('role', 'menu');
    nav.append(primary, moreButton, popover);
    parent.append(nav);

    let currentActions = [];
    let menuReady = false;
    moreButton.addEventListener('click', function () {
      const open = popover.hidden;
      popover.hidden = !open;
      moreButton.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-action-key]');
      if (!button) return;
      actions.openMenuAction(button.dataset.actionType, button.dataset.actionKey);
      popover.hidden = true;
      moreButton.setAttribute('aria-expanded', 'false');
    });
    nav.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !popover.hidden) {
        popover.hidden = true;
        moreButton.setAttribute('aria-expanded', 'false');
        moreButton.focus();
      }
    });

    function renderMenuItems(items) {
      primary.replaceChildren();
      const byId = new Map(items.map(function (item) { return [item.type + ':' + item.key, item]; }));
      primaryDefinitions.forEach(function (definition) {
        const item = byId.get(definition.type + ':' + definition.key);
        if (!item) return;
        const action = Object.assign({}, item, { label: item.label || definition.label });
        const button = actionButton(action, true);
        dom.setText(button, definition.label, '');
        primary.append(button);
      });

      const primaryIds = new Set(primaryDefinitions.map(function (item) {
        return item.type + ':' + item.key;
      }));
      const rest = items.filter(function (item) {
        return !primaryIds.has(item.type + ':' + item.key);
      });
      moreButton.hidden = rest.length === 0;
      popover.replaceChildren();
      const groups = new Map();
      rest.forEach(function (item) {
        const category = categoryFor(item);
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push(item);
      });
      ['Jogo', 'Trocas', 'Social', 'Sistemas', 'Principal'].forEach(function (category) {
        const grouped = groups.get(category);
        if (!grouped || !grouped.length) return;
        const section = dom.create('section', 'pch-menu-group');
        const heading = dom.create('h3', 'pch-menu-group-title', category);
        const list = dom.create('div', 'pch-menu-group-items');
        grouped.forEach(function (item) { list.append(actionButton(item, false)); });
        section.append(heading, list);
        popover.append(section);
      });
    }

    function update(state) {
      const menu = state.menu || {};
      currentActions = menu.actions || [];
      const signature = JSON.stringify(currentActions);
      if (signature !== nav.dataset.signature) {
        nav.dataset.signature = signature;
        renderMenuItems(currentActions);
      }
      menuReady = Boolean(menu.available && currentActions.length);
      nav.hidden = !menuReady;
      if (!menuReady) {
        popover.hidden = true;
        moreButton.setAttribute('aria-expanded', 'false');
      }
      return menuReady;
    }

    return { update };
  }

  app.modules.mainMenu = { mount };
})(globalThis);
