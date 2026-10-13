interface Env {
  DEV: boolean
  VITE_API_URL?: string
}

/**
 * Base URL for API requests. In development it is the page's own origin:
 * requests go to /api on the Vite dev server, which proxies them to
 * VITE_API_URL.
 */
export function resolveApiBaseUrl(env: Env, pageOrigin: string): string {
  const url = env.VITE_API_URL?.trim()
  if (!url) {
    throw new Error('VITE_API_URL is not set (see .env.example).')
  }
  return env.DEV ? pageOrigin : url.replace(/\/+$/, '')
}

export const apiBaseUrl = resolveApiBaseUrl(
  import.meta.env,
  window.location.origin,
)
