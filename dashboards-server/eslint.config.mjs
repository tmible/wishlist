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
      // Externally added components
      "src/lib/components/ui",
    ],
  },
  ...js,
  ...svelte,
  {
    rules: {
      /* import */
      "import/no-internal-modules": [
        "error",
        {
          allow: [
            // official way to import from docs
            // https://www.chartjs.org/docs/latest/getting-started/integration.html#quick-start
            "chart.js/auto",
            // official way to import from docs https://github.com/bolstycjw/chartjs-adapter-dayjs-4
            "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm",
            // official way to import from docs
            // https://day.js.org/docs/en/plugin/loading-into-nodejs
            "dayjs/plugin/isBetween",
            "dayjs/plugin/objectSupport",
          ],
        },
      ],
    },
  },
  {
    files: [ "**/*.svelte" ],
    languageOptions: { parserOptions: { svelteConfig } },
  },
];
