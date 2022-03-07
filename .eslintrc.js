module.exports = {
  'extends': [
    'eslint:recommended'
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'camelcase': 'warn',
    'eqeqeq': 'error',
    'no-trailing-spaces': 'error',
    'object-curly-spacing': [
      'error', 'always'
    ],
    'arrow-spacing': [
      'error', { 'before': true, 'after': true }
    ],
    'no-console': 0,
    'react/prop-types': 0
  },
  'settings': {
    // This line is to avoid the false positive for cypress "cy.wait" reported as error:
    // "Promise returned from `wait` must be handled  testing-library/await-async-util"
    // This sets off the "Aggressive Imports Reporting" mechanism, so ony testing-library is checked.
    // For further info, see https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/migration-guides/v4.md#testing-libraryutils-module
    'testing-library/utils-module': 'off',
    'react': {
      'version': 'detect'
    }
  }
}