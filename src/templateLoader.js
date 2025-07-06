import evaluateYaml from "./evaluateYaml";

let remoteTemplates = {};
let isTemplateLoaded = null;

export const getRemoteTemplates = () => remoteTemplates;

const fetchRemoteTemplates = (url) => {
  if (isTemplateLoaded === null) {
    isTemplateLoaded = fetch(`${url}?t=${new Date().getTime()}`)
      .then((response) => response.text())
      .then((text) => {
        remoteTemplates = evaluateYaml(text);
        isTemplateLoaded = true;
      });
  }
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
