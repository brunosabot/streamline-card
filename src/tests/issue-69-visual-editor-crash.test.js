// src/tests/issue-69-visual-editor-crash.test.js
import { beforeEach, describe, expect, it, vi } from "vitest";

const SUT_PATH = "../streamline-card-editor.js";
const TAG = "streamline-card-editor";

async function loadEditorWith(lovelaceConfig) {
  vi.resetModules();
  vi.clearAllMocks();

  // Belt-and-suspenders: block any real network
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("Network request blocked in tests")))
  );

  // Mock Home Assistant lookups
  vi.doMock("../getLovelace.helper.js", () => ({
    getLovelace: () => ({ config: lovelaceConfig }),
    getLovelaceCast: () => null,
  }));

  // Mock template loader so nothing calls fetch
  vi.doMock("../templateLoader.js", () => ({
    loadRemoteTemplates: vi.fn(() => true),
    getRemoteTemplates: vi.fn(() => ({})),
    sL_fetchText: vi.fn(async () => ""),
    _sL_loadYamlFallback: vi.fn(() => ({})),
  }));

  // Ensure we have a customElements registry (jsdom usually does)
  if (!globalThis.customElements) {
    const registry = new Map();
    globalThis.customElements = {
      define: (name, ctor) => {
        if (!registry.has(name)) registry.set(name, ctor);
      },
      get: (name) => registry.get(name),
    };
  }

  // Import AFTER mocks are registered
  const mod = await import(SUT_PATH);
  return mod; // { StreamlineCardEditor?, ... }
}

function createEditorElement() {
  // Instantiate via the tag name, not `new Class()`, to avoid "Illegal constructor" in JSDOM
  return document.createElement(TAG);
}

describe("Issue #69 – Visual editor should not crash", () => {
  beforeEach(() => {
    // jsdom provides document; ensure body exists
    if (!document.body) {
      // @ts-ignore
      document.body = document.createElement("body");
    }
  });

  it("does not crash when lovelace.config is undefined", async () => {
    await loadEditorWith(undefined);

    expect(() => createEditorElement()).not.toThrow();

    const el = createEditorElement();
    // Attach so lifecycle callbacks (if any) can run safely
    document.body.appendChild(el);
  });

  it("does not crash when lovelace.config exists but streamline_templates is undefined", async () => {
    await loadEditorWith({});

    const create = () => createEditorElement();
    expect(create).not.toThrow();

    const el = create();
    document.body.appendChild(el);

    // Optional: minimal API exercise
    if (typeof el.setConfig === "function") {
      expect(() =>
        el.setConfig({ type: "custom:streamline-card" })
      ).not.toThrow();
    }
  });
});
