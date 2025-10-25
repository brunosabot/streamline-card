import { describe, expect, it } from "vitest";
import evaluateConfig from "../evaluteConfig-helper.js";

/**
 * Regression test for issue #65: Issue using multiple variables on a single line
 * https://github.com/brunosabot/streamline-card/issues/65
 *
 * Bug: When using multiple variables on a single line, only the first variable
 * was replaced, leaving subsequent variables unreplaced.
 *
 * Example from the issue:
 * - title: "[[maquina]] - [[hours]] h" would only replace [[maquina]]
 * - entity: 'number.[[prefix]]_g[[index]]_move_threshold' would only replace [[prefix]]
 *
 * Expected: All variables on a single line should be replaced with their corresponding values.
 */
describe("Issue #65 - Multiple variables on a single line", () => {
  it("should replace both variables in title string (history-graph example)", () => {
    const templateConfig = {
      card: {
        entities: [
          {
            entity: "sensor.[[maquina]]_up_since",
          },
        ],
        hours_to_show: "[[hours]]",
        title: "[[maquina]] - [[hours]] h",
        type: "history-graph",
      },
    };

    const variables = {
      hours: 8,
      maquina: "server1",
    };

    const hass = {
      states: {
        "sensor.server1_up_since": {
          state: "2025-07-04T10:00:00",
        },
      },
    };

    const result = evaluateConfig(templateConfig, variables, { hass });

    expect(result.title).toBe("server1 - 8 h");
    expect(result.hours_to_show).toBe(8);
    expect(result.entities[0].entity).toBe("sensor.server1_up_since");
  });

  it("should replace both variables in entity string (original issue example)", () => {
    const templateConfig = {
      card: {
        entity: "number.[[prefix]]_g[[index]]_move_threshold",
        type: "entity",
      },
    };

    const variables = {
      index: "8",
      prefix: "basement_office_multisensor",
    };

    const hass = {
      states: {
        "number.basement_office_multisensor_g8_move_threshold": {
          state: "5",
        },
      },
    };

    const result = evaluateConfig(templateConfig, variables, { hass });

    expect(result.entity).toBe(
      "number.basement_office_multisensor_g8_move_threshold",
    );
  });
});
