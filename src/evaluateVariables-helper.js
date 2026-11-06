import formatVariables from "./formatVariables-helper";

const primitiveRegexMap = new Map();
const objectQuotesRegexMap = new Map();
const objectRegexMap = new Map();
const basicRegexMap = new Map();
const variableCache = new Map();
const escapeQuoteRegex = /"/gmu;
const referenceRegex = /\[\[(?<name>[^\]]+)\]\]/gu;
const exactReferenceRegex = /^\[\[(?<name>[^\]]+)\]\]$/u;

export const replaceWithKeyValue = (stringTemplate, key, value) => {
  if (typeof value === "number" || typeof value === "boolean") {
    let rxp = primitiveRegexMap.get(key);
    if (rxp === undefined) {
      rxp = new RegExp(`["'\`]?\\[\\[${key}\\]\\]["'\`]?`, "gmu");
      primitiveRegexMap.set(key, rxp);
    }

    return stringTemplate.replaceAll(rxp, value);
  } else if (typeof value === "object") {
    const valueString = JSON.stringify(value);

    let rxpQuotes = objectQuotesRegexMap.get(key);
    if (rxpQuotes === undefined) {
      rxpQuotes = new RegExp(`"\\[\\[${key}\\]\\]"`, "gmu");
      objectQuotesRegexMap.set(key, rxpQuotes);
    }

    let rxp = objectRegexMap.get(key);
    if (rxp === undefined) {
      rxp = new RegExp(`['\`]\\[\\[${key}\\]\\]['\`]`, "gmu");
      objectRegexMap.set(key, rxp);
    }

    return stringTemplate
      .replaceAll(rxpQuotes, valueString)
      .replaceAll(rxp, valueString.replace(escapeQuoteRegex, '\\"'));
  }

  let rxp = basicRegexMap.get(key);
  if (rxp === undefined) {
    rxp = new RegExp(`\\[\\[${key}\\]\\]`, "gmu");
    basicRegexMap.set(key, rxp);
  }

  return stringTemplate.replaceAll(rxp, value);
};

/**
 * Look a `[[name]]` reference up in the variable map. An unknown name, or a
 * circular one (already being resolved), is not found: the reference is left
 * untouched, and a circular one is reported with a console warning.
 */
const lookupReference = (context, name) => {
  if (!Object.hasOwn(context.variables, name)) {
    return { found: false };
  }
  if (context.stack.includes(name)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[streamline-card] Circular variable reference: ${[...context.stack, name].join(" -> ")}`,
    );

    return { found: false };
  }

  // eslint-disable-next-line no-use-before-define
  return { found: true, value: resolveKey(context, name) };
};

const resolveString = (context, text) => {
  const exact = exactReferenceRegex.exec(text);
  if (exact !== null) {
    const { found, value } = lookupReference(context, exact.groups.name);

    // A value that is exactly a reference keeps the type of what it references
    return found ? value : text;
  }

  return text.replaceAll(referenceRegex, (match, name) => {
    const { found, value } = lookupReference(context, name);
    if (!found) {
      return match;
    }

    return typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
  });
};

const resolveValue = (context, value) => {
  if (typeof value === "string") {
    return resolveString(context, value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(context, item));
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveValue(context, item)]),
    );
  }

  return value;
};

const resolveKey = (context, key) => {
  if (context.resolved.has(key)) {
    return context.resolved.get(key);
  }

  context.stack.push(key);
  const value = resolveValue(context, context.variables[key]);
  context.stack.pop();

  context.resolved.set(key, value);

  return value;
};

/**
 * Resolve the `[[name]]` references found inside the values of a variable map.
 * Depth-first, so the declaration order does not matter. Returns a new map.
 */
export const resolveVariableReferences = (variables) => {
  const context = { resolved: new Map(), stack: [], variables };

  return Object.fromEntries(Object.keys(variables).map((key) => [key, resolveKey(context, key)]));
};

export default function evaluateVariables(templateConfig, variables) {
  const content = templateConfig.card ?? templateConfig.element ?? templateConfig.badge;

  if (!variables && !templateConfig.default) {
    return content;
  }

  const cacheKey = JSON.stringify({ templateConfig, variables });
  if (variableCache.has(cacheKey) === false) {
    let stringTemplate = JSON.stringify(content);

    const variablesObject = {
      ...formatVariables(templateConfig.default ?? {}),
      ...formatVariables(variables),
    };

    Object.entries(resolveVariableReferences(variablesObject)).forEach(([key, value]) => {
      stringTemplate = replaceWithKeyValue(stringTemplate, key, value);
    });

    variableCache.set(cacheKey, stringTemplate);
  }

  return JSON.parse(variableCache.get(cacheKey));
}
