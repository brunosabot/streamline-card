# Example: Bubble Light Template

## What is this template for?
This template creates a customizable light card using the `bubble-card` custom card. It is designed to control and display the state of a light entity in Home Assistant, with options for toggling, showing the name and icon, and using a slider or button type.

## Interesting facts
- **Default Values for Variables:** This template demonstrates how to provide default values for variables (`name`, `icon`, `type`) in the `default` section. When you instantiate the template, these defaults are used unless you override them, making template reuse much easier and less error-prone.
- **Parameterization:** The template uses variables for the light name, icon, and type, making it reusable for different lights.
- **Action Customization:** Tap, double-tap, and hold actions are defined for toggling and showing more info.
- **Layout:** Uses a large button layout with two columns for a modern look.

## Example YAML
```yaml
default:
  - name: ''
  - icon: mdi:ceiling-light
  - type: slider
card:
  type: custom:bubble-card
  card_type: button
  button_type: '[[type]]'
  entity: '[[entity]]'
  name: '[[name]]'
  icon: '[[icon]]'
  columns: 2
  card_layout: large
  tap_action:
    action: toggle
  double_tap_action:
    action: more-info
  hold_action:
    action: more-info
```
