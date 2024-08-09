var f = Object.defineProperty;
var h = (e, s, o) => s in e ? f(e, s, { enumerable: !0, configurable: !0, writable: !0, value: o }) : e[s] = o;
var n = (e, s, o) => h(e, typeof s != "symbol" ? s + "" : s, o);
function deepReplace(e, s) {
  if (!e && !s.default)
    return s.card;
  let o = [];
  e && (o = e.slice(0)), s.default && (o = o.concat(s.default));
  let r = s.card ? JSON.stringify(s.card) : JSON.stringify(s.element);
  return o.forEach((t) => {
    const a = Object.keys(t)[0], c = Object.values(t)[0];
    if (typeof c == "number" || typeof c == "boolean") {
      const d = new RegExp(`"\\[\\[${a}\\]\\]"`, "gm");
      r = r.replace(d, c);
    }
    if (typeof c == "object") {
      const d = new RegExp(`"\\[\\[${a}\\]\\]"`, "gm"), l = JSON.stringify(c);
      r = r.replace(d, l);
    } else {
      const d = new RegExp(`\\[\\[${a}\\]\\]`, "gm");
      r = r.replace(d, c);
    }
  }), JSON.parse(r);
}
function getLovelaceCast() {
  let e = document.querySelector("hc-main");
  if (e = e && e.shadowRoot, e = e && e.querySelector("hc-lovelace"), e = e && e.shadowRoot, e = e && e.querySelector("hui-view"), e) {
    const s = e.lovelace;
    return s.current_view = e.___curView, s;
  }
  return null;
}
function getLovelace() {
  let e = document.querySelector("home-assistant");
  if (e = e && e.shadowRoot, e = e && e.querySelector("home-assistant-main"), e = e && e.shadowRoot, e = e && e.querySelector("app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver"), e = e && e.shadowRoot || e, e = e && e.querySelector("ha-panel-lovelace"), e = e && e.shadowRoot, e = e && e.querySelector("hui-root"), e) {
    const s = e.lovelace;
    return s.current_view = e.___curView, s;
  }
  return null;
}
const version = "0.0.2";
function evaluateConfig(config, hass) {
  const configKeys = Object.keys(config);
  for (let key of configKeys)
    if (config[key] instanceof Array) {
      for (let i = 0; i < config[key].length; i++)
        if (typeof config[key][i] == "object")
          evaluateConfig(config[key][i], hass);
        else {
          const states = (hass == null ? void 0 : hass.states) ?? void 0, user = (hass == null ? void 0 : hass.user) ?? void 0, prefix = `
            var states = ${JSON.stringify(states)};
            var user = ${JSON.stringify(user)};
          `, keyWithoutJavascript = key.replace("_javascript", ""), stringToEvaluatate = `${prefix} ${config[key][i]}`;
          try {
            config[keyWithoutJavascript] = config[keyWithoutJavascript] || {}, config[keyWithoutJavascript][i] = eval(stringToEvaluatate);
          } catch (e) {
            config[keyWithoutJavascript][i] = void 0;
          }
        }
      delete config[key];
    } else if (typeof config[key] == "object")
      evaluateConfig(config[key], hass);
    else if (key.endsWith("_javascript")) {
      const states = (hass == null ? void 0 : hass.states) ?? void 0, user = (hass == null ? void 0 : hass.user) ?? void 0, prefix = `
        var states = ${JSON.stringify(states)};
        var user = ${JSON.stringify(user)};
      `, keyWithoutJavascript = key.replace("_javascript", ""), stringToEvaluatate = `${prefix} ${config[key]}`;
      try {
        config[keyWithoutJavascript] = eval(stringToEvaluatate), delete config[key];
      } catch (e) {
        config[keyWithoutJavascript] = void 0;
      }
    }
}
(async function() {
  const e = window.loadCardHelpers ? await window.loadCardHelpers() : void 0;
  class s extends HTMLElement {
    constructor() {
      super();
      n(this, "_editMode", !1);
      n(this, "_isConnected", !1);
      n(this, "_config", {});
      n(this, "_originalConfig", {});
      n(this, "_hass", {});
      n(this, "_card");
      n(this, "_shadow");
      n(this, "_accessedProperties", /* @__PURE__ */ new Set());
      this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    }
    updateCardHass() {
      this._isConnected && this._card && this._hass && (this._card.hass = this._hass);
    }
    updateCardEditMode() {
      this._isConnected && this._card && (this._card.editMode = this._editMode);
    }
    updateCardConfig() {
      var t, a;
      this._isConnected && this._card && this._config.card && ((a = (t = this._card).setConfig) == null || a.call(t, this._config.card));
    }
    connectedCallback() {
      this._isConnected = !0, this.updateCardConfig(), this.updateCardEditMode(), this.updateCardHass();
    }
    disconnectedCallback() {
      this._isConnected = !1;
    }
    set editMode(t) {
      t !== this._editMode && (this._editMode = t, this.updateCardEditMode());
    }
    set hass(t) {
      this._hass = t, this.parseConfig(), this.updateCardHass();
    }
    parseConfig() {
      const t = getLovelace() || getLovelaceCast();
      if (!t.config && !t.config.streamline_templates)
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config."
        );
      const a = t.config.streamline_templates[this._originalConfig.template];
      if (a)
        if (a.card || a.element) {
          if (a.card && a.element)
            throw new Error("You can define a card and an element in the template");
        } else throw new Error(
          "You should define either a card or an element in the template"
        );
      else throw new Error(
        `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`
      );
      this._config = deepReplace(
        this._originalConfig.variables,
        a
      ), evaluateConfig(this._config, this._hass);
    }
    async setConfig(t) {
      if (this._originalConfig = t, this.parseConfig(), this._card === void 0) {
        if (this._config.type === void 0)
          throw new Error("[Streamline Card] You need to define a type");
        this._card = e.createCardElement(this._config), this._shadow.appendChild(this._card);
      }
      this.updateCardConfig();
    }
    getCardSize() {
      var t, a;
      return ((a = (t = this._card) == null ? void 0 : t.getCardSize) == null ? void 0 : a.call(t)) ?? 1;
    }
    getLayoutOptions() {
      var t, a;
      return (a = (t = this._card) == null ? void 0 : t.getLayoutOptions) == null ? void 0 : a.call(t);
    }
  }
  customElements.define("streamline-card", s), window.customCards = window.customCards || [], window.customCards.push({
    type: "streamline-card",
    name: "Streamline Card",
    preview: !1,
    description: "A config simplifier."
  }), console.info(
    `%c Streamline Card %c ${version}`,
    "background-color:#c2b280;color:#242424;padding:4px 4px 4px 8px;border-radius:20px 0 0 20px;font-family:sans-serif;",
    "background-color:#5297ff;color:#242424;padding:4px 8px 4px 4px;border-radius:0 20px 20px 0;font-family:sans-serif;"
  );
})();
