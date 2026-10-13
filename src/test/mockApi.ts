import { vi } from 'vitest'

type Handler = unknown | Response | ((request: Request) => Response | unknown)

/**
 * Stubs fetch with routes like `'GET /api/feedback'`. A plain value is sent
 * as JSON with status 200; a Response is sent as is. Unknown routes fail the
 * test loudly. Returns the fetch mock, to inspect requests.
 */
export function mockApi(routes: Record<string, Handler>) {
  const fetch = vi.fn(async (request: Request) => {
    const { pathname } = new URL(request.url)
    const key = `${request.method} ${pathname}`
    if (!(key in routes)) {
      // The client turns fetch failures into "Cannot reach the API", so say
      // what went wrong here too.
      console.error(`mockApi: no route for ${key}`)
      throw new Error(`mockApi: no route for ${key}`)
    }
    let result = routes[key]
    if (typeof result === 'function') result = await result(request)
    return result instanceof Response ? result.clone() : Response.json(result)
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

export function apiError(status: number, message: string): Response {
  return Response.json({ error: { code: status, message } }, { status })
}
