import { beforeEach, describe, expect, it } from "vitest";
import { clearLovelaceCache, getLovelace } from "../getLovelace-helper";
import { mockLovelaceDom } from "../__helpers__/lovelace.helper";

/**
 * Regression test for issue #107: Configuration error
 * https://github.com/brunosabot/streamline-card/issues/107
 *
 * Bug: Templates added in the raw configuration editor are not found until the
 * page is refreshed, because the lovelace config object is cached and Home
 * Assistant replaces it when the configuration is saved.
 *
 * Expected: getLovelace returns the current lovelace config.
 */
describe("Issue #107 - Configuration error", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    clearLovelaceCache();
  });

  it("should see templates added after the first read", () => {
    const huiRoot = mockLovelaceDom({ config: {} });

    expect(getLovelace().config.streamline_templates).toBeUndefined();

    huiRoot.lovelace = {
      config: {
        streamline_templates: { lights_grid: { card: { type: "grid" } } },
      },
    };

    expect(getLovelace().config.streamline_templates.lights_grid).toBeDefined();
  });
});
