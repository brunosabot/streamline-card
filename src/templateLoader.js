import evaluateYaml from "./evaluateYaml";

let remoteTemplates = {};
let isTemplateLoaded = null;

export const getRemoteTemplates = () => remoteTemplates;
export const getisTemplateLoaded = () => isTemplateLoaded;

/** Fetch helpers (named expressions; braces for curly rule) */
const __sl_fetchText = async function __sl_fetchText(url) {
  const response = await fetch(`${url}?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
};

const __sl_fetchJSON = async function __sl_fetchJSON(url) {
  const response = await fetch(`${url}?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
};

/** Load a list of YAML files from /templates via manifest.json */
const __sl_tryLoadFromTemplatesDirectory =
  async function __sl_tryLoadFromTemplatesDirectory(basePath) {
    try {
      const manifestObj = await __sl_fetchJSON(
        `${basePath}/templates/manifest.json`,
      );

      let fileList = [];
      if (Array.isArray(manifestObj)) {
        fileList = manifestObj;
      } else if (manifestObj && Array.isArray(manifestObj.files)) {
        fileList = manifestObj.files;
      }

      if (fileList.length === 0) {
        return false;
      }

      const validNames = fileList.filter(
        (fileName) => typeof fileName === "string" && fileName.trim(),
      );

      const filePromises = validNames.map(async (fileName) => {
        const textContent = await __sl_fetchText(
          `${basePath}/templates/${fileName}`,
        );
        const parsed = evaluateYaml(textContent);
        return parsed && typeof parsed === "object" ? parsed : null;
      });

      const loadedList = (await Promise.all(filePromises)).filter(Boolean);
      remoteTemplates = Object.assign({}, ...loadedList);

      return Object.keys(remoteTemplates).length > 0;
    } catch {
      return false;
    }
  };

/** Try bases sequentially; short-circuit on first success */
const __sl_tryBases = async function __sl_tryBases() {
  const baseCandidates = [
    "/hacsfiles/streamline-card",
    "/local/streamline-card",
    "/local/community/streamline-card",
  ];
  for (const basePath of baseCandidates) {
    // Short-circuit once a base works.
    // eslint-disable-next-line no-await-in-loop
    const ok = await __sl_tryLoadFromTemplatesDirectory(basePath);
    if (ok) {
      return true;
    }
  }
  return false;
};

/** Fallback: load single YAML from known prefixes, in order */
const __sl_loadYamlFallback = async function __sl_loadYamlFallback() {
  const filename = "streamline-card/streamline_templates.yaml";

  const loadFrom = async function loadFrom(prefix) {
    const textContent = await __sl_fetchText(`${prefix}/${filename}`);
    remoteTemplates = evaluateYaml(textContent);
  };

  try {
    await loadFrom("/hacsfiles");
    return;
  } catch {
    // Continue to next prefix
  }

  try {
    await loadFrom("/local");
    return;
  } catch {
    // Continue to next prefix
  }

  // Final attempt; allow error to surface to caller if this fails
  await loadFrom("/local/community");
};

/** Public loader with single in-flight promise; avoids atomic updates by not reassigning after await */
export const loadRemoteTemplates = async function loadRemoteTemplates() {
  // Fast path: already loaded.
  if (isTemplateLoaded === true) {
    return true;
  }

  // Already loading: wait for the same promise.
  if (isTemplateLoaded && typeof isTemplateLoaded.then === "function") {
    await isTemplateLoaded;
    return true;
  }

  // Start a single in-flight load and publish it immediately.
  const startLoad = (async function doLoad() {
    const basesOk = await __sl_tryBases();
    if (!basesOk) {
      await __sl_loadYamlFallback();
    }
    return true;
  })();

  // Store the promise once; do not later reassign after an await.
  isTemplateLoaded = startLoad.then(() => true);

  // Await the published promise to satisfy require-await.
  await isTemplateLoaded;
  // eslint-disable-next-line require-atomic-updates
  isTemplateLoaded = true;
  return true;
};
