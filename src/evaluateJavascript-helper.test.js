import { describe, expect, it } from "vitest";
import evaluateConfig from "./evaluateJavascript-helper.js";
import hass from "./__fixtures__/hass.fixture.js";

describe("Given the evaluateConfig function", () => {
  describe("When passing an object with a javascript suffix with states usage", () => {
    it("should evaluate the javascript", () => {
      const config = {
        saber_count_javascript:
          "`${states['input_number.green_saber_count'].state + states['input_number.blue_saber_count'].state}`",
      };

      evaluateConfig(config, hass);
      expect(config).toEqual({
        saber_count: "7",
      });
    });
  });

  describe("When passing an object with a javascript suffix with user usage", () => {
    it("should evaluate the javascript with the hass", () => {
      const config = {
        sample_javascript: "`${user.obiWan.name}`",
      };

      evaluateConfig(config, hass);
      expect(config).toEqual({
        sample: "Obi Wan Kenobi",
      });
    });
  });

  describe("When passing a deep object with a javascript suffix", () => {
    it("should evaluate the javascript", () => {
      const config = {
        obi_wan: {
          saber_count_javascript:
            "`${states['input_number.green_saber_count'].state + states['input_number.blue_saber_count'].state}`",
        },
      };

      evaluateConfig(config, hass);
      expect(config).toEqual({
        obi_wan: {
          saber_count: "7",
        },
      });
    });
  });

  describe("When passing an array with a javascript suffix", () => {
    it("should evaluate the javascript", () => {
      const config = {
        saber_count_javascript: [
          "`${states['input_number.green_saber_count'].state + states['input_number.blue_saber_count'].state}`",
        ],
      };

      evaluateConfig(config, hass);
      expect(config).toEqual({
        saber_count: ["7"],
      });
    });
  });

  describe("When passing an array of objects with a javascript suffix", () => {
    it("should evaluate the javascript", () => {
      const config = {
        jedi: [
          {
            name_javascript: "`${user.obiWan.name}`",
            saber_count_javascript:
              "`${states['input_number.green_saber_count'].state + states['input_number.blue_saber_count'].state}`",
          },
        ],
      };

      evaluateConfig(config, hass);
      expect(config).toEqual({
        jedi: [{ name: "Obi Wan Kenobi", saber_count: "7" }],
      });
    });
  });

  describe("When passing an empty hass object", () => {
    it("should throw an error", () => {
      const config = {
        saber_count_javascript:
          "`${states['input_number.green_saber_count'].state + states['input_number.blue_saber_count'].state}`",
      };

      expect(() => evaluateConfig(config)).toThrowError();
    });
  });

  describe("When passing an empty hass object on an array", () => {
    it("should throw an error", () => {
      const config = {
        saber_count_javascript: [
          "`${states['input_number.green_saber_count'].state + states['input_number.blue_saber_count'].state}`",
        ],
      };

      expect(() => evaluateConfig(config)).toThrowError();
    });
  });

  describe("When passing variables", () => {
    it("should evaluate the javascript with the variables", () => {
      const config = {
        saber_count_javascript:
          "`${variables.saber_count + variables.saber_count}`",
      };

      evaluateConfig(config, hass, { saber_count: 7 });
      expect(config).toEqual({
        saber_count: "14",
      });
    });
  });
});
