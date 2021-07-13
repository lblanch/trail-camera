module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!*.config.js',
    '!node_modules/**',
    '!.eslintrc.js',
    '!coverage/**',
    '!tests/**'
  ]
}