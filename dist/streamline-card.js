var u = Object.defineProperty;
var m = (e, a, t) => a in e ? u(e, a, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[a] = t;
var l = (e, a, t) => m(e, typeof a != "symbol" ? a + "" : a, t);
const getLovelaceCast = () => {
  let e = document.querySelector("hc-main");
  if (e && (e = e.shadowRoot), e && (e = e.querySelector("hc-lovelace")), e && (e = e.shadowRoot), e && (e = e.querySelector("hui-view")), e) {
    const a = e.lovelace;
    return a.current_view = e.___curView, a;
  }
  return null;
}, getLovelace = () => {
  let e = document.querySelector("home-assistant");
  if (e && (e = e.shadowRoot), e && (e = e.querySelector("home-assistant-main")), e && (e = e.shadowRoot), e && (e = e.querySelector(
    "app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver"
  )), e = e && e.shadowRoot || e, e && (e = e.querySelector("ha-panel-lovelace")), e && (e = e.shadowRoot), e && (e = e.querySelector("hui-root")), e) {
    const a = e.lovelace;
    return a.current_view = e.___curView, a;
  }
  return null;
}, isPrimitive = (e) => e !== Object(e), deepEqual = (e, a) => {
  if (e === a)
    return !0;
  if (isPrimitive(e) && isPrimitive(a))
    return e === a;
  if (Object.keys(e).length !== Object.keys(a).length)
    return !1;
  for (const t in e)
    if (Object.hasOwn(e, t) && (!(t in a) || deepEqual(e[t], a[t]) === !1))
      return !1;
  return !0;
}, fireEvent = (e, a, t = {}) => {
  const s = new Event(a, {
    bubbles: !0,
    cancelable: !1,
    composed: !0
  });
  return s.detail = t, e.dispatchEvent(s), s;
};
class StreamlineCardEditor extends HTMLElement {
  constructor(t) {
    super();
    l(this, "_card");
    l(this, "_hass");
    l(this, "_shadow");
    l(this, "_templates", {});
    this._card = t, this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    const s = getLovelace() || getLovelaceCast();
    if (this._templates = s.config.streamline_templates, this._templates === null)
      throw new Error(
        "The object streamline_templates doesn't exist in your main lovelace config."
      );
    this._config = {
      template: Object.keys(this._templates)[0],
      type: "streamline-card",
      variables: []
    }, this.initialize();
  }
  get hass() {
    return this._hass;
  }
  set hass(t) {
    this._hass = t, this.render();
  }
  setConfig(t) {
    const s = StreamlineCardEditor.formatConfig(t), [r] = Object.keys(this._templates), i = {};
    i.type = s.type, i.template = s.template ?? r ?? "", i.variables = s.variables ?? [];
    const n = this.setVariablesDefault(i);
    deepEqual(n, this._config) === !1 && (this._config = n, fireEvent(this, "config-changed", { config: i })), this.render();
  }
  setVariablesDefault(t) {
    return this.getVariablesForTemplate(t.template).forEach((r, i) => {
      if (typeof t.variables[i] > "u" && (t.variables[i] = { [r]: "" }, r.toLowerCase().includes("entity"))) {
        const n = Object.keys(this._hass.states), o = n[Math.floor(Math.random() * n.length)];
        t.variables[i] = { [r]: o };
      }
    }), t;
  }
  initialize() {
    this.elements = {}, this.elements.style = document.createElement("style"), this.elements.style.innerHTML = `
      .streamline-card-form > * {
        display: block;
        margin-top: 8px;
        width: 100%;
      }
    `, this.elements.form = document.createElement("ha-form"), this.elements.form.classList.add("streamline-card-form"), this.elements.form.addEventListener("value-changed", (t) => {
      const s = StreamlineCardEditor.formatConfig(t.detail.value);
      fireEvent(this, "config-changed", { config: s }), this._config = s, this.render();
    }), this._shadow.appendChild(this.elements.form), this._shadow.appendChild(this.elements.style);
  }
  getVariablesForTemplate(t) {
    const s = {}, r = this._templates[t];
    if (typeof r > "u")
      throw new Error(
        `The template "${t}" doesn't exist in streamline_templates`
      );
    const i = JSON.stringify(r), n = /\[\[(?<name>.*?)\]\]/gu;
    return i.matchAll(n).forEach(([, o]) => {
      s[o] = o;
    }), Object.keys(s).sort((o, c) => {
      const h = Object.keys(this._config.variables).find(
        (d) => Object.hasOwn(this._config.variables[d], o)
      ), f = Object.keys(this._config.variables).find(
        (d) => Object.hasOwn(this._config.variables[d], c)
      );
      return h - f;
    });
  }
  static formatConfig(t) {
    const s = { ...t }, r = s.variables ?? {};
    s.variables = [];
    for (const [i, n] of Object.entries(r))
      s.variables[Number(i)] = n;
    return s;
  }
  static getTemplateSchema(t) {
    return {
      name: "template",
      selector: {
        select: {
          mode: "dropdown",
          options: t.map((s) => ({
            label: s,
            value: s
          })),
          sort: !0
        }
      },
      title: "Template"
    };
  }
  static getEntitySchema(t) {
    return {
      name: t,
      selector: { entity: {} },
      title: t
    };
  }
  static getIconSchema(t) {
    return {
      name: t,
      selector: { icon: {} },
      title: t
    };
  }
  static getDefaultSchema(t) {
    return {
      name: t,
      selector: { text: {} },
      title: t
    };
  }
  static getVariableSchema(t, s) {
    let r = StreamlineCardEditor.getDefaultSchema(s);
    return s.toLowerCase().includes("entity") ? r = StreamlineCardEditor.getEntitySchema(s) : s.toLowerCase().includes("icon") && (r = StreamlineCardEditor.getIconSchema(s)), {
      name: t,
      schema: [r],
      type: "grid"
    };
  }
  getSchema() {
    const t = this.getVariablesForTemplate(this._config.template);
    return [
      StreamlineCardEditor.getTemplateSchema(Object.keys(this._templates)),
      {
        expanded: !0,
        name: "variables",
        schema: Object.keys(t).map(
          (s) => StreamlineCardEditor.getVariableSchema(s, t[s])
        ),
        title: "Variables",
        type: "expandable"
      }
    ];
  }
  render() {
    const t = this.getSchema();
    this.elements.form.hass = this._hass, this.elements.form.data = this._config, this.elements.form.schema = t;
  }
}
typeof customElements.get("streamline-card-editor") > "u" && customElements.define("streamline-card-editor", StreamlineCardEditor);
const deepClone = (e) => structuredClone ? structuredClone(e) : JSON.parse(JSON.stringify(e));
function deepReplace(e, a) {
  if (!a && !e.default)
    return e.card;
  let t = [];
  a && (t = a.slice(0)), e.default && (t = t.concat(e.default));
  let s = e.card ? JSON.stringify(e.card) : JSON.stringify(e.element);
  return t.forEach((r) => {
    const [i] = Object.keys(r), [n] = Object.values(r);
    if (typeof n == "number" || typeof n == "boolean") {
      const o = new RegExp(`"\\[\\[${i}\\]\\]"`, "gmu");
      s = s.replace(o, n);
    } else if (typeof n == "object") {
      const o = new RegExp(`"\\[\\[${i}\\]\\]"`, "gmu"), c = JSON.stringify(n);
      s = s.replace(o, c);
    } else {
      const o = new RegExp(`\\[\\[${i}\\]\\]`, "gmu");
      s = s.replace(o, n);
    }
  }), JSON.parse(s);
}
const getPrefixFromHass = (e) => {
  const a = (e == null ? void 0 : e.states) ?? void 0, t = (e == null ? void 0 : e.user) ?? void 0;
  return `
    var states = ${JSON.stringify(a)};
    var user = ${JSON.stringify(t)};
  `;
}, doEval = (string) => eval(string), evaluateConfig = (e, a) => {
  const t = Object.keys(e);
  for (const s of t)
    if (e[s] instanceof Array) {
      let r;
      for (let i = 0; i < e[s].length; i += 1)
        if (typeof e[s][i] == "object")
          evaluateConfig(e[s][i], a);
        else if (s.endsWith("_javascript")) {
          const n = getPrefixFromHass(a), o = s.replace("_javascript", "");
          try {
            e[o] || (e[o] = []), e[o][i] = doEval(
              `${n} ${e[s][i]}`
            );
          } catch (c) {
            r = c;
          }
        }
      if (s.endsWith("_javascript"))
        if (typeof r > "u")
          delete e[s];
        else
          throw delete e[s.replace("_javascript", "")], r;
    } else if (typeof e[s] == "object")
      evaluateConfig(e[s], a);
    else if (s.endsWith("_javascript")) {
      const r = getPrefixFromHass(a), i = s.replace("_javascript", "");
      e[i] = doEval(`${r} ${e[s]}`), delete e[s];
    }
}, version = "0.0.6";
(async function e() {
  const a = window.loadCardHelpers ? await window.loadCardHelpers() : void 0;
  class t extends HTMLElement {
    constructor() {
      super();
      l(this, "_editMode", !1);
      l(this, "_isConnected", !1);
      l(this, "_config");
      l(this, "_originalConfig");
      l(this, "_hass");
      l(this, "_card");
      l(this, "_shadow");
      l(this, "_accessedProperties", /* @__PURE__ */ new Set());
      this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    }
    updateCardHass() {
      this._isConnected && this._card && this._hass && (this._card.hass = this._hass);
    }
    updateCardEditMode() {
      this._isConnected && this._card && (this._card.editMode = this._editMode);
    }
    updateCardConfig() {
      var i, n;
      this._isConnected && this._card && this._config && ((n = (i = this._card).setConfig) == null || n.call(i, this._config), this._config.visibility && (this.parentNode.config = {
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
    set editMode(i) {
      i !== this._editMode && (this._editMode = i, this.updateCardEditMode());
    }
    get hass() {
      return this._hass;
    }
    set hass(i) {
      this._hass = i, this.parseConfig() && this.updateCardConfig(), this.updateCardHass();
    }
    parseConfig() {
      const i = deepClone(this._config ?? {}), n = getLovelace() || getLovelaceCast();
      if (!n.config && !n.config.streamline_templates)
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config."
        );
      const o = n.config.streamline_templates[this._originalConfig.template];
      if (o)
        if (o.card || o.element) {
          if (o.card && o.element)
            throw new Error("You can define a card and an element in the template");
        } else throw new Error(
          "You should define either a card or an element in the template"
        );
      else throw new Error(
        `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`
      );
      this._config = deepReplace(
        o,
        this._originalConfig.variables
      ), typeof this._hass < "u" && evaluateConfig(this._config, this._hass);
      const c = deepClone(this._config);
      return deepEqual(i, c) === !1;
    }
    setConfig(i) {
      if (this._originalConfig = i, this.parseConfig() !== !1) {
        if (typeof this._card > "u") {
          if (typeof this._config.type > "u")
            throw new Error("[Streamline Card] You need to define a type");
          this._card = a.createCardElement(this._config), this._shadow.appendChild(this._card);
        }
        this.updateCardConfig();
      }
    }
    getCardSize() {
      var i, n;
      return ((n = (i = this._card) == null ? void 0 : i.getCardSize) == null ? void 0 : n.call(i)) ?? 1;
    }
    getLayoutOptions() {
      var i, n;
      return (n = (i = this._card) == null ? void 0 : i.getLayoutOptions) == null ? void 0 : n.call(i);
    }
    static getConfigElement() {
      return document.createElement("streamline-card-editor");
    }
  }
  customElements.define("streamline-card", t), window.customCards || (window.customCards = []), window.customCards.push({
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
