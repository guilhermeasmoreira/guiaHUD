(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const ns = 'http://www.w3.org/2000/svg';
  const shapes = {
    crest: ['M12 2 9 6 4 5l1 5-3 3 3 7 4 2 3-3 3 3 4-2 3-7-3-3 1-5-5 1-3-4Z', 'M7 11 10 12 9 14M17 11 14 12 15 14M9 18l3-2 3 2'],
    inventory: ['M4 8h16l-1 12H5L4 8Z', 'M8 8V6a4 4 0 0 1 8 0v2', 'M9 13h6m-3-3v6'],
    profile: ['M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M5 21v-2a7 7 0 0 1 14 0v2H5Z'],
    map: ['M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z', 'M9 3v16M15 5v16'],
    helper: ['M12 2l3 5 6 2-4 4 1 7-6-3-6 3 1-7-4-4 6-2 3-5Z', 'M9 11l2 2 4-4'],
    hunt: ['M12 2v4m0 12v4M2 12h4m12 0h4', 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z', 'M12 10v4m-2-2h4'],
    diamond: ['M5 4h14l4 5-11 13L1 9l4-5Z', 'M1 9h22M8 4l4 18 4-18'],
    more: ['M4 12h2m5 0h2m5 0h2'],
    boss: ['M3 7l4 3 5-7 5 7 4-3-2 12H5L3 7Z', 'M8 15h8'],
    chat: ['M3 4h18v13H9l-5 4v-4H3V4Z', 'M7 9h10m-10 4h6'],
    skills: ['M3 5l4 3 5-6 5 6 4-3-2 12-7 5-7-5L3 5Z', 'M8 12l4 3 4-3'],
    spark: ['M12 1l2 8 8 3-8 3-2 8-3-8-8-3 8-3 3-8Z']
  };

  function create(name) {
    const svg = global.document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'pch-themed-icon pch-icon-' + name);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    (shapes[name] || shapes.spark).forEach(function (d) {
      const path = global.document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      svg.append(path);
    });
    return svg;
  }

  app.modules.icons = { create };
})(globalThis);
