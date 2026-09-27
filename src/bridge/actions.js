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

  function menuAction(action) {
    return clickByAttribute(
      dom.query(selectors.menu.root) || global.document,
      selectors.menu.visibleAction,
      'data-menu-id',
      action
    );
  }

  function isTeamExpanded(root) {
    if (!root || !root.classList) return false;
    return !root.classList.contains('collapsed') && !root.classList.contains('is-minimized');
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
        const opened = clientAction(key);
        if (opened) global.document.documentElement.classList.add('pch-hunt-expanded');
        return opened;
      }
      if (type === 'client' && key === 'auto-helper') {
        const helper = dom.query(selectors.helper.root);
        const toggle = dom.query(selectors.helper.minimize);
        if (helper && toggle && (
          helper.classList.contains('collapsed') ||
          helper.getAttribute('aria-expanded') === 'false'
        )) {
          toggle.click();
          global.document.documentElement.classList.add('pch-helper-expanded');
          return true;
        }
      }
      if (type === 'menu') return menuAction(key);
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
    activatePokemon: function (uid) {
      const slot = dom.queryAll(selectors.player.teamSlots).find(function (candidate) {
        return candidate.getAttribute('data-poke-uid') === uid;
      });
      if (!slot || disabled(slot)) return false;
      slot.click();
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
      const currentRoot = dom.query(selectors.hunt.root) || root || global.document;
      const more = dom.query('#ha-btnMore');
      if (more && more.getAttribute('aria-expanded') !== 'true') more.click();
      const element = findHuntResetControl(currentRoot);
      if (!element || disabled(element)) return false;
      element.click();
      const confirm = dom.query('#ha-cYes');
      if (confirm && !disabled(confirm)) confirm.click();
      return true;
    },
    toggleHuntDetails: function () {
      const root = dom.query(selectors.hunt.root);
      if (!root) return false;
      if (root.classList.contains('collapsed')) {
        const restore = dom.query(selectors.hunt.minimize);
        if (restore && !disabled(restore)) restore.click();
      }
      global.document.documentElement.classList.add('pch-hunt-expanded');
      return true;
    },
    activateMove: function (moveKey) {
      const element = dom.queryAll(selectors.skills.moves).find(function (candidate) {
        return candidate.getAttribute('data-move-key') === moveKey;
      });
      if (!element || element.disabled || element.getAttribute('aria-disabled') === 'true') return false;
      element.click();
      return true;
    },
    toggleChat: function () {
      const root = dom.query(selectors.chat.root);
      const control = dom.query(selectors.chat.minimize);
      if (!root || !control || disabled(control)) return false;
      const html = global.document.documentElement;
      const currentlyShown = html.classList.contains('pch-chat-expanded');
      if (currentlyShown) {
        if (!root.classList.contains('minimized') && !root.classList.contains('is-minimized')) {
          control.click();
        }
        html.classList.remove('pch-chat-expanded');
      } else {
        if (root.classList.contains('minimized') || root.classList.contains('is-minimized')) {
          control.click();
        }
        html.classList.add('pch-chat-expanded');
      }
      return true;
    }
  };

  app.modules.actions = actions;
})(globalThis);
