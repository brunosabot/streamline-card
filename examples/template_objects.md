# Example: Template Objects with JavaScript

## What is this template for?
This example demonstrates how to use JavaScript in streamline-card to dynamically generate cards based on entity attributes. It’s perfect for dashboards that need to adapt to changing lists of entities, such as all lights that are currently on.

## Interesting facts
- **Dynamic Card Generation:** Uses JavaScript to map over an array of entities and generate a card for each.
- **Template Instantiation:** Each generated card uses the same template, making it easy to maintain and extend.
- **Advanced Dashboard Automation:** Enables highly dynamic, data-driven dashboards.

## Example YAML
```yaml
default:
  entity: sensor.number_lights_on
card:
  type: grid
  square: false
  card_mod:
    style: |
      ha-card {
        padding: 20px !important;
      }
  cards: []
  cards_javascript: |
    const onLightEntities = states['[[entity]]'].attributes.lights_on_entity || [];
    
    onLightEntities.map(entity => ({
      type: 'custom:button-card', 
      template: 'light_brightness', 
      entity: entity
    }));
  columns: 1
  grid_options:
    columns: full
```

This lets you create a grid of cards for all currently active lights, automatically updating as the state changes.
