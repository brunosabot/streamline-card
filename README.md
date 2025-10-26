# Streamline Card

![streamline-card-hero](./images/hero.png)

Streamline your Lovelace configuration with a powerful card template system.

This card is for [Lovelace](https://www.home-assistant.io/lovelace) on [Home Assistant](https://www.home-assistant.io/).

## Table of Contents

- [What is This Card?](#what-is-this-card)
- [Installation](#installation)
  - [With HACS (Recommended)](#with-hacs-recommended)
  - [Manual Installation](#manual-installation)
- [Configuration](#configuration)
  - [Step 1: Understanding Templates](#step-1-understanding-templates)
  - [Step 2: Setting Up Templates](#step-2-setting-up-templates)
  - [Step 3: Template Structure](#step-3-template-structure)
  - [Step 4: Using Variables](#step-4-using-variables)
  - [Step 5: Advanced Features - JavaScript Expressions](#step-5-advanced-features---javascript-expressions)
- [Real-World Examples](#real-world-examples)
- [Examples](#examples)
- [Tips and Best Practices](#tips-and-best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
  - [Prerequisites](#prerequisites)
  - [Setting Up Your Development Environment](#setting-up-your-development-environment)
  - [Development Workflow](#development-workflow)
  - [Code Quality](#code-quality)
  - [Testing Your Changes](#testing-your-changes)
  - [Submitting Your Contribution](#submitting-your-contribution)
  - [Ways to Contribute](#ways-to-contribute)

## What is This Card?

Have you ever found yourself copying and pasting the same card configuration over and over in your Home Assistant dashboard? For example, you might have multiple light cards that all look the same, just with different entities. Every time you want to change how these cards look, you have to change each one individually. This is time-consuming and prone to errors.

This is where `streamline-card` comes to help! It allows you to:

- Create a template for your cards once
- Reuse that template multiple times
- Only change the template in one place to update all cards using it
- Use variables to customize each instance of the template
- Use JavaScript to make your cards dynamic and smart

[Example usage](#real-world-examples)

`streamline-card` is an adaptation by [@brunosabot](https://github.com/brunosabot) of [`decluttering-card`](https://github.com/custom-cards/decluttering-card) which is not maintained anymore.

## Installation

There are two ways to install this card. The recommended way is through HACS (Home Assistant Community Store), but you can also install it manually.

### With HACS (Recommended)

HACS is like an app store for Home Assistant. It makes installing and updating custom cards much easier. Here's how to install using HACS:

- **Install HACS if you don't have it:**

  - If HACS is not installed yet, download it following the instructions on [https://hacs.xyz/docs/use/download/download/](https://hacs.xyz/docs/use/download/download/)
  - Follow the HACS initial configuration guide at [https://hacs.xyz/docs/configuration/basic](https://hacs.xyz/docs/configuration/basic)

- **Install the Card:**

  - Go to `HACS` in your Home Assistant sidebar
  - Search for `Streamline Card` in HACS
  - Click on the card when you find it
  - Click the `Download` button at the bottom right

> [!NOTE]
>
> - Follow those steps first to make sure the card is installed and working properly.
> - Usually, you would create a template for the card at this step, but we’ll skip that for now.
> - Once you know that the card is working you can head over to [Configuration](#configuration)

- **Adding the Card:**
  - Go back to your dashboard
  - Click the menu icon (⋮) at the top right corner
  - Click `Edit dashboard`
  - Click `Add card` at the bottom right
  - Search for `Streamline Card`

> [!WARNING]
> If you don't see the card, try clearing your browser cache.

### Manual Installation

If you prefer to install manually or can't use HACS, follow these steps:

- **Download the Card:**

  - Download this file: [streamline-card.js](https://raw.githubusercontent.com/brunosabot/streamline-card/main/dist/streamline-card.js)
  - Save it to your Home Assistant `<config>/www` folder

- **Add to Resources:**

  - Go to your dashboard
  - Click the menu icon (⋮) at the top right
  - Click `Edit dashboard`
  - Click the menu icon again
  - Click `Manage resources`
  - Click `Add resource`
  - Enter `/local/streamline-card.js?v=1` in the URL field
  - Select `JavaScript Module`
  - Click `Create`

- **Add to Dashboard:**
  - Refresh your browser page
  - Edit your dashboard
  - Click `Add card`
  - Search for `Streamline Card`

> [!WARNING]
> After updating the file, you'll need to change the version number in the URL (e.g., from `v=1` to `v=2`) to make sure your browser loads the new version.

## Configuration

Let's learn how to use this card step by step.

### Step 1: Understanding Templates

---

A template is like a blueprint for your cards. It defines how your card will look and behave, but leaves certain parts (variables) empty so you can fill them in later.

For example, let's say you want to create a template for a light card. The template might look like this:

```yaml
my_light_template:
  card:
    type: custom:bubble-card
    name: "[[room_name]] Light" # This will be filled in later
    icon: "[[light_icon]]" # This will be filled in later
    entity: "[[light_entity]]" # This will be filled in later
```

### Step 2: Setting Up Templates

---

There are two ways to set up your templates: through YAML files or through the UI. Let's look at both methods:

<details>
  <summary><strong>Method 1: YAML Configuration (Recommended when you have many Templates)</strong></summary>

1. **Create a Templates Directory:**
   Create a folder called `streamline_templates` in your Home Assistant configuration directory.

2. **Add Template Files:**
   In this folder, create YAML files for your templates. For example, `light_template.yaml`:

```yaml
default:
  - light_icon: mdi:ceiling-light
card:
  type: custom:bubble-card
  name: "[[room_name]] Light"
  icon: "[[light_icon]]"
  entity: "[[light_entity]]"
```

3. **Include Templates in Dashboard:**
   In your dashboard configuration file, add:

```yaml
streamline_templates: !include_dir_named ../streamline_templates/
```

---

##### ⚡️ Automatic Template File Loading and Fallback Locations

> **Note:** An example template file, `streamline_templates.example.yaml`, is provided in the `dist/` directory of this repository. You can copy this file to any of the supported locations (such as `/config/www/community/streamline-card/` or `/config/www/streamline-card/`) and rename it to `streamline_templates.yaml` to get started quickly with your own templates.

The `streamline-card` will automatically attempt to load the `streamline_templates.yaml` file from several locations, in the following order:

1. `/config/www/community/streamline-card/streamline_templates.yaml` (default for HACS installations)
2. `/config/www/streamline-card/streamline_templates.yaml` (commonly used for manual installations)

If the file is not found in the first location, the card will try the next, and so on. This fallback mechanism ensures maximum compatibility with different Home Assistant setups.

**What does this mean for you?**

- You can place your `streamline_templates.yaml` file in any of these locations, depending on how you installed the card and your Home Assistant directory structure.
- Only one file is needed; the card will use the first one it finds.
- This makes it easy to provide or override templates without modifying the card code.

</details>

<details>
  <summary><strong>Method 2: UI Configuration (Easier for Beginners)</strong></summary>

1. **Open Raw Editor:**

   - Go to your dashboard
   - Click the menu icon (⋮)
   - Click `Raw configuration editor`

2. **Add Templates:**
   At the top of the file, add:

```yaml
streamline_templates:
  my_light_template:
    default:
      - light_icon: mdi:ceiling-light
    card:
      type: custom:bubble-card
      name: "[[room_name]] Light"
      icon: "[[light_icon]]"
      entity: "[[light_entity]]"
```

</details>

### Step 3: Template Structure

---

Each template has three main parts:

1. **Template Name:**
   This is how you'll refer to your template later.

```yaml
my_light_template: # This is the template name
```

2. **Default Values (Optional):**
   These are values that will be used if not specified when using the template.

```yaml
default:
  - light_icon: mdi:ceiling-light
```

3. **Card Configuration:**
   This is the actual card configuration, with variables in double brackets.

```yaml
card: # Use 'card' for normal cards
  type: custom:bubble-card
  name: "[[room_name]] Light"
  icon: "[[light_icon]]"
  entity: "[[light_entity]]"

# OR

element: # Use 'element' for picture-elements
  type: icon
  icon: "[[icon]]"
```

### Step 4: Using Variables

---

Variables are placeholders in your template that get replaced with actual values when you use the template. They are written with double brackets: `[[variable_name]]`

> [!TIP]
>
> <strong>Some important rules about variables:</strong>
>
> - Always put them in double brackets: `[[like_this]]`
> - If a variable is alone on a line, put it in single quotes: `'[[variable_name]]'`
> - Variables can be used anywhere in the template
> - You can set default values for variables in the `default` section

### Step 5: Advanced Features - JavaScript Expressions

---

You can make your templates dynamic using JavaScript. Any key that ends with `_javascript` will be evaluated as JavaScript code.
The javascript code has access to the following data

- **states**: An object containing all states
- **user**: An object containing the current user information, for instance `user.name` or `user.is_admin`
- **variables**: An object containing all the variables you've defined in your template
- **areas**: An object containing all areas defined in Home Assistant, for instance you can use `areas.kitchen.icon`

Here's an example of a dynamic weather card that changes color based on temperature:

```yaml
weather_template:
  card:
    type: custom:bubble-card
    card_type: button
    button_type: state
    entity: "[[weather_entity]]"
    styles_javascript: |
      const temp = states['[[weather_entity]]'].attributes.temperature;
      return `
        .bubble-button-card-container {
          background-color: ${
            temp < 0 ? 'var(--info-color)' :
            temp > 30 ? 'var(--error-color)' :
            'var(--primary-color)'
          };
        }
      `;
```

## Real-World Examples

Let's look at some complete examples you can use in your own configuration:

<details open>
  <summary>Example 1: Simple Light Card</summary>

```yaml
# Define the template in ui raw configuration editor or file
streamline_templates:
  light_template:
    default:
      - icon: mdi:ceiling-light
    card:
      type: custom:bubble-card
      card_type: button
      button_type: "[[type]]"
      entity: "[[entity]]"
      name: "[[name]]"
      icon: "[[icon]]"
      tap_action:
        action: toggle
      hold_action:
        action: more-info
```

```yaml
# Using the template:
- type: custom:streamline-card
  template: light_template
  variables:
    - name: Living Room Light
    - entity: light.living_room
    - type: slider
```

</details>
<details>
  <summary>Example 2: Weather Card with Dynamic Styling</summary>

```yaml
# Define the template in ui raw configuration editor or file
streamline_templates:
  weather_card:
    card:
      type: custom:bubble-card
      card_type: button
      button_type: state
      entity: "[[entity]]"
      name: "[[name]]"
      show_state: true
      scrolling_effect: false
      card_layout: large
      sub_button:
        - name: Min
          icon: mdi:thermometer-low
          entity: "[[entity]]"
          attribute: forecast[0].templow
          show_background: false
          show_attribute: true
        - name: Wind
          icon: mdi:weather-windy
          entity: "[[entity]]"
          attribute: wind_speed
          show_background: false
          show_attribute: true
      card_mod:
        style: |
          .bubble-name {
              background-color: ${
                state_attr(config.entity, 'temperature') < 10 ?
                'var(--info-color)' :
                state_attr(config.entity, 'temperature') > 30 ?
                'var(--warning-color)' :
                ''
              };
          }
```

```yaml
# Using the template:
- type: custom:streamline-card
  template: weather_card
  variables:
    - name: Current Weather
    - entity: weather.home
```

</details>
<details>
  <summary>Example 3: Alarm Card with State-Based Colors</summary>

```yaml
# Define the template in ui raw configuration editor or file
streamline_templates:
  alarm_template:
    default:
      - name: ""
      - columns: 2
    card:
      type: custom:bubble-card
      card_type: button
      button_type: state
      entity: "[[entity]]"
      name: "[[name]]"
      show_state: true
      icon: mdi:alarm-light
      columns: "[[columns]]"
      card_layout: large
      styles: |
        .bubble-button-card-container {
          background-color: ${
            state === 'disarmed' ? 'var(--success-color)' :
            state === 'triggered' || state ==='pending' ? 'var(--error-color)' :
            'var(--warning-color)'
          };
        }
```

```yaml
# Using the template:
- type: custom:streamline-card
  template: alarm_template
  variables:
    - name: House Alarm
    - entity: alarm_control_panel.home_alarm
```

</details>
<details>
  <summary>Example 4: Dynamic Grid of Lights</summary>

```yaml
# Define the template in ui raw configuration editor or file
streamline_templates:
  lights_grid:
    default:
      - entity: sensor.number_lights_on
    card:
      type: grid
      square: false
      columns: 3
      cards_javascript: |
        const onLightEntities = states['[[entity]]'].attributes.lights_on_entity || [];

        return onLightEntities.map(entity => ({
          type: 'custom:button-card',
          template: 'light_brightness',
          entity: entity
        }));
```

```yaml
# Using the template:
- type: custom:streamline-card
  template: lights_grid
  variables:
    - entity: sensor.active_lights
```

</details>

## Examples

Explore real-world template examples to help you get started and inspire your own creations:

- [Bubble Light Template](examples/bubble_light.md):
  - A reusable light control card with toggle, name, icon, and slider/button options. Demonstrates default values for variables.
- [Bubble Cover Template](examples/bubble_cover.md):
  - A cover (e.g., window shutter) control card showing dynamic JavaScript styling (`_javascript` suffix) and service call actions in sub-buttons.
- [Entity List Template](examples/entity_list_template.md):
  - DRY configuration for a list of similar entities, showing how to use templates and variables for scalable dashboards (Issue #51).
- [Template Objects with JavaScript](examples/template_objects.md):
  - Dynamically generate cards using JavaScript and entity attributes for advanced, data-driven dashboards (Issue #39).
- [Conditional JavaScript Styling](examples/conditional_javascript.md):
  - Use the `_javascript` suffix for dynamic styling and animations based on entity state (Issue #38).

Each example includes the YAML code, an explanation of its use, and highlights interesting implementation details.

## Tips and Best Practices

1. **Organizing Templates:**

   - Keep related templates together in the same file
   - Use clear, descriptive template names
   - Comment your templates to explain what they do

2. **Variables:**

   - Use descriptive variable names
   - Set default values for commonly used variables
   - Keep variable names consistent across related templates

3. **JavaScript Usage:**

   - Use JavaScript for dynamic content only when needed
   - Test your JavaScript expressions thoroughly
   - Keep the code simple and readable

4. **Performance:**
   - Don't overuse JavaScript expressions
   - Avoid complex calculations in templates
   - Use appropriate card types for your needs

## Troubleshooting

If you're having issues:

1. **Card Not Showing Up:**

   - Clear your browser cache
   - Check that the resource is properly loaded
   - Check your browser's console for errors

2. **Template Not Working:**

   - Verify your template syntax
   - Check that all required variables are provided
   - Look for YAML formatting errors

3. **JavaScript Errors:**
   - Check your browser's console for error messages
   - Verify that your entities exist
   - Test your JavaScript code separately

## Contributing

We welcome contributions to make Streamline Card better! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

> [!IMPORTANT] > **Please submit pull requests with a single feature or fix at a time.** This makes it easier to review, test, and merge your contributions. If you have multiple improvements, please create separate pull requests for each one.

### Prerequisites

Before you start contributing, make sure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

### Setting Up Your Development Environment

1. **Fork and Clone the Repository:**

   ```bash
   git clone https://github.com/brunosabot/streamline-card.git
   cd streamline-card
   ```

2. **Install Dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables (Optional):**

   You can create `.env.development.local` or `.env.production.local` files to customize your build output:

   ```bash
   # .env.development.local
   TARGET_DIRECTORY=/path/to/your/homeassistant/www/streamline-card
   ```

   - `TARGET_DIRECTORY`: Specifies where the built files should be output
   - If not set, files will be built to the `dist/` directory by default
   - `.env.*.local` files are gitignored and won't be committed

### Development Workflow

1. **Start Development Mode:**

   ```bash
   pnpm dev
   ```

   This will watch for file changes and automatically rebuild the card. If you set `TARGET_DIRECTORY`, the files will be output directly to your Home Assistant instance for live testing.

2. **Build for Production:**

   ```bash
   pnpm build
   ```

   Creates an optimized build in the `dist/` directory (or your configured `TARGET_DIRECTORY`).

### Code Quality

Before submitting your changes, ensure your code meets our quality standards:

1. **Run Linting:**

   ```bash
   pnpm run audit:lint    # Check for linting issues
   pnpm run fix:lint      # Auto-fix linting issues
   ```

2. **Run Formatting:**

   ```bash
   pnpm run audit:format  # Check formatting
   pnpm run fix:format    # Auto-fix formatting
   ```

3. **Run Tests:**

   ```bash
   pnpm test:unit         # Run tests in watch mode
   pnpm test:coverage     # Run tests with coverage report
   ```

### Testing Your Changes

1. **Write Tests:**

   - Add test files alongside the JavaScript files they test (e.g., `myfile.js` → `myfile.test.js`)
   - The `src/tests/` directory is reserved for regression tests for GitHub issues
   - Follow the existing test patterns using Vitest
   - Ensure all tests pass before submitting

2. **Test in Home Assistant:**
   - Use the development build to test your changes in a real Home Assistant environment
   - Verify that your changes work with different configurations
   - Check the browser console for any errors

### Submitting Your Contribution

1. **Create a Branch:**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make Your Changes:**

   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Commit Your Changes:**

   ```bash
   git add .
   git commit -m "feat: add new feature" # or "fix: resolve bug"
   ```

4. **Push and Create a Pull Request:**

   ```bash
   git push origin feature/your-feature-name
   ```

   Then open a pull request on GitHub with a clear description of your changes.

### Ways to Contribute

- **Report Bugs:** Open an issue with detailed steps to reproduce
- **Suggest Features:** Share your ideas for improvements
- **Fix Issues:** Look for open issues and submit fixes
- **Improve Documentation:** Help make the docs clearer and more comprehensive
- **Share Templates:** Contribute example templates to help others

Your contributions help make this card better for everyone!
