export const deepClone = (obj) => {
  if (structuredClone) {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
};

export default deepClone;
