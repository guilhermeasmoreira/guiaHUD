(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};
  const key = 'pokeClanHudSettings';
  const defaults = app.modules.settingsDefaults;

  function load() {
    if (!global.chrome || !global.chrome.storage || !global.chrome.storage.local) {
      return Promise.resolve(Object.assign({}, defaults));
    }
    return new Promise(function (resolve) {
      global.chrome.storage.local.get(key, function (result) {
        resolve(Object.assign({}, defaults, result && result[key] || {}));
      });
    });
  }

  function save(settings) {
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
