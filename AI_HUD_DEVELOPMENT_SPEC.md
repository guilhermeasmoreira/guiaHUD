# Poké Idle Clan HUD — AI Development Specification

> **Purpose of this document**
>
> This file is the primary technical and product specification for an AI coding agent working on the **Poké Idle Clan HUD** project.
>
> The agent should be able to understand **what must be built, how it should be architected, which Poké Idle DOM elements are reliable integration points, which parts of the original HUD should be reused, which parts should be visually replaced, and what must never be reimplemented** by reading this document alone.
>
> This specification was produced from a live DOM/CSS/runtime probe of `https://pokeidle.online/game/` on 2026-09-26.
>
> **Important:** the probe captured one explicit visual state (`baseline`) and approximately one minute of DOM mutations while the game was running. Dynamic behavior was observed, but not every expanded/minimized state was explicitly snapshot separately. Therefore, prefer resilient adapters and runtime discovery over assumptions about exact markup.

---

## 1. Project summary

Build a browser extension that replaces/reorganizes the visual HUD of **Poké Idle Online** with a **much more compact, modern, clan-themed HUD**, while preserving the game's original information and functionality.

The project is primarily a **presentation and interaction layer**, not a gameplay modification.

The user wants multiple visual themes inspired by Pokémon clans/elements, for example:

- Ice
- Orebound
- Malefic
- Naturia
- future clan themes

The themes must feel meaningfully different from one another, not merely recolors of the same interface.

The first implementation should prioritize architecture and a compact HUD over final artwork.

---

# 2. Core product goal

The current Poké Idle HUD occupies too much screen space and covers a significant portion of the game world.

The new extension should:

1. **Reduce screen obstruction substantially.**
2. **Combine related information instead of keeping many floating cards.**
3. **Remove decorative or redundant details that consume space.**
4. **Keep all important data visible or one interaction away.**
5. **Preserve the original game's buttons, actions, cooldowns, timers, states and logic.**
6. **Support multiple clan themes without duplicating game integration code.**
7. **Be resilient to reasonable DOM/CSS changes in the game.**

The guiding principle is:

> **Read the game, do not reimplement the game.**

---

# 3. Non-goals

Do **not**:

- reimplement Poké Idle combat;
- calculate HP independently when the game already exposes it;
- calculate cooldowns independently;
- calculate Hunt Analyzer values independently;
- recreate chat networking;
- recreate inventory logic;
- recreate boss timing logic;
- recreate the game's state machine;
- inject gameplay automation as part of this HUD project;
- depend on private APIs if the required information already exists in the DOM;
- copy the entire Poké Idle source code into this repository.

The extension should consume the game's existing DOM and, when necessary, forward interactions to original controls.

---

# 4. Important architectural decision

The project must be split into four conceptual layers:

```text
Poké Idle game
      ↓
Game Adapter
      ↓
Normalized HUD State
      ↓
HUD Components
      ↓
Theme
```

The theme must **not** directly query random Poké Idle selectors.

The visual components must **not** contain Poké Idle-specific parsing logic.

Only the adapter/integration layer should know about the game's DOM structure.

---

# 5. Recommended repository architecture

```text
pokeidle-clan-hud/
│
├─ manifest.json
├─ README.md
│
├─ src/
│  ├─ content/
│  │  ├─ index.js
│  │  ├─ bootstrap.js
│  │  └─ lifecycle.js
│  │
│  ├─ adapter/
│  │  ├─ index.js
│  │  ├─ selectors.js
│  │  ├─ observer.js
│  │  ├─ player.js
│  │  ├─ target.js
│  │  ├─ team.js
│  │  ├─ skills.js
│  │  ├─ hunt.js
│  │  ├─ boss.js
│  │  ├─ chat.js
│  │  ├─ buffs.js
│  │  ├─ menu.js
│  │  └─ resources.js
│  │
│  ├─ state/
│  │  ├─ store.js
│  │  ├─ schema.js
│  │  └─ actions.js
│  │
│  ├─ bridge/
│  │  ├─ actions.js
│  │  ├─ original-controls.js
│  │  └─ visibility.js
│  │
│  ├─ hud/
│  │  ├─ root.js
│  │  ├─ profile-target.js
│  │  ├─ boss-pill.js
│  │  ├─ hunt-analyzer.js
│  │  ├─ skills-bar.js
│  │  ├─ main-menu.js
│  │  ├─ buffs.js
│  │  ├─ chat.js
│  │  └─ quick-actions.js
│  │
│  ├─ themes/
│  │  ├─ base.css
│  │  ├─ ice/
│  │  │  ├─ theme.css
│  │  │  └─ tokens.js
│  │  ├─ orebound/
│  │  │  ├─ theme.css
│  │  │  └─ tokens.js
│  │  ├─ malefic/
│  │  └─ naturia/
│  │
│  ├─ settings/
│  │  ├─ defaults.js
│  │  ├─ storage.js
│  │  └─ panel.js
│  │
│  └─ utils/
│     ├─ dom.js
│     ├─ parse.js
│     ├─ events.js
│     └─ logger.js
│
├─ docs/
│  └─ AI_HUD_DEVELOPMENT_SPEC.md
│
└─ tests/
   ├─ adapter/
   └─ fixtures/
```

This exact structure is not mandatory, but the separation of responsibilities is.

---

# 6. Runtime environment observed

Probe environment:

```text
Game URL:
https://pokeidle.online/game/

Browser:
Chrome 153

Platform:
Windows

Language:
pt-BR

Viewport:
1753 × 858

Screen:
2560 × 1080

Device pixel ratio:
~1.10
```

Relevant root classes observed:

```text
html.hunt-turbo-entry.reference-hud
```

Relevant game UI variables observed:

```css
--responsive-desktop-ui-scale: 0.7944444444444444;
--rh-scale: 0.9695796460176991;

--ui-bg: #03172b;
--ui-deep: #00101f;
--ui-card: #062039;
--ui-raised: #0b2c49;

--ui-text: #edf7ff;
--ui-muted: #a9cde2;

--ui-edge: #258ecb;
--ui-cyan: #46d3ff;
--ui-gold: #ffd04d;

--rh-ink: #edf7ff;
--rh-muted: #a9ddf2;
--rh-cyan: #46d3ff;
--rh-green: #00df59;
--rh-gold: #ffd04d;
```

Do not hard-code the observed scale as a universal constant.

---

# 7. Critical discovery: the game has legacy and reference HUD layers

This is extremely important.

Some DOM elements exist but are **not the actual visible HUD currently shown to the player**.

Example:

```text
#target-card
```

