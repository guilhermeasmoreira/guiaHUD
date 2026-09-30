"""Build a minimal Chrome Web Store ZIP from the manifest's runtime files."""
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
files = {'manifest.json', *manifest.get('icons', {}).values()}
for entry in manifest['content_scripts']:
    files.update(entry.get('js', []))
    files.update(entry.get('css', []))
for name in files:
    path = ROOT / name
    if not path.is_file() or path.resolve().is_relative_to(ROOT.resolve()) is False:
        sys.exit(f'Missing or unsafe package file: {name}')

output = ROOT / 'dist' / f"guiaHUD-{manifest['version']}.zip"
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as package:
    for name in sorted(files):
        package.write(ROOT / name, arcname=name)

with zipfile.ZipFile(output) as package:
    assert set(package.namelist()) == files
    assert package.testzip() is None
print(f'{output}: {len(files)} runtime files, {output.stat().st_size} bytes')
