import node from "eslint-plugin-n";
import securityNode from "eslint-plugin-security-node";
import globals from "globals";

export default [
  {
    plugins: { "security-node": securityNode },
    rules: securityNode.configs.recommended.rules,
  },
  node.configs["flat/recommended-module"],
  {
    plugins: { "security-node": securityNode },

    languageOptions: {
      globals: { ...globals.node },
    },

    rules: {
      /* import */
      "import/no-unused-modules": "error",
      "import/unambiguous": "error",

      /* n */
      // as the package is not supposed to be published
      "n/no-unpublished-import": "off",
      "n/no-sync": "error",
      "n/prefer-node-protocol": "error",
      "n/prefer-promises/fs": "error",
    },
  },
];
