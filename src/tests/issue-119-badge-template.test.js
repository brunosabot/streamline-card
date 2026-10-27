import { describe, expect, it, vi } from "vitest";

/**
 * Regression test for issue #119: Badge template
 * https://github.com/brunosabot/streamline-card/issues/119
 *
 * Bug: A streamline-card added in the badges section always renders its
 * template as a card (an entity card instead of an entity badge), because a
 * template could only define a `card` or an `element`.
 *
 * Expected: A template defining a `badge` is rendered with Home Assistant's
 * `createBadgeElement` helper.
 */
const createBadgeElement = vi.fn(() => document.createElement("div"));
const createCardElement = vi.fn(() => document.createElement("div"));

vi.mock("../getLovelace-helper", () => ({
  getLovelace: () => ({
    config: {
      streamline_templates: {
        temperature_badge: {
          badge: {
            entity: "[[entity]]",
            show_icon: true,
            show_name: false,
            show_state: true,
            type: "entity",
          },
        },
      },
    },
  }),
  getLovelaceCast: () => null,
}));

window.loadCardHelpers = () =>
  Promise.resolve({ createBadgeElement, createCardElement });

describe("Issue #119 - Badge template", () => {
  it("should render a badge template with createBadgeElement", async () => {
    await import("../streamline-card");
    await customElements.whenDefined("streamline-card");

    const element = document.createElement("streamline-card");
    element.setConfig({
      template: "temperature_badge",
      variables: { entity: "sensor.temperature" },
    });

    expect(createCardElement).not.toHaveBeenCalled();
    expect(createBadgeElement).toHaveBeenCalledWith({
      entity: "sensor.temperature",
      show_icon: true,
      show_name: false,
      show_state: true,
      type: "entity",
    });
  });
});
