import { describe, expect, it, vi } from "vitest";

/**
 * Regression test for issue #110: console 404 on streamline_templates.yaml
 * https://github.com/brunosabot/streamline-card/issues/110
 *
 * Bug: v0.2.0 always fetched the remote templates file, even when the
 * template was defined inline in the dashboard, which logs a 404 in the
 * console when the file does not exist.
 *
 * Expected: No network request when the template is defined in the
 * dashboard's `streamline_templates`.
 */
const createCardElement = vi.fn(() => document.createElement("div"));
const fetchMock = vi.fn(() =>
  Promise.resolve({ ok: false, text: () => Promise.resolve("") }),
);

vi.mock("../getLovelace-helper", () => ({
  getLovelace: () => ({
    config: {
      streamline_templates: {
        inline_tile: {
          card: {
            entity: "[[entity]]",
            type: "tile",
          },
        },
      },
    },
  }),
  getLovelaceCast: () => null,
}));

vi.stubGlobal("fetch", fetchMock);

window.loadCardHelpers = () => Promise.resolve({ createCardElement });

describe("Issue #110 - No remote fetch for inline templates", () => {
  it("should not fetch the remote templates file for an inline template", async () => {
    await import("../streamline-card");
    await customElements.whenDefined("streamline-card");

    const element = document.createElement("streamline-card");
    element.setConfig({
      template: "inline_tile",
      variables: { entity: "light.kitchen" },
    });

    expect(createCardElement).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
