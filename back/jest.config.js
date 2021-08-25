module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!*.config.js',
    '!node_modules/**',
    '!index.js',
    '!index-email.js',
    '!seed-db.js',
    '!utils/logger.js',
    '!utils/awsS3.js',
    '!.eslintrc.js',
    '!coverage/**',
    '!tests/**'
  ]
}