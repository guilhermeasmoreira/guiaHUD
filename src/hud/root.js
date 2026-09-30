(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;

  function mount(initialState, initialSettings, actions, handlers) {
    const host = dom.create('div');
    host.id = 'poke-clan-hud-root';
    const shell = dom.create('div', 'pch-shell');
    const economyScreen = dom.create('div', 'pch-economy-screen');
    economyScreen.hidden = true;
    economyScreen.setAttribute('aria-label', 'Modo Econômico');
    const economyCards = dom.create('div', 'pch-economy-cards');

    function makeEconomyCard(label) {
      const card = dom.create('section', 'pch-economy-card');
      const heading = dom.create('span', 'pch-economy-label', label);
      const sprite = dom.create('img', 'pch-economy-sprite');
      sprite.alt = '';
      sprite.hidden = true;
      const fallback = dom.create('span', 'pch-economy-sprite-fallback', '●');
      fallback.setAttribute('aria-hidden', 'true');
      const name = dom.create('strong', 'pch-economy-name');
      const level = dom.create('span', 'pch-economy-level');
      const hp = dom.create('span', 'pch-economy-hp');
      card.append(heading, sprite, fallback, name, level, hp);
      economyCards.append(card);
      return { card, sprite, fallback, name, level, hp };
    }
    const activeCard = makeEconomyCard('POKÉMON ATIVO');
    const targetCard = makeEconomyCard('POKÉMON ALVO');
    economyScreen.append(economyCards);
    shell.append(economyScreen);

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
      const theme = currentSettings.theme;
      shell.dataset.theme = ['minimal', 'malefic', 'ice', 'fire', 'stone', 'dragon',
        'naturia', 'gardestrike', 'psycraft', 'rainbolt'].includes(theme)
        ? theme : 'minimal';
      shell.dataset.compact = String(currentSettings.compact !== false);
      const team = state.player && state.player.team || [];
      const activePokemon = team.find(function (pokemon) { return pokemon.active; }) || null;
      const targetPokemon = state.target || {};
      function updateCard(card, pokemon, fallbackName) {
        dom.setText(card.name, pokemon && pokemon.name, fallbackName);
        dom.setText(card.level, pokemon && pokemon.level != null ? 'Nv. ' + pokemon.level : '', '');
        dom.setText(card.hp, pokemon && pokemon.hp != null && pokemon.maxHp != null
          ? 'HP ' + pokemon.hp + ' / ' + pokemon.maxHp : '', '');
        const sprite = pokemon && pokemon.sprite;
        if (sprite && card.sprite.src !== sprite) card.sprite.src = sprite;
        card.sprite.hidden = !sprite;
        card.fallback.hidden = Boolean(sprite);
      }
      updateCard(activeCard, activePokemon || { name: state.player && state.player.activePokemonName }, 'Pokémon ativo');
      updateCard(targetCard, targetPokemon.visible ? targetPokemon : null, 'Sem alvo');
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
      setEconomyActive: function (paused) { economyScreen.hidden = paused !== true; },
      setRenderAvailable: settingsPanel.setRenderAvailable,
      destroy: function () {
        settingsPanel.destroy();
        host.remove();
      }
    };
  }

  app.modules.hudRoot = { mount };
})(globalThis);
