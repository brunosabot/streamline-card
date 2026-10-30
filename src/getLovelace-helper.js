let lovelaceCache = { path: null, ref: null };
let lovelaceCastCache = { path: null, ref: null };

const findLovelaceCast = () => {
  let root = document.querySelector("hc-main");
  root &&= root.shadowRoot;
  root &&= root.querySelector("hc-lovelace");
  root &&= root.shadowRoot;
  root &&= root.querySelector("hui-view");

  return root || null;
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

  return root || null;
};

// Home Assistant replaces the element's lovelace object on save.
// Read it on each call instead of caching it.
const readLovelace = (root) => {
  const ll = root.lovelace;
  ll.current_view = root.___curView;
  return ll;
};

export const clearLovelaceCache = () => {
  lovelaceCache = { path: null, ref: null };
  lovelaceCastCache = { path: null, ref: null };
};

const getCurrentPath = () => {
  const [, dashboardPath] = window.location.pathname.split("/");

  return dashboardPath;
};

const clearCacheOnPathChange = (dashboardPath) => {
  if (
    (lovelaceCache.path && lovelaceCache.path !== dashboardPath) ||
    (lovelaceCastCache.path && lovelaceCastCache.path !== dashboardPath)
  ) {
    clearLovelaceCache();
  }
};

export const getLovelaceCast = () => {
  const dashboardPath = getCurrentPath();
  clearCacheOnPathChange(dashboardPath);

  if (lovelaceCastCache.ref !== null) {
    return readLovelace(lovelaceCastCache.ref);
  }

  const root = findLovelaceCast();
  if (root) {
    lovelaceCastCache = { path: dashboardPath, ref: root };
    return readLovelace(root);
  }
  return null;
};

export const getLovelace = () => {
  const dashboardPath = getCurrentPath();
  clearCacheOnPathChange(dashboardPath);

  if (lovelaceCache.ref !== null) {
    return readLovelace(lovelaceCache.ref);
  }

  const root = findLovelace();
  if (root) {
    lovelaceCache = { path: dashboardPath, ref: root };
    return readLovelace(root);
  }
  return null;
};
