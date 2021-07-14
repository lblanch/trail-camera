const { connect, disconnect } = require('./app')
const logger = require('./utils/logger')

connect().then(() => logger.info(`Server running on port ${process.env.PORT}. ENV = ${process.env.NODE_ENV}`))

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Graceful shutdown...')
  await disconnect()
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Graceful shutdown...')
  await disconnect()
})