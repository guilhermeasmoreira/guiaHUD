(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;

  function mount(initialState, initialSettings, actions, handlers) {
    const host = dom.create('div');
    host.id = 'poke-clan-hud-root';
    const shell = dom.create('div', 'pch-shell');

    const topLeft = dom.create('div', 'pch-top-left');
    const profileSlot = dom.create('div', 'pch-profile-slot');
    const bossSlot = dom.create('div', 'pch-boss-slot');
    topLeft.append(profileSlot, bossSlot);

    const menuSlot = dom.create('div', 'pch-menu-slot');
    const settingsButton = dom.create('button', 'pch-settings-trigger', '⚙');
    settingsButton.type = 'button';
    settingsButton.setAttribute('aria-label', 'Abrir configurações da HUD');

    const huntSlot = dom.create('div', 'pch-hunt-slot');
    const skillsSlot = dom.create('div', 'pch-skills-slot');
    const chatSlot = dom.create('div', 'pch-chat-slot');
    shell.append(topLeft, menuSlot, settingsButton, huntSlot, skillsSlot, chatSlot);
    host.append(shell);
    global.document.documentElement.append(host);

    const profile = app.modules.profileTarget.mount(profileSlot, actions);
    const boss = app.modules.bossPill.mount(bossSlot, actions);
    const menu = app.modules.mainMenu.mount(menuSlot, actions);
    const hunt = app.modules.huntAnalyzer.mount(huntSlot, actions);
    const skills = app.modules.skillsBar.mount(skillsSlot, actions);
    const chat = app.modules.chatPill.mount(chatSlot, actions);
    const settingsPanel = app.modules.settingsPanel.mount(shell, initialSettings, handlers);
    app.modules.draggable.mount({
      perfil: topLeft,
      menu: menuSlot,
      hunt: huntSlot,
      habilidades: skillsSlot,
      chat: chatSlot
    });
    settingsButton.addEventListener('click', function () { settingsPanel.open(); });

    function update(state, settings) {
      const currentSettings = settings || initialSettings || {};
      shell.dataset.theme = currentSettings.theme === 'ice' ? 'minimal' : (currentSettings.theme || 'minimal');
      shell.dataset.compact = String(currentSettings.compact !== false);
      const profileState = profile.update(state);
      const playerReady = profileState.playerReady;
      const targetReady = profileState.targetReady;
      const bossReady = boss.update(state);
      const menuReady = menu.update(state);
      const huntReady = hunt.update(state);
      const skillsReady = skills.update(state);
      const chatReady = chat.update(state);
      settingsPanel.update(currentSettings);
      return { playerReady, targetReady, bossReady, menuReady, huntReady, skillsReady, chatReady };
    }

    update(initialState, initialSettings);

    return {
      host: host,
      update: update,
      destroy: function () {
        settingsPanel.destroy();
        host.remove();
      }
    };
  }

  app.modules.hudRoot = { mount };
})(globalThis);
