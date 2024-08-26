var l = Object.defineProperty;
var f = (e, i, a) => i in e ? l(e, i, { enumerable: !0, configurable: !0, writable: !0, value: a }) : e[i] = a;
var d = (e, i, a) => f(e, typeof i != "symbol" ? i + "" : i, a);
const getLovelaceCast = () => {
  let e = document.querySelector("hc-main");
  if (e && (e = e.shadowRoot), e && (e = e.querySelector("hc-lovelace")), e && (e = e.shadowRoot), e && (e = e.querySelector("hui-view")), e) {
    const i = e.lovelace;
    return i.current_view = e.___curView, i;
  }
  return null;
}, getLovelace = () => {
  let e = document.querySelector("home-assistant");
  if (e && (e = e.shadowRoot), e && (e = e.querySelector("home-assistant-main")), e && (e = e.shadowRoot), e && (e = e.querySelector(
    "app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver"
  )), e = e && e.shadowRoot || e, e && (e = e.querySelector("ha-panel-lovelace")), e && (e = e.shadowRoot), e && (e = e.querySelector("hui-root")), e) {
    const i = e.lovelace;
    return i.current_view = e.___curView, i;
  }
  return null;
};
function deepReplace(e, i) {
  if (!i && !e.default)
    return e.card;
  let a = [];
  i && (a = i.slice(0)), e.default && (a = a.concat(e.default));
  let r = e.card ? JSON.stringify(e.card) : JSON.stringify(e.element);
  return a.forEach((n) => {
    const [t] = Object.keys(n), [s] = Object.values(n);
    if (typeof s == "number" || typeof s == "boolean") {
      const o = new RegExp(`"\\[\\[${t}\\]\\]"`, "gmu");
      r = r.replace(o, s);
    } else if (typeof s == "object") {
      const o = new RegExp(`"\\[\\[${t}\\]\\]"`, "gmu"), c = JSON.stringify(s);
      r = r.replace(o, c);
    } else {
      const o = new RegExp(`\\[\\[${t}\\]\\]`, "gmu");
      r = r.replace(o, s);
    }
  }), JSON.parse(r);
}
const getPrefixFromHass = (e) => {
  const i = (e == null ? void 0 : e.states) ?? void 0, a = (e == null ? void 0 : e.user) ?? void 0;
  return `
    var states = ${JSON.stringify(i)};
    var user = ${JSON.stringify(a)};
  `;
}, doEval = (string) => eval(string), evaluateConfig = (e, i) => {
  const a = Object.keys(e);
  for (const r of a)
    if (e[r] instanceof Array) {
      let n;
      for (let t = 0; t < e[r].length; t += 1)
        if (typeof e[r][t] == "object")
          evaluateConfig(e[r][t], i);
        else if (r.endsWith("_javascript")) {
          const s = getPrefixFromHass(i), o = r.replace("_javascript", "");
          try {
            e[o] || (e[o] = []), e[o][t] = doEval(
              `${s} ${e[r][t]}`
            );
          } catch (c) {
            n = c;
          }
        }
      if (r.endsWith("_javascript"))
        if (typeof n > "u")
          delete e[r];
        else
          throw delete e[r.replace("_javascript", "")], n;
    } else if (typeof e[r] == "object")
      evaluateConfig(e[r], i);
    else if (r.endsWith("_javascript")) {
      const n = getPrefixFromHass(i), t = r.replace("_javascript", "");
      e[t] = doEval(`${n} ${e[r]}`), delete e[r];
    }
}, version = "0.0.5";
(async function e() {
  const i = window.loadCardHelpers ? await window.loadCardHelpers() : void 0;
  class a extends HTMLElement {
    constructor() {
      super();
      d(this, "_editMode", !1);
      d(this, "_isConnected", !1);
      d(this, "_config", {});
      d(this, "_originalConfig", {});
      d(this, "_hass", {});
      d(this, "_card");
      d(this, "_shadow");
      d(this, "_accessedProperties", /* @__PURE__ */ new Set());
      this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    }
    updateCardHass() {
      this._isConnected && this._card && this._hass && (this._card.hass = this._hass);
    }
    updateCardEditMode() {
      this._isConnected && this._card && (this._card.editMode = this._editMode);
    }
    updateCardConfig() {
      var t, s;
      this._isConnected && this._card && this._config && ((s = (t = this._card).setConfig) == null || s.call(t, this._config), this._config.visibility && (this.parentNode.config = {
        ...this.parentNode.config,
        visibility: this._config.visibility
      }));
    }
    connectedCallback() {
      this._isConnected = !0, this.updateCardConfig(), this.updateCardEditMode(), this.updateCardHass();
    }
    disconnectedCallback() {
      this._isConnected = !1;
    }
    get editMode() {
      return this._editMode;
    }
    set editMode(t) {
      t !== this._editMode && (this._editMode = t, this.updateCardEditMode());
    }
    get hass() {
      return this._hass;
    }
    set hass(t) {
      this._hass = t, this.parseConfig(), this.updateCardConfig(), this.updateCardHass();
    }
    parseConfig() {
      var c;
      const t = getLovelace() || getLovelaceCast();
      if (!t.config && !t.config.streamline_templates)
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config."
        );
      const s = t.config.streamline_templates[this._originalConfig.template];
      if (s)
        if (s.card || s.element) {
          if (s.card && s.element)
            throw new Error("You can define a card and an element in the template");
        } else throw new Error(
          "You should define either a card or an element in the template"
        );
      else throw new Error(
        `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`
      );
      this._config = deepReplace(
        s,
        this._originalConfig.variables
      ), typeof (((c = this._hass) == null ? void 0 : c.states) ?? void 0) < "u" && evaluateConfig(this._config, this._hass);
    }
    setConfig(t) {
      if (this._originalConfig = t, this.parseConfig(), typeof this._card > "u") {
        if (typeof this._config.type > "u")
          throw new Error("[Streamline Card] You need to define a type");
        this._card = i.createCardElement(this._config), this._shadow.appendChild(this._card);
      }
      this.updateCardConfig();
    }
    getCardSize() {
      var t, s;
      return ((s = (t = this._card) == null ? void 0 : t.getCardSize) == null ? void 0 : s.call(t)) ?? 1;
    }
    getLayoutOptions() {
      var t, s;
      return (s = (t = this._card) == null ? void 0 : t.getLayoutOptions) == null ? void 0 : s.call(t);
    }
  }
  customElements.define("streamline-card", a), window.customCards || (window.customCards = []), window.customCards.push({
    description: "A config simplifier.",
    name: "Streamline Card",
    preview: !1,
    type: "streamline-card"
  }), console.info(
    `%c Streamline Card %c ${version}`,
    "background-color:#c2b280;color:#242424;padding:4px 4px 4px 8px;border-radius:20px 0 0 20px;font-family:sans-serif;",
    "background-color:#5297ff;color:#242424;padding:4px 8px 4px 4px;border-radius:0 20px 20px 0;font-family:sans-serif;"
  );
})();
