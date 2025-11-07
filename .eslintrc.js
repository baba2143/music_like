module.exports = {
  root: true,
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off', // React 17+ doesn't need React in scope
    'react/prop-types': 'off', // TypeScriptで型チェックするため
    'react/require-default-props': 'off', // TypeScriptのoptionalで十分
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/prefer-default-export': 'off', // Named exportを推奨
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/jsx-props-no-spreading': 'off', // Spread propsを許可
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
