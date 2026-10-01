(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const key = 'pokeClanHudSettings';
  const defaults = app.modules.settingsDefaults;

  function normalize(saved) {
    const loaded = Object.assign({}, defaults, saved || {});
    if (!['minimal', 'malefic', 'ice', 'fire', 'stone', 'dragon',
      'naturia', 'gardestrike', 'psycraft', 'rainbolt'].includes(loaded.theme)) {
      loaded.theme = 'minimal';
    }
    loaded.economyMode = loaded.economyMode === true;
    return loaded;
  }

  function load() {
    if (app.modules.userScriptStorage) {
      return Promise.resolve(normalize(app.modules.userScriptStorage.get(key)));
    }
    if (!global.chrome || !global.chrome.storage || !global.chrome.storage.local) {
      return Promise.resolve(normalize());
    }
    return new Promise(function (resolve) {
      global.chrome.storage.local.get(key, function (result) {
        resolve(normalize(result && result[key]));
      });
    });
  }

  function save(settings) {
    if (app.modules.userScriptStorage) {
      app.modules.userScriptStorage.set(key, Object.assign({}, defaults, settings));
      return Promise.resolve(settings);
    }
    if (!global.chrome || !global.chrome.storage || !global.chrome.storage.local) {
      return Promise.resolve(settings);
    }
    return new Promise(function (resolve) {
      global.chrome.storage.local.set({ [key]: Object.assign({}, defaults, settings) }, function () {
        resolve(settings);
      });
    });
  }

  app.modules.settingsStorage = { load, save };
})(globalThis);
