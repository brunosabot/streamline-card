// The path we expect to find the lovelace object in the DOM
// A $ suffix indicates we expect to find the element in a shadow DOM
const lovelacePath = [
  "home-assistant$",
  "home-assistant-main$",
  "ha-drawer",
  "partial-panel-resolver$",
  "ha-panel-lovelace$",
  "hui-root",
];

export const mockLovelaceDom = (lovelaceObject) => {
  let parent = document.body;
  let element = null;

  for (const tag of lovelacePath) {
    const useShadow = tag.endsWith("$");
    const tagName = useShadow ? tag.slice(0, -1) : tag;
    element = document.createElement(tagName);
    parent.appendChild(element);

    if (useShadow) {
      parent = element.attachShadow({ mode: "open" });
    } else {
      parent = element;
    }
  }

  element.lovelace = lovelaceObject;
  element.___curView = "default_view";
};
