export default {
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
    "import/no-internal-modules": [
      "error",
      {
        allow: [
          // from documentation https://eslint-community.github.io/eslint-plugin-eslint-comments
          "@eslint-community/eslint-plugin-eslint-comments/configs",
        ],
      },
    ],
  },
};
