let lovelaceCache = { path: null, ref: null };
let lovelaceCastCache = { path: null, ref: null };

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

export const clearLovelaceCache = () => {
  lovelaceCache = { path: null, ref: null };
  lovelaceCastCache = { path: null, ref: null };
};

const checkLocation = () => {
  const [, dashboardPath] = window.location.pathname.split("/");
  if (
    (lovelaceCache.path && lovelaceCache.path !== dashboardPath) ||
    (lovelaceCastCache.path && lovelaceCastCache.path !== dashboardPath)
  ) {
    clearLovelaceCache();
  }
  return dashboardPath;
};

export const getLovelaceCast = () => {
  const dashboardPath = checkLocation();
  if (lovelaceCastCache.ref) {
    return lovelaceCastCache.ref;
  }

  const ll = findLovelaceCast();
  if (ll) {
    lovelaceCastCache = { path: dashboardPath, ref: ll };
  }
  return ll;
};

export const getLovelace = () => {
  const dashboardPath = checkLocation();
  if (lovelaceCache.ref) {
    return lovelaceCache.ref;
  }

  const ll = findLovelace();
  if (ll) {
    lovelaceCache = { path: dashboardPath, ref: ll };
  }
  return ll;
};