exists and receives updates, but in the captured baseline it was not visible.

The visible target card was inside:

```css
#reference-hud
```

using:

```css
[data-rh-panel="target"]
```

Therefore:

> Never assume an existing legacy selector is the visible component.

The adapter should prefer the currently visible Reference HUD representation for display data when available, while keeping legacy selectors as fallbacks if useful.

---

# 8. Main HUD roots found

The following important elements were confirmed.

## 8.1 Reference HUD

```css
#reference-hud
```

Observed:

```text
position: fixed
top: 0
left: 0
width: full viewport
height: full viewport
z-index: 1240
pointer-events: none
```

It contains visual HUD panels such as:

- quick actions;
- active combat target;
- other reference-HUD elements.

Individual child controls restore pointer events where necessary.

---

## 8.2 Player/team panel

```css
#pokemon-team-bar
```

Observed classes:

```text
pokemon-team-bar
team-bar
collapsed
is-minimized
```

Observed baseline size:

```text
~301 × 64 px
```

Observed position:

```text
x ≈ 12
y ≈ 10
```

Important child selectors:

```css
#pokemon-team-bar .player-name
#pokemon-team-bar .player-summary
#pokemon-team-bar .team-header
#pokemon-team-bar .team-list
#pokemon-team-bar .team-slot
#pokemon-team-bar .team-slot.is-active
#pokemon-team-bar .team-minimize
#pokemon-team-bar [data-rh-drag]
```

Confirmed example:

```text
player name:
KTo

summary:
Nível 230 • Shiny Tyranitar
```

Team slots expose substantial useful information through:

- text;
- `data-poke-uid`;
- `data-game-tip`;
- sprite canvases;
- Pokémon level;
- HP bars;
- EXP bars;
- held item slots.

Do not parse team data unless a feature needs it.

---

# 9. Player/profile integration

The extension's compact profile should use the existing player/team data rather than duplicating it.

Primary selectors:

```js
document.querySelector('#pokemon-team-bar .player-name')
document.querySelector('#pokemon-team-bar .player-summary')
```

Possible normalized state:

```js
state.player = {
  name: 'KTo',
  level: 230,
  activePokemonName: 'Shiny Tyranitar'
};
```

The summary text may require parsing.

Use tolerant parsing.

Do not assume the exact separator character will always remain `•`.

---

# 10. Target integration

## 10.1 Preferred visible target source

The visible target is inside:

```css
#reference-hud [data-rh-panel="target"]
```

Important selectors:

```css
#rh-name
#rh-level
#rh-hp-fill
#rh-hp-text
```

Confirmed baseline:

```text
name:
Aerodactyl

level:
158

HP:
3297 / 3297

HP fill:
100%
```

Suggested adapter:

```js
function readTarget() {
  const name = document.querySelector('#rh-name')?.textContent?.trim();
  const levelText = document.querySelector('#rh-level')?.textContent?.trim();
  const hpText = document.querySelector('#rh-hp-text')?.textContent?.trim();
  const hpFill = document.querySelector('#rh-hp-fill')?.style?.width;

  return {
    name,
    level: parseInteger(levelText),
    ...parseHp(hpText),
    hpPercent: parsePercent(hpFill)
  };
}
```

## 10.2 Legacy target fallback

Legacy target elements also exist:

```css
#target-card
#target-name
#target-level
#target-hp
#target-trainer
```

The captured legacy text was:

```text
Aerodactyl
Rocha · Voador · Nv. 158 · HP 3297/3297
```

However:

```css
#target-card
```

was not visible in the baseline.

Use these as fallback/observation sources, not as the primary UI element.

---

# 11. Product requirement: merge target into profile

This is a confirmed design requirement.

The current separate target panel is considered too large for the importance of the information.

The redesigned HUD should:

- remove/hide the separate target visual card;
- merge the important target information into the player/profile HUD;
- remove the Poké Ball illustration from the target;
- show only compact information such as:

```text
Aerodactyl
HP 3297 / 3297
```

Optionally include level if it fits without adding visual noise.

Concept:

```text
┌──────────────────────────────────────────────┐
│ KTo · Nv.230      Aerodactyl · Lv.158       │
│ XP ███████       HP █████████ 3297/3297     │
└──────────────────────────────────────────────┘
```

The final UI may differ, but the target must no longer occupy a large independent card.

---

# 12. Skills integration

Primary root:

```css
#pokemon-skills-window
```

Observed baseline:

```text
visible
minimized
~132 × 46 px
```

Important selectors:

```css
#pokemon-moves
#pokemon-moves .move-slot
```

Each move exposes stable-looking attributes:

```html
data-move-name
data-move-type
data-move-key
data-move-special
data-move-index
data-priority
aria-label
```

Example selectors observed:

```css
button[data-move-key="0:bite"]
button[data-move-key="1:thrash"]
button[data-move-key="2:crunch"]
```

State classes observed:

```text
move-ready
is-cooldown
```

Cooldown information is also exposed through:

```css
.cooldown-overlay
.cooldown-number
```

The game already updates cooldown values.

The extension must not run its own skill timer.

---

# 13. Skill interactions

If the extension creates a new visual skill bar, interactions should forward to the original skill buttons.

Example:

```js
function activateMove(moveKey) {
  document
    .querySelector(`#pokemon-moves [data-move-key="${CSS.escape(moveKey)}"]`)
    ?.click();
}
```

Do not copy game event handlers.

Do not call unknown internal combat functions if clicking the original control is sufficient.

---

# 14. Hunt Analyzer integration

Primary root:

```css
#ha-panel
```

Observed classes:

```text
panel
hunt-analyzer-panel
ha-v3
ha-final
client-open
collapsed
```

Observed baseline size:

```text
~264 × 185 px
```

The Hunt Analyzer is an excellent data source because values have explicit IDs.

## 14.1 Compact metrics

```css
#ha-mTime
#ha-mSaldoH
#ha-mXph
#ha-mKills

#ha-cpShiny .num
#ha-cpMega .num
#ha-cpBoss .num
```

Observed values:

```text
Time:
04:30:05

Balance/hour:
+$4,01kk/h

XP/hour:
531,6k/h

Defeated:
11,6k

Shiny:
43

Mega:
13
```

The Boss counter may be empty rather than the literal string `0`.

Normalize empty values when appropriate.

---

# 15. Hunt Analyzer extended values available

Additional IDs were confirmed:

```css
#ha-cSaldo
#ha-cCaps
#ha-cCapsH

#ha-cLoot
#ha-cLootH

#ha-cSup
#ha-cSupPct

