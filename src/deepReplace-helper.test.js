import { describe, expect, it } from "vitest";
import deepReplace from "./deepReplace-helper";

describe("Given the deepReplace function", () => {
  describe("When passing a template config with no variables and no default variable", () => {
    it("should return the template config untouched", () => {
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          name: "[[name]]",
          type: "custom:button-card",
        },
      };

      const result = deepReplace(templateConfig);
      expect(result).toEqual({
        entity: "input_boolean.test",
        name: "[[name]]",
        type: "custom:button-card",
      });
    });
  });

  describe("When passing a template config with no variable but a default variable", () => {
    it("should replace the default variable", () => {
      const variables = [];
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          name: "[[name]]",
          type: "custom:button-card",
        },
        default: [{ name: "Ashoka Tano" }],
      };

      const result = deepReplace(templateConfig, variables);
      expect(result).toEqual({
        entity: "input_boolean.test",
        name: "Ashoka Tano",
        type: "custom:button-card",
      });
    });
  });

  describe("When passing a template config with string variables", () => {
    it("should replace the variables", () => {
      const variables = [{ name: "Obi Wan Kenobi" }];
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          name: "[[name]]",
          type: "custom:button-card",
        },
        default: [{ name: "Ashoka Tano" }],
      };

      const result = deepReplace(templateConfig, variables);
      expect(result).toEqual({
        entity: "input_boolean.test",
        name: "Obi Wan Kenobi",
        type: "custom:button-card",
      });
    });
  });

  describe("When passing a template config with number variables", () => {
    it("should replace the variables", () => {
      const variables = [{ saber_count: 7 }];
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          saber_count: "[[saber_count]]",
          type: "custom:button-card",
        },
        default: [{ saber_count: 1 }],
      };

      const result = deepReplace(templateConfig, variables);
      expect(result).toEqual({
        entity: "input_boolean.test",
        saber_count: 7,
        type: "custom:button-card",
      });
    });
  });

  describe("When passing a template config with boolean variables", () => {
    it("should replace the variables", () => {
      const variables = [{ is_jedi_master: true }];
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          is_jedi_master: "[[is_jedi_master]]",
          type: "custom:button-card",
        },
        default: [{ is_jedi_master: false }],
      };

      const result = deepReplace(templateConfig, variables);
      expect(result).toEqual({
        entity: "input_boolean.test",
        is_jedi_master: true,
        type: "custom:button-card",
      });
    });
  });

  describe("When passing a template config with object variables", () => {
    it("should replace the variables", () => {
      const variables = [{ user: { name: "Obi Wan Kenobi" } }];
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          type: "custom:button-card",
          user: "[[user]]",
        },
        default: [{ user: { name: "Darth Vader" } }],
      };

      const result = deepReplace(templateConfig, variables);
      expect(result).toEqual({
        entity: "input_boolean.test",
        type: "custom:button-card",
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
          entity: "input_boolean.test",
          type: "custom:button-card",
          user: "[[user]]",
        },
      };

      const result = deepReplace(templateConfig, variables);
      expect(result).toEqual({
        entity: "input_boolean.test",
        type: "custom:button-card",
        user: { name: "Obi Wan Kenobi" },
      });
    });
  });
});
