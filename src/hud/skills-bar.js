(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;

  function mount(parent, actions) {
    const bar = dom.create('nav', 'pch-skills-bar');
    bar.setAttribute('aria-label', 'Habilidades do Pokémon ativo');
    const title = dom.create('span', 'pch-skills-title', 'Skills');
    const moves = dom.create('div', 'pch-skills-moves');
    bar.append(title, moves);
    parent.append(bar);

    let currentSignature = '';
    bar.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-move-key]');
      if (!button || button.disabled) return;
      actions.activateMove(button.dataset.moveKey);
    });

    function update(state) {
      const skillState = state.skills || {};
      const list = skillState.moves || [];
      const signature = JSON.stringify(list);
      if (signature !== currentSignature) {
        currentSignature = signature;
        moves.replaceChildren();
        list.forEach(function (move) {
          const button = dom.create('button', 'pch-skill-button');
          button.type = 'button';
          button.dataset.moveKey = move.key;
          button.title = move.name + (move.type ? ' · ' + move.type : '');
          button.setAttribute('aria-label', move.name + (move.cooldown ? ', recarga ' + move.cooldown : ''));
          button.disabled = Boolean(move.disabled || (move.coolingDown && !move.ready));
          if (move.ready) button.classList.add('is-ready');
          if (move.coolingDown) button.classList.add('is-cooling');
          const name = dom.create('span', 'pch-skill-name', move.name);
          const cooldown = dom.create('span', 'pch-skill-cooldown', move.cooldown || '');
          cooldown.hidden = !move.cooldown;
          button.append(name, cooldown);
          moves.append(button);
        });
      }
      const ready = Boolean(skillState.available && list.length);
      bar.hidden = !ready;
      return ready;
    }

    return { update };
  }

  app.modules.skillsBar = { mount };
})(globalThis);
