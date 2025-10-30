// Src/tests/issue-69-visual-editor-crash.test.js
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Important:
 * - Mock modules BEFORE importing the editor to prevent real side-effects (like fetch).
 * - Adjust SUT_PATH if your editor file lives elsewhere.
 */
const SUT_PATH = "../streamline-card-editor.js";
const TAG = "streamline-card-editor";

/**
 * Load the editor with a specific lovelace config while keeping network blocked.
 */
const loadEditorWith = async (lovelaceConfig) => {
  vi.resetModules();
  vi.clearAllMocks();

  // Block any real network
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("Network request blocked in tests"))),
  );

  // Mock Home Assistant lookups
  vi.doMock("../getLovelace.helper.js", () => ({
    getLovelace: () => ({ config: lovelaceConfig }),
    getLovelaceCast: () => null,
  }));

  /**
   * Mock template loader so nothing calls fetch.
   * Keys are alphabetically ordered to satisfy sort-keys.
   */
  vi.doMock("../templateLoader.js", () => ({
    _sL_loadYamlFallback: vi.fn(() => ({})),
    getRemoteTemplates: vi.fn(() => ({})),
    loadRemoteTemplates: vi.fn(() => true),
    // Return a resolved promise without using an async arrow (require-await)
    sL_fetchText: vi.fn(() => Promise.resolve("")),
  }));

  // Import AFTER mocks are registered
  const mod = await import(SUT_PATH);
  return mod;
};

/**
 * Instantiate via tag name to avoid "Illegal constructor" in JSDOM.
 */
const createEditorElement = () => document.createElement(TAG);

describe("Issue #69 – Visual editor should not crash", () => {
  beforeEach(() => {
    // Ensure a body exists for attaching elements
    if (!document.body) {
      document.body = document.createElement("body");
    }
  });

  it("does not crash when lovelace.config is undefined", async () => {
    await loadEditorWith(undefined);

    expect(() => createEditorElement()).not.toThrow();

    const el = createEditorElement();
    document.body.appendChild(el);
  });

  it("does not crash when lovelace.config exists but streamline_templates is undefined", async () => {
    await loadEditorWith({});

    const el = createEditorElement();
    expect(() => el).not.toThrow();

    document.body.appendChild(el);

    // Exercise minimal editor API if present
    if (typeof el.setConfig === "function") {
      expect(() =>
        el.setConfig({ type: "custom:streamline-card" }),
      ).not.toThrow();
    }
  });
});
