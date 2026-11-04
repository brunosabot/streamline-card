import { describe, expect, it, vi } from "vitest";

/**
 * Regression test for issue #139: View badge "Cannot read properties…"
 * https://github.com/brunosabot/streamline-card/issues/139
 *
 * Bug: A streamline-card used as a view badge or view footer gets its config
 * before hui-root exposes Lovelace. `initTemplates()` then read `config` of
 * null and threw from `setConfig()`, so the card stayed in error for good
 * (typically after the Android app resumes).
 *
 * Expected: Remote templates render without Lovelace, and inline templates
 * are resolved on the next hass update once Lovelace is reachable.
 */
const createBadgeElement = vi.fn(() => document.createElement("div"));
const createCardElement = vi.fn(() => document.createElement("div"));

const badgeTemplate = {
  badge: { entity: "[[entity]]", type: "entity" },
};

const lovelaceRef = { current: null };

vi.mock("../getLovelace-helper", () => ({
  getLovelace: () => lovelaceRef.current,
  getLovelaceCast: () => null,
}));

vi.mock("../templateLoader", () => ({
  getIsTemplateLoaded: () => true,
  getRemoteTemplates: () => ({ remote_badge: badgeTemplate }),
  loadRemoteTemplates: () => Promise.resolve(true),
}));

window.loadCardHelpers = () =>
  Promise.resolve({ createBadgeElement, createCardElement });

describe("Issue #139 - View badge before Lovelace is ready", () => {
  it("renders a remote template while Lovelace is not reachable yet", async () => {
    await import("../streamline-card");
    await customElements.whenDefined("streamline-card");
    lovelaceRef.current = null;
    createBadgeElement.mockClear();

    const element = document.createElement("streamline-card");
    expect(() =>
      element.setConfig({
        template: "remote_badge",
        variables: { entity: "sensor.a" },
      }),
    ).not.toThrow();
    expect(createBadgeElement).toHaveBeenCalledWith({
      entity: "sensor.a",
      type: "entity",
    });
  });

  it("resolves an inline template on a later hass update", async () => {
    await import("../streamline-card");
    await customElements.whenDefined("streamline-card");
    lovelaceRef.current = null;
    createBadgeElement.mockClear();

    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const element = document.createElement("streamline-card");
    parent.appendChild(element);
    expect(() =>
      element.setConfig({
        template: "inline_badge",
        variables: { entity: "sensor.b" },
      }),
    ).not.toThrow();

    lovelaceRef.current = {
      config: { streamline_templates: { inline_badge: badgeTemplate } },
    };
    element.hass = { states: {} };
    expect(createBadgeElement).toHaveBeenCalledWith({
      entity: "sensor.b",
      type: "entity",
    });
  });
});
