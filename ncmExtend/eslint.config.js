import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const userscriptGlobals = {
  unsafeWindow: 'readonly',
  Swal: 'writable',
  MP3Tag: 'readonly',
  forge: 'readonly',
  ah: 'readonly',
  GM_addStyle: 'readonly',
  GM_xmlhttpRequest: 'readonly',
  GM_download: 'readonly',
  GM_cookie: 'readonly',
  GM_getValue: 'readonly',
  GM_setValue: 'readonly',
  GM_registerMenuCommand: 'readonly',
  GM_getResourceText: 'readonly',
  GM_info: 'readonly',
};

export default [
  {
    ignores: ['dist/**', 'publish/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2024,
        ...userscriptGlobals,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-useless-assignment': 'error',
      'no-empty': 'error',
      'no-constant-binary-expression': 'error',
      'no-self-assign': 'error',
      'no-control-regex': 'off',
      'no-useless-escape': 'error',
    },
  },
  {
    files: ['vite.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier,
];
