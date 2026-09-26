(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;
  const icons = app.modules.icons;

  function mount(parent, actions) {
    const button = dom.create('button', 'pch-chat-pill');
    button.type = 'button';
    button.setAttribute('aria-label', 'Abrir ou minimizar o chat geral');
    const label = dom.create('strong', 'pch-chat-label', 'CHAT');
    const status = dom.create('span', 'pch-chat-status', 'GERAL');
    button.append(icons.create('chat'), label, status);
    parent.append(button);

    button.addEventListener('click', function () {
      if (!actions.toggleChat()) return;
      button.hidden = global.document.documentElement.classList.contains('pch-chat-expanded');
    });

    function update(state) {
      const chat = state.chat || {};
      if (chat.minimized) global.document.documentElement.classList.remove('pch-chat-expanded');
      button.hidden = !chat.available || global.document.documentElement.classList.contains('pch-chat-expanded');
      dom.setText(status, chat.onlineCount ? '• ' + chat.onlineCount + ' ONLINE' : '• GERAL', '• GERAL');
      return Boolean(chat.available);
    }

    return { update };
  }

  app.modules.chatPill = { mount };
})(globalThis);
