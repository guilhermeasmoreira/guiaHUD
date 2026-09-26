(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;

  function mount(parent, actions) {
    const card = dom.create('section', 'pch-card pch-profile-card');
    card.setAttribute('aria-label', 'Perfil e alvo');

    const player = dom.create('button', 'pch-player-line pch-player-toggle');
    player.type = 'button';
    player.setAttribute('aria-expanded', 'false');
    player.setAttribute('aria-label', 'Abrir equipe para trocar o Pokémon ativo');
    const playerName = dom.create('strong', 'pch-player-name', 'Treinador');
    const playerMeta = dom.create('span', 'pch-player-meta');
    player.append(playerName, playerMeta);
    player.addEventListener('click', function () { actions.togglePlayerTeam(); });

    const target = dom.create('div', 'pch-target-line');
    target.hidden = true;
    const targetCopy = dom.create('div', 'pch-target-copy');
    const targetName = dom.create('strong', 'pch-target-name');
    const targetMeta = dom.create('span', 'pch-target-meta');
    targetCopy.append(targetName, targetMeta);

    const hp = dom.create('div', 'pch-target-hp');
    const hpTrack = dom.create('div', 'pch-hp-track');
    const hpFill = dom.create('div', 'pch-hp-fill');
    hpTrack.append(hpFill);
    const hpText = dom.create('span', 'pch-hp-text');
    hp.append(hpTrack, hpText);
    target.append(targetCopy, hp);

    card.append(player, target);
    parent.append(card);

    function update(state) {
      const profile = state.player || {};
      const currentTarget = state.target || {};
      dom.setText(playerName, profile.name, 'Treinador');
      const playerDetails = [];
      if (profile.level != null) playerDetails.push('Nv. ' + profile.level);
      if (profile.activePokemonName) playerDetails.push(profile.activePokemonName);
      dom.setText(playerMeta, playerDetails.join(' · '), '');
      player.setAttribute('aria-expanded', String(Boolean(profile.teamExpanded)));
      player.setAttribute('aria-label', profile.teamExpanded
        ? 'Equipe aberta. Use o controle do jogo para fechá-la.'
        : 'Abrir equipe para trocar o Pokémon ativo');

      const targetReady = Boolean(currentTarget.visible && currentTarget.name);
      target.hidden = !targetReady;
      dom.setText(targetName, currentTarget.name, '');
      dom.setText(targetMeta, currentTarget.level == null ? '' : 'Nv. ' + currentTarget.level, '');

      const hasHp = currentTarget.hp != null && currentTarget.maxHp != null;
      hp.hidden = !hasHp;
      dom.setText(hpText, hasHp ? currentTarget.hp + ' / ' + currentTarget.maxHp : '', '');
      const percent = currentTarget.hpPercent != null
        ? currentTarget.hpPercent
        : hasHp && currentTarget.maxHp > 0
          ? currentTarget.hp / currentTarget.maxHp * 100
          : 0;
      hpFill.style.width = Math.max(0, Math.min(100, percent)) + '%';
      return {
        targetReady: targetReady && (hasHp || currentTarget.level != null || Boolean(currentTarget.name)),
        teamExpanded: Boolean(profile.teamExpanded)
      };
    }

    return { update };
  }

  app.modules.profileTarget = { mount };
})(globalThis);
