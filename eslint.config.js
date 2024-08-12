import js from "@eslint/js";
import globals from "globals";

export default [
  // js.configs.all.recommended,
  {
    languageOptions: { globals: globals.browser },
    rules: {
      ...js.configs.all.rules,
      camelcase: ["off"],
      "max-depth": ["off"],
      "max-statements": ["off"],
      "no-magic-numbers": ["off"],
      "no-ternary": "off",
      "no-undef-init": ["off"],
      "no-undefined": ["off"],
      "no-underscore-dangle": ["off"],
      "one-var": ["error", "never"],
    },
  },

  {
    files: ["src/**/*.test.js"],
    rules: {
      "max-lines-per-function": ["off"],
      "no-magic-numbers": ["off"],
      "no-template-curly-in-string": ["off"],
    },
  },
];
