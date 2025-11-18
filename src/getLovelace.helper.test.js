import { beforeEach, describe, expect, it } from "vitest";
import { clearLovelaceCache, getLovelace } from "./getLovelace.helper";

describe("getLovelace.helper", () => {
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

  const clearPage = () => {
    document.body.innerHTML = "";
  };

  beforeEach(() => {
    clearPage();
    clearLovelaceCache();
  });

  const mockLovelaceDom = (lovelaceObject) => {
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

  it("should return the lovelace object when found", () => {
    const mockLovelace = { config: { title: "My Home" } };
    mockLovelaceDom(mockLovelace);

    const result = getLovelace();
    expect(result).toBe(mockLovelace);
  });

  it("should cache the lovelace object", () => {
    const mockLovelace = { config: { title: "My Home" } };
    mockLovelaceDom(mockLovelace);

    const result1 = getLovelace();
    expect(result1).toBe(mockLovelace);

    // Remove from DOM to prove it comes from cache
    clearPage();

    const result2 = getLovelace();
    expect(result2).toBe(mockLovelace);
  });

  it("should invalidate cache when dashboard path changes", () => {
    const mockLovelace1 = { config: { title: "Dashboard 1" }, id: 1 };
    const mockLovelace2 = { config: { title: "Dashboard 2" }, id: 2 };

    // Set up Dashboard 1
    window.location.pathname = "/dashboard-one/home";
    mockLovelaceDom(mockLovelace1);

    const result1 = getLovelace();
    expect(result1).toBe(mockLovelace1);

    // Switch to Dashboard 2
    clearPage();
    window.location.pathname = "/dashboard-two/home";
    mockLovelaceDom(mockLovelace2);

    const result2 = getLovelace();
    expect(result2).toBe(mockLovelace2);
    expect(result2).not.toBe(mockLovelace1);
  });

  it("should not invalidate cache when staying on same dashboard", () => {
    const mockLovelace = { config: { title: "Dashboard 1" } };

    // Set up Dashboard 1
    window.location.pathname = "/dashboard-one/view1";
    mockLovelaceDom(mockLovelace);

    const result1 = getLovelace();
    expect(result1).toBe(mockLovelace);

    // Change view but keep same dashboard root
    window.location.pathname = "/dashboard-one/view2";

    // Remove DOM to ensure we hit cache
    clearPage();

    const result2 = getLovelace();
    expect(result2).toBe(mockLovelace);
  });
});
