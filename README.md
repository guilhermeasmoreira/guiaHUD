# Poké Idle Clan HUD

Visual references for Volcanic, Malefic, and Seavell are saved in [design/README.md](design/README.md). The settings menu offers Padrão minimalista, Malefic, Seavell, Volcanic, Orebound, Wingeon, Naturia, GardeStrike, Psycraft, and Rainbolt.

Chrome Manifest V3 extension that presents the compact **Padrão minimalista** HUD for Poké Idle Online. It reads values from the game's existing DOM and forwards actions to original controls.

Version 0.8.0 adds Naturia (Planta/Inseto), GardeStrike (Lutador), Psycraft (Psíquico), and Rainbolt (Elétrico). The former Gelo, Fogo, Pedra, and Dragão themes are now displayed as Seavell, Volcanic, Orebound, and Wingeon. Their internal IDs remain unchanged so saved preferences continue working. The compact HUD remains functional across themes; the chat, Auto Helper, and known native controls receive matching colors.
Version 0.8.1 unifies the clan symbols as thin outline SVGs inspired by the compact Seavell snowflake. The same themed symbol appears in the profile and skills bar. Reusable exports are in [design/icons](design/icons/README.md).
Version 0.8.2 adds thin neon gradient borders to the clan themes, with rounded corners and a restrained glow.
Version 0.8.3 targets the game's fixed Mail and Quick Shortcuts controls directly in clan themes, suppresses their generated blue frames, and shortens the four new theme labels in the selector.
Version 0.8.4 gives the Mail control's theme rule priority over the game's own blue background and border declarations.
Version 0.8.5 restores the original blue Padrão minimalista styling, including its native controls, while retaining neon clan themes.
Version 0.8.6 gives Wingeon a silver and white palette and a compact eight-point star inspired by the supplied emblem, including the icon in the profile and skills bar.
Version 0.8.7 adds a 15-second, boot-only Renderer Hook Probe in the page's MAIN world. It observes globals, RAF callbacks, script resources, and canvas context creation without altering the game loop.
Version 0.8.8 adds a separate Private Client Capture Probe to test a temporary `Object.prototype.lastRenderAt` accessor during boot and a reversible wrapper around the captured client's `render()` only.

## Private Client Capture Probe v2 (diagnóstico)

Recarregue a extensão em `chrome://extensions/`, depois recarregue a aba do jogo. O probe roda no MAIN world em `document_start` e remove o accessor do prototype após capturar o cliente ou depois de 15 segundos. No Console, execute:

```js
__GUIA_CLIENT_PROBE__.status()
__GUIA_CLIENT_PROBE__.methods()
__GUIA_CLIENT_PROBE__.renderSource()
```

Se `captured: true`, `prototypeTrapRemoved: true` e `renderHookInstalled: true`, registre HP, XP, derrotados e cooldowns; execute `__GUIA_CLIENT_PROBE__.pause()`, observe por 30 segundos, depois `__GUIA_CLIENT_PROBE__.resume()`. Compare os mesmos dados e veja se o mapa congela e volta, se a guiaHUD continua atualizando e se surgem erros ou requests `client-render-diagnostic`. Finalmente execute `__GUIA_CLIENT_PROBE__.restore()` para restaurar o método original e garantir a flag de pausa em `false`. `client()` devolve a referência real somente no Console; evite copiar o objeto inteiro. Envie apenas o resultado de `status()` antes da pausa, durante a pausa, após o resume e após o restore, além das observações. Não há download de dados da conta no v2.

Esse teste envolve **somente** `continuousHuntClient.render()` quando a validação de estrutura do cliente é satisfeita. Ele não altera `frame`, `present`, `owns`, os métodos de canvas, o RAF nem `presentHdFrame()`. Se `hdWebglReady` for `true`, o caminho HD/WebGL continuará visível e exigirá investigação separada. `captured: false` com `reason: "capture-timeout"` significa apenas que a escrita esperada não foi observada durante a janela de 15 segundos desse boot.

## Renderer Hook Probe (diagnóstico)

After pulling this version, reload the unpacked extension in `chrome://extensions/`, open the game's DevTools Console, and **reload the game tab** so the probe runs at `document_start`. Wait at least 15 seconds after the page begins loading. In the Console run:

```js
__GUIA_RENDER_PROBE__.summary()
__GUIA_RENDER_PROBE__.raf()
__GUIA_RENDER_PROBE__.suspicious()
__GUIA_RENDER_PROBE__.gameFrameSource()
__GUIA_RENDER_PROBE__.download()
```

Send the downloaded `guiahud-render-probe.json` and the output of `summary()`. If the frame is captured, `gameFrame()` returns its real function reference for local inspection. The full source is only exposed on explicit request through `gameFrameSource()` and is not included in the downloaded JSON. `summary().rendererCandidates` lists global object paths with a directly accessible `.render()` method. A candidate path is not proof that it belongs to the hunt renderer; inspect it before proposing a hook.

`gameFrameCaptured: true` means a RAF callback containing both `updateWithMovementGuard` and `continuousHuntClient.render` was scheduled through the intercepted method. A repeated `gameFrameCalls` count and `hasRecursiveRAFText` indicate it schedules itself, but replacing the outer RAF callback cannot selectively omit closed-over rendering calls while retaining simulation. If no renderer candidate is exposed, inspect public factories or shared prototypes next. Only then consider a narrow canvas-level diagnostic as a fallback; the probe never blocks canvas calls. Resources report filenames without URL query strings; newly created globals and function previews contain names/code only, not game object values or account state.

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
- Check that the neon gradient follows rounded panel corners in the clan themes and that the chat, Auto Helper, mail, shortcuts, and expanded panels stay legible. **Padrão minimalista** should retain its original blue styling.
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
