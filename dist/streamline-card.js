var m = Object.defineProperty;
var p = (e, s, t) => s in e ? m(e, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[s] = t;
var l = (e, s, t) => p(e, typeof s != "symbol" ? s + "" : s, t);
const getLovelaceCast = () => {
  let e = document.querySelector("hc-main");
  if (e && (e = e.shadowRoot), e && (e = e.querySelector("hc-lovelace")), e && (e = e.shadowRoot), e && (e = e.querySelector("hui-view")), e) {
    const s = e.lovelace;
    return s.current_view = e.___curView, s;
  }
  return null;
}, getLovelace = () => {
  let e = document.querySelector("home-assistant");
  if (e && (e = e.shadowRoot), e && (e = e.querySelector("home-assistant-main")), e && (e = e.shadowRoot), e && (e = e.querySelector(
    "app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver"
  )), e = e && e.shadowRoot || e, e && (e = e.querySelector("ha-panel-lovelace")), e && (e = e.shadowRoot), e && (e = e.querySelector("hui-root")), e) {
    const s = e.lovelace;
    return s.current_view = e.___curView, s;
  }
  return null;
}, isPrimitive = (e) => e !== Object(e), deepEqual = (e, s) => {
  if (e === s)
    return !0;
  if (isPrimitive(e) && isPrimitive(s))
    return e === s;
  if (Object.keys(e).length !== Object.keys(s).length)
    return !1;
  for (const t in e)
    if (Object.hasOwn(e, t) && (!(t in s) || deepEqual(e[t], s[t]) === !1))
      return !1;
  return !0;
}, fireEvent = (e, s, t = {}) => {
  const i = new Event(s, {
    bubbles: !0,
    cancelable: !1,
    composed: !0
  });
  return i.detail = t, e.dispatchEvent(i), i;
};
function formatVariables(e) {
  const s = {};
  return e instanceof Array ? e.forEach((t) => {
    Object.entries(t).forEach(([i, r]) => {
      s[i] = r;
    });
  }) : Object.entries(e).forEach(([t, i]) => {
    s[t] = i;
  }), s;
}
class StreamlineCardEditor extends HTMLElement {
  constructor(t) {
    super();
    l(this, "_card");
    l(this, "_hass");
    l(this, "_shadow");
    l(this, "_templates", {});
    this._card = t, this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    const i = getLovelace() || getLovelaceCast();
    if (this._templates = i.config.streamline_templates, this._templates === null)
      throw new Error(
        "The object streamline_templates doesn't exist in your main lovelace config."
      );
    this._config = {
      template: Object.keys(this._templates)[0],
      type: "streamline-card",
      variables: {}
    }, this.initialize();
  }
  get hass() {
    return this._hass;
  }
  set hass(t) {
    this._hass = t, this.render();
  }
  setConfig(t) {
    const i = StreamlineCardEditor.formatConfig(t), [r] = Object.keys(this._templates), a = {};
    a.type = i.type, a.template = i.template ?? r ?? "", a.variables = i.variables ?? {};
    const n = this.setVariablesDefault(a);
    deepEqual(n, this._config) === !1 && (this._config = n, fireEvent(this, "config-changed", { config: a })), this.render();
  }
  setVariablesDefault(t) {
    return this.getVariablesForTemplate(t.template).forEach((r) => {
      if (r.toLowerCase().includes("entity") && t.variables[r] === "") {
        const a = Object.keys(this._hass.states), n = a[Math.floor(Math.random() * a.length)];
        t.variables[r] = n;
      } else t.variables[r] || (t.variables[r] = "");
    }), t;
  }
  initialize() {
    this.elements = {}, this.elements.error = document.createElement("ha-alert"), this.elements.error.setAttribute("alert-type", "error"), this.elements.error.classList.add("streamline-card-form__error"), this.elements.style = document.createElement("style"), this.elements.style.innerHTML = `
      .streamline-card-form__error {
        margin-bottom: 8px;
      }
    `, this.elements.form = document.createElement("ha-form"), this.elements.form.classList.add("streamline-card-form"), this.elements.form.computeLabel = StreamlineCardEditor.computeLabel, this.elements.form.addEventListener("value-changed", (t) => {
      let i = StreamlineCardEditor.formatConfig(t.detail.value);
      this._config.template !== i.template && (i.variables = {}, i = this.setVariablesDefault(i)), fireEvent(this, "config-changed", { config: i }), this._config = i, this.render();
    }), this._shadow.appendChild(this.elements.error), this._shadow.appendChild(this.elements.form), this._shadow.appendChild(this.elements.style);
  }
  getVariablesForTemplate(t) {
    const i = {}, r = this._templates[t];
    if (typeof r > "u")
      throw new Error(
        `The template "${t}" doesn't exist in streamline_templates`
      );
    const a = JSON.stringify(r), n = /\[\[(?<name>.*?)\]\]/gu;
    return [...a.matchAll(n)].forEach(([, o]) => {
      i[o] = o;
    }), Object.keys(i).sort((o, c) => {
      const h = Object.keys(this._config.variables).find(
        (d) => Object.hasOwn(this._config.variables[d], o)
      ), f = Object.keys(this._config.variables).find(
        (d) => Object.hasOwn(this._config.variables[d], c)
      );
      return h - f;
    });
  }
  static formatConfig(t) {
    const i = { ...t };
    return i.variables = { ...formatVariables(i.variables ?? {}) }, i;
  }
  static getTemplateSchema(t) {
    return {
      name: "template",
      selector: {
        select: {
          mode: "dropdown",
          options: t.map((i) => ({
            label: i,
            value: i
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
      selector: { entity: {} }
    };
  }
  static getIconSchema(t) {
    return {
      name: t,
      selector: { icon: {} }
    };
  }
  static getDefaultSchema(t) {
    return {
      name: t,
      selector: { text: {} }
    };
  }
  static getVariableSchema(t) {
    let i = StreamlineCardEditor.getDefaultSchema(t);
    return t.toLowerCase().includes("entity") ? i = StreamlineCardEditor.getEntitySchema(t) : t.toLowerCase().includes("icon") && (i = StreamlineCardEditor.getIconSchema(t)), i;
  }
  getSchema() {
    const t = this.getVariablesForTemplate(this._config.template);
    return [
      StreamlineCardEditor.getTemplateSchema(Object.keys(this._templates)),
      {
        expanded: !0,
        name: "variables",
        schema: t.map(
          (i) => StreamlineCardEditor.getVariableSchema(i)
        ),
        title: "Variables",
        type: "expandable"
      }
    ];
  }
  static computeLabel(t) {
    const i = t.name.replace(/[-_]+/gu, " "), r = i.charAt(0).toUpperCase() + i.slice(1);
    return this.hass.localize(
      `ui.panel.lovelace.editor.card.generic.${t.name}`
    ) || r;
  }
  render() {
    const t = this.getSchema();
    Object.values(this._config.variables).every(
      (a) => typeof a != "object"
    ) === !1 ? (this.elements.error.style.display = "block", this.elements.error.innerText = "Object and array variables are not supported in the visual editor.", this.elements.form.schema = [t[0]]) : (this.elements.error.style.display = "none", this.elements.form.schema = t), this.elements.form.hass = this._hass;
    const r = {
      ...this._config,
      variables: formatVariables(this._config.variables)
    };
    this.elements.form.data = r;
  }
}
typeof customElements.get("streamline-card-editor") > "u" && customElements.define("streamline-card-editor", StreamlineCardEditor);
const deepClone = (e) => structuredClone ? structuredClone(e) : JSON.parse(JSON.stringify(e)), getPrefixFromHass = (e) => {
  const s = (e == null ? void 0 : e.states) ?? void 0, t = (e == null ? void 0 : e.user) ?? void 0;
  return `
    var states = ${JSON.stringify(s)};
    var user = ${JSON.stringify(t)};
  `;
}, doEval = (string) => eval(string), evaluateJavascript = (e, s) => {
  const t = Object.keys(e);
  for (const i of t)
    if (e[i] instanceof Array) {
      let r;
      for (let a = 0; a < e[i].length; a += 1)
        if (typeof e[i][a] == "object")
          evaluateJavascript(e[i][a], s);
        else if (i.endsWith("_javascript")) {
          const n = getPrefixFromHass(s), o = i.replace("_javascript", "");
          try {
            e[o] || (e[o] = []), e[o][a] = doEval(
              `${n} ${e[i][a]}`
            );
          } catch (c) {
            r = c;
          }
        }
      if (i.endsWith("_javascript"))
        if (typeof r > "u")
          delete e[i];
        else
          throw delete e[i.replace("_javascript", "")], r;
    } else if (typeof e[i] == "object")
      evaluateJavascript(e[i], s);
    else if (i.endsWith("_javascript")) {
      const r = getPrefixFromHass(s), a = i.replace("_javascript", "");
      e[a] = doEval(`${r} ${e[i]}`), delete e[i];
    }
  return e;
}, replaceWithKeyValue = (e, s, t) => typeof t == "number" || typeof t == "boolean" ? e.replaceAll(`'[[${s}]]'`, t).replaceAll(`"[[${s}]]"`, t).replaceAll(`\`[[${s}]]\``, t) : typeof t == "object" ? e.replaceAll(`"[[${s}]]"`, JSON.stringify(t)).replaceAll(`'[[${s}]]'`, JSON.stringify(t).replaceAll('"', '\\"')).replaceAll(
  `\`[[${s}]]\``,
  JSON.stringify(t).replaceAll('"', '\\"')
) : e.replaceAll(`[[${s}]]`, t);
function evaluateVariables(e, s) {
  if (!s && !e.default)
    return e.card;
  let t = JSON.stringify(
    e.card ?? e.element
  );
  const i = {
    ...formatVariables(e.default ?? {}),
    ...formatVariables(s)
  };
  return Object.entries(i).forEach(([r, a]) => {
    t = replaceWithKeyValue(t, r, a);
  }), JSON.parse(t);
}
function evaluateConfig(e, s, t) {
  let i = evaluateVariables(e, s ?? {});
  return typeof t < "u" && (i = evaluateJavascript(i, t)), i;
}
const version = "0.0.11";
(async function e() {
  const s = window.loadCardHelpers ? await window.loadCardHelpers() : void 0;
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
      var a, n;
      if (this._isConnected && this._card && this._config) {
        this._card.nodeName === "HUI-ERROR-CARD" ? (this._shadow.removeChild(this._card), this.createCard(), this._shadow.appendChild(this._card)) : (n = (a = this._card).setConfig) == null || n.call(a, this._config);
        const o = deepEqual(
          this._config.visibility,
          this.parentNode.config.visibility
        ) === !1;
        this._config.visibility && o && (this.parentNode.config = {
          ...this.parentNode.config,
          visibility: this._config.visibility
        });
      }
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
    set editMode(a) {
      a !== this._editMode && (this._editMode = a, this.updateCardEditMode());
    }
    get hass() {
      return this._hass;
    }
    set hass(a) {
      this._hass = a, this.parseConfig() && this.updateCardConfig(), this.updateCardHass();
    }
    parseConfig() {
      const a = deepClone(this._config ?? {}), n = getLovelace() || getLovelaceCast();
      if (!n.config && !n.config.streamline_templates)
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config."
        );
      if (this._templateConfig = n.config.streamline_templates[this._originalConfig.template], this._templateConfig)
        if (this._templateConfig.card || this._templateConfig.element) {
          if (this._templateConfig.card && this._templateConfig.element)
            throw new Error("You can define a card and an element in the template");
        } else throw new Error(
          "You should define either a card or an element in the template"
        );
      else throw new Error(
        `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`
      );
      this._config = evaluateConfig(
        this._templateConfig,
        this._originalConfig.variables,
        this._hass
      );
      const o = deepClone(this._config);
      return deepEqual(a, o) === !1;
    }
    setConfig(a) {
      if (this._originalConfig = a, this.parseConfig() !== !1) {
        if (typeof this._card > "u") {
          if (typeof this._config.type > "u")
            throw new Error("[Streamline Card] You need to define a type");
          this.createCard(), this._shadow.appendChild(this._card);
        }
        this.updateCardConfig();
      }
    }
    getCardSize() {
      var a, n;
      return ((n = (a = this._card) == null ? void 0 : a.getCardSize) == null ? void 0 : n.call(a)) ?? 1;
    }
    getLayoutOptions() {
      var a, n;
      return (n = (a = this._card) == null ? void 0 : a.getLayoutOptions) == null ? void 0 : n.call(a);
    }
    createCard() {
      this._templateConfig.card ? this._card = s.createCardElement(this._config) : this._templateConfig.element && (this._card = s.createHuiElement(this._config), this._config.style && Object.keys(this._config.style).forEach((a) => {
        this.style.setProperty(a, this._config.style[a]);
      }));
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
