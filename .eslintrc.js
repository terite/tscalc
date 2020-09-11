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
      },
    },
  ],
}
