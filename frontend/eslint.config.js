import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // 1️⃣ Files ESLint should care about
  {
    files: ["**/*.{js,jsx}"],
  },

  // 2️⃣ Browser globals (window, document, etc.)
  {
    languageOptions: {
      globals: globals.browser,
    },
  },

  // 3️⃣ Core JS rules
  pluginJs.configs.recommended,

  // 4️⃣ React rules (Flat Config version)
  pluginReact.configs.flat.recommended,

  // 5️⃣ 🔥 YOUR PROJECT-SPECIFIC OVERRIDES (go last)
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // Quality-of-life
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console":
        process.env.NODE_ENV === "production" ? "warn" : "off",
    },
  },
];
