export default function evaluateConfig(config, hass) {
  const configKeys = Object.keys(config);

  for (let key of configKeys) {
    if (config[key] instanceof Array) {
      for (let i = 0; i < config[key].length; i++) {
        if (typeof config[key][i] === "object") {
          evaluateConfig(config[key][i], hass);
        } else {
          const states = hass?.states ?? undefined;
          const user = hass?.user ?? undefined;
          const prefix = `
            var states = ${JSON.stringify(states)};
            var user = ${JSON.stringify(user)};
          `;
          const keyWithoutJavascript = key.replace("_javascript", "");
          const stringToEvaluatate = `${prefix} ${config[key][i]}`;
          try {
            config[keyWithoutJavascript] = config[keyWithoutJavascript] || {};
            config[keyWithoutJavascript][i] = eval(stringToEvaluatate);
          } catch (error) {
            config[keyWithoutJavascript][i] = undefined;
          }
        }
      }
      delete config[key];
    } else if (typeof config[key] === "object") {
      evaluateConfig(config[key], hass);
    } else if (key.endsWith("_javascript")) {
      const states = hass?.states ?? undefined;
      const user = hass?.user ?? undefined;
      const prefix = `
        var states = ${JSON.stringify(states)};
        var user = ${JSON.stringify(user)};
      `;
      const keyWithoutJavascript = key.replace("_javascript", "");
      const stringToEvaluatate = `${prefix} ${config[key]}`;
      try {
        config[keyWithoutJavascript] = eval(stringToEvaluatate);
        delete config[key];
      } catch (error) {
        config[keyWithoutJavascript] = undefined;
      }
    }
  }
}
