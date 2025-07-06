const isPrimitive = (obj) => obj !== Object(obj);
const isDefined = (obj) => obj !== null && obj !== undefined;

const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) {
    return true;
  }

  if (isPrimitive(obj1) && isPrimitive(obj2)) {
    return obj1 === obj2;
  }

  if (isDefined(obj1) === false || isDefined(obj2) === false) {
    return false;
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  for (const key in obj1) {
    if (Object.hasOwn(obj1, key)) {
      if (key in obj2 === false) {
        return false;
      }
      if (deepEqual(obj1[key], obj2[key]) === false) {
        return false;
      }
    }
  }

  return true;
};

export default deepEqual;
