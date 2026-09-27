const fs = require('node:fs');
const path = require('node:path');
const { definitions } = require('../src/hud/clan-icons.js');

const destination = path.join(__dirname, '../design/icons');
fs.mkdirSync(destination, { recursive: true });

for (const [name, item] of Object.entries(definitions)) {
  const shapes = item.paths.map((d) => `  <path d="${d}"/>`).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${name}" fill="none" stroke="${item.color}" stroke-width="${name === 'ice' ? 2.8 : 3}" stroke-linejoin="round" stroke-linecap="round">
${shapes}
</svg>\n`;
  fs.writeFileSync(path.join(destination, name + '.svg'), svg);
}
