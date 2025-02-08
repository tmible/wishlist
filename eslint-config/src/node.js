import node from "eslint-plugin-n";
import securityNode from "eslint-plugin-security-node";
import globals from "globals";

export default [
  node.configs["flat/recommended-module"],
  {
    languageOptions: {
      globals: { ...globals.node },
    },

    rules: {
      /* import */
      "import/no-unused-modules": "error",
      "import/unambiguous": "error",

      /* security-node */
      // as neither of packages is supposed to run on user's device
      "security-node/detect-insecure-randomness": "off",

      /* n */
      // as the package is not supposed to be published
      "n/no-unpublished-import": "off",
      "n/no-sync": "error",
      "n/prefer-node-protocol": "error",
      "n/prefer-promises/fs": "error",
    },
  },
  {
    ignores: [ "**/**.test.js", "**/__tests__/**" ],
    ...securityNode.configs.recommended,
    plugins: { "security-node": securityNode },
  },
];