#ha-cDmg
#ha-cDps

#ha-cAvg
#ha-cHits

#ha-cLv
#ha-cPct
#ha-cBar

#ha-cXp
#ha-cXph
#ha-cEta

#ha-cRecent
```

Also:

```css
#ha-spec
#ha-status
```

The first redesigned analyzer does not need to display all of these.

Do not overload the compact mode.

---

# 16. Hunt Analyzer original actions

The original analyzer exposes controls:

```css
#ha-btnExp
#minimize-hunt-analyzer
#ha-btnMore

#ha-mTask
#ha-mCfg
#ha-mCopy
#ha-mZero

#ha-cYes
#ha-cNo

#ha-helperCfg
#ha-cfgClose
```

If the new HUD exposes equivalent functionality, prefer forwarding clicks to these original controls.

Especially for **reset Hunt Analyzer**, use the game's original reset mechanism.

---

# 17. Product requirement: Hunt Analyzer layout

The desired compact concept is:

```text
HUNT ANALYZER
Tempo: 11:00

Saldo/h      XP/h       Derrotados
+$118,2k/h   577,8k/h   374

Shiny 2      Mega 1     Boss 0
```

Requirements:

- title smaller than the original;
- remove redundant text such as "Sessão atual";
- place hunt time alongside/under title;
- put balance, XP and defeated on one row;
- put Shiny, Mega and Boss on one compact row;
- preserve original underlying values;
- retain access to advanced functionality without occupying permanent space.

---

# 18. Boss Global integration

Primary selector:

```css
#shiny-global-next
```

Observed baseline size:

```text
190 × 35 px
```

Relevant fields:

```css
#shiny-global-next-label
#shiny-global-next-time
#shiny-global-next-detail

#rh-boss-clock
#rh-boss-fold
#rh-boss-art
```

Observed data:

```text
PRÓXIMO BOSS GLOBAL
00:39:50
Ancient surpresa · hoje às 14:59
```

Root attributes include:

```text
data-rh-panel="boss"
data-rh-compact="true"
data-rh-folded="true"
```

---

# 19. Product requirement: simplify Boss Global

The Boss Global element should become significantly simpler.

Remove from the redesigned compact representation:

- large Pokémon/boss artwork;
- decorative iconography that does not communicate useful data;
- redundant timers.

Compact concept:

```text
BOSS  00:39:50
```

Optional secondary text can appear on hover/expand.

The original boss action must remain accessible.

If the root button itself performs a useful action, forward the new element's click to:

```css
#shiny-global-next
```

---

# 20. Main menu discovery

This was an important probe discovery.

The older element:

```css
.unified-client-actions.mainbar
```

exists but was hidden in the captured state.

The large visible top menu was instead represented by:

```css
#pio-main-menu
```

and contained:

```css
#pio-menu-scroll
.pio-menu-reserve
.pio-menu-bar
.pio-menu-frame
```

Observed baseline size of `#pio-main-menu`:

```text
~1212 × 126 px
```

Observed position:

```text
x ≈ 429
y ≈ 10
```

This is one of the largest permanent HUD elements and therefore one of the best opportunities to reclaim game viewport space.

---

# 21. Product requirement: redesign the main menu

The current large top menu should not remain a 1200+ px wide permanent bar.

Target concept:

```text
approx. 600–750 px wide
approx. 45–55 px tall
```

The final size should be responsive and may be smaller.

Use:

- a compact icon bar;
- grouped categories;
- dropdown/submenus;
- optional hover labels;
- clear active/notification states.

Do **not** expose every game system permanently as a large icon.

Suggested group structure:

```text
MAIN
- Inventory
- Profile
- Map
- Auto Helper
- Hunt Analyzer

GAME
- Pokédex
- Captures
- NPCs
- Depot
- Health / Pokémon Center

TRADE
- NPC Shop
- Market
- Online Store
- Diamonds

SOCIAL
- Friends
- Guild
- Discord
- Invite

SYSTEMS
- Helds
- Addons
- PvP
- Clans
- Settings
- Wiki
- other systems
```

This grouping is conceptual and may evolve.

---

# 22. Original main menu action attributes

The game exposes highly useful action attributes.

Examples include:

```html
data-client-action="inventory"
data-client-action="skills"
data-client-action="map"
data-client-action="auto-helper"
data-client-action="hunt-analyzer"
data-client-action="health"
data-client-action="market"
data-client-action="player-market"
data-client-action="npcs"
data-client-action="depot"
data-client-action="discord"
```

and:

```html
data-system-open="pokedex"
data-system-open="pokelog"
data-system-open="captures"
data-system-open="diamond-shop"
data-system-open="friends"
data-system-open="guild"
data-system-open="houses"
data-system-open="rankings"
data-system-open="settings"
```

There are also original buttons with IDs and `data-id`.

When implementing a custom menu:

1. locate the original button by stable attribute;
2. call `.click()`;
3. do not reimplement the game's modal/panel opening logic.

Example:

```js
function clickClientAction(action) {
  document
    .querySelector(`[data-client-action="${CSS.escape(action)}"]`)
    ?.click();
}

function clickSystem(system) {
  document
    .querySelector(`[data-system-open="${CSS.escape(system)}"]`)
    ?.click();
}
```

---

# 23. Buff tray

Primary root:

```css
#mainbar-buff-tray
```

Observed baseline:

```text
visible
40 px wide
~177 px high
right side of viewport
```

Examples of dynamic buff controls found:

```css
#potion-cooldown-hub-button
#vote-bonus-hub-button
#combat-vocation-hub-button
#profession-buff-hub-button
#xp-boost-hub-button
#shiny-charm-hub-button
#shiny-radar-hub-button
#mega-radar-hub-button
#conclave-buff-hub-button
#hunt-domination-hub-button
#silph-bag-hub-button
#house-toy-hub-button
#pokemon-held-hub-button
#addon-collection-hub-button
#discord-voice-button
```

Many use:

```css
.mainbar-buff-timer
```

and encode useful descriptions in:

```text
title
aria-label
data-game-tip
```

The mutation probe found several buff attributes updating frequently.

Avoid attaching expensive observers to the entire document when narrower observation is sufficient.

---

# 24. Chat integration

Primary root:

```css
#game-chat
```

Observed classes:

```text
game-chat
chat-shell
minimized
is-minimized
```

Observed baseline size:

```text
250 × 50 px
```

Useful selectors:

```css
#game-chat-handle
#chat-view-menu-toggle
#chat-view-menu

#chat-status

#minimize-chat

#chat-messages
#chat-message-list

#chat-online-members-count
```

