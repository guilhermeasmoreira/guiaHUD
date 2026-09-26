(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};

  function parseInteger(value) {
    if (value == null) return null;
    const digits = String(value).trim().replace(/[^\d-]/g, '');
    if (!digits || digits === '-') return null;
    const number = Number(digits);
    return Number.isFinite(number) ? number : null;
  }

  function parseLevel(value) {
    if (value == null) return null;
    const match = String(value).match(/(?:nível|nivel|nv\.?)\s*[:#-]?\s*(\d+)/i);
    return match ? Number(match[1]) : null;
  }

  function parseHp(value) {
    const match = String(value || '').match(/([\d.,\s]+)\s*\/\s*([\d.,\s]+)/);
    if (!match) return { hp: null, maxHp: null };
    return {
      hp: parseInteger(match[1]),
      maxHp: parseInteger(match[2])
    };
  }

  function parsePercent(value) {
    if (value == null || value === '') return null;
    const number = Number(String(value).replace('%', '').replace(',', '.').trim());
    return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : null;
  }

  function parsePlayerSummary(value) {
    const summary = String(value || '').trim();
    const level = parseLevel(summary);
    const activePokemonName = summary
      .replace(/(?:nível|nivel|nv\.?)\s*[:#-]?\s*\d+/i, '')
      .replace(/[•·|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { level, activePokemonName: activePokemonName || null };
  }

  app.modules.parse = { parseInteger, parseLevel, parseHp, parsePercent, parsePlayerSummary };
})(globalThis);
