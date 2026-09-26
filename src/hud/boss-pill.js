(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;

  function mount(parent, actions) {
    const button = dom.create('button', 'pch-boss-pill');
    button.type = 'button';
    button.setAttribute('aria-label', 'Abrir detalhes do Boss Global');
    const label = dom.create('span', 'pch-boss-label', 'BOSS');
    const time = dom.create('strong', 'pch-boss-time', '--:--:--');
    button.append(label, time);
    parent.append(button);
    button.addEventListener('click', function () { actions.toggleBoss(); });

    function update(state) {
      const boss = state.boss || {};
      button.hidden = !boss.visible;
      dom.setText(time, boss.time, '--:--:--');
      button.title = boss.detail || boss.label || 'Boss Global';
      return Boolean(boss.available && boss.visible);
    }

    return { update };
  }

  app.modules.bossPill = { mount };
})(globalThis);
