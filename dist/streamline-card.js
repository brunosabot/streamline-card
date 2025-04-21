var Es = Object.defineProperty;
var Cs = (s, e, t) => e in s ? Es(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var v = (s, e, t) => Cs(s, typeof e != "symbol" ? e + "" : e, t);
const Ft = () => {
  let s = document.querySelector("hc-main");
  if (s && (s = s.shadowRoot), s && (s = s.querySelector("hc-lovelace")), s && (s = s.shadowRoot), s && (s = s.querySelector("hui-view")), s) {
    const e = s.lovelace;
    return e.current_view = s.___curView, e;
  }
  return null;
}, Vt = () => {
  let s = document.querySelector("home-assistant");
  if (s && (s = s.shadowRoot), s && (s = s.querySelector("home-assistant-main")), s && (s = s.shadowRoot), s && (s = s.querySelector(
    "app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver"
  )), s = s && s.shadowRoot || s, s && (s = s.querySelector("ha-panel-lovelace")), s && (s = s.shadowRoot), s && (s = s.querySelector("hui-root")), s) {
    const e = s.lovelace;
    return e.current_view = s.___curView, e;
  }
  return null;
}, Tt = (s) => s !== Object(s), Be = (s, e) => {
  if (s === e)
    return !0;
  if (Tt(s) && Tt(e))
    return s === e;
  if (Object.keys(s).length !== Object.keys(e).length)
    return !1;
  for (const t in s)
    if (Object.hasOwn(s, t) && (!(t in e) || Be(s[t], e[t]) === !1))
      return !1;
  return !0;
}, As = (s, e, t = {}) => {
  const n = new Event(e, {
    bubbles: !0,
    cancelable: !1,
    composed: !0
  });
  return n.detail = t, s.dispatchEvent(n), n;
};
function ae(s) {
  const e = {};
  if (s instanceof Array)
    s.forEach((t) => {
      Object.entries(t).forEach(([n, i]) => {
        e[n] = i;
      });
    });
  else
    return s;
  return e;
}
class R extends HTMLElement {
  constructor(t) {
    super();
    v(this, "_card");
    v(this, "_hass");
    v(this, "_shadow");
    v(this, "_templates", {});
    this._card = t, this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    const n = Vt() || Ft();
    if (this._templates = n.config.streamline_templates, this._templates === null)
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
    const n = R.formatConfig(t), [i] = Object.keys(this._templates), r = {};
    r.type = n.type, r.template = n.template ?? i ?? "", r.variables = n.variables ?? {}, n.grid_options && (r.grid_options = n.grid_options), n.visibility && (r.visibility = n.visibility);
    const o = this.setVariablesDefault(r);
    Be(o, this._config) === !1 && (this._config = o, this.saveConfig(r)), this.render();
  }
  setVariablesDefault(t) {
    return this.getVariablesForTemplate(t.template).forEach((i) => {
      if (i.toLowerCase().includes("entity") && t.variables[i] === "") {
        const r = Object.keys(this._hass.states), o = r[Math.floor(Math.random() * r.length)];
        t.variables[i] = o;
      } else t.variables[i] || (t.variables[i] = "");
    }), t;
  }
  initialize() {
    this.elements = {}, this.elements.error = document.createElement("ha-alert"), this.elements.error.setAttribute("alert-type", "error"), this.elements.error.classList.add("streamline-card-form__error"), this.elements.style = document.createElement("style"), this.elements.style.innerHTML = `
      .streamline-card-form__error {
        margin-bottom: 8px;
      }
    `, this.elements.form = document.createElement("ha-form"), this.elements.form.classList.add("streamline-card-form"), this.elements.form.computeLabel = R.computeLabel, this.elements.form.addEventListener("value-changed", (t) => {
      let n = R.formatConfig(t.detail.value);
      this._config.template !== n.template && (n.variables = {}, n = this.setVariablesDefault(n)), this._config = n, this.render(), this.saveConfig(n);
    }), this._shadow.appendChild(this.elements.error), this._shadow.appendChild(this.elements.form), this._shadow.appendChild(this.elements.style);
  }
  getVariablesForTemplate(t) {
    const n = {}, i = this._templates[t];
    if (typeof i > "u")
      throw new Error(
        `The template "${t}" doesn't exist in streamline_templates`
      );
    const r = JSON.stringify(i), o = /\[\[(?<name>.*?)\]\]/gu;
    return [...r.matchAll(o)].forEach(([, a]) => {
      n[a] = a;
    }), Object.keys(n).sort((a, l) => {
      const c = Object.keys(this._config.variables).find(
        (f) => Object.hasOwn(this._config.variables[f] ?? "", a)
      ), d = Object.keys(this._config.variables).find(
        (f) => Object.hasOwn(this._config.variables[f] ?? "", l)
      );
      return c - d;
    });
  }
  saveConfig(t) {
    const n = JSON.parse(JSON.stringify(t));
    Object.keys(n.variables).forEach((i) => {
      n.variables[i] === "" && delete n.variables[i];
    }), As(this, "config-changed", { config: n });
  }
  static formatConfig(t) {
    const n = { ...t };
    return n.variables = { ...ae(n.variables ?? {}) }, n;
  }
  static getTemplateSchema(t) {
    return {
      name: "template",
      selector: {
        select: {
          mode: "dropdown",
          options: t.map((n) => ({
            label: n,
            value: n
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
    let n = R.getDefaultSchema(t);
    return t.toLowerCase().includes("entity") ? n = R.getEntitySchema(t) : t.toLowerCase().includes("icon") && (n = R.getIconSchema(t)), n;
  }
  getSchema() {
    const t = this.getVariablesForTemplate(this._config.template);
    return [
      R.getTemplateSchema(Object.keys(this._templates)),
      {
        expanded: !0,
        name: "variables",
        schema: t.map(
          (n) => R.getVariableSchema(n)
        ),
        title: "Variables",
        type: "expandable"
      }
    ];
  }
  static computeLabel(t) {
    const n = t.name.replace(/[-_]+/gu, " "), i = n.charAt(0).toUpperCase() + n.slice(1);
    return this.hass.localize(
      `ui.panel.lovelace.editor.card.generic.${t.name}`
    ) || i;
  }
  render() {
    const t = this.getSchema();
    Object.values(this._config.variables).every(
      (r) => typeof r != "object"
    ) === !1 ? (this.elements.error.style.display = "block", this.elements.error.innerText = "Object and array variables are not supported in the visual editor.", this.elements.form.schema = [t[0]]) : (this.elements.error.style.display = "none", this.elements.form.schema = t), this.elements.form.hass = this._hass;
    const i = {
      ...this._config,
      variables: ae(this._config.variables)
    };
    this.elements.form.data = i;
  }
}
typeof customElements.get("streamline-card-editor") > "u" && customElements.define("streamline-card-editor", R);
const He = /* @__PURE__ */ new Map(), Is = (s, e) => ({
  areas: s == null ? void 0 : s.areas,
  states: s == null ? void 0 : s.states,
  user: s == null ? void 0 : s.user,
  variables: e
}), Ls = (s, e) => {
  if (!He.has(e))
    try {
      He.set(
        e,
        // eslint-disable-next-line no-new-func
        new Function("states", "user", "variables", "areas", `return ${s}`)
      );
    } catch (t) {
      throw new Error(`Failed to compile JavaScript: ${t.message}`);
    }
  return He.get(e);
}, Et = (s, e) => typeof s == "string" ? Ls(s, s)(e.states, e.user, e.variables, e.areas) : s, st = (s, e, t) => {
  const n = Is(e, t);
  for (const [i, r] of Object.entries(s))
    if (Array.isArray(r)) {
      const o = [];
      for (const a of r)
        typeof a == "object" ? (st(a, e, t), o.push(a)) : i.endsWith("_javascript") ? o.push(Et(a, n)) : o.push(a);
      i.endsWith("_javascript") ? (s[i.replace("_javascript", "")] = o, delete s[i]) : s[i] = o;
    } else typeof r == "object" ? st(r, e, t) : i.endsWith("_javascript") && (s[i.replace("_javascript", "")] = Et(r, n), delete s[i]);
}, $s = (s, e, t = {}) => (st(s, e, t), s), Ct = /* @__PURE__ */ new Map(), At = /* @__PURE__ */ new Map(), It = /* @__PURE__ */ new Map(), Lt = /* @__PURE__ */ new Map(), Qe = /* @__PURE__ */ new Map(), vs = /"/gmu, Ms = (s, e, t) => {
  if (typeof t == "number" || typeof t == "boolean") {
    let i = Ct.get(e);
    return i === void 0 && (i = new RegExp(`["'\`]\\[\\[${e}\\]\\]["'\`]`, "gmu"), Ct.set(e, i)), s.replace(i, t);
  } else if (typeof t == "object") {
    const i = JSON.stringify(t);
    let r = At.get(e);
    r === void 0 && (r = new RegExp(`"\\[\\[${e}\\]\\]"`, "gmu"), At.set(e, r));
    let o = It.get(e);
    return o === void 0 && (o = new RegExp(`['\`]\\[\\[${e}\\]\\]['\`]`, "gmu"), It.set(e, o)), s.replace(r, i).replace(o, i.replace(vs, '\\"'));
  }
  let n = Lt.get(e);
  return n === void 0 && (n = new RegExp(`\\[\\[${e}\\]\\]`, "gmu"), Lt.set(e, n)), s.replace(n, t);
};
function Bs(s, e) {
  if (!e && !s.default)
    return s.card;
  const t = JSON.stringify({ templateConfig: s, variables: e });
  if (Qe.has(t) === !1) {
    let n = s.card ? JSON.stringify(s.card) : JSON.stringify(s.element);
    const i = {
      ...ae(s.default ?? {}),
      ...ae(e)
    };
    Object.entries(i).forEach(([r, o]) => {
      n = Ms(n, r, o);
    }), Qe.set(t, JSON.parse(n));
  }
  return Qe.get(t);
}
function js(s, e, t) {
  let n = Bs(s, e ?? {});
  const { hasJavascript: i, hass: r } = t;
  if (i && typeof r < "u") {
    const o = {
      ...ae(s.default ?? {}),
      ...ae(e ?? {})
    };
    n = $s(n, r, o);
  }
  return n;
}
const ct = Symbol.for("yaml.alias"), nt = Symbol.for("yaml.document"), G = Symbol.for("yaml.map"), Jt = Symbol.for("yaml.pair"), U = Symbol.for("yaml.scalar"), fe = Symbol.for("yaml.seq"), P = Symbol.for("yaml.node.type"), ue = (s) => !!s && typeof s == "object" && s[P] === ct, Pe = (s) => !!s && typeof s == "object" && s[P] === nt, _e = (s) => !!s && typeof s == "object" && s[P] === G, I = (s) => !!s && typeof s == "object" && s[P] === Jt, E = (s) => !!s && typeof s == "object" && s[P] === U, Ne = (s) => !!s && typeof s == "object" && s[P] === fe;
function C(s) {
  if (s && typeof s == "object")
    switch (s[P]) {
      case G:
      case fe:
        return !0;
    }
  return !1;
}
function A(s) {
  if (s && typeof s == "object")
    switch (s[P]) {
      case ct:
      case G:
      case U:
      case fe:
        return !0;
    }
  return !1;
}
const Ks = (s) => (E(s) || C(s)) && !!s.anchor, H = Symbol("break visit"), Ps = Symbol("skip children"), be = Symbol("remove node");
function X(s, e) {
  const t = Ds(e);
  Pe(s) ? se(null, s.contents, t, Object.freeze([s])) === be && (s.contents = null) : se(null, s, t, Object.freeze([]));
}
X.BREAK = H;
X.SKIP = Ps;
X.REMOVE = be;
function se(s, e, t, n) {
  const i = qs(s, e, t, n);
  if (A(i) || I(i))
    return Rs(s, n, i), se(s, i, t, n);
  if (typeof i != "symbol") {
    if (C(e)) {
      n = Object.freeze(n.concat(e));
      for (let r = 0; r < e.items.length; ++r) {
        const o = se(r, e.items[r], t, n);
        if (typeof o == "number")
          r = o - 1;
        else {
          if (o === H)
            return H;
          o === be && (e.items.splice(r, 1), r -= 1);
        }
      }
    } else if (I(e)) {
      n = Object.freeze(n.concat(e));
      const r = se("key", e.key, t, n);
      if (r === H)
        return H;
      r === be && (e.key = null);
      const o = se("value", e.value, t, n);
      if (o === H)
        return H;
      o === be && (e.value = null);
    }
  }
  return i;
}
function Ds(s) {
  return typeof s == "object" && (s.Collection || s.Node || s.Value) ? Object.assign({
    Alias: s.Node,
    Map: s.Node,
    Scalar: s.Node,
    Seq: s.Node
  }, s.Value && {
    Map: s.Value,
    Scalar: s.Value,
    Seq: s.Value
  }, s.Collection && {
    Map: s.Collection,
    Seq: s.Collection
  }, s) : s;
}
function qs(s, e, t, n) {
  var i, r, o, a, l;
  if (typeof t == "function")
    return t(s, e, n);
  if (_e(e))
    return (i = t.Map) == null ? void 0 : i.call(t, s, e, n);
  if (Ne(e))
    return (r = t.Seq) == null ? void 0 : r.call(t, s, e, n);
  if (I(e))
    return (o = t.Pair) == null ? void 0 : o.call(t, s, e, n);
  if (E(e))
    return (a = t.Scalar) == null ? void 0 : a.call(t, s, e, n);
  if (ue(e))
    return (l = t.Alias) == null ? void 0 : l.call(t, s, e, n);
}
function Rs(s, e, t) {
  const n = e[e.length - 1];
  if (C(n))
    n.items[s] = t;
  else if (I(n))
    s === "key" ? n.key = t : n.value = t;
  else if (Pe(n))
    n.contents = t;
  else {
    const i = ue(n) ? "alias" : "scalar";
    throw new Error(`Cannot replace node with ${i} parent`);
  }
}
const Us = {
  "!": "%21",
  ",": "%2C",
  "[": "%5B",
  "]": "%5D",
  "{": "%7B",
  "}": "%7D"
}, Fs = (s) => s.replace(/[!,[\]{}]/g, (e) => Us[e]);
class M {
  constructor(e, t) {
    this.docStart = null, this.docEnd = !1, this.yaml = Object.assign({}, M.defaultYaml, e), this.tags = Object.assign({}, M.defaultTags, t);
  }
  clone() {
    const e = new M(this.yaml, this.tags);
    return e.docStart = this.docStart, e;
  }
  /**
   * During parsing, get a Directives instance for the current document and
   * update the stream state according to the current version's spec.
   */
  atDocument() {
    const e = new M(this.yaml, this.tags);
    switch (this.yaml.version) {
      case "1.1":
        this.atNextDocument = !0;
        break;
      case "1.2":
        this.atNextDocument = !1, this.yaml = {
          explicit: M.defaultYaml.explicit,
          version: "1.2"
        }, this.tags = Object.assign({}, M.defaultTags);
        break;
    }
    return e;
  }
  /**
   * @param onError - May be called even if the action was successful
   * @returns `true` on success
   */
  add(e, t) {
    this.atNextDocument && (this.yaml = { explicit: M.defaultYaml.explicit, version: "1.1" }, this.tags = Object.assign({}, M.defaultTags), this.atNextDocument = !1);
    const n = e.trim().split(/[ \t]+/), i = n.shift();
    switch (i) {
      case "%TAG": {
        if (n.length !== 2 && (t(0, "%TAG directive should contain exactly two parts"), n.length < 2))
          return !1;
        const [r, o] = n;
        return this.tags[r] = o, !0;
      }
      case "%YAML": {
        if (this.yaml.explicit = !0, n.length !== 1)
          return t(0, "%YAML directive should contain exactly one part"), !1;
        const [r] = n;
        if (r === "1.1" || r === "1.2")
          return this.yaml.version = r, !0;
        {
          const o = /^\d+\.\d+$/.test(r);
          return t(6, `Unsupported YAML version ${r}`, o), !1;
        }
      }
      default:
        return t(0, `Unknown directive ${i}`, !0), !1;
    }
  }
  /**
   * Resolves a tag, matching handles to those defined in %TAG directives.
   *
   * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
   *   `'!local'` tag, or `null` if unresolvable.
   */
  tagName(e, t) {
    if (e === "!")
      return "!";
    if (e[0] !== "!")
      return t(`Not a valid tag: ${e}`), null;
    if (e[1] === "<") {
      const o = e.slice(2, -1);
      return o === "!" || o === "!!" ? (t(`Verbatim tags aren't resolved, so ${e} is invalid.`), null) : (e[e.length - 1] !== ">" && t("Verbatim tags must end with a >"), o);
    }
    const [, n, i] = e.match(/^(.*!)([^!]*)$/s);
    i || t(`The ${e} tag has no suffix`);
    const r = this.tags[n];
    if (r)
      try {
        return r + decodeURIComponent(i);
      } catch (o) {
        return t(String(o)), null;
      }
    return n === "!" ? e : (t(`Could not resolve tag: ${e}`), null);
  }
  /**
   * Given a fully resolved tag, returns its printable string form,
   * taking into account current tag prefixes and defaults.
   */
  tagString(e) {
    for (const [t, n] of Object.entries(this.tags))
      if (e.startsWith(n))
        return t + Fs(e.substring(n.length));
    return e[0] === "!" ? e : `!<${e}>`;
  }
  toString(e) {
    const t = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [], n = Object.entries(this.tags);
    let i;
    if (e && n.length > 0 && A(e.contents)) {
      const r = {};
      X(e.contents, (o, a) => {
        A(a) && a.tag && (r[a.tag] = !0);
      }), i = Object.keys(r);
    } else
      i = [];
    for (const [r, o] of n)
      r === "!!" && o === "tag:yaml.org,2002:" || (!e || i.some((a) => a.startsWith(o))) && t.push(`%TAG ${r} ${o}`);
    return t.join(`
`);
  }
}
M.defaultYaml = { explicit: !1, version: "1.2" };
M.defaultTags = { "!!": "tag:yaml.org,2002:" };
function Yt(s) {
  if (/[\x00-\x19\s,[\]{}]/.test(s)) {
    const t = `Anchor must not contain whitespace or control characters: ${JSON.stringify(s)}`;
    throw new Error(t);
  }
  return !0;
}
function Gt(s) {
  const e = /* @__PURE__ */ new Set();
  return X(s, {
    Value(t, n) {
      n.anchor && e.add(n.anchor);
    }
  }), e;
}
function Ht(s, e) {
  for (let t = 1; ; ++t) {
    const n = `${s}${t}`;
    if (!e.has(n))
      return n;
  }
}
function Vs(s, e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let i = null;
  return {
    onAnchor: (r) => {
      t.push(r), i || (i = Gt(s));
      const o = Ht(e, i);
      return i.add(o), o;
    },
    /**
     * With circular references, the source node is only resolved after all
     * of its child nodes are. This is why anchors are set only after all of
     * the nodes have been created.
     */
    setAnchors: () => {
      for (const r of t) {
        const o = n.get(r);
        if (typeof o == "object" && o.anchor && (E(o.node) || C(o.node)))
          o.node.anchor = o.anchor;
        else {
          const a = new Error("Failed to resolve repeated object (this should not happen)");
          throw a.source = r, a;
        }
      }
    },
    sourceObjects: n
  };
}
function ne(s, e, t, n) {
  if (n && typeof n == "object")
    if (Array.isArray(n))
      for (let i = 0, r = n.length; i < r; ++i) {
        const o = n[i], a = ne(s, n, String(i), o);
        a === void 0 ? delete n[i] : a !== o && (n[i] = a);
      }
    else if (n instanceof Map)
      for (const i of Array.from(n.keys())) {
        const r = n.get(i), o = ne(s, n, i, r);
        o === void 0 ? n.delete(i) : o !== r && n.set(i, o);
      }
    else if (n instanceof Set)
      for (const i of Array.from(n)) {
        const r = ne(s, n, i, i);
        r === void 0 ? n.delete(i) : r !== i && (n.delete(i), n.add(r));
      }
    else
      for (const [i, r] of Object.entries(n)) {
        const o = ne(s, n, i, r);
        o === void 0 ? delete n[i] : o !== r && (n[i] = o);
      }
  return s.call(e, t, n);
}
function K(s, e, t) {
  if (Array.isArray(s))
    return s.map((n, i) => K(n, String(i), t));
  if (s && typeof s.toJSON == "function") {
    if (!t || !Ks(s))
      return s.toJSON(e, t);
    const n = { aliasCount: 0, count: 1, res: void 0 };
    t.anchors.set(s, n), t.onCreate = (r) => {
      n.res = r, delete t.onCreate;
    };
    const i = s.toJSON(e, t);
    return t.onCreate && t.onCreate(i), i;
  }
  return typeof s == "bigint" && !(t != null && t.keep) ? Number(s) : s;
}
class ft {
  constructor(e) {
    Object.defineProperty(this, P, { value: e });
  }
  /** Create a copy of this node.  */
  clone() {
    const e = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    return this.range && (e.range = this.range.slice()), e;
  }
  /** A plain JavaScript representation of this node. */
  toJS(e, { mapAsMap: t, maxAliasCount: n, onAnchor: i, reviver: r } = {}) {
    if (!Pe(e))
      throw new TypeError("A document argument is required");
    const o = {
      anchors: /* @__PURE__ */ new Map(),
      doc: e,
      keep: !0,
      mapAsMap: t === !0,
      mapKeyWarned: !1,
      maxAliasCount: typeof n == "number" ? n : 100
    }, a = K(this, "", o);
    if (typeof i == "function")
      for (const { count: l, res: c } of o.anchors.values())
        i(c, l);
    return typeof r == "function" ? ne(r, { "": a }, "", a) : a;
  }
}
class ut extends ft {
  constructor(e) {
    super(ct), this.source = e, Object.defineProperty(this, "tag", {
      set() {
        throw new Error("Alias nodes cannot have tags");
      }
    });
  }
  /**
   * Resolve the value of this alias within `doc`, finding the last
   * instance of the `source` anchor before this node.
   */
  resolve(e) {
    let t;
    return X(e, {
      Node: (n, i) => {
        if (i === this)
          return X.BREAK;
        i.anchor === this.source && (t = i);
      }
    }), t;
  }
  toJSON(e, t) {
    if (!t)
      return { source: this.source };
    const { anchors: n, doc: i, maxAliasCount: r } = t, o = this.resolve(i);
    if (!o) {
      const l = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
      throw new ReferenceError(l);
    }
    let a = n.get(o);
    if (a || (K(o, null, t), a = n.get(o)), !a || a.res === void 0) {
      const l = "This should not happen: Alias anchor was not resolved?";
      throw new ReferenceError(l);
    }
    if (r >= 0 && (a.count += 1, a.aliasCount === 0 && (a.aliasCount = $e(i, o, n)), a.count * a.aliasCount > r)) {
      const l = "Excessive alias count indicates a resource exhaustion attack";
      throw new ReferenceError(l);
    }
    return a.res;
  }
  toString(e, t, n) {
    const i = `*${this.source}`;
    if (e) {
      if (Yt(this.source), e.options.verifyAliasOrder && !e.anchors.has(this.source)) {
        const r = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new Error(r);
      }
      if (e.implicitKey)
        return `${i} `;
    }
    return i;
  }
}
function $e(s, e, t) {
  if (ue(e)) {
    const n = e.resolve(s), i = t && n && t.get(n);
    return i ? i.count * i.aliasCount : 0;
  } else if (C(e)) {
    let n = 0;
    for (const i of e.items) {
      const r = $e(s, i, t);
      r > n && (n = r);
    }
    return n;
  } else if (I(e)) {
    const n = $e(s, e.key, t), i = $e(s, e.value, t);
    return Math.max(n, i);
  }
  return 1;
}
const Qt = (s) => !s || typeof s != "function" && typeof s != "object";
class O extends ft {
  constructor(e) {
    super(U), this.value = e;
  }
  toJSON(e, t) {
    return t != null && t.keep ? this.value : K(this.value, e, t);
  }
  toString() {
    return String(this.value);
  }
}
O.BLOCK_FOLDED = "BLOCK_FOLDED";
O.BLOCK_LITERAL = "BLOCK_LITERAL";
O.PLAIN = "PLAIN";
O.QUOTE_DOUBLE = "QUOTE_DOUBLE";
O.QUOTE_SINGLE = "QUOTE_SINGLE";
const Js = "tag:yaml.org,2002:";
function Ys(s, e, t) {
  if (e) {
    const n = t.filter((r) => r.tag === e), i = n.find((r) => !r.format) ?? n[0];
    if (!i)
      throw new Error(`Tag ${e} not found`);
    return i;
  }
  return t.find((n) => {
    var i;
    return ((i = n.identify) == null ? void 0 : i.call(n, s)) && !n.format;
  });
}
function Se(s, e, t) {
  var f, p, h;
  if (Pe(s) && (s = s.contents), A(s))
    return s;
  if (I(s)) {
    const g = (p = (f = t.schema[G]).createNode) == null ? void 0 : p.call(f, t.schema, null, t);
    return g.items.push(s), g;
  }
  (s instanceof String || s instanceof Number || s instanceof Boolean || typeof BigInt < "u" && s instanceof BigInt) && (s = s.valueOf());
  const { aliasDuplicateObjects: n, onAnchor: i, onTagObj: r, schema: o, sourceObjects: a } = t;
  let l;
  if (n && s && typeof s == "object") {
    if (l = a.get(s), l)
      return l.anchor || (l.anchor = i(s)), new ut(l.anchor);
    l = { anchor: null, node: null }, a.set(s, l);
  }
  e != null && e.startsWith("!!") && (e = Js + e.slice(2));
  let c = Ys(s, e, o.tags);
  if (!c) {
    if (s && typeof s.toJSON == "function" && (s = s.toJSON()), !s || typeof s != "object") {
      const g = new O(s);
      return l && (l.node = g), g;
    }
    c = s instanceof Map ? o[G] : Symbol.iterator in Object(s) ? o[fe] : o[G];
  }
  r && (r(c), delete t.onTagObj);
  const d = c != null && c.createNode ? c.createNode(t.schema, s, t) : typeof ((h = c == null ? void 0 : c.nodeClass) == null ? void 0 : h.from) == "function" ? c.nodeClass.from(t.schema, s, t) : new O(s);
  return e ? d.tag = e : c.default || (d.tag = c.tag), l && (l.node = d), d;
}
function je(s, e, t) {
  let n = t;
  for (let i = e.length - 1; i >= 0; --i) {
    const r = e[i];
    if (typeof r == "number" && Number.isInteger(r) && r >= 0) {
      const o = [];
      o[r] = n, n = o;
    } else
      n = /* @__PURE__ */ new Map([[r, n]]);
  }
  return Se(n, void 0, {
    aliasDuplicateObjects: !1,
    keepUndefined: !1,
    onAnchor: () => {
      throw new Error("This should not happen, please report a bug.");
    },
    schema: s,
    sourceObjects: /* @__PURE__ */ new Map()
  });
}
const ge = (s) => s == null || typeof s == "object" && !!s[Symbol.iterator]().next().done;
class Wt extends ft {
  constructor(e, t) {
    super(e), Object.defineProperty(this, "schema", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !0
    });
  }
  /**
   * Create a copy of this collection.
   *
   * @param schema - If defined, overwrites the original's schema
   */
  clone(e) {
    const t = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    return e && (t.schema = e), t.items = t.items.map((n) => A(n) || I(n) ? n.clone(e) : n), this.range && (t.range = this.range.slice()), t;
  }
  /**
   * Adds a value to the collection. For `!!map` and `!!omap` the value must
   * be a Pair instance or a `{ key, value }` object, which may not have a key
   * that already exists in the map.
   */
  addIn(e, t) {
    if (ge(e))
      this.add(t);
    else {
      const [n, ...i] = e, r = this.get(n, !0);
      if (C(r))
        r.addIn(i, t);
      else if (r === void 0 && this.schema)
        this.set(n, je(this.schema, i, t));
      else
        throw new Error(`Expected YAML collection at ${n}. Remaining path: ${i}`);
    }
  }
  /**
   * Removes a value from the collection.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(e) {
    const [t, ...n] = e;
    if (n.length === 0)
      return this.delete(t);
    const i = this.get(t, !0);
    if (C(i))
      return i.deleteIn(n);
    throw new Error(`Expected YAML collection at ${t}. Remaining path: ${n}`);
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(e, t) {
    const [n, ...i] = e, r = this.get(n, !0);
    return i.length === 0 ? !t && E(r) ? r.value : r : C(r) ? r.getIn(i, t) : void 0;
  }
  hasAllNullValues(e) {
    return this.items.every((t) => {
      if (!I(t))
        return !1;
      const n = t.value;
      return n == null || e && E(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
    });
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   */
  hasIn(e) {
    const [t, ...n] = e;
    if (n.length === 0)
      return this.has(t);
    const i = this.get(t, !0);
    return C(i) ? i.hasIn(n) : !1;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(e, t) {
    const [n, ...i] = e;
    if (i.length === 0)
      this.set(n, t);
    else {
      const r = this.get(n, !0);
      if (C(r))
        r.setIn(i, t);
      else if (r === void 0 && this.schema)
        this.set(n, je(this.schema, i, t));
      else
        throw new Error(`Expected YAML collection at ${n}. Remaining path: ${i}`);
    }
  }
}
const Gs = (s) => s.replace(/^(?!$)(?: $)?/gm, "#");
function F(s, e) {
  return /^\n+$/.test(s) ? s.substring(1) : e ? s.replace(/^(?! *$)/gm, e) : s;
}
const Q = (s, e, t) => s.endsWith(`
`) ? F(t, e) : t.includes(`
`) ? `
` + F(t, e) : (s.endsWith(" ") ? "" : " ") + t, Xt = "flow", it = "block", ve = "quoted";
function De(s, e, t = "flow", { indentAtStart: n, lineWidth: i = 80, minContentWidth: r = 20, onFold: o, onOverflow: a } = {}) {
  if (!i || i < 0)
    return s;
  i < r && (r = 0);
  const l = Math.max(1 + r, 1 + i - e.length);
  if (s.length <= l)
    return s;
  const c = [], d = {};
  let f = i - e.length;
  typeof n == "number" && (n > i - Math.max(2, r) ? c.push(0) : f = i - n);
  let p, h, g = !1, u = -1, m = -1, b = -1;
  t === it && (u = $t(s, u, e.length), u !== -1 && (f = u + l));
  for (let _; _ = s[u += 1]; ) {
    if (t === ve && _ === "\\") {
      switch (m = u, s[u + 1]) {
        case "x":
          u += 3;
          break;
        case "u":
          u += 5;
          break;
        case "U":
          u += 9;
          break;
        default:
          u += 1;
      }
      b = u;
    }
    if (_ === `
`)
      t === it && (u = $t(s, u, e.length)), f = u + e.length + l, p = void 0;
    else {
      if (_ === " " && h && h !== " " && h !== `
` && h !== "	") {
        const w = s[u + 1];
        w && w !== " " && w !== `
` && w !== "	" && (p = u);
      }
      if (u >= f)
        if (p)
          c.push(p), f = p + l, p = void 0;
        else if (t === ve) {
          for (; h === " " || h === "	"; )
            h = _, _ = s[u += 1], g = !0;
          const w = u > b + 1 ? u - 2 : m - 1;
          if (d[w])
            return s;
          c.push(w), d[w] = !0, f = w + l, p = void 0;
        } else
          g = !0;
    }
    h = _;
  }
  if (g && a && a(), c.length === 0)
    return s;
  o && o();
  let S = s.slice(0, c[0]);
  for (let _ = 0; _ < c.length; ++_) {
    const w = c[_], k = c[_ + 1] || s.length;
    w === 0 ? S = `
${e}${s.slice(0, k)}` : (t === ve && d[w] && (S += `${s[w]}\\`), S += `
${e}${s.slice(w + 1, k)}`);
  }
  return S;
}
function $t(s, e, t) {
  let n = e, i = e + 1, r = s[i];
  for (; r === " " || r === "	"; )
    if (e < i + t)
      r = s[++e];
    else {
      do
        r = s[++e];
      while (r && r !== `
`);
      n = e, i = e + 1, r = s[i];
    }
  return n;
}
const qe = (s, e) => ({
  indentAtStart: e ? s.indent.length : s.indentAtStart,
  lineWidth: s.options.lineWidth,
  minContentWidth: s.options.minContentWidth
}), Re = (s) => /^(%|---|\.\.\.)/m.test(s);
function Hs(s, e, t) {
  if (!e || e < 0)
    return !1;
  const n = e - t, i = s.length;
  if (i <= n)
    return !1;
  for (let r = 0, o = 0; r < i; ++r)
    if (s[r] === `
`) {
      if (r - o > n)
        return !0;
      if (o = r + 1, i - o <= n)
        return !1;
    }
  return !0;
}
function we(s, e) {
  const t = JSON.stringify(s);
  if (e.options.doubleQuotedAsJSON)
    return t;
  const { implicitKey: n } = e, i = e.options.doubleQuotedMinMultiLineLength, r = e.indent || (Re(s) ? "  " : "");
  let o = "", a = 0;
  for (let l = 0, c = t[l]; c; c = t[++l])
    if (c === " " && t[l + 1] === "\\" && t[l + 2] === "n" && (o += t.slice(a, l) + "\\ ", l += 1, a = l, c = "\\"), c === "\\")
      switch (t[l + 1]) {
        case "u":
          {
            o += t.slice(a, l);
            const d = t.substr(l + 2, 4);
            switch (d) {
              case "0000":
                o += "\\0";
                break;
              case "0007":
                o += "\\a";
                break;
              case "000b":
                o += "\\v";
                break;
              case "001b":
                o += "\\e";
                break;
              case "0085":
                o += "\\N";
                break;
              case "00a0":
                o += "\\_";
                break;
              case "2028":
                o += "\\L";
                break;
              case "2029":
                o += "\\P";
                break;
              default:
                d.substr(0, 2) === "00" ? o += "\\x" + d.substr(2) : o += t.substr(l, 6);
            }
            l += 5, a = l + 1;
          }
          break;
        case "n":
          if (n || t[l + 2] === '"' || t.length < i)
            l += 1;
          else {
            for (o += t.slice(a, l) + `

`; t[l + 2] === "\\" && t[l + 3] === "n" && t[l + 4] !== '"'; )
              o += `
`, l += 2;
            o += r, t[l + 2] === " " && (o += "\\"), l += 1, a = l + 1;
          }
          break;
        default:
          l += 1;
      }
  return o = a ? o + t.slice(a) : t, n ? o : De(o, r, ve, qe(e, !1));
}
function rt(s, e) {
  if (e.options.singleQuote === !1 || e.implicitKey && s.includes(`
`) || /[ \t]\n|\n[ \t]/.test(s))
    return we(s, e);
  const t = e.indent || (Re(s) ? "  " : ""), n = "'" + s.replace(/'/g, "''").replace(/\n+/g, `$&
${t}`) + "'";
  return e.implicitKey ? n : De(n, t, Xt, qe(e, !1));
}
function ie(s, e) {
  const { singleQuote: t } = e.options;
  let n;
  if (t === !1)
    n = we;
  else {
    const i = s.includes('"'), r = s.includes("'");
    i && !r ? n = rt : r && !i ? n = we : n = t ? rt : we;
  }
  return n(s, e);
}
let ot;
try {
  ot = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
} catch {
  ot = /\n+(?!\n|$)/g;
}
function Me({ comment: s, type: e, value: t }, n, i, r) {
  const { blockQuote: o, commentString: a, lineWidth: l } = n.options;
  if (!o || /\n[\t ]+$/.test(t) || /^\s*$/.test(t))
    return ie(t, n);
  const c = n.indent || (n.forceBlockIndent || Re(t) ? "  " : ""), d = o === "literal" ? !0 : o === "folded" || e === O.BLOCK_FOLDED ? !1 : e === O.BLOCK_LITERAL ? !0 : !Hs(t, l, c.length);
  if (!t)
    return d ? `|
` : `>
`;
  let f, p;
  for (p = t.length; p > 0; --p) {
    const k = t[p - 1];
    if (k !== `
` && k !== "	" && k !== " ")
      break;
  }
  let h = t.substring(p);
  const g = h.indexOf(`
`);
  g === -1 ? f = "-" : t === h || g !== h.length - 1 ? (f = "+", r && r()) : f = "", h && (t = t.slice(0, -h.length), h[h.length - 1] === `
` && (h = h.slice(0, -1)), h = h.replace(ot, `$&${c}`));
  let u = !1, m, b = -1;
  for (m = 0; m < t.length; ++m) {
    const k = t[m];
    if (k === " ")
      u = !0;
    else if (k === `
`)
      b = m;
    else
      break;
  }
  let S = t.substring(0, b < m ? b + 1 : m);
  S && (t = t.substring(S.length), S = S.replace(/\n+/g, `$&${c}`));
  let w = (u ? c ? "2" : "1" : "") + f;
  if (s && (w += " " + a(s.replace(/ ?[\r\n]+/g, " ")), i && i()), !d) {
    const k = t.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${c}`);
    let N = !1;
    const T = qe(n, !0);
    o !== "folded" && e !== O.BLOCK_FOLDED && (T.onOverflow = () => {
      N = !0;
    });
    const y = De(`${S}${k}${h}`, c, it, T);
    if (!N)
      return `>${w}
${c}${y}`;
  }
  return t = t.replace(/\n+/g, `$&${c}`), `|${w}
${c}${S}${t}${h}`;
}
function Qs(s, e, t, n) {
  const { type: i, value: r } = s, { actualString: o, implicitKey: a, indent: l, indentStep: c, inFlow: d } = e;
  if (a && r.includes(`
`) || d && /[[\]{},]/.test(r))
    return ie(r, e);
  if (!r || /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(r))
    return a || d || !r.includes(`
`) ? ie(r, e) : Me(s, e, t, n);
  if (!a && !d && i !== O.PLAIN && r.includes(`
`))
    return Me(s, e, t, n);
  if (Re(r)) {
    if (l === "")
      return e.forceBlockIndent = !0, Me(s, e, t, n);
    if (a && l === c)
      return ie(r, e);
  }
  const f = r.replace(/\n+/g, `$&
${l}`);
  if (o) {
    const p = (u) => {
      var m;
      return u.default && u.tag !== "tag:yaml.org,2002:str" && ((m = u.test) == null ? void 0 : m.test(f));
    }, { compat: h, tags: g } = e.doc.schema;
    if (g.some(p) || h != null && h.some(p))
      return ie(r, e);
  }
  return a ? f : De(f, l, Xt, qe(e, !1));
}
function ht(s, e, t, n) {
  const { implicitKey: i, inFlow: r } = e, o = typeof s.value == "string" ? s : Object.assign({}, s, { value: String(s.value) });
  let { type: a } = s;
  a !== O.QUOTE_DOUBLE && /[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value) && (a = O.QUOTE_DOUBLE);
  const l = (d) => {
    switch (d) {
      case O.BLOCK_FOLDED:
      case O.BLOCK_LITERAL:
        return i || r ? ie(o.value, e) : Me(o, e, t, n);
      case O.QUOTE_DOUBLE:
        return we(o.value, e);
      case O.QUOTE_SINGLE:
        return rt(o.value, e);
      case O.PLAIN:
        return Qs(o, e, t, n);
      default:
        return null;
    }
  };
  let c = l(a);
  if (c === null) {
    const { defaultKeyType: d, defaultStringType: f } = e.options, p = i && d || f;
    if (c = l(p), c === null)
      throw new Error(`Unsupported default string type ${p}`);
  }
  return c;
}
function zt(s, e) {
  const t = Object.assign({
    blockQuote: !0,
    commentString: Gs,
    defaultKeyType: null,
    defaultStringType: "PLAIN",
    directives: null,
    doubleQuotedAsJSON: !1,
    doubleQuotedMinMultiLineLength: 40,
    falseStr: "false",
    flowCollectionPadding: !0,
    indentSeq: !0,
    lineWidth: 80,
    minContentWidth: 20,
    nullStr: "null",
    simpleKeys: !1,
    singleQuote: null,
    trueStr: "true",
    verifyAliasOrder: !0
  }, s.schema.toStringOptions, e);
  let n;
  switch (t.collectionStyle) {
    case "block":
      n = !1;
      break;
    case "flow":
      n = !0;
      break;
    default:
      n = null;
  }
  return {
    anchors: /* @__PURE__ */ new Set(),
    doc: s,
    flowCollectionPadding: t.flowCollectionPadding ? " " : "",
    indent: "",
    indentStep: typeof t.indent == "number" ? " ".repeat(t.indent) : "  ",
    inFlow: n,
    options: t
  };
}
function Ws(s, e) {
  var i;
  if (e.tag) {
    const r = s.filter((o) => o.tag === e.tag);
    if (r.length > 0)
      return r.find((o) => o.format === e.format) ?? r[0];
  }
  let t, n;
  if (E(e)) {
    n = e.value;
    let r = s.filter((o) => {
      var a;
      return (a = o.identify) == null ? void 0 : a.call(o, n);
    });
    if (r.length > 1) {
      const o = r.filter((a) => a.test);
      o.length > 0 && (r = o);
    }
    t = r.find((o) => o.format === e.format) ?? r.find((o) => !o.format);
  } else
    n = e, t = s.find((r) => r.nodeClass && n instanceof r.nodeClass);
  if (!t) {
    const r = ((i = n == null ? void 0 : n.constructor) == null ? void 0 : i.name) ?? typeof n;
    throw new Error(`Tag not resolved for ${r} value`);
  }
  return t;
}
function Xs(s, e, { anchors: t, doc: n }) {
  if (!n.directives)
    return "";
  const i = [], r = (E(s) || C(s)) && s.anchor;
  r && Yt(r) && (t.add(r), i.push(`&${r}`));
  const o = s.tag ? s.tag : e.default ? null : e.tag;
  return o && i.push(n.directives.tagString(o)), i.join(" ");
}
function le(s, e, t, n) {
  var l;
  if (I(s))
    return s.toString(e, t, n);
  if (ue(s)) {
    if (e.doc.directives)
      return s.toString(e);
    if ((l = e.resolvedAliases) != null && l.has(s))
      throw new TypeError("Cannot stringify circular structure without alias nodes");
    e.resolvedAliases ? e.resolvedAliases.add(s) : e.resolvedAliases = /* @__PURE__ */ new Set([s]), s = s.resolve(e.doc);
  }
  let i;
  const r = A(s) ? s : e.doc.createNode(s, { onTagObj: (c) => i = c });
  i || (i = Ws(e.doc.schema.tags, r));
  const o = Xs(r, i, e);
  o.length > 0 && (e.indentAtStart = (e.indentAtStart ?? 0) + o.length + 1);
  const a = typeof i.stringify == "function" ? i.stringify(r, e, t, n) : E(r) ? ht(r, e, t, n) : r.toString(e, t, n);
  return o ? E(r) || a[0] === "{" || a[0] === "[" ? `${o} ${a}` : `${o}
${e.indent}${a}` : a;
}
function zs({ key: s, value: e }, t, n, i) {
  const { allNullValues: r, doc: o, indent: a, indentStep: l, options: { commentString: c, indentSeq: d, simpleKeys: f } } = t;
  let p = A(s) && s.comment || null;
  if (f) {
    if (p)
      throw new Error("With simple keys, key nodes cannot have comments");
    if (C(s) || !A(s) && typeof s == "object") {
      const T = "With simple keys, collection cannot be used as a key value";
      throw new Error(T);
    }
  }
  let h = !f && (!s || p && e == null && !t.inFlow || C(s) || (E(s) ? s.type === O.BLOCK_FOLDED || s.type === O.BLOCK_LITERAL : typeof s == "object"));
  t = Object.assign({}, t, {
    allNullValues: !1,
    implicitKey: !h && (f || !r),
    indent: a + l
  });
  let g = !1, u = !1, m = le(s, t, () => g = !0, () => u = !0);
  if (!h && !t.inFlow && m.length > 1024) {
    if (f)
      throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
    h = !0;
  }
  if (t.inFlow) {
    if (r || e == null)
      return g && n && n(), m === "" ? "?" : h ? `? ${m}` : m;
  } else if (r && !f || e == null && h)
    return m = `? ${m}`, p && !g ? m += Q(m, t.indent, c(p)) : u && i && i(), m;
  g && (p = null), h ? (p && (m += Q(m, t.indent, c(p))), m = `? ${m}
${a}:`) : (m = `${m}:`, p && (m += Q(m, t.indent, c(p))));
  let b, S, _;
  A(e) ? (b = !!e.spaceBefore, S = e.commentBefore, _ = e.comment) : (b = !1, S = null, _ = null, e && typeof e == "object" && (e = o.createNode(e))), t.implicitKey = !1, !h && !p && E(e) && (t.indentAtStart = m.length + 1), u = !1, !d && l.length >= 2 && !t.inFlow && !h && Ne(e) && !e.flow && !e.tag && !e.anchor && (t.indent = t.indent.substring(2));
  let w = !1;
  const k = le(e, t, () => w = !0, () => u = !0);
  let N = " ";
  if (p || b || S) {
    if (N = b ? `
` : "", S) {
      const T = c(S);
      N += `
${F(T, t.indent)}`;
    }
    k === "" && !t.inFlow ? N === `
` && (N = `

`) : N += `
${t.indent}`;
  } else if (!h && C(e)) {
    const T = k[0], y = k.indexOf(`
`), L = y !== -1, J = t.inFlow ?? e.flow ?? e.items.length === 0;
    if (L || !J) {
      let Z = !1;
      if (L && (T === "&" || T === "!")) {
        let $ = k.indexOf(" ");
        T === "&" && $ !== -1 && $ < y && k[$ + 1] === "!" && ($ = k.indexOf(" ", $ + 1)), ($ === -1 || y < $) && (Z = !0);
      }
      Z || (N = `
${t.indent}`);
    }
  } else (k === "" || k[0] === `
`) && (N = "");
  return m += N + k, t.inFlow ? w && n && n() : _ && !w ? m += Q(m, t.indent, c(_)) : u && i && i(), m;
}
function Zt(s, e) {
  (s === "debug" || s === "warn") && console.warn(e);
}
const Ee = "<<", V = {
  identify: (s) => s === Ee || typeof s == "symbol" && s.description === Ee,
  default: "key",
  tag: "tag:yaml.org,2002:merge",
  test: /^<<$/,
  resolve: () => Object.assign(new O(Symbol(Ee)), {
    addToJSMap: xt
  }),
  stringify: () => Ee
}, Zs = (s, e) => (V.identify(e) || E(e) && (!e.type || e.type === O.PLAIN) && V.identify(e.value)) && (s == null ? void 0 : s.doc.schema.tags.some((t) => t.tag === V.tag && t.default));
function xt(s, e, t) {
  if (t = s && ue(t) ? t.resolve(s.doc) : t, Ne(t))
    for (const n of t.items)
      We(s, e, n);
  else if (Array.isArray(t))
    for (const n of t)
      We(s, e, n);
  else
    We(s, e, t);
}
function We(s, e, t) {
  const n = s && ue(t) ? t.resolve(s.doc) : t;
  if (!_e(n))
    throw new Error("Merge sources must be maps or map aliases");
  const i = n.toJSON(null, s, Map);
  for (const [r, o] of i)
    e instanceof Map ? e.has(r) || e.set(r, o) : e instanceof Set ? e.add(r) : Object.prototype.hasOwnProperty.call(e, r) || Object.defineProperty(e, r, {
      value: o,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  return e;
}
function es(s, e, { key: t, value: n }) {
  if (A(t) && t.addToJSMap)
    t.addToJSMap(s, e, n);
  else if (Zs(s, t))
    xt(s, e, n);
  else {
    const i = K(t, "", s);
    if (e instanceof Map)
      e.set(i, K(n, i, s));
    else if (e instanceof Set)
      e.add(i);
    else {
      const r = xs(t, i, s), o = K(n, r, s);
      r in e ? Object.defineProperty(e, r, {
        value: o,
        writable: !0,
        enumerable: !0,
        configurable: !0
      }) : e[r] = o;
    }
  }
  return e;
}
function xs(s, e, t) {
  if (e === null)
    return "";
  if (typeof e != "object")
    return String(e);
  if (A(s) && (t != null && t.doc)) {
    const n = zt(t.doc, {});
    n.anchors = /* @__PURE__ */ new Set();
    for (const r of t.anchors.keys())
      n.anchors.add(r.anchor);
    n.inFlow = !0, n.inStringifyKey = !0;
    const i = s.toString(n);
    if (!t.mapKeyWarned) {
      let r = JSON.stringify(i);
      r.length > 40 && (r = r.substring(0, 36) + '..."'), Zt(t.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${r}. Set mapAsMap: true to use object keys.`), t.mapKeyWarned = !0;
    }
    return i;
  }
  return JSON.stringify(e);
}
function dt(s, e, t) {
  const n = Se(s, void 0, t), i = Se(e, void 0, t);
  return new B(n, i);
}
class B {
  constructor(e, t = null) {
    Object.defineProperty(this, P, { value: Jt }), this.key = e, this.value = t;
  }
  clone(e) {
    let { key: t, value: n } = this;
    return A(t) && (t = t.clone(e)), A(n) && (n = n.clone(e)), new B(t, n);
  }
  toJSON(e, t) {
    const n = t != null && t.mapAsMap ? /* @__PURE__ */ new Map() : {};
    return es(t, n, this);
  }
  toString(e, t, n) {
    return e != null && e.doc ? zs(this, e, t, n) : JSON.stringify(this);
  }
}
function ts(s, e, t) {
  return (e.inFlow ?? s.flow ? tn : en)(s, e, t);
}
function en({ comment: s, items: e }, t, { blockItemPrefix: n, flowChars: i, itemIndent: r, onChompKeep: o, onComment: a }) {
  const { indent: l, options: { commentString: c } } = t, d = Object.assign({}, t, { indent: r, type: null });
  let f = !1;
  const p = [];
  for (let g = 0; g < e.length; ++g) {
    const u = e[g];
    let m = null;
    if (A(u))
      !f && u.spaceBefore && p.push(""), Ke(t, p, u.commentBefore, f), u.comment && (m = u.comment);
    else if (I(u)) {
      const S = A(u.key) ? u.key : null;
      S && (!f && S.spaceBefore && p.push(""), Ke(t, p, S.commentBefore, f));
    }
    f = !1;
    let b = le(u, d, () => m = null, () => f = !0);
    m && (b += Q(b, r, c(m))), f && m && (f = !1), p.push(n + b);
  }
  let h;
  if (p.length === 0)
    h = i.start + i.end;
  else {
    h = p[0];
    for (let g = 1; g < p.length; ++g) {
      const u = p[g];
      h += u ? `
${l}${u}` : `
`;
    }
  }
  return s ? (h += `
` + F(c(s), l), a && a()) : f && o && o(), h;
}
function tn({ items: s }, e, { flowChars: t, itemIndent: n }) {
  const { indent: i, indentStep: r, flowCollectionPadding: o, options: { commentString: a } } = e;
  n += r;
  const l = Object.assign({}, e, {
    indent: n,
    inFlow: !0,
    type: null
  });
  let c = !1, d = 0;
  const f = [];
  for (let g = 0; g < s.length; ++g) {
    const u = s[g];
    let m = null;
    if (A(u))
      u.spaceBefore && f.push(""), Ke(e, f, u.commentBefore, !1), u.comment && (m = u.comment);
    else if (I(u)) {
      const S = A(u.key) ? u.key : null;
      S && (S.spaceBefore && f.push(""), Ke(e, f, S.commentBefore, !1), S.comment && (c = !0));
      const _ = A(u.value) ? u.value : null;
      _ ? (_.comment && (m = _.comment), _.commentBefore && (c = !0)) : u.value == null && (S != null && S.comment) && (m = S.comment);
    }
    m && (c = !0);
    let b = le(u, l, () => m = null);
    g < s.length - 1 && (b += ","), m && (b += Q(b, n, a(m))), !c && (f.length > d || b.includes(`
`)) && (c = !0), f.push(b), d = f.length;
  }
  const { start: p, end: h } = t;
  if (f.length === 0)
    return p + h;
  if (!c) {
    const g = f.reduce((u, m) => u + m.length + 2, 2);
    c = e.options.lineWidth > 0 && g > e.options.lineWidth;
  }
  if (c) {
    let g = p;
    for (const u of f)
      g += u ? `
${r}${i}${u}` : `
`;
    return `${g}
${i}${h}`;
  } else
    return `${p}${o}${f.join(" ")}${o}${h}`;
}
function Ke({ indent: s, options: { commentString: e } }, t, n, i) {
  if (n && i && (n = n.replace(/^\n+/, "")), n) {
    const r = F(e(n), s);
    t.push(r.trimStart());
  }
}
function W(s, e) {
  const t = E(e) ? e.value : e;
  for (const n of s)
    if (I(n) && (n.key === e || n.key === t || E(n.key) && n.key.value === t))
      return n;
}
class j extends Wt {
  static get tagName() {
    return "tag:yaml.org,2002:map";
  }
  constructor(e) {
    super(G, e), this.items = [];
  }
  /**
   * A generic collection parsing method that can be extended
   * to other node classes that inherit from YAMLMap
   */
  static from(e, t, n) {
    const { keepUndefined: i, replacer: r } = n, o = new this(e), a = (l, c) => {
      if (typeof r == "function")
        c = r.call(t, l, c);
      else if (Array.isArray(r) && !r.includes(l))
        return;
      (c !== void 0 || i) && o.items.push(dt(l, c, n));
    };
    if (t instanceof Map)
      for (const [l, c] of t)
        a(l, c);
    else if (t && typeof t == "object")
      for (const l of Object.keys(t))
        a(l, t[l]);
    return typeof e.sortMapEntries == "function" && o.items.sort(e.sortMapEntries), o;
  }
  /**
   * Adds a value to the collection.
   *
   * @param overwrite - If not set `true`, using a key that is already in the
   *   collection will throw. Otherwise, overwrites the previous value.
   */
  add(e, t) {
    var o;
    let n;
    I(e) ? n = e : !e || typeof e != "object" || !("key" in e) ? n = new B(e, e == null ? void 0 : e.value) : n = new B(e.key, e.value);
    const i = W(this.items, n.key), r = (o = this.schema) == null ? void 0 : o.sortMapEntries;
    if (i) {
      if (!t)
        throw new Error(`Key ${n.key} already set`);
      E(i.value) && Qt(n.value) ? i.value.value = n.value : i.value = n.value;
    } else if (r) {
      const a = this.items.findIndex((l) => r(n, l) < 0);
      a === -1 ? this.items.push(n) : this.items.splice(a, 0, n);
    } else
      this.items.push(n);
  }
  delete(e) {
    const t = W(this.items, e);
    return t ? this.items.splice(this.items.indexOf(t), 1).length > 0 : !1;
  }
  get(e, t) {
    const n = W(this.items, e), i = n == null ? void 0 : n.value;
    return (!t && E(i) ? i.value : i) ?? void 0;
  }
  has(e) {
    return !!W(this.items, e);
  }
  set(e, t) {
    this.add(new B(e, t), !0);
  }
  /**
   * @param ctx - Conversion context, originally set in Document#toJS()
   * @param {Class} Type - If set, forces the returned collection type
   * @returns Instance of Type, Map, or Object
   */
  toJSON(e, t, n) {
    const i = n ? new n() : t != null && t.mapAsMap ? /* @__PURE__ */ new Map() : {};
    t != null && t.onCreate && t.onCreate(i);
    for (const r of this.items)
      es(t, i, r);
    return i;
  }
  toString(e, t, n) {
    if (!e)
      return JSON.stringify(this);
    for (const i of this.items)
      if (!I(i))
        throw new Error(`Map items must all be pairs; found ${JSON.stringify(i)} instead`);
    return !e.allNullValues && this.hasAllNullValues(!1) && (e = Object.assign({}, e, { allNullValues: !0 })), ts(this, e, {
      blockItemPrefix: "",
      flowChars: { start: "{", end: "}" },
      itemIndent: e.indent || "",
      onChompKeep: n,
      onComment: t
    });
  }
}
const he = {
  collection: "map",
  default: !0,
  nodeClass: j,
  tag: "tag:yaml.org,2002:map",
  resolve(s, e) {
    return _e(s) || e("Expected a mapping for this tag"), s;
  },
  createNode: (s, e, t) => j.from(s, e, t)
};
class z extends Wt {
  static get tagName() {
    return "tag:yaml.org,2002:seq";
  }
  constructor(e) {
    super(fe, e), this.items = [];
  }
  add(e) {
    this.items.push(e);
  }
  /**
   * Removes a value from the collection.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   *
   * @returns `true` if the item was found and removed.
   */
  delete(e) {
    const t = Ce(e);
    return typeof t != "number" ? !1 : this.items.splice(t, 1).length > 0;
  }
  get(e, t) {
    const n = Ce(e);
    if (typeof n != "number")
      return;
    const i = this.items[n];
    return !t && E(i) ? i.value : i;
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   */
  has(e) {
    const t = Ce(e);
    return typeof t == "number" && t < this.items.length;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   *
   * If `key` does not contain a representation of an integer, this will throw.
   * It may be wrapped in a `Scalar`.
   */
  set(e, t) {
    const n = Ce(e);
    if (typeof n != "number")
      throw new Error(`Expected a valid index, not ${e}.`);
    const i = this.items[n];
    E(i) && Qt(t) ? i.value = t : this.items[n] = t;
  }
  toJSON(e, t) {
    const n = [];
    t != null && t.onCreate && t.onCreate(n);
    let i = 0;
    for (const r of this.items)
      n.push(K(r, String(i++), t));
    return n;
  }
  toString(e, t, n) {
    return e ? ts(this, e, {
      blockItemPrefix: "- ",
      flowChars: { start: "[", end: "]" },
      itemIndent: (e.indent || "") + "  ",
      onChompKeep: n,
      onComment: t
    }) : JSON.stringify(this);
  }
  static from(e, t, n) {
    const { replacer: i } = n, r = new this(e);
    if (t && Symbol.iterator in Object(t)) {
      let o = 0;
      for (let a of t) {
        if (typeof i == "function") {
          const l = t instanceof Set ? a : String(o++);
          a = i.call(t, l, a);
        }
        r.items.push(Se(a, void 0, n));
      }
    }
    return r;
  }
}
function Ce(s) {
  let e = E(s) ? s.value : s;
  return e && typeof e == "string" && (e = Number(e)), typeof e == "number" && Number.isInteger(e) && e >= 0 ? e : null;
}
const de = {
  collection: "seq",
  default: !0,
  nodeClass: z,
  tag: "tag:yaml.org,2002:seq",
  resolve(s, e) {
    return Ne(s) || e("Expected a sequence for this tag"), s;
  },
  createNode: (s, e, t) => z.from(s, e, t)
}, Ue = {
  identify: (s) => typeof s == "string",
  default: !0,
  tag: "tag:yaml.org,2002:str",
  resolve: (s) => s,
  stringify(s, e, t, n) {
    return e = Object.assign({ actualString: !0 }, e), ht(s, e, t, n);
  }
}, Fe = {
  identify: (s) => s == null,
  createNode: () => new O(null),
  default: !0,
  tag: "tag:yaml.org,2002:null",
  test: /^(?:~|[Nn]ull|NULL)?$/,
  resolve: () => new O(null),
  stringify: ({ source: s }, e) => typeof s == "string" && Fe.test.test(s) ? s : e.options.nullStr
}, pt = {
  identify: (s) => typeof s == "boolean",
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
  resolve: (s) => new O(s[0] === "t" || s[0] === "T"),
  stringify({ source: s, value: e }, t) {
    if (s && pt.test.test(s)) {
      const n = s[0] === "t" || s[0] === "T";
      if (e === n)
        return s;
    }
    return e ? t.options.trueStr : t.options.falseStr;
  }
};
function q({ format: s, minFractionDigits: e, tag: t, value: n }) {
  if (typeof n == "bigint")
    return String(n);
  const i = typeof n == "number" ? n : Number(n);
  if (!isFinite(i))
    return isNaN(i) ? ".nan" : i < 0 ? "-.inf" : ".inf";
  let r = JSON.stringify(n);
  if (!s && e && (!t || t === "tag:yaml.org,2002:float") && /^\d/.test(r)) {
    let o = r.indexOf(".");
    o < 0 && (o = r.length, r += ".");
    let a = e - (r.length - o - 1);
    for (; a-- > 0; )
      r += "0";
  }
  return r;
}
const ss = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (s) => s.slice(-3).toLowerCase() === "nan" ? NaN : s[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: q
}, ns = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
  resolve: (s) => parseFloat(s),
  stringify(s) {
    const e = Number(s.value);
    return isFinite(e) ? e.toExponential() : q(s);
  }
}, is = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
  resolve(s) {
    const e = new O(parseFloat(s)), t = s.indexOf(".");
    return t !== -1 && s[s.length - 1] === "0" && (e.minFractionDigits = s.length - t - 1), e;
  },
  stringify: q
}, Ve = (s) => typeof s == "bigint" || Number.isInteger(s), mt = (s, e, t, { intAsBigInt: n }) => n ? BigInt(s) : parseInt(s.substring(e), t);
function rs(s, e, t) {
  const { value: n } = s;
  return Ve(n) && n >= 0 ? t + n.toString(e) : q(s);
}
const os = {
  identify: (s) => Ve(s) && s >= 0,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^0o[0-7]+$/,
  resolve: (s, e, t) => mt(s, 2, 8, t),
  stringify: (s) => rs(s, 8, "0o")
}, as = {
  identify: Ve,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9]+$/,
  resolve: (s, e, t) => mt(s, 0, 10, t),
  stringify: q
}, ls = {
  identify: (s) => Ve(s) && s >= 0,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^0x[0-9a-fA-F]+$/,
  resolve: (s, e, t) => mt(s, 2, 16, t),
  stringify: (s) => rs(s, 16, "0x")
}, sn = [
  he,
  de,
  Ue,
  Fe,
  pt,
  os,
  as,
  ls,
  ss,
  ns,
  is
];
function vt(s) {
  return typeof s == "bigint" || Number.isInteger(s);
}
const Ae = ({ value: s }) => JSON.stringify(s), nn = [
  {
    identify: (s) => typeof s == "string",
    default: !0,
    tag: "tag:yaml.org,2002:str",
    resolve: (s) => s,
    stringify: Ae
  },
  {
    identify: (s) => s == null,
    createNode: () => new O(null),
    default: !0,
    tag: "tag:yaml.org,2002:null",
    test: /^null$/,
    resolve: () => null,
    stringify: Ae
  },
  {
    identify: (s) => typeof s == "boolean",
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^true$|^false$/,
    resolve: (s) => s === "true",
    stringify: Ae
  },
  {
    identify: vt,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^-?(?:0|[1-9][0-9]*)$/,
    resolve: (s, e, { intAsBigInt: t }) => t ? BigInt(s) : parseInt(s, 10),
    stringify: ({ value: s }) => vt(s) ? s.toString() : JSON.stringify(s)
  },
  {
    identify: (s) => typeof s == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
    resolve: (s) => parseFloat(s),
    stringify: Ae
  }
], rn = {
  default: !0,
  tag: "",
  test: /^/,
  resolve(s, e) {
    return e(`Unresolved plain scalar ${JSON.stringify(s)}`), s;
  }
}, on = [he, de].concat(nn, rn), gt = {
  identify: (s) => s instanceof Uint8Array,
  // Buffer inherits from Uint8Array
  default: !1,
  tag: "tag:yaml.org,2002:binary",
  /**
   * Returns a Buffer in node and an Uint8Array in browsers
   *
   * To use the resulting buffer as an image, you'll want to do something like:
   *
   *   const blob = new Blob([buffer], { type: 'image/jpeg' })
   *   document.querySelector('#photo').src = URL.createObjectURL(blob)
   */
  resolve(s, e) {
    if (typeof atob == "function") {
      const t = atob(s.replace(/[\n\r]/g, "")), n = new Uint8Array(t.length);
      for (let i = 0; i < t.length; ++i)
        n[i] = t.charCodeAt(i);
      return n;
    } else
      return e("This environment does not support reading binary tags; either Buffer or atob is required"), s;
  },
  stringify({ comment: s, type: e, value: t }, n, i, r) {
    if (!t)
      return "";
    const o = t;
    let a;
    if (typeof btoa == "function") {
      let l = "";
      for (let c = 0; c < o.length; ++c)
        l += String.fromCharCode(o[c]);
      a = btoa(l);
    } else
      throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
    if (e || (e = O.BLOCK_LITERAL), e !== O.QUOTE_DOUBLE) {
      const l = Math.max(n.options.lineWidth - n.indent.length, n.options.minContentWidth), c = Math.ceil(a.length / l), d = new Array(c);
      for (let f = 0, p = 0; f < c; ++f, p += l)
        d[f] = a.substr(p, l);
      a = d.join(e === O.BLOCK_LITERAL ? `
` : " ");
    }
    return ht({ comment: s, type: e, value: a }, n, i, r);
  }
};
function cs(s, e) {
  if (Ne(s))
    for (let t = 0; t < s.items.length; ++t) {
      let n = s.items[t];
      if (!I(n)) {
        if (_e(n)) {
          n.items.length > 1 && e("Each pair must have its own sequence indicator");
          const i = n.items[0] || new B(new O(null));
          if (n.commentBefore && (i.key.commentBefore = i.key.commentBefore ? `${n.commentBefore}
${i.key.commentBefore}` : n.commentBefore), n.comment) {
            const r = i.value ?? i.key;
            r.comment = r.comment ? `${n.comment}
${r.comment}` : n.comment;
          }
          n = i;
        }
        s.items[t] = I(n) ? n : new B(n);
      }
    }
  else
    e("Expected a sequence for this tag");
  return s;
}
function fs(s, e, t) {
  const { replacer: n } = t, i = new z(s);
  i.tag = "tag:yaml.org,2002:pairs";
  let r = 0;
  if (e && Symbol.iterator in Object(e))
    for (let o of e) {
      typeof n == "function" && (o = n.call(e, String(r++), o));
      let a, l;
      if (Array.isArray(o))
        if (o.length === 2)
          a = o[0], l = o[1];
        else
          throw new TypeError(`Expected [key, value] tuple: ${o}`);
      else if (o && o instanceof Object) {
        const c = Object.keys(o);
        if (c.length === 1)
          a = c[0], l = o[a];
        else
          throw new TypeError(`Expected tuple with one key, not ${c.length} keys`);
      } else
        a = o;
      i.items.push(dt(a, l, t));
    }
  return i;
}
const yt = {
  collection: "seq",
  default: !1,
  tag: "tag:yaml.org,2002:pairs",
  resolve: cs,
  createNode: fs
};
class re extends z {
  constructor() {
    super(), this.add = j.prototype.add.bind(this), this.delete = j.prototype.delete.bind(this), this.get = j.prototype.get.bind(this), this.has = j.prototype.has.bind(this), this.set = j.prototype.set.bind(this), this.tag = re.tag;
  }
  /**
   * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
   * but TypeScript won't allow widening the signature of a child method.
   */
  toJSON(e, t) {
    if (!t)
      return super.toJSON(e);
    const n = /* @__PURE__ */ new Map();
    t != null && t.onCreate && t.onCreate(n);
    for (const i of this.items) {
      let r, o;
      if (I(i) ? (r = K(i.key, "", t), o = K(i.value, r, t)) : r = K(i, "", t), n.has(r))
        throw new Error("Ordered maps must not include duplicate keys");
      n.set(r, o);
    }
    return n;
  }
  static from(e, t, n) {
    const i = fs(e, t, n), r = new this();
    return r.items = i.items, r;
  }
}
re.tag = "tag:yaml.org,2002:omap";
const bt = {
  collection: "seq",
  identify: (s) => s instanceof Map,
  nodeClass: re,
  default: !1,
  tag: "tag:yaml.org,2002:omap",
  resolve(s, e) {
    const t = cs(s, e), n = [];
    for (const { key: i } of t.items)
      E(i) && (n.includes(i.value) ? e(`Ordered maps must not include duplicate keys: ${i.value}`) : n.push(i.value));
    return Object.assign(new re(), t);
  },
  createNode: (s, e, t) => re.from(s, e, t)
};
function us({ value: s, source: e }, t) {
  return e && (s ? hs : ds).test.test(e) ? e : s ? t.options.trueStr : t.options.falseStr;
}
const hs = {
  identify: (s) => s === !0,
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
  resolve: () => new O(!0),
  stringify: us
}, ds = {
  identify: (s) => s === !1,
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
  resolve: () => new O(!1),
  stringify: us
}, an = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (s) => s.slice(-3).toLowerCase() === "nan" ? NaN : s[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: q
}, ln = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
  resolve: (s) => parseFloat(s.replace(/_/g, "")),
  stringify(s) {
    const e = Number(s.value);
    return isFinite(e) ? e.toExponential() : q(s);
  }
}, cn = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
  resolve(s) {
    const e = new O(parseFloat(s.replace(/_/g, ""))), t = s.indexOf(".");
    if (t !== -1) {
      const n = s.substring(t + 1).replace(/_/g, "");
      n[n.length - 1] === "0" && (e.minFractionDigits = n.length);
    }
    return e;
  },
  stringify: q
}, Oe = (s) => typeof s == "bigint" || Number.isInteger(s);
function Je(s, e, t, { intAsBigInt: n }) {
  const i = s[0];
  if ((i === "-" || i === "+") && (e += 1), s = s.substring(e).replace(/_/g, ""), n) {
    switch (t) {
      case 2:
        s = `0b${s}`;
        break;
      case 8:
        s = `0o${s}`;
        break;
      case 16:
        s = `0x${s}`;
        break;
    }
    const o = BigInt(s);
    return i === "-" ? BigInt(-1) * o : o;
  }
  const r = parseInt(s, t);
  return i === "-" ? -1 * r : r;
}
function wt(s, e, t) {
  const { value: n } = s;
  if (Oe(n)) {
    const i = n.toString(e);
    return n < 0 ? "-" + t + i.substr(1) : t + i;
  }
  return q(s);
}
const fn = {
  identify: Oe,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "BIN",
  test: /^[-+]?0b[0-1_]+$/,
  resolve: (s, e, t) => Je(s, 2, 2, t),
  stringify: (s) => wt(s, 2, "0b")
}, un = {
  identify: Oe,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^[-+]?0[0-7_]+$/,
  resolve: (s, e, t) => Je(s, 1, 8, t),
  stringify: (s) => wt(s, 8, "0")
}, hn = {
  identify: Oe,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9][0-9_]*$/,
  resolve: (s, e, t) => Je(s, 0, 10, t),
  stringify: q
}, dn = {
  identify: Oe,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^[-+]?0x[0-9a-fA-F_]+$/,
  resolve: (s, e, t) => Je(s, 2, 16, t),
  stringify: (s) => wt(s, 16, "0x")
};
class oe extends j {
  constructor(e) {
    super(e), this.tag = oe.tag;
  }
  add(e) {
    let t;
    I(e) ? t = e : e && typeof e == "object" && "key" in e && "value" in e && e.value === null ? t = new B(e.key, null) : t = new B(e, null), W(this.items, t.key) || this.items.push(t);
  }
  /**
   * If `keepPair` is `true`, returns the Pair matching `key`.
   * Otherwise, returns the value of that Pair's key.
   */
  get(e, t) {
    const n = W(this.items, e);
    return !t && I(n) ? E(n.key) ? n.key.value : n.key : n;
  }
  set(e, t) {
    if (typeof t != "boolean")
      throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);
    const n = W(this.items, e);
    n && !t ? this.items.splice(this.items.indexOf(n), 1) : !n && t && this.items.push(new B(e));
  }
  toJSON(e, t) {
    return super.toJSON(e, t, Set);
  }
  toString(e, t, n) {
    if (!e)
      return JSON.stringify(this);
    if (this.hasAllNullValues(!0))
      return super.toString(Object.assign({}, e, { allNullValues: !0 }), t, n);
    throw new Error("Set items must all have null values");
  }
  static from(e, t, n) {
    const { replacer: i } = n, r = new this(e);
    if (t && Symbol.iterator in Object(t))
      for (let o of t)
        typeof i == "function" && (o = i.call(t, o, o)), r.items.push(dt(o, null, n));
    return r;
  }
}
oe.tag = "tag:yaml.org,2002:set";
const St = {
  collection: "map",
  identify: (s) => s instanceof Set,
  nodeClass: oe,
  default: !1,
  tag: "tag:yaml.org,2002:set",
  createNode: (s, e, t) => oe.from(s, e, t),
  resolve(s, e) {
    if (_e(s)) {
      if (s.hasAllNullValues(!0))
        return Object.assign(new oe(), s);
      e("Set items must all have null values");
    } else
      e("Expected a mapping for this tag");
    return s;
  }
};
function kt(s, e) {
  const t = s[0], n = t === "-" || t === "+" ? s.substring(1) : s, i = (o) => e ? BigInt(o) : Number(o), r = n.replace(/_/g, "").split(":").reduce((o, a) => o * i(60) + i(a), i(0));
  return t === "-" ? i(-1) * r : r;
}
function ps(s) {
  let { value: e } = s, t = (o) => o;
  if (typeof e == "bigint")
    t = (o) => BigInt(o);
  else if (isNaN(e) || !isFinite(e))
    return q(s);
  let n = "";
  e < 0 && (n = "-", e *= t(-1));
  const i = t(60), r = [e % i];
  return e < 60 ? r.unshift(0) : (e = (e - r[0]) / i, r.unshift(e % i), e >= 60 && (e = (e - r[0]) / i, r.unshift(e))), n + r.map((o) => String(o).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
}
const ms = {
  identify: (s) => typeof s == "bigint" || Number.isInteger(s),
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
  resolve: (s, e, { intAsBigInt: t }) => kt(s, t),
  stringify: ps
}, gs = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
  resolve: (s) => kt(s, !1),
  stringify: ps
}, Ye = {
  identify: (s) => s instanceof Date,
  default: !0,
  tag: "tag:yaml.org,2002:timestamp",
  // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
  // may be omitted altogether, resulting in a date format. In such a case, the time part is
  // assumed to be 00:00:00Z (start of day, UTC).
  test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
  resolve(s) {
    const e = s.match(Ye.test);
    if (!e)
      throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
    const [, t, n, i, r, o, a] = e.map(Number), l = e[7] ? Number((e[7] + "00").substr(1, 3)) : 0;
    let c = Date.UTC(t, n - 1, i, r || 0, o || 0, a || 0, l);
    const d = e[8];
    if (d && d !== "Z") {
      let f = kt(d, !1);
      Math.abs(f) < 30 && (f *= 60), c -= 6e4 * f;
    }
    return new Date(c);
  },
  stringify: ({ value: s }) => (s == null ? void 0 : s.toISOString().replace(/(T00:00:00)?\.000Z$/, "")) ?? ""
}, Mt = [
  he,
  de,
  Ue,
  Fe,
  hs,
  ds,
  fn,
  un,
  hn,
  dn,
  an,
  ln,
  cn,
  gt,
  V,
  bt,
  yt,
  St,
  ms,
  gs,
  Ye
], Bt = /* @__PURE__ */ new Map([
  ["core", sn],
  ["failsafe", [he, de, Ue]],
  ["json", on],
  ["yaml11", Mt],
  ["yaml-1.1", Mt]
]), jt = {
  binary: gt,
  bool: pt,
  float: is,
  floatExp: ns,
  floatNaN: ss,
  floatTime: gs,
  int: as,
  intHex: ls,
  intOct: os,
  intTime: ms,
  map: he,
  merge: V,
  null: Fe,
  omap: bt,
  pairs: yt,
  seq: de,
  set: St,
  timestamp: Ye
}, pn = {
  "tag:yaml.org,2002:binary": gt,
  "tag:yaml.org,2002:merge": V,
  "tag:yaml.org,2002:omap": bt,
  "tag:yaml.org,2002:pairs": yt,
  "tag:yaml.org,2002:set": St,
  "tag:yaml.org,2002:timestamp": Ye
};
function Xe(s, e, t) {
  const n = Bt.get(e);
  if (n && !s)
    return t && !n.includes(V) ? n.concat(V) : n.slice();
  let i = n;
  if (!i)
    if (Array.isArray(s))
      i = [];
    else {
      const r = Array.from(Bt.keys()).filter((o) => o !== "yaml11").map((o) => JSON.stringify(o)).join(", ");
      throw new Error(`Unknown schema "${e}"; use one of ${r} or define customTags array`);
    }
  if (Array.isArray(s))
    for (const r of s)
      i = i.concat(r);
  else typeof s == "function" && (i = s(i.slice()));
  return t && (i = i.concat(V)), i.reduce((r, o) => {
    const a = typeof o == "string" ? jt[o] : o;
    if (!a) {
      const l = JSON.stringify(o), c = Object.keys(jt).map((d) => JSON.stringify(d)).join(", ");
      throw new Error(`Unknown custom tag ${l}; use one of ${c}`);
    }
    return r.includes(a) || r.push(a), r;
  }, []);
}
const mn = (s, e) => s.key < e.key ? -1 : s.key > e.key ? 1 : 0;
class _t {
  constructor({ compat: e, customTags: t, merge: n, resolveKnownTags: i, schema: r, sortMapEntries: o, toStringDefaults: a }) {
    this.compat = Array.isArray(e) ? Xe(e, "compat") : e ? Xe(null, e) : null, this.name = typeof r == "string" && r || "core", this.knownTags = i ? pn : {}, this.tags = Xe(t, this.name, n), this.toStringOptions = a ?? null, Object.defineProperty(this, G, { value: he }), Object.defineProperty(this, U, { value: Ue }), Object.defineProperty(this, fe, { value: de }), this.sortMapEntries = typeof o == "function" ? o : o === !0 ? mn : null;
  }
  clone() {
    const e = Object.create(_t.prototype, Object.getOwnPropertyDescriptors(this));
    return e.tags = this.tags.slice(), e;
  }
}
function gn(s, e) {
  var l;
  const t = [];
  let n = e.directives === !0;
  if (e.directives !== !1 && s.directives) {
    const c = s.directives.toString(s);
    c ? (t.push(c), n = !0) : s.directives.docStart && (n = !0);
  }
  n && t.push("---");
  const i = zt(s, e), { commentString: r } = i.options;
  if (s.commentBefore) {
    t.length !== 1 && t.unshift("");
    const c = r(s.commentBefore);
    t.unshift(F(c, ""));
  }
  let o = !1, a = null;
  if (s.contents) {
    if (A(s.contents)) {
      if (s.contents.spaceBefore && n && t.push(""), s.contents.commentBefore) {
        const f = r(s.contents.commentBefore);
        t.push(F(f, ""));
      }
      i.forceBlockIndent = !!s.comment, a = s.contents.comment;
    }
    const c = a ? void 0 : () => o = !0;
    let d = le(s.contents, i, () => a = null, c);
    a && (d += Q(d, "", r(a))), (d[0] === "|" || d[0] === ">") && t[t.length - 1] === "---" ? t[t.length - 1] = `--- ${d}` : t.push(d);
  } else
    t.push(le(s.contents, i));
  if ((l = s.directives) != null && l.docEnd)
    if (s.comment) {
      const c = r(s.comment);
      c.includes(`
`) ? (t.push("..."), t.push(F(c, ""))) : t.push(`... ${c}`);
    } else
      t.push("...");
  else {
    let c = s.comment;
    c && o && (c = c.replace(/^\n+/, "")), c && ((!o || a) && t[t.length - 1] !== "" && t.push(""), t.push(F(r(c), "")));
  }
  return t.join(`
`) + `
`;
}
class Ge {
  constructor(e, t, n) {
    this.commentBefore = null, this.comment = null, this.errors = [], this.warnings = [], Object.defineProperty(this, P, { value: nt });
    let i = null;
    typeof t == "function" || Array.isArray(t) ? i = t : n === void 0 && t && (n = t, t = void 0);
    const r = Object.assign({
      intAsBigInt: !1,
      keepSourceTokens: !1,
      logLevel: "warn",
      prettyErrors: !0,
      strict: !0,
      stringKeys: !1,
      uniqueKeys: !0,
      version: "1.2"
    }, n);
    this.options = r;
    let { version: o } = r;
    n != null && n._directives ? (this.directives = n._directives.atDocument(), this.directives.yaml.explicit && (o = this.directives.yaml.version)) : this.directives = new M({ version: o }), this.setSchema(o, n), this.contents = e === void 0 ? null : this.createNode(e, i, n);
  }
  /**
   * Create a deep copy of this Document and its contents.
   *
   * Custom Node values that inherit from `Object` still refer to their original instances.
   */
  clone() {
    const e = Object.create(Ge.prototype, {
      [P]: { value: nt }
    });
    return e.commentBefore = this.commentBefore, e.comment = this.comment, e.errors = this.errors.slice(), e.warnings = this.warnings.slice(), e.options = Object.assign({}, this.options), this.directives && (e.directives = this.directives.clone()), e.schema = this.schema.clone(), e.contents = A(this.contents) ? this.contents.clone(e.schema) : this.contents, this.range && (e.range = this.range.slice()), e;
  }
  /** Adds a value to the document. */
  add(e) {
    x(this.contents) && this.contents.add(e);
  }
  /** Adds a value to the document. */
  addIn(e, t) {
    x(this.contents) && this.contents.addIn(e, t);
  }
  /**
   * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
   *
   * If `node` already has an anchor, `name` is ignored.
   * Otherwise, the `node.anchor` value will be set to `name`,
   * or if an anchor with that name is already present in the document,
   * `name` will be used as a prefix for a new unique anchor.
   * If `name` is undefined, the generated anchor will use 'a' as a prefix.
   */
  createAlias(e, t) {
    if (!e.anchor) {
      const n = Gt(this);
      e.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      !t || n.has(t) ? Ht(t || "a", n) : t;
    }
    return new ut(e.anchor);
  }
  createNode(e, t, n) {
    let i;
    if (typeof t == "function")
      e = t.call({ "": e }, "", e), i = t;
    else if (Array.isArray(t)) {
      const m = (S) => typeof S == "number" || S instanceof String || S instanceof Number, b = t.filter(m).map(String);
      b.length > 0 && (t = t.concat(b)), i = t;
    } else n === void 0 && t && (n = t, t = void 0);
    const { aliasDuplicateObjects: r, anchorPrefix: o, flow: a, keepUndefined: l, onTagObj: c, tag: d } = n ?? {}, { onAnchor: f, setAnchors: p, sourceObjects: h } = Vs(
      this,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      o || "a"
    ), g = {
      aliasDuplicateObjects: r ?? !0,
      keepUndefined: l ?? !1,
      onAnchor: f,
      onTagObj: c,
      replacer: i,
      schema: this.schema,
      sourceObjects: h
    }, u = Se(e, d, g);
    return a && C(u) && (u.flow = !0), p(), u;
  }
  /**
   * Convert a key and a value into a `Pair` using the current schema,
   * recursively wrapping all values as `Scalar` or `Collection` nodes.
   */
  createPair(e, t, n = {}) {
    const i = this.createNode(e, null, n), r = this.createNode(t, null, n);
    return new B(i, r);
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  delete(e) {
    return x(this.contents) ? this.contents.delete(e) : !1;
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(e) {
    return ge(e) ? this.contents == null ? !1 : (this.contents = null, !0) : x(this.contents) ? this.contents.deleteIn(e) : !1;
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  get(e, t) {
    return C(this.contents) ? this.contents.get(e, t) : void 0;
  }
  /**
   * Returns item at `path`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(e, t) {
    return ge(e) ? !t && E(this.contents) ? this.contents.value : this.contents : C(this.contents) ? this.contents.getIn(e, t) : void 0;
  }
  /**
   * Checks if the document includes a value with the key `key`.
   */
  has(e) {
    return C(this.contents) ? this.contents.has(e) : !1;
  }
  /**
   * Checks if the document includes a value at `path`.
   */
  hasIn(e) {
    return ge(e) ? this.contents !== void 0 : C(this.contents) ? this.contents.hasIn(e) : !1;
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  set(e, t) {
    this.contents == null ? this.contents = je(this.schema, [e], t) : x(this.contents) && this.contents.set(e, t);
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(e, t) {
    ge(e) ? this.contents = t : this.contents == null ? this.contents = je(this.schema, Array.from(e), t) : x(this.contents) && this.contents.setIn(e, t);
  }
  /**
   * Change the YAML version and schema used by the document.
   * A `null` version disables support for directives, explicit tags, anchors, and aliases.
   * It also requires the `schema` option to be given as a `Schema` instance value.
   *
   * Overrides all previously set schema options.
   */
  setSchema(e, t = {}) {
    typeof e == "number" && (e = String(e));
    let n;
    switch (e) {
      case "1.1":
        this.directives ? this.directives.yaml.version = "1.1" : this.directives = new M({ version: "1.1" }), n = { resolveKnownTags: !1, schema: "yaml-1.1" };
        break;
      case "1.2":
      case "next":
        this.directives ? this.directives.yaml.version = e : this.directives = new M({ version: e }), n = { resolveKnownTags: !0, schema: "core" };
        break;
      case null:
        this.directives && delete this.directives, n = null;
        break;
      default: {
        const i = JSON.stringify(e);
        throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${i}`);
      }
    }
    if (t.schema instanceof Object)
      this.schema = t.schema;
    else if (n)
      this.schema = new _t(Object.assign(n, t));
    else
      throw new Error("With a null YAML version, the { schema: Schema } option is required");
  }
  // json & jsonArg are only used from toJSON()
  toJS({ json: e, jsonArg: t, mapAsMap: n, maxAliasCount: i, onAnchor: r, reviver: o } = {}) {
    const a = {
      anchors: /* @__PURE__ */ new Map(),
      doc: this,
      keep: !e,
      mapAsMap: n === !0,
      mapKeyWarned: !1,
      maxAliasCount: typeof i == "number" ? i : 100
    }, l = K(this.contents, t ?? "", a);
    if (typeof r == "function")
      for (const { count: c, res: d } of a.anchors.values())
        r(d, c);
    return typeof o == "function" ? ne(o, { "": l }, "", l) : l;
  }
  /**
   * A JSON representation of the document `contents`.
   *
   * @param jsonArg Used by `JSON.stringify` to indicate the array index or
   *   property name.
   */
  toJSON(e, t) {
    return this.toJS({ json: !0, jsonArg: e, mapAsMap: !1, onAnchor: t });
  }
  /** A YAML representation of the document. */
  toString(e = {}) {
    if (this.errors.length > 0)
      throw new Error("Document with errors cannot be stringified");
    if ("indent" in e && (!Number.isInteger(e.indent) || Number(e.indent) <= 0)) {
      const t = JSON.stringify(e.indent);
      throw new Error(`"indent" option must be a positive integer, not ${t}`);
    }
    return gn(this, e);
  }
}
function x(s) {
  if (C(s))
    return !0;
  throw new Error("Expected a YAML collection as document contents");
}
class ys extends Error {
  constructor(e, t, n, i) {
    super(), this.name = e, this.code = n, this.message = i, this.pos = t;
  }
}
class ye extends ys {
  constructor(e, t, n) {
    super("YAMLParseError", e, t, n);
  }
}
class yn extends ys {
  constructor(e, t, n) {
    super("YAMLWarning", e, t, n);
  }
}
const Kt = (s, e) => (t) => {
  if (t.pos[0] === -1)
    return;
  t.linePos = t.pos.map((a) => e.linePos(a));
  const { line: n, col: i } = t.linePos[0];
  t.message += ` at line ${n}, column ${i}`;
  let r = i - 1, o = s.substring(e.lineStarts[n - 1], e.lineStarts[n]).replace(/[\n\r]+$/, "");
  if (r >= 60 && o.length > 80) {
    const a = Math.min(r - 39, o.length - 79);
    o = "…" + o.substring(a), r -= a - 1;
  }
  if (o.length > 80 && (o = o.substring(0, 79) + "…"), n > 1 && /^ *$/.test(o.substring(0, r))) {
    let a = s.substring(e.lineStarts[n - 2], e.lineStarts[n - 1]);
    a.length > 80 && (a = a.substring(0, 79) + `…
`), o = a + o;
  }
  if (/[^ ]/.test(o)) {
    let a = 1;
    const l = t.linePos[1];
    l && l.line === n && l.col > i && (a = Math.max(1, Math.min(l.col - i, 80 - r)));
    const c = " ".repeat(r) + "^".repeat(a);
    t.message += `:

${o}
${c}
`;
  }
};
function ce(s, { flow: e, indicator: t, next: n, offset: i, onError: r, parentIndent: o, startOnNewline: a }) {
  let l = !1, c = a, d = a, f = "", p = "", h = !1, g = !1, u = null, m = null, b = null, S = null, _ = null, w = null, k = null;
  for (const y of s)
    switch (g && (y.type !== "space" && y.type !== "newline" && y.type !== "comma" && r(y.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), g = !1), u && (c && y.type !== "comment" && y.type !== "newline" && r(u, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), u = null), y.type) {
      case "space":
        !e && (t !== "doc-start" || (n == null ? void 0 : n.type) !== "flow-collection") && y.source.includes("	") && (u = y), d = !0;
        break;
      case "comment": {
        d || r(y, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
        const L = y.source.substring(1) || " ";
        f ? f += p + L : f = L, p = "", c = !1;
        break;
      }
      case "newline":
        c ? f ? f += y.source : (!w || t !== "seq-item-ind") && (l = !0) : p += y.source, c = !0, h = !0, (m || b) && (S = y), d = !0;
        break;
      case "anchor":
        m && r(y, "MULTIPLE_ANCHORS", "A node can have at most one anchor"), y.source.endsWith(":") && r(y.offset + y.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", !0), m = y, k === null && (k = y.offset), c = !1, d = !1, g = !0;
        break;
      case "tag": {
        b && r(y, "MULTIPLE_TAGS", "A node can have at most one tag"), b = y, k === null && (k = y.offset), c = !1, d = !1, g = !0;
        break;
      }
      case t:
        (m || b) && r(y, "BAD_PROP_ORDER", `Anchors and tags must be after the ${y.source} indicator`), w && r(y, "UNEXPECTED_TOKEN", `Unexpected ${y.source} in ${e ?? "collection"}`), w = y, c = t === "seq-item-ind" || t === "explicit-key-ind", d = !1;
        break;
      case "comma":
        if (e) {
          _ && r(y, "UNEXPECTED_TOKEN", `Unexpected , in ${e}`), _ = y, c = !1, d = !1;
          break;
        }
      // else fallthrough
      default:
        r(y, "UNEXPECTED_TOKEN", `Unexpected ${y.type} token`), c = !1, d = !1;
    }
  const N = s[s.length - 1], T = N ? N.offset + N.source.length : i;
  return g && n && n.type !== "space" && n.type !== "newline" && n.type !== "comma" && (n.type !== "scalar" || n.source !== "") && r(n.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), u && (c && u.indent <= o || (n == null ? void 0 : n.type) === "block-map" || (n == null ? void 0 : n.type) === "block-seq") && r(u, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), {
    comma: _,
    found: w,
    spaceBefore: l,
    comment: f,
    hasNewline: h,
    anchor: m,
    tag: b,
    newlineAfterProp: S,
    end: T,
    start: k ?? T
  };
}
function ke(s) {
  if (!s)
    return null;
  switch (s.type) {
    case "alias":
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      if (s.source.includes(`
`))
        return !0;
      if (s.end) {
        for (const e of s.end)
          if (e.type === "newline")
            return !0;
      }
      return !1;
    case "flow-collection":
      for (const e of s.items) {
        for (const t of e.start)
          if (t.type === "newline")
            return !0;
        if (e.sep) {
          for (const t of e.sep)
            if (t.type === "newline")
              return !0;
        }
        if (ke(e.key) || ke(e.value))
          return !0;
      }
      return !1;
    default:
      return !0;
  }
}
function at(s, e, t) {
  if ((e == null ? void 0 : e.type) === "flow-collection") {
    const n = e.end[0];
    n.indent === s && (n.source === "]" || n.source === "}") && ke(e) && t(n, "BAD_INDENT", "Flow end indicator should be more indented than parent", !0);
  }
}
function bs(s, e, t) {
  const { uniqueKeys: n } = s.options;
  if (n === !1)
    return !1;
  const i = typeof n == "function" ? n : (r, o) => r === o || E(r) && E(o) && r.value === o.value;
  return e.some((r) => i(r.key, t));
}
const Pt = "All mapping items must start at the same column";
function bn({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  var d;
  const o = (r == null ? void 0 : r.nodeClass) ?? j, a = new o(t.schema);
  t.atRoot && (t.atRoot = !1);
  let l = n.offset, c = null;
  for (const f of n.items) {
    const { start: p, key: h, sep: g, value: u } = f, m = ce(p, {
      indicator: "explicit-key-ind",
      next: h ?? (g == null ? void 0 : g[0]),
      offset: l,
      onError: i,
      parentIndent: n.indent,
      startOnNewline: !0
    }), b = !m.found;
    if (b) {
      if (h && (h.type === "block-seq" ? i(l, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key") : "indent" in h && h.indent !== n.indent && i(l, "BAD_INDENT", Pt)), !m.anchor && !m.tag && !g) {
        c = m.end, m.comment && (a.comment ? a.comment += `
` + m.comment : a.comment = m.comment);
        continue;
      }
      (m.newlineAfterProp || ke(h)) && i(h ?? p[p.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
    } else ((d = m.found) == null ? void 0 : d.indent) !== n.indent && i(l, "BAD_INDENT", Pt);
    t.atKey = !0;
    const S = m.end, _ = h ? s(t, h, m, i) : e(t, S, p, null, m, i);
    t.schema.compat && at(n.indent, h, i), t.atKey = !1, bs(t, a.items, _) && i(S, "DUPLICATE_KEY", "Map keys must be unique");
    const w = ce(g ?? [], {
      indicator: "map-value-ind",
      next: u,
      offset: _.range[2],
      onError: i,
      parentIndent: n.indent,
      startOnNewline: !h || h.type === "block-scalar"
    });
    if (l = w.end, w.found) {
      b && ((u == null ? void 0 : u.type) === "block-map" && !w.hasNewline && i(l, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings"), t.options.strict && m.start < w.found.offset - 1024 && i(_.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));
      const k = u ? s(t, u, w, i) : e(t, l, g, null, w, i);
      t.schema.compat && at(n.indent, u, i), l = k.range[2];
      const N = new B(_, k);
      t.options.keepSourceTokens && (N.srcToken = f), a.items.push(N);
    } else {
      b && i(_.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values"), w.comment && (_.comment ? _.comment += `
` + w.comment : _.comment = w.comment);
      const k = new B(_);
      t.options.keepSourceTokens && (k.srcToken = f), a.items.push(k);
    }
  }
  return c && c < l && i(c, "IMPOSSIBLE", "Map comment with trailing content"), a.range = [n.offset, l, c ?? l], a;
}
function wn({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  const o = (r == null ? void 0 : r.nodeClass) ?? z, a = new o(t.schema);
  t.atRoot && (t.atRoot = !1), t.atKey && (t.atKey = !1);
  let l = n.offset, c = null;
  for (const { start: d, value: f } of n.items) {
    const p = ce(d, {
      indicator: "seq-item-ind",
      next: f,
      offset: l,
      onError: i,
      parentIndent: n.indent,
      startOnNewline: !0
    });
    if (!p.found)
      if (p.anchor || p.tag || f)
        f && f.type === "block-seq" ? i(p.end, "BAD_INDENT", "All sequence items must start at the same column") : i(l, "MISSING_CHAR", "Sequence item without - indicator");
      else {
        c = p.end, p.comment && (a.comment = p.comment);
        continue;
      }
    const h = f ? s(t, f, p, i) : e(t, p.end, d, null, p, i);
    t.schema.compat && at(n.indent, f, i), l = h.range[2], a.items.push(h);
  }
  return a.range = [n.offset, l, c ?? l], a;
}
function Te(s, e, t, n) {
  let i = "";
  if (s) {
    let r = !1, o = "";
    for (const a of s) {
      const { source: l, type: c } = a;
      switch (c) {
        case "space":
          r = !0;
          break;
        case "comment": {
          t && !r && n(a, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const d = l.substring(1) || " ";
          i ? i += o + d : i = d, o = "";
          break;
        }
        case "newline":
          i && (o += l), r = !0;
          break;
        default:
          n(a, "UNEXPECTED_TOKEN", `Unexpected ${c} at node end`);
      }
      e += l.length;
    }
  }
  return { comment: i, offset: e };
}
const ze = "Block collections are not allowed within flow collections", Ze = (s) => s && (s.type === "block-map" || s.type === "block-seq");
function Sn({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  const o = n.start.source === "{", a = o ? "flow map" : "flow sequence", l = (r == null ? void 0 : r.nodeClass) ?? (o ? j : z), c = new l(t.schema);
  c.flow = !0;
  const d = t.atRoot;
  d && (t.atRoot = !1), t.atKey && (t.atKey = !1);
  let f = n.offset + n.start.source.length;
  for (let m = 0; m < n.items.length; ++m) {
    const b = n.items[m], { start: S, key: _, sep: w, value: k } = b, N = ce(S, {
      flow: a,
      indicator: "explicit-key-ind",
      next: _ ?? (w == null ? void 0 : w[0]),
      offset: f,
      onError: i,
      parentIndent: n.indent,
      startOnNewline: !1
    });
    if (!N.found) {
      if (!N.anchor && !N.tag && !w && !k) {
        m === 0 && N.comma ? i(N.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${a}`) : m < n.items.length - 1 && i(N.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${a}`), N.comment && (c.comment ? c.comment += `
` + N.comment : c.comment = N.comment), f = N.end;
        continue;
      }
      !o && t.options.strict && ke(_) && i(
        _,
        // checked by containsNewline()
        "MULTILINE_IMPLICIT_KEY",
        "Implicit keys of flow sequence pairs need to be on a single line"
      );
    }
    if (m === 0)
      N.comma && i(N.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${a}`);
    else if (N.comma || i(N.start, "MISSING_CHAR", `Missing , between ${a} items`), N.comment) {
      let T = "";
      e: for (const y of S)
        switch (y.type) {
          case "comma":
          case "space":
            break;
          case "comment":
            T = y.source.substring(1);
            break e;
          default:
            break e;
        }
      if (T) {
        let y = c.items[c.items.length - 1];
        I(y) && (y = y.value ?? y.key), y.comment ? y.comment += `
` + T : y.comment = T, N.comment = N.comment.substring(T.length + 1);
      }
    }
    if (!o && !w && !N.found) {
      const T = k ? s(t, k, N, i) : e(t, N.end, w, null, N, i);
      c.items.push(T), f = T.range[2], Ze(k) && i(T.range, "BLOCK_IN_FLOW", ze);
    } else {
      t.atKey = !0;
      const T = N.end, y = _ ? s(t, _, N, i) : e(t, T, S, null, N, i);
      Ze(_) && i(y.range, "BLOCK_IN_FLOW", ze), t.atKey = !1;
      const L = ce(w ?? [], {
        flow: a,
        indicator: "map-value-ind",
        next: k,
        offset: y.range[2],
        onError: i,
        parentIndent: n.indent,
        startOnNewline: !1
      });
      if (L.found) {
        if (!o && !N.found && t.options.strict) {
          if (w)
            for (const $ of w) {
              if ($ === L.found)
                break;
              if ($.type === "newline") {
                i($, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                break;
              }
            }
          N.start < L.found.offset - 1024 && i(L.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
        }
      } else k && ("source" in k && k.source && k.source[0] === ":" ? i(k, "MISSING_CHAR", `Missing space after : in ${a}`) : i(L.start, "MISSING_CHAR", `Missing , or : between ${a} items`));
      const J = k ? s(t, k, L, i) : L.found ? e(t, L.end, w, null, L, i) : null;
      J ? Ze(k) && i(J.range, "BLOCK_IN_FLOW", ze) : L.comment && (y.comment ? y.comment += `
` + L.comment : y.comment = L.comment);
      const Z = new B(y, J);
      if (t.options.keepSourceTokens && (Z.srcToken = b), o) {
        const $ = c;
        bs(t, $.items, y) && i(T, "DUPLICATE_KEY", "Map keys must be unique"), $.items.push(Z);
      } else {
        const $ = new j(t.schema);
        $.flow = !0, $.items.push(Z);
        const Ot = (J ?? y).range;
        $.range = [y.range[0], Ot[1], Ot[2]], c.items.push($);
      }
      f = J ? J.range[2] : L.end;
    }
  }
  const p = o ? "}" : "]", [h, ...g] = n.end;
  let u = f;
  if (h && h.source === p)
    u = h.offset + h.source.length;
  else {
    const m = a[0].toUpperCase() + a.substring(1), b = d ? `${m} must end with a ${p}` : `${m} in block collection must be sufficiently indented and end with a ${p}`;
    i(f, d ? "MISSING_CHAR" : "BAD_INDENT", b), h && h.source.length !== 1 && g.unshift(h);
  }
  if (g.length > 0) {
    const m = Te(g, u, t.options.strict, i);
    m.comment && (c.comment ? c.comment += `
` + m.comment : c.comment = m.comment), c.range = [n.offset, u, m.offset];
  } else
    c.range = [n.offset, u, u];
  return c;
}
function xe(s, e, t, n, i, r) {
  const o = t.type === "block-map" ? bn(s, e, t, n, r) : t.type === "block-seq" ? wn(s, e, t, n, r) : Sn(s, e, t, n, r), a = o.constructor;
  return i === "!" || i === a.tagName ? (o.tag = a.tagName, o) : (i && (o.tag = i), o);
}
function kn(s, e, t, n, i) {
  var p;
  const r = n.tag, o = r ? e.directives.tagName(r.source, (h) => i(r, "TAG_RESOLVE_FAILED", h)) : null;
  if (t.type === "block-seq") {
    const { anchor: h, newlineAfterProp: g } = n, u = h && r ? h.offset > r.offset ? h : r : h ?? r;
    u && (!g || g.offset < u.offset) && i(u, "MISSING_CHAR", "Missing newline after block sequence props");
  }
  const a = t.type === "block-map" ? "map" : t.type === "block-seq" ? "seq" : t.start.source === "{" ? "map" : "seq";
  if (!r || !o || o === "!" || o === j.tagName && a === "map" || o === z.tagName && a === "seq")
    return xe(s, e, t, i, o);
  let l = e.schema.tags.find((h) => h.tag === o && h.collection === a);
  if (!l) {
    const h = e.schema.knownTags[o];
    if (h && h.collection === a)
      e.schema.tags.push(Object.assign({}, h, { default: !1 })), l = h;
    else
      return h ? i(r, "BAD_COLLECTION_TYPE", `${h.tag} used for ${a} collection, but expects ${h.collection ?? "scalar"}`, !0) : i(r, "TAG_RESOLVE_FAILED", `Unresolved tag: ${o}`, !0), xe(s, e, t, i, o);
  }
  const c = xe(s, e, t, i, o, l), d = ((p = l.resolve) == null ? void 0 : p.call(l, c, (h) => i(r, "TAG_RESOLVE_FAILED", h), e.options)) ?? c, f = A(d) ? d : new O(d);
  return f.range = c.range, f.tag = o, l != null && l.format && (f.format = l.format), f;
}
function _n(s, e, t) {
  const n = e.offset, i = Nn(e, s.options.strict, t);
  if (!i)
    return { value: "", type: null, comment: "", range: [n, n, n] };
  const r = i.mode === ">" ? O.BLOCK_FOLDED : O.BLOCK_LITERAL, o = e.source ? On(e.source) : [];
  let a = o.length;
  for (let u = o.length - 1; u >= 0; --u) {
    const m = o[u][1];
    if (m === "" || m === "\r")
      a = u;
    else
      break;
  }
  if (a === 0) {
    const u = i.chomp === "+" && o.length > 0 ? `
`.repeat(Math.max(1, o.length - 1)) : "";
    let m = n + i.length;
    return e.source && (m += e.source.length), { value: u, type: r, comment: i.comment, range: [n, m, m] };
  }
  let l = e.indent + i.indent, c = e.offset + i.length, d = 0;
  for (let u = 0; u < a; ++u) {
    const [m, b] = o[u];
    if (b === "" || b === "\r")
      i.indent === 0 && m.length > l && (l = m.length);
    else {
      m.length < l && t(c + m.length, "MISSING_CHAR", "Block scalars with more-indented leading empty lines must use an explicit indentation indicator"), i.indent === 0 && (l = m.length), d = u, l === 0 && !s.atRoot && t(c, "BAD_INDENT", "Block scalar values in collections must be indented");
      break;
    }
    c += m.length + b.length + 1;
  }
  for (let u = o.length - 1; u >= a; --u)
    o[u][0].length > l && (a = u + 1);
  let f = "", p = "", h = !1;
  for (let u = 0; u < d; ++u)
    f += o[u][0].slice(l) + `
`;
  for (let u = d; u < a; ++u) {
    let [m, b] = o[u];
    c += m.length + b.length + 1;
    const S = b[b.length - 1] === "\r";
    if (S && (b = b.slice(0, -1)), b && m.length < l) {
      const w = `Block scalar lines must not be less indented than their ${i.indent ? "explicit indentation indicator" : "first line"}`;
      t(c - b.length - (S ? 2 : 1), "BAD_INDENT", w), m = "";
    }
    r === O.BLOCK_LITERAL ? (f += p + m.slice(l) + b, p = `
`) : m.length > l || b[0] === "	" ? (p === " " ? p = `
` : !h && p === `
` && (p = `

`), f += p + m.slice(l) + b, p = `
`, h = !0) : b === "" ? p === `
` ? f += `
` : p = `
` : (f += p + b, p = " ", h = !1);
  }
  switch (i.chomp) {
    case "-":
      break;
    case "+":
      for (let u = a; u < o.length; ++u)
        f += `
` + o[u][0].slice(l);
      f[f.length - 1] !== `
` && (f += `
`);
      break;
    default:
      f += `
`;
  }
  const g = n + i.length + e.source.length;
  return { value: f, type: r, comment: i.comment, range: [n, g, g] };
}
function Nn({ offset: s, props: e }, t, n) {
  if (e[0].type !== "block-scalar-header")
    return n(e[0], "IMPOSSIBLE", "Block scalar header not found"), null;
  const { source: i } = e[0], r = i[0];
  let o = 0, a = "", l = -1;
  for (let p = 1; p < i.length; ++p) {
    const h = i[p];
    if (!a && (h === "-" || h === "+"))
      a = h;
    else {
      const g = Number(h);
      !o && g ? o = g : l === -1 && (l = s + p);
    }
  }
  l !== -1 && n(l, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${i}`);
  let c = !1, d = "", f = i.length;
  for (let p = 1; p < e.length; ++p) {
    const h = e[p];
    switch (h.type) {
      case "space":
        c = !0;
      // fallthrough
      case "newline":
        f += h.source.length;
        break;
      case "comment":
        t && !c && n(h, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters"), f += h.source.length, d = h.source.substring(1);
        break;
      case "error":
        n(h, "UNEXPECTED_TOKEN", h.message), f += h.source.length;
        break;
      /* istanbul ignore next should not happen */
      default: {
        const g = `Unexpected token in block scalar header: ${h.type}`;
        n(h, "UNEXPECTED_TOKEN", g);
        const u = h.source;
        u && typeof u == "string" && (f += u.length);
      }
    }
  }
  return { mode: r, indent: o, chomp: a, comment: d, length: f };
}
function On(s) {
  const e = s.split(/\n( *)/), t = e[0], n = t.match(/^( *)/), r = [n != null && n[1] ? [n[1], t.slice(n[1].length)] : ["", t]];
  for (let o = 1; o < e.length; o += 2)
    r.push([e[o], e[o + 1]]);
  return r;
}
function Tn(s, e, t) {
  const { offset: n, type: i, source: r, end: o } = s;
  let a, l;
  const c = (p, h, g) => t(n + p, h, g);
  switch (i) {
    case "scalar":
      a = O.PLAIN, l = En(r, c);
      break;
    case "single-quoted-scalar":
      a = O.QUOTE_SINGLE, l = Cn(r, c);
      break;
    case "double-quoted-scalar":
      a = O.QUOTE_DOUBLE, l = An(r, c);
      break;
    /* istanbul ignore next should not happen */
    default:
      return t(s, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${i}`), {
        value: "",
        type: null,
        comment: "",
        range: [n, n + r.length, n + r.length]
      };
  }
  const d = n + r.length, f = Te(o, d, e, t);
  return {
    value: l,
    type: a,
    comment: f.comment,
    range: [n, d, f.offset]
  };
}
function En(s, e) {
  let t = "";
  switch (s[0]) {
    /* istanbul ignore next should not happen */
    case "	":
      t = "a tab character";
      break;
    case ",":
      t = "flow indicator character ,";
      break;
    case "%":
      t = "directive indicator character %";
      break;
    case "|":
    case ">": {
      t = `block scalar indicator ${s[0]}`;
      break;
    }
    case "@":
    case "`": {
      t = `reserved character ${s[0]}`;
      break;
    }
  }
  return t && e(0, "BAD_SCALAR_START", `Plain value cannot start with ${t}`), ws(s);
}
function Cn(s, e) {
  return (s[s.length - 1] !== "'" || s.length === 1) && e(s.length, "MISSING_CHAR", "Missing closing 'quote"), ws(s.slice(1, -1)).replace(/''/g, "'");
}
function ws(s) {
  let e, t;
  try {
    e = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy"), t = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
  } catch {
    e = /(.*?)[ \t]*\r?\n/sy, t = /[ \t]*(.*?)[ \t]*\r?\n/sy;
  }
  let n = e.exec(s);
  if (!n)
    return s;
  let i = n[1], r = " ", o = e.lastIndex;
  for (t.lastIndex = o; n = t.exec(s); )
    n[1] === "" ? r === `
` ? i += r : r = `
` : (i += r + n[1], r = " "), o = t.lastIndex;
  const a = /[ \t]*(.*)/sy;
  return a.lastIndex = o, n = a.exec(s), i + r + ((n == null ? void 0 : n[1]) ?? "");
}
function An(s, e) {
  let t = "";
  for (let n = 1; n < s.length - 1; ++n) {
    const i = s[n];
    if (!(i === "\r" && s[n + 1] === `
`))
      if (i === `
`) {
        const { fold: r, offset: o } = In(s, n);
        t += r, n = o;
      } else if (i === "\\") {
        let r = s[++n];
        const o = Ln[r];
        if (o)
          t += o;
        else if (r === `
`)
          for (r = s[n + 1]; r === " " || r === "	"; )
            r = s[++n + 1];
        else if (r === "\r" && s[n + 1] === `
`)
          for (r = s[++n + 1]; r === " " || r === "	"; )
            r = s[++n + 1];
        else if (r === "x" || r === "u" || r === "U") {
          const a = { x: 2, u: 4, U: 8 }[r];
          t += $n(s, n + 1, a, e), n += a;
        } else {
          const a = s.substr(n - 1, 2);
          e(n - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${a}`), t += a;
        }
      } else if (i === " " || i === "	") {
        const r = n;
        let o = s[n + 1];
        for (; o === " " || o === "	"; )
          o = s[++n + 1];
        o !== `
` && !(o === "\r" && s[n + 2] === `
`) && (t += n > r ? s.slice(r, n + 1) : i);
      } else
        t += i;
  }
  return (s[s.length - 1] !== '"' || s.length === 1) && e(s.length, "MISSING_CHAR", 'Missing closing "quote'), t;
}
function In(s, e) {
  let t = "", n = s[e + 1];
  for (; (n === " " || n === "	" || n === `
` || n === "\r") && !(n === "\r" && s[e + 2] !== `
`); )
    n === `
` && (t += `
`), e += 1, n = s[e + 1];
  return t || (t = " "), { fold: t, offset: e };
}
const Ln = {
  0: "\0",
  // null character
  a: "\x07",
  // bell character
  b: "\b",
  // backspace
  e: "\x1B",
  // escape character
  f: "\f",
  // form feed
  n: `
`,
  // line feed
  r: "\r",
  // carriage return
  t: "	",
  // horizontal tab
  v: "\v",
  // vertical tab
  N: "",
  // Unicode next line
  _: " ",
  // Unicode non-breaking space
  L: "\u2028",
  // Unicode line separator
  P: "\u2029",
  // Unicode paragraph separator
  " ": " ",
  '"': '"',
  "/": "/",
  "\\": "\\",
  "	": "	"
};
function $n(s, e, t, n) {
  const i = s.substr(e, t), o = i.length === t && /^[0-9a-fA-F]+$/.test(i) ? parseInt(i, 16) : NaN;
  if (isNaN(o)) {
    const a = s.substr(e - 2, t + 2);
    return n(e - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${a}`), a;
  }
  return String.fromCodePoint(o);
}
function Ss(s, e, t, n) {
  const { value: i, type: r, comment: o, range: a } = e.type === "block-scalar" ? _n(s, e, n) : Tn(e, s.options.strict, n), l = t ? s.directives.tagName(t.source, (f) => n(t, "TAG_RESOLVE_FAILED", f)) : null;
  let c;
  s.options.stringKeys && s.atKey ? c = s.schema[U] : l ? c = vn(s.schema, i, l, t, n) : e.type === "scalar" ? c = Mn(s, i, e, n) : c = s.schema[U];
  let d;
  try {
    const f = c.resolve(i, (p) => n(t ?? e, "TAG_RESOLVE_FAILED", p), s.options);
    d = E(f) ? f : new O(f);
  } catch (f) {
    const p = f instanceof Error ? f.message : String(f);
    n(t ?? e, "TAG_RESOLVE_FAILED", p), d = new O(i);
  }
  return d.range = a, d.source = i, r && (d.type = r), l && (d.tag = l), c.format && (d.format = c.format), o && (d.comment = o), d;
}
function vn(s, e, t, n, i) {
  var a;
  if (t === "!")
    return s[U];
  const r = [];
  for (const l of s.tags)
    if (!l.collection && l.tag === t)
      if (l.default && l.test)
        r.push(l);
      else
        return l;
  for (const l of r)
    if ((a = l.test) != null && a.test(e))
      return l;
  const o = s.knownTags[t];
  return o && !o.collection ? (s.tags.push(Object.assign({}, o, { default: !1, test: void 0 })), o) : (i(n, "TAG_RESOLVE_FAILED", `Unresolved tag: ${t}`, t !== "tag:yaml.org,2002:str"), s[U]);
}
function Mn({ atKey: s, directives: e, schema: t }, n, i, r) {
  const o = t.tags.find((a) => {
    var l;
    return (a.default === !0 || s && a.default === "key") && ((l = a.test) == null ? void 0 : l.test(n));
  }) || t[U];
  if (t.compat) {
    const a = t.compat.find((l) => {
      var c;
      return l.default && ((c = l.test) == null ? void 0 : c.test(n));
    }) ?? t[U];
    if (o.tag !== a.tag) {
      const l = e.tagString(o.tag), c = e.tagString(a.tag), d = `Value may be parsed as either ${l} or ${c}`;
      r(i, "TAG_RESOLVE_FAILED", d, !0);
    }
  }
  return o;
}
function Bn(s, e, t) {
  if (e) {
    t === null && (t = e.length);
    for (let n = t - 1; n >= 0; --n) {
      let i = e[n];
      switch (i.type) {
        case "space":
        case "comment":
        case "newline":
          s -= i.source.length;
          continue;
      }
      for (i = e[++n]; (i == null ? void 0 : i.type) === "space"; )
        s += i.source.length, i = e[++n];
      break;
    }
  }
  return s;
}
const jn = { composeNode: ks, composeEmptyNode: Nt };
function ks(s, e, t, n) {
  const i = s.atKey, { spaceBefore: r, comment: o, anchor: a, tag: l } = t;
  let c, d = !0;
  switch (e.type) {
    case "alias":
      c = Kn(s, e, n), (a || l) && n(e, "ALIAS_PROPS", "An alias node must not specify any properties");
      break;
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "block-scalar":
      c = Ss(s, e, l, n), a && (c.anchor = a.source.substring(1));
      break;
    case "block-map":
    case "block-seq":
    case "flow-collection":
      c = kn(jn, s, e, t, n), a && (c.anchor = a.source.substring(1));
      break;
    default: {
      const f = e.type === "error" ? e.message : `Unsupported token (type: ${e.type})`;
      n(e, "UNEXPECTED_TOKEN", f), c = Nt(s, e.offset, void 0, null, t, n), d = !1;
    }
  }
  return a && c.anchor === "" && n(a, "BAD_ALIAS", "Anchor cannot be an empty string"), i && s.options.stringKeys && (!E(c) || typeof c.value != "string" || c.tag && c.tag !== "tag:yaml.org,2002:str") && n(l ?? e, "NON_STRING_KEY", "With stringKeys, all keys must be strings"), r && (c.spaceBefore = !0), o && (e.type === "scalar" && e.source === "" ? c.comment = o : c.commentBefore = o), s.options.keepSourceTokens && d && (c.srcToken = e), c;
}
function Nt(s, e, t, n, { spaceBefore: i, comment: r, anchor: o, tag: a, end: l }, c) {
  const d = {
    type: "scalar",
    offset: Bn(e, t, n),
    indent: -1,
    source: ""
  }, f = Ss(s, d, a, c);
  return o && (f.anchor = o.source.substring(1), f.anchor === "" && c(o, "BAD_ALIAS", "Anchor cannot be an empty string")), i && (f.spaceBefore = !0), r && (f.comment = r, f.range[2] = l), f;
}
function Kn({ options: s }, { offset: e, source: t, end: n }, i) {
  const r = new ut(t.substring(1));
  r.source === "" && i(e, "BAD_ALIAS", "Alias cannot be an empty string"), r.source.endsWith(":") && i(e + t.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", !0);
  const o = e + t.length, a = Te(n, o, s.strict, i);
  return r.range = [e, o, a.offset], a.comment && (r.comment = a.comment), r;
}
function Pn(s, e, { offset: t, start: n, value: i, end: r }, o) {
  const a = Object.assign({ _directives: e }, s), l = new Ge(void 0, a), c = {
    atKey: !1,
    atRoot: !0,
    directives: l.directives,
    options: l.options,
    schema: l.schema
  }, d = ce(n, {
    indicator: "doc-start",
    next: i ?? (r == null ? void 0 : r[0]),
    offset: t,
    onError: o,
    parentIndent: 0,
    startOnNewline: !0
  });
  d.found && (l.directives.docStart = !0, i && (i.type === "block-map" || i.type === "block-seq") && !d.hasNewline && o(d.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker")), l.contents = i ? ks(c, i, d, o) : Nt(c, d.end, n, null, d, o);
  const f = l.contents.range[2], p = Te(r, f, !1, o);
  return p.comment && (l.comment = p.comment), l.range = [t, f, p.offset], l;
}
function pe(s) {
  if (typeof s == "number")
    return [s, s + 1];
  if (Array.isArray(s))
    return s.length === 2 ? s : [s[0], s[1]];
  const { offset: e, source: t } = s;
  return [e, e + (typeof t == "string" ? t.length : 1)];
}
function Dt(s) {
  var i;
  let e = "", t = !1, n = !1;
  for (let r = 0; r < s.length; ++r) {
    const o = s[r];
    switch (o[0]) {
      case "#":
        e += (e === "" ? "" : n ? `

` : `
`) + (o.substring(1) || " "), t = !0, n = !1;
        break;
      case "%":
        ((i = s[r + 1]) == null ? void 0 : i[0]) !== "#" && (r += 1), t = !1;
        break;
      default:
        t || (n = !0), t = !1;
    }
  }
  return { comment: e, afterEmptyLine: n };
}
class Dn {
  constructor(e = {}) {
    this.doc = null, this.atDirectives = !1, this.prelude = [], this.errors = [], this.warnings = [], this.onError = (t, n, i, r) => {
      const o = pe(t);
      r ? this.warnings.push(new yn(o, n, i)) : this.errors.push(new ye(o, n, i));
    }, this.directives = new M({ version: e.version || "1.2" }), this.options = e;
  }
  decorate(e, t) {
    const { comment: n, afterEmptyLine: i } = Dt(this.prelude);
    if (n) {
      const r = e.contents;
      if (t)
        e.comment = e.comment ? `${e.comment}
${n}` : n;
      else if (i || e.directives.docStart || !r)
        e.commentBefore = n;
      else if (C(r) && !r.flow && r.items.length > 0) {
        let o = r.items[0];
        I(o) && (o = o.key);
        const a = o.commentBefore;
        o.commentBefore = a ? `${n}
${a}` : n;
      } else {
        const o = r.commentBefore;
        r.commentBefore = o ? `${n}
${o}` : n;
      }
    }
    t ? (Array.prototype.push.apply(e.errors, this.errors), Array.prototype.push.apply(e.warnings, this.warnings)) : (e.errors = this.errors, e.warnings = this.warnings), this.prelude = [], this.errors = [], this.warnings = [];
  }
  /**
   * Current stream status information.
   *
   * Mostly useful at the end of input for an empty stream.
   */
  streamInfo() {
    return {
      comment: Dt(this.prelude).comment,
      directives: this.directives,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  /**
   * Compose tokens into documents.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *compose(e, t = !1, n = -1) {
    for (const i of e)
      yield* this.next(i);
    yield* this.end(t, n);
  }
  /** Advance the composer by one CST token. */
  *next(e) {
    switch (e.type) {
      case "directive":
        this.directives.add(e.source, (t, n, i) => {
          const r = pe(e);
          r[0] += t, this.onError(r, "BAD_DIRECTIVE", n, i);
        }), this.prelude.push(e.source), this.atDirectives = !0;
        break;
      case "document": {
        const t = Pn(this.options, this.directives, e, this.onError);
        this.atDirectives && !t.directives.docStart && this.onError(e, "MISSING_CHAR", "Missing directives-end/doc-start indicator line"), this.decorate(t, !1), this.doc && (yield this.doc), this.doc = t, this.atDirectives = !1;
        break;
      }
      case "byte-order-mark":
      case "space":
        break;
      case "comment":
      case "newline":
        this.prelude.push(e.source);
        break;
      case "error": {
        const t = e.source ? `${e.message}: ${JSON.stringify(e.source)}` : e.message, n = new ye(pe(e), "UNEXPECTED_TOKEN", t);
        this.atDirectives || !this.doc ? this.errors.push(n) : this.doc.errors.push(n);
        break;
      }
      case "doc-end": {
        if (!this.doc) {
          const n = "Unexpected doc-end without preceding document";
          this.errors.push(new ye(pe(e), "UNEXPECTED_TOKEN", n));
          break;
        }
        this.doc.directives.docEnd = !0;
        const t = Te(e.end, e.offset + e.source.length, this.doc.options.strict, this.onError);
        if (this.decorate(this.doc, !0), t.comment) {
          const n = this.doc.comment;
          this.doc.comment = n ? `${n}
${t.comment}` : t.comment;
        }
        this.doc.range[2] = t.offset;
        break;
      }
      default:
        this.errors.push(new ye(pe(e), "UNEXPECTED_TOKEN", `Unsupported token ${e.type}`));
    }
  }
  /**
   * Call at end of input to yield any remaining document.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *end(e = !1, t = -1) {
    if (this.doc)
      this.decorate(this.doc, !0), yield this.doc, this.doc = null;
    else if (e) {
      const n = Object.assign({ _directives: this.directives }, this.options), i = new Ge(void 0, n);
      this.atDirectives && this.onError(t, "MISSING_CHAR", "Missing directives-end indicator line"), i.range = [0, t, t], this.decorate(i, !1), yield i;
    }
  }
}
const _s = "\uFEFF", Ns = "", Os = "", lt = "";
function qn(s) {
  switch (s) {
    case _s:
      return "byte-order-mark";
    case Ns:
      return "doc-mode";
    case Os:
      return "flow-error-end";
    case lt:
      return "scalar";
    case "---":
      return "doc-start";
    case "...":
      return "doc-end";
    case "":
    case `
`:
    case `\r
`:
      return "newline";
    case "-":
      return "seq-item-ind";
    case "?":
      return "explicit-key-ind";
    case ":":
      return "map-value-ind";
    case "{":
      return "flow-map-start";
    case "}":
      return "flow-map-end";
    case "[":
      return "flow-seq-start";
    case "]":
      return "flow-seq-end";
    case ",":
      return "comma";
  }
  switch (s[0]) {
    case " ":
    case "	":
      return "space";
    case "#":
      return "comment";
    case "%":
      return "directive-line";
    case "*":
      return "alias";
    case "&":
      return "anchor";
    case "!":
      return "tag";
    case "'":
      return "single-quoted-scalar";
    case '"':
      return "double-quoted-scalar";
    case "|":
    case ">":
      return "block-scalar-header";
  }
  return null;
}
function D(s) {
  switch (s) {
    case void 0:
    case " ":
    case `
`:
    case "\r":
    case "	":
      return !0;
    default:
      return !1;
  }
}
const qt = new Set("0123456789ABCDEFabcdef"), Rn = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"), Ie = new Set(",[]{}"), Un = new Set(` ,[]{}
\r	`), et = (s) => !s || Un.has(s);
class Fn {
  constructor() {
    this.atEnd = !1, this.blockScalarIndent = -1, this.blockScalarKeep = !1, this.buffer = "", this.flowKey = !1, this.flowLevel = 0, this.indentNext = 0, this.indentValue = 0, this.lineEndPos = null, this.next = null, this.pos = 0;
  }
  /**
   * Generate YAML tokens from the `source` string. If `incomplete`,
   * a part of the last line may be left as a buffer for the next call.
   *
   * @returns A generator of lexical tokens
   */
  *lex(e, t = !1) {
    if (e) {
      if (typeof e != "string")
        throw TypeError("source is not a string");
      this.buffer = this.buffer ? this.buffer + e : e, this.lineEndPos = null;
    }
    this.atEnd = !t;
    let n = this.next ?? "stream";
    for (; n && (t || this.hasChars(1)); )
      n = yield* this.parseNext(n);
  }
  atLineEnd() {
    let e = this.pos, t = this.buffer[e];
    for (; t === " " || t === "	"; )
      t = this.buffer[++e];
    return !t || t === "#" || t === `
` ? !0 : t === "\r" ? this.buffer[e + 1] === `
` : !1;
  }
  charAt(e) {
    return this.buffer[this.pos + e];
  }
  continueScalar(e) {
    let t = this.buffer[e];
    if (this.indentNext > 0) {
      let n = 0;
      for (; t === " "; )
        t = this.buffer[++n + e];
      if (t === "\r") {
        const i = this.buffer[n + e + 1];
        if (i === `
` || !i && !this.atEnd)
          return e + n + 1;
      }
      return t === `
` || n >= this.indentNext || !t && !this.atEnd ? e + n : -1;
    }
    if (t === "-" || t === ".") {
      const n = this.buffer.substr(e, 3);
      if ((n === "---" || n === "...") && D(this.buffer[e + 3]))
        return -1;
    }
    return e;
  }
  getLine() {
    let e = this.lineEndPos;
    return (typeof e != "number" || e !== -1 && e < this.pos) && (e = this.buffer.indexOf(`
`, this.pos), this.lineEndPos = e), e === -1 ? this.atEnd ? this.buffer.substring(this.pos) : null : (this.buffer[e - 1] === "\r" && (e -= 1), this.buffer.substring(this.pos, e));
  }
  hasChars(e) {
    return this.pos + e <= this.buffer.length;
  }
  setNext(e) {
    return this.buffer = this.buffer.substring(this.pos), this.pos = 0, this.lineEndPos = null, this.next = e, null;
  }
  peek(e) {
    return this.buffer.substr(this.pos, e);
  }
  *parseNext(e) {
    switch (e) {
      case "stream":
        return yield* this.parseStream();
      case "line-start":
        return yield* this.parseLineStart();
      case "block-start":
        return yield* this.parseBlockStart();
      case "doc":
        return yield* this.parseDocument();
      case "flow":
        return yield* this.parseFlowCollection();
      case "quoted-scalar":
        return yield* this.parseQuotedScalar();
      case "block-scalar":
        return yield* this.parseBlockScalar();
      case "plain-scalar":
        return yield* this.parsePlainScalar();
    }
  }
  *parseStream() {
    let e = this.getLine();
    if (e === null)
      return this.setNext("stream");
    if (e[0] === _s && (yield* this.pushCount(1), e = e.substring(1)), e[0] === "%") {
      let t = e.length, n = e.indexOf("#");
      for (; n !== -1; ) {
        const r = e[n - 1];
        if (r === " " || r === "	") {
          t = n - 1;
          break;
        } else
          n = e.indexOf("#", n + 1);
      }
      for (; ; ) {
        const r = e[t - 1];
        if (r === " " || r === "	")
          t -= 1;
        else
          break;
      }
      const i = (yield* this.pushCount(t)) + (yield* this.pushSpaces(!0));
      return yield* this.pushCount(e.length - i), this.pushNewline(), "stream";
    }
    if (this.atLineEnd()) {
      const t = yield* this.pushSpaces(!0);
      return yield* this.pushCount(e.length - t), yield* this.pushNewline(), "stream";
    }
    return yield Ns, yield* this.parseLineStart();
  }
  *parseLineStart() {
    const e = this.charAt(0);
    if (!e && !this.atEnd)
      return this.setNext("line-start");
    if (e === "-" || e === ".") {
      if (!this.atEnd && !this.hasChars(4))
        return this.setNext("line-start");
      const t = this.peek(3);
      if ((t === "---" || t === "...") && D(this.charAt(3)))
        return yield* this.pushCount(3), this.indentValue = 0, this.indentNext = 0, t === "---" ? "doc" : "stream";
    }
    return this.indentValue = yield* this.pushSpaces(!1), this.indentNext > this.indentValue && !D(this.charAt(1)) && (this.indentNext = this.indentValue), yield* this.parseBlockStart();
  }
  *parseBlockStart() {
    const [e, t] = this.peek(2);
    if (!t && !this.atEnd)
      return this.setNext("block-start");
    if ((e === "-" || e === "?" || e === ":") && D(t)) {
      const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
      return this.indentNext = this.indentValue + 1, this.indentValue += n, yield* this.parseBlockStart();
    }
    return "doc";
  }
  *parseDocument() {
    yield* this.pushSpaces(!0);
    const e = this.getLine();
    if (e === null)
      return this.setNext("doc");
    let t = yield* this.pushIndicators();
    switch (e[t]) {
      case "#":
        yield* this.pushCount(e.length - t);
      // fallthrough
      case void 0:
        return yield* this.pushNewline(), yield* this.parseLineStart();
      case "{":
      case "[":
        return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel = 1, "flow";
      case "}":
      case "]":
        return yield* this.pushCount(1), "doc";
      case "*":
        return yield* this.pushUntil(et), "doc";
      case '"':
      case "'":
        return yield* this.parseQuotedScalar();
      case "|":
      case ">":
        return t += yield* this.parseBlockScalarHeader(), t += yield* this.pushSpaces(!0), yield* this.pushCount(e.length - t), yield* this.pushNewline(), yield* this.parseBlockScalar();
      default:
        return yield* this.parsePlainScalar();
    }
  }
  *parseFlowCollection() {
    let e, t, n = -1;
    do
      e = yield* this.pushNewline(), e > 0 ? (t = yield* this.pushSpaces(!1), this.indentValue = n = t) : t = 0, t += yield* this.pushSpaces(!0);
    while (e + t > 0);
    const i = this.getLine();
    if (i === null)
      return this.setNext("flow");
    if ((n !== -1 && n < this.indentNext && i[0] !== "#" || n === 0 && (i.startsWith("---") || i.startsWith("...")) && D(i[3])) && !(n === this.indentNext - 1 && this.flowLevel === 1 && (i[0] === "]" || i[0] === "}")))
      return this.flowLevel = 0, yield Os, yield* this.parseLineStart();
    let r = 0;
    for (; i[r] === ","; )
      r += yield* this.pushCount(1), r += yield* this.pushSpaces(!0), this.flowKey = !1;
    switch (r += yield* this.pushIndicators(), i[r]) {
      case void 0:
        return "flow";
      case "#":
        return yield* this.pushCount(i.length - r), "flow";
      case "{":
      case "[":
        return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel += 1, "flow";
      case "}":
      case "]":
        return yield* this.pushCount(1), this.flowKey = !0, this.flowLevel -= 1, this.flowLevel ? "flow" : "doc";
      case "*":
        return yield* this.pushUntil(et), "flow";
      case '"':
      case "'":
        return this.flowKey = !0, yield* this.parseQuotedScalar();
      case ":": {
        const o = this.charAt(1);
        if (this.flowKey || D(o) || o === ",")
          return this.flowKey = !1, yield* this.pushCount(1), yield* this.pushSpaces(!0), "flow";
      }
      // fallthrough
      default:
        return this.flowKey = !1, yield* this.parsePlainScalar();
    }
  }
  *parseQuotedScalar() {
    const e = this.charAt(0);
    let t = this.buffer.indexOf(e, this.pos + 1);
    if (e === "'")
      for (; t !== -1 && this.buffer[t + 1] === "'"; )
        t = this.buffer.indexOf("'", t + 2);
    else
      for (; t !== -1; ) {
        let r = 0;
        for (; this.buffer[t - 1 - r] === "\\"; )
          r += 1;
        if (r % 2 === 0)
          break;
        t = this.buffer.indexOf('"', t + 1);
      }
    const n = this.buffer.substring(0, t);
    let i = n.indexOf(`
`, this.pos);
    if (i !== -1) {
      for (; i !== -1; ) {
        const r = this.continueScalar(i + 1);
        if (r === -1)
          break;
        i = n.indexOf(`
`, r);
      }
      i !== -1 && (t = i - (n[i - 1] === "\r" ? 2 : 1));
    }
    if (t === -1) {
      if (!this.atEnd)
        return this.setNext("quoted-scalar");
      t = this.buffer.length;
    }
    return yield* this.pushToIndex(t + 1, !1), this.flowLevel ? "flow" : "doc";
  }
  *parseBlockScalarHeader() {
    this.blockScalarIndent = -1, this.blockScalarKeep = !1;
    let e = this.pos;
    for (; ; ) {
      const t = this.buffer[++e];
      if (t === "+")
        this.blockScalarKeep = !0;
      else if (t > "0" && t <= "9")
        this.blockScalarIndent = Number(t) - 1;
      else if (t !== "-")
        break;
    }
    return yield* this.pushUntil((t) => D(t) || t === "#");
  }
  *parseBlockScalar() {
    let e = this.pos - 1, t = 0, n;
    e: for (let r = this.pos; n = this.buffer[r]; ++r)
      switch (n) {
        case " ":
          t += 1;
          break;
        case `
`:
          e = r, t = 0;
          break;
        case "\r": {
          const o = this.buffer[r + 1];
          if (!o && !this.atEnd)
            return this.setNext("block-scalar");
          if (o === `
`)
            break;
        }
        // fallthrough
        default:
          break e;
      }
    if (!n && !this.atEnd)
      return this.setNext("block-scalar");
    if (t >= this.indentNext) {
      this.blockScalarIndent === -1 ? this.indentNext = t : this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
      do {
        const r = this.continueScalar(e + 1);
        if (r === -1)
          break;
        e = this.buffer.indexOf(`
`, r);
      } while (e !== -1);
      if (e === -1) {
        if (!this.atEnd)
          return this.setNext("block-scalar");
        e = this.buffer.length;
      }
    }
    let i = e + 1;
    for (n = this.buffer[i]; n === " "; )
      n = this.buffer[++i];
    if (n === "	") {
      for (; n === "	" || n === " " || n === "\r" || n === `
`; )
        n = this.buffer[++i];
      e = i - 1;
    } else if (!this.blockScalarKeep)
      do {
        let r = e - 1, o = this.buffer[r];
        o === "\r" && (o = this.buffer[--r]);
        const a = r;
        for (; o === " "; )
          o = this.buffer[--r];
        if (o === `
` && r >= this.pos && r + 1 + t > a)
          e = r;
        else
          break;
      } while (!0);
    return yield lt, yield* this.pushToIndex(e + 1, !0), yield* this.parseLineStart();
  }
  *parsePlainScalar() {
    const e = this.flowLevel > 0;
    let t = this.pos - 1, n = this.pos - 1, i;
    for (; i = this.buffer[++n]; )
      if (i === ":") {
        const r = this.buffer[n + 1];
        if (D(r) || e && Ie.has(r))
          break;
        t = n;
      } else if (D(i)) {
        let r = this.buffer[n + 1];
        if (i === "\r" && (r === `
` ? (n += 1, i = `
`, r = this.buffer[n + 1]) : t = n), r === "#" || e && Ie.has(r))
          break;
        if (i === `
`) {
          const o = this.continueScalar(n + 1);
          if (o === -1)
            break;
          n = Math.max(n, o - 2);
        }
      } else {
        if (e && Ie.has(i))
          break;
        t = n;
      }
    return !i && !this.atEnd ? this.setNext("plain-scalar") : (yield lt, yield* this.pushToIndex(t + 1, !0), e ? "flow" : "doc");
  }
  *pushCount(e) {
    return e > 0 ? (yield this.buffer.substr(this.pos, e), this.pos += e, e) : 0;
  }
  *pushToIndex(e, t) {
    const n = this.buffer.slice(this.pos, e);
    return n ? (yield n, this.pos += n.length, n.length) : (t && (yield ""), 0);
  }
  *pushIndicators() {
    switch (this.charAt(0)) {
      case "!":
        return (yield* this.pushTag()) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
      case "&":
        return (yield* this.pushUntil(et)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
      case "-":
      // this is an error
      case "?":
      // this is an error outside flow collections
      case ":": {
        const e = this.flowLevel > 0, t = this.charAt(1);
        if (D(t) || e && Ie.has(t))
          return e ? this.flowKey && (this.flowKey = !1) : this.indentNext = this.indentValue + 1, (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
      }
    }
    return 0;
  }
  *pushTag() {
    if (this.charAt(1) === "<") {
      let e = this.pos + 2, t = this.buffer[e];
      for (; !D(t) && t !== ">"; )
        t = this.buffer[++e];
      return yield* this.pushToIndex(t === ">" ? e + 1 : e, !1);
    } else {
      let e = this.pos + 1, t = this.buffer[e];
      for (; t; )
        if (Rn.has(t))
          t = this.buffer[++e];
        else if (t === "%" && qt.has(this.buffer[e + 1]) && qt.has(this.buffer[e + 2]))
          t = this.buffer[e += 3];
        else
          break;
      return yield* this.pushToIndex(e, !1);
    }
  }
  *pushNewline() {
    const e = this.buffer[this.pos];
    return e === `
` ? yield* this.pushCount(1) : e === "\r" && this.charAt(1) === `
` ? yield* this.pushCount(2) : 0;
  }
  *pushSpaces(e) {
    let t = this.pos - 1, n;
    do
      n = this.buffer[++t];
    while (n === " " || e && n === "	");
    const i = t - this.pos;
    return i > 0 && (yield this.buffer.substr(this.pos, i), this.pos = t), i;
  }
  *pushUntil(e) {
    let t = this.pos, n = this.buffer[t];
    for (; !e(n); )
      n = this.buffer[++t];
    return yield* this.pushToIndex(t, !1);
  }
}
class Vn {
  constructor() {
    this.lineStarts = [], this.addNewLine = (e) => this.lineStarts.push(e), this.linePos = (e) => {
      let t = 0, n = this.lineStarts.length;
      for (; t < n; ) {
        const r = t + n >> 1;
        this.lineStarts[r] < e ? t = r + 1 : n = r;
      }
      if (this.lineStarts[t] === e)
        return { line: t + 1, col: 1 };
      if (t === 0)
        return { line: 0, col: e };
      const i = this.lineStarts[t - 1];
      return { line: t, col: e - i + 1 };
    };
  }
}
function Y(s, e) {
  for (let t = 0; t < s.length; ++t)
    if (s[t].type === e)
      return !0;
  return !1;
}
function Rt(s) {
  for (let e = 0; e < s.length; ++e)
    switch (s[e].type) {
      case "space":
      case "comment":
      case "newline":
        break;
      default:
        return e;
    }
  return -1;
}
function Ts(s) {
  switch (s == null ? void 0 : s.type) {
    case "alias":
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "flow-collection":
      return !0;
    default:
      return !1;
  }
}
function Le(s) {
  switch (s.type) {
    case "document":
      return s.start;
    case "block-map": {
      const e = s.items[s.items.length - 1];
      return e.sep ?? e.start;
    }
    case "block-seq":
      return s.items[s.items.length - 1].start;
    /* istanbul ignore next should not happen */
    default:
      return [];
  }
}
function ee(s) {
  var t;
  if (s.length === 0)
    return [];
  let e = s.length;
  e: for (; --e >= 0; )
    switch (s[e].type) {
      case "doc-start":
      case "explicit-key-ind":
      case "map-value-ind":
      case "seq-item-ind":
      case "newline":
        break e;
    }
  for (; ((t = s[++e]) == null ? void 0 : t.type) === "space"; )
    ;
  return s.splice(e, s.length);
}
function Ut(s) {
  if (s.start.type === "flow-seq-start")
    for (const e of s.items)
      e.sep && !e.value && !Y(e.start, "explicit-key-ind") && !Y(e.sep, "map-value-ind") && (e.key && (e.value = e.key), delete e.key, Ts(e.value) ? e.value.end ? Array.prototype.push.apply(e.value.end, e.sep) : e.value.end = e.sep : Array.prototype.push.apply(e.start, e.sep), delete e.sep);
}
class Jn {
  /**
   * @param onNewLine - If defined, called separately with the start position of
   *   each new line (in `parse()`, including the start of input).
   */
  constructor(e) {
    this.atNewLine = !0, this.atScalar = !1, this.indent = 0, this.offset = 0, this.onKeyLine = !1, this.stack = [], this.source = "", this.type = "", this.lexer = new Fn(), this.onNewLine = e;
  }
  /**
   * Parse `source` as a YAML stream.
   * If `incomplete`, a part of the last line may be left as a buffer for the next call.
   *
   * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
   *
   * @returns A generator of tokens representing each directive, document, and other structure.
   */
  *parse(e, t = !1) {
    this.onNewLine && this.offset === 0 && this.onNewLine(0);
    for (const n of this.lexer.lex(e, t))
      yield* this.next(n);
    t || (yield* this.end());
  }
  /**
   * Advance the parser by the `source` of one lexical token.
   */
  *next(e) {
    if (this.source = e, this.atScalar) {
      this.atScalar = !1, yield* this.step(), this.offset += e.length;
      return;
    }
    const t = qn(e);
    if (t)
      if (t === "scalar")
        this.atNewLine = !1, this.atScalar = !0, this.type = "scalar";
      else {
        switch (this.type = t, yield* this.step(), t) {
          case "newline":
            this.atNewLine = !0, this.indent = 0, this.onNewLine && this.onNewLine(this.offset + e.length);
            break;
          case "space":
            this.atNewLine && e[0] === " " && (this.indent += e.length);
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            this.atNewLine && (this.indent += e.length);
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = !1;
        }
        this.offset += e.length;
      }
    else {
      const n = `Not a YAML token: ${e}`;
      yield* this.pop({ type: "error", offset: this.offset, message: n, source: e }), this.offset += e.length;
    }
  }
  /** Call at end of input to push out any remaining constructions */
  *end() {
    for (; this.stack.length > 0; )
      yield* this.pop();
  }
  get sourceToken() {
    return {
      type: this.type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  *step() {
    const e = this.peek(1);
    if (this.type === "doc-end" && (!e || e.type !== "doc-end")) {
      for (; this.stack.length > 0; )
        yield* this.pop();
      this.stack.push({
        type: "doc-end",
        offset: this.offset,
        source: this.source
      });
      return;
    }
    if (!e)
      return yield* this.stream();
    switch (e.type) {
      case "document":
        return yield* this.document(e);
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return yield* this.scalar(e);
      case "block-scalar":
        return yield* this.blockScalar(e);
      case "block-map":
        return yield* this.blockMap(e);
      case "block-seq":
        return yield* this.blockSequence(e);
      case "flow-collection":
        return yield* this.flowCollection(e);
      case "doc-end":
        return yield* this.documentEnd(e);
    }
    yield* this.pop();
  }
  peek(e) {
    return this.stack[this.stack.length - e];
  }
  *pop(e) {
    const t = e ?? this.stack.pop();
    if (!t)
      yield { type: "error", offset: this.offset, source: "", message: "Tried to pop an empty stack" };
    else if (this.stack.length === 0)
      yield t;
    else {
      const n = this.peek(1);
      switch (t.type === "block-scalar" ? t.indent = "indent" in n ? n.indent : 0 : t.type === "flow-collection" && n.type === "document" && (t.indent = 0), t.type === "flow-collection" && Ut(t), n.type) {
        case "document":
          n.value = t;
          break;
        case "block-scalar":
          n.props.push(t);
          break;
        case "block-map": {
          const i = n.items[n.items.length - 1];
          if (i.value) {
            n.items.push({ start: [], key: t, sep: [] }), this.onKeyLine = !0;
            return;
          } else if (i.sep)
            i.value = t;
          else {
            Object.assign(i, { key: t, sep: [] }), this.onKeyLine = !i.explicitKey;
            return;
          }
          break;
        }
        case "block-seq": {
          const i = n.items[n.items.length - 1];
          i.value ? n.items.push({ start: [], value: t }) : i.value = t;
          break;
        }
        case "flow-collection": {
          const i = n.items[n.items.length - 1];
          !i || i.value ? n.items.push({ start: [], key: t, sep: [] }) : i.sep ? i.value = t : Object.assign(i, { key: t, sep: [] });
          return;
        }
        /* istanbul ignore next should not happen */
        default:
          yield* this.pop(), yield* this.pop(t);
      }
      if ((n.type === "document" || n.type === "block-map" || n.type === "block-seq") && (t.type === "block-map" || t.type === "block-seq")) {
        const i = t.items[t.items.length - 1];
        i && !i.sep && !i.value && i.start.length > 0 && Rt(i.start) === -1 && (t.indent === 0 || i.start.every((r) => r.type !== "comment" || r.indent < t.indent)) && (n.type === "document" ? n.end = i.start : n.items.push({ start: i.start }), t.items.splice(-1, 1));
      }
    }
  }
  *stream() {
    switch (this.type) {
      case "directive-line":
        yield { type: "directive", offset: this.offset, source: this.source };
        return;
      case "byte-order-mark":
      case "space":
      case "comment":
      case "newline":
        yield this.sourceToken;
        return;
      case "doc-mode":
      case "doc-start": {
        const e = {
          type: "document",
          offset: this.offset,
          start: []
        };
        this.type === "doc-start" && e.start.push(this.sourceToken), this.stack.push(e);
        return;
      }
    }
    yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML stream`,
      source: this.source
    };
  }
  *document(e) {
    if (e.value)
      return yield* this.lineEnd(e);
    switch (this.type) {
      case "doc-start": {
        Rt(e.start) !== -1 ? (yield* this.pop(), yield* this.step()) : e.start.push(this.sourceToken);
        return;
      }
      case "anchor":
      case "tag":
      case "space":
      case "comment":
      case "newline":
        e.start.push(this.sourceToken);
        return;
    }
    const t = this.startBlockValue(e);
    t ? this.stack.push(t) : yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML document`,
      source: this.source
    };
  }
  *scalar(e) {
    if (this.type === "map-value-ind") {
      const t = Le(this.peek(2)), n = ee(t);
      let i;
      e.end ? (i = e.end, i.push(this.sourceToken), delete e.end) : i = [this.sourceToken];
      const r = {
        type: "block-map",
        offset: e.offset,
        indent: e.indent,
        items: [{ start: n, key: e, sep: i }]
      };
      this.onKeyLine = !0, this.stack[this.stack.length - 1] = r;
    } else
      yield* this.lineEnd(e);
  }
  *blockScalar(e) {
    switch (this.type) {
      case "space":
      case "comment":
      case "newline":
        e.props.push(this.sourceToken);
        return;
      case "scalar":
        if (e.source = this.source, this.atNewLine = !0, this.indent = 0, this.onNewLine) {
          let t = this.source.indexOf(`
`) + 1;
          for (; t !== 0; )
            this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
        }
        yield* this.pop();
        break;
      /* istanbul ignore next should not happen */
      default:
        yield* this.pop(), yield* this.step();
    }
  }
  *blockMap(e) {
    var n;
    const t = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (this.onKeyLine = !1, t.value) {
          const i = "end" in t.value ? t.value.end : void 0, r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment" ? i == null || i.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
        } else t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (t.value)
          e.items.push({ start: [this.sourceToken] });
        else if (t.sep)
          t.sep.push(this.sourceToken);
        else {
          if (this.atIndentedComment(t.start, e.indent)) {
            const i = e.items[e.items.length - 2], r = (n = i == null ? void 0 : i.value) == null ? void 0 : n.end;
            if (Array.isArray(r)) {
              Array.prototype.push.apply(r, t.start), r.push(this.sourceToken), e.items.pop();
              return;
            }
          }
          t.start.push(this.sourceToken);
        }
        return;
    }
    if (this.indent >= e.indent) {
      const i = !this.onKeyLine && this.indent === e.indent, r = i && (t.sep || t.explicitKey) && this.type !== "seq-item-ind";
      let o = [];
      if (r && t.sep && !t.value) {
        const a = [];
        for (let l = 0; l < t.sep.length; ++l) {
          const c = t.sep[l];
          switch (c.type) {
            case "newline":
              a.push(l);
              break;
            case "space":
              break;
            case "comment":
              c.indent > e.indent && (a.length = 0);
              break;
            default:
              a.length = 0;
          }
        }
        a.length >= 2 && (o = t.sep.splice(a[1]));
      }
      switch (this.type) {
        case "anchor":
        case "tag":
          r || t.value ? (o.push(this.sourceToken), e.items.push({ start: o }), this.onKeyLine = !0) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
          return;
        case "explicit-key-ind":
          !t.sep && !t.explicitKey ? (t.start.push(this.sourceToken), t.explicitKey = !0) : r || t.value ? (o.push(this.sourceToken), e.items.push({ start: o, explicitKey: !0 })) : this.stack.push({
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken], explicitKey: !0 }]
          }), this.onKeyLine = !0;
          return;
        case "map-value-ind":
          if (t.explicitKey)
            if (t.sep)
              if (t.value)
                e.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (Y(t.sep, "map-value-ind"))
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: o, key: null, sep: [this.sourceToken] }]
                });
              else if (Ts(t.key) && !Y(t.sep, "newline")) {
                const a = ee(t.start), l = t.key, c = t.sep;
                c.push(this.sourceToken), delete t.key, delete t.sep, this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: a, key: l, sep: c }]
                });
              } else o.length > 0 ? t.sep = t.sep.concat(o, this.sourceToken) : t.sep.push(this.sourceToken);
            else if (Y(t.start, "newline"))
              Object.assign(t, { key: null, sep: [this.sourceToken] });
            else {
              const a = ee(t.start);
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: a, key: null, sep: [this.sourceToken] }]
              });
            }
          else
            t.sep ? t.value || r ? e.items.push({ start: o, key: null, sep: [this.sourceToken] }) : Y(t.sep, "map-value-ind") ? this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [], key: null, sep: [this.sourceToken] }]
            }) : t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
          this.onKeyLine = !0;
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const a = this.flowScalar(this.type);
          r || t.value ? (e.items.push({ start: o, key: a, sep: [] }), this.onKeyLine = !0) : t.sep ? this.stack.push(a) : (Object.assign(t, { key: a, sep: [] }), this.onKeyLine = !0);
          return;
        }
        default: {
          const a = this.startBlockValue(e);
          if (a) {
            if (a.type === "block-seq") {
              if (!t.explicitKey && t.sep && !Y(t.sep, "newline")) {
                yield* this.pop({
                  type: "error",
                  offset: this.offset,
                  message: "Unexpected block-seq-ind on same line with key",
                  source: this.source
                });
                return;
              }
            } else i && e.items.push({ start: o });
            this.stack.push(a);
            return;
          }
        }
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *blockSequence(e) {
    var n;
    const t = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (t.value) {
          const i = "end" in t.value ? t.value.end : void 0, r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment" ? i == null || i.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
        } else
          t.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (t.value)
          e.items.push({ start: [this.sourceToken] });
        else {
          if (this.atIndentedComment(t.start, e.indent)) {
            const i = e.items[e.items.length - 2], r = (n = i == null ? void 0 : i.value) == null ? void 0 : n.end;
            if (Array.isArray(r)) {
              Array.prototype.push.apply(r, t.start), r.push(this.sourceToken), e.items.pop();
              return;
            }
          }
          t.start.push(this.sourceToken);
        }
        return;
      case "anchor":
      case "tag":
        if (t.value || this.indent <= e.indent)
          break;
        t.start.push(this.sourceToken);
        return;
      case "seq-item-ind":
        if (this.indent !== e.indent)
          break;
        t.value || Y(t.start, "seq-item-ind") ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
        return;
    }
    if (this.indent > e.indent) {
      const i = this.startBlockValue(e);
      if (i) {
        this.stack.push(i);
        return;
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *flowCollection(e) {
    const t = e.items[e.items.length - 1];
    if (this.type === "flow-error-end") {
      let n;
      do
        yield* this.pop(), n = this.peek(1);
      while (n && n.type === "flow-collection");
    } else if (e.end.length === 0) {
      switch (this.type) {
        case "comma":
        case "explicit-key-ind":
          !t || t.sep ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
          return;
        case "map-value-ind":
          !t || t.value ? e.items.push({ start: [], key: null, sep: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
          return;
        case "space":
        case "comment":
        case "newline":
        case "anchor":
        case "tag":
          !t || t.value ? e.items.push({ start: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const i = this.flowScalar(this.type);
          !t || t.value ? e.items.push({ start: [], key: i, sep: [] }) : t.sep ? this.stack.push(i) : Object.assign(t, { key: i, sep: [] });
          return;
        }
        case "flow-map-end":
        case "flow-seq-end":
          e.end.push(this.sourceToken);
          return;
      }
      const n = this.startBlockValue(e);
      n ? this.stack.push(n) : (yield* this.pop(), yield* this.step());
    } else {
      const n = this.peek(2);
      if (n.type === "block-map" && (this.type === "map-value-ind" && n.indent === e.indent || this.type === "newline" && !n.items[n.items.length - 1].sep))
        yield* this.pop(), yield* this.step();
      else if (this.type === "map-value-ind" && n.type !== "flow-collection") {
        const i = Le(n), r = ee(i);
        Ut(e);
        const o = e.end.splice(1, e.end.length);
        o.push(this.sourceToken);
        const a = {
          type: "block-map",
          offset: e.offset,
          indent: e.indent,
          items: [{ start: r, key: e, sep: o }]
        };
        this.onKeyLine = !0, this.stack[this.stack.length - 1] = a;
      } else
        yield* this.lineEnd(e);
    }
  }
  flowScalar(e) {
    if (this.onNewLine) {
      let t = this.source.indexOf(`
`) + 1;
      for (; t !== 0; )
        this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
    }
    return {
      type: e,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  startBlockValue(e) {
    switch (this.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return this.flowScalar(this.type);
      case "block-scalar-header":
        return {
          type: "block-scalar",
          offset: this.offset,
          indent: this.indent,
          props: [this.sourceToken],
          source: ""
        };
      case "flow-map-start":
      case "flow-seq-start":
        return {
          type: "flow-collection",
          offset: this.offset,
          indent: this.indent,
          start: this.sourceToken,
          items: [],
          end: []
        };
      case "seq-item-ind":
        return {
          type: "block-seq",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: [this.sourceToken] }]
        };
      case "explicit-key-ind": {
        this.onKeyLine = !0;
        const t = Le(e), n = ee(t);
        return n.push(this.sourceToken), {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: n, explicitKey: !0 }]
        };
      }
      case "map-value-ind": {
        this.onKeyLine = !0;
        const t = Le(e), n = ee(t);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: n, key: null, sep: [this.sourceToken] }]
        };
      }
    }
    return null;
  }
  atIndentedComment(e, t) {
    return this.type !== "comment" || this.indent <= t ? !1 : e.every((n) => n.type === "newline" || n.type === "space");
  }
  *documentEnd(e) {
    this.type !== "doc-mode" && (e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop()));
  }
  *lineEnd(e) {
    switch (this.type) {
      case "comma":
      case "doc-start":
      case "doc-end":
      case "flow-seq-end":
      case "flow-map-end":
      case "map-value-ind":
        yield* this.pop(), yield* this.step();
        break;
      case "newline":
        this.onKeyLine = !1;
      // fallthrough
      case "space":
      case "comment":
      default:
        e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop());
    }
  }
}
function Yn(s) {
  const e = s.prettyErrors !== !1;
  return { lineCounter: s.lineCounter || e && new Vn() || null, prettyErrors: e };
}
function Gn(s, e = {}) {
  const { lineCounter: t, prettyErrors: n } = Yn(e), i = new Jn(t == null ? void 0 : t.addNewLine), r = new Dn(e);
  let o = null;
  for (const a of r.compose(i.parse(s), !0, s.length))
    if (!o)
      o = a;
    else if (o.options.logLevel !== "silent") {
      o.errors.push(new ye(a.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
      break;
    }
  return n && t && (o.errors.forEach(Kt(s, t)), o.warnings.forEach(Kt(s, t))), o;
}
function Hn(s, e, t) {
  let n;
  const i = Gn(s, t);
  if (!i)
    return null;
  if (i.warnings.forEach((r) => Zt(i.options.logLevel, r)), i.errors.length > 0) {
    if (i.options.logLevel !== "silent")
      throw i.errors[0];
    i.errors = [];
  }
  return i.toJS(Object.assign({ reviver: n }, t));
}
function Qn(s) {
  return Hn(s);
}
const Wn = "0.0.23";
let te = null, tt = {};
const me = (s) => {
  if (te === !0)
    throw new Error(s);
};
(async function() {
  const e = window.loadCardHelpers ? await window.loadCardHelpers() : void 0;
  class t extends HTMLElement {
    constructor() {
      super();
      v(this, "_editMode", !1);
      v(this, "_isConnected", !1);
      v(this, "_config");
      v(this, "_originalConfig");
      v(this, "_hass");
      v(this, "_card");
      v(this, "_shadow");
      v(this, "_inlineTemplates", {});
      v(this, "_templates", {});
      v(this, "_accessedProperties", /* @__PURE__ */ new Set());
      v(this, "_hasJavascriptTemplate", !1);
      v(this, "_pendingUpdates", /* @__PURE__ */ new Set());
      v(this, "_updateScheduled", !1);
      this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    }
    queueUpdate(r) {
      this._pendingUpdates.add(r), this._updateScheduled === !1 && (this._updateScheduled = !0, requestAnimationFrame(() => this.flushUpdates()));
    }
    flushUpdates() {
      this._pendingUpdates.has("config") && this.updateCardConfig(), this._pendingUpdates.has("editMode") && this.updateCardEditMode(), this._pendingUpdates.has("hass") && this.updateCardHass(), this._pendingUpdates.clear(), this._updateScheduled = !1;
    }
    updateCardHass() {
      (this._isConnected && this._card && this._hass || this._card && this._hass && this._card.hass === void 0) && (this._card.hass = this._hass);
    }
    updateCardEditMode() {
      this._isConnected && this._card && (this._card.editMode = this._editMode);
    }
    updateCardConfig() {
      var r, o;
      if (this._isConnected && this._card && this._config) {
        if (this._card.nodeName === "HUI-ERROR-CARD" ? requestAnimationFrame(() => {
          this._shadow.removeChild(this._card), this.createCard(), this._shadow.appendChild(this._card);
        }) : (o = (r = this._card).setConfig) == null || o.call(r, this._config), this.parentNode.config === void 0 || this._config.visibility === void 0)
          return;
        Be(
          this._config.visibility,
          this.parentNode.config.visibility
        ) === !1 && (this.parentNode.config = {
          ...this.parentNode.config,
          visibility: this._config.visibility
        });
      }
    }
    connectedCallback() {
      this._isConnected = !0, this.queueUpdate("config"), this.queueUpdate("editMode"), this.queueUpdate("hass");
    }
    disconnectedCallback() {
      this._isConnected = !1;
    }
    get editMode() {
      return this._editMode;
    }
    set editMode(r) {
      r !== this._editMode && (this._editMode = r, this.queueUpdate("editMode"));
    }
    get hass() {
      return this._hass;
    }
    set hass(r) {
      this._hass = r, this.parseConfig() && this.queueUpdate("config"), this.queueUpdate("hass");
    }
    fetchTemplate(r) {
      return fetch(`${r}?t=${(/* @__PURE__ */ new Date()).getTime()}`).then((o) => o.text()).then((o) => {
        tt = Qn(o), this._templates = { ...tt, ...this._inlineTemplates };
      });
    }
    getTemplates() {
      const r = Vt() || Ft();
      if (!r.config && !r.config.streamline_templates && me(
        "The object streamline_templates doesn't exist in your main lovelace config."
      ), this._inlineTemplates = r.config.streamline_templates, this._templates = { ...tt, ...this._inlineTemplates }, te === null) {
        const o = "streamline-card/streamline_templates.yaml";
        te = this.fetchTemplate(`/hacsfiles/${o}`).catch(() => this.fetchTemplate(`/local/${o}`)).catch(() => this.fetchTemplate(`/local/community/${o}`));
      }
      te instanceof Promise && te.then(() => {
        te = !0, this._card === void 0 && (this.setConfig(this._originalConfig), this.queueUpdate("hass"));
      });
    }
    prepareConfig() {
      if (this.getTemplates(), this._templateConfig = this._templates[this._originalConfig.template], this._templateConfig)
        if (this._templateConfig.card || this._templateConfig.element) {
          if (this._templateConfig.card && this._templateConfig.element)
            return me("You can define a card and an element in the template");
        } else return me(
          "You should define either a card or an element in the template"
        );
      else return me(
        `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`
      );
      this._hasJavascriptTemplate = JSON.stringify(
        this._templateConfig ?? ""
      ).includes("_javascript");
    }
    parseConfig() {
      if (this._templateConfig === void 0)
        return !1;
      const r = this._config ?? {};
      return this._config = js(
        this._templateConfig,
        this._originalConfig.variables,
        {
          hasJavascript: this._hasJavascriptTemplate,
          hass: this._hass
        }
      ), Be(r, this._config) === !1;
    }
    setConfig(r) {
      this._originalConfig = r, this.prepareConfig(), this.parseConfig() !== !1 && (typeof this._card > "u" && (typeof this._config.type > "u" && me("[Streamline Card] You need to define a type"), this.createCard(), this._shadow.appendChild(this._card)), this.queueUpdate("config"));
    }
    getCardSize() {
      var r, o;
      return ((o = (r = this._card) == null ? void 0 : r.getCardSize) == null ? void 0 : o.call(r)) ?? 1;
    }
    /** @deprecated Use `getGridOptions` instead */
    getLayoutOptions() {
      var r, o;
      return ((o = (r = this._card) == null ? void 0 : r.getLayoutOptions) == null ? void 0 : o.call(r)) ?? {};
    }
    getGridOptions() {
      var r, o;
      return ((o = (r = this._card) == null ? void 0 : r.getGridOptions) == null ? void 0 : o.call(r)) ?? {};
    }
    createCard() {
      this._templateConfig.card ? this._card = e.createCardElement(this._config) : this._templateConfig.element && (this._card = e.createHuiElement(this._config), this._config.style && Object.keys(this._config.style).forEach((r) => {
        this.style.setProperty(r, this._config.style[r]);
      })), this._card.getCardSize === void 0 && (this.getCardSize = void 0), this._card.getGridOptions === void 0 && (this.getGridOptions = void 0), this._card.getLayoutOptions === void 0 && (this.getLayoutOptions = void 0);
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
    `%c Streamline Card %c ${Wn}`,
    "background-color:#c2b280;color:#242424;padding:4px 4px 4px 8px;border-radius:20px 0 0 20px;font-family:sans-serif;",
    "background-color:#5297ff;color:#242424;padding:4px 8px 4px 4px;border-radius:0 20px 20px 0;font-family:sans-serif;"
  );
})();
