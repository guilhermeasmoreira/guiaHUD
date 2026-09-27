(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;

  function mount(parent, initialSettings, handlers) {
    const backdrop = dom.create('div', 'pch-settings-backdrop');
    backdrop.hidden = true;
    backdrop.setAttribute('role', 'presentation');

    const panel = dom.create('section', 'pch-settings-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'pch-settings-title');

    const heading = dom.create('div', 'pch-settings-heading');
    const title = dom.create('h2', '', 'Configurações da HUD');
    title.id = 'pch-settings-title';
    const close = dom.create('button', 'pch-icon-button', 'Fechar');
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar configurações');
    heading.append(title, close);

    const themeLabel = dom.create('label', 'pch-setting-row');
    const themeText = dom.create('span', '', 'Tema');
    const theme = dom.create('select', 'pch-select');
    theme.setAttribute('aria-label', 'Tema da HUD');
    const minimal = dom.create('option', '', 'Padrão minimalista');
    minimal.value = 'minimal';
    theme.append(minimal);
    const malefic = dom.create('option', '', 'Malefic');
    malefic.value = 'malefic';
    theme.append(malefic);
    [
      ['ice', 'Seavell'],
      ['fire', 'Volcanic'],
      ['stone', 'Orebound'],
      ['dragon', 'Wingeon'],
      ['naturia', 'Naturia'],
      ['gardestrike', 'GardeStrike'],
      ['psycraft', 'Psycraft'],
      ['rainbolt', 'Rainbolt']
    ].forEach(function ([value, label]) {
      const option = dom.create('option', '', label);
      option.value = value;
      theme.append(option);
    });
    themeLabel.append(themeText, theme);

    const compactLabel = dom.create('label', 'pch-setting-row');
    const compactText = dom.create('span', '', 'Modo compacto');
    const compact = dom.create('input', 'pch-checkbox');
    compact.type = 'checkbox';
    compactLabel.append(compactText, compact);

    const note = dom.create('p', 'pch-settings-note', 'Arraste os controles pontilhados para posicionar os elementos. As posições ficam salvas neste navegador.');
    const disable = dom.create('button', 'pch-danger-button', 'Desativar HUD');
    disable.type = 'button';

    panel.append(heading, themeLabel, compactLabel, note, disable);
    backdrop.append(panel);
    parent.append(backdrop);

    let settings = Object.assign({}, initialSettings);
    function sync(nextSettings) {
      settings = Object.assign({}, settings, nextSettings || {});
      theme.value = settings.theme || 'minimal';
      compact.checked = settings.compact !== false;
    }

    function setOpen(open) {
      backdrop.hidden = !open;
      if (open) close.focus();
    }

    close.addEventListener('click', function () { setOpen(false); });
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) setOpen(false);
    });
    const onKeydown = function (event) {
      if (event.key === 'Escape' && !backdrop.hidden) setOpen(false);
    };
    global.document.addEventListener('keydown', onKeydown);
    theme.addEventListener('change', function () {
      settings.theme = theme.value || 'minimal';
      if (handlers && handlers.onChange) handlers.onChange(Object.assign({}, settings));
    });
    compact.addEventListener('change', function () {
      settings.compact = compact.checked;
      if (handlers && handlers.onChange) handlers.onChange(Object.assign({}, settings));
    });
    disable.addEventListener('click', function () {
      if (handlers && handlers.onDisable) handlers.onDisable();
    });
    sync(settings);

    return {
      open: function () { setOpen(true); },
      close: function () { setOpen(false); },
      update: sync,
      destroy: function () { global.document.removeEventListener('keydown', onKeydown); }
    };
  }

  app.modules.settingsPanel = { mount };
})(globalThis);
