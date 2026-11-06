import { afterEach, describe, expect, it, vi } from "vitest";

describe("StreamlineCard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("restores hass and announces card replacement after recovering an error card", async () => {
    await import("./streamline-card.js");
    await customElements.whenDefined("streamline-card");

    let frameCallback = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (callback) => {
      frameCallback = callback;
      return 1;
    });

    const card = document.createElement("streamline-card");
    const parent = document.createElement("div");
    parent.appendChild(card);
    card._isConnected = true;
    card._hass = { states: {} };
    card._config = {};
    card._card = document.createElement("hui-error-card");
    card._shadow.appendChild(card._card);
    card.createCard = () => {
      card._card = document.createElement("hui-test-card");
    };

    const updated = vi.fn();
    parent.addEventListener("card-updated", updated);

    card.updateCardConfig();
    frameCallback();

    expect(card._card.hass).toBe(card._hass);
    expect(updated).toHaveBeenCalledOnce();
    expect(updated.mock.calls[0][0].detail).toEqual({ value: true });
  });
});
