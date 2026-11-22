import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "node_modules/**",
    "src/components/ui/**",
    "src/components/mvpblocks/**",
  ]),
  {
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling"], "index", "object"],
          "newlines-between": "always",
          pathGroups: [{ pattern: "@app/**", group: "external", position: "after" }],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: { "no-undef": "off" },
  },
  prettier,
]);
