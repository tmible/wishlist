import js from "@tmible/eslint-config-wishlist";
import svelte from "@tmible/eslint-config-wishlist/svelte";
import svelteConfig from "./svelte.config.js";

export default [
  {
    ignores: [
      "**/.DS_Store",
      "**/node_modules",
      "build",
      ".svelte-kit",
      "package",
      "**/.env",
      "**/.env.*",
      "!**/.env.example",
      // Ignore files for PNPM, NPM and YARN
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      "**/yarn.lock",
      // copypasted lib https://github.com/flo-bit/svelte-swiper-cards
      "**/card-swiper/**/*",
      // copypasted from https://github.com/ueberdosis/tiptap/blob/main/packages/core/src/inputRules/markInputRule.ts
      "src/lib/components/text-editor/mark-input-rule.js",
      // copypasted from https://github.com/ueberdosis/tiptap/blob/main/packages/core/src/inputRules/markPasteRule.ts
      "src/lib/components/text-editor/mark-paste-rule.js",
    ],
  },
  ...js,
  ...svelte,
  {
    rules: {
      /* no-secrets */
      "no-secrets/no-secrets": [
        "error",
        {
          // ignore function names in jsdoc
          ignoreContent: [
            / \* @function [A-Za-z]+/,
            / \*.+{@link [A-Za-z]+}/,
          ],
        },
      ],

      /* unicorn */
      "unicorn/no-document-cookie": "off",
    },
  },
  {
    files: [ "**/*.svelte" ],
    languageOptions: { parserOptions: { svelteConfig } },
  },
];
