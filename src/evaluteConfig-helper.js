import evaluateJavascript from "./evaluateJavascript-helper";
import evaluateVariables from "./evaluateVariables-helper";

export default function evaluateConfig(templateConfig, variables, hass) {
  let config = evaluateVariables(templateConfig, variables);

  if (typeof hass !== "undefined") {
    config = evaluateJavascript(config, hass);
  }

  return config;
}