Channel buttons expose:

```html
data-chat-channel="global"
data-chat-channel="help"
data-chat-channel="local"
data-chat-channel="party"
data-chat-channel="guild"
data-chat-channel="trade"
data-chat-channel="capture"
```

Do not scrape/store chat message content for this HUD project.

The probe deliberately redacted chat text.

---

# 25. Chat design guidance

The new HUD can keep chat minimized by default.

Recommended behavior:

```text
[CHAT • online]
```

Click to expand.

The expansion can:

- reveal the original chat; or
- show a redesigned shell that contains/repositions the original chat controls.

Do not recreate chat networking.

---

# 26. Quick actions

Inside the Reference HUD, a quick-action panel was observed:

```css
nav[data-rh-panel="quick"]
```

with:

```html
data-quick-slot="0"
data-quick-slot="1"
data-quick-slot="2"
data-quick-slot="3"
data-quick-slot="4"
```

and a configuration button.

If the new HUD exposes quick actions, preserve their original semantics.

---

# 27. Resources

Legacy resource selectors exist:

```css
#stat-coins
#stat-caught
#stat-dex
```

Observed baseline values:

```text
coins:
184773193

captured:
6201

pokedex:
25/1578
```

The legacy `.game-hud` root was hidden in the captured state.

If these metrics are needed, reading the individual IDs is acceptable.

Do not display all of them permanently unless the final layout benefits from it.

---

# 28. Current location/status

Known selectors:

```css
#zone-label
#status-text
```

Observed baseline:

```text
Habitat de Aerodactyl
EM COMBATE
```

The `.zonebar` itself was hidden in the captured state.

These values can be used if a clan HUD later needs a compact location/status indicator.

---

# 29. Dynamic DOM behavior confirmed

The probe ran a `MutationObserver` while the game was active.

Approximately 228 distinct mutation groups were detected during the short observation period.

Examples:

- `#ha-mSaldoH` updated repeatedly;
- target fields updated when combat advanced;
- `#target-card` classes were touched repeatedly;
- target text was rewritten;
- buff titles and aria labels could update many times per minute;
- team EXP labels changed during the session.

Implication:

> The extension must assume game values are live and mutable.

Do not read them only once at bootstrap.

---

# 30. Observer strategy

Do not attach dozens of independent full-document observers.

Recommended model:

```text
one bootstrap observer
        ↓
discover roots
        ↓
small observers per dynamic root
```

Suggested targets:

```js
#reference-hud
#pokemon-team-bar
#pokemon-skills-window
#ha-panel
#shiny-global-next
#mainbar-buff-tray
#game-chat
#pio-main-menu
```

For high-frequency elements, debounce/batch updates.

Example approach:

```js
let scheduled = false;

function scheduleSync() {
  if (scheduled) return;
  scheduled = true;

  requestAnimationFrame(() => {
    scheduled = false;
    syncStateFromGame();
  });
}
```

Do not rerender the entire custom HUD for every mutation.

---

# 31. Normalized state schema

Use a normalized central state similar to:

```js
const state = {
  player: {
    name: null,
    level: null,
    activePokemonName: null
  },

  target: {
    visible: false,
    name: null,
    level: null,
    hp: null,
    maxHp: null,
    hpPercent: null
  },

  hunt: {
    time: null,
    balancePerHour: null,
    xpPerHour: null,
    defeated: null,
    shiny: 0,
    mega: 0,
    boss: 0
  },

  globalBoss: {
    visible: false,
    label: null,
    time: null,
    detail: null,
    folded: null
  },

  skills: [],

  buffs: [],

  menu: {
    availableActions: []
  },

  chat: {
    minimized: true,
    online: null,
    channel: null
  },

  ui: {
    theme: 'ice',
    compact: true
  }
};
```

Prefer storing both raw text and parsed numeric values if parsing is useful.

---

# 32. Parsing principle

DOM text is presentation output from the game.

Parsing must be tolerant.

Example HP strings may look like:

```text
HP 3297 / 3297
```

A robust parser:

```js
function parseHp(text = '') {
  const match = text.match(/([\d.,]+)\s*\/\s*([\d.,]+)/);

  if (!match) {
    return {
      hp: null,
      maxHp: null
    };
  }

  return {
    hp: parseGameInteger(match[1]),
    maxHp: parseGameInteger(match[2])
  };
}
```

Do not assume English number formatting.

The game is currently running in `pt-BR`.

---

# 33. Original HUD visibility policy

The extension should **not immediately remove DOM nodes** from the original game.

Prefer:

```css
visibility: hidden;
pointer-events: none;
```

or:

```css
display: none;
```

only where confirmed safe.

Why:

- game scripts may query those nodes;
- game scripts may update them;
- original controls are useful action bridges;
- removing nodes may break event listeners.

For action sources that must remain clickable programmatically, hiding is fine; removal is not.

---

# 34. Action bridge policy

Whenever possible:

```text
Custom visual control
        ↓
bridge
        ↓
original Poké Idle control.click()
```

Examples:

```js
bridge.openInventory()
bridge.openMap()
bridge.openHuntAnalyzer()
bridge.toggleChat()
bridge.useSkill(moveKey)
bridge.toggleBoss()
bridge.resetHunt()
```

These bridge functions should be the only HUD-facing action API.

The HUD components should not query original DOM buttons themselves.

---

# 35. Theme system

Themes must be separated from component logic.

Recommended CSS token model:

```css
:host {
  --hud-bg: ...;
  --hud-bg-soft: ...;

  --hud-border: ...;
  --hud-border-soft: ...;

  --hud-text: ...;
  --hud-muted: ...;

  --hud-primary: ...;
  --hud-secondary: ...;

  --hud-positive: ...;
  --hud-danger: ...;

  --hud-glow: ...;

  --hud-radius-sm: ...;
  --hud-radius-md: ...;

  --hud-panel-shadow: ...;
}
```

Each clan theme overrides tokens and may add decorative component classes.

---

# 36. Theme design requirement

Do not create clan themes by only changing hue.

Each clan theme should differ in:

- panel silhouette;
- corner treatment;
- border style;
- accents;
- texture;
- ornaments;
- glow strategy;
- separators;
- icon treatment;
- animation language.

But:

> decoration must not increase permanent HUD footprint significantly.

The purpose of the extension is compactness.

---

# 37. Ice theme direction

The Ice theme should communicate:

- cold;
- crystalline shapes;
- frosted glass;
- pale cyan highlights;
- deep blue-black backgrounds;
- small sharp accents;
- restrained glow.

Avoid:

