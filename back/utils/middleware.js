const { getSessionUser, getSessionUserWithHash } = require('../services/users')
const logger = require('./logger')

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, request, response, next) => {
  logger.error('[Error handler] ', error.name, ': ', error.message)

  if (error.name === 'ValidationError') {
    error.statusCode = 400
  }

  //Send error response
  if (error.statusCode) {
    if (error.statusCode === 401) {
      response.set('WWW-Authenticate', 'bearer')
    }
    response.status(error.statusCode).send({ error: error.message })
  } else {
    // Log error to console (instead of using logger) so it is visible on tests
    console.error(error)
    response.status(500).send({ error: error.message })
  }
}

const logInFromSession = async (request, response, next) => {
  let user
  if (!request.session.user) {
    const newError = new Error('No logged in user')
    newError.statusCode = 401
    throw newError
  }

  //For most of requests that require a user logged in, we don't need the passwordHash
  //Only exception is when user is changing their own password
  if (request.baseUrl + request.path === '/api/users/password') {
    user = await getSessionUserWithHash(request.session.user)
  } else {
    user = await getSessionUser(request.session.user)
  }

  if (!user) {
    const newError = new Error('Invalid user session')
    newError.statusCode = 401
    throw newError
  }

  request.trailcamUser =  user
  next()
}

const requestLogger = (request, response, next) => {
  let logMessage = `${request.method} ${request.path}`
  const paramsString = JSON.stringify(request.params)
  if (paramsString.length > 2) {
    logMessage = logMessage.concat(' Params: ', paramsString)
  }
  const bodyString = JSON.stringify(request.body)
  if (bodyString.length > 2) {
    logMessage = logMessage.concat(' Body: ', bodyString)
  }

  response.on('close', () => {
    logMessage = logMessage.concat(' - ', response.statusCode)
    logger.info(logMessage)
  })

  response.on('aborted', () => {
    logMessage= logMessage.concat(' - ', response.statusCode, ' ABORTED')
    logger.error(logMessage)
  })

  next()
}

module.exports = { requestLogger, errorHandler, logInFromSession }