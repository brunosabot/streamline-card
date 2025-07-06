import { describe, expect, it } from "vitest";
import evaluateVariables, {
  replaceWithKeyValue,
} from "./evaluateVariables-helper";

describe("Given the replaceWithKeyValue function", () => {
  describe("When passing a string template with a string variable", () => {
    it("should replace the variable", () => {
      const stringTemplate = `{ name: "[[name]]" }`;
      const key = "name";
      const value = "Obi Wan Kenobi";

      const result = replaceWithKeyValue(stringTemplate, key, value);
      expect(result).toEqual(`{ name: "Obi Wan Kenobi" }`);
    });
  });

  describe("When passing a string template with a number variable", () => {
    it("should replace the variable", () => {
      const stringTemplate = `{ saber_count: "[[saber_count]]" }`;
      const key = "saber_count";
      const value = 7;

      const result = replaceWithKeyValue(stringTemplate, key, value);
      expect(result).toEqual(`{ saber_count: 7 }`);
    });
  });

  describe("When passing a string template with a boolean variable", () => {
    it("should replace the variable", () => {
      const stringTemplate = `{ is_jedi_master: "[[is_jedi_master]]" }`;
      const key = "is_jedi_master";
      const value = true;

      const result = replaceWithKeyValue(stringTemplate, key, value);
      expect(result).toEqual(`{ is_jedi_master: true }`);
    });
  });

  describe("When passing a string template with an object variable", () => {
    it("should replace the variable", () => {
      const stringTemplate = `{ user: "[[user]]" }`;
      const key = "user";
      const value = { name: "Obi Wan Kenobi" };

      const result = replaceWithKeyValue(stringTemplate, key, value);
      expect(result).toEqual(`{ user: {"name":"Obi Wan Kenobi"} }`);
    });
  });
});

describe("Given the evaluateVariables function", () => {
  describe("When passing a template config with no variables and no default variable", () => {
    it("should return the template config untouched", () => {
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          name: "[[name]]",
          type: "custom:button-card",
        },
      };

      const result = evaluateVariables(templateConfig);
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

      const result = evaluateVariables(templateConfig, variables);
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

      const result = evaluateVariables(templateConfig, variables);
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

      const result = evaluateVariables(templateConfig, variables);
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

      const result = evaluateVariables(templateConfig, variables);
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

      const result = evaluateVariables(templateConfig, variables);
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

      const result = evaluateVariables(templateConfig, variables);
      expect(result).toEqual({
        entity: "input_boolean.test",
        type: "custom:button-card",
        user: { name: "Obi Wan Kenobi" },
      });
    });
  });

  describe("When the template has a default variables of all types", () => {
    it("should replace the default variable", () => {
      const variables = [];
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          is_jedi_master: "[[is_jedi_master]]",
          name: "[[name]]",
          planet: "[[planet]]",
          saber_count: "[[saber_count]]",
          type: "custom:button-card",
        },
        default: [
          {
            is_jedi_master: true,
            name: { first: "Ashoka", last: "Tano" },
            planet: "Tatooine",
            saber_count: 7,
          },
        ],
      };

      const result = evaluateVariables(templateConfig, variables);
      expect(result).toEqual({
        entity: "input_boolean.test",
        is_jedi_master: true,
        name: { first: "Ashoka", last: "Tano" },
        planet: "Tatooine",
        saber_count: 7,
        type: "custom:button-card",
      });
    });
  });

  describe("When the template has a key with multiple variables", () => {
    it.only("should replace the variables", () => {
      const variables = [{ maquina: "bathroom" }];
      const templateConfig = {
        card: {
          entities: [
            { entity: "sensor.aqara_temperature_[[maquina]]_pressure" },
          ],
          hours_to_show: "[[hours]]",
          title: "[[maquina]] - [[hours]] h",
          type: "history-graph",
        },
        default: [{ hours: 8 }],
      };

      const result = evaluateVariables(templateConfig, variables);
      expect(result).toEqual({
        entities: [{ entity: "sensor.aqara_temperature_bathroom_pressure" }],
        hours_to_show: 8,
        title: "bathroom - 8 h",
        type: "history-graph",
      });
    });
  });
});
