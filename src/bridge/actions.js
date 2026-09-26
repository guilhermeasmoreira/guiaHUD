(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;
  const selectors = app.modules.selectors;

  function clickByAttribute(root, selector, attribute, value) {
    const scope = root || global.document;
    const element = dom.queryAll(selector, scope).find(function (candidate) {
      return candidate.getAttribute(attribute) === value;
    });
    if (!element || element.disabled || element.getAttribute('aria-disabled') === 'true') return false;
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

  const actions = {
    openMenuAction: function (type, key) {
      if (type === 'client' && key === 'hunt-analyzer') {
        global.document.documentElement.classList.add('pch-hunt-expanded');
      }
      return type === 'system' ? systemAction(key) : clientAction(key);
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
      const element = dom.query(selectors.hunt.reset);
      if (!element || element.disabled) return false;
      global.document.documentElement.classList.add('pch-hunt-expanded');
      element.click();
      return true;
    },
    toggleHuntDetails: function () {
      const html = global.document.documentElement;
      const expanded = html.classList.contains('pch-hunt-expanded');
      const control = dom.query(expanded ? selectors.hunt.minimize : selectors.hunt.expand);
      if (!control) return false;
      control.click();
      html.classList.toggle('pch-hunt-expanded', !expanded);
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
