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
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StreamlineCardEditor } from "../streamline-card-editor.js";

const getLovelaceMock = vi.fn(() => ({
  config: undefined,
}));

vi.spyOn(window, "fetch").mockImplementation(() => ({
  json: () => Promise.resolve({}),
  ok: true,
  text: () => Promise.resolve(""),
}));

vi.doMock("../getLovelace.helper.js", () => ({
  getLovelace: getLovelaceMock,
  getLovelaceCast: () => null,
}));

describe("Issue #69 - Visual editor crash when lovelace.config is undefined", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should not crash when lovelace.config.streamline_templates is undefined", () => {
    expect(() => {
      const editor = new StreamlineCardEditor();
      return editor;
    }).not.toThrow();
  });

  it("should not crash when lovelace.config exists but streamline_templates is undefined", () => {
    getLovelaceMock.mockImplementationOnce(() => ({ config: {} }));

    expect(() => {
      const editor = new StreamlineCardEditor();
      return editor;
    }).not.toThrow();
  });
});
