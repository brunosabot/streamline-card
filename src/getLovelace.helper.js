let lovelaceCache = null;
let lovelaceCastCache = null;

const findLovelaceCast = () => {
  let root = document.querySelector("hc-main");
  root &&= root.shadowRoot;
  root &&= root.querySelector("hc-lovelace");
  root &&= root.shadowRoot;
  root &&= root.querySelector("hui-view");

  if (root) {
    const ll = root.lovelace;
    ll.current_view = root.___curView;
    return ll;
  }

  return null;
};

const findLovelace = () => {
  let root = document.querySelector("home-assistant");
  root &&= root.shadowRoot;
  root &&= root.querySelector("home-assistant-main");
  root &&= root.shadowRoot;
  root &&= root.querySelector(
    "app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver",
  );
  root = (root && root.shadowRoot) || root;
  root &&= root.querySelector("ha-panel-lovelace");
  root &&= root.shadowRoot;
  root &&= root.querySelector("hui-root");

  if (root) {
    const ll = root.lovelace;
    ll.current_view = root.___curView;
    return ll;
  }

  return null;
};

export const getLovelaceCast = () => {
  // Do not cache a null result; on early calls the cast UI might not yet
  // be attached to the DOM. In that case, keep trying on subsequent calls
  // until a valid lovelace instance is found.
  if (lovelaceCastCache === null) {
    const ll = findLovelaceCast();
    if (ll) {
      lovelaceCastCache = ll;
    }
  }
  return lovelaceCastCache;
};

export const getLovelace = () => {
  // Similar logic for the main Lovelace instance: avoid permanently caching
  // a null result when the frontend is still initializing. This prevents
  // situations where templates are never resolved on first load because the
  // first lookup ran before Lovelace was ready.
  if (lovelaceCache === null) {
    const ll = findLovelace();
    if (ll) {
      lovelaceCache = ll;
    }
  }
  return lovelaceCache;
};

export const clearLovelaceCache = () => {
  lovelaceCache = null;
  lovelaceCastCache = null;
};
