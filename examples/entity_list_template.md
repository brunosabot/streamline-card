# Example: Entity List Template

## What is this template for?
This template demonstrates how to use streamline-card to efficiently create a list of similar cards (such as door sensors) using a single template and passing variables for each entity. It’s ideal for dashboards with many similar entities, reducing YAML duplication and improving maintainability.

## Interesting facts
- **DRY Configuration:** Shows how streamline-card enables you to avoid repeating code for each entity.
- **Variable Injection:** Each card instance can have its own entity, name, and options.
- **Scalable:** Easily add or remove entities by editing a single list.

## Example YAML
```yaml
card:
  type: entities
  entities_javascript: |
    return variables.list.map(({entity, name}) => ({
      entity: entity,
      name: name,
      secondary_info: 'last-changed',
      state_color: true,
      card_mod: {
        style: {
          '.': `
            hui-generic-entity-row {
              margin: -8px 0;
            }
            hui-generic-entity-row$: |
              .secondary {
                margin-top: -2px !important;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
                letter-spacing: 0.4px;
              }
              .secondary, ha-relative-time {
                color: var(--primary-text-color) !important;
              }`
        }
      }
    }));
```

# Usage
```yaml
type: custom:streamline-card
template: entitie_in_entities
variables:
  list:
    - entity: binary_sensor.answwr_com
      name: Porte d'Entrée
    - entity: binary_sensor.answwr_com
      name: Porte du Couloir
    # ...
```

This approach lets you manage large lists of similar entities with ease!
