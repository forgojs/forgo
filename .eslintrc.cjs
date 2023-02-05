module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    "@typescript-eslint/strict-boolean-expressions": ["error"],
  },
  parserOptions: {
    sourceType: "module",
    project: "tsconfig.json",
    tsconfigRootDir: "./",
  },
};
