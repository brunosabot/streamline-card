# Example: Bubble Cover Template

## What is this template for?
This template creates a cover (e.g., window shutter) control card using the `bubble-card` custom card. It demonstrates advanced dynamic styling and service calls, and is ideal for covers with additional actions (like a "My" preset button).

## Interesting facts
- **Dynamic Styling with JavaScript:** Uses the `_javascript` suffix for the `styles_javascript` key, allowing you to write JavaScript expressions for dynamic CSS. This enables styles to react to entity state or other conditions at runtime.
- **Service Call Actions:** Shows how to add a sub-button that calls a Home Assistant service (`button.press`) with a dynamic `entity_id`.
- **Parameterization:** Variables for entity, name, and sub-button target make this template reusable for any cover.
- **Icon Customization:** Separate icons for open and closed states.

## Example YAML
```yaml
default:
  - name: ''
card:
  type: 'custom:bubble-card'
  card_type: cover
  entity: '[[entity]]'
  name: '[[name]]'
  icon_open: mdi:window-shutter-open
  icon_close: mdi:window-shutter
  show_state: true
  rows: 1
  card_layout: large
  sub_button:
    - name: My
      icon: mdi:star
      show_background: true
      tap_action:
        action: call-service
        service: button.press
        target:
          entity_id:
            - '[[my]]'
  styles_javascript: |
    `
    .bubble-cover-card-container {
      gap: 8px;
    }
    .large .bubble-buttons {
      gap: 8px;
      right: 8px;
    }
    .bubble-button {
      background-color: var(--card-background-color, var(--ha-card-background));
      width: 36px;
      height: 36px;
    }
    .bubble-icon {
      color: var(--primary-text-color) !important;
    }
    .large .bubble-sub-button-container {
      margin-right: 0!important;
    }
    `
```
