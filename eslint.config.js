import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        SalesforceInteractions: 'readonly',
      },
    },
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['client/dist/**'],
  },
];
