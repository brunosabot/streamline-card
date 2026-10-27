import { describe, expect, it } from "vitest";
import readme from "../../README.md?raw";

/**
 * Regression test: an unclosed code block in the README swallowed the
 * "Splitting Configuration with !include" section, which was rendered as code.
 */
describe("README code fences", () => {
  it("should close every fenced code block", () => {
    const fences = readme.match(/^\s*```/gmu) ?? [];
    expect(fences.length % 2).toBe(0);
  });

  it("should render the !include section as Markdown, not as code", () => {
    let isInCode = false;
    const headingsInCode = [];

    for (const line of readme.split("\n")) {
      if (/^\s*```/u.test(line)) {
        isInCode = !isInCode;
      } else if (isInCode && line.startsWith("### ")) {
        headingsInCode.push(line);
      }
    }

    expect(headingsInCode).toEqual([]);
  });
});
