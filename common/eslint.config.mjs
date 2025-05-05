import js from "@tmible/eslint-config-wishlist";
import globals from "globals";

export default [
  ...js,
  {
    languageOptions: {
      globals: { ...globals["shared-node-browser"] },
    },
  },
];
