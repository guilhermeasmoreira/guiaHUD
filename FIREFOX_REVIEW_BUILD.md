# guiaHUD Firefox — build instructions for AMO review

The add-on contains plain, readable JavaScript and CSS. No dependencies,
minifier, network access or npm install step are required to produce the
submitted add-on. Python 3.9+ from https://www.python.org/downloads/ is the
only build tool. The package was generated on Linux with Python 3.

From the directory containing this file, run:

```sh
python3 scripts/package-firefox.py
```

The result `dist/guiaHUD-firefox-0.9.2.zip` is the add-on uploaded to AMO.
The script reads `manifest.json` and packages the listed scripts, styles and
icons without changing them. It adds only `browser_specific_settings.gecko`
to the generated Firefox manifest: a stable add-on ID, Firefox minimum 140,
and `data_collection_permissions.required: ["none"]`.

The second output, `dist/guiaHUD-firefox-source-0.9.2.zip`, is this source
archive. ZIP entry timestamps are not fixed; compare file contents when
checking the reproduced build. The generated `manifest.json` content and all
runtime source files should match exactly.

To test interactively, open `about:debugging` in Firefox, select **This
Firefox**, **Load Temporary Add-on**, choose the generated add-on ZIP, then
open `https://pokeidle.online/game/`. The first content script runs in MAIN
world to hook the game's public HuntPresentation renderer. The remaining
scripts and styles implement the HUD in the isolated world. The only
extension permission is local storage; game data and settings are not sent
to a guiaHUD server.
