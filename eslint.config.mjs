import js from "@eslint/js"
import eslintPluginReact from "eslint-plugin-react"
import tsEslintPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: ["**/*.png", "*.png"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: "./tsconfig.json" },
    },
    plugins: {
      react: eslintPluginReact,
      "@typescript-eslint": tsEslintPlugin,
    },
  },
  {
    ignores: ["node_modules", ".next", "dist", "public"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]
