import { beforeEach, describe, expect, it, vi } from "vitest";
import evaluateYaml from "./evaluateYaml";

describe("evaluateYaml", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("should parse standard YAML", async () => {
    const yaml = "key: value\nlist:\n  - item1\n  - item2";
    const result = await evaluateYaml(yaml);
    expect(result).toEqual({
      key: "value",
      list: ["item1", "item2"],
    });
  });

  it("should resolve !include tags", async () => {
    const mainYaml = "main:\n  sub: !include sub.yaml";
    const subYaml = "sub_key: sub_value";

    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(subYaml),
    });

    const result = await evaluateYaml(mainYaml, "http://localhost/main.yaml");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("http://localhost/sub.yaml"),
      expect.any(Object),
    );
    expect(result).toEqual({
      main: {
        sub: {
          sub_key: "sub_value",
        },
      },
    });
  });

  it("should resolve nested !include tags", async () => {
    const mainYaml = "include1: !include file1.yaml";
    const file1Yaml = "include2: !include file2.yaml";
    const file2Yaml = "final: value";

    fetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(file1Yaml),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(file2Yaml),
      });

    const result = await evaluateYaml(mainYaml, "http://localhost/main.yaml");

    expect(result).toEqual({
      include1: {
        include2: {
          final: "value",
        },
      },
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should throw error on fetch failure", async () => {
    const yaml = "broken: !include missing.yaml";

    fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(
      evaluateYaml(yaml, "http://localhost/main.yaml"),
    ).rejects.toThrow(
      "[streamline-card] Failed to load included file: missing.yaml",
    );
  });

  it("should pass fetch options through to !include fetches", async () => {
    const mainYaml = "sub: !include sub.yaml";
    const subYaml = "key: value";

    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(subYaml),
    });

    await evaluateYaml(mainYaml, "http://localhost/main.yaml");

    expect(fetch).toHaveBeenCalledWith("http://localhost/sub.yaml", {
      cache: "reload",
    });
  });

  it("should support string as second argument (baseUrl)", async () => {
    const mainYaml = "sub: !include sub.yaml";
    const subYaml = "key: value";

    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(subYaml),
    });

    await evaluateYaml(mainYaml, "http://localhost/main.yaml");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost/sub.yaml",
      expect.any(Object),
    );
  });
});
