import js from "@eslint/js";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import stylisticJs from "@stylistic/eslint-plugin-js";
import arrayFunc from "eslint-plugin-array-func";
import _import from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import node from "eslint-plugin-n";
import noOnlyTests from "eslint-plugin-no-only-tests";
import noSecrets from "eslint-plugin-no-secrets";
import optimizeRegex from "eslint-plugin-optimize-regex";
import preferArrow from "eslint-plugin-prefer-arrow";
import promise from "eslint-plugin-promise";
import regexp from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import securityNode from "eslint-plugin-security-node";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

export default [
  js.configs.recommended,
  eslintComments.recommended,
  security.configs.recommended,
  {
    plugins: { "security-node": securityNode },
    rules: securityNode.configs.recommended.rules,
  },
  jsdoc.configs["flat/recommended-error"],
  node.configs["flat/recommended-module"],
  sonarjs.configs.recommended,
  unicorn.configs["flat/recommended"],
  arrayFunc.configs.all,
  regexp.configs["flat/recommended"],
  {
    plugins: { "optimize-regex": optimizeRegex },
    rules: optimizeRegex.configs.all.rules,
  },
  {
    plugins: {
      "eslint-comments": eslintComments,
      "@stylistic/js": stylisticJs,
      "prefer-arrow": preferArrow,
      import: _import,
      "simple-import-sort": simpleImportSort,
      promise,
      "no-secrets": noSecrets,
      security,
      "security-node": securityNode,
      jsdoc,
      // sonarjs,
      // unicorn,
      "array-func": arrayFunc,
      regexp,
      "optimize-regex": optimizeRegex,
    },

    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      /* Possible problems */
      "array-callback-return": "error",
      "no-duplicate-imports": [ "error", { includeExports: true } ],
      "no-promise-executor-return": "error",
      "no-use-before-define": "error",
      "require-atomic-updates": "error",

      /* Suggestions */
      "arrow-body-style": "error",
      // annoys with autofix on file saving, but useful in general
      // "capitalized-comments": [ "error", "always" ],
      "consistent-return": "error",
      "curly": "error",
      "default-case": "error",
      "default-case-last": "error",
      "default-param-last": "error",
      "dot-notation": "error",
      "eqeqeq": "error",
      "grouped-accessor-pairs": "error",
      "max-depth": "error",
      "max-lines": "error",
      "max-lines-per-function": [
        "error",
        {
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-statements": [ "error", 11 ],
      "no-array-constructor": "error",
      "no-continue": "off",
      "no-else-return": "error",
      "no-extend-native": "error",
      "no-extra-label": "error",
      "no-implicit-coercion": [ "error", { allow: [ "!!" ] } ],
      "no-inline-comments": "error",
      "no-invalid-this": [ "error", { capIsConstructor: false } ],
      "no-iterator": "error",
      "no-lonely-if": "error",
      "no-multi-assign": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-param-reassign": "error",
      "no-proto": "error",
      "no-throw-literal": "error",
      "no-undef-init": "error",
      "no-underscore-dangle": "error",
      "no-unneeded-ternary": [ "error", { defaultAssignment: false } ],
      "no-unused-expressions": "error",
      "no-useless-call": "error",
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "one-var": [ "error", "never" ],
      "operator-assignment": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-destructuring": "error",
      "prefer-exponentiation-operator": "error",
      "prefer-numeric-literals": "error",
      "prefer-object-has-own": "error",
      "prefer-promise-reject-errors": "error",
      "prefer-regex-literals": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "prefer-template": "error",
      "radix": [ "error", "as-needed" ],
      "require-await": "error",
      // see simple-import-sort/imports
      "sort-imports": "off",
      "yoda": "error",

      /* Layout & Formatting */
      "line-comment-position": [ "error", { position: "above" } ],

      /* eslint-comments */
      "@eslint-community/eslint-comments/no-unused-disable": "error",
      "@eslint-community/eslint-comments/require-description": [
        "error",
        { ignore: [ "eslint-enable" ] },
      ],

      /* prefer-arrow */
      "prefer-arrow/prefer-arrow-functions": [
        "error",
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
          allowStandaloneDeclarations: false,
        },
      ],

      /* @stylistic/js */
      "@stylistic/js/array-bracket-newline": [ "error", "consistent" ],
      "@stylistic/js/array-bracket-spacing": [
        "error",
        "always",
        {
          objectsInArrays: false,
          arraysInArrays: false,
        },
      ],
      "@stylistic/js/array-element-newline": [ "error", "consistent" ],
      "@stylistic/js/arrow-parens": "error",
      "@stylistic/js/arrow-spacing": "error",
      "@stylistic/js/block-spacing": "error",
      "@stylistic/js/brace-style": "error",
      "@stylistic/js/comma-dangle": [ "error", "always-multiline" ],
      "@stylistic/js/comma-spacing": "error",
      "@stylistic/js/comma-style": "error",
      "@stylistic/js/computed-property-spacing": "error",
      "@stylistic/js/dot-location": [ "error", "property" ],
      "@stylistic/js/eol-last": "error",
      "@stylistic/js/function-call-argument-newline": [ "error", "consistent" ],
      "@stylistic/js/function-call-spacing": "error",
      "@stylistic/js/function-paren-newline": [ "error", "multiline-arguments" ],
      "@stylistic/js/implicit-arrow-linebreak": "error",
      "@stylistic/js/indent": [ "error", 2, { SwitchCase: 1 } ],
      "@stylistic/js/key-spacing": "error",
      "@stylistic/js/keyword-spacing": "error",
      "@stylistic/js/linebreak-style": "error",
      "@stylistic/js/lines-around-comment": [
        "error",
        {
          beforeBlockComment: true,
          afterBlockComment: false,
          beforeLineComment: true,
          afterLineComment: false,
          allowBlockStart: true,
          allowBlockEnd: false,
          allowObjectStart: true,
          allowObjectEnd: false,
          allowArrayStart: true,
          allowArrayEnd: false,
          afterHashbangComment: true,
        },
      ],
      "@stylistic/js/max-len": [
        "error",
        100,
        2,
        { ignorePattern: "^import (\\{ )?\\w+( \\})? from '[-/@\\w]+';$" },
      ],
      "@stylistic/js/max-statements-per-line": "error",
      "@stylistic/js/multiline-ternary": [ "error", "always-multiline" ],
      "@stylistic/js/new-parens": "error",
      "@stylistic/js/no-confusing-arrow": "error",
      "@stylistic/js/no-extra-semi": "error",
      "@stylistic/js/no-floating-decimal": "error",
      "@stylistic/js/no-mixed-operators": "error",
      "@stylistic/js/no-mixed-spaces-and-tabs": "error",
      "@stylistic/js/no-multi-spaces": "error",
      "@stylistic/js/no-tabs": "error",
      "@stylistic/js/no-trailing-spaces": "error",
      "@stylistic/js/no-whitespace-before-property": "error",
      "@stylistic/js/object-curly-newline": [ "error", { multiline: true } ],
      "@stylistic/js/object-curly-spacing": [ "error", "always" ],
      "@stylistic/js/object-property-newline": [ "error", { allowAllPropertiesOnSameLine: true } ],
      "@stylistic/js/operator-linebreak": [ "error", "after" ],
      "@stylistic/js/quote-props": [ "error", "as-needed" ],
      "@stylistic/js/quotes": [ "error", "single" ],
      "@stylistic/js/rest-spread-spacing": "error",
      "@stylistic/js/semi": "error",
      "@stylistic/js/semi-style": "error",
      "@stylistic/js/space-before-blocks": "error",
      "@stylistic/js/space-in-parens": "error",
      "@stylistic/js/space-infix-ops": "error",
      "@stylistic/js/space-unary-ops": "error",
      "@stylistic/js/spaced-comment": "error",
      "@stylistic/js/switch-colon-spacing": "error",
      "@stylistic/js/template-curly-spacing": "error",
      "@stylistic/js/template-tag-spacing": "error",
      "@stylistic/js/wrap-iife": [ "error", "inside" ],

      /* import */
      "import/export": "error",
      "import/no-empty-named-blocks": "error",
      "import/no-extraneous-dependencies": "error",
      "import/no-named-as-default": "warn",
      "import/no-named-as-default-member": "warn",
      "import/no-unused-modules": "error",
      "import/no-amd": "error",
      "import/no-commonjs": "error",
      "import/no-import-module-exports": "error",
      "import/unambiguous": "error",
      "import/default": "error",
      "import/named": "error",
      "import/namespace": "error",
      "import/no-absolute-path": "error",
      "import/no-cycle": "error",
      // enable if resolver stops treating self reference as external module reference
      // "import/no-internal-modules": "error",
      "import/no-relative-packages": "error",
      "import/no-self-import": "error",
      // too many false positive reports
      "import/no-unresolved": "off",
      "import/no-useless-path-segments": "error",
      "import/first": "error",
      "import/newline-after-import": [ "error", { considerComments: true } ],
      "import/no-duplicates": "error",
      "import/no-namespace": "error",
      // see simple-import-sort/imports
      "import/order": "off",

      /* simple-import-sort */
      "simple-import-sort/imports": [
        "error",
        { groups: [[ "^\\u0000", "^node:", "^@?\\w", "^@tmible/wishlist-bot", "^", "^\\." ]] },
      ],
      "simple-import-sort/exports": "error",

      /* promise */
      "promise/no-nesting": "error",
      "promise/no-new-statics": "error",
      "promise/no-promise-in-callback": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": [
        "error",
        {
          resolvePattern: "^resolve$",
          rejectPattern: "^reject$",
        },
      ],
      "promise/prefer-await-to-callbacks": "error",
      "promise/prefer-await-to-then": "warn",
      "promise/prefer-catch": "error",
      "promise/valid-params": "error",

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

      /* jsdoc */
      "jsdoc/check-template-names": "error",
      "jsdoc/lines-before-block": [ "error", { excludedTags: [ "typedef" ] } ],
      "jsdoc/require-asterisk-prefix": "error",
      "jsdoc/require-template": "error",
      "jsdoc/sort-tags": "error",

      /* n */
      // as the package is not supposed to be published
      "n/no-unpublished-import": "off",
      "n/no-sync": "error",
      "n/prefer-node-protocol": "error",
      "n/prefer-promises/fs": "error",

      /* sonarjs */
      "sonarjs/anchor-precedence": "off",
      "sonarjs/no-inverted-boolean-check": "error",
      "sonarjs/no-nested-conditional": "warn",
      "sonarjs/pseudo-random": "warn",

      /* unicorn */
      "unicorn/catch-error-name": "off",
      "unicorn/consistent-destructuring": "error",
      "unicorn/import-style": [
        "error",
        {
          "styles": {
            "node:path": {
              "default": false,
              "named": true,
            },
          },
        },
      ],
      "unicorn/no-array-for-each": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-new-array": "off",
      "unicorn/no-null": "off",
      "unicorn/no-unused-properties": "error",
      "unicorn/numeric-separators-style": [ "error", { onlyIfContainsSeparator: true } ],
      "unicorn/prefer-code-point": "off",
      "unicorn/prefer-spread": "off",
      "unicorn/prefer-string-raw": "off",
      "unicorn/prevent-abbreviations": "off",

      /* regexp */
      "regexp/prefer-regexp-exec": "error",
      "regexp/prefer-regexp-test": "error",
    },
  },
  {
    files: [ "**/**.test.js" ],

    plugins: { "no-only-tests": noOnlyTests },

    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "prefer-promise-reject-errors": [ "error", { allowEmptyReject: true } ],
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-nested-functions": "off",
      "sonarjs/pseudo-random": "off",
      "unicorn/error-message": "off",
      "security-node/detect-insecure-randomness": "off",
      "no-only-tests/no-only-tests": "error",
    },
  },
  {
    files: [ "eslint.config.mjs" ],

    rules: {
      "max-lines": "off",
      "@stylistic/js/array-bracket-spacing": [
        "error",
        "always",
        { arraysInArrays: false },
      ],
      "@stylistic/js/lines-around-comment": [
        "off",
        {
          beforeBlockComment: true,
          afterBlockComment: false,
          beforeLineComment: false,
          afterLineComment: false,
          allowBlockStart: true,
          allowBlockEnd: false,
          allowObjectStart: true,
          allowObjectEnd: false,
          allowArrayStart: true,
          allowArrayEnd: false,
          afterHashbangComment: true,
        },
      ],
      "@stylistic/js/quote-props": [ "off" ],
      "@stylistic/js/quotes": [ "error", "double" ],
    },
  },
];
