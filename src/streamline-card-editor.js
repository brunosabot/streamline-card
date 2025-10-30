import { getLovelace, getLovelaceCast } from "./getLovelace.helper";
import { getRemoteTemplates, loadRemoteTemplates } from "./templateLoader";
import deepEqual from "./deepEqual-helper";
import exampleTile from "./templates/exampleTile";
import fireEvent from "./fireEvent-helper";
import formatVariables from "./formatVariables-helper";

export class StreamlineCardEditor extends HTMLElement {
  _card = undefined;
  _hass = undefined;
  _shadow;
  _templates = { ...exampleTile };

  constructor(card) {
    super();
    this._card = card;
    this._shadow = this.shadowRoot || this.attachShadow({ mode: "open" });

    const lovelace = getLovelace() || getLovelaceCast();

    const remoteTemplateLoader = loadRemoteTemplates();
    if (remoteTemplateLoader instanceof Promise) {
      remoteTemplateLoader.then(() => {
        this._templates = {
          ...exampleTile,
          ...getRemoteTemplates(),
          ...(lovelace && lovelace.config && lovelace.config.streamline_templates ? lovelace.config.streamline_templates : {}),
        };
		if (this._originalConfig) {
		  this.setConfig(this._originalConfig);
		}		
      });
    } else {
      this._templates = {
        ...exampleTile,
        ...getRemoteTemplates(),
        ...(lovelace && lovelace.config && lovelace.config.streamline_templates ? lovelace.config.streamline_templates : {}),
      };
    }

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
	// Templates may still be loading; avoid breaking visual editor.
		return Object.keys(this._config?.variables ?? {});
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

  static getBooleanSchema(name) {
    return {
      name,
      selector: { boolean: {} },
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
    } else if (variable.toLowerCase().includes("bool")) {
      childSchema = StreamlineCardEditor.getBooleanSchema(variable);
    }

    return childSchema;
  }


// ---- Helpers (static) ----
static _toNaturalVariables(templateObj) {
  const jsonText = JSON.stringify(templateObj);
  const bracketRegex = /\[\[(?<name>.*?)\]\]/gu;
  const seenNames = new Set();
  const results = [];
  for (const matchResult of jsonText.matchAll(bracketRegex)) {
    const capturedName = (matchResult.groups && matchResult.groups.name) || matchResult[1] || "";
    if (capturedName && !seenNames.has(capturedName)) {
      seenNames.add(capturedName);
      results.push(capturedName);
    }
  }
  return results;
}

static _pickSelector(variableName) {
  const lowerName = String(variableName).toLowerCase();

  if (lowerName.includes("entity")) {
    return StreamlineCardEditor.getEntitySchema(variableName).selector;
  }
  if (lowerName.includes("icon")) {
    return StreamlineCardEditor.getIconSchema(variableName).selector;
  }
  if (lowerName.includes("bool")) {
    return StreamlineCardEditor.getBooleanSchema(variableName).selector;
  }
  return StreamlineCardEditor.getDefaultSchema(variableName).selector;
}

static _makeSorter(variableMeta, naturalOrder) {
  const naturalIndex = new Map(naturalOrder.map((varName, index) => [varName, index]));
  return (arr) =>
    [...arr].sort((leftKey, rightKey) => {
      const leftOrder = variableMeta?.[leftKey]?.order;
      const rightOrder = variableMeta?.[rightKey]?.order;

      const leftIsNum = Number.isFinite(leftOrder);
      const rightIsNum = Number.isFinite(rightOrder);

      if (leftIsNum && rightIsNum) {
        return leftOrder - rightOrder;
      }
      if (leftIsNum) {
        return -1;
      }
      if (rightIsNum) {
        return 1;
      }

      const leftIdx = naturalIndex.get(leftKey) ?? 0;
      const rightIdx = naturalIndex.get(rightKey) ?? 0;
      return leftIdx - rightIdx;
    });
}

static _buildField(variableName, variableMeta) {
  const metaForVar = variableMeta?.[variableName];

  if (metaForVar && typeof metaForVar === "object") {
    const row = { name: variableName };
    if (metaForVar.title) {
      row.title = String(metaForVar.title);
    }
    if (metaForVar.description) {
      row.description = String(metaForVar.description);
    }

    if (metaForVar.selector && typeof metaForVar.selector === "object") {
      row.selector = metaForVar.selector;
    } else {
      row.selector = StreamlineCardEditor._pickSelector(variableName);
    }
    return row;
  }

  return StreamlineCardEditor.getVariableSchema(variableName);
}

static _normalizeGroupOrder(possibleOrder) {
  return Number.isFinite(possibleOrder) ? possibleOrder : 1000;
}

static _groupVariables(variablesList, variableMeta, sortByOrder) {
  // Group by meta.group. Ungrouped first.
  const groupsMap = new Map();

  for (const variableName of variablesList) {
    const metaForVar = variableMeta?.[variableName] || {};

    let groupTitle = null;
    if (typeof metaForVar.group === "string" && metaForVar.group.trim()) {
      groupTitle = metaForVar.group.trim();
    }

    const mapKey = groupTitle || "__ungrouped__";
    const groupOrder = groupTitle
      ? StreamlineCardEditor._normalizeGroupOrder(metaForVar.group_order)
      : -1;

    if (!groupsMap.has(mapKey)) {
      // Keys alphabetized for sort-keys.
      groupsMap.set(mapKey, { items: [], order: groupOrder, title: groupTitle || "Variables" });
    }
    groupsMap.get(mapKey).items.push(variableName);
  }

  for (const groupItem of groupsMap.values()) {
    groupItem.items = sortByOrder(groupItem.items);
  }

  return [...groupsMap.values()].sort(
    (leftGroup, rightGroup) =>
      (leftGroup.order - rightGroup.order) || leftGroup.title.localeCompare(rightGroup.title)
  );
}

static _buildLegacySchema(allTemplates, sortedVariables, variableMeta) {
  return [
    StreamlineCardEditor.getTemplateSchema(allTemplates),
    {
      // Alphabetical key order for sort-keys.
      expanded: true,
      name: "variables",
      schema: sortedVariables.map((varKey) =>
        StreamlineCardEditor._buildField(varKey, variableMeta)
      ),
      title: "Variables",
      type: "expandable",
    },
  ];
}

static _buildGroupedSchema(allTemplates, groupedSections, variableMeta) {
  const sections = groupedSections.map((groupItem, sectionIndex) => ({
    // Alphabetical key order for sort-keys.
    expanded: sectionIndex === 0,
    name: "variables",
    schema: groupItem.items.map((varKey) =>
      StreamlineCardEditor._buildField(varKey, variableMeta)
    ),
    title: groupItem.title,
    type: "expandable",
  }));
  return [StreamlineCardEditor.getTemplateSchema(allTemplates), ...sections];
}

// ---- Main ----
getSchema() {
  const templateName = this._config.template;
  const templateObj = this._templates?.[templateName] || {};
  const variableMeta =
    (templateObj.variables_meta || (templateObj.meta && templateObj.meta.variables) || {}) || {};

  // Natural variable order (by first appearance in [[var]] occurrences). Fallback to template-defined.
  let variablesList = StreamlineCardEditor._toNaturalVariables(templateObj);
  if (!Array.isArray(variablesList) || variablesList.length === 0) {
    variablesList = this.getVariablesForTemplate(templateName);
  }

  const sortByOrder = StreamlineCardEditor._makeSorter(variableMeta, variablesList);
  const hasAnyMeta = Object.keys(variableMeta).length > 0;
  const allTemplates = Object.keys(this._templates);

  if (!hasAnyMeta) {
    const sortedVariables = sortByOrder(variablesList);
    return StreamlineCardEditor._buildLegacySchema(
      allTemplates,
      sortedVariables,
      variableMeta
    );
  }

  const groupedSections = StreamlineCardEditor._groupVariables(
    variablesList,
    variableMeta,
    sortByOrder
  );
  return StreamlineCardEditor._buildGroupedSchema(allTemplates, groupedSections, variableMeta);
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
