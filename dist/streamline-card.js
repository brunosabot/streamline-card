var m = Object.defineProperty;
var u = (e, a, t) => a in e ? m(e, a, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[a] = t;
var l = (e, a, t) => u(e, typeof a != "symbol" ? a + "" : a, t);
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
    const s = StreamlineCardEditor.formatConfig(t), [n] = Object.keys(this._templates), i = {};
    i.type = s.type, i.template = s.template ?? n ?? "", i.variables = s.variables ?? [];
    const r = this.setVariablesDefault(i);
    deepEqual(r, this._config) === !1 && (this._config = r, fireEvent(this, "config-changed", { config: i })), this.render();
  }
  setVariablesDefault(t) {
    return this.getVariablesForTemplate(t.template).forEach((n, i) => {
      if (typeof t.variables[i] > "u" && (t.variables[i] = { [n]: "" }, n.toLowerCase().includes("entity"))) {
        const r = Object.keys(this._hass.states), o = r[Math.floor(Math.random() * r.length)];
        t.variables[i] = { [n]: o };
      }
    }), t;
  }
  initialize() {
    this.elements = {}, this.elements.error = document.createElement("ha-alert"), this.elements.error.setAttribute("alert-type", "error"), this.elements.error.classList.add("streamline-card-form__error"), this.elements.style = document.createElement("style"), this.elements.style.innerHTML = `
      .streamline-card-form__error {
        margin-bottom: 8px;
      }
    `, this.elements.form = document.createElement("ha-form"), this.elements.form.classList.add("streamline-card-form"), this.elements.form.addEventListener("value-changed", (t) => {
      let s = StreamlineCardEditor.formatConfig(t.detail.value);
      this._config.template !== s.template && (s.variables = [], s = this.setVariablesDefault(s)), fireEvent(this, "config-changed", { config: s }), this._config = s, this.render();
    }), this._shadow.appendChild(this.elements.error), this._shadow.appendChild(this.elements.form), this._shadow.appendChild(this.elements.style);
  }
  getVariablesForTemplate(t) {
    const s = {}, n = this._templates[t];
    if (typeof n > "u")
      throw new Error(
        `The template "${t}" doesn't exist in streamline_templates`
      );
    const i = JSON.stringify(n), r = /\[\[(?<name>.*?)\]\]/gu;
    return i.matchAll(r).forEach(([, o]) => {
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
    const s = { ...t }, n = s.variables ?? {};
    s.variables = [];
    for (const [i, r] of Object.entries(n))
      s.variables[Number(i)] = r;
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
    let n = StreamlineCardEditor.getDefaultSchema(s);
    return s.toLowerCase().includes("entity") ? n = StreamlineCardEditor.getEntitySchema(s) : s.toLowerCase().includes("icon") && (n = StreamlineCardEditor.getIconSchema(s)), {
      name: t,
      schema: [n],
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
    this._config.variables.every(
      (n) => Object.values(n).every((i) => typeof i != "object")
    ) === !1 ? (this.elements.error.style.display = "block", this.elements.error.innerText = "Object and array variables are not supported in the visual editor.", this.elements.form.schema = [t[0]]) : (this.elements.error.style.display = "none", this.elements.form.schema = t), this.elements.form.hass = this._hass, this.elements.form.data = this._config;
  }
}
typeof customElements.get("streamline-card-editor") > "u" && customElements.define("streamline-card-editor", StreamlineCardEditor);
const deepClone = (e) => structuredClone ? structuredClone(e) : JSON.parse(JSON.stringify(e)), getPrefixFromHass = (e) => {
  const a = (e == null ? void 0 : e.states) ?? void 0, t = (e == null ? void 0 : e.user) ?? void 0;
  return `
    var states = ${JSON.stringify(a)};
    var user = ${JSON.stringify(t)};
  `;
}, doEval = (string) => eval(string), evaluateJavascript = (e, a) => {
  const t = Object.keys(e);
  for (const s of t)
    if (e[s] instanceof Array) {
      let n;
      for (let i = 0; i < e[s].length; i += 1)
        if (typeof e[s][i] == "object")
          evaluateJavascript(e[s][i], a);
        else if (s.endsWith("_javascript")) {
          const r = getPrefixFromHass(a), o = s.replace("_javascript", "");
          try {
            e[o] || (e[o] = []), e[o][i] = doEval(
              `${r} ${e[s][i]}`
            );
          } catch (c) {
            n = c;
          }
        }
      if (s.endsWith("_javascript"))
        if (typeof n > "u")
          delete e[s];
        else
          throw delete e[s.replace("_javascript", "")], n;
    } else if (typeof e[s] == "object")
      evaluateJavascript(e[s], a);
    else if (s.endsWith("_javascript")) {
      const n = getPrefixFromHass(a), i = s.replace("_javascript", "");
      e[i] = doEval(`${n} ${e[s]}`), delete e[s];
    }
  return e;
}, replaceWithKeyValue = (e, a, t) => typeof t == "number" || typeof t == "boolean" ? e.replaceAll(`"[[${a}]]"`, t) : typeof t == "object" ? e.replaceAll(`"[[${a}]]"`, JSON.stringify(t)).replaceAll(`'[[${a}]]'`, JSON.stringify(t).replaceAll('"', '\\"')).replaceAll(
  `\`[[${a}]]\``,
  JSON.stringify(t).replaceAll('"', '\\"')
) : e.replaceAll(`[[${a}]]`, t), getVariables = (e, a = []) => [...e.default ?? [], ...a].reduce(
  (s, n) => ({
    ...s,
    ...Object.entries(n).reduce(
      (i, [r, o]) => ({ ...i, [r]: o }),
      {}
    )
  }),
  {}
);
function evaluateVariables(e, a) {
  if (!a && !e.default)
    return e.card;
  let t = JSON.stringify(
    e.card ?? e.element
  );
  const s = getVariables(e, a);
  return Object.entries(s).forEach(([n, i]) => {
    t = replaceWithKeyValue(t, n, i);
  }), JSON.parse(t);
}
function evaluateConfig(e, a, t) {
  let s = evaluateVariables(e, a);
  return typeof t < "u" && (s = evaluateJavascript(s, t)), s;
}
const version = "0.0.7";
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
      var i, r;
      this._isConnected && this._card && this._config && (this._card.nodeName === "HUI-ERROR-CARD" ? (this._shadow.removeChild(this._card), this._card = a.createCardElement(this._config), this._shadow.appendChild(this._card)) : (r = (i = this._card).setConfig) == null || r.call(i, this._config), this._config.visibility && (this.parentNode.config = {
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
      const i = deepClone(this._config ?? {}), r = getLovelace() || getLovelaceCast();
      if (!r.config && !r.config.streamline_templates)
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config."
        );
      const o = r.config.streamline_templates[this._originalConfig.template];
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
      this._config = evaluateConfig(
        o,
        this._originalConfig.variables,
        this._hass
      );
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
      var i, r;
      return ((r = (i = this._card) == null ? void 0 : i.getCardSize) == null ? void 0 : r.call(i)) ?? 1;
    }
    getLayoutOptions() {
      var i, r;
      return (r = (i = this._card) == null ? void 0 : i.getLayoutOptions) == null ? void 0 : r.call(i);
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
