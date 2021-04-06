const errorHandler = (error, request, response, next) => {
  console.error('[Error handler] ', error.name, ': ', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformated id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).send({ error: 'token missing or malformed' })
  }

  next(error)
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