- huge snowflake illustrations;
- large decorative ice blocks;
- excessive bloom;
- decorations covering the game.

Suggested direction:

```text
dark navy translucent surfaces
thin cyan borders
angular/crystal corner cuts
small frost glints
white/cyan typography
```

---

# 38. Orebound theme direction

Orebound must clearly feel related to stone/mineral/ore.

Suggested visual vocabulary:

- charcoal;
- slate;
- basalt;
- metallic bronze/gold mineral seams;
- stone-cut angular geometry;
- fractured edges;
- subtle mineral glow;
- heavy but compact visual weight.

Avoid simply making the Ice layout orange/brown.

Orebound should have its own silhouette language.

---

# 39. Malefic theme direction

Suggested visual vocabulary:

- near-black surfaces;
- deep violet;
- poisoned green or magenta accents;
- sharp occult-like geometry;
- restrained spectral glow.

Keep readability above visual effects.

---

# 40. Naturia theme direction

Suggested visual vocabulary:

- dark forest green;
- moss;
- wood/bark hints;
- leaf-like curves;
- organic dividers;
- subtle warm natural accents.

Again, compactness remains the priority.

---

# 41. Profile + target component

This should become the primary top-left information block.

Possible internal structure:

```text
profile-target
├─ player
│  ├─ trainer name
│  ├─ trainer level
│  └─ optional progress
│
└─ target
   ├─ name
   ├─ optional level
   ├─ HP bar
   └─ HP text
```

When there is no target:

- collapse the target section;
- do not reserve a large blank area.

The target portion should animate in/out without shifting the whole screen dramatically.

---

# 42. Boss pill component

Compact by default:

```text
ANCIENT  00:39:50
```

or:

```text
BOSS  00:39:50
```

On hover or click it may expose:

```text
Ancient surpresa · hoje às 14:59
```

The default permanent footprint should remain tiny.

---

# 43. Compact Hunt Analyzer component

Default compact layout:

```text
┌────────────────────────────────┐
│ HUNT ANALYZER    Tempo 04:30:05│
│                                │
│ $/h         XP/h        KO     │
│ 4.01kk      531.6k      11.6k  │
│                                │
│ Shiny 43    Mega 13     Boss 0 │
└────────────────────────────────┘
```

Optional interaction:

```text
click / expand
      ↓
advanced analyzer
```

The advanced view can:

- expose original analyzer;
- show a custom advanced shell backed by original values;
- provide original controls.

---

# 44. Main menu component

Do not render 30+ buttons as a permanent row.

Suggested UX:

```text
[Bag] [Profile] [Map] [Helper] [Hunt] [More ▾]
```

Then categories inside `More`.

Badges/notifications from original menu should be mirrored where useful.

The original game contains badge states such as:

```text
has-reward
available
vote-active
vote-available
```

If the extension mirrors them, observe classes/attributes instead of reconstructing reward logic.

---

# 45. Main menu discovered actions

The original DOM contained menu actions for systems including, among others:

```text
LOJA ONLINE
PETS
INVENTÁRIO
PERFIL
MAPA
AUTO HELPER
HUNT ANALYZER
CENTRO POKÉMON
LOJA NPC
MARKET
NPCS
DEPOT
POKÉDEX
POKÉLOG
CRAFT BOSSES
CAPTURAS
DIAMANTES
VOTAR
INDIQUE
AMIGOS
GUILD
CASAS
RANKING
DISCORD
WIKI
PASSE SEMANAL
DAILY GIFT
HELDS
ADDONS
PVP
CLANS
CONFIGURAÇÕES
FORJA BOSSES
```

Do not assume every feature is always enabled.

Respect:

```text
hidden
disabled
aria-disabled
```

states from original controls.

---

# 46. Responsiveness

The game already applies responsive UI scaling.

The custom HUD should:

- support desktop first;
- use viewport-relative constraints;
- avoid assuming 1920×1080;
- fit common laptop resolutions;
- avoid covering the center of the game;
- avoid permanent UI near the player's combat focus when possible.

Recommended breakpoints are implementation choices, not extracted game rules.

Do not hard-code the baseline coordinates from the probe.

---

# 47. Positioning

Default layout should intentionally reclaim visual space.

Suggested desktop zones:

```text
TOP LEFT
profile + target
boss pill

TOP CENTER
compact main menu

RIGHT EDGE
buffs

BOTTOM CENTER
skills

BOTTOM LEFT
chat minimized

SIDE / USER POSITION
hunt analyzer
```

Do not place every component on the left simply because the original game currently does.

---

# 48. Dragging

The original game supports draggable panels using:

```html
data-rh-drag
```

and also persistent positions.

For the custom HUD there are two reasonable options:

### Option A — fixed curated layout

Best for the first MVP.

Advantages:

- easier;
- predictable;
- compact;
- fewer bugs.

### Option B — draggable custom widgets

Add later.

If implemented:

- store positions in extension storage;
- include reset-layout action;
- constrain elements to viewport;
- handle resolution changes.

---

# 49. Extension storage

Use extension-owned storage for:

```text
selected theme
compact/expanded preferences
custom HUD enabled
widget positions
widget visibility
menu grouping preferences
opacity
optional scale
```

Do not overwrite Poké Idle's own storage keys unless a feature explicitly requires it.

---

# 50. Isolation strategy

Prefer rendering the custom HUD in a dedicated root.

Recommended:

```html
<div id="poke-clan-hud-root"></div>
```

Consider Shadow DOM for CSS isolation:

```js
const root = document.createElement('div');
root.id = 'poke-clan-hud-root';

document.documentElement.append(root);

const shadow = root.attachShadow({
  mode: 'open'
});
```

Advantages:

- game CSS less likely to break the extension;
- themes are easier to manage;
- component styles remain scoped.

However, Poké Idle original controls remain outside the Shadow DOM and are accessed through the bridge.

---

# 51. Do not clone canvases blindly

Pokémon sprites and some art may be drawn on `<canvas>`.

A cloned canvas does not automatically contain the original drawing.

If the final HUD needs a live game canvas asset:

- either display/reposition the original canvas safely;
- or deliberately copy it using `drawImage`;
- or use known sprite resources if appropriate.

For the current product direction, target/boss artwork is intentionally being reduced, so this may not be necessary initially.

---

# 52. Useful original assets discovered

The runtime referenced assets such as:

