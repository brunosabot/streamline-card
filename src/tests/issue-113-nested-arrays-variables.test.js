import "../streamline-card-editor";
import { describe, expect, it, vi } from "vitest";

vi.mock("../getLovelace.helper");

/**
 * Regression test for issue #113: Improper variable parsing in complex templates
 * https://github.com/brunosabot/streamline-card/issues/113
 *
 * Bug: the visual editor listed bogus variables for templates containing nested
 * arrays (e.g. universal-remote-card rows), because `[[` and `]]` from the
 * serialized arrays were matched as variable delimiters.
 *
 * Expected: only real `[[variable]]` placeholders are listed.
 */
describe("Issue #113 - Nested arrays in templates", () => {
  it("Then it should only list real variables", () => {
    // Arrange
    const editor = document.createElement("streamline-card-editor");

    editor._templates = {
      remote_popup: {
        card: {
          cards: [
            {
              card_type: "pop-up",
              hash: "[[popup]]",
              sub_button: { bottom: [], main: [] },
              type: "custom:bubble-card",
            },
            {
              custom_actions: [],
              media_player_id: "[[media_player_entity]]",
              remote_id: "[[remote_entity]]",
              rows: [
                ["touchpad"],
                [
                  [
                    ["power", "menu", "home", "keyboard"],
                    [
                      "rewind",
                      "previous",
                      "play_pause",
                      "next",
                      "fast_forward",
                    ],
                  ],
                  [["volume_up"], ["volume_down"]],
                ],
              ],
              type: "custom:universal-remote-card",
            },
          ],
          type: "vertical-stack",
        },
      },
    };

    // Act
    const variables = editor.getVariablesForTemplate("remote_popup");

    // Assert
    expect(variables).toEqual([
      "popup",
      "media_player_entity",
      "remote_entity",
    ]);
  });

  it("Then it should ignore JavaScript template delimiters", () => {
    // Arrange
    const editor = document.createElement("streamline-card-editor");

    editor._templates = {
      js: { card: { name: "[[[ return '[[name]]' ]]]", type: "tile" } },
    };

    // Act
    const variables = editor.getVariablesForTemplate("js");

    // Assert
    expect(variables).toEqual(["name"]);
  });
});
