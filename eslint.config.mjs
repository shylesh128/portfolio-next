import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  prettierConfig,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**", "public/**", "next-env.d.ts"],
  },
  {
    rules: {
      "@next/next/no-img-element": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
