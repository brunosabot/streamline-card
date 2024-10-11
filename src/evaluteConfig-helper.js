import evaluateJavascript from "./evaluateJavascript-helper";
import evaluateVariables from "./evaluateVariables-helper";
import formatVariables from "./formatVariables-helper";

export default function evaluateConfig(templateConfig, variables, options) {
  let config = evaluateVariables(templateConfig, variables ?? {});

  const { hasJavascript, hass } = options;

  if (hasJavascript && typeof hass !== "undefined") {
    const allVariables = {
      ...formatVariables(templateConfig.default ?? {}),
      ...formatVariables(variables ?? {}),
    };

    config = evaluateJavascript(config, hass, allVariables);
  }

  return config;
}
