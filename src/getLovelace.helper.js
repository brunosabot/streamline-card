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
  if (lovelaceCastCache === null) {
    lovelaceCastCache = findLovelaceCast();
  }
  return lovelaceCastCache;
};

export const getLovelace = () => {
  if (lovelaceCache === null) {
    lovelaceCache = findLovelace();
  }
  return lovelaceCache;
};

export const clearLovelaceCache = () => {
  lovelaceCache = null;
  lovelaceCastCache = null;
};
