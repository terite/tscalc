module.exports = {
  "extends": "react-app",
  "rules": {
  },
  "overrides": [
    {
      "parserOptions": {
        "project": "tsconfig.json",
      },
      "files": ["**/*.ts?(x)"],
      "rules": {
        "@typescript-eslint/await-thenable": "warn",
        "@typescript-eslint/explicit-function-return-type": ["warn", {
          "allowExpressions": true,
        }],
        // Turn on when not using dakpan
        "@typescript-eslint/no-floating-promises": ["off", {
          "ignoreVoid": true,
        }],
        "@typescript-eslint/no-for-in-array": "warn",
        "@typescript-eslint/no-throw-literal": "error",
      },
    },
  ],
}
