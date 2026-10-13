/**
 * The one error type the UI handles. `message` is always safe and readable to
 * show to the user; `status` is the HTTP status, or 0 when no response came.
 */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const NETWORK_ERROR_MESSAGE = 'Cannot reach the API.'

/** Used when the error body is not the API's `{"error": {...}}` shape. */
function fallbackMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The request was not valid.'
    case 401:
      return 'The PM key is missing or wrong.'
    case 404:
      return 'Not found.'
    case 409:
      return 'This feedback was merged and can no longer be changed.'
    case 422:
      return 'Some fields are not valid.'
    case 502:
    case 503:
    case 504:
      return 'The API is unavailable right now. Try again later.'
  }
  return status >= 500
    ? 'The API had a problem. Try again later.'
    : `The request failed (HTTP ${status}).`
}

function apiMessage(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null || !('error' in body)) {
    return undefined
  }
  const { error } = body
  if (typeof error !== 'object' || error === null || !('message' in error)) {
    return undefined
  }
  return typeof error.message === 'string' && error.message.trim()
    ? error.message
    : undefined
}

/** Builds the ApiError for an error response, from its parsed body. */
export function toApiError(status: number, body: unknown): ApiError {
  return new ApiError(status, apiMessage(body) ?? fallbackMessage(status))
}
