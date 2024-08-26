import { getLovelace, getLovelaceCast } from "./getLovelace.helper";
import deepReplace from "./deepReplace-helper";
import evaluateConfig from "./evaluateConfig-helper";
import { version } from "../package.json";

(async function initializeStreamlineCard() {
  const HELPERS = window.loadCardHelpers
    ? await window.loadCardHelpers()
    : undefined;

  class StreamlineCard extends HTMLElement {
    _editMode = false;
    _isConnected = false;
    _config = {};
    _originalConfig = {};
    _hass = {};
    _card;
    _shadow;
    _accessedProperties = new Set();

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
        this._card.setConfig?.(this._config);

        if (this._config.visibility) {
          this.parentNode.config = {
            ...this.parentNode.config,
            visibility: this._config.visibility,
          };
        }
      }
    }

    connectedCallback() {
      this._isConnected = true;

      this.updateCardConfig();
      this.updateCardEditMode();
      this.updateCardHass();
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
      this.parseConfig();

      this.updateCardConfig();
      this.updateCardHass();
    }

    parseConfig() {
      const lovelace = getLovelace() || getLovelaceCast();
      if (!lovelace.config && !lovelace.config.streamline_templates) {
        throw new Error(
          "The object streamline_templates doesn't exist in your main lovelace config.",
        );
      }

      const templateConfig =
        lovelace.config.streamline_templates[this._originalConfig.template];
      if (!templateConfig) {
        throw new Error(
          `The template "${this._originalConfig.template}" doesn't exist in streamline_templates`,
        );
      } else if (!(templateConfig.card || templateConfig.element)) {
        throw new Error(
          "You should define either a card or an element in the template",
        );
      } else if (templateConfig.card && templateConfig.element) {
        throw new Error("You can define a card and an element in the template");
      }

      this._config = deepReplace(
        templateConfig,
        this._originalConfig.variables,
      );

      const hassState = this._hass?.states ?? undefined;
      if (typeof hassState !== "undefined") {
        evaluateConfig(this._config, this._hass);
      }
    }

    setConfig(config) {
      this._originalConfig = config;
      this.parseConfig();

      if (typeof this._card === "undefined") {
        if (typeof this._config.type === "undefined") {
          throw new Error("[Streamline Card] You need to define a type");
        }
        this._card = HELPERS.createCardElement(this._config);
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
