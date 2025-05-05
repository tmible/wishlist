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
    ],
  },
  ...js,
  ...svelte,
  {
    files: [ "**/*.svelte" ],
    languageOptions: { parserOptions: { svelteConfig } },
  },
];
