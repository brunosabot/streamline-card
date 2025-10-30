// src/streamline-card-editor.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Hoisted mocks (paths are relative to THIS file in src/) ---
vi.mock("./templateLoader.js", () => ({
  loadRemoteTemplates: vi.fn(() => true),
  getRemoteTemplates: vi.fn(() => ({})),
  sL_fetchText: vi.fn(async () => ""),
  _sL_loadYamlFallback: vi.fn(() => ({})),
}));

vi.mock("./getLovelace.helper.js", () => ({
  getLovelace: () => ({ config: {} }),
  getLovelaceCast: () => null,
}));

// Import AFTER mocks so the constructor uses mocked templateLoader
import "./streamline-card-editor.js";

const TAG = "streamline-card-editor";

function createEditor(): HTMLElement {
  return document.createElement(TAG);
}

describe("streamline-card-editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!document.body) {
      // @ts-ignore
      document.body = document.createElement("body");
    }
  });

  it("registers the custom element", () => {
    expect(customElements.get(TAG)).toBeDefined();
  });

  it("constructs without throwing (no network)", () => {
    expect(() => createEditor()).not.toThrow();
  });

  it("attaches to DOM and accepts minimal hass", () => {
    const el: any = createEditor();
    document.body.appendChild(el);
    el.hass = { states: {}, localize: () => "" };

    if (typeof el.setConfig === "function") {
      expect(() => el.setConfig({ type: "custom:streamline-card" })).not.toThrow();
    }
  });

  it("getSchema() returns an array with 'template' first", () => {
    const el: any = createEditor();
    el.hass = { states: {}, localize: () => "" };
    const schema = el.getSchema?.();
    expect(Array.isArray(schema)).toBe(true);
    expect(schema?.[0]?.name).toBe("template");
  });
});
