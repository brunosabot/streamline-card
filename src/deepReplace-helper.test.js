import { describe, expect, it } from "vitest";
import deepReplace from "./deepReplace-helper";

describe("Given the deepReplace function", () => {
  describe("When passing a template config with no variables and no default variable", () => {
    it("should return the template config untouched", () => {
      const variables = undefined;
      const templateConfig = {
        card: {
          type: "custom:button-card",
          entity: "input_boolean.test",
          name: "[[name]]",
        },
      };

      const result = deepReplace(variables, templateConfig);
      expect(result).toEqual({
        type: "custom:button-card",
        entity: "input_boolean.test",
        name: "[[name]]",
      });
    });
  });

  describe("When passing a template config with no variable but a default variable", () => {
    it("should replace the default variable", () => {
      const variables = [];
      const templateConfig = {
        default: [{ name: "Ashoka Tano" }],
        card: {
          type: "custom:button-card",
          entity: "input_boolean.test",
          name: "[[name]]",
        },
      };

      const result = deepReplace(variables, templateConfig);
      expect(result).toEqual({
        type: "custom:button-card",
        entity: "input_boolean.test",
        name: "Ashoka Tano",
      });
    });
  });

  describe("When passing a template config with string variables", () => {
    it("should replace the variables", () => {
      const variables = [{ name: "Obi Wan Kenobi" }];
      const templateConfig = {
        default: [{ name: "Ashoka Tano" }],
        card: {
          type: "custom:button-card",
          entity: "input_boolean.test",
          name: "[[name]]",
        },
      };

      const result = deepReplace(variables, templateConfig);
      expect(result).toEqual({
        type: "custom:button-card",
        entity: "input_boolean.test",
        name: "Obi Wan Kenobi",
      });
    });
  });

  describe("When passing a template config with number variables", () => {
    it("should replace the variables", () => {
      const variables = [{ saber_count: 7 }];
      const templateConfig = {
        default: [{ saber_count: 1 }],
        card: {
          type: "custom:button-card",
          entity: "input_boolean.test",
          saber_count: "[[saber_count]]",
        },
      };

      const result = deepReplace(variables, templateConfig);
      expect(result).toEqual({
        type: "custom:button-card",
        entity: "input_boolean.test",
        saber_count: 7,
      });
    });
  });

  describe("When passing a template config with boolean variables", () => {
    it("should replace the variables", () => {
      const variables = [{ is_jedi_master: true }];
      const templateConfig = {
        default: [{ is_jedi_master: false }],
        card: {
          type: "custom:button-card",
          entity: "input_boolean.test",
          is_jedi_master: "[[is_jedi_master]]",
        },
      };

      const result = deepReplace(variables, templateConfig);
      expect(result).toEqual({
        type: "custom:button-card",
        entity: "input_boolean.test",
        is_jedi_master: true,
      });
    });
  });

  describe("When passing a template config with object variables", () => {
    it("should replace the variables", () => {
      const variables = [{ user: { name: "Obi Wan Kenobi" } }];
      const templateConfig = {
        default: [{ user: { name: "Darth Vader" } }],
        card: {
          type: "custom:button-card",
          entity: "input_boolean.test",
          user: "[[user]]",
        },
      };

      const result = deepReplace(variables, templateConfig);
      expect(result).toEqual({
        type: "custom:button-card",
        entity: "input_boolean.test",
        user: { name: "Obi Wan Kenobi" },
      });
    });
  });

  describe("When passing a template config for an element with array variables", () => {
    it("should replace the variables", () => {
      const variables = [{ user: { name: "Obi Wan Kenobi" } }];
      const templateConfig = {
        default: [{ user: { name: "Darth Vader" } }],
        element: {
          type: "custom:button-card",
          entity: "input_boolean.test",
          user: "[[user]]",
        },
      };

      const result = deepReplace(variables, templateConfig);
      expect(result).toEqual({
        type: "custom:button-card",
        entity: "input_boolean.test",
        user: { name: "Obi Wan Kenobi" },
      });
    });
  });
});
