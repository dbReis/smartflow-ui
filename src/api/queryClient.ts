import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { pmMode } from '../pm/pmStore'
import { ApiError } from './errors'

/**
 * Retry a failed query once, and only when retrying can help: the API could
 * not be reached or had a server error. A 4xx gives the same answer again.
 */
export function shouldRetry(failureCount: number, error: Error): boolean {
  if (failureCount >= 1 || !(error instanceof ApiError)) return false
  return error.status === 0 || error.status >= 500
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: shouldRetry } },
    // A rejected PM key ends PM mode, whichever request found out (spec 007).
    queryCache: new QueryCache({ onError: pmMode.handleError }),
    mutationCache: new MutationCache({ onError: pmMode.handleError }),
  })
}
