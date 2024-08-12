export default function deepReplace(templateConfig, variables) {
  if (!variables && !templateConfig.default) {
    return templateConfig.card;
  }
  let variableArray = [];
  if (variables) {
    variableArray = variables.slice(0);
  }
  if (templateConfig.default) {
    variableArray = variableArray.concat(templateConfig.default);
  }
  let jsonConfig = templateConfig.card
    ? JSON.stringify(templateConfig.card)
    : JSON.stringify(templateConfig.element);
  variableArray.forEach((variable) => {
    const [key] = Object.keys(variable);
    const [value] = Object.values(variable);
    if (typeof value === "number" || typeof value === "boolean") {
      const rxp2 = new RegExp(`"\\[\\[${key}\\]\\]"`, "gmu");
      jsonConfig = jsonConfig.replace(rxp2, value);
    } else if (typeof value === "object") {
      const rxp2 = new RegExp(`"\\[\\[${key}\\]\\]"`, "gmu");
      const valueString = JSON.stringify(value);
      jsonConfig = jsonConfig.replace(rxp2, valueString);
    } else {
      const rxp = new RegExp(`\\[\\[${key}\\]\\]`, "gmu");
      jsonConfig = jsonConfig.replace(rxp, value);
    }
  });
  return JSON.parse(jsonConfig);
}
