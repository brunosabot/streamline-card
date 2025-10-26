const functionCache = new Map();

const createEvaluationContext = (hass, variables) => ({
  areas: hass?.areas,
  states: hass?.states,
  user: hass?.user,
  variables,
});

const createFunction = (code, cacheKey) => {
  if (!functionCache.has(cacheKey)) {
    try {
      functionCache.set(
        cacheKey,
        // eslint-disable-next-line no-new-func
        new Function("states", "user", "variables", "areas", code),
      );
    } catch (error) {
      throw new Error(`Failed to compile JavaScript: ${error.message}`, {
        cause: error,
      });
    }
  }
  return functionCache.get(cacheKey);
};

const processValue = (value, context) => {
  if (typeof value === "string") {
    const cacheKey = value;
    const fn = createFunction(value, cacheKey);

    return fn(context.states, context.user, context.variables, context.areas);
  }
  return value;
};

const processConfig = (template, hass, variables) => {
  const context = createEvaluationContext(hass, variables);

  for (const [key, value] of Object.entries(template)) {
    if (Array.isArray(value)) {
      const newArray = [];
      for (const item of value) {
        if (typeof item === "object") {
          processConfig(item, hass, variables);
          newArray.push(item);
        } else if (key.endsWith("_javascript")) {
          const processedValue = processValue(item, context);
          newArray.push(processedValue);
        } else {
          newArray.push(item);
        }
      }
      if (key.endsWith("_javascript")) {
        template[key.replace("_javascript", "")] = newArray;
        delete template[key];
      } else {
        template[key] = newArray;
      }
    } else if (typeof value === "object") {
      processConfig(value, hass, variables);
    } else if (key.endsWith("_javascript")) {
      const processedValue = processValue(value, context);
      template[key.replace("_javascript", "")] = processedValue;
      delete template[key];
    }
  }
};

const evaluateJavascript = (config, hass, variables = {}) => {
  processConfig(config, hass, variables);
  return config;
};

export default evaluateJavascript;
