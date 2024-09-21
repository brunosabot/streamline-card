import { describe, expect, it } from "vitest";
import formatVariables from "./formatVariables-helper";

describe("Given the formatVariables function", () => {
  describe("When passing an object", () => {
    it("should return the object untouched", () => {
      const variables = { name: "Obi Wan Kenobi" };

      const result = formatVariables({ ...variables });
      expect(result).toEqual(variables);
    });
  });

  describe("When passing an array of objects", () => {
    it("should return an object version of the array", () => {
      const variables = [{ name: "Obi Wan Kenobi" }];

      const result = formatVariables(variables);
      expect(result).toEqual({
        name: "Obi Wan Kenobi",
      });
    });
  });

  describe("When passing an array of objects with duplicate keys", () => {
    it("should return an object version of the array, keeping the last value", () => {
      const variables = [{ name: "Obi Wan Kenobi" }, { name: "Darth Vader" }];

      const result = formatVariables(variables);
      expect(result).toEqual({
        name: "Darth Vader",
      });
    });
  });
});
