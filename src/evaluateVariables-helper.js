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

export const getVariables = (templateConfig, variables = []) => {
  const defaults = templateConfig.default ?? [];

  return [...defaults, ...variables].reduce(
    (acc, variable) => ({
      ...acc,
      ...Object.entries(variable).reduce(
        (acc2, [key, value]) => ({ ...acc2, [key]: value }),
        {},
      ),
    }),
    {},
  );
};

export default function evaluateVariables(templateConfig, variables) {
  if (!variables && !templateConfig.default) {
    return templateConfig.card;
  }

  let stringTemplate = JSON.stringify(
    templateConfig.card ?? templateConfig.element,
  );

  const variablesObject = getVariables(templateConfig, variables);

  Object.entries(variablesObject).forEach(([key, value]) => {
    stringTemplate = replaceWithKeyValue(stringTemplate, key, value);
  });

  return JSON.parse(stringTemplate);
}