```text
assets/new-interface/skills/icons/dark.png
assets/new-interface/skills/icons/dragon.png
assets/new-interface/skills/icons/normal.png
assets/new-interface/skills/icons/poison.png
assets/new-interface/skills/icons/rock.png

assets/new-interface/skills/keys/M1.png
...
assets/new-interface/skills/keys/M6.png

assets/new-interface/teambar/bars/hp_bar_full.png
assets/new-interface/teambar/bars/exp_bar_full.png

assets/new-interface/teambar/background-teambar.png
assets/new-interface/teambar/background-teambar_minimizado.png

assets/new-interface/chat/header-open.png
assets/new-interface/chat/header-minimized.png
assets/new-interface/chat/chat-bg.png
```

Use original assets only where appropriate.

The visual identity of the clan HUD should primarily come from the extension's own CSS/art direction, not from copying the old HUD.

---

# 53. Relevant Poké Idle stylesheets discovered

Important source references include:

```text
ui-text-size.css

hud-desktop-r47.css
hud-fixes-r58.css
hud-compact-r66.css
hud-rebrand-r76.css

community-hud-r86.css

mobile-rebrand-r152.css

main-menu-r160.css
party-analyzer-r161.css
hunt-analyzer-r162.css
ui-rebrand-r164.css
```

These files are useful for debugging when a selector/state is unclear.

The extension should not depend on their version numbers.

---

# 54. Relevant game scripts discovered

Important source references include:

```text
hud-desktop-r47.js
main-menu-r160.js

party-analytics-core-r161.js
party-analyzer-r161.js

hunt-analytics-core-r162.js
hunt-analyzer-r162.js
```

Do not call undocumented internal functions merely because they exist.

Use these scripts as a debugging/reference source if DOM behavior cannot be understood.

The preferred integration contract remains DOM + original controls.

---

# 55. Selector registry

All Poké Idle selectors should be centralized.

Example:

```js
export const SELECTORS = {
  referenceHud: '#reference-hud',

  player: {
    root: '#pokemon-team-bar',
    name: '#pokemon-team-bar .player-name',
    summary: '#pokemon-team-bar .player-summary'
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
    kills: '#ha-mKills',
    shiny: '#ha-cpShiny .num',
    mega: '#ha-cpMega .num',
    boss: '#ha-cpBoss .num',
    reset: '#ha-mZero'
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
    move: '#pokemon-moves .move-slot'
  },

  chat: {
    root: '#game-chat',
    toggle: '#minimize-chat',
    status: '#chat-status'
  },

  buffs: {
    root: '#mainbar-buff-tray'
  },

  menu: {
    visibleRoot: '#pio-main-menu',
    originalRoot: '.unified-client-actions.mainbar'
  }
};
```

If Poké Idle changes markup, update this file first.

---

# 56. Selector resilience helpers

Use helper functions such as:

```js
function firstExisting(...selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }

  return null;
}

function firstVisible(...selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);

    if (!el) continue;

    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    if (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      rect.width > 0 &&
      rect.height > 0
    ) {
      return el;
    }
  }

  return null;
}
```

This is useful for legacy/reference HUD fallbacks.

---

# 57. Adapter contract

Each adapter should expose:

```text
read()
observe(callback)
destroy()
```

Example:

```js
const targetAdapter = {
  read() {
    return readTarget();
  },

  observe(callback) {
    const root = locateTargetRoot();

    if (!root) return () => {};

    const observer = new MutationObserver(() => {
      callback(readTarget());
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    return () => observer.disconnect();
  }
};
```

The actual implementation may optimize the observer options.

---

# 58. Lifecycle

The game may render UI after the extension content script initializes.

Bootstrap must tolerate missing elements.

Recommended sequence:

```text
content script starts
      ↓
create extension root
      ↓
wait/discover important Poké Idle roots
      ↓
initialize adapters
      ↓
read initial state
      ↓
render custom HUD
      ↓
hide/reduce original HUD
      ↓
observe runtime changes
```

Never crash permanently because one optional component is missing.

---

# 59. DOM discovery

Provide a reusable helper:

```js
async function waitForElement(
  selector,
  {
    timeout = 15000,
    root = document
  } = {}
) {
  const existing = root.querySelector(selector);

  if (existing) return existing;

  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);

      if (!el) return;

      observer.disconnect();
      clearTimeout(timer);
      resolve(el);
    });

    observer.observe(
      root === document ? document.documentElement : root,
      {
        subtree: true,
        childList: true
      }
    );

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(
          `Element not found: ${selector}`
        )
      );
    }, timeout);
  });
}
```

Optional UI components should fail gracefully rather than rejecting the whole app.

---

# 60. Rerender strategy

Prefer component-level updates.

Bad:

```text
Mutation
→ rebuild entire HUD innerHTML
```

Good:

```text
Mutation
→ adapter reads changed state
→ store compares old/new
→ affected component updates only
```

This matters because the game produces high-frequency mutations.

---

# 61. Event handling

Do not repeatedly attach event listeners during render.

Use either:

- persistent component instances;
- event delegation;
- explicit mount/unmount lifecycle.

Avoid listener leaks.

---

# 62. Original UI hiding strategy

Create a dedicated class on the document:

```js
document.documentElement.classList.add(
  'poke-clan-hud-enabled'
);
```

Then CSS:

```css
.poke-clan-hud-enabled
#reference-hud [data-rh-panel="target"] {
  visibility: hidden !important;
}

.poke-clan-hud-enabled
#shiny-global-next {
  visibility: hidden !important;
}
```

Do not hide an original root until the replacement component is successfully mounted.

This prevents the player from losing controls if the extension fails.

---

# 63. Development safety rule

Every visual replacement must follow:

```text
1. read original
2. render replacement
3. verify replacement exists
4. hide original
```

Never:

```text
hide original
→ attempt rendering later
```

---

# 64. Debug mode

Add a debug option.

Suggested API:

```js
window.PokeClanHUD = {
  state,
  adapters,
  selectors,
  refresh(),
  enable(),
  disable(),
  debug()
};
```

In production builds this can be reduced if desired.

Debug output should help detect:

- selector missing;
- root hidden;
- parsing failure;
- bridge action missing;
- unexpected DOM replacement.

---

# 65. DOM replacement resilience

Poké Idle may replace entire nodes instead of only modifying their contents.

Adapters must tolerate this.

If an observed root disappears:

```text
root removed
→ disconnect observer
→ rediscover root
→ reconnect
→ refresh state
```

A lightweight parent observer can handle root replacement.

---

# 66. Mutation noise

The probe observed examples where attributes were repeatedly rewritten with the same value.

Therefore compare state before dispatching updates.

Example:

```js
if (
  next.hunt.balancePerHour ===
  current.hunt.balancePerHour
) {
  return;
}
```

Do not rerender because an attribute mutation occurred if the normalized state did not change.

