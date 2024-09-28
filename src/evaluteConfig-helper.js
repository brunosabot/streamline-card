import evaluateJavascript from "./evaluateJavascript-helper";
import evaluateVariables from "./evaluateVariables-helper";

export default function evaluateConfig(templateConfig, variables, options) {
  let config = evaluateVariables(templateConfig, variables ?? {});

  const { hasJavascript, hass } = options;

  if (hasJavascript && typeof hass !== "undefined") {
    config = evaluateJavascript(config, hass);
  }

  return config;
}
