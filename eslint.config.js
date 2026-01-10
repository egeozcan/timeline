import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import litPlugin from 'eslint-plugin-lit';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'storybook-static/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
    ],
  },

  // Base JavaScript recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Main configuration for all TypeScript files
  {
    files: ['src/**/*.ts', 'test/**/*.ts', 'stories/**/*.ts'],
    plugins: {
      lit: litPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },
    rules: {
      // ===================
      // TypeScript Rules
      // ===================
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off', // Common in Lit for shadowRoot!
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      // ===================
      // Security Rules
      // ===================
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-prototype-builtins': 'error',

      // Prevent dangerous innerHTML usage (use Lit's html template instead)
      'no-restricted-properties': [
        'error',
        {
          object: 'document',
          property: 'write',
          message: 'Use DOM methods instead of document.write',
        },
        {
          object: 'document',
          property: 'writeln',
          message: 'Use DOM methods instead of document.writeln',
        },
      ],

      // Prevent usage of dangerous global functions
      'no-restricted-globals': [
        'error',
        {
          name: 'eval',
          message: 'eval is dangerous and should not be used',
        },
        {
          name: 'Function',
          message:
            'Function constructor is similar to eval and should not be used',
        },
      ],

      // ===================
      // Code Quality Rules
      // ===================
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-duplicate-imports': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      // Prevent common mistakes
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'warn',
      // Disabled: false positive for Date manipulation in loops (e.g., currentMonth.setMonth())
      'no-unmodified-loop-condition': 'off',
      'no-unreachable-loop': 'error',
      'no-unused-private-class-members': 'error',
      'require-atomic-updates': 'error',
      // Disabled in favor of @typescript-eslint/consistent-type-imports
      'no-duplicate-imports': 'off',

      // ===================
      // Lit-Specific Rules
      // ===================
      'lit/no-legacy-template-syntax': 'error',
      'lit/no-template-arrow': 'warn',
      'lit/no-useless-template-literals': 'error',
      'lit/attribute-value-entities': 'error',
      'lit/binding-positions': 'error',
      'lit/no-invalid-html': 'error',
      'lit/no-property-change-update': 'error',
    },
  },

  // Test files - relax some rules
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // Chai expect() uses expression statements
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-console': 'off',
    },
  },

  // Stories - relax some rules
  {
    files: ['stories/**/*.ts'],
    rules: {
      'no-console': 'off',
      // Stories use descriptive aria-labels with apostrophes
      'lit/attribute-value-entities': 'off',
    },
  }
);
