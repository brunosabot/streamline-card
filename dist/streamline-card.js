var c = Object.defineProperty;
var f = (e, r, s) => r in e ? c(e, r, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[r] = s;
var d = (e, r, s) => f(e, typeof r != "symbol" ? r + "" : r, s);
const getLovelaceCast = () => {
  let e = document.querySelector("hc-main");
  if (e && (e = e.shadowRoot), e && (e = e.querySelector("hc-lovelace")), e && (e = e.shadowRoot), e && (e = e.querySelector("hui-view")), e) {
    const r = e.lovelace;
    return r.current_view = e.___curView, r;
  }
  return null;
}, getLovelace = () => {
  let e = document.querySelector("home-assistant");
  if (e && (e = e.shadowRoot), e && (e = e.querySelector("home-assistant-main")), e && (e = e.shadowRoot), e && (e = e.querySelector(
    "app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver"
  )), e = e && e.shadowRoot || e, e && (e = e.querySelector("ha-panel-lovelace")), e && (e = e.shadowRoot), e && (e = e.querySelector("hui-root")), e) {
    const r = e.lovelace;
    return r.current_view = e.___curView, r;
  }
  return null;
};
function deepReplace(e, r) {
  if (!r && !e.default)
    return e.card;
  let s = [];
  r && (s = r.slice(0)), e.default && (s = s.concat(e.default));
  let a = e.card ? JSON.stringify(e.card) : JSON.stringify(e.element);
  return s.forEach((n) => {
    const [t] = Object.keys(n), [i] = Object.values(n);
    if (typeof i == "number" || typeof i == "boolean") {
      const o = new RegExp(`"\\[\\[${t}\\]\\]"`, "gmu");
      a = a.replace(o, i);
    } else if (typeof i == "object") {
      const o = new RegExp(`"\\[\\[${t}\\]\\]"`, "gmu"), l = JSON.stringify(i);
      a = a.replace(o, l);
    } else {
      const o = new RegExp(`\\[\\[${t}\\]\\]`, "gmu");
      a = a.replace(o, i);
    }
  }), JSON.parse(a);
}
const getPrefixFromHass = (e) => {
  const r = (e == null ? void 0 : e.states) ?? void 0, s = (e == null ? void 0 : e.user) ?? void 0;
  return `
    var states = ${JSON.stringify(r)};
    var user = ${JSON.stringify(s)};
  `;
}, doEval = (string) => eval(string), evaluateConfig = (e, r) => {
  const s = Object.keys(e);
  for (const a of s)
    if (e[a] instanceof Array) {
      let n;
      for (let t = 0; t < e[a].length; t += 1)
        if (typeof e[a][t] == "object")
          evaluateConfig(e[a][t], r);
        else if (a.endsWith("_javascript")) {
          const i = getPrefixFromHass(r), o = a.replace("_javascript", "");
          try {
            e[o] || (e[o] = []), e[o][t] = doEval(
              `${i} ${e[a][t]}`
            );
          } catch (l) {
            n = l;
          }
        }
      if (a.endsWith("_javascript"))
        if (typeof n > "u")
          delete e[a];
        else
          throw delete e[a.replace("_javascript", "")], n;
    } else if (typeof e[a] == "object")
      evaluateConfig(e[a], r);
    else if (a.endsWith("_javascript")) {
      const n = getPrefixFromHass(r), t = a.replace("_javascript", "");
      e[t] = doEval(`${n} ${e[a]}`), delete e[a];
    }
}, version = "0.0.4";
(async function e() {
  const r = window.loadCardHelpers ? await window.loadCardHelpers() : void 0;
  class s extends HTMLElement {
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
      var t, i;
      this._isConnected && this._card && this._config && ((i = (t = this._card).setConfig) == null || i.call(t, this._config));
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
      var l;
      const t = getLovelace() || getLovelaceCast();
      if (!t.config && !t.config.streamline_templates)
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config."
        );
      const i = t.config.streamline_templates[this._originalConfig.template];
      if (i)
        if (i.card || i.element) {
          if (i.card && i.element)
            throw new Error("You can define a card and an element in the template");
        } else throw new Error(
          "You should define either a card or an element in the template"
        );
      else throw new Error(
        `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`
      );
      this._config = deepReplace(
        i,
        this._originalConfig.variables
      ), typeof (((l = this._hass) == null ? void 0 : l.states) ?? void 0) < "u" && evaluateConfig(this._config, this._hass);
    }
    setConfig(t) {
      if (this._originalConfig = t, this.parseConfig(), typeof this._card > "u") {
        if (typeof this._config.type > "u")
          throw new Error("[Streamline Card] You need to define a type");
        this._card = r.createCardElement(this._config), this._shadow.appendChild(this._card);
      }
      this.updateCardConfig();
    }
    getCardSize() {
      var t, i;
      return ((i = (t = this._card) == null ? void 0 : t.getCardSize) == null ? void 0 : i.call(t)) ?? 1;
    }
    getLayoutOptions() {
      var t, i;
      return (i = (t = this._card) == null ? void 0 : t.getLayoutOptions) == null ? void 0 : i.call(t);
    }
  }
  customElements.define("streamline-card", s), window.customCards || (window.customCards = []), window.customCards.push({
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
