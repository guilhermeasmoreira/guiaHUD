const fs = require('node:fs');
const path = require('node:path');
const { definitions } = require('../src/hud/clan-icons.js');

const destination = path.join(__dirname, '../design/icons');
fs.mkdirSync(destination, { recursive: true });

for (const [name, item] of Object.entries(definitions)) {
  const shapes = item.paths.map((d, index) => {
    let fill = index === 0 || name === 'stone' && index === 2
      ? 'url(#color)' : index === 1 && ['fire', 'psychic', 'water', 'dragon'].includes(name)
        ? item.colors[2] : index === 1 && name === 'ice' ? '#e9fcff' : item.colors[0];
    if (name === 'leaf' && index === 1 || name === 'dragon' && index === 2) fill = 'none';
    return `  <path d="${d}" fill="${fill}" stroke="${item.colors[2]}" stroke-width="${index > 0 ? 1.6 : 2}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${name}">
  <defs><linearGradient id="color" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${item.colors[0]}"/><stop offset="1" stop-color="${item.colors[1]}"/></linearGradient></defs>
${shapes}
</svg>\n`;
  fs.writeFileSync(path.join(destination, name + '.svg'), svg);
}