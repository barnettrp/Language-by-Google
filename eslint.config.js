import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        firebase: 'readonly',
        import: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        location: 'readonly',
        navigator: 'readonly'
      }
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'no-console': ['warn'],
      'prefer-const': ['error'],
      'no-var': ['error']
    }
  }
];