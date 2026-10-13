interface Env {
  DEV: boolean
  VITE_API_URL?: string
}

/**
 * Base URL for API requests. In development it is empty: requests go to
 * /api on the Vite dev server, which proxies them to VITE_API_URL.
 */
export function resolveApiBaseUrl(env: Env): string {
  const url = env.VITE_API_URL?.trim()
  if (!url) {
    throw new Error('VITE_API_URL is not set (see .env.example).')
  }
  return env.DEV ? '' : url.replace(/\/+$/, '')
}

export const apiBaseUrl = resolveApiBaseUrl(import.meta.env)
