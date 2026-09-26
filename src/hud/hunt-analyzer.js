(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;

  function metric(label, className) {
    const item = dom.create('div', 'pch-metric ' + (className || ''));
    const caption = dom.create('span', 'pch-metric-label', label);
    const value = dom.create('strong', 'pch-metric-value', '—');
    item.append(caption, value);
    return { item, value };
  }

  function mount(parent, actions) {
    const card = dom.create('section', 'pch-card pch-hunt-card');
    card.setAttribute('aria-label', 'Hunt Analyzer compacto');

    const heading = dom.create('div', 'pch-hunt-heading');
    const titleBlock = dom.create('div', 'pch-hunt-title-block');
    const title = dom.create('strong', 'pch-hunt-title', 'HUNT ANALYZER');
    const time = dom.create('span', 'pch-hunt-time', 'Tempo: —');
    titleBlock.append(title, time);
    const controls = dom.create('div', 'pch-hunt-controls');
    const details = dom.create('button', 'pch-text-button', 'Detalhes');
    details.type = 'button';
    details.setAttribute('aria-label', 'Abrir Hunt Analyzer completo');
    const reset = dom.create('button', 'pch-icon-button', 'Zerar');
    reset.type = 'button';
    reset.setAttribute('aria-label', 'Zerar Hunt Analyzer');
    controls.append(details, reset);
    heading.append(titleBlock, controls);

    const metrics = dom.create('div', 'pch-metrics-row');
    const balance = metric('Saldo/h');
    const xp = metric('XP/h');
    const defeated = metric('Derrotados');
    metrics.append(balance.item, xp.item, defeated.item);

    const counts = dom.create('div', 'pch-counts-row');
    const shiny = metric('Shiny', 'pch-count');
    const mega = metric('Mega', 'pch-count');
    const bosses = metric('Boss', 'pch-count');
    counts.append(shiny.item, mega.item, bosses.item);

    card.append(heading, metrics, counts);
    parent.append(card);

    let detailsOpen = false;
    details.addEventListener('click', function () {
      if (!actions.toggleHuntDetails()) return;
      detailsOpen = !detailsOpen;
      dom.setText(details, detailsOpen ? 'Fechar detalhes' : 'Detalhes', '');
      details.setAttribute('aria-expanded', String(detailsOpen));
    });
    reset.addEventListener('click', function () { actions.resetHunt(); });

    function update(state) {
      const hunt = state.hunt || {};
      card.hidden = !hunt.available;
      dom.setText(time, 'Tempo: ' + (hunt.time || '—'), '');
      dom.setText(balance.value, hunt.balancePerHour, '—');
      dom.setText(xp.value, hunt.xpPerHour, '—');
      dom.setText(defeated.value, hunt.defeated, '—');
      dom.setText(shiny.value, hunt.shiny, '0');
      dom.setText(mega.value, hunt.mega, '0');
      dom.setText(bosses.value, hunt.boss, '0');
      return Boolean(hunt.available);
    }

    return { update };
  }

  app.modules.huntAnalyzer = { mount };
})(globalThis);
