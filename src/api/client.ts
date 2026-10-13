import createClient, { type Middleware } from 'openapi-fetch'
import { apiBaseUrl } from '../config'
import { ApiError, NETWORK_ERROR_MESSAGE, toApiError } from './errors'
import { getPmKey } from './pmKey'
import type { paths } from './schema'

async function fetchOrApiError(request: Request): Promise<Response> {
  try {
    // Looked up on each call, not captured once, so it can be replaced.
    return await globalThis.fetch(request)
  } catch {
    throw new ApiError(0, NETWORK_ERROR_MESSAGE)
  }
}

const pmAuth: Middleware = {
  onRequest({ request }) {
    const key = getPmKey()
    if (!key) {
      throw new ApiError(401, 'Enter the PM key first.')
    }
    request.headers.set('Authorization', `Bearer ${key}`)
    return request
  },
}

/** Public endpoints. Never sends the PM key. */
export const api = createClient<paths>({
  baseUrl: apiBaseUrl,
  fetch: fetchOrApiError,
})

/** PM endpoints: sends the stored PM key as a bearer token. */
export const pmApi = createClient<paths>({
  baseUrl: apiBaseUrl,
  fetch: fetchOrApiError,
})
pmApi.use(pmAuth)

interface FetchResult<T> {
  data?: T
  error?: unknown
  response: Response
}

/**
 * Awaits an api/pmApi call and returns its data, or throws an ApiError.
 *
 *     const feedback = await call(api.POST('/api/feedback', { body }))
 */
export async function call<T>(request: Promise<FetchResult<T>>): Promise<T> {
  let result: FetchResult<T>
  try {
    result = await request
  } catch (error) {
    // A success response whose body is not valid JSON. Anything else is
    // already an ApiError, or a bug that must not be disguised as one.
    if (error instanceof SyntaxError) {
      throw new ApiError(0, 'The API sent a response the app could not read.')
    }
    throw error
  }
  if (!result.response.ok) {
    throw toApiError(result.response.status, result.error)
  }
  return result.data as T
}
