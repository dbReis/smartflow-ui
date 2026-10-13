import { apiBaseUrl } from '../config'

export interface Health {
  status: string
}

/**
 * GET /api/health. Throws an Error with a readable message when the API
 * cannot be reached or does not answer 200. The shared API client (spec 002)
 * replaces this ad-hoc error handling.
 */
export async function fetchHealth(): Promise<Health> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/api/health`)
  } catch {
    throw new Error('Cannot reach the API.')
  }
  if (!response.ok) {
    throw new Error(`The API answered HTTP ${response.status}.`)
  }
  return (await response.json()) as Health
}
