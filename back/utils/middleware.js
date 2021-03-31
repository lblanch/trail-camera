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
  if (Object.keys(request.params).length > 0) {
    logMessage = logMessage.concat(' Params: ', request.params)
  }
  if (Object.keys(request.body).length > 0) {
    logMessage = logMessage.concat(' Body: ', request.body)
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