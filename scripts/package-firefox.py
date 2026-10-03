"""Build a Firefox Add-ons ZIP without changing the Chrome Web Store package."""

import json
import sys
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
manifest['browser_specific_settings'] = {
    'gecko': {
        'id': 'guiahud@guilhermeasmoreira.github.io',
        'strict_min_version': '140.0',
        'data_collection_permissions': {'required': ['none']},
    }
}

files = set(manifest.get('icons', {}).values())
for entry in manifest['content_scripts']:
    files.update(entry.get('js', []))
    files.update(entry.get('css', []))

for name in files:
    path = ROOT / name
    if not path.is_file() or not path.resolve().is_relative_to(ROOT.resolve()):
        sys.exit(f'Missing or unsafe package file: {name}')

output = ROOT / 'dist' / f"guiaHUD-firefox-{manifest['version']}.zip"
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as package:
    package.writestr('manifest.json', json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    for name in sorted(files):
        package.write(ROOT / name, arcname=name)

with zipfile.ZipFile(output) as package:
    assert set(package.namelist()) == files | {'manifest.json'}
    assert package.testzip() is None
    packaged_manifest = json.loads(package.read('manifest.json'))
    assert packaged_manifest['browser_specific_settings']['gecko']['data_collection_permissions']['required'] == ['none']
    assert packaged_manifest['content_scripts'] == json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))['content_scripts']

print(f'{output}: {len(files) + 1} runtime files, {output.stat().st_size} bytes')

# AMO reviewers can reproduce the generated manifest from this source archive.
source_files = files | {
    'manifest.json', 'scripts/package-firefox.py', 'README.md',
    'FIREFOX_REVIEW_BUILD.md', 'PRIVACY.md', 'scripts/build-ranking-assets.py',
}
source_files.update(str(p.relative_to(ROOT)) for p in (ROOT / 'src/assets/themes/wingeon/ranking').glob('*.svg'))
source_output = ROOT / 'dist' / f"guiaHUD-firefox-source-{manifest['version']}.zip"
with zipfile.ZipFile(source_output, 'w', compression=zipfile.ZIP_DEFLATED) as package:
    for name in sorted(source_files):
        package.write(ROOT / name, arcname=name)
with zipfile.ZipFile(source_output) as package:
    assert set(package.namelist()) == source_files
    assert package.testzip() is None
print(f'{source_output}: {len(source_files)} source files, {source_output.stat().st_size} bytes')
