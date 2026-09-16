// @ts-check
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const prettier = require("eslint-config-prettier");

/**
 * Duas fronteiras são aplicadas aqui.
 *
 * 1. Processos (Electrobun):
 *      main <──X──> renderer      só conversam por RPC
 *      shared não conhece nenhum dos dois
 *
 * 2. Bulletproof React, dentro de src/renderer:
 *      shared (components, hooks, lib, utils, config, styles, stores)
 *        └──> não pode importar de features nem de app
 *      features
 *        └──> não pode importar de app, nem de OUTRA feature
 *      app
 *        └──> pode importar de tudo
 *
 * Referência: https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md
 */
const RENDERER_SHARED_DIRS = [
  "./src/renderer/components",
  "./src/renderer/hooks",
  "./src/renderer/lib",
  "./src/renderer/utils",
  "./src/renderer/config",
  "./src/renderer/styles",
  "./src/renderer/stores",
];

const RENDERER_FEATURES = ["quotes", "products", "customers", "company"];

module.exports = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".hutch/**",
      "dist/**",
      "build/**",
      "artifacts/**",
      "*.js",
      ".agents/**",
      "reference/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        AbortController: "readonly",
        crypto: "readonly",
        process: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
      // O SDK do Electrobun vem do devkit projetado pelo Hutch, não do
      // node_modules: sem isto o plugin import não sabe classificá-lo.
      "import/core-modules": ["electrobun", "electrobun/main", "electrobun/view"],
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
      },
    },
    plugins: {
      import: importPlugin,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            { target: "./src/main", from: "./src/renderer" },
            { target: "./src/renderer", from: "./src/main" },
            { target: "./src/shared", from: ["./src/main", "./src/renderer"] },

            ...RENDERER_FEATURES.map((feature) => ({
              target: `./src/renderer/features/${feature}`,
              from: "./src/renderer/features",
              except: [`./${feature}`],
            })),

            { target: "./src/renderer/features", from: "./src/renderer/app" },
            {
              target: RENDERER_SHARED_DIRS,
              from: ["./src/renderer/features", "./src/renderer/app"],
            },
          ],
        },
      ],
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-default-export": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message:
                "Import relativo para fora da pasta não é permitido. Use o alias '@/' ou '@shared/'.",
            },
          ],
        },
      ],
    },
  },
  {
    // default export exigido por contrato de ferramenta
    files: ["vite.config.ts", "electrobun.config.ts", "hutch.config.ts"],
    rules: { "import/no-default-export": "off" },
  },
  prettier,
);
