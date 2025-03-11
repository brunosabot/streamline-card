import formatVariables from "./formatVariables-helper";

const primitiveRegexMap = new Map();
const objectQuotesRegexMap = new Map();
const objectRegexMap = new Map();
const basicRegexMap = new Map();
const variableCache = new Map();
const escapeQuoteRegex = /"/gmu;

export const replaceWithKeyValue = (stringTemplate, key, value) => {
  if (typeof value === "number" || typeof value === "boolean") {
    let rxp = primitiveRegexMap.get(key);
    if (rxp === undefined) {
      rxp = new RegExp(`["'\`]\\[\\[${key}\\]\\]["'\`]`, "gmu");
      primitiveRegexMap.set(key, rxp);
    }

    return stringTemplate.replace(rxp, value);
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
      .replace(rxpQuotes, valueString)
      .replace(rxp, valueString.replace(escapeQuoteRegex, '\\"'));
  }

  let rxp = basicRegexMap.get(key);
  if (rxp === undefined) {
    rxp = new RegExp(`\\[\\[${key}\\]\\]`, "gmu");
    basicRegexMap.set(key, rxp);
  }

  return stringTemplate.replace(rxp, value);
};

export default function evaluateVariables(templateConfig, variables) {
  if (!variables && !templateConfig.default) {
    return templateConfig.card;
  }

  const cacheKey = JSON.stringify({ templateConfig, variables });
  if (variableCache.has(cacheKey) === false) {
    let stringTemplate = templateConfig.card
      ? JSON.stringify(templateConfig.card)
      : JSON.stringify(templateConfig.element);

    const variablesObject = {
      ...formatVariables(templateConfig.default ?? {}),
      ...formatVariables(variables),
    };

    Object.entries(variablesObject).forEach(([key, value]) => {
      stringTemplate = replaceWithKeyValue(stringTemplate, key, value);
    });

    variableCache.set(cacheKey, JSON.parse(stringTemplate));
  }

  return variableCache.get(cacheKey);
}
