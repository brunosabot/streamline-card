import { parse } from "yaml";

const includeTag = {
  resolve: (str) => ({ __streamline_include__: str }),
  tag: "!include",
};

const resolveIncludes = async (
  obj,
  baseUrl,
  evaluateYamlRef,
  byPassCache = false,
) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(
      obj.map((item) =>
        resolveIncludes(item, baseUrl, evaluateYamlRef, byPassCache),
      ),
    );
  }

  if (obj.__streamline_include__) {
    const includedPath = obj.__streamline_include__;
    const base = new URL(baseUrl, window.location.href);
    const url = new URL(includedPath, base).href;
    const res = await fetch(byPassCache ? `${url}?t=${Date.now()}` : url, {
      cache: byPassCache ? "no-cache" : "reload",
    });

    if (!res.ok) {
      throw new Error(
        `[streamline-card] Failed to load included file: ${includedPath}`,
      );
    }
    const text = await res.text();
    // Recursively parse and resolve the included file
    return await evaluateYamlRef(text, url, byPassCache);
  }

  const keys = Object.keys(obj);
  const resolvedValues = await Promise.all(
    keys.map((key) =>
      resolveIncludes(obj[key], baseUrl, evaluateYamlRef, byPassCache),
    ),
  );

  return Object.fromEntries(
    keys.map((key, index) => [key, resolvedValues[index]]),
  );
};

export default async function evaluateYaml(
  yamlString,
  baseUrl,
  byPassCache = false,
) {
  const parsed = parse(yamlString, { customTags: [includeTag] });
  return await resolveIncludes(parsed, baseUrl, evaluateYaml, byPassCache);
}
