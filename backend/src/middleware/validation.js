export function validate(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.body)
    if (!result.success) {
      const fields = {}
      result.error.issues.forEach((issue) => { fields[issue.path.join('.') || 'body'] = issue.message })
      return response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid assessment data', fields } })
    }
    request.body = result.data
    next()
  }
}
