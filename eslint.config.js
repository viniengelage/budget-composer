// @ts-check
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const prettier = require("eslint-config-prettier");

/**
 * Bulletproof React — regras de fronteira (unidirectional codebase).
 *
 *   shared (components, hooks, lib, utils, types, config, styles)
 *     └──> não pode importar de features nem de app
 *   features
 *     └──> não pode importar de app, nem de OUTRA feature
 *   app
 *     └──> pode importar de tudo
 *
 * Referência: https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md
 */
const SHARED_DIRS = [
  "./src/components",
  "./src/hooks",
  "./src/lib",
  "./src/utils",
  "./src/types",
  "./src/config",
  "./src/styles",
  "./src/stores",
];

module.exports = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "ios/**",
      "android/**",
      "macos/**",
      "windows/**",
      "dist/**",
      "build/**",
      ".expo/**",
      // configs CommonJS de ferramentas (metro, babel, jest, eslint, autolink)
      "*.js",
      "modules/**/*.js",
      // skills de agente que vêm com o projeto — não é código nosso
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
        __DEV__: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        AbortController: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
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
            // features não conversam entre si
            {
              target: "./src/features/quotes",
              from: "./src/features",
              except: ["./quotes"],
            },
            {
              target: "./src/features/products",
              from: "./src/features",
              except: ["./products"],
            },
            {
              target: "./src/features/customers",
              from: "./src/features",
              except: ["./customers"],
            },
            {
              target: "./src/features/company",
              from: "./src/features",
              except: ["./company"],
            },
            // features não importam da camada de aplicação
            { target: "./src/features", from: "./src/app" },
            // camada compartilhada não conhece features nem app
            { target: SHARED_DIRS, from: ["./src/features", "./src/app"] },
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
                "Import relativo para fora da pasta não é permitido. Use o alias '@/'.",
            },
          ],
        },
      ],
    },
  },
  {
    // default export exigido por contrato de framework:
    // Expo (App/index) e codegen do React Native (specs Native*.ts)
    files: ["App.tsx", "index.ts", "scripts/**/*.ts", "modules/**/Native*.ts"],
    rules: { "import/no-default-export": "off" },
  },
  prettier,
);
