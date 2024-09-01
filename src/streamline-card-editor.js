import { getLovelace, getLovelaceCast } from "./getLovelace.helper";
import { deepEqual } from "./deepEqual-helper";
import { fireEvent } from "./fireEvent-helper";

export {};

class StreamlineCardEditor extends HTMLElement {
  _card = undefined;
  _hass = undefined;
  _shadow;
  _templates = {};

  constructor(card) {
    super();
    this._card = card;
    this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });

    const lovelace = getLovelace() || getLovelaceCast();
    this._templates = lovelace.config.streamline_templates;
    if (this._templates === null) {
      throw new Error(
        "The object streamline_templates doesn't exist in your main lovelace config.",
      );
    }

    this._config = {
      template: Object.keys(this._templates)[0],
      type: "streamline-card",
      variables: [],
    };

    this.initialize();
  }

  get hass() {
    return this._hass;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  setConfig(config) {
    const formattedConfig = StreamlineCardEditor.formatConfig(config);
    const [firstTemplate] = Object.keys(this._templates);

    const newConfig = {};
    newConfig.type = formattedConfig.type;
    newConfig.template = formattedConfig.template ?? firstTemplate ?? "";
    newConfig.variables = [...formattedConfig.variables];
    // eslint-disable-next-line no-warning-comments
    // TODO: Initialize variables

    if (deepEqual(newConfig, this._config) === false) {
      this._config = newConfig;
      fireEvent(this, "config-changed", { config: newConfig });
    }

    this.render();
  }

  initialize() {
    this.elements = {};

    this.elements.style = document.createElement("style");
    this.elements.style.innerHTML = `
      .streamline-card-form > * {
        display: block;
        margin-top: 8px;
        width: 100%;
      }
    `;

    this.elements.form = document.createElement("ha-form");
    this.elements.form.classList.add("streamline-card-form");
    this.elements.form.addEventListener("value-changed", (ev) => {
      const newConfig = StreamlineCardEditor.formatConfig(ev.detail.value);

      fireEvent(this, "config-changed", { config: newConfig });
      this._config = newConfig;
      this.render();
    });

    this._shadow.appendChild(this.elements.form);
    this._shadow.appendChild(this.elements.style);
  }

  getVariablesForTemplate(template) {
    const variables = {};

    const templateConfig = this._templates[template];
    if (typeof templateConfig === "undefined") {
      throw new Error(
        `The template "${template}" doesn't exist in streamline_templates`,
      );
    }

    const stringTemplate = JSON.stringify(templateConfig);
    const variablesRegex = /\[\[(?<name>.*?)\]\]/gu;

    stringTemplate.matchAll(variablesRegex).forEach(([, name]) => {
      variables[name] = name;
    });

    return Object.keys(variables).sort((left, right) => {
      const leftIndex = Object.keys(this._config.variables).find((key) =>
        Object.hasOwn(this._config.variables[key], left),
      );
      const rightIndex = Object.keys(this._config.variables).find((key) =>
        Object.hasOwn(this._config.variables[key], right),
      );

      return leftIndex - rightIndex;
    });
  }

  static formatConfig(config) {
    const newConfig = { ...config };
    const newVariables = newConfig.variables ?? {};

    newConfig.variables = [];
    for (const [index, variable] of Object.entries(newVariables)) {
      newConfig.variables[Number(index)] = variable;
    }

    return newConfig;
  }

  static getTemplateSchema(templates) {
    return {
      name: "template",
      selector: {
        select: {
          mode: "dropdown",
          options: templates.map((template) => ({
            label: template,
            value: template,
          })),
          sort: true,
        },
      },
      title: "Template",
    };
  }

  static getEntitySchema(name) {
    return {
      name,
      selector: { entity: {} },
      title: name,
    };
  }

  static getIconSchema(name) {
    return {
      context: { icon_entity: "entity" },
      name,
      selector: { icon: {} },
      title: name,
    };
  }

  static getDefaultSchema(name) {
    return {
      name,
      selector: { text: {} },
      title: name,
    };
  }

  static getVariableSchema(index, variable) {
    let childSchema = StreamlineCardEditor.getDefaultSchema(variable);

    if (variable.toLowerCase().includes("entity")) {
      childSchema = StreamlineCardEditor.getEntitySchema(variable);
    } else if (variable.toLowerCase().includes("icon")) {
      childSchema = StreamlineCardEditor.getIconSchema(variable);
    }

    return {
      name: index,
      schema: [childSchema],
      type: "grid",
    };
  }

  getSchema() {
    const variables = this.getVariablesForTemplate(this._config.template);

    return [
      StreamlineCardEditor.getTemplateSchema(Object.keys(this._templates)),
      {
        expanded: true,
        name: "variables",
        schema: Object.keys(variables).map((key) =>
          StreamlineCardEditor.getVariableSchema(key, variables[key]),
        ),
        title: "Variables",
        type: "expandable",
      },
    ];
  }

  render() {
    this.elements.form.hass = this._hass;
    this.elements.form.data = this._config;
    this.elements.form.schema = this.getSchema();
  }
}

if (typeof customElements.get("streamline-card-editor") === "undefined") {
  customElements.define("streamline-card-editor", StreamlineCardEditor);
}
