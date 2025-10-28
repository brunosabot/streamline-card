import evaluateYaml from "./evaluateYaml";

let remoteTemplates = {};
let isTemplateLoaded = null;

export const getRemoteTemplates = () => remoteTemplates;
export const getisTemplateLoaded = () => isTemplateLoaded;

/*
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

const loadRemoteTemplates = () => {
  const filename = "streamline-card/streamline_templates.yaml";

  if (isTemplateLoaded === null) {
	isTemplateLoaded = fetchRemoteTemplates(`/hacsfiles/${filename}`)
	  .catch(() => fetchRemoteTemplates(`/local/${filename}`))
	  .catch(() => fetchRemoteTemplates(`/local/community/${filename}`));
  }

  return isTemplateLoaded;
};
*/
// === Added: manifest + unified loader helpers ===
async function __sl_fetchText(u){const r=await fetch(`${u}?t=${Date.now()}`);if(!r.ok)throw new Error(`HTTP ${r.status} for ${u}`);return r.text();}
async function __sl_fetchJSON(u){const r=await fetch(`${u}?t=${Date.now()}`);if(!r.ok)throw new Error(`HTTP ${r.status} for ${u}`);return r.json();}
async function __sl_tryLoadFromTemplatesDirectory(base){
  try{
    const manifest=await __sl_fetchJSON(`${base}/templates/manifest.json`);
    const files=Array.isArray(manifest)?manifest:(Array.isArray(manifest.files)?manifest.files:[]);
    if(!files.length) return false;
    const loaded=[];
    for(const f of files){
      if(typeof f!=='string'||!f.trim()) continue;
      const text=await __sl_fetchText(`${base}/templates/${f}`);
      const obj=evaluateYaml(text);
      if(obj&&typeof obj==='object') loaded.push(obj);
    }
    remoteTemplates=Object.assign({},...loaded);
    return Object.keys(remoteTemplates).length>0;
  }catch(e){ return false; }
}

export async function loadRemoteTemplates(){

  if (isTemplateLoaded === true) return true;
  if (isTemplateLoaded instanceof Promise) return isTemplateLoaded;

  // create the single in-flight Promise
  isTemplateLoaded = (async () => {
    // ---- existing body START ----
    const bases = [
      "/hacsfiles/streamline-card",
      "/local/streamline-card",
      "/local/community/streamline-card"
    ];
    for (const b of bases) {
      if (await __sl_tryLoadFromTemplatesDirectory(b)) return true;
    }
    const filename = "streamline-card/streamline_templates.yaml";
    await __sl_fetchText(`/hacsfiles/${filename}`).then((t) => {
      remoteTemplates = evaluateYaml(t);
    }).catch(() => __sl_fetchText(`/local/${filename}`).then((t) => {
      remoteTemplates = evaluateYaml(t);
    })).catch(() => __sl_fetchText(`/local/community/${filename}`).then((t) => {
      remoteTemplates = evaluateYaml(t);
    }));
    // ---- existing body END ----
    return true;
  })();

  try {
    await isTemplateLoaded;
  } finally {
    // Normalize state after the first load completes
    isTemplateLoaded = true;
  }
  return true;

}



