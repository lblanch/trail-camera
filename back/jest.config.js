module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!*.config.js',
    '!node_modules/**',
    '!index.js',
    '!.eslintrc.js',
    '!coverage/**',
    '!tests/**'
  ]
}