import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * Regression test: `layout` is not forwarded to the inner card
 *
 * Bug: Home Assistant sets a `layout` property on every card it renders
 * (e.g. "grid" in sections views, "panel" in panel views). Streamline Card
 * received it but never passed it to the card it wraps, so layout-aware cards
 * (map, tile, area, etc.) rendered as if they were in a masonry view.
 *
 * Expected: The inner card should receive the same `layout` value as the
 * Streamline Card, including when the inner card is recreated.
 */

vi.mock("../getLovelace-helper", () => ({
  getLovelace: () => ({
    config: {
      streamline_templates: {
        layout_template: { card: { type: "map" } },
      },
    },
  }),
  getLovelaceCast: () => null,
}));

vi.mock("../templateLoader", () => ({
  getIsTemplateLoaded: () => true,
  getRemoteTemplates: () => ({}),
  loadRemoteTemplates: () => Promise.resolve(),
}));

const createInnerCard = () => {
  const card = document.createElement("div");
  card.setConfig = vi.fn();
  return card;
};

const createStreamlineCard = () => {
  const card = document.createElement("streamline-card");
  card.setConfig({ template: "layout_template" });
  return card;
};

describe("Layout forwarding to the inner card", () => {
  beforeAll(async () => {
    window.loadCardHelpers = () =>
      Promise.resolve({ createCardElement: createInnerCard });
    await import("../streamline-card");
    await customElements.whenDefined("streamline-card");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should forward layout set after the inner card is created", () => {
    const card = createStreamlineCard();
    card.layout = "grid";

    expect(card.layout).toBe("grid");
    expect(card._card.layout).toBe("grid");
  });

  it("should forward layout set before the inner card is created", () => {
    const card = document.createElement("streamline-card");
    card.layout = "grid";
    card.setConfig({ template: "layout_template" });

    expect(card._card.layout).toBe("grid");
  });

  it("should forward layout changes", () => {
    const card = createStreamlineCard();
    card.layout = "grid";
    card.layout = "panel";

    expect(card._card.layout).toBe("panel");
  });

  it("should keep layout when the inner card is recreated", () => {
    const card = createStreamlineCard();
    card.layout = "grid";
    document.body.appendChild(card);
    const previousCard = card._card;

    window.dispatchEvent(new Event("streamline-templates-updated"));

    expect(card._card).not.toBe(previousCard);
    expect(card._card.layout).toBe("grid");
  });
});
