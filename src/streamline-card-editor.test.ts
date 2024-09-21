import { describe, expect, it, vi } from "vitest";
import type { StreamlineCardEditor } from "./streamline-card-editor";
import "./streamline-card-editor";

vi.mock("./getLovelace.helper");

describe("Given the streamline-card-editor", () => {
  describe("When the streamline-card-editor is loaded", () => {
    it("Then it should have a default config", () => {
      // Arrange
      const editor = document.createElement(
        "streamline-card-editor",
      ) as StreamlineCardEditor;

      // Assert
      expect(editor._config).toEqual({
        template: "bubble_separator",
        type: "streamline-card",
        variables: {},
      });
    });
  });

  describe("When getting the default variables for a template", () => {
    it("Then it should return no variables", () => {
      // Arrange
      const editor = document.createElement(
        "streamline-card-editor",
      ) as StreamlineCardEditor;

      editor._templates = {
        bubble_separator: {
          card: {
            card_type: "separator",
            name: "Obi Wan Kenobi",
            type: "custom:bubble-card",
          },
        },
      };

      // Assert
      expect(editor.getVariablesForTemplate("bubble_separator")).toEqual([]);
    });

    it("Then it should return the default variables", () => {
      // Arrange
      const editor = document.createElement(
        "streamline-card-editor",
      ) as StreamlineCardEditor;

      editor._templates = {
        bubble_separator: {
          default: {
            name: "Ashoka Tano",
            job: "[[jedi]]",
            jedi: "Jedi",
          },
          card: {
            card_type: "separator",
            name: "[[name]]",
            type: "custom:bubble-card",
          },
        },
      };

      // Assert
      expect(editor.getVariablesForTemplate("bubble_separator")).toEqual([
        "jedi",
        "name",
      ]);
    });
  });

  describe("When assigning a config with setConfig", () => {
    it("Then it should assign the config as an object", () => {
      // Arrange
      const editor = document.createElement(
        "streamline-card-editor",
      ) as StreamlineCardEditor;

      // Act
      editor.setConfig({
        template: "bubble_separator",
        type: "streamline-card",
        variables: {
          name: "Obi Wan Kenobi",
          job: "[[job]]",
          jedi: "Jedi",
        },
      });

      // Assert
      expect(editor._config).toEqual({
        template: "bubble_separator",
        type: "streamline-card",
        variables: {
          name: "Obi Wan Kenobi",
          job: "[[job]]",
          jedi: "Jedi",
        },
      });
    });

    it("Then it should assign a transformed config as an object", () => {
      // Arrange
      const editor = document.createElement(
        "streamline-card-editor",
      ) as StreamlineCardEditor;

      // Act
      editor.setConfig({
        template: "bubble_separator",
        type: "streamline-card",
        variables: [
          { name: "Obi Wan Kenobi" },
          { job: "[[jedi]]" },
          { jedi: "Jedi" },
        ],
      });

      // Assert
      expect(editor._config).toEqual({
        template: "bubble_separator",
        type: "streamline-card",
        variables: {
          name: "Obi Wan Kenobi",
          job: "[[jedi]]",
          jedi: "Jedi",
        },
      });
    });
  });
});
