import "./streamline-card-editor";
import { getLovelace, getLovelaceCast } from "./getLovelace.helper";
import {
  getRemoteTemplates,
  getisTemplateLoaded,
  loadRemoteTemplates,
} from "./templateLoader";
import deepEqual from "./deepEqual-helper";
import evaluateConfig from "./evaluteConfig-helper";
import exampleTile from "./templates/exampleTile";
import { version } from "../package.json";

const thrower = (text) => {
  if (getisTemplateLoaded() === true) {
    throw new Error(text);
  }
};

(async function initializeStreamlineCard() {
  const HELPERS = window.loadCardHelpers
    ? await window.loadCardHelpers()
    : undefined;

  class StreamlineCard extends HTMLElement {
    _editMode = false;
    _isConnected = false;
    _config = undefined;
    _originalConfig = undefined;
    _hass = undefined;
    _card = undefined;
    _shadow;
    _inlineTemplates = {};
    _templates = {};
    _accessedProperties = new Set();
    _hasJavascriptTemplate = false;
    _pendingUpdates = new Set();
    _updateScheduled = false;
    _rafId = null;

    constructor() {
      super();
      this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    }

    queueUpdate(type) {
      this._pendingUpdates.add(type);
      if (this._updateScheduled === false) {
        this._updateScheduled = true;
        this._rafId = requestAnimationFrame(() => this.flushUpdates());
      }
    }

    flushUpdates() {
      this._rafId = null;

      if (this._pendingUpdates.has("config")) {
        this.updateCardConfig();
      }
      if (this._pendingUpdates.has("editMode")) {
        this.updateCardEditMode();
      }
      if (this._pendingUpdates.has("hass")) {
        this.updateCardHass();
      }

      this._pendingUpdates.clear();
      this._updateScheduled = false;
    }

    updateCardHass() {
      if (
        (this._isConnected && this._card && this._hass) ||
        (this._card && this._hass && this._card.hass === undefined)
      ) {
        this._card.hass = this._hass;
      }
    }

    updateCardEditMode() {
      if (this._isConnected && this._card) {
        this._card.editMode = this._editMode;
      }
    }

    updateCardConfig() {
      if (this._isConnected && this._card && this._config) {
        // If the card is errored, try to recreate it
        if (this._card.nodeName === "HUI-ERROR-CARD") {
          requestAnimationFrame(() => {
            this._shadow.removeChild(this._card);
            this.createCard();
            this._shadow.appendChild(this._card);
          });
        } else {
          this._card.setConfig?.(this._config);
        }

        if (
          this.parentNode.config === undefined ||
          this._config.visibility === undefined
        ) {
          return;
        }

        const hasVisibilityChanged =
          deepEqual(
            this._config.visibility,
            this.parentNode.config.visibility,
          ) === false;

        if (hasVisibilityChanged) {
          this.parentNode.config = {
            ...this.parentNode.config,
            visibility: this._config.visibility,
          };
        }
      }
    }

    connectedCallback() {
      this._isConnected = true;
      this.queueUpdate("config");
      this.queueUpdate("editMode");
      this.queueUpdate("hass");
    }

    disconnectedCallback() {
      this._isConnected = false;

      // Cancel any pending animation frame to prevent updates after disconnect
      if (this._rafId !== null) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
        this._updateScheduled = false;
        this._pendingUpdates.clear();
      }
    }

    get editMode() {
      return this._editMode;
    }

    set editMode(editMode) {
      if (editMode !== this._editMode) {
        this._editMode = editMode;
        this.queueUpdate("editMode");
      }
    }

    get hass() {
      return this._hass;
    }

    set hass(hass) {
      this._hass = hass;

      const hasConfigChanged = this.parseConfig();
      if (hasConfigChanged) {
        this.queueUpdate("config");
      }

      this.queueUpdate("hass");
    }
    fetchTemplate(url) {
      return fetch(`${url}?t=${new Date().getTime()}`)
        .then((response) => response.text())
        .then(() => {
          loadRemoteTemplates();
          this._templates = {
            ...exampleTile,
            ...getRemoteTemplates(),
            ...this._inlineTemplates,
          };
        });
    }

    getTemplates() {
      const lovelace = getLovelace() || getLovelaceCast();

      // Inline templates are optional
      const inline =
        (lovelace && lovelace.config && lovelace.config.streamline_templates) ||
        {};
      this._inlineTemplates = inline;

      this._templates = {
        ...exampleTile,
        ...getRemoteTemplates(),
        ...this._inlineTemplates,
      };

      // IMPORTANT: never reassign a loader handle; use a single const
      const loadP = getisTemplateLoaded() ?? loadRemoteTemplates();
      if (loadP instanceof Promise) {
        loadP.then(() => {
          if (this._card === undefined) {
            this.setConfig(this._originalConfig);
            this.queueUpdate("hass");
          }
        });
      }
    }
    prepareConfig() {
      this.getTemplates();
      this._templateConfig = this._templates[this._originalConfig.template];

      if (!this._templateConfig) {
        return thrower(
          `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`,
        );
      } else if (!(this._templateConfig.card || this._templateConfig.element)) {
        return thrower(
          "You should define either a card or an element in the template",
        );
      } else if (this._templateConfig.card && this._templateConfig.element) {
        return thrower("You can define a card and an element in the template");
      }

      this._hasJavascriptTemplate = JSON.stringify(
        this._templateConfig ?? "",
      ).includes("_javascript");

      return undefined;
    }

    parseConfig() {
      if (this._templateConfig === undefined) {
        return false;
      }

      const oldParsedConfig = this._config ?? {};

      this._config = evaluateConfig(
        this._templateConfig,
        this._originalConfig.variables,
        {
          hasJavascript: this._hasJavascriptTemplate,
          hass: this._hass,
        },
      );

      const hasConfigChanged =
        deepEqual(oldParsedConfig, this._config) === false;

      return hasConfigChanged;
    }

    setConfig(config) {
      this._originalConfig = config;
      this.prepareConfig();

      const hasConfigChanged = this.parseConfig();
      if (hasConfigChanged === false) {
        return;
      }

      if (typeof this._card === "undefined") {
        if (typeof this._config.type === "undefined") {
          thrower("[Streamline Card] You need to define a type");
        }
        this.createCard();
        this._shadow.appendChild(this._card);
      }

      this.queueUpdate("config");
    }

    getCardSize() {
      return this._card?.getCardSize?.() ?? 1;
    }

    /** @deprecated Use `getGridOptions` instead */
    getLayoutOptions() {
      return this._card?.getLayoutOptions?.() ?? {};
    }

    getGridOptions() {
      return this._card?.getGridOptions?.() ?? {};
    }

    createCard() {
      if (this._templateConfig.card) {
        this._card = HELPERS.createCardElement(this._config);
      } else if (this._templateConfig.element) {
        this._card = HELPERS.createHuiElement(this._config);
        if (this._config.style) {
          Object.keys(this._config.style).forEach((prop) => {
            this.style.setProperty(prop, this._config.style[prop]);
          });
        }
      }

      if (this._card.getCardSize === undefined) {
        this.getCardSize = undefined;
      }
      if (this._card.getGridOptions === undefined) {
        this.getGridOptions = undefined;
      }
      if (this._card.getLayoutOptions === undefined) {
        this.getLayoutOptions = undefined;
      }
    }

    static getConfigElement() {
      return document.createElement("streamline-card-editor");
    }
  }

  customElements.define("streamline-card", StreamlineCard);

  window.customCards ||= [];
  window.customCards.push({
    description: "A config simplifier.",
    name: "Streamline Card",
    preview: false,
    type: "streamline-card",
  });

  // eslint-disable-next-line no-console
  console.info(
    `%c Streamline Card %c ${version}`,
    "background-color:#c2b280;color:#242424;padding:4px 4px 4px 8px;border-radius:20px 0 0 20px;font-family:sans-serif;",
    "background-color:#5297ff;color:#242424;padding:4px 8px 4px 4px;border-radius:0 20px 20px 0;font-family:sans-serif;",
  );
})();

