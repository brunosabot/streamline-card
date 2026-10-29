import { describe, expect, it } from "vitest";
import evaluateConfig from "../evaluateConfig-helper";
import { replaceWithKeyValue } from "../evaluateVariables-helper";

/**
 * Regression test for issue #109: Config error if variable is at the end of an entity
 * https://github.com/brunosabot/streamline-card/issues/109
 *
 * Bug: a number or boolean variable stripped a lone quote next to it, so
 * `entity: input_datetime.hive_heating_[[schedule]]` with `schedule: 1`
 * produced invalid JSON (the closing quote was eaten).
 *
 * Expected: quotes are removed only when they wrap the variable exactly.
 */
describe("Issue #109 - Number variable at the end or start of a string", () => {
  const hass = { states: {} };
  const variables = { schedule: 1 };

  it("should replace a number variable at the end of an entity", () => {
    const templateConfig = {
      card: { entity: "input_datetime.hive_heating_[[schedule]]", type: "x" },
    };

    const result = evaluateConfig(templateConfig, variables, { hass });

    expect(result.entity).toBe("input_datetime.hive_heating_1");
  });

  it("should replace a number variable at the start of a string", () => {
    const templateConfig = {
      card: { entity: "[[schedule]]_heating", type: "x" },
    };

    const result = evaluateConfig(templateConfig, variables, { hass });

    expect(result.entity).toBe("1_heating");
  });

  it("should still turn a lone quoted variable into a number", () => {
    const templateConfig = {
      card: { hours: "[[schedule]]", type: "x" },
    };

    const result = evaluateConfig(templateConfig, variables, { hass });

    expect(result.hours).toBe(1);
  });

  it("should keep the quotes of a JavaScript string ending with the variable", () => {
    expect(replaceWithKeyValue(`{"a":"states['x_[[s]]'].state"}`, "s", 1)).toBe(
      `{"a":"states['x_1'].state"}`,
    );
  });
});
