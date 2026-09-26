# Poké Idle Clan HUD

Chrome Manifest V3 extension that presents a compact Ice themed HUD for Poké Idle Online. It reads values from the game's existing DOM and forwards actions to original controls.

## Load in Chrome

1. Open Chrome's Extensions page and enable Developer mode.
2. Choose Load unpacked and select this repository folder.
3. Open https://pokeidle.online/game/.
4. Use the gear button to change the compact setting or disable the HUD. When disabled, the small Ativar HUD button restores it without reloading.

The extension only matches the game page and requests the storage permission for its own settings.

## Structure

- src/adapter: centralized game selectors and normalized live state.
- src/state: normalized state store.
- src/bridge: clicks original game controls for menu, skills, boss, and Hunt Analyzer actions.
- src/hud: compact profile/target, boss, analyzer, menu, and skills components.
- src/themes: shared layout and the Ice theme.
- src/settings: extension-owned preferences and enable/disable controls.
- tests: parser and adapter tests using a small fixture-like DOM.

## Checks

Run npm test with Node.js. The adapter is also available in the page console as PokeClanHUD; PokeClanHUD.debug() reports which game roots were detected and PokeClanHUD.refresh() refreshes the displayed state.

Live regression still needs to be checked in the running game, especially menu action names and the game's expanded Hunt Analyzer and Boss behavior.
