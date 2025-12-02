import evaluateYaml from "./evaluateYaml";

const HACS_PATHS = [
  "/hacsfiles/streamline-card",
  "/local/streamline-card",
  "/local/community/streamline-card",
];

let remoteTemplates = {};
let isTemplateLoaded = null;

export const getRemoteTemplates = () => remoteTemplates;
export const getIsTemplateLoaded = () => isTemplateLoaded;

const fetchWithoutCache = async function fetchWithoutCache(url) {
  const response = await fetch(`${url}?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response;
};

const loadTemplatesFromManifest = async function loadTemplatesFromManifest(
  basePath,
) {
  try {
    const response = await fetchWithoutCache(
      `${basePath}/templates/manifest.json`,
    );
    const manifestObj = await response.json();

    let fileList = [];
    if (Array.isArray(manifestObj)) {
      fileList = manifestObj;
    } else if (manifestObj && Array.isArray(manifestObj.files)) {
      fileList = manifestObj.files;
    }

    if (fileList.length === 0) {
      return false;
    }

    const texts = await Promise.all(
      fileList
        .filter((fileName) => typeof fileName === "string" && fileName.trim())
        .map(async (fileName) => {
          const templateResponse = await fetchWithoutCache(
            `${basePath}/templates/${fileName}`,
          );
          return templateResponse.text();
        }),
    );

    const loadedList = texts
      .map((textContent) => evaluateYaml(textContent))
      .filter((parsed) => parsed && typeof parsed === "object");

    remoteTemplates = Object.assign({}, ...loadedList);

    return Object.keys(remoteTemplates).length > 0;
  } catch {
    return false;
  }
};

const loadFromManifest = async function loadFromManifest() {
  for (const basePath of HACS_PATHS) {
    // Short-circuit once a base works.
    // eslint-disable-next-line no-await-in-loop
    const ok = await loadTemplatesFromManifest(basePath);
    if (ok) {
      return true;
    }
  }
  return false;
};

const loadTemplatesFromYaml = async function loadTemplatesFromYaml(basePath) {
  try {
    const filename = "streamline_templates.yaml";

    const response = await fetchWithoutCache(`${basePath}/${filename}`);
    const textContent = await response.text();
    remoteTemplates = evaluateYaml(textContent);

    return Object.keys(remoteTemplates).length > 0;
  } catch {
    return false;
  }
};

const loadFromYaml = async function loadFromYaml() {
  for (const basePath of HACS_PATHS) {
    // Short-circuit once a base works.
    // eslint-disable-next-line no-await-in-loop
    const ok = await loadTemplatesFromYaml(basePath);
    if (ok) {
      return true;
    }
  }
  return false;
};

export const loadRemoteTemplates = async function loadRemoteTemplates() {
  if (isTemplateLoaded === true) {
    return true;
  }

  const basesOk = await loadFromManifest();
  if (basesOk === false) {
    await loadFromYaml();
  }

  if (isTemplateLoaded !== true) {
    isTemplateLoaded = true;
  }

  return true;
};
