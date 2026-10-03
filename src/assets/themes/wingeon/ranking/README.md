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

## Illustrated revision

`header-illustrated.webp` and `hall-illustrated.webp` replace the flat vector
header and hall on desktop. Generated with the built-in image tool using the
user's mockup as reference; optimized to WebP (about 142 KiB total).
Production prompts: a silver-white crystalline dragon looking left on the
right of a quiet navy header; and a navy crystal cathedral with three EMPTY
silver/gold/bronze podiums, silver wings framing the champion. Both explicitly
exclude all text, avatars, numbers, controls and game data.

The scene's platform centers are at 20.5%, 50%, 79.5%; live avatar feet align
at 58.5% of scene height and text overlays the fronts from 61% to 82%.
These placement rules live in `ranking-wingeon.css`. Keep these anchors when
replacing the art, or adjust them together. Small screens use compact native
cards with the same illustration as subdued backdrop for readability.

After replacing a WebP, run `npm run build:ranking` and
`npm run build:userscript`. CSS embeds the images so no network request or
web-accessible-resource permission is necessary.
