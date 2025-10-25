import { beforeEach, describe, expect, it, vi } from "vitest";
import { StreamlineCardEditor } from "../streamline-card-editor.js";

/**
 * Regression test for issue #69: Visual editor not supported
 * https://github.com/brunosabot/streamline-card/issues/69
 *
 * Bug: When initializing the visual editor, accessing lovelace.config.streamline_templates
 * would fail if lovelace.config was undefined, causing the error:
 * "this._configElement.setConfig is not a function"
 *
 * Expected: The editor should handle cases where lovelace.config is undefined or
 * streamline_templates is not yet loaded.
 */
describe("Issue #69 - Visual editor crash when lovelace.config is undefined", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should not crash when lovelace.config.streamline_templates is undefined", () => {
    vi.doMock("../getLovelace.helper.js", () => ({
      getLovelace: () => ({
        config: undefined,
      }),
      getLovelaceCast: () => null,
    }));

    vi.doMock("../templateLoader.js", () => ({
      getRemoteTemplates: () => ({}),
      loadRemoteTemplates: () => true,
    }));

    expect(() => {
      const editor = new StreamlineCardEditor();
      return editor;
    }).not.toThrow();
  });

  it("should not crash when lovelace.config exists but streamline_templates is undefined", () => {
    vi.doMock("../getLovelace.helper.js", () => ({
      getLovelace: () => ({
        config: {},
      }),
      getLovelaceCast: () => null,
    }));

    vi.doMock("../templateLoader.js", () => ({
      getRemoteTemplates: () => ({}),
      loadRemoteTemplates: () => true,
    }));

    expect(() => {
      const editor = new StreamlineCardEditor();
      return editor;
    }).not.toThrow();
  });
});
