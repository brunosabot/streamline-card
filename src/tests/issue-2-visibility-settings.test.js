import { describe, expect, it } from "vitest";
import evaluateConfig from "../evaluteConfig-helper.js";

/**
 * Regression test for issue #2: Visibility settings from template are not respected
 * https://github.com/brunosabot/streamline-card/issues/2
 *
 * Bug: When configuring visibility in a template, the card would always be visible
 * instead of respecting the visibility conditions.
 *
 * Expected: Visibility settings from templates should be properly applied to the card
 */
describe("Issue #2 - Visibility settings from template are not respected", () => {
  describe("When using visibility with screen media_query condition", () => {
    it("should preserve visibility configuration", () => {
      const templateConfig = {
        card: {
          content: "I should not be visible, but sadly I am.",
          type: "markdown",
          visibility: [
            {
              condition: "screen",
              media_query: "",
            },
          ],
        },
      };

      const hass = {
        states: {},
      };

      const result = evaluateConfig(templateConfig, {}, { hass });

      // The visibility configuration should be preserved
      expect(result).toBeDefined();
      expect(result.visibility).toBeDefined();
      expect(result.visibility).toHaveLength(1);
      expect(result.visibility[0].condition).toBe("screen");
      expect(result.visibility[0].media_query).toBe("");
    });
  });

  describe("When using visibility with state condition", () => {
    it("should preserve state-based visibility", () => {
      const templateConfig = {
        card: {
          content: "Conditional content",
          type: "markdown",
          visibility: [
            {
              condition: "state",
              entity: "binary_sensor.test",
              state: "on",
            },
          ],
        },
      };

      const hass = {
        states: {
          "binary_sensor.test": { state: "on" },
        },
      };

      const result = evaluateConfig(templateConfig, {}, { hass });

      expect(result.visibility).toBeDefined();
      expect(result.visibility[0].condition).toBe("state");
      expect(result.visibility[0].entity).toBe("binary_sensor.test");
      expect(result.visibility[0].state).toBe("on");
    });
  });

  describe("When using visibility with user condition", () => {
    it("should preserve user-based visibility", () => {
      const templateConfig = {
        card: {
          content: "User-specific content",
          type: "markdown",
          visibility: [
            {
              condition: "user",
              users: ["user1", "user2"],
            },
          ],
        },
      };

      const hass = {
        states: {},
      };

      const result = evaluateConfig(templateConfig, {}, { hass });

      expect(result.visibility).toBeDefined();
      expect(result.visibility[0].condition).toBe("user");
      expect(result.visibility[0].users).toEqual(["user1", "user2"]);
    });
  });

  describe("When using multiple visibility conditions", () => {
    it("should preserve all visibility conditions", () => {
      const templateConfig = {
        card: {
          content: "Multi-condition content",
          type: "markdown",
          visibility: [
            {
              condition: "screen",
              media_query: "(min-width: 768px)",
            },
            {
              condition: "state",
              entity: "input_boolean.show_card",
              state: "on",
            },
          ],
        },
      };

      const hass = {
        states: {
          "input_boolean.show_card": { state: "on" },
        },
      };

      const result = evaluateConfig(templateConfig, {}, { hass });

      expect(result.visibility).toHaveLength(2);
      expect(result.visibility[0].condition).toBe("screen");
      expect(result.visibility[0].media_query).toBe("(min-width: 768px)");
      expect(result.visibility[1].condition).toBe("state");
      expect(result.visibility[1].entity).toBe("input_boolean.show_card");
    });
  });

  describe("When using visibility with numeric_state condition", () => {
    it("should preserve numeric_state visibility with above/below thresholds", () => {
      const templateConfig = {
        card: {
          content: "Temperature alert",
          type: "markdown",
          visibility: [
            {
              above: 25,
              condition: "numeric_state",
              entity: "sensor.temperature",
            },
          ],
        },
      };

      const hass = {
        states: {
          "sensor.temperature": { state: "26" },
        },
      };

      const result = evaluateConfig(templateConfig, {}, { hass });

      expect(result.visibility).toBeDefined();
      expect(result.visibility[0].condition).toBe("numeric_state");
      expect(result.visibility[0].entity).toBe("sensor.temperature");
      expect(result.visibility[0].above).toBe(25);
    });
  });

  describe("When using visibility with variables", () => {
    it("should replace variables in visibility conditions", () => {
      const templateConfig = {
        card: {
          content: "Variable-based visibility",
          type: "markdown",
          visibility: [
            {
              condition: "state",
              entity: "[[target_entity]]",
              state: "[[target_state]]",
            },
          ],
        },
      };

      const variables = {
        target_entity: "light.bedroom",
        target_state: "on",
      };

      const hass = {
        states: {
          "light.bedroom": { state: "on" },
        },
      };

      const result = evaluateConfig(templateConfig, variables, { hass });

      expect(result.visibility[0].entity).toBe("light.bedroom");
      expect(result.visibility[0].state).toBe("on");
    });
  });
});
