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
      },
    },
  ],
}
