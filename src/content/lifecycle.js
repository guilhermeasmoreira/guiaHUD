(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};

  const htmlClasses = [
    'poke-clan-hud-enabled',
    'pch-theme-minimal',
    'pch-theme-malefic',
    'pch-theme-ice',
    'pch-theme-fire',
    'pch-theme-stone',
    'pch-theme-dragon',
    'pch-theme-naturia',
    'pch-theme-gardestrike',
    'pch-theme-psycraft',
    'pch-theme-rainbolt',
    'pch-player-ready',
    'pch-chat-ready',
    'pch-chat-expanded',
    'pch-helper-expanded',
    'pch-target-ready',
    'pch-boss-ready',
    'pch-boss-expanded',
    'pch-hunt-ready',
    'pch-hunt-expanded',
    'pch-menu-ready',
    'pch-skills-ready'
  ];
  let settings = null;
  let adapter = null;
  let store = null;
  let hud = null;
  let restoreButton = null;
  let currentState = null;
  let active = false;
  let renderAvailable = false;

  function sendRenderControl(paused) {
    if (typeof global.CustomEvent !== 'function' || typeof global.dispatchEvent !== 'function') return;
    global.dispatchEvent(new global.CustomEvent('guiaHUD:render-control', {
      detail: { paused: paused === true }
    }));
  }

  function onRenderStatus(event) {
    const detail = event && event.detail;
    if (!detail || typeof detail.installed !== 'boolean' ||
      typeof detail.hookIntact !== 'boolean') return;
    renderAvailable = detail.installed && detail.hookIntact;
    if (hud && hud.setRenderAvailable) hud.setRenderAvailable(renderAvailable);
  }

  function onNativeHuntClick(event) {
    if (!active || !event.target || !event.target.closest) return;
    if (event.target.closest('#minimize-hunt-analyzer')) {
      global.document.documentElement.classList.remove('pch-hunt-expanded');
      global.setTimeout(app.modules.nativePanels.sync, 0);
    }
    if (event.target.closest('#minimize-chat')) {
      global.document.documentElement.classList.remove('pch-chat-expanded');
      global.setTimeout(app.modules.nativePanels.sync, 0);
    }
  }

  function clearClasses() {
    htmlClasses.forEach(function (name) {
      global.document.documentElement.classList.remove(name);
    });
  }

  function applyReadiness(readiness) {
    const html = global.document.documentElement;
    const flags = {
      'pch-player-ready': readiness.playerReady,
      'pch-target-ready': readiness.targetReady,
      'pch-boss-ready': readiness.bossReady,
      'pch-menu-ready': readiness.menuReady,
      'pch-hunt-ready': readiness.huntReady,
      'pch-skills-ready': readiness.skillsReady,
      'pch-chat-ready': readiness.chatReady
    };
    Object.keys(flags).forEach(function (name) {
      html.classList.toggle(name, Boolean(flags[name]));
    });
    app.modules.nativePanels.sync();
  }

  function applyTheme() {
    const theme = settings && settings.theme || 'minimal';
    const themes = ['minimal', 'malefic', 'ice', 'fire', 'stone', 'dragon',
      'naturia', 'gardestrike', 'psycraft', 'rainbolt'];
    themes.forEach(function (name) {
      global.document.documentElement.classList.toggle('pch-theme-' + name,
        name === theme || name === 'minimal' && !themes.includes(theme));
    });
  }

  function render() {
    if (!active || !hud || !store) return;
    currentState = store.getState();
    applyReadiness(hud.update(currentState, settings));
  }

  function removeRestoreButton() {
    if (restoreButton) restoreButton.remove();
    restoreButton = null;
  }

  function showRestoreButton() {
    if (restoreButton && restoreButton.isConnected) return;
    restoreButton = global.document.createElement('button');
    restoreButton.id = 'poke-clan-hud-enable';
    restoreButton.className = 'pch-enable-hud';
    restoreButton.type = 'button';
    restoreButton.textContent = 'Ativar HUD';
    restoreButton.setAttribute('aria-label', 'Ativar Poké Idle Clan HUD');
    restoreButton.addEventListener('click', function () {
      settings.enabled = true;
      app.modules.settingsStorage.save(settings).then(enable);
    });
    global.document.documentElement.append(restoreButton);
  }

  function disable() {
    active = false;
    sendRenderControl(false);
    app.modules.nativePanels.stop();
    if (adapter) adapter.destroy();
    adapter = null;
    if (hud) hud.destroy();
    hud = null;
    store = null;
    clearClasses();
    global.document.removeEventListener('click', onNativeHuntClick);
    removeRestoreButton();
    settings = Object.assign({}, settings || app.modules.settingsDefaults, { enabled: false });
    app.modules.settingsStorage.save(settings);
    showRestoreButton();
  }

  function updateSettings(nextSettings) {
    settings = Object.assign({}, settings, nextSettings || {});
    applyTheme();
    sendRenderControl(active && settings.economyMode === true);
    app.modules.settingsStorage.save(settings);
    if (hud && currentState) applyReadiness(hud.update(currentState, settings));
    app.modules.nativePanels.sync();
  }

  function enable() {
    removeRestoreButton();
    if (active) return;
    active = true;
    settings = Object.assign({}, settings || app.modules.settingsDefaults, { enabled: true });

    try {
      adapter = app.modules.adapter.createAdapter();
      currentState = adapter.read();
      store = app.modules.store.createStore(currentState);
      hud = app.modules.hudRoot.mount(currentState, settings, app.modules.actions, {
        onChange: updateSettings,
        onDisable: disable
      });
      if (!hud || !hud.host || !hud.host.isConnected) {
        throw new Error('Custom HUD root was not mounted');
      }

      global.document.documentElement.classList.add('poke-clan-hud-enabled');
      if (hud.setRenderAvailable) hud.setRenderAvailable(renderAvailable);
      app.modules.nativePanels.start();
      global.document.addEventListener('click', onNativeHuntClick);
      applyTheme();
      applyReadiness(hud.update(currentState, settings));
      store.subscribe(render);
      adapter.observe(function (nextState) {
        if (store) store.setState(nextState);
      });
      app.modules.settingsStorage.save(settings);
      sendRenderControl(settings.economyMode === true);
    } catch (error) {
      active = false;
      sendRenderControl(false);
      app.modules.nativePanels.stop();
      if (adapter) adapter.destroy();
      adapter = null;
      if (hud) hud.destroy();
      hud = null;
      store = null;
      clearClasses();
      global.document.removeEventListener('click', onNativeHuntClick);
      global.console.error('[Poké Idle Clan HUD] Não foi possível montar a interface.', error);
      showRestoreButton();
    }
  }

  function refresh() {
    if (!adapter) return null;
    const nextState = adapter.read();
    if (store) store.setState(nextState);
    else currentState = nextState;
    return nextState;
  }

  function debug() {
    return {
      active: active,
      settings: Object.assign({}, settings || {}),
      compatibility: currentState ? currentState.compatibility : null,
      selectors: app.modules.selectors,
      state: currentState
    };
  }

  function start() {
    global.addEventListener('guiaHUD:render-status', onRenderStatus);
    app.modules.settingsStorage.load().then(function (loaded) {
      settings = loaded;
      if (settings.enabled === false) {
        sendRenderControl(false);
        showRestoreButton();
      }
      else enable();
    }).catch(function (error) {
      global.console.error('[Poké Idle Clan HUD] Não foi possível carregar as configurações.', error);
      settings = Object.assign({}, app.modules.settingsDefaults);
      enable();
    });
  }

  app.modules.lifecycle = { start, enable, disable, refresh, debug };
  app.enable = enable;
  app.disable = disable;
  app.refresh = refresh;
  app.debug = debug;
})(globalThis);
