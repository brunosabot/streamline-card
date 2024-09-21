import formatVariables from "./formatVariables-helper";

export const replaceWithKeyValue = (stringTemplate, key, value) => {
  if (typeof value === "number" || typeof value === "boolean") {
    return stringTemplate.replaceAll(`"[[${key}]]"`, value);
  } else if (typeof value === "object") {
    return stringTemplate
      .replaceAll(`"[[${key}]]"`, JSON.stringify(value))
      .replaceAll(`'[[${key}]]'`, JSON.stringify(value).replaceAll('"', '\\"'))
      .replaceAll(
        `\`[[${key}]]\``,
        JSON.stringify(value).replaceAll('"', '\\"'),
      );
  }
  return stringTemplate.replaceAll(`[[${key}]]`, value);
};

export default function evaluateVariables(templateConfig, variables) {
  if (!variables && !templateConfig.default) {
    return templateConfig.card;
  }

  let stringTemplate = JSON.stringify(
    templateConfig.card ?? templateConfig.element,
  );

  const variablesObject = {
    ...formatVariables(templateConfig.default ?? {}),
    ...formatVariables(variables),
  };

  Object.entries(variablesObject).forEach(([key, value]) => {
    stringTemplate = replaceWithKeyValue(stringTemplate, key, value);
  });

  return JSON.parse(stringTemplate);
}
