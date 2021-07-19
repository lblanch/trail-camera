const { start, disconnect } = require('./email-parser')
const logger = require('./utils/logger')

start().catch(err => logger.error('Email parser: error on start!', err.message))

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Graceful shutdown...')
  await disconnect()
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Graceful shutdown...')
  await disconnect()
})