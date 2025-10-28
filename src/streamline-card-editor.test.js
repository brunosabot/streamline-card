import "./streamline-card-editor";
import { describe, expect, it, vi } from "vitest";

vi.mock("./getLovelace.helper");

vi.spyOn(window, "fetch").mockImplementation(() => ({
  json: () => Promise.resolve({}),
  ok: true,
  text: () => Promise.resolve(""),
}));

describe("Given the streamline-card-editor", () => {
  describe("When the streamline-card-editor is loaded", () => {
    it("Then it should have a default config", () => {
      // Arrange
      const editor = document.createElement("streamline-card-editor");

      // Assert
      expect(editor._config).toEqual({
        template: "example_tile",
        type: "streamline-card",
        variables: {},
      });
    });
  });

  describe("When getting the default variables for a template", () => {
    it("Then it should return no variables", () => {
      // Arrange
      const editor = document.createElement("streamline-card-editor");

      editor._templates = {
        example_tile: {
          card: {
            card_type: "separator",
            name: "Obi Wan Kenobi",
            type: "custom:bubble-card",
          },
        },
      };

      // Assert
      expect(editor.getVariablesForTemplate("example_tile")).toEqual([]);
    });
    it("Then it should return the default variables", () => {
      // Arrange
      const editor = document.createElement("streamline-card-editor");

      editor._templates = {
        example_tile: {
          card: {
            card_type: "separator",
            name: "[[name]]",
            type: "custom:bubble-card",
          },
          default: {
            jedi: "Jedi",
            job: "[[jedi]]",
            name: "Ashoka Tano",
          },
        },
      };

      // Assert
      expect(editor.getVariablesForTemplate("example_tile")).toEqual([
        "name",
        "jedi",
      ]);
    });
  });

  describe("When assigning a config with setConfig", () => {
    it("Then it should assign the config as an object", () => {
      // Arrange
      const editor = document.createElement("streamline-card-editor");

      // Act
      editor.setConfig({
        template: "example_tile",
        type: "streamline-card",
        variables: {
          jedi: "Jedi",
          job: "[[job]]",
          name: "Obi Wan Kenobi",
        },
      });

      // Assert
      expect(editor._config).toEqual({
        template: "example_tile",
        type: "streamline-card",
        variables: {
          entity: "",
          jedi: "Jedi",
          job: "[[job]]",
          name: "Obi Wan Kenobi",
        },
      });
    });

    it("Then it should assign a transformed config as an object", () => {
      // Arrange
      const editor = document.createElement("streamline-card-editor");

      // Act
      editor.setConfig({
        template: "example_tile",
        type: "streamline-card",
        variables: [
          { name: "Obi Wan Kenobi" },
          { job: "[[jedi]]" },
          { jedi: "Jedi" },
        ],
      });

      // Assert
      expect(editor._config).toEqual({
        template: "example_tile",
        type: "streamline-card",
        variables: {
          entity: "",
          jedi: "Jedi",
          job: "[[jedi]]",
          name: "Obi Wan Kenobi",
        },
      });
    });
  });
});
