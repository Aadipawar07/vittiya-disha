export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error)
  const status = error.statusCode || 500
  response.status(status).json({ success: false, error: { code: error.code || 'INTERNAL_ERROR', message: status === 500 ? 'An unexpected error occurred' : error.message, fields: error.fields || undefined } })
}

export function notFound(request, response) {
  response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } })
}
