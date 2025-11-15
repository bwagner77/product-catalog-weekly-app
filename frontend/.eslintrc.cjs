/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true, jest: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  settings: {
    react: { version: 'detect' }
  },
  rules: {
    'react/react-in-jsx-scope': 'off'
  },
  ignorePatterns: ['dist/', 'coverage/'],
  overrides: [
    {
      files: ['src/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-types': 'off'
      }
    }
  ]
};
