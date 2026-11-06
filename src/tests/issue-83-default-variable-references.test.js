import { afterEach, describe, expect, it, vi } from "vitest";
import evaluateConfig from "../evaluateConfig-helper";

/**
 * Regression test for issue #83: default values referencing other variables
 * https://github.com/brunosabot/streamline-card/issues/83
 *
 * A variable value (typically a `default` entry) can reference another
 * variable with `[[name]]`. References are resolved inside the merged map
 * (defaults + card variables) whatever the declaration order. Circular and
 * unknown references are left untouched, and never throw.
 */
describe("Issue #83 - Variables referencing other variables", () => {
  const hass = { states: {} };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should resolve a reference declared after the variable", () => {
    const templateConfig = {
      card: { title: "[[greeting]]", type: "markdown" },
      default: [{ greeting: "Hello [[name]]" }, { name: "Ashoka" }],
    };

    const result = evaluateConfig(templateConfig, {}, { hass });

    expect(result.title).toBe("Hello Ashoka");
  });

  it("should resolve a reference declared before the variable", () => {
    const templateConfig = {
      card: { title: "[[greeting]]", type: "markdown" },
      default: [{ name: "Ashoka" }, { greeting: "Hello [[name]]" }],
    };

    const result = evaluateConfig(templateConfig, {}, { hass });

    expect(result.title).toBe("Hello Ashoka");
  });

  it("should use the card value when it overrides a referenced default", () => {
    const templateConfig = {
      card: { title: "[[greeting]]", type: "markdown" },
      default: [{ greeting: "Hello [[name]]" }, { name: "Ashoka" }],
    };

    const result = evaluateConfig(templateConfig, [{ name: "Anakin" }], { hass });

    expect(result.title).toBe("Hello Anakin");
  });

  it("should resolve a chain of references", () => {
    const templateConfig = {
      card: { title: "[[first]]", type: "markdown" },
      default: [{ first: "A-[[second]]" }, { second: "B-[[third]]" }, { third: "C" }],
    };

    const result = evaluateConfig(templateConfig, {}, { hass });

    expect(result.title).toBe("A-B-C");
  });

  it("should keep the type of a value that is exactly a reference", () => {
    const templateConfig = {
      card: { hours_to_show: "[[count]]", type: "history-graph" },
      default: [{ count: "[[base]]" }, { base: 3 }],
    };

    const result = evaluateConfig(templateConfig, {}, { hass });

    expect(result.hours_to_show).toBe(3);
  });

  it("should not throw on circular references and warn about them", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const templateConfig = {
      card: { title: "[[ping]]", type: "markdown" },
      default: [{ ping: "[[pong]]" }, { pong: "[[ping]]" }],
    };

    const result = evaluateConfig(templateConfig, {}, { hass });

    expect(warn).toHaveBeenCalled();
    expect(result.title).toMatch(/\[\[(?:ping|pong)\]\]/u);
  });

  it("should not throw on a self-reference and leave it untouched", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const templateConfig = {
      card: { title: "[[self]]", type: "markdown" },
      default: [{ self: "me [[self]]" }],
    };

    const result = evaluateConfig(templateConfig, {}, { hass });

    expect(warn).toHaveBeenCalled();
    expect(result.title).toBe("me [[self]]");
  });

  it("should leave an unknown reference untouched", () => {
    const templateConfig = {
      card: { title: "[[label]]", type: "markdown" },
      default: [{ label: "Hello [[unknown]]" }],
    };

    const result = evaluateConfig(templateConfig, {}, { hass });

    expect(result.title).toBe("Hello [[unknown]]");
  });
});
