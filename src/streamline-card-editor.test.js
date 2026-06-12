import "./streamline-card-editor";
import { describe, expect, it, vi } from "vitest";

vi.mock("./getLovelace-helper");

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

  describe("When extracting variables from a template", () => {
    it("Then it should sort variables based on the order defined in the config", () => {
      // Arrange
      const editor = document.createElement("streamline-card-editor");

      editor._templates = {
        test_template: {
          card: {
            name: "[[third]] [[first]] [[second]]",
            type: "button",
          },
        },
      };

      // The order in the config is: second, first, third
      editor.setConfig({
        template: "test_template",
        type: "custom:streamline-card",
        variables: {
          second: "value2",
          // Expected non alpha order
          // eslint-disable-next-line sort-keys
          first: "value1",
          third: "value3",
        },
      });

      // Re-set templates after setConfig since _refreshTemplates resets them
      editor._templates = {
        test_template: {
          card: {
            name: "[[third]] [[first]] [[second]]",
            type: "button",
          },
        },
      };

      // Act
      const result = editor.getVariablesForTemplate("test_template");

      // Assert
      expect(result).toEqual(["second", "first", "third"]);
    });

    it("Then it should return an empty array for a missing template instead of throwing", () => {
      // Arrange
      const editor = document.createElement("streamline-card-editor");

      // Act
      const result = editor.getVariablesForTemplate("nonexistent_template");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("When setConfig is called with a template added after construction", () => {
    it("Then it should pick up the template from refreshed lovelace config", () => {
      // Arrange
      const editor = document.createElement("streamline-card-editor");

      // Simulate adding a template after the editor was constructed
      editor._templates.new_template = {
        card: {
          entity: "[[entity]]",
          type: "tile",
        },
      };

      // Act & Assert - should not throw
      expect(() => {
        editor.setConfig({
          template: "new_template",
          type: "custom:streamline-card",
          variables: {},
        });
      }).not.toThrow();
    });
  });
});
