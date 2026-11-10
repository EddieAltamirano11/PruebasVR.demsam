import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        AudioContext: 'readonly',
        webkitAudioContext: 'readonly',
        DeviceOrientationEvent: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        process: 'readonly',
        Image: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(React|[A-Z].*|_.*)$',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'no-undef': 'error'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'actividades-preliminares/**', 'public/**']
  }
];