---

# 67. Accessibility

Custom controls should have:

- semantic buttons;
- `aria-label`;
- keyboard focus;
- visible focus state;
- tooltip/title where useful.

Forwarding to original controls does not remove the need for accessibility on the new controls.

---

# 68. Theme motion

Animations should be subtle.

Good:

```text
100–180 ms transitions
small glow changes
HP fill animation
panel expand/collapse
```

Avoid:

```text
constant pulsing everywhere
large particle effects
continuous animated backgrounds
```

The game itself is the visual focus.

---

# 69. Performance requirements

The HUD should not noticeably impact gameplay.

Avoid:

- full DOM scans every frame;
- interval polling at tens of milliseconds;
- repeatedly calling `getComputedStyle` for hundreds of elements;
- rebuilding large component trees;
- observing `document.body` indefinitely if narrower roots can be observed.

Use:

- MutationObserver;
- requestAnimationFrame batching;
- targeted reads;
- normalized state comparisons.

---

# 70. Minimum viable product

The first functional milestone should implement:

### 1. Extension bootstrap

Inject custom HUD safely.

### 2. Game adapter

Read:

- player;
- target;
- Hunt Analyzer;
- global boss;
- skills;
- main-menu actions.

### 3. Compact profile/target

Merge player + target.

### 4. Compact Boss

Timer with minimal visual footprint.

### 5. Compact Hunt Analyzer

Use required layout.

### 6. Compact menu

Replace the huge top menu with a smaller command bar.

### 7. Basic skills bar

Forward skill clicks to original moves.

### 8. Ice theme

First complete clan theme.

### 9. Enable/disable

Allow reverting to original HUD without reloading when possible.

---

# 71. Second milestone

After MVP stability:

- Orebound theme;
- Malefic theme;
- Naturia theme;
- custom chat shell;
- buff redesign;
- quick actions;
- settings panel;
- draggable widgets;
- customizable visibility;
- user-defined scale.

---

# 72. Acceptance criteria — functionality

The extension is not considered functional unless:

- trainer name updates correctly;
- target changes update correctly;
- target HP updates during combat;
- Hunt Analyzer values remain live;
- boss timer remains live;
- skill cooldown display remains live;
- clicking custom skill uses original skill;
- menu actions open correct original systems;
- chat remains usable;
- toggling the extension restores original HUD;
- game continues working after several minutes of combat.

---

# 73. Acceptance criteria — design

The extension is not considered successful merely because it changes colors.

It must:

- reclaim substantially more viewport space;
- remove the separate oversized target card;
- simplify Boss Global;
- compact the Hunt Analyzer;
- drastically reduce the top menu footprint;
- keep gameplay visually dominant;
- visibly reflect the selected clan;
- keep text readable.

---

# 74. Acceptance criteria — architecture

The implementation should have:

- centralized selectors;
- adapter layer;
- normalized state;
- action bridge;
- independent HUD components;
- independent themes;
- no game logic duplication;
- no arbitrary Poké Idle selectors scattered through theme files.

---

# 75. Known baseline values are examples only

Never code against the specific values captured by the probe.

Examples such as:

```text
KTo
Shiny Tyranitar
Aerodactyl
3297/3297
04:30:05
+$4,01kk/h
```

are only examples used to verify the adapter.

The extension must work for every player and Pokémon.

---

# 76. Known limitation of the current probe

The probe explicitly captured only:

```text
baseline
```

It did **not** explicitly snapshot all desired states such as:

```text
team-expanded
skills-expanded
hunt-expanded
chat-expanded
boss-expanded
target-hidden
```

However, runtime mutations provided useful dynamic evidence.

If implementation encounters uncertainty about one of these states, create a new targeted probe rather than guessing.

---

# 77. How to perform future investigation

When an unknown UI behavior is encountered:

1. inspect the root element;
2. record classes before action;
3. perform action;
4. record classes after action;
5. inspect `aria-expanded`, `hidden`, `data-rh-folded`, `data-rh-compact`;
6. inspect added/removed nodes;
7. inspect original button being clicked;
8. only inspect game JavaScript if the DOM behavior is insufficient.

Do not begin by reverse engineering the entire game.

---

# 78. Test fixture strategy

Because the live game is external, adapter tests should use saved DOM fixtures.

Recommended fixture examples:

```text
tests/fixtures/
├─ reference-target.html
├─ team-minimized.html
├─ skills.html
├─ hunt-collapsed.html
├─ boss-folded.html
├─ chat-minimized.html
└─ menu.html
```

Adapter parsing functions should be as pure as possible.

---

# 79. Manifest guidance

Use a standard Chrome Manifest V3 extension.

Conceptual permissions should remain minimal.

Likely:

```json
{
  "manifest_version": 3,
  "name": "Poké Idle Clan HUD",
  "version": "0.1.0",
  "content_scripts": [
    {
      "matches": [
        "https://pokeidle.online/game/*"
      ],
      "js": [
        "dist/content.js"
      ],
      "css": [
        "dist/content.css"
      ]
    }
  ]
}
```

Add storage permission if extension settings require it.

Do not request broad permissions without a concrete reason.

---

# 80. Coding style

Prefer:

- small modules;
- explicit names;
- comments explaining Poké Idle integration quirks;
- constants for selectors;
- pure parsing functions;
- defensive null handling.

Avoid:

- monolithic 3000-line content scripts;
- giant CSS files with duplicated theme rules;
- hard-coded coordinates from one resolution;
- magic selectors buried in render code.

---

# 81. Suggested initial implementation sequence

An AI coding agent should implement in this order:

```text
STEP 1
Manifest + content bootstrap.

STEP 2
Selector registry.

STEP 3
Utility functions:
waitForElement
firstVisible
parseHp
parseLevel
parsePercent

STEP 4
Target adapter.

STEP 5
Player adapter.

STEP 6
Hunt adapter.

STEP 7
Boss adapter.

STEP 8
Normalized store.

STEP 9
Basic custom HUD root.

STEP 10
Profile + target component.

STEP 11
Boss pill.

STEP 12
Hunt Analyzer compact component.

STEP 13
Hide replaced originals safely.

STEP 14
Menu bridge + compact menu.

STEP 15
Skills bridge + compact skills.

STEP 16
Ice theme.

STEP 17
Settings + enable/disable.

STEP 18
Regression testing while the game is running.
```

Do not start by trying to restyle every game panel at once.

---

# 82. Example adapter implementation

