import { getLovelace, getLovelaceCast } from "./getLovelace.helper";
import deepEqual from "./deepEqual-helper";
import fireEvent from "./fireEvent-helper";
import formatVariables from "./formatVariables-helper";

export class StreamlineCardEditor extends HTMLElement {
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
      variables: {},
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
    newConfig.variables = formattedConfig.variables ?? {};
    if (formattedConfig.grid_options) {
      newConfig.grid_options = formattedConfig.grid_options;
    }
    if (formattedConfig.visibility) {
      newConfig.visibility = formattedConfig.visibility;
    }
    const newConfigWithDefaults = this.setVariablesDefault(newConfig);

    if (deepEqual(newConfigWithDefaults, this._config) === false) {
      this._config = newConfigWithDefaults;
      this.saveConfig(newConfig);
    }

    this.render();
  }

  setVariablesDefault(newConfig) {
    const variables = this.getVariablesForTemplate(newConfig.template);

    variables.forEach((variable) => {
      if (
        variable.toLowerCase().includes("entity") &&
        newConfig.variables[variable] === ""
      ) {
        const entityList = Object.keys(this._hass.states);
        const randomEntity =
          entityList[Math.floor(Math.random() * entityList.length)];

        newConfig.variables[variable] = randomEntity;
      } else if (!newConfig.variables[variable]) {
        newConfig.variables[variable] = "";
      }
    });

    return newConfig;
  }

  initialize() {
    this.elements = {};

    this.elements.error = document.createElement("ha-alert");
    this.elements.error.setAttribute("alert-type", "error");
    this.elements.error.classList.add("streamline-card-form__error");

    this.elements.style = document.createElement("style");
    this.elements.style.innerHTML = `
      .streamline-card-form__error {
        margin-bottom: 8px;
      }
    `;

    this.elements.form = document.createElement("ha-form");
    this.elements.form.classList.add("streamline-card-form");
    this.elements.form.computeLabel = StreamlineCardEditor.computeLabel;
    this.elements.form.addEventListener("value-changed", (ev) => {
      let newConfig = StreamlineCardEditor.formatConfig(ev.detail.value);
      if (this._config.template !== newConfig.template) {
        newConfig.variables = {};
        newConfig = this.setVariablesDefault(newConfig);
      }

      this._config = newConfig;
      this.render();
      this.saveConfig(newConfig);
    });

    this._shadow.appendChild(this.elements.error);
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

    [...stringTemplate.matchAll(variablesRegex)].forEach(([, name]) => {
      variables[name] = name;
    });

    return Object.keys(variables).sort((left, right) => {
      const leftIndex = Object.keys(this._config.variables).find((key) =>
        Object.hasOwn(this._config.variables[key] ?? "", left),
      );
      const rightIndex = Object.keys(this._config.variables).find((key) =>
        Object.hasOwn(this._config.variables[key] ?? "", right),
      );

      return leftIndex - rightIndex;
    });
  }

  saveConfig(newConfig) {
    const newConfigForSave = JSON.parse(JSON.stringify(newConfig));
    Object.keys(newConfigForSave.variables).forEach((variable) => {
      if (newConfigForSave.variables[variable] === "") {
        delete newConfigForSave.variables[variable];
      }
    });

    fireEvent(this, "config-changed", { config: newConfigForSave });
  }

  static formatConfig(config) {
    const newConfig = { ...config };

    newConfig.variables = { ...formatVariables(newConfig.variables ?? {}) };

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
    };
  }

  static getIconSchema(name) {
    return {
      name,
      selector: { icon: {} },
    };
  }

  static getDefaultSchema(name) {
    return {
      name,
      selector: { text: {} },
    };
  }

  static getVariableSchema(variable) {
    let childSchema = StreamlineCardEditor.getDefaultSchema(variable);

    if (variable.toLowerCase().includes("entity")) {
      childSchema = StreamlineCardEditor.getEntitySchema(variable);
    } else if (variable.toLowerCase().includes("icon")) {
      childSchema = StreamlineCardEditor.getIconSchema(variable);
    }

    return childSchema;
  }

  getSchema() {
    const variables = this.getVariablesForTemplate(this._config.template);

    return [
      StreamlineCardEditor.getTemplateSchema(Object.keys(this._templates)),
      {
        expanded: true,
        name: "variables",
        schema: variables.map((key) =>
          StreamlineCardEditor.getVariableSchema(key),
        ),
        title: "Variables",
        type: "expandable",
      },
    ];
  }

  static computeLabel(schema) {
    const schemaName = schema.name.replace(/[-_]+/gu, " ");
    const defaultLabel =
      schemaName.charAt(0).toUpperCase() + schemaName.slice(1);
    const translation = this.hass.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`,
    );

    return translation || defaultLabel;
  }

  render() {
    const schema = this.getSchema();

    const areAllPrimitives = Object.values(this._config.variables).every(
      (value) => typeof value !== "object",
    );

    if (areAllPrimitives === false) {
      this.elements.error.style.display = "block";
      this.elements.error.innerText = `Object and array variables are not supported in the visual editor.`;
      this.elements.form.schema = [schema[0]];
    } else {
      this.elements.error.style.display = "none";
      this.elements.form.schema = schema;
    }

    this.elements.form.hass = this._hass;

    const cleanedConfig = {
      ...this._config,
      variables: formatVariables(this._config.variables),
    };

    this.elements.form.data = cleanedConfig;
  }
}

if (typeof customElements.get("streamline-card-editor") === "undefined") {
  customElements.define("streamline-card-editor", StreamlineCardEditor);
}
