const getPrefixFromHass = (hass) => {
  const states = hass?.states ?? undefined;
  const user = hass?.user ?? undefined;
  return `
    var states = ${JSON.stringify(states)};
    var user = ${JSON.stringify(user)};
  `;
};

// eslint-disable-next-line no-eval
const doEval = (string) => eval(string);

const evaluateJavascript = (config, hass) => {
  const configKeys = Object.keys(config);

  for (const key of configKeys) {
    if (config[key] instanceof Array) {
      let latestError = undefined;
      for (let index = 0; index < config[key].length; index += 1) {
        if (typeof config[key][index] === "object") {
          evaluateJavascript(config[key][index], hass);
        } else if (key.endsWith("_javascript")) {
          const prefix = getPrefixFromHass(hass);
          const keyWithoutJavascript = key.replace("_javascript", "");
          try {
            config[keyWithoutJavascript] ||= [];
            config[keyWithoutJavascript][index] = doEval(
              `${prefix} ${config[key][index]}`,
            );
          } catch (error) {
            latestError = error;
          }
        }
      }
      if (key.endsWith("_javascript")) {
        if (typeof latestError === "undefined") {
          delete config[key];
        } else {
          delete config[key.replace("_javascript", "")];
          throw latestError;
        }
      }
    } else if (typeof config[key] === "object") {
      evaluateJavascript(config[key], hass);
    } else if (key.endsWith("_javascript")) {
      const prefix = getPrefixFromHass(hass);
      const keyWithoutJavascript = key.replace("_javascript", "");

      config[keyWithoutJavascript] = doEval(`${prefix} ${config[key]}`);
      delete config[key];
    }
  }

  return config;
};

export default evaluateJavascript;
