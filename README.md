# Poké Idle Clan HUD

Visual references for Volcanic, Malefic, and Seavell are saved in [design/README.md](design/README.md). The settings menu offers Padrão minimalista, Malefic, Seavell, Volcanic, Orebound, Wingeon, Naturia, GardeStrike, Psycraft, and Rainbolt.

Chrome Manifest V3 extension that presents the compact **Padrão minimalista** HUD for Poké Idle Online. It reads values from the game's existing DOM and forwards actions to original controls.

Version 0.8.0 adds Naturia (Planta/Inseto), GardeStrike (Lutador), Psycraft (Psíquico), and Rainbolt (Elétrico). The former Gelo, Fogo, Pedra, and Dragão themes are now displayed as Seavell, Volcanic, Orebound, and Wingeon. Their internal IDs remain unchanged so saved preferences continue working. The compact HUD remains functional across themes; the chat, Auto Helper, and known native controls receive matching colors.
Version 0.8.1 unifies the clan symbols as thin outline SVGs inspired by the compact Seavell snowflake. The same themed symbol appears in the profile and skills bar. Reusable exports are in [design/icons](design/icons/README.md).
Version 0.8.2 adds thin neon gradient borders to the HUD panels and known game panels in every theme, with rounded corners and a restrained glow.
Version 0.8.3 targets the game's fixed Mail and Quick Shortcuts controls directly, suppresses their generated blue frames while the HUD is enabled, and shortens the four new theme labels in the selector.
Version 0.8.4 gives the Mail control's theme rule priority over the game's own blue background and border declarations.

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
- Switch through **Seavell**, **Volcanic**, **Orebound**, **Wingeon**, **Naturia**, **GardeStrike**, **Psycraft**, and **Rainbolt**. Check the profile, menu, Hunt Analyzer, skills, chat, Auto Helper, and native shortcuts in each. Verify that the selected theme remains after refreshing the tab.
- Check that the neon gradient follows rounded panel corners in every theme, including **Padrão minimalista** and **Malefic**, and that the chat, Auto Helper, mail, shortcuts, and expanded panels stay legible.
- Confirm skill cooldown values appear and update using the game's own cooldown display.
- Click **Zerar** in Hunt Analyzer; the native reset and confirmation run without showing a second analyzer. The ↗ control switches to the native analyzer; minimizing it restores the compact one.
- Confirm target, Boss, and Hunt Analyzer values continue updating during play.

## Structure

- src/adapter: centralized game selectors and normalized live state.
- src/state: normalized state store.
- src/bridge: clicks original game controls for menu, skills, boss, and Hunt Analyzer actions.
- src/hud: compact profile/target, boss, analyzer, menu, and skills components.
- src/themes: shared layout, Padrão minimalista, Malefic, and eight elemental CSS themes.
- src/settings: extension-owned preferences and enable/disable controls.
- tests: parser and adapter tests using a small fixture-like DOM.

## Checks

Run npm test with Node.js. The adapter is also available in the DevTools console when the content-script execution context is selected as PokeClanHUD; PokeClanHUD.debug() reports which game roots were detected and PokeClanHUD.refresh() refreshes the displayed state.

Live regression still needs to be checked in the running game, especially menu action names and the game's expanded Hunt Analyzer and Boss behavior.
