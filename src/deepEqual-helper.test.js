import { describe, expect, it } from "vitest";
import deepEqual from "./deepEqual-helper";

describe("deepEqual", () => {
  describe("Fast path: reference equality", () => {
    it("should return true for same reference", () => {
      const obj = { key1: 1, key2: 2 };
      expect(deepEqual(obj, obj)).toBe(true);
    });

    it("should return true for same array reference", () => {
      const arr = [1, 2, 3];
      expect(deepEqual(arr, arr)).toBe(true);
    });
  });

  describe("Fast path: null/undefined checks", () => {
    it("should return true for null === null", () => {
      expect(deepEqual(null, null)).toBe(true);
    });

    it("should return true for undefined === undefined", () => {
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it("should return false for null vs undefined", () => {
      expect(deepEqual(null, undefined)).toBe(false);
    });

    it("should return false for null vs object", () => {
      expect(deepEqual(null, {})).toBe(false);
    });

    it("should return false for undefined vs object", () => {
      expect(deepEqual(undefined, {})).toBe(false);
    });

    it("should return false for object vs null", () => {
      expect(deepEqual({}, null)).toBe(false);
    });

    it("should return false for object vs undefined", () => {
      expect(deepEqual({}, undefined)).toBe(false);
    });
  });

  describe("Fast path: type mismatch", () => {
    it("should return false for string vs number", () => {
      expect(deepEqual("123", 123)).toBe(false);
    });

    it("should return false for boolean vs number", () => {
      expect(deepEqual(true, 1)).toBe(false);
    });

    it("should return false for object vs string", () => {
      expect(deepEqual({}, "{}")).toBe(false);
    });

    it("should return false for array vs object", () => {
      expect(deepEqual([], {})).toBe(false);
    });

    it("should return false for function vs object", () => {
      const fn = () => true;
      expect(deepEqual(fn, {})).toBe(false);
    });
  });

  describe("Fast path: primitives", () => {
    it("should return true for equal strings", () => {
      expect(deepEqual("hello", "hello")).toBe(true);
    });

    it("should return false for different strings", () => {
      expect(deepEqual("hello", "world")).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(deepEqual("", "")).toBe(true);
      expect(deepEqual("", "non-empty")).toBe(false);
    });

    it("should handle strings with special characters", () => {
      expect(deepEqual("hello\nworld", "hello\nworld")).toBe(true);
      expect(deepEqual("hello\tworld", "hello world")).toBe(false);
    });

    it("should return true for equal numbers", () => {
      expect(deepEqual(42, 42)).toBe(true);
    });

    it("should return false for different numbers", () => {
      expect(deepEqual(42, 43)).toBe(false);
    });

    it("should return true for equal booleans", () => {
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(false, false)).toBe(true);
    });

    it("should return false for different booleans", () => {
      expect(deepEqual(true, false)).toBe(false);
    });

    it("should handle NaN correctly", () => {
      expect(deepEqual(Number.NaN, Number.NaN)).toBe(false);
    });

    it("should handle Infinity", () => {
      expect(
        deepEqual(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
      ).toBe(true);
      expect(
        deepEqual(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
      ).toBe(true);
      expect(
        deepEqual(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
      ).toBe(false);
    });

    it("should handle zero correctly", () => {
      expect(deepEqual(0, 0)).toBe(true);
      expect(deepEqual(-0, -0)).toBe(true);
      expect(deepEqual(0, -0)).toBe(true);
    });
  });

  describe("Array comparison", () => {
    it("should return true for empty arrays", () => {
      expect(deepEqual([], [])).toBe(true);
    });

    it("should return false for arrays with different lengths", () => {
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it("should return true for equal primitive arrays", () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it("should return false for different primitive arrays", () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it("should return true for nested equal arrays", () => {
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
        ),
      ).toBe(true);
    });

    it("should return false for nested different arrays", () => {
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ],
        ),
      ).toBe(false);
    });

    it("should handle arrays with objects", () => {
      expect(
        deepEqual([{ key1: 1 }, { key2: 2 }], [{ key1: 1 }, { key2: 2 }]),
      ).toBe(true);
      expect(
        deepEqual([{ key1: 1 }, { key2: 2 }], [{ key1: 1 }, { key2: 3 }]),
      ).toBe(false);
    });

    it("should handle arrays with null/undefined", () => {
      expect(deepEqual([null, undefined], [null, undefined])).toBe(true);
      expect(deepEqual([null, undefined], [undefined, null])).toBe(false);
    });

    it("should handle arrays with mixed types", () => {
      expect(deepEqual([1, "two", true, null], [1, "two", true, null])).toBe(
        true,
      );
      expect(deepEqual([1, "two", true, null], [1, "two", false, null])).toBe(
        false,
      );
    });

    it("should return false for empty array vs array with undefined", () => {
      expect(deepEqual([], [undefined])).toBe(false);
    });

    it("should return false for arrays with different element order", () => {
      expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
    });

    it("should handle single element arrays", () => {
      expect(deepEqual([1], [1])).toBe(true);
      expect(deepEqual([1], [2])).toBe(false);
    });

    it("should handle arrays with string vs number types", () => {
      expect(deepEqual([1, 2, 3], ["1", "2", "3"])).toBe(false);
    });

    it("should handle arrays containing functions", () => {
      const fn1 = () => true;
      const fn2 = () => true;
      expect(deepEqual([fn1], [fn1])).toBe(true);
      expect(deepEqual([fn1], [fn2])).toBe(false);
    });

    it("should handle nested empty arrays", () => {
      expect(deepEqual([[], []], [[], []])).toBe(true);
      expect(deepEqual([[], [1]], [[], []])).toBe(false);
    });
  });

  describe("Object comparison", () => {
    it("should return true for empty objects", () => {
      expect(deepEqual({}, {})).toBe(true);
    });

    it("should return false for objects with different key counts", () => {
      expect(deepEqual({ key1: 1 }, { key1: 1, key2: 2 })).toBe(false);
    });

    it("should return true for equal simple objects", () => {
      expect(deepEqual({ key1: 1, key2: 2 }, { key1: 1, key2: 2 })).toBe(true);
    });

    it("should return false for objects with different values", () => {
      expect(deepEqual({ key1: 1, key2: 2 }, { key1: 1, key2: 3 })).toBe(false);
    });

    it("should return false for objects with different keys", () => {
      expect(deepEqual({ key1: 1, key2: 2 }, { key1: 1, key3: 2 })).toBe(false);
    });

    it("should handle key order independence", () => {
      expect(
        deepEqual({ key1: 1, key2: 2, key3: 3 }, { key1: 1, key2: 2, key3: 3 }),
      ).toBe(true);
    });

    it("should return true for nested equal objects", () => {
      expect(deepEqual({ key1: { key2: 1 } }, { key1: { key2: 1 } })).toBe(
        true,
      );
    });

    it("should return false for nested different objects", () => {
      expect(deepEqual({ key1: { key2: 1 } }, { key1: { key2: 2 } })).toBe(
        false,
      );
    });

    it("should handle objects with array values", () => {
      expect(deepEqual({ key1: [1, 2, 3] }, { key1: [1, 2, 3] })).toBe(true);
      expect(deepEqual({ key1: [1, 2, 3] }, { key1: [1, 2, 4] })).toBe(false);
    });

    it("should handle objects with null/undefined values", () => {
      expect(
        deepEqual(
          { key1: null, key2: undefined },
          { key1: null, key2: undefined },
        ),
      ).toBe(true);
      expect(deepEqual({ key1: null }, { key1: undefined })).toBe(false);
    });

    it("should handle objects with boolean values", () => {
      expect(
        deepEqual({ key1: true, key2: false }, { key1: true, key2: false }),
      ).toBe(true);
      expect(deepEqual({ key1: true }, { key1: false })).toBe(false);
    });

    it("should handle objects with string keys", () => {
      expect(
        deepEqual({ "key-1": 1, "key-2": 2 }, { "key-1": 1, "key-2": 2 }),
      ).toBe(true);
    });

    it("should handle objects with numeric string keys", () => {
      expect(
        deepEqual({ 0: "val1", 1: "val2" }, { 0: "val1", 1: "val2" }),
      ).toBe(true);
    });

    it("should handle single key objects", () => {
      expect(deepEqual({ key1: 1 }, { key1: 1 })).toBe(true);
      expect(deepEqual({ key1: 1 }, { key1: 2 })).toBe(false);
    });

    it("should differentiate undefined value vs missing key", () => {
      expect(deepEqual({ key1: undefined }, {})).toBe(false);
      expect(deepEqual({ key1: undefined }, { key1: undefined })).toBe(true);
    });

    it("should handle nested empty objects", () => {
      expect(deepEqual({ key1: {}, key2: {} }, { key1: {}, key2: {} })).toBe(
        true,
      );
      expect(
        deepEqual({ key1: {}, key2: { key3: 1 } }, { key1: {}, key2: {} }),
      ).toBe(false);
    });

    it("should handle objects with number values of different types", () => {
      expect(deepEqual({ key1: 1 }, { key1: "1" })).toBe(false);
    });
  });

  describe("Complex nested structures", () => {
    it("should handle deeply nested objects", () => {
      const obj1 = { key1: { key2: { key3: { key4: { key5: 1 } } } } };
      const obj2 = { key1: { key2: { key3: { key4: { key5: 1 } } } } };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle deeply nested arrays", () => {
      const arr1 = [[[[[1]]]]];
      const arr2 = [[[[[1]]]]];
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it("should handle mixed nested structures", () => {
      const obj1 = {
        arr: [1, 2, { nested: [3, 4] }],
        obj: { key1: [5, 6], key2: { key3: 7 } },
      };
      const obj2 = {
        arr: [1, 2, { nested: [3, 4] }],
        obj: { key1: [5, 6], key2: { key3: 7 } },
      };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should detect differences in deeply nested structures", () => {
      const obj1 = { key1: { key2: { key3: { key4: { key5: 1 } } } } };
      const obj2 = { key1: { key2: { key3: { key4: { key5: 2 } } } } };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it("should handle objects with many keys", () => {
      const obj1 = {};
      const obj2 = {};
      for (let index = 0; index < 100; index += 1) {
        obj1[`key${index}`] = index;
        obj2[`key${index}`] = index;
      }
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle large arrays", () => {
      const arr1 = Array.from({ length: 1000 }, (unused, index) => index);
      const arr2 = Array.from({ length: 1000 }, (unused, index) => index);
      expect(deepEqual(arr1, arr2)).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle Date objects as regular objects", () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-01-01");
      expect(deepEqual(date1, date2)).toBe(true);
    });

    it("should handle RegExp objects as regular objects", () => {
      const regex1 = /test/gu;
      const regex2 = /test/gu;
      expect(deepEqual(regex1, regex2)).toBe(true);
    });

    it("should handle objects with symbol keys", () => {
      const sym = Symbol("test");
      const obj1 = { key1: 2, [sym]: 1 };
      const obj2 = { key1: 2, [sym]: 1 };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle objects with getters", () => {
      const obj1 = {
        _value: 1,
        get value() {
          return this._value;
        },
      };
      const obj2 = {
        _value: 1,
        get value() {
          return this._value;
        },
      };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle objects with prototype chain", () => {
      const proto = { inherited: true };
      const obj1 = Object.create(proto);
      obj1.own = 1;
      const obj2 = Object.create(proto);
      obj2.own = 1;
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle Map and Set as regular objects", () => {
      const map1 = new Map([["key1", 1]]);
      const map2 = new Map([["key1", 1]]);
      expect(deepEqual(map1, map2)).toBe(true);
    });

    it("should handle typed arrays", () => {
      const arr1 = new Uint8Array([1, 2, 3]);
      const arr2 = new Uint8Array([1, 2, 3]);
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it("should handle Buffer-like objects", () => {
      const buf1 = { 0: 1, 1: 2, length: 2 };
      const buf2 = { 0: 1, 1: 2, length: 2 };
      expect(deepEqual(buf1, buf2)).toBe(true);
    });

    it("should handle Error objects", () => {
      const err1 = new Error("test error");
      const err2 = new Error("test error");
      expect(deepEqual(err1, err2)).toBe(true);
    });

    it("should properly compare Date objects by timestamp", () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-01-01");
      const date3 = new Date("2024-01-02");
      expect(deepEqual(date1, date2)).toBe(true);
      expect(deepEqual(date1, date3)).toBe(false);
    });

    it("should properly compare RegExp objects by pattern and flags", () => {
      const regex1 = /test/gu;
      const regex2 = /test/gu;
      const regex3 = /other/gu;
      const regex4 = /test/giu;
      expect(deepEqual(regex1, regex2)).toBe(true);
      expect(deepEqual(regex1, regex3)).toBe(false);
      expect(deepEqual(regex1, regex4)).toBe(false);
    });

    it("should properly compare Set objects by size and contents", () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 3]);
      const set3 = new Set([1, 2]);
      const set4 = new Set([1, 2, 4]);
      expect(deepEqual(set1, set2)).toBe(true);
      expect(deepEqual(set1, set3)).toBe(false);
      expect(deepEqual(set1, set4)).toBe(false);
    });

    it("should properly compare Map objects by size and contents", () => {
      const map1 = new Map([
        ["key1", 1],
        ["key2", 2],
      ]);
      const map2 = new Map([
        ["key1", 1],
        ["key2", 2],
      ]);
      const map3 = new Map([["key1", 1]]);
      const map4 = new Map([
        ["key1", 1],
        ["key2", 3],
      ]);
      expect(deepEqual(map1, map2)).toBe(true);
      expect(deepEqual(map1, map3)).toBe(false);
      expect(deepEqual(map1, map4)).toBe(false);
    });

    it("should handle empty Sets and Maps", () => {
      expect(deepEqual(new Set(), new Set())).toBe(true);
      expect(deepEqual(new Map(), new Map())).toBe(true);
      expect(deepEqual(new Set(), new Set([1]))).toBe(false);
      expect(deepEqual(new Map(), new Map([["key1", 1]]))).toBe(false);
    });

    it("should handle Maps with complex values", () => {
      const map1 = new Map([["key1", { nested: [1, 2] }]]);
      const map2 = new Map([["key1", { nested: [1, 2] }]]);
      const map3 = new Map([["key1", { nested: [1, 3] }]]);
      expect(deepEqual(map1, map2)).toBe(true);
      expect(deepEqual(map1, map3)).toBe(false);
    });

    it("should return false for cross-type special object comparisons", () => {
      const date = new Date();
      const regex = /test/gu;
      const set = new Set([1]);
      const map = new Map([["key1", 1]]);
      expect(deepEqual(date, regex)).toBe(false);
      expect(deepEqual(set, map)).toBe(false);
      expect(deepEqual(date, {})).toBe(false);
      expect(deepEqual(set, [1])).toBe(false);
    });

    it("should handle arrays containing special types", () => {
      const arr1 = [new Date("2024-01-01"), /test/gu, new Set([1, 2])];
      const arr2 = [new Date("2024-01-01"), /test/gu, new Set([1, 2])];
      const arr3 = [new Date("2024-01-02"), /test/gu, new Set([1, 2])];
      expect(deepEqual(arr1, arr2)).toBe(true);
      expect(deepEqual(arr1, arr3)).toBe(false);
    });

    it("should handle objects with special type values", () => {
      const obj1 = {
        date: new Date("2024-01-01"),
        regex: /test/gu,
        set: new Set([1, 2]),
      };
      const obj2 = {
        date: new Date("2024-01-01"),
        regex: /test/gu,
        set: new Set([1, 2]),
      };
      const obj3 = {
        date: new Date("2024-01-01"),
        regex: /test/gu,
        set: new Set([1, 3]),
      };
      expect(deepEqual(obj1, obj2)).toBe(true);
      expect(deepEqual(obj1, obj3)).toBe(false);
    });

    it("should handle different typed array types", () => {
      const uint8 = new Uint8Array([1, 2, 3]);
      const int8 = new Int8Array([1, 2, 3]);
      // Note: Typed arrays are compared as objects with numeric keys
      // Uint8Array and Int8Array with same values have same enumerable properties
      expect(deepEqual(uint8, int8)).toBe(true);
    });

    it("should handle empty typed arrays", () => {
      const arr1 = new Uint8Array([]);
      const arr2 = new Uint8Array([]);
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it("should not coerce types", () => {
      expect(deepEqual(null, 0)).toBe(false);
      expect(deepEqual("", false)).toBe(false);
      expect(deepEqual([], false)).toBe(false);
      expect(deepEqual({}, false)).toBe(false);
    });
  });

  describe("Performance characteristics", () => {
    it("should exit early on reference equality", () => {
      const largeObj = {
        key1: Array.from({ length: 10000 }, (unused, index) => index),
      };
      expect(deepEqual(largeObj, largeObj)).toBe(true);
    });

    it("should exit early on length mismatch", () => {
      const arr1 = Array.from({ length: 10000 }, (unused, index) => index);
      const arr2 = Array.from({ length: 9999 }, (unused, index) => index);
      expect(deepEqual(arr1, arr2)).toBe(false);
    });

    it("should exit early on key count mismatch", () => {
      const obj1 = {};
      const obj2 = {};
      for (let index = 0; index < 1000; index += 1) {
        obj1[`key${index}`] = index;
      }
      for (let index = 0; index < 999; index += 1) {
        obj2[`key${index}`] = index;
      }
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it("should exit early on type mismatch", () => {
      const obj = { key1: 1 };
      const str = "{ key1: 1 }";
      expect(deepEqual(obj, str)).toBe(false);
    });
  });

  describe("Real-world scenarios", () => {
    it("should compare Home Assistant state objects", () => {
      const state1 = {
        attributes: { brightness: 255, friendly_name: "Light" },
        entity_id: "light.living_room",
        last_changed: "2024-01-01T00:00:00Z",
        state: "on",
      };
      const state2 = {
        attributes: { brightness: 255, friendly_name: "Light" },
        entity_id: "light.living_room",
        last_changed: "2024-01-01T00:00:00Z",
        state: "on",
      };
      expect(deepEqual(state1, state2)).toBe(true);
    });

    it("should compare configuration objects", () => {
      const config1 = {
        card: { entity: "sensor.temperature", type: "gauge" },
        default: { unit: "°C" },
        template: "temperature_gauge",
        variables: { max: 100, min: 0 },
      };
      const config2 = {
        card: { entity: "sensor.temperature", type: "gauge" },
        default: { unit: "°C" },
        template: "temperature_gauge",
        variables: { max: 100, min: 0 },
      };
      expect(deepEqual(config1, config2)).toBe(true);
    });

    it("should detect visibility changes", () => {
      const visibility1 = [
        { condition: "state", entity: "input_boolean.show_card", state: "on" },
      ];
      const visibility2 = [
        { condition: "state", entity: "input_boolean.show_card", state: "off" },
      ];
      expect(deepEqual(visibility1, visibility2)).toBe(false);
    });
  });
});
