# Ranking Wingeon

Original lightweight vector ornaments: silver dragon, feather wings, cathedral,
crystals and three metal podiums. These are decorative backgrounds; avatars,
team sprites, text and controls remain native DOM/canvas nodes.

Edit the SVGs here, then run `python3 scripts/build-ranking-assets.py` and
`npm run build:userscript`. Generated CSS embeds SVG data URIs; no runtime
requests, permissions or extension-specific URLs are required.

Layout: `src/themes/ranking-premium.css`. Palette: `ranking-wingeon.css`.
Activation: `src/hud/ranking-premium.js`, saved theme ID `dragon`.
For another theme, add its saved ID to `skins`, define the same color and
art tokens under its `.gh-ranking-theme-*` class, and register its CSS in
`manifest.json`. Unsupported themes keep the native ranking.

No canvas drawing, fetching, node cloning or layout reads are performed by
this module. Native updates inherit the CSS; newly opened windows are observed.
Disabling the HUD or switching theme removes only classes added by this module.
