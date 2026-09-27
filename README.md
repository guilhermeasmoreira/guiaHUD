# Poké Idle Clan HUD

Visual references for Fogo, Malefic, and Gelo are saved in [design/README.md](design/README.md). The settings menu offers Padrão minimalista, Malefic, Gelo, Fogo, Pedra, and Dragão.

Chrome Manifest V3 extension that presents the compact **Padrão minimalista** HUD for Poké Idle Online. It reads values from the game's existing DOM and forwards actions to original controls.

Version 0.7.0 adds Gelo, Fogo, Pedra, and Dragão as CSS themes. The compact HUD remains functional across themes; the chat, Auto Helper, and known native controls receive matching colors.

## Load in Chrome

1. Open Chrome's Extensions page and enable Developer mode.
2. Choose Load unpacked and select the repository root folder, the one containing `manifest.json` (not `src`).
3. Open https://pokeidle.online/game/.
4. Use the gear button to change the compact setting or disable the HUD. When disabled, the small Ativar HUD button restores it without reloading.

The extension only matches the game page and requests the storage permission for its own settings. After pulling an update, click **Reload** on the extension in `chrome://extensions/`, then refresh the game tab.

## Manual regression checklist

- Confirm the top menu becomes a compact command bar and **Helper** opens the game's original Auto Helper.
- Confirm the compact chat control opens and closes the original themed chat without leaving a duplicate control.
- Confirm the original trainer/team panel is hidden. Click the trainer name in the compact profile, check the minimal Pokémon list and sprites, select another Pokémon, then confirm the list closes and the active name updates.
- Confirm horizontal and vertical scrollbars use the minimal style, especially the skills row and the expanded Pokémon list.
- In the gear menu select **Malefic**. Check the purple frames, iconography, green HP and stat accents, Hunt Analyzer at the upper right, chat at the lower left, and that all controls still work. Dragged widget positions from earlier versions take precedence; double-click a dotted drag control to reset its widget position.
- Switch through **Gelo**, **Fogo**, **Pedra**, and **Dragão**. Check the profile, menu, Hunt Analyzer, skills, chat, Auto Helper, and native shortcuts in each. Verify that the selected theme remains after refreshing the tab.
- Confirm skill cooldown values appear and update using the game's own cooldown display.
- Click **Zerar** in Hunt Analyzer; the native reset and confirmation run without showing a second analyzer. The ↗ control switches to the native analyzer; minimizing it restores the compact one.
- Confirm target, Boss, and Hunt Analyzer values continue updating during play.

## Structure

- src/adapter: centralized game selectors and normalized live state.
- src/state: normalized state store.
- src/bridge: clicks original game controls for menu, skills, boss, and Hunt Analyzer actions.
- src/hud: compact profile/target, boss, analyzer, menu, and skills components.
- src/themes: shared layout, Padrão minimalista, Malefic, and four elemental CSS themes.
- src/settings: extension-owned preferences and enable/disable controls.
- tests: parser and adapter tests using a small fixture-like DOM.

## Checks

Run npm test with Node.js. The adapter is also available in the DevTools console when the content-script execution context is selected as PokeClanHUD; PokeClanHUD.debug() reports which game roots were detected and PokeClanHUD.refresh() refreshes the displayed state.

Live regression still needs to be checked in the running game, especially menu action names and the game's expanded Hunt Analyzer and Boss behavior.
