var l = Object.defineProperty;
var h = (e, a, s) => a in e ? l(e, a, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[a] = s;
var n = (e, a, s) => h(e, typeof a != "symbol" ? a + "" : a, s);
function u(e, a) {
  if (!e && !a.default)
    return a.card;
  let s = [];
  e && (s = e.slice(0)), a.default && (s = s.concat(a.default));
  let i = a.card ? JSON.stringify(a.card) : JSON.stringify(a.element);
  return s.forEach((t) => {
    const r = Object.keys(t)[0], o = Object.values(t)[0];
    if (typeof o == "number" || typeof o == "boolean") {
      const d = new RegExp(`"\\[\\[${r}\\]\\]"`, "gm");
      i = i.replace(d, o);
    }
    if (typeof o == "object") {
      const d = new RegExp(`"\\[\\[${r}\\]\\]"`, "gm"), c = JSON.stringify(o);
      i = i.replace(d, c);
    } else {
      const d = new RegExp(`\\[\\[${r}\\]\\]`, "gm");
      i = i.replace(d, o);
    }
  }), JSON.parse(i);
}
function p() {
  let e = document.querySelector("hc-main");
  if (e = e && e.shadowRoot, e = e && e.querySelector("hc-lovelace"), e = e && e.shadowRoot, e = e && e.querySelector("hui-view"), e) {
    const a = e.lovelace;
    return a.current_view = e.___curView, a;
  }
  return null;
}
function f() {
  let e = document.querySelector("home-assistant");
  if (e = e && e.shadowRoot, e = e && e.querySelector("home-assistant-main"), e = e && e.shadowRoot, e = e && e.querySelector("app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver"), e = e && e.shadowRoot || e, e = e && e.querySelector("ha-panel-lovelace"), e = e && e.shadowRoot, e = e && e.querySelector("hui-root"), e) {
    const a = e.lovelace;
    return a.current_view = e.___curView, a;
  }
  return null;
}
const _ = "0.0.1";
(async function() {
  const e = window.loadCardHelpers ? await window.loadCardHelpers() : void 0;
  class a extends HTMLElement {
    constructor() {
      super();
      n(this, "_editMode", !1);
      n(this, "_isConnected", !1);
      n(this, "_config", {});
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
      var t, r;
      this._isConnected && this._card && this._config.card && ((r = (t = this._card).setConfig) == null || r.call(t, this._config.card));
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
      this._hass = t, this.updateCardHass();
    }
    parseConfig(t) {
      const r = f() || p();
      if (!r.config && !r.config.streamline_templates)
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config."
        );
      const o = r.config.streamline_templates[this._config.template];
      if (o)
        if (o.card || o.element) {
          if (o.card && o.element)
            throw new Error("You can define a card and an element in the template");
        } else throw new Error(
          "You should define either a card or an element in the template"
        );
      else throw new Error(
        `The template "${t.template}" doesn't exist in streamline_templates`
      );
      this._config = u(t.variables, o);
    }
    async setConfig(t) {
      if (this._config = t, this.parseConfig(t), this._card === void 0) {
        if (this._config.type === void 0)
          throw new Error("[Streamline Card] You need to define a type");
        this._card = e.createCardElement(this._config), this._shadow.appendChild(this._card);
      }
      this.updateCardConfig();
    }
    getCardSize() {
      var t, r;
      return ((r = (t = this._card) == null ? void 0 : t.getCardSize) == null ? void 0 : r.call(t)) ?? 1;
    }
    getLayoutOptions() {
      var t, r;
      return (r = (t = this._card) == null ? void 0 : t.getLayoutOptions) == null ? void 0 : r.call(t);
    }
  }
  customElements.define("streamline-card", a), window.customCards = window.customCards || [], window.customCards.push({
    type: "streamline-card",
    name: "Streamline Card",
    preview: !1,
    description: "A config simplifier."
  }), console.info(
    `%c Streamline Card %c ${_}`,
    "background-color:#c2b280;color:#242424;padding:4px 4px 4px 8px;border-radius:20px 0 0 20px;font-family:sans-serif;",
    "background-color:#5297ff;color:#242424;padding:4px 8px 4px 4px;border-radius:0 20px 20px 0;font-family:sans-serif;"
  );
})();
