import svelte from "eslint-plugin-svelte";
import globals from "globals";

export default [
  ...svelte.configs["flat/recommended"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        extraFileExtensions: [ ".svelte" ],
      },
    },

    settings: {
      "import/parsers": {
        "svelte-eslint-parser": [ ".svelte" ],
        "espree": [ ".js" ],
      },
    },

    rules: {
      /* import */
      // svelte does tree shaking when compiling
      "import/no-namespace": "off",

      /* svelte */
      "svelte/infinite-reactive-loop": "error",
      "svelte/no-dom-manipulating": "error",
      "svelte/no-dupe-on-directives": "error",
      "svelte/no-dupe-use-directives": "error",
      "svelte/no-reactive-reassign": "error",
      "svelte/no-store-async": "error",
      "svelte/require-store-callbacks-use-set-param": "error",
      "svelte/block-lang": "error",
      "svelte/no-ignored-unsubscribe": "error",
      "svelte/no-immutable-reactive-statements": "error",
      "svelte/no-inline-styles": "error",
      "svelte/no-reactive-functions": "error",
      "svelte/no-reactive-literals": "error",
      "svelte/no-useless-mustaches": "error",
      "svelte/require-each-key": "error",
      "svelte/require-event-dispatcher-types": "error",
      "svelte/require-stores-init": "error",
      "svelte/valid-each-key": "error",
      "svelte/derived-has-same-inputs-outputs": "error",
      "svelte/first-attribute-linebreak": "error",
      "svelte/html-closing-bracket-new-line": "error",
      "svelte/html-closing-bracket-spacing": "error",
      "svelte/html-quotes": "error",
      "svelte/html-self-closing": [
        "error",
        {
          "void": "never",
          "normal": "never",
          "svg": "always",
          "math": "never",
          "component": "always",
          "svelte": "always",
        },
      ],
      "svelte/indent": [ "error", { ignoredNodes: [ "ConditionalExpression" ] } ],
      "svelte/max-attributes-per-line": [ "error", { multiline: 1, singleline: 100 } ],
      "svelte/mustache-spacing": "error",
      "svelte/no-extra-reactive-curlies": "error",
      "svelte/no-spaces-around-equal-signs-in-attribute": "error",
      "svelte/prefer-class-directive": "error",
      "svelte/prefer-style-directive": "error",
      "svelte/shorthand-attribute": "error",
      "svelte/sort-attributes": [
        "error",
        {
          order: [
            // `this` property.
            "this",
            // `bind:this` directive.
            "bind:this",
            // `id` attribute.
            "id",
            // `name` attribute.
            "name",
            // `slot` attribute.
            "slot",
            // `--style-props`
            { match: "/^--/u", sort: "ignore" },
            // `style` attribute, and `style:` directives.
            [ "style", "/^style:/u" ],
            // `class` attribute.
            "class",
            // `class:` directives.
            { match: "/^class:/u", sort: "ignore" },
            // other attributes.
            {
              match: [ "!/:/u", "!/^(?:this|id|name|style|class)$/u", "!/^--/u" ],
              sort: "ignore",
            },
            // `bind:` directives (other then `bind:this`), and `on:` directives.
            [ "/^bind:/u", "!bind:this", "/^on:/u" ],
            // `use:` directives.
            { match: "/^use:/u", sort: "ignore" },
            // `transition:` directive.
            { match: "/^transition:/u", sort: "ignore" },
            // `in:` directive.
            { match: "/^in:/u", sort: "ignore" },
            // `out:` directive.
            { match: "/^out:/u", sort: "ignore" },
            // `animate:` directive.
            { match: "/^animate:/u", sort: "ignore" },
            // `let:` directives.
            { match: "/^let:/u", sort: "ignore" },
          ],
        },
      ],
      "svelte/spaced-html-comment": "error",
      "svelte/no-inner-declarations": "error",
      "svelte/no-trailing-spaces": "error",
    },
  },
  {
    files: [ "**/*.svelte" ],
    rules: {
      // svelte components can import themselves
      "import/no-self-import": "off",
    },
  },
  {
    files: [ "**/**.test.js", "**/**.test.svelte.js", "**/__tests__/**" ],
    settings: { "import/ignore": [ "vitest", "@testing-library/svelte" ] },
  },
];
