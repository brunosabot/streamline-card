import "./streamline-card-editor";
import { getLovelace, getLovelaceCast } from "./getLovelace.helper";
import deepClone from "./deepClone-helper";
import deepEqual from "./deepEqual-helper";
import evaluateConfig from "./evaluteConfig-helper";
import { version } from "../package.json";

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
    _accessedProperties = new Set();
    _hasJavascriptTemplate = false;

    constructor() {
      super();
      this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    }

    updateCardHass() {
      if (this._isConnected && this._card && this._hass) {
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
          this._shadow.removeChild(this._card);
          this.createCard();
          this._shadow.appendChild(this._card);
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

      setTimeout(() => {
        this.updateCardConfig();
        this.updateCardEditMode();
        this.updateCardHass();
      }, 0);
    }

    disconnectedCallback() {
      this._isConnected = false;
    }

    get editMode() {
      return this._editMode;
    }

    set editMode(editMode) {
      if (editMode !== this._editMode) {
        this._editMode = editMode;
        this.updateCardEditMode();
      }
    }

    get hass() {
      return this._hass;
    }

    set hass(hass) {
      this._hass = hass;

      setTimeout(() => {
        const hasConfigChanged = this.parseConfig();
        if (hasConfigChanged) {
          this.updateCardConfig();
        }

        this.updateCardHass();
      }, 0);
    }

    parseConfig() {
      const oldParsedConfig = deepClone(this._config ?? {});
      const lovelace = getLovelace() || getLovelaceCast();
      if (!lovelace.config && !lovelace.config.streamline_templates) {
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config.",
        );
      }

      this._templateConfig =
        lovelace.config.streamline_templates[this._originalConfig.template];
      if (!this._templateConfig) {
        throw new Error(
          `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`,
        );
      } else if (!(this._templateConfig.card || this._templateConfig.element)) {
        throw new Error(
          "You should define either a card or an element in the template",
        );
      } else if (this._templateConfig.card && this._templateConfig.element) {
        throw new Error("You can define a card and an element in the template");
      }

      this._config = evaluateConfig(
        this._templateConfig,
        this._originalConfig.variables,
        {
          hasJavascript: this._hasJavascriptTemplate,
          hass: this._hass,
        },
      );

      const newParsedConfig = deepClone(this._config);
      const hasConfigChanged =
        deepEqual(oldParsedConfig, newParsedConfig) === false;

      return hasConfigChanged;
    }

    setConfig(config) {
      this._originalConfig = config;
      this._hasJavascriptTemplate =
        JSON.stringify(config).includes("_javascript");

      const hasConfigChanged = this.parseConfig();
      if (hasConfigChanged === false) {
        return;
      }

      if (typeof this._card === "undefined") {
        if (typeof this._config.type === "undefined") {
          throw new Error("[Streamline Card] You need to define a type");
        }
        this.createCard();
        this._shadow.appendChild(this._card);
      }

      this.updateCardConfig();
    }

    getCardSize() {
      return this._card?.getCardSize?.() ?? 1;
    }

    getLayoutOptions() {
      return this._card?.getLayoutOptions?.();
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
