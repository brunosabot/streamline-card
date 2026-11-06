import "../streamline-card-editor";
import { describe, expect, it } from "vitest";
import { StreamlineCardEditor } from "../streamline-card-editor";

/**
 * Regression test for issue #123: visual editor should offer an area selector
 * https://github.com/brunosabot/streamline-card/issues/123
 *
 * Bug: variables named after an area (e.g. "area", "room_area") fall back to a
 * plain text field in the visual editor instead of an area selector.
 *
 * Expected: the variable name decides the selector, as for entity, icon and bool.
 * A name containing "entity" still wins over "area".
 */
describe("Issue #123 - Visual editor area selector", () => {
  it("should use an area selector for a variable named area", () => {
    // Arrange
    const variable = "area";

    // Act
    const schema = StreamlineCardEditor.getVariableSchema(variable);

    // Assert
    expect(schema).toEqual({ name: "area", selector: { area: {} } });
  });

  it("should use an area selector for a variable whose name contains area", () => {
    // Arrange
    const variable = "room_area";

    // Act
    const schema = StreamlineCardEditor.getVariableSchema(variable);

    // Assert
    expect(schema).toEqual({ name: "room_area", selector: { area: {} } });
  });

  it("should keep the entity selector when the name contains both entity and area", () => {
    // Arrange
    const variable = "area_entity";

    // Act
    const schema = StreamlineCardEditor.getVariableSchema(variable);

    // Assert
    expect(schema).toEqual({ name: "area_entity", selector: { entity: {} } });
  });

  it("should keep the text selector for an unrelated variable", () => {
    // Arrange
    const variable = "name";

    // Act
    const schema = StreamlineCardEditor.getVariableSchema(variable);

    // Assert
    expect(schema).toEqual({ name: "name", selector: { text: {} } });
  });
});
