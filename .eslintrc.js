module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": ["error"]
  },
}