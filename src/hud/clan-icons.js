(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const ns = 'http://www.w3.org/2000/svg';

  // Thin outlines follow the Seavell snowflake in the compact profile.
  // The same emblems appear beside the trainer name and the skills bar.
  const definitions = {
    fire: {
      color: '#ff713d',
      paths: [
        'M32 5c6 9 10 16 8 24 5-3 9-9 9-15 8 9 10 19 6 28-4 11-12 17-23 17C18 59 9 49 9 36c0-8 4-15 10-21-1 7 1 12 5 16-1-9 3-17 8-26Z',
        'M32 33c-2 8-8 13-8 19 0 4 3 7 8 7s8-4 8-9c0-6-4-11-8-17Z'
      ]
    },
    electric: {
      color: '#ffd34d',
      paths: ['M36 5 13 34h18l-5 25 25-32H34l2-22Z']
    },
    stone: {
      color: '#aab1ce',
      paths: [
        'M13 16 21 8h22l8 8-4 13-15 25-15-25-4-13Z',
        'M13 16h38M17 29h30M21 8l-4 21 15 25 15-25-4-21'
      ]
    },
    leaf: {
      color: '#9be86a',
      paths: [
        'M53 8C27 11 12 20 12 38c0 10 7 17 17 17 17 0 25-19 24-47Z',
        'M17 58c7-14 17-26 30-37M27 42l-10-8M35 33l11 5'
      ]
    },
    fighter: {
      color: '#ffad6b',
      paths: [
        'M12 33V17a5 5 0 0 1 10 0v11-16a5 5 0 0 1 10 0v16-13a5 5 0 0 1 10 0v13-9a5 5 0 0 1 10 0v23c0 11-7 17-18 17H26c-9 0-16-7-16-16V33h2Z',
        'M12 33h25c5 0 8 3 8 7s-3 7-8 7H26M22 28v5m10-5v5m10-5v5'
      ]
    },
    metal: {
      color: '#9bd8f3',
      paths: [
        'M35 5c-3 12 0 19 9 26 10 8 13 19 1 28 1-9-2-16-8-20-5 10-10 16-20 20 3-11-7-16-7-27 0-8 5-15 12-21-1 9 1 14 5 18 0-12 3-18 8-24Z'
      ]
    },
    dragon: {
      color: '#76daba',
      paths: [
        'M11 56c13-3 21-9 24-19-6-2-11-6-13-12l11 3-3-15 12 11 8-4 5 8-6 7 8 5-5 8-13-2c-7 5-15 8-28 10Z',
        'M43 32h.1M36 38l12 3M18 52c9-3 15-8 18-14'
      ]
    },
    psychic: {
      color: '#d59bfa',
      paths: [
        'M4 32c8-11 17-17 28-17s20 6 28 17c-8 11-17 17-28 17S12 43 4 32Z',
        'M32 21a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z',
        'M35 27a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z'
      ]
    },
    water: {
      color: '#72c6ff',
      paths: [
        'M40 5C21 22 10 35 10 44c0 11 9 18 20 18s21-8 21-19c0-11-9-23-11-38Z',
        'M19 47c3 5 7 7 12 7'
      ]
    },
    malefic: {
      color: '#c064eb',
      paths: [
        'M28 7C16 10 8 20 8 34c0 16 10 26 24 26s24-10 24-26c0-14-8-24-20-27 8 7 12 14 10 22-2 8-7 12-14 12s-12-4-14-12c-2-8 2-15 10-22Z'
      ]
    },
    ice: {
      color: '#77dafa',
      paths: [
        'M32 5v54M9 18.7l46 26.6M9 45.3l46-26.6',
        'M24 12l8 8 8-8M24 52l8-8 8 8',
        'M20 16v9l-8 5m32-14v9l8 5M12 34l8 5v9m32-14-8 5v9'
      ]
    }
  };

  function create(name) {
    const item = definitions[name];
    if (!item) return null;
    const svg = global.document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'pch-clan-icon pch-clan-icon-' + name);
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', name === 'ice' ? '2.8' : '3');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    item.paths.forEach(function (d) {
      const path = global.document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      svg.append(path);
    });
    return svg;
  }

  app.modules.clanIcons = { create, definitions };
  if (typeof module !== 'undefined' && module.exports) module.exports = { definitions };
})(globalThis);
