import js from "@tmible/eslint-config-wishlist";
import node from "@tmible/eslint-config-wishlist/node";

export default [
  ...js,
  ...node,
  {
    rules: {
      /* import */
      "import/no-internal-modules": "off",
    },
  },
];
