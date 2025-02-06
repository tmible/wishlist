import js from "@tmible/eslint-config-wishlist";
import node from "@tmible/eslint-config-wishlist/node";

export default [
  ...js,
  ...node,
  {
    rules: {
      /* import */
      // enable if resolver stops treating self reference as external module reference
      "import/no-internal-modules": "off",

      /* simple-import-sort */
      "simple-import-sort/imports": [
        "error",
        {
          groups: [[
            "^\\u0000",
            "^node:",
            "^@?\\w",
            "^@tmible/wishlist-bot",
            "^$.+",
            "^",
            "^\\.",
          ]],
        },
      ],

      /* no-secrets */
      "no-secrets/no-secrets": [
        "error",
        {
          ignoreContent: [
            "replyWithMarkdownV2",
            "Markup<InlineKeyboardMarkup>",
            "sendMessageAndMarkItForMarkupRemove",
          ],
        },
      ],
    },
  },
];
