module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      modules: true
    },
    warnOnUnsupportedTypeScriptVersion: false,
    project: './tsconfig.json'
  },
  env: {
    node: true,
    browser: true
  },
  extends: ['plugin:import/typescript', 'eslint:recommended'],
  plugins: [],
  rules: {
    'no-unused-vars': [1, { varsIgnorePattern: '.*', args: 'none' }]
  },
  overrides: []
};
