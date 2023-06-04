module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  // extends: ['airbnb', 'airbnb-typescript', 'airbnb/hooks', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  // 0:off 1:warning 2:error
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-case-declarations': 'off',
    'no-constant-condition': 'off',
    '@typescript-eslint/ban-ts-command': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': 2,
  },
}
