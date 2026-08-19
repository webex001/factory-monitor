import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Standard fetch-on-mount hooks (setState('loading') then an async
      // fetch) are the correct pattern here — this rule is part of
      // eslint-plugin-react-hooks' newer React Compiler-readiness set and
      // is too strict for plain (non-compiled) data-fetching hooks.
      'react-hooks/set-state-in-effect': 'off',
      // Reading Date.now() during render to position "now" on a live
      // status timeline is intentional — this app isn't targeting the
      // React Compiler, so the purity assumptions this rule enforces
      // don't apply.
      'react-hooks/purity': 'off',
    },
  },
  prettier,
)
