(function (global) {
  const app = global.PokeClanHUD = global.PokeClanHUD || {};
  app.modules = app.modules || {};

  function createStore(initialState) {
    let state = initialState;
    const listeners = new Set();

    function getState() {
      return state;
    }

    function setState(nextState) {
      if (JSON.stringify(state) === JSON.stringify(nextState)) return false;
      state = nextState;
      listeners.forEach(function (listener) { listener(state); });
      return true;
    }

    function subscribe(listener) {
      listeners.add(listener);
      return function () { listeners.delete(listener); };
    }

    return { getState, setState, subscribe };
  }

  app.modules.store = { createStore };
})(globalThis);
