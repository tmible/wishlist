import js from "@tmible/eslint-config-wishlist";
import node from "@tmible/eslint-config-wishlist/node";

export default [
  ...js,
  ...node,
  {
    rules: {
      // constantly causing problems with telegraf's ctx, therefore overridden
      "require-atomic-updates": [ "error", { allowProperties: true } ],

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
            "process.env.SUPPORT_ACCOUNT_USERID",
          ],
        },
      ],
    },
  },
  {
    files: [ "**/**.test.js", "**/__tests__/**" ],
    rules: {
      "sonarjs/no-hardcoded-passwords": "off",
    },
  },
];
