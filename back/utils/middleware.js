// eslint-disable-next-line no-unused-vars
const errorHandler = (error, request, response, next) => {
  console.error('[Error handler] ', error.name, ': ', error.message)

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
    response.status(500).send({ error: error.message })
  }
}

const logger = (request, response, next) => {
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
    console.log(logMessage)
  })

  response.on('aborted', () => {
    logMessage= logMessage.concat(' - ', response.statusCode, ' ABORTED')
    console.error(logMessage)
  })

  next()
}

module.exports = { logger, errorHandler }