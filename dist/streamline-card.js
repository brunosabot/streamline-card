var p = Object.defineProperty;
var m = (e, s, t) => s in e ? p(e, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[s] = t;
var o = (e, s, t) => m(e, typeof s != "symbol" ? s + "" : s, t);
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
  const a = new Event(s, {
    bubbles: !0,
    cancelable: !1,
    composed: !0
  });
  return a.detail = t, e.dispatchEvent(a), a;
};
function formatVariables(e) {
  const s = {};
  if (e instanceof Array)
    e.forEach((t) => {
      Object.entries(t).forEach(([a, r]) => {
        s[a] = r;
      });
    });
  else
    return e;
  return s;
}
class StreamlineCardEditor extends HTMLElement {
  constructor(t) {
    super();
    o(this, "_card");
    o(this, "_hass");
    o(this, "_shadow");
    o(this, "_templates", {});
    this._card = t, this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    const a = getLovelace() || getLovelaceCast();
    if (this._templates = a.config.streamline_templates, this._templates === null)
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
    const a = StreamlineCardEditor.formatConfig(t), [r] = Object.keys(this._templates), i = {};
    i.type = a.type, i.template = a.template ?? r ?? "", i.variables = a.variables ?? {};
    const n = this.setVariablesDefault(i);
    deepEqual(n, this._config) === !1 && (this._config = n, fireEvent(this, "config-changed", { config: i })), this.render();
  }
  setVariablesDefault(t) {
    return this.getVariablesForTemplate(t.template).forEach((r) => {
      if (r.toLowerCase().includes("entity") && t.variables[r] === "") {
        const i = Object.keys(this._hass.states), n = i[Math.floor(Math.random() * i.length)];
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
      let a = StreamlineCardEditor.formatConfig(t.detail.value);
      this._config.template !== a.template && (a.variables = {}, a = this.setVariablesDefault(a)), fireEvent(this, "config-changed", { config: a }), this._config = a, this.render();
    }), this._shadow.appendChild(this.elements.error), this._shadow.appendChild(this.elements.form), this._shadow.appendChild(this.elements.style);
  }
  getVariablesForTemplate(t) {
    const a = {}, r = this._templates[t];
    if (typeof r > "u")
      throw new Error(
        `The template "${t}" doesn't exist in streamline_templates`
      );
    const i = JSON.stringify(r), n = /\[\[(?<name>.*?)\]\]/gu;
    return [...i.matchAll(n)].forEach(([, l]) => {
      a[l] = l;
    }), Object.keys(a).sort((l, c) => {
      const h = Object.keys(this._config.variables).find(
        (d) => Object.hasOwn(this._config.variables[d], l)
      ), f = Object.keys(this._config.variables).find(
        (d) => Object.hasOwn(this._config.variables[d], c)
      );
      return h - f;
    });
  }
  static formatConfig(t) {
    const a = { ...t };
    return a.variables = { ...formatVariables(a.variables ?? {}) }, a;
  }
  static getTemplateSchema(t) {
    return {
      name: "template",
      selector: {
        select: {
          mode: "dropdown",
          options: t.map((a) => ({
            label: a,
            value: a
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
    let a = StreamlineCardEditor.getDefaultSchema(t);
    return t.toLowerCase().includes("entity") ? a = StreamlineCardEditor.getEntitySchema(t) : t.toLowerCase().includes("icon") && (a = StreamlineCardEditor.getIconSchema(t)), a;
  }
  getSchema() {
    const t = this.getVariablesForTemplate(this._config.template);
    return [
      StreamlineCardEditor.getTemplateSchema(Object.keys(this._templates)),
      {
        expanded: !0,
        name: "variables",
        schema: t.map(
          (a) => StreamlineCardEditor.getVariableSchema(a)
        ),
        title: "Variables",
        type: "expandable"
      }
    ];
  }
  static computeLabel(t) {
    const a = t.name.replace(/[-_]+/gu, " "), r = a.charAt(0).toUpperCase() + a.slice(1);
    return this.hass.localize(
      `ui.panel.lovelace.editor.card.generic.${t.name}`
    ) || r;
  }
  render() {
    const t = this.getSchema();
    Object.values(this._config.variables).every(
      (i) => typeof i != "object"
    ) === !1 ? (this.elements.error.style.display = "block", this.elements.error.innerText = "Object and array variables are not supported in the visual editor.", this.elements.form.schema = [t[0]]) : (this.elements.error.style.display = "none", this.elements.form.schema = t), this.elements.form.hass = this._hass;
    const r = {
      ...this._config,
      variables: formatVariables(this._config.variables)
    };
    this.elements.form.data = r;
  }
}
typeof customElements.get("streamline-card-editor") > "u" && customElements.define("streamline-card-editor", StreamlineCardEditor);
const getPrefixFromHass = (e) => {
  const s = (e == null ? void 0 : e.states) ?? void 0, t = (e == null ? void 0 : e.user) ?? void 0;
  return `
    var states = ${JSON.stringify(s)};
    var user = ${JSON.stringify(t)};
  `;
}, doEval = (string) => eval(string), evaluateJavascript = (e, s) => {
  let t;
  const a = Object.keys(e);
  for (const r of a)
    if (e[r] instanceof Array) {
      let i;
      for (let n = 0; n < e[r].length; n += 1)
        if (typeof e[r][n] == "object")
          evaluateJavascript(e[r][n], s);
        else if (r.endsWith("_javascript")) {
          t === void 0 && (t = getPrefixFromHass(s));
          const l = r.replace("_javascript", "");
          try {
            e[l] || (e[l] = []), e[l][n] = doEval(
              `${t} ${e[r][n]}`
            );
          } catch (c) {
            i = c;
          }
        }
      if (r.endsWith("_javascript"))
        if (typeof i > "u")
          delete e[r];
        else
          throw delete e[r.replace("_javascript", "")], i;
    } else if (typeof e[r] == "object")
      evaluateJavascript(e[r], s);
    else if (r.endsWith("_javascript")) {
      t === void 0 && (t = getPrefixFromHass(s));
      const i = r.replace("_javascript", "");
      e[i] = doEval(`${t} ${e[r]}`), delete e[r];
    }
  return e;
}, primitiveRegexMap = /* @__PURE__ */ new Map(), objectQuotesRegexMap = /* @__PURE__ */ new Map(), objectRegexMap = /* @__PURE__ */ new Map(), basicRegexMap = /* @__PURE__ */ new Map(), escapeQuoteRegex = /"/gmu, replaceWithKeyValue = (e, s, t) => {
  if (typeof t == "number" || typeof t == "boolean") {
    let r = primitiveRegexMap.get(s);
    return r === void 0 && (r = new RegExp(`["'\`]\\[\\[${s}\\]\\]["'\`]`, "gmu"), primitiveRegexMap.set(s, r)), e.replace(r, t);
  } else if (typeof t == "object") {
    const r = JSON.stringify(t);
    let i = objectQuotesRegexMap.get(s);
    i === void 0 && (i = new RegExp(`"\\[\\[${s}\\]\\]"`, "gmu"), objectQuotesRegexMap.set(s, i));
    let n = objectRegexMap.get(s);
    return n === void 0 && (n = new RegExp(`['\`]\\[\\[${s}\\]\\]['\`]`, "gmu"), objectRegexMap.set(s, n)), e.replace(i, r).replace(n, r.replace(escapeQuoteRegex, '\\"'));
  }
  let a = basicRegexMap.get(s);
  return a === void 0 && (a = new RegExp(`\\[\\[${s}\\]\\]`, "gmu"), basicRegexMap.set(s, a)), e.replace(a, t);
};
function evaluateVariables(e, s) {
  if (!s && !e.default)
    return e.card;
  let t = e.card ? JSON.stringify(e.card) : JSON.stringify(e.element);
  const a = {
    ...formatVariables(e.default ?? {}),
    ...formatVariables(s)
  };
  return Object.entries(a).forEach(([r, i]) => {
    t = replaceWithKeyValue(t, r, i);
  }), JSON.parse(t);
}
function evaluateConfig(e, s, t) {
  let a = evaluateVariables(e, s ?? {});
  const { hasJavascript: r, hass: i } = t;
  return r && typeof i < "u" && (a = evaluateJavascript(a, i)), a;
}
const version = "0.0.13";
(async function e() {
  const s = window.loadCardHelpers ? await window.loadCardHelpers() : void 0;
  class t extends HTMLElement {
    constructor() {
      super();
      o(this, "_editMode", !1);
      o(this, "_isConnected", !1);
      o(this, "_config");
      o(this, "_originalConfig");
      o(this, "_hass");
      o(this, "_card");
      o(this, "_shadow");
      o(this, "_accessedProperties", /* @__PURE__ */ new Set());
      o(this, "_hasJavascriptTemplate", !1);
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
      if (this._isConnected && this._card && this._config) {
        if (this._card.nodeName === "HUI-ERROR-CARD" ? (this._shadow.removeChild(this._card), this.createCard(), this._shadow.appendChild(this._card)) : (n = (i = this._card).setConfig) == null || n.call(i, this._config), this.parentNode.config === void 0 || this._config.visibility === void 0)
          return;
        deepEqual(
          this._config.visibility,
          this.parentNode.config.visibility
        ) === !1 && (this.parentNode.config = {
          ...this.parentNode.config,
          visibility: this._config.visibility
        });
      }
    }
    connectedCallback() {
      this._isConnected = !0, setTimeout(() => {
        this.updateCardConfig(), this.updateCardEditMode(), this.updateCardHass();
      }, 0);
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
      this._hass = i, setTimeout(() => {
        this.parseConfig() && this.updateCardConfig(), this.updateCardHass();
      }, 0);
    }
    prepareConfig() {
      const i = getLovelace() || getLovelaceCast();
      if (!i.config && !i.config.streamline_templates)
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config."
        );
      if (this._templateConfig = i.config.streamline_templates[this._originalConfig.template], this._templateConfig)
        if (this._templateConfig.card || this._templateConfig.element) {
          if (this._templateConfig.card && this._templateConfig.element)
            throw new Error("You can define a card and an element in the template");
        } else throw new Error(
          "You should define either a card or an element in the template"
        );
      else throw new Error(
        `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`
      );
      this._hasJavascriptTemplate = JSON.stringify(
        this._templateConfig
      ).includes("_javascript");
    }
    parseConfig() {
      const i = this._config ?? {};
      return this._config = evaluateConfig(
        this._templateConfig,
        this._originalConfig.variables,
        {
          hasJavascript: this._hasJavascriptTemplate,
          hass: this._hass
        }
      ), deepEqual(i, this._config) === !1;
    }
    setConfig(i) {
      if (this._originalConfig = i, this.prepareConfig(), this.parseConfig() !== !1) {
        if (typeof this._card > "u") {
          if (typeof this._config.type > "u")
            throw new Error("[Streamline Card] You need to define a type");
          this.createCard(), this._shadow.appendChild(this._card);
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
    createCard() {
      this._templateConfig.card ? this._card = s.createCardElement(this._config) : this._templateConfig.element && (this._card = s.createHuiElement(this._config), this._config.style && Object.keys(this._config.style).forEach((i) => {
        this.style.setProperty(i, this._config.style[i]);
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
