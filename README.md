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
Version 0.9.1 adds the two-card Modo Econômico screen, reduces adapter layout reads, places game modals above the HUD, and moves Treinador before Bolsa in the top menu. Privacy and Chrome Web Store preparation are documented in [PRIVACY.md](PRIVACY.md) and [STORE_SUBMISSION.md](STORE_SUBMISSION.md).

## Modo Econômico

Recarregue a extensão em `chrome://extensions/` e atualize a aba do jogo. Nas configurações da guiaHUD, ative **Modo Econômico**. O desenho da hunt para e a guiaHUD cobre o último frame com uma tela preta e dois cards; o canvas não é ocultado ou modificado. A simulação, o Analyzer e a HUD devem continuar. Desative o toggle para retomar a imagem. Se a versão do jogo não expuser `PokeIdleHuntPresentation.HuntPresentation.prototype.render`, a opção aparece indisponível. O estado inicial é desligado quando não existe preferência salva.

No Console da página, `__GUIA_RENDER_CONTROL__.status()` mostra `installed`, `paused`, `calls`, `skipped`, `hookIntact` e `hdModern`. Durante o modo ativo, `skipped` deve aumentar. Esse primeiro controle cobre apenas a apresentação da hunt normal; `presentHdFrame()` e a opção HD Modern do jogo permanecem independentes. Verifique por pelo menos um minuto se derrotas, XP, HP, cooldowns, capturas e Analyzer continuam avançando, se o mapa volta após desativar e se não há erros ou requests `client-render-diagnostic` novos.

## Load in Chrome

1. Open Chrome's Extensions page and enable Developer mode.
2. Choose Load unpacked and select the repository root folder, the one containing `manifest.json` (not `src`).
3. Open https://pokeidle.online/game/.
4. Use the gear button to change the compact setting or disable the HUD. When disabled, the small Ativar HUD button restores it without reloading.

The extension only matches the game page and requests the storage permission for its own settings. After pulling an update, click **Reload** on the extension in `chrome://extensions/`, then refresh the game tab.

## Usar com Tampermonkey

O arquivo pronto é [userscript/guiaHUD.user.js](userscript/guiaHUD.user.js). Instale Tampermonkey no navegador e, no painel dele, escolha **Criar novo script**. Apague o modelo, cole o conteúdo completo desse arquivo e salve com Ctrl+S. No Chrome recente, abra os detalhes da extensão Tampermonkey em `chrome://extensions/` e habilite **Permitir scripts de usuário**; se esse controle não aparecer, habilite **Modo do desenvolvedor** na página de extensões. Abra ou recarregue `https://pokeidle.online/game/` e confira que a guiaHUD apareceu. Desative a extensão guiaHUD instalada separadamente antes de testar o userscript para evitar duas interfaces.

O userscript roda no contexto da página em `document-start`, necessário para instalar o mesmo hook do Modo Econômico. Tema, modo compacto, Modo Econômico e posições arrastadas ficam no `localStorage` desse site com prefixo `guiaHUD.userscript.`; as preferências da extensão Chrome não são importadas automaticamente. Com a HUD carregada, abra a engrenagem e configure o tema. Para conferir o hook no Console: `__GUIA_RENDER_CONTROL__.status()`.

Após modificar `src/`, `manifest.json` ou o CSS, rode `npm run build:userscript` e versione também o arquivo gerado. O build copia os módulos na ordem do manifest e incorpora todos os estilos, sem dependências de CDN. `python3 scripts/build-userscript.py --check` verifica se o arquivo gerado está atualizado. Atualizações via URL do repositório dependem de incrementar a versão do manifest e refazer o build.

## Manual regression checklist

- Confirm the top menu becomes a compact command bar and **Helper** opens the game's original Auto Helper.
- Confirm **Treinador** is first, before **Bolsa**, and opens the game's native profile; Capturas remains in **Mais**. Map and store windows should appear above the HUD.
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

For a Chrome Web Store package run `python3 scripts/package-extension.py`. It includes only files referenced by the manifest, with `manifest.json` at ZIP root. The promotional image stays outside that ZIP. See [STORE_SUBMISSION.md](STORE_SUBMISSION.md) for the remaining live screenshot and dashboard steps.
