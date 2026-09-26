(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const dom = app.modules.dom;
  const parse = app.modules.parse;
  const selectors = app.modules.selectors;

  function readPlayer() {
    const root = dom.query(selectors.player.root);
    const name = dom.readText(selectors.player.name);
    const summary = dom.readText(selectors.player.summary);
    const parsed = parse.parsePlayerSummary(summary);
    const minimized = Boolean(root && root.classList && (
      root.classList.contains('collapsed') || root.classList.contains('is-minimized')
    ));
    return {
      available: Boolean(root),
      name: name || null,
      level: parsed.level,
      activePokemonName: parsed.activePokemonName,
      teamExpanded: Boolean(root && !minimized)
    };
  }

  function readTarget() {
    const primaryName = dom.readText(selectors.target.name);
    const legacyName = dom.readText(selectors.target.legacyName);
    const name = primaryName || legacyName;
    const primaryLevel = dom.readText(selectors.target.level);
    const legacyInfo = dom.readText(selectors.target.legacyInfo);
    const hpText = dom.readText(selectors.target.hpText) || legacyInfo;
    const hp = parse.parseHp(hpText);
    const primaryFill = dom.query(selectors.target.hpFill);
    const legacyFill = dom.query(selectors.target.legacyHpFill);
    const fill = primaryFill || legacyFill;
    const infoLevel = parse.parseLevel(legacyInfo);

    return {
      visible: Boolean(name),
      name: name || null,
      level: parse.parseInteger(primaryLevel) || infoLevel,
      hp: hp.hp,
      maxHp: hp.maxHp,
      hpPercent: fill ? parse.parsePercent(fill.style.width) : null
    };
  }

  function metric(selector, emptyValue) {
    const value = dom.readText(selector);
    return value == null || value === '' ? emptyValue : value;
  }

  function readHunt() {
    return {
      available: Boolean(dom.query(selectors.hunt.root)),
      time: metric(selectors.hunt.time, null),
      balancePerHour: metric(selectors.hunt.balancePerHour, null),
      xpPerHour: metric(selectors.hunt.xpPerHour, null),
      defeated: metric(selectors.hunt.defeated, null),
      shiny: metric(selectors.hunt.shiny, '0'),
      mega: metric(selectors.hunt.mega, '0'),
      boss: metric(selectors.hunt.boss, '0')
    };
  }

  function readBoss() {
    const label = dom.readText(selectors.boss.label);
    const time = dom.readText(selectors.boss.time);
    const detail = dom.readText(selectors.boss.detail);
    return {
      available: Boolean(dom.query(selectors.boss.root)),
      visible: Boolean(label || time || detail),
      label: label || null,
      time: time || null,
      detail: detail || null
    };
  }

  function cooldownText(value) {
    const text = String(value || '').replace(/^['"]|['"]$/g, '').trim();
    if (!text || /^(none|normal|initial)$/i.test(text)) return null;
    const match = text.match(/(?:\d{1,2}:)?\d{1,2}(?:[.,]\d+)?\s*(?:ms|s|seg(?:undos?)?|m|min(?:utos?)?)?/i);
    if (!match) return null;
    const valueText = match[0].trim();
    const hasUnit = /(?:ms|s|seg(?:undos?)?|m|min(?:utos?)?)/i.test(valueText);
    const labeled = /(cooldown|recarga|restante|remaining)/i.test(text);
    if (!hasUnit && !labeled && text !== valueText) return null;
    return valueText;
  }

  function readCooldown(move) {
    const slot = move.closest ? move.closest('.move-slot') || move : move;
    const overlays = slot.querySelectorAll
      ? dom.queryAll('.cooldown-number, .cooldown-overlay', slot)
      : [];
    const firstOverlay = slot.querySelector
      ? slot.querySelector('.cooldown-number, .cooldown-overlay')
      : null;
    if (firstOverlay && overlays.indexOf(firstOverlay) === -1) overlays.unshift(firstOverlay);

    const candidates = [];
    overlays.forEach(function (overlay) {
      candidates.push(overlay.textContent, overlay.innerText);
      ['data-cooldown', 'data-cooldown-seconds', 'data-remaining', 'aria-label', 'title']
        .forEach(function (attribute) { candidates.push(overlay.getAttribute(attribute)); });
      if (global.getComputedStyle) {
        ['::before', '::after'].forEach(function (pseudo) {
          try { candidates.push(global.getComputedStyle(overlay, pseudo).content); } catch (_) {}
        });
      }
    });

    ['data-cooldown', 'data-cooldown-seconds', 'data-cd', 'data-remaining', 'aria-label', 'title']
      .forEach(function (attribute) { candidates.push(move.getAttribute(attribute)); });
    if (slot !== move) {
      ['data-cooldown', 'data-cooldown-seconds', 'data-cd', 'data-remaining', 'aria-label', 'title']
        .forEach(function (attribute) { candidates.push(slot.getAttribute(attribute)); });
    }
    for (const candidate of candidates) {
      const parsed = cooldownText(candidate);
      if (parsed) return parsed;
    }
    return null;
  }

  function readSkills() {
    const root = dom.query(selectors.skills.root);
    const moves = dom.queryAll(selectors.skills.moves).map(function (element) {
      const cooldown = readCooldown(element);
      const name = element.getAttribute('data-move-name') ||
        element.getAttribute('aria-label') ||
        element.getAttribute('title') ||
        String(element.textContent || '').trim();
      return {
        key: element.getAttribute('data-move-key'),
        name: name || 'Move',
        type: element.getAttribute('data-move-type') || null,
        cooldown: cooldown,
        disabled: Boolean(element.disabled || element.getAttribute('aria-disabled') === 'true'),
        coolingDown: element.classList.contains('is-cooldown') ||
          Boolean(element.closest && element.closest('.move-slot') &&
            element.closest('.move-slot').classList.contains('is-cooldown')) ||
          Boolean(cooldown && !/^0+(?:[.,]0+)?(?:\s*(?:ms|s|seg(?:undos?)?|m|min(?:utos?)?))?$/i.test(cooldown)),
        ready: element.classList.contains('move-ready')
      };
    }).filter(function (move) { return Boolean(move.key); });

    return { available: Boolean(root), moves };
  }

  function actionLabel(element, key) {
    const label = element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.getAttribute('data-label') ||
      String(element.textContent || '').replace(/\s+/g, ' ').trim();
    if (label) return label;
    return String(key || 'Menu').replace(/[-_]/g, ' ').replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  function readMenu() {
    const root = dom.query(selectors.menu.root) || dom.query(selectors.menu.legacyRoot);
    const scopes = root ? [root, global.document] : [global.document];
    const actions = [];
    const seen = new Set();
    const seenElements = new Set();

    [
      { type: 'client', selector: selectors.menu.clientAction, attribute: 'data-client-action' },
      { type: 'system', selector: selectors.menu.systemOpen, attribute: 'data-system-open' }
    ].forEach(function (source) {
      scopes.forEach(function (scope) {
        dom.queryAll(source.selector, scope).forEach(function (element) {
        if (seenElements.has(element)) return;
        seenElements.add(element);
        const key = element.getAttribute(source.attribute);
        if (!key) return;
        const identity = source.type + ':' + key;
        if (seen.has(identity)) return;
        seen.add(identity);
        const style = global.getComputedStyle ? global.getComputedStyle(element) : null;
        const hidden = Boolean(element.hidden || (style && (style.display === 'none' || style.visibility === 'hidden')));
        const disabled = Boolean(element.disabled || element.getAttribute('aria-disabled') === 'true');
        if (hidden || disabled) return;
        actions.push({
          type: source.type,
          key: key,
          label: actionLabel(element, key),
          notification: element.classList.contains('has-reward') ||
            element.classList.contains('available') ||
            element.classList.contains('vote-active') ||
            element.classList.contains('vote-available')
        });
        });
      });
    });

    return { available: Boolean(root && actions.length), actions: actions };
  }

  function read() {
    const state = {
      player: readPlayer(),
      target: readTarget(),
      hunt: readHunt(),
      boss: readBoss(),
      skills: readSkills(),
      menu: readMenu()
    };
    state.compatibility = {
      target: Boolean(dom.query(selectors.target.root) || dom.query(selectors.target.legacyRoot)),
      player: state.player.available,
      hunt: state.hunt.available,
      boss: state.boss.available,
      skills: state.skills.available,
      menu: state.menu.available
    };
    return state;
  }

  function observedRoots() {
    return [
      dom.query(selectors.target.root),
      dom.query(selectors.target.legacyRoot),
      dom.query(selectors.player.root),
      dom.query(selectors.hunt.root),
      dom.query(selectors.boss.root),
      dom.query(selectors.skills.root),
      dom.query(selectors.menu.root)
    ].filter(Boolean);
  }

  function createAdapter() {
    let rootObserver = null;
    let localObserver = null;
    let currentRoots = [];
    let callback = null;
    let scheduled = false;

    function emit() {
      if (scheduled) return;
      scheduled = true;
      const schedule = global.requestAnimationFrame || function (fn) { return global.setTimeout(fn, 0); };
      schedule(function () {
        scheduled = false;
        if (callback) callback(read());
      });
    }

    function sameRoots(next) {
      return next.length === currentRoots.length && next.every(function (root, index) {
        return root === currentRoots[index];
      });
    }

    function rebindRoots() {
      const next = observedRoots();
      if (sameRoots(next)) return false;
      currentRoots = next;
      if (localObserver) localObserver.disconnect();
      if (localObserver) {
        currentRoots.forEach(function (root) {
          localObserver.observe(root, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
          });
        });
      }
      return true;
    }

    function start(onChange) {
      callback = onChange;
      if (typeof global.MutationObserver !== 'function') {
        emit();
        return stop;
      }
      localObserver = new global.MutationObserver(emit);
      rebindRoots();
      rootObserver = new global.MutationObserver(function () {
        if (rebindRoots()) emit();
      });
      rootObserver.observe(global.document.documentElement, { childList: true, subtree: true });
      emit();
      return stop;
    }

    function stop() {
      if (rootObserver) rootObserver.disconnect();
      if (localObserver) localObserver.disconnect();
      rootObserver = null;
      localObserver = null;
      currentRoots = [];
      callback = null;
    }

    return { read, observe: start, destroy: stop };
  }

  app.modules.adapter = { read, createAdapter };
})(globalThis);
