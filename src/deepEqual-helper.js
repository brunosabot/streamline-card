const compareArraysDeep = (arr1, arr2, compareFn) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let index = 0; index < arr1.length; index += 1) {
    if (compareFn(arr1[index], arr2[index]) === false) {
      return false;
    }
  }
  return true;
};

const compareObjectsDeep = (obj1, obj2, compareFn) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  if (keys1.length === 0) {
    return true;
  }

  for (let index = 0; index < keys1.length; index += 1) {
    const key = keys1[index];
    if (
      Object.hasOwn(obj2, key) === false ||
      compareFn(obj1[key], obj2[key]) === false
    ) {
      return false;
    }
  }

  return true;
};

const isSpecialType = (obj) =>
  obj instanceof Date ||
  obj instanceof RegExp ||
  obj instanceof Set ||
  obj instanceof Map;

const compareDates = (date1, date2) => date1.getTime() === date2.getTime();

const compareRegExps = (regex1, regex2) =>
  regex1.source === regex2.source && regex1.flags === regex2.flags;

const compareSets = (set1, set2) => {
  if (set1.size !== set2.size) {
    return false;
  }
  for (const item of set1) {
    if (set2.has(item) === false) {
      return false;
    }
  }
  return true;
};

const compareMaps = (map1, map2, compareFn) => {
  if (map1.size !== map2.size) {
    return false;
  }
  for (const [key, value] of map1) {
    if (map2.has(key) === false || compareFn(map2.get(key), value) === false) {
      return false;
    }
  }
  return true;
};

const compareSpecialTypes = (obj1, obj2, compareFn) => {
  const isSpecial1 = isSpecialType(obj1);
  const isSpecial2 = isSpecialType(obj2);

  // If one is special and the other isn't, they're not equal
  if (isSpecial1 !== isSpecial2) {
    return false;
  }

  // If neither is special, return null to continue with normal comparison
  if (isSpecial1 === false) {
    return null;
  }

  // Check specific types
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return compareDates(obj1, obj2);
  }
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
    return compareRegExps(obj1, obj2);
  }
  if (obj1 instanceof Set && obj2 instanceof Set) {
    return compareSets(obj1, obj2);
  }
  if (obj1 instanceof Map && obj2 instanceof Map) {
    return compareMaps(obj1, obj2, compareFn);
  }

  // Different special types (e.g., Date vs RegExp)
  return false;
};

const deepEqual = (obj1, obj2) => {
  // Fast path: reference equality
  if (obj1 === obj2) {
    return true;
  }

  // Fast path: null/undefined checks
  if (
    obj1 === null ||
    obj1 === undefined ||
    obj2 === null ||
    obj2 === undefined
  ) {
    return false;
  }

  // Fast path: type mismatch
  const type1 = typeof obj1;
  const type2 = typeof obj2;
  if (type1 !== type2) {
    return false;
  }

  // Fast path: primitives
  if (type1 !== "object") {
    return obj1 === obj2;
  }

  // Check special types
  const specialResult = compareSpecialTypes(obj1, obj2, deepEqual);
  if (specialResult !== null) {
    return specialResult;
  }

  // Fast path: array vs object
  const isArray1 = Array.isArray(obj1);
  const isArray2 = Array.isArray(obj2);
  if (isArray1 !== isArray2) {
    return false;
  }

  return isArray1
    ? compareArraysDeep(obj1, obj2, deepEqual)
    : compareObjectsDeep(obj1, obj2, deepEqual);
};

export default deepEqual;
