import { getLovelace, getLovelaceCast } from "./getLovelace.helper";
import { getRemoteTemplates,getisTemplateLoaded, loadRemoteTemplates } from "./templateLoader";
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

    let remoteTemplateLoader = loadRemoteTemplates();
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

  getSchema() {
	const tplName = this._config.template;
	const tpl = this._templates?.[tplName] || {};
	const meta = (tpl.variables_meta || (tpl.meta && tpl.meta.variables) || {}) || {};

	// Natural order by scanning [[var]] occurrences
	const toNatural = (t) => {
	  const s = JSON.stringify(t);
	  const rx = /\[\[(?<name>.*?)\]\]/gu;
	  const seen = new Set();
	  const out = [];
	  for (const m of s.matchAll(rx)) {
		const n = (m.groups && m.groups.name) || m[1] || "";
		if (n && !seen.has(n)) { seen.add(n); out.push(n); }
	  }
	  return out;
	};

	const pickSelector = (name) => {
	  const v = String(name).toLowerCase();
	  if (v.includes("entity")) return StreamlineCardEditor.getEntitySchema(name).selector;
	  if (v.includes("icon"))   return StreamlineCardEditor.getIconSchema(name).selector;
	  if (v.includes("bool"))   return StreamlineCardEditor.getBooleanSchema(name).selector;
	  return StreamlineCardEditor.getDefaultSchema(name).selector;
	};

	let variables = toNatural(tpl);
	if (!Array.isArray(variables) || variables.length === 0) {
	  variables = this.getVariablesForTemplate(tplName);
	}

	const naturalIndex = new Map(variables.map((v, i) => [v, i]));
	const sortByOrder = (arr) => [...arr].sort((a, b) => {
	  const ao = meta?.[a]?.order;
	  const bo = meta?.[b]?.order;
	  const aNum = Number.isFinite(ao) ? ao : null;
	  const bNum = Number.isFinite(bo) ? bo : null;
	  if (aNum !== null && bNum !== null) return aNum - bNum;
	  if (aNum !== null) return -1;
	  if (bNum !== null) return 1;
	  return naturalIndex.get(a) - naturalIndex.get(b);
	});

	// Group by meta.group. UNGROUPED FIRST.
	const groupsMap = new Map();
	for (const v of variables) {
	  const m = meta?.[v] || {};
	  const title = (typeof m.group === "string" && m.group.trim()) ? m.group.trim() : null;
	  const key = title || "__ungrouped__";
	  const order = title ? (Number.isFinite(m.group_order) ? m.group_order : 1000) : -1;
	  if (!groupsMap.has(key)) groupsMap.set(key, { title: title || "Variables", order, items: [] });
	  groupsMap.get(key).items.push(v);
	}
	for (const g of groupsMap.values()) g.items = sortByOrder(g.items);
	const grouped = [...groupsMap.values()].sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title));

	const buildField = (name) => {
	  const m = meta?.[name];
	  if (m && typeof m === "object") {
		const row = { name };
		if (m.title) row.title = String(m.title);
		if (m.description) row.description = String(m.description);
		row.selector = (m.selector && typeof m.selector === "object") ? m.selector : pickSelector(name);
		return row;
	  }
	  return StreamlineCardEditor.getVariableSchema(name);
	};

	const hasAnyMeta = Object.keys(meta).length > 0;
	if (!hasAnyMeta) {
	  // Legacy single-section
	  return [
		StreamlineCardEditor.getTemplateSchema(Object.keys(this._templates)),
		{ expanded:true, name:"variables", title:"Variables", type:"expandable",
		  schema: sortByOrder(variables).map((k)=>buildField(k)) }
	  ];
	}
	// IMPORTANT: Keep `name: "variables"` so ha-form binds edits to the variables object.
	const sections = grouped.map((g, idx) => ({
	  expanded: idx === 0,
	  name: "variables",
	  title: g.title,
	  type: "expandable",
	  schema: g.items.map((k)=>buildField(k))
	}));
	return [StreamlineCardEditor.getTemplateSchema(Object.keys(this._templates)), ...sections];
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
