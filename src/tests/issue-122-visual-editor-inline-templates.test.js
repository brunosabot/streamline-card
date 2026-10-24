import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regression test for issue #122: Visual Editor does not work
 * https://github.com/brunosabot/streamline-card/issues/122
 *
 * Bug: When the remote templates file is not loaded yet (or doesn't exist),
 * the visual editor only added the dashboard streamline_templates once the
 * remote loader resolved. Without a remote file the loader rejects, so the
 * dashboard templates were never selectable and setConfig threw
 * "The template ... doesn't exist in streamline_templates".
 *
 * Expected: Dashboard templates are available in the editor right away,
 * whatever the state of the remote templates loader.
 */
const loader = vi.hoisted(() => ({ load: () => true }));

vi.mock("../getLovelace-helper", () => ({
  getLovelace: () => ({
    config: {
      streamline_templates: {
        docker: {
          card: { entity: "switch.docker_[[container]]", type: "tile" },
        },
      },
    },
  }),
  getLovelaceCast: () => null,
}));

vi.mock("../templateLoader", () => ({
  getRemoteTemplates: () => ({}),
  loadRemoteTemplates: () => loader.load(),
}));

const { StreamlineCardEditor } = await import("../streamline-card-editor");

const config = {
  template: "docker",
  type: "custom:streamline-card",
  variables: { container: "nginx" },
};

describe("Issue #122 - Visual editor ignores dashboard templates", () => {
  beforeEach(() => {
    loader.load = () => true;
  });

  it.each([
    [
      "pending",
      () =>
        new Promise(() => {
          // Never settles: the remote file is still loading
        }),
    ],
    ["rejected", () => Promise.reject(new Error("not found"))],
  ])(
    "should offer the dashboard templates when the remote loader is %s",
    async (_state, load) => {
      loader.load = load;
      const editor = new StreamlineCardEditor();
      await Promise.resolve();

      expect(() => editor.setConfig(config)).not.toThrow();
      const [templateSchema] = editor.elements.form.schema;
      expect(templateSchema.selector.select.options).toContainEqual({
        label: "docker",
        value: "docker",
      });
    },
  );
});
