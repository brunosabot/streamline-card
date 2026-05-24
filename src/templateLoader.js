import deepEqual from "./deepEqual-helper";
import evaluateYaml from "./evaluateYaml";

let remoteTemplates = {};
let isTemplateLoaded = null;

export const getRemoteTemplates = () => remoteTemplates;
export const getIsTemplateLoaded = () => isTemplateLoaded;

const revalidateTemplates = async (url) => {
  try {
    const res = await fetch(`${url}?t=${Date.now()}`);
    if (res.ok === false) {
      return;
    }

    const text = await res.text();
    const newTemplates = await evaluateYaml(text, url, true);

    if (deepEqual(remoteTemplates, newTemplates) === false) {
      remoteTemplates = newTemplates;
      window.dispatchEvent(
        new CustomEvent("streamline-templates-updated", { detail: { url } }),
      );
    }
  } catch (error) {
    throw new Error(
      `[streamline-card] Background revalidation failed: ${error.message}`,
      { cause: error },
    );
  }
};

const fetchRemoteTemplates = async (url) => {
  const res = await fetch(url, { cache: "reload" });
  if (res.ok === false) {
    throw new Error("not found");
  }

  const text = await res.text();

  remoteTemplates = await evaluateYaml(text, url);
  isTemplateLoaded = true;

  // Background revalidation
  revalidateTemplates(url);

  return isTemplateLoaded;
};

export const loadRemoteTemplates = () => {
  const filename = "streamline-card/streamline_templates.yaml";

  if (isTemplateLoaded === null) {
    isTemplateLoaded = fetchRemoteTemplates(`/hacsfiles/${filename}`)
      .catch(() => fetchRemoteTemplates(`/local/${filename}`))
      .catch(() => fetchRemoteTemplates(`/local/community/${filename}`));
  }

  return isTemplateLoaded;
};
