export default function formatVariables(variables) {
  const formattedVariables = {};

  if (variables instanceof Array) {
    variables.forEach((variable) => {
      Object.entries(variable).forEach(([key, value]) => {
        formattedVariables[key] = value;
      });
    });
  } else {
    return variables;
  }

  return formattedVariables;
}
