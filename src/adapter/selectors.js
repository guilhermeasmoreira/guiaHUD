(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};

  app.modules.selectors = {
    referenceHud: '#reference-hud',
    player: {
      root: '#pokemon-team-bar',
      name: '#pokemon-team-bar .player-name',
      summary: '#pokemon-team-bar .player-summary',
      teamList: '#pokemon-team-bar .team-list',
      teamToggle: '#pokemon-team-bar .team-minimize',
      teamSlots: '#pokemon-team-bar .team-slot'
    },
    target: {
      root: '#reference-hud [data-rh-panel="target"]',
      name: '#rh-name',
      level: '#rh-level',
      hpFill: '#rh-hp-fill',
      hpText: '#rh-hp-text',
      legacyRoot: '#target-card',
      legacyName: '#target-name',
      legacyInfo: '#target-level',
      legacyHpFill: '#target-hp'
    },
    hunt: {
      root: '#ha-panel',
      time: '#ha-mTime',
      balancePerHour: '#ha-mSaldoH',
      xpPerHour: '#ha-mXph',
      defeated: '#ha-mKills',
      shiny: '#ha-cpShiny .num',
      mega: '#ha-cpMega .num',
      boss: '#ha-cpBoss .num',
      reset: '#ha-mZero',
      expand: '#ha-btnExp',
      minimize: '#minimize-hunt-analyzer'
    },
    boss: {
      root: '#shiny-global-next',
      label: '#shiny-global-next-label',
      time: '#shiny-global-next-time',
      detail: '#shiny-global-next-detail'
    },
    skills: {
      root: '#pokemon-skills-window',
      list: '#pokemon-moves',
      moves: '#pokemon-moves [data-move-key]'
    },
    chat: {
      root: '#game-chat',
      handle: '#game-chat-handle',
      onlineCount: '#chat-online-members-count',
      minimize: '#minimize-chat'
    },
    helper: {
      root: '#auto-helper-panel',
      minimize: '#minimize-auto-helper'
    },
    menu: {
      root: '#pio-main-menu',
      legacyRoot: '.unified-client-actions.mainbar',
      visibleAction: '#pio-main-menu [data-menu-id]',
      clientAction: '[data-client-action]',
      systemOpen: '[data-system-open]'
    }
  };
})(globalThis);
