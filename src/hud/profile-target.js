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
    const playerChevron = dom.create('span', 'pch-player-chevron', '⌄');
    playerChevron.setAttribute('aria-hidden', 'true');
    player.append(playerName, playerMeta, playerChevron);

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

    const teamPanel = dom.create('div', 'pch-team-panel');
    teamPanel.hidden = true;
    teamPanel.setAttribute('aria-label', 'Selecionar Pokémon ativo');

    card.append(player, target, teamPanel);
    parent.append(card);

    let expanded = false;
    let teamSignature = '';

    function setExpanded(next) {
      expanded = Boolean(next);
      teamPanel.hidden = !expanded;
      player.setAttribute('aria-expanded', String(expanded));
      player.setAttribute('aria-label', expanded
        ? 'Minimizar seleção de Pokémon'
        : 'Expandir seleção de Pokémon');
      dom.setText(playerChevron, expanded ? '⌃' : '⌄', '⌄');
    }

    player.addEventListener('click', function () { setExpanded(!expanded); });
    teamPanel.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-poke-uid]');
      if (!button || button.disabled) return;
      if (actions.activatePokemon(button.dataset.pokeUid)) setExpanded(false);
    });

    function renderTeam(team) {
      const signature = team.map(function (pokemon) {
        return [pokemon.uid, pokemon.name, pokemon.level, pokemon.hp, pokemon.maxHp,
          pokemon.hpPercent, pokemon.active, pokemon.sprite ? pokemon.sprite.length : 0].join(':');
      }).join('|');
      if (signature === teamSignature) return;
      teamSignature = signature;
      teamPanel.replaceChildren();
      team.forEach(function (pokemon) {
        const button = dom.create('button', 'pch-team-pokemon');
        button.type = 'button';
        button.dataset.pokeUid = pokemon.uid;
        button.setAttribute('aria-label', 'Ativar ' + pokemon.name);
        if (pokemon.active) {
          button.classList.add('is-active');
          button.disabled = true;
        }

        const visual = dom.create('span', 'pch-team-sprite');
        if (pokemon.sprite) {
          const image = dom.create('img');
          image.src = pokemon.sprite;
          image.alt = '';
          visual.append(image);
        } else {
          dom.setText(visual, '●', '●');
        }

        const copy = dom.create('span', 'pch-team-copy');
        const top = dom.create('span', 'pch-team-name-row');
        const name = dom.create('strong', 'pch-team-name', pokemon.name);
        const level = dom.create('span', 'pch-team-level', pokemon.level == null ? '' : 'Nv. ' + pokemon.level);
        top.append(name, level);

        const hpRow = dom.create('span', 'pch-team-hp-row');
        const track = dom.create('span', 'pch-team-hp-track');
        const fill = dom.create('span', 'pch-team-hp-fill');
        const percent = pokemon.hpPercent != null
          ? pokemon.hpPercent
          : pokemon.hp != null && pokemon.maxHp > 0
            ? pokemon.hp / pokemon.maxHp * 100
            : 0;
        fill.style.width = Math.max(0, Math.min(100, percent)) + '%';
        track.append(fill);
        const hpText = dom.create('span', 'pch-team-hp-value',
          pokemon.hp != null && pokemon.maxHp != null ? pokemon.hp + ' / ' + pokemon.maxHp : 'HP —');
        hpRow.append(track, hpText);
        copy.append(top, hpRow);
        button.append(visual, copy);
        teamPanel.append(button);
      });
    }

    function update(state) {
      const profile = state.player || {};
      const currentTarget = state.target || {};
      dom.setText(playerName, profile.name, 'Treinador');
      const playerDetails = [];
      if (profile.level != null) playerDetails.push('Nv. ' + profile.level);
      if (profile.activePokemonName) playerDetails.push(profile.activePokemonName);
      dom.setText(playerMeta, playerDetails.join(' · '), '');
      renderTeam(profile.team || []);

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
        playerReady: Boolean(profile.available && profile.team && profile.team.length),
        targetReady: targetReady && (hasHp || currentTarget.level != null || Boolean(currentTarget.name)),
        teamExpanded: expanded
      };
    }

    return { update };
  }

  app.modules.profileTarget = { mount };
})(globalThis);
