(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const ns = 'http://www.w3.org/2000/svg';

  // Original 64px vector silhouettes inspired by the supplied clan symbol sheet.
  // The same definitions are exported by scripts/export-clan-icons.cjs.
  const definitions = {
    fire: {
      colors: ['#ffbd56', '#f4372f', '#3c1017'],
      paths: [
        'M31 4C41 14 40 23 38 29c8-3 12-10 12-17 10 12 12 23 7 34C53 56 44 61 32 61 17 61 8 51 8 38c0-9 4-16 10-23-1 8 1 13 5 17-1-10 4-18 8-28Z',
        'M31 27c2 8 0 11-3 15 4-1 7-4 8-8 5 7 5 12 3 17-2 5-5 8-8 10-8-5-11-10-10-17 1-7 5-12 10-17Z'
      ]
    },
    electric: {
      colors: ['#fff294', '#ffc327', '#50300c'],
      paths: ['M37 3 11 36h20l-5 25 27-34H34L37 3Z']
    },
    stone: {
      colors: ['#d4d8ee', '#777e9f', '#1c2435'],
      paths: [
        'M8 14 14 7h11l5 7-4 5h-8l-4 8 7 8-5 6-11-12-1-8 4-7Zm48 0-6-7H39l-5 7 4 5h8l4 8-7 8 5 6 11-12 1-8-4-7Z',
        'M17 9h8l3 4H15l2-4Zm22 0h8l3 4H36l3-4Z',
        'M18 28h28L32 52 18 28Z',
        'M15 47 24 39l5 5-8 9h22l-8-9 5-5 9 8-6 12H21l-6-12Z'
      ]
    },
    leaf: {
      colors: ['#b9f878', '#48ca57', '#163d26'],
      paths: [
        'M32 6C45 19 55 28 54 40c-1 10-9 16-21 17l-1 5h-7l-1-6C12 54 7 47 9 37c2-12 15-22 23-31Z',
        'M30 54c0-13 3-24 13-35M30 41c-5-7-9-10-15-11m16 16c4-7 10-10 17-10'
      ]
    },
    fighter: {
      colors: ['#ffbb7a', '#dd7748', '#4e251e'],
      paths: [
        'M9 13a5 5 0 0 1 5-5h5a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5V13Zm15-3a5 5 0 0 1 5-5h5a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5V10Zm15 3a5 5 0 0 1 5-5h5a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5V13Z',
        'M10 33h42v13L39 59H22L10 47V33Zm31 1c-9 0-13 3-16 11l-8-3 5-12h19v4Z'
      ]
    },
    metal: {
      colors: ['#d6f3ff', '#73b8e8', '#152e53'],
      paths: [
        'M35 4c-2 13 1 18 9 24 12 10 13 25 0 34 2-10-1-18-8-22-4 9-8 17-19 22 3-12-7-15-6-29 0-7 4-14 11-20-1 9 1 13 5 16 0-13 4-19 8-25Z'
      ]
    },
    dragon: {
      colors: ['#a5f1d0', '#2ab891', '#133c40'],
      paths: [
        'M12 59c15-5 22-15 19-24-2-6-8-8-10-14l12 4-3-15 12 11 9-5 5 9-7 7 9 6-5 8-13-2-4 6C31 55 23 59 12 59Z',
        'M42 31a2.6 2.6 0 1 0 5.2 0 2.6 2.6 0 0 0-5.2 0Z',
        'M50 40l-9-2M18 52c10-2 16-7 20-14'
      ]
    },
    psychic: {
      colors: ['#f5c5ff', '#be71ed', '#34204e'],
      paths: [
        'M3 33c8-12 17-18 29-18s21 6 29 18c-8 12-17 18-29 18S11 45 3 33Z',
        'M32 20a13 13 0 1 1 0 26 13 13 0 0 1 0-26Z',
        'M36 27a6 6 0 1 1-8 7 7 7 0 0 0 8-7Z'
      ]
    },
    water: {
      colors: ['#a7ecff', '#459af8', '#183c70'],
      paths: [
        'M43 4c-8 12-11 18-9 24 2 5 8 8 10 15 3 10-4 19-15 19C16 62 8 53 8 42c0-13 11-25 35-38Z',
        'M25 47c5-4 11-3 14 1 3 4-2 8-8 8-7 0-12-5-6-9Z'
      ]
    },
    malefic: {
      colors: ['#d68af9', '#7d38c1', '#211036'],
      paths: [
        'M28 7C16 9 7 20 7 34c0 16 10 27 25 27s25-11 25-27c0-14-9-25-21-27 9 7 12 14 10 22-2 8-7 12-14 12s-12-4-14-12c-2-8 1-15 10-22Z'
      ]
    },
    ice: {
      colors: ['#e9fcff', '#77dafa', '#215a85'],
      paths: [
        'M29 3h6v11l8-8 4 4-12 12v7h7l12-12 4 4-8 8h11v6H50l8 8-4 4-12-12h-7v7l12 12-4 4-8-8v11h-6V50l-8 8-4-4 12-12v-7h-7L10 47l-4-4 8-8H3v-6h11l-8-8 4-4 12 12h7v-7L17 10l4-4 8 8V3Z',
        'M29 29h6v6h-6v-6Z'
      ]
    }
  };

  function create(name) {
    const item = definitions[name];
    if (!item) return null;
    const svg = global.document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'pch-clan-icon pch-clan-icon-' + name);
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const gradient = global.document.createElementNS(ns, 'linearGradient');
    const id = 'pch-clan-' + name + '-' + Math.random().toString(36).slice(2);
    gradient.setAttribute('id', id);
    gradient.setAttribute('x1', '0');
    gradient.setAttribute('y1', '0');
    gradient.setAttribute('x2', '1');
    gradient.setAttribute('y2', '1');
    [item.colors[0], item.colors[1]].forEach(function (color, index) {
      const stop = global.document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', index ? '1' : '0');
      stop.setAttribute('stop-color', color);
      gradient.append(stop);
    });
    const defs = global.document.createElementNS(ns, 'defs');
    defs.append(gradient);
    svg.append(defs);
    item.paths.forEach(function (d, index) {
      const path = global.document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', index === 0 || name === 'stone' && index === 2
        ? 'url(#' + id + ')' : index === 1 && ['fire', 'psychic', 'water', 'dragon'].includes(name)
          ? item.colors[2] : index === 1 && name === 'ice' ? '#e9fcff' : item.colors[0]);
      if (name === 'leaf' && index === 1 || name === 'dragon' && index === 2) {
        path.setAttribute('fill', 'none');
      }
      path.setAttribute('stroke', item.colors[2]);
      path.setAttribute('stroke-width', index > 0 ? '1.6' : '2');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('stroke-linecap', 'round');
      svg.append(path);
    });
    return svg;
  }

  app.modules.clanIcons = { create, definitions };
  if (typeof module !== 'undefined' && module.exports) module.exports = { definitions };
})(globalThis);