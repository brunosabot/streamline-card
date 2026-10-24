import { beforeAll, describe, expect, it, vi } from "vitest";
import hass from "../__fixtures__/hass.fixture";

/**
 * Regression test for issue #121: Cards using cards_javascript render blank until the next unrelated state change
 * https://github.com/brunosabot/streamline-card/issues/121
 *
 * Bug: setConfig runs before hass, so a card that needs its JavaScript-generated
 * part (e.g. a grid with cards_javascript) is first created as an error card.
 * When hass arrives, the error card is recreated in a nested animation frame,
 * after hass was handed to the old card: the new card never receives hass and
 * the view is not told that the slot now holds another card.
 *
 * Expected: The recreated card receives hass right away and a card-updated
 * event is fired so the view lays it out again.
 */
vi.mock("../getLovelace-helper", () => ({
  getLovelace: () => ({
    config: {
      streamline_templates: {
        js_grid: {
          card: {
            cards_javascript:
              'return [{ type: "markdown", content: "hello" }];',
            columns: 1,
            type: "grid",
          },
        },
      },
    },
  }),
  getLovelaceCast: () => null,
}));

describe("Issue #121 - Cards using cards_javascript render blank until the next state change", () => {
  beforeAll(async () => {
    window.loadCardHelpers = () =>
      Promise.resolve({
        createCardElement: (config) =>
          document.createElement(
            Array.isArray(config.cards) ? "hui-grid-card" : "hui-error-card",
          ),
      });
    await import("../streamline-card");
    await customElements.whenDefined("streamline-card");
  });

  it("should give hass to the recreated card and fire card-updated", async () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const onCardUpdated = vi.fn();
    parent.addEventListener("card-updated", onCardUpdated);

    const card = document.createElement("streamline-card");
    card.setConfig({ template: "js_grid", type: "custom:streamline-card" });
    expect(card._card.nodeName).toBe("HUI-ERROR-CARD");

    parent.appendChild(card);
    card.hass = hass;

    await vi.waitFor(() => {
      expect(card._card.nodeName).toBe("HUI-GRID-CARD");
    });

    expect(card._card.hass).toBe(hass);
    expect(onCardUpdated).toHaveBeenCalled();
  });
});
