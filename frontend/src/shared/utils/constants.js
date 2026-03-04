export const APP_DEFAULTS = Object.freeze({
  locale: 'en-KE',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  pageSize: 20,
  debounceMs: 300,
})

export const HTTP_STATUS = Object.freeze({
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  unprocessableEntity: 422,
  tooManyRequests: 429,
  serverError: 500,
})

export const DATE_FORMATS = Object.freeze({
  short: { year: 'numeric', month: 'short', day: '2-digit' },
  long: { year: 'numeric', month: 'long', day: '2-digit' },
  dateTime: {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
})

export default {
  APP_DEFAULTS,
  HTTP_STATUS,
  DATE_FORMATS,
}
