export const logger = {
  info(event, details = {}) { console.log(JSON.stringify({ level: 'info', event, ...details })) },
  error(event, details = {}) { console.error(JSON.stringify({ level: 'error', event, ...details })) }
}
