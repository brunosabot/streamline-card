export const getLovelaceCast = () => null;

export const getLovelace = () => ({
  config: {
    streamline_templates: {
      bubble_separator: {
        card: {
          card_type: "separator",
          name: "[[name]]",
          type: "custom:bubble-card",
        },
      },
    },
  },
});
