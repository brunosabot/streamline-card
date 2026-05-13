import evaluateYaml from "./evaluateYaml";

let remoteTemplates = {};
let isTemplateLoaded = null;

export const getRemoteTemplates = () => remoteTemplates;
export const getIsTemplateLoaded = () => isTemplateLoaded;

const fetchRemoteTemplates = async (url) => {
  const res = await fetch(`${url}?t=${new Date().getTime()}`);
  if (res.ok === false) {
    throw new Error('not found');
  }

  const text = await res.text();

  remoteTemplates = evaluateYaml(text);
  isTemplateLoaded = true;

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