```js
import {
  SELECTORS
} from './selectors.js';

export function readTarget() {
  const nameElement =
    document.querySelector(
      SELECTORS.target.name
    );

  const root =
    document.querySelector(
      SELECTORS.target.root
    );

  if (
    !root ||
    !nameElement
  ) {
    return {
      visible: false,
      name: null,
      level: null,
      hp: null,
      maxHp: null,
      hpPercent: null
    };
  }

  const style =
    getComputedStyle(root);

  const rect =
    root.getBoundingClientRect();

  const visible =
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    rect.width > 0 &&
    rect.height > 0;

  const level =
    parseGameInteger(
      document
        .querySelector(
          SELECTORS.target.level
        )
        ?.textContent
    );

  const hp =
    parseHp(
      document
        .querySelector(
          SELECTORS.target.hpText
        )
        ?.textContent
    );

  const hpPercent =
    parsePercent(
      document
        .querySelector(
          SELECTORS.target.hpFill
        )
        ?.style
        ?.width
    );

  return {
    visible,
    name:
      nameElement.textContent.trim(),
    level,
    ...hp,
    hpPercent
  };
}
```

---

# 83. Example Hunt adapter

```js
function text(selector) {
  return (
    document
      .querySelector(selector)
      ?.textContent
      ?.trim() ?? null
  );
}

function zeroIfBlank(value) {
  if (
    value == null ||
    value === ''
  ) {
    return '0';
  }

  return value;
}

export function readHunt() {
  return {
    time:
      text('#ha-mTime'),

    balancePerHour:
      text('#ha-mSaldoH'),

    xpPerHour:
      text('#ha-mXph'),

    defeated:
      text('#ha-mKills'),

    shiny:
      zeroIfBlank(
        text('#ha-cpShiny .num')
      ),

    mega:
      zeroIfBlank(
        text('#ha-cpMega .num')
      ),

    boss:
      zeroIfBlank(
        text('#ha-cpBoss .num')
      )
  };
}
```

---

# 84. Example action bridge

```js
export const actions = {
  openInventory() {
    document
      .querySelector(
        '[data-client-action="inventory"]'
      )
      ?.click();
  },

  openMap() {
    document
      .querySelector(
        '[data-client-action="map"]'
      )
      ?.click();
  },

  openHuntAnalyzer() {
    document
      .querySelector(
        '[data-client-action="hunt-analyzer"]'
      )
      ?.click();
  },

  toggleBoss() {
    document
      .querySelector(
        '#shiny-global-next'
      )
      ?.click();
  },

  resetHunt() {
    document
      .querySelector(
        '#ha-mZero'
      )
      ?.click();
  },

  activateMove(moveKey) {
    const selector =
      `#pokemon-moves ` +
      `[data-move-key="${CSS.escape(moveKey)}"]`;

    document
      .querySelector(selector)
      ?.click();
  }
};
```

---

# 85. Do not assume selectors are permanent API

These selectors are reverse-engineered integration points, not a public API contract.

Therefore the extension should:

- log missing selectors in debug mode;
- keep fallbacks where known;
- fail gracefully;
- isolate selectors centrally;
- make adapter updates easy.

---

# 86. Version compatibility

Create a simple runtime compatibility report.

Example:

```js
const compatibility = {
  target: !!locateTargetRoot(),
  player: !!document.querySelector('#pokemon-team-bar'),
  hunt: !!document.querySelector('#ha-panel'),
  boss: !!document.querySelector('#shiny-global-next'),
  skills: !!document.querySelector('#pokemon-skills-window'),
  menu: !!document.querySelector('#pio-main-menu')
};
```

If a critical component is missing, do not hide its original equivalent.

---

# 87. Extension disable behavior

Disabling the extension should:

1. disconnect observers;
2. remove custom root;
3. remove extension document classes;
4. restore hidden original UI;
5. preserve game state;
6. avoid requiring a page reload if practical.

---

# 88. Product philosophy

The extension should feel like:

> **Poké Idle with a better HUD**

not:

> **a separate dashboard floating on top of Poké Idle**

The world/map remains the main canvas.

HUD components should hug screen edges and use space efficiently.

---

# 89. Final priority order

When tradeoffs occur, prioritize:

```text
1. Do not break game functionality.
2. Reduce HUD footprint.
3. Preserve important information.
4. Keep interaction intuitive.
5. Make clan identity recognizable.
6. Add visual polish.
```

Never sacrifice #1–#3 for decoration.

---

# 90. Definition of done for the first real prototype

A first serious prototype is ready for user review when:

- the extension loads automatically on the game page;
- a custom Ice HUD appears;
- original target card is no longer visually occupying its old space;
- target name/HP are merged with profile;
- Boss Global is reduced to a compact element;
- Hunt Analyzer matches the compact requested layout;
- the large main menu is replaced by a substantially smaller menu;
- at least the main menu actions still work;
- skill actions still work;
- live updates continue while fighting;
- disabling the HUD restores the original interface.

At that point, visual iteration can begin.

---

# 91. Recommended companion repository files

This document is intentionally detailed enough to begin development alone.

However, keeping the following files in the repository is **strongly recommended**:

## A. Raw probe report

Suggested path:

```text
docs/reference/pokeidle-hud-audit-2026-09-26.json
```

Why:

- contains full computed styles;
- contains DOM snapshots;
- contains the mutation report;
- contains discovered assets;
- contains stylesheet/script inventory;
- allows future AI agents to inspect details not copied into this specification.

## B. Reference screenshots

Suggested:

```text
docs/reference/screenshots/
├─ original-hud.png
├─ desired-hunt-layout.png
├─ ice-concept.png
└─ future-theme-concepts/
```

Why:

Design intent is difficult to fully encode in text.

## C. Future targeted probe snapshots

When development reaches expanded panels, capture:

```text
target-visible
target-hidden
team-expanded
skills-expanded
hunt-expanded
hunt-collapsed
chat-expanded
chat-minimized
boss-expanded
boss-collapsed
main-menu-open
buffs-active
```

These are not required before beginning the MVP.

---

# 92. Instruction to future AI coding agents

When this file is supplied to an AI coding agent:

1. Treat it as the product and architecture source of truth.
2. Do not redesign the product goal without explicit user approval.
3. Do not reimplement game systems already available through original DOM controls.
4. Keep the adapter isolated from the HUD.
5. Keep clan themes isolated from integration logic.
6. Prefer a working compact implementation over elaborate decorative work.
7. When an integration detail is uncertain, add diagnostics or request a new probe rather than guessing.
8. Never use example player/Pokémon values as constants.
9. Preserve the original game's functionality.
10. The central success metric is **more visible game world with a cleaner clan-themed interface**.

---

## End of specification