/* ==========================================================================
 * Streamline-card: consolidated build with variables_meta support
 * ========================================================================== */

(function initStreamlineCardMeta() {
  const waitFor = (cond, { tries = 120, interval = 250 } = {}) =>
    new Promise((resolve, reject) => {
      let remaining = tries;
      const tick = function tick() {
        if (cond()) {
          resolve();
          return;
        }
        remaining -= 1;
        if (remaining <= 0) {
          reject(new Error("streamline-meta: target not found"));
          return;
        }
        setTimeout(tick, interval);
      };
      tick();
    });

  const normalizeVars = (value) => {
    if (!value) {
      return {};
    }
    if (Array.isArray(value)) {
      const result = {};
      for (const entry of value) {
        for (const [key, val] of Object.entries(entry || {})) {
          result[key] = val;
        }
      }
      return result;
    }
    return { ...value };
  };

  const getTemplate = (editor, templateName) => {
    const tpl = editor && editor._templates && editor._templates[templateName];
    if (!tpl) {
      throw new Error(`streamline-meta: template "${templateName}" not found`);
    }
    return tpl;
  };

  const getVariablesMeta = (editor, templateName) => {
    const tpl = getTemplate(editor, templateName);
    return tpl.variables_meta || tpl.variablesMeta || {};
  };

  const inferSelectorFromName = (name) => {
    const lower = String(name).toLowerCase();
    if (lower.includes("entity")) {
      return { entity: {} };
    }
    if (lower.includes("icon")) {
      return { icon: {} };
    }
    if (lower.includes("bool")) {
      return { boolean: {} };
    }
    return { text: {} };
  };

  const buildSchemaFromMeta = (name, metaEntry) => {
    const selector =
      (metaEntry && metaEntry.selector) || inferSelectorFromName(name);
    const schema = { name, selector };
    if (metaEntry && typeof metaEntry.title === "string") {
      schema.title = metaEntry.title;
    }
    if (metaEntry && typeof metaEntry.description === "string") {
      schema.description = metaEntry.description;
    }
    return schema;
  };

  const collectMetaDefaults = (meta) => {
    const result = {};
    for (const [key, val] of Object.entries(meta || {})) {
      if (val && Object.hasOwn(val, "default")) {
        result[key] = val.default;
      }
    }
    return result;
  };

  const mergeDefaults = (existing, metaDefaults) => ({
    ...normalizeVars(existing),
    ...normalizeVars(metaDefaults),
  });

  // --- Patch helpers (small, named) ---

  const patchSetVariablesDefault = function patchSetVariablesDefault(Editor) {
    const original = Editor.prototype.setVariablesDefault;
    if (typeof original !== "function") {
      return;
    }
    Editor.prototype.setVariablesDefault = function setVariablesDefault(
      newConfig,
    ) {
      try {
        const meta = getVariablesMeta(this, newConfig.template);
        const metaDefaults = collectMetaDefaults(meta);
        const cfg = original.call(this, newConfig);
        for (const [key, val] of Object.entries(metaDefaults)) {
          const current = cfg.variables?.[key];
          const isEmptyString = current === "";
          const isUndefined = typeof current === "undefined";
          if (isUndefined || isEmptyString) {
            cfg.variables[key] = val;
          }
        }
        return cfg;
      } catch {
        return original.call(this, newConfig);
      }
    };
  };

  const patchGetVariableSchema = function patchGetVariableSchema(Editor) {
    const original = Editor.getVariableSchema;
    if (typeof original !== "function") {
      return;
    }
    Editor.getVariableSchema = function getVariableSchema(variable) {
      try {
        const activeEditor = [
          ...document.querySelectorAll("streamline-card-editor"),
        ].find((el) => el && el._config && el._templates);

        if (!activeEditor || !activeEditor._config) {
          return original.call(this, variable);
        }
        const tplName = activeEditor._config.template;
        const meta = getVariablesMeta(activeEditor, tplName);
        const metaEntry = meta && meta[variable];
        if (metaEntry) {
          return buildSchemaFromMeta(variable, metaEntry);
        }
        return original.call(this, variable);
      } catch {
        return original.call(this, variable);
      }
    };
  };

  const patchFormatConfig = function patchFormatConfig(Editor) {
    const original = Editor.formatConfig;
    if (typeof original !== "function") {
      return;
    }
    Editor.formatConfig = function formatConfig(config) {
      const newConfig = original.call(this, config);
      try {
        const editor =
          [...document.querySelectorAll("streamline-card-editor")].find(
            (el) => el && el._templates && el._config,
          ) || null;

        if (editor) {
          const tpl = getTemplate(editor, newConfig.template);
          const metaDefaults = collectMetaDefaults(
            getVariablesMeta(editor, newConfig.template),
          );
          if (tpl && (tpl.card || tpl.element)) {
            const mergedDefaults = mergeDefaults(
              tpl.default || {},
              metaDefaults,
            );
            tpl.default = mergedDefaults;
          }
        }
      } catch {
        // Ignore non-fatal errors
      }
      return newConfig;
    };
  };

  // Keep this tiny to satisfy max-lines-per-function.
  const onEditorReady = function onEditorReady() {
    const Editor = customElements.get("streamline-card-editor");
    if (!Editor) {
      return;
    }
    patchSetVariablesDefault(Editor);
    patchGetVariableSchema(Editor);
    patchFormatConfig(Editor);

    /* eslint-disable no-console */
    console.info(
      "%cstreamline-card (consolidated)%c • variables_meta enabled",
      "font-weight:bold",
      "font-weight:normal",
    );
    /* eslint-enable no-console */
  };

  waitFor(() => Boolean(customElements.get("streamline-card-editor")))
    .then(onEditorReady)
    .catch((err) => {
      /* eslint-disable no-console */
      console.warn(
        "streamline-meta: initialization failed:",
        (err && err.message) || err,
      );
      /* eslint-enable no-console */
    });
})();

export {};
