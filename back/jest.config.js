module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!*.config.js',
    '!node_modules/**',
    '!index.js',
    '!index-email.js',
    '!.eslintrc.js',
    '!coverage/**',
    '!tests/**'
  ]
}