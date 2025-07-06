import { describe, expect, it } from "vitest";
import evaluateConfig from "./evaluteConfig-helper";

describe("Given the evaluateConfig function", () => {
  describe("When passing a template config with no variables and no default variable", () => {
    it("should return the template config untouched", () => {
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          name: "[[name]]",
          type: "custom:button-card",
        },
      };

      const result = evaluateConfig(templateConfig, [], {
        hasJavascript: true,
      });
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

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
      });
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

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
      });
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

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
      });
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

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
      });
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

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
      });
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

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
      });
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

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
      });
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

  describe("When passing a template with Javascript variables and no hass object", () => {
    it("should not evaluate the javascript", () => {
      const variables = [
        {
          saber_count_javascript:
            "return `${states['input_number.green_saber_count'].state + states['input_number.blue_saber_count'].state}`",
        },
      ];
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          saber_count: "[[saber_count_javascript]]",
          type: "custom:button-card",
        },
      };

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
      });
      expect(result).toEqual({
        entity: "input_boolean.test",
        saber_count:
          "return `${states['input_number.green_saber_count'].state + states['input_number.blue_saber_count'].state}`",
        type: "custom:button-card",
      });
    });
  });

  describe("When passing a template with Javascript variables and a hass object", () => {
    it("should evaluate the javascript", () => {
      const variables = [
        {
          saber_count:
            "`${states['input_number.green_saber_count'].state + states['input_number.blue_saber_count'].state}`",
        },
      ];
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          saber_count_javascript: "return [[saber_count]]",
          type: "custom:button-card",
        },
      };

      const hass = {
        states: {
          "input_number.blue_saber_count": { state: 1 },
          "input_number.green_saber_count": { state: 7 },
        },
        user: {
          obiWan: {
            name: "Obi Wan Kenobi",
          },
        },
      };

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
        hass,
      });
      expect(result).toEqual({
        entity: "input_boolean.test",
        saber_count: "8",
        type: "custom:button-card",
      });
    });
  });

  describe("When passing a template with variables, Javascript variables and a hass object", () => {
    it("should evaluate the javascript and the variables", () => {
      const variables = [];
      const templateConfig = {
        card: {
          cards: "[[cards]]",
          type: "vertical-stack",
        },
        default: [
          {
            cards: [
              {
                entity_javascript:
                  "return `${states['input_text.system'].attributes.governor}`",
                type: "custom:button-card",
              },
            ],
          },
        ],
      };

      const hass = {
        states: {
          "input_text.system": {
            attributes: {
              governor: "person.palpatine",
            },
          },
        },
      };

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
        hass,
      });
      expect(result).toEqual({
        cards: [
          {
            entity: "person.palpatine",
            type: "custom:button-card",
          },
        ],
        type: "vertical-stack",
      });
    });

    it("should evaluate the javascript and the variables", () => {
      const variables = [];
      const templateConfig = {
        card: {
          cards_2_javascript: "return `[[cards]]`",
          cards_javascript: "return '[[cards]]'",
          type: "vertical-stack",
        },
        default: [
          {
            cards: [
              {
                entity: "person.palpatine",
                type: "custom:button-card",
              },
            ],
          },
        ],
      };

      const hass = {
        states: {
          "input_text.system": {
            attributes: {
              governor: "person.palpatine",
            },
          },
        },
      };

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
        hass,
      });
      expect(result).toEqual({
        cards: [
          {
            entity: "person.palpatine",
            type: "custom:button-card",
          },
        ],
        cards_2: [
          {
            entity: "person.palpatine",
            type: "custom:button-card",
          },
        ],
        type: "vertical-stack",
      });
    });
  });

  describe("When we evaluate an object access", () => {
    it("should render the value of the object", () => {
      const variables = [];
      const templateConfig = {
        card: {
          title_javascript: "return ('[[testing]]').text",
          type: "custom:mushroom-title-card",
        },
        default: [
          {
            testing: {
              text: "hello",
            },
          },
        ],
      };

      const hass = {
        states: {},
      };

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
        hass,
      });

      expect(result).toEqual({
        title: "hello",
        type: "custom:mushroom-title-card",
      });
    });
  });

  describe("When default variables and variables are passed as an object", () => {
    it("should evaluate the javascript and the variables", () => {
      const variables = {
        jedi: "Obi Wan Kenobi",
      };
      const templateConfig = {
        card: {
          jedi: "[[jedi]]",
          sith: "[[sith]]",
        },
        default: {
          sith: "Palpatine",
        },
      };

      const hass = {
        states: {},
      };

      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
        hass,
      });
      expect(result).toEqual({
        jedi: "Obi Wan Kenobi",
        sith: "Palpatine",
      });
    });
  });

  describe("When the variables is undefined", () => {
    it("Then it should return the template only with default variables replaced", () => {
      const variables = undefined;
      const templateConfig = {
        card: {
          entity: "input_boolean.test",
          name: "[[name]]",
          type: "custom:button-card",
          value: "[[value]]",
        },
        default: [{ name: "Ashoka Tano" }],
      };

      const hass = { states: {} };
      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
        hass,
      });
      expect(result).toEqual({
        entity: "input_boolean.test",
        name: "Ashoka Tano",
        type: "custom:button-card",
        value: "[[value]]",
      });
    });
  });

  describe("When a string combines two variables", () => {
    it("Then it should evaluate the javascript and the variables", () => {
      const variables = [{ index: 1, prefix: "myprefix" }];
      const templateConfig = {
        card: {
          entity_javascript: "return 'number.[[prefix]]_g' + '[[index]]' + '_move_threshold'",
          type: "custom:button-card",
        },
      };

      const hass = { states: {} };
      const result = evaluateConfig(templateConfig, variables, {
        hasJavascript: true,
        hass,
      });
      expect(result).toEqual({
        entity: "number.myprefix_g1_move_threshold",
        type: "custom:button-card",
      });
    });
  });
});
