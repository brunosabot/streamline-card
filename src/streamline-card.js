import "./streamline-card-editor";
import { getLovelace, getLovelaceCast } from "./getLovelace.helper";
import deepEqual from "./deepEqual-helper";
import evaluateConfig from "./evaluteConfig-helper";
import evaluateYaml from "./evaluateYaml";
import exampleTile from "./templates/exampleTile";
import { version } from "../package.json";

let isTemplateLoaded = null;
let remoteTemplates = {};

const thrower = (text) => {
  if (isTemplateLoaded === true) {
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
        .then((text) => {
          remoteTemplates = evaluateYaml(text);
          this._templates = {
            ...exampleTile,
            ...remoteTemplates,
            ...this._inlineTemplates,
          };
        });
    }

    getTemplates() {
      const lovelace = getLovelace() || getLovelaceCast();
      if (!lovelace.config && !lovelace.config.streamline_templates) {
        thrower(
          "The object streamline_templates doesn't exist in your main lovelace config.",
        );
      }

      this._inlineTemplates = lovelace.config.streamline_templates;
      this._templates = {
        ...exampleTile,
        ...remoteTemplates,
        ...this._inlineTemplates,
      };

      if (isTemplateLoaded === null) {
        const filename = "streamline-card/streamline_templates.yaml";
        isTemplateLoaded = this.fetchTemplate(`/hacsfiles/${filename}`)
          .catch(() => this.fetchTemplate(`/local/${filename}`))
          .catch(() => this.fetchTemplate(`/local/community/${filename}`));
      }
      if (isTemplateLoaded instanceof Promise) {
        isTemplateLoaded.then(() => {
          isTemplateLoaded = true;

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

export {};
