# Example: Conditional JavaScript Styling

## What is this template for?
This template shows how to use the `_javascript` suffix in streamline-card to add dynamic styling or animation based on entity state. It’s great for making your dashboard interactive and visually responsive.

## Interesting facts
- **Dynamic Animation:** Uses JavaScript to trigger a CSS animation (slow rotate) when the entity is on.
- **State-Driven Styling:** Demonstrates how to use entity state in JavaScript for conditional formatting.
- **_javascript Suffix:** Highlights the power of streamline-card’s JavaScript integration for advanced UI effects.

## Example YAML
```yaml
default:
  - type: slider
card:
  type: custom:bubble-card
  card_type: button
  entity: '[[entity]]'
  scrolling_effect: false
  icon: '[[icon]]'
  button_type: '[[type]]'
  tap_action:
    action: toggle
  double_tap_action:
    action: more-info
  hold_action:
    action: more-info
  styles_javascript: |
    `
      .bubble-icon {
        animation: ${states['[[entity]]'].state === 'on' ? 'slow-rotate 2s linear infinite' : ''};
      }
      @keyframes slow-rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
```

This makes the icon rotate when the fan is on, providing immediate visual feedback.
