(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;
  const selectors = app.modules.selectors;

  function disabled(element) {
    return Boolean(element && (element.disabled || element.getAttribute('aria-disabled') === 'true'));
  }

  function clickByAttribute(root, selector, attribute, value) {
    const scopes = root ? [root, global.document] : [global.document];
    let element = null;
    for (const scope of scopes) {
      element = dom.queryAll(selector, scope).find(function (candidate) {
        return candidate.getAttribute(attribute) === value;
      });
      if (element) break;
    }
    if (!element || disabled(element)) return false;
    element.click();
    return true;
  }

  function clientAction(action) {
    const root = dom.query(selectors.menu.root) || global.document;
    return clickByAttribute(root, selectors.menu.clientAction, 'data-client-action', action);
  }

  function systemAction(action) {
    const root = dom.query(selectors.menu.root) || global.document;
    return clickByAttribute(root, selectors.menu.systemOpen, 'data-system-open', action);
  }

  function isTeamExpanded(root) {
    if (!root || !root.classList) return false;
    return !root.classList.contains('collapsed') && !root.classList.contains('is-minimized');
  }

  function isHuntExpanded(root) {
    if (!root || !root.classList) return false;
    if (root.classList.contains('client-open')) return true;
    return !root.classList.contains('collapsed');
  }

  function findHuntResetControl(root) {
    const direct = dom.query(selectors.hunt.reset) || dom.query(selectors.hunt.reset, root || global.document);
    if (direct) return direct;
    const controls = dom.queryAll('button, [role="button"], input[type="button"], a', root || global.document);
    return controls.find(function (element) {
      const values = [
        element.getAttribute('data-ha-action'),
        element.getAttribute('aria-label'),
        element.getAttribute('title'),
        element.id,
        element.textContent
      ].join(' ').toLowerCase();
      return /ha-mzero|reset|zerar|limpar sess[aã]o/.test(values);
    }) || null;
  }

  const actions = {
    openMenuAction: function (type, key) {
      if (type === 'client' && key === 'hunt-analyzer') {
        global.document.documentElement.classList.add('pch-hunt-expanded');
      }
      return type === 'system' ? systemAction(key) : clientAction(key);
    },
    togglePlayerTeam: function () {
      const root = dom.query(selectors.player.root);
      const control = dom.query(selectors.player.teamToggle) || dom.query(selectors.player.teamToggle, root || global.document);
      if (!root || !control || disabled(control)) return false;
      const willExpand = !isTeamExpanded(root);
      global.document.documentElement.classList.toggle('pch-team-expanded', willExpand);
      control.click();
      const nextRoot = dom.query(selectors.player.root) || root;
      global.document.documentElement.classList.toggle('pch-team-expanded', isTeamExpanded(nextRoot));
      return true;
    },
    toggleBoss: function () {
      const element = dom.query(selectors.boss.root);
      if (!element) return false;
      const html = global.document.documentElement;
      const expanded = html.classList.contains('pch-boss-expanded');
      html.classList.toggle('pch-boss-expanded', !expanded);
      element.click();
      return true;
    },
    resetHunt: function () {
      const root = dom.query(selectors.hunt.root);
      global.document.documentElement.classList.add('pch-hunt-expanded');
      if (root && !isHuntExpanded(root)) {
        const expand = dom.query(selectors.hunt.expand);
        if (expand && !disabled(expand)) expand.click();
      }
      const currentRoot = dom.query(selectors.hunt.root) || root || global.document;
      const element = findHuntResetControl(currentRoot);
      if (!element || disabled(element)) return false;
      element.click();
      return true;
    },
    toggleHuntDetails: function () {
      const html = global.document.documentElement;
      const root = dom.query(selectors.hunt.root);
      const expanded = isHuntExpanded(root);
      const control = dom.query(expanded ? selectors.hunt.minimize : selectors.hunt.expand);
      if (!control) return false;
      control.click();
      html.classList.toggle('pch-hunt-expanded', isHuntExpanded(root) || !expanded);
      return true;
    },
    activateMove: function (moveKey) {
      const element = dom.queryAll(selectors.skills.moves).find(function (candidate) {
        return candidate.getAttribute('data-move-key') === moveKey;
      });
      if (!element || element.disabled || element.getAttribute('aria-disabled') === 'true') return false;
      element.click();
      return true;
    }
  };

  app.modules.actions = actions;
})(globalThis);
