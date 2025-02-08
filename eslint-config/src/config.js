export default {
  rules: {
    "capitalized-comments": "off",
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
};